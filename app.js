/* Atelier Python : le moteur du site.
   Les leçons sont dans lecons/*.js et s'enregistrent avec Atelier.chapter({...}).
   Le guide pour écrire une leçon est dans docs/CONTENU.md.
   Les comptes et le classement (Supabase) sont dans cloud.js, qui se branche avec Atelier.on() et Atelier.ext. */
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
const I = {
  check:`<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.2l2.3 2.3 4.7-5"/></svg>`,
  lock:`<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M4.5 6.5V4.8a2.5 2.5 0 0 1 5 0v1.7"/><rect x="3" y="6.5" width="8" height="6" rx="1.5"/></svg>`,
  home:`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 9.5L10 3.5l7 6M5 8v8.5h10V8"/></svg>`,
  cards:`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 4.5h12v11H4zM7 8h6M7 11h4"/></svg>`,
  trophy:`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6.5 3.5h7v4a3.5 3.5 0 0 1-7 0zM6.5 5H3.5a2.5 2.5 0 0 0 3 3M13.5 5h3a2.5 2.5 0 0 1-3 3M10 11v3M7 16.5h6"/></svg>`,
  gear:`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4"/></svg>`,
  panel:`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 4.5h14v11H3zM8 4.5v11"/></svg>`,
  flame:`<svg viewBox="0 0 20 20" aria-hidden="true"><path class="fl-out" d="M10 2c.6 3-3.5 4.6-3.5 9a3.5 3.5 0 0 0 7 0c0-1.8-.8-3-1.6-4 .1 1.6-.6 2.6-1.4 2.9C11 7.5 11.6 4.5 10 2z"/></svg>`
};
const HOW_ICONS = {
  say:`<svg viewBox="0 0 20 20"><path d="M3.5 4.5h13v8h-7l-4 3v-3h-2z"/></svg>`,
  guess:`<svg viewBox="0 0 20 20"><path d="M7.5 7.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M10 14.5v.5"/></svg>`,
  code:`<svg viewBox="0 0 20 20"><path d="M7 6l-4 4 4 4M13 6l4 4-4 4"/></svg>`,
  bug:`<svg viewBox="0 0 20 20"><path d="M7 7.5a3 3 0 0 1 6 0v4a3 3 0 0 1-6 0zM4 9h3M13 9h3M4 13.5h3M13 13.5h3M8 4.5l-1-1.5M12 4.5l1-1.5"/></svg>`,
  rev:`<svg viewBox="0 0 20 20"><path d="M15.5 8A6 6 0 1 0 16 11M15.5 3.5V8H11"/></svg>`,
  java:`<svg viewBox="0 0 20 20"><path d="M3 5.5h6v9H3zM11 5.5h6v9h-6z"/></svg>`
};

/* ================= Jeu : XP, niveaux, série, badges ================= */
const LEVELS = [
  [0, 'Œuf'], [100, 'Bébé serpent'], [300, 'Couleuvre'], [600, 'Vipère curieuse'], [1000, 'Serpent des blés'],
  [1500, 'Boa codeur'], [2100, 'Cobra du terminal'], [2800, 'Anaconda des boucles'], [3700, 'Mamba des fonctions'],
  [4800, 'Python des objets'], [6200, 'Python royal'], [8000, 'Python légendaire']
];
const XP = { quiz:[10, 3], code:[20, 12], bug:[25, 15], fill:[15, 8], run:2, lesson:20, perfect:15 };
const BADGES = [
  { id:'premier-pas', icon:'🥚', name:'Premier pas', desc:'Terminer sa première leçon' },
  { id:'bug-1', icon:'🐞', name:'Chasseur de bugs', desc:'Réparer son premier bug' },
  { id:'sans-faute', icon:'🎯', name:'Sans faute', desc:'Finir une leçon sans aucune erreur' },
  { id:'combo-5', icon:'⚡', name:'Combo ×5', desc:'5 réussites d’affilée du premier coup' },
  { id:'combo-10', icon:'🌩️', name:'Combo ×10', desc:'10 réussites d’affilée du premier coup' },
  { id:'serie-3', icon:'🔥', name:'Série de 3 jours', desc:'Apprendre 3 jours de suite' },
  { id:'serie-7', icon:'📅', name:'Une semaine', desc:'Apprendre 7 jours de suite' },
  { id:'serie-30', icon:'🏔️', name:'Un mois', desc:'Apprendre 30 jours de suite' },
  { id:'objectif-7', icon:'✅', name:'Régulier', desc:'Atteindre l’objectif du jour 7 fois' },
  { id:'chapitre', icon:'📗', name:'Chapitre bouclé', desc:'Terminer un chapitre entier' },
  { id:'bases', icon:'🐍', name:'Bases maîtrisées', desc:'Terminer toute la partie bases' },
  { id:'poo', icon:'🏛️', name:'Architecte objet', desc:'Terminer toute la partie POO' },
  { id:'xp-1000', icon:'💎', name:'1 000 XP', desc:'Gagner 1 000 XP au total' },
  { id:'nuit', icon:'🦉', name:'Oiseau de nuit', desc:'Finir une leçon après 22 h' },
  { id:'matin', icon:'🌅', name:'Lève-tôt', desc:'Finir une leçon avant 8 h' }
];
const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayDiff = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);
function levelOf(xp){
  let i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
  const [base, name] = LEVELS[i], next = LEVELS[i + 1];
  return { n:i + 1, name, base, next:next ? next[0] : null, pct:next ? (xp - base) / (next[0] - base) : 1 };
}

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
const hooks = {};
const on = (ev, fn) => (hooks[ev] = hooks[ev] || []).push(fn);
const emit = (ev, d) => (hooks[ev] || []).forEach(fn => { try { fn(d); } catch (e) { console.error(e); } });
function fresh(){
  return { done:{}, cur:{}, st:{}, unlock:false, xp:0, combo:0, last:null,
    streak:{ count:0, best:0, last:null, freezes:0 }, daily:{ date:null, xp:0, lessons:0 }, goal:50, goalDays:0,
    badges:{}, stats:{ first:0, graded:0, bestCombo:0 }, ls:{}, settings:{ sound:true, theme:'auto', motion:true, side:'open' }, updated:0,
    owner:null, ownerLinked:false, track:null };
}
/* Le compte à qui appartient la progression de cet appareil. Sur un ordinateur partagé, quand un autre compte se connecte
   après un compte relié à Google, on repart de zéro : sinon il récupérerait la progression (et les XP) du précédent.
   Un ancien compte sans Google, lui, ne peut plus être retrouvé : sa progression est reprise par le nouveau compte. */
function setOwner(id, linked){
  if (S.owner && S.owner !== id && S.ownerLinked) { const keep = S.settings; S = fresh(); S.settings = keep; }
  S.owner = id; S.ownerLinked = !!linked; save();
}
function migrate(v){
  const f = fresh();
  for (const k of Object.keys(f)) if (v[k] === undefined) v[k] = f[k];
  v.streak = Object.assign(f.streak, v.streak); v.daily = Object.assign(f.daily, v.daily);
  v.stats = Object.assign(f.stats, v.stats); v.settings = Object.assign(f.settings, v.settings);
  return v;
}
function load(){ try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && v.done && v.cur && v.st) return migrate(v); } catch(_){} return null; }
let S = fresh();
function save(){ S.updated = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(_){} emit('save', S); }
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
/* Le parcours choisi : 'bases' (les bases puis la POO), 'poo' (directement la POO), ou null (pas encore choisi : comme 'bases').
   En POO directe, les bases restent ouvertes pour réviser, mais l'accueil et « Continuer » mènent à la POO. */
