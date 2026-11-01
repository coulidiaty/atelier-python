/* Atelier Python : le moteur du site.
   Les leçons sont dans lecons/*.js et s'enregistrent avec Atelier.chapter({...}).
   Le guide pour écrire une leçon est dans docs/CONTENU.md. */
(() => {
const PARTS = [
  { id:'bases', title:'Les bases de Python', short:'Bases' },
  { id:'poo', title:'La POO en Python et Java', short:'POO' }
];
const CHAPTERS = [];
const LES = {};

/* ================= Aides pour les corrections ================= */
const ERR = 'Ton code a une erreur. Lis l’explication dans la console, juste au-dessus.';
const strip = c => c.replace(/#.*$/gm, '');
const memOf = (r, n) => ((r && r.mem) || []).find(m => m.name === n);
const strOf = m => m && m.type === 'str' ? m.repr.slice(1, -1) : null;
const linesOf = o => (o || '').split('\n').map(s => s.trim()).filter(Boolean);
const nInputs = c => (strip(c).match(/input\s*\(/g) || []).length;
const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ \t]+/g, ' ').toLowerCase();
function esc(s){ return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
const has = (r, re) => !!(r && r.out && re.test(r.out));

/* ================= Icônes ================= */
const PYO = `<svg class="pyo" viewBox="0 0 40 40" aria-hidden="true"><circle class="p-skin" cx="20" cy="20" r="19"/><circle class="p-eye" cx="14" cy="17" r="4.4"/><circle class="p-eye" cx="26" cy="17" r="4.4"/><circle class="p-pupil" cx="15" cy="18" r="2.1"/><circle class="p-pupil" cx="27" cy="18" r="2.1"/><path class="p-mouth" d="M14 25.5 Q20 30.5 26 25.5"/><path class="p-tongue" d="M20 28.3 v4.2 M20 32.5 l-2.2 2.2 M20 32.5 l2.2 2.2"/></svg>`;
const I_CHECK = `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2l2.3 2.3 4.7-5"/></svg>`;
const I_LOCK = `<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M4.5 6.5V4.8a2.5 2.5 0 0 1 5 0v1.7"/><rect x="3" y="6.5" width="8" height="6" rx="1.5"/></svg>`;
const I_HOME = `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 9.5L10 3.5l7 6M5 8v8.5h10V8"/></svg>`;
const I_CARDS = `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4.5h12v11H4zM7 8h6M7 11h4"/></svg>`;
const HOW_ICONS = {
  say:`<svg viewBox="0 0 20 20"><path d="M3.5 4.5h13v8h-7l-4 3v-3h-2z"/></svg>`,
  guess:`<svg viewBox="0 0 20 20"><path d="M7.5 7.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M10 14.5v.5"/></svg>`,
  code:`<svg viewBox="0 0 20 20"><path d="M7 6l-4 4 4 4M13 6l4 4-4 4"/></svg>`,
  bug:`<svg viewBox="0 0 20 20"><path d="M7 7.5a3 3 0 0 1 6 0v4a3 3 0 0 1-6 0zM4 9h3M13 9h3M4 13.5h3M13 13.5h3M8 4.5l-1-1.5M12 4.5l1-1.5"/></svg>`,
  rev:`<svg viewBox="0 0 20 20"><path d="M15.5 8A6 6 0 1 0 16 11M15.5 3.5V8H11"/></svg>`,
  card:`<svg viewBox="0 0 20 20"><path d="M4 4.5h12v11H4zM7 8h6M7 11h4"/></svg>`,
  java:`<svg viewBox="0 0 20 20"><path d="M3 5.5h6v9H3zM11 5.5h6v9h-6z"/></svg>`
};

/* ================= Enregistrement des chapitres ================= */
function chapter(c){
  c.lessons = c.lessons || [];
  c.plan = c.plan || [];
  c.key = `${c.part}-${c.n}`;
  c.lessons.forEach((L, k) => {
    L.chap = c;
    L.num = (c.part === 'poo' ? 'POO ' : '') + `${c.n}.${k + 1}`;
    LES[L.id] = L;
  });
  CHAPTERS.push(c);
}

/* ================= État ================= */
const KEY = 'atelier-python-v1';
let ORDER = [], TOTAL = 0;
function fresh(){ return { done:{}, cur:{}, st:{}, unlock:false }; }
function load(){ try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && v.done && v.cur && v.st) return v; } catch(_){} return null; }
let S = fresh();
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(_){} }
function stOf(lid){
  const L = LES[lid];
  if (!S.st[lid] || S.st[lid].length !== L.steps.length) S.st[lid] = L.steps.map(s => ({ code:s.code || '', done:false, out:null, err:null, mem:null, picked:[], hints:0, tries:0, fb:null, fill:null }));
  return S.st[lid];
}
const partOf = lid => LES[lid].chap.part;
const partOrder = p => ORDER.filter(l => partOf(l) === p);
function available(lid){
  if (!LES[lid]) return false;
  if (S.unlock || S.cur[lid] !== undefined) return true;
  const po = partOrder(partOf(lid)), i = po.indexOf(lid);
  return i === 0 || !!S.done[po[i - 1]];
}
const doneCount = () => ORDER.filter(l => S.done[l]).length;
const nextIn = p => partOrder(p).find(l => !S.done[l]);
const nextLesson = () => nextIn('bases') || nextIn('poo');

