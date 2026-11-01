/* Partie 1 · Chapitre 3 : Répéter avec les boucles */
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has } = Atelier.h;
const LES = {};

/* Petites aides pour les corrections de ce chapitre */
// Ce que le programme affiche après la dernière réponse donnée à input().
const tail = (t, ins) => { let p = 0; for (const v of ins) { const k = t.out.indexOf(v + '\n', p); if (k >= 0) p = k + v.length + 1; } return t.out.slice(p); };
// Vrai si le texte contient le mot ou l'expression w (sans tenir compte des majuscules ni des accents).
const says = (txt, w) => new RegExp('(^|[^a-z0-9])' + norm(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)').test(norm(txt));
const quoted = ins => ins.length ? 'Quand je réponds ' + ins.map(v => `« ${esc(v)} »`).join(' puis ') : 'Quand je lance ton code';
// Teste le programme avec plusieurs jeux de réponses : [réponses, texte attendu, textes interdits].
async function cases(test, list, code){
  for (const [ins, want, bad = []] of list) {
    const t = await test(ins, code);
    const q = quoted(ins);
    if (t.err) return `${q}, ton code plante : ${esc(t.err.title)}.`;
    const o = tail(t, ins);
    if (!says(o, want)) return `${q}, je devrais lire « ${esc(want)} ».${o.trim() ? ` J’ai lu : <code>${esc(o.trim().slice(0, 160))}</code>` : ' Rien ne s’affiche.'}`;
    for (const b of bad) if (says(o, b)) return `${q}, je lis « ${esc(b)} » alors que ça ne devrait pas s’afficher.`;
  }
  return true;
}
// Les nombres entiers affichés, dans l'ordre.
const nums = o => ((o || '').match(/-?\d+/g) || []).map(Number);
const BUG = 'Voilà le bug ! Exécute, lis ce qui se passe, puis corrige le code.';
const same = (code, start) => code.trim() === start.trim();
const bugOf = id => LES[id].steps.find(s => s.bug).code;

LES['3-1'] = { title:'La boucle while', dur:'12 min',
  intro:'Un ordinateur ne se fatigue jamais de répéter. Avec une boucle, tu écris une instruction une fois, et Python l’exécute autant de fois qu’il faut. On commence par <code>while</code>.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur le chapitre 2', p:`<p>Qu'affiche ce code ?</p>`, snip:`pv = 40
potions = 0
if pv > 50 or potions > 0:
    print("Au combat !")
elif pv > 30:
    print("Prudence...")
else:
    print("Fuis !")`,
      opts:[ {l:'Au combat !', why:'<code>pv &gt; 50</code> est faux et <code>potions &gt; 0</code> aussi : le <code>or</code> est faux.'},
             {l:'Prudence...', ok:1},
             {l:'Fuis !', why:'Le <code>elif</code> est testé avant le <code>else</code> : 40 &gt; 30 est vrai.'},
             {l:'Au combat ! puis Prudence...', why:'Une chaîne <code>if</code>/<code>elif</code>/<code>else</code> exécute un seul bloc.'} ],
      ex:'Faux <code>or</code> faux donne faux. Puis <code>40 &gt; 30</code> est vrai : « Prudence... ».' },
    { t:'say', h:'Tant que…', file:'compte.py',
      p:`<p><code>while</code> veut dire « tant que ». C'est un <code>if</code> qui recommence : tant que la condition est vraie, Python exécute le bloc, puis <strong>remonte</strong> tester la condition à nouveau.</p><p>Dès qu'elle devient fausse, il sort de la boucle et passe à la suite. Chaque passage dans la boucle s'appelle un <strong>tour</strong> (ou une <em>itération</em>).</p>`,
      code:`n = 3
while n > 0:
    print(n)
    n = n - 1
print("Décollage !")` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`n = 1
while n < 4:
    print(n)
    n += 1`,
      opts:[ {l:'1, 2, 3, 4', why:'Quand n vaut 4, la condition <code>n &lt; 4</code> est fausse : Python sort sans afficher 4.'},
             {l:'1, 2, 3', ok:1},
             {l:'0, 1, 2, 3', why:'n commence à 1, et on l’affiche avant de l’augmenter.'},
             {l:'1 à l’infini', why:'<code>n += 1</code> augmente n à chaque tour : la condition finit par devenir fausse.'} ],
      ex:'Les tours : n vaut 1, 2, puis 3. Ensuite n vaut 4 et <code>4 &lt; 4</code> est faux : la boucle s’arrête.' },
    { t:'say', h:'Le combat, tour par tour', file:'combat.py', mem:1,
      p:`<p>Le dragon inflige 7 points de dégâts par tour. Tant que le héros a des points de vie, le combat continue.</p><p>Le point essentiel : <strong>quelque chose doit changer dans la boucle</strong>, ici <code>pv</code>. Sinon la condition reste vraie pour toujours : c'est la <em>boucle infinie</em>. Dans cette page, Python l'arrête au bout de quelques secondes. Sur ton ordinateur, il faut appuyer sur <code>Ctrl + C</code>.</p>`,
      code:`pv = 20
tour = 1
while pv > 0:
    pv -= 7
    print(f"Tour {tour} : le dragon frappe, il te reste {pv} pv")
    tour += 1
print("Ton héros est K.O.")` },
    { t:'quiz', h:'Combien de tours ?', p:`<p>Combien de fois « Aïe » s'affiche-t-il ?</p>`, snip:`pv = 20
while pv > 0:
    pv -= 7
    print("Aïe")`,
      opts:[ {l:'2 fois', why:'Après 2 tours, pv vaut 6 : c’est encore plus grand que 0, donc on continue.'},
             {l:'3 fois', ok:1},
             {l:'4 fois', why:'Après 3 tours, pv vaut -1 : la condition <code>pv &gt; 0</code> est fausse, c’est fini.'},
             {l:'À l’infini', why:'pv diminue à chaque tour, il finit par passer sous 0.'} ],
      ex:'pv passe de 20 à 13, puis 6, puis -1. Trois tours. Pour suivre une boucle, fais le tableau des valeurs à chaque tour : c’est la meilleure méthode.' },
    { t:'say', h:'Redemander tant que c’est faux', file:'note.py', solIn:['25', '-2', '14'],
      p:`<p><code>while</code> est parfait pour <strong>redemander</strong> tant que la réponse ne va pas. Au chapitre 2, ton calculateur de mention abandonnait devant une note invalide. Maintenant, il peut insister.</p><p>Exécute et tape d'abord 25, puis -2, puis une vraie note.</p>`,
      code:`note = float(input("Ta note sur 20 ? "))
while note < 0 or note > 20:
    print("Une note va de 0 à 20.")
    note = float(input("Ta note sur 20 ? "))
print(f"Note enregistrée : {note}")` },
    { t:'code', h:'À toi : les potions', file:'potions.py', mem:1,
      p:`<p>Le héros a 35 pv. Il boit des potions qui rendent 20 pv chacune, <strong>tant qu'il a moins de 100 pv</strong>. Avec une boucle <code>while</code>, affiche ses pv après chaque potion.</p><p>Pour 35, ça donne 55, 75, 95, 115. Je testerai aussi avec d'autres valeurs de départ.</p>`,
      code:`pv = 35
`,
      hints:['La condition de la boucle : <code>while pv &lt; 100:</code>','Dans la boucle, deux lignes décalées : <code>pv += 20</code> puis <code>print(pv)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/\bwhile\b/.test(code)) return 'Utilise une boucle <code>while</code>.';
        for (const [d, w] of [['35', [55, 75, 95, 115]], ['90', [110]], ['0', [20, 40, 60, 80, 100]]]) {
          const t = await test([], code.replace(/pv\s*=\s*\d+/, 'pv = ' + d));
          if (t.err) return `Quand le héros commence à ${d} pv, ton code plante : ${esc(t.err.title)}.`;
          const got = nums(t.out);
          if (got.join() !== w.join()) return `En commençant à ${d} pv, je devrais lire ${w.join(', ')}, et je lis ${got.length ? esc(got.join(', ')) : 'rien'}.${d === '35' && got[0] === 35 ? ' Bois la potion <strong>avant</strong> d’afficher les pv.' : ''}`;
        }
        return true;
      },
      ok:'Testé en partant de 35, 90 et 0 pv. Remarque : à 100 pile, le héros arrête. <code>&lt;</code> ou <code>&lt;=</code>, ça compte toujours.',
      sol:`pv = 35
while pv < 100:
    pv += 20
    print(pv)` },
    { t:'code', defi:1, h:'Le mot de passe insistant', file:'mdp.py',
      p:`<p>Redemande le mot de passe <strong>tant qu'il est faux</strong>. Le bon mot de passe est <code>dragon42</code>. À la fin, affiche <code>Bienvenue après 3 essais</code> (avec le vrai nombre d'essais).</p>`,
      code:``,
      hints:['Pose la question une première fois avant la boucle, avec un compteur <code>essais = 1</code>. Puis <code>while mdp != "dragon42":</code>.','Dans la boucle : redemande le mot de passe et fais <code>essais += 1</code>. Après la boucle : <code>print(f"Bienvenue après {essais} essais")</code>.'],
      check:async (r, code, test) => {
        if (nInputs(code) < 1) return 'Il faut demander le mot de passe avec <code>input()</code>.';
        if (!/\bwhile\b/.test(code)) return 'Utilise une boucle <code>while</code> pour redemander.';
        for (const ins of [['abc', '123', 'dragon42'], ['dragon42'], ['a', 'b', 'c', 'd', 'dragon42']]) {
          const t = await test(ins);
          if (t.err) return `${quoted(ins)}, ton code plante : ${esc(t.err.title)}.`;
          const asked = (t.out.match(/\n/g) || []).length;
          const o = tail(t, ins);
          if (!says(o, 'bienvenue')) return `${quoted(ins)}, je devrais lire « Bienvenue ».`;
          if (!nums(o).includes(ins.length)) return `${quoted(ins)}, il faut ${ins.length} essai${ins.length > 1 ? 's' : ''}, et je ne vois pas le nombre ${ins.length} dans le message final.`;
          if (asked < ins.length) return `${quoted(ins)}, ton programme doit poser la question ${ins.length} fois.`;
        }
        return true;
      },
      ok:'Testé avec 1, 3 et 5 essais. Un compteur qui avance à chaque tour : tu viens d’écrire ton premier compteur, on en reparle à la leçon 3.5.',
      sol:`mdp = input("Mot de passe ? ")
essais = 1
while mdp != "dragon42":
    mdp = input("Mot de passe ? ")
    essais += 1
print(f"Bienvenue après {essais} essais")`, solIn:['abc', '123', 'dragon42'] },
    { t:'code', bug:1, h:'Répare le bug : la boucle sans fin', file:'bug.py',
      p:`<p>Ce compte à rebours ne s'arrête jamais. Exécute-le : Python va l'interrompre au bout de quelques secondes. Lis l'explication, puis répare-le pour qu'il affiche 5, 4, 3, 2, 1 puis <code>Fini</code>.</p>`,
      code:`n = 5
while n > 0:
    print(n)
print("Fini")`,
      hints:['Est-ce que <code>n</code> change dans la boucle ? Si non, <code>n &gt; 0</code> reste vrai pour toujours.','Ajoute <code>n -= 1</code> dans la boucle, décalé comme le <code>print</code>.'],
      check:(r, code) => {
        if (same(code, bugOf('3-1'))) return BUG;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        if (nums(r.out).join() !== '5,4,3,2,1') return 'Il faut afficher 5, 4, 3, 2, 1 : chaque nombre une seule fois, sans 0.';
        if (!/Fini/.test(r.out)) return 'Il manque le <code>Fini</code> à la fin.';
        return true;
      },
      ok:'La règle d’or du <code>while</code> : dans la boucle, quelque chose doit faire avancer la condition vers le faux.',
      sol:`n = 5
while n > 0:
    print(n)
    n -= 1
print("Fini")` }
  ],
  recap:['<code>while condition:</code> répète le bloc tant que la condition est vraie.','Quelque chose doit changer dans la boucle, sinon elle ne s’arrête jamais (boucle infinie, <code>Ctrl + C</code> pour l’arrêter).','Pour suivre une boucle à la main, écris la valeur des variables à chaque tour.','<code>while</code> est idéal pour redemander tant qu’une réponse n’est pas valide.'] };

