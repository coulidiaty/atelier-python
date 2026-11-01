/* Partie 1 · Chapitre 2 : Prendre des décisions */
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
    if (!says(o, want)) return `${q}, je devrais lire « ${esc(want)} ».${o.trim() ? ` J’ai lu : <code>${esc(o.trim().slice(0, 120))}</code>` : ' Rien ne s’affiche.'}`;
    for (const b of bad) if (says(o, b)) return `${q}, je lis « ${esc(b)} » alors que ça ne devrait pas s’afficher.`;
  }
  return true;
}
const BUG = 'Voilà le bug ! Exécute, lis ce qui se passe, puis corrige le code.';
const same = (code, start) => code.trim() === start.trim();

LES['2-1'] = { title:'Comparer des valeurs', dur:'10 min',
  intro:'Un programme intelligent prend des décisions : « si le héros n’a plus de vie, la partie est finie ». Avant de décider, il faut savoir comparer. C’est le sujet de cette leçon.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur le chapitre 1', p:`<p>Le joueur tape <code>7</code>. Qu'affiche ce code ?</p>`, snip:`force = input("Force ? ")
print(force * 2)`,
      opts:[ {l:'14', why:'C’est le piège : <code>input()</code> renvoie du texte. <code>"7" * 2</code> répète le texte.'},
             {l:'77', ok:1},
             {l:'7 * 2', why:'Python ne recopie pas le calcul : il l’exécute. Mais sur du texte, <code>*</code> répète.'},
             {l:'Une erreur', why:'Multiplier un texte par un entier est permis : ça le répète.'} ],
      ex:'<code>force</code> contient le texte "7", et <code>"7" * 2</code> donne "77". Il fallait <code>int(input(...))</code> pour obtenir 14.' },
    { t:'say', h:'Les six comparaisons', file:'comparer.py',
      p:`<p>Une comparaison pose une question à Python. Il répond <code>True</code> (vrai) ou <code>False</code> (faux).</p><ul><li><code>==</code> égal et <code>!=</code> différent</li><li><code>&lt;</code> plus petit et <code>&gt;</code> plus grand</li><li><code>&lt;=</code> plus petit ou égal et <code>&gt;=</code> plus grand ou égal</li></ul><p>Le signe <code>=</code> se met toujours en deuxième : <code>&gt;=</code>, jamais <code>=&gt;</code>.</p>`,
      code:`pv = 30
print(pv == 30)
print(pv != 30)
print(pv < 50)
print(pv >= 100)` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`niveau = 5
print(niveau <= 5)`,
      opts:[ {l:'False', why:'<code>&lt;=</code> veut dire « plus petit <strong>ou égal</strong> ». 5 est égal à 5, donc c’est vrai.'},
             {l:'5', why:'Une comparaison ne renvoie jamais un nombre : elle renvoie True ou False.'},
             {l:'True', ok:1},
             {l:'Une erreur', why:'<code>&lt;=</code> est un opérateur tout à fait valide.'} ],
      ex:'5 est plus petit ou égal à 5 : c’est <code>True</code>. Avec <code>&lt;</code> tout seul, on aurait eu <code>False</code>.' },
    { t:'say', h:'Comparer du texte', file:'texte.py',
      p:`<p>On peut aussi comparer du texte. Python compare <strong>lettre par lettre</strong>, et il est très strict : une majuscule ou un espace en plus, et ce n'est plus égal.</p><p>Comparer un texte et un nombre avec <code>==</code> ne plante pas : la réponse est simplement <code>False</code>, car ce ne sont pas le même type de chose.</p>`,
      code:`print("Sam" == "Sam")
print("Sam" == "sam")
print("Sam" == "Sam ")
print("19" == 19)` },
    { t:'quiz', h:'Le retour du piège de input()', p:`<p>Le joueur tape <code>19</code>. Qu'affiche ce code ?</p>`, snip:`age = input("Ton âge ? ")
print(age == 19)`,
      opts:[ {l:'True', why:'<code>age</code> contient le texte "19", et un texte n’est jamais égal à un nombre.'},
             {l:'False', ok:1},
             {l:'19', why:'Une comparaison affiche True ou False, pas la valeur.'},
             {l:'Une erreur', why:'Avec <code>==</code>, Python ne plante pas : il répond juste False. (Avec <code>&lt;</code> ou <code>&gt;</code>, là, il planterait.)'} ],
      ex:'"19" (texte) n’est pas égal à 19 (nombre). Ce bug est silencieux : pas d’erreur, juste un mauvais résultat. Convertis toujours avec <code>int()</code>.' },
    { t:'say', h:'Ranger une réponse dans une boîte', file:'ranger.py', mem:1,
      p:`<p>Le résultat d'une comparaison est une valeur comme une autre, de type <code>bool</code>. On peut donc le ranger dans une variable.</p><p>Python permet aussi d'enchaîner les comparaisons, comme en maths : <code>0 &lt;= note &lt;= 20</code> vérifie que la note est entre 0 et 20. Dans d'autres langages, comme le C, ça ne marche pas.</p>`,
      code:`age = 17
note = 14
est_majeur = age >= 18
note_valide = 0 <= note <= 20
print(est_majeur, note_valide)` },
    { t:'code', h:'À toi : le héros légendaire', file:'legende.py', mem:1,
      p:`<p>Un héros est <strong>légendaire</strong> si sa force dépasse 8. Crée une variable <code>legendaire</code> qui contient le résultat de cette comparaison, puis affiche-la.</p><p>N'écris pas <code>True</code> toi-même : je testerai aussi ton code avec une force de 5.</p>`,
      code:`force = 9
`,
      hints:['« Dépasse 8 » veut dire « plus grand que 8 » : <code>force &gt; 8</code>.','<code>legendaire = force &gt; 8</code>, puis <code>print(legendaire)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const m = memOf(r, 'legendaire');
        if (!m) return 'Je ne trouve pas de boîte <code>legendaire</code>.';
        if (m.type !== 'bool') return '<code>legendaire</code> doit contenir True ou False : le résultat d’une comparaison.';
        if (/\b(True|False)\b/.test(strip(code))) return 'Tu as écrit True ou False toi-même. Laisse Python comparer avec <code>&gt;</code>.';
        if (m.repr !== 'True') return 'Avec une force de 9, le héros devrait être légendaire. Vérifie le sens de ta comparaison.';
        if (!/True/.test(r.out)) return 'La boîte est bonne. Affiche-la avec <code>print()</code>.';
        for (const [f, v] of [['5', 'False'], ['8', 'False'], ['10', 'True']]) {
          const t = await test([], code.replace(/force\s*=\s*\d+/, 'force = ' + f));
          const mt = memOf(t, 'legendaire');
          if (t.err || !mt || mt.repr !== v) return `Avec une force de ${f}, <code>legendaire</code> devrait valoir ${v}.${f === '8' ? ' 8 ne <strong>dépasse</strong> pas 8 : utilise <code>&gt;</code>, pas <code>&gt;=</code>.' : ''}`;
        }
        return true;
      },
      ok:'Testé avec 9, 8, 5 et 10 : c’est juste à chaque fois. Remarque que 8 ne dépasse pas 8 : le choix entre <code>&gt;</code> et <code>&gt;=</code> compte.',
      sol:`force = 9
legendaire = force > 8
print(legendaire)` },
    { t:'code', defi:1, h:'Pair ou pas ?', file:'pair.py', mem:1,
      p:`<p>Crée une variable <code>est_pair</code> qui vaut <code>True</code> si <code>n</code> est pair, et <code>False</code> sinon. Affiche-la.</p><p>Souviens-toi du chapitre 1 : un nombre est pair quand le reste de sa division par 2 vaut 0.</p>`,
      code:`n = 14
`,
      hints:['Le reste de la division par 2 : <code>n % 2</code>.','<code>est_pair = n % 2 == 0</code>. Python calcule d’abord <code>n % 2</code>, puis compare avec 0.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const m = memOf(r, 'est_pair');
        if (!m) return 'Je ne trouve pas de boîte <code>est_pair</code>.';
        if (m.type !== 'bool') return `<code>est_pair</code> contient ${esc(m.repr)}. Il faut True ou False : compare <code>n % 2</code> avec quelque chose.`;
        if (/\b(True|False)\b/.test(strip(code))) return 'Pas de True ou False écrit à la main : c’est la comparaison qui doit le produire.';
        for (const [n, v] of [['14', 'True'], ['7', 'False'], ['0', 'True'], ['33', 'False']]) {
          const t = await test([], code.replace(/n\s*=\s*\d+/, 'n = ' + n));
          const mt = memOf(t, 'est_pair');
          if (t.err || !mt || mt.repr !== v) return `Avec n = ${n}, <code>est_pair</code> devrait valoir ${v}.`;
        }
        if (!/True/.test(r.out)) return 'Le calcul est bon. Il reste à l’afficher.';
        return true;
      },
      ok:'Testé avec 14, 7, 0 et 33. <code>n % 2 == 0</code> est l’un des tests les plus utilisés en programmation.',
      sol:`n = 14
est_pair = n % 2 == 0
print(est_pair)` },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce programme demande une note et dit si elle vaut au moins 10. Il plante. Exécute-le, tape une note, lis l'explication, puis répare-le.</p>`,
      code:`note = input("Ta note ? ")
print(note >= 10)`,
      hints:['Lis l’erreur : on compare du texte avec un nombre.','Mets <code>float()</code> autour de <code>input(...)</code>, pour accepter aussi 12.5.'],
      check:async (r, code, test) => {
        if (same(code, LES['2-1'].steps[8].code)) return BUG;
        for (const [n, v] of [['12', 'True'], ['8', 'False'], ['10', 'True'], ['9.5', 'False']]) {
          const t = await test([n]);
          if (t.err) return `Quand je réponds ${n}, ton code plante : ${esc(t.err.title)}.${n === '9.5' ? ' Une note peut avoir une virgule : <code>float()</code> accepte 9.5, <code>int()</code> non.' : ''}`;
          if (!tail(t, [n]).includes(v)) return `Quand je réponds ${n}, je devrais lire ${v}.`;
        }
        return true;
      },
      ok:'Comparer un texte avec un nombre en utilisant <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code> ou <code>&gt;=</code> donne une <code>TypeError</code>. La solution est toujours la même : convertir.',
      sol:`note = float(input("Ta note ? "))
print(note >= 10)`, solIn:['12'] }
  ],
  recap:['Six comparaisons : <code>==</code> <code>!=</code> <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code>. Elles donnent <code>True</code> ou <code>False</code>.','<code>==</code> compare, <code>=</code> range dans une boîte.','Le texte se compare lettre par lettre : <code>"Sam" == "sam"</code> vaut <code>False</code>.','<code>"19" == 19</code> vaut <code>False</code>, et <code>"19" &lt; 20</code> plante : convertis les <code>input()</code>.','On peut enchaîner : <code>0 &lt;= note &lt;= 20</code>.'] };