/* ================= Python (Skulpt) ================= */
const TYPE = { str:'texte (str)', int:'nombre entier (int)', float:'nombre à virgule (float)', bool:'vrai ou faux (bool)', list:'liste (list)', dict:'dictionnaire (dict)', tuple:'tuple', set:'ensemble (set)', NoneType:'rien (None)' };
const SKIP = ['function','module','type','builtin_function_or_method','method','classmethod','staticmethod','property','ABCMeta'];
function readFile(x){
  if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[x] === undefined) throw "Fichier introuvable : '" + x + "'";
  return Sk.builtinFiles.files[x];
}
function reprOf(v){
  try { const r = Sk.misceval.objectRepr(v); return typeof r === 'string' ? r : (r && r.v !== undefined) ? r.v : String(r); } catch(_) { return '?'; }
}
function attrsOf(v){
  // Attributs d'un objet créé à partir d'une classe écrite par l'élève.
  const d = v && v.$d; if (!d || !d.tp$iter) return null;
  const rows = [];
  try {
    const it = Sk.abstr.iter(d);
    for (let k = it.tp$iternext(); k !== undefined; k = it.tp$iternext()) {
      const name = k.v !== undefined ? k.v : String(k);
      rows.push({ name, repr:reprOf(d.mp$subscript(k)) });
    }
  } catch(_) { return null; }
  return rows;
}
function readMem(mod){
  const d = mod && mod.$d; if (!d) return [];
  const rows = [];
  for (const k of Object.keys(d)) {
    if (k.startsWith('__')) continue;
    const v = d[k]; if (!v || !v.tp$name) continue;
    if (SKIP.includes(v.tp$name)) continue;
    const row = { name:k.replace(/_\$rn\$$/, ''), type:v.tp$name, repr:reprOf(v) };
    if (!TYPE[v.tp$name]) { const a = attrsOf(v); if (a) row.attrs = a; }
    rows.push(row);
  }
  return rows;
}
function explain(e){
  const name = (e && e.tp$name) || (e && e.name) || 'Erreur';
  let raw = ''; try { raw = e.toString(); } catch(_) { raw = String(e); }
  let line = null;
  if (e && e.traceback && e.traceback.length) line = e.traceback[0].lineno;
  if (!line) { const m = raw.match(/on line (\d+)/); if (m) line = +m[1]; }
  const L = line ? ` (ligne ${line})` : '';
  let title, text;
  switch (name) {
    case 'NameError': { const m = raw.match(/name '([^']+)'/); title = `Python ne connaît pas « ${m ? m[1] : 'ce nom'} »${L}`; text = 'Vérifie l’orthographe : pour Python, <code>Nom</code> et <code>nom</code> sont deux noms différents. As-tu bien créé cette variable avant de l’utiliser ? Et si c’est du texte, il faut des guillemets.'; break; }
    case 'SyntaxError': case 'TokenError': title = `Python n’arrive pas à lire ton code${L}`; text = 'Souvent, c’est un guillemet, une parenthèse ou deux-points <code>:</code> oubliés. Chaque <code>(</code> a besoin de sa <code>)</code>, et chaque <code>"</code> de son partenaire.'; break;
    case 'IndentationError': case 'TabError': title = `Problème d’espaces en début de ligne${L}`; text = 'Après une ligne qui finit par <code>:</code>, les lignes du bloc sont décalées de 4 espaces. Ailleurs, la ligne commence tout à gauche.'; break;
    case 'TypeError': title = `Mélange impossible${L}`; text = 'Tu mélanges deux types qui ne vont pas ensemble, ou tu appelles une fonction avec le mauvais nombre d’arguments. Lis le message original pour savoir lequel.'; break;
    case 'ValueError': { const m = raw.match(/: '(.*)'/); title = `Valeur impossible${m ? ' : « ' + m[1] + ' »' : ''}${L}`; text = 'Souvent, <code>int()</code> reçoit un texte qui ne ressemble pas à un nombre entier. Pour un nombre à virgule, utilise <code>float()</code>.'; break; }
    case 'IndexError': title = `Cette position n’existe pas${L}`; text = 'Les indices commencent à 0 et s’arrêtent à la longueur moins 1. Dans une liste de 3 éléments, le dernier indice est 2.'; break;
    case 'KeyError': title = `Cette clé n’existe pas dans le dictionnaire${L}`; text = 'Vérifie l’orthographe de la clé. Pour éviter l’erreur, tu peux tester avec <code>in</code> ou utiliser <code>.get()</code>.'; break;
    case 'AttributeError': title = `Cet attribut ou cette méthode n’existe pas${L}`; text = 'Vérifie l’orthographe après le point, et que l’attribut a bien été créé (souvent dans <code>__init__</code> avec <code>self.</code>).'; break;
    case 'ZeroDivisionError': title = `Division par zéro${L}`; text = 'Même Python ne sait pas diviser par 0.'; break;
    case 'UnboundLocalError': title = `Variable utilisée avant d’être créée dans la fonction${L}`; text = 'Tu modifies une variable globale dans une fonction. Python la considère alors comme locale, et elle n’existe pas encore. Passe-la en paramètre et renvoie le résultat avec <code>return</code>.'; break;
    case 'AssertionError': title = `Une vérification assert a échoué${L}`; text = 'La condition écrite après <code>assert</code> est fausse : le programme s’arrête pour te prévenir qu’une valeur n’est pas celle attendue.'; break;
    case 'RecursionError': title = `La fonction s’appelle elle-même sans fin${L}`; text = 'Il manque un cas d’arrêt.'; break;
    case 'TimeoutError': case 'TimeLimitError': title = 'Ton programme tourne trop longtemps'; text = 'Il ne s’arrête jamais : vérifie la condition de ta boucle <code>while</code>. Est-ce qu’elle finit par devenir fausse ?'; break;
    default: title = `Erreur Python : ${name}${L}`; text = 'Lis le message original ci-dessous : il indique souvent la ligne en cause.';
  }
  return { title, text, raw };
}
function runPy(code, o = {}){
  let out = '';
  const live = o.live;
  const queue = o.inputs ? [...o.inputs] : null;
  const show = () => { if (live) { live.textContent = out.length > 20000 ? '…' + out.slice(-20000) : out; live.classList.toggle('empty', !out); live.scrollTop = live.scrollHeight; } };
  Sk.configure({
    output: t => { out += t; show(); },
    read: readFile, __future__: Sk.python3, execLimit: 4000, yieldLimit: 100, inputfunTakesPrompt: true,
    inputfun: prompt => {
      out += prompt; show();
      if (queue) { const v = queue.length ? String(queue.shift()) : ''; out += v + '\n'; return v; }
      if (!o.ask) { out += '\n'; return ''; }
      return o.ask().then(v => { out += v + '\n'; show(); Sk.execStart = Date.now(); Sk.lastYield = Date.now(); return v; });
    }
  });
  Sk.execStart = Date.now(); Sk.lastYield = Date.now();
  return Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code, true))
    .then(m => ({ out, err:null, mem:readMem(m) }), e => ({ out, err:explain(e), mem:null }));
}