LES['3-2'] = { title:'La boucle for et range()', dur:'12 min',
  intro:'Quand on sait d’avance combien de fois répéter, il y a plus simple que <code>while</code> : la boucle <code>for</code>. C’est la boucle la plus utilisée en Python.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`x = 10
while x > 4:
    x -= 3
print(x)`,
      opts:[ {l:'7', why:'Après le premier tour, x vaut 7. Mais 7 &gt; 4 est encore vrai : la boucle fait un tour de plus.'},
             {l:'1', why:'Quand x vaut 4, la condition <code>4 &gt; 4</code> est fausse : on ne refait pas de tour.'},
             {l:'4', ok:1},
             {l:'10, 7, 4', why:'Le <code>print</code> n’est pas décalé : il est après la boucle et ne s’exécute qu’une fois.'} ],
      ex:'On teste la condition <strong>avant</strong> chaque tour. 10 &gt; 4 : x devient 7. 7 &gt; 4 : x devient 4. 4 &gt; 4 est faux : on sort, et on affiche 4.' },
    { t:'say', h:'Répéter n fois', file:'for.py',
      p:`<p><code>for i in range(5):</code> répète le bloc 5 fois. À chaque tour, la variable <code>i</code> prend la valeur suivante : 0, puis 1, 2, 3 et 4.</p><p>Comme pour les indices du texte, on commence à <strong>0</strong>. Et on s'arrête <strong>juste avant</strong> 5. Pas besoin d'écrire <code>i += 1</code> : <code>for</code> s'en occupe tout seul, impossible d'oublier.</p>`,
      code:`for i in range(5):
    print("Tour", i)
print("Fini")` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`for i in range(4):
    print(i)`,
      opts:[ {l:'1, 2, 3, 4', why:'<code>range</code> commence à 0, pas à 1.'},
             {l:'0, 1, 2, 3, 4', why:'<code>range(4)</code> s’arrête <strong>avant</strong> 4.'},
             {l:'0, 1, 2, 3', ok:1},
             {l:'4', why:'Le <code>print</code> est dans la boucle : il s’exécute à chaque tour.'} ],
      ex:'<code>range(4)</code> donne 4 valeurs : 0, 1, 2, 3. Le nombre de tours est égal au nombre entre parenthèses.' },
    { t:'say', h:'Choisir le début, la fin et le pas', file:'range.py',
      p:`<p><code>range()</code> accepte jusqu'à trois nombres :</p><ul><li><code>range(fin)</code> : de 0 jusqu'à fin, exclue</li><li><code>range(debut, fin)</code> : de debut jusqu'à fin, exclue</li><li><code>range(debut, fin, pas)</code> : en avançant de pas à chaque fois. Un pas négatif compte à l'envers.</li></ul><p>Le paramètre <code>end=" "</code> de <code>print</code> remplace le retour à la ligne par un espace : tout s'affiche sur une ligne.</p>`,
      code:`for i in range(1, 6):
    print(i, end=" ")
print()
for i in range(0, 21, 5):
    print(i, end=" ")
print()
for i in range(10, 0, -1):
    print(i, end=" ")
print("Bonne année !")` },
    { t:'quiz', h:'Avec un pas', p:`<p>Qu'affiche ce code ?</p>`, snip:`for i in range(2, 10, 3):
    print(i, end=" ")`,
      opts:[ {l:'2 5 8', ok:1},
             {l:'2 5 8 11', why:'11 dépasse la fin (10) : on s’arrête avant.'},
             {l:'2 3 4 5 6 7 8 9', why:'Le troisième nombre est le pas : on avance de 3 en 3.'},
             {l:'3 6 9', why:'On commence au premier nombre, 2.'} ],
      ex:'On part de 2 et on ajoute 3 à chaque fois : 2, 5, 8. Le suivant serait 11, qui dépasse 10.' },
    { t:'say', h:'for ou while ?', file:'choix.py',
      p:`<p>La règle simple :</p><ul><li><strong><code>for</code></strong> quand on sait combien de tours faire : 10 questions, 5 ennemis, les jours d'une semaine.</li><li><strong><code>while</code></strong> quand on attend que quelque chose arrive : le bon mot de passe, la mort du dragon, une note valide.</li></ul><p>Ici, on sait qu'il y a 3 manches : c'est un <code>for</code>.</p>`,
      code:`for manche in range(1, 4):
    print(f"Manche {manche} : combat !")
print("Le tournoi est terminé.")` },
    { t:'code', h:'À toi : la table de multiplication', file:'table.py',
      p:`<p>Affiche la table de multiplication de <code>n</code>, de 1 à 10, sous cette forme :</p><pre class="snippet">7 x 1 = 7
7 x 2 = 14
...
7 x 10 = 70</pre><p>Je testerai aussi avec une autre valeur de <code>n</code>.</p>`,
      code:`n = 7
`,
      hints:['Il faut que i aille de 1 à 10 : <code>for i in range(1, 11):</code>','Dans la boucle : <code>print(f"{n} x {i} = {n * i}")</code>'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/\bfor\b/.test(code)) return 'Utilise une boucle <code>for</code>.';
        for (const n of [7, 3]) {
          const t = await test([], code.replace(/n\s*=\s*\d+/, 'n = ' + n));
          if (t.err) return `Avec n = ${n}, ton code plante : ${esc(t.err.title)}.`;
          const ls = linesOf(t.out);
          const want = Array.from({ length:10 }, (_, k) => `${n} x ${k + 1} = ${n * (k + 1)}`);
          if (ls.length !== 10) return `Avec n = ${n}, il faut exactement 10 lignes, et j’en compte ${ls.length}.${ls[0] && /x 0 =/.test(ls[0]) ? ' Ta table commence à 0 : utilise <code>range(1, 11)</code>.' : ''}`;
          for (let k = 0; k < 10; k++) if (ls[k].replace(/\s+/g, ' ') !== want[k]) return `Avec n = ${n}, la ligne ${k + 1} devrait être <code>${want[k]}</code>, et je lis <code>${esc(ls[k])}</code>.`;
        }
        return true;
      },
      ok:'Testé avec 7 et 3. Deux lignes de code pour dix lignes affichées, et ça marche pour n’importe quel n.',
      sol:`n = 7
for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")` },
    { t:'code', defi:1, h:'Le souffle du dragon', file:'dragon.py',
      p:`<p>Le combat dure 10 tours. Tous les 3 tours (au tour 3, 6 et 9), le dragon crache du feu. Pour chaque tour, affiche :</p><pre class="snippet">Tour 1 : calme
Tour 2 : calme
Tour 3 : le dragon crache du feu !
...</pre>`,
      code:``,
      hints:['Une boucle de 1 à 10 : <code>for tour in range(1, 11):</code>. Pour savoir si un tour est un multiple de 3 : <code>tour % 3 == 0</code>.','Dans la boucle, un <code>if</code>/<code>else</code> : <code>print(f"Tour {tour} : le dragon crache du feu !")</code> ou <code>print(f"Tour {tour} : calme")</code>.'],
      check:r => {
        if (r.err) return ERR;
        const ls = linesOf(r.out);
        if (ls.length !== 10) return `Il faut exactement 10 lignes, une par tour, et j’en compte ${ls.length}.`;
        for (let k = 1; k <= 10; k++) {
          const l = norm(ls[k - 1]), feu = k % 3 === 0;
          if (!new RegExp('tour ' + k + '\\b').test(l)) return `La ligne ${k} doit commencer par <code>Tour ${k}</code>.`;
          if (feu ? !/feu/.test(l) : !/calme/.test(l)) return `Au tour ${k}, il faut ${feu ? 'que le dragon crache du feu' : 'afficher « calme »'}.`;
        }
        return true;
      },
      ok:'Une boucle, une condition et le reste <code>%</code> : à eux trois, ils font tourner la plupart des jeux vidéo.',
      sol:`for tour in range(1, 11):
    if tour % 3 == 0:
        print(f"Tour {tour} : le dragon crache du feu !")
    else:
        print(f"Tour {tour} : calme")` },
    { t:'code', bug:1, h:'Répare le bug : un de trop, un de moins', file:'bug.py',
      p:`<p>Ce code devrait afficher les nombres de 1 à 10. Il ne plante pas, mais il se trompe. Exécute-le, regarde bien le premier et le dernier nombre, puis répare-le.</p>`,
      code:`for i in range(10):
    print(i)`,
      hints:['<code>range(10)</code> commence à 0 et s’arrête à 9.','Donne un début et une fin : <code>range(1, 11)</code>. La fin est toujours exclue.'],
      check:(r, code) => same(code, bugOf('3-2')) ? BUG : r.err ? ERR : nums(r.out).join() === '1,2,3,4,5,6,7,8,9,10' ? true : 'Il faut afficher 1, 2, 3… jusqu’à 10, chaque nombre une seule fois.',
      ok:'Se tromper d’un, au début ou à la fin, a un nom : l’erreur <em>off-by-one</em>. C’est le bug le plus courant des boucles, même chez les pros.',
      sol:`for i in range(1, 11):
    print(i)` }
  ],
  recap:['<code>for i in range(n):</code> répète n fois, avec i = 0, 1, … n-1.','<code>range(debut, fin, pas)</code> : la fin est toujours <strong>exclue</strong>. Un pas négatif compte à l’envers.','<code>for</code> quand on sait combien de tours, <code>while</code> quand on attend un événement.','<code>print(x, end=" ")</code> affiche sans retour à la ligne.','Se tromper d’un tour (off-by-one) est le bug classique des boucles.'] };