LES['2-2'] = { title:'if et else', dur:'12 min',
  intro:'Maintenant que tu sais comparer, ton programme va pouvoir choisir : faire une chose si c’est vrai, une autre sinon.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`or_ = 50
print(or_ >= 50)`,
      opts:[ {l:'False', why:'<code>&gt;=</code> veut dire « plus grand ou égal ». 50 est égal à 50.'},
             {l:'50', why:'Une comparaison donne True ou False.'},
             {l:'Une erreur', why:'<code>or_</code> est un nom valide. (On met un <code>_</code> parce que <code>or</code> tout seul est un mot réservé de Python.)'},
             {l:'True', ok:1} ],
      ex:'50 est plus grand ou égal à 50 : <code>True</code>.' },
    { t:'say', h:'Si…', file:'si.py',
      p:`<p>Avec <code>if</code> (« si »), Python exécute un bloc de code <strong>seulement si</strong> la condition est vraie. Deux règles à respecter :</p><ul><li>la ligne du <code>if</code> finit par deux-points <code>:</code></li><li>les lignes du bloc sont décalées de <strong>4 espaces</strong>. C'est ce décalage, l'<em>indentation</em>, qui dit à Python où le bloc commence et où il s'arrête.</li></ul><p>Exécute, puis change <code>pv</code> en 20 et exécute encore.</p>`,
      code:`pv = 0
if pv <= 0:
    print("Ton héros est K.O.")
    print("Game over")
print("Fin du tour")` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`pv = 20
if pv <= 0:
    print("Game over")
print("Fin du tour")`,
      opts:[ {l:'Game over puis Fin du tour', why:'20 n’est pas plus petit ou égal à 0 : la condition est fausse, le bloc décalé est sauté.'},
             {l:'Fin du tour', ok:1},
             {l:'Rien du tout', why:'La dernière ligne n’est pas décalée : elle ne fait pas partie du bloc du <code>if</code>, elle s’exécute toujours.'},
             {l:'Game over', why:'La condition est fausse, donc « Game over » n’est pas affiché.'} ],
      ex:'La condition est fausse : Python saute le bloc décalé. La dernière ligne est collée à gauche, elle s’exécute dans tous les cas.' },
    { t:'say', h:'…sinon', file:'sinon.py', solIn:['19'],
      p:`<p><code>else</code> (« sinon ») ajoute un deuxième bloc, exécuté quand la condition est <strong>fausse</strong>. Il n'a pas de condition, juste deux-points.</p><p>Remarque : <code>else</code> est aligné avec son <code>if</code>. Exécute deux fois, avec un âge au-dessus de 18 puis en dessous.</p>`,
      code:`age = int(input("Ton âge ? "))
if age >= 18:
    print("Tu peux passer le permis.")
else:
    print(f"Encore {18 - age} an(s) à attendre.")
print("Merci !")` },
    { t:'quiz', h:'Le budget pizza', p:`<p>Qu'affiche ce code ?</p>`, snip:`argent = 8
if argent >= 10:
    print("Pizza !")
    argent = argent - 10
else:
    print("Pâtes...")
print(argent)`,
      opts:[ {l:'Pâtes... puis 8', ok:1},
             {l:'Pizza ! puis -2', why:'8 n’est pas plus grand ou égal à 10 : c’est le bloc du <code>else</code> qui s’exécute.'},
             {l:'Pâtes... puis -2', why:'La ligne <code>argent = argent - 10</code> est dans le bloc du <code>if</code>. Ce bloc est sauté, donc l’argent ne change pas.'},
             {l:'Pizza ! puis Pâtes... puis 8', why:'Python exécute <strong>un seul</strong> des deux blocs : celui du <code>if</code> ou celui du <code>else</code>, jamais les deux.'} ],
      ex:'Un seul bloc s’exécute. Ici, c’est le <code>else</code>. Toutes les lignes décalées sous le <code>if</code> sont sautées ensemble.' },
    { t:'code', h:'À toi : héros légendaire ou pas ?', file:'titre.py',
      p:`<p>Demande la force du héros (un nombre entier). Si elle dépasse 8, affiche <code>Héros légendaire</code>. Sinon, affiche <code>Héros en formation</code>.</p><p>Je testerai avec 9, 5 et 8.</p>`,
      code:``,
      hints:['Commence par <code>force = int(input("Force ? "))</code>.','<code>if force &gt; 8:</code>, une ligne décalée avec le premier <code>print</code>, puis <code>else:</code> et le second <code>print</code>, décalé lui aussi.'],
      check:async (r, code, test) => {
        if (nInputs(code) < 1) return 'Il faut demander la force avec <code>input()</code>.';
        if (!/\bif\b/.test(code) || !/\belse\b/.test(code)) return 'Il faut un <code>if</code> et un <code>else</code>.';
        return cases(test, [[['9'], 'legendaire', ['formation']], [['5'], 'formation', ['legendaire']], [['8'], 'formation', ['legendaire']]]);
      },
      ok:'Testé avec 9, 5 et 8. Ton programme réagit enfin à ce qu’on lui donne.',
      sol:`force = int(input("Force ? "))
if force > 8:
    print("Héros légendaire")
else:
    print("Héros en formation")`, solIn:['9'] },
    { t:'code', defi:1, h:'Le videur du donjon', file:'donjon.py',
      p:`<p>La porte du donjon ne s'ouvre qu'avec un nombre pair. Demande un nombre entier. S'il est pair, affiche <code>La porte s'ouvre.</code> Sinon, affiche <code>La porte reste fermée.</code></p><p>Je testerai avec 14, 7 et 0.</p>`,
      code:``,
      hints:['Pair veut dire : <code>n % 2 == 0</code>.','<code>n = int(input("Un nombre ? "))</code>, puis <code>if n % 2 == 0:</code> … <code>else:</code> …'],
      check:async (r, code, test) => {
        if (nInputs(code) < 1) return 'Il faut demander un nombre avec <code>input()</code>.';
        return cases(test, [[['14'], 's\'ouvre', ['fermee']], [['7'], 'fermee', ['s\'ouvre']], [['0'], 's\'ouvre', ['fermee']]]);
      },
      ok:'0 est bien pair : 0 % 2 vaut 0. Tu viens de combiner input, conversion, calcul et condition.',
      sol:`n = int(input("Un nombre ? "))
if n % 2 == 0:
    print("La porte s'ouvre.")
else:
    print("La porte reste fermée.")`, solIn:['14'] },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code devrait afficher <code>Game over</code>. Il plante. Exécute-le, lis l'explication, puis répare-le.</p>`,
      code:`pv = 0
if pv <= 0
    print("Game over")`,
      hints:['L’explication parle d’un caractère oublié. Regarde la fin de la ligne du <code>if</code>.','Une ligne <code>if</code> finit toujours par deux-points <code>:</code>.'],
      check:(r, code) => same(code, LES['2-2'].steps[7].code) ? BUG : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : !/Game over/i.test(r.out) ? 'Plus d’erreur, mais il faut afficher <code>Game over</code>.' : true,
      ok:'Les deux-points oubliés, c’est la <code>SyntaxError</code> la plus fréquente avec <code>if</code>. Ton œil va vite apprendre à la repérer.',
      sol:`pv = 0
if pv <= 0:
    print("Game over")` }
  ],
  recap:['<code>if condition:</code> exécute le bloc décalé seulement si la condition est vraie.','<code>else:</code> exécute un autre bloc quand elle est fausse. Un seul des deux blocs s’exécute.','La ligne du <code>if</code> et celle du <code>else</code> finissent par <code>:</code>.','Le bloc est décalé de 4 espaces. Une ligne collée à gauche ne fait plus partie du bloc.'] };

