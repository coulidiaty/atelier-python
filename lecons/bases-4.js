/* Partie 1 · Chapitre 4 : Les fonctions */
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has } = Atelier.h;
const LES = {};

/* Petites aides pour les corrections de ce chapitre */
const BUG = 'Voilà le bug ! Exécute, lis ce qui se passe, puis corrige le code.';
const same = (code, start) => code.trim() === start.trim();
const bugOf = id => LES[id].steps.find(s => s.bug).code;
// Exécute le code de l'élève, puis calcule expr avec ses fonctions.
// Renvoie { err, val, out } : val est la valeur écrite comme en Python (repr), out ce qui a été affiché pendant l'appel.
async function call(test, code, expr, ins = []){
  const t = await test(ins, code + '\n\nprint("@@" + repr(' + expr + '))');
  if (t.err) return { err:t.err, out:t.out };
  const k = t.out.lastIndexOf('@@');
  return { val:k >= 0 ? t.out.slice(k + 2).trim() : null, out:t.out.slice(0, Math.max(k, 0)) };
}
// Le texte affiché seulement pendant l'appel (on enlève ce que le programme affichait déjà avant).
async function during(test, code, expr){
  const base = await test([], code);
  const r = await call(test, code, expr);
  if (r.err) return r;
  return { ...r, said:r.out.slice((base.out || '').length) };
}
const defined = (code, name) => new RegExp('^\\s*def\\s+' + name + '\\s*\\(', 'm').test(strip(code));
const noFn = name => `Je ne trouve pas la fonction <code>${name}</code>. Elle commence par <code>def ${name}(</code>.`;
const callErr = (expr, e) => /NameError/.test(e.raw) && new RegExp(`'${expr.split('(')[0]}'`).test(e.raw) ? noFn(expr.split('(')[0]) : `Quand j’appelle <code>${esc(expr)}</code>, ça plante : ${esc(e.title)}.`;
const num = v => v === null || v === undefined ? NaN : parseFloat(v);
const close = (v, x) => Math.abs(num(v) - x) < 1e-6;

LES['4-1'] = { title:'Créer une fonction avec def', dur:'12 min',
  intro:'Tes programmes grandissent. Pour ne pas réécrire dix fois la même chose, on range un morceau de code dans une <strong>fonction</strong>, on lui donne un nom, et on l’appelle quand on veut.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur le chapitre 3', p:`<p>Qu'affiche ce code ?</p>`, snip:`total = 0
for i in range(1, 4):
    total += i * 10
print(total)`,
      opts:[ {l:'30', why:'On ajoute 10, puis 20, puis 30 : il faut tout additionner.'},
             {l:'60', ok:1},
             {l:'10, 30, 60', why:'Le <code>print</code> est après la boucle : il ne s’affiche qu’une fois.'},
             {l:'40', why:'<code>range(1, 4)</code> donne 1, 2 et 3, pas jusqu’à 4.'} ],
      ex:'10 + 20 + 30 = 60. Un accumulateur, comme au chapitre 3.' },
    { t:'say', h:'Ranger du code sous un nom', file:'menu.py',
      p:`<p>On crée une fonction avec <code>def</code> (pour <em>define</em>, « définir »), suivi de son nom, de parenthèses et de deux-points. Le code de la fonction est décalé, comme pour un <code>if</code>.</p><p>Définir une fonction ne l'exécute pas : on apprend juste une nouvelle recette à Python. Pour s'en servir, on l'<strong>appelle</strong> en écrivant son nom avec des parenthèses : <code>afficher_menu()</code>.</p>`,
      code:`def afficher_menu():
    print("1. Combattre")
    print("2. Fuir")
    print("3. Boire une potion")

print("Un gobelin approche !")
afficher_menu()
print("Il revient avec un ami...")
afficher_menu()` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`def saluer():
    print("Salut !")

print("Début")`,
      opts:[ {l:'Salut ! puis Début', why:'Le <code>def</code> ne fait que définir la fonction. Elle n’est jamais appelée.'},
             {l:'Début', ok:1},
             {l:'Début puis Salut !', why:'Pour exécuter la fonction, il faudrait écrire <code>saluer()</code> quelque part.'},
             {l:'Une erreur', why:'Définir une fonction sans l’appeler, c’est permis. Elle attend juste qu’on l’utilise.'} ],
      ex:'Une fonction qu’on n’appelle pas ne fait rien. C’est une recette rangée dans un tiroir.' },
    { t:'say', h:'Une fonction peut en appeler une autre', file:'titre.py',
      p:`<p>Une fonction peut appeler d'autres fonctions. C'est comme des briques de Lego : des petites pièces simples, assemblées en pièces plus grosses.</p><p>Une seule règle : la fonction doit être définie <strong>avant</strong> la ligne qui l'appelle (en lisant le fichier de haut en bas).</p>`,
      code:`def ligne():
    print("=" * 24)

def titre():
    ligne()
    print("   ATELIER DU HÉROS")
    ligne()

titre()
print("Choisis ta classe.")` },
    { t:'quiz', h:'Dans quel ordre ?', p:`<p>Qu'affiche ce code ?</p>`, snip:`def a():
    print("A")

print("B")
a()
a()`,
      opts:[ {l:'A, B, A', why:'Le <code>def</code> n’affiche rien : la fonction ne s’exécute qu’au moment où on l’appelle.'},
             {l:'A, A, B', why:'Python suit l’ordre des lignes : d’abord <code>print("B")</code>, puis les deux appels.'},
             {l:'B, A, A', ok:1},
             {l:'B, A', why:'La fonction est appelée deux fois, donc A s’affiche deux fois.'} ],
      ex:'Python lit le <code>def</code> sans l’exécuter, affiche B, puis exécute la fonction à chaque appel.' },
    { t:'code', h:'À toi : la bannière', file:'banniere.py',
      p:`<p>Crée une fonction <code>banniere()</code> qui affiche <code>*** Bienvenue dans le donjon ***</code>. Puis appelle-la deux fois.</p><p>Le texte ne doit être écrit qu'une seule fois dans ton code : c'est tout l'intérêt de la fonction.</p>`,
      code:``,
      hints:['<code>def banniere():</code> puis, décalé, <code>print("*** Bienvenue dans le donjon ***")</code>.','Après la fonction, collés à gauche : <code>banniere()</code> deux fois.'],
      check:(r, code) => {
        if (r.err) return ERR;
        if (!defined(code, 'banniere')) return noFn('banniere');
        if ((strip(code).match(/Bienvenue/gi) || []).length > 1) return 'Le texte est écrit plusieurs fois. Écris-le une seule fois, dans la fonction, et appelle la fonction deux fois.';
        const n = linesOf(r.out).filter(l => /bienvenue dans le donjon/i.test(l)).length;
        return n === 2 ? true : n < 2 ? `La bannière s’affiche ${n} fois. Il faut l’appeler deux fois : <code>banniere()</code>.` : 'La bannière doit s’afficher exactement deux fois.';
      },
      ok:'Une ligne de texte, deux affichages. Si tu dois changer le message un jour, tu ne le changeras qu’à un seul endroit.',
      sol:`def banniere():
    print("*** Bienvenue dans le donjon ***")

banniere()
banniere()` },
    { t:'code', defi:1, h:'La fiche en briques', file:'fiche.py',
      p:`<p>Crée deux fonctions :</p><ul><li><code>separateur()</code> affiche 20 tirets <code>--------------------</code></li><li><code>en_tete()</code> affiche un séparateur, puis <code>FICHE DU HÉROS</code>, puis un autre séparateur. Elle doit <strong>appeler</strong> <code>separateur()</code>.</li></ul><p>Appelle ensuite <code>en_tete()</code> une fois.</p>`,
      code:``,
      hints:['<code>def separateur():</code> avec <code>print("-" * 20)</code> dedans.','<code>def en_tete():</code> avec trois lignes : <code>separateur()</code>, <code>print("FICHE DU HÉROS")</code>, <code>separateur()</code>. Puis <code>en_tete()</code> tout en bas.'],
      check:(r, code) => {
        if (r.err) return ERR;
        if (!defined(code, 'separateur')) return noFn('separateur');
        if (!defined(code, 'en_tete')) return noFn('en_tete');
        const body = (strip(code).split(/^\s*def\s+en_tete\s*\(\s*\)\s*:/m)[1] || '').split(/^\S/m)[0];
        if ((body.match(/separateur\s*\(\s*\)/g) || []).length < 2) return '<code>en_tete()</code> doit appeler <code>separateur()</code> deux fois, au lieu de réécrire les tirets.';
        const ls = linesOf(r.out);
        if (ls.length !== 3 || ls[0] !== '-'.repeat(20) || ls[2] !== '-'.repeat(20) || !/fiche du h[ée]ros/i.test(ls[1])) return 'Il faut afficher exactement 3 lignes : 20 tirets, <code>FICHE DU HÉROS</code>, 20 tirets.';
        return true;
      },
      ok:'Des petites fonctions qui s’appellent entre elles : c’est exactement comme ça qu’on construit les gros programmes.',
      sol:`def separateur():
    print("-" * 20)

def en_tete():
    separateur()
    print("FICHE DU HÉROS")
    separateur()

en_tete()` },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code devrait afficher <code>Bienvenue, aventurier !</code>. Il plante. Exécute-le, lis l'explication, puis répare-le.</p>`,
      code:`saluer()

def saluer():
    print("Bienvenue, aventurier !")`,
      hints:['Python lit le fichier de haut en bas. Au moment de la ligne 1, connaît-il déjà <code>saluer</code> ?','Déplace l’appel <code>saluer()</code> tout en bas, après le <code>def</code>.'],
      check:(r, code) => same(code, bugOf('4-1')) ? BUG : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : !/Bienvenue, aventurier/.test(r.out) ? 'Plus d’erreur, mais il faut afficher <code>Bienvenue, aventurier !</code>.' : true,
      ok:'On définit d’abord, on appelle ensuite. C’est pour ça qu’on met souvent toutes les fonctions en haut du fichier.',
      sol:`def saluer():
    print("Bienvenue, aventurier !")

saluer()` },
    { t:'quiz', h:'Le piège des parenthèses', p:`<p>Qu'affiche ce code ?</p>`, snip:`def crier():
    print("AAAAH !")

crier`,
      opts:[ {l:'AAAAH !', why:'Sans parenthèses, on <strong>nomme</strong> la fonction, mais on ne l’appelle pas.'},
             {l:'Une erreur', why:'Python ne plante pas : écrire le nom d’une fonction tout seul est permis. Ça ne fait juste rien.'},
             {l:'crier', why:'Il n’y a pas de <code>print</code> autour : rien ne s’affiche.'},
             {l:'Rien du tout', ok:1} ],
      ex:'Ce sont les parenthèses qui déclenchent l’appel : <code>crier()</code>. Sans elles, Python regarde la fonction sans l’exécuter. Un bug silencieux de plus à connaître.' }
  ],
  recap:['<code>def nom():</code> crée une fonction. Son code est décalé de 4 espaces.','Définir ne fait rien : il faut <strong>appeler</strong> la fonction avec <code>nom()</code>, parenthèses comprises.','Une fonction doit être définie avant la ligne qui l’appelle.','Une fonction peut en appeler d’autres : on assemble des petites briques.','Un même texte dans une fonction plutôt que copié partout : on ne le change qu’à un endroit.'] };