const nextLesson = () => S.track === 'poo' ? (nextIn('poo') || nextIn('bases')) : (nextIn('bases') || nextIn('poo'));
const resumeLesson = () => (S.last && LES[S.last] && !S.done[S.last] && (S.track !== 'poo' || partOf(S.last) === 'poo')) ? S.last : nextLesson();
function setTrack(p){
  S.track = p; save();
  const id = nextIn(p) || partOrder(p)[0];
  if (id) go('l' + id); else renderAll();
}
function dailyXp(){ if (S.daily.date !== today()) S.daily = { date:today(), xp:0, lessons:0 }; return S.daily; }
function streakAlive(){ const s = S.streak; if (!s.last) return 0; const d = dayDiff(s.last, today()); return d <= 1 || (d === 2 && s.freezes > 0) ? s.count : 0; }

/* Version légère de l'état, pour la synchronisation (sans les sorties de console). */
function exportState(){
  const st = {};
  for (const [lid, arr] of Object.entries(S.st)) st[lid] = arr.map(x => ({ code:x.code, done:x.done, picked:x.picked, hints:x.hints, tries:x.tries, fill:x.fill, skipped:x.skipped, fb:x.fb && x.fb.ok ? x.fb : null }));
  return Object.assign({}, S, { st });
}
function mergeState(remote){
  if (!remote || !remote.done) return;
  const r = migrate(remote), L = S;
  for (const id of Object.keys(r.done)) if (r.done[id]) L.done[id] = true;
  for (const [id, c] of Object.entries(r.cur)) {
    if (L.cur[id] === undefined || c > L.cur[id]) { L.cur[id] = c; if (r.st[id]) L.st[id] = r.st[id].map(x => Object.assign({ out:null, err:null, mem:null }, x)); }
  }
  L.xp = Math.max(L.xp, r.xp);
  if (r.streak.last && (!L.streak.last || r.streak.last > L.streak.last || (r.streak.last === L.streak.last && r.streak.count > L.streak.count))) L.streak = r.streak;
  L.streak.best = Math.max(L.streak.best, r.streak.best);
  for (const [b, d] of Object.entries(r.badges)) if (!L.badges[b]) L.badges[b] = d;
  if (r.daily.date === L.daily.date) L.daily.xp = Math.max(L.daily.xp, r.daily.xp); else if (r.daily.date > (L.daily.date || '')) L.daily = r.daily;
  L.goalDays = Math.max(L.goalDays, r.goalDays);
  for (const k of Object.keys(r.stats)) L.stats[k] = Math.max(L.stats[k] || 0, r.stats[k] || 0);
  L.ls = Object.assign({}, r.ls, L.ls);
  if (!L.track && r.track) L.track = r.track;
  save();
}

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
  const d = v && v.$d; if (!d || !d.tp$iter) return null;
  const rows = [];
  try {
    const it = Sk.abstr.iter(d);
    for (let k = it.tp$iternext(); k !== undefined; k = it.tp$iternext()) rows.push({ name:k.v !== undefined ? k.v : String(k), repr:reprOf(d.mp$subscript(k)) });
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

/* ================= Exercices à trous ================= */
function parseFill(tpl){
  const parts = []; const re = /\[\[(.+?)\]\]/g; let last = 0, m;
  while ((m = re.exec(tpl))) { parts.push({ text:tpl.slice(last, m.index) }); parts.push({ blank:m[1].split('|') }); last = re.lastIndex; }
  parts.push({ text:tpl.slice(last) });
  return parts;
}
const fillNorm = s => s.trim().replace(/\s+/g, ' ');

/* ================= Sons et célébrations ================= */
let actx = null;
function sound(kind){
  if (!S.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const seqs = { ok:[[660, .07], [990, .12]], ko:[[240, .12], [190, .16]], level:[[523, .09], [659, .09], [784, .09], [1047, .22]], lesson:[[392, .1], [523, .1], [659, .1], [784, .1], [1047, .3]], badge:[[880, .08], [1175, .08], [1568, .18]], pop:[[740, .05]] };
    let t = actx.currentTime;
    for (const [f, d] of seqs[kind] || []) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = kind === 'ko' ? 'triangle' : 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d + 0.02); t += d * 0.85;
    }
  } catch(_) {}
}
const motionOK = () => S.settings.motion && !matchMedia('(prefers-reduced-motion: reduce)').matches;
function confetti(power = 1){
  if (!motionOK()) return;
  const c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
  const dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight;
  c.width = W * dpr; c.height = H * dpr; const g = c.getContext('2d'); g.scale(dpr, dpr);
  const cols = ['#2A8770', '#E8922F', '#54C2A3', '#F4B55E', '#2F6DB3', '#E76F2E', '#F07B70'];
  const P = Array.from({ length:Math.round(140 * power) }, () => ({ x:W / 2 + (Math.random() - .5) * W * .3, y:H * .35, vx:(Math.random() - .5) * 14, vy:-Math.random() * 14 - 4, r:Math.random() * 6 + 4, a:Math.random() * 6, va:(Math.random() - .5) * .3, c:cols[Math.floor(Math.random() * cols.length)], s:Math.random() < .5 }));
  const t0 = performance.now();
  (function frame(t){
    const k = (t - t0) / 2400; g.clearRect(0, 0, W, H);
    for (const p of P) { p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va; g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.globalAlpha = Math.max(0, 1 - k); g.fillStyle = p.c; if (p.s) g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); else { g.beginPath(); g.arc(0, 0, p.r / 2.4, 0, 7); g.fill(); } g.restore(); }
    if (k < 1) requestAnimationFrame(frame); else c.remove();
  })(t0);
}
function popAt(el, text, cls = ''){
  const r = el ? el.getBoundingClientRect() : { left:innerWidth / 2, top:innerHeight / 2, width:0 };
  const s = document.createElement('span'); s.className = 'xp-pop ' + cls; s.textContent = text;
  s.style.left = Math.min(innerWidth - 90, Math.max(10, r.left + r.width / 2 - 30)) + 'px'; s.style.top = (r.top - 8) + 'px';
  document.body.appendChild(s); setTimeout(() => s.remove(), 1400);
}
const toasts = [];
function toast(msg, icon){
  toasts.push([msg, icon]);
  if (toasts.length === 1) showToast();
}
function showToast(){
  const [msg, icon] = toasts[0];
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status');
  t.innerHTML = (icon ? `<span class="t-ic">${icon}</span>` : '') + `<span>${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => { t.remove(); toasts.shift(); if (toasts.length) showToast(); }, toasts.length > 1 ? 2200 : 3200);
}
function overlay(html){
  document.querySelectorAll('.overlay').forEach(o => o.remove());
  const o = document.createElement('div'); o.className = 'overlay'; o.innerHTML = `<div class="ov-card" role="dialog" aria-modal="true">${html}<div class="actions"><button type="button" class="btn" data-close>Super !</button></div></div>`;
  document.body.appendChild(o);
  const close = () => o.remove();
  o.addEventListener('click', e => { if (e.target === o || e.target.closest('[data-close]')) close(); });
  setTimeout(() => { const b = o.querySelector('[data-close]'); if (b) b.focus(); }, 50);
}

/* Gagner de l'XP. kind : quiz, code, bug, fill, run. first : réussi du premier coup. */
function award(lid, i, kind, first, el){
  const before = levelOf(S.xp).n, d = dailyXp(), goalBefore = d.xp >= S.goal;
  let amount = kind === 'run' ? XP.run : XP[kind][first ? 0 : 1];
  if (kind !== 'run') {
    S.combo = first ? S.combo + 1 : 0;
    S.stats.bestCombo = Math.max(S.stats.bestCombo, S.combo);
    S.stats.graded++; if (first) S.stats.first++;
    if (S.combo >= 3) amount += Math.min(10, 2 * (S.combo - 2));
    const ls = S.ls[lid] = S.ls[lid] || { xp:0, first:0, graded:0, start:Date.now() };
    ls.graded++; if (first) ls.first++;
  }
  gain(amount, lid);
  popAt(el, `+${amount} XP`);
  if (kind !== 'run') { sound(first ? 'ok' : 'pop'); if (S.combo >= 3) setTimeout(() => popAt(el, `Combo ×${S.combo}`, 'combo'), 250); }
  if (kind === 'bug') unlockBadge('bug-1');
  if (S.combo >= 5) unlockBadge('combo-5');
  if (S.combo >= 10) unlockBadge('combo-10');
  afterGain(before, goalBefore);
}
function gain(amount, lid){
  S.xp += amount;
  const d = dailyXp(); d.xp += amount;
  if (lid) { const ls = S.ls[lid] = S.ls[lid] || { xp:0, first:0, graded:0, start:Date.now() }; ls.xp += amount; }
  touchStreak();
  emit('xp', amount);
}
function touchStreak(){
  const s = S.streak, t = today();
  if (s.last === t) return;
  const gap = s.last ? dayDiff(s.last, t) : null;
  if (gap === 1) s.count++;
  else if (gap === 2 && s.freezes > 0) { s.freezes--; s.count++; toast('Un gel de série a sauvé ta série d’hier.', '🧊'); }
  else s.count = 1;
  s.last = t; s.best = Math.max(s.best, s.count);
  if (s.count > 0 && s.count % 7 === 0 && s.freezes < 2) { s.freezes++; setTimeout(() => toast('7 jours de suite : tu gagnes un gel de série.', '🧊'), 1200); }
  if (s.count >= 3) unlockBadge('serie-3');
  if (s.count >= 7) unlockBadge('serie-7');
  if (s.count >= 30) unlockBadge('serie-30');
}
function afterGain(levelBefore, goalBefore){
  const lv = levelOf(S.xp);
  if (S.xp >= 1000) unlockBadge('xp-1000');
  if (!goalBefore && dailyXp().xp >= S.goal) {
    S.goalDays++; if (S.goalDays >= 7) unlockBadge('objectif-7');
    setTimeout(() => { toast(`Objectif du jour atteint : ${S.goal} XP !`, '🎉'); confetti(.5); sound('badge'); }, 500);
  }
  if (lv.n > levelBefore) setTimeout(() => {
    sound('level'); confetti(1.2);
    overlay(`<div class="ov-pyo">${PYO}</div><p class="kicker">Niveau ${lv.n}</p><h2>Tu deviens : ${lv.name} !</h2><p>Continue comme ça. ${lv.next ? `Prochain niveau à ${lv.next} XP.` : 'Tu as atteint le niveau maximum. Respect.'}</p>`);
  }, 700);
  renderTop();
}
function unlockBadge(id){
  if (S.badges[id]) return;
  S.badges[id] = today();
  const b = BADGES.find(x => x.id === id);
  setTimeout(() => { toast(`Nouveau badge : <b>${b.name}</b>`, b.icon); sound('badge'); }, 900);
  emit('badge', id);
}
function lessonComplete(lid){
  const L = LES[lid], ls = S.ls[lid] = S.ls[lid] || { xp:0, first:0, graded:0, start:Date.now() };
  const before = levelOf(S.xp).n, goalBefore = dailyXp().xp >= S.goal;
  const perfect = ls.graded > 0 && ls.first === ls.graded;
  gain(XP.lesson + (perfect ? XP.perfect : 0), lid);
  ls.end = Date.now(); ls.perfect = perfect;
  dailyXp().lessons++;
  unlockBadge('premier-pas');
  if (perfect) unlockBadge('sans-faute');
  const h = new Date().getHours(); if (h >= 22) unlockBadge('nuit'); if (h < 8) unlockBadge('matin');
  const c = L.chap;
  if (c.lessons.every(x => S.done[x.id])) unlockBadge('chapitre');
  if (partOrder('bases').every(x => S.done[x])) unlockBadge('bases');
  if (partOrder('poo').length && partOrder('poo').every(x => S.done[x])) unlockBadge('poo');
  sound('lesson'); confetti(1);
  afterGain(before, goalBefore);
  emit('lesson', lid);
}

/* ================= Rendu ================= */
const $ = id => document.getElementById(id);
let view = { type:'home' };
let busy = false, runToken = 0, pendingAsk = null;
let installPrompt = null;

function goalRing(size = 30){
  const d = dailyXp(), pct = Math.min(1, d.xp / S.goal), r = size / 2 - 3, c = 2 * Math.PI * r;
  return `<svg class="ring${pct >= 1 ? ' full' : ''}" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><circle class="r-bg" cx="${size / 2}" cy="${size / 2}" r="${r}"/><circle class="r-fg" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`;
}
function renderTop(){
  const lv = levelOf(S.xp), d = dailyXp(), sk = streakAlive();
  $('hud').innerHTML = `<button type="button" class="hud-it streak${sk ? ' on' : ''}" data-go="progres" title="Série : ${sk} jour${sk > 1 ? 's' : ''} de suite">${I.flame}<b>${sk}</b></button>
    <button type="button" class="hud-it goal" data-go="progres" title="Objectif du jour : ${Math.min(d.xp, S.goal)} / ${S.goal} XP">${goalRing(28)}<span class="g-txt">${Math.min(d.xp, S.goal)}<small>/${S.goal}</small></span></button>
    <button type="button" class="hud-it lvl" data-go="progres" title="${S.xp} XP"><span class="lv-n">Niv. ${lv.n}</span><span class="lv-bar"><i style="width:${lv.pct * 100}%"></i></span></button>
    <button type="button" class="hud-it icon" data-go="reglages" aria-label="Paramètres">${I.gear}</button>`;
  $('where').textContent = view.type === 'lesson' ? `${LES[view.id].num} · ${LES[view.id].title}` : ({ fiches:'Mes fiches', progres:'Mes progrès', reglages:'Paramètres', pause:'Pause' })[view.type] || '';
}
function chapLine(c, open){
  const total = c.lessons.length + c.plan.length;
  const dn = c.lessons.filter(L => S.done[L.id]).length;
  const doneAll = c.lessons.length && dn === c.lessons.length;
  let h = `<details class="chap${doneAll ? ' finished' : ''}"${open ? ' open' : ''}><summary><span class="cn">${doneAll ? I.check : c.n}</span><span>${c.title}</span><small>${dn}/${total}</small></summary><ul class="lessons">`;
  c.lessons.forEach((L, k) => {
    const isCur = view.type === 'lesson' && view.id === L.id;
    const st = S.done[L.id] ? 'done' : available(L.id) ? '' : 'locked';
    const ico = S.done[L.id] ? I.check : st === 'locked' ? I.lock : (k + 1);
    h += st === 'locked'
      ? `<li><span class="les locked" title="Termine la leçon d’avant pour l’ouvrir"><span class="ico">${ico}</span><span>${L.title}</span></span></li>`
      : `<li><button type="button" class="les ${st}${isCur ? ' current' : ''}" data-go="l${L.id}"><span class="ico">${ico}</span><span>${L.title}</span></button></li>`;
  });
  return h + `</ul></details>`;
}
function renderSide(){
  const nav = [['accueil', 'home', I.home, 'Accueil'], ['progres', 'progres', I.trophy, 'Progrès et classement'], ['fiches', 'fiches', I.cards, 'Mes fiches'], ['reglages', 'reglages', I.gear, 'Paramètres']];
  let h = `<div class="nav-top">${nav.map(([go, t, ic, label]) => `<button type="button" class="nav-link${view.type === t ? ' on' : ''}" data-go="${go}">${ic}${label}</button>`).join('')}</div>`;
  const ref = view.type === 'lesson' ? view.id : resumeLesson();
  const curC = ref && LES[ref] ? LES[ref].chap : CHAPTERS[0];
  for (const p of PARTS) {
    const cs = CHAPTERS.filter(c => c.part === p.id && c.lessons.length);
    if (!cs.length) continue;
    const here = curC && curC.part === p.id;
    const fin = cs.filter(c => c.lessons.every(L => S.done[L.id]) && c !== curC);
    const current = cs.filter(c => c === curC);
    const later = cs.filter(c => !fin.includes(c) && c !== curC);
    if (!here) {
      const dn = cs.reduce((a, c) => a + c.lessons.filter(L => S.done[L.id]).length, 0);
      h += `<details class="part-fold"><summary class="side-label">${p.title}<small>${dn ? dn + ' leçons faites' : cs.length + ' chapitres'}</small></summary>${cs.map(c => chapLine(c, false)).join('')}</details>`;
      continue;
    }
    h += `<p class="side-label">${p.title}</p>`;
    h += fin.map(c => chapLine(c, false)).join('');
    h += current.map(c => chapLine(c, true)).join('');
    if (later.length) h += `<details class="later"><summary>${later.length} chapitre${later.length > 1 ? 's' : ''} à débloquer ensuite</summary>${later.map(c => chapLine(c, false)).join('')}</details>`;
  }
  h += `<label class="unlock"><input type="checkbox" id="unlock"${S.unlock ? ' checked' : ''}> Tout débloquer (pour visiter les leçons dans le désordre)</label>`;
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
  if (s.mem || (st.mem && st.mem.length)) mem = `<div class="memory"><div class="c-label">Mémoire de Python</div>${st.mem && st.mem.length ? memHTML(st.mem) : `<p class="mem-empty">Les boîtes apparaîtront ici après l'exécution.</p>`}</div>`;
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
    if (st.done || free) a += `<button type="button" class="btn" data-act="next" data-i="${i}">${i === L.steps.length - 1 ? 'Terminer la leçon' : 'On continue'}</button>`;
    else if (s.t === 'say') a += `<span class="wait">Exécute le code pour continuer.</span>`;
  }
  if (a) h += `<div class="actions">${a}</div>`;
  let reply = '';
  if (st.done && s.t === 'quiz') { const r = s.opts.find(o => o.ok).l; reply = st.picked.length === 1 ? `Je dirais : ${r}` : `Je me suis trompé, mais j’ai trouvé : ${r}`; }
  if (st.done && (s.t === 'code' || s.t === 'fill')) reply = st.skipped ? 'Je passe pour l’instant, j’y reviendrai.' : DONEW[i % DONEW.length];
  return `<section class="step" id="st-${i}"><div class="who">${PYO}</div><div class="bubble">${h}</div>${reply ? `<div class="reply"><p>${esc(reply)}</p></div>` : ''}</section>`;
}

/* La barre de progression de la leçon : un serpent qui grandit d'un anneau par étape. */
function lbarHTML(lid){
  const L = LES[lid], sts = stOf(lid), n = L.steps.length, cur = Math.min(S.cur[lid] || 0, n);
  const segs = L.steps.map((s, i) => {
    const st = sts[i]; let c = '';
    if (st.done) c = st.skipped ? 'skip' : (s.t === 'code' && s.bug) ? 'bug' : ((s.t === 'code' || s.t === 'quiz' || s.t === 'fill') && ((s.t === 'quiz' && st.picked.length === 1) || (s.t !== 'quiz' && st.tries === 1))) ? 'gold' : 'done';
    else if (i === cur) c = 'now';
    return `<i class="seg ${c}"></i>`;
  }).join('');
  const doneN = sts.filter(x => x.done).length, pct = doneN / n;
  const left = Math.max(1, Math.round(parseInt(L.dur) * (1 - cur / n)));
  const ls = S.ls[lid];
  return `<div class="lb-row"><span class="lb-step">${cur >= n ? 'Leçon terminée' : `Étape ${cur + 1} sur ${n}`}</span>${S.combo >= 3 ? `<span class="lb-combo">${I.flame} Combo ×${S.combo}</span>` : ''}<span class="lb-xp">${ls && ls.xp ? `+${ls.xp} XP` : `≈ ${left} min`}</span></div>
    <div class="snake" style="--p:${pct}"><span class="tail"></span><span class="segs">${segs}</span><span class="head" style="left:calc(${pct * 100}% - 13px)">${PYO}</span></div>`;
}
function renderLbar(){ const b = $('lbar'); if (b && view.type === 'lesson') b.innerHTML = lbarHTML(view.id); }

function endHTML(lid){
  const L = LES[lid], po = partOrder(L.chap.part), nx = po[po.indexOf(lid) + 1];
  const ls = S.ls[lid] || { xp:0, first:0, graded:0 };
  const acc = ls.graded ? Math.round(ls.first / ls.graded * 100) : 100;
  const mins = ls.start && ls.end ? Math.max(1, Math.round((ls.end - ls.start) / 60000)) : null;
  let next;
  if (nx) next = `<button type="button" class="btn big" data-go="l${nx}">Continuer : ${LES[nx].title}</button>`;
  else if (L.chap.part === 'bases' && partOrder('poo').length) next = `<button type="button" class="btn big" data-go="l${partOrder('poo')[0]}">Bases terminées ! Passer à la POO</button>`;
  else if (L.chap.part === 'poo' && nextIn('bases')) next = `<button type="button" class="btn big" data-go="l${nextIn('bases')}">POO terminée ! Revoir les bases</button>`;
  else next = `<span class="wait">Tu as terminé cette partie. Bravo !</span>`;
  return `<section class="step end" id="st-${L.steps.length}"><div class="who">${PYO}</div><div class="bubble">
    <p class="kind k-recap">Leçon terminée</p><h2>${ls.perfect ? 'Sans aucune faute, impressionnant !' : 'Bien joué, leçon bouclée !'}</h2>
    <div class="tiles"><div class="tile"><b>+${ls.xp || 0}</b><span>XP gagnés</span></div><div class="tile"><b>${acc} %</b><span>du premier coup</span></div>${mins ? `<div class="tile"><b>${mins} min</b><span>de travail</span></div>` : ''}<div class="tile"><b>${streakAlive()} ${I.flame}</b><span>jour${streakAlive() > 1 ? 's' : ''} de suite</span></div></div>
    <h3 class="memo-t">Ce qu'il faut retenir</h3><ul class="memo">${L.recap.map(p => `<li>${p}</li>`).join('')}</ul>
    <div class="actions">${next}<button type="button" class="btn ghost" data-go="pause">M'arrêter ici</button></div>
    <p class="small">La fiche mémo est rangée dans « Mes fiches ».</p></div></section>`;
}
function lessonHTML(lid){
  const L = LES[lid], c = L.chap, k = c.lessons.indexOf(L);
  if (S.cur[lid] === undefined) S.cur[lid] = 0;
  S.last = lid;
  const ls = S.ls[lid] = S.ls[lid] || { xp:0, first:0, graded:0, start:Date.now() };
  if (!ls.start) ls.start = Date.now();
  let h = `<div class="lbar" id="lbar">${lbarHTML(lid)}</div>`;
  h += `<section class="step"><div class="who">${PYO}</div><div class="bubble"><p class="kicker">${c.part === 'poo' ? 'POO · ' : ''}Chapitre ${c.n} · ${c.title} · leçon ${k + 1}</p><h1>${L.title}</h1><p>${L.intro}</p></div></section>`;
  const upto = Math.min(S.cur[lid], L.steps.length - 1);
  for (let i = 0; i <= upto; i++) h += stepHTML(lid, i);
  if (S.cur[lid] >= L.steps.length) h += endHTML(lid);
  return h;
}
function chapterCard(c){
  const tot = c.lessons.length, dn = c.lessons.filter(L => S.done[L.id]).length;
  return `<div class="chap-card"><span class="pn">${c.n}</span><span class="pt"><b>${c.title}</b><span>${dn} leçon${dn > 1 ? 's' : ''} sur ${tot} · environ ${Math.round(c.lessons.reduce((a, L) => a + parseInt(L.dur), 0) * 1.4 / 60 * 2) / 2} h</span></span><span class="cbar"><i style="width:${tot ? dn / tot * 100 : 0}%"></i></span></div>`;
}
function homeHTML(){
  const rl = resumeLesson(), lv = levelOf(S.xp), d = dailyXp(), sk = streakAlive();
  const started = doneCount() > 0 || Object.keys(S.cur).length > 0;
  let hero;
  // Le choix du parcours reste proposé tant qu'aucune leçon n'est entamée : ouvrir une leçon sans passer d'étape ne compte pas.
  const begun = doneCount() > 0 || Object.values(S.cur).some(c => c > 0);
  if (!begun && !S.track && partOrder('poo').length) {
    hero = `<div class="resume"><p class="kicker">Par où commencer ?</p><h2>Tu connais déjà les bases de Python ?</h2><p class="small">Tu peux commencer par les bases, ou passer directement à la POO. Tout reste ouvert, et tu peux changer d'avis dans Paramètres.</p><div class="actions"><button type="button" class="btn big" data-act2="track-bases">Je débute en Python</button><button type="button" class="btn ghost" data-act2="track-poo">Je connais les bases : aller à la POO</button></div></div>`;
  } else if (rl) {
    const L = LES[rl], cur = S.cur[rl] || 0;
    hero = `<div class="resume"><p class="kicker">${started ? 'On reprend ?' : 'Prêt à commencer ?'}</p><h2>${L.num} · ${L.title}</h2><p class="small">${cur ? `Tu t'étais arrêté à l'étape ${cur + 1} sur ${L.steps.length}.` : `${L.dur} environ. ${L.intro}`}</p><div class="actions"><button type="button" class="btn big" data-go="l${rl}">${started ? 'Continuer' : 'Commencer'}</button></div></div>`;
  } else hero = `<p>Tu as terminé toutes les leçons. Bravo, tu es ${lv.name} !</p>`;
  const curC = rl ? LES[rl].chap : null;
  const today3 = `<div class="today"><div class="td">${goalRing(46)}<span><b>${Math.min(d.xp, S.goal)} / ${S.goal} XP</b>Objectif du jour</span></div><div class="td">${I.flame}<span><b>${sk} jour${sk > 1 ? 's' : ''}</b>de suite</span></div><div class="td lv"><span class="lv-badge">${lv.n}</span><span><b>${lv.name}</b>${lv.next ? `${lv.next - S.xp} XP avant le niveau ${lv.n + 1}` : 'Niveau maximum'}</span></div></div>`;
  const how = [
    ['say', 'Je t’explique un petit bout', 'Quelques lignes, jamais un gros pavé.'],
    ['guess', 'Tu devines', 'Avant d’exécuter, tu prédis ce que fait le code.'],
    ['code', 'Tu codes toi-même', 'Du vrai Python dans la page, sans copier-coller.'],
    ['bug', 'Tu répares des bugs', 'Les erreurs sont expliquées en français.'],
    ['rev', 'Tu révises', 'Chaque leçon commence par une question sur la précédente.'],
    ['java', 'Tu passes à Java', 'En POO, chaque notion est aussi montrée en Java.']
  ].map(([ic, t, dd]) => `<li><span class="hi">${HOW_ICONS[ic]}</span><span><b>${t}</b>${dd}</span></li>`).join('');
  const parts = PARTS.map(p => {
    const cs = CHAPTERS.filter(c => c.part === p.id && c.lessons.length); if (!cs.length) return '';
    const nx = nextIn(p.id);
    const show = curC && curC.part === p.id ? [curC] : [cs.find(c => c.lessons.some(L => !S.done[L.id])) || cs[cs.length - 1]];
    const dn = partOrder(p.id).filter(l => S.done[l]).length;
    return `<div class="part"><div class="part-h"><b>${p.title}</b><span class="small">${dn ? `${dn} leçon${dn > 1 ? 's' : ''} terminée${dn > 1 ? 's' : ''}` : `${cs.length} chapitres · environ 15 min par leçon`}</span></div>${show.map(chapterCard).join('')}${nx && (!curC || curC.part !== p.id) ? `<div class="actions"><button type="button" class="btn ghost" data-act2="track-${p.id}">${dn ? 'Reprendre' : 'Commencer'} cette partie</button></div>` : ''}</div>`;
  }).join('');
  const ext = Atelier.ext.homeBanner ? Atelier.ext.homeBanner() : '';
  const top = Atelier.ext.homeTop ? Atelier.ext.homeTop() : '';
  return `${top}<section class="step"><div class="who">${PYO}</div><div class="bubble"><h1>${started ? 'Content de te revoir !' : 'Salut, moi c\'est Pyo.'}</h1>${started ? '' : `<p>Je vais t'apprendre les bases de Python, puis la programmation orientée objet en Python et en Java. Pas de gros cours à lire : je t'explique un petit bout, tu testes tout de suite, et si tu te trompes, on regarde pourquoi ensemble.</p>`}${hero}</div></section>
  ${ext}
  <section class="step"><div class="who"></div><div class="bubble">${today3}</div></section>
  <section class="step"><div class="who"></div><div class="bubble"><h2>Ton parcours</h2>${parts}</div></section>
  ${started ? '' : `<section class="step"><div class="who"></div><div class="bubble"><h2>Comment ça marche</h2><ul class="how">${how}</ul></div></section>`}`;
}
function pauseHTML(){
  const d = dailyXp(), sk = streakAlive(), rl = resumeLesson();
  return `<section class="step"><div class="who">${PYO}</div><div class="bubble"><p class="kicker">Bonne pause</p><h1>À la prochaine !</h1>
    <p>Aujourd'hui : <b>${d.xp} XP</b> et <b>${d.lessons} leçon${d.lessons > 1 ? 's' : ''}</b> terminée${d.lessons > 1 ? 's' : ''}.${d.xp >= S.goal ? ' Objectif du jour atteint, bravo.' : ` Encore ${S.goal - d.xp} XP pour l'objectif du jour.`}</p>
    <div class="today"><div class="td">${goalRing(46)}<span><b>${Math.min(d.xp, S.goal)} / ${S.goal} XP</b>Objectif du jour</span></div><div class="td">${I.flame}<span><b>${sk} jour${sk > 1 ? 's' : ''}</b>de suite</span></div></div>
    <p>${sk ? `Reviens demain pour passer à ${sk + 1} jours de suite. Même 10 minutes suffisent.` : 'Reviens demain pour lancer ta série de jours.'}</p>
    <div class="actions"><button type="button" class="btn ghost" data-go="accueil">Retour à l'accueil</button>${rl ? `<button type="button" class="btn" data-go="l${rl}">Finalement, je continue</button>` : ''}</div></div></section>`;
}
function progresHTML(){
  const lv = levelOf(S.xp), acc = S.stats.graded ? Math.round(S.stats.first / S.stats.graded * 100) : 0;
  const badges = BADGES.map(b => { const got = S.badges[b.id]; return `<div class="badge${got ? ' got' : ''}" title="${esc(b.desc)}"><span class="b-ic">${got ? b.icon : '?'}</span><b>${b.name}</b><span>${got ? 'Obtenu le ' + got.split('-').reverse().join('/') : b.desc}</span></div>`; }).join('');
  const board = Atelier.ext.boardHTML ? Atelier.ext.boardHTML() : `<p>Le classement de la classe arrive avec les comptes. En attendant, ta progression est enregistrée sur cet appareil.</p>`;
  return `<section class="step"><div class="who">${PYO}</div><div class="bubble"><p class="kicker">Niveau ${lv.n}</p><h1>${lv.name}</h1>
    <div class="lvl-big"><span class="lv-bar"><i style="width:${lv.pct * 100}%"></i></span><span class="small">${S.xp} XP${lv.next ? ` · encore ${lv.next - S.xp} XP pour devenir ${LEVELS[lv.n][1]}` : ''}</span></div>
    <div class="tiles"><div class="tile"><b>${doneCount()}</b><span>leçons terminées</span></div><div class="tile"><b>${streakAlive()} ${I.flame}</b><span>série actuelle (record ${S.streak.best})</span></div><div class="tile"><b>${acc} %</b><span>réussi du premier coup</span></div><div class="tile"><b>${S.streak.freezes} 🧊</b><span>gel${S.streak.freezes > 1 ? 's' : ''} de série</span></div></div>
    <div class="actions"><button type="button" class="btn ghost" data-act2="share">Partager ma progression</button></div></div></section>
  <section class="step"><div class="who"></div><div class="bubble"><h2>Classement de la classe</h2>${board}</div></section>
  <section class="step"><div class="who"></div><div class="bubble"><h2>Badges · ${Object.keys(S.badges).length} sur ${BADGES.length}</h2><div class="badges">${badges}</div></div></section>`;
}
/* Mes fiches : celles des leçons terminées, ou toutes les fiches du cours. On peut les exporter en PDF ou en texte. */
let fichesAll = false;
const fichesList = () => fichesAll ? ORDER : ORDER.filter(l => S.done[l]);
function fichesBody(ids){
  return PARTS.map(p => {
    const mine = ids.filter(l => partOf(l) === p.id); if (!mine.length) return '';
    return `<h2 class="fiche-part">${p.title}</h2>` + mine.map(l => `<div class="fiche"><h3><span>${LES[l].num}</span>${LES[l].title}</h3><ul>${LES[l].recap.map(x => `<li>${x}</li>`).join('')}</ul></div>`).join('');
  }).join('');
}
function fichesHTML(){
  const ids = fichesList(), n = ORDER.filter(l => S.done[l]).length;
  const tabs = `<div class="seg-tabs" role="group" aria-label="Fiches à afficher"><button type="button" data-act2="fiches-done" class="${fichesAll ? '' : 'on'}" aria-pressed="${!fichesAll}">Terminées (${n})</button><button type="button" data-act2="fiches-all" class="${fichesAll ? 'on' : ''}" aria-pressed="${fichesAll}">Toutes (${ORDER.length})</button></div>`;
  const tools = ids.length ? `<div class="actions"><button type="button" class="btn ghost" data-act2="fiches-pdf">Télécharger en PDF</button><button type="button" class="btn ghost" data-act2="fiches-copy">Copier le texte</button></div>` : '';
  const body = ids.length ? fichesBody(ids)
    : `<p>Tu n'as pas encore de fiche terminée. Termine ta première leçon et elle apparaîtra ici, ou choisis « Toutes » pour lire les fiches de tout le cours.</p>`;
  return `<section class="step"><div class="who">${PYO}</div><div class="bubble"><p class="kicker">Révisions</p><h1>Mes fiches</h1><p>Chaque leçon terminée ajoute sa fiche ici. C'est ton résumé à relire avant un contrôle. « Toutes » montre aussi les fiches des leçons pas encore faites.</p>${tabs}${tools}</div></section><section class="step"><div class="who"></div><div class="bubble">${body}</div></section>`;
}
function fichesTitle(){ return fichesAll ? 'Toutes les fiches' : 'Mes fiches terminées'; }
/* PDF : on imprime une zone faite pour ça ; le téléphone ou l'ordinateur propose ensuite « Enregistrer en PDF ». */
function fichesPDF(){
  const ids = fichesList(); if (!ids.length) return;
  document.querySelectorAll('#print-zone').forEach(z => z.remove());
  const z = document.createElement('div'); z.id = 'print-zone';
  z.innerHTML = `<h1>Atelier Python · ${fichesTitle()}</h1><p class="print-date">${new Date().toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })} · ${ids.length} fiche${ids.length > 1 ? 's' : ''}</p>${fichesBody(ids)}`;
  document.body.appendChild(z); document.body.classList.add('printing');
  const done = () => { document.body.classList.remove('printing'); z.remove(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  // Pas de nettoyage au bout d'un délai : sur iPhone, print() rend la main tout de suite et l'aperçu est calculé ensuite.
  // La zone reste cachée à l'écran (style.css) jusqu'à « afterprint » ou au prochain export.
  setTimeout(() => { try { window.print(); } catch(_) { done(); toast('Impression impossible sur ce navigateur. Essaie « Copier le texte ».', '🖨️'); } }, 50);
}
/* Texte : les fiches en texte simple, à coller dans ses notes. */
function fichesText(){
  const plain = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
  const ids = fichesList();
  return `Atelier Python · ${fichesTitle()}\n` + PARTS.map(p => {
    const mine = ids.filter(l => partOf(l) === p.id); if (!mine.length) return '';
    return `\n=== ${p.title} ===\n` + mine.map(l => `\n${LES[l].num} · ${plain(LES[l].title)}\n` + LES[l].recap.map(x => `- ${plain(x)}`).join('\n')).join('\n');
  }).join('') + '\n';
}
async function fichesCopy(){
  const text = fichesText();
  try { await navigator.clipboard.writeText(text); toast('Fiches copiées : colle-les dans tes notes.', '📋'); return; } catch(_) {}
  const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
  document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
  let ok = false; try { ok = document.execCommand('copy'); } catch(_) {}
  ta.remove();
  toast(ok ? 'Fiches copiées : colle-les dans tes notes.' : 'Copie impossible sur ce navigateur. Essaie « Télécharger en PDF ».', '📋');
}
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function reglagesHTML(){
  const opt = (name, val, label, cur) => `<label class="seg-opt"><input type="radio" name="${name}" value="${val}"${String(cur) === String(val) ? ' checked' : ''}><span>${label}</span></label>`;
  const tab = isIOS() ? 'ios' : /android/i.test(navigator.userAgent) ? 'android' : 'pc';
  const install = isStandalone()
    ? `<p class="ok-line">${I.check} L'appli est installée sur cet appareil.</p>`
    : `${installPrompt ? `<div class="actions"><button type="button" class="btn" data-act2="install">Installer l'appli</button></div>` : ''}
      <div class="tabs" role="tablist">${[['android', 'Android'], ['ios', 'iPhone et iPad'], ['pc', 'Ordinateur']].map(([k, l]) => `<button type="button" role="tab" class="tab${k === tab ? ' on' : ''}" data-tab="${k}" aria-selected="${k === tab}">${l}</button>`).join('')}</div>
      <ol class="guide" data-guide="android"${tab === 'android' ? '' : ' hidden'}><li>Ouvre le site dans <b>Chrome</b>.</li><li>Touche le menu <b>⋮</b> en haut à droite.</li><li>Choisis <b>Installer l'application</b> (ou <b>Ajouter à l'écran d'accueil</b>).</li><li>Confirme : l'icône de Pyo apparaît sur ton écran d'accueil.</li></ol>
      <ol class="guide" data-guide="ios"${tab === 'ios' ? '' : ' hidden'}><li>Ouvre le site dans <b>Safari</b> (pas dans un autre navigateur).</li><li>Touche le bouton <b>Partager</b> (le carré avec une flèche vers le haut).</li><li>Fais défiler et choisis <b>Sur l'écran d'accueil</b>.</li><li>Touche <b>Ajouter</b> : l'appli s'ouvre ensuite en plein écran.</li></ol>
      <ol class="guide" data-guide="pc"${tab === 'pc' ? '' : ' hidden'}><li>Ouvre le site dans <b>Chrome</b> ou <b>Edge</b>.</li><li>Clique sur l'icône d'installation à droite de la barre d'adresse (un écran avec une flèche), ou sur le menu <b>⋮</b> puis <b>Installer Atelier Python</b>.</li><li>L'appli s'ouvre dans sa propre fenêtre, et tu la retrouves dans le menu Démarrer.</li></ol>
      <p class="small">Une fois installée, l'appli marche aussi sans connexion. Ta progression se synchronise quand le réseau revient.</p>`;
  const account = Atelier.ext.accountHTML ? Atelier.ext.accountHTML() : `<p>Les comptes ne sont pas encore activés sur ce site. Ta progression est enregistrée sur cet appareil.</p>`;
  return `<section class="step"><div class="who">${PYO}</div><div class="bubble"><p class="kicker">Paramètres</p><h1>Réglages</h1><p>Règle l'appli comme tu l'aimes.</p></div></section>
  <section class="step"><div class="who"></div><div class="bubble" id="compte"><h2>Compte et classe</h2>${account}</div></section>
  <section class="step"><div class="who"></div><div class="bubble"><h2>Installer l'appli</h2>${install}</div></section>
  <section class="step"><div class="who"></div><div class="bubble"><h2>Préférences</h2>
    <div class="pref"><b>Mon parcours</b><div class="seg-group">${opt('track', 'bases', 'Les bases, puis la POO', S.track || 'bases')}${opt('track', 'poo', 'Directement la POO', S.track || 'bases')}</div><span class="small">En POO directe, l'accueil te mène à la POO, et les bases restent ouvertes pour réviser.</span></div>
    <div class="pref"><b>Objectif du jour</b><div class="seg-group">${opt('goal', 20, 'Tranquille · 20 XP', S.goal)}${opt('goal', 50, 'Normal · 50 XP', S.goal)}${opt('goal', 100, 'Intense · 100 XP', S.goal)}</div></div>
    <div class="pref"><b>Thème</b><div class="seg-group">${opt('theme', 'auto', 'Automatique', S.settings.theme)}${opt('theme', 'light', 'Clair', S.settings.theme)}${opt('theme', 'dark', 'Sombre', S.settings.theme)}</div></div>
    <label class="pref sw"><input type="checkbox" data-set="sound"${S.settings.sound ? ' checked' : ''}><span><b>Sons</b>Petits sons quand tu réussis</span></label>
    <label class="pref sw"><input type="checkbox" data-set="motion"${S.settings.motion ? ' checked' : ''}><span><b>Animations</b>Confettis et effets</span></label>
  </div></section>
  <section class="step"><div class="who"></div><div class="bubble"><h2>Mes données</h2><p class="small">Ce qui est enregistré et comment supprimer ton compte : <a href="confidentialite.html">confidentialité et conditions d'utilisation</a>.</p><p class="small">Tout recommencer efface ta progression sur cet appareil.</p><div class="actions" id="reset-zone"><button type="button" class="btn ghost danger" data-act2="reset-ask">Tout recommencer</button></div></div></section>`;
}
function renderView(){
  const v = view.type;
  $('view').innerHTML = v === 'lesson' ? lessonHTML(view.id) : v === 'fiches' ? fichesHTML() : v === 'progres' ? progresHTML() : v === 'reglages' ? reglagesHTML() : v === 'pause' ? pauseHTML() : homeHTML();
  document.body.dataset.view = v;
  emit('render', view);
}
function renderAll(){ applySettings(); renderTop(); renderSide(); renderView(); }
function updateStep(lid, i){
  const el = $('st-' + i); if (!el || view.type !== 'lesson' || view.id !== lid) return;
  const t = document.createElement('div'); t.innerHTML = stepHTML(lid, i);
  el.replaceWith(t.firstElementChild);
  renderLbar();
}
function applySettings(){
  const th = S.settings.theme;
  if (th === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = th;
  document.body.classList.toggle('side-closed', S.settings.side === 'closed');
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#FFFFFF';
}

/* ================= Actions ================= */
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
  let won = null;
  if (s.t === 'say' && !st.done) { st.done = true; if (!r.err) won = ['run', true]; }
  if (s.t === 'code' && (!st.done || st.skipped)) {
    const unchanged = s.bug && st.code.trim() === s.code.trim();
    let v;
    try { v = await s.check(r, st.code, tester(st.code)); }
    catch (e) { console.error(e); v = 'Je n’ai pas réussi à vérifier ton code. Réessaie.'; }
    if (!unchanged) st.tries++;
    if (v === true) { const wasSkipped = st.skipped; st.done = true; st.skipped = false; st.fb = { ok:true, text:s.ok || '' }; if (!wasSkipped) won = [s.bug ? 'bug' : 'code', st.tries === 1]; }
    else { st.fb = { ok:false, text:v + (st.skipped ? ' (Exercice passé : tu peux continuer quand même.)' : '') }; if (!unchanged) { S.combo = 0; sound('ko'); } }
  }
  busy = false;
  const anchor = $('st-' + i) && $('st-' + i).querySelector('.run');
  if (won) award(lid, i, won[0], won[1], anchor);
  save(); updateStep(lid, i); renderTop();
  if (!st.done) { const ta = $('code-' + i); if (ta) ta.focus({ preventScroll:true }); }
}
function checkFill(lid, i){
  const s = LES[lid].steps[i], st = stOf(lid)[i];
  const blanks = parseFill(s.tpl).filter(p => p.blank);
  const vals = st.fill || [];
  st.fillOk = blanks.map((p, k) => p.blank.some(a => fillNorm(a) === fillNorm(vals[k] || '')));
  st.tries++;
  const bad = st.fillOk.filter(x => !x).length;
  const btn = $('st-' + i) && $('st-' + i).querySelector('[data-act=fill]');
  if (!bad) { const was = st.skipped; st.done = true; st.skipped = false; st.fb = { ok:true, text:s.ok || '' }; if (!was) award(lid, i, 'fill', st.tries === 1, btn); }
  else {
    const empty = blanks.some((p, k) => !(vals[k] || '').trim());
    st.fb = { ok:false, text: empty ? 'Il reste des trous vides.' : `${bad} trou${bad > 1 ? 's' : ''} à revoir, en rouge. Attention : Java fait la différence entre majuscules et minuscules.` };
    if (!empty) { S.combo = 0; sound('ko'); }
  }
  save(); updateStep(lid, i);
}
function pick(lid, i, k, el){
  const s = LES[lid].steps[i], st = stOf(lid)[i], o = s.opts[k];
  if (st.done || st.picked.includes(k)) return;
  st.picked.push(k);
  st.fb = o.ok ? { ok:true, text:s.ex } : { ok:false, text:o.why };
  if (o.ok) { st.done = true; award(lid, i, 'quiz', st.picked.length === 1, el); }
  else { S.combo = 0; sound('ko'); }
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
  const finished = S.cur[lid] >= L.steps.length && !S.done[lid];
  if (finished) { S.done[lid] = true; lessonComplete(lid); }
  save(); renderTop(); renderSide(); renderView();
  const el = $('st-' + (i + 1));
  if (el) {
    el.scrollIntoView({ behavior:motionOK() ? 'smooth' : 'auto', block:'start' });
    const f = el.querySelector('textarea, input.blank'); if (f) setTimeout(() => f.focus({ preventScroll:true }), 400);
  }
}
function openSide(on){
  if (matchMedia('(min-width: 1000px)').matches) {
    S.settings.side = on ? 'open' : 'closed'; save(); applySettings();
  } else {
    $('side').classList.toggle('open', on); $('scrim').classList.toggle('open', on);
  }
  $('menu').setAttribute('aria-expanded', String(on));
}
const sideIsOpen = () => matchMedia('(min-width: 1000px)').matches ? S.settings.side !== 'closed' : $('side').classList.contains('open');
function go(token){
  if (pendingAsk) pendingAsk();
  runToken++;
  const simple = { fiches:'fiches', accueil:'home', progres:'progres', reglages:'reglages', pause:'pause' };
  if (simple[token]) view = { type:simple[token] };
  else { const id = token.slice(1); if (!LES[id] || !available(id)) return; view = { type:'lesson', id }; }
  try { history.replaceState(null, '', '#' + token); } catch(_) {}
  if (!matchMedia('(min-width: 1000px)').matches) { $('side').classList.remove('open'); $('scrim').classList.remove('open'); }
  renderAll(); window.scrollTo(0, 0);
}

/* Carte à partager : une image avec le niveau, la série et les leçons. */
async function share(){
  const lv = levelOf(S.xp), c = document.createElement('canvas'); c.width = 1080; c.height = 1080;
  const g = c.getContext('2d');
  g.fillStyle = '#163C33'; g.fillRect(0, 0, 1080, 1080);
  g.fillStyle = '#2A8770'; g.beginPath(); g.arc(880, 220, 300, 0, 7); g.fill();
  g.fillStyle = '#E8922F'; g.beginPath(); g.arc(140, 980, 220, 0, 7); g.fill();
  const img = new Image(); img.src = 'icons/icon-512.png'; await img.decode().catch(() => {});
  try { g.drawImage(img, 90, 90, 200, 200); } catch(_) {}
  g.fillStyle = '#FFFFFF'; g.font = '900 64px Nunito, sans-serif'; g.fillText('Atelier Python', 320, 175);
  g.font = '600 38px Nunito, sans-serif'; g.fillStyle = '#CFE9E0'; g.fillText('J’apprends Python et la POO', 320, 235);
  g.fillStyle = '#FFFFFF'; g.font = '900 120px Nunito, sans-serif'; g.fillText(lv.name, 90, 520);
  g.font = '700 46px Nunito, sans-serif'; g.fillStyle = '#F4B55E'; g.fillText(`Niveau ${lv.n} · ${S.xp} XP`, 90, 600);
  g.fillStyle = '#FFFFFF'; g.font = '800 54px Nunito, sans-serif';
  g.fillText(`${doneCount()} leçons terminées`, 90, 740); g.fillText(`${streakAlive()} jours de suite`, 90, 820);
  g.fillText(`${Object.keys(S.badges).length} badges`, 90, 900);
  g.font = '600 34px Nunito, sans-serif'; g.fillStyle = '#CFE9E0'; g.fillText((location.host + location.pathname).replace(/index\.html$/, ''), 90, 1010);
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  const url = location.href.split('#')[0];
  const text = `Je suis ${lv.name} sur Atelier Python : ${doneCount()} leçons, ${streakAlive()} jours de suite. Viens apprendre Python avec moi !`;
  const file = new File([blob], 'atelier-python.png', { type:'image/png' });
  try {
    if (navigator.canShare && navigator.canShare({ files:[file] })) { await navigator.share({ files:[file], text, url }); return; }
    if (navigator.share) { await navigator.share({ text, url }); return; }
  } catch(_) { return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'atelier-python.png'; a.click();
  try { await navigator.clipboard.writeText(text + ' ' + url); toast('Image téléchargée, et texte copié pour le partager.', '📋'); } catch(_) { toast('Image téléchargée.', '📷'); }
}

function bind(){
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); go(g.dataset.go); return; }
    const t = e.target.closest('[data-tab]');
    if (t) { document.querySelectorAll('[data-tab]').forEach(x => { x.classList.toggle('on', x === t); x.setAttribute('aria-selected', String(x === t)); }); document.querySelectorAll('[data-guide]').forEach(x => x.hidden = x.dataset.guide !== t.dataset.tab); return; }
    const a2 = e.target.closest('[data-act2]');
    if (a2) {
      const k = a2.dataset.act2;
      if (k === 'share') share();
      if (k === 'track-bases' || k === 'track-poo') setTrack(k.slice(6));
      if (k === 'fiches-done' || k === 'fiches-all') { fichesAll = k === 'fiches-all'; renderView(); }
      if (k === 'fiches-pdf') fichesPDF();
      if (k === 'fiches-copy') fichesCopy();
      if (k === 'install' && installPrompt) { installPrompt.prompt(); installPrompt.userChoice.finally(() => { installPrompt = null; renderView(); }); }
      if (k === 'reset-ask') $('reset-zone').innerHTML = `<span class="wait">Sûr ? Toute ta progression sur cet appareil sera effacée.</span><button type="button" class="btn danger" data-act2="reset">Oui, tout effacer</button><button type="button" class="btn ghost" data-act2="reset-no">Annuler</button>`;
      if (k === 'reset-no') renderView();
      if (k === 'reset') { const keep = S.settings; S = fresh(); S.settings = keep; save(); emit('reset'); go('accueil'); toast('Progression effacée. Nouveau départ !', '🥚'); }
      return;
    }
    const b = e.target.closest('[data-act]'); if (!b || view.type !== 'lesson') return;
    const lid = view.id, i = +b.dataset.i;
    switch (b.dataset.act) {
      case 'run': run(lid, i); break;
      case 'opt': pick(lid, i, +b.dataset.k, b); break;
      case 'fill': checkFill(lid, i); break;
      case 'hint': stOf(lid)[i].hints++; save(); updateStep(lid, i); break;
      case 'skip': { const st = stOf(lid)[i]; st.done = true; st.skipped = true; S.combo = 0; st.fb = { ok:false, text:'Pas de souci : tu peux continuer, et revenir sur cet exercice quand tu veux. Il reste ouvert.' }; save(); updateStep(lid, i); break; }
      case 'next': next(lid, i); break;
    }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.name === 'goal') { S.goal = +t.value; save(); renderTop(); }
    else if (t.name === 'theme') { S.settings.theme = t.value; save(); applySettings(); }
    else if (t.name === 'track') { S.track = t.value; save(); renderSide(); toast(t.value === 'poo' ? 'Parcours : directement la POO.' : 'Parcours : les bases, puis la POO.', '🧭'); }
    else if (t.dataset.set) { S.settings[t.dataset.set] = t.checked; save(); if (t.checked && t.dataset.set === 'sound') sound('ok'); }
    else if (t.id === 'unlock') { S.unlock = t.checked; save(); renderSide(); }
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
      const before = t.value.slice(0, t.selectionStart), line = before.slice(before.lastIndexOf('\n') + 1);
      let ind = (line.match(/^ */) || [''])[0];
      if (/:\s*$/.test(line)) ind += '    ';
      if (ind) { e.preventDefault(); t.setRangeText('\n' + ind, t.selectionStart, t.selectionEnd, 'end'); t.dispatchEvent(new Event('input', { bubbles:true })); }
    }
  });
  V.addEventListener('paste', e => {
    if (e.target.matches('textarea[data-nopaste]')) { e.preventDefault(); toast('Dans les exercices, on tape soi-même : c’est comme ça que ça rentre.', '⌨️'); }
  });
  V.addEventListener('drop', e => { if (e.target.matches('textarea[data-nopaste]')) e.preventDefault(); });
  $('menu').addEventListener('click', () => openSide(!sideIsOpen()));
  $('scrim').addEventListener('click', () => openSide(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!matchMedia('(min-width: 1000px)').matches) openSide(false); document.querySelectorAll('.overlay').forEach(o => o.remove()); } });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySettings);
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; if (view.type === 'reglages') renderView(); });
  window.addEventListener('appinstalled', () => { installPrompt = null; toast('Appli installée. Retrouve Pyo sur ton écran d’accueil !', '📲'); });
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
  if (['fiches', 'progres', 'reglages', 'pause'].includes(h)) view = { type:h };
  else if (m && LES[m[1]] && available(m[1])) view = { type:'lesson', id:m[1] };
  renderAll();
  emit('start');
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !/\/dev\//.test(location.pathname)) navigator.serviceWorker.register('sw.js').catch(() => {});
}

window.Atelier = {
  chapter, start, prepare, runPy, parseFill, fillNorm,
  on, save, renderAll, renderView, renderTop, toast, go, exportState, mergeState, setOwner, levelOf,
  get state(){ return S; }, get view(){ return view; },
  get chapters(){ return CHAPTERS; }, get lessons(){ return LES; },
  ext:{},
  h:{ ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has }
};
})();