LES['2-3'] = { title:'elif : plusieurs cas', dur:'12 min',
  intro:'La vie ne se résume pas à oui ou non. Pour choisir entre trois, quatre ou dix cas, Python a <code>elif</code>.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`x = 3
if x > 5:
    print("grand")
else:
    print("petit")
print("fini")`,
      opts:[ {l:'grand puis fini', why:'3 n’est pas plus grand que 5 : c’est le <code>else</code> qui s’exécute.'},
             {l:'petit', why:'La dernière ligne n’est pas décalée : elle s’exécute toujours, après le <code>if</code>/<code>else</code>.'},
             {l:'petit puis fini', ok:1},
             {l:'grand puis petit puis fini', why:'Un seul des deux blocs s’exécute.'} ],
      ex:'La condition est fausse, donc <code>else</code>. Puis la ligne collée à gauche s’exécute dans tous les cas.' },
    { t:'say', h:'Sinon si…', file:'etat.py',
      p:`<p><code>elif</code> veut dire « sinon si ». On peut en mettre autant qu'on veut entre le <code>if</code> et le <code>else</code>.</p><p>Python teste les conditions <strong>dans l'ordre, de haut en bas</strong>. Dès qu'il en trouve une vraie, il exécute son bloc et <strong>saute tout le reste</strong>. Le <code>else</code> final attrape tous les cas qui restent.</p><p>Change <code>pv</code> pour voir chaque message.</p>`,
      code:`pv = 45
if pv > 70:
    print("En pleine forme")
elif pv > 30:
    print("Blessé")
elif pv > 0:
    print("Gravement blessé")
else:
    print("K.O.")` },
    { t:'quiz', h:'Combien de messages ?', p:`<p>Avec <code>pv = 80</code> dans le code d'avant, qu'est-ce qui s'affiche ?</p>`,
      opts:[ {l:'En pleine forme, Blessé et Gravement blessé', why:'80 &gt; 30 est vrai aussi, mais Python s’arrête à la <strong>première</strong> condition vraie.'},
             {l:'En pleine forme', ok:1},
             {l:'Gravement blessé', why:'Python lit de haut en bas : la première condition, <code>pv &gt; 70</code>, est déjà vraie.'},
             {l:'K.O.', why:'Le <code>else</code> ne s’exécute que si toutes les conditions au-dessus sont fausses.'} ],
      ex:'Une chaîne <code>if</code> / <code>elif</code> / <code>else</code> exécute <strong>un seul</strong> bloc : le premier dont la condition est vraie.' },
    { t:'say', h:'Plusieurs if, ce n’est pas pareil', file:'difference.py',
      p:`<p>Attention : trois <code>if</code> à la suite, ce sont trois questions indépendantes. Python les teste <strong>toutes</strong>. Avec <code>elif</code>, il s'arrête à la première réponse vraie.</p><p>Exécute et compare les deux affichages.</p>`,
      code:`pv = 80
print("Avec des if :")
if pv > 70:
    print("  En pleine forme")
if pv > 30:
    print("  Blessé")
print("Avec elif :")
if pv > 70:
    print("  En pleine forme")
elif pv > 30:
    print("  Blessé")` },
    { t:'quiz', h:'L’ordre compte', p:`<p>Qu'affiche ce code ?</p>`, snip:`pv = 90
if pv > 0:
    print("Vivant")
elif pv > 50:
    print("En forme")
else:
    print("K.O.")`,
      opts:[ {l:'En forme', why:'C’est ce qu’on voudrait, mais Python teste d’abord <code>pv &gt; 0</code>, qui est vrai. Il ne regarde même pas la suite.'},
             {l:'Vivant puis En forme', why:'Avec <code>elif</code>, un seul bloc s’exécute.'},
             {l:'K.O.', why:'90 est positif : la première condition est vraie.'},
             {l:'Vivant', ok:1} ],
      ex:'Avec cet ordre, « En forme » ne s’affichera <strong>jamais</strong> : tout nombre plus grand que 50 est aussi plus grand que 0. La règle : on met la condition la plus <strong>exigeante</strong> en premier.' },
    { t:'code', h:'À toi : le prix du billet', file:'billet.py',
      p:`<p>Demande l'âge du voyageur, puis affiche le prix de son billet de train :</p><ul><li>moins de 4 ans : <code>Gratuit</code></li><li>moins de 26 ans : <code>15 €</code></li><li>65 ans ou plus : <code>20 €</code></li><li>sinon : <code>30 €</code></li></ul><p>Je testerai avec 2, 19, 70, 40 et aussi 4 et 26, les cas limites.</p>`,
      code:``,
      hints:['Une chaîne <code>if age &lt; 4:</code> … <code>elif age &lt; 26:</code> … <code>elif age &gt;= 65:</code> … <code>else:</code> …','Comme la première condition attrape les moins de 4 ans, <code>elif age &lt; 26</code> ne concerne que les 4 à 25 ans. Pas besoin de vérifier les deux bornes.'],
      check:async (r, code, test) => {
        if (nInputs(code) < 1) return 'Il faut demander l’âge avec <code>input()</code>.';
        if (!/\belif\b/.test(code)) return 'Utilise <code>elif</code> pour enchaîner les cas.';
        return cases(test, [[['2'], 'gratuit', ['15', '20', '30']], [['19'], '15', ['gratuit', '20', '30']], [['70'], '20', ['gratuit', '15', '30']], [['40'], '30', ['gratuit', '15', '20']], [['4'], '15', ['gratuit']], [['26'], '30', ['15']]]);
      },
      ok:'Six cas testés, dont les limites 4 et 26. Ce sont toujours les bornes qui cachent les bugs : pense à les tester toi-même.',
      sol:`age = int(input("Ton âge ? "))
if age < 4:
    print("Gratuit")
elif age < 26:
    print("15 €")
elif age >= 65:
    print("20 €")
else:
    print("30 €")`, solIn:['19'] },
    { t:'code', defi:1, h:'Le niveau du héros', file:'niveau.py',
      p:`<p>Demande les points d'expérience (XP) du héros, puis affiche son niveau :</p><ul><li>moins de 100 XP : <code>Niveau 1</code></li><li>moins de 300 : <code>Niveau 2</code></li><li>moins de 600 : <code>Niveau 3</code></li><li>600 ou plus : <code>Niveau max</code></li></ul><p>Un héros avec un XP négatif, ça n'existe pas. Dans ce cas, affiche <code>XP impossible</code>.</p>`,
      code:``,
      hints:['Le cas « impossible » doit être testé en premier : <code>if xp &lt; 0:</code>.','Puis <code>elif xp &lt; 100:</code>, <code>elif xp &lt; 300:</code>, <code>elif xp &lt; 600:</code> et enfin <code>else:</code>.'],
      check:async (r, code, test) => {
        if (nInputs(code) < 1) return 'Il faut demander l’XP avec <code>input()</code>.';
        const all = ['niveau 1', 'niveau 2', 'niveau 3', 'niveau max', 'impossible'];
        const want = [['50', 'niveau 1'], ['99', 'niveau 1'], ['100', 'niveau 2'], ['299', 'niveau 2'], ['450', 'niveau 3'], ['600', 'niveau max'], ['5000', 'niveau max'], ['-10', 'impossible']];
        return cases(test, want.map(([x, w]) => [[x], w, all.filter(a => a !== w)]));
      },
      ok:'Huit cas testés, bornes comprises. Mettre le cas impossible en premier, c’est une habitude de pro : on écarte les valeurs bizarres avant de traiter les normales.',
      sol:`xp = int(input("XP ? "))
if xp < 0:
    print("XP impossible")
elif xp < 100:
    print("Niveau 1")
elif xp < 300:
    print("Niveau 2")
elif xp < 600:
    print("Niveau 3")
else:
    print("Niveau max")`, solIn:['450'] },
    { t:'code', bug:1, h:'Répare le bug : une habitude de JavaScript', file:'bug.py',
      p:`<p>Ce code a été écrit par quelqu'un qui vient du C ou du JavaScript. Il plante. Exécute-le, lis l'explication, puis répare-le.</p>`,
      code:`meteo = "pluie"
if meteo == "soleil":
    print("Lunettes de soleil")
else if meteo == "pluie":
    print("Parapluie")
else:
    print("Veste")`,
      hints:['En C et en JavaScript, on écrit <code>else if</code>. Python a un mot à lui.','Remplace <code>else if</code> par <code>elif</code>.'],
      check:(r, code) => same(code, LES['2-3'].steps[7].code) ? BUG : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : !/\belif\b/.test(code) ? 'Ça ne plante plus, mais utilise le mot de Python pour « sinon si ».' : !/Parapluie/.test(r.out) ? 'Avec de la pluie, il faut afficher <code>Parapluie</code>.' : true,
      ok:'En Python, c’est <code>elif</code>. Ni accolades, ni <code>else if</code>, ni parenthèses obligatoires autour de la condition.',
      sol:`meteo = "pluie"
if meteo == "soleil":
    print("Lunettes de soleil")
elif meteo == "pluie":
    print("Parapluie")
else:
    print("Veste")` }
  ],
  recap:['<code>if</code> … <code>elif</code> … <code>elif</code> … <code>else</code> : pour choisir entre plusieurs cas.','Python teste dans l’ordre et exécute <strong>seulement le premier</strong> bloc dont la condition est vraie.','Plusieurs <code>if</code> à la suite sont indépendants : ils sont tous testés.','Mets la condition la plus exigeante en premier, sinon elle ne sera jamais atteinte.','C’est <code>elif</code>, jamais <code>else if</code>.'] };

