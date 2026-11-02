/* Atelier Python : comptes, synchronisation de la progression et classement de la classe (Supabase).
   Sans configuration (config.js vide), rien n'est envoyé : la progression reste sur l'appareil.
   Connexion :
   - « Rejoindre ma classe » : un pseudo, sans e-mail (compte anonyme Supabase), en un clic. Tout le monde est dans la classe CS28.
   - Pour retrouver son compte sur un autre appareil : on le relie à Google ou à un e-mail.
   La base de données est décrite dans supabase/schema.sql. */
(() => {
const A = window.Atelier, { esc } = A.h;
const cfg = window.ATELIER_CONFIG || {};
const params = new URLSearchParams(location.search);
const CLASSE = 'CS28'; // la seule classe du site : Computer Science, promo 2028
const siteLink = () => location.origin + location.pathname.replace(/index\.html$/, '');

if (!cfg.supabaseUrl || !cfg.supabaseKey || !window.supabase) {
  A.ext.accountHTML = () => `<p>Les comptes et le classement ne sont pas encore activés sur ce site. Ta progression est enregistrée sur cet appareil, et rien n'est perdu : elle sera reprise quand les comptes arriveront.</p>`;
  return;
}

// Retour de Google avec une erreur (?error=…) : on la retire de l'adresse AVANT de créer le client,
// sinon supabase-js efface la session en cours, et un compte de classe sans Google serait perdu.
const hashParams = new URLSearchParams(location.hash.slice(1));
const authErr = params.get('error_description') || params.get('error') || hashParams.get('error_description') || hashParams.get('error');
if (authErr) {
  const u = new URL(location.href); ['error', 'error_code', 'error_description'].forEach(k => u.searchParams.delete(k));
  history.replaceState(history.state, '', u.pathname + u.search + (hashParams.has('error') || hashParams.has('error_description') ? '#reglages' : u.hash));
}
// Flux PKCE : au retour de Google, le site reçoit ?code=… dans l'adresse, et le #… de la page reste libre pour la navigation.
const sb =window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true, flowType:'pkce' } });
// google : null tant qu'on ne sait pas encore si Google est activé dans Supabase.
const C = { user:null, profile:null, ready:false, board:null, boardMode:'semaine', boardErr:null, msg:null, busy:false, queue:0, google:null, confirmOut:false, count:null, members:null };
const redirect = () => location.origin + location.pathname;
const AFTER_LOGIN = 'atelier-apres-connexion';
const isAnon = () => C.user && (C.user.is_anonymous || !C.user.email && !(C.user.identities || []).length);
const rerender = () => {
  if (!['reglages', 'progres', 'home'].includes(A.view.type)) return;
  // Garder ce que l'élève est en train de taper (pseudo…) quand l'affichage se met à jour pendant la saisie.
  const typed = [...document.querySelectorAll('[data-cloud-form] input[name]')].filter(i => i.value !== i.defaultValue)
    .map(i => [i.form.dataset.cloudForm, i.name, i.value, i === document.activeElement]);
  A.renderView();
  for (const [f, n, v, focus] of typed) {
    const i = document.querySelector(`[data-cloud-form="${f}"] input[name="${n}"]`);
    if (i) { i.value = v; if (focus) i.focus({ preventScroll:true }); }
  }
};
const say = (text, ok) => { C.msg = { text, ok }; rerender(); };

/* ---------- Session et profil ---------- */
async function onSession(session){
  const prev = C.user && C.user.id;
  C.user = session ? session.user : null;
  C.confirmOut = false;
  if (!C.user || C.user.id !== prev) C.profile = null;
  if (C.user) {
    A.setOwner(C.user.id, !isAnon());
    // Pendant « Rejoindre ma classe », cette lecture peut partir avant l'enregistrement du profil :
    // un résultat vide ne doit pas effacer le profil que join() vient de poser.
    const { data } = await sb.from('profiles').select('pseudo, classe').eq('id', C.user.id).maybeSingle();
    if (data) C.profile = data;
    // Un ancien compte d'une autre classe rejoint CS28 automatiquement.
    if (C.profile && C.profile.classe !== CLASSE) {
      const { error } = await sb.from('profiles').update({ classe:CLASSE, updated_at:new Date().toISOString() }).eq('id', C.user.id);
      if (!error) C.profile = { ...C.profile, classe:CLASSE };
    }
    await pull();
  }
  C.ready = true; C.board = null; C.members = null;
  rerender();
}
sb.auth.getSession().then(async ({ data }) => {
  // Retour de Google : on retire ?code=… ou ?error=… de l'adresse, et on revient sur Paramètres.
  let back = false;
  try { back = !!localStorage.getItem(AFTER_LOGIN); localStorage.removeItem(AFTER_LOGIN); } catch(_) {}
  if (new URLSearchParams(location.search).has('code')) history.replaceState(history.state, '', location.pathname + location.hash);
  if (authErr) C.msg = { text:/already|linked/i.test(authErr)
    ? 'Ce compte Google est déjà utilisé par un autre compte de l’Atelier. Choisis un autre compte Google pour sécuriser celui-ci.'
    : 'Connexion Google impossible : ' + esc(authErr) };
  await onSession(data.session);
  if ((back || authErr) && A.view.type !== 'reglages') A.go('reglages');
});
// Le bouton Google n'apparaît que si Google est activé dans Supabase (Authentication → Providers).
fetch(cfg.supabaseUrl + '/auth/v1/settings', { headers:{ apikey:cfg.supabaseKey } })
  .then(r => r.json()).then(s => { C.google = !!(s.external && s.external.google); }).catch(() => { C.google = false; }).then(rerender);