/* ================= Exercices à trous (Java ou Python) ================= */
// Dans tpl, un trou s'écrit [[réponse]] ou [[réponse|autre réponse acceptée]].
function parseFill(tpl){
  const parts = []; const re = /\[\[(.+?)\]\]/g; let last = 0, m;
  while ((m = re.exec(tpl))) { parts.push({ text:tpl.slice(last, m.index) }); parts.push({ blank:m[1].split('|') }); last = re.lastIndex; }
  parts.push({ text:tpl.slice(last) });
  return parts;
}
const fillNorm = s => s.trim().replace(/\s+/g, ' ');

/* ================= Rendu ================= */
const $ = id => document.getElementById(id);
let view = { type:'home' };
let busy = false, runToken = 0, pendingAsk = null;

function renderTop(){
  const d = doneCount();
  $('prog').innerHTML = `<span>${d} sur ${TOTAL} leçons</span><div class="bar"><i style="width:${TOTAL ? d / TOTAL * 100 : 0}%"></i></div>`;
  $('where').textContent = view.type === 'lesson' ? `Leçon ${LES[view.id].num} · ${LES[view.id].title}` : view.type === 'fiches' ? 'Mes fiches' : 'Accueil';
}
function chapLine(c, curKey){
  const total = c.lessons.length + c.plan.length;
  if (!c.lessons.length) return `<details class="chap planned"><summary><span class="cn">${c.n}</span><span>${c.title}</span><small>bientôt</small></summary><ul class="lessons">${c.plan.map((t, k) => `<li><span class="les planned"><span class="ico">${k + 1}</span><span>${c.part === 'poo' ? 'POO ' : ''}${c.n}.${k + 1} ${t}</span></span></li>`).join('')}</ul></details>`;
  const dn = c.lessons.filter(L => S.done[L.id]).length;
  let h = `<details class="chap"${c.key === curKey ? ' open' : ''}><summary><span class="cn">${c.n}</span><span>${c.title}</span><small>${dn}/${total}</small></summary><ul class="lessons">`;
  c.lessons.forEach((L, k) => {
    const isCur = view.type === 'lesson' && view.id === L.id;
    const st = S.done[L.id] ? 'done' : available(L.id) ? '' : 'locked';
    const ico = S.done[L.id] ? I_CHECK : st === 'locked' ? I_LOCK : (k + 1);
    h += st === 'locked'
      ? `<li><span class="les locked" title="Termine la leçon d’avant pour l’ouvrir"><span class="ico">${ico}</span><span>${L.num} ${L.title}</span></span></li>`
      : `<li><button type="button" class="les ${st}${isCur ? ' current' : ''}" data-go="l${L.id}"><span class="ico">${ico}</span><span>${L.num} ${L.title}</span></button></li>`;
  });
  c.plan.forEach((t, k) => { const j = c.lessons.length + k + 1; h += `<li><span class="les planned"><span class="ico">${j}</span><span>${c.part === 'poo' ? 'POO ' : ''}${c.n}.${j} ${t}</span></span></li>`; });
  return h + `</ul></details>`;
}
function renderSide(){
  let h = `<div class="nav-top"><button type="button" class="nav-link${view.type === 'home' ? ' on' : ''}" data-go="accueil">${I_HOME}Accueil</button><button type="button" class="nav-link${view.type === 'fiches' ? ' on' : ''}" data-go="fiches">${I_CARDS}Mes fiches</button></div>`;
  const ref = view.type === 'lesson' ? view.id : nextLesson();
  const curKey = ref && LES[ref] ? LES[ref].chap.key : 'bases-1';
  for (const p of PARTS) {
    const cs = CHAPTERS.filter(c => c.part === p.id);
    if (!cs.length) continue;
    h += `<p class="side-label">${p.title}</p>` + cs.map(c => chapLine(c, curKey)).join('');
  }
  h += `<label class="unlock"><input type="checkbox" id="unlock"${S.unlock ? ' checked' : ''}> Tout débloquer (pour visiter les leçons sans les faire dans l’ordre)</label>`;
  $('side').innerHTML = h;
}

