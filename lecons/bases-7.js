/* Partie 1 · Chapitre 7 : Projet final des bases */
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has } = Atelier.h;
const LES = {};

/* Petites aides pour les corrections de ce chapitre */
const BUG = 'Voilà le bug ! Exécute, lis ce qui se passe, puis corrige le code.';
const same = (code, start) => code.trim() === start.trim();
const bugOf = id => LES[id].steps.find(s => s.bug).code;
// Exécute le code de l'élève, puis calcule expr avec ses variables et ses fonctions.
// Renvoie { err, val, out } : val est la valeur écrite comme en Python (repr).
async function call(test, code, expr, ins = []){
  const t = await test(ins, code + '\n\nprint("@@" + repr(' + expr + '))');
  if (t.err) return { err:t.err, out:t.out };
  const k = t.out.lastIndexOf('@@');
  return { val:k >= 0 ? t.out.slice(k + 2).trim() : null, out:t.out.slice(0, Math.max(k, 0)) };
}
// Ce qu'affiche une instruction ajoutée à la fin du code (sans ce que le code affichait déjà).
async function said(test, code, stmt){
  const base = await test([], code);
  const t = await test([], code + '\n\n' + stmt);
  return t.err ? { err:t.err } : { out:t.out.slice((base.out || '').length) };
}
const defined = (code, name) => new RegExp('^\\s*def\\s+' + name + '\\s*\\(', 'm').test(strip(code));
const noFn = name => `Je ne trouve pas la fonction <code>${name}</code>. Elle commence par <code>def ${name}(</code>.`;
const callErr = (expr, e) => `Quand j’exécute <code>${esc(expr)}</code>, ça plante : ${esc(e.title)}.`;
// Garde seulement les imports et les fonctions : le programme principal ne consomme pas les réponses prévues pour le test.
function onlyDefs(code){
  let keep = false;
  return code.split('\n').filter(l => {
    if (/^(def|import|from)\s/.test(l)) { keep = /^def\s/.test(l); return true; }
    if (/^\S/.test(l)) keep = false;
    return keep || !l.trim();
  }).join('\n');
}
const quoted = ins =>ins.map(v => `« ${esc(v)} »`).join(', ');
// Vérifie que les morceaux de texte apparaissent dans cet ordre. Renvoie le premier qui manque, ou null.
function inOrder(out, parts){
  let p = 0; const o = norm(out);
  for (const w of parts) { const k = o.indexOf(norm(w), p); if (k < 0) return w; p = k + norm(w).length; }
  return null;
}