LES['2-4'] = { title:'and, or, not', dur:'12 min',
  intro:'Parfois, une seule condition ne suffit pas : « s’il a la clé <strong>et</strong> le niveau 5 », « s’il est étudiant <strong>ou</strong> a moins de 26 ans ». Dans cette leçon, tu combines les conditions.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`note = 15
if note >= 10:
    print("Admis")
elif note >= 14:
    print("Bien")
else:
    print("Ajourné")`,
      opts:[ {l:'Bien', why:'Python s’arrête à la première condition vraie : <code>note &gt;= 10</code> est déjà vraie.'},
             {l:'Admis', ok:1},
             {l:'Admis puis Bien', why:'Avec <code>elif</code>, un seul bloc s’exécute.'},
             {l:'Ajourné', why:'15 est plus grand que 10.'} ],
      ex:'« Bien » ne pourra jamais s’afficher avec cet ordre. Il faudrait tester <code>note &gt;= 14</code> en premier.' },
    { t:'say', h:'and : les deux à la fois', file:'and.py',
      p:`<p><code>and</code> (« et ») est vrai seulement si <strong>les deux</strong> conditions sont vraies. Une seule fausse, et tout est faux.</p><p>Change <code>argent</code> ou <code>faim</code> et exécute à nouveau.</p>`,
      code:`argent = 12
faim = True
if argent >= 10 and faim:
    print("On commande une pizza !")
else:
    print("Pas de pizza ce soir.")` },
    { t:'say', h:'or et not', file:'or.py',
      p:`<p><code>or</code> (« ou ») est vrai si <strong>au moins une</strong> des conditions est vraie. Il n'est faux que si les deux sont fausses.</p><p><code>not</code> (« non ») inverse : <code>not True</code> donne <code>False</code>.</p><p>Si tu viens du C ou du JavaScript : <code>&amp;&amp;</code>, <code>||</code> et <code>!</code> n'existent pas en Python. On écrit les mots.</p>`,
      code:`age = 22
etudiant = False
print(age < 26 or etudiant)
print(not etudiant)
a_la_cle = False
if not a_la_cle:
    print("La porte est verrouillée.")` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`x = 15
print(x > 10 and x < 12)`,
      opts:[ {l:'True', why:'<code>x &gt; 10</code> est vrai, mais <code>x &lt; 12</code> est faux. Avec <code>and</code>, il faut que les deux soient vrais.'},
             {l:'False', ok:1},
             {l:'True False', why:'<code>and</code> combine les deux réponses en une seule.'},
             {l:'Une erreur', why:'C’est une condition tout à fait valide.'} ],
      ex:'Vrai <code>and</code> faux donne faux. On aurait pu écrire plus simplement <code>10 &lt; x &lt; 12</code>.' },
    { t:'quiz', h:'Et avec or ?', p:`<p>Qu'affiche ce code ?</p>`, snip:`pv = 0
potions = 2
if pv > 0 or potions > 0:
    print("Tu peux continuer")
else:
    print("Game over")`,
      opts:[ {l:'Game over', why:'<code>pv &gt; 0</code> est faux, mais <code>potions &gt; 0</code> est vrai. Avec <code>or</code>, une seule vraie suffit.'},
             {l:'Tu peux continuer', ok:1},
             {l:'Les deux', why:'Un seul bloc s’exécute : le <code>if</code> ou le <code>else</code>.'},
             {l:'Rien', why:'Il y a un <code>else</code>, donc un des deux messages s’affiche forcément.'} ],
      ex:'Faux <code>or</code> vrai donne vrai : le héros peut boire une potion et continuer.' },
    { t:'code', h:'À toi : l’entrée du donjon', file:'donjon.py',
      p:`<p>Le héros peut entrer dans le donjon s'il a <strong>au moins le niveau 5</strong> et s'il a <strong>la clé</strong>. Demande son niveau (un nombre), puis s'il a la clé (il répond <code>oui</code> ou <code>non</code>).</p><p>Affiche <code>Tu entres dans le donjon.</code> ou <code>Accès refusé.</code></p>`,
      code:``,
      hints:['Deux questions : <code>niveau = int(input("Niveau ? "))</code> et <code>cle = input("As-tu la clé ? ")</code>.','La condition : <code>niveau &gt;= 5 and cle == "oui"</code>.'],
      check:async (r, code, test) => {
        if (nInputs(code) < 2) return 'Il faut deux questions : le niveau, puis la clé.';
        if (!/\band\b/.test(code)) return 'Les deux conditions doivent être vraies en même temps : utilise <code>and</code>.';
        return cases(test, [[['7', 'oui'], 'tu entres', ['refuse']], [['7', 'non'], 'refuse', ['tu entres']], [['3', 'oui'], 'refuse', ['tu entres']], [['5', 'oui'], 'tu entres', ['refuse']], [['2', 'non'], 'refuse', ['tu entres']]]);
      },
      ok:'Cinq combinaisons testées. Avec <code>and</code>, il suffit qu’une condition manque pour que la porte reste fermée.',
      sol:`niveau = int(input("Niveau ? "))
cle = input("As-tu la clé ? ")
if niveau >= 5 and cle == "oui":
    print("Tu entres dans le donjon.")
else:
    print("Accès refusé.")`, solIn:['7', 'oui'] },
    { t:'code', defi:1, h:'Les années bissextiles', file:'bissextile.py',
      p:`<p>Une année est bissextile (elle a un 29 février) si elle est divisible par 4 <strong>mais pas</strong> par 100, <strong>ou bien</strong> si elle est divisible par 400.</p><p>Affiche <code>bissextile</code> ou <code>pas bissextile</code> pour <code>annee</code>. Je testerai avec 2024, 2023, 1900 et 2000.</p>`,
      code:`annee = 2024
`,
      hints:['« Divisible par 4 » s’écrit <code>annee % 4 == 0</code>. « Pas divisible par 100 » : <code>annee % 100 != 0</code>.','<code>if (annee % 4 == 0 and annee % 100 != 0) or annee % 400 == 0:</code>. Les parenthèses rendent la condition plus lisible.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const want = [['2024', 'bissextile'], ['2023', 'pas bissextile'], ['1900', 'pas bissextile'], ['2000', 'bissextile'], ['2100', 'pas bissextile'], ['1996', 'bissextile']];
        for (const [a, w] of want) {
          const t = await test([], code.replace(/annee\s*=\s*\d+/, 'annee = ' + a));
          if (t.err) return `Avec ${a}, ton code plante : ${esc(t.err.title)}.`;
          const o = norm(t.out);
          const isPas = /pas bissextile/.test(o), isB = /bissextile/.test(o.replace(/pas bissextile/g, ''));
          if (w === 'bissextile' ? (!isB || isPas) : !isPas) return `Avec ${a}, il faudrait afficher « ${w} ».${a === '1900' ? ' 1900 est divisible par 4, mais aussi par 100 : elle n’est pas bissextile.' : a === '2000' ? ' 2000 est divisible par 400 : elle est bissextile.' : ''}`;
        }
        return true;
      },
      ok:'Testé avec six années. Cette règle est un grand classique des entretiens et des examens : tu peux la ressortir les yeux fermés.',
      sol:`annee = 2024
if (annee % 4 == 0 and annee % 100 != 0) or annee % 400 == 0:
    print("bissextile")
else:
    print("pas bissextile")` },
    { t:'code', bug:1, h:'Répare le bug : le or qui dit toujours oui', file:'bug.py',
      p:`<p>Ce programme devrait continuer seulement si on répond <code>oui</code> ou <code>o</code>. Mais il continue <strong>tout le temps</strong>, même quand on répond <code>non</code>. Exécute-le avec <code>non</code> pour voir le bug, puis répare-le.</p>`,
      code:`reponse = input("Continuer ? ")
if reponse == "oui" or "o":
    print("On continue !")
else:
    print("Au revoir.")`,
      hints:['Python lit <code>reponse == "oui" or "o"</code> comme deux conditions : <code>reponse == "oui"</code>, puis <code>"o"</code> tout seul. Et un texte qui n’est pas vide compte comme vrai.','Il faut répéter la comparaison des deux côtés : <code>reponse == "oui" or reponse == "o"</code>.'],
      check:async (r, code, test) => {
        if (same(code, LES['2-4'].steps[7].code)) return BUG;
        return cases(test, [[['non'], 'au revoir', ['on continue']], [['oui'], 'on continue', ['au revoir']], [['o'], 'on continue', ['au revoir']], [['peut-etre'], 'au revoir', ['on continue']]]);
      },
      ok:'C’est un des bugs les plus sournois : pas d’erreur, juste un programme qui dit toujours oui. Chaque côté d’un <code>or</code> doit être une condition complète.',
      sol:`reponse = input("Continuer ? ")
if reponse == "oui" or reponse == "o":
    print("On continue !")
else:
    print("Au revoir.")`, solIn:['non'] }
  ],
  recap:['<code>and</code> : vrai si les deux conditions sont vraies.','<code>or</code> : vrai si au moins une est vraie.','<code>not</code> inverse : <code>not True</code> vaut <code>False</code>.','En Python on écrit les mots : pas de <code>&amp;&amp;</code>, <code>||</code> ou <code>!</code>.','Chaque côté d’un <code>or</code> est une condition complète : <code>x == "oui" or x == "o"</code>, jamais <code>x == "oui" or "o"</code>.'] };