sb.auth.onAuthStateChange((ev, session) => { if (ev === 'SIGNED_IN' || ev === 'SIGNED_OUT' || ev === 'USER_UPDATED') onSession(session); });

/* ---------- Synchronisation ---------- */
async function pull(){
  if (!C.user) return;
  const { data, error } = await sb.from('progress').select('data, updated_at').eq('user_id', C.user.id).maybeSingle();
  if (error) return;
  if (data && data.data) A.mergeState(data.data);
  await push();
  A.renderAll();
}
let pushTimer = null;
async function push(){
  clearTimeout(pushTimer); pushTimer = null;
  if (!C.user || !navigator.onLine) return;
  const S = A.state;
  const done = Object.values(S.done).filter(Boolean).length;
  await sb.from('progress').upsert({ user_id:C.user.id, data:A.exportState(), xp:Math.min(S.xp, 200000), lessons_done:done, streak:S.streak.count, updated_at:new Date().toISOString() });
}
A.on('save', () => { if (C.user && !pushTimer) pushTimer = setTimeout(push, 4000); });
A.on('xp', n => { C.queue += n; });
async function flushXp(){
  if (!C.user || !C.queue || !navigator.onLine) return;
  const total = C.queue; C.queue = 0;
  const rows = []; let left = total; while (left > 0) { rows.push({ amount:Math.min(100, left) }); left -= 100; }
  const { error } = await sb.from('xp_events').insert(rows);
  if (error && !/Limite/.test(error.message)) C.queue += total;
}
setInterval(flushXp, 8000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { flushXp(); push(); } });
window.addEventListener('online', () => { flushXp(); push(); });
A.on('reset', () => { if (C.user) push(); });

