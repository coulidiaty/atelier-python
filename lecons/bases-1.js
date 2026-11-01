/* Partie 1 · Chapitre 1 : Premiers pas */
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc } = Atelier.h;
const LES = {};
LES['1-1'] = { title:'Afficher avec print()', dur:'8 min',
  intro:'Dans cette leçon, tu fais parler Python : afficher du texte, des nombres et des calculs. C’est la base de tout. Un programme qui n’affiche rien, on ne sait pas ce qu’il fait.',
  steps:[
    { t:'say', h:'Ta première instruction', file:'bonjour.py',
      p:`<p><code>print()</code> affiche à l'écran ce que tu mets entre ses parenthèses. Le texte se met <strong>entre guillemets</strong> : doubles <code>"…"</code> ou simples <code>'…'</code>, les deux marchent.</p><p>Clique sur <strong>Exécuter</strong> et regarde la console. Ensuite, change le texte et exécute encore.</p>`,
      code:`print("Salut !")
print('Je parle Python.')` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`print(2 + 3)`,
      opts:[ {l:'2 + 3', why:'Ça, ce serait avec des guillemets : <code>print("2 + 3")</code>. Ici il n’y en a pas, donc Python calcule.'},
             {l:'5', ok:1},
             {l:'23', why:'23 arriverait avec du texte : <code>"2" + "3"</code>. Ici ce sont des nombres, donc Python additionne.'},
             {l:'Une erreur', why:'Pas d’erreur : Python sait très bien calculer.'} ],
      ex:'Sans guillemets, Python <strong>calcule</strong> d’abord, puis affiche le résultat. Avec des guillemets, il affiche le texte tel quel.' },
    { t:'say', h:'Plusieurs choses d’un coup', file:'plusieurs.py',
      p:`<p>Tu peux donner plusieurs valeurs à <code>print()</code>, séparées par des <strong>virgules</strong>. Python met un espace entre elles.</p><p>Et tout ce qui suit un <code>#</code> est un <strong>commentaire</strong> : Python l'ignore. C'est une note pour les humains qui liront ton code.</p>`,
      code:`# Ceci est un commentaire : Python ne le lit pas
print("J'ai", 19, "ans")
print("6 fois 7 =", 6 * 7)` },
    { t:'quiz', h:'Et là ?', p:`<p>Qu'affiche ce code ?</p>`, snip:`print("A", "B", "C")`,
      opts:[ {l:'ABC', why:'Les virgules ajoutent un espace entre chaque valeur.'},
             {l:'A B C', ok:1},
             {l:'A, B, C', why:'Les virgules servent à séparer les valeurs dans ton code. Elles ne s’affichent pas.'},
             {l:'Une erreur', why:'C’est tout à fait permis : <code>print()</code> accepte autant de valeurs que tu veux.'} ],
      ex:'Chaque virgule devient un espace à l’affichage.' },
    { t:'code', h:'À toi : dis bonjour', file:'exercice.py',
      p:`<p>Écris une ligne qui affiche <strong>Bonjour</strong> suivi de ton prénom.</p><p class="small">Dans les exercices, on tape soi-même : le copier-coller est désactivé. C'est en tapant que ça rentre.</p>`,
      code:`# Écris ta ligne en dessous
`,
      hints:['Il te faut <code>print()</code> et du texte entre guillemets.','La forme : <code>print("Bonjour ...")</code>, en remplaçant les points par ton prénom.'],
      check:r => r.err ? ERR : !r.out.trim() ? 'Rien ne s’affiche. As-tu bien utilisé <code>print()</code> ?' : !/bonjour/i.test(r.out) ? 'Ça s’affiche, mais je ne vois pas le mot « Bonjour ».' : r.out.trim().toLowerCase() === 'bonjour' ? 'Presque ! Ajoute ton prénom après Bonjour.' : true,
      ok:'Ta première ligne de code, écrite toute seule.' },
    { t:'code', h:'Deux lignes et un commentaire', file:'presentation.py',
      p:`<p>Affiche ton prénom sur une ligne, puis ta ville sur la ligne suivante. Ajoute un commentaire au-dessus pour expliquer ce que fait ton programme.</p>`,
      code:``,
      hints:['Chaque <code>print()</code> affiche une ligne. Il en faut donc deux.','Un commentaire ressemble à ça : <code># Mon programme se présente</code>'],
      check:(r, code) => r.err ? ERR : linesOf(r.out).length < 2 ? 'Il faut deux lignes affichées : un <code>print()</code> pour le prénom, un autre pour la ville.' : !/#/.test(code) ? 'Tes deux lignes s’affichent. Il manque juste le commentaire : une ligne qui commence par <code>#</code>.' : true,
      ok:'Programme clair et commenté. Les bons développeurs commentent leur code pour les autres, et pour eux-mêmes dans trois mois.' },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code devrait afficher <code>Il fait beau</code>, mais il plante. Exécute-le, lis l'explication, puis répare-le.</p>`,
      code:`print("Il fait beau)`,
      hints:['Compte les guillemets : il en faut un au début et un à la fin du texte.','Il manque le <code>"</code> juste avant la parenthèse fermante.'],
      check:(r, code) => code.trim() === 'print("Il fait beau)' ? 'Voilà le bug ! Lis l’explication dans la console, puis corrige le code.' : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : !/Il fait beau/.test(r.out) ? 'Plus d’erreur, mais il faut afficher <code>Il fait beau</code>.' : true,
      ok:'Tu viens de corriger ta première <code>SyntaxError</code>. Un guillemet oublié, c’est l’erreur numéro 1 des débutants.' }
  ],
  recap:['<code>print()</code> affiche du texte (entre guillemets) ou le résultat d’un calcul (sans guillemets).','Avec des virgules, <code>print()</code> affiche plusieurs valeurs séparées par un espace.','<code>#</code> crée un commentaire : une note que Python ignore.','Un guillemet oublié donne une <code>SyntaxError</code> : Python n’arrive plus à lire le code.'] };