LES['4-2'] = { title:'Paramètres et arguments', dur:'12 min',
  intro:'Une fonction qui fait toujours exactement la même chose, c’est limité. Avec des paramètres, tu lui donnes des informations, et elle s’adapte.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Combien de fois « Hop » s'affiche-t-il ?</p>`, snip:`def sauter():
    print("Hop")

sauter()
for i in range(2):
    sauter()`,
      opts:[ {l:'1 fois', why:'La fonction est aussi appelée dans la boucle, à chaque tour.'},
             {l:'2 fois', why:'N’oublie pas l’appel juste avant la boucle.'},
             {l:'3 fois', ok:1},
             {l:'4 fois', why:'Le <code>def</code> n’affiche rien : il ne fait que définir.'} ],
      ex:'Un appel avant la boucle, puis deux dans la boucle : trois « Hop ».' },
    { t:'say', h:'Donner une information à la fonction', file:'saluer.py',
      p:`<p>Entre les parenthèses du <code>def</code>, on écrit un <strong>paramètre</strong> : une variable qui recevra une valeur au moment de l'appel.</p><p>À l'appel, la valeur qu'on donne s'appelle un <strong>argument</strong>. Ici, au premier appel, <code>prenom</code> reçoit "Sam". Au deuxième, il reçoit "Inès".</p>`,
      code:`def saluer(prenom):
    print(f"Salut {prenom}, prêt pour l'aventure ?")

saluer("Sam")
saluer("Inès")` },
    { t:'say', h:'Plusieurs paramètres', file:'attaque.py',
      p:`<p>On peut avoir plusieurs paramètres, séparés par des virgules. Les arguments sont rangés <strong>dans l'ordre</strong> : le premier argument va dans le premier paramètre, le deuxième dans le deuxième, et ainsi de suite.</p>`,
      code:`def attaque(attaquant, cible, degats):
    print(f"{attaquant} frappe {cible} : {degats} dégâts !")

attaque("Sam", "le gobelin", 12)
attaque("Le dragon", "Sam", 30)` },
    { t:'quiz', h:'L’ordre compte', p:`<p>Avec la fonction <code>attaque</code> d'avant, qu'affiche cet appel ?</p>`, snip:`attaque("le gobelin", "Sam", 12)`,
      opts:[ {l:'Sam frappe le gobelin : 12 dégâts !', why:'Python ne devine pas qui attaque : il range les arguments dans l’ordre des paramètres.'},
             {l:'le gobelin frappe Sam : 12 dégâts !', ok:1},
             {l:'Une erreur', why:'Il y a bien trois arguments pour trois paramètres : Python ne voit aucun problème.'},
             {l:'12 frappe Sam : le gobelin dégâts !', why:'L’ordre des arguments est respecté : "le gobelin", puis "Sam", puis 12.'} ],
      ex:'Le premier argument va dans <code>attaquant</code>. Inverser deux arguments ne fait pas d’erreur, mais le résultat est faux. Prends le temps de vérifier l’ordre.' },
    { t:'quiz', h:'Et s’il en manque un ?', p:`<p>Que se passe-t-il ?</p>`, snip:`def saluer(prenom):
    print("Salut", prenom)

saluer()`,
      opts:[ {l:'Ça affiche Salut', why:'Python refuse : le paramètre <code>prenom</code> n’a reçu aucune valeur.'},
             {l:'Ça affiche Salut None', why:'Python ne met pas de valeur au hasard : il signale l’oubli.'},
             {l:'Une TypeError', ok:1},
             {l:'Ça n’affiche rien', why:'Python plante avec un message clair : il manque un argument.'} ],
      ex:'Le message dit « missing 1 required argument: \'prenom\' ». Autant d’arguments que de paramètres : c’est la règle (on verra une exception à la leçon 4.4).' },
    { t:'code', h:'À toi : présente le héros', file:'presente.py',
      p:`<p>Crée une fonction <code>presenter(nom, classe, niveau)</code> qui affiche : <code>Sam le Mage, niveau 3</code> (avec les valeurs reçues). Appelle-la au moins une fois.</p><p>Je l'appellerai aussi moi-même avec d'autres valeurs.</p>`,
      code:``,
      hints:['<code>def presenter(nom, classe, niveau):</code>','Dedans : <code>print(f"{nom} le {classe}, niveau {niveau}")</code>. Puis par exemple <code>presenter("Sam", "Mage", 3)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'presenter')) return noFn('presenter');
        for (const [n, c, l] of [['Inès', 'Guerrier', 7], ['Léo', 'Archer', 1]]) {
          const x = await during(test, code, `presenter("${n}", "${c}", ${l})`);
          if (x.err) return callErr('presenter(...)', x.err);
          if (!norm(x.said).includes(norm(`${n} le ${c}, niveau ${l}`))) return `Quand j’appelle <code>presenter("${n}", "${c}", ${l})</code>, je devrais lire <code>${n} le ${c}, niveau ${l}</code>.${x.said.trim() ? ` J’ai lu : <code>${esc(x.said.trim())}</code>` : ''}`;
        }
        return true;
      },
      ok:'J’ai appelé ta fonction avec Inès et Léo : parfait. Une fonction, une infinité de héros.',
      sol:`def presenter(nom, classe, niveau):
    print(f"{nom} le {classe}, niveau {niveau}")

presenter("Sam", "Mage", 3)` },
    { t:'code', defi:1, h:'La barre de vie', file:'barre.py',
      p:`<p>Crée une fonction <code>barre_de_vie(pv, pv_max)</code> qui affiche une barre de 10 cases : des <code>#</code> pour la vie qui reste, des <code>-</code> pour le reste, puis les pv.</p><pre class="snippet">barre_de_vie(30, 100)   →   [###-------] 30/100
barre_de_vie(25, 50)    →   [#####-----] 25/50</pre><p>Le nombre de <code>#</code>, c'est <code>pv * 10 // pv_max</code>.</p>`,
      code:``,
      hints:['Calcule d’abord <code>nb = pv * 10 // pv_max</code>. Le nombre de tirets, c’est <code>10 - nb</code>.','Puis <code>print("[" + "#" * nb + "-" * (10 - nb) + f"] {pv}/{pv_max}")</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'barre_de_vie')) return noFn('barre_de_vie');
        for (const [p, m, w] of [[30, 100, '[###-------] 30/100'], [25, 50, '[#####-----] 25/50'], [100, 100, '[##########] 100/100'], [0, 80, '[----------] 0/80'], [7, 10, '[#######---] 7/10']]) {
          const x = await during(test, code, `barre_de_vie(${p}, ${m})`);
          if (x.err) return callErr('barre_de_vie(...)', x.err);
          if (!x.said.replace(/\s+/g, ' ').includes(w)) return `Quand j’appelle <code>barre_de_vie(${p}, ${m})</code>, je devrais lire <code>${w}</code>.${x.said.trim() ? ` J’ai lu : <code>${esc(x.said.trim())}</code>` : ''}`;
        }
        return true;
      },
      ok:'Testé avec cinq barres, dont la vide et la pleine. Garde cette fonction en tête : elle reviendra dans le projet du chapitre.',
      sol:`def barre_de_vie(pv, pv_max):
    nb = pv * 10 // pv_max
    print("[" + "#" * nb + "-" * (10 - nb) + f"] {pv}/{pv_max}")

barre_de_vie(30, 100)` },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Le héros a 50 pv et boit une potion qui soigne 20 pv. Ce code devrait afficher 70. Il plante. Exécute-le, lis l'explication, puis répare l'appel (pas la fonction).</p>`,
      code:`def soigner(pv, soin):
    print(pv + soin)

