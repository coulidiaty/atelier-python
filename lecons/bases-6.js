/* Partie 1 · Chapitre 6 : Coder comme un pro */
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has } = Atelier.h;
const LES = {};

/* Petites aides pour les corrections de ce chapitre */
const BUG = 'Voilà le bug ! Exécute, lis ce qui se passe, puis corrige le code.';
const same = (code, start) => code.trim() === start.trim();
const bugOf = id => LES[id].steps.find(s => s.bug).code;
// Exécute le code de l'élève, puis calcule expr avec ses fonctions.
// Renvoie { err, val, out } : val est la valeur écrite comme en Python (repr).
async function call(test, code, expr, ins = []){
  const t = await test(ins, code + '\n\nprint("@@" + repr(' + expr + '))');
  if (t.err) return { err:t.err, out:t.out };
  const k = t.out.lastIndexOf('@@');
  return { val:k >= 0 ? t.out.slice(k + 2).trim() : null, out:t.out.slice(0, Math.max(k, 0)) };
}
const defined = (code, name) => new RegExp('^\\s*def\\s+' + name + '\\s*\\(', 'm').test(strip(code));
const noFn = name => `Je ne trouve pas la fonction <code>${name}</code>. Elle commence par <code>def ${name}(</code>.`;
const callErr = (expr, e) => `Quand j’exécute <code>${esc(expr)}</code>, ça plante : ${esc(e.title)}.`;
const num = v => v === null || v === undefined ? NaN : parseFloat(v);
// Garde seulement les imports et les fonctions : le programme principal ne consomme pas les réponses prévues pour le test.
function onlyDefs(code){
  let keep = false;
  return code.split('\n').filter(l => {
    if (/^(def|import|from)\s/.test(l)) { keep = /^def\s/.test(l); return true; }
    if (/^\S/.test(l)) keep = false;
    return keep || !l.trim();
  }).join('\n');
}
// Remplace le contenu d'un « fichier simulé » : contenu = """...""".
const fichier = (code, txt) => code.replace(/contenu\s*=\s*"""[\s\S]*?"""/, 'contenu = """' + txt + '"""');

LES['6-1'] = { title:'Installer Python et VS Code', dur:'15 min',
  intro:'Jusqu’ici, tu as codé dans cette page. Pour tes vrais projets, il te faut Python sur ton ordinateur et un bon éditeur. On installe tout ensemble, étape par étape, sur Windows.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur le chapitre 5', p:`<p>Qu'affiche ce code ?</p>`, snip:`stock = {"potion": 2}
stock["potion"] += 1
stock["arc"] = stock.get("arc", 0) + 1
print(stock)`,
      opts:[ {l:"{'potion': 3, 'arc': 1}", ok:1},
             {l:"{'potion': 2, 'arc': 1}", why:'<code>stock["potion"] += 1</code> fait passer la potion de 2 à 3.'},
             {l:'Une KeyError', why:'"arc" n’existe pas, mais <code>get("arc", 0)</code> renvoie 0 au lieu de planter.'},
             {l:"{'potion': 3}", why:'La dernière affectation ajoute la clé "arc".'} ],
      ex:'La potion passe à 3, et "arc" est ajouté avec 0 + 1. C’est le schéma pour compter.' },
    { t:'say', h:'Étape 1 : installer Python',
      p:`<p>Le Python de cette page s'appelle Skulpt : une version allégée qui tourne dans le navigateur. Sur ton ordinateur, le vrai Python peut lire et écrire des fichiers, utiliser tous les modules, et il va bien plus vite.</p><ol><li>Va sur <strong>python.org</strong>, menu <strong>Downloads</strong>, et clique sur le gros bouton <strong>Download Python 3.x</strong>.</li><li>Lance le fichier téléchargé.</li><li><strong>Important :</strong> sur le premier écran, tout en bas, coche la case ci-dessous. Puis clique sur <strong>Install Now</strong>.</li></ol>`,
      snip:`☑ Use admin privileges when installing py.exe
☑ Add python.exe to PATH        ← celle-ci, surtout !

  → Install Now`,
      p2:`<p>Sur Mac, l'installateur de python.org n'a pas cette case : il n'y a rien à cocher.</p>` },
    { t:'quiz', h:'Pourquoi cette case ?', p:`<p>À quoi sert la case <strong>Add python.exe to PATH</strong> ?</p>`,
      opts:[ {l:'À installer Python plus vite', why:'Elle ne change rien à la vitesse. Elle dit à Windows où trouver Python.'},
             {l:'À pouvoir taper « python » dans le terminal, depuis n’importe quel dossier', ok:1},
             {l:'À installer VS Code en même temps', why:'Python et VS Code s’installent séparément.'},
             {l:'Sans elle, Python ne marche pas du tout', why:'Python s’installe quand même, mais le terminal ne le trouve pas quand tu tapes <code>python</code>.'} ],
      ex:'Le PATH est la liste des dossiers où Windows cherche les commandes. Sans la case, la commande <code>python</code> est « inconnue » dans le terminal.' },
    { t:'say', h:'Étape 2 : vérifier l’installation',
      p:`<p>Ouvre un terminal : appuie sur la touche <strong>Windows</strong>, tape <strong>terminal</strong> (ou <strong>PowerShell</strong>) et appuie sur Entrée. Une fenêtre noire ou bleue s'ouvre : c'est là qu'on parle à l'ordinateur avec des commandes.</p><p>Tape cette commande, puis Entrée :</p>`,
      snip:`PS C:\\Users\\Sam> python --version
Python 3.13.1`,
      p2:`<p>Si un numéro de version s'affiche, c'est gagné. Si Windows ouvre le Microsoft Store à la place, ou dit que la commande n'est pas reconnue, essaie <code>py --version</code>. Si ça ne marche pas non plus, relance l'installateur et coche bien la case du PATH.</p>` },
    { t:'quiz', h:'Que s’est-il passé ?', p:`<p>Inès tape <code>python --version</code> et lit ce message. Quelle est la cause la plus probable ?</p>`, snip:`python : Le terme «python» n'est pas reconnu comme nom d'applet de commande,
fonction, fichier de script ou programme exécutable.`,
      opts:[ {l:'Elle a fait une faute de frappe dans son code', why:'Elle n’a encore écrit aucun code : c’est le terminal qui ne trouve pas Python.'},
             {l:'Python 3 est trop récent pour Windows', why:'Python 3 marche très bien sous Windows.'},
             {l:'Elle n’a pas coché « Add python.exe to PATH »', ok:1},
             {l:'Il faut d’abord installer VS Code', why:'VS Code n’a rien à voir : c’est un éditeur. Le terminal cherche Python lui-même.'} ],
      ex:'Le terminal ne sait pas où est Python. Solution : relancer l’installateur, choisir <strong>Modify</strong> ou réinstaller, et cocher la case du PATH. Puis fermer et rouvrir le terminal.' },
    { t:'say', h:'Étape 3 : installer VS Code',
      p:`<p>VS Code est l'éditeur de code le plus utilisé au monde. Il est gratuit.</p><ol><li>Va sur <strong>code.visualstudio.com</strong> et télécharge la version Windows.</li><li>Lance l'installateur. Laisse cochées les cases <strong>Ajouter à PATH</strong> et <strong>Ajouter l'action « Ouvrir avec Code »</strong> : tu pourras ouvrir un dossier d'un clic droit.</li><li>Ouvre VS Code, clique sur l'icône des <strong>Extensions</strong> à gauche (les quatre carrés), ou <code>Ctrl + Maj + X</code>.</li><li>Cherche <strong>Python</strong> et installe celle de <strong>Microsoft</strong>. Elle ajoute la couleur du code, les suggestions et le débogueur.</li></ol>`,
      snip:`Extensions conseillées :
  Python                  (Microsoft)    ← indispensable
  French Language Pack    (Microsoft)    ← si tu veux VS Code en français`,
      p2:`<p>VS Code n'est qu'un éditeur : il ne contient pas Python. C'est pour ça qu'on a installé Python d'abord.</p>` },
    { t:'quiz', h:'Qui fait quoi ?', p:`<p>Léo a installé VS Code et l'extension Python, mais pas Python lui-même. Que se passe-t-il quand il lance un fichier <code>.py</code> ?</p>`,
      opts:[ {l:'Ça marche, VS Code contient Python', why:'VS Code est un éditeur de texte très malin, mais il ne sait pas exécuter du Python tout seul.'},
             {l:'VS Code lui dit qu’il ne trouve pas d’interpréteur Python', ok:1},
             {l:'Le code s’exécute dans le navigateur', why:'Ça, c’est cette page, avec Skulpt. VS Code utilise le Python de ton ordinateur.'},
             {l:'L’ordinateur redémarre', why:'Rien d’aussi dramatique : VS Code affiche simplement un message.'} ],
      ex:'L’<strong>interpréteur</strong>, c’est le programme Python qui exécute ton code. VS Code l’utilise, mais ne le remplace pas. Les deux sont nécessaires.' },
    { t:'code', h:'À toi : le script de test', file:'test_installation.py',
      p:`<p>Écris le petit programme que tu lanceras en premier dans VS Code pour tester ton installation. Il demande ton prénom, puis affiche <code>Bravo Sam, Python est bien installé !</code>, et enfin le résultat de <code>2 ** 100</code>, un nombre géant que Python calcule sans broncher.</p>`,
      code:``,
      hints:['<code>prenom = input("Ton prénom ? ")</code>, puis une f-string.','<code>print(f"Bravo {prenom}, Python est bien installé !")</code> et <code>print(2 ** 100)</code>.'],
      check:async (r, code, test) => {
        if (nInputs(code) < 1) return 'Demande d’abord le prénom avec <code>input()</code>.';
        const t = await test(['Inès']);
        if (t.err) return `Quand je réponds Inès, ton code plante : ${esc(t.err.title)}.`;
        if (!/Bravo Inès/i.test(t.out) || !/install/i.test(t.out)) return 'Quand je réponds Inès, je devrais lire <code>Bravo Inès, Python est bien installé !</code>';
        if (!t.out.includes('1267650600228229401496703205376')) return 'Affiche aussi le résultat de <code>2 ** 100</code>.';
        return true;
      },
      ok:'Garde ce fichier : il te dira en deux secondes si Python marche sur n’importe quel ordinateur. 31 chiffres pour 2 puissance 100, et Python ne perd aucun chiffre.',
      sol:`prenom = input("Ton prénom ? ")
print(f"Bravo {prenom}, Python est bien installé !")
print(2 ** 100)`, solIn:['Sam'] },
    { t:'code', defi:1, h:'La bonne version', file:'version.py',
      p:`<p>Certains outils demandent Python 3.10 ou plus récent. Crée une fonction <code>assez_recent(version)</code> qui reçoit le texte affiché par <code>python --version</code>, comme <code>"Python 3.12.4"</code>, et renvoie <code>True</code> si la version est au moins 3.10.</p><p>Attention au piège : en texte, <code>"3.9"</code> est plus grand que <code>"3.12"</code>, car "9" vient après "1". Il faut comparer des nombres.</p>`,
      code:``,
      hints:['<code>version.split()[1]</code> donne "3.12.4", et <code>.split(".")</code> donne ["3", "12", "4"]. Convertis avec <code>int()</code>.','<code>majeur, mineur = int(morceaux[0]), int(morceaux[1])</code>, puis <code>return majeur &gt; 3 or (majeur == 3 and mineur &gt;= 10)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'assez_recent')) return noFn('assez_recent');
        for (const [v, w] of [['Python 3.12.4', 'True'], ['Python 3.9.18', 'False'], ['Python 3.10.0', 'True'], ['Python 2.7.18', 'False'], ['Python 3.13.1', 'True'], ['Python 4.0.0', 'True']]) {
          const x = await call(test, code, `assez_recent("${v}")`);
          if (x.err) return callErr(`assez_recent("${v}")`, x.err);
          if (x.val !== w) return `<code>assez_recent("${v}")</code> devrait renvoyer ${w}, et renvoie ${esc(x.val)}.${v === 'Python 3.9.18' ? ' Compares-tu des textes ? Convertis les numéros avec <code>int()</code>.' : ''}`;
        }
        return true;
      },
      ok:'Six versions testées, dont le piège 3.9 contre 3.12. Comparer des numéros de version en texte est un vrai bug qui a déjà cassé de vrais logiciels.',
      sol:`def assez_recent(version):
    morceaux = version.split()[1].split(".")
    majeur = int(morceaux[0])
    mineur = int(morceaux[1])
    return majeur > 3 or (majeur == 3 and mineur >= 10)

print(assez_recent("Python 3.12.4"))` },
    { t:'code', bug:1, h:'Répare le bug : terminal ou Python ?', file:'bonjour.py',
      p:`<p>Sam a écrit dans son fichier la commande qu'il tape dans le terminal pour le lancer. Résultat : le fichier ne marche plus. Exécute-le, puis répare-le.</p>`,
      code:`print("Bonjour !")
python bonjour.py`,
      hints:['<code>python bonjour.py</code> est une commande pour le <strong>terminal</strong>. Pour Python, ce n’est pas du code valide.','Supprime la deuxième ligne. Le fichier ne contient que du Python.'],
      check:(r, code) => same(code, bugOf('6-1')) ? BUG : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : /^\s*python\s/m.test(code) ? 'Il reste une commande du terminal dans le fichier.' : !/Bonjour/.test(r.out) ? 'Il faut toujours afficher <code>Bonjour !</code>.' : true,
      ok:'Le fichier contient du Python, le terminal reçoit des commandes. Mélanger les deux est l’erreur numéro 1 des premiers jours.',
      sol:`print("Bonjour !")` }
  ],
  recap:['Python (l’interpréteur) s’installe depuis python.org. Coche <strong>Add python.exe to PATH</strong>.','Vérifie dans le terminal : <code>python --version</code> (ou <code>py --version</code>).','VS Code est un éditeur. Ajoute-lui l’extension <strong>Python</strong> de Microsoft.','Commande « non reconnue » ? Le PATH n’est pas réglé : réinstalle en cochant la case, puis rouvre le terminal.','Les commandes du terminal ne vont pas dans un fichier <code>.py</code>.'] };