LES['7-1'] = { title:'Concevoir son programme', dur:'15 min',
  intro:'Devant un gros projet, la page blanche fait peur. Le secret des développeurs : ne jamais tout écrire d’un coup. On découpe le problème en petits morceaux simples, puis on les assemble. C’est ce que tu apprends ici, avant de construire ton jeu.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur le chapitre 6', p:`<p>Que se passe-t-il quand on exécute ce code ?</p>`, snip:`def double(x):
    return x * 2

assert double(4) == 8
assert double(0) == 0
print("OK")`,
      opts:[ {l:'Ça affiche OK', ok:1},
             {l:'Une AssertionError', why:'Les deux conditions sont vraies : 4 × 2 = 8 et 0 × 2 = 0.'},
             {l:'Ça affiche True, True, OK', why:'Un <code>assert</code> qui réussit n’affiche rien du tout.'},
             {l:'Rien', why:'Les tests passent en silence, puis le <code>print</code> s’exécute.'} ],
      ex:'Un <code>assert</code> vrai ne fait rien. Les tests passent, et OK s’affiche.' },
    { t:'say', h:'De l’idée au code',
      p:`<p>Avant de taper la moindre ligne, on prend 5 minutes pour réfléchir. La méthode :</p><ol><li><strong>Décrire</strong> le programme en trois phrases, comme à un ami.</li><li><strong>Lister les données</strong> : qu'est-ce qu'il faut retenir ? (des listes, des dictionnaires…)</li><li><strong>Lister les actions</strong> : chaque verbe devient une fonction (décrire, se déplacer, prendre…).</li><li><strong>Écrire la boucle principale en français</strong>, c'est le <em>pseudo-code</em>.</li><li><strong>Coder un petit morceau</strong>, le tester, et recommencer.</li></ol><p>Voici le plan de notre jeu d'aventure :</p>`,
      snip:`Le jeu : on explore une crypte, salle par salle. On ramasse des objets.
         Il faut trouver la clé pour ouvrir la salle du trésor.

Données : les salles (description, sorties, objets), la position, l'inventaire.
Actions : decrire(salle), deplacer(direction), prendre(objet)

Boucle principale :
  tant que le jeu continue :
      décrire la salle où on est
      lire la commande du joueur
      si c'est une direction : se déplacer
      si c'est « prendre ... » : ramasser l'objet
      si c'est « quitter » : arrêter`,
      p2:`<p>Avec ce plan, le gros problème « faire un jeu » est devenu une série de petits problèmes que tu sais déjà résoudre.</p>` },
    { t:'quiz', h:'Ranger les salles', p:`<p>Chaque salle a une description, des sorties (direction → salle) et des objets. Quelle structure choisir pour <strong>toutes</strong> les salles ?</p>`,
      opts:[ {l:'Une liste de textes', why:'Un texte par salle ne suffit pas : il faut ranger plusieurs informations différentes pour chacune.'},
             {l:'Un dictionnaire de dictionnaires', ok:1},
             {l:'Un ensemble (set)', why:'Un ensemble n’a pas de clés : impossible de retrouver la salle « couloir » par son nom.'},
             {l:'Une variable par salle', why:'Avec <code>salle1</code>, <code>salle2</code>…, impossible d’aller d’une salle à l’autre avec son nom.'} ],
      ex:'<code>salles["couloir"]["sorties"]["est"]</code> : on retrouve une salle par son nom, puis chaque information par sa clé. C’est clair et ça se lit tout seul.' },
    { t:'say', h:'Le squelette', file:'squelette.py',
      p:`<p>Une bonne habitude : écrire d'abord le <strong>squelette</strong>, c'est-à-dire les fonctions vides avec leur nom. Le mot <code>pass</code> veut dire « rien pour l'instant » : il permet d'avoir une fonction vide sans erreur.</p><p>Le programme tourne déjà ! On remplit ensuite les fonctions une par une, en testant à chaque fois.</p>`,
      code:`def decrire(salle):
    pass  # à écrire plus tard

def deplacer(position, direction):
    pass  # à écrire plus tard

def main():
    print("Le jeu démarre...")
    decrire("entree")
    print("(rien ne se passe encore, mais tout est en place)")

main()` },
    { t:'quiz', h:'Le bon découpage', p:`<p>Tu prépares un quiz de révision : 10 questions, un score, un message final. Quel découpage est le meilleur ?</p>`,
      opts:[ {l:'Une seule grande fonction jeu() qui fait tout', why:'Elle serait longue, difficile à lire et impossible à tester morceau par morceau.'},
             {l:'Une fonction par question : question1(), question2()…', why:'Dix fonctions presque identiques : c’est de la répétition. Une seule fonction avec un paramètre suffit.'},
             {l:'poser(question) qui renvoie True ou False, puis une boucle qui compte le score', ok:1},
             {l:'Pas de fonction : le code tout en vrac', why:'Ça marche pour 10 lignes. Pour un vrai projet, on s’y perd vite.'} ],
      ex:'Une fonction = une tâche, réutilisable avec des paramètres. La boucle principale assemble le tout. C’est exactement ce que tu vas coder dans le défi.' },
    { t:'code', h:'À toi : les données du monde', file:'monde.py',
      p:`<p>Crée le dictionnaire <code>salles</code> d'une petite maison. Chaque salle est un dictionnaire avec une <code>"description"</code> (le texte que tu veux) et des <code>"sorties"</code> :</p><ul><li><code>"entree"</code> : au nord, le <code>"couloir"</code> ;</li><li><code>"couloir"</code> : au sud, l'<code>"entree"</code>, et à l'est, la <code>"cuisine"</code> ;</li><li><code>"cuisine"</code> : à l'ouest, le <code>"couloir"</code>.</li></ul>`,
      code:`salles = {
    "entree": {"description": "Tu es dans l'entrée.", "sorties": {"nord": "couloir"}},
}
`,
      hints:['La salle déjà écrite te sert de modèle. Ajoute une ligne par salle, entre les accolades de <code>salles</code>, avec une virgule à la fin.','<code>"couloir": {"description": "Un couloir sombre.", "sorties": {"sud": "entree", "est": "cuisine"}},</code> et pareil pour la cuisine.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const x = await call(test, code, 'sorted(salles)');
        if (x.err) return ERR;
        if (x.val !== "['couloir', 'cuisine', 'entree']") return `Il faut exactement trois salles : "entree", "couloir" et "cuisine". J’ai trouvé : <code>${esc(x.val)}</code>`;
        for (const [s, w, txt] of [['entree', "[('nord', 'couloir')]", 'nord → couloir'], ['couloir', "[('est', 'cuisine'), ('sud', 'entree')]", 'sud → entree, est → cuisine'], ['cuisine', "[('ouest', 'couloir')]", 'ouest → couloir']]) {
          const y = await call(test, code, `sorted(salles["${s}"]["sorties"].items())`);
          if (y.err) return `La salle "${s}" doit avoir une clé "sorties".`;
          if (y.val !== w) return `Les sorties de "${s}" ne sont pas bonnes. Il faut : ${txt}.`;
          const d = await call(test, code, `len(salles["${s}"]["description"]) > 0`);
          if (d.err || d.val !== 'True') return `La salle "${s}" doit avoir une "description" (un texte, pas vide).`;
        }
        return true;
      },
      ok:'Ta maison existe : trois salles reliées entre elles. Remarque que chaque sortie a sa sortie inverse : c’est ce qui rend la carte cohérente.',
      sol:`salles = {
    "entree": {"description": "Tu es dans l'entrée.", "sorties": {"nord": "couloir"}},
    "couloir": {"description": "Un couloir sombre.", "sorties": {"sud": "entree", "est": "cuisine"}},
    "cuisine": {"description": "Ça sent la soupe.", "sorties": {"ouest": "couloir"}},
}` },
    { t:'code', h:'À toi : se déplacer', file:'deplacer.py',
      p:`<p>Crée la fonction <code>deplacer(salles, position, direction)</code>. Elle <strong>renvoie</strong> la nouvelle position si la direction existe dans les sorties de la salle actuelle, et la même position sinon. Elle n'affiche rien.</p>`,
      code:`salles = {
    "entree": {"sorties": {"nord": "couloir"}},
    "couloir": {"sorties": {"sud": "entree", "est": "cuisine"}},
    "cuisine": {"sorties": {"ouest": "couloir"}},
}
`,
      hints:['Les sorties de la salle actuelle : <code>salles[position]["sorties"]</code>. Teste avec <code>if direction in …:</code>.','Si oui : <code>return salles[position]["sorties"][direction]</code>. Sinon : <code>return position</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'deplacer')) return noFn('deplacer');
        for (const [p, d, w] of [['entree', 'nord', 'couloir'], ['couloir', 'est', 'cuisine'], ['entree', 'sud', 'entree'], ['cuisine', 'nord', 'cuisine'], ['couloir', 'sud', 'entree']]) {
          const e = `deplacer(salles, "${p}", "${d}")`;
          const x = await call(test, code, e);
          if (x.err) return callErr(e, x.err) + (/KeyError/.test(x.err.raw) ? ' Vérifie que la direction existe avant de l’utiliser.' : '');
          if (x.val === 'None') return `<code>${e}</code> renvoie None : il manque un <code>return</code>.`;
          if (x.val !== `'${w}'`) return `<code>${e}</code> devrait renvoyer "${w}", et renvoie ${esc(x.val)}.`;
        }
        return true;
      },
      ok:'Une fonction courte, qui ne plante jamais, et qu’on peut tester sans lancer le jeu. Elle est prête à être branchée sur la boucle principale.',
      sol:`salles = {
    "entree": {"sorties": {"nord": "couloir"}},
    "couloir": {"sorties": {"sud": "entree", "est": "cuisine"}},
    "cuisine": {"sorties": {"ouest": "couloir"}},
}

def deplacer(salles, position, direction):
    if direction in salles[position]["sorties"]:
        return salles[position]["sorties"][direction]
    return position` },
    { t:'code', defi:1, h:'Le quiz de révision', file:'quiz.py',
      p:`<p>Applique la méthode à un autre projet. Les questions sont déjà là. Écris :</p><ul><li><code>poser(q)</code> : pose la question <code>q["question"]</code>, compare la réponse (nettoyée, en minuscules) à <code>q["reponse"]</code>, affiche <code>Bonne réponse !</code> ou <code>Raté, c'était tuple.</code>, et renvoie <code>True</code> ou <code>False</code> ;</li><li>une boucle qui pose toutes les questions et affiche le score final : <code>Score : 2/3</code>.</li></ul>`,
      code:`questions = [
    {"question": "Quel mot-clé crée une fonction ? ", "reponse": "def"},
    {"question": "Quel type ne peut pas être modifié : list ou tuple ? ", "reponse": "tuple"},
    {"question": "Que renvoie une fonction sans return ? ", "reponse": "none"},
]
`,
      hints:['<code>def poser(q):</code>, puis <code>rep = input(q["question"]).strip().lower()</code> et <code>if rep == q["reponse"]:</code> → message et <code>return True</code>.','Après la fonction : <code>score = 0</code>, <code>for q in questions:</code> → <code>if poser(q): score += 1</code>. Enfin <code>print(f"Score : {score}/{len(questions)}")</code>.'],
      check:async (r, code, test) => {
        if (!defined(code, 'poser')) return noFn('poser');
        for (const [ins, sc] of [[['def', 'list', 'None'], 2], [['  DEF ', 'tuple', 'none'], 3], [['print', 'list', 'rien'], 0]]) {
          const t = await test(ins);
          if (t.err) return `Quand je réponds ${quoted(ins)}, ton code plante : ${esc(t.err.title)}.`;
          const o = t.out;
          const good = (o.match(/bonne r[ée]ponse/gi) || []).length;
          if (good !== sc) return `Quand je réponds ${quoted(ins)}, il y a ${sc} bonne${sc > 1 ? 's' : ''} réponse${sc > 1 ? 's' : ''}, et je compte ${good} « Bonne réponse ».${ins[0] === '  DEF ' ? ' Nettoie la réponse avec <code>strip()</code> et <code>lower()</code>.' : ''}`;
          if (sc < 3 && !/rat[ée], c'[ée]tait tuple|rat[ée], c'[ée]tait def/i.test(o)) return `Quand une réponse est fausse, affiche la bonne : <code>Raté, c'était tuple.</code>`;
          if (!new RegExp('score\\s*:\\s*' + sc + '\\s*/\\s*3', 'i').test(o)) return `Quand je réponds ${quoted(ins)}, je devrais lire <code>Score : ${sc}/3</code>.`;
        }
        for (const [rep, w] of [['def', 'True'], ['class', 'False']]) {
          const x = await call(test, onlyDefs(code), 'poser({"question": "Mot-clé ? ", "reponse": "def"})', [rep]);
          if (x.err) return callErr('poser(…)', x.err);
          if (x.val !== w) return `<code>poser</code> doit <strong>renvoyer</strong> ${w} quand la réponse est ${w === 'True' ? 'bonne' : 'fausse'}, et elle renvoie ${esc(x.val)}.`;
        }
        return true;
      },
      ok:'Données, une fonction pour une tâche, une boucle qui assemble : tu viens d’appliquer la méthode de A à Z. Ajoute tes propres questions dans VS Code pour réviser tes contrôles.',
      sol:`questions = [
    {"question": "Quel mot-clé crée une fonction ? ", "reponse": "def"},
    {"question": "Quel type ne peut pas être modifié : list ou tuple ? ", "reponse": "tuple"},
    {"question": "Que renvoie une fonction sans return ? ", "reponse": "none"},
]

def poser(q):
    rep = input(q["question"]).strip().lower()
    if rep == q["reponse"]:
        print("Bonne réponse !")
        return True
    print(f"Raté, c'était {q['reponse']}.")
    return False

score = 0
for q in questions:
    if poser(q):
        score += 1
print(f"Score : {score}/{len(questions)}")`, solIn:['def', 'list', 'None'] },
    { t:'code', bug:1, h:'Répare le bug : le héros qui ne bouge pas', file:'bug.py',
      p:`<p>Le joueur va au nord, mais le programme affiche toujours <code>entree</code>. Pas d'erreur, juste un héros cloué sur place. Exécute-le, trouve pourquoi, puis répare-le pour afficher <code>couloir</code>.</p>`,
      code:`salles = {"entree": {"sorties": {"nord": "couloir"}}, "couloir": {"sorties": {"sud": "entree"}}}

def deplacer(position, direction):
    if direction in salles[position]["sorties"]:
        position = salles[position]["sorties"][direction]

position = "entree"
deplacer(position, "nord")
print(position)`,
      hints:['Dans la fonction, <code>position = …</code> change une variable <strong>locale</strong>. Le <code>position</code> du programme principal n’est pas touché (leçon 4.5).','La fonction doit <code>return position</code> à la fin, et l’appel doit récupérer le résultat : <code>position = deplacer(position, "nord")</code>.'],
      check:async (r, code, test) => {
        if (same(code, bugOf('7-1'))) return BUG;
        if (r.err) return ERR;
        if (linesOf(r.out).join() !== 'couloir') return 'Il faut afficher <code>couloir</code>.';
        if (/\bglobal\b/.test(strip(code))) return 'Ça marche avec <code>global</code>, mais fais-le proprement : un <code>return</code>, et l’appel qui récupère la valeur.';
        const x = await call(test, code, 'deplacer("couloir", "sud")');
        if (x.err || x.val !== "'entree'") return 'La fonction doit <strong>renvoyer</strong> la nouvelle position.';
        return true;
      },
      ok:'Le bug des variables locales, dans un vrai jeu. Valeur en entrée par les paramètres, valeur en sortie par le <code>return</code> : la règle du chapitre 4 n’a pas fini de te servir.',
      sol:`salles = {"entree": {"sorties": {"nord": "couloir"}}, "couloir": {"sorties": {"sud": "entree"}}}

def deplacer(position, direction):
    if direction in salles[position]["sorties"]:
        position = salles[position]["sorties"][direction]
    return position

position = "entree"
position = deplacer(position, "nord")
print(position)` }
  ],
  recap:['Avant de coder : décrire le programme, lister les données, lister les actions, écrire la boucle en français.','Chaque verbe devient une fonction, avec un nom clair. Une fonction = une tâche.','Commencer par un squelette : des fonctions vides avec <code>pass</code>.','Coder un petit morceau, le tester, puis passer au suivant.','Des données liées entre elles : un dictionnaire de dictionnaires.'] };