soigner(50)`,
      hints:['Lis le message original : il manque un argument. Combien de paramètres a la fonction ?','L’appel doit donner les deux valeurs : <code>soigner(50, 20)</code>.'],
      check:(r, code) => same(code, bugOf('4-2')) ? BUG : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : !/def soigner\(pv, soin\):\s*\n\s+print\(pv \+ soin\)/.test(code) ? 'Ne change pas la fonction : c’est l’appel qui est faux.' : linesOf(r.out).join() !== '70' ? 'Il faut afficher 70 : 50 pv plus 20 de soin.' : true,
      ok:'Un argument par paramètre, dans l’ordre. Le message « missing 1 required argument » te dira toujours lequel manque.',
      sol:`def soigner(pv, soin):
    print(pv + soin)

soigner(50, 20)` }
  ],
  recap:['Un <strong>paramètre</strong> est une variable dans le <code>def</code> : <code>def saluer(prenom):</code>.','Un <strong>argument</strong> est la valeur donnée à l’appel : <code>saluer("Sam")</code>.','Les arguments sont rangés dans l’ordre des paramètres.','Il manque un argument ? <code>TypeError: missing 1 required argument</code>.'] };

LES['4-3'] = { title:'return : renvoyer un résultat', dur:'14 min',
  intro:'Jusqu’ici, tes fonctions affichaient. Mais souvent, on veut qu’une fonction <strong>calcule</strong> quelque chose et nous donne le résultat, pour s’en resservir. C’est le rôle de <code>return</code>, et c’est la leçon la plus importante du chapitre.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`def info(nom, age):
    print(nom, "a", age, "ans")

info(19, "Léa")`,
      opts:[ {l:'Léa a 19 ans', why:'Python range les arguments dans l’ordre : <code>nom</code> reçoit 19 et <code>age</code> reçoit "Léa".'},
             {l:'19 a Léa ans', ok:1},
             {l:'Une erreur', why:'Il y a deux arguments pour deux paramètres. Python ne vérifie pas que ça a du sens.'},
             {l:'nom a age ans', why:'Sans guillemets, <code>nom</code> et <code>age</code> sont des variables : Python affiche leur valeur.'} ],
      ex:'Les arguments sont inversés : pas d’erreur, mais une phrase absurde.' },
    { t:'say', h:'Renvoyer une valeur', file:'double.py', mem:1,
      p:`<p><code>return</code> renvoie une valeur à celui qui a appelé la fonction. L'appel <code>double(5)</code> est alors <strong>remplacé par le résultat</strong>, comme un calcul.</p><p>On peut ranger ce résultat dans une variable, l'afficher, ou s'en servir dans un autre calcul.</p>`,
      code:`def double(x):
    return x * 2

resultat = double(5)
print(resultat)
print(double(10) + 1)
print(double(double(3)))` },
    { t:'say', h:'return ou print ?', file:'difference.py', mem:1,
      p:`<p>C'est LA confusion des débutants. <code>print</code> <strong>montre</strong> une valeur à l'écran, pour un humain. <code>return</code> <strong>donne</strong> une valeur au programme, pour qu'il s'en serve.</p><p>Une fonction sans <code>return</code> renvoie quand même quelque chose : <code>None</code>, qui veut dire « rien ». Exécute et regarde les boîtes a et b dans la mémoire.</p>`,
      code:`def aire_avec_print(l, h):
    print(l * h)

def aire_avec_return(l, h):
    return l * h

a = aire_avec_print(3, 4)
b = aire_avec_return(3, 4)
print("a =", a, "et b =", b)` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`def triple(x):
    print(x * 3)

y = triple(5)
print(y)`,
      opts:[ {l:'15 puis 15', why:'La fonction affiche 15, mais elle ne le renvoie pas : y ne reçoit rien.'},
             {l:'15', why:'La dernière ligne affiche y. Et y contient quelque chose : None.'},
             {l:'15 puis None', ok:1},
             {l:'None', why:'L’appel <code>triple(5)</code> exécute le <code>print(x * 3)</code> : 15 s’affiche d’abord.'} ],
      ex:'La fonction affiche 15 (le <code>print</code>), puis renvoie None (pas de <code>return</code>). y vaut donc None.' },
    { t:'say', h:'return arrête la fonction', file:'signe.py',
      p:`<p>Dès que Python rencontre un <code>return</code>, il quitte la fonction immédiatement, avec la valeur. Les lignes suivantes de la fonction ne sont pas exécutées.</p><p>On s'en sert souvent avec des conditions : un <code>return</code> par cas.</p>`,
      code:`def etat(pv):
    if pv <= 0:
        return "K.O."
    if pv < 30:
        return "blessé"
    return "en forme"

print(etat(0))
print(etat(12))
print(etat(80))` },
    { t:'quiz', h:'Et après le return ?', p:`<p>Qu'affiche ce code ?</p>`, snip:`def f():
    return 1
    print("coucou")

print(f())`,
      opts:[ {l:'coucou puis 1', why:'Le <code>return</code> quitte la fonction : la ligne suivante n’est jamais atteinte.'},
             {l:'1', ok:1},
             {l:'1 puis coucou', why:'Le <code>print("coucou")</code> est dans la fonction, après le <code>return</code> : il ne s’exécute jamais.'},
             {l:'Une erreur', why:'Python ne se plaint pas du code inutile après un <code>return</code>. Il l’ignore.'} ],
      ex:'Tout ce qui suit un <code>return</code> dans le même bloc est du code mort : il ne s’exécute jamais.' },
    { t:'code', h:'À toi : le prix TTC', file:'ttc.py',
      p:`<p>Crée une fonction <code>prix_ttc(prix_ht)</code> qui <strong>renvoie</strong> le prix avec 20 % de TVA (le prix fois 1.2). Elle ne doit rien afficher.</p><p>En dessous, affiche le prix TTC d'une manette à 50 €.</p>`,
      code:``,
      hints:['<code>def prix_ttc(prix_ht):</code> puis, décalé, <code>return prix_ht * 1.2</code>.','Pour afficher : <code>print(prix_ttc(50))</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'prix_ttc')) return noFn('prix_ttc');
        for (const [p, w] of [[100, 120], [50, 60], [0, 0]]) {
          const x = await during(test, code, `prix_ttc(${p})`);
          if (x.err) return callErr('prix_ttc(...)', x.err);
          if (x.val === 'None') return `<code>prix_ttc(${p})</code> renvoie None. Ta fonction affiche peut-être le prix, mais elle doit le <strong>renvoyer</strong> avec <code>return</code>.`;
          if (!close(x.val, w)) return `<code>prix_ttc(${p})</code> devrait renvoyer ${w}, et renvoie ${esc(x.val)}.`;
          if (x.said.trim()) return 'Ta fonction ne doit rien afficher elle-même : c’est le programme qui décide quoi faire du résultat.';
        }
        if (!/60/.test(r.out)) return 'La fonction est parfaite. Il reste à afficher le prix TTC de la manette à 50 €.';
        return true;
      },
      ok:'Ta fonction renvoie le prix sans rien afficher. Maintenant on peut s’en servir partout : dans une addition, une comparaison, une autre fonction.',
      sol:`def prix_ttc(prix_ht):
    return prix_ht * 1.2

print(prix_ttc(50))` },
    { t:'code', defi:1, h:'Le plus grand des trois', file:'maximum.py',
      p:`<p>Crée une fonction <code>maximum(a, b, c)</code> qui renvoie le plus grand des trois nombres. Interdit d'utiliser <code>max()</code> : c'est toi qui fais le travail.</p><p>Je testerai avec des nombres négatifs et des nombres égaux.</p>`,
      code:``,
      hints:['Une méthode : garde le plus grand dans une variable. <code>plus_grand = a</code>, puis <code>if b &gt; plus_grand: plus_grand = b</code>, et pareil pour c.','Et à la fin : <code>return plus_grand</code>. C’est le schéma du record, vu au chapitre 3.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'maximum')) return noFn('maximum');
        if (/\bmax\s*\(/.test(strip(code))) return 'Pas de <code>max()</code> ici : écris la comparaison toi-même.';
        for (const args of [[1, 2, 3], [3, 2, 1], [2, 3, 1], [-5, -2, -9], [4, 4, 1], [7, 7, 7], [0, -1, 0]]) {
          const x = await call(test, code, `maximum(${args.join(', ')})`);
          if (x.err) return callErr('maximum(...)', x.err);
          const w = Math.max(...args);
          if (x.val === 'None') return `<code>maximum(${args.join(', ')})</code> renvoie None : il manque un <code>return</code>, au moins dans un des cas.`;
          if (num(x.val) !== w) return `<code>maximum(${args.join(', ')})</code> devrait renvoyer ${w}, et renvoie ${esc(x.val)}.`;
        }
        return true;
      },
      ok:'Sept cas testés, avec des négatifs et des égalités. Les égalités font souvent tomber les solutions avec des <code>&gt;</code> partout : la tienne tient bon.',
      sol:`def maximum(a, b, c):
    plus_grand = a
    if b > plus_grand:
        plus_grand = b
    if c > plus_grand:
        plus_grand = c
    return plus_grand

print(maximum(3, 9, 4))` },
    { t:'code', bug:1, h:'Répare le bug : print au lieu de return', file:'bug.py',
      p:`<p>Ce programme additionne les dégâts de deux attaques. Il affiche 21 et 15, puis plante. Exécute-le, lis l'explication, puis répare la fonction pour qu'il affiche <code>Total : 36</code>.</p>`,
      code:`def degats(force):
    print(force * 3)

total = degats(7) + degats(5)
print("Total :", total)`,
      hints:['La fonction affiche le résultat, mais que renvoie-t-elle ? Le message parle de <code>NoneType</code>.','Remplace <code>print(force * 3)</code> par <code>return force * 3</code>.'],
      check:(r, code) => same(code, bugOf('4-3')) ? BUG : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : !/Total\s*:\s*36/.test(r.out) ? 'Il faut afficher <code>Total : 36</code>.' : linesOf(r.out).length > 1 ? 'Ça marche, mais la fonction affiche encore quelque chose. Elle doit seulement renvoyer.' : true,
      ok:'Le message <code>NoneType</code> dans une erreur veut presque toujours dire : une fonction n’a pas de <code>return</code>. Tu sauras le reconnaître.',
      sol:`def degats(force):
    return force * 3

total = degats(7) + degats(5)
print("Total :", total)` }
  ],
  recap:['<code>return valeur</code> renvoie un résultat : l’appel est remplacé par cette valeur.','<code>print</code> montre à l’humain, <code>return</code> donne au programme.','Une fonction sans <code>return</code> renvoie <code>None</code>.','<code>return</code> quitte la fonction tout de suite : le code après est ignoré.','Une erreur avec <code>NoneType</code> ? Il manque sûrement un <code>return</code>.'] };