LES['2-5'] = { title:'Les pièges des conditions', dur:'12 min',
  intro:'Tu connais maintenant <code>if</code>, <code>elif</code>, <code>else</code>, <code>and</code> et <code>or</code>. Cette leçon est un entraînement de chasseur de bugs : voici les pièges dans lesquels tout le monde tombe au moins une fois.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`argent = 5
faim = True
print(argent >= 10 or faim)`,
      opts:[ {l:'False', why:'Avec <code>or</code>, une seule condition vraie suffit. <code>faim</code> vaut True.'},
             {l:'True', ok:1},
             {l:'5', why:'Une condition donne True ou False.'},
             {l:'Une erreur', why:'Mettre une variable bool toute seule dans une condition est permis.'} ],
      ex:'Faux <code>or</code> vrai donne vrai.' },
    { t:'quiz', h:'Piège 1 : un = ou deux ?', p:`<p>Que se passe-t-il quand on exécute ce code ?</p>`, snip:`pv = 0
if pv = 0:
    print("Game over")`,
      opts:[ {l:'Ça affiche Game over', why:'Il n’y a qu’un seul <code>=</code> : pour Python, c’est un rangement, pas une comparaison.'},
             {l:'Ça n’affiche rien', why:'Python ne va même pas jusqu’à exécuter le code : il refuse de le lire.'},
             {l:'Une SyntaxError', ok:1},
             {l:'pv passe à 0', why:'Python refuse de ranger quelque chose dans une ligne <code>if</code>. Il ne lit pas le code du tout.'} ],
      ex:'Dans une condition, on <strong>compare</strong> avec <code>==</code>. Bonne nouvelle : Python refuse ce code tout de suite. En C, ce même bug passe sans erreur et cause des heures de recherche.' },
    { t:'quiz', h:'Piège 2 : l’indentation change tout', p:`<p>Le héros a 3 pièces d'or et la potion en coûte 5. Qu'affiche ce code ?</p>`, snip:`or_ = 3
if or_ >= 5:
    print("Tu achètes la potion.")
or_ = or_ - 5
print("Il te reste", or_)`,
      opts:[ {l:'Il te reste 3', why:'La ligne <code>or_ = or_ - 5</code> n’est pas décalée : elle ne fait pas partie du <code>if</code>. Elle s’exécute toujours.'},
             {l:'Tu achètes la potion. puis Il te reste -2', why:'3 n’est pas plus grand ou égal à 5 : le message d’achat ne s’affiche pas.'},
             {l:'Il te reste -2', ok:1},
             {l:'Une IndentationError', why:'Le code est valide pour Python. C’est la logique qui est fausse, pas la syntaxe.'} ],
      ex:'Le héros paie sans recevoir sa potion ! Il manquait 4 espaces devant <code>or_ = or_ - 5</code>. Python ne peut pas deviner ce que tu voulais : c’est l’indentation qui décide.' },
    { t:'say', h:'Piège 3 : les réponses mal tapées', file:'reponse.py', solIn:['  OUI '],
      p:`<p>Quand un humain répond, il tape parfois <code>OUI</code>, <code>Oui</code> ou <code> oui </code> avec des espaces. Pour Python, ce sont trois textes différents de <code>"oui"</code>.</p><p>La parade : nettoyer la réponse avant de la comparer. <code>strip()</code> enlève les espaces au début et à la fin, et <code>lower()</code> met tout en minuscules. On peut les enchaîner.</p><p>Exécute et tape <code>  OUI </code> avec des espaces.</p>`,
      code:`reponse = input("Tu ouvres le coffre ? ")
propre = reponse.strip().lower()
print(f"Tu as tapé [{reponse}], je compare [{propre}]")
if propre == "oui":
    print("Le coffre s'ouvre.")
else:
    print("Tu passes ton chemin.")` },
    { t:'quiz', h:'Piège 4 : les nombres à virgule', p:`<p>Qu'affiche ce code ?</p>`, snip:`print(0.1 + 0.2 == 0.3)`,
      opts:[ {l:'True', why:'En maths oui. Mais l’ordinateur stocke les nombres à virgule en binaire, avec une toute petite erreur d’arrondi.'},
             {l:'0.3', why:'Une comparaison donne True ou False.'},
             {l:'Une erreur', why:'Pas d’erreur, mais une surprise.'},
             {l:'False', ok:1} ],
      ex:'<code>0.1 + 0.2</code> vaut en réalité 0.30000000000000004. C’est pareil en C, en Java et en JavaScript. Évite <code>==</code> entre deux float : compare plutôt avec <code>&lt;</code> ou <code>&gt;</code>.' },
    { t:'quiz', h:'Piège 5 : le texte vide', p:`<p>L'utilisateur appuie sur Entrée sans rien taper. Qu'affiche ce code ?</p>`, snip:`nom = input("Ton nom ? ")
if nom:
    print("Salut", nom)
else:
    print("Anonyme")`,
      opts:[ {l:'Salut', why:'Le texte est vide. Et pour Python, un texte vide compte comme faux dans un <code>if</code>.'},
             {l:'Anonyme', ok:1},
             {l:'Une erreur', why:'On peut mettre n’importe quelle valeur dans un <code>if</code>, pas seulement une comparaison.'},
             {l:'Rien', why:'Il y a un <code>else</code>, donc un message s’affiche forcément.'} ],
      ex:'Dans un <code>if</code>, le texte vide <code>""</code> et le nombre <code>0</code> comptent comme faux. Tout le reste compte comme vrai. C’est pour ça que <code>or "o"</code> était toujours vrai à la leçon d’avant.' },
    { t:'code', bug:1, h:'Répare le bug : le mot de passe', file:'bug.py',
      p:`<p>Ce programme vérifie un mot de passe. Il plante. Exécute-le, lis l'explication, puis répare-le.</p>`,
      code:`mot_de_passe = input("Mot de passe ? ")
if mot_de_passe = "dragon42":
    print("Bienvenue")
else:
    print("Accès refusé")`,
      hints:['Dans un <code>if</code>, on compare. Combien de <code>=</code> faut-il pour comparer ?','<code>if mot_de_passe == "dragon42":</code>'],
      check:async (r, code, test) => {
        if (same(code, LES['2-5'].steps[6].code)) return BUG;
        return cases(test, [[['dragon42'], 'bienvenue', ['refuse']], [['dragon'], 'refuse', ['bienvenue']]]);
      },
      ok:'Un seul <code>=</code> range, deux <code>==</code> comparent. Tu ne te feras plus avoir.',
      sol:`mot_de_passe = input("Mot de passe ? ")
if mot_de_passe == "dragon42":
    print("Bienvenue")
else:
    print("Accès refusé")`, solIn:['dragon42'] },
    { t:'code', bug:1, h:'Répare le bug : les médailles', file:'bug.py',
      p:`<p>Ce programme donne une médaille selon le score. Il ne plante pas, mais il ne donne jamais l'argent ni l'or. Exécute-le avec 96 pour voir, puis répare-le.</p><p>La règle : 95 ou plus, l'or. 80 ou plus, l'argent. 50 ou plus, le bronze.</p>`,
      code:`score = int(input("Score ? "))
if score >= 50:
    print("Bronze")
elif score >= 80:
    print("Argent")
elif score >= 95:
    print("Or")
else:
    print("Pas de médaille")`,
      hints:['Avec 96, quelle est la première condition vraie ? Python s’arrête là.','Teste les conditions de la plus exigeante à la moins exigeante : <code>&gt;= 95</code>, puis <code>&gt;= 80</code>, puis <code>&gt;= 50</code>.'],
      check:async (r, code, test) => {
        if (same(code, LES['2-5'].steps[7].code)) return BUG;
        const all = ['or', 'argent', 'bronze', 'pas de medaille'];
        return cases(test, [['96', 'or'], ['95', 'or'], ['85', 'argent'], ['60', 'bronze'], ['10', 'pas de medaille']].map(([s, w]) => [[s], w, all.filter(a => a !== w)]));
      },
      ok:'L’ordre des <code>elif</code>, c’est un bug silencieux : le code tourne, mais certains cas ne sont jamais atteints. Toujours du plus exigeant au moins exigeant.',
      sol:`score = int(input("Score ? "))
if score >= 95:
    print("Or")
elif score >= 80:
    print("Argent")
elif score >= 50:
    print("Bronze")
else:
    print("Pas de médaille")`, solIn:['96'] },
    { t:'code', defi:1, h:'Le coffre tolérant', file:'coffre.py',
      p:`<p>Demande au joueur s'il veut ouvrir le coffre. S'il répond oui, <strong>quelle que soit la façon de l'écrire</strong> (<code>oui</code>, <code>OUI</code>, <code>  Oui </code>…) ou juste <code>o</code>, affiche <code>Le coffre s'ouvre.</code> Sinon, affiche <code>Tu passes ton chemin.</code></p>`,
      code:``,
      hints:['Nettoie la réponse : <code>rep = input("Ouvrir le coffre ? ").strip().lower()</code>.','Puis <code>if rep == "oui" or rep == "o":</code>. Chaque côté du <code>or</code> est une comparaison complète.'],
      check:async (r, code, test) => {
        if (nInputs(code) < 1) return 'Il faut poser la question avec <code>input()</code>.';
        return cases(test, [[['oui'], 's\'ouvre', ['chemin']], [['  OUI '], 's\'ouvre', ['chemin']], [['Oui'], 's\'ouvre', ['chemin']], [['O'], 's\'ouvre', ['chemin']], [['non'], 'chemin', ['s\'ouvre']], [['ouiii'], 'chemin', ['s\'ouvre']]]);
      },
      ok:'Testé avec six façons de répondre. Un programme qui pardonne les petites fautes de frappe, c’est un programme agréable à utiliser.',
      sol:`rep = input("Ouvrir le coffre ? ").strip().lower()
if rep == "oui" or rep == "o":
    print("Le coffre s'ouvre.")
else:
    print("Tu passes ton chemin.")`, solIn:['  OUI '] }
  ],
  recap:['Dans un <code>if</code>, on compare avec <code>==</code>. Un seul <code>=</code> donne une <code>SyntaxError</code>.','L’indentation décide de ce qui est dans le bloc. Une ligne mal décalée donne un bug sans message d’erreur.','Nettoie les réponses avant de comparer : <code>input().strip().lower()</code>.','Évite <code>==</code> entre deux float : <code>0.1 + 0.2 == 0.3</code> vaut <code>False</code>.','Dans un <code>if</code>, <code>""</code> et <code>0</code> comptent comme faux.'] };