LES['1-2'] = { title:'Les variables', dur:'10 min',
  intro:'Un programme a besoin de se souvenir de choses : un prénom, un score, un prix. Pour ça, on utilise des variables.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`# print("Coucou")
print("Salut")`,
      opts:[ {l:'Coucou puis Salut', why:'La première ligne commence par <code>#</code> : c’est un commentaire, Python l’ignore.'},
             {l:'Seulement Salut', ok:1},
             {l:'# Coucou puis Salut', why:'Le <code>#</code> ne s’affiche pas : il transforme toute la ligne en commentaire.'},
             {l:'Une erreur', why:'Un commentaire peut contenir n’importe quoi, même du code.'} ],
      ex:'Tout ce qui suit <code>#</code> est ignoré. Pratique pour « désactiver » une ligne sans l’effacer.' },
    { t:'say', h:'Des boîtes avec une étiquette', file:'boites.py', mem:1,
      p:`<p>Une <strong>variable</strong>, c'est une boîte avec une étiquette. On range une valeur dedans avec <code>=</code>, puis on la réutilise avec son nom, sans guillemets.</p><p>Exécute, puis regarde la <strong>Mémoire de Python</strong> sous la console : chaque boîte apparaît.</p>`,
      code:`prenom = "Léa"
age = 19
print(prenom)
print(age + 1)` },
    { t:'say', h:'Changer ce qu’il y a dans la boîte', file:'score.py', mem:1,
      p:`<p>Une variable peut changer de valeur : on range autre chose dans la boîte, et l'ancienne valeur est remplacée.</p><p>Attention, le <code>=</code> de Python ne veut pas dire « égal » comme en maths. Il veut dire : <strong>calcule ce qui est à droite, puis range-le dans la boîte de gauche</strong>. C'est pour ça que <code>score = score + 5</code> a du sens.</p>`,
      code:`score = 10
print(score)
score = 15
print(score)
score = score + 5
print(score)` },
    { t:'quiz', h:'Le piège de la copie', p:`<p>Qu'affiche ce code ?</p>`, snip:`a = 3
b = a
a = 10
print(b)`,
      opts:[ {l:'3', ok:1},
             {l:'10', why:'Au moment de <code>b = a</code>, Python range la valeur 3 dans b. Changer a ensuite ne touche pas b.'},
             {l:'13', why:'Il n’y a aucune addition ici : Python range juste des valeurs.'},
             {l:'Une erreur', why:'Tout est correct dans ce code.'} ],
      ex:'<code>b = a</code> copie la <strong>valeur</strong> de a dans b, à ce moment-là. Ensuite, les deux boîtes vivent leur vie.' },
    { t:'quiz', h:'Bien nommer ses boîtes',
      p:`<p>Un nom de variable contient des lettres, des chiffres et des <code>_</code>. Il ne commence pas par un chiffre et n'a pas d'espace. Les majuscules comptent : <code>age</code> et <code>Age</code> sont deux boîtes différentes. L'habitude en Python : des minuscules et des <code>_</code>, comme <code>nombre_de_vies</code>.</p><p>Lequel de ces noms est valide ?</p>`,
      opts:[ {l:'2joueurs', why:'Un nom ne peut pas commencer par un chiffre. <code>joueurs2</code> serait valide.'},
             {l:'nombre de vies', why:'Les espaces sont interdits : Python croirait voir trois mots.'},
             {l:'nombre_de_vies', ok:1},
             {l:'class', why:'<code>class</code> est un mot réservé de Python (tu le verras en POO). On ne peut pas l’utiliser comme nom.'} ],
      ex:'Valide et bien écrit : en minuscules, avec des <code>_</code>. On appelle ça le <em>snake_case</em>, l’écriture « serpent ». Ça me va bien.' },
    { t:'code', h:'À toi : calcule avec une variable', file:'double.py', mem:1,
      p:`<p>Crée une variable <code>score</code> qui vaut <code>10</code>. Puis affiche le double du score, <strong>sans écrire 20 toi-même</strong> : laisse Python calculer.</p>`,
      code:`# 1. Crée la boîte score

# 2. Affiche le double
`,
      hints:['<code>score = 10</code> crée la boîte.','Le double, c’est <code>score * 2</code>. Mets-le dans <code>print()</code>.'],
      check:(r, code) => {
        if (r.err) return ERR;
        const sc = memOf(r, 'score');
        if (!sc) return 'Je ne trouve pas de boîte <code>score</code> dans la mémoire. Commence par <code>score = 10</code>.';
        if (sc.repr !== '10') return `Ta boîte <code>score</code> contient ${esc(sc.repr)}. Il faut 10.`;
        if (/(^|[^\w.])20(?![\w.])/.test(strip(code))) return 'Tu as écrit 20 toi-même. Laisse Python calculer avec <code>score * 2</code>.';
        if (!/(^|\D)20(\D|$)/.test(r.out)) return 'La boîte est prête. Maintenant, affiche le double avec <code>print()</code>.';
        return true;
      },
      ok:'Python a fait le calcul à ta place. C’est tout l’intérêt des variables.' },
    { t:'code', defi:1, h:'Échange les boîtes', file:'echange.py', mem:1,
      p:`<p>Les boîtes <code>a</code> et <code>b</code> contiennent 1 et 2. Échange leur contenu pour que <code>a</code> vaille 2 et <code>b</code> vaille 1, <strong>sans réécrire les nombres 1 ou 2</strong>.</p>`,
      code:`a = 1
b = 2
# Échange les valeurs ici

print(a, b)`,
      hints:['Si tu fais <code>a = b</code> tout de suite, l’ancienne valeur de a est perdue. Mets-la d’abord à l’abri dans une troisième boîte.','<code>temp = a</code>, puis <code>a = b</code>, puis <code>b = temp</code>.'],
      check:(r, code) => {
        if (r.err) return ERR;
        const ma = memOf(r, 'a'), mb = memOf(r, 'b');
        if (!ma || !mb) return 'Les boîtes a et b ont disparu. Garde les deux premières lignes.';
        const rest = strip(code).replace(/^\s*a\s*=\s*1\s*$/m, '').replace(/^\s*b\s*=\s*2\s*$/m, '');
        if (/\b[12]\b/.test(rest)) return 'Pas le droit de réécrire 1 ou 2 : utilise les variables elles-mêmes.';
        if (ma.repr !== '2' || mb.repr !== '1') return `Pour l’instant, a vaut ${esc(ma.repr)} et b vaut ${esc(mb.repr)}. Il faut a = 2 et b = 1.`;
        return true;
      },
      ok:'Bien joué. Petit secret : en Python, on peut aussi écrire <code>a, b = b, a</code> en une seule ligne.' },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce programme devrait afficher <code>Salut Alex</code>, mais il plante. Exécute-le, lis l'explication de l'erreur, puis répare-le.</p>`,
      code:`nom = "Alex"
