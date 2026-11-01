/* Partie POO · Chapitre 9 : Exceptions, génériques et collections */
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has } = Atelier.h;
const LES = {};
const attr = (r, o, a) => { const m = memOf(r, o); const x = m && m.attrs && m.attrs.find(t => t.name === a); return x ? x.repr : undefined; };
const same = (code, start) => code.trim() === start.trim();
const START = 'Voilà le bug ! Exécute, lis ce qui se passe, puis corrige le code.';
const TESTERR = t => 'Mes tests font planter ton code : ' + esc(t.err.title) + '. Vérifie les noms de tes classes, de tes méthodes et de leurs paramètres.';
const tryPy = (tag, stmt, exc = 'ValueError') => `\ntry:\n    ${stmt}\n    print("#${tag} PASSE")\nexcept ${exc}:\n    print("#${tag} ERREUR")`;

/* ---------- 9.1 ---------- */
const BUG91 = `def lire_degats(texte):
    try:
        return int(texte)
    except:
        pass

for t in ["12", "abc", "7"]:
    d = lire_degats(t)
    print("Dégâts :", d * 2)`;
LES['p9-1'] = { title:'Lever et attraper une exception', dur:'15 min',
  intro:'Tu as déjà vu raise et try. Ici, tu comprends vraiment ce qu’est une exception : un objet qui voyage à travers les appels de fonctions, jusqu’à ce que quelqu’un l’attrape.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur le chapitre d’avant', p:`<p>Que veut dire « préfère la composition à l'héritage » ?</p>`,
      opts:[ {l:'Ne jamais utiliser l’héritage', why:'L’héritage reste utile quand la fille peut vraiment remplacer le parent.'},
             {l:'Quand c’est possible, donner à un objet une partie qui fait le travail, plutôt que d’hériter d’une classe', ok:1},
             {l:'Mettre toutes les classes dans le même fichier', why:'Rien à voir avec l’organisation des fichiers.'},
             {l:'Toujours utiliser des interfaces', why:'Les interfaces sont un autre sujet (chapitre 7).'} ],
      ex:'Un objet qui <strong>a</strong> une partie (composition) et lui délègue le travail est plus souple qu’un objet qui <strong>est</strong> son parent (héritage).' },
    { t:'say', h:'Avant les exceptions : les codes d’erreur',
      p:`<p>En C, une fonction qui échoue renvoie souvent une valeur spéciale (<code>-1</code>, <code>NULL</code>), et l'appelant doit la tester. Trois problèmes : on oublie facilement de tester, et le programme continue dans un état faux ; la gestion des erreurs se mélange au code normal ; et un simple nombre ne dit pas grand-chose de l'erreur.</p><p>Une <strong>exception</strong> (<em>exception</em>) est un <strong>objet</strong> qui décrit une erreur. Elle est <strong>levée</strong> (<em>thrown</em>, <em>raised</em>) là où le problème arrive, et <strong>attrapée</strong> (<em>caught</em>) là où on sait quoi en faire.</p>`,
      snip:`main()  appelle  acheter()  appelle  payer()
   ^                                  │
   │                                  │ raise OrInsuffisant
   └──── attrapée ici ◄── remonte ◄───┘  (personne ne l'attrape dans payer
                                          ni dans acheter : elle remonte)` },
    { t:'say', h:'Une exception remonte les appels', file:'remonte.py',
      p:`<p>Quand une exception est levée, Python <strong>arrête</strong> la fonction en cours et remonte vers celle qui l'a appelée, puis celle d'avant… jusqu'à trouver un <code>try</code> qui l'attrape. Si personne ne l'attrape, le programme s'arrête avec un message d'erreur.</p><p>Regarde : la ligne <code>print("Paiement fait")</code> n'est jamais exécutée.</p>`,
      code:`def payer(po, prix):
    if prix > po:
        raise ValueError(f"il manque {prix - po} pièces")
    return po - prix

def acheter(heros_po, objet, prix):
    reste = payer(heros_po, prix)
    print("Paiement fait")
    return reste

try:
    acheter(30, "épée", 50)
except ValueError as e:
    print("Achat impossible :", e)
print("Le jeu continue.")` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`def c():
    print("c début")
    raise ValueError("oups")
    print("c fin")

def b():
    print("b début")
    c()
    print("b fin")

try:
    b()
except ValueError:
    print("attrapée")`,
      opts:[ {l:'b début, c début, c fin, b fin, attrapée', why:'Après <code>raise</code>, plus rien ne s’exécute dans c, ni dans b.'},
             {l:'b début, c début, attrapée', ok:1},
             {l:'b début, c début, b fin, attrapée', why:'L’exception remonte à travers b sans s’arrêter : <code>b fin</code> n’est jamais affiché.'},
             {l:'Une erreur qui arrête le programme', why:'Le <code>try</code> autour de <code>b()</code> attrape l’exception.'} ],
      ex:'L’exception traverse c, puis b, sans exécuter leur fin, jusqu’au <code>except</code>.' },
    { t:'say', h:'try, except, else', file:'try.py',
      p:`<p>Un <code>try</code> peut avoir plusieurs <code>except</code>, chacun pour un genre d'erreur : on attrape seulement ce qu'on sait gérer. <code>as e</code> donne accès à l'objet exception (son message).</p><p>Le bloc <code>else</code> (facultatif) s'exécute seulement s'il n'y a eu <strong>aucune</strong> erreur.</p>`,
      code:`def partager_butin(texte, joueurs):
    try:
        total = int(texte)
        part = total // joueurs
    except ValueError:
        print(f"« {texte} » n'est pas un nombre")
    except ZeroDivisionError:
        print("Personne avec qui partager !")
    else:
        print(f"Chacun reçoit {part} pièces")

partager_butin("120", 4)
partager_butin("beaucoup", 4)
partager_butin("120", 0)` },
    { t:'compare', h:'Et en Java ? try / catch et throw',
      p:`<p>En Java, on lève une exception avec <code>throw new ...</code> et on l'attrape avec <code>catch</code>. Les exceptions sont des objets, créés avec <code>new</code>, et elles ont des classes, comme en Python.</p>`,
      py:`def payer(po, prix):
    if prix > po:
        raise ValueError("pas assez d'or")
    return po - prix

try:
    reste = payer(30, 50)
except ValueError as e:
    print("Refusé :", e)`,
      java:`static int payer(int po, int prix) {
    if (prix > po) {
        throw new IllegalArgumentException("pas assez d'or");
    }
    return po - prix;
}

try {
    int reste = payer(30, 50);
} catch (IllegalArgumentException e) {
    System.out.println("Refusé : " + e.getMessage());
}`,
      notes:['<code>raise</code> devient <code>throw</code>, et <code>except</code> devient <code>catch</code>.','<code>e.getMessage()</code> donne le message (en Python : <code>str(e)</code>, ou <code>e</code> dans un print).','Quelques équivalents : <code>ValueError</code> ≈ <code>IllegalArgumentException</code>, <code>ZeroDivisionError</code> ≈ <code>ArithmeticException</code>, <code>int("abc")</code> ≈ <code>NumberFormatException</code>.'] },
    { t:'quiz', lang:'java', h:'Quel catch ?', p:`<p>Qu'affiche ce code Java si <code>texte</code> vaut <code>"0"</code> ?</p>`, snip:`try {
    int n = Integer.parseInt(texte);
    System.out.println(100 / n);
} catch (NumberFormatException e) {
    System.out.println("Pas un nombre");
} catch (ArithmeticException e) {
    System.out.println("Division par zéro");
}`,
      opts:[ {l:'Pas un nombre', why:'"0" est un nombre valide : <code>parseInt</code> réussit.'},
             {l:'Division par zéro', ok:1},
             {l:'0', why:'<code>100 / 0</code> est impossible avec des entiers : Java lève une exception.'},
             {l:'Infinity', why:'Ce serait avec des <code>double</code>. Avec des <code>int</code>, c’est une <code>ArithmeticException</code>.'} ],
      ex:'<code>parseInt("0")</code> donne 0, puis <code>100 / 0</code> lève une <code>ArithmeticException</code>, attrapée par le deuxième <code>catch</code>.' },
    { t:'code', bug:1, h:'L’erreur avalée', file:'bug.py',
      p:`<p>Ce code plante… mais pas là où est le vrai problème. Le <code>except: pass</code> avale l'erreur sans rien dire, la fonction renvoie <code>None</code>, et ça explose plus loin. Corrige <code>lire_degats</code> : n'attrape que <code>ValueError</code>, et dans ce cas renvoie <code>0</code>.</p>`,
      code: BUG91,
      sol: BUG91.replace('    except:\n        pass', '    except ValueError:\n        return 0'),
      hints:['<code>except:</code> tout seul attrape <strong>toutes</strong> les erreurs, même celles qu’on ne prévoyait pas. Précise laquelle.','<code>except ValueError:</code> puis <code>return 0</code>.'],
      check:async (r, code, test) => {
        if (same(code, BUG91)) return START;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        if (/except\s*:/.test(code)) return 'N’utilise plus <code>except:</code> tout seul : précise <code>except ValueError:</code>.';
        if (!/except\s+ValueError/.test(code)) return 'Attrape précisément <code>ValueError</code>.';
        const l = linesOf(r.out);
        if (l.join('|') !== 'Dégâts : 24|Dégâts : 0|Dégâts : 14') return 'J’attends <code>Dégâts : 24</code>, <code>Dégâts : 0</code>, <code>Dégâts : 14</code>.';
        return true;
      },
      ok:'Deux bonnes pratiques : attraper des exceptions <strong>précises</strong>, et ne jamais en avaler une en silence. Un <code>except: pass</code>, c’est un bug caché qui attend son heure.' },
    { t:'code', h:'À toi : lever au bon moment', file:'lever.py', mem:1,
      p:`<p>Écris une classe <code>Heros</code> avec <code>pv</code> (100 au départ) et une méthode <code>boire(potion)</code> où <code>potion</code> est un nombre de PV :</p><ul><li>si ce n'est pas un <code>int</code>, lève <code>TypeError</code> ;</li><li>si c'est négatif ou nul, lève <code>ValueError</code> avec un message qui contient la valeur reçue ;</li><li>sinon, ajoute-le aux PV.</li></ul><p>Puis, dans un <code>try</code>, fais boire <code>-5</code> à <code>sam</code>, et affiche le message de l'erreur.</p>`,
      code:``,
      sol:`class Heros:
    def __init__(self):
        self.pv = 100

    def boire(self, potion):
        if not isinstance(potion, int):
            raise TypeError("une potion est un nombre entier")
        if potion <= 0:
            raise ValueError(f"potion invalide : {potion}")
        self.pv += potion

sam = Heros()
try:
    sam.boire(-5)
except ValueError as e:
    print(e)`,
      hints:['Deux vérifications au début de <code>boire</code> : <code>if not isinstance(potion, int): raise TypeError(...)</code>, puis <code>if potion &lt;= 0: raise ValueError(f"... {potion}")</code>.','En bas : <code>try:</code> → <code>sam.boire(-5)</code>, <code>except ValueError as e:</code> → <code>print(e)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/-5/.test(r.out)) return 'Le message affiché doit contenir la valeur reçue (-5).';
        const t = await test([], code + '\n_h = Heros()\n_h.boire(20)\nprint("#V", _h.pv)' + tryPy('A', '_h.boire(0)') + tryPy('B', '_h.boire("beaucoup")', 'TypeError') + tryPy('C', '_h.boire(2.5)', 'TypeError') + '\nprint("#P", _h.pv)');
        if (t.err) return TESTERR(t);
        if (!/#V 120/.test(t.out)) return 'Boire une potion de 20 doit ajouter 20 PV.';
        if (!/#A ERREUR/.test(t.out)) return 'Une potion de 0 doit lever <code>ValueError</code>.';
        if (!/#B ERREUR/.test(t.out) || !/#C ERREUR/.test(t.out)) return 'Un texte ou un nombre à virgule doit lever <code>TypeError</code>.';
        if (!/#P 120/.test(t.out)) return 'Une potion refusée ne doit pas changer les PV.';
        return true;
      },
      ok:'Échouer vite, avec un message clair qui dit ce qu’on a reçu (<em>fail fast</em>) : c’est comme ça qu’on écrit du code facile à déboguer.' },
    { t:'say', h:'Demander la permission ou le pardon ?', file:'eafp.py',
      p:`<p>Deux styles pour gérer un cas qui peut échouer :</p><ul><li><strong>LBYL</strong> (<em>Look Before You Leap</em>, « regarde avant de sauter ») : on vérifie d'abord avec un <code>if</code>.</li><li><strong>EAFP</strong> (<em>Easier to Ask Forgiveness than Permission</em>, « plus facile de demander pardon que la permission ») : on essaie, et on attrape l'erreur.</li></ul><p>Python préfère souvent l'EAFP. Mais attention : les exceptions sont pour les situations <strong>exceptionnelles</strong>, pas pour le déroulement normal du programme.</p>`,
      code:`prix = {"épée": 40, "arc": 70}

# LBYL : on vérifie avant
if "bouclier" in prix:
    p = prix["bouclier"]
else:
    p = 0

# EAFP : on essaie, et on gère l'échec
try:
    p = prix["bouclier"]
except KeyError:
    p = 0

print(p)` },
    { t:'code', defi:1, h:'Le parseur de commandes', file:'commandes.py',
      p:`<p>Le joueur tape des commandes comme <code>"attaque 12"</code>. Écris une fonction <code>lire(commande)</code> qui renvoie un tuple <code>(action, nombre)</code>, par exemple <code>("attaque", 12)</code>. Elle doit lever :</p><ul><li><code>ValueError</code> s'il n'y a pas exactement deux mots ;</li><li><code>ValueError</code> si le deuxième mot n'est pas un nombre (laisse <code>int()</code> lever l'erreur) ;</li><li><code>KeyError</code> si l'action n'est pas <code>attaque</code>, <code>soin</code> ou <code>fuite</code>.</li></ul><p>Puis, pour chaque commande de la liste, affiche le résultat ou <code>Erreur : ...</code> avec le nom de l'exception (<code>type(e).__name__</code>).</p>`,
      code:`commandes = ["attaque 12", "soin dix", "danse 3", "fuite 1", "attaque"]
`,
      sol:`def lire(commande):
    mots = commande.split()
    if len(mots) != 2:
        raise ValueError("il faut deux mots")
    action = mots[0]
    nombre = int(mots[1])
    if action not in ["attaque", "soin", "fuite"]:
        raise KeyError(action)
    return (action, nombre)

commandes = ["attaque 12", "soin dix", "danse 3", "fuite 1", "attaque"]
for c in commandes:
    try:
        print(lire(c))
    except (ValueError, KeyError) as e:
        print("Erreur :", type(e).__name__)`,
      hints:['<code>mots = commande.split()</code>, puis vérifie <code>len(mots)</code>. <code>int(mots[1])</code> lèvera tout seul une <code>ValueError</code> si ce n’est pas un nombre.','Pour attraper deux genres d’erreurs dans un même except : <code>except (ValueError, KeyError) as e:</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + '\nprint("#T", lire("soin 5"), lire("fuite  0"))' + tryPy('A', 'lire("a b c")') + tryPy('B', 'lire("attaque x")') + tryPy('C', 'lire("vole 3")', 'KeyError'));
        if (t.err) return TESTERR(t);
        if (!/#T \('soin', 5\) \('fuite', 0\)/.test(t.out)) return '<code>lire("soin 5")</code> doit renvoyer le tuple <code>(\'soin\', 5)</code>, avec un vrai nombre.';
        if (!/#A ERREUR/.test(t.out)) return 'Trois mots : <code>ValueError</code>.';
        if (!/#B ERREUR/.test(t.out)) return 'Un deuxième mot qui n’est pas un nombre : <code>ValueError</code>.';
        if (!/#C ERREUR/.test(t.out)) return 'Une action inconnue : <code>KeyError</code>.';
        const l = linesOf(r.out);
        if (l.join('|') !== "('attaque', 12)|Erreur : ValueError|Erreur : KeyError|('fuite', 1)|Erreur : ValueError") return 'Pour la liste, j’attends : <code>(\'attaque\', 12)</code>, <code>Erreur : ValueError</code>, <code>Erreur : KeyError</code>, <code>(\'fuite\', 1)</code>, <code>Erreur : ValueError</code>.';
        return true;
      },
      ok:'La fonction lève, la boucle attrape. Chacun son rôle : celui qui détecte le problème ne sait pas forcément quoi en faire.' }
  ],
  recap:['Une <strong>exception</strong> est un objet qui décrit une erreur. <code>raise</code> (Python) / <code>throw new</code> (Java) la lève.','Elle remonte les appels jusqu’à un <code>try</code> qui l’attrape (<code>except</code> / <code>catch</code>). Sinon, le programme s’arrête.','Attrape des exceptions <strong>précises</strong>. Jamais de <code>except: pass</code> qui avale tout en silence.','<code>else</code> : seulement s’il n’y a pas eu d’erreur. <code>except (A, B) as e</code> : deux genres à la fois.','Échoue vite, avec un message qui contient la valeur reçue.'] };

/* ---------- 9.2 ---------- */
const BUG92 = `class ErreurMagie(Exception):
    pass

class ManaInsuffisant(ErreurMagie):
    def __init__(self, manque):
        self.manque = manque

def lancer(mana, cout):
    if cout > mana:
        raise ManaInsuffisant(cout - mana)
    return mana - cout

try:
    lancer(5, 12)
except ErreurMagie as e:
    print("Sort raté :", e, "/ il manque", e.manque)`;
LES['p9-2'] = { title:'Créer ses propres exceptions', dur:'15 min',
  intro:'ValueError, c’est vague. Une exception OrInsuffisant, qui dit combien il manque, c’est bien plus utile. Les exceptions sont des classes : tu peux créer les tiennes, avec l’héritage.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Pourquoi <code>except: pass</code> est-il une mauvaise idée ?</p>`,
      opts:[ {l:'Parce que c’est interdit en Python', why:'Python l’accepte… et c’est bien le problème.'},
             {l:'Parce qu’il cache toutes les erreurs, même celles qu’on n’a pas prévues', ok:1},
             {l:'Parce qu’il ralentit le programme', why:'La vitesse n’est pas le souci : c’est que les bugs deviennent invisibles.'},
             {l:'Parce qu’il faut toujours un else', why:'Le <code>else</code> est facultatif.'} ],
      ex:'Il avale tout, y compris de vrais bugs, et le programme continue dans un état faux. Le plantage arrive plus tard, loin de la vraie cause.' },
    { t:'say', h:'Une exception, c’est une classe', file:'perso.py',
      p:`<p>Pour créer ta propre exception, écris une classe qui hérite de <code>Exception</code> (ou d'une de ses filles). Une bonne pratique : une exception de base pour tout ton module (<code>ErreurJeu</code>), puis des exceptions plus précises qui en héritent.</p><p>On peut lui ajouter des attributs utiles. N'oublie pas d'appeler <code>super().__init__(message)</code> pour que le message s'affiche.</p>`,
      code:`class ErreurJeu(Exception):
    """Classe de base pour toutes les erreurs du jeu."""

class OrInsuffisant(ErreurJeu):
    def __init__(self, manque):
        super().__init__(f"il manque {manque} pièces d'or")
        self.manque = manque

class InventairePlein(ErreurJeu):
    pass

def acheter(po, prix, places):
    if places == 0:
        raise InventairePlein("plus de place dans le sac")
    if prix > po:
        raise OrInsuffisant(prix - po)
    return po - prix

for po, prix, places in [(50, 30, 2), (10, 25, 2), (99, 1, 0)]:
    try:
        print("Reste :", acheter(po, prix, places))
    except OrInsuffisant as e:
        print("Refusé :", e, "→ va gagner", e.manque, "pièces")
    except ErreurJeu as e:
        print("Refusé :", e)` },
    { t:'say', h:'La hiérarchie des exceptions',
      p:`<p>Les exceptions forment une famille, avec l'héritage. Un <code>except</code> attrape l'exception demandée <strong>et toutes ses filles</strong>.</p>`,
      snip:`Python                                   Java
BaseException                            Throwable
 ├── SystemExit, KeyboardInterrupt        ├── Error         (graves : mémoire...)
 └── Exception                            └── Exception
      ├── ValueError                           ├── IOException    (vérifiée)
      ├── TypeError                            └── RuntimeException
      ├── ZeroDivisionError                         ├── IllegalArgumentException
      ├── LookupError                               ├── NullPointerException
      │    ├── KeyError                             └── ArithmeticException
      │    └── IndexError
      └── ErreurJeu   (la tienne)
           ├── OrInsuffisant
           └── InventairePlein`,
      p2:`<p>Attention à l'ordre des <code>except</code> : Python prend le <strong>premier</strong> qui correspond. Mets donc les exceptions précises avant les générales.</p>` },
    { t:'quiz', h:'Lequel attrape ?', p:`<p>Avec les classes ci-dessus, qu'affiche ce code ?</p>`, snip:`try:
    raise OrInsuffisant(5)
except ErreurJeu:
    print("A")
except OrInsuffisant:
    print("B")`,
      opts:[ {l:'A', ok:1},
             {l:'B', why:'Python prend le premier <code>except</code> qui correspond, et OrInsuffisant est une ErreurJeu.'},
             {l:'A puis B', why:'Un seul <code>except</code> s’exécute.'},
             {l:'Une erreur', why:'L’exception est bien attrapée, par le premier bloc.'} ],
      ex:'Une OrInsuffisant <strong>est une</strong> ErreurJeu : le premier bloc l’attrape. Le second ne sera jamais utilisé. Il fallait les mettre dans l’autre ordre.' },
    { t:'code', bug:1, h:'Le message disparu', file:'bug.py',
      p:`<p>Ce code ne plante pas, mais le message de l'erreur est vide : on lit <code>Sort raté :  / il manque 7</code>. Répare <code>ManaInsuffisant</code> pour que le message soit <code>il manque 7 de mana</code>.</p>`,
      code: BUG92,
      sol: BUG92.replace('    def __init__(self, manque):\n        self.manque = manque', '    def __init__(self, manque):\n        super().__init__(f"il manque {manque} de mana")\n        self.manque = manque'),
      hints:['Le constructeur de ManaInsuffisant ne transmet aucun message au constructeur de Exception.','Ajoute <code>super().__init__(f"il manque {manque} de mana")</code> au début du constructeur.'],
      check:async (r, code, test) => {
        if (same(code, BUG92)) return START;
        if (r.err) return ERR;
        if (!/Sort raté : il manque 7 de mana \/ il manque 7/.test(r.out)) return 'J’attends <code>Sort raté : il manque 7 de mana / il manque 7</code>.';
        return true;
      },
      ok:'Une exception est une classe comme les autres : son constructeur doit appeler celui du parent. Tu reconnais le piège du chapitre 5 !' },
    { t:'compare', h:'Et en Java ? Vérifiées ou non',
      p:`<p>Java distingue deux sortes d'exceptions :</p><ul><li>les exceptions <strong>vérifiées</strong> (<em>checked</em>) : elles héritent de <code>Exception</code> (mais pas de <code>RuntimeException</code>). Le compilateur <strong>oblige</strong> à les attraper, ou à les déclarer avec <code>throws</code>. Elles décrivent des situations prévisibles (fichier absent, réseau coupé).</li><li>les exceptions <strong>non vérifiées</strong> (<em>unchecked</em>) : elles héritent de <code>RuntimeException</code>. Aucune obligation. Elles décrivent plutôt des bugs.</li></ul><p>Python n'a que des exceptions non vérifiées.</p>`,
      py:`class OrInsuffisant(ErreurJeu):
    def __init__(self, manque):
        super().__init__(f"il manque {manque} po")
        self.manque = manque

def payer(po, prix):
    if prix > po:
        raise OrInsuffisant(prix - po)
    return po - prix`,
      java:`public class OrInsuffisantException extends Exception {
    private final int manque;

    public OrInsuffisantException(int manque) {
        super("il manque " + manque + " po");
        this.manque = manque;
    }

    public int getManque() { return manque; }
}

// vérifiée : il FAUT écrire throws
static int payer(int po, int prix) throws OrInsuffisantException {
    if (prix > po) throw new OrInsuffisantException(prix - po);
    return po - prix;
}`,
      notes:['<code>throws OrInsuffisantException</code> prévient l’appelant : « cette méthode peut lever ça ». Sans lui, erreur de compilation.','Celui qui appelle <code>payer</code> doit l’entourer d’un <code>try/catch</code>, ou écrire lui aussi <code>throws</code>.','Si on étendait <code>RuntimeException</code>, le <code>throws</code> ne serait plus obligatoire.'] },
    { t:'quiz', lang:'java', h:'Ça compile ?', p:`<p><code>OrInsuffisantException</code> étend <code>Exception</code>. Ce code compile-t-il ?</p>`, snip:`static void acheter(int po) {
    int reste = payer(po, 50);   // payer(...) throws OrInsuffisantException
    System.out.println(reste);
}`,
      opts:[ {l:'Oui', why:'L’exception est vérifiée : il faut la gérer ou la déclarer.'},
             {l:'Non : il faut un try/catch autour, ou throws dans la signature de acheter', ok:1},
             {l:'Non : payer ne peut pas lever d’exception', why:'Elle le peut : sa signature le déclare avec <code>throws</code>.'},
             {l:'Oui, mais ça plantera toujours', why:'Le compilateur refuse avant même l’exécution.'} ],
      ex:'Une exception vérifiée doit être attrapée (<code>try/catch</code>) ou déclarée (<code>throws</code>). C’est le compilateur qui y veille.' },
    { t:'fill', lang:'java', h:'Ta propre exception Java',
      p:`<p>Complète cette exception Java <strong>non vérifiée</strong>, et la méthode qui la lève.</p>`,
      tpl:`public class SacPleinException [[extends]] [[RuntimeException]] {
    public SacPleinException(String message) {
        [[super]](message);
    }
}

public void ajouter(Objet o) {
    if (objets.size() >= 10) {
        [[throw]] [[new]] SacPleinException("le sac est plein");
    }
    objets.add(o);
}`,
      hints:['Une exception non vérifiée hérite de la classe des exceptions « d’exécution ». Le message passe au constructeur parent.','<code>extends</code>, <code>RuntimeException</code>, <code>super</code>, <code>throw</code>, <code>new</code>.'],
      ok:'Comme elle étend <code>RuntimeException</code>, pas besoin de <code>throws</code> dans la signature de <code>ajouter</code>.' },
    { t:'code', h:'À toi : les erreurs de la forge', file:'forge.py',
      p:`<p>Crée une exception de base <code>ErreurForge(Exception)</code>, et deux filles :</p><ul><li><code>MetalInconnu</code> : son constructeur reçoit le nom du métal, et le message est <code>métal inconnu : mithril</code> ;</li><li><code>PasAssezDeMetal</code> : son constructeur reçoit <code>manque</code> (garde-le en attribut), et le message est <code>il manque 3 lingots</code>.</li></ul><p>Puis écris <code>forger(metal, lingots)</code> : les métaux connus sont <code>"fer"</code> (3 lingots) et <code>"acier"</code> (5 lingots). Elle lève la bonne exception, ou renvoie <code>Épée de fer forgée</code>.</p>`,
      code:``,
      sol:`class ErreurForge(Exception):
    pass

class MetalInconnu(ErreurForge):
    def __init__(self, metal):
        super().__init__(f"métal inconnu : {metal}")

class PasAssezDeMetal(ErreurForge):
    def __init__(self, manque):
        super().__init__(f"il manque {manque} lingots")
        self.manque = manque

def forger(metal, lingots):
    besoins = {"fer": 3, "acier": 5}
    if metal not in besoins:
        raise MetalInconnu(metal)
    if lingots < besoins[metal]:
        raise PasAssezDeMetal(besoins[metal] - lingots)
    return f"Épée de {metal} forgée"

try:
    print(forger("acier", 2))
except ErreurForge as e:
    print("Échec :", e)`,
      hints:['Chaque exception fille appelle <code>super().__init__(message)</code>. PasAssezDeMetal garde aussi <code>self.manque</code>.','Dans <code>forger</code>, un dictionnaire <code>{"fer": 3, "acier": 5}</code> aide : si le métal n’y est pas, <code>raise MetalInconnu(metal)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
print("#A", forger("fer", 3), "|", forger("fer", 9))
try:
    forger("mithril", 9)
except ErreurForge as e:
    print("#B", type(e).__name__, e)
try:
    forger("acier", 1)
except ErreurForge as e:
    print("#C", type(e).__name__, e, e.manque)
print("#D", issubclass(MetalInconnu, ErreurForge), issubclass(PasAssezDeMetal, ErreurForge), issubclass(ErreurForge, Exception))`);
        if (t.err) return TESTERR(t);
        if (!/#A Épée de fer forgée \| Épée de fer forgée/.test(t.out)) return 'Avec assez de lingots, <code>forger("fer", ...)</code> renvoie <code>Épée de fer forgée</code>.';
        if (!/#B MetalInconnu métal inconnu : mithril/.test(t.out)) return 'Pour le mithril : <code>MetalInconnu</code>, avec le message <code>métal inconnu : mithril</code>.';
        if (!/#C PasAssezDeMetal il manque 4 lingots 4/.test(t.out)) return 'Acier avec 1 lingot : <code>PasAssezDeMetal</code>, message <code>il manque 4 lingots</code>, et l’attribut <code>manque</code> à 4.';
        if (!/#D True True True/.test(t.out)) return 'Vérifie la hiérarchie : les deux filles héritent de ErreurForge, qui hérite de Exception.';
        return true;
      },
      ok:'Le code qui appelle <code>forger</code> peut attraper toutes les erreurs de forge d’un coup, ou seulement <code>PasAssezDeMetal</code> pour lire <code>e.manque</code>.' },
    { t:'say', h:'Envelopper une erreur',
      p:`<p>Quand une erreur technique arrive au fond du programme (une clé absente, un fichier illisible), on la remplace souvent par une exception qui a du sens pour le reste du jeu, en gardant la cause d'origine. En Python : <code>raise ... from e</code>. En Java : on passe la cause au constructeur.</p>`,
      snip:`# Python
try:
    prix = catalogue[nom]
except KeyError as e:
    raise ObjetInconnu(nom) from e     # la cause est gardée dans __cause__

// Java
try {
    sauvegarder(partie);
} catch (IOException e) {
    throw new ErreurSauvegarde("partie non sauvée", e);   // e = la cause
}`,
      p2:`<p>Le message d'erreur final montre alors les deux exceptions : la nouvelle, et sa cause. Très utile pour déboguer.</p>` },
    { t:'code', defi:1, h:'Attraper au bon niveau', file:'niveau.py',
      p:`<p>Écris une fonction <code>tenter_achats(achats, po)</code> qui reçoit une liste de prix et un nombre de pièces. Pour chaque prix, elle appelle <code>payer(po, prix)</code> (déjà écrite) :</p><ul><li>si ça marche, <code>po</code> diminue ;</li><li>si <code>OrInsuffisant</code> est levée, elle note le manque et passe à l'achat suivant.</li></ul><p>Elle renvoie un tuple : <code>(po restantes, total des manques)</code>. Les autres erreurs (prix négatif) ne doivent <strong>pas</strong> être attrapées par ta fonction.</p>`,
      code:`class ErreurJeu(Exception):
    pass

class OrInsuffisant(ErreurJeu):
    def __init__(self, manque):
        super().__init__(f"il manque {manque} po")
        self.manque = manque

def payer(po, prix):
    if prix < 0:
        raise ValueError("prix négatif")
    if prix > po:
        raise OrInsuffisant(prix - po)
    return po - prix
`,
      sol:`class ErreurJeu(Exception):
    pass

class OrInsuffisant(ErreurJeu):
    def __init__(self, manque):
        super().__init__(f"il manque {manque} po")
        self.manque = manque

def payer(po, prix):
    if prix < 0:
        raise ValueError("prix négatif")
    if prix > po:
        raise OrInsuffisant(prix - po)
    return po - prix

def tenter_achats(achats, po):
    manques = 0
    for prix in achats:
        try:
            po = payer(po, prix)
        except OrInsuffisant as e:
            manques += e.manque
    return (po, manques)

print(tenter_achats([30, 50, 10], 60))`,
      hints:['Dans la boucle : <code>try: po = payer(po, prix)</code>, puis <code>except OrInsuffisant as e: manques += e.manque</code>.','N’attrape que <code>OrInsuffisant</code> : une <code>ValueError</code> doit traverser ta fonction.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + '\nprint("#T", tenter_achats([30, 50, 10], 60), tenter_achats([], 5), tenter_achats([9, 9], 10))' + tryPy('A', 'tenter_achats([5, -1], 10)'));
        if (t.err) return TESTERR(t);
        if (!/#T \(20, 20\) \(5, 0\) \(1, 8\)/.test(t.out)) return 'J’attends <code>(20, 20)</code> pour [30, 50, 10] avec 60 po, <code>(5, 0)</code> pour une liste vide, et <code>(1, 8)</code> pour [9, 9] avec 10 po.';
        if (!/#A ERREUR/.test(t.out)) return 'Un prix négatif lève une <code>ValueError</code> : ta fonction ne doit pas l’attraper (elle doit remonter).';
        return true;
      },
      ok:'Tu attrapes seulement ce que tu sais gérer, et tu laisses remonter le reste. C’est exactement la bonne attitude avec les exceptions.' }
  ],
  recap:['Une exception perso est une classe : <code>class OrInsuffisant(ErreurJeu)</code>, avec <code>super().__init__(message)</code> et des attributs utiles.','Une exception de base par module (<code>ErreurJeu</code>) permet d’attraper toutes ses filles d’un coup.','Ordre des <code>except</code> : du plus précis au plus général.','Java : <strong>vérifiée</strong> (<em>checked</em>, étend <code>Exception</code>) → <code>try/catch</code> ou <code>throws</code> obligatoire. <strong>Non vérifiée</strong> (étend <code>RuntimeException</code>) → pas d’obligation. Python : tout est non vérifié.'] };

/* ---------- 9.3 ---------- */
const PORTE = `class Porte:
    ouvertes = 0

    def ouvrir(self):
        Porte.ouvertes += 1

    def fermer(self):
        Porte.ouvertes -= 1
`;
const BUG93 = PORTE + `
def traverser(porte, piege):
    porte.ouvrir()
    if piege:
        raise ValueError("un piège se déclenche !")
    porte.fermer()

for piege in [False, True, False]:
    try:
        traverser(Porte(), piege)
    except ValueError as e:
        print("Aïe :", e)
print("Portes restées ouvertes :", Porte.ouvertes)`;
LES['p9-3'] = { title:'finally et le nettoyage', dur:'12 min',
  intro:'Certaines choses doivent arriver quoi qu’il se passe : refermer une porte, rendre une ressource, enregistrer la partie. C’est le rôle de finally.',
  steps:[
    { t:'quiz', rev:1, lang:'java', h:'Une question sur la leçon d’avant', p:`<p>En Java, une exception qui étend <code>RuntimeException</code> est…</p>`,
      opts:[ {l:'vérifiée : il faut la déclarer avec throws', why:'C’est le cas des exceptions qui étendent <code>Exception</code> sans passer par <code>RuntimeException</code>.'},
             {l:'non vérifiée : aucune obligation de la déclarer', ok:1},
             {l:'interdite', why:'C’est même très courant : <code>IllegalArgumentException</code> en est une.'},
             {l:'une erreur grave de la JVM', why:'Ça, ce sont les <code>Error</code>.'} ],
      ex:'<code>RuntimeException</code> et ses filles sont non vérifiées : le compilateur n’oblige à rien.' },
    { t:'say', h:'finally s’exécute toujours', file:'finally.py',
      p:`<p>Le bloc <code>finally</code> s'exécute <strong>toujours</strong> à la fin d'un <code>try</code> : qu'il y ait eu une erreur ou non, qu'elle ait été attrapée ou non, et même si le <code>try</code> fait un <code>return</code>.</p><p>On l'utilise pour le <strong>nettoyage</strong> : refermer, libérer, remettre en état.</p>`,
      code:`def explorer(salle):
    print("On allume la torche")
    try:
        if salle == "piège":
            raise ValueError("des flèches jaillissent !")
        return "trésor trouvé"
    finally:
        print("On éteint la torche")

print(explorer("trésor"))
try:
    explorer("piège")
except ValueError as e:
    print("Fuite :", e)` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`def f():
    try:
        print("A")
        return "B"
    finally:
        print("C")

print(f())`,
      opts:[ {l:'A, B', why:'Le <code>finally</code> s’exécute même quand le <code>try</code> fait un <code>return</code>.'},
             {l:'A, C, B', ok:1},
             {l:'A, B, C', why:'Le <code>finally</code> s’exécute avant que la fonction rende vraiment la main : C s’affiche avant que <code>print(f())</code> affiche B.'},
             {l:'C, A, B', why:'Le <code>try</code> commence d’abord : A est affiché en premier.'} ],
      ex:'A, puis le <code>return "B"</code> est préparé, puis le <code>finally</code> affiche C, et enfin <code>print</code> affiche B.' },
    { t:'say', h:'try, except, else, finally : l’ordre complet', file:'complet.py',
      p:`<p>Les quatre blocs peuvent être utilisés ensemble. Exécute et suis l'ordre des messages dans les deux cas.</p>`,
      code:`def ouvrir_coffre(code):
    print("-- Tentative avec", code)
    try:
        n = int(code)
    except ValueError:
        print("except : le code n'est pas un nombre")
    else:
        print("else : le coffre s'ouvre, code", n)
    finally:
        print("finally : on range les outils")

ouvrir_coffre("1234")
ouvrir_coffre("abcd")` },
    { t:'code', bug:1, h:'Les portes restées ouvertes', file:'bug.py',
      p:`<p>Chaque porte qu'on ouvre doit être refermée, même si un piège se déclenche. Pourtant, à la fin, une porte est restée ouverte. Répare <code>traverser</code> avec un <code>try</code> / <code>finally</code>.</p>`,
      code: BUG93,
      sol: BUG93.replace(`    porte.ouvrir()
    if piege:
        raise ValueError("un piège se déclenche !")
    porte.fermer()`, `    porte.ouvrir()
    try:
        if piege:
            raise ValueError("un piège se déclenche !")
    finally:
        porte.fermer()`),
      hints:['Quand le piège lève l’exception, la ligne <code>porte.fermer()</code> n’est jamais atteinte.','Après <code>porte.ouvrir()</code> : un <code>try:</code> qui contient le <code>if</code>, puis <code>finally:</code> → <code>porte.fermer()</code>.'],
      check:async (r, code, test) => {
        if (same(code, BUG93)) return START;
        if (r.err) return ERR;
        if (!/finally/.test(code)) return 'Utilise un bloc <code>finally</code>.';
        if (!/Portes restées ouvertes : 0/.test(r.out)) return 'À la fin, aucune porte ne doit rester ouverte.';
        if (!/Aïe : un piège se déclenche/.test(r.out)) return 'Le piège doit toujours être signalé : le <code>finally</code> nettoie, mais il ne doit pas cacher l’erreur.';
        return true;
      },
      ok:'Le <code>finally</code> referme la porte, puis l’exception continue sa route jusqu’au <code>except</code>. Nettoyer sans cacher l’erreur.' },
    { t:'compare', h:'Et en Java ? finally et try-with-resources',
      p:`<p>Java a aussi <code>finally</code>. Et pour les ressources (fichiers, connexions), le <code>try</code> avec ressources les ferme tout seul, comme le <code>with</code> de Python (chapitre 4). Il marche avec toute classe qui implémente l'interface <code>AutoCloseable</code>.</p>`,
      py:`porte.ouvrir()
try:
    traverser()
finally:
    porte.fermer()

# encore mieux, si Porte a __enter__/__exit__ :
with Porte() as p:
    traverser()`,
      java:`porte.ouvrir();
try {
    traverser();
} finally {
    porte.fermer();
}

// si Porte implements AutoCloseable :
try (Porte p = new Porte()) {
    traverser();
}   // p.close() appelé automatiquement`,
      notes:['<code>finally</code> marche pareil dans les deux langages.','<code>with</code> (Python) et <code>try (...)</code> (Java) sont des <code>finally</code> tout faits, pour les objets qui savent se fermer.','Préfère-les dès que possible : impossible d’oublier de fermer.'] },
    { t:'code', h:'À toi : la sauvegarde garantie', file:'sauvegarde.py',
      p:`<p>Écris une fonction <code>jouer_tour(actions)</code> qui reçoit une liste de nombres (des dégâts). Pour chaque nombre, elle l'ajoute à une variable <code>total</code>. Si un nombre est négatif, elle lève <code>ValueError</code>. Dans <strong>tous les cas</strong>, elle doit afficher <code>Partie sauvegardée</code> à la fin, avant de rendre la main.</p><p>Elle renvoie le total. Teste avec <code>[5, 7]</code>, puis <code>[5, -1, 7]</code> dans un <code>try</code>.</p>`,
      code:``,
      sol:`def jouer_tour(actions):
    total = 0
    try:
        for a in actions:
            if a < 0:
                raise ValueError("dégâts négatifs")
            total += a
        return total
    finally:
        print("Partie sauvegardée")

print(jouer_tour([5, 7]))
try:
    jouer_tour([5, -1, 7])
except ValueError as e:
    print("Erreur :", e)`,
      hints:['Mets la boucle et le <code>return total</code> dans un <code>try:</code>, et <code>print("Partie sauvegardée")</code> dans le <code>finally:</code>.','En bas, deux appels : <code>print(jouer_tour([5, 7]))</code>, puis un <code>try</code> / <code>except ValueError</code> autour de <code>jouer_tour([5, -1, 7])</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/finally/.test(code)) return 'Utilise <code>finally</code> pour la sauvegarde.';
        const fn = (code.match(/def\s+jouer_tour[\s\S]*?(?=\n\S|$)/) || [''])[0];
        if (!fn) return 'Il faut une fonction <code>jouer_tour(actions)</code>.';
        const t = await test([], fn + `
print("#A", jouer_tour([1, 2, 3]))
try:
    jouer_tour([4, -2])
    print("#B PASSE")
except ValueError:
    print("#B ERREUR")`);
        if (t.err) return TESTERR(t);
        const l = linesOf(t.out);
        if (l.join('|') !== 'Partie sauvegardée|#A 6|Partie sauvegardée|#B ERREUR') return 'J’attends : la sauvegarde puis le total quand tout va bien, et la sauvegarde puis l’erreur (qui remonte) quand un nombre est négatif.';
        return true;
      },
      ok:'La sauvegarde a lieu dans les deux cas, et l’erreur continue quand même jusqu’à celui qui sait la gérer.' },
    { t:'code', defi:1, h:'Le donjon qui compte ses torches', file:'torches.py',
      p:`<p>Écris une classe <code>Torche</code> utilisable avec <code>with</code> : un attribut de classe <code>allumees</code> (0 au départ), <code>__enter__</code> l'augmente et renvoie la torche, <code>__exit__</code> le diminue et renvoie <code>False</code> (pour ne pas cacher les erreurs).</p><p>Puis une fonction <code>explorer(salles)</code> : pour chaque salle, elle entre avec <code>with Torche():</code>, et si la salle vaut <code>"lave"</code>, elle lève <code>ValueError</code>. À la fin, <code>Torche.allumees</code> doit toujours revenir à 0.</p>`,
      code:``,
      sol:`class Torche:
    allumees = 0

    def __enter__(self):
        Torche.allumees += 1
        return self

    def __exit__(self, type_err, err, trace):
        Torche.allumees -= 1
        return False

def explorer(salles):
    for s in salles:
        with Torche():
            if s == "lave":
                raise ValueError("de la lave !")

try:
    explorer(["grotte", "lave", "crypte"])
except ValueError as e:
    print(e)
print(Torche.allumees)`,
      hints:['<code>__enter__</code> : <code>Torche.allumees += 1</code> et <code>return self</code>. <code>__exit__(self, type_err, err, trace)</code> : <code>Torche.allumees -= 1</code> et <code>return False</code>.','<code>explorer</code> : <code>for s in salles:</code> → <code>with Torche():</code> → <code>if s == "lave": raise ValueError(...)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/with\s+Torche\s*\(\s*\)/.test(code)) return 'Utilise <code>with Torche():</code> dans <code>explorer</code>.';
        const t = await test([], code + `
_n = Torche.allumees
explorer(["a", "b"])
print("#A", Torche.allumees - _n)
try:
    explorer(["a", "lave", "b"])
    print("#B PASSE")
except ValueError:
    print("#B ERREUR", Torche.allumees - _n)
with Torche() as _t:
    print("#C", type(_t).__name__, Torche.allumees - _n)`);
        if (t.err) return TESTERR(t);
        if (!/#A 0/.test(t.out)) return 'Après une exploration sans danger, plus aucune torche ne doit être allumée.';
        if (!/#B ERREUR 0/.test(t.out)) return 'Dans la lave, l’erreur doit remonter (<code>__exit__</code> renvoie False), et la torche doit quand même s’éteindre.';
        if (!/#C Torche 1/.test(t.out)) return '<code>__enter__</code> doit renvoyer la torche elle-même, et compter une torche allumée.';
        return true;
      },
      ok:'<code>with</code> = un <code>try/finally</code> rangé dans une classe. Plus besoin d’y penser à chaque fois.' }
  ],
  recap:['<code>finally</code> s’exécute <strong>toujours</strong> : erreur ou pas, attrapée ou pas, même après un <code>return</code>.','Ordre : <code>try</code>, puis <code>except</code> (si erreur) ou <code>else</code> (sinon), puis <code>finally</code>.','<code>finally</code> nettoie, mais ne cache pas l’erreur : elle continue de remonter si personne ne l’a attrapée.','<code>with</code> (Python, <code>__enter__</code>/<code>__exit__</code>) et <code>try (...)</code> (Java, <code>AutoCloseable</code>) font le nettoyage automatiquement.'] };

/* ---------- 9.4 ---------- */
const BOITE = `class Boite:
    def __init__(self, contenu):
        self._contenu = contenu

    def ouvrir(self):
        return self._contenu
`;
LES['p9-4'] = { title:'Les génériques en Java', dur:'14 min',
  intro:'ArrayList<Heros>, List<String> : tu as déjà vu ces chevrons. Ce sont les génériques, le polymorphisme paramétrique. Une seule classe, pour n’importe quel type, vérifiée par le compilateur.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Quand le bloc <code>finally</code> s'exécute-t-il ?</p>`,
      opts:[ {l:'Seulement s’il y a eu une erreur', why:'Ça, c’est <code>except</code>.'},
             {l:'Seulement s’il n’y a pas eu d’erreur', why:'Ça, c’est <code>else</code>.'},
             {l:'Toujours', ok:1},
             {l:'Seulement si le try fait un return', why:'Il s’exécute dans tous les cas, avec ou sans <code>return</code>.'} ],
      ex:'<code>finally</code> s’exécute toujours, c’est tout son intérêt.' },
    { t:'say', h:'Le problème que les génériques résolvent',
      p:`<p>Avant les génériques (Java 5), une liste contenait des <code>Object</code> : n'importe quoi. Le compilateur ne pouvait pas t'aider, et l'erreur arrivait à l'exécution.</p>`, lang:'java',
      snip:`// Sans générique : on peut y mettre n'importe quoi
List sac = new ArrayList();
sac.add("épée");
sac.add(42);                       // accepté !
String s = (String) sac.get(1);    // ClassCastException à l'EXÉCUTION

// Avec générique : le type des éléments est un paramètre
List<String> sac = new ArrayList<>();
sac.add("épée");
sac.add(42);                       // erreur de COMPILATION
String s = sac.get(0);             // pas besoin de cast`,
      p2:`<p>Les <strong>génériques</strong> (<em>generics</em>) permettent d'écrire une classe dont le type des éléments est un <strong>paramètre</strong>. C'est le <strong>polymorphisme paramétrique</strong> (<em>parametric polymorphism</em>) annoncé au chapitre 6 : une seule classe, plein de types, vérifiés à la compilation.</p>` },
    { t:'compare', h:'Écrire une classe générique',
      p:`<p>En Java, on déclare un <strong>paramètre de type</strong> entre chevrons après le nom de la classe : <code>Boite&lt;T&gt;</code>. Partout dans la classe, <code>T</code> remplace un vrai type, qui sera choisi à l'utilisation.</p><p>En Python, une classe marche déjà avec n'importe quel type (duck typing) : il n'y a rien à faire.</p>`,
      py: BOITE + `
b1 = Boite("épée")
b2 = Boite(42)
print(b1.ouvrir(), b2.ouvrir())`,
      java:`public class Boite<T> {
    private final T contenu;

    public Boite(T contenu) {
        this.contenu = contenu;
    }

    public T ouvrir() {
        return contenu;
    }
}

Boite<String> b1 = new Boite<>("épée");
String s = b1.ouvrir();          // pas de cast

Boite<Integer> b2 = new Boite<>(42);
int n = b2.ouvrir();`,
      notes:['<code>T</code> (pour <em>Type</em>) est le nom habituel. On voit aussi <code>E</code> (élément), <code>K</code> et <code>V</code> (clé et valeur).','<code>new Boite&lt;&gt;(...)</code> : le « losange » <code>&lt;&gt;</code> laisse Java deviner le type.','Les types de base (<code>int</code>, <code>double</code>) ne vont pas entre chevrons : on utilise leur version objet, <code>Integer</code>, <code>Double</code>, <code>Boolean</code>.'] },
    { t:'quiz', lang:'java', h:'Ça compile ?', p:`<p>Laquelle de ces lignes Java <strong>ne compile pas</strong> ?</p>`,
      opts:[ {l:'List<Integer> pv = new ArrayList<>();', why:'<code>Integer</code> est la version objet de <code>int</code> : parfait.'},
             {l:'List<int> pv = new ArrayList<>();', ok:1},
             {l:'Boite<String> b = new Boite<>("arc");', why:'Une boîte de texte, avec du texte : parfait.'},
             {l:'Map<String, Integer> prix = new HashMap<>();', why:'Deux paramètres de type, clé et valeur : parfait.'} ],
      ex:'Les génériques Java n’acceptent que des objets. Pour des entiers : <code>List&lt;Integer&gt;</code>.' },
    { t:'quiz', lang:'java', h:'Le compilateur veille', p:`<p>Que se passe-t-il ?</p>`, snip:`Boite<Potion> b = new Boite<>(new Potion("Soin", 20));
Arme a = b.ouvrir();`,
      opts:[ {l:'Ça marche si la potion est aussi une arme', why:'Le compilateur sait que <code>ouvrir()</code> renvoie une <code>Potion</code>. Une Potion n’est pas une Arme.'},
             {l:'ClassCastException à l’exécution', why:'Avec les génériques, l’erreur est trouvée bien avant : à la compilation.'},
             {l:'Erreur de compilation', ok:1},
             {l:'a vaut null', why:'Java ne convertit pas silencieusement.'} ],
      ex:'<code>Boite&lt;Potion&gt;</code> : <code>ouvrir()</code> renvoie une <code>Potion</code>. La ranger dans une <code>Arme</code> ne compile pas. Voilà l’intérêt des génériques.' },
    { t:'say', h:'Les méthodes génériques et les bornes',
      p:`<p>Une <strong>méthode</strong> peut aussi être générique. Et on peut <strong>borner</strong> le paramètre de type : <code>&lt;T extends Comparable&lt;T&gt;&gt;</code> veut dire « n'importe quel type T, du moment qu'il est comparable avec lui-même ».</p>`, lang:'java',
      snip:`public static <T extends Comparable<T>> T plusGrand(List<T> elements) {
    T meilleur = elements.get(0);
    for (T x : elements) {
        if (x.compareTo(meilleur) > 0) {
            meilleur = x;
        }
    }
    return meilleur;
}

plusGrand(List.of(3, 17, 8));            // 17
plusGrand(List.of("arc", "épée"));       // "épée"
plusGrand(List.of(new Object()));        // erreur : Object n'est pas Comparable`,
      p2:`<p>Autre forme que tu croiseras : <code>List&lt;? extends Monstre&gt;</code>, « une liste d'un certain sous-type de Monstre ». Et un détail technique : Java efface les paramètres de type à l'exécution (<em>type erasure</em>). Ils servent seulement au compilateur.</p>` },
    { t:'say', h:'Et en Python ?',
      p:`<p>Python n'a pas besoin des génériques pour fonctionner. Mais pour aider l'éditeur à repérer les erreurs, on peut annoter les types : <code>list[str]</code>, <code>dict[str, int]</code>, et des classes génériques avec <code>TypeVar</code> et <code>Generic</code> (module <code>typing</code>, qui marche dans VS Code mais pas sur ce site).</p>`,
      snip:`from typing import Generic, TypeVar

T = TypeVar("T")

class Boite(Generic[T]):
    def __init__(self, contenu: T):
        self._contenu = contenu

    def ouvrir(self) -> T:
        return self._contenu

b: Boite[str] = Boite("épée")
sac: list[str] = ["corde", "torche"]
prix: dict[str, int] = {"épée": 40}`,
      p2:`<p>Ces annotations ne sont <strong>pas vérifiées</strong> à l'exécution : <code>Boite[str](42)</code> marcherait quand même. Ce sont des outils comme <em>mypy</em> ou l'éditeur qui les contrôlent.</p>` },
    { t:'fill', lang:'java', h:'Une paire générique',
      p:`<p>Complète cette classe Java <code>Paire</code>, qui garde deux valeurs de types différents (par exemple un nom et un prix).</p>`,
      tpl:`public class Paire<[[A]], B> {
    private final A premier;
    private final [[B]] second;

    public Paire(A premier, B second) {
        this.premier = premier;
        this.second = second;
    }

    public [[A]] getPremier() { return premier; }
    public B getSecond() { return second; }
}

Paire<String, [[Integer]]> article = new Paire<>("épée", 40);`,
      hints:['Deux paramètres de type, A et B. Chaque attribut et getter utilise le sien.','<code>A</code>, <code>B</code>, <code>A</code>, et pour un entier entre chevrons : <code>Integer</code>.'],
      ok:'Une classe, deux paramètres de type : <code>Paire&lt;String, Integer&gt;</code>, <code>Paire&lt;Heros, Arme&gt;</code>… tout ce que tu veux.' },
    { t:'code', h:'À toi : une boîte de type sûr', file:'coffre_type.py', mem:1,
      p:`<p>Python ne vérifie pas les génériques. Simulons cette sécurité ! Écris une classe <code>Coffre</code> dont le constructeur reçoit un <strong>type</strong> (par exemple <code>Potion</code>, ou <code>int</code>) et le range dans <code>_type</code>, avec une liste vide <code>_contenu</code>.</p><ul><li><code>ranger(x)</code> lève <code>TypeError</code> si <code>x</code> n'est pas une instance de <code>_type</code>, sinon l'ajoute ;</li><li><code>__len__</code> renvoie le nombre d'objets.</li></ul><p>Crée <code>c = Coffre(Potion)</code> et range-y une potion.</p>`,
      code:`class Potion:
    def __init__(self, soin):
        self.soin = soin
`,
      sol:`class Potion:
    def __init__(self, soin):
        self.soin = soin

class Coffre:
    def __init__(self, type_):
        self._type = type_
        self._contenu = []

    def ranger(self, x):
        if not isinstance(x, self._type):
            raise TypeError("mauvais type d'objet")
        self._contenu.append(x)

    def __len__(self):
        return len(self._contenu)

c = Coffre(Potion)
c.ranger(Potion(20))`,
      hints:['Une classe est une valeur comme une autre : on peut la ranger dans un attribut et la donner à <code>isinstance(x, self._type)</code>.','<code>ranger</code> : <code>if not isinstance(x, self._type): raise TypeError(...)</code>, puis <code>self._contenu.append(x)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + '\n_c = Coffre(int)\n_c.ranger(3)\n_c.ranger(4)\nprint("#A", len(_c))' + tryPy('B', '_c.ranger("trois")', 'TypeError') + tryPy('C', 'Coffre(Potion).ranger(5)', 'TypeError') + '\nprint("#D", len(_c), len(Coffre(str)))');
        if (t.err) return TESTERR(t);
        if (!/#A 2/.test(t.out)) return 'Un <code>Coffre(int)</code> doit accepter des entiers, et <code>len</code> doit les compter.';
        if (!/#B ERREUR/.test(t.out) || !/#C ERREUR/.test(t.out)) return 'Un objet du mauvais type doit lever <code>TypeError</code>.';
        if (!/#D 2 0/.test(t.out)) return 'Un objet refusé ne doit pas être ajouté.';
        return true;
      },
      ok:'Ton coffre fait à l’exécution ce que le compilateur Java fait pour <code>Coffre&lt;Potion&gt;</code> avant même de lancer le programme.' },
    { t:'code', defi:1, h:'La méthode générique en Python', file:'plus_grand.py',
      p:`<p>Écris une fonction <code>plus_grand(elements)</code> qui marche pour <strong>tout</strong> ce qui se compare avec <code>&gt;</code> : des nombres, des textes, ou des objets qui ont <code>__lt__</code>. Pas le droit d'utiliser <code>max()</code>. Si la liste est vide, lève <code>ValueError</code>.</p><p>Teste-la sur des nombres, des textes, et des objets <code>Niveau</code> (qui ont déjà <code>__lt__</code>).</p>`,
      code:`class Niveau:
    def __init__(self, n):
        self.n = n

    def __lt__(self, autre):
        return self.n < autre.n

    def __repr__(self):
        return f"Niveau({self.n})"
`,
      sol:`class Niveau:
    def __init__(self, n):
        self.n = n

    def __lt__(self, autre):
        return self.n < autre.n

    def __repr__(self):
        return f"Niveau({self.n})"

def plus_grand(elements):
    if len(elements) == 0:
        raise ValueError("liste vide")
    meilleur = elements[0]
    for x in elements:
        if meilleur < x:
            meilleur = x
    return meilleur

print(plus_grand([3, 17, 8]))
print(plus_grand(["arc", "épée", "dague"]))
print(plus_grand([Niveau(2), Niveau(9), Niveau(4)]))`,
      hints:['Commence avec <code>meilleur = elements[0]</code>, et compare avec <code>&lt;</code> : <code>if meilleur &lt; x: meilleur = x</code> (c’est <code>__lt__</code> qui sera appelé).','Avant tout : <code>if len(elements) == 0: raise ValueError("liste vide")</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const fn = (code.match(/def\s+plus_grand[\s\S]*?(?=\n\S|$)/) || [''])[0];
        if (!fn) return 'Il faut une fonction <code>plus_grand(elements)</code>.';
        if (/max\s*\(|sorted\s*\(|\.sort\s*\(/.test(fn)) return 'Pas de <code>max()</code> ni de tri : écris la boucle toi-même.';
        const t = await test([], code + '\nprint("#T", plus_grand([1, 5, 2]), plus_grand(["b", "c", "a"]), plus_grand([Niveau(7), Niveau(3)]), plus_grand([4]))' + tryPy('A', 'plus_grand([])'));
        if (t.err) return TESTERR(t);
        if (!/#T 5 c Niveau\(7\) 4/.test(t.out)) return 'J’attends 5, puis c, puis Niveau(7), puis 4 pour une liste d’un seul élément.';
        if (!/#A ERREUR/.test(t.out)) return 'Une liste vide doit lever <code>ValueError</code>.';
        return true;
      },
      ok:'C’est la version Python de <code>&lt;T extends Comparable&lt;T&gt;&gt; T plusGrand(List&lt;T&gt;)</code> : une seule fonction, pour tous les types comparables.' }
  ],
  recap:['<strong>Génériques</strong> (<em>generics</em>) : le type des éléments devient un paramètre. <code>List&lt;String&gt;</code>, <code>Boite&lt;T&gt;</code>. C’est le polymorphisme paramétrique.','Avantage : les erreurs de type sont trouvées à la compilation, et plus besoin de cast.','Entre chevrons, que des objets : <code>Integer</code>, <code>Double</code>, pas <code>int</code>.','Méthode générique bornée : <code>&lt;T extends Comparable&lt;T&gt;&gt;</code>.','Python : pas nécessaire (duck typing). Annotations facultatives : <code>list[str]</code>, <code>Generic[T]</code>, vérifiées par les outils seulement.'] };

/* ---------- 9.5 ---------- */
const BUG95 = `class Grimoire:
    def __init__(self):
        self._sorts = ["Feu", "Glace", "Foudre"]

    def __iter__(self):
        for s in self._sorts:
            return s

for sort in Grimoire():
    print("Je connais", sort)`;
LES['p9-5'] = { title:'Collections et itération', dur:'15 min',
  intro:'Listes, ensembles, dictionnaires : Java a les mêmes, sous forme d’interfaces et de classes. Et tu vas apprendre à rendre tes propres objets parcourables avec for, grâce à yield.',
  steps:[
    { t:'quiz', rev:1, lang:'java', h:'Une question sur la leçon d’avant', p:`<p>Pourquoi écrit-on <code>List&lt;Integer&gt;</code> et pas <code>List&lt;int&gt;</code> ?</p>`,
      opts:[ {l:'Parce que int n’existe pas en Java', why:'<code>int</code> existe, mais ce n’est pas un objet.'},
             {l:'Parce que les génériques n’acceptent que des objets, et Integer est la version objet de int', ok:1},
             {l:'Parce que Integer est plus rapide', why:'C’est même plutôt l’inverse : <code>int</code> est plus léger.'},
             {l:'C’est juste une convention', why:'<code>List&lt;int&gt;</code> ne compile pas.'} ],
      ex:'Les paramètres de type doivent être des objets. Java convertit tout seul entre <code>int</code> et <code>Integer</code> (on appelle ça l’<em>autoboxing</em>).' },
    { t:'say', h:'Les collections dans les deux langages',
      p:`<p>Java organise ses collections avec des <strong>interfaces</strong> (le contrat) et plusieurs <strong>classes</strong> qui les implémentent. C'est le chapitre 7 en action : on déclare <code>List</code>, on choisit <code>ArrayList</code>.</p>`,
      snip:`Besoin                     Java (interface → classes)           Python
suite ordonnée             List → ArrayList, LinkedList         list
sans doublon               Set → HashSet, TreeSet (trié)        set
clé → valeur               Map → HashMap, TreeMap (triée)       dict
file / pile                Deque → ArrayDeque                   collections.deque
non modifiable             List.of(...), Map.of(...)            tuple, frozenset`,
      p2:`<p>Rappel du chapitre 4 : les clés d'un dictionnaire (ou d'une <code>HashMap</code>) et les éléments d'un ensemble doivent avoir un <code>__eq__</code> et un <code>__hash__</code> cohérents (<code>equals</code> et <code>hashCode</code> en Java).</p>` },
    { t:'compare', h:'Les dictionnaires et les Map',
      p:`<p>Le dictionnaire Python devient une <code>Map</code> en Java. Les noms changent, les idées restent.</p>`,
      py:`stock = {"épée": 3, "arc": 1}
stock["épée"] += 2
stock["bouclier"] = 4
print(stock.get("hache", 0))
for nom, n in stock.items():
    print(nom, n)
print("arc" in stock, len(stock))`,
      java:`Map<String, Integer> stock = new HashMap<>();
stock.put("épée", 3);
stock.put("arc", 1);
stock.put("épée", stock.get("épée") + 2);
stock.put("bouclier", 4);
System.out.println(stock.getOrDefault("hache", 0));
for (Map.Entry<String, Integer> e : stock.entrySet()) {
    System.out.println(e.getKey() + " " + e.getValue());
}
System.out.println(stock.containsKey("arc") + " " + stock.size());`,
      notes:['<code>d[k] = v</code> devient <code>put(k, v)</code>. <code>d[k]</code> devient <code>get(k)</code> (qui renvoie <code>null</code> si la clé manque, sans erreur).','<code>d.get(k, 0)</code> devient <code>getOrDefault(k, 0)</code>. <code>k in d</code> devient <code>containsKey(k)</code>.','<code>HashMap</code> ne garde pas d’ordre. <code>TreeMap</code> trie les clés. (Un <code>dict</code> Python garde l’ordre d’insertion.)'] },
    { t:'quiz', lang:'java', h:'get sur une clé absente', p:`<p>Qu'affiche ce code Java ?</p>`, snip:`Map<String, Integer> prix = new HashMap<>();
prix.put("épée", 40);
System.out.println(prix.get("hache"));`,
      opts:[ {l:'0', why:'Pour avoir 0, il faudrait <code>getOrDefault("hache", 0)</code>.'},
             {l:'null', ok:1},
             {l:'Une KeyError', why:'<code>KeyError</code> est une exception Python. En Java, <code>get</code> ne lève rien.'},
             {l:'Ça ne compile pas', why:'C’est tout à fait valide.'} ],
      ex:'<code>get</code> renvoie <code>null</code> pour une clé absente. Attention : si on fait un calcul avec, c’est la <code>NullPointerException</code> !' },
    { t:'say', h:'Rendre un objet parcourable : __iter__ et yield', file:'iter.py',
      p:`<p>La boucle <code>for</code> marche avec tout objet qui sait se parcourir : il doit avoir une méthode <code>__iter__</code>. La façon la plus simple de l'écrire : avec <code>yield</code>.</p><p><code>yield</code> ressemble à <code>return</code>, mais la fonction <strong>ne s'arrête pas</strong> : elle donne une valeur à la boucle, se met en pause, et reprend au même endroit au tour suivant. Une fonction qui contient <code>yield</code> s'appelle un <strong>générateur</strong> (<em>generator</em>).</p>`,
      code:`class Equipe:
    def __init__(self):
        self._membres = []

    def recruter(self, nom):
        self._membres.append(nom)

    def __iter__(self):
        for m in self._membres:
            yield m

e = Equipe()
e.recruter("Sam")
e.recruter("Léa")
e.recruter("Zoé")
for membre in e:
    print("Membre :", membre)
print(list(e))` },
    { t:'say', h:'Les générateurs, pas à pas', file:'generateur.py',
      p:`<p>Un générateur produit ses valeurs <strong>une par une, à la demande</strong>. Avec <code>next()</code>, on demande la valeur suivante : regarde à quel moment chaque <code>print</code> s'exécute.</p><p>Avantage : il peut produire des valeurs sans les stocker toutes, et même une suite infinie, tant qu'on ne demande pas tout.</p>`,
      code:`def vagues_de_monstres():
    print("(préparation de la vague 1)")
    yield "3 gobelins"
    print("(préparation de la vague 2)")
    yield "2 orcs"
    print("(préparation de la vague 3)")
    yield "1 dragon"

v = vagues_de_monstres()
print("Vague :", next(v))
print("Vague :", next(v))
for reste in v:
    print("Vague :", reste)` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`def compte(n):
    i = 1
    while i <= n:
        yield i * 10
        i += 1

print(list(compte(3)))`,
      opts:[ {l:'10', why:'<code>yield</code> ne termine pas la fonction : elle continue jusqu’à la fin de la boucle.'},
             {l:'[10, 20, 30]', ok:1},
             {l:'[1, 2, 3]', why:'Chaque valeur donnée est <code>i * 10</code>.'},
             {l:'[10, 20, 30, 40]', why:'La boucle s’arrête quand <code>i</code> dépasse 3.'} ],
      ex:'Le générateur donne 10, 20, 30, puis la boucle s’arrête. <code>list()</code> récupère toutes les valeurs.' },
    { t:'code', bug:1, h:'Le grimoire qui n’a qu’une page', file:'bug.py',
      p:`<p>Ce code plante. Le grimoire devrait se parcourir avec <code>for</code> et afficher ses trois sorts. Répare <code>__iter__</code>.</p>`,
      code: BUG95,
      sol: BUG95.replace('            return s', '            yield s'),
      hints:['<code>return</code> arrête la méthode dès le premier sort, et renvoie un texte au lieu de quelque chose qu’on peut parcourir.','Remplace <code>return s</code> par <code>yield s</code>.'],
      check:(r, code) => {
        if (same(code, BUG95)) return START;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        const l = linesOf(r.out);
        if (l.join('|') !== 'Je connais Feu|Je connais Glace|Je connais Foudre') return 'J’attends les trois sorts, un par ligne.';
        return true;
      },
      ok:'<code>return</code> donne une valeur et s’arrête. <code>yield</code> en donne une, et reprend au tour suivant.' },
    { t:'compare', h:'Et en Java ? Iterable et Iterator',
      p:`<p>En Java, une classe parcourable implémente l'interface <code>Iterable&lt;T&gt;</code>, dont la méthode <code>iterator()</code> renvoie un <code>Iterator&lt;T&gt;</code> avec <code>hasNext()</code> et <code>next()</code>. Le plus simple : renvoyer l'itérateur de la liste interne.</p>`,
      py:`class Equipe:
    def __init__(self):
        self._membres = []

    def __iter__(self):
        for m in self._membres:
            yield m

for m in equipe:
    print(m)`,
      java:`public class Equipe implements Iterable<String> {
    private final List<String> membres = new ArrayList<>();

    @Override
    public Iterator<String> iterator() {
        return membres.iterator();
    }
}

for (String m : equipe) {
    System.out.println(m);
}`,
      notes:['Le <code>for (String m : equipe)</code> de Java marche avec tout <code>Iterable</code>, comme le <code>for</code> de Python avec tout objet qui a <code>__iter__</code>.','Java n’a pas de <code>yield</code> pour ça : on écrit un <code>Iterator</code> à la main, ou on délègue à une collection.','En Python aussi, on peut écrire l’itérateur à la main, avec <code>__next__</code> et <code>raise StopIteration</code>. <code>yield</code> le fait pour toi.'] },
    { t:'code', h:'À toi : le butin parcourable', file:'butin.py',
      p:`<p>Écris une classe <code>Butin</code> qui garde un dictionnaire <code>_objets</code> (nom → quantité), avec :</p><ul><li><code>ajouter(nom, n=1)</code> qui augmente la quantité (en partant de 0 si l'objet est nouveau) ;</li><li><code>__iter__</code> qui donne, avec <code>yield</code>, un texte par objet : <code>3 x pièce</code>.</li></ul><p>Ajoute 2 pièces, 1 rubis, puis 1 pièce, et affiche chaque ligne avec une boucle <code>for</code>.</p>`,
      code:``,
      sol:`class Butin:
    def __init__(self):
        self._objets = {}

    def ajouter(self, nom, n=1):
        self._objets[nom] = self._objets.get(nom, 0) + n

    def __iter__(self):
        for nom, n in self._objets.items():
            yield f"{n} x {nom}"

b = Butin()
b.ajouter("pièce", 2)
b.ajouter("rubis")
b.ajouter("pièce")
for ligne in b:
    print(ligne)`,
      hints:['<code>ajouter</code> : <code>self._objets[nom] = self._objets.get(nom, 0) + n</code>.','<code>__iter__</code> : <code>for nom, n in self._objets.items(): yield f"{n} x {nom}"</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/yield/.test(code)) return 'Utilise <code>yield</code> dans <code>__iter__</code>.';
        const l = linesOf(r.out);
        if (l.join('|') !== '3 x pièce|1 x rubis') return 'J’attends deux lignes : <code>3 x pièce</code> puis <code>1 x rubis</code>.';
        const t = await test([], code + '\n_b = Butin()\n_b.ajouter("a", 5)\n_b.ajouter("b")\n_b.ajouter("a", 2)\nprint("#T", list(_b), list(Butin()))');
        if (t.err || !/#T \['7 x a', '1 x b'\] \[\]/.test(t.out)) return 'Avec un autre butin, ça ne marche pas : vérifie <code>ajouter</code> (quantité par défaut 1) et les textes donnés par <code>__iter__</code>.';
        return true;
      },
      ok:'Ton butin se parcourt comme une liste, et même <code>list(butin)</code> marche. Tu as respecté le contrat « itérable ».' },
    { t:'code', defi:1, h:'Un générateur infini', file:'infini.py',
      p:`<p>Écris un générateur <code>niveaux_xp()</code> qui donne, sans fin, l'expérience nécessaire pour chaque niveau : 100, puis chaque niveau demande 50 % de plus que le précédent (arrondi à l'entier inférieur avec <code>int()</code>) : 100, 150, 225, 337…</p><p>Puis écris <code>premiers(gen, n)</code> qui renvoie la liste des <code>n</code> premières valeurs d'un générateur, avec <code>next()</code>. Affiche <code>premiers(niveaux_xp(), 5)</code>.</p>`,
      code:``,
      sol:`def niveaux_xp():
    xp = 100
    while True:
        yield xp
        xp = int(xp * 1.5)

def premiers(gen, n):
    valeurs = []
    for i in range(n):
        valeurs.append(next(gen))
    return valeurs

print(premiers(niveaux_xp(), 5))`,
      hints:['Le générateur : <code>xp = 100</code>, puis <code>while True:</code> → <code>yield xp</code> et <code>xp = int(xp * 1.5)</code>. Il ne s’arrête jamais, et c’est normal.','<code>premiers</code> : une boucle <code>for i in range(n):</code> qui ajoute <code>next(gen)</code> à une liste.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/yield/.test(code)) return '<code>niveaux_xp</code> doit être un générateur, avec <code>yield</code>.';
        if (!/\[100, 150, 225, 337, 505\]/.test(r.out)) return 'J’attends <code>[100, 150, 225, 337, 505]</code>.';
        const t = await test([], code + '\n_g = niveaux_xp()\nprint("#T", premiers(_g, 2), premiers(_g, 2), premiers(niveaux_xp(), 0))');
        if (t.err || !/#T \[100, 150\] \[225, 337\] \[\]/.test(t.out)) return '<code>premiers</code> doit utiliser le générateur reçu avec <code>next()</code> : deux appels sur le même générateur continuent là où il s’était arrêté.';
        return true;
      },
      ok:'Une suite infinie, et pourtant aucune boucle infinie : le générateur ne calcule que ce qu’on lui demande.' }
  ],
  recap:['Java : des interfaces (<code>List</code>, <code>Set</code>, <code>Map</code>) et des classes (<code>ArrayList</code>, <code>HashSet</code>, <code>HashMap</code>). Python : <code>list</code>, <code>set</code>, <code>dict</code>.','<code>Map</code> : <code>put</code>, <code>get</code> (renvoie <code>null</code> si absent), <code>getOrDefault</code>, <code>containsKey</code>, <code>entrySet()</code>.','Un objet parcourable a <code>__iter__</code>. Le plus simple : un générateur avec <code>yield</code>.','<code>yield</code> donne une valeur et met la fonction en pause. <code>next()</code> demande la suivante.','Java : <code>implements Iterable&lt;T&gt;</code> et <code>iterator()</code>.'] };

/* ---------- 9.6 ---------- */
const B1 = `class ErreurBoutique(Exception):
    pass

class ObjetInconnu(ErreurBoutique):
    def __init__(self, nom):
        super().__init__(f"objet inconnu : {nom}")
        self.nom = nom

class StockEpuise(ErreurBoutique):
    def __init__(self, nom):
        super().__init__(f"plus de {nom} en stock")
        self.nom = nom

class OrInsuffisant(ErreurBoutique):
    def __init__(self, manque):
        super().__init__(f"il manque {manque} po")
        self.manque = manque`;
const B2 = `

class Boutique:
    def __init__(self):
        self._articles = {}

    def ajouter(self, nom, prix, quantite):
        if prix <= 0 or quantite < 0:
            raise ValueError("prix ou quantité invalide")
        self._articles[nom] = [prix, quantite]

    def acheter(self, nom, po):
        if nom not in self._articles:
            raise ObjetInconnu(nom)
        prix, quantite = self._articles[nom]
        if quantite == 0:
            raise StockEpuise(nom)
        if po < prix:
            raise OrInsuffisant(prix - po)
        self._articles[nom][1] -= 1
        return po - prix`;
const B3 = `

    def __iter__(self):
        for nom, (prix, quantite) in self._articles.items():
            if quantite > 0:
                yield f"{nom} : {prix} po ({quantite})"`;
const B4 = `

def faire_les_courses(boutique, liste, po):
    for nom in liste:
        try:
            po = boutique.acheter(nom, po)
            print("Acheté :", nom)
        except OrInsuffisant as e:
            print("Trop cher :", nom, "- il manque", e.manque, "po")
        except ErreurBoutique as e:
            print("Refusé :", e)
        finally:
            print("  bourse :", po, "po")
    return po

b = Boutique()
b.ajouter("potion", 10, 2)
b.ajouter("épée", 45, 1)
b.ajouter("carte", 5, 0)
reste = faire_les_courses(b, ["potion", "carte", "épée", "dragon", "potion"], 50)
for ligne in b:
    print(ligne)`;
LES['p9-6'] = { title:'Projet : la boutique qui refuse les erreurs', dur:'20 min',
  intro:'Une boutique de jeu qui refuse proprement tout ce qui ne va pas : objet inconnu, stock épuisé, or insuffisant. Avec tes propres exceptions, un catalogue parcourable et une liste de courses qui ne plante jamais.',
  steps:[
    { t:'say', h:'Le projet',
      p:`<p>La boutique lève des exceptions précises. Le code qui fait les courses les attrape, affiche un message clair, et continue. Voici le résultat attendu :</p>`,
      snip:`Acheté : potion
  bourse : 40 po
Refusé : plus de carte en stock
  bourse : 40 po
Trop cher : épée - il manque 5 po
  bourse : 40 po
Refusé : objet inconnu : dragon
  bourse : 40 po
Acheté : potion
  bourse : 30 po
épée : 45 po (1)`,
      p2:`<p>Quatre étapes, je reprends ton code à chaque fois.</p>` },
    { t:'code', h:'Étape 1 : la famille d’exceptions', file:'boutique.py',
      p:`<p>Écris l'exception de base <code>ErreurBoutique(Exception)</code>, et trois filles :</p><ul><li><code>ObjetInconnu(nom)</code> : message <code>objet inconnu : dragon</code>, attribut <code>nom</code> ;</li><li><code>StockEpuise(nom)</code> : message <code>plus de carte en stock</code>, attribut <code>nom</code> ;</li><li><code>OrInsuffisant(manque)</code> : message <code>il manque 5 po</code>, attribut <code>manque</code>.</li></ul>`,
      code:``,
      sol: B1,
      hints:['Chaque fille hérite de <code>ErreurBoutique</code> et appelle <code>super().__init__(f"...")</code> avec son message.','N’oublie pas les attributs : <code>self.nom = nom</code> ou <code>self.manque = manque</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
for _e in [ObjetInconnu("x"), StockEpuise("y"), OrInsuffisant(3)]:
    print("#", type(_e).__name__, isinstance(_e, ErreurBoutique), str(_e))
print("#A", ObjetInconnu("x").nom, StockEpuise("y").nom, OrInsuffisant(3).manque, issubclass(ErreurBoutique, Exception))`);
        if (t.err) return TESTERR(t);
        if (!/# ObjetInconnu True objet inconnu : x/.test(t.out)) return 'ObjetInconnu : message <code>objet inconnu : x</code>, et fille de ErreurBoutique.';
        if (!/# StockEpuise True plus de y en stock/.test(t.out)) return 'StockEpuise : message <code>plus de y en stock</code>.';
        if (!/# OrInsuffisant True il manque 3 po/.test(t.out)) return 'OrInsuffisant : message <code>il manque 3 po</code>.';
        if (!/#A x y 3 True/.test(t.out)) return 'Chaque exception garde son attribut (<code>nom</code> ou <code>manque</code>), et ErreurBoutique hérite de Exception.';
        return true;
      },
      ok:'Une famille d’exceptions claire : le reste du programme pourra attraper toutes les erreurs de la boutique d’un coup, ou une seule en particulier.' },
    { t:'code', carry:1, h:'Étape 2 : la boutique', file:'boutique.py', mem:1,
      p:`<p>Écris la classe <code>Boutique</code>, avec un dictionnaire <code>_articles</code> (nom → liste <code>[prix, quantité]</code>) :</p><ul><li><code>ajouter(nom, prix, quantite)</code> : <code>ValueError</code> si le prix est nul ou négatif, ou la quantité négative ;</li><li><code>acheter(nom, po)</code> : lève <code>ObjetInconnu</code>, puis <code>StockEpuise</code>, puis <code>OrInsuffisant</code> si besoin (dans cet ordre). Sinon, la quantité baisse de 1, et la méthode renvoie l'or restant.</li></ul>`,
      code:`# Étape 2 : la classe Boutique
`,
      sol: B1 + B2,
      hints:['<code>acheter</code> vérifie dans l’ordre : <code>if nom not in self._articles: raise ObjetInconnu(nom)</code>, puis la quantité, puis l’or.','Si tout va bien : <code>self._articles[nom][1] -= 1</code> et <code>return po - prix</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
_b = Boutique()
_b.ajouter("a", 10, 1)
_b.ajouter("vide", 1, 0)
print("#A", _b.acheter("a", 25))
def _essai(nom, po):
    try:
        _b.acheter(nom, po)
        return "ok"
    except ErreurBoutique as e:
        return type(e).__name__
print("#B", _essai("zzz", 99), _essai("a", 99), _essai("vide", 99))
_b.ajouter("cher", 50, 3)
print("#C", _essai("cher", 20), _b._articles["cher"])` + tryPy('D', '_b.ajouter("x", 0, 1)') + tryPy('E', '_b.ajouter("x", 5, -1)'));
        if (t.err) return TESTERR(t);
        if (!/#A 15/.test(t.out)) return 'Acheter un article à 10 po avec 25 po doit renvoyer 15.';
        if (!/#B ObjetInconnu StockEpuise StockEpuise/.test(t.out)) return 'Un objet absent : ObjetInconnu. Un objet dont le stock est à 0 (même après un achat) : StockEpuise.';
        if (!/#C OrInsuffisant \[50, 3\]/.test(t.out)) return 'Pas assez d’or : OrInsuffisant, et le stock ne doit pas baisser.';
        if (!/#D ERREUR/.test(t.out) || !/#E ERREUR/.test(t.out)) return '<code>ajouter</code> doit refuser un prix nul et une quantité négative avec <code>ValueError</code>.';
        return true;
      },
      ok:'La boutique refuse tout ce qui casserait ses règles, avec une exception qui dit exactement pourquoi.' },
    { t:'code', carry:1, h:'Étape 3 : le catalogue', file:'boutique.py',
      p:`<p>Ajoute à la classe <code>Boutique</code> une méthode <code>__iter__</code> qui donne (avec <code>yield</code>) une ligne par article <strong>encore en stock</strong>, par exemple <code>épée : 45 po (1)</code>.</p>`,
      code:`# Étape 3 : ajoute __iter__ dans la classe Boutique
`,
      sol: B1 + B2 + B3,
      hints:['Parcours <code>self._articles.items()</code> : chaque valeur est une liste <code>[prix, quantite]</code>.','<code>if quantite &gt; 0: yield f"{nom} : {prix} po ({quantite})"</code>'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
_b = Boutique()
_b.ajouter("arc", 30, 2)
_b.ajouter("rien", 4, 0)
_b.ajouter("dague", 8, 1)
print("#T", list(_b))
_b.acheter("dague", 10)
print("#U", list(_b))`);
        if (t.err) return TESTERR(t);
        if (!/#T \['arc : 30 po \(2\)', 'dague : 8 po \(1\)'\]/.test(t.out)) return 'Le catalogue doit lister seulement les articles en stock, au format <code>arc : 30 po (2)</code>.';
        if (!/#U \['arc : 30 po \(2\)'\]/.test(t.out)) return 'Après avoir acheté la dernière dague, elle ne doit plus apparaître dans le catalogue.';
        return true;
      },
      ok:'Le catalogue se parcourt avec <code>for</code>, et il est toujours à jour.' },
    { t:'code', carry:1, h:'Étape 4 : la liste de courses', file:'boutique.py',
      p:`<p>Écris la fonction <code>faire_les_courses(boutique, liste, po)</code> : pour chaque nom de la liste, elle tente l'achat.</p><ul><li>si ça marche : <code>Acheté : potion</code> ;</li><li>si <code>OrInsuffisant</code> : <code>Trop cher : épée - il manque 5 po</code> ;</li><li>pour toute autre <code>ErreurBoutique</code> : <code>Refusé :</code> suivi du message ;</li><li>et dans tous les cas (<code>finally</code>) : <code>  bourse : 40 po</code>.</li></ul><p>Elle renvoie l'or restant. Puis rejoue la scène du début (potion 10 po × 2, épée 45 po × 1, carte 5 po × 0, avec 50 po) et affiche le catalogue.</p>`,
      code:`# Étape 4 : faire_les_courses et la scène
`,
      sol: B1 + B2 + B3 + B4,
      hints:['Dans la boucle : <code>try: po = boutique.acheter(nom, po)</code>, puis deux <code>except</code> (OrInsuffisant d’abord, puis ErreurBoutique), puis <code>finally: print("  bourse :", po, "po")</code>.','La scène : <code>b = Boutique()</code>, trois <code>b.ajouter(...)</code>, puis <code>faire_les_courses(b, ["potion", "carte", "épée", "dragon", "potion"], 50)</code> et <code>for ligne in b: print(ligne)</code>.'],
      check:r => {
        if (r.err) return ERR;
        const want = ['Acheté : potion', 'bourse : 40 po', 'Refusé : plus de carte en stock', 'bourse : 40 po', 'Trop cher : épée - il manque 5 po', 'bourse : 40 po', 'Refusé : objet inconnu : dragon', 'bourse : 40 po', 'Acheté : potion', 'bourse : 30 po', 'épée : 45 po (1)'];
        const l = linesOf(r.out);
        for (const [i, w] of want.entries()) if (l[i] !== w) return `La ligne ${i + 1} devrait être <code>${esc(w)}</code>${l[i] ? `, mais j’ai <code>${esc(l[i])}</code>` : ''}.`;
        if (l.length > want.length) return 'Il y a des lignes en trop à la fin.';
        return true;
      },
      ok:'Cinq achats, trois refus, zéro plantage. Chaque erreur est attrapée au bon niveau, avec le bon message.' },
    { t:'compare', h:'Les exceptions de la boutique en Java',
      p:`<p>En Java, on choisit des exceptions <strong>vérifiées</strong> : celui qui appelle <code>acheter</code> est obligé de prévoir les refus.</p>`,
      py: B1.split('\n\nclass StockEpuise')[0] + `

def acheter(self, nom, po):
    if nom not in self._articles:
        raise ObjetInconnu(nom)
    ...`,
      java:`public class ErreurBoutique extends Exception {
    public ErreurBoutique(String message) { super(message); }
}

public class ObjetInconnu extends ErreurBoutique {
    private final String nom;
    public ObjetInconnu(String nom) {
        super("objet inconnu : " + nom);
        this.nom = nom;
    }
}

public int acheter(String nom, int po) throws ErreurBoutique {
    if (!articles.containsKey(nom)) throw new ObjetInconnu(nom);
    ...
}

try {
    po = boutique.acheter("épée", po);
} catch (OrInsuffisant e) {
    System.out.println("Trop cher, il manque " + e.getManque());
} catch (ErreurBoutique e) {
    System.out.println("Refusé : " + e.getMessage());
} finally {
    System.out.println("  bourse : " + po + " po");
}`,
      notes:['<code>throws ErreurBoutique</code> couvre aussi toutes ses filles.','Comme en Python, le <code>catch</code> le plus précis vient en premier.'] },
    { t:'say', h:'Mini-défi dans VS Code',
      p:`<p>Écris la boutique en Java, avec une <code>Map&lt;String, int[]&gt;</code> pour les articles (ou mieux : une petite classe <code>Article</code> avec un prix et une quantité). Fais-la implémenter <code>Iterable&lt;String&gt;</code> pour le catalogue.</p><p>Bonus : rends <code>OrInsuffisant</code> non vérifiée (elle étend <code>RuntimeException</code>), et observe que le compilateur ne t'oblige plus à l'attraper. Laquelle des deux versions préfères-tu ? Pourquoi ?</p>` }
  ],
  recap:['Une famille d’exceptions : une base (<code>ErreurBoutique</code>) et des filles précises avec des attributs utiles.','La classe lève, le code appelant attrape au bon niveau, du plus précis au plus général.','<code>finally</code> pour ce qui doit toujours arriver (afficher la bourse).','<code>__iter__</code> avec <code>yield</code> rend la boutique parcourable avec <code>for</code>.','En Java : exceptions vérifiées, <code>throws</code>, <code>catch</code> du plus précis au plus général.'] };

Atelier.chapter({ part:"poo", n:9, title:"Exceptions, génériques et collections",
  lessons:['p9-1','p9-2','p9-3','p9-4','p9-5','p9-6'].map(id => ({ id, ...LES[id] })) });
})();