LES['6-2'] = { title:'Ton premier projet dans VS Code', dur:'14 min',
  intro:'Python et VS Code sont installés. Maintenant, on s’organise comme un pro : un dossier par projet, des fichiers bien rangés, et le terminal pour tout lancer.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Que faut-il installer pour exécuter un fichier <code>.py</code> dans VS Code ?</p>`,
      opts:[ {l:'Seulement VS Code', why:'VS Code est un éditeur : il a besoin de Python pour exécuter le code.'},
             {l:'Seulement Python', why:'Python suffit pour exécuter, mais sans éditeur, écrire du code est pénible. Et la question parle de VS Code.'},
             {l:'Python, VS Code et l’extension Python', ok:1},
             {l:'Skulpt', why:'Skulpt est le Python de cette page web. Sur ton ordinateur, on utilise le vrai Python.'} ],
      ex:'Python exécute, VS Code édite, et l’extension fait le lien entre les deux.' },
    { t:'say', h:'Un dossier par projet',
      p:`<ol><li>Crée un dossier <code>atelier</code> dans tes Documents.</li><li>Dans VS Code : <strong>Fichier → Ouvrir le dossier</strong>, et choisis-le. Si VS Code demande si tu fais confiance aux auteurs, réponds oui : c'est toi.</li><li>Dans l'explorateur à gauche, clique sur l'icône <strong>Nouveau fichier</strong> et nomme-le <code>bonjour.py</code>. Le <code>.py</code> est indispensable.</li><li>Écris ton code, enregistre avec <code>Ctrl + S</code>, puis clique sur le triangle <strong>▶</strong> en haut à droite.</li></ol>`,
      snip:`atelier/
├── bonjour.py
├── fiche.py
└── mystere.py`,
      p2:`<p>Astuce : active <strong>Fichier → Enregistrement automatique</strong>. Un fichier pas enregistré, c'est un fichier dont Python exécute l'ancienne version.</p>` },
    { t:'say', h:'Le terminal, ton nouveau meilleur ami',
      p:`<p>Quand tu cliques sur ▶, VS Code ouvre un terminal en bas et y tape une commande pour toi. Tu peux l'ouvrir toi-même avec <strong>Terminal → Nouveau terminal</strong> (<code>Ctrl + ù</code> sur un clavier français). Les commandes à connaître :</p>`,
      snip:`python bonjour.py     lance le fichier bonjour.py
cd atelier            entre dans le dossier atelier
cd ..                 remonte d'un dossier
ls                    liste les fichiers du dossier (ou dir)
↑                     rappelle la commande précédente
Ctrl + C              arrête un programme qui tourne (boucle infinie !)
cls                   efface l'écran (clear sur Mac)`,
      p2:`<p>Le début de la ligne, comme <code>PS C:\\Users\\Sam\\atelier&gt;</code>, te dit dans quel dossier tu es. C'est très important pour la suite.</p>` },
    { t:'quiz', h:'Fichier introuvable', p:`<p>Sam tape cette commande. Pourquoi ça ne marche pas ?</p>`, snip:`PS C:\\Users\\Sam> python bonjour.py
python: can't open file 'C:\\Users\\Sam\\bonjour.py': [Errno 2] No such file or directory`,
      opts:[ {l:'Son code contient une erreur', why:'Python n’a même pas ouvert le fichier : il ne l’a pas trouvé.'},
             {l:'Il n’est pas dans le bon dossier', ok:1},
             {l:'Python n’est pas installé', why:'Le message vient de Python lui-même : il est donc bien installé.'},
             {l:'Il faut écrire bonjour sans .py', why:'Le <code>.py</code> fait partie du nom du fichier : il faut le garder.'} ],
      ex:'Le terminal est dans <code>C:\\Users\\Sam</code>, mais le fichier est dans <code>atelier</code>. Il faut d’abord <code>cd Documents\\atelier</code>. Ouvrir le dossier dans VS Code règle ce problème automatiquement.' },
    { t:'say', h:'Les trois chevrons >>>',
      p:`<p>Si tu tapes juste <code>python</code> dans le terminal, tu entres dans la <strong>console interactive</strong> de Python. On la reconnaît à ses trois chevrons <code>&gt;&gt;&gt;</code>. Chaque ligne est exécutée tout de suite : parfait pour tester une petite chose.</p>`,
      snip:`PS C:\\Users\\Sam\\atelier> python
>>> 2 ** 10
1024
>>> "python".upper()
'PYTHON'
>>> exit()
PS C:\\Users\\Sam\\atelier>`,
      p2:`<p>Pour en sortir, tape <code>exit()</code>. Tant que tu vois <code>&gt;&gt;&gt;</code>, tu parles à Python, plus au terminal.</p>` },
    { t:'quiz', h:'Où suis-je ?', p:`<p>Inès voit ceci. Que doit-elle faire pour lancer son fichier ?</p>`, snip:`>>> python bonjour.py
  File "<stdin>", line 1
    python bonjour.py
           ^^^^^^^
SyntaxError: invalid syntax`,
      opts:[ {l:'Corriger bonjour.py', why:'Le fichier n’a pas été ouvert : c’est la commande qui a été donnée à Python au lieu du terminal.'},
             {l:'Taper exit(), puis relancer python bonjour.py', ok:1},
             {l:'Réinstaller Python', why:'Python marche très bien : c’est lui qui répond.'},
             {l:'Ajouter des guillemets autour de bonjour.py', why:'Ça ne servirait à rien : ce n’est pas une instruction Python.'} ],
      ex:'Les <code>&gt;&gt;&gt;</code> montrent qu’elle est dans la console Python. Elle sort avec <code>exit()</code>, et retrouve le terminal, qui comprend la commande.' },
    { t:'say', h:'Plusieurs fichiers', file:'main.py',
      p:`<p>Quand un projet grandit, on range les fonctions dans un fichier à part, par exemple <code>outils.py</code>, et on les importe dans le fichier principal avec <code>from outils import barre_de_vie</code>. Exactement comme <code>math</code> !</p><p>Mais un fichier importé est exécuté en entier. Pour que son programme de test ne se lance pas à chaque import, on le protège avec <code>if __name__ == "__main__":</code>. Ce bloc ne s'exécute que si on lance le fichier lui-même.</p>`,
      snip:`# outils.py
def barre_de_vie(pv, pv_max=100):
    nb = pv * 10 // pv_max
    return "[" + "#" * nb + "-" * (10 - nb) + "]"

if __name__ == "__main__":
    print(barre_de_vie(50))      # test : seulement si on lance outils.py

# main.py
from outils import barre_de_vie
print("Héros", barre_de_vie(80))`,
      code:`def main():
    print("Le programme démarre.")
    print("Ici, tout le programme principal.")

if __name__ == "__main__":
    main()`,
      p2:`<p>Dans cette page, il n'y a qu'un fichier, mais la structure <code>main()</code> + <code>if __name__ == "__main__":</code> marche quand même. Exécute pour voir.</p>` },
    { t:'code', h:'À toi : la structure pro', file:'jeu.py',
      p:`<p>Écris un programme rangé comme un pro : une fonction <code>main()</code> qui demande le nom du héros et affiche <code>L'aventure de Sam commence !</code>, puis le bloc <code>if __name__ == "__main__":</code> qui appelle <code>main()</code>.</p>`,
      code:``,
      hints:['<code>def main():</code>, avec dedans <code>nom = input("Nom du héros ? ")</code> et un <code>print</code> avec une f-string.','Tout en bas, collé à gauche : <code>if __name__ == "__main__":</code>, et dessous, décalé : <code>main()</code>. Deux tirets bas de chaque côté de name et de main.'],
      check:async (r, code, test) => {
        if (!defined(code, 'main')) return noFn('main');
        if (!/^if\s+__name__\s*==\s*["']__main__["']\s*:/m.test(strip(code))) return 'Il manque le bloc <code>if __name__ == "__main__":</code>, collé à gauche, tout en bas.';
        if (!/^\s+main\s*\(\s*\)/m.test(strip(code).split(/__name__/)[1] || '')) return 'Dans le bloc <code>if __name__ == "__main__":</code>, appelle <code>main()</code>, décalé de 4 espaces.';
        const body = (strip(code).split(/^\s*def\s+main\s*\(\s*\)\s*:/m)[1] || '').split(/^\S/m)[0];
        if (!/input\s*\(/.test(body)) return 'La question doit être posée <strong>dans</strong> la fonction <code>main()</code>.';
        const t = await test(['Inès']);
        if (t.err) return `Quand je réponds Inès, ton code plante : ${esc(t.err.title)}.`;
        if (!/aventure de In[eè]s commence/i.test(t.out)) return 'Quand je réponds Inès, je devrais lire <code>L\'aventure de Inès commence !</code>';
        return true;
      },
      ok:'C’est la forme de presque tous les programmes Python professionnels. Ton fichier peut maintenant être lancé ou importé sans surprise.',
      sol:`def main():
    nom = input("Nom du héros ? ")
    print(f"L'aventure de {nom} commence !")

if __name__ == "__main__":
    main()`, solIn:['Sam'] },
    { t:'code', defi:1, h:'Range ce programme', file:'boutique.py',
      p:`<p>Ce programme marche, mais tout est en vrac. Range-le :</p><ul><li>une fonction <code>prix_total(prix, quantite)</code> qui <strong>renvoie</strong> le prix total, avec 10 % de remise à partir de 5 objets ;</li><li>une fonction <code>main()</code> qui pose les questions et affiche le résultat ;</li><li>le bloc <code>if __name__ == "__main__":</code>.</li></ul>`,
      code:`prix = float(input("Prix d'un objet ? "))
quantite = int(input("Quantité ? "))
total = prix * quantite
if quantite >= 5:
    total = total * 0.9
print(f"Total : {total} pièces")`,
      hints:['<code>def prix_total(prix, quantite):</code> reprend le calcul (les lignes 3 à 5) et finit par <code>return total</code>.','<code>def main():</code> reprend les deux questions, puis <code>print(f"Total : {prix_total(prix, quantite)} pièces")</code>. Et en bas, le bloc <code>if __name__</code>.'],
      check:async (r, code, test) => {
        if (!defined(code, 'prix_total')) return noFn('prix_total');
        if (!defined(code, 'main')) return noFn('main');
        if (!/^if\s+__name__\s*==\s*["']__main__["']\s*:/m.test(strip(code))) return 'Il manque le bloc <code>if __name__ == "__main__":</code> en bas du fichier.';
        for (const [e, w] of [['prix_total(10, 2)', 20], ['prix_total(10, 5)', 45], ['prix_total(4, 10)', 36]]) {
          const x = await call(test, code, e, ['1', '1']);
          if (x.err) return callErr(e, x.err);
          if (x.val === 'None') return `<code>${e}</code> renvoie None : la fonction doit <strong>renvoyer</strong> le total.`;
          if (Math.abs(num(x.val) - w) > 1e-6) return `<code>${e}</code> devrait renvoyer ${w}, et renvoie ${esc(x.val)}.`;
        }
        const t = await test(['10', '5']);
        if (t.err) return `Quand je réponds 10 puis 5, ton code plante : ${esc(t.err.title)}.`;
        if (!/Total\s*:\s*45(\.0)?\s*pi/.test(t.out)) return 'Quand je réponds 10 puis 5, je devrais lire <code>Total : 45.0 pièces</code>.';
        return true;
      },
      ok:'Le calcul est maintenant testable tout seul, sans répondre à des questions. C’est la grande force de ce découpage : séparer les calculs du dialogue avec l’utilisateur.',
      sol:`def prix_total(prix, quantite):
    total = prix * quantite
    if quantite >= 5:
        total = total * 0.9
    return total

def main():
    prix = float(input("Prix d'un objet ? "))
    quantite = int(input("Quantité ? "))
    print(f"Total : {prix_total(prix, quantite)} pièces")

if __name__ == "__main__":
    main()`, solIn:['10', '5'] },
    { t:'code', bug:1, h:'Répare le bug : le copier-coller', file:'bug.py',
      p:`<p>Ce code a été copié depuis Internet, et une ligne a gardé des espaces en trop. Il plante. Exécute-le, puis répare-le.</p><p class="small">Dans VS Code, le message serait <code>IndentationError: unexpected indent</code>. Ici, la page dit simplement que Python n'arrive pas à lire la ligne.</p>`,
      code:`def saluer(nom):
    print(f"Salut {nom} !")
      print("Bienvenue dans l'atelier.")

saluer("Sam")`,
      hints:['Regarde la ligne 3 : elle n’est pas alignée avec la ligne 2.','Les deux <code>print</code> sont dans la même fonction : ils doivent avoir exactement 4 espaces devant.'],
      check:(r, code) => same(code, bugOf('6-2')) ? BUG : r.err ? 'Le code plante encore. Vérifie que les deux lignes de la fonction ont exactement le même décalage.' : !/Salut Sam/.test(r.out) || !/Bienvenue/.test(r.out) ? 'Il faut afficher les deux messages.' : true,
      ok:'Dans un bloc, toutes les lignes ont le même décalage. VS Code t’aide : il montre des petits traits verticaux pour chaque niveau.',
      sol:`def saluer(nom):
    print(f"Salut {nom} !")
    print("Bienvenue dans l'atelier.")

saluer("Sam")` }
  ],
  recap:['Un dossier par projet, ouvert avec <strong>Fichier → Ouvrir le dossier</strong>. Des fichiers en <code>.py</code>.','<code>Ctrl + S</code> pour enregistrer (ou l’enregistrement automatique), ▶ pour lancer.','Terminal : <code>python fichier.py</code>, <code>cd dossier</code>, <code>ls</code>, <code>Ctrl + C</code> pour arrêter.','<code>&gt;&gt;&gt;</code> = console Python. On en sort avec <code>exit()</code>.','Structure pro : une fonction <code>main()</code> et <code>if __name__ == "__main__": main()</code>.'] };

LES['6-3'] = { title:'Lire un message d’erreur en entier', dur:'14 min',
  intro:'Dans VS Code, une erreur s’affiche sous la forme d’un <strong>traceback</strong> : plusieurs lignes qui font peur. En réalité, il te dit exactement où chercher. Il suffit de savoir le lire.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Tu vois <code>&gt;&gt;&gt;</code> au début de la ligne. Où es-tu ?</p>`,
      opts:[ {l:'Dans le terminal, prêt à lancer un fichier', why:'Le terminal affiche le dossier, comme <code>PS C:\\Users\\Sam&gt;</code>. Les chevrons, c’est autre chose.'},
             {l:'Dans la console interactive de Python', ok:1},
             {l:'Dans un fichier .py', why:'Un fichier ne contient pas de chevrons : ils sont affichés par Python.'},
             {l:'Dans un message d’erreur', why:'Les chevrons attendent une instruction : ce n’est pas une erreur.'} ],
      ex:'Les <code>&gt;&gt;&gt;</code> attendent une instruction Python. Pour retourner au terminal : <code>exit()</code>.' },
    { t:'say', h:'Anatomie d’un traceback',
      p:`<p>Voici ce qu'affiche VS Code quand ce programme plante :</p>`,
      snip:`Traceback (most recent call last):
  File "C:\\Users\\Sam\\atelier\\notes.py", line 9, in <module>
    print(moyenne(notes))
          ^^^^^^^^^^^^^^
  File "C:\\Users\\Sam\\atelier\\notes.py", line 5, in moyenne
    return total / len(liste)
           ~~~~~~^~~~~~~~~~~~
ZeroDivisionError: division by zero`,
      p2:`<p>On le lit <strong>de bas en haut</strong> :</p><ol><li>La dernière ligne donne le <strong>type</strong> d'erreur et un message : ici, une division par zéro.</li><li>Juste au-dessus : la ligne qui a planté (ligne 5, dans la fonction <code>moyenne</code>).</li><li>Encore au-dessus : qui a appelé cette fonction (ligne 9, dans <code>&lt;module&gt;</code>, c'est-à-dire le programme principal).</li></ol><p>« most recent call last » veut dire : l'appel le plus récent est en dernier. Dans cette page, on ne te montre que la dernière ligne et le numéro de ligne.</p>` },
    { t:'quiz', h:'Où ça a cassé ?', p:`<p>Dans le traceback d'avant, quelle ligne a <strong>réellement</strong> provoqué l'erreur ?</p>`,
      opts:[ {l:'La ligne 9, print(moyenne(notes))', why:'La ligne 9 a appelé la fonction. Mais l’erreur s’est produite plus loin, dans la fonction.'},
             {l:'La ligne 5, return total / len(liste)', ok:1},
             {l:'La ligne 1', why:'« line 1 » n’apparaît nulle part. Lis les numéros donnés par chaque « File ».'},
             {l:'Impossible à savoir', why:'C’est justement le rôle du traceback : il donne la ligne exacte.'} ],
      ex:'La ligne la plus basse avant le message est celle qui a planté : ligne 5. Mais la <strong>cause</strong> est peut-être plus haut : pourquoi la liste était-elle vide à la ligne 9 ?' },
    { t:'quiz', h:'Le nom bizarre', p:`<p>Que veut dire <code>in &lt;module&gt;</code> dans un traceback ?</p>`,
      opts:[ {l:'L’erreur vient d’un module importé, comme math', why:'Pour un module importé, on verrait son nom de fichier, comme math.py.'},
             {l:'Le code est dans le programme principal, hors de toute fonction', ok:1},
             {l:'Il faut installer un module', why:'Ça, ce serait une <code>ModuleNotFoundError</code>.'},
             {l:'L’erreur est à l’intérieur d’une boucle', why:'Les boucles n’apparaissent pas dans le traceback : seulement les fonctions.'} ],
      ex:'<code>in moyenne</code> veut dire « dans la fonction moyenne », et <code>in &lt;module&gt;</code> « dans le programme principal ».' },
    { t:'say', h:'Les erreurs les plus fréquentes',
      p:`<p>Avec le type d'erreur, tu sais déjà quoi chercher :</p>`,
      snip:`SyntaxError        Python n'arrive pas à lire : (, ", : oubliés
IndentationError   les espaces en début de ligne ne vont pas
NameError          nom inconnu : faute de frappe, variable pas encore créée
TypeError          mélange de types, ou mauvais nombre d'arguments
ValueError         bon type, mauvaise valeur : int("douze")
IndexError         position qui n'existe pas dans une liste
KeyError           clé absente d'un dictionnaire
AttributeError     méthode ou attribut inexistant : "abc".push()
ZeroDivisionError  division par zéro`,
      p2:`<p>Et le message après les deux-points précise toujours lequel. Lis-le en entier, même s'il est en anglais : il contient souvent le nom exact de la variable ou de la clé en cause.</p>` },
    { t:'quiz', h:'Quel code a donné ça ?', p:`<p>Quel code produit cette erreur ?</p>`, snip:`TypeError: can only concatenate str (not "int") to str`,
      opts:[ {l:'print("Score : " + 10)', ok:1},
             {l:'print("Score :", 10)', why:'Avec une virgule, <code>print</code> accepte n’importe quel mélange de types.'},
             {l:'print(int("10"))', why:'La conversion de "10" marche très bien.'},
             {l:'print(10 + 10)', why:'Additionner deux nombres ne pose aucun problème.'} ],
      ex:'« concatenate » veut dire « coller ». On essaie de coller un nombre (int) à du texte (str). Solutions : <code>str(10)</code>, une virgule, ou une f-string.' },
    { t:'code', bug:1, h:'Répare le bug : suis le message', file:'bug.py',
      p:`<p>Ce programme soigne le héros, puis affiche ses pv. Il devrait afficher 120. Exécute-le, lis le message en entier (surtout ce qui suit les deux-points), puis répare-le.</p>`,
      code:`heros = {"nom": "Sam", "pv": 100}

def soigner(h, soin):
    h["PV"] += soin

soigner(heros, 20)
print(heros["pv"])`,
      hints:['Le message original indique la clé exacte qui pose problème. Compare-la aux clés du dictionnaire.','Les clés sont sensibles aux majuscules : dans la fonction, il faut <code>h["pv"]</code>.'],
      check:(r, code) => same(code, bugOf('6-3')) ? BUG : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : linesOf(r.out).join() !== '120' ? 'Il faut afficher 120.' : true,
      ok:'Le message disait <code>KeyError: \'PV\'</code> : la réponse était écrite noir sur blanc. Lire le message en entier, c’est la moitié du débogage.',
      sol:`heros = {"nom": "Sam", "pv": 100}

def soigner(h, soin):
    h["pv"] += soin

soigner(heros, 20)
print(heros["pv"])` },
    { t:'code', h:'À toi : provoque une erreur exprès', file:'casse.py',
      p:`<p>Pour bien connaître les erreurs, rien de tel que de les provoquer. Écris un petit code qui fait planter Python avec une <strong>IndexError</strong>. Une seule erreur, celle-là.</p>`,
      code:``,
      hints:['Une <code>IndexError</code> arrive quand on demande une position qui n’existe pas dans une liste.','Par exemple : une liste de 3 éléments, et <code>print(liste[10])</code>.'],
      check:r => !r.err ? 'Ton code ne plante pas. Il faut provoquer une <code>IndexError</code>.' : /^IndexError/.test(r.err.raw) ? true : `Ton code plante, mais avec une autre erreur : <code>${esc(r.err.raw.split(' on line')[0])}</code>. Il faut une <code>IndexError</code>.`,
      ok:'Tu sais maintenant reconnaître une <code>IndexError</code>… et la fabriquer. Le jour où tu la verras par accident, tu sauras d’où elle vient.',
      sol:`sac = ["corde", "torche", "clé"]
print(sac[10])` },
    { t:'code', defi:1, h:'Trois erreurs à la suite', file:'combat.py',
      p:`<p>Ce programme contient <strong>trois</strong> erreurs différentes. Python s'arrête à la première, alors elles apparaissent une par une : répare, exécute, lis le message suivant, et recommence.</p><p>Quand tout marche, il doit afficher <code>Sam inflige 21 dégâts au gobelin.</code></p>`,
      code:`def degats(force, bonus):
    return force * 3 + bonus

heros = {"nom": "Sam", "force": 6}
monstre = "gobelin
total = degats(heros["force"])
print(heros["nom"] + " inflige " + total + " dégâts au " + monstre + ".")`,
      hints:['Première erreur (ligne 5) : un guillemet oublié. Deuxième : la fonction attend deux arguments, il en manque un (le bonus vaut 3 ici).','Troisième : on ne peut pas coller un nombre avec du texte. Utilise <code>str(total)</code>, ou mieux, une f-string.'],
      check:(r, code) => {
        if (same(code, LES['6-3'].steps[8].code)) return 'Exécute le code et lis la première erreur.';
        if (r.err) return `Encore une erreur : ${esc(r.err.title)}. Lis le message original, puis répare.`;
        if (!/Sam inflige 21 d[ée]g[âa]ts au gobelin/.test(r.out)) return 'Plus d’erreur ! Mais il faut afficher exactement <code>Sam inflige 21 dégâts au gobelin.</code> (avec un bonus de 3).';
        if (/\b21\b/.test(strip(code))) return 'N’écris pas 21 toi-même : laisse la fonction le calculer, avec un bonus de 3.';
        return true;
      },
      ok:'Une <code>SyntaxError</code>, une <code>TypeError</code> d’arguments, une <code>TypeError</code> de mélange. Une à la fois, en lisant chaque message : c’est exactement comme ça qu’on débogue.',
      sol:`def degats(force, bonus):
    return force * 3 + bonus

heros = {"nom": "Sam", "force": 6}
monstre = "gobelin"
total = degats(heros["force"], 3)
print(f"{heros['nom']} inflige {total} dégâts au {monstre}.")` }
  ],
  recap:['Un traceback se lit <strong>de bas en haut</strong> : type et message, puis la ligne qui a planté, puis les appels qui y ont mené.','<code>in &lt;module&gt;</code> = programme principal. <code>in ma_fonction</code> = dans cette fonction.','Le type d’erreur dit quoi chercher. Le message après les deux-points dit précisément quoi.','Python s’arrête à la première erreur : on répare une erreur à la fois, puis on relance.'] };

LES['6-4'] = { title:'try et except', dur:'15 min',
  intro:'Tes programmes plantent dès qu’un utilisateur tape « douze » au lieu de 12. Un programme pro, lui, prévoit les erreurs et réagit calmement. Pour ça, Python a <code>try</code> et <code>except</code>.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Quel type d'erreur donne <code>int("douze")</code> ?</p>`,
      opts:[ {l:'TypeError', why:'Le type est bon (du texte, accepté par <code>int</code>). C’est la valeur qui ne va pas.'},
             {l:'NameError', why:'Il n’y a aucun nom inconnu ici.'},
             {l:'ValueError', ok:1},
             {l:'SyntaxError', why:'Le code est bien écrit : Python le lit sans problème, c’est à l’exécution que ça casse.'} ],
      ex:'<code>ValueError: invalid literal for int() with base 10: \'douze\'</code>. Bon type, mauvaise valeur.' },
    { t:'say', h:'Essayer, et rattraper', file:'try.py', solIn:['douze'],
      p:`<p><code>try</code> veut dire « essaie ». Python exécute le bloc. Si une erreur du type indiqué arrive, au lieu de planter, il saute dans le bloc <code>except</code>.</p><p>Exécute et tape <code>douze</code>, puis exécute encore et tape un vrai nombre.</p>`,
      code:`try:
    age = int(input("Ton âge ? "))
    print(f"L'an prochain, tu auras {age + 1} ans.")
except ValueError:
    print("Ce n'est pas un nombre entier.")
print("Le programme continue.")` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>L'utilisateur tape <code>abc</code>. Qu'affiche ce code ?</p>`, snip:`try:
    n = int(input("Nombre ? "))
    print("A")
except ValueError:
    print("B")
print("C")`,
      opts:[ {l:'A, B, C', why:'L’erreur arrive à la ligne du <code>int</code> : la suite du <code>try</code>, donc « A », est sautée.'},
             {l:'B, C', ok:1},
             {l:'B', why:'Après le <code>except</code>, le programme continue normalement : « C » s’affiche.'},
             {l:'Une ValueError', why:'L’erreur est rattrapée par le <code>except ValueError</code> : pas de plantage.'} ],
      ex:'Dès l’erreur, Python quitte le <code>try</code> (A est sauté), exécute le <code>except</code> (B), puis continue (C).' },
    { t:'say', h:'Redemander jusqu’à ce que ce soit bon', file:'redemander.py', solIn:['abc', '4.5', '12'],
      p:`<p>Le grand classique : une boucle <code>while True</code>, un <code>try</code> qui tente la conversion, un <code>break</code> si ça marche, et un message si ça rate. La boucle recommence alors toute seule.</p>`,
      code:`while True:
    try:
        n = int(input("Combien de potions ? "))
        break
    except ValueError:
        print("Il faut un nombre entier, réessaie.")
print(f"Tu achètes {n} potions.")` },
    { t:'say', h:'Plusieurs except, else et finally', file:'butin.py',
      p:`<p>On peut rattraper plusieurs types d'erreurs, chacun avec son message. Et deux blocs facultatifs :</p><ul><li><code>else</code> : exécuté seulement s'il n'y a <strong>pas</strong> eu d'erreur ;</li><li><code>finally</code> : exécuté <strong>dans tous les cas</strong>. On s'en sert pour fermer ou nettoyer.</li></ul>`,
      code:`def partager(butin, nb_heros):
    try:
        part = butin // nb_heros
    except ZeroDivisionError:
        print("Personne pour partager !")
    except TypeError:
        print("Il faut des nombres.")
    else:
        print(f"Chacun reçoit {part} pièces.")
    finally:
        print("Partage terminé.")

partager(100, 3)
partager(100, 0)
partager("cent", 3)` },
    { t:'quiz', h:'Le except fourre-tout', p:`<p>Pourquoi les développeurs évitent-ils d'écrire <code>except:</code> tout seul, sans type d'erreur ?</p>`, snip:`try:
    total = prix * quantitee
except:
    print("Erreur de saisie.")`,
      opts:[ {l:'Parce que c’est une SyntaxError', why:'C’est permis par Python. Le problème est ailleurs.'},
             {l:'Parce qu’il rattrape aussi les bugs, et les cache', ok:1},
             {l:'Parce qu’il est plus lent', why:'La vitesse n’est pas le problème.'},
             {l:'Parce qu’il ne rattrape aucune erreur', why:'Au contraire, il les rattrape toutes. C’est bien ça le souci.'} ],
      ex:'Ici, <code>quantitee</code> est mal écrit : c’est une <code>NameError</code>, un bug du programmeur. Le <code>except:</code> l’avale et affiche « Erreur de saisie » : tu chercheras longtemps. Rattrape toujours un type précis.' },
    { t:'say', h:'Lever ses propres erreurs', file:'raise.py',
      p:`<p>Ta fonction peut aussi <strong>signaler</strong> un problème avec <code>raise</code>. On choisit le type et on écrit un message. Celui qui appelle la fonction décide quoi en faire avec <code>try</code>.</p><p><code>except ValueError as e</code> range l'erreur dans <code>e</code>, pour afficher son message.</p>`,
      code:`def acheter(or_, prix):
    if prix > or_:
        raise ValueError(f"Il te manque {prix - or_} pièces")
    return or_ - prix

try:
    reste = acheter(30, 50)
except ValueError as e:
    print("Achat impossible :", e)` },
    { t:'code', h:'À toi : lire un entier sans planter', file:'lire.py',
      p:`<p>Crée une fonction <code>lire_entier(question)</code> qui pose la question <strong>jusqu'à ce que</strong> l'utilisateur tape un nombre entier, puis <strong>renvoie</strong> ce nombre. À chaque erreur, elle affiche <code>Ce n'est pas un nombre entier.</code></p><p>Utilise-la ensuite pour demander l'âge et afficher l'âge dans 10 ans.</p>`,
      code:``,
      hints:['Dans la fonction : <code>while True:</code>, puis <code>try:</code> → <code>return int(input(question))</code>. Le <code>return</code> sort de la boucle et de la fonction.','<code>except ValueError:</code> → <code>print("Ce n\'est pas un nombre entier.")</code>. Puis en bas : <code>age = lire_entier("Ton âge ? ")</code>.'],
      check:async (r, code, test) => {
        if (!defined(code, 'lire_entier')) return noFn('lire_entier');
        const x = await call(test, onlyDefs(code), 'lire_entier("Nombre ? ")', ['abc', '4.5', '12']);
        if (x.err) return `Quand je réponds abc, puis 4.5, puis 12, ça plante : ${esc(x.err.title)}.`;
        if (x.val === 'None') return /pas un nombre/i.test(x.out) ? 'Après une mauvaise réponse, ta fonction s’arrête. Elle doit redemander : mets le <code>try</code> dans une boucle <code>while True:</code>.' : '<code>lire_entier</code> doit <strong>renvoyer</strong> le nombre, avec <code>return</code>.';
        if (x.val !== '12') return `Quand je réponds abc, puis 4.5, puis 12, <code>lire_entier</code> devrait renvoyer 12, et renvoie ${esc(x.val)}.`;
        const errs = (x.out.match(/pas un nombre/gi) || []).length;
        if (errs < 2) return 'À chaque réponse invalide (abc, puis 4.5), affiche <code>Ce n\'est pas un nombre entier.</code>';
        const t = await test(['douze', '19']);
        if (t.err) return `Quand je réponds douze puis 19 à ton programme, il plante : ${esc(t.err.title)}.`;
        if (!/29/.test(t.out)) return 'Utilise ta fonction pour demander l’âge, puis affiche l’âge dans 10 ans (29 si on a 19 ans).';
        return true;
      },
      ok:'Cette fonction, tu vas la réutiliser dans tous tes programmes. Plus jamais de plantage parce que quelqu’un a tapé « douze ».',
      sol:`def lire_entier(question):
    while True:
        try:
            return int(input(question))
        except ValueError:
            print("Ce n'est pas un nombre entier.")

age = lire_entier("Ton âge ? ")
print(f"Dans 10 ans, tu auras {age + 10} ans.")`, solIn:['douze', '19'] },
    { t:'code', defi:1, h:'Le montant valide', file:'montant.py',
      p:`<p>Pour le gestionnaire de dépenses, crée <code>lire_montant(question)</code> qui redemande tant que la réponse n'est pas un nombre <strong>strictement positif</strong> (les virgules comme 12.5 sont permises), puis le renvoie. Deux messages différents :</p><ul><li><code>Ce n'est pas un nombre.</code> si la conversion échoue ;</li><li><code>Le montant doit être positif.</code> si le nombre vaut 0 ou moins.</li></ul>`,
      code:``,
      hints:['Même structure que <code>lire_entier</code>, avec <code>float()</code>. Mais au lieu de renvoyer tout de suite, range le nombre dans une variable.','Après la conversion (toujours dans le <code>try</code>) : <code>if montant &gt; 0: return montant</code>, sinon <code>print("Le montant doit être positif.")</code>.'],
      check:async (r, code, test) => {
        if (!defined(code, 'lire_montant')) return noFn('lire_montant');
        const x = await call(test, onlyDefs(code), 'lire_montant("Montant ? ")', ['douze', '-5', '0', '12.5']);
        if (x.err) return `Quand je réponds douze, -5, 0 puis 12.5, ça plante : ${esc(x.err.title)}.`;
        if (x.val === 'None') return '<code>lire_montant</code> doit renvoyer le montant avec <code>return</code>.';
        if (num(x.val) !== 12.5) return `Quand je réponds douze, -5, 0 puis 12.5, <code>lire_montant</code> devrait renvoyer 12.5, et renvoie ${esc(x.val)}.${num(x.val) === -5 ? ' -5 n’est pas positif : il faut redemander.' : ''}`;
        const o = x.out;
        if ((o.match(/pas un nombre/gi) || []).length !== 1) return 'Pour « douze », affiche <code>Ce n\'est pas un nombre.</code> (une fois).';
        if ((o.match(/positif/gi) || []).length !== 2) return 'Pour -5 et pour 0, affiche <code>Le montant doit être positif.</code>';
        return true;
      },
      ok:'Deux sortes de mauvaises réponses, deux messages clairs. L’utilisateur sait toujours quoi corriger.',
      sol:`def lire_montant(question):
    while True:
        try:
            montant = float(input(question))
            if montant > 0:
                return montant
            print("Le montant doit être positif.")
        except ValueError:
            print("Ce n'est pas un nombre.")

print(lire_montant("Montant ? "))`, solIn:['douze', '12.5'] },
    { t:'code', bug:1, h:'Répare le bug : l’erreur qui revient', file:'bug.py',
      p:`<p>Ce code rattrape bien la <code>ValueError</code>… mais il plante quand même juste après, avec une autre erreur. Exécute-le en tapant <code>abc</code>, lis le message, puis répare-le pour qu'il ne plante plus jamais.</p>`,
      code:`try:
    age = int(input("Ton âge ? "))
except ValueError:
    print("Ce n'est pas un nombre.")
print(f"Dans 10 ans, tu auras {age + 10} ans.")`,
      hints:['Si la conversion rate, la variable <code>age</code> n’est jamais créée. La dernière ligne s’en sert quand même.','Deux solutions : mettre le <code>print</code> dans un bloc <code>else:</code>, ou redemander en boucle jusqu’à ce que ce soit bon.'],
      check:async (r, code, test) => {
        if (same(code, bugOf('6-4'))) return BUG;
        const t1 = await test(['19']);
        if (t1.err) return `Quand je réponds 19, ton code plante : ${esc(t1.err.title)}.`;
        if (!/29/.test(t1.out)) return 'Quand je réponds 19, il faut afficher l’âge dans 10 ans : 29.';
        const t2 = await test(['abc', '19']);
        if (t2.err) return `Quand je réponds abc, ton code plante encore : ${esc(t2.err.title)}.`;
        if (!/pas un nombre/i.test(t2.out)) return 'Quand je réponds abc, il faut toujours afficher <code>Ce n\'est pas un nombre.</code>';
        return true;
      },
      ok:'Rattraper l’erreur ne suffit pas : il faut aussi penser à la suite. Avec <code>else</code>, le code qui a besoin du résultat ne s’exécute que si tout s’est bien passé.',
      sol:`try:
    age = int(input("Ton âge ? "))
except ValueError:
    print("Ce n'est pas un nombre.")
else:
    print(f"Dans 10 ans, tu auras {age + 10} ans.")`, solIn:['abc'] }
  ],
  recap:['<code>try:</code> … <code>except TypeErreur:</code> : si l’erreur arrive dans le <code>try</code>, on saute dans l’<code>except</code> au lieu de planter.','Pour redemander : <code>while True</code> + <code>try</code> + <code>break</code> (ou <code>return</code>).','<code>else</code> : seulement s’il n’y a pas eu d’erreur. <code>finally</code> : dans tous les cas.','Rattrape toujours un type précis. Un <code>except:</code> tout seul cache tes bugs.','<code>raise ValueError("message")</code> signale un problème. <code>except ValueError as e</code> récupère le message.'] };