print("Salut " + Nom)`,
      hints:['Lis l’erreur : quel nom Python ne connaît pas ?','Pour Python, <code>Nom</code> et <code>nom</code> sont deux noms différents.'],
      check:(r, code) => code.trim() === 'nom = "Alex"\nprint("Salut " + Nom)' ? 'Voilà le bug ! Lis l’explication dans la console, puis corrige le code.' : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : !/Salut Alex/.test(r.out) ? 'Plus d’erreur, mais il faut afficher exactement <code>Salut Alex</code>.' : true,
      ok:'C’était la majuscule. La <code>NameError</code> veut presque toujours dire : faute de frappe, ou variable pas encore créée.' }
  ],
  recap:['Une variable est une boîte avec une étiquette : <code>score = 10</code>.','Le <code>=</code> veut dire « range la valeur de droite dans la boîte de gauche ».','Une variable peut changer de valeur : la nouvelle remplace l’ancienne.','Noms en minuscules avec des <code>_</code>, sans espace, sans chiffre au début. <code>nom</code> et <code>Nom</code> sont différents.'] };

LES['1-3'] = { title:'Les types de valeurs', dur:'10 min',
  intro:'Pour Python, 19 et "19" ne sont pas du tout la même chose. Dans cette leçon, tu découvres les types : la nature de ce qu’il y a dans chaque boîte.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`x = 5
x = x + 1
print(x)`,
      opts:[ {l:'5', why:'La deuxième ligne range x + 1, donc 6, dans x.'},
             {l:'6', ok:1},
             {l:'x + 1', why:'Sans guillemets, Python calcule.'},
             {l:'Une erreur', why:'<code>x = x + 1</code> est parfaitement valide : calcule à droite, range à gauche.'} ],
      ex:'Python calcule <code>x + 1</code> avec l’ancienne valeur (5), puis range 6 dans x.' },
    { t:'say', h:'Les quatre types de base', file:'types.py',
      p:`<p>Chaque valeur a un <strong>type</strong> :</p><ul><li><code>int</code> : un nombre entier, comme <code>19</code> ou <code>-3</code></li><li><code>float</code> : un nombre à virgule, comme <code>3.5</code>. On écrit un <strong>point</strong>, pas une virgule.</li><li><code>str</code> : du texte entre guillemets, comme <code>"Bonjour"</code></li><li><code>bool</code> : vrai ou faux, <code>True</code> ou <code>False</code></li></ul><p>La fonction <code>type()</code> te dit le type d'une valeur.</p>`,
      code:`print(type(19))
print(type(3.5))
print(type("Bonjour"))
print(type(True))` },
    { t:'quiz', h:'Le piège des guillemets', p:`<p>Quel est le type de <code>"19"</code> ?</p>`,
      opts:[ {l:'int', why:'Il y a des guillemets : pour Python, c’est du texte, même si ça ressemble à un nombre.'},
             {l:'float', why:'Pas de point, et surtout il y a des guillemets.'},
             {l:'str', ok:1},
             {l:'bool', why:'Un bool vaut seulement True ou False.'} ],
      ex:'<code>"19"</code> est du texte. Python ne peut pas faire de calcul avec tant qu’on ne l’a pas converti. Tu verras comment dans la leçon 1.6.' },
    { t:'say', h:'Pourquoi le type compte', file:'plus.py',
      p:`<p>Le même signe <code>+</code> ne fait pas la même chose selon le type. Avec des nombres, il additionne. Avec du texte, il <strong>colle</strong> les morceaux. Et <code>*</code> sur du texte le répète.</p>`,
      code:`print(5 + 5)
print("5" + "5")
print("5" * 3)` },
    { t:'quiz', h:'La division', p:`<p>Qu'affiche ce code ?</p>`, snip:`print(7 / 2)`,
      opts:[ {l:'3', why:'La division <code>/</code> garde les décimales. Pour une division entière, tu verras <code>//</code> dans la leçon suivante.'},
             {l:'3.5', ok:1},
             {l:'4', why:'Python n’arrondit pas avec <code>/</code>.'},
             {l:'7/2', why:'Pas de guillemets, donc Python calcule.'} ],
      ex:'<code>/</code> donne toujours un float. Même <code>print(4 / 2)</code> affiche <code>2.0</code>, et pas 2.' },
    { t:'say', h:'Vrai ou faux', file:'booleens.py', mem:1,
      p:`<p>Le type <code>bool</code> n'a que deux valeurs : <code>True</code> et <code>False</code>, avec une majuscule. On les obtient souvent en <strong>comparant</strong> : <code>10 &gt; 3</code> vaut <code>True</code>.</p><p>Pour tester l'égalité, on écrit <code>==</code>, deux signes égal. Un seul <code>=</code> sert à ranger dans une boîte. C'est la base des conditions du chapitre 2.</p>`,
      code:`est_majeur = True
print(est_majeur)
print(10 > 3)
print(2 == 5)` },
    { t:'code', h:'À toi : une boîte de chaque type', file:'mes_types.py', mem:1,
      p:`<p>Crée quatre variables, une de chaque type : <code>age</code> (int), <code>taille</code> (float, en mètres), <code>ville</code> (str) et <code>etudiant</code> (bool). Puis affiche le type de <code>taille</code>.</p>`,
      code:`# Tes quatre variables

# Le type de taille
`,
      hints:['Exemple pour la première : <code>age = 19</code>.','<code>taille = 1.75</code>, <code>ville = "Lyon"</code>, <code>etudiant = True</code>, puis <code>print(type(taille))</code>.'],
      check:r => {
        if (r.err) return ERR;
        const want = [['age','int',''],['taille','float',' Écris un nombre à virgule avec un point, comme <code>1.75</code>.'],['ville','str',' Mets le texte entre guillemets.'],['etudiant','bool',' Écris <code>True</code> ou <code>False</code>, sans guillemets et avec une majuscule.']];
        for (const [n, t, tip] of want) {
          const m = memOf(r, n);
          if (!m) return `Il manque la boîte <code>${n}</code>.`;
          if (m.type !== t) return `<code>${n}</code> est de type ${esc(m.type)}, il faut ${t}.${tip}`;
        }
        if (!/float/.test(r.out)) return 'Tes boîtes sont parfaites. Affiche maintenant <code>type(taille)</code> avec <code>print()</code>.';
        return true;
      },
      ok:'Quatre boîtes, quatre types. Regarde la mémoire : chaque boîte affiche son type.' },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code devrait afficher <code>J'ai 19 ans</code>. Il plante : lis l'explication, puis répare-le.</p>`,
      code:`age = 19