/* Le jeu d'aventure : chaque étape reprend la précédente (carry). */
const MONDE = `salles = {
    "entree": {
        "description": "Tu es dans l'entrée de la crypte. Il fait froid.",
        "sorties": {"nord": "couloir"},
        "objets": [],
    },
    "couloir": {
        "description": "Un long couloir éclairé par des torches.",
        "sorties": {"sud": "entree", "est": "armurerie", "nord": "tresor"},
        "objets": ["clé"],
    },
    "armurerie": {
        "description": "De vieilles armes rouillées pendent aux murs.",
        "sorties": {"ouest": "couloir"},
        "objets": ["épée", "potion"],
    },
    "tresor": {
        "description": "La salle du trésor ! Un coffre brille au centre.",
        "sorties": {"sud": "couloir"},
        "objets": ["couronne"],
    },
}`;
const DECRIRE = `def decrire(salles, position):
    salle = salles[position]
    print(salle["description"])
    print("Sorties : " + ", ".join(salle["sorties"]))
    if salle["objets"]:
        print("Objets : " + ", ".join(salle["objets"]))`;
const A1 = MONDE + '\n\n' + DECRIRE + '\n\ndecrire(salles, "couloir")';
const A2 = MONDE + '\n\n' + DECRIRE + `

position = "entree"
print("=== La Crypte du Serpent ===")
while True:
    decrire(salles, position)
    commande = input("> ").strip().lower()
    if commande == "quitter":
        print("À bientôt !")
        break
    elif commande in salles[position]["sorties"]:
        position = salles[position]["sorties"][commande]
    else:
        print("Tu ne peux pas aller par là.")`;
const PRENDRE = `    elif commande.startswith("prendre "):
        objet = commande[8:]
        if objet in salles[position]["objets"]:
            salles[position]["objets"].remove(objet)
            inventaire.append(objet)
            print(f"Tu prends : {objet}")
        else:
            print(f"Il n'y a pas de {objet} ici.")
    elif commande == "inventaire":
        if inventaire:
            print("Inventaire : " + ", ".join(inventaire))
        else:
            print("Inventaire : vide")`;