LES['6-5'] = { title:'Lire et écrire un fichier', dur:'15 min',
  intro:'Quand ton programme s’arrête, toutes ses variables disparaissent. Pour garder des scores, des dépenses ou une sauvegarde de jeu, il faut les écrire dans un <strong>fichier</strong>.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Il n'y a pas d'erreur. Qu'affiche ce code ?</p>`, snip:`try:
    x = 10 // 2
except ZeroDivisionError:
    print("zéro")
else:
    print("ok", x)
finally:
    print("fin")`,
      opts:[ {l:'ok 5', why:'Le <code>finally</code> s’exécute dans tous les cas, même sans erreur.'},
             {l:'zéro, fin', why:'10 // 2 ne divise pas par zéro : pas d’erreur, donc pas d’<code>except</code>.'},
             {l:'ok 5, fin', ok:1},
             {l:'fin', why:'Sans erreur, le bloc <code>else</code> s’exécute aussi.'} ],
      ex:'Pas d’erreur : <code>else</code> s’exécute (ok 5), puis <code>finally</code> (fin), comme toujours.' },
    { t:'say', h:'Écrire dans un fichier',
      p:`<p>On ouvre un fichier avec <code>open(nom, mode)</code>. Le mode <code>"w"</code> (<em>write</em>) crée le fichier, ou <strong>l'efface</strong> s'il existe. Le mode <code>"a"</code> (<em>append</em>) ajoute à la fin.</p><p>Le mot <code>with</code> ferme le fichier tout seul à la fin du bloc, même en cas d'erreur. <code>write</code> n'ajoute pas de retour à la ligne : il faut écrire <code>\\n</code> soi-même.</p>`,
      snip:`with open("scores.txt", "w", encoding="utf-8") as f:
    f.write("Sam;120\\n")
    f.write("Inès;340\\n")

with open("scores.txt", "a", encoding="utf-8") as f:
    f.write("Léo;95\\n")`,
      p2:`<p class="small">Dans cette page, Python n'a pas le droit d'écrire de fichiers sur ton ordinateur. Pour écrire pour de vrai, utilise VS Code : le fichier <code>scores.txt</code> apparaîtra à côté de ton programme. <code>encoding="utf-8"</code> garantit que les accents passent bien.</p>` },
    { t:'say', h:'Lire un fichier',
      p:`<p>Pour lire, on ouvre en mode <code>"r"</code> (<em>read</em>, le mode par défaut). Le plus pratique : parcourir le fichier ligne par ligne avec <code>for</code>. Chaque ligne se termine par <code>\\n</code>, qu'on enlève avec <code>strip()</code>.</p>`,
      snip:`with open("scores.txt", "r", encoding="utf-8") as f:
    for ligne in f:
        nom, score = ligne.strip().split(";")
        print(nom, "a", int(score), "points")

# Autres façons :
#   texte = f.read()          tout le fichier dans un seul texte
#   lignes = f.readlines()    une liste de lignes (avec les \\n)`,
      p2:`<p>Si le fichier n'existe pas, Python lève une <code>FileNotFoundError</code>. Tu sais quoi faire : <code>try</code> / <code>except FileNotFoundError</code>.</p>` },
    { t:'quiz', h:'Le mode dangereux', p:`<p>Le fichier <code>sauvegarde.txt</code> contient 3 mois de progression. Que se passe-t-il ?</p>`, snip:`with open("sauvegarde.txt", "w") as f:
    f.write("niveau 1")`,
      opts:[ {l:'« niveau 1 » est ajouté à la fin', why:'Ça, c’est le mode <code>"a"</code>. Le mode <code>"w"</code> recommence de zéro.'},
             {l:'Le fichier ne contient plus que « niveau 1 »', ok:1},
             {l:'Une erreur, car le fichier existe déjà', why:'Le mode <code>"w"</code> ne vérifie rien : il efface sans prévenir.'},
             {l:'Rien, il faut d’abord lire le fichier', why:'Le mode <code>"w"</code> efface le contenu dès l’ouverture.'} ],
      ex:'Le mode <code>"w"</code> efface tout dès l’ouverture. Pour ajouter, c’est <code>"a"</code>. Une erreur de mode, et 3 mois de progression partent à la poubelle.' },
    { t:'say', h:'S’entraîner avec un fichier simulé', file:'lecture.py', mem:1,
      p:`<p>Ici, on va <strong>simuler</strong> un fichier : un texte sur plusieurs lignes, entre trois guillemets <code>"""</code>. <code>contenu.splitlines()</code> le découpe en lignes, comme si on lisait un vrai fichier ligne par ligne.</p><p>Tout ce que tu écris ici marchera tel quel avec un vrai fichier dans VS Code.</p>`,
      code:`contenu = """Sam;Mage;120
Inès;Guerrière;340
Léo;Archer;95"""

joueurs = []
for ligne in contenu.splitlines():
    nom, classe, score = ligne.split(";")
    joueurs.append({"nom": nom, "classe": classe, "score": int(score)})
print(joueurs[1]["nom"], joueurs[1]["score"])` },
    { t:'quiz', h:'Le caractère invisible', p:`<p>On a lu ces lignes dans un fichier. Qu'affiche ce code ?</p>`, snip:`lignes = ["Sam\\n", "Inès\\n"]
print("Sam" in lignes)`,
      opts:[ {l:'True', why:'La liste contient "Sam\\n", pas "Sam" : il y a un retour à la ligne invisible à la fin.'},
             {l:'False', ok:1},
             {l:'Sam', why:'<code>in</code> répond par True ou False.'},
             {l:'Une erreur', why:'Le code est valide : il donne juste une réponse surprenante.'} ],
      ex:'Chaque ligne lue garde son <code>\\n</code>. "Sam\\n" n’est pas égal à "Sam". C’est pour ça qu’on fait toujours <code>ligne.strip()</code>.' },
    { t:'code', h:'À toi : le meilleur score', file:'scores.py',
      p:`<p>Le fichier simulé contient des scores, au format <code>nom;score</code>. Affiche le total des scores (<code>Total : 555</code>), puis le meilleur joueur (<code>Meilleur : Inès (340)</code>).</p><p>Je testerai avec un autre fichier.</p>`,
      code:`contenu = """Sam;120
Inès;340
Léo;95"""
`,
      hints:['<code>for ligne in contenu.splitlines():</code>, puis <code>nom, score = ligne.split(";")</code>. N’oublie pas <code>int(score)</code>.','Un accumulateur pour le total, et le schéma du record pour le meilleur (garde son nom et son score).'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        for (const [txt, tot, best, bs] of [['Sam;120\nInès;340\nLéo;95', 555, 'Inès', 340], ['Zoé;10\nMax;70\nAli;5\nLou;69', 154, 'Max', 70], ['Solo;42', 42, 'Solo', 42]]) {
          const t = await test([], fichier(code, txt));
          const lab = txt === 'Sam;120\nInès;340\nLéo;95' ? '' : `Avec un autre fichier (${esc(txt.replace(/\n/g, ', '))}), `;
          if (t.err) return `${lab}ton code plante : ${esc(t.err.title)}.`;
          if (!new RegExp('total\\D*' + tot + '\\b', 'i').test(t.out)) return `${lab}je devrais lire <code>Total : ${tot}</code>.${/120340/.test(t.out) ? ' Les scores ont été collés comme du texte : convertis-les avec <code>int()</code>.' : ''}`;
          if (!new RegExp('meilleur\\W*' + best + '\\W*' + bs, 'i').test(t.out)) return `${lab}je devrais lire <code>Meilleur : ${best} (${bs})</code>.`;
        }
        return true;
      },
      ok:'Testé avec trois fichiers. Dans VS Code, il suffit de remplacer <code>contenu.splitlines()</code> par les lignes d’un vrai fichier ouvert avec <code>open</code>.',
      sol:`contenu = """Sam;120
Inès;340
Léo;95"""
total = 0
meilleur = ""
record = -1
for ligne in contenu.splitlines():
    nom, score = ligne.split(";")
    score = int(score)
    total += score
    if score > record:
        meilleur = nom
        record = score
print("Total :", total)
print(f"Meilleur : {meilleur} ({record})")` },
    { t:'code', defi:1, h:'Sauvegarder et recharger', file:'sauvegarde.py',
      p:`<p>Pour sauvegarder le gestionnaire de dépenses du chapitre 5, il faut transformer les données en texte, et inversement. Crée deux fonctions :</p><ul><li><code>vers_texte(depenses)</code> renvoie le texte à écrire dans le fichier : une ligne <code>libelle;montant;categorie</code> par dépense, chacune terminée par <code>\\n</code> ;</li><li><code>depuis_texte(texte)</code> fait l'inverse et renvoie la liste de dictionnaires, avec le montant en <code>float</code>.</li></ul><p>Je vérifierai que <code>depuis_texte(vers_texte(d))</code> redonne exactement <code>d</code>.</p>`,
      code:`depenses = [{"libelle": "Pizza", "montant": 12.5, "categorie": "sorties"},
            {"libelle": "Bus", "montant": 2.0, "categorie": "transport"}]
`,
      hints:['<code>vers_texte</code> : un texte vide <code>texte = ""</code>, et pour chaque dépense <code>texte += f"{d[\'libelle\']};{d[\'montant\']};{d[\'categorie\']}\\n"</code>.','<code>depuis_texte</code> : <code>for ligne in texte.splitlines():</code>, <code>libelle, montant, categorie = ligne.split(";")</code>, puis <code>append</code> d’un dictionnaire avec <code>float(montant)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'vers_texte')) return noFn('vers_texte');
        if (!defined(code, 'depuis_texte')) return noFn('depuis_texte');
        let x = await call(test, code, 'vers_texte(depenses)');
        if (x.err) return callErr('vers_texte(depenses)', x.err);
        if (x.val !== "'Pizza;12.5;sorties\\nBus;2.0;transport\\n'") return `<code>vers_texte(depenses)</code> devrait renvoyer <code>'Pizza;12.5;sorties\\nBus;2.0;transport\\n'</code>, et renvoie <code>${esc(x.val)}</code>.`;
        x = await call(test, code, 'depuis_texte("Ciné;9.5;sorties\\nPain;1.2;courses\\n")');
        if (x.err) return callErr('depuis_texte(...)', x.err);
        if (x.val !== "[{'libelle': 'Ciné', 'montant': 9.5, 'categorie': 'sorties'}, {'libelle': 'Pain', 'montant': 1.2, 'categorie': 'courses'}]") return `<code>depuis_texte("Ciné;9.5;sorties\\nPain;1.2;courses\\n")</code> devrait renvoyer deux dictionnaires, avec le montant en float. J’obtiens : <code>${esc(x.val)}</code>`;
        x = await call(test, code, 'depuis_texte(vers_texte(depenses)) == depenses and depuis_texte("") == []');
        if (x.err || x.val !== 'True') return 'L’aller-retour ne marche pas : <code>depuis_texte(vers_texte(depenses))</code> doit redonner exactement <code>depenses</code>, et un texte vide une liste vide.';
        return true;
      },
      ok:'L’aller-retour est parfait. Dans VS Code, il ne reste qu’à écrire <code>f.write(vers_texte(depenses))</code> en quittant, et <code>depuis_texte(f.read())</code> au démarrage. Ton gestionnaire a une mémoire.',
      sol:`depenses = [{"libelle": "Pizza", "montant": 12.5, "categorie": "sorties"},
            {"libelle": "Bus", "montant": 2.0, "categorie": "transport"}]

def vers_texte(depenses):
    texte = ""
    for d in depenses:
        texte += f"{d['libelle']};{d['montant']};{d['categorie']}\\n"
    return texte

def depuis_texte(texte):
    resultat = []
    for ligne in texte.splitlines():
        libelle, montant, categorie = ligne.split(";")
        resultat.append({"libelle": libelle, "montant": float(montant), "categorie": categorie})
    return resultat

print(vers_texte(depenses))` },
    { t:'code', bug:1, h:'Répare le bug : le nom introuvable', file:'bug.py',
      p:`<p>Ces lignes ont été lues dans un fichier. Le programme cherche Inès, qui est pourtant là, mais il affiche <code>Absente...</code>. Exécute-le, puis répare-le.</p>`,
      code:`lignes = ["Sam\\n", "Inès\\n", "Léo\\n"]
cherche = "Inès"
trouve = False
for ligne in lignes:
    if ligne == cherche:
        trouve = True
if trouve:
    print("Trouvée !")
else:
    print("Absente...")`,
      hints:['Chaque ligne se termine par un <code>\\n</code> invisible. "Inès\\n" n’est pas égal à "Inès".','Compare avec la ligne nettoyée : <code>if ligne.strip() == cherche:</code>.'],
      check:(r, code) => same(code, bugOf('6-5')) ? BUG : r.err ? ERR : !/Trouv/.test(r.out) || /Absente/.test(r.out) ? 'Il faut trouver Inès et afficher <code>Trouvée !</code>.' : /\[\s*"Sam"/.test(code) ? 'Ne change pas les lignes lues : c’est la comparaison qu’il faut corriger.' : true,
      ok:'Le <code>\\n</code> de fin de ligne est le bug numéro 1 avec les fichiers. Un <code>strip()</code> à chaque lecture, et il disparaît.',
      sol:`lignes = ["Sam\\n", "Inès\\n", "Léo\\n"]
cherche = "Inès"
trouve = False
for ligne in lignes:
    if ligne.strip() == cherche:
        trouve = True
if trouve:
    print("Trouvée !")
else:
    print("Absente...")` },
    { t:'say', h:'Mission dans VS Code',
      p:`<p>À toi de jouer pour de vrai. Dans ton dossier <code>atelier</code>, crée <code>journal.py</code> avec ce code, lance-le plusieurs fois, puis ouvre <code>journal.txt</code> dans VS Code : chaque lancement a ajouté une ligne.</p>`,
      snip:`message = input("Qu'as-tu appris aujourd'hui ? ")
with open("journal.txt", "a", encoding="utf-8") as f:
    f.write(message + "\\n")

print("Ton journal :")
with open("journal.txt", "r", encoding="utf-8") as f:
    for i, ligne in enumerate(f, 1):
        print(i, ligne.strip())`,
      p2:`<p>Défi : ajoute la sauvegarde à ton gestionnaire de dépenses, avec <code>vers_texte</code> et <code>depuis_texte</code>. Pense au <code>try</code> / <code>except FileNotFoundError</code> pour le tout premier lancement, quand le fichier n'existe pas encore.</p>` }
  ],
  recap:['<code>with open(nom, mode, encoding="utf-8") as f:</code> ouvre un fichier et le ferme tout seul.','Modes : <code>"r"</code> lire, <code>"w"</code> écrire (efface tout !), <code>"a"</code> ajouter à la fin.','<code>f.write(texte)</code> n’ajoute pas de <code>\\n</code> : écris-le toi-même.','Lire : <code>for ligne in f:</code> puis <code>ligne.strip()</code>. Fichier absent : <code>FileNotFoundError</code>.','Un format simple : une ligne par élément, des <code>;</code> entre les valeurs, puis <code>split(";")</code>.'] };