LES['4-4'] = { title:'Valeurs par défaut et arguments nommés', dur:'12 min',
  intro:'Certaines informations ont presque toujours la même valeur. Plutôt que de la répéter à chaque appel, on donne au paramètre une valeur par défaut. Et pour ne plus se tromper d’ordre, on nomme les arguments.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`def bonus(x):
    return x + 10

print(bonus(bonus(5)))`,
      opts:[ {l:'15', why:'Il y a deux appels : <code>bonus(5)</code> donne 15, puis <code>bonus(15)</code>.'},
             {l:'25', ok:1},
             {l:'None', why:'La fonction a un <code>return</code> : elle renvoie bien une valeur.'},
             {l:'Une erreur', why:'On peut donner le résultat d’un appel comme argument d’un autre appel.'} ],
      ex:'Python calcule de l’intérieur vers l’extérieur : <code>bonus(5)</code> = 15, puis <code>bonus(15)</code> = 25.' },
    { t:'say', h:'Une valeur par défaut', file:'defaut.py',
      p:`<p>Dans le <code>def</code>, on peut écrire <code>parametre=valeur</code>. Si l'appel ne donne pas cet argument, Python utilise la valeur par défaut. S'il le donne, c'est l'argument qui gagne.</p>`,
      code:`def saluer(prenom, message="Bonjour"):
    print(f"{message}, {prenom} !")

saluer("Sam")
saluer("Inès", "Bonsoir")` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`def potion(pv, soin=20):
    return pv + soin

print(potion(50), potion(50, 5))`,
      opts:[ {l:'70 70', why:'Au deuxième appel, on donne 5 : l’argument remplace la valeur par défaut.'},
             {l:'70 55', ok:1},
             {l:'50 55', why:'Au premier appel, soin n’est pas donné : il vaut 20 par défaut.'},
             {l:'Une erreur', why:'Avec une valeur par défaut, le deuxième argument devient facultatif.'} ],
      ex:'Premier appel : soin vaut 20 par défaut, donc 70. Deuxième : soin vaut 5, donc 55.' },
    { t:'say', h:'Nommer les arguments', file:'nommes.py',
      p:`<p>À l'appel, on peut écrire <code>nom=valeur</code>. C'est un <strong>argument nommé</strong>. L'ordre n'a alors plus d'importance, et le code se lit tout seul.</p><p>Tu en utilises déjà sans le savoir : <code>end</code> et <code>sep</code> sont des arguments nommés de <code>print</code>.</p>`,
      code:`def creer_heros(nom, classe="Guerrier", niveau=1):
    print(f"{nom}, {classe} de niveau {niveau}")

creer_heros("Sam")
creer_heros("Inès", niveau=5)
creer_heros(niveau=3, nom="Léo", classe="Mage")
print("a", "b", "c", sep=" - ")` },
    { t:'quiz', h:'Laquelle est valide ?', p:`<p>Une seule de ces définitions est acceptée par Python. Laquelle ?</p>`,
      opts:[ {l:'def f(a=1, b):', why:'Un paramètre sans valeur par défaut ne peut pas venir après un paramètre qui en a une. Python ne saurait pas à qui donner le premier argument.'},
             {l:'def f(a, b=1):', ok:1},
             {l:'def f(a=1, b, c=2):', why:'b n’a pas de valeur par défaut mais vient après a, qui en a une : interdit.'},
             {l:'def f(=1):', why:'Un paramètre a toujours un nom.'} ],
      ex:'La règle : d’abord les paramètres obligatoires, puis ceux qui ont une valeur par défaut. Sinon, c’est une <code>SyntaxError</code>.' },
    { t:'code', h:'À toi : la commande de pizza', file:'pizza.py',
      p:`<p>Crée une fonction <code>commander(pizza, taille="moyenne", supplement="aucun")</code> qui <strong>renvoie</strong> le texte <code>Pizza reine moyenne, supplément : aucun</code> (avec les valeurs reçues).</p><p>Je l'appellerai de plusieurs façons, avec et sans arguments nommés.</p>`,
      code:``,
      hints:['<code>def commander(pizza, taille="moyenne", supplement="aucun"):</code>','Dedans : <code>return f"Pizza {pizza} {taille}, supplément : {supplement}"</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'commander')) return noFn('commander');
        const tries = [['commander("reine")', 'Pizza reine moyenne, supplément : aucun'], ['commander("4 fromages", "grande")', 'Pizza 4 fromages grande, supplément : aucun'], ['commander("reine", supplement="olives")', 'Pizza reine moyenne, supplément : olives'], ['commander(supplement="oeuf", pizza="calzone", taille="petite")', 'Pizza calzone petite, supplément : oeuf']];
        for (const [e, w] of tries) {
          const x = await call(test, code, e);
          if (x.err) return /TypeError/.test(x.err.raw) ? `<code>${esc(e)}</code> plante : vérifie les noms des paramètres et leurs valeurs par défaut.` : callErr(e, x.err);
          if (x.val === 'None') return `<code>${esc(e)}</code> renvoie None : ta fonction doit <strong>renvoyer</strong> le texte avec <code>return</code>.`;
          if (norm(x.val.slice(1, -1)) !== norm(w)) return `<code>${esc(e)}</code> devrait renvoyer <code>${esc(w)}</code>, et renvoie <code>${esc(x.val)}</code>.`;
        }
        return true;
      },
      ok:'Quatre façons d’appeler, quatre bonnes réponses. Les valeurs par défaut rendent une fonction simple à utiliser dans le cas courant, et souple quand on en a besoin.',
      sol:`def commander(pizza, taille="moyenne", supplement="aucun"):
    return f"Pizza {pizza} {taille}, supplément : {supplement}"

print(commander("reine"))` },
    { t:'code', defi:1, h:'Le prix du billet', file:'billet.py',
      p:`<p>Crée une fonction <code>prix_billet(age, etudiant=False)</code> qui renvoie le prix d'un billet :</p><ul><li>moins de 4 ans : 0</li><li>moins de 26 ans <strong>ou</strong> étudiant : 15</li><li>sinon : 30</li></ul><p>Je l'appellerai par exemple avec <code>prix_billet(30)</code> et <code>prix_billet(30, etudiant=True)</code>.</p>`,
      code:``,
      hints:['<code>def prix_billet(age, etudiant=False):</code> puis une chaîne de <code>if</code> avec un <code>return</code> dans chaque cas.','<code>if age &lt; 4: return 0</code>, puis <code>if age &lt; 26 or etudiant: return 15</code>, puis <code>return 30</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'prix_billet')) return noFn('prix_billet');
        for (const [e, w] of [['prix_billet(2)', 0], ['prix_billet(19)', 15], ['prix_billet(30)', 30], ['prix_billet(30, etudiant=True)', 15], ['prix_billet(30, True)', 15], ['prix_billet(3, etudiant=True)', 0], ['prix_billet(26)', 30]]) {
          const x = await call(test, code, e);
          if (x.err) return callErr(e, x.err);
          if (x.val === 'None') return `<code>${e}</code> renvoie None : il manque un <code>return</code>.`;
          if (num(x.val) !== w) return `<code>${e}</code> devrait renvoyer ${w}, et renvoie ${esc(x.val)}.`;
        }
        return true;
      },
      ok:'Sept appels testés. Un <code>return</code> par cas, dans le bon ordre : c’est souvent la façon la plus claire d’écrire une fonction qui choisit.',
      sol:`def prix_billet(age, etudiant=False):
    if age < 4:
        return 0
    if age < 26 or etudiant:
        return 15
    return 30

print(prix_billet(30, etudiant=True))` },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code devrait afficher <code>Sam est niveau 3</code>. Il plante. Exécute-le, lis le message original, puis répare l'appel.</p>`,
      code:`def afficher(nom, niveau=1):
    print(f"{nom} est niveau {niveau}")

afficher(nom="Sam", 3)`,
      hints:['Le message original dit : un argument sans nom (positionnel) vient après un argument nommé. C’est interdit.','Deux solutions : <code>afficher("Sam", 3)</code>, ou tout nommer : <code>afficher(nom="Sam", niveau=3)</code>.'],
      check:(r, code) => same(code, bugOf('4-4')) ? BUG : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : !/Sam est niveau 3/.test(r.out) ? 'Il faut afficher <code>Sam est niveau 3</code>.' : true,
      ok:'À l’appel aussi, il y a un ordre : d’abord les arguments dans l’ordre, ensuite les arguments nommés.',
      sol:`def afficher(nom, niveau=1):
    print(f"{nom} est niveau {niveau}")

afficher("Sam", niveau=3)` }
  ],
  recap:['<code>def f(a, b=10):</code> : si b n’est pas donné, il vaut 10.','Les paramètres avec valeur par défaut viennent <strong>après</strong> les autres.','Argument nommé : <code>f(b=3, a=1)</code>. L’ordre n’a plus d’importance.','À l’appel : d’abord les arguments dans l’ordre, puis les arguments nommés.','<code>end</code> et <code>sep</code> sont des arguments nommés de <code>print</code>.'] };