print("J'ai " + age + " ans")`,
      hints:['On ne peut pas coller du texte et un nombre avec <code>+</code>. Il faut transformer le nombre en texte.','<code>str(age)</code> transforme 19 en "19". Autre solution : les virgules, <code>print("J\'ai", age, "ans")</code>.'],
      check:(r, code) => code.trim() === 'age = 19\nprint("J\'ai " + age + " ans")' ? 'Voilà le bug ! Lis l’explication dans la console, puis corrige le code.' : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : !/J'ai 19 ans/.test(r.out) ? 'Plus d’erreur, mais il faut afficher exactement <code>J\'ai 19 ans</code>.' : true,
      ok:'Tu as rencontré la <code>TypeError</code>, une des erreurs les plus fréquentes. Tu sais maintenant la reconnaître.' }
  ],
  recap:['4 types de base : <code>int</code> (entier), <code>float</code> (à virgule, avec un point), <code>str</code> (texte), <code>bool</code> (<code>True</code> ou <code>False</code>).','<code>type(x)</code> donne le type de x.','<code>"19"</code> est du texte, pas un nombre.','<code>+</code> additionne les nombres mais colle le texte. Mélanger les deux donne une <code>TypeError</code>.','<code>==</code> compare, <code>=</code> range.'] };

LES['1-4'] = { title:'Calculer', dur:'12 min',
  intro:'Python est une super calculatrice. Dans cette leçon : les opérations, les priorités, et deux opérateurs très utiles que peu de gens connaissent.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Quel est le type de <code>3.0</code> ?</p>`,
      opts:[ {l:'int', why:'Il y a un point : c’est un float, même si la partie après la virgule vaut 0.'},
             {l:'float', ok:1},
             {l:'str', why:'Pas de guillemets, ce n’est pas du texte.'},
             {l:'bool', why:'Un bool vaut seulement True ou False.'} ],
      ex:'Le point décide de tout : <code>3</code> est un int, <code>3.0</code> est un float.' },
    { t:'say', h:'Les sept opérations', file:'operations.py',
      p:`<p>En plus de <code>+</code>, <code>-</code>, <code>*</code> (multiplier) et <code>/</code> (diviser), Python a trois opérations spéciales :</p><ul><li><code>//</code> : la division <strong>entière</strong>, sans les décimales. 17 // 5 donne 3.</li><li><code>%</code> : le <strong>reste</strong> de la division. 17 % 5 donne 2, car 17 = 3 × 5 + 2.</li><li><code>**</code> : la <strong>puissance</strong>. 2 ** 10 donne 1024.</li></ul>`,
      code:`print(17 + 5)
print(17 - 5)
print(17 * 5)
print(17 / 5)
print(17 // 5)
print(17 % 5)
print(2 ** 10)` },
    { t:'quiz', h:'Le reste', p:`<p>Qu'affiche ce code ?</p>`, snip:`print(20 % 6)`,
      opts:[ {l:'3', why:'Ça, c’est <code>20 // 6</code> : combien de fois 6 rentre dans 20.'},
             {l:'2', ok:1},
             {l:'3.33', why:'Ça ressemble à <code>20 / 6</code>. Le <code>%</code> donne le reste.'},
             {l:'0', why:'On aurait 0 si 6 rentrait pile dans 20.'} ],
      ex:'6 rentre 3 fois dans 20 (3 × 6 = 18), et il reste 2.' },
    { t:'say', h:'Qui passe en premier ?', file:'priorites.py',
      p:`<p>Comme en maths : <code>**</code> d'abord, puis <code>*</code> <code>/</code> <code>//</code> <code>%</code>, puis <code>+</code> et <code>-</code>. Les <strong>parenthèses</strong> passent avant tout.</p>`,
      code:`print(2 + 3 * 4)
print((2 + 3) * 4)` },
    { t:'quiz', h:'À toi de calculer', p:`<p>Qu'affiche ce code ?</p>`, snip:`print(10 - 2 * 3)`,
      opts:[ {l:'24', why:'Ce serait vrai avec des parenthèses : <code>(10 - 2) * 3</code>. Mais la multiplication passe avant.'},
             {l:'4', ok:1},
             {l:'8', why:'Il faut d’abord faire 2 * 3 = 6, puis 10 - 6.'},
             {l:'Une erreur', why:'Aucune erreur, c’est un calcul normal.'} ],
      ex:'D’abord <code>2 * 3 = 6</code>, puis <code>10 - 6 = 4</code>.' },
    { t:'say', h:'Les raccourcis', file:'raccourcis.py', mem:1,
      p:`<p>Augmenter une variable revient très souvent. Au lieu de <code>points = points + 50</code>, on écrit <code>points += 50</code>. Pareil avec <code>-=</code>, <code>*=</code> et <code>/=</code>.</p>`,
      code:`vies = 3
vies -= 1
print(vies)
points = 0
points += 50
points += 25
print(points)` },
    { t:'code', h:'À toi : la soirée pizza', file:'pizza.py', mem:1,
      p:`<p>Une pizza coûte 12.5 €. Vous êtes 4 amis et vous en prenez 3. Range ces nombres dans des variables, puis calcule et affiche le prix par personne. Ne fais pas le calcul de tête : c'est le travail de Python.</p>`,
      code:`prix_pizza = 12.5
`,
      hints:['Crée <code>nb_pizzas = 3</code> et <code>nb_amis = 4</code>.','<code>prix_pizza * nb_pizzas / nb_amis</code>, dans un <code>print()</code>.'],
      check:(r, code) => r.err ? ERR : /9\.375/.test(strip(code)) ? 'Tu as écrit le résultat toi-même. Laisse Python le calculer avec tes variables.' : /9\.375/.test(r.out) ? true : !r.out.trim() ? 'Rien ne s’affiche. N’oublie pas le <code>print()</code>.' : 'Ce n’est pas encore le bon prix. Le total, c’est le prix fois le nombre de pizzas. Ensuite, on divise par le nombre d’amis.',
      ok:'Chacun paie 9.375 €. Pour arrondir, Python a <code>round(9.375, 2)</code>, qui donne 9.38. Tu le reverras plus tard.' },
    { t:'code', defi:1, h:'Les minutes', file:'minutes.py',
      p:`<p>Transforme <code>minutes</code> en heures et minutes avec <code>//</code> et <code>%</code>. Pour 135, ton programme doit afficher : <code>2 h 15 min</code>.</p><p>Attention : je testerai aussi ton code avec un autre nombre de minutes.</p>`,
      code:`minutes = 135
`,
      hints:['<code>heures = minutes // 60</code> : combien de fois 60 rentre dans minutes.','<code>reste = minutes % 60</code>, puis <code>print(heures, "h", reste, "min")</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/\/\/\s*60/.test(code) || !/%\s*60/.test(code)) return 'Utilise <code>// 60</code> pour les heures et <code>% 60</code> pour les minutes qui restent.';
        if (!/2\s*h\s*15\s*min/.test(r.out)) return 'Pour 135, il faut afficher <code>2 h 15 min</code>. Astuce : <code>print(heures, "h", reste, "min")</code>.';
        const t = await test([], code.replace(/minutes\s*=\s*135/, 'minutes = 200'));
        if (t.err || !/3\s*h\s*20\s*min/.test(t.out)) return 'Ça marche pour 135, mais pas quand je teste avec 200 minutes : il faudrait 3 h 20 min. Utilise bien la variable <code>minutes</code>, sans écrire 2 ou 15.';
        return true;
      },
      ok:'Et ça marche aussi avec 200 minutes : 3 h 20 min. Ton programme fonctionne pour n’importe quel nombre. C’est ça, la force d’une variable.' },
    { t:'quiz', h:'Pair ou impair ?', p:`<p>Quel calcul permet de savoir si un nombre <code>n</code> est pair ?</p>`,
      opts:[ {l:'n / 2', why:'Ça donne la moitié, mais 7 / 2 = 3.5 et 8 / 2 = 4.0 : pas très pratique à tester.'},
             {l:'n % 2', ok:1},
             {l:'n // 2', why:'Ça donne la moitié sans décimales, mais 7 // 2 et 6 // 2 donnent tous les deux 3.'},
             {l:'n ** 2', why:'Ça, c’est le carré de n.'} ],
      ex:'Si <code>n % 2</code> vaut 0, il ne reste rien quand on divise par 2 : n est pair. S’il vaut 1, n est impair. Tu t’en serviras souvent avec les conditions.' }
  ],
  recap:['<code>+ - * /</code> comme en maths. <code>/</code> donne toujours un float.','<code>//</code> : division entière. <code>%</code> : reste. <code>**</code> : puissance.','Priorités : parenthèses, puis <code>**</code>, puis <code>* / // %</code>, puis <code>+ -</code>.','<code>x += 5</code> est un raccourci pour <code>x = x + 5</code>.','<code>n % 2</code> vaut 0 quand n est pair.'] };