/* ---------- Actions ---------- */
async function join(pseudo){
  const code = CLASSE;
  pseudo = (pseudo || '').trim().slice(0, 24);
  if (pseudo.length < 2) return say('Choisis un pseudo d’au moins 2 caractères.');
  const rename = !!C.profile;
  C.busy = true; rerender();
  try {
    if (!C.user) {
      const { data, error } = await sb.auth.signInAnonymously();
      if (error) throw error;
      C.user = data.user;
    }
    const { error } = await sb.from('profiles').upsert({ id:C.user.id, pseudo, classe:code, updated_at:new Date().toISOString() });
    if (error) throw error;
    C.profile = { pseudo, classe:code };
    await push(); await flushXp();
    C.board = null; C.members = null; loadCount();
    if (rename) { C.msg = { text:`Pseudo modifié : tu t’appelles maintenant ${esc(pseudo)}.`, ok:true }; A.toast('Pseudo modifié.', '✏️'); }
    else { C.msg = { text:`Bienvenue dans la classe ${code}, ${esc(pseudo)} !`, ok:true }; A.toast(`Tu as rejoint la classe ${esc(code)}`, '🎒'); }
  } catch (e) { C.msg = { text:(rename ? 'Impossible de modifier ton pseudo pour l’instant : ' : 'Impossible de rejoindre la classe pour l’instant : ') + esc(e.message || e) }; }
  C.busy = false; rerender();
}
async function withGoogle(){
  const opts = { provider:'google', options:{ redirectTo:redirect() } };
  try { localStorage.setItem(AFTER_LOGIN, '1'); } catch(_) {}
  const { error } = C.user && isAnon() ? await sb.auth.linkIdentity(opts) : await sb.auth.signInWithOAuth(opts);
  if (error) say('Connexion Google impossible : ' + esc(error.message));
}
async function withEmail(email){
  email = (email || '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return say('Cette adresse e-mail ne semble pas valide.');
  C.busy = true; rerender();
  const { error } = C.user && isAnon()
    ? await sb.auth.updateUser({ email }, { emailRedirectTo:redirect() })
    : await sb.auth.signInWithOtp({ email, options:{ emailRedirectTo:redirect(), shouldCreateUser:true } });
  C.busy = false;
  say(error ? 'Envoi impossible : ' + esc(error.message) : `C’est envoyé ! Ouvre le lien reçu à ${esc(email)} sur cet appareil.`, !error);
}
async function signOut(){
  await push(); await flushXp();
  await sb.auth.signOut();
  C.msg = { text:'Tu es déconnecté. Ta progression reste aussi sur cet appareil.', ok:true };
}
// Le nombre d'inscrits (lisible sans compte) et la liste des membres (seulement pour les membres).
async function loadCount(){
  const { data, error } = await sb.rpc('nb_eleves', { p_classe:CLASSE });
  if (!error) { C.count = data; rerender(); }
}
let membersLoading = false;
async function loadMembers(){
  if (membersLoading || !C.profile) return;
  membersLoading = true;
  const { data, error } = await sb.rpc('classement', { p_classe:CLASSE, p_semaine:false });
  membersLoading = false;
  C.members = error ? [] : (data || []);
  if (A.view.type === 'home') rerender();
}
loadCount();

/* ---------- En ligne maintenant (Supabase Realtime Presence) ---------- */
// Chaque appareil qui a le site ouvert et visible compte pour une personne, avec ou sans compte.
// Seul un identifiant tiré au hasard est partagé : aucun pseudo, aucune donnée de l'élève.
const deviceId = (() => {
  try { let id = localStorage.getItem('atelier-appareil'); if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('atelier-appareil', id); } return id; }
  catch(_) { return Math.random().toString(36).slice(2); }
})();
C.online = 0;
const onlineText = () => C.online <= 1 ? 'En ligne en ce moment : toi' : `${C.online} personnes en ligne en ce moment, toi compris`;
const showOnline = () => {
  const el = document.getElementById('online'); if (!el) return;
  el.classList.toggle('wait', !C.online);
  el.querySelector('.online-n').textContent = onlineText();
};
const presence = sb.channel('en-ligne', { config:{ presence:{ key:deviceId } } });
presence.on('presence', { event:'sync' }, () => { C.online = Object.keys(presence.presenceState()).length; showOnline(); });
const beOnline = () => { if (document.visibilityState === 'visible') presence.track({ depuis:Date.now() }); else presence.untrack(); };
presence.subscribe(status => { if (status === 'SUBSCRIBED') beOnline(); });
document.addEventListener('visibilitychange', beOnline);
A.on('render', showOnline);

async function loadBoard(){
  if (!C.profile || !C.profile.classe) return;
  C.boardErr = null;
  await flushXp();
  const { data, error } = await sb.rpc('classement', { p_classe:C.profile.classe, p_semaine:C.boardMode === 'semaine' });
  if (error) C.boardErr = error.message; else C.board = data || [];
  if (A.view.type === 'progres') A.renderView();
}

/* ---------- Affichage ---------- */
const msgHTML = () => C.msg ? `<p class="fb ${C.msg.ok ? 'ok' : 'ko'}">${C.msg.text}</p>` : '';
const joinForm = (p = {}) => `<form class="cloud-form" data-cloud-form="join">
    <label class="field"><span>Ton pseudo</span><input name="pseudo" maxlength="24" autocomplete="nickname" value="${esc(p.pseudo || '')}" placeholder="Par exemple PythonNinja" required><small>C'est lui qui apparaît dans le classement. Jamais ton e-mail.</small></label>
    <div class="actions"><button class="btn" type="submit"${C.busy ? ' disabled' : ''}>${p.pseudo ? 'Enregistrer' : 'Rejoindre ma classe'}</button></div></form>`;
// Google quand il est activé ; le lien par e-mail ne sert que de secours si Google ne l'est pas.
const linkBlock = (title, intro) => C.google === null ? '' : `<h3 class="memo-t">${title}</h3>${intro ? `<p class="small">${intro}</p>` : ''}
    ${C.google ? `<div class="actions"><button type="button" class="btn" data-cloud="google">Continuer avec Google</button></div>` : `<form class="cloud-form" data-cloud-form="email"><label class="field"><span>Avec un lien par e-mail</span><input name="email" type="email" autocomplete="email" placeholder="prenom@exemple.fr" required></label><div class="actions"><button class="btn ghost" type="submit"${C.busy ? ' disabled' : ''}>Recevoir le lien</button></div></form>`}`;