const A3 = MONDE + '\n\n' + DECRIRE + `

position = "entree"
inventaire = []
print("=== La Crypte du Serpent ===")
while True:
    decrire(salles, position)
    commande = input("> ").strip().lower()
    if commande == "quitter":
        print("À bientôt !")
        break
    elif commande in salles[position]["sorties"]:
        position = salles[position]["sorties"][commande]
` + PRENDRE + `
    else:
        print("Tu ne peux pas aller par là.")`;
const A4 = MONDE + '\n\n' + DECRIRE + `

position = "entree"
inventaire = []
print("=== La Crypte du Serpent ===")
while True:
    decrire(salles, position)
    commande = input("> ").strip().lower()
    if commande == "quitter":
        print("À bientôt !")
        break
    elif commande in salles[position]["sorties"]:
        destination = salles[position]["sorties"][commande]
        if destination == "tresor" and "clé" not in inventaire:
            print("La porte est verrouillée. Il te faut une clé.")
        else:
            position = destination
            if position == "tresor":
                decrire(salles, position)
                print("Tu as trouvé le trésor. Victoire !")
                break
` + PRENDRE + `
    else:
        print("Tu ne peux pas aller par là.")`;
const A5 = MONDE + '\n\n' + DECRIRE + `

salles["antre"] = {"description": "Une caverne brûlante, jonchée d'os.", "sorties": {"sud": "armurerie"}, "objets": []}
salles["armurerie"]["sorties"]["nord"] = "antre"
dragon_vivant = True

position = "entree"
inventaire = []
print("=== La Crypte du Serpent ===")
while True:
    decrire(salles, position)
    commande = input("> ").strip().lower()
    if commande == "quitter":
        print("À bientôt !")
        break
    elif commande in salles[position]["sorties"]:
        destination = salles[position]["sorties"][commande]
        if destination == "tresor" and "clé" not in inventaire:
            print("La porte est verrouillée. Il te faut une clé.")
        else:
            position = destination
            if position == "antre" and dragon_vivant:
                if "épée" in inventaire:
                    print("Tu terrasses le dragon !")
                    dragon_vivant = False
                else:
                    print("Le dragon te dévore. Game over.")
                    break
            if position == "tresor":
                decrire(salles, position)
                print("Tu as trouvé le trésor. Victoire !")
                break
` + PRENDRE + `
    else:
        print("Tu ne peux pas aller par là.")`;
const D_ENT = "l'entrée de la crypte", D_COU = 'couloir éclairé', D_ARM = 'armes rouillées', D_TRE = 'salle du trésor';
async function partie(test, ins, parts, extra){
  const t = await test(ins);
  if (t.err) return `Quand je joue ${quoted(ins)}, ton code plante : ${esc(t.err.title)}.`;
  const miss = inOrder(t.out, parts);
  if (miss) return `Quand je joue ${quoted(ins)}, il manque « ${esc(miss)} » à ce moment de la partie (ou c’est dans le désordre). Lis la console pour suivre la partie.`;
  return extra ? extra(t.out) : true;
}