LES['4-5'] = { title:'Variables locales et globales', dur:'14 min',
  intro:'Une fonction est comme une pièce fermée : ce qui s’y passe reste à l’intérieur. Comprendre cette règle évite des bugs très mystérieux.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`def tirer(fleches=3):
    return fleches - 1

print(tirer(), tirer(10))`,
      opts:[ {l:'2 9', ok:1},
             {l:'3 10', why:'La fonction renvoie <code>fleches - 1</code>.'},
             {l:'2 2', why:'Au deuxième appel, on donne 10 : la valeur par défaut est remplacée.'},
             {l:'Une erreur', why:'L’argument est facultatif grâce à la valeur par défaut.'} ],
      ex:'Sans argument, fleches vaut 3 : on renvoie 2. Avec 10 : on renvoie 9.' },
    { t:'say', h:'Ce qui naît dans la fonction y reste', file:'locale.py', mem:1,
      p:`<p>Une variable créée dans une fonction est <strong>locale</strong> : elle n'existe que pendant l'appel. Quand la fonction se termine, elle disparaît. Les paramètres aussi sont des variables locales.</p><p>Exécute, puis regarde la mémoire : il n'y a ni boîte <code>resultat</code>, ni boîte <code>x</code>. Seulement <code>valeur</code>, créée en dehors.</p>`,
      code:`def calcul(x):
    resultat = x * 10
    print("Dans la fonction, resultat =", resultat)
    return resultat

valeur = calcul(4)
print("Dehors, valeur =", valeur)` },
    { t:'quiz', h:'Et si on insiste ?', p:`<p>Que se passe-t-il à la dernière ligne ?</p>`, snip:`def calcul():
    resultat = 42

calcul()
print(resultat)`,
      opts:[ {l:'Ça affiche 42', why:'<code>resultat</code> est locale : elle a disparu à la fin de l’appel.'},
             {l:'Ça affiche None', why:'Ce n’est pas une question de valeur : la boîte n’existe tout simplement pas dehors.'},
             {l:'Une NameError', ok:1},
             {l:'Ça affiche resultat', why:'Sans guillemets, c’est un nom de variable. Et cette variable n’existe pas ici.'} ],
      ex:'Dehors, Python ne connaît pas <code>resultat</code>. Pour récupérer une valeur calculée dans une fonction, il n’y a qu’un chemin : <code>return</code>.' },
    { t:'say', h:'Lire une variable du dehors', file:'globale.py',
      p:`<p>Une variable créée en dehors de toute fonction est <strong>globale</strong>. Une fonction peut la <strong>lire</strong>.</p><p>Mais attention : si la fonction fait <code>bonus = …</code>, Python crée une nouvelle boîte locale qui porte le même nom. La globale, elle, ne bouge pas.</p>`,
      code:`bonus = 10

def score_final(points):
    return points + bonus

print(score_final(50))` },
    { t:'quiz', h:'Deux boîtes, un seul nom', p:`<p>Qu'affiche ce code ?</p>`, snip:`x = 5

def f():
    x = 100
    print(x)

f()
print(x)`,
      opts:[ {l:'100 puis 100', why:'Le <code>x = 100</code> dans la fonction crée une boîte <strong>locale</strong>. Le x global n’est pas touché.'},
             {l:'5 puis 5', why:'Dans la fonction, le x local vaut 100 : c’est lui qu’on affiche.'},
             {l:'100 puis 5', ok:1},
             {l:'Une erreur', why:'Avoir le même nom dedans et dehors est permis. Ce sont juste deux boîtes différentes.'} ],
      ex:'Deux boîtes portent le nom x : une dans la fonction (100), une dehors (5). Elles ne se mélangent jamais.' },
    { t:'say', h:'Modifier une variable du dehors', file:'modifier.py', mem:1,
      p:`<p>Il existe un mot-clé <code>global</code> qui permet à une fonction de modifier une variable globale. Il marche, mais les développeurs l'évitent : quand n'importe quelle fonction peut changer n'importe quoi, on ne sait plus qui a cassé quoi.</p><p>La bonne méthode : <strong>donner</strong> la valeur en paramètre, et <strong>récupérer</strong> la nouvelle valeur avec <code>return</code>. Compare les deux versions.</p>`,
      code:`# Version à éviter
or_ = 50
def gagner_global(montant):
    global or_
    or_ = or_ + montant
gagner_global(10)
print(or_)

# Version propre
argent = 50
def gagner(total, montant):
    return total + montant
argent = gagner(argent, 10)
print(argent)` },
    { t:'code', h:'À toi : soigner proprement', file:'soin.py', mem:1,
      p:`<p>Crée une fonction <code>soigner(pv, soin)</code> qui renvoie les nouveaux pv, <strong>sans dépasser 100</strong>. Puis utilise-la pour soigner le héros de 30 pv : <code>pv = soigner(pv, 30)</code>.</p><p>Pas de <code>global</code> : tout passe par les paramètres et le <code>return</code>.</p>`,
      code:`pv = 80
`,
      hints:['Calcule <code>nouveau = pv + soin</code>, puis <code>if nouveau &gt; 100: nouveau = 100</code>, puis <code>return nouveau</code>.','Après la fonction : <code>pv = soigner(pv, 30)</code> puis <code>print(pv)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (/\bglobal\b/.test(strip(code))) return 'Pas de <code>global</code> ici : donne les pv en paramètre et renvoie le résultat.';
        if (!defined(code, 'soigner')) return noFn('soigner');
        for (const [a, b, w] of [[50, 30, 80], [80, 30, 100], [100, 5, 100], [0, 10, 10]]) {
          const x = await call(test, code, `soigner(${a}, ${b})`);
          if (x.err) return callErr('soigner(...)', x.err);
          if (x.val === 'None') return '<code>soigner</code> renvoie None : il manque le <code>return</code>.';
          if (num(x.val) !== w) return `<code>soigner(${a}, ${b})</code> devrait renvoyer ${w}, et renvoie ${esc(x.val)}.`;
        }
        const m = memOf(r, 'pv');
        if (!m || m.repr !== '100') return 'La fonction est bonne. Maintenant, soigne le héros : <code>pv = soigner(pv, 30)</code>. Avec 80 pv, il doit finir à 100.';
        return true;
      },
      ok:'Ta fonction ne dépend de rien d’autre que ses paramètres : on peut la tester, la réutiliser, la déplacer. C’est ce qu’on appelle une fonction <em>pure</em>.',
      sol:`pv = 80

def soigner(pv, soin):
    nouveau = pv + soin
    if nouveau > 100:
        nouveau = 100
    return nouveau

pv = soigner(pv, 30)
print(pv)` },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code devrait afficher 1. Il plante avec une <code>UnboundLocalError</code> : Python a vu <code>compteur = …</code> dans la fonction, donc il considère <code>compteur</code> comme une variable locale… qui n'a pas encore de valeur.</p><p>Répare-le à la manière propre : la fonction reçoit le compteur en paramètre et renvoie la nouvelle valeur.</p>`,
      code:`compteur = 0

def ajouter():
    compteur += 1

ajouter()
print(compteur)`,
      hints:['La fonction doit avoir un paramètre et un <code>return</code> : <code>def ajouter(c):</code> puis <code>return c + 1</code>.','Et l’appel récupère le résultat : <code>compteur = ajouter(compteur)</code>.'],
      check:(r, code) => {
        if (same(code, bugOf('4-5'))) return BUG;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        if (linesOf(r.out).join() !== '1') return 'Il faut afficher 1.';
        if (/\bglobal\b/.test(strip(code))) return 'Ça marche avec <code>global</code>, mais essaie la manière propre : un paramètre et un <code>return</code>.';
        if (!/\breturn\b/.test(code)) return 'La fonction doit renvoyer la nouvelle valeur avec <code>return</code>.';
        return true;
      },
      ok:'Valeur en entrée par les paramètres, valeur en sortie par le <code>return</code> : avec cette règle, tu n’auras presque jamais besoin de <code>global</code>.',
      sol:`compteur = 0

def ajouter(c):
    return c + 1

compteur = ajouter(compteur)
print(compteur)` },
    { t:'code', defi:1, h:'Le combat simulé', file:'combat.py',
      p:`<p>Crée une fonction <code>combat(pv_heros, pv_monstre, force_heros, force_monstre)</code> qui simule un combat et <strong>renvoie</strong> <code>"victoire"</code> ou <code>"défaite"</code>.</p><p>À chaque tour, le héros frappe en premier (le monstre perd <code>force_heros</code> pv). Si le monstre est encore debout, il frappe à son tour. Le premier qui tombe à 0 pv ou moins a perdu.</p>`,
      code:``,
      hints:['Une boucle <code>while True:</code> dans la fonction. D’abord <code>pv_monstre -= force_heros</code>, et <code>if pv_monstre &lt;= 0: return "victoire"</code>.','Puis <code>pv_heros -= force_monstre</code> et <code>if pv_heros &lt;= 0: return "défaite"</code>. Le <code>return</code> arrête la boucle et la fonction en même temps.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'combat')) return noFn('combat');
        for (const [a, w] of [[[100, 30, 10, 5], 'victoire'], [[20, 100, 5, 10], 'defaite'], [[10, 10, 10, 50], 'victoire'], [[10, 20, 10, 10], 'defaite'], [[30, 30, 10, 10], 'victoire']]) {
          const e = `combat(${a.join(', ')})`;
          const x = await call(test, code, e);
          if (x.err) return callErr(e, x.err);
          if (x.val === 'None') return `<code>${e}</code> renvoie None : il manque un <code>return</code>.`;
          if (norm(x.val).replace(/['"]/g, '') !== w) return `<code>${e}</code> devrait renvoyer « ${w === 'defaite' ? 'défaite' : w} », et renvoie ${esc(x.val)}.${a[0] === 10 && a[3] === 50 ? ' Le héros frappe en premier : le monstre tombe avant d’avoir pu frapper.' : ''}`;
        }
        return true;
      },
      ok:'Cinq combats simulés, dont des fins très serrées. Toutes les variables vivent dans la fonction : tu peux lancer mille combats, aucun ne déborde sur un autre.',
      sol:`def combat(pv_heros, pv_monstre, force_heros, force_monstre):
    while True:
        pv_monstre -= force_heros
        if pv_monstre <= 0:
            return "victoire"
        pv_heros -= force_monstre
        if pv_heros <= 0:
            return "défaite"

print(combat(100, 30, 10, 5))` }
  ],
  recap:['Une variable créée dans une fonction est <strong>locale</strong> : elle disparaît à la fin de l’appel.','Une variable créée hors des fonctions est <strong>globale</strong> : une fonction peut la lire.','<code>x = …</code> dans une fonction crée une variable locale, même si une globale porte le même nom.','<code>global</code> existe mais on l’évite : on passe les valeurs en paramètres et on récupère le résultat avec <code>return</code>.','<code>UnboundLocalError</code> : tu modifies dans une fonction une variable qui vient du dehors.'] };

LES['4-6'] = { title:'Importer des modules : math et random', dur:'12 min',
  intro:'Python est livré avec des centaines de fonctions toutes prêtes, rangées dans des <strong>modules</strong>. Inutile de réinventer la racine carrée : il suffit de l’importer.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`n = 1

def f(n):
    n = n + 1
    return n

f(n)
print(n)`,
      opts:[ {l:'2', why:'Le n de la fonction est local. Et le résultat de <code>f(n)</code> n’est rangé nulle part.'},
             {l:'1', ok:1},
             {l:'None', why:'On affiche le n global, qui vaut 1.'},
             {l:'Une erreur', why:'Le code est valide : le paramètre n est juste une boîte locale.'} ],
      ex:'La fonction travaille sur sa copie locale et renvoie 2, mais personne ne récupère ce 2. Il aurait fallu <code>n = f(n)</code>.' },
    { t:'say', h:'Le module math', file:'maths.py',
      p:`<p>Un <strong>module</strong>, c'est un fichier rempli de fonctions et de variables utiles. On le charge avec <code>import</code>, une fois, en haut du fichier. Ensuite, on écrit <code>module.fonction()</code>.</p><ul><li><code>math.sqrt(x)</code> : la racine carrée</li><li><code>math.pi</code> : le nombre π</li><li><code>math.floor(x)</code> : arrondi vers le bas (le plancher)</li><li><code>math.ceil(x)</code> : arrondi vers le haut (le plafond)</li></ul>`,
      code:`import math

print(math.sqrt(16))
print(round(math.pi, 4))
print(math.floor(7.9))
print(math.ceil(7.1))` },
    { t:'quiz', h:'Plancher ou plafond ?', p:`<p>Qu'affiche ce code ?</p>`, snip:`import math
print(math.ceil(4.01))`,
      opts:[ {l:'4', why:'<code>ceil</code>, c’est le plafond : on arrondit toujours vers le haut, même pour un tout petit dépassement.'},
             {l:'4.01', why:'<code>ceil</code> renvoie un entier.'},
             {l:'5', ok:1},
             {l:'4.0', why:'C’est vers le haut, et le résultat est un entier.'} ],
      ex:'Dès qu’on dépasse 4, même de 0.01, le plafond est 5. Pratique pour compter des bus, des pizzas ou des pages : on ne peut pas en prendre 4.01.' },
    { t:'say', h:'Le module random', file:'hasard.py',
      p:`<p>Tu connais déjà <code>random.randint(a, b)</code>. Deux autres fonctions très utiles :</p><ul><li><code>random.choice(liste)</code> : un élément au hasard (on verra les listes au chapitre 5)</li><li><code>random.random()</code> : un nombre à virgule entre 0 et 1, parfait pour les probabilités</li></ul><p>On peut aussi importer une seule fonction avec <code>from module import fonction</code>. On l'utilise alors sans le nom du module devant.</p>`,
      code:`import random
from math import sqrt

arme = random.choice(["épée", "arc", "bâton magique"])
print("Tu trouves :", arme)
if random.random() < 0.2:
    print("Coup critique ! (20 % de chances)")
print(sqrt(25))` },
    { t:'quiz', h:'Le piège de l’import', p:`<p>Que se passe-t-il ?</p>`, snip:`import math
print(sqrt(9))`,
      opts:[ {l:'Ça affiche 3.0', why:'Avec <code>import math</code>, la fonction s’appelle <code>math.sqrt</code>. Le nom <code>sqrt</code> tout seul n’existe pas.'},
             {l:'Une NameError', ok:1},
             {l:'Ça affiche 3', why:'Le code ne va pas jusqu’au calcul : Python ne connaît pas <code>sqrt</code>.'},
             {l:'Une ImportError', why:'L’import s’est bien passé. C’est l’appel qui est mal écrit.'} ],
      ex:'Deux façons correctes : <code>import math</code> puis <code>math.sqrt(9)</code>, ou <code>from math import sqrt</code> puis <code>sqrt(9)</code>.' },
    { t:'code', h:'À toi : combien de pizzas ?', file:'pizzas.py',
      p:`<p>Une pizza a 8 parts. Crée une fonction <code>nb_pizzas(personnes, parts_par_personne=3)</code> qui renvoie le nombre de pizzas à commander pour que tout le monde ait ses parts. On ne commande pas de demi-pizza !</p><p>Pour 5 personnes à 3 parts, il faut 15 parts, donc 2 pizzas (16 parts).</p>`,
      code:`import math
`,
      hints:['Le nombre de parts : <code>personnes * parts_par_personne</code>. Divisé par 8, ça donne 1.875 pour 15 parts.','Il faut arrondir vers le haut : <code>return math.ceil(personnes * parts_par_personne / 8)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'nb_pizzas')) return noFn('nb_pizzas');
        for (const [e, w] of [['nb_pizzas(5)', 2], ['nb_pizzas(8)', 3], ['nb_pizzas(8, 2)', 2], ['nb_pizzas(1)', 1], ['nb_pizzas(4, parts_par_personne=4)', 2], ['nb_pizzas(0)', 0]]) {
          const x = await call(test, code, e);
          if (x.err) return callErr(e, x.err);
          if (x.val === 'None') return `<code>${e}</code> renvoie None : il manque le <code>return</code>.`;
          if (num(x.val) !== w) return `<code>${e}</code> devrait renvoyer ${w}, et renvoie ${esc(x.val)}.${num(x.val) === w - 1 ? ' Il faut arrondir <strong>vers le haut</strong>.' : !Number.isInteger(num(x.val)) ? ' Il faut un nombre entier de pizzas.' : ''}`;
        }
        return true;
      },
      ok:'Avec <code>math.ceil</code>, personne n’a faim. Et <code>//</code> n’aurait pas marché : 15 // 8 donne 1.',
      sol:`import math

def nb_pizzas(personnes, parts_par_personne=3):
    return math.ceil(personnes * parts_par_personne / 8)

print(nb_pizzas(5))` },
    { t:'code', defi:1, h:'Les dés du maître du jeu', file:'des.py',
      p:`<p>Crée deux fonctions :</p><ul><li><code>lancer(faces=6)</code> renvoie un nombre au hasard entre 1 et <code>faces</code>.</li><li><code>lancer_plusieurs(n, faces=6)</code> renvoie la <strong>somme</strong> de n lancers. Elle doit utiliser <code>lancer()</code>.</li></ul><p>Comme c'est du hasard, je lancerai tes dés des centaines de fois pour vérifier les résultats.</p>`,
      code:`import random
`,
      hints:['<code>def lancer(faces=6):</code> → <code>return random.randint(1, faces)</code>.','Dans <code>lancer_plusieurs</code> : un accumulateur <code>total = 0</code>, une boucle <code>for i in range(n):</code> avec <code>total += lancer(faces)</code>, puis <code>return total</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'lancer')) return noFn('lancer');
        if (!defined(code, 'lancer_plusieurs')) return noFn('lancer_plusieurs');
        const body = (strip(code).split(/^\s*def\s+lancer_plusieurs\s*\([^)]*\)\s*:/m)[1] || '').split(/^\S/m)[0];
        if (!/\blancer\s*\(/.test(body)) return '<code>lancer_plusieurs</code> doit appeler <code>lancer()</code>, au lieu de refaire le tirage.';
        const range = async (e, lo, hi) => {
          const x = await call(test, code, `[${e} for _ in range(600)]`);
          if (x.err) return callErr(e, x.err);
          const v = (x.val || '').replace(/[[\]\s]/g, '').split(',').map(Number);
          if (v.some(isNaN)) return `<code>${e}</code> doit renvoyer un nombre.`;
          if (Math.min(...v) < lo || Math.max(...v) > hi) return `<code>${e}</code> devrait toujours donner entre ${lo} et ${hi}, et j’ai obtenu ${Math.min(...v) < lo ? Math.min(...v) : Math.max(...v)}.`;
          if (new Set(v).size < Math.min(hi - lo + 1, 6) - 1) return `<code>${e}</code> donne presque toujours la même chose : est-ce bien du hasard ?`;
          if (!v.includes(lo) || !v.includes(hi)) return hi - lo < 30 ? `En 600 lancers de <code>${e}</code>, je n’ai jamais obtenu ${v.includes(lo) ? hi : lo}. Vérifie les bornes.` : true;
          return true;
        };
        for (const [e, lo, hi] of [['lancer()', 1, 6], ['lancer(20)', 1, 20], ['lancer_plusieurs(2)', 2, 12], ['lancer_plusieurs(3, 4)', 3, 12]]) {
          const v = await range(e, lo, hi);
          if (v !== true) return v;
        }
        return true;
      },
      ok:'Testé sur des centaines de lancers. Une fonction qui en réutilise une autre : si un jour tu veux des dés truqués, tu ne changes que <code>lancer</code>.',
      sol:`import random

def lancer(faces=6):
    return random.randint(1, faces)

def lancer_plusieurs(n, faces=6):
    total = 0
    for i in range(n):
        total += lancer(faces)
    return total

print(lancer_plusieurs(3))` },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code calcule l'aire d'un cercle. Il plante. Exécute-le, lis l'explication, puis répare-le.</p>`,
      code:`def aire_cercle(rayon):
    return math.pi * rayon ** 2

print(aire_cercle(2))`,
      hints:['Python ne connaît pas <code>math</code> : il n’a jamais été chargé.','Ajoute <code>import math</code> tout en haut du fichier.'],
      check:(r, code) => same(code, bugOf('4-6')) ? BUG : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : !/12\.56/.test(r.out) ? 'Il faut afficher l’aire d’un cercle de rayon 2 : environ 12.566.' : true,
      ok:'Un module oublié donne une <code>NameError</code> sur le nom du module. Les imports, on les met tous en haut du fichier pour les voir d’un coup d’œil.',
      sol:`import math

def aire_cercle(rayon):
    return math.pi * rayon ** 2

print(aire_cercle(2))` }
  ],
  recap:['<code>import math</code> puis <code>math.sqrt(x)</code>, <code>math.pi</code>, <code>math.floor(x)</code>, <code>math.ceil(x)</code>.','<code>from math import sqrt</code> puis <code>sqrt(x)</code>, sans le nom du module.','<code>random.randint(a, b)</code>, <code>random.choice(liste)</code>, <code>random.random()</code> (entre 0 et 1).','Les imports se mettent en haut du fichier. Un import oublié donne une <code>NameError</code>.'] };