/* Le projet : chaque étape reprend la précédente (carry). */
const P1 = `nom = input("Ton prénom ? ")
n1 = float(input("Note 1 ? "))
n2 = float(input("Note 2 ? "))
n3 = float(input("Note 3 ? "))`;
const P2 = P1 + `
moyenne = (n1 + n2 + n3) / 3
print(f"{nom}, ta moyenne est de {moyenne:.2f}")`;
const P3 = P2 + `
if moyenne >= 16:
    mention = "Très bien"
elif moyenne >= 14:
    mention = "Bien"
elif moyenne >= 12:
    mention = "Assez bien"
elif moyenne >= 10:
    mention = "Admis"
else:
    mention = "Ajourné"
print(f"Résultat : {mention}")`;
const P4 = P1 + `
moyenne = (n1 + n2 + n3) / 3
print(f"{nom}, ta moyenne est de {moyenne:.2f}")
valide = 0 <= n1 <= 20 and 0 <= n2 <= 20 and 0 <= n3 <= 20
if not valide:
    mention = "Impossible : une note est invalide"
elif moyenne >= 16:
    mention = "Très bien"
elif moyenne >= 14:
    mention = "Bien"
elif moyenne >= 12:
    mention = "Assez bien"
elif moyenne >= 10:
    mention = "Admis"
else:
    mention = "Ajourné"
print(f"Résultat : {mention}")`;
const MENTIONS = ['tres bien', 'bien', 'assez bien', 'admis', 'ajourne'];
const LABEL = { 'tres bien':'Très bien', 'bien':'Bien', 'assez bien':'Assez bien', 'admis':'Admis', 'ajourne':'Ajourné' };
// Quelle mention le programme affiche-t-il ? On cherche la plus longue d'abord (« très bien » contient « bien »).
const mentionIn = o => { const n = norm(o); return MENTIONS.find(m => m !== 'bien' && n.includes(m)) || (/(^|[^a-z])bien([^a-z]|$)/.test(n) ? 'bien' : null); };