// Déconnexion en deux temps : un compte sans e-mail ni Google est perdu pour de bon une fois déconnecté.
// « Annuler » prend la place du premier bouton, pour qu'un double appui ne déconnecte pas.
const logoutHTML = () => !C.confirmOut
  ? `<div class="actions"><button type="button" class="btn ghost" data-cloud="logout-ask">Se déconnecter</button></div>`
  : `<div class="hint">${isAnon()
      ? '<b>Attention :</b> ton compte n’est relié à aucun e-mail. Si tu te déconnectes, tu ne pourras plus le retrouver, ni ta place dans le classement.'
      : `Tu pourras te reconnecter avec ${esc(C.user.email || 'Google')}.`}</div>
    <div class="actions"><button type="button" class="btn ghost" data-cloud="logout-no">Annuler</button><button type="button" class="btn danger" data-cloud="logout">Oui, me déconnecter</button></div>`;
A.ext.accountHTML = () => {
  if (!C.ready) return `<p class="small">Connexion…</p>`;
  if (!C.user) return `${msgHTML()}<p>Rejoins la classe <b>${CLASSE}</b> (Computer Science, promo 2028) pour sauvegarder ta progression en ligne et apparaître dans le classement de la semaine. Choisis juste ton pseudo : ça prend 10 secondes, sans e-mail.</p>${joinForm()}${linkBlock('Tu as déjà rejoint la classe sur un autre téléphone ?', 'Si tu as relié ton compte à Google, reconnecte-toi ici pour retrouver ta progression.')}`;
  if (!C.profile) return `${msgHTML()}<p>Tu es connecté. Choisis ton pseudo pour apparaître dans le classement de la classe ${CLASSE}.</p>${joinForm()}${logoutHTML()}`;
  const anon = isAnon();
  return `${msgHTML()}<p class="ok-line"><span>Connecté : <b>${esc(C.profile.pseudo)}</b>, classe <b>${esc(C.profile.classe)}</b>. Ta progression est sauvegardée en ligne.</span></p>
    ${anon ? `<div class="hint"><b>Important :</b> relie ton compte à Google pour le retrouver sur n'importe quel téléphone. Sans ça, si tu changes de téléphone ou effaces ton navigateur, ta progression est perdue.</div>${linkBlock('Sécuriser mon compte')}` : `<p class="small">Compte relié à ${esc(C.user.email || 'Google')}. Tu peux te connecter sur n'importe quel appareil.</p>`}
    <h3 class="memo-t">Inviter des camarades</h3>
    <p class="small">Envoie ce lien à tes camarades de ${CLASSE} : <code>${esc(siteLink())}</code></p>
    <div class="actions"><button type="button" class="btn ghost" data-cloud="copy-invite">Inviter des camarades</button></div>
    <details class="later"><summary>Modifier mon pseudo</summary>${joinForm(C.profile)}</details>
    ${logoutHTML()}`;
};
A.ext.boardHTML = () => {
  if (!C.ready) return `<p class="small">Chargement…</p>`;
  if (!C.profile) return `<p>Rejoins la classe ${CLASSE} pour voir le classement et te mesurer à tes camarades. Le classement de la semaine repart à zéro chaque lundi : tout le monde peut gagner.</p><div class="actions"><button type="button" class="btn" data-go="reglages">Rejoindre ma classe</button></div>`;
  if (C.board === null && !C.boardErr) { setTimeout(loadBoard, 0); }
  const tabs = `<div class="seg-tabs"><button type="button" data-cloud="mode-semaine" class="${C.boardMode === 'semaine' ? 'on' : ''}">Cette semaine</button><button type="button" data-cloud="mode-total" class="${C.boardMode === 'total' ? 'on' : ''}">Depuis le début</button></div>`;
  let list;
  if (C.boardErr) list = `<p class="fb ko">Classement indisponible : ${esc(C.boardErr)}</p>`;
  else if (C.board === null) list = `<p class="small">Chargement du classement…</p>`;
  else if (!C.board.length) list = `<p>Personne n'a encore gagné d'XP cette semaine. À toi de jouer !</p>`;
  else list = `<ol class="board">${C.board.map((r, i) => `<li class="${r.moi ? 'me' : ''}"><span class="rk">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span><span class="nm">${esc(r.pseudo)}${r.moi ? ' (toi)' : ''}</span><span class="px">${r.xp} XP</span></li>`).join('')}</ol>`;
  return `<p class="small">Classe <b>${esc(C.profile.classe)}</b> · ${C.boardMode === 'semaine' ? 'remise à zéro chaque lundi' : 'XP total'}</p>${tabs}${list}<div class="actions"><button type="button" class="btn ghost" data-cloud="copy-invite">Inviter des camarades</button><button type="button" class="btn ghost" data-cloud="refresh">Actualiser</button></div>`;
};
const others = n => n === 1 ? '1 camarade est déjà inscrit' : `${n} camarades sont déjà inscrits`;
// Tout en haut de l'accueil, tant qu'on n'est pas dans la classe : on PROPOSE de la rejoindre (jamais obligatoire).
// « Plus tard » ferme la proposition sur cet appareil ; on peut toujours rejoindre depuis Paramètres.
const LATER = 'atelier-classe-plus-tard';
const saidLater = () => { try { return !!localStorage.getItem(LATER); } catch(_) { return false; } };
const onlineHTML = () => `<section class="step"><div class="who"></div><p class="online${C.online ? '' : ' wait'}" id="online" role="status"><span class="dot" aria-hidden="true"></span><span class="online-n">${onlineText()}</span></p></section>`;
A.ext.homeTop = () => {
  if (!C.ready || C.profile || saidLater()) return onlineHTML();
  return `${onlineHTML()}<section class="step"><div class="who"></div><div class="bubble banner" id="rejoindre"><p class="kicker">Ta classe</p><h2>Tu veux rejoindre la classe ${CLASSE} ?</h2>
    <p>Computer Science, promo 2028.${C.count ? ` <b>${others(C.count)}</b>.` : ''} Dans la classe, tu vois tes camarades et le classement de la semaine, et ta progression est sauvegardée en ligne. C'est facultatif : le site marche aussi sans.</p>
    ${msgHTML()}${joinForm()}
    <div class="actions"><button type="button" class="btn ghost" data-cloud="later">Plus tard</button></div>
    ${C.google && !C.user ? `<p class="small">Tu as déjà un compte relié à Google ? <button type="button" class="linkish" data-cloud="google">Te reconnecter avec Google</button></p>` : ''}</div></section>`;
};
// Après le premier bloc de l'accueil, une fois dans la classe : les membres de la classe.
A.ext.homeBanner = () => {
  if (!C.ready || !C.profile) return '';
  if (C.members === null) setTimeout(loadMembers, 0);
  const list = C.members === null ? `<p class="small">Chargement de la classe…</p>`
    : `<ul class="members">${C.members.map(r => `<li class="${r.moi ? 'me' : ''}">${esc(r.pseudo)}${r.moi ? ' (toi)' : ''}</li>`).join('')}</ul>`;
  const n = C.members ? C.members.length : C.count;
  return `<section class="step"><div class="who"></div><div class="bubble"><h2>Ta classe ${CLASSE}${n ? ` · ${n} élève${n > 1 ? 's' : ''}` : ''}</h2>${list}
    <div class="actions"><button type="button" class="btn ghost" data-go="progres">Voir le classement</button><button type="button" class="btn ghost" data-cloud="copy-invite">Inviter des camarades</button></div></div></section>`;
};