LES['7-2'] = { title:'Le jeu d’aventure en mode texte', dur:'30 min',
  intro:'C’est le grand projet des bases : un vrai jeu d’aventure, comme ceux des années 80. Le joueur explore une crypte en tapant des commandes. Tu vas le construire en cinq étapes, en suivant le plan de la leçon d’avant.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`salles = {"entree": {"sorties": {"nord": "couloir", "est": "jardin"}}}
print(salles["entree"]["sorties"]["est"])`,
      opts:[ {l:'couloir', why:'"couloir" est la sortie nord. On demande la sortie est.'},
             {l:'jardin', ok:1},
             {l:'est', why:'"est" est la clé. Les crochets donnent la valeur associée.'},
             {l:'Une KeyError', why:'Toutes les clés existent : "entree", puis "sorties", puis "est".'} ],
      ex:'On descend étage par étage : la salle "entree", puis ses "sorties", puis la direction "est" : "jardin".' },
    { t:'say', h:'Le jeu',
      p:`<p>Voici à quoi ressemblera une partie quand tu auras fini :</p>`,
      snip:`=== La Crypte du Serpent ===
Tu es dans l'entrée de la crypte. Il fait froid.
Sorties : nord
> nord
Un long couloir éclairé par des torches.
Sorties : sud, est, nord
Objets : clé
> nord
La porte est verrouillée. Il te faut une clé.
Un long couloir éclairé par des torches.
Sorties : sud, est, nord
Objets : clé
> prendre clé
Tu prends : clé
...
Tu as trouvé le trésor. Victoire !`,
      p2:`<p>Les données du monde sont déjà écrites pour toi dans la première étape (tu pourras inventer ton propre monde ensuite). À chaque étape, je reprends ton code de l'étape d'avant. Ce projet est long : prends ton temps, et exécute souvent.</p>` },
    { t:'code', h:'Étape 1 : décrire une salle', file:'aventure.py',
      p:`<p>Sous les données, écris la fonction <code>decrire(salles, position)</code> qui affiche :</p><pre class="snippet">Un long couloir éclairé par des torches.
Sorties : sud, est, nord
Objets : clé</pre><p>La ligne <code>Objets</code> ne s'affiche que s'il y a des objets dans la salle. Termine par un appel de test : <code>decrire(salles, "couloir")</code>.</p>`,
      code:MONDE + `

# Étape 1 : écris la fonction decrire ici
`,
      hints:['<code>salle = salles[position]</code>, puis <code>print(salle["description"])</code>. Pour les sorties : <code>", ".join(salle["sorties"])</code> colle les directions (les clés du dictionnaire).','<code>if salle["objets"]:</code> (une liste vide compte comme faux), puis <code>print("Objets : " + ", ".join(salle["objets"]))</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'decrire')) return noFn('decrire');
        for (const [p, want, no] of [['couloir', ['Un long couloir éclairé par des torches.', 'Sorties : sud, est, nord', 'Objets : clé'], false], ['entree', ['Tu es dans l\'entrée de la crypte. Il fait froid.', 'Sorties : nord'], true], ['armurerie', ['De vieilles armes rouillées pendent aux murs.', 'Sorties : ouest', 'Objets : épée, potion'], false]]) {
          const x = await said(test, code, `decrire(salles, "${p}")`);
          if (x.err) return callErr(`decrire(salles, "${p}")`, x.err);
          const ls = linesOf(x.out).map(l => l.replace(/\s+/g, ' '));
          if (ls.join('|') !== want.join('|')) return `<code>decrire(salles, "${p}")</code> devrait afficher :<br><code>${want.map(esc).join('<br>')}</code><br>J’obtiens :<br><code>${ls.map(esc).join('<br>') || '(rien)'}</code>${no && ls.some(l => /objets/i.test(l)) ? '<br>L’entrée n’a pas d’objet : n’affiche pas la ligne Objets.' : ''}`;
        }
        return true;
      },
      ok:'La première brique du jeu. Elle marche pour toutes les salles, même celles que tu inventeras.',
      sol:A1 },
    { t:'code', carry:1, h:'Étape 2 : la boucle du jeu', file:'aventure.py',
      p:`<p>Enlève l'appel de test <code>decrire(salles, "couloir")</code>. À la place, écris la boucle principale :</p><ul><li>le joueur commence à <code>position = "entree"</code> ; affiche d'abord le titre <code>=== La Crypte du Serpent ===</code> ;</li><li>à chaque tour : décris la salle, puis lis la commande avec <code>input("&gt; ")</code>, nettoyée et en minuscules ;</li><li><code>quitter</code> : affiche <code>À bientôt !</code> et arrête ;</li><li>une direction qui existe : le joueur change de salle ;</li><li>sinon : <code>Tu ne peux pas aller par là.</code></li></ul>`,
      code:`# Étape 2 : la boucle du jeu
`,
      hints:['La structure : <code>while True:</code>, puis <code>decrire(salles, position)</code> et <code>commande = input("&gt; ").strip().lower()</code>.','Puis <code>if commande == "quitter":</code> … <code>break</code>, <code>elif commande in salles[position]["sorties"]:</code> → <code>position = salles[position]["sorties"][commande]</code>, <code>else:</code> → le message.'],
      check:async (r, code, test) => {
        if (nInputs(code) < 1) return 'Lis la commande du joueur avec <code>input("&gt; ")</code>.';
        return partie(test, ['sud', 'nord', 'est', 'ouest', 'NORD ', 'quitter'], ['Crypte du Serpent', D_ENT, 'ne peux pas', D_ENT, D_COU, D_ARM, D_COU, D_TRE, 'bientôt'],
          o => (o.match(/Crypte du Serpent/g) || []).length !== 1 ? 'Le titre doit s’afficher une seule fois, avant la boucle.' : norm(o).indexOf(norm(D_COU)) < norm(o).indexOf('crypte du serpent') ? 'Enlève l’appel de test <code>decrire(salles, "couloir")</code> : la partie doit commencer par le titre.' : true);
      },
      ok:'Le jeu tourne ! Tu peux déjà explorer toute la crypte. Essaie de taper des directions, même mal écrites.',
      sol:A2, solIn:['nord', 'est', 'ouest', 'quitter'] },
    { t:'code', carry:1, h:'Étape 3 : ramasser des objets', file:'aventure.py',
      p:`<p>Crée une liste <code>inventaire = []</code> avant la boucle. Puis ajoute deux commandes dans ta chaîne de <code>elif</code> :</p><ul><li><code>prendre clé</code> : si l'objet est dans la salle, enlève-le de la salle, ajoute-le à l'inventaire et affiche <code>Tu prends : clé</code>. Sinon : <code>Il n'y a pas de clé ici.</code></li><li><code>inventaire</code> : affiche <code>Inventaire : clé, épée</code>, ou <code>Inventaire : vide</code>.</li></ul>`,
      code:`# Étape 3 : ajoute inventaire = [] avant la boucle, et deux elif dans la boucle
`,
      hints:['Pour reconnaître la commande : <code>elif commande.startswith("prendre "):</code>. Le nom de l’objet, c’est ce qui suit : <code>objet = commande[8:]</code> (« prendre » + l’espace font 8 caractères).','<code>if objet in salles[position]["objets"]:</code> → <code>salles[position]["objets"].remove(objet)</code>, <code>inventaire.append(objet)</code> et le message.'],
      check:async (r, code, test) => {
        return partie(test, ['nord', 'inventaire', 'prendre clé', 'prendre clé', 'prendre dragon', 'inventaire', 'est', 'prendre épée', 'inventaire', 'quitter'],
          ['Inventaire : vide', 'Tu prends : clé', "pas de clé ici", "pas de dragon ici", 'Inventaire : clé', D_ARM, 'Tu prends : épée', 'Inventaire : clé, épée', 'bientôt'],
          o => { const k = o.indexOf('Tu prends : clé'); const seg = o.slice(k, o.indexOf('pas de clé', k)); return /Objets\s*:\s*cl/.test(seg) ? 'Après avoir pris la clé, elle ne doit plus apparaître dans les objets du couloir : enlève-la de la salle avec <code>remove</code>.' : true; });
      },
      ok:'Les objets passent de la salle à ton sac. Remarque : la clé disparaît du couloir, parce que la liste de la salle a été modifiée.',
      sol:A3, solIn:['nord', 'prendre clé', 'inventaire', 'quitter'] },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Ta fonction <code>decrire</code> utilise <code>join</code> sur un dictionnaire. Qu'affiche ce code ?</p>`, snip:`sorties = {"sud": "entree", "est": "armurerie"}
print(", ".join(sorties))`,
      opts:[ {l:'entree, armurerie', why:'Parcourir un dictionnaire donne ses <strong>clés</strong>, pas ses valeurs.'},
             {l:'sud, est', ok:1},
             {l:"sud: entree, est: armurerie", why:'<code>join</code> ne colle que les clés, sans les valeurs.'},
             {l:'Une erreur', why:'<code>join</code> accepte tout ce qu’on peut parcourir et qui donne du texte : ici, les clés.'} ],
      ex:'Un dictionnaire se parcourt par ses clés. C’est pour ça que <code>", ".join(salle["sorties"])</code> affiche les directions. Pour les valeurs, on écrirait <code>sorties.values()</code>.' },
    { t:'code', carry:1, h:'Étape 4 : la porte verrouillée', file:'aventure.py',
      p:`<p>Le trésor doit se mériter. Quand le joueur veut entrer dans la salle <code>"tresor"</code> :</p><ul><li>s'il n'a pas la <code>"clé"</code> dans son inventaire, il reste où il est, et on affiche <code>La porte est verrouillée. Il te faut une clé.</code> ;</li><li>s'il l'a, il entre : décris la salle, affiche <code>Tu as trouvé le trésor. Victoire !</code> et termine la partie.</li></ul>`,
      code:`# Étape 4 : modifie la partie « direction » de ta boucle