LES['2-6'] = { title:'Projet : le calculateur de mention', dur:'15 min',
  intro:'Fin du chapitre : tu construis un programme utile pour de vrai. Il calcule ta moyenne et te donne ta mention, en vérifiant que les notes ont du sens.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>L'utilisateur tape <code>Oui</code>. Qu'affiche ce code ?</p>`, snip:`rep = input("Continuer ? ")
if rep == "oui":
    print("On continue")
else:
    print("Stop")`,
      opts:[ {l:'On continue', why:'Pour Python, <code>"Oui"</code> et <code>"oui"</code> sont deux textes différents à cause de la majuscule.'},
             {l:'Stop', ok:1},
             {l:'Une erreur', why:'Comparer deux textes ne plante jamais.'},
             {l:'Rien', why:'Il y a un <code>else</code> : un message s’affiche forcément.'} ],
      ex:'La majuscule change tout. Avec <code>rep.lower() == "oui"</code>, ça aurait marché.' },
    { t:'say', h:'Le projet',
      p:`<p>Ton programme va demander un prénom et trois notes sur 20, puis afficher la moyenne et la mention. Voici ce qu'on veut obtenir :</p>`,
      snip:`Ton prénom ? Inès
Note 1 ? 15
Note 2 ? 12.5
Note 3 ? 17
Inès, ta moyenne est de 14.83
Résultat : Bien`,
      p2:`<p>Les mentions : 16 ou plus, <strong>Très bien</strong>. 14 ou plus, <strong>Bien</strong>. 12 ou plus, <strong>Assez bien</strong>. 10 ou plus, <strong>Admis</strong>. En dessous, <strong>Ajourné</strong>.</p><p>On le construit en quatre étapes. À chaque étape, je reprends ton code de l'étape d'avant.</p>` },
    { t:'code', h:'Étape 1 : les questions', file:'mention.py', mem:1,
      p:`<p>Demande le prénom, puis les trois notes. Range-les dans <code>nom</code>, <code>n1</code>, <code>n2</code> et <code>n3</code>. Une note peut avoir une virgule, comme 12.5 : choisis la bonne conversion.</p>`,
      code:`# Étape 1 : les questions
`,
      hints:['<code>nom = input("Ton prénom ? ")</code>','Pour les notes : <code>n1 = float(input("Note 1 ? "))</code>, et pareil pour n2 et n3.'],
      check:async (r, code, test) => {
        if (nInputs(code) < 4) return 'Il faut quatre questions : le prénom et trois notes.';
        const t = await test(['Inès', '15', '12.5', '17']);
        if (t.err) return `Quand je réponds Inès, 15, 12.5 et 17, ton code plante : ${esc(t.err.title)}.${/int/.test(code) ? ' 12.5 n’est pas un entier : utilise <code>float()</code>.' : ''}`;
        if (strOf(memOf(t, 'nom')) !== 'Inès') return 'La boîte <code>nom</code> doit contenir le prénom tapé.';
        for (const n of ['n1', 'n2', 'n3']) {
          const m = memOf(t, n);
          if (!m) return `Il manque la boîte <code>${n}</code>.`;
          if (m.type !== 'float') return `<code>${n}</code> doit être un nombre à virgule : convertis-la avec <code>float()</code>.`;
        }
        return true;
      },
      ok:'Les quatre réponses sont rangées, et les notes sont des nombres à virgule.',
      sol:P1, solIn:['Inès', '15', '12.5', '17'] },
    { t:'code', carry:1, h:'Étape 2 : la moyenne', file:'mention.py', mem:1,
      p:`<p>Calcule la moyenne des trois notes dans une variable <code>moyenne</code>, puis affiche : <code>Inès, ta moyenne est de 14.83</code>.</p><p>Pour afficher 2 chiffres après la virgule, écris <code>{moyenne:.2f}</code> dans ta f-string.</p>`,
      code:`# Étape 2 : la moyenne
`,
      hints:['Attention aux priorités : <code>n1 + n2 + n3 / 3</code> ne divise que n3. Il faut des parenthèses.','<code>moyenne = (n1 + n2 + n3) / 3</code>, puis <code>print(f"{nom}, ta moyenne est de {moyenne:.2f}")</code>.'],
      check:async (r, code, test) => {
        const t = await test(['Inès', '15', '12.5', '17']);
        if (t.err) return `Quand je réponds Inès, 15, 12.5 et 17, ton code plante : ${esc(t.err.title)}.`;
        const m = memOf(t, 'moyenne');
        if (!m) return 'Il manque la boîte <code>moyenne</code>.';
        if (Math.abs(parseFloat(m.repr) - 14.8333) > 0.001) return `Avec 15, 12.5 et 17, la moyenne devrait être 14.83, mais ta boîte contient ${esc(m.repr)}.${Math.abs(parseFloat(m.repr) - 33.1667) < 0.01 ? ' Il manque des parenthèses : seule la dernière note est divisée par 3.' : ''}`;
        if (!/14\.83(?!\d)/.test(t.out)) return 'Le calcul est bon. Affiche la moyenne avec 2 chiffres après la virgule : <code>{moyenne:.2f}</code>.';
        if (!/Inès/.test(tail(t, ['17']))) return 'Mets aussi le prénom dans la phrase affichée.';
        return true;
      },
      ok:'14.83, avec le prénom. Le <code>:.2f</code> arrondit seulement l’affichage : la boîte garde tous les chiffres.',
      sol:P2, solIn:['Inès', '15', '12.5', '17'] },
    { t:'code', carry:1, h:'Étape 3 : la mention', file:'mention.py', mem:1,
      p:`<p>Avec une chaîne <code>if</code> / <code>elif</code> / <code>else</code>, range la bonne mention dans une variable <code>mention</code>. Puis affiche <code>Résultat : Bien</code> (avec la bonne mention).</p><p>Je testerai avec plusieurs séries de notes, dont des cas limites.</p>`,
      code:`# Étape 3 : la mention
`,
      hints:['Commence par la mention la plus exigeante : <code>if moyenne &gt;= 16:</code> puis <code>mention = "Très bien"</code>.','Puis <code>elif moyenne &gt;= 14:</code>, <code>elif moyenne &gt;= 12:</code>, <code>elif moyenne &gt;= 10:</code>, <code>else:</code>. Et à la fin, collé à gauche : <code>print(f"Résultat : {mention}")</code>.'],
      check:async (r, code, test) => {
        const sets = [[['Inès', '15', '12.5', '17'], 'bien'], [['Max', '18', '17', '16'], 'tres bien'], [['Léa', '12', '12', '12'], 'assez bien'], [['Tom', '10', '9', '11'], 'admis'], [['Zoé', '8', '9.5', '7'], 'ajourne'], [['Ali', '14', '14', '14'], 'bien']];
        for (const [ins, w] of sets) {
          const t = await test(ins);
          if (t.err) return `Quand je réponds ${ins.join(', ')}, ton code plante : ${esc(t.err.title)}.`;
          if (!strOf(memOf(t, 'mention'))) return 'Range la mention dans une variable <code>mention</code> (du texte).';
          const got = mentionIn(tail(t, ins).split('\n').filter(l => /r[ée]sultat/i.test(l)).join(' '));
          if (got !== w) return `Avec ${ins.slice(1).join(', ')}, la ligne <code>Résultat : …</code> devrait donner « ${LABEL[w]} »${got ? `, et je lis « ${LABEL[got]} »` : ''}.${w === 'tres bien' && got === 'admis' ? ' Vérifie l’ordre de tes conditions.' : ''}`;
        }
        return true;
      },
      ok:'Six séries testées, dont 14 de moyenne pile et 10 pile. Ranger la mention dans une variable, puis l’afficher une seule fois, évite de répéter cinq <code>print</code>.',
      sol:P3, solIn:['Inès', '15', '12.5', '17'] },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Avec ta chaîne de mentions, quelle mention obtient une moyenne de <strong>14</strong> pile ?</p>`, snip:`moyenne = 14