document.addEventListener('submit', e => {
  const f = e.target.closest('[data-cloud-form]'); if (!f) return;
  e.preventDefault();
  const d = new FormData(f);
  if (f.dataset.cloudForm === 'join') join(d.get('pseudo'));
  if (f.dataset.cloudForm === 'email') withEmail(d.get('email'));
});
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-cloud]'); if (!b) return;
  const k = b.dataset.cloud;
  if (k === 'google') withGoogle();
  if (k === 'later') { try { localStorage.setItem(LATER, '1'); } catch(_) {} A.renderView(); }
  if (k === 'logout-ask' || k === 'logout-no') { C.confirmOut = k === 'logout-ask'; rerender(); }
  if (k === 'logout') signOut();
  if (k === 'refresh') { C.board = null; loadBoard(); A.renderView(); }
  if (k === 'mode-semaine' || k === 'mode-total') { C.boardMode = k.slice(5); C.board = null; A.renderView(); }
  if (k === 'copy-invite' && C.profile) {
    const link = siteLink(), text = `Rejoins notre classe ${CLASSE} sur Atelier Python pour apprendre Python ensemble : ${link}`;
    try { if (navigator.share) { await navigator.share({ text, url:link }); return; } } catch(_) { return; }
    try { await navigator.clipboard.writeText(text); A.toast('Lien d’invitation copié.', '📋'); } catch(_) { A.toast('Copie impossible : sélectionne le lien affiché.', '📋'); }
  }
});
A.cloud = { sb, state:C, push, pull, loadBoard };
})();