/* Le projet : chaque étape reprend la précédente (carry). */
const B1 = `def barre_de_vie(pv, pv_max=100):
    nb = pv * 10 // pv_max
    return "[" + "#" * nb + "-" * (10 - nb) + f"] {pv}/{pv_max}"`;
const B2 = B1 + `

def subir(pv, degats):
    pv = pv - degats
    if pv < 0:
        pv = 0
    return pv`;
const B3 = B2 + `

def soigner(pv, soin, pv_max=100):
    pv = pv + soin
    if pv > pv_max:
        pv = pv_max
    return pv`;
const B4 = B3 + `

pv_heros = 100
pv_dragon = 60
degats_dragon = 35
while pv_heros > 0 and pv_dragon > 0:
    if pv_heros < 40:
        pv_heros = soigner(pv_heros, 50)
    pv_dragon = subir(pv_dragon, 20)
    if pv_dragon > 0:
        pv_heros = subir(pv_heros, degats_dragon)
    print("Héros", barre_de_vie(pv_heros), "| Dragon", barre_de_vie(pv_dragon, 60))
if pv_dragon == 0:
    print("Victoire !")
else:
    print("Défaite...")`;

LES['4-7'] = { title:'Projet : ta boîte à outils', dur:'15 min',
  intro:'Pour finir le chapitre, tu fabriques ta boîte à outils de jeu de rôle : des petites fonctions fiables, testées une par une, puis assemblées pour faire tourner un vrai combat contre un dragon.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`import math
print(math.floor(9.99))`,
      opts:[ {l:'10', why:'<code>floor</code>, c’est le plancher : on arrondit toujours vers le bas.'},
             {l:'9', ok:1},
             {l:'9.99', why:'<code>floor</code> renvoie un entier.'},
             {l:'Une erreur', why:'Le module est importé et la fonction bien appelée.'} ],
      ex:'Le plancher de 9.99 est 9. Pour arrondir au plus proche, on utilise <code>round()</code>.' },
    { t:'say', h:'Le projet',
      p:`<p>Tu vas écrire trois outils, puis un combat qui s'en sert. À la fin, ton programme affichera :</p>`,
      snip:`Héros [######----] 65/100 | Dragon [######----] 40/60
Héros [###-------] 30/100 | Dragon [###-------] 20/60
Héros [########--] 80/100 | Dragon [----------] 0/60
Victoire !`,
      p2:`<p>Chaque outil sera testé seul, comme le font les développeurs : on vérifie chaque brique avant de construire avec. À chaque étape, je reprends ton code de l'étape d'avant.</p>` },
    { t:'code', h:'Outil 1 : la barre de vie', file:'outils.py',
      p:`<p>Reprends ta barre de vie de la leçon 4.2, en mieux : <code>barre_de_vie(pv, pv_max=100)</code> doit maintenant <strong>renvoyer</strong> le texte au lieu de l'afficher. Comme ça, on pourra le mettre où on veut.</p><pre class="snippet">barre_de_vie(65)       →   "[######----] 65/100"
barre_de_vie(20, 60)   →   "[###-------] 20/60"</pre>`,
      code:`# Outil 1
`,
      hints:['<code>nb = pv * 10 // pv_max</code>, comme avant.','<code>return "[" + "#" * nb + "-" * (10 - nb) + f"] {pv}/{pv_max}"</code>'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'barre_de_vie')) return noFn('barre_de_vie');
        for (const [e, w] of [['barre_de_vie(65)', '[######----] 65/100'], ['barre_de_vie(20, 60)', '[###-------] 20/60'], ['barre_de_vie(0, 60)', '[----------] 0/60'], ['barre_de_vie(100)', '[##########] 100/100']]) {
          const x = await during(test, code, e);
          if (x.err) return callErr(e, x.err);
          if (x.val === 'None') return `<code>${e}</code> renvoie None. Remplace le <code>print</code> par un <code>return</code>.`;
          if (x.val.slice(1, -1) !== w) return `<code>${e}</code> devrait renvoyer <code>"${w}"</code>, et renvoie <code>${esc(x.val)}</code>.${e === 'barre_de_vie(65)' ? ' Le deuxième paramètre doit valoir 100 par défaut.' : ''}`;
          if (x.said.trim()) return 'La fonction ne doit rien afficher : elle renvoie le texte.';
        }
        return true;
      },
      ok:'Outil 1 validé. Il renvoie son texte : on pourra le coller dans n’importe quel affichage.',
      sol:B1 },
    { t:'code', carry:1, h:'Outil 2 : subir des dégâts', file:'outils.py',
      p:`<p>Ajoute une fonction <code>subir(pv, degats)</code> qui renvoie les pv après les dégâts, <strong>sans jamais descendre sous 0</strong>. Un héros à -15 pv, ça n'a pas de sens, et ça casserait ta barre de vie.</p>`,
      code:`# Outil 2
`,
      hints:['<code>pv = pv - degats</code>, puis <code>if pv &lt; 0: pv = 0</code>.','N’oublie pas le <code>return pv</code> à la fin.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'subir')) return noFn('subir');
        for (const [e, w] of [['subir(100, 35)', 65], ['subir(20, 35)', 0], ['subir(35, 35)', 0], ['subir(50, 0)', 50]]) {
          const x = await call(test, code, e);
          if (x.err) return callErr(e, x.err);
          if (x.val === 'None') return `<code>${e}</code> renvoie None : il manque le <code>return</code>.`;
          if (num(x.val) !== w) return `<code>${e}</code> devrait renvoyer ${w}, et renvoie ${esc(x.val)}.`;
        }
        const x = await call(test, code, 'barre_de_vie(65)');
        if (x.err || x.val !== '\'[######----] 65/100\'') return 'Garde ton outil 1 qui marchait : <code>barre_de_vie</code> ne répond plus correctement.';
        return true;
      },
      ok:'Outil 2 validé, et l’outil 1 marche toujours. Vérifier qu’on n’a rien cassé en ajoutant du code : ça s’appelle un test de non-régression.',
      sol:B2 },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Avec ton outil <code>subir</code>, qu'affiche ce code ?</p>`, snip:`def subir(pv, degats):
    pv = pv - degats
    if pv < 0:
        pv = 0
    return pv