LES['3-3'] = { title:'Parcourir un texte', dur:'12 min',
  intro:'<code>for</code> ne sert pas qu’à compter. Il sait parcourir un texte, lettre par lettre. C’est la porte d’entrée vers les mots de passe, les codes secrets et l’analyse de texte.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Combien de fois « Hip » s'affiche-t-il ?</p>`, snip:`for i in range(1, 4):
    print("Hip")
print("Hourra !")`,
      opts:[ {l:'4 fois', why:'<code>range(1, 4)</code> s’arrête avant 4 : i vaut 1, 2, 3.'},
             {l:'1 fois', why:'Le <code>print("Hip")</code> est décalé : il est dans la boucle.'},
             {l:'3 fois', ok:1},
             {l:'2 fois', why:'1, 2 et 3 : ça fait trois tours.'} ],
      ex:'i vaut 1, 2, puis 3. Trois tours, trois « Hip », puis un « Hourra ! ».' },
    { t:'say', h:'Lettre par lettre', file:'lettres.py',
      p:`<p>Donne un texte à <code>for</code>, et la variable prend <strong>chaque caractère</strong>, l'un après l'autre. Pas besoin de <code>range</code> ni d'indice.</p><p>Le nom de la variable est libre. <code>lettre</code> est plus parlant que <code>i</code>.</p>`,
      code:`for lettre in "Pyo":
    print(lettre, "!")` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`for c in "abc":
    print(c * 2)`,
      opts:[ {l:'abcabc', why:'La boucle traite les lettres une par une, et chaque <code>print</code> fait sa ligne.'},
             {l:'aa, bb, cc (une par ligne)', ok:1},
             {l:'a, b, c (une par ligne)', why:'<code>c * 2</code> répète la lettre deux fois.'},
             {l:'Une erreur', why:'Multiplier un texte par un nombre le répète. C’est permis.'} ],
      ex:'c vaut "a", puis "b", puis "c". À chaque tour, on l’affiche répété deux fois.' },
    { t:'say', h:'Est-ce que ça contient… ?', file:'in.py',
      p:`<p>Le mot <code>in</code> a un deuxième usage : <code>"a" in mot</code> vaut <code>True</code> si le texte contient ce morceau. Très pratique dans un <code>if</code>.</p><p>Et si tu as besoin de la position, combine <code>range</code> et <code>len</code> : <code>for i in range(len(mot))</code> donne les indices 0, 1, 2…</p>`,
      code:`mot = "dragon"
print("g" in mot)
print("gon" in mot)
print("z" in mot)
for i in range(len(mot)):
    print(i, mot[i])` },
    { t:'quiz', h:'Majuscule ou pas ?', p:`<p>Qu'affiche ce code ?</p>`, snip:`print("P" in "python")`,
      opts:[ {l:'True', why:'"python" est écrit en minuscules. Pour Python, "P" et "p" sont deux caractères différents.'},
             {l:'False', ok:1},
             {l:'0', why:'<code>in</code> répond par True ou False.'},
             {l:'Une erreur', why:'<code>in</code> marche très bien avec du texte.'} ],
      ex:'Il n’y a pas de P majuscule dans "python". Pour ignorer les majuscules : <code>"p" in mot.lower()</code>.' },
    { t:'say', h:'Fabriquer un nouveau texte', file:'secret.py', mem:1,
      p:`<p>Pour transformer un texte, on part d'un texte <strong>vide</strong> <code>""</code> et on lui ajoute des morceaux à chaque tour avec <code>+=</code>.</p><p>Ici, le langage secret des serpents : chaque voyelle devient un <code>s</code>.</p>`,
      code:`phrase = "bonjour aventurier"
secret = ""
for lettre in phrase:
    if lettre in "aeiouy":
        secret += "s"
    else:
        secret += lettre
print(secret)` },
    { t:'code', h:'À toi : compte les voyelles', file:'voyelles.py', mem:1,
      p:`<p>Compte les voyelles (a, e, i, o, u, y) du texte <code>mot</code> et range le résultat dans une variable <code>nb</code>. Affiche-la.</p><p>Pour "anticonstitutionnellement", il y en a 10. Je testerai avec d'autres mots.</p>`,
      code:`mot = "anticonstitutionnellement"
`,
      hints:['Commence par <code>nb = 0</code> avant la boucle, puis <code>for lettre in mot:</code>.','Dans la boucle : <code>if lettre in "aeiouy":</code> puis <code>nb += 1</code>. Et à la fin, collé à gauche : <code>print(nb)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/\bfor\b/.test(code)) return 'Parcours le mot avec une boucle <code>for</code>.';
        for (const [w, n] of [['anticonstitutionnellement', 10], ['python', 2], ['xyz', 1], ['brr', 0], ['aaaa', 4]]) {
          const t = await test([], code.replace(/mot\s*=\s*(["']).*?\1/, `mot = "${w}"`));
          if (t.err) return `Avec le mot « ${w} », ton code plante : ${esc(t.err.title)}.`;
          const m = memOf(t, 'nb');
          if (!m) return 'Range le résultat dans une variable <code>nb</code>.';
          if (m.repr !== String(n)) return `Avec « ${w} », <code>nb</code> devrait valoir ${n}, et il vaut ${esc(m.repr)}.${m.repr === '1' && n > 1 ? ' Est-ce que <code>nb = 0</code> est bien <strong>avant</strong> la boucle ?' : ''}`;
          if (!nums(t.out).includes(n)) return `Le compte est bon. Affiche <code>nb</code> à la fin, après la boucle.`;
        }
        return true;
      },
      ok:'Testé avec cinq mots, dont un sans voyelle. Ce schéma « compteur à 0, puis +1 dans un if » va te servir partout.',
      sol:`mot = "anticonstitutionnellement"
nb = 0
for lettre in mot:
    if lettre in "aeiouy":
        nb += 1
print(nb)` },
    { t:'code', defi:1, h:'Le miroir', file:'miroir.py', mem:1,
      p:`<p>Construis dans <code>inverse</code> le mot <code>mot</code> écrit à l'envers, avec une boucle <code>for</code>. Pour "python", ça donne "nohtyp". Affiche-le.</p><p>Puis affiche <code>palindrome</code> si le mot se lit pareil dans les deux sens (comme "kayak"), et <code>pas palindrome</code> sinon.</p>`,
      code:`mot = "python"
`,
      hints:['Pars de <code>inverse = ""</code>. L’astuce : ajouter chaque lettre <strong>devant</strong>, avec <code>inverse = lettre + inverse</code>.','Après la boucle : <code>if inverse == mot:</code> pour savoir si c’est un palindrome.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (/\[\s*:\s*:\s*-1\s*\]/.test(code)) return 'Bien vu, <code>[::-1]</code> marche ! Mais ici, entraîne-toi à construire le mot avec une boucle <code>for</code>.';
        if (!/\bfor\b/.test(code)) return 'Construis le mot à l’envers avec une boucle <code>for</code>.';
        for (const w of ['python', 'kayak', 'radar', 'serpent']) {
          const t = await test([], code.replace(/mot\s*=\s*(["']).*?\1/, `mot = "${w}"`));
          if (t.err) return `Avec « ${w} », ton code plante : ${esc(t.err.title)}.`;
          const inv = [...w].reverse().join('');
          if (strOf(memOf(t, 'inverse')) !== inv) return `Avec « ${w} », <code>inverse</code> devrait contenir « ${inv} ».`;
          if (!t.out.includes(inv)) return `Affiche aussi le mot à l’envers.`;
          const pal = inv === w, o = norm(t.out);
          if (pal ? (!/palindrome/.test(o) || /pas palindrome/.test(o)) : !/pas palindrome/.test(o)) return `« ${w} » ${pal ? 'est' : 'n’est pas'} un palindrome : il faut afficher « ${pal ? 'palindrome' : 'pas palindrome'} ».`;
        }
        return true;
      },
      ok:'Testé avec python, kayak, radar et serpent. Ajouter devant au lieu de derrière : une petite astuce qui retourne tout.',
      sol:`mot = "python"
inverse = ""
for lettre in mot:
    inverse = lettre + inverse
print(inverse)
if inverse == mot:
    print("palindrome")
else:
    print("pas palindrome")` },
    { t:'code', bug:1, h:'Répare le bug : la lettre en trop', file:'bug.py',
      p:`<p>Ce code devrait afficher chaque lettre avec sa position, en comptant à partir de 1 (<code>1 P</code>, <code>2 y</code>…). Il plante. Exécute-le, lis l'explication, puis répare-le.</p>`,
      code:`mot = "Python"
for i in range(len(mot) + 1):
    print(i + 1, mot[i])`,
      hints:['<code>len(mot)</code> vaut 6, donc les indices valides vont de 0 à 5. Avec <code>+ 1</code>, la boucle essaie aussi l’indice 6.','Enlève le <code>+ 1</code> dans le <code>range</code>. Le <code>i + 1</code> dans le <code>print</code>, lui, est juste.'],
      check:(r, code) => {
        if (same(code, bugOf('3-3'))) return BUG;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        const ls = linesOf(r.out).map(l => l.replace(/\s+/g, ' '));
        return ls.join('|') === '1 P|2 y|3 t|4 h|5 o|6 n' ? true : 'Il faut 6 lignes : <code>1 P</code>, <code>2 y</code>… jusqu’à <code>6 n</code>.';
      },
      ok:'L’<code>IndexError</code> veut dire : tu as demandé une position qui n’existe pas. Le dernier indice d’un texte, c’est toujours <code>len(mot) - 1</code>.',
      sol:`mot = "Python"
for i in range(len(mot)):
    print(i + 1, mot[i])` }
  ],
  recap:['<code>for lettre in texte:</code> parcourt le texte caractère par caractère.','<code>"a" in texte</code> vaut <code>True</code> si le texte contient "a" (majuscules comprises).','<code>for i in range(len(texte)):</code> donne les indices, de 0 à <code>len(texte) - 1</code>.','Pour fabriquer un texte : partir de <code>""</code> et ajouter avec <code>+=</code>.'] };

LES['3-4'] = { title:'break et continue', dur:'12 min',
  intro:'Parfois, on veut sortir d’une boucle avant la fin, ou sauter un tour. Deux petits mots s’en chargent : <code>break</code> et <code>continue</code>.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`nb = 0
for c in "banane":
    if c == "a":
        nb += 1
print(nb)`,
      opts:[ {l:'1', why:'La boucle continue après le premier "a" : elle regarde toutes les lettres.'},
             {l:'6', why:'On n’ajoute 1 que si la lettre est un "a".'},
             {l:'3', why:'Compte bien : b-a-n-a-n-e. Il y a deux "a".'},
             {l:'2', ok:1} ],
      ex:'b, <strong>a</strong>, n, <strong>a</strong>, n, e : deux "a".' },
    { t:'say', h:'break : sortir tout de suite', file:'break.py',
      p:`<p><code>break</code> arrête la boucle immédiatement. Python saute à la première ligne après la boucle.</p><p>C'est utile pour <strong>chercher</strong> : dès qu'on a trouvé, inutile de continuer. Ici, on cherche le premier multiple de 7 à partir de 50.</p>`,
      code:`for n in range(50, 100):
    if n % 7 == 0:
        print("Trouvé :", n)
        break
    print(n, "non")
print("Recherche terminée")` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`for i in range(10):
    if i == 3:
        break
    print(i)`,
      opts:[ {l:'0, 1, 2, 3', why:'Quand i vaut 3, le <code>break</code> arrête tout <strong>avant</strong> le <code>print</code>.'},
             {l:'0, 1, 2', ok:1},
             {l:'0 à 9 sauf 3', why:'Ça, ce serait <code>continue</code>. <code>break</code> arrête la boucle pour de bon.'},
             {l:'3', why:'Les tours 0, 1 et 2 ont lieu avant le <code>break</code>.'} ],
      ex:'Les tours 0, 1 et 2 affichent leur nombre. Au tour 3, <code>break</code> : on sort, le <code>print</code> n’est jamais atteint.' },
    { t:'say', h:'continue : passer au tour suivant', file:'continue.py',
      p:`<p><code>continue</code> abandonne <strong>le tour en cours</strong> et passe directement au suivant. La boucle, elle, continue.</p><p>Ici, on saute les nombres pairs.</p>`,
      code:`for i in range(1, 10):
    if i % 2 == 0:
        continue
    print(i, "est impair")` },
    { t:'quiz', h:'Et avec continue ?', p:`<p>Qu'affiche ce code ?</p>`, snip:`for i in range(5):
    if i == 2:
        continue
    print(i)`,
      opts:[ {l:'0, 1', why:'<code>continue</code> ne sort pas de la boucle : il saute seulement le tour 2.'},
             {l:'0, 1, 2, 3, 4', why:'Au tour 2, le <code>continue</code> saute le <code>print</code>.'},
             {l:'0, 1, 3, 4', ok:1},
             {l:'2', why:'C’est le seul nombre qui n’est <strong>pas</strong> affiché.'} ],
      ex:'Seul le tour 2 est sauté. <code>break</code> = on sort de la boucle. <code>continue</code> = on passe au tour suivant.' },
    { t:'say', h:'La boucle du jeu', file:'menu.py', solIn:['nord', 'sud', 'quitter'],
      p:`<p>Un grand classique : <code>while True:</code>, une boucle qui tourne pour toujours… jusqu'à ce qu'un <code>break</code> l'arrête. C'est la boucle principale de presque tous les jeux et menus.</p><p>Exécute, donne quelques directions, puis tape <code>quitter</code>.</p>`,
      code:`while True:
    choix = input("Où vas-tu ? ")
    if choix == "quitter":
        break
    print(f"Tu marches vers le {choix}.")
print("À bientôt, aventurier !")` },
    { t:'code', h:'À toi : sauter les multiples de 3', file:'saut.py',
      p:`<p>Affiche les nombres de 1 à 20, <strong>sauf</strong> les multiples de 3. Utilise <code>continue</code>.</p>`,
      code:``,
      hints:['Une boucle <code>for n in range(1, 21):</code>. Un multiple de 3, c’est <code>n % 3 == 0</code>.','Dans la boucle : <code>if n % 3 == 0:</code> puis <code>continue</code>. Et ensuite, au niveau du <code>if</code> : <code>print(n)</code>.'],
      check:(r, code) => {
        if (r.err) return ERR;
        if (!/\bcontinue\b/.test(code)) return 'Utilise <code>continue</code> pour sauter les multiples de 3.';
        const want = Array.from({ length:20 }, (_, k) => k + 1).filter(n => n % 3);
        const got = nums(r.out);
        return got.join() === want.join() ? true : got.includes(3) || got.includes(6) ? 'Les multiples de 3 (3, 6, 9…) ne doivent pas s’afficher.' : got.includes(20) && got[0] === 1 ? 'Presque. Il faut tous les nombres de 1 à 20 sauf 3, 6, 9, 12, 15 et 18.' : 'Il faut afficher les nombres de 1 à 20, un par ligne, sauf les multiples de 3.';
      },
      ok:'On aurait pu écrire <code>if n % 3 != 0: print(n)</code>. <code>continue</code> devient vraiment pratique quand le reste du tour est long : on écarte le cas tout de suite, sans tout décaler.',
      sol:`for n in range(1, 21):
    if n % 3 == 0:
        continue
    print(n)` },
    { t:'code', defi:1, h:'Le coffre-fort', file:'coffre.py',
      p:`<p>Le coffre s'ouvre avec le code <code>1234</code>, et on n'a que <strong>3 essais</strong>. Demande le code au plus 3 fois. Dès qu'il est bon, affiche <code>Le coffre s'ouvre !</code> et arrête de demander. Après 3 erreurs, affiche <code>Alarme !</code></p>`,
      code:``,
      hints:['Une boucle <code>for essai in range(3):</code>, avec un <code>break</code> quand le code est bon. Pour savoir après la boucle si on a trouvé, utilise une variable <code>ouvert = False</code> créée avant.','Dans la boucle : <code>if code == "1234":</code> → <code>print(...)</code>, <code>ouvert = True</code>, <code>break</code>. Après la boucle : <code>if not ouvert:</code> → <code>print("Alarme !")</code>.'],
      check:async (r, code, test) => {
        if (nInputs(code) < 1) return 'Il faut demander le code avec <code>input()</code>.';
        if (!/\bbreak\b/.test(code)) return 'Utilise <code>break</code> pour arrêter de demander dès que le code est bon.';
        const tries = [[['1234'], 'ouvre'], [['0000', '1234', '5555'], 'ouvre'], [['1', '2', '1234'], 'ouvre'], [['1', '2', '3'], 'alarme'], [['1', '2', '3', '1234'], 'alarme']];
        for (const [ins, w] of tries) {
          const t = await test(ins);
          if (t.err) return `${quoted(ins)}, ton code plante : ${esc(t.err.title)}.`;
          const o = norm(t.out);
          if (w === 'ouvre' && (!/ouvre/.test(o) || /alarme/.test(o))) return `${quoted(ins.filter(v => v !== '5555'))}, le coffre devrait s’ouvrir, sans alarme.`;
          if (w === 'alarme' && (!/alarme/.test(o) || /ouvre/.test(o))) return `${quoted(ins.slice(0, 3))}, il faut déclencher l’alarme${ins.length > 3 ? ', et ne pas demander de 4e essai' : ''}.`;
          if (/5555/.test(t.out)) return 'Une fois le bon code trouvé, il faut arrêter de demander : utilise <code>break</code>.';
        }
        return true;
      },
      ok:'Testé avec 1, 2 et 3 essais, et avec 3 erreurs. Le drapeau <code>ouvert</code> qui se souvient de ce qui s’est passé dans la boucle : un réflexe très utile.',
      sol:`ouvert = False
for essai in range(3):
    code = input("Code ? ")
    if code == "1234":
        print("Le coffre s'ouvre !")
        ouvert = True
        break
if not ouvert:
    print("Alarme !")`, solIn:['0000', '1234'] },
    { t:'code', bug:1, h:'Répare le bug : le break trop pressé', file:'bug.py',
      p:`<p>Ce code cherche le premier multiple de 6 entre 1 et 20. Il ne plante pas, mais il n'affiche rien. Exécute-le, puis répare-le pour qu'il affiche <code>Premier multiple de 6 : 6</code>.</p>`,
      code:`for n in range(1, 21):
    if n % 6 == 0:
        print("Premier multiple de 6 :", n)
    break`,
      hints:['Le <code>break</code> est décalé comme le <code>if</code>, pas comme le <code>print</code>. Il s’exécute donc dès le premier tour, quoi qu’il arrive.','Décale le <code>break</code> de 4 espaces de plus, pour qu’il soit dans le bloc du <code>if</code>.'],
      check:(r, code) => {
        if (same(code, bugOf('3-4'))) return BUG;
        if (r.err) return ERR;
        if (!/\bbreak\b/.test(code)) return 'Garde le <code>break</code> : on veut seulement le premier multiple.';
        const ls = linesOf(r.out);
        return ls.length === 1 && /6\s*$/.test(ls[0]) && /multiple/i.test(ls[0]) ? true : 'Il faut afficher une seule ligne : <code>Premier multiple de 6 : 6</code>.';
      },
      ok:'Un <code>break</code> mal décalé arrête la boucle au premier tour. L’indentation décide de tout, encore une fois.',
      sol:`for n in range(1, 21):
    if n % 6 == 0:
        print("Premier multiple de 6 :", n)
        break` }
  ],
  recap:['<code>break</code> arrête la boucle tout de suite.','<code>continue</code> saute la fin du tour en cours et passe au suivant.','<code>while True:</code> + <code>break</code> : la boucle principale d’un jeu ou d’un menu.','Un drapeau (<code>trouve = False</code>, puis <code>True</code>) garde la trace de ce qui s’est passé dans la boucle.'] };

LES['3-5'] = { title:'Compteurs et accumulateurs', dur:'12 min',
  intro:'Compter des voyelles, additionner des prix, trouver le meilleur score : derrière tout ça, il y a deux schémas qui reviennent sans cesse. Une fois qu’on les connaît, on les voit partout.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`for i in range(1, 6):
    if i == 4:
        break
    if i == 2:
        continue
    print(i)`,
      opts:[ {l:'1, 3', ok:1},
             {l:'1, 3, 5', why:'Au tour 4, le <code>break</code> arrête toute la boucle : 5 n’est jamais atteint.'},
             {l:'1, 2, 3', why:'Au tour 2, le <code>continue</code> saute le <code>print</code>.'},
             {l:'1', why:'Après le <code>continue</code> du tour 2, la boucle reprend au tour 3.'} ],
      ex:'1 s’affiche. 2 est sauté (<code>continue</code>). 3 s’affiche. À 4, <code>break</code> : fin.' },
    { t:'say', h:'Le compteur', file:'compteur.py', mem:1,
      p:`<p>Un <strong>compteur</strong> compte combien de fois quelque chose arrive. Toujours la même recette :</p><ol><li>créer la variable à 0, <strong>avant</strong> la boucle</li><li>ajouter 1 dans la boucle, quand ça arrive</li><li>l'utiliser <strong>après</strong> la boucle</li></ol>`,
      code:`phrase = "le serpent siffle sur les sentiers"
nb_s = 0
for lettre in phrase:
    if lettre == "s":
        nb_s += 1
print(f"Il y a {nb_s} lettres s.")` },
    { t:'say', h:'L’accumulateur', file:'somme.py', mem:1,
      p:`<p>Un <strong>accumulateur</strong> fait la même chose, mais au lieu d'ajouter 1, il ajoute une valeur : un prix, des points, des dégâts. Même recette : 0 avant, <code>+=</code> dedans, résultat après.</p><p>On raconte qu'à 9 ans, le mathématicien Gauss a calculé de tête la somme de 1 à 100. Python, lui, fait une boucle.</p>`,
      code:`total = 0
for n in range(1, 101):
    total += n
print("Somme de 1 à 100 :", total)` },
    { t:'quiz', h:'Où mettre le zéro ?', p:`<p>Qu'affiche ce code ?</p>`, snip:`for n in range(1, 4):
    total = 0
    total += n
print(total)`,
      opts:[ {l:'6', why:'Ce serait le cas avec <code>total = 0</code> avant la boucle. Ici, total est remis à 0 à chaque tour.'},
             {l:'0', why:'Après la remise à 0, on ajoute n : total ne vaut pas 0 à la fin.'},
             {l:'3', ok:1},
             {l:'Une erreur', why:'Le code est valide, il est juste faux.'} ],
      ex:'À chaque tour, total repart de 0 puis reçoit n. Au dernier tour, n vaut 3, donc total vaut 3. L’initialisation se met <strong>avant</strong> la boucle.' },
    { t:'say', h:'Le record', file:'record.py', mem:1, solIn:['12', '30', '7', '25'],
      p:`<p>Troisième schéma : chercher le <strong>maximum</strong>. On garde le meilleur résultat vu jusqu'ici dans une variable, et on le remplace chaque fois qu'on trouve mieux.</p><p>Ici, on additionne aussi les dégâts de 4 attaques et on calcule la moyenne. Exécute et tape 4 nombres.</p>`,
      code:`total = 0
record = 0
for attaque in range(1, 5):
    degats = int(input(f"Dégâts de l'attaque {attaque} ? "))
    total += degats
    if degats > record:
        record = degats
print(f"Total : {total}, record : {record}, moyenne : {total / 4}")` },
    { t:'code', h:'À toi : la somme de 1 à n', file:'somme_n.py', mem:1,
      p:`<p>Calcule la somme 1 + 2 + … + n dans une variable <code>total</code>, avec une boucle, puis affiche-la. Pour n = 10, ça fait 55.</p><p>Je testerai avec n = 100 et n = 1.</p>`,
      code:`n = 10
`,
      hints:['<code>total = 0</code> avant la boucle, puis <code>for i in range(1, n + 1):</code>. Attention, la fin est exclue.','Dans la boucle : <code>total += i</code>. Après : <code>print(total)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/\b(for|while)\b/.test(code)) return 'Utilise une boucle pour additionner.';
        for (const [n, s] of [[10, 55], [100, 5050], [1, 1]]) {
          const t = await test([], code.replace(/n\s*=\s*\d+/, 'n = ' + n));
          if (t.err) return `Avec n = ${n}, ton code plante : ${esc(t.err.title)}.`;
          const m = memOf(t, 'total');
          if (!m) return 'Range la somme dans une variable <code>total</code>.';
          if (m.repr !== String(s)) return `Avec n = ${n}, <code>total</code> devrait valoir ${s}, et il vaut ${esc(m.repr)}.${m.repr === String(s - n) ? ' Il manque le dernier nombre : <code>range(1, n + 1)</code>, car la fin est exclue.' : ''}`;
          if (!nums(t.out).includes(s)) return 'Le calcul est bon. Affiche <code>total</code> à la fin.';
        }
        return true;
      },
      ok:'Testé avec 10, 100 et 1. Le piège du <code>n + 1</code> dans le <code>range</code> : tu l’as évité.',
      sol:`n = 10
total = 0
for i in range(1, n + 1):
    total += i
print(total)` },
    { t:'code', defi:1, h:'La moyenne, jusqu’à « fin »', file:'moyenne.py',
      p:`<p>Demande des notes à l'utilisateur, une par une, <strong>jusqu'à ce qu'il tape</strong> <code>fin</code>. Ensuite, affiche le nombre de notes et la moyenne : <code>3 notes, moyenne 13.5</code>.</p><p>Et si on tape <code>fin</code> tout de suite ? Pas de division par zéro : affiche <code>Aucune note</code>.</p>`,
      code:``,
      hints:['Un compteur <code>nb = 0</code> et un accumulateur <code>total = 0</code> avant une boucle <code>while True:</code>. Dans la boucle : <code>rep = input("Note ? ")</code>, et <code>if rep == "fin": break</code>.','Après le test : <code>total += float(rep)</code> et <code>nb += 1</code>. Après la boucle : <code>if nb == 0:</code> → « Aucune note », <code>else:</code> → <code>print(f"{nb} notes, moyenne {total / nb}")</code>.'],
      check:async (r, code, test) => {
        if (nInputs(code) < 1) return 'Il faut demander les notes avec <code>input()</code>.';
        for (const [ins, n, m] of [[['12', '15', 'fin'], 2, 13.5], [['10', '20', '15', '5', 'fin'], 4, 12.5], [['14.5', 'fin'], 1, 14.5]]) {
          const t = await test(ins);
          if (t.err) return `${quoted(ins)}, ton code plante : ${esc(t.err.title)}.${/ValueError/.test(t.err.raw) ? ' Teste « fin » <strong>avant</strong> de convertir la réponse en nombre.' : ''}`;
          const o = tail(t, ins);
          const vals = (o.match(/-?\d+(\.\d+)?/g) || []).map(Number);
          if (!vals.includes(n)) return `${quoted(ins)}, il y a ${n} note${n > 1 ? 's' : ''} : je ne vois pas ce nombre dans le résultat.`;
          if (!vals.some(v => Math.abs(v - m) < 0.01)) return `${quoted(ins)}, la moyenne devrait être ${m}.`;
        }
        const t0 = await test(['fin']);
        if (t0.err) return `Quand je tape « fin » tout de suite, ton code plante : ${esc(t0.err.title)}. Vérifie qu’il y a au moins une note avant de diviser.`;
        if (!/aucune/i.test(t0.out)) return 'Quand je tape « fin » tout de suite, il faut afficher « Aucune note ».';
        return true;
      },
      ok:'Compteur, accumulateur, <code>while True</code>, <code>break</code> et un garde-fou contre la division par zéro : c’est un vrai programme de pro.',
      sol:`nb = 0
total = 0
while True:
    rep = input("Note ? ")
    if rep == "fin":
        break
    total += float(rep)
    nb += 1
if nb == 0:
    print("Aucune note")
else:
    print(f"{nb} notes, moyenne {total / nb}")`, solIn:['12', '15', 'fin'] },
    { t:'code', bug:1, h:'Répare le bug : le ticket de caisse', file:'bug.py',
      p:`<p>Ce programme additionne le prix de 3 articles. Mais le total est faux : il n'affiche que le dernier prix. Exécute-le avec 2.5, 4 et 3.5, puis répare-le.</p>`,
      code:`for i in range(3):
    total = 0
    prix = float(input("Prix ? "))
    total += prix
print(f"Total : {total} €")`,
      hints:['Où est créé <code>total = 0</code> ? Combien de fois cette ligne s’exécute-t-elle ?','Sors <code>total = 0</code> de la boucle : place-le tout en haut, collé à gauche.'],
      check:async (r, code, test) => {
        if (same(code, bugOf('3-5'))) return BUG;
        const t = await test(['2.5', '4', '3.5']);
        if (t.err) return `Quand je réponds 2.5, 4 et 3.5, ton code plante : ${esc(t.err.title)}.`;
        if (!/10(\.0)?\s*€/.test(t.out)) return 'Avec 2.5, 4 et 3.5, le total devrait être 10.0 €.';
        const t2 = await test(['1', '1', '1']);
        return /3(\.0)?\s*€/.test(t2.out) ? true : 'Avec 1, 1 et 1, le total devrait être 3.0 €.';
      },
      ok:'L’initialisation dans la boucle est un bug très fréquent. Ta nouvelle question réflexe : « cette ligne doit-elle s’exécuter une fois, ou à chaque tour ? »',
      sol:`total = 0
for i in range(3):
    prix = float(input("Prix ? "))
    total += prix
print(f"Total : {total} €")`, solIn:['2.5', '4', '3.5'] }
  ],
  recap:['Compteur : <code>nb = 0</code> avant la boucle, <code>nb += 1</code> dedans, résultat après.','Accumulateur : pareil, mais avec <code>total += valeur</code>.','Maximum : <code>if x &gt; record: record = x</code>.','L’initialisation à 0 se met <strong>avant</strong> la boucle, jamais dedans.','Avant de diviser par un compteur, vérifie qu’il n’est pas à 0.'] };

LES['3-6'] = { title:'Boucles imbriquées', dur:'12 min',
  intro:'Une boucle peut en contenir une autre. C’est ce qu’il faut pour les grilles, les plateaux de jeu, les tableaux et toutes les combinaisons possibles.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`nb = 0
for n in range(10):
    if n % 2 == 0:
        nb += 1
print(nb)`,
      opts:[ {l:'10', why:'On n’ajoute 1 que pour les nombres pairs.'},
             {l:'5', ok:1},
             {l:'4', why:'0 est pair aussi : 0, 2, 4, 6, 8.'},
             {l:'0, 2, 4, 6, 8', why:'Le <code>print</code> est après la boucle : il affiche juste le compteur.'} ],
      ex:'Les pairs de 0 à 9 : 0, 2, 4, 6 et 8. Cinq nombres.' },
    { t:'say', h:'Une boucle dans une boucle', file:'grille.py',
      p:`<p>Pour chaque tour de la boucle extérieure, la boucle intérieure fait <strong>tous</strong> ses tours. Comme une horloge : pour chaque heure, l'aiguille des minutes fait le tour complet.</p><p>Ici, 3 lignes de 5 étoiles. <code>end=""</code> évite le retour à la ligne, et le <code>print()</code> vide, placé dans la grande boucle, termine chaque ligne.</p>`,
      code:`for ligne in range(3):
    for colonne in range(5):
        print("*", end="")
    print()` },
    { t:'quiz', h:'Combien de fois ?', p:`<p>Combien de fois « x » s'affiche-t-il ?</p>`, snip:`for i in range(3):
    for j in range(4):
        print("x")`,
      opts:[ {l:'7', why:'On n’additionne pas les tours : pour <strong>chacun</strong> des 3 tours, la boucle intérieure en fait 4.'},
             {l:'4', why:'La boucle intérieure recommence à chaque tour de la boucle extérieure.'},
             {l:'3', why:'Le <code>print</code> est dans la boucle intérieure.'},
             {l:'12', ok:1} ],
      ex:'3 fois 4 = 12. Le nombre total de tours, c’est le produit des deux.' },
    { t:'say', h:'Toutes les combinaisons', file:'combos.py',
      p:`<p>Les boucles imbriquées servent souvent à essayer <strong>toutes les combinaisons</strong>. Ici, les tenues possibles du héros : chaque arme avec chaque armure.</p>`,
      code:`for arme in ["épée", "arc", "bâton"]:
    for armure in ["cuir", "acier"]:
        print(f"{arme} + {armure}")` },
    { t:'quiz', h:'Dans quel ordre ?', p:`<p>Quelle est la <strong>4e ligne</strong> affichée ?</p>`, snip:`for i in range(2):
    for j in range(3):
        print(i, j)`,
      opts:[ {l:'0 3', why:'j ne va que de 0 à 2.'},
             {l:'1 0', ok:1},
             {l:'1 1', why:'Les 3 premières lignes sont 0 0, 0 1, 0 2. La 4e est donc la première avec i = 1.'},
             {l:'0 1', why:'Ça, c’est la 2e ligne.'} ],
      ex:'0 0, 0 1, 0 2, puis i passe à 1 et j repart de 0 : <strong>1 0</strong>. C’est la boucle intérieure qui tourne le plus vite.' },
    { t:'code', h:'À toi : les lancers de dés', file:'des.py',
      p:`<p>On lance deux dés à 6 faces. Affiche toutes les façons d'obtenir un total de 7 (par exemple <code>1 6</code>, <code>2 5</code>…), une par ligne. Puis affiche combien il y en a.</p>`,
      code:``,
      hints:['Deux boucles : <code>for d1 in range(1, 7):</code> et, dedans, <code>for d2 in range(1, 7):</code>.','Dans la boucle intérieure : <code>if d1 + d2 == 7:</code> → afficher <code>d1, d2</code> et ajouter 1 à un compteur créé avant les boucles.'],
      check:r => {
        if (r.err) return ERR;
        const ls = linesOf(r.out);
        const pairs = ls.map(l => nums(l)).filter(n => n.length === 2);
        const want = ['1,6', '2,5', '3,4', '4,3', '5,2', '6,1'];
        const got = pairs.map(p => p.join());
        for (const w of want) if (!got.includes(w)) return `Il manque la combinaison <code>${w.replace(',', ' ')}</code>.`;
        if (pairs.some(p => p[0] + p[1] !== 7)) return 'Certaines lignes affichées ne font pas 7.';
        if (got.length !== 6) return 'Chaque combinaison doit apparaître une seule fois.';
        if (!ls.some(l => nums(l).length === 1 && nums(l)[0] === 6)) return 'Les combinaisons sont bonnes. Affiche aussi le nombre total : 6.';
        return true;
      },
      ok:'6 combinaisons sur 36 : c’est pour ça que 7 est le total le plus fréquent avec deux dés.',
      sol:`nb = 0
for d1 in range(1, 7):
    for d2 in range(1, 7):
        if d1 + d2 == 7:
            print(d1, d2)
            nb += 1
print(nb)` },
    { t:'code', defi:1, h:'Le plateau de jeu', file:'plateau.py',
      p:`<p>Affiche les cases d'un plateau. Les lignes sont nommées par les lettres de <code>lignes</code>, les colonnes vont de 1 à <code>nb_col</code>. Pour "ABC" et 4 colonnes :</p><pre class="snippet">A1 A2 A3 A4
B1 B2 B3 B4
C1 C2 C3 C4</pre><p>Je testerai aussi avec d'autres valeurs.</p>`,
      code:`lignes = "ABC"
nb_col = 4
`,
      hints:['La grande boucle parcourt les lettres : <code>for l in lignes:</code>. La petite boucle les colonnes : <code>for c in range(1, nb_col + 1):</code>.','Dans la petite : <code>print(f"{l}{c}", end=" ")</code>. Après la petite boucle (dans la grande) : <code>print()</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        for (const [L, n] of [['ABC', 4], ['XY', 2], ['ABCDE', 5]]) {
          const t = await test([], code.replace(/lignes\s*=\s*(["']).*?\1/, `lignes = "${L}"`).replace(/nb_col\s*=\s*\d+/, 'nb_col = ' + n));
          if (t.err) return `Avec "${L}" et ${n} colonnes, ton code plante : ${esc(t.err.title)}.`;
          const ls = linesOf(t.out).map(l => l.replace(/\s+/g, ' '));
          const want = [...L].map(c => Array.from({ length:n }, (_, k) => c + (k + 1)).join(' '));
          if (ls.join('|') !== want.join('|')) return `Avec "${L}" et ${n} colonnes, il faudrait :<br><code>${want.join('<br>')}</code><br>Et j’obtiens :<br><code>${ls.map(esc).join('<br>') || '(rien)'}</code>`;
        }
        return true;
      },
      ok:'Testé avec trois plateaux. Une grille, c’est toujours deux boucles : une pour les lignes, une pour les colonnes.',
      sol:`lignes = "ABC"
nb_col = 4
for l in lignes:
    for c in range(1, nb_col + 1):
        print(f"{l}{c}", end=" ")
    print()` },
    { t:'code', bug:1, h:'Répare le bug : le rectangle effondré', file:'bug.py',
      p:`<p>Ce code devrait dessiner 3 lignes de 4 dièses (<code>####</code>). Mais toutes les dièses tombent les unes sous les autres. Exécute-le, puis répare-le.</p>`,
      code:`for ligne in range(3):
    for col in range(4):
        print("#", end="")
        print()`,
      hints:['Le <code>print()</code> qui va à la ligne est dans la petite boucle : il s’exécute après chaque dièse.','Il doit s’exécuter une fois par ligne : décale-le au niveau de <code>for col</code>, dans la grande boucle seulement.'],
      check:(r, code) => {
        if (same(code, bugOf('3-6'))) return BUG;
        if (r.err) return ERR;
        return linesOf(r.out).join('|') === '####|####|####' ? true : 'Il faut exactement 3 lignes de <code>####</code>.';
      },
      ok:'Dans les boucles imbriquées, chaque ligne a trois places possibles : dans la petite boucle, dans la grande, ou après les deux. L’indentation choisit.',
      sol:`for ligne in range(3):
    for col in range(4):
        print("#", end="")
    print()` }
  ],
  recap:['Pour chaque tour de la boucle extérieure, la boucle intérieure fait tous ses tours.','Nombre total de tours = tours extérieurs × tours intérieurs.','C’est la boucle intérieure qui tourne le plus vite.','Grilles, plateaux, tableaux, combinaisons : deux boucles imbriquées.','<code>print(x, end="")</code> pour rester sur la ligne, <code>print()</code> pour passer à la suivante.'] };

/* Le projet : chaque étape reprend la précédente (carry). */
const M1 = `import random
secret = random.randint(1, 100)
essai = int(input("Ton nombre ? "))
while essai != secret:
    essai = int(input("Ton nombre ? "))
print("Gagné !")`;
const M2 = `import random
secret = random.randint(1, 100)
essai = int(input("Ton nombre ? "))
while essai != secret:
    if essai < secret:
        print("C'est plus !")
    else:
        print("C'est moins !")
    essai = int(input("Ton nombre ? "))
print("Gagné !")`;
const M3 = `import random
secret = random.randint(1, 100)
essai = int(input("Ton nombre ? "))
nb = 1
while essai != secret:
    if essai < secret:
        print("C'est plus !")
    else:
        print("C'est moins !")
    essai = int(input("Ton nombre ? "))
    nb += 1
print(f"Gagné en {nb} essais !")`;
const M4 = `import random
secret = random.randint(1, 100)
nb = 0
gagne = False
while nb < 7:
    essai = int(input("Ton nombre ? "))
    nb += 1
    if essai == secret:
        gagne = True
        break
    elif essai < secret:
        print("C'est plus !")
    else:
        print("C'est moins !")
if gagne:
    print(f"Gagné en {nb} essais !")
else:
    print(f"Perdu ! Le nombre était {secret}.")`;
// Remplace le tirage au hasard par un nombre fixe, pour que la correction ne dépende pas du hasard.
const fixe = (code, n) => code.replace(/(random\.)?randint\s*\(\s*1\s*,\s*100\s*\)/, String(n));
const hasRand = code => /randint\s*\(\s*1\s*,\s*100\s*\)/.test(strip(code));

LES['3-7'] = { title:'Projet : le jeu du nombre mystère', dur:'15 min',
  intro:'Le grand classique de tous les débutants, et pour une bonne raison : il utilise tout ce que tu viens d’apprendre. L’ordinateur choisit un nombre au hasard, et tu dois le deviner.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Combien de lignes ce code affiche-t-il ?</p>`, snip:`for i in range(4):
    for j in range(2):
        print("*", end="")
    print()`,
      opts:[ {l:'8', why:'Les 8 étoiles sont sur les mêmes lignes grâce à <code>end=""</code>. Seul le <code>print()</code> vide passe à la ligne.'},
             {l:'2', why:'Le <code>print()</code> vide est dans la grande boucle, qui fait 4 tours.'},
             {l:'4', ok:1},
             {l:'1', why:'Le <code>print()</code> vide est décalé : il est dans la grande boucle, pas après.'} ],
      ex:'4 lignes de 2 étoiles. Le <code>print()</code> vide s’exécute une fois par tour de la grande boucle.' },
    { t:'say', h:'Le hasard en Python', file:'hasard.py',
      p:`<p>Python sait tirer des nombres au hasard grâce au module <code>random</code>. On l'importe une fois en haut du fichier avec <code>import random</code>.</p><p><code>random.randint(1, 6)</code> donne un entier au hasard entre 1 et 6, <strong>les deux compris</strong> (contrairement à <code>range</code>). Exécute plusieurs fois : le résultat change.</p>`,
      code:`import random
de = random.randint(1, 6)
print("Le dé tombe sur", de)
for i in range(5):
    print(random.randint(1, 100), end=" ")` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Quelles valeurs peut donner ce code ?</p>`, snip:`import random
print(random.randint(1, 3))`,
      opts:[ {l:'1 ou 2', why:'Contrairement à <code>range(1, 3)</code>, <code>randint</code> inclut la borne de fin.'},
             {l:'0, 1, 2 ou 3', why:'On part de la première borne : 1. Le 0 n’est pas possible.'},
             {l:'1, 2 ou 3', ok:1},
             {l:'Un nombre à virgule entre 1 et 3', why:'<code>randint</code> donne toujours un entier (<em>int</em>).'} ],
      ex:'<code>randint(1, 3)</code> donne 1, 2 ou 3 : les deux bornes sont comprises. C’est l’inverse de <code>range</code>, et c’est un piège classique.' },
    { t:'say', h:'Le projet',
      p:`<p>L'ordinateur choisit un nombre secret entre 1 et 100. Le joueur propose des nombres, et l'ordinateur répond « plus » ou « moins », jusqu'à ce qu'il trouve.</p>`,
      snip:`Ton nombre ? 50
C'est moins !
Ton nombre ? 25
C'est plus !
Ton nombre ? 37
Gagné en 3 essais !`,
      p2:`<p>On le construit en quatre étapes. Pour te corriger, je remplacerai ton tirage au hasard par un nombre que je connais, comme ça je pourrai vérifier tes réponses. Alors garde bien <code>random.randint(1, 100)</code> dans ton code.</p>` },
    { t:'code', h:'Étape 1 : deviner jusqu’à trouver', file:'mystere.py',
      p:`<p>Importe <code>random</code>, tire le <code>secret</code> entre 1 et 100, puis demande un nombre au joueur. <strong>Tant que</strong> ce n'est pas le bon, redemande. À la fin, affiche <code>Gagné !</code></p>`,
      code:`# Étape 1
`,
      hints:['En haut : <code>import random</code> puis <code>secret = random.randint(1, 100)</code>. Ensuite, une première question : <code>essai = int(input("Ton nombre ? "))</code>.','<code>while essai != secret:</code> et dans la boucle, la même question. Après la boucle : <code>print("Gagné !")</code>.'],
      check:async (r, code, test) => {
        if (!hasRand(code)) return 'Tire le nombre secret avec <code>random.randint(1, 100)</code>.';
        if (!/\bwhile\b/.test(code)) return 'Il faut une boucle <code>while</code> pour redemander.';
        for (const ins of [['10', '90', '42'], ['42']]) {
          const t = await test(ins, fixe(code, 42));
          if (t.err) return `Avec le secret 42, ${quoted(ins).toLowerCase()}, ton code plante : ${esc(t.err.title)}.`;
          if (!/gagn/i.test(tail(t, ins))) return `Avec le secret 42, ${quoted(ins).toLowerCase()}, je devrais lire « Gagné ! ».`;
          if (ins.length > 1 && /gagn/i.test(t.out.slice(0, t.out.indexOf('90\n')))) return 'Il ne faut afficher « Gagné » qu’à la fin, quand le nombre est trouvé.';
        }
        return true;
      },
      ok:'Le jeu tourne ! Pour l’instant, il ne donne aucun indice. Ce serait long pour trouver un nombre entre 1 et 100…',
      sol:M1, solIn:['50', '25'] },
    { t:'code', carry:1, h:'Étape 2 : plus ou moins', file:'mystere.py',
      p:`<p>Dans la boucle, <strong>avant</strong> de redemander, affiche <code>C'est plus !</code> si l'essai est trop petit, et <code>C'est moins !</code> s'il est trop grand.</p>`,
      code:`# Étape 2 : ajoute les indices dans ta boucle
`,
      hints:['Dans la boucle, avant le <code>input</code> : <code>if essai &lt; secret:</code> → <code>print("C\'est plus !")</code>.','<code>else:</code> → <code>print("C\'est moins !")</code>. Inutile de tester l’égalité : si on est dans la boucle, c’est que l’essai est faux.'],
      check:async (r, code, test) => {
        if (!hasRand(code)) return 'Garde le tirage avec <code>random.randint(1, 100)</code>.';
        const ins = ['10', '90', '42'];
        const t = await test(ins, fixe(code, 42));
        if (t.err) return `Avec le secret 42, quand je réponds 10, 90 puis 42, ton code plante : ${esc(t.err.title)}.`;
        const o = norm(t.out);
        const a = o.indexOf('10\n'), b = o.indexOf('90\n'), c = o.lastIndexOf('42\n');
        const s1 = o.slice(a, b), s2 = o.slice(b, c);
        if (!/plus/.test(s1) || /moins/.test(s1)) return 'Avec le secret 42, après l’essai 10, il faut afficher « C’est plus ! ».';
        if (!/moins/.test(s2) || /plus/.test(s2)) return 'Avec le secret 42, après l’essai 90, il faut afficher « C’est moins ! ».';
        if (!/gagn/.test(o.slice(c))) return 'Après l’essai 42, il faut toujours afficher « Gagné ! ».';
        return true;
      },
      ok:'Maintenant, le jeu est jouable. Avec la bonne méthode (toujours couper en deux), on trouve n’importe quel nombre entre 1 et 100 en 7 essais au maximum.',
      sol:M2, solIn:['50', '25'] },
    { t:'code', carry:1, h:'Étape 3 : compter les essais', file:'mystere.py',
      p:`<p>Ajoute un compteur <code>nb</code> d'essais. À la fin, affiche <code>Gagné en 3 essais !</code> avec le bon nombre.</p>`,
      code:`# Étape 3 : ajoute un compteur
`,
      hints:['La première question compte déjà comme un essai : <code>nb = 1</code> juste après elle.','Dans la boucle, après chaque nouvelle question : <code>nb += 1</code>. Et le message final : <code>print(f"Gagné en {nb} essais !")</code>.'],
      check:async (r, code, test) => {
        if (!hasRand(code)) return 'Garde le tirage avec <code>random.randint(1, 100)</code>.';
        for (const ins of [['10', '90', '42'], ['42'], ['50', '25', '37', '43', '40', '42']]) {
          const t = await test(ins, fixe(code, 42));
          if (t.err) return `Avec le secret 42, ${quoted(ins).toLowerCase()}, ton code plante : ${esc(t.err.title)}.`;
          const o = tail(t, ins);
          if (!/gagn/i.test(o)) return `Avec le secret 42, ${quoted(ins).toLowerCase()}, je devrais lire « Gagné ».`;
          if (!nums(o).includes(ins.length)) return `Avec le secret 42, ${quoted(ins).toLowerCase()}, le joueur a fait ${ins.length} essai${ins.length > 1 ? 's' : ''} : ce nombre doit apparaître dans le message final.${nums(o).includes(ins.length - 1) ? ' Tu as un essai de moins : la toute première question compte aussi.' : ''}`;
        }
        return true;
      },
      ok:'Testé avec 1, 3 et 6 essais. Ton compteur ne rate aucun essai, même le premier.',
      sol:M3, solIn:['50', '25'] },
    { t:'code', carry:1, defi:1, h:'Étape 4 : 7 essais, pas un de plus', file:'mystere.py',
      p:`<p>Pour corser le jeu, le joueur n'a que <strong>7 essais</strong>. S'il trouve, affiche <code>Gagné en 3 essais !</code>. S'il échoue 7 fois, affiche <code>Perdu ! Le nombre était 42.</code> (avec le vrai nombre).</p><p>Tu vas devoir réorganiser ta boucle. Une piste : une boucle qui tourne tant qu'il reste des essais, avec un <code>break</code> quand le joueur trouve, et un drapeau <code>gagne</code>.</p>`,
      code:`# Étape 4 : réorganise ta boucle
`,
      hints:['Avant la boucle : <code>nb = 0</code> et <code>gagne = False</code>. La boucle : <code>while nb &lt; 7:</code>. Dedans, d’abord la question et <code>nb += 1</code>.','Puis <code>if essai == secret:</code> → <code>gagne = True</code> et <code>break</code>, <code>elif essai &lt; secret:</code> → plus, <code>else:</code> → moins. Après la boucle : <code>if gagne:</code> … <code>else:</code> <code>print(f"Perdu ! Le nombre était {secret}.")</code>.'],
      check:async (r, code, test) => {
        if (!hasRand(code)) return 'Garde le tirage avec <code>random.randint(1, 100)</code>.';
        for (const ins of [['10', '90', '42'], ['42'], ['1', '2', '3', '4', '5', '6', '42']]) {
          const t = await test(ins, fixe(code, 42));
          if (t.err) return `Avec le secret 42, ${quoted(ins).toLowerCase()}, ton code plante : ${esc(t.err.title)}.`;
          const o = tail(t, ins);
          if (!/gagn/i.test(o) || /perdu/i.test(o)) return `Avec le secret 42, ${quoted(ins).toLowerCase()}, le joueur gagne${ins.length === 7 ? ' au 7e essai, tout juste' : ''}. Je devrais lire « Gagné » et pas « Perdu ».`;
          if (!nums(o).includes(ins.length)) return `Avec le secret 42, ${quoted(ins).toLowerCase()}, il faut afficher le nombre d’essais : ${ins.length}.`;
        }
        const lose = ['1', '2', '3', '4', '5', '6', '7', '99'];
        const t = await test(lose, fixe(code, 42));
        if (/99\n/.test(t.out)) return 'Après 7 essais ratés, ton programme pose encore la question. Il faut s’arrêter : le joueur a perdu.';
        if (t.err) return `Avec le secret 42, quand je rate 7 fois, ton code plante : ${esc(t.err.title)}.`;
        const after = t.out.slice(t.out.indexOf('7\n') + 2);
        if (!/perdu/i.test(after) || /gagn/i.test(after)) return 'Après 7 essais ratés, il faut afficher « Perdu ! ».';
        if (!/42/.test(after)) return 'Quand le joueur perd, révèle le nombre secret : <code>{secret}</code> dans ta f-string.';
        return true;
      },
      ok:'Ton jeu est complet : hasard, boucle, conditions, compteur, <code>break</code> et drapeau. Montre-le à quelqu’un : il est vraiment jouable.',
      sol:M4, solIn:['50', '25', '37', '43', '40', '42'] },
    { t:'code', bug:1, h:'Répare le bug : le nombre en texte', file:'bug.py',
      p:`<p>Ce petit bout du jeu compare l'essai au nombre secret. Il plante. Exécute-le, tape un nombre, lis l'explication, puis répare-le.</p>`,
      code:`secret = 42
essai = input("Ton nombre ? ")
if essai < secret:
    print("C'est plus !")
elif essai > secret:
    print("C'est moins !")
else:
    print("Gagné !")`,
      hints:['Que renvoie <code>input()</code> ? Peut-on comparer du texte à un nombre avec <code>&lt;</code> ?','Convertis la réponse : <code>essai = int(input("Ton nombre ? "))</code>.'],
      check:async (r, code, test) => {
        if (same(code, bugOf('3-7'))) return BUG;
        return cases(test, [[['30'], 'plus', ['moins', 'gagne']], [['50'], 'moins', ['plus', 'gagne']], [['42'], 'gagne', ['plus', 'moins']]]);
      },
      ok:'Le grand classique du chapitre 1 qui revient : <code>input()</code> donne du texte. Et cette fois, c’est une <code>TypeError</code>, car on ne peut pas dire si "30" est plus petit que 42.',
      sol:`secret = 42
essai = int(input("Ton nombre ? "))
if essai < secret:
    print("C'est plus !")
elif essai > secret:
    print("C'est moins !")
else:
    print("Gagné !")`, solIn:['30'] },
    { t:'say', h:'Bravo, et des idées pour aller plus loin',
      p:`<p>Ton jeu marche, et il t'a fait utiliser tout le chapitre. Garde-le dans VS Code dans un fichier <code>mystere.py</code>, et joue dans le terminal.</p><p>Quelques idées d'améliorations à essayer seul :</p><ul><li>demander au joueur la difficulté (1 à 10, 1 à 100 ou 1 à 1000) ;</li><li>proposer de rejouer à la fin, avec une grande boucle <code>while True</code> autour du jeu ;</li><li>garder le meilleur score de la session.</li></ul><p>Au chapitre 4, on apprendra à ranger tout ça dans des <strong>fonctions</strong>, pour que le code reste clair même quand il grandit.</p>` }
  ],
  recap:['<code>import random</code> puis <code>random.randint(a, b)</code> : un entier au hasard entre a et b, <strong>les deux compris</strong>.','Une boucle de jeu : demander, vérifier, répondre, recommencer.','Un compteur d’essais commence au bon endroit : la première question compte.','Pour limiter les essais : <code>while nb &lt; 7</code>, un <code>break</code> si on gagne, et un drapeau pour savoir comment la boucle s’est terminée.'] };

Atelier.chapter({ part:"bases", n:3, title:"Répéter avec les boucles",
  lessons:['3-1','3-2','3-3','3-4','3-5','3-6','3-7'].map(id => ({ id, ...LES[id] })) });
})();