if moyenne >= 16:
    mention = "Très bien"
elif moyenne >= 14:
    mention = "Bien"
elif moyenne >= 12:
    mention = "Assez bien"
else:
    mention = "Admis"
print(mention)`,
      opts:[ {l:'Assez bien', why:'14 est plus grand ou égal à 14 : la condition <code>moyenne &gt;= 14</code> est déjà vraie.'},
             {l:'Bien', ok:1},
             {l:'Très bien', why:'14 n’est pas plus grand ou égal à 16.'},
             {l:'Bien puis Assez bien', why:'Une chaîne <code>if</code>/<code>elif</code> s’arrête à la première condition vraie.'} ],
      ex:'14 &gt;= 16 est faux, 14 &gt;= 14 est vrai : « Bien ». C’est pour ce genre de cas limite que <code>&gt;=</code> et <code>&gt;</code> ne sont pas interchangeables.' },
    { t:'code', carry:1, defi:1, h:'Étape 4 : refuser les notes impossibles', file:'mention.py',
      p:`<p>Si quelqu'un tape 25 ou -3, ton programme donne une mention absurde. Crée une variable <code>valide</code> qui vaut <code>True</code> seulement si les trois notes sont entre 0 et 20.</p><p>Puis ajoute un cas <strong>tout en haut</strong> de ta chaîne : si les notes ne sont pas valides, la mention devient <code>Impossible : une note est invalide</code>. Tu devras transformer ton premier <code>if</code> en <code>elif</code>.</p>`,
      code:`# Étape 4 : écris valide juste au-dessus de ta chaîne de if
`,
      hints:['<code>valide = 0 &lt;= n1 &lt;= 20 and 0 &lt;= n2 &lt;= 20 and 0 &lt;= n3 &lt;= 20</code>, à placer avant le premier <code>if</code>.','Le nouveau début : <code>if not valide:</code> puis <code>mention = "Impossible : une note est invalide"</code>, et l’ancien <code>if moyenne &gt;= 16:</code> devient <code>elif moyenne &gt;= 16:</code>.'],
      check:async (r, code, test) => {
        for (const ins of [['Max', '25', '12', '12'], ['Max', '12', '-3', '12'], ['Max', '12', '12', '20.5']]) {
          const t = await test(ins);
          if (t.err) return `Quand je réponds ${ins.join(', ')}, ton code plante : ${esc(t.err.title)}.`;
          const o = tail(t, ins);
          if (!/invalide|impossible/i.test(o)) return `Avec les notes ${ins.slice(1).join(', ')}, il faut dire que c’est impossible.`;
          if (mentionIn(o.replace(/impossible.*$/gim, ''))) return `Avec les notes ${ins.slice(1).join(', ')}, il ne faut afficher aucune mention. Le cas « invalide » doit être le premier de la chaîne.`;
        }
        const v = memOf(await test(['Max', '25', '12', '12']), 'valide');
        if (!v || v.type !== 'bool') return 'Crée une variable <code>valide</code> qui contient True ou False.';
        for (const [ins, w] of [[['Inès', '15', '12.5', '17'], 'bien'], [['Max', '20', '0', '10'], 'admis'], [['Zoé', '8', '9.5', '7'], 'ajourne']]) {
          const t = await test(ins);
          const got = t.err ? null : mentionIn(tail(t, ins).split('\n').filter(l => /r[ée]sultat/i.test(l)).join(' '));
          if (got !== w) return `Les notes valides doivent toujours marcher : avec ${ins.slice(1).join(', ')}, il faudrait « ${LABEL[w]} ». N’oublie pas : 0 et 20 sont des notes valides.`;
        }
        return true;
      },
      ok:'Ton programme se méfie des valeurs absurdes et marche toujours pour les vraies notes. Vérifier les entrées, c’est le premier réflexe d’un développeur sérieux.',
      sol:P4, solIn:['Inès', '15', '12.5', '17'] },
    { t:'code', bug:1, h:'Répare le bug : la vérification trop gentille', file:'bug.py',
      p:`<p>Ce code vérifie deux notes. Avec <code>n1 = 25</code>, il devrait afficher <code>Note invalide !</code>, mais il dit que tout va bien. Exécute-le, trouve le mot qui ne va pas, puis répare-le.</p>`,
      code:`n1 = 25
n2 = 12
valide = 0 <= n1 <= 20 or 0 <= n2 <= 20
if valide:
    print("Notes valides")
else:
    print("Note invalide !")`,
      hints:['Avec <code>or</code>, il suffit qu’<strong>une</strong> des deux notes soit bonne. Est-ce ce qu’on veut ?','Les deux notes doivent être valides en même temps : remplace <code>or</code> par <code>and</code>.'],
      check:async (r, code, test) => {
        if (same(code, LES['2-6'].steps[7].code)) return BUG;
        for (const [a, b, ok] of [['25', '12', false], ['12', '-1', false], ['12', '12', true], ['0', '20', true]]) {
          const t = await test([], code.replace(/n1\s*=\s*-?\d+/, 'n1 = ' + a).replace(/n2\s*=\s*-?\d+/, 'n2 = ' + b));
          if (t.err) return `Avec n1 = ${a} et n2 = ${b}, ton code plante : ${esc(t.err.title)}.`;
          if (ok ? !/valides/i.test(t.out) : !/invalide/i.test(t.out)) return `Avec n1 = ${a} et n2 = ${b}, il faudrait afficher <code>${ok ? 'Notes valides' : 'Note invalide !'}</code>.`;
        }
        return true;
      },
      ok:'<code>or</code> au lieu de <code>and</code> : la vérification laissait passer n’importe quoi dès qu’une seule note était bonne. Pour « toutes valides », c’est <code>and</code>.',
      sol:`n1 = 25
n2 = 12
valide = 0 <= n1 <= 20 and 0 <= n2 <= 20
if valide:
    print("Notes valides")
else:
    print("Note invalide !")` },
    { t:'say', h:'Bravo, et un défi pour VS Code',
      p:`<p>Ton calculateur est fini : questions, calcul, décisions et vérification des entrées. C'est un vrai programme, que tu peux garder dans VS Code dans un fichier <code>mention.py</code>.</p><p>Défi bonus : reprends ta fiche de personnage du chapitre 1. Ajoute un titre selon la force : « Héros légendaire » au-dessus de 8, « Combattant aguerri » au-dessus de 5, « Apprenti » sinon. Et refuse une force en dehors de 1 à 10.</p><p>Au chapitre 3, on apprendra à <strong>répéter</strong> : redemander une note tant qu'elle est invalide, au lieu d'abandonner.</p>` }
  ],
  recap:['Un programme sérieux vérifie ses entrées avant de s’en servir.','Ranger le résultat d’une chaîne de <code>if</code> dans une variable, puis l’afficher une seule fois : moins de répétitions.','<code>(a + b + c) / 3</code> : les parenthèses sont indispensables pour une moyenne.','<code>{x:.2f}</code> dans une f-string affiche 2 chiffres après la virgule.'] };

Atelier.chapter({ part:"bases", n:2, title:"Prendre des décisions",
  lessons:['2-1','2-2','2-3','2-4','2-5','2-6'].map(id => ({ id, ...LES[id] })) });
})();