`,
      hints:['Dans le <code>elif</code> des directions, calcule d’abord <code>destination = salles[position]["sorties"][commande]</code>, sans encore bouger.','<code>if destination == "tresor" and "clé" not in inventaire:</code> → le message. <code>else:</code> → <code>position = destination</code>, puis <code>if position == "tresor":</code> → décrire, victoire, <code>break</code>.'],
      check:async (r, code, test) => {
        let v = await partie(test, ['nord', 'nord', 'quitter'], [D_COU, 'verrouillée', D_COU, 'bientôt'], o => /victoire/i.test(o) ? 'Sans la clé, le joueur ne doit pas pouvoir gagner.' : true);
        if (v !== true) return v;
        v = await partie(test, ['nord', 'prendre clé', 'nord', 'quitter'], ['Tu prends : clé', D_TRE, 'Victoire'], o => /bient[ôo]t/i.test(o) ? 'Après la victoire, la partie doit s’arrêter tout de suite : utilise <code>break</code>.' : /verrouill/i.test(o) ? 'Avec la clé, la porte ne doit plus être verrouillée.' : true);
        if (v !== true) return v;
        return partie(test, ['est', 'nord', 'est', 'ouest', 'sud', 'quitter'], ['ne peux pas', D_COU, D_ARM, D_COU, D_ENT, 'bientôt']);
      },
      ok:'Ton jeu a un but, un obstacle et une fin. C’est la recette de base de tous les jeux d’aventure.',
      sol:A4, solIn:['nord', 'prendre clé', 'nord'] },
    { t:'code', carry:1, defi:1, h:'Étape 5 : le dragon', file:'aventure.py',
      p:`<p>Dernière étape, la plus libre. Ajoute une nouvelle salle <code>"antre"</code>, au nord de l'armurerie, sans réécrire les données : modifie le dictionnaire <code>salles</code> avant la boucle.</p><ul><li>L'antre a une description (ton texte), une sortie <code>"sud"</code> vers l'armurerie, et aucun objet. L'armurerie gagne une sortie <code>"nord"</code> vers l'antre.</li><li>Un dragon y dort. Si le joueur entre <strong>avec l'épée</strong>, affiche <code>Tu terrasses le dragon !</code> et le dragon disparaît pour de bon (il ne revient pas si on repasse).</li><li>S'il entre <strong>sans l'épée</strong> : <code>Le dragon te dévore. Game over.</code> et la partie s'arrête.</li></ul>`,
      code:`# Étape 5 : ajoute l'antre et le dragon
`,
      hints:['Avant la boucle : <code>salles["antre"] = {"description": "...", "sorties": {"sud": "armurerie"}, "objets": []}</code>, puis <code>salles["armurerie"]["sorties"]["nord"] = "antre"</code>, et un drapeau <code>dragon_vivant = True</code>.','Juste après <code>position = destination</code> : <code>if position == "antre" and dragon_vivant:</code>, puis <code>if "épée" in inventaire:</code> → message et <code>dragon_vivant = False</code>, <code>else:</code> → game over et <code>break</code>.'],
      check:async (r, code, test) => {
        if ((strip(code).match(/"antre"\s*:/g) || []).length) return 'Ne réécris pas les données : ajoute la salle avec <code>salles["antre"] = {...}</code>, avant la boucle.';
        let v = await partie(test, ['nord', 'est', 'nord', 'quitter'], [D_ARM, 'Sorties : ouest, nord', 'dévore'], o => /bient[ôo]t/i.test(o) ? 'Sans l’épée, le dragon gagne : la partie doit s’arrêter tout de suite.' : /terrasses/i.test(o) ? 'Sans l’épée, impossible de terrasser le dragon.' : true);
        if (v !== true) return v;
        v = await partie(test, ['nord', 'est', 'prendre épée', 'nord', 'sud', 'nord', 'sud', 'ouest', 'prendre clé', 'nord', 'quitter'], ['Tu prends : épée', 'terrasses le dragon', D_ARM, 'Tu prends : clé', 'Victoire'],
          o => (o.match(/terrasses/gi) || []).length !== 1 ? 'Le dragon ne doit être vaincu qu’une fois : quand on repasse dans l’antre, il n’est plus là. Utilise un drapeau <code>dragon_vivant</code>.' : /d[ée]vore/i.test(o) ? 'Avec l’épée, le héros ne doit pas se faire dévorer.' : true);
        if (v !== true) return v;
        return partie(test, ['nord', 'nord', 'quitter'], ['verrouillée', 'bientôt']);
      },
      ok:'Ton jeu est complet : exploration, objets, porte verrouillée, dragon et victoire. Tu as écrit un vrai jeu de A à Z, avec tout ce que tu as appris depuis le premier <code>print</code>.',
      sol:A5, solIn:['nord', 'est', 'prendre épée', 'nord', 'quitter'] },
    { t:'code', bug:1, h:'Répare le bug : la direction inconnue', file:'bug.py',
      p:`<p>Dans cette version simplifiée, le joueur tape <code>ouest</code>, une direction qui n'existe pas dans l'entrée, et tout le jeu plante. Répare-le pour qu'il affiche <code>Tu ne peux pas aller par là.</code> au lieu de planter, puis continue normalement.</p>`,
      code:`salles = {"entree": {"sorties": {"nord": "couloir"}}, "couloir": {"sorties": {"sud": "entree"}}}
position = "entree"
for commande in ["ouest", "nord", "sud"]:
    position = salles[position]["sorties"][commande]
    print("Tu es dans :", position)`,
      hints:['Le message parle d’une clé qui n’existe pas : "ouest" n’est pas dans les sorties de l’entrée.','Teste d’abord : <code>if commande in salles[position]["sorties"]:</code> → déplacer et afficher, <code>else:</code> → <code>print("Tu ne peux pas aller par là.")</code>.'],
      check:(r, code) => {
        if (same(code, bugOf('7-2'))) return BUG;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        const miss = inOrder(r.out, ['ne peux pas', 'Tu es dans : couloir', 'Tu es dans : entree']);
        return miss ? `Il faut afficher, dans l’ordre : <code>Tu ne peux pas aller par là.</code>, puis <code>Tu es dans : couloir</code>, puis <code>Tu es dans : entree</code>. Il manque « ${esc(miss)} ».` : true;
      },
      ok:'Un joueur tape toujours n’importe quoi. Tester avec <code>in</code> avant d’utiliser une clé, c’est ce qui rend ton jeu solide.',
      sol:`salles = {"entree": {"sorties": {"nord": "couloir"}}, "couloir": {"sorties": {"sud": "entree"}}}
position = "entree"
for commande in ["ouest", "nord", "sud"]:
    if commande in salles[position]["sorties"]:
        position = salles[position]["sorties"][commande]
        print("Tu es dans :", position)
    else:
        print("Tu ne peux pas aller par là.")` },
    { t:'say', h:'Joue, et invente ton monde',
      p:`<p>Copie ton jeu dans VS Code, dans un fichier <code>aventure.py</code>, et joue dans le terminal. C'est ton jeu : modifie-le !</p><ul><li>Invente tes propres salles, tes objets et ton histoire.</li><li>Ajoute une commande <code>aide</code> qui liste les commandes.</li><li>Ajoute une commande <code>boire potion</code> et des points de vie qui baissent à chaque salle.</li><li>Range le code en fonctions : <code>deplacer</code>, <code>prendre</code>, <code>main</code>…</li></ul><p>Dans la dernière leçon, on voit comment rendre ton code propre et le partager.</p>` }
  ],
  recap:['Un jeu d’aventure = des données (un dictionnaire de salles) + une boucle qui lit des commandes.','<code>commande.startswith("prendre ")</code> et <code>commande[8:]</code> pour découper une commande.','Calculer la destination avant de bouger permet de bloquer un passage (porte verrouillée).','Un drapeau (<code>dragon_vivant</code>) garde en mémoire ce qui a changé dans le monde.','On peut agrandir les données sans les réécrire : <code>salles["antre"] = {...}</code>.'] };