LES['6-6'] = { title:'Déboguer pas à pas', dur:'15 min',
  intro:'Tous les programmeurs écrivent des bugs. La différence entre un débutant et un pro, c’est la méthode pour les trouver. Dans cette leçon : le <code>print</code> de débogage, les tests automatiques, et le débogueur de VS Code.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Quel mode faut-il pour <strong>ajouter</strong> une ligne à la fin d'un fichier, sans effacer ce qu'il contient ?</p>`,
      opts:[ {l:'"r"', why:'<code>"r"</code> sert à lire. On ne peut pas écrire avec.'},
             {l:'"w"', why:'<code>"w"</code> efface tout le contenu dès l’ouverture.'},
             {l:'"a"', ok:1},
             {l:'"+"', why:'Ce mode n’existe pas tout seul.'} ],
      ex:'<code>"a"</code> comme <em>append</em> : on ajoute à la fin. Parfait pour un journal ou un historique.' },
    { t:'say', h:'La méthode',
      p:`<p>Face à un bug, on ne modifie pas le code au hasard en espérant que ça passe. On suit une méthode :</p><ol><li><strong>Reproduire</strong> : trouver les valeurs exactes qui font apparaître le bug.</li><li><strong>Lire</strong> le message d'erreur en entier, s'il y en a un.</li><li><strong>Faire une hypothèse</strong> : « je pense que total est faux après la boucle ».</li><li><strong>Vérifier</strong> l'hypothèse, en regardant les valeurs pendant l'exécution.</li><li><strong>Corriger</strong>, puis <strong>retester</strong>, y compris les cas qui marchaient.</li></ol><p>Une astuce célèbre : expliquer son code ligne par ligne, à voix haute, à un canard en plastique. Souvent, on trouve le bug en le racontant.</p>` },
    { t:'say', h:'Le print de débogage', file:'debug.py',
      p:`<p>La façon la plus simple de voir ce qui se passe : ajouter des <code>print</code> qui montrent les variables à chaque étape. On les marque avec <code>DEBUG</code> pour les retrouver et les enlever ensuite.</p><p>Ce code devrait compter les potions, mais il trouve 1 au lieu de 3. Exécute, et regarde les lignes DEBUG : on voit le moment exact où le compte repart à 0.</p>`,
      code:`sac = ["potion", "corde", "potion", "potion"]
for objet in sac:
    nb = 0
    if objet == "potion":
        nb += 1
    print("DEBUG objet =", objet, "| nb =", nb)
print("Potions :", nb)`,
      p2:`<p class="small">Dans VS Code (Python 3.8 ou plus), il existe un raccourci pratique : <code>print(f"{nb=}")</code> affiche <code>nb=3</code>. Cette page ne le connaît pas.</p>` },
    { t:'quiz', h:'Où mettre le print ?', p:`<p>La boucle calcule mal un total. Où places-tu ton <code>print</code> de débogage pour comprendre ?</p>`, snip:`total = 0
for prix in prix_articles:
    total = total + prix * 1.2
print("Total :", total)`,
      opts:[ {l:'Avant la boucle', why:'Avant la boucle, total vaut 0 : ça ne t’apprend rien sur ce qui se passe à chaque tour.'},
             {l:'Dans la boucle, après le calcul : prix et total', ok:1},
             {l:'Après la boucle', why:'Le <code>print("Total :")</code> est déjà là, et on sait que le résultat est faux. Il faut voir comment on y arrive.'},
             {l:'Nulle part, il faut relire le code', why:'Relire aide, mais voir les vraies valeurs est bien plus sûr.'} ],
      ex:'Dans la boucle, on voit l’évolution tour par tour. Le premier tour où la valeur n’est pas celle attendue, c’est là que se trouve le bug.' },
    { t:'say', h:'Le débogueur de VS Code',
      p:`<p>Le débogueur, c'est un <code>print</code> de débogage en beaucoup mieux : il <strong>met le programme en pause</strong>, et tu vois toutes les variables.</p><ol><li>Clique à gauche d'un numéro de ligne : un point rouge apparaît. C'est un <strong>point d'arrêt</strong>.</li><li>Appuie sur <code>F5</code> et choisis <strong>Python Debugger → Python File</strong>.</li><li>Le programme s'arrête sur la ligne. À gauche, le panneau <strong>Variables</strong> montre toutes les valeurs.</li><li>Avance ligne par ligne avec les touches ci-dessous, et regarde les valeurs changer.</li></ol>`,
      snip:`F5          continuer jusqu'au prochain point d'arrêt
F10         ligne suivante (sans entrer dans les fonctions)
F11         entrer dans la fonction appelée sur cette ligne
Maj + F11   finir la fonction et revenir à l'appelant
Maj + F5    arrêter le débogage`,
      p2:`<p>C'est exactement la Mémoire de Python que tu vois sous la console dans cette page, mais en direct, ligne par ligne.</p>` },
    { t:'quiz', h:'F10 ou F11 ?', p:`<p>Le débogueur est en pause sur la ligne <code>degats = calculer_degats(heros, arme)</code>. Tu veux voir ce qui se passe <strong>dans</strong> <code>calculer_degats</code>. Quelle touche ?</p>`,
      opts:[ {l:'F10', why:'F10 exécute toute la ligne d’un coup, fonction comprise, et s’arrête à la ligne suivante.'},
             {l:'F11', ok:1},
             {l:'F5', why:'F5 continue jusqu’au prochain point d’arrêt, sans t’arrêter dans la fonction.'},
             {l:'Maj + F5', why:'Ça arrête complètement le débogage.'} ],
      ex:'F11 entre dans la fonction (<em>step into</em>). F10 passe par-dessus (<em>step over</em>). Maj + F11 en ressort.' },
    { t:'code', bug:1, h:'Répare le bug : la moyenne fausse', file:'bug.py',
      p:`<p>Cette fonction devrait renvoyer 14.0 pour les notes 10, 14 et 18. Elle renvoie 6.0, sans erreur. Ajoute un <code>print</code> de débogage dans la boucle pour voir ce que devient <code>total</code>, trouve le bug, puis corrige-le (tu peux laisser ou enlever le <code>print</code>).</p>`,
      code:`def moyenne(notes):
    total = 0
    for n in notes:
        total = n
    return total / len(notes)

print(moyenne([10, 14, 18]))`,
      hints:['Avec un <code>print("DEBUG total =", total)</code> dans la boucle, on voit 10, puis 14, puis 18 : total ne s’accumule pas, il est remplacé.','Il faut ajouter à chaque tour : <code>total += n</code>.'],
      check:async (r, code, test) => {
        if (same(code, bugOf('6-6'))) return BUG;
        if (r.err) return ERR;
        for (const [l, w] of [['[10, 14, 18]', 14], ['[5]', 5], ['[0, 20]', 10]]) {
          const x = await call(test, code, `moyenne(${l})`);
          if (x.err) return callErr(`moyenne(${l})`, x.err);
          if (num(x.val) !== w) return `<code>moyenne(${l})</code> devrait renvoyer ${w}, et renvoie ${esc(x.val)}.`;
        }
        return true;
      },
      ok:'Un <code>=</code> à la place d’un <code>+=</code> : invisible à la lecture, évident avec un <code>print</code> dans la boucle.',
      sol:`def moyenne(notes):
    total = 0
    for n in notes:
        total += n
    return total / len(notes)

print(moyenne([10, 14, 18]))` },
    { t:'code', h:'À toi : tes premiers tests automatiques', file:'tests.py',
      p:`<p>Les pros ne testent pas à la main : ils écrivent des tests que l'ordinateur vérifie. <code>assert condition</code> ne fait rien si la condition est vraie, et plante avec une <code>AssertionError</code> si elle est fausse.</p><p>Écris <strong>au moins 3</strong> <code>assert</code> qui vérifient la fonction <code>prix_ttc</code> avec des valeurs différentes. Je modifierai ensuite la fonction en douce : tes tests devront le détecter.</p>`,
      code:`def prix_ttc(prix):
    return prix * 1.2

assert prix_ttc(100) == 120
# Ajoute au moins deux autres tests
`,
      hints:['La forme : <code>assert prix_ttc(10) == 12</code>. Choisis des valeurs dont tu connais le résultat.','Par exemple : <code>assert prix_ttc(0) == 0</code> et <code>assert prix_ttc(50) == 60</code>. Si rien ne s’affiche et que rien ne plante, tes tests passent.'],
      check:async (r, code, test) => {
        if (r.err) return /AssertionError/.test(r.err.raw) ? 'Un de tes tests échoue alors que la fonction est juste : vérifie tes valeurs attendues. Attention aux nombres à virgule : <code>3 * 1.2</code> donne 3.5999999999999996. Choisis des prix ronds, comme 10, 50 ou 100.' : ERR;
        const n = (strip(code).match(/^\s*assert\s/gm) || []).length;
        if (n < 3) return `J’ai trouvé ${n} <code>assert</code>. Il en faut au moins 3.`;
        const t1 = await test([], code.replace('return prix * 1.2', 'return prix * 1.25'));
        if (!t1.err || !/AssertionError/.test(t1.err.raw)) return 'J’ai remplacé 1.2 par 1.25 dans la fonction, et tes tests n’ont rien vu. Vérifie que tu compares bien le résultat à la bonne valeur avec <code>==</code>.';
        const t3 = await test([], code.replace('return prix * 1.2', 'return prix * 1.2 if prix >= 100 else prix'));
        if (!t3.err) return 'J’ai cassé la fonction pour les prix plus petits que 100, et tes tests n’ont rien vu. Teste aussi des petits prix.';
        return true;
      },
      ok:'Tes tests ont attrapé mes modifications. Chaque fois que tu changeras ce code, il suffira de le relancer : si rien ne plante, rien n’est cassé.',
      sol:`def prix_ttc(prix):
    return prix * 1.2

assert prix_ttc(100) == 120
assert prix_ttc(0) == 0
assert prix_ttc(50) == 60` },
    { t:'code', defi:1, h:'Deux bugs bien cachés', file:'record.py',
      p:`<p>Cette fonction doit renvoyer le plus grand score d'une liste (sans utiliser <code>max</code>). Elle marche pour <code>[3, 9, 4]</code>… mais elle contient <strong>deux bugs</strong>. Les tests en bas les révèlent un par un. Utilise des <code>print</code> de débogage pour comprendre, puis corrige la fonction (pas les tests !).</p>`,
      code:`def meilleur(scores):
    record = 0
    for i in range(1, len(scores)):
        if scores[i] > record:
            record = scores[i]
    return record

assert meilleur([3, 9, 4]) == 9
assert meilleur([9, 3, 4]) == 9
assert meilleur([-5, -2, -8]) == -2
print("Tous les tests passent !")`,
      hints:['Premier bug, pour <code>[9, 3, 4]</code> : quels indices la boucle parcourt-elle ? Affiche i à chaque tour. range(1, …) oublie l’indice 0.','Deuxième bug, pour les scores négatifs : record part de 0, et aucun score n’est plus grand que 0. Fais partir record du premier score : <code>record = scores[0]</code>.'],
      check:async (r, code, test) => {
        if (same(code, LES['6-6'].steps[8].code)) return 'Exécute d’abord : le deuxième test échoue. Ajoute des <code>print</code> pour comprendre pourquoi.';
        if (r.err) return /AssertionError/.test(r.err.raw) ? `Un test échoue encore (${esc(r.err.title)}). Continue à chercher.` : ERR;
        if ((strip(code).match(/^\s*assert\s/gm) || []).length < 3) return 'Ne supprime pas les tests : c’est la fonction qu’il faut corriger.';
        if (/\bmax\s*\(/.test(strip(code))) return 'Sans <code>max()</code> : corrige la boucle elle-même.';
        for (const [l, w] of [['[9, 3, 4]', 9], ['[-5, -2, -8]', -2], ['[7]', 7], ['[1, 2, 30]', 30]]) {
          const x = await call(test, code, `meilleur(${l})`);
          if (x.err) return callErr(`meilleur(${l})`, x.err);
          if (num(x.val) !== w) return `<code>meilleur(${l})</code> devrait renvoyer ${w}, et renvoie ${esc(x.val)}.`;
        }
        if (!/tous les tests passent/i.test(r.out)) return 'Garde le message final qui confirme que les tests passent.';
        return true;
      },
      ok:'Deux bugs classiques : un indice oublié et une valeur de départ mal choisie. Et c’est grâce aux tests qu’on savait qu’ils existaient. Pense à cet exemple chaque fois que tu initialises un record.',
      sol:`def meilleur(scores):
    record = scores[0]
    for i in range(1, len(scores)):
        if scores[i] > record:
            record = scores[i]
    return record

assert meilleur([3, 9, 4]) == 9
assert meilleur([9, 3, 4]) == 9
assert meilleur([-5, -2, -8]) == -2
print("Tous les tests passent !")` },
    { t:'say', h:'Tes réflexes de pro',
      p:`<p>Ce chapitre t'a donné les outils des vrais développeurs. Récapitulons les réflexes :</p><ul><li>un dossier par projet, ouvert dans VS Code, et le terminal pour lancer ;</li><li>une erreur ? On lit le traceback de bas en haut, en entier ;</li><li>une entrée utilisateur ? On prévoit les mauvaises réponses avec <code>try</code> ;</li><li>un bug sans erreur ? Des <code>print</code> de débogage, ou le débogueur avec F10 ;</li><li>du code qui marche ? Des <code>assert</code> pour qu'il continue de marcher.</li></ul><p>Au chapitre 7, tu mets tout ça en pratique dans un vrai projet : ton propre jeu d'aventure.</p>` }
  ],
  recap:['La méthode : reproduire, lire l’erreur, faire une hypothèse, vérifier, corriger, retester.','<code>print("DEBUG", variable)</code> dans la boucle ou la fonction suspecte. On les enlève après.','Débogueur de VS Code : point d’arrêt (clic à gauche de la ligne), F5 pour lancer, F10 ligne suivante, F11 entrer dans la fonction.','<code>assert condition</code> : un test automatique qui plante si la condition est fausse.','Expliquer son code à voix haute (même à un canard) aide à trouver les bugs.'] };

Atelier.chapter({ part:"bases", n:6, title:"Coder comme un pro",
  lessons:['6-1','6-2','6-3','6-4','6-5','6-6'].map(id => ({ id, ...LES[id] })) });
})();