LES['1-5'] = { title:'Jouer avec le texte', dur:'12 min',
  intro:'Le texte est partout : des prénoms, des messages, des mots de passe. Dans cette leçon, tu apprends à le coller, le mesurer, le découper et le transformer.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`print(2 ** 3)`,
      opts:[ {l:'6', why:'<code>**</code> est la puissance : 2 × 2 × 2.'},
             {l:'8', ok:1},
             {l:'5', why:'Ce serait 2 + 3. Ici, c’est 2 puissance 3.'},
             {l:'23', why:'Ce sont des nombres, pas du texte.'} ],
      ex:'<code>2 ** 3</code>, c’est 2 × 2 × 2 = 8.' },
    { t:'say', h:'Coller, répéter, mesurer', file:'texte.py',
      p:`<p>Tu as vu que <code>+</code> colle des textes et que <code>*</code> les répète. La fonction <code>len()</code> donne leur <strong>longueur</strong> : le nombre de caractères, espaces et ponctuation compris.</p>`,
      code:`prenom = "Sam"
print("Salut " + prenom + " !")
print("ha" * 3)
print(len(prenom))` },
    { t:'quiz', h:'Compte bien', p:`<p>Qu'affiche ce code ?</p>`, snip:`print(len("Bonjour !"))`,
      opts:[ {l:'7', why:'Bonjour a 7 lettres, mais <code>len()</code> compte aussi l’espace et le point d’exclamation.'},
             {l:'8', why:'Presque ! N’oublie pas l’espace.'},
             {l:'9', ok:1},
             {l:'10', why:'Un de trop : 7 lettres, 1 espace, 1 point d’exclamation.'} ],
      ex:'7 lettres + 1 espace + 1 point d’exclamation = 9 caractères.' },
    { t:'say', h:'Les f-strings, les meilleures amies du texte', file:'fstring.py',
      p:`<p>Coller des morceaux avec <code>+</code> devient vite pénible, surtout avec des nombres. La solution : mettre un <code>f</code> devant les guillemets, puis écrire les variables entre accolades <code>{ }</code>. Python remplace chaque <code>{ }</code> par sa valeur.</p><p>Tu peux même y mettre des calculs. Et plus besoin de <code>str()</code>.</p>`,
      code:`prenom = "Sam"
age = 19
print(f"Je m'appelle {prenom} et j'ai {age} ans.")
print(f"Dans 10 ans, j'aurai {age + 10} ans.")` },
    { t:'say', h:'Chaque lettre a un numéro', file:'indices.py',
      p:`<p>Dans un texte, chaque caractère a une <strong>position</strong>, qu'on appelle un <em>indice</em>. Le piège : on commence à compter à <strong>0</strong>. <code>mot[0]</code> donne la première lettre, et <code>mot[-1]</code> la dernière.</p>`,
      code:`mot = "Python"
print(mot[0])
print(mot[1])
print(mot[-1])` },
    { t:'quiz', h:'Quelle lettre ?', p:`<p>Qu'affiche ce code ?</p>`, snip:`mot = "Python"
print(mot[2])`,
      opts:[ {l:'y', why:'y est en position 1. On commence à 0 : P = 0, y = 1, t = 2.'},
             {l:'t', ok:1},
             {l:'P', why:'P est en position 0.'},
             {l:'h', why:'h est en position 3.'} ],
      ex:'P = 0, y = 1, t = 2. Compter à partir de 0, c’est le réflexe à prendre en programmation.' },
    { t:'say', h:'Transformer le texte', file:'methodes.py',
      p:`<p>Le texte a des <strong>méthodes</strong> : des actions qu'on écrit après un point. <code>upper()</code> met en majuscules, <code>lower()</code> en minuscules, <code>replace()</code> remplace un morceau par un autre.</p><p>Retiens cette forme : <code>texte.action()</code>. C'est exactement comme ça que marchent les objets en POO.</p><p>Regarde la dernière ligne : <code>phrase</code> n'a pas changé. Ces méthodes créent un nouveau texte sans toucher à l'original.</p>`,
      code:`phrase = "j'adore le Java"
print(phrase.upper())
print(phrase.replace("Java", "Python"))
print(phrase)` },
    { t:'code', h:'À toi : présente-toi', file:'presente.py', mem:1,
      p:`<p>Remplis les variables <code>prenom</code> et <code>ville</code>, puis affiche avec une f-string : <code>Je m'appelle Sam et j'habite à Paris.</code> (avec tes valeurs, et le point final).</p>`,
      code:`prenom = ""
ville = ""
`,
      hints:['Une f-string commence par un <code>f</code> collé aux guillemets : <code>f"Je m\'appelle {prenom} ..."</code>','<code>print(f"Je m\'appelle {prenom} et j\'habite à {ville}.")</code>'],
      check:(r, code) => {
        if (r.err) return ERR;
        const pv = strOf(memOf(r, 'prenom')), vv = strOf(memOf(r, 'ville'));
        if (pv === null || vv === null) return 'Il faut garder les deux boîtes <code>prenom</code> et <code>ville</code>, avec du texte dedans.';
        if (!pv || !vv) return 'Remplis les guillemets avec ton prénom et ta ville.';
        if (!/\bf["']/.test(code)) return 'L’affichage doit passer par une f-string : un <code>f</code> collé devant les guillemets.';
        if (!r.out.includes(`Je m'appelle ${pv} et j'habite à ${vv}.`)) return `Il faut afficher exactement : <code>Je m'appelle ${esc(pv)} et j'habite à ${esc(vv)}.</code>`;
        return true;
      },
      ok:'Propre et lisible. Dans la vraie vie, on utilise les f-strings presque tout le temps.' },
    { t:'code', defi:1, h:'Première lettre et longueur', file:'mot.py',
      p:`<p>La variable <code>mot</code> contient un mot. Affiche sa première lettre <strong>en majuscule</strong>, puis sa longueur, chacune sur sa ligne. Pour "python", ça donne <code>P</code> puis <code>6</code>.</p><p>Je testerai aussi ton code avec un autre mot.</p>`,
      code:`mot = "python"
`,
      hints:['La première lettre : <code>mot[0]</code>. En majuscule : <code>mot[0].upper()</code>.','La longueur : <code>len(mot)</code>. Un <code>print()</code> pour chaque ligne.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const w = strOf(memOf(r, 'mot'));
        if (!w) return 'Garde une boîte <code>mot</code> qui contient un mot.';
        const ls = linesOf(r.out);
        if (ls[0] !== w[0].toUpperCase()) return `La première ligne doit être <code>${esc(w[0].toUpperCase())}</code> : la première lettre de « ${esc(w)} », en majuscule.`;
        if (ls[1] !== String(w.length)) return `La deuxième ligne doit être la longueur du mot : <code>${w.length}</code>.`;
        const t = await test([], code.replace(/mot\s*=\s*(["']).*?\1/, 'mot = "atelier"'));
        const tl = linesOf(t.out);
        if (t.err || tl[0] !== 'A' || tl[1] !== '7') return 'Ça marche pour ton mot, mais pas quand je teste avec "atelier" : il faudrait A puis 7. Utilise la variable <code>mot</code> au lieu d’écrire la réponse.';
        return true;
      },
      ok:'Testé avec un autre mot : ça marche aussi. Tu viens de combiner un indice, une méthode et une fonction.' }
  ],
  recap:['<code>+</code> colle, <code>*</code> répète, <code>len()</code> mesure (espaces compris).','f-string : <code>f"Salut {prenom}"</code>. On peut y mettre des calculs.','Les indices commencent à 0 : <code>mot[0]</code> est la première lettre, <code>mot[-1]</code> la dernière.','Méthodes du texte : <code>upper()</code>, <code>lower()</code>, <code>replace()</code>. Elles renvoient un nouveau texte.'] };

LES['1-6'] = { title:'Dialoguer avec input()', dur:'12 min',
  intro:'Jusqu’ici, tes programmes parlaient tout seuls. Maintenant, ils vont poser des questions et écouter la réponse.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`age = 19
print(f"Dans 1 an : {age + 1}")`,
      opts:[ {l:'Dans 1 an : {age + 1}', why:'Le <code>f</code> devant les guillemets dit à Python de remplacer ce qui est entre accolades.'},
             {l:'Dans 1 an : 20', ok:1},
             {l:'Dans 1 an : 191', why:'age est un nombre, donc <code>+</code> additionne.'},
             {l:'Une erreur', why:'Les calculs sont permis dans les accolades d’une f-string.'} ],
      ex:'Python calcule <code>age + 1</code> et met le résultat à la place des accolades.' },
    { t:'say', h:'Poser une question', file:'question.py',
      p:`<p><code>input()</code> met le programme en pause et attend que l'utilisateur écrive quelque chose. Le texte entre parenthèses est la question affichée. La réponse est rangée dans une variable.</p><p>Exécute : un champ apparaît dans la console. Tape ta réponse et appuie sur <strong>Entrée</strong>.</p>`,
      code:`prenom = input("Comment tu t'appelles ? ")
print(f"Enchanté, {prenom} !")` },
    { t:'quiz', h:'Le grand piège de input()', p:`<p>L'utilisateur tape 19. Quel est le type de <code>age</code> ?</p>`, snip:`age = input("Ton âge ? ")`,
      opts:[ {l:'int', why:'C’est le piège classique ! <code>input()</code> renvoie toujours du texte, même si on tape un nombre.'},
             {l:'str', ok:1},
             {l:'float', why:'<code>input()</code> ne devine jamais : il renvoie du texte.'},
             {l:'bool', why:'Non, <code>input()</code> renvoie ce qui a été tapé, sous forme de texte.'} ],
      ex:'<code>input()</code> renvoie <strong>toujours</strong> du texte. Pour Python, age contient "19", pas 19.' },
    { t:'say', h:'Convertir', file:'conversion.py',
      p:`<p>Pour transformer le texte en nombre, on utilise <code>int()</code> (entier) ou <code>float()</code> (à virgule). Dans l'autre sens, <code>str()</code> transforme en texte.</p><p>On peut écrire la conversion directement autour de <code>input()</code>.</p>`,
      code:`age = int(input("Ton âge ? "))
print(f"L'an prochain, tu auras {age + 1} ans.")` },
    { t:'code', bug:1, h:'Répare le calcul', file:'bug.py',
      p:`<p>Ce programme calcule ton âge à partir de ton année de naissance. Il plante. Exécute-le, réponds à la question, lis l'explication, puis répare-le.</p>`,
      code:`annee = input("Ton année de naissance ? ")
age = 2026 - annee
print(f"Tu as {age} ans.")`,
      hints:['Lis l’erreur : on essaie de soustraire du texte à un nombre.','Mets <code>int()</code> autour de <code>input(...)</code>.'],
      check:async (r, code, test) => {
        if (code.trim() === LES['1-6'].steps[4].code) return 'Voilà le bug ! Lis l’explication dans la console, puis corrige le code.';
        const t = await test(['2005']);
        if (t.err) return `Quand je réponds 2005, le code plante encore : ${esc(t.err.title)}.`;
        if (!/(^|\D)21(\D|$)/.test(t.out)) return 'Quand je réponds 2005, je devrais lire 21 ans.';
        return true;
      },
      ok:'Testé avec 2005 : 21 ans. Oublier de convertir un <code>input()</code>, ça arrive même aux pros.' },
    { t:'quiz', h:'Et ça, ça donne quoi ?', p:`<p>Qu'est-ce qui se passe ?</p>`, snip:`nombre = int("3.5")`,
      opts:[ {l:'nombre vaut 3', why:'On pourrait le croire, mais <code>int()</code> refuse un texte qui contient un point.'},
             {l:'nombre vaut 3.5', why:'<code>int()</code> donne un entier, jamais 3.5.'},
             {l:'nombre vaut 4', why:'<code>int()</code> n’arrondit pas.'},
             {l:'Une erreur', ok:1} ],
      ex:'Python affiche une <code>ValueError</code> : <code>int()</code> n’accepte que du texte qui ressemble à un entier. Pour "3.5", il faut <code>float()</code>.' },
    { t:'code', h:'À toi : la calculatrice', file:'somme.py',
      p:`<p>Demande deux nombres entiers à l'utilisateur, puis affiche leur somme.</p><p>Je testerai ton programme en répondant 4 et 6, puis 12 et 30.</p>`,
      code:``,
      hints:['<code>a = int(input("Premier nombre ? "))</code>, et pareil pour b.','Puis <code>print(a + b)</code>.'],
      check:async (r, code, test) => {
        if (nInputs(code) < 2) return 'Il faut poser deux questions : deux <code>input()</code>.';
        const t1 = await test(['4', '6']);
        if (t1.err) return `Quand je réponds 4 puis 6, ton code plante : ${esc(t1.err.title)}.`;
        if (!/(^|\D)10(\.0)?(\D|$)/.test(t1.out)) return /46/.test(t1.out) ? 'J’obtiens 46 : les nombres ont été collés comme du texte. Convertis-les avec <code>int()</code>.' : 'Avec 4 et 6, je devrais voir 10.';
        const t2 = await test(['12', '30']);
        if (t2.err || !/(^|\D)42(\.0)?(\D|$)/.test(t2.out)) return 'Ça marche avec 4 et 6, mais pas avec 12 et 30 : il faudrait 42.';
        return true;
      },
      ok:'Testé avec 4 + 6 et 12 + 30 : tout est bon. Ta première calculatrice.' },
    { t:'code', defi:1, h:'Le calcul d’âge', file:'age.py',
      p:`<p>Demande à l'utilisateur son prénom, puis son année de naissance. Affiche ensuite : <code>Sam, tu as environ 21 ans.</code> On est en 2026.</p><p>Je testerai avec Sam né en 2005, puis avec Inès née en 1990.</p>`,
      code:``,
      hints:['Deux questions : le prénom (du texte, pas de conversion) et l’année (avec <code>int()</code>).','<code>age = 2026 - annee</code>, puis une f-string : <code>f"{prenom}, tu as environ {age} ans."</code>'],
      check:async (r, code, test) => {
        if (nInputs(code) < 2) return 'Il faut deux questions : le prénom, puis l’année de naissance.';
        const t = await test(['Sam', '2005']);
        if (t.err) return `Quand je réponds Sam puis 2005, ton code plante : ${esc(t.err.title)}.`;
        if (!/Sam/.test(t.out.split('\n').slice(2).join('\n')) && !/Sam,/.test(t.out)) return 'Je ne vois pas le prénom dans la phrase finale.';
        if (!/(^|\D)21(\D|$)/.test(t.out)) return 'Pour 2005, il faudrait 21 ans.';
        const t2 = await test(['Inès', '1990']);
        if (t2.err || !/Inès/.test(t2.out) || !/(^|\D)36(\D|$)/.test(t2.out)) return 'Ça marche pour Sam, mais pas pour Inès née en 1990 : il faudrait 36 ans.';
        return true;
      },
      ok:'Questions, conversion, calcul, affichage : tu as écrit un vrai petit programme interactif.' }
  ],
  recap:['<code>input("Question ? ")</code> attend une réponse de l’utilisateur.','<code>input()</code> renvoie <strong>toujours</strong> du texte (str).','<code>int()</code>, <code>float()</code> et <code>str()</code> convertissent d’un type à l’autre.','<code>int("3.5")</code> donne une <code>ValueError</code> : il faut <code>float()</code>.'] };

LES['1-7'] = { title:'Projet : la fiche de personnage', dur:'15 min',
  intro:'Dernière leçon du chapitre : tu construis un vrai programme, étape par étape, avec tout ce que tu as appris. C’est le début du jeu de rôle qu’on retrouvera plus tard en POO.',
  steps:[
    { t:'say', h:'Le projet',
      p:`<p>Ton programme va poser des questions au joueur, puis afficher sa fiche de personnage. Voici ce qu'on veut obtenir :</p>`,
      snip:`Nom du héros ? Sam
Année de naissance ? 2005
Points de force (1 à 10) ? 7

=== Fiche de Sam ===
Âge : 21 ans
Force : 7
Attaque : 21
Puissance : 49`,
      p2:`<p>On le construit en trois étapes. À chaque étape, je reprends ton code de l'étape d'avant. L'attaque vaut la force fois 3, et la puissance vaut la force au carré.</p>` },
    { t:'code', h:'Étape 1 : les questions', file:'fiche.py', mem:1,
      p:`<p>Pose les trois questions et range les réponses dans <code>nom</code>, <code>annee</code> et <code>force</code>. Attention : <code>annee</code> et <code>force</code> doivent être des nombres.</p>`,
      code:`# Étape 1 : les questions
`,
      hints:['<code>nom = input("Nom du héros ? ")</code>','Pour les nombres : <code>annee = int(input("Année de naissance ? "))</code>, et pareil pour la force.'],
      check:async (r, code, test) => {
        if (nInputs(code) < 3) return 'Il faut trois questions : trois <code>input()</code>.';
        const t = await test(['Sam', '2005', '7']);
        if (t.err) return `Quand je réponds Sam, 2005 et 7, ton code plante : ${esc(t.err.title)}.`;
        if (strOf(memOf(t, 'nom')) !== 'Sam') return 'La boîte <code>nom</code> doit contenir le nom tapé par le joueur.';
        const a = memOf(t, 'annee'), f = memOf(t, 'force');
        if (!a) return 'Il manque la boîte <code>annee</code>.';
        if (a.type !== 'int') return '<code>annee</code> contient du texte. Convertis-la avec <code>int()</code>.';
        if (!f) return 'Il manque la boîte <code>force</code>.';
        if (f.type !== 'int') return '<code>force</code> contient du texte. Convertis-la avec <code>int()</code>.';
        return true;
      },
      ok:'Les trois réponses sont rangées, et les nombres sont bien des nombres.' },
    { t:'code', carry:1, h:'Étape 2 : les calculs', file:'fiche.py', mem:1,
      p:`<p>Sous tes questions, calcule trois variables : <code>age</code> (on est en 2026), <code>attaque</code> (la force fois 3) et <code>puissance</code> (la force au carré, avec <code>**</code>).</p>`,
      code:`# Étape 2 : les calculs
`,
      hints:['<code>age = 2026 - annee</code>','<code>attaque = force * 3</code> et <code>puissance = force ** 2</code>'],
      check:async (r, code, test) => {
        const t = await test(['Sam', '2005', '7']);
        if (t.err) return `Quand je réponds Sam, 2005 et 7, ton code plante : ${esc(t.err.title)}.`;
        const want = [['age','21','l’âge, 2026 moins l’année'],['attaque','21','la force fois 3'],['puissance','49','la force au carré']];
        for (const [n, v, what] of want) {
          const m = memOf(t, n);
          if (!m) return `Il manque la boîte <code>${n}</code> : ${what}.`;
          if (m.repr !== v) return `Avec une force de 7 et 2005, <code>${n}</code> devrait valoir ${v}, mais elle vaut ${esc(m.repr)}.`;
        }
        return true;
      },
      ok:'Tous les calculs sont justes.' },
    { t:'code', carry:1, h:'Étape 3 : la fiche', file:'fiche.py',
      p:`<p>Affiche la fiche comme dans l'exemple, avec des f-strings. Laisse une ligne vide avant le titre avec un <code>print()</code> tout seul.</p><p>Je testerai avec Sam (2005, force 7), puis avec Léo (1999, force 4).</p>`,
      code:`# Étape 3 : l'affichage
`,
      hints:['Le titre : <code>print(f"=== Fiche de {nom} ===")</code>','Une ligne par information : <code>print(f"Âge : {age} ans")</code>, puis la force, l’attaque et la puissance.'],
      check:async (r, code, test) => {
        const t = await test(['Sam', '2005', '7']);
        if (t.err) return `Quand je réponds Sam, 2005 et 7, ton code plante : ${esc(t.err.title)}.`;
        const o = norm(t.out);
        const want = ['Fiche de Sam', 'Âge : 21 ans', 'Force : 7', 'Attaque : 21', 'Puissance : 49'];
        for (const w of want) if (!o.includes(norm(w))) return `Il manque la ligne <code>${esc(w)}</code> (ou elle est écrite autrement).`;
        const t2 = await test(['Léo', '1999', '4']);
        const o2 = norm(t2.out);
        if (t2.err || !['Fiche de Léo', 'Âge : 27 ans', 'Attaque : 12', 'Puissance : 16'].every(w => o2.includes(norm(w)))) return 'Ça marche pour Sam, mais pas pour Léo (1999, force 4). Vérifie que tu utilises bien tes variables partout.';
        return true;
      },
      ok:'Testé avec Sam et avec Léo : ta fiche s’affiche parfaitement. C’est un vrai programme complet.' },
    { t:'say', h:'Garde-le dans VS Code',
      p:`<p>Bravo : c'est ton premier vrai programme, avec des questions, des calculs et un affichage. Pour le garder, crée un fichier <code>fiche.py</code> dans VS Code, tape ton code et lance-le avec le triangle ▶. Les questions apparaîtront dans le terminal, en bas.</p><p>Au chapitre 2, on ajoutera des conditions. Par exemple : afficher « Héros légendaire » si la force dépasse 8.</p>` }
  ],
  recap:['Un programme suit souvent ce plan : <strong>demander</strong>, <strong>calculer</strong>, <strong>afficher</strong>.','Convertis les réponses numériques avec <code>int()</code> dès la question.','Les f-strings rendent l’affichage simple et lisible.','Construire petit à petit et tester à chaque étape : c’est comme ça que travaillent les développeurs.'] };

/* Solutions de référence : utilisées seulement par dev/tests.html pour vérifier les corrections. */
const SOL = {
  '1-1': { 4:['print("Bonjour Sam")'], 5:['# Je me présente\nprint("Sam")\nprint("Lyon")'], 6:['print("Il fait beau")'] },
  '1-2': { 5:['score = 10\nprint(score * 2)'], 6:['a = 1\nb = 2\ntemp = a\na = b\nb = temp\nprint(a, b)'], 7:['nom = "Alex"\nprint("Salut " + nom)'] },
  '1-3': { 6:['age = 19\ntaille = 1.75\nville = "Lyon"\netudiant = True\nprint(type(taille))'], 7:['age = 19\nprint("J\'ai " + str(age) + " ans")'] },
  '1-4': { 6:['prix_pizza = 12.5\nnb_pizzas = 3\nnb_amis = 4\nprint(prix_pizza * nb_pizzas / nb_amis)'], 7:['minutes = 135\nheures = minutes // 60\nreste = minutes % 60\nprint(heures, "h", reste, "min")'] },
  '1-5': { 7:['prenom = "Sam"\nville = "Paris"\nprint(f"Je m\'appelle {prenom} et j\'habite à {ville}.")'], 8:['mot = "python"\nprint(mot[0].upper())\nprint(len(mot))'] },
  '1-6': { 4:['annee = int(input("Ton année de naissance ? "))\nage = 2026 - annee\nprint(f"Tu as {age} ans.")', ['2005']],
           6:['a = int(input("Premier nombre ? "))\nb = int(input("Deuxième nombre ? "))\nprint(a + b)', ['4', '6']],
           7:['prenom = input("Ton prénom ? ")\nannee = int(input("Ton année de naissance ? "))\nage = 2026 - annee\nprint(f"{prenom}, tu as environ {age} ans.")', ['Sam', '2005']] },
  '1-7': (() => {
    const q = 'nom = input("Nom du héros ? ")\nannee = int(input("Année de naissance ? "))\nforce = int(input("Points de force (1 à 10) ? "))';
    const c = q + '\nage = 2026 - annee\nattaque = force * 3\npuissance = force ** 2';
    const f = c + '\nprint()\nprint(f"=== Fiche de {nom} ===")\nprint(f"Âge : {age} ans")\nprint(f"Force : {force}")\nprint(f"Attaque : {attaque}")\nprint(f"Puissance : {puissance}")';
    const inp = ['Sam', '2005', '7'];
    return { 1:[q, inp], 2:[c, inp], 3:[f, inp] };
  })()
};
LES['1-6'].steps[3].solIn = ['19'];
for (const [id, steps] of Object.entries(SOL)) for (const [i, [sol, solIn]] of Object.entries(steps)) Object.assign(LES[id].steps[i], { sol, solIn });

Atelier.chapter({ part:"bases", n:1, title:"Premiers pas",
  lessons:["1-1","1-2","1-3","1-4","1-5","1-6","1-7"].map(id => ({ id, ...LES[id] })) });
})();