LES['7-3'] = { title:'Améliorer et partager son projet', dur:'15 min',
  intro:'Ton jeu marche. Maintenant, on le rend propre, pour que d’autres puissent le lire, et toi aussi dans six mois. Puis on le partage.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`commande = "prendre épée"
print(commande[8:])`,
      opts:[ {l:'prendre', why:'<code>[8:]</code> prend tout <strong>à partir</strong> de l’indice 8, donc ce qui suit « prendre ».'},
             {l:'épée', ok:1},
             {l:' épée', why:'« prendre » fait 7 lettres, plus l’espace : l’indice 8 est le « é ».'},
             {l:'Une IndexError', why:'Le découpage ne plante jamais, même si les indices dépassent.'} ],
      ex:'« prendre » a 7 lettres (indices 0 à 6), l’espace est en 7, donc <code>[8:]</code> commence au « é » d’épée.' },
    { t:'say', h:'Du code qui se lit',
      p:`<p>Un programme est lu bien plus souvent qu'il n'est écrit. Les règles que suivent les pros Python :</p><ul><li><strong>Des noms qui disent tout</strong> : <code>pv_heros</code> plutôt que <code>p</code>, <code>calculer_degats</code> plutôt que <code>f</code>. Une fonction commence par un verbe.</li><li><strong>Des fonctions courtes</strong> : si elle ne tient pas sur l'écran, découpe-la.</li><li><strong>Des constantes en MAJUSCULES</strong> pour les nombres importants : <code>PV_MAX = 100</code>. Plus de « nombres magiques » perdus dans le code.</li><li><strong>Des commentaires qui expliquent le pourquoi</strong>, pas le quoi : le code dit déjà ce qu'il fait.</li></ul><p>Ces règles viennent d'un guide officiel, le <strong>PEP 8</strong>. VS Code peut même les vérifier pour toi.</p>` },
    { t:'quiz', h:'Le meilleur nom', p:`<p>Quelle fonction a le meilleur nom ?</p>`,
      opts:[ {l:'def f(a, b):', why:'Impossible de deviner ce que fait <code>f</code>, ni ce que sont a et b.'},
             {l:'def Calcul(x, y):', why:'Une majuscule au début est réservée aux classes (tu le verras en POO). Et « calcul » de quoi ?'},
             {l:'def calculer_degats(force, bonus_arme):', ok:1},
             {l:'def calculerdegatsdelattaqueduheros(f, b):', why:'Trop long et illisible sans les <code>_</code>. Et les paramètres f et b ne disent rien.'} ],
      ex:'Un verbe, des minuscules avec des <code>_</code>, des paramètres clairs. On sait ce que fait la fonction sans lire son code.' },
    { t:'say', h:'Constantes et docstrings', file:'propre.py',
      p:`<p>Une <strong>docstring</strong> est un texte entre trois guillemets juste sous le <code>def</code>. Elle explique ce que fait la fonction. VS Code l'affiche quand tu survoles le nom de la fonction, et <code>help(soigner)</code> l'affiche dans la console.</p><p>Et les constantes en haut du fichier : si un jour les héros ont 150 pv, tu ne changes qu'une ligne.</p>`,
      code:`PV_MAX = 100
PRIX_POTION = 5

def soigner(pv, soin):
    """Renvoie les pv après le soin, sans dépasser PV_MAX."""
    return min(pv + soin, PV_MAX)

def acheter_potions(or_, nombre):
    """Renvoie l'or restant après l'achat de potions."""
    return or_ - nombre * PRIX_POTION

print(soigner(80, 50))
print(acheter_potions(30, 4))` },
    { t:'code', h:'À toi : nettoie ce code', file:'nettoyage.py',
      p:`<p>Ce code marche, mais il est illisible. Nettoie-le sans changer ce qu'il affiche :</p><ul><li>crée une constante <code>PV_MAX</code> qui vaut 100, et utilise-la à la place du nombre 100 ;</li><li>renomme la fonction <code>f</code> en <code>soigner</code>, et ses paramètres <code>a</code> et <code>b</code> en <code>pv</code> et <code>soin</code> ;</li><li>ajoute une docstring à la fonction.</li></ul>`,
      code:`def f(a, b):
    a = a + b
    if a > 100:
        a = 100
    return a

print(f(50, 30))
print(f(90, 30))`,
      hints:['En haut : <code>PV_MAX = 100</code>. Puis remplace chaque <code>100</code> de la fonction par <code>PV_MAX</code>.','<code>def soigner(pv, soin):</code>, la docstring juste en dessous : <code>"""Soigne sans dépasser PV_MAX."""</code>, et pense à renommer aussi les appels.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (linesOf(r.out).join() !== '80,100') return 'L’affichage doit rester le même : 80 puis 100.';
        if (!/^PV_MAX\s*=\s*100\s*$/m.test(code)) return 'Crée la constante <code>PV_MAX = 100</code>, collée à gauche, en haut du fichier.';
        if ((strip(code).match(/\b100\b/g) || []).length > 1) return 'Le nombre 100 ne doit apparaître qu’une fois : dans <code>PV_MAX = 100</code>. Ailleurs, utilise la constante.';
        if (!/^def\s+soigner\s*\(\s*pv\s*,\s*soin\s*\)\s*:/m.test(code)) return 'La fonction doit s’écrire <code>def soigner(pv, soin):</code>.';
        if (/\bf\s*\(/.test(strip(code))) return 'Il reste un appel à <code>f(…)</code> : renomme aussi les appels.';
        if (!/def\s+soigner[^\n]*\n\s+("""|''')/.test(code)) return 'Ajoute une docstring juste sous le <code>def</code> : un texte entre trois guillemets <code>"""…"""</code>.';
        const x = await call(test, code.replace(/^PV_MAX\s*=\s*100/m, 'PV_MAX = 150'), 'soigner(140, 30)');
        if (x.err || x.val !== '150') return 'La fonction doit utiliser <code>PV_MAX</code> : avec PV_MAX = 150, <code>soigner(140, 30)</code> devrait donner 150.';
        return true;
      },
      ok:'Même résultat, mais le code se lit maintenant comme une phrase. Et j’ai vérifié : en changeant <code>PV_MAX</code> à 150, la fonction suit toute seule.',
      sol:`PV_MAX = 100

def soigner(pv, soin):
    """Renvoie les pv après le soin, sans dépasser PV_MAX."""
    pv = pv + soin
    if pv > PV_MAX:
        pv = PV_MAX
    return pv

print(soigner(50, 30))
print(soigner(90, 30))` },
    { t:'code', bug:1, h:'Répare le bug : le programme muet', file:'bug.py',
      p:`<p>Ce programme ne plante pas, mais il n'affiche rien du tout. Exécute-le, trouve l'erreur de frappe, puis répare-le.</p>`,
      code:`def main():
    print("=== La Crypte du Serpent ===")
    print("Bonne aventure !")

if __name__ == "main":
    main()`,
      hints:['La condition du <code>if</code> est fausse, donc <code>main()</code> n’est jamais appelée. Que vaut vraiment <code>__name__</code> quand on lance le fichier ?','Il faut <code>"__main__"</code>, avec deux tirets bas de chaque côté.'],
      check:(r, code) => same(code, bugOf('7-3')) ? BUG : r.err ? ERR : !/Crypte du Serpent/.test(r.out) ? 'Le programme doit afficher le titre et le message.' : !/__name__\s*==\s*["']__main__["']/.test(code) ? 'Garde le bloc <code>if __name__ == ...</code> et corrige la valeur comparée.' : true,
      ok:'Un bug silencieux de plus dans ta collection. Quand « rien ne se passe », vérifie d’abord que ta fonction est bien appelée.',
      sol:`def main():
    print("=== La Crypte du Serpent ===")
    print("Bonne aventure !")

if __name__ == "__main__":
    main()` },
    { t:'say', h:'Partager ton projet',
      p:`<p>Un projet qui dort sur ton ordinateur, personne ne le voit. Le standard pour partager du code, c'est <strong>GitHub</strong> :</p><ol><li>Crée un compte gratuit sur <strong>github.com</strong>.</li><li>Clique sur <strong>New repository</strong> (nouveau dépôt), donne un nom comme <code>crypte-du-serpent</code>, et coche <strong>Add a README file</strong>.</li><li>Dans ton dépôt : <strong>Add file → Upload files</strong>, glisse ton fichier <code>aventure.py</code>, puis <strong>Commit changes</strong>.</li><li>Modifie le <strong>README.md</strong> : c'est la page d'accueil de ton projet.</li></ol>`,
      snip:`# La Crypte du Serpent

Un petit jeu d'aventure en mode texte, écrit en Python.

## Lancer le jeu
    python aventure.py

## Commandes
- nord, sud, est, ouest : se déplacer
- prendre <objet> : ramasser un objet
- inventaire : voir son sac
- quitter : arrêter la partie`,
      p2:`<p>Plus tard, tu apprendras à utiliser <code>git</code> directement depuis VS Code. Pour l'instant, l'envoi par le site suffit. Envoie le lien à un ami et demande-lui de jouer : ses retours vaudront de l'or.</p>` },
    { t:'quiz', h:'Le README', p:`<p>Qu'est-ce qui est le plus utile dans le README d'un petit jeu ?</p>`,
      opts:[ {l:'Le code complet du jeu, copié dedans', why:'Le code est déjà dans le dépôt. Le README explique, il ne recopie pas.'},
             {l:'Ce que fait le jeu, comment le lancer et comment y jouer', ok:1},
             {l:'L’histoire de ta vie de développeur', why:'Le lecteur veut savoir rapidement ce qu’est le projet et comment s’en servir.'},
             {l:'Rien, un bon code n’a pas besoin d’explication', why:'Même un code parfait ne dit pas quelle commande lancer ni comment jouer.'} ],
      ex:'Un bon README répond en 30 secondes à trois questions : c’est quoi, comment je le lance, comment je m’en sers.' },
    { t:'code', defi:1, h:'Sauvegarder la partie', file:'sauvegarde.py',
      p:`<p>Dernier défi des bases : préparer la sauvegarde de ton jeu. Crée deux fonctions :</p><ul><li><code>sauvegarder(position, inventaire)</code> renvoie un texte comme <code>"couloir;clé,épée"</code> (la position, un point-virgule, puis les objets séparés par des virgules) ;</li><li><code>charger(texte)</code> fait l'inverse et renvoie le tuple <code>(position, inventaire)</code>.</li></ul><p>Attention au cas de l'inventaire vide : <code>"entree;"</code> doit redonner une liste vide.</p>`,
      code:``,
      hints:['<code>sauvegarder</code> : <code>return position + ";" + ",".join(inventaire)</code>.','<code>charger</code> : <code>position, objets = texte.split(";")</code>. Puis si <code>objets</code> est vide, l’inventaire est <code>[]</code>, sinon <code>objets.split(",")</code>. Et <code>return position, inventaire</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'sauvegarder')) return noFn('sauvegarder');
        if (!defined(code, 'charger')) return noFn('charger');
        let x = await call(test, code, 'sauvegarder("couloir", ["clé", "épée"])');
        if (x.err) return callErr('sauvegarder("couloir", ["clé", "épée"])', x.err);
        if (x.val !== "'couloir;clé,épée'") return `<code>sauvegarder("couloir", ["clé", "épée"])</code> devrait renvoyer <code>'couloir;clé,épée'</code>, et renvoie <code>${esc(x.val)}</code>.`;
        x = await call(test, code, 'charger("armurerie;potion")');
        if (x.err) return callErr('charger("armurerie;potion")', x.err);
        if (x.val !== "('armurerie', ['potion'])") return `<code>charger("armurerie;potion")</code> devrait renvoyer <code>('armurerie', ['potion'])</code>, et renvoie <code>${esc(x.val)}</code>.`;
        x = await call(test, code, 'charger("entree;")');
        if (x.err) return callErr('charger("entree;")', x.err);
        if (x.val !== "('entree', [])") return `<code>charger("entree;")</code> devrait renvoyer <code>('entree', [])</code>, avec une liste vide, et renvoie <code>${esc(x.val)}</code>.${x.val === "('entree', [''])" ? ' <code>"".split(",")</code> donne <code>[\'\']</code>, une liste avec un texte vide : traite ce cas à part.' : ''}`;
        x = await call(test, code, 'charger(sauvegarder("tresor", ["couronne", "clé", "potion"]))');
        if (x.err || x.val !== "('tresor', ['couronne', 'clé', 'potion'])") return 'L’aller-retour <code>charger(sauvegarder(...))</code> doit redonner exactement la position et l’inventaire de départ.';
        return true;
      },
      ok:'Avec <code>open</code> et ces deux fonctions, ton jeu peut garder une partie en cours. Le piège de <code>"".split(",")</code> était sournois : tu l’as évité.',
      sol:`def sauvegarder(position, inventaire):
    return position + ";" + ",".join(inventaire)

def charger(texte):
    position, objets = texte.split(";")
    if objets:
        inventaire = objets.split(",")
    else:
        inventaire = []
    return position, inventaire

print(charger(sauvegarder("couloir", ["clé", "épée"])))` },
    { t:'say', h:'Bravo : tu connais les bases de Python !',
      p:`<p>Regarde le chemin parcouru : du premier <code>print("Salut !")</code> à un jeu d'aventure complet, avec des données structurées, des fonctions, des tests, la gestion des erreurs et une sauvegarde. Tu ne fais plus que lire du code : tu sais en écrire, le comprendre et le réparer.</p><p>La suite, c'est la <strong>programmation orientée objet</strong>. Tu as déjà vu son idée sans le savoir : un héros rangé dans un dictionnaire, avec ses pv et sa force. En POO, ce héros devient un <strong>objet</strong>, avec ses propres données <em>et</em> ses propres actions. On y va ?</p>` }
  ],
  recap:['Des noms clairs : des verbes pour les fonctions, des minuscules avec des <code>_</code>.','Des constantes en MAJUSCULES en haut du fichier, au lieu des « nombres magiques ».','Une docstring <code>"""…"""</code> sous chaque <code>def</code> explique ce que fait la fonction.','Partager : un dépôt GitHub et un README qui dit quoi, comment lancer, comment jouer.','<code>"".split(",")</code> donne <code>[\'\']</code>, pas une liste vide : attention aux cas vides.'] };

Atelier.chapter({ part:"bases", n:7, title:"Projet final des bases",
  lessons:['7-1','7-2','7-3'].map(id => ({ id, ...LES[id] })) });
})();