print(subir(subir(50, 30), 30))`,
      opts:[ {l:'-10', why:'C’est justement ce que la fonction empêche : elle ne descend jamais sous 0.'},
             {l:'20', why:'Il y a deux appels : 50 - 30 = 20, puis on retire encore 30.'},
             {l:'0', ok:1},
             {l:'Une erreur', why:'On peut donner le résultat d’un appel comme argument d’un autre appel.'} ],
      ex:'Le premier appel renvoie 20. Le second calcule 20 - 30 = -10, puis le ramène à 0. Les deux outils s’enchaînent sans surprise : c’est le but.' },
    { t:'code', carry:1, h:'Outil 3 : se soigner', file:'outils.py',
      p:`<p>Ajoute <code>soigner(pv, soin, pv_max=100)</code> qui renvoie les pv après le soin, <strong>sans jamais dépasser</strong> <code>pv_max</code>.</p>`,
      code:`# Outil 3
`,
      hints:['C’est le miroir de <code>subir</code> : <code>pv = pv + soin</code>, puis <code>if pv &gt; pv_max: pv = pv_max</code>.','Et <code>return pv</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'soigner')) return noFn('soigner');
        for (const [e, w] of [['soigner(30, 50)', 80], ['soigner(80, 50)', 100], ['soigner(50, 20, 60)', 60], ['soigner(10, 5, 60)', 15]]) {
          const x = await call(test, code, e);
          if (x.err) return callErr(e, x.err);
          if (x.val === 'None') return `<code>${e}</code> renvoie None : il manque le <code>return</code>.`;
          if (num(x.val) !== w) return `<code>${e}</code> devrait renvoyer ${w}, et renvoie ${esc(x.val)}.`;
        }
        const x = await call(test, code, 'subir(20, 35)');
        if (x.err || x.val !== '0') return 'Garde ton outil 2 qui marchait : <code>subir</code> ne répond plus correctement.';
        return true;
      },
      ok:'Ta boîte à outils est complète. Trois fonctions courtes, chacune testée. Place au combat !',
      sol:B3 },
    { t:'code', carry:1, defi:1, h:'Le combat contre le dragon', file:'outils.py',
      p:`<p>Sous tes outils, écris le combat. Le héros a <code>pv_heros = 100</code>, le dragon <code>pv_dragon = 60</code>, et le dragon inflige <code>degats_dragon = 35</code>. Tant que les deux sont debout, un tour se passe ainsi :</p><ol><li>si le héros a moins de 40 pv, il boit une potion de 50 (<code>soigner</code>) ;</li><li>le héros frappe : le dragon subit 20 dégâts ;</li><li>si le dragon est encore debout, il frappe : le héros subit <code>degats_dragon</code> ;</li><li>on affiche les deux barres, comme dans l'exemple (le dragon a 60 pv max).</li></ol><p>À la fin, affiche <code>Victoire !</code> ou <code>Défaite...</code>. Je testerai aussi avec un dragon plus fort.</p>`,
      code:`# Le combat
pv_heros = 100
pv_dragon = 60
degats_dragon = 35
`,
      hints:['La boucle : <code>while pv_heros &gt; 0 and pv_dragon &gt; 0:</code>. Dedans : <code>if pv_heros &lt; 40: pv_heros = soigner(pv_heros, 50)</code>, puis <code>pv_dragon = subir(pv_dragon, 20)</code>.','Puis <code>if pv_dragon &gt; 0: pv_heros = subir(pv_heros, degats_dragon)</code> et <code>print("Héros", barre_de_vie(pv_heros), "| Dragon", barre_de_vie(pv_dragon, 60))</code>. Après la boucle : <code>if pv_dragon == 0:</code> …'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        for (const f of ['soigner', 'subir', 'barre_de_vie']) {
          const after = strip(code).split(/^pv_heros\s*=/m).slice(1).join('');
          if (!new RegExp('\\b' + f + '\\s*\\(').test(after)) return `Ton combat doit utiliser ton outil <code>${f}()</code>.`;
        }
        const ls = linesOf(r.out).map(l => l.replace(/\s+/g, ' '));
        const want = ['[######----] 65/100', '[######----] 40/60', '[###-------] 30/100', '[###-------] 20/60', '[########--] 80/100', '[----------] 0/60'];
        for (const w of want) if (!ls.some(l => l.includes(w))) return `Il manque une barre dans l’affichage : <code>${w}</code>. Compare ton affichage à celui de l’exemple, tour par tour.`;
        if (ls.length !== 4) return `Il faut 3 lignes de combat (une par tour) puis le résultat, et j’en compte ${ls.length}.`;
        if (!/victoire/i.test(ls[3]) || /d[ée]faite/i.test(ls.join(' '))) return 'Le héros gagne : la dernière ligne doit être <code>Victoire !</code>.';
        const t = await test([], code.replace(/degats_dragon\s*=\s*35/, 'degats_dragon = 60'));
        if (t.err) return `Avec un dragon qui fait 60 dégâts, ton code plante : ${esc(t.err.title)}.`;
        const l2 = linesOf(t.out);
        if (!/d[ée]faite/i.test(l2[l2.length - 1] || '')) return 'Avec un dragon qui fait 60 dégâts, le héros perd au 2e tour : la dernière ligne doit être <code>Défaite...</code>.';
        if (!t.out.includes('0/100')) return 'Avec un dragon qui fait 60 dégâts, la barre du héros doit finir à <code>0/100</code>.';
        return true;
      },
      ok:'Le dragon est vaincu, et tes outils ont fait tout le travail. Le combat se lit presque comme une phrase : c’est la récompense quand on découpe bien en fonctions.',
      sol:B4 },
    { t:'code', bug:1, h:'Répare le bug : le return trop pressé', file:'bug.py',
      p:`<p>Cette fonction devrait additionner les dégâts de toutes les attaques : 35 pour <code>[5, 10, 20]</code>. Elle renvoie 5. Exécute-la, trouve pourquoi, puis répare-la.</p>`,
      code:`def total_degats(attaques):
    total = 0
    for a in attaques:
        total += a
        return total

print(total_degats([5, 10, 20]))`,
      hints:['Le <code>return</code> est décalé comme le <code>total += a</code> : il est donc dans la boucle. Que fait <code>return</code> dès qu’il est atteint ?','Recule le <code>return total</code> de 4 espaces, au niveau du <code>for</code> : il s’exécutera après la boucle.'],
      check:async (r, code, test) => {
        if (same(code, bugOf('4-7'))) return BUG;
        if (r.err) return ERR;
        for (const [l, w] of [['[5, 10, 20]', 35], ['[7]', 7], ['[]', 0]]) {
          const x = await call(test, code, `total_degats(${l})`);
          if (x.err) return callErr(`total_degats(${l})`, x.err);
          if (num(x.val) !== w) return `<code>total_degats(${l})</code> devrait renvoyer ${w}, et renvoie ${esc(x.val)}.${x.val === 'None' ? ' Avec une liste vide, on n’entre jamais dans la boucle : le <code>return</code> doit être après.' : ''}`;
        }
        return true;
      },
      ok:'Un <code>return</code> dans la boucle arrête tout au premier tour. Encore un bug d’indentation qui ne fait aucune erreur, juste un mauvais résultat.',
      sol:`def total_degats(attaques):
    total = 0
    for a in attaques:
        total += a
    return total

print(total_degats([5, 10, 20]))` },
    { t:'say', h:'Bravo, et un défi pour VS Code',
      p:`<p>Ta boîte à outils est prête, et ton combat se lit comme une histoire. Garde-la dans VS Code dans un fichier <code>outils.py</code>.</p><p>Défi bonus : ajoute un outil <code>attaque(force)</code> qui renvoie <code>force * 2 + random.randint(1, 6)</code>, avec 1 chance sur 10 de coup critique (dégâts doublés). Puis utilise-le dans le combat, et demande au joueur s'il veut frapper ou boire une potion à chaque tour.</p><p>Au chapitre 5, on apprendra à ranger beaucoup de données d'un coup : un inventaire, une équipe de héros, une liste de monstres.</p>` }
  ],
  recap:['Une fonction = une tâche, avec un nom clair. Courte, testée seule.','Les outils <strong>renvoient</strong> (<code>return</code>), le programme principal <strong>affiche</strong>.','Les valeurs par défaut rendent les appels courants plus simples : <code>barre_de_vie(65)</code>.','Après chaque ajout, revérifie que l’ancien code marche toujours.','Un programme bien découpé en fonctions se lit presque comme du français.'] };

Atelier.chapter({ part:"bases", n:4, title:"Les fonctions",
  lessons:['4-1','4-2','4-3','4-4','4-5','4-6','4-7'].map(id => ({ id, ...LES[id] })) });
})();