function memHTML(rows){
  return `<div class="boxes">${rows.map(m => m.attrs
    ? `<div class="box obj"><span class="tag">${esc(m.name)}</span><span class="type">objet ${esc(m.type)}</span>${m.attrs.length ? `<span class="attrs">${m.attrs.map(a => `<span class="attr"><b>${esc(a.name)}</b> ${esc(a.repr)}</span>`).join('')}</span>` : `<span class="type">(aucun attribut)</span>`}</div>`
    : `<div class="box"><span class="tag">${esc(m.name)}</span><span class="val">${esc(m.repr)}</span><span class="type">${TYPE[m.type] || esc(m.type)}</span></div>`).join('')}</div>`;
}
function ideHTML(lid, i){
  const s = LES[lid].steps[i], st = stOf(lid)[i];
  let con;
  if (st.out === null && !st.err) con = `<pre class="out empty">La console attend. Clique sur Exécuter.</pre>`;
  else if (st.out) con = `<pre class="out">${esc(st.out)}</pre>`;
  else con = `<pre class="out empty">${st.err ? '' : '(rien ne s’affiche)'}</pre>`;
  if (st.err) con += `<div class="err-box" role="alert"><b>${esc(st.err.title)}</b><p>${st.err.text}</p><span class="err-raw">Message original : ${esc(st.err.raw)}</span></div>`;
  let mem = '';
  if (s.mem || (st.mem && st.mem.length)) {
    mem = `<div class="memory"><div class="c-label">Mémoire de Python</div>${st.mem && st.mem.length ? memHTML(st.mem) : `<p class="mem-empty">Les boîtes apparaîtront ici après l'exécution.</p>`}</div>`;
  }
  const rows = Math.max(4, st.code.split('\n').length + 1);
  return `<div class="ide"><div class="ide-bar"><span class="file"><i></i>${s.file || 'main.py'}</span><span class="kbd">Ctrl + Entrée</span><button type="button" class="run" data-act="run" data-i="${i}">▶ Exécuter</button></div><textarea class="code" id="code-${i}" data-i="${i}" rows="${rows}" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Code Python de l'étape ${i + 1}"${s.t === 'code' ? ' data-nopaste="1"' : ''}>${esc(st.code)}</textarea><div class="console"><div class="c-label">Console</div>${con}</div>${mem}</div>`;
}
function snipHTML(code, lang){
  return lang ? `<div class="snip-wrap"><span class="lang lang-${lang}">${lang === 'java' ? 'Java' : 'Python'}</span><pre class="snippet">${esc(code)}</pre></div>` : `<pre class="snippet">${esc(code)}</pre>`;
}
function compareHTML(s){
  return `<div class="cmp"><div class="cmp-col">${snipHTML(s.py, 'python')}</div><div class="cmp-col">${snipHTML(s.java, 'java')}</div></div>${s.notes && s.notes.length ? `<ul class="cmp-notes">${s.notes.map(n => `<li>${n}</li>`).join('')}</ul>` : ''}`;
}
function fillHTML(lid, i){
  const s = LES[lid].steps[i], st = stOf(lid)[i];
  const parts = parseFill(s.tpl); let b = 0;
  const vals = st.fill || [];
  const body = parts.map(p => {
    if (p.text !== undefined) return esc(p.text);
    const k = b++, v = vals[k] || '', w = Math.max(3, ...p.blank.map(x => x.length)) + 1;
    const ok = st.fillOk && st.fillOk[k];
    return `<input class="blank${ok === true ? ' good' : ok === false ? ' bad' : ''}" data-i="${i}" data-b="${k}" value="${esc(v)}" style="width:${w}ch" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Trou ${k + 1}"${st.done ? ' disabled' : ''}>`;
  }).join('');
  return `<div class="snip-wrap"><span class="lang lang-${s.lang || 'java'}">${s.lang === 'python' ? 'Python' : 'Java'}</span><pre class="snippet fill">${body}</pre></div>`;
}
const OKW = ['Bien joué !', 'Exactement !', 'Bravo !', 'Parfait !'];
const DONEW = ['Ça marche !', 'C’est bon !', 'Réussi !'];
function stepHTML(lid, i){
  const L = LES[lid], s = L.steps[i], st = stOf(lid)[i], cur = S.cur[lid];
  let kind = '', kc = '';
  if (s.t === 'quiz') { kind = s.rev ? 'Révision éclair' : 'Devinette'; kc = s.rev ? 'k-rev' : 'k-quiz'; }
  if (s.t === 'code') { kind = s.bug ? 'Bug à réparer' : s.defi ? 'Défi' : 'Exercice'; kc = s.bug ? 'k-bug' : s.defi ? 'k-defi' : 'k-code'; }
  if (s.t === 'compare') { kind = 'Et en Java ?'; kc = 'k-java'; }
  if (s.t === 'fill') { kind = s.lang === 'python' ? 'Code à trous' : 'Exercice Java'; kc = 'k-java'; }
  let h = (kind ? `<p class="kind ${kc}">${kind}</p>` : '') + `<h2>${s.h}</h2><div class="body">${s.p || ''}</div>`;
  if (s.snip) h += snipHTML(s.snip, s.lang);
  if (s.t === 'compare') h += compareHTML(s);
  if (s.p2) h += `<div class="body">${s.p2}</div>`;
  if (s.t === 'quiz') h += `<div class="opts" role="group" aria-label="Réponses">${s.opts.map((o, k) => {
      const p = st.picked.includes(k);
      return `<button type="button" class="opt${p ? (o.ok ? ' right' : ' wrong') : ''}" data-act="opt" data-i="${i}" data-k="${k}"${st.done || p ? ' disabled' : ''}>${esc(o.l)}</button>`;
    }).join('')}</div>`;
  if (s.t === 'fill') h += fillHTML(lid, i);
  if (s.code !== undefined) h += ideHTML(lid, i);
  if (st.fb) h += `<div class="fb ${st.fb.ok ? 'ok' : 'ko'}" role="status">${st.fb.ok ? `<b>${OKW[i % OKW.length]}</b>` : ''}${st.fb.text}</div>`;
  if (s.hints && !st.done) for (let k = 0; k < st.hints; k++) h += `<div class="hint"><b>Indice ${k + 1} :</b>${s.hints[k]}</div>`;
  let a = '';
  if (s.t === 'fill' && !st.done) a += `<button type="button" class="btn" data-act="fill" data-i="${i}">Vérifier</button>`;
  if (s.hints && !st.done && st.hints < s.hints.length) a += `<button type="button" class="btn ghost" data-act="hint" data-i="${i}">Un indice (${st.hints + 1}/${s.hints.length})</button>`;
  if ((s.t === 'code' || s.t === 'fill') && !st.done && st.tries >= 3 && (!s.hints || st.hints >= s.hints.length)) a += `<button type="button" class="btn ghost" data-act="skip" data-i="${i}">Passer pour l’instant</button>`;
  if (i === cur) {
    const free = (s.t === 'say' && s.code === undefined) || s.t === 'compare';
    if (st.done || free) a += `<button type="button" class="btn" data-act="next" data-i="${i}">On continue</button>`;
    else if (s.t === 'say') a += `<span class="wait">Exécute le code pour continuer.</span>`;
  }
  if (a) h += `<div class="actions">${a}</div>`;
  let reply = '';
  if (st.done && s.t === 'quiz') { const r = s.opts.find(o => o.ok).l; reply = st.picked.length === 1 ? `Je dirais : ${r}` : `Je me suis trompé, mais j’ai trouvé : ${r}`; }
  if (st.done && (s.t === 'code' || s.t === 'fill')) reply = st.skipped ? 'Je passe pour l’instant, j’y reviendrai.' : DONEW[i % DONEW.length];
  return `<section class="step" id="st-${i}"><div class="who">${PYO}</div><div class="bubble">${h}</div>${reply ? `<div class="reply"><p>${esc(reply)}</p></div>` : ''}</section>`;
}
function recapHTML(lid){
  const L = LES[lid], po = partOrder(L.chap.part), nx = po[po.indexOf(lid) + 1];
  const nc = CHAPTERS.find(x => x.part === L.chap.part && x.n === L.chap.n + 1);
  let a;
  if (nx) a = `<button type="button" class="btn" data-go="l${nx}">Leçon suivante : ${LES[nx].num} ${LES[nx].title}</button>`;
  else if (L.chap.plan.length || (nc && !nc.lessons.length)) a = `<span class="wait">La suite arrive bientôt.</span>`;
  else if (L.chap.part === 'bases' && partOrder('poo').length) a = `<button type="button" class="btn" data-go="l${partOrder('poo')[0]}">Bases terminées ! Passer à la POO</button>`;
  else a = `<span class="wait">Tu as terminé cette partie. Bravo !</span>`;
  a += `<button type="button" class="btn ghost" data-go="fiches">Mes fiches</button>`;
  return `<section class="step" id="st-${L.steps.length}"><div class="who">${PYO}</div><div class="bubble"><p class="kind k-recap">Fiche mémo</p><h2>Ce qu'il faut retenir</h2><div class="body"><ul>${L.recap.map(p => `<li>${p}</li>`).join('')}</ul><p class="small">Cette fiche est rangée dans « Mes fiches ». Relis-la avant un contrôle.</p></div><div class="actions">${a}</div></div></section>`;
}
function lessonHTML(lid){
  const L = LES[lid], c = L.chap, k = c.lessons.indexOf(L), total = c.lessons.length + c.plan.length;
  if (S.cur[lid] === undefined) S.cur[lid] = 0;
  const partT = c.part === 'poo' ? 'POO · ' : '';
  let h = `<section class="step"><div class="who">${PYO}</div><div class="bubble"><p class="kicker">${partT}Chapitre ${c.n} · Leçon ${k + 1} sur ${total} · ${L.dur}</p><h1>${L.title}</h1><p>${L.intro}</p></div></section>`;
  const upto = Math.min(S.cur[lid], L.steps.length - 1);
  for (let i = 0; i <= upto; i++) h += stepHTML(lid, i);
  if (S.cur[lid] >= L.steps.length) h += recapHTML(lid);
  return h;
}
function partBlock(p){
  const cs = CHAPTERS.filter(c => c.part === p.id);
  const n = cs.reduce((a, c) => a + c.lessons.length + c.plan.length, 0);
  const nx = nextIn(p.id), started = partOrder(p.id).some(l => S.done[l] || S.cur[l] !== undefined);
  const cta = nx ? `<button type="button" class="btn${p.id === 'bases' ? '' : ' ghost'}" data-go="l${nx}">${started ? 'Reprendre' : 'Commencer'} : ${LES[nx].num} ${LES[nx].title}</button>` : partOrder(p.id).length ? `<span class="wait">Partie terminée !</span>` : `<span class="wait">En préparation.</span>`;
  const rows = cs.map(c => {
    const tot = c.lessons.length + c.plan.length;
    if (!c.lessons.length) return `<li class="planned"><span class="pn">${c.n}</span><span class="pt"><b>${c.title}</b><span>${tot} leçons</span></span><span class="ps">En préparation</span></li>`;
    const dn = c.lessons.filter(L => S.done[L.id]).length;
    const names = c.lessons.map(L => L.title).concat(c.plan);
    return `<li><span class="pn">${c.n}</span><span class="pt"><b>${c.title}</b><span>${names.slice(0, 3).join(', ')}${names.length > 3 ? '…' : ''}</span></span><span class="ps">${dn} / ${tot}<div class="bar"><i style="width:${dn / tot * 100}%"></i></div></span></li>`;
  }).join('');
  return `<section class="step"><div class="who"></div><div class="bubble"><p class="kicker">Partie ${PARTS.indexOf(p) + 1}</p><h2>${p.title}</h2><p class="small">${n} leçons en ${cs.length} chapitres.${p.id === 'poo' ? ' Dans l’ordre du cours de POO : chaque notion en Python, puis en Java.' : ''}</p><ol class="parcours">${rows}</ol><div class="actions">${cta}</div></div></section>`;
}
function homeHTML(){
  const nx = nextLesson(), started = doneCount() > 0 || Object.keys(S.cur).length > 0;
  const cta = nx ? `<button type="button" class="btn" data-go="l${nx}">${started ? 'Reprendre' : 'Commencer'} : ${LES[nx].num} ${LES[nx].title}</button>` : `<span class="wait">Tu as terminé toutes les leçons disponibles. Bravo !</span>`;
  const how = [
    ['say', 'Je t’explique un petit bout', 'Quelques lignes, jamais un gros pavé.'],
    ['guess', 'Tu devines', 'Avant d’exécuter, tu prédis ce que fait le code.'],
    ['code', 'Tu codes toi-même', 'Du vrai Python dans la page, sans copier-coller.'],
    ['bug', 'Tu répares des bugs', 'Les erreurs sont expliquées en français.'],
    ['rev', 'Tu révises', 'Chaque leçon commence par une question sur la précédente.'],
    ['java', 'Tu passes à Java', 'En POO, chaque notion est aussi montrée en Java.']
  ].map(([ic, t, d]) => `<li><span class="hi">${HOW_ICONS[ic]}</span><span><b>${t}</b>${d}</span></li>`).join('');
  return `<section class="step"><div class="who">${PYO}</div><div class="bubble"><p class="kicker">Atelier Python</p><h1>Salut, moi c'est Pyo.</h1><p>Je vais t'apprendre les bases de Python, puis la programmation orientée objet en Python et en Java. Ici, pas de gros cours à lire : je t'explique un petit bout, tu testes tout de suite, et si tu te trompes, on regarde pourquoi ensemble.</p><p class="small">Tu connais déjà les bases ? Tu peux commencer directement par la partie POO, plus bas.</p><div class="actions">${cta}</div></div></section>
  <section class="step"><div class="who"></div><div class="bubble"><h2>Comment ça marche</h2><ul class="how">${how}</ul></div></section>
  ${PARTS.map(partBlock).join('')}`;
}
function fichesHTML(){
  const done = ORDER.filter(l => S.done[l]);
  const body = done.length
    ? done.map(l => `<div class="fiche"><h3><span>${LES[l].num}</span>${LES[l].title}</h3><ul>${LES[l].recap.map(p => `<li>${p}</li>`).join('')}</ul></div>`).join('')
    : `<p>Tu n'as pas encore de fiche. Termine ta première leçon et elle apparaîtra ici.</p>${nextLesson() ? `<div class="actions"><button type="button" class="btn" data-go="l${nextLesson()}">Aller à la leçon ${LES[nextLesson()].num}</button></div>` : ''}`;
  return `<section class="step"><div class="who">${PYO}</div><div class="bubble"><p class="kicker">Révisions</p><h1>Mes fiches</h1><p>Chaque leçon terminée ajoute sa fiche ici. C'est ton résumé à relire avant un contrôle.</p></div></section><section class="step"><div class="who"></div><div class="bubble">${body}</div></section>`;
}
function renderView(){
  $('view').innerHTML = view.type === 'lesson' ? lessonHTML(view.id) : view.type === 'fiches' ? fichesHTML() : homeHTML();
}
function renderAll(){ renderTop(); renderSide(); renderView(); }
function updateStep(lid, i){
  const el = $('st-' + i); if (!el || view.type !== 'lesson' || view.id !== lid) return;
  const t = document.createElement('div'); t.innerHTML = stepHTML(lid, i);
  el.replaceWith(t.firstElementChild);
}

/* ================= Actions ================= */
function toast(msg){
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 2800);
}
function askIn(con){
  return new Promise(res => {
    const w = document.createElement('div'); w.className = 'ask';
    w.innerHTML = '<input class="py-in" type="text" autocomplete="off" spellcheck="false" aria-label="Ta réponse au programme"><span class="ask-hint">Entrée ↵</span>';
    con.appendChild(w);
    const inp = w.querySelector('input'); inp.focus({ preventScroll:true });
    const done = v => { w.remove(); pendingAsk = null; res(v); };
    pendingAsk = () => done('');
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); done(inp.value); } });
  });
}
const tester = code => (inputs, c) => runPy(c === undefined ? code : c, { inputs:inputs || [] });
async function run(lid, i){
  if (busy) return; busy = true; const tok = ++runToken;
  const s = LES[lid].steps[i], st = stOf(lid)[i];
  const el = $('st-' + i);
  const btn = el && el.querySelector('.run'); if (btn) { btn.disabled = true; btn.textContent = 'En cours…'; }
  const con = el && el.querySelector('.console');
  if (con) con.querySelectorAll('.err-box').forEach(x => x.remove());
  const live = con && con.querySelector('.out');
  if (live) { live.textContent = ''; live.classList.remove('empty'); }
  const r = await runPy(st.code, { live, ask:() => askIn(con) });
  if (tok !== runToken || view.type !== 'lesson' || view.id !== lid) { busy = false; return; }
  st.out = r.out; st.err = r.err; st.mem = r.mem;
  if (s.t === 'say' && !st.done) st.done = true;
  if (s.t === 'code' && (!st.done || st.skipped)) {
    const unchanged = s.bug && st.code.trim() === s.code.trim();
    let v;
    try { v = await s.check(r, st.code, tester(st.code)); }
    catch (e) { console.error(e); v = 'Je n’ai pas réussi à vérifier ton code. Réessaie.'; }
    if (!unchanged) st.tries++;
    if (v === true) { st.done = true; st.skipped = false; st.fb = { ok:true, text:s.ok || '' }; }
    else st.fb = { ok:false, text:v + (st.skipped ? ' (Exercice passé : tu peux continuer quand même.)' : '') };
  }
  busy = false; save(); updateStep(lid, i); renderTop();
  if (!st.done) { const ta = $('code-' + i); if (ta) ta.focus({ preventScroll:true }); }
}
function checkFill(lid, i){
  const s = LES[lid].steps[i], st = stOf(lid)[i];
  const blanks = parseFill(s.tpl).filter(p => p.blank);
  const vals = st.fill || [];
  st.fillOk = blanks.map((p, k) => p.blank.some(a => fillNorm(a) === fillNorm(vals[k] || '')));
  st.tries++;
  const bad = st.fillOk.filter(x => !x).length;
  if (!bad) { st.done = true; st.skipped = false; st.fb = { ok:true, text:s.ok || '' }; }
  else {
    const empty = blanks.some((p, k) => !(vals[k] || '').trim());
    st.fb = { ok:false, text: empty ? 'Il reste des trous vides.' : `${bad} trou${bad > 1 ? 's' : ''} à revoir, en rouge. Attention : Java fait la différence entre majuscules et minuscules.` };
  }
  save(); updateStep(lid, i);
}
function pick(lid, i, k){
  const s = LES[lid].steps[i], st = stOf(lid)[i], o = s.opts[k];
  if (st.done || st.picked.includes(k)) return;
  st.picked.push(k);
  st.fb = o.ok ? { ok:true, text:s.ex } : { ok:false, text:o.why };
  if (o.ok) st.done = true;
  save(); updateStep(lid, i);
}
function next(lid, i){
  const L = LES[lid], sts = stOf(lid);
  sts[i].done = true;
  S.cur[lid] = i + 1;
  const ns = L.steps[i + 1];
  if (ns && ns.carry && sts[i + 1].code === ns.code && !sts[i + 1].out) {
    let j = i; while (j >= 0 && L.steps[j].code === undefined) j--;
    if (j >= 0) sts[i + 1].code = sts[j].code.trimEnd() + '\n\n' + ns.code;
  }
  if (S.cur[lid] >= L.steps.length) S.done[lid] = true;
  save(); renderTop(); renderSide(); renderView();
  const el = $('st-' + (i + 1));
  if (el) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior:reduce ? 'auto' : 'smooth', block:'start' });
    const f = el.querySelector('textarea, input.blank'); if (f) setTimeout(() => f.focus({ preventScroll:true }), 400);
  }
}
function openSide(on){
  $('side').classList.toggle('open', on); $('scrim').classList.toggle('open', on);
  $('menu').setAttribute('aria-expanded', String(on));
}
function go(token){
  if (pendingAsk) pendingAsk();
  runToken++;
  if (token === 'fiches') view = { type:'fiches' };
  else if (token === 'accueil') view = { type:'home' };
  else { const id = token.slice(1); if (!LES[id] || !available(id)) return; view = { type:'lesson', id }; }
  try { history.replaceState(null, '', '#' + token); } catch(_) {}
  openSide(false); renderAll(); window.scrollTo(0, 0);
}

function bind(){
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); go(g.dataset.go); return; }
    const b = e.target.closest('[data-act]'); if (!b || view.type !== 'lesson') return;
    const lid = view.id, i = +b.dataset.i;
    switch (b.dataset.act) {
      case 'run': run(lid, i); break;
      case 'opt': pick(lid, i, +b.dataset.k); break;
      case 'fill': checkFill(lid, i); break;
      case 'hint': stOf(lid)[i].hints++; save(); updateStep(lid, i); break;
      case 'skip': { const st = stOf(lid)[i]; st.done = true; st.skipped = true; st.fb = { ok:false, text:'Pas de souci : tu peux continuer, et revenir sur cet exercice quand tu veux. Il reste ouvert.' }; save(); updateStep(lid, i); break; }
      case 'next': next(lid, i); break;
    }
  });
  const V = $('view');
  V.addEventListener('input', e => {
    const t = e.target; if (view.type !== 'lesson') return;
    if (t.matches('textarea.code')) {
      stOf(view.id)[+t.dataset.i].code = t.value;
      t.rows = Math.max(4, t.value.split('\n').length + 1);
      save();
    } else if (t.matches('input.blank')) {
      const st = stOf(view.id)[+t.dataset.i];
      st.fill = st.fill || []; st.fill[+t.dataset.b] = t.value;
      t.classList.remove('good', 'bad'); save();
    }
  });
  V.addEventListener('keydown', e => {
    const t = e.target; if (view.type !== 'lesson') return;
    if (t.matches('input.blank') && e.key === 'Enter') { e.preventDefault(); checkFill(view.id, +t.dataset.i); return; }
    if (!t.matches('textarea.code')) return;
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(view.id, +t.dataset.i); }
    else if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); t.setRangeText('    ', t.selectionStart, t.selectionEnd, 'end'); t.dispatchEvent(new Event('input', { bubbles:true })); }
    else if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
      // Garde le décalage de la ligne, et ajoute 4 espaces après une ligne qui finit par « : ».
      const before = t.value.slice(0, t.selectionStart), line = before.slice(before.lastIndexOf('\n') + 1);
      let ind = (line.match(/^ */) || [''])[0];
      if (/:\s*$/.test(line)) ind += '    ';
      if (ind) { e.preventDefault(); t.setRangeText('\n' + ind, t.selectionStart, t.selectionEnd, 'end'); t.dispatchEvent(new Event('input', { bubbles:true })); }
    }
  });
  V.addEventListener('paste', e => {
    if (e.target.matches('textarea[data-nopaste]')) { e.preventDefault(); toast('Dans les exercices, on tape soi-même : c’est comme ça que ça rentre.'); }
  });
  V.addEventListener('drop', e => { if (e.target.matches('textarea[data-nopaste]')) e.preventDefault(); });
  $('side').addEventListener('change', e => { if (e.target.id === 'unlock') { S.unlock = e.target.checked; save(); renderSide(); } });
  $('menu').addEventListener('click', () => openSide(!$('side').classList.contains('open')));
  $('scrim').addEventListener('click', () => openSide(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') openSide(false); });
}

function prepare(){
  const po = { bases:0, poo:1 };
  CHAPTERS.sort((a, b) => po[a.part] - po[b.part] || a.n - b.n);
  ORDER = CHAPTERS.flatMap(c => c.lessons.map(L => L.id));
  TOTAL = CHAPTERS.reduce((n, c) => n + c.lessons.length + c.plan.length, 0);
}
function start(){
  prepare();
  S = load() || fresh();
  bind();
  const h = (location.hash || '').slice(1);
  const m = h.match(/^l([a-z]?\d+-\d+)$/);
  if (h === 'fiches') view = { type:'fiches' };
  else if (m && LES[m[1]] && available(m[1])) view = { type:'lesson', id:m[1] };
  renderAll();
}

window.Atelier = {
  chapter, start, prepare, runPy, parseFill, fillNorm,
  get chapters(){ return CHAPTERS; }, get lessons(){ return LES; },
  h:{ ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has }
};
})();
