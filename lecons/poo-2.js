/* Partie POO · Chapitre 2 : Classes et objets */
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has } = Atelier.h;
const LES = {};
const attr = (r, o, a) => { const m = memOf(r, o); const x = m && m.attrs && m.attrs.find(t => t.name === a); return x ? x.repr : undefined; };
const same = (code, start) => code.trim() === start.trim();
const START = 'Voilà le bug ! Exécute, lis ce qui se passe, puis corrige le code.';
const TESTERR = t => 'Mes tests font planter ton code : ' + esc(t.err.title) + '. Vérifie les noms de ta classe, de tes méthodes et de leurs paramètres.';

/* ---------- 2.1 ---------- */
const BUG21 = `class Heros:
    def __init__(self, nom, sac=[]):
        self.nom = nom
        self.sac = sac

sam = Heros("Sam")
lea = Heros("Léa")
sam.sac.append("épée")
print("Sac de Léa :", lea.sac)`;
LES['p2-1'] = { title:'Le constructeur __init__', dur:'14 min',
  intro:'Chaque objet naît d’un constructeur. Son travail : mettre l’objet dans un état correct dès sa naissance. Tu vas voir ce qui se passe à la création, les valeurs par défaut, et un piège célèbre de Python.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur le chapitre d’avant', p:`<p>Ce code plante. Pourquoi ?</p>`, snip:`class Arme:
    def __init__(self, nom):
        self.nom = nom

    def decrire():
        return "Arme : " + self.nom

print(Arme("Hache").decrire())`,
      opts:[ {l:'Il manque self dans decrire', ok:1},
             {l:'Il manque new devant Arme', why:'<code>new</code> n’existe qu’en Java. En Python, on appelle la classe directement.'},
             {l:'On ne peut pas appeler une méthode juste après la création', why:'<code>Arme("Hache").decrire()</code> est permis : on crée l’objet et on appelle sa méthode dans la foulée.'},
             {l:'self.nom n’existe pas', why:'<code>self.nom</code> est bien créé dans <code>__init__</code>. Le problème est dans la ligne <code>def</code> de la méthode.'} ],
      ex:'Python passe toujours l’objet en premier argument. Sans <code>self</code> pour le recevoir : <code>TypeError</code>.' },
    { t:'say', h:'Le constructeur s’exécute tout seul', file:'naissance.py', mem:1,
      p:`<p>Le <strong>constructeur</strong> (<em>constructor</em>) est une méthode spéciale qui s'exécute <strong>automatiquement</strong> à chaque création d'objet. En Python, il s'appelle toujours <code>__init__</code> (deux <code>_</code> de chaque côté).</p><p>Le <code>print</code> dans <code>__init__</code> te montre à quel moment il tourne.</p>`,
      code:`class Heros:
    def __init__(self, nom):
        print("Naissance de", nom)
        self.nom = nom
        self.niveau = 1
        self.sac = []

sam = Heros("Sam")
lea = Heros("Léa")
print("Les deux héros sont prêts.")` },
    { t:'say', h:'Ce qui se passe à la création',
      p:`<p>Quand tu écris <code>sam = Heros("Sam")</code>, quatre choses se passent :</p><ol><li>Python réserve de la place en mémoire pour un nouvel objet ;</li><li>il crée un objet vide ;</li><li>il appelle <code>__init__</code>, avec l'objet vide dans <code>self</code>, et <code>"Sam"</code> dans <code>nom</code> ;</li><li>il range une <strong>référence</strong> vers l'objet dans la variable <code>sam</code>.</li></ol><p>La règle d'or : <strong>crée tous les attributs dans le constructeur</strong>, même ceux qui démarrent à 0 ou vides, comme <code>niveau</code> et <code>sac</code>. Ainsi, chaque objet commence dans un état valide.</p>` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`class Compteur:
    def __init__(self):
        self.valeur = 0

    def plus(self):
        self.valeur += 1

a = Compteur()
b = Compteur()
a.plus()
a.plus()
b.plus()
print(a.valeur, b.valeur)`,
      opts:[ {l:'3 3', why:'Chaque objet a son propre attribut <code>valeur</code>, créé par son propre appel à <code>__init__</code>.'},
             {l:'2 1', ok:1},
             {l:'0 0', why:'<code>plus()</code> modifie bien l’attribut de l’objet sur lequel on l’appelle.'},
             {l:'2 2', why:'<code>b.plus()</code> n’a été appelé qu’une fois.'} ],
      ex:'Chaque création appelle <code>__init__</code>, qui donne à l’objet sa propre <code>valeur</code> à 0.' },
    { t:'say', h:'Des valeurs par défaut', file:'defaut.py', mem:1,
      p:`<p>Comme pour les fonctions, les paramètres du constructeur peuvent avoir une <strong>valeur par défaut</strong>. On peut aussi nommer un argument à l'appel (<em>keyword argument</em>) pour sauter les autres.</p><p>Il n'y a qu'un seul <code>__init__</code> par classe en Python, mais grâce aux valeurs par défaut, on peut créer un objet de plusieurs façons.</p>`,
      code:`class Heros:
    def __init__(self, nom="Inconnu", pv=100, niveau=1):
        self.nom = nom
        self.pv = pv
        self.niveau = niveau

a = Heros("Sam", 80, 2)
b = Heros("Léa")
c = Heros()
d = Heros("Zoé", niveau=5)` },
    { t:'compare', h:'Et en Java ? Plusieurs constructeurs',
      p:`<p>Java n'a pas de valeurs par défaut pour les paramètres. À la place, on écrit <strong>plusieurs constructeurs</strong> avec des paramètres différents : c'est la <strong>surcharge</strong> (<em>overloading</em>). Un constructeur peut en appeler un autre avec <code>this(...)</code>.</p>`,
      py:`class Heros:
    def __init__(self, nom="Inconnu", pv=100):
        self.nom = nom
        self.pv = pv

a = Heros("Sam", 80)
b = Heros("Léa")
c = Heros()`,
      java:`public class Heros {
    String nom;
    int pv;

    Heros(String nom, int pv) {
        this.nom = nom;
        this.pv = pv;
    }

    Heros(String nom) {
        this(nom, 100);      // appelle le constructeur du dessus
    }

    Heros() {
        this("Inconnu");
    }
}

Heros a = new Heros("Sam", 80);
Heros b = new Heros("Léa");
Heros c = new Heros();`,
      notes:['Java choisit le constructeur d’après le nombre et le type des arguments.','<code>this(...)</code> appelle un autre constructeur de la même classe. Ça évite de recopier le code.','En Java, un attribut non initialisé reçoit une valeur par défaut : <code>0</code>, <code>false</code>, ou <code>null</code> (aucun objet) pour un <code>String</code>.','Si tu n’écris aucun constructeur, Java en fournit un caché, sans paramètre.'] },
    { t:'fill', lang:'java', h:'Complète les constructeurs',
      p:`<p>Une quête a un titre et une récompense en pièces d'or. Si on ne donne que le titre, la récompense vaut 50.</p>`,
      tpl:`public class Quete {
    String titre;
    int recompense;

    [[Quete]](String titre, int recompense) {
        [[this]].titre = titre;
        this.recompense = recompense;
    }

    Quete(String titre) {
        [[this]](titre, [[50]]);
    }
}`,
      hints:['Le constructeur porte le nom de la classe.','Dans le deuxième constructeur, <code>this(...)</code> appelle le premier, avec la récompense par défaut.'],
      ok:'Deux constructeurs, et le second réutilise le premier avec <code>this(titre, 50)</code>.' },
    { t:'quiz', lang:'java', h:'Quel constructeur ?', p:`<p>Avec la classe <code>Heros</code> Java de tout à l'heure, que vaut <code>b.pv</code> ?</p>`, snip:`Heros b = new Heros("Léa");`,
      opts:[ {l:'0', why:'Le constructeur à un paramètre appelle <code>this(nom, 100)</code> : pv reçoit 100.'},
             {l:'100', ok:1},
             {l:'null', why:'<code>pv</code> est un <code>int</code> : il ne peut pas valoir <code>null</code>.'},
             {l:'Ça ne compile pas', why:'Il existe bien un constructeur qui prend un seul <code>String</code>.'} ],
      ex:'Java choisit le constructeur <code>Heros(String nom)</code>, qui passe la main à <code>Heros(nom, 100)</code>.' },
    { t:'say', h:'Le piège de la liste par défaut', file:'piege.py', mem:1,
      p:`<p>Attention, piège célèbre ! Une valeur par défaut est créée <strong>une seule fois</strong>, quand Python lit la ligne <code>def</code>. Si c'est une liste, tous les objets qui l'utilisent <strong>partagent la même liste</strong>.</p><p>Exécute : on ajoute une épée dans le sac de Sam… et elle apparaît aussi dans celui de Léa.</p>`,
      code: BUG21 },
    { t:'code', bug:1, h:'Répare le sac partagé', file:'bug.py', mem:1,
      p:`<p>Corrige la classe pour que chaque héros ait son propre sac. La bonne pratique : mettre <code>None</code> comme valeur par défaut, et créer la liste dans le constructeur.</p>`,
      code: BUG21,
      sol: BUG21.replace('sac=[]', 'sac=None').replace('        self.sac = sac', '        if sac is None:\n            sac = []\n        self.sac = sac'),
      hints:['Remplace <code>sac=[]</code> par <code>sac=None</code> dans la ligne <code>def</code>.','Puis, dans le constructeur : <code>if sac is None:</code> → <code>sac = []</code>, avant <code>self.sac = sac</code>.'],
      check:async (r, code, test) => {
        if (same(code, BUG21)) return START;
        if (r.err) return ERR;
        if (/sac\s*=\s*\[\s*\]\s*\)/.test(code)) return 'La ligne <code>def</code> contient encore <code>sac=[]</code> : c’est elle, le piège.';
        if (attr(r, 'lea', 'sac') !== '[]') return 'Le sac de Léa n’est pas vide : les deux héros partagent encore la même liste.';
        if (attr(r, 'sam', 'sac') !== "['épée']") return 'Sam doit garder son épée dans son sac.';
        const t = await test([], code + '\n_x = Heros("X", ["arc"])\nprint("#T", _x.sac)');
        if (t.err || !/#T \['arc'\]/.test(t.out)) return 'Si on donne un sac au constructeur, le héros doit le garder : <code>Heros("X", ["arc"])</code> doit avoir <code>[\'arc\']</code>.';
        return true;
      },
      ok:'Avec <code>None</code> par défaut, chaque appel crée une liste neuve. Retiens ce réflexe pour les listes et les dictionnaires.' },
    { t:'code', h:'À toi : la classe Quete', file:'quete.py', mem:1,
      p:`<p>Écris une classe <code>Quete</code> dont le constructeur reçoit un <code>titre</code> et une <code>recompense</code> (50 par défaut). Chaque quête a aussi un attribut <code>terminee</code> qui vaut toujours <code>False</code> au départ.</p><p>Crée <code>q1 = Quete("Sauver le chat")</code> et <code>q2 = Quete("Vaincre le dragon", 500)</code>.</p>`,
      code:``,
      sol:`class Quete:
    def __init__(self, titre, recompense=50):
        self.titre = titre
        self.recompense = recompense
        self.terminee = False

q1 = Quete("Sauver le chat")
q2 = Quete("Vaincre le dragon", 500)`,
      hints:['La ligne du constructeur : <code>def __init__(self, titre, recompense=50):</code>.','<code>terminee</code> n’est pas un paramètre : écris directement <code>self.terminee = False</code>.'],
      check:r => {
        if (r.err) return ERR;
        if (!memOf(r, 'q1') || !memOf(r, 'q2')) return 'Crée les deux objets <code>q1</code> et <code>q2</code>.';
        if (attr(r, 'q1', 'recompense') !== '50') return 'La quête q1 doit avoir une récompense de 50 par défaut.';
        if (attr(r, 'q2', 'recompense') !== '500') return 'La quête q2 doit avoir une récompense de 500.';
        if (attr(r, 'q1', 'titre') !== "'Sauver le chat'") return 'Le titre de q1 doit être <code>"Sauver le chat"</code>.';
        if (attr(r, 'q1', 'terminee') !== 'False' || attr(r, 'q2', 'terminee') !== 'False') return 'Chaque quête doit avoir un attribut <code>terminee</code> à <code>False</code>.';
        return true;
      },
      ok:'Regarde la mémoire : les deux quêtes ont trois attributs, dont <code>terminee</code>, créé sans paramètre.' },
    { t:'code', defi:1, h:'La bourse qui fait la monnaie', file:'bourse.py', mem:1,
      p:`<p>Dans notre jeu, 100 pièces d'argent valent 1 pièce d'or. Écris une classe <code>Bourse</code> dont le constructeur reçoit <code>po</code> (pièces d'or) et <code>pa</code> (pièces d'argent), tous les deux à 0 par défaut. Le constructeur doit <strong>faire la monnaie</strong> : à la fin, <code>pa</code> est toujours entre 0 et 99.</p><p>Exemple : <code>Bourse(2, 250)</code> donne <code>po = 4</code> et <code>pa = 50</code>. Crée <code>b = Bourse(2, 250)</code>.</p>`,
      code:``,
      sol:`class Bourse:
    def __init__(self, po=0, pa=0):
        self.po = po + pa // 100
        self.pa = pa % 100

b = Bourse(2, 250)`,
      hints:['Le nombre de pièces d’or en plus : <code>pa // 100</code>. Ce qui reste en argent : <code>pa % 100</code>.','<code>self.po = po + pa // 100</code> et <code>self.pa = pa % 100</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (attr(r, 'b', 'po') !== '4' || attr(r, 'b', 'pa') !== '50') return `Pour <code>Bourse(2, 250)</code>, j’attends po = 4 et pa = 50. Ta bourse a po = ${esc(attr(r, 'b', 'po'))} et pa = ${esc(attr(r, 'b', 'pa'))}.`;
        const t = await test([], code + '\n_a = Bourse()\n_b = Bourse(pa=1999)\n_c = Bourse(7)\nprint("#T", _a.po, _a.pa, _b.po, _b.pa, _c.po, _c.pa)');
        if (t.err) return TESTERR(t);
        if (!/#T 0 0 19 99 7 0/.test(t.out)) return 'Ça ne marche pas pour tous les cas. Je teste <code>Bourse()</code> (0 et 0), <code>Bourse(pa=1999)</code> (19 et 99) et <code>Bourse(7)</code> (7 et 0).';
        return true;
      },
      ok:'Le constructeur garantit une règle dès la naissance de l’objet : jamais 100 pièces d’argent ou plus. On appellera ça un invariant au chapitre 3.' }
  ],
  recap:['Le <strong>constructeur</strong> (<em>constructor</em>) s’exécute automatiquement à la création. En Python : <code>__init__</code>. En Java : une méthode au nom de la classe, sans type de retour.','Crée <strong>tous</strong> les attributs dans le constructeur, pour que l’objet démarre dans un état valide.','Python : des valeurs par défaut (<code>pv=100</code>). Java : plusieurs constructeurs (<em>overloading</em>) qui s’appellent avec <code>this(...)</code>.','Jamais de liste en valeur par défaut : <code>sac=None</code>, puis <code>if sac is None: sac = []</code>.'] };

/* ---------- 2.2 ---------- */
const BUG22 = `class Heros:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

    def est_vivant(self):
        return self.pv > 0

    def crier(self):
        if est_vivant():
            return self.nom + " : À l'attaque !"
        return self.nom + " ne peut plus crier."

sam = Heros("Sam", 30)
print(sam.crier())`;
LES['p2-2'] = { title:'self et this', dur:'12 min',
  intro:'Ce mystérieux self, tu l’écris depuis le début. Ici, tu comprends enfin ce qu’il contient, pourquoi il est obligatoire, et le bug classique qui arrive quand on l’oublie.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Pourquoi évite-t-on <code>def __init__(self, nom, sac=[])</code> ?</p>`,
      opts:[ {l:'Parce qu’une liste ne peut pas être un paramètre', why:'Une liste peut tout à fait être un paramètre. Le problème vient de la valeur par défaut.'},
             {l:'Parce que tous les objets partageraient la même liste', ok:1},
             {l:'Parce que la liste serait effacée à chaque appel', why:'C’est l’inverse : elle n’est créée qu’une fois, et jamais remise à zéro.'},
             {l:'Parce que Java ne le permet pas', why:'On parle de Python ici, et Python l’accepte… avec un comportement piégeux.'} ],
      ex:'La valeur par défaut est créée une seule fois. Avec <code>sac=None</code> et une liste créée dans le constructeur, chaque objet a la sienne.' },
    { t:'say', h:'self, c’est l’objet', file:'self.py',
      p:`<p>Dans une méthode, <code>self</code> contient une <strong>référence vers l'objet</strong> sur lequel on a appelé la méthode. Quand tu écris <code>sam.saluer()</code>, Python fait en réalité <code>Heros.saluer(sam)</code> : il passe <code>sam</code> dans <code>self</code>.</p><p>Les deux lignes du bas font exactement la même chose. Essaie avec <code>lea</code>.</p>`,
      code:`class Heros:
    def __init__(self, nom):
        self.nom = nom

    def saluer(self):
        return "Salut, je suis " + self.nom

sam = Heros("Sam")
lea = Heros("Léa")
print(sam.saluer())
print(Heros.saluer(sam))` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Avec la classe <code>Heros</code> ci-dessus, qu'affiche ce code ?</p>`, snip:`print(Heros.saluer(lea))`,
      opts:[ {l:'Salut, je suis Léa', ok:1},
             {l:'Salut, je suis Sam', why:'On passe <code>lea</code> en argument : c’est elle qui se retrouve dans <code>self</code>.'},
             {l:'Une erreur : il manque self', why:'<code>lea</code> joue le rôle de <code>self</code>. C’est exactement ce que fait <code>lea.saluer()</code> en coulisses.'},
             {l:'Salut, je suis Heros', why:'<code>self.nom</code> est le nom de l’objet passé, pas celui de la classe.'} ],
      ex:'<code>Heros.saluer(lea)</code> et <code>lea.saluer()</code> sont identiques. La deuxième forme est juste plus agréable à écrire.' },
    { t:'say', h:'Le bug de l’ombre', file:'ombre.py', mem:1,
      p:`<p>Dans ce constructeur, on a oublié <code>self.</code>. La ligne <code>nom = nom</code> range le paramètre… dans lui-même. Elle crée une variable locale qui disparaît à la fin de la méthode. L'objet, lui, reste <strong>vide</strong>.</p><p>On dit que le paramètre fait de l'ombre (<em>shadowing</em>) à l'attribut. Regarde la mémoire : aucun attribut.</p>`,
      code:`class Heros:
    def __init__(self, nom):
        nom = nom

sam = Heros("Sam")
print(sam.__dict__)` },
    { t:'compare', h:'Et en Java ? this',
      p:`<p>En Java, <code>this</code> joue le rôle de <code>self</code>. Mais il n'apparaît pas dans les paramètres : il existe tout seul (on dit qu'il est <strong>implicite</strong>). Et on peut souvent l'omettre.</p>`,
      py:`class Heros:
    def __init__(self, nom):
        self.nom = nom

    def saluer(self):
        return "Salut, je suis " + self.nom`,
      java:`public class Heros {
    String nom;

    Heros(String nom) {
        this.nom = nom;      // attribut = paramètre
    }

    String saluer() {
        return "Salut, je suis " + nom;   // this. facultatif ici
    }
}`,
      notes:['<code>self</code> est un paramètre explicite en Python. <code>this</code> est implicite en Java.','En Python, <code>self.</code> est <strong>toujours</strong> obligatoire pour parler d’un attribut. En Java, <code>this.</code> n’est obligatoire qu’en cas d’ambiguïté, comme dans le constructeur où paramètre et attribut ont le même nom.','Le bug de l’ombre existe aussi en Java : <code>nom = nom;</code> range le paramètre dans lui-même, et l’attribut reste à <code>null</code>.'] },
    { t:'quiz', lang:'java', h:'Le bug de l’ombre en Java', p:`<p>Qu'affiche ce code Java ?</p>`, snip:`public class Arme {
    String nom;

    Arme(String nom) {
        nom = nom;
    }

    public static void main(String[] args) {
        Arme a = new Arme("Épée");
        System.out.println(a.nom);
    }
}`,
      opts:[ {l:'Épée', why:'<code>nom = nom;</code> parle seulement du paramètre. L’attribut n’est jamais rempli.'},
             {l:'Une erreur de compilation', why:'Le compilateur accepte : c’est du Java valide, juste inutile. Certains éditeurs affichent un avertissement.'},
             {l:'null', ok:1},
             {l:'Une NullPointerException', why:'Afficher <code>null</code> ne plante pas. Ça planterait si on appelait une méthode dessus.'} ],
      ex:'L’attribut <code>nom</code> garde sa valeur par défaut : <code>null</code>. Il fallait <code>this.nom = nom;</code>.' },
    { t:'say', h:'Des méthodes qui s’appellent', file:'appels.py',
      p:`<p>Une méthode peut appeler une autre méthode du même objet. En Python, il faut écrire <code>self.</code> devant, sinon Python cherche une fonction ordinaire et ne la trouve pas.</p><p>Une méthode peut aussi recevoir un <strong>autre objet</strong> en paramètre, et appeler ses méthodes. Ici, le héros attaque une cible.</p>`,
      code:`class Heros:
    def __init__(self, nom, pv, force):
        self.nom = nom
        self.pv = pv
        self.force = force

    def est_vivant(self):
        return self.pv > 0

    def recevoir(self, degats):
        self.pv -= degats

    def attaquer(self, cible):
        if self.est_vivant():
            cible.recevoir(self.force)
            print(self.nom, "frappe", cible.nom)

sam = Heros("Sam", 100, 12)
orc = Heros("Orc", 40, 8)
sam.attaquer(orc)
print(orc.nom, "a", orc.pv, "PV")` },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code plante. Exécute-le, lis l'explication, puis répare-le.</p>`,
      code: BUG22,
      sol: BUG22.replace('if est_vivant():', 'if self.est_vivant():'),
      hints:['Python ne connaît pas <code>est_vivant</code> tout court. Ce n’est pas une fonction libre : c’est une méthode de l’objet.','Écris <code>self.est_vivant()</code>.'],
      check:(r, code) => {
        if (same(code, BUG22)) return START;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        if (!/Sam : À l'attaque/.test(r.out)) return 'Plus d’erreur, mais Sam (30 PV) devrait crier <code>À l\'attaque !</code>.';
        return true;
      },
      ok:'Dans une méthode, tout ce qui appartient à l’objet passe par <code>self.</code> : ses attributs et ses autres méthodes.' },
    { t:'code', h:'À toi : le soin d’équipe', file:'soin.py', mem:1,
      p:`<p>Ajoute à la classe <code>Heros</code> une méthode <code>soigner(self, allie, n)</code> : le héros soigne un <strong>autre</strong> héros de <code>n</code> PV. Puis Léa soigne Sam de 25.</p>`,
      code:`class Heros:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

sam = Heros("Sam", 40)
lea = Heros("Léa", 90)
`,
      sol:`class Heros:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

    def soigner(self, allie, n):
        allie.pv += n

sam = Heros("Sam", 40)
lea = Heros("Léa", 90)
lea.soigner(sam, 25)`,
      hints:['La méthode reçoit deux choses en plus de <code>self</code> : l’allié et le nombre de PV. C’est l’allié qu’on soigne, pas <code>self</code>.','<code>def soigner(self, allie, n):</code> puis <code>allie.pv += n</code>. Ensuite : <code>lea.soigner(sam, 25)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/def\s+soigner\s*\(\s*self\s*,\s*\w+\s*,\s*\w+\s*\)/.test(code)) return 'La méthode doit s’écrire <code>def soigner(self, allie, n):</code>.';
        if (attr(r, 'sam', 'pv') !== '65') return `Sam a ${esc(attr(r, 'sam', 'pv'))} PV. Après un soin de 25, il devrait en avoir 65.`;
        if (attr(r, 'lea', 'pv') !== '90') return 'Léa ne doit pas changer : c’est elle qui soigne, pas elle qui est soignée.';
        const t = await test([], code + '\n_a = Heros("A", 1)\n_b = Heros("B", 1)\n_a.soigner(_b, 7)\nprint("#T", _a.pv, _b.pv)');
        if (t.err || !/#T 1 8/.test(t.out)) return 'Avec d’autres héros, ça ne marche pas : utilise bien le paramètre <code>n</code> et soigne <code>allie</code>.';
        return true;
      },
      ok:'<code>self</code> est celle qui soigne, <code>allie</code> celui qui reçoit. Deux objets qui coopèrent : c’est ça, la POO.' },
    { t:'fill', lang:'java', h:'La même méthode en Java',
      p:`<p>Complète la version Java de la méthode <code>soigner</code>.</p>`,
      tpl:`public class Heros {
    String nom;
    int pv;

    [[void]] soigner([[Heros]] allie, int n) {
        [[allie]].pv += n;
    }
}

// Dans main :
lea.[[soigner]](sam, 25);`,
      hints:['La méthode ne renvoie rien. Le paramètre allie est un objet de type Heros.','<code>void</code>, <code>Heros</code>, <code>allie</code>, puis on appelle la méthode sur <code>lea</code>.'],
      ok:'Le type d’un paramètre peut être une de tes classes : <code>Heros allie</code>.' },
    { t:'code', defi:1, h:'Un soin plafonné', file:'plafond.py', mem:1,
      p:`<p>Chaque héros a un <code>pv_max</code>. Écris la méthode <code>boire(self, potion)</code> : elle ajoute <code>potion</code> PV, <strong>sans dépasser</strong> <code>pv_max</code>, et elle <strong>renvoie</strong> le nombre de PV vraiment gagnés.</p><p>Exemple : avec 90 PV sur 100, <code>boire(25)</code> met les PV à 100 et renvoie 10.</p>`,
      code:`class Heros:
    def __init__(self, nom, pv, pv_max):
        self.nom = nom
        self.pv = pv
        self.pv_max = pv_max

sam = Heros("Sam", 90, 100)
print(sam.boire(25))
`,
      sol:`class Heros:
    def __init__(self, nom, pv, pv_max):
        self.nom = nom
        self.pv = pv
        self.pv_max = pv_max

    def boire(self, potion):
        avant = self.pv
        self.pv = min(self.pv + potion, self.pv_max)
        return self.pv - avant

sam = Heros("Sam", 90, 100)
print(sam.boire(25))`,
      hints:['Retiens les PV d’avant dans une variable, puis calcule les nouveaux PV avec <code>min(…, self.pv_max)</code>.','<code>avant = self.pv</code>, <code>self.pv = min(self.pv + potion, self.pv_max)</code>, <code>return self.pv - avant</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (attr(r, 'sam', 'pv') !== '100') return 'Sam ne doit pas dépasser 100 PV.';
        if (!/^10$/m.test(r.out.trim())) return 'Avec 90 PV sur 100, <code>boire(25)</code> doit renvoyer 10.';
        const t = await test([], code + '\n_h = Heros("H", 20, 50)\nprint("#A", _h.boire(5), _h.pv)\nprint("#B", _h.boire(100), _h.pv)\nprint("#C", _h.boire(3), _h.pv)');
        if (t.err) return TESTERR(t);
        if (!/#A 5 25/.test(t.out)) return 'Avec 20 PV sur 50, boire 5 doit donner 25 PV et renvoyer 5.';
        if (!/#B 25 50/.test(t.out)) return 'Avec 25 PV sur 50, boire 100 doit plafonner à 50 PV et renvoyer 25.';
        if (!/#C 0 50/.test(t.out)) return 'Déjà au maximum, boire doit renvoyer 0.';
        return true;
      },
      ok:'La méthode modifie l’état et renvoie une information utile. Testée sur trois cas, plafond compris.' }
  ],
  recap:['<code>self</code> contient l’objet sur lequel on appelle la méthode : <code>sam.saluer()</code> = <code>Heros.saluer(sam)</code>.','En Python, <code>self.</code> est obligatoire pour les attributs <strong>et</strong> les autres méthodes : <code>self.est_vivant()</code>.','En Java, <code>this</code> est implicite. <code>this.</code> sert surtout quand un paramètre a le même nom qu’un attribut.','Le bug de l’ombre (<em>shadowing</em>) : <code>nom = nom</code> au lieu de <code>self.nom = nom</code>. L’attribut n’est jamais créé.','Une méthode peut recevoir un autre objet et lui envoyer des messages : <code>cible.recevoir(self.force)</code>.'] };

/* ---------- 2.3 ---------- */
const HEROS23 = `class Heros:
    def __init__(self, nom, force):
        self.nom = nom
        self.force = force
`;
const BUG23 = `class Heros:
    def __init__(self, nom):
        self.nom = nom
        self.niveau = 1

    def titre(self):
        print(self.nom + ", niveau " + str(self.niveau))

sam = Heros("Sam")
print("Fiche : " + sam.titre())`;
LES['p2-3'] = { title:'Attributs et méthodes', dur:'14 min',
  intro:'Des méthodes qui renvoient, d’autres qui modifient. Des attributs qui apparaissent par surprise. Et des listes remplies d’objets. Cette leçon range tout ça.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Que manque-t-il dans ce constructeur ?</p>`, snip:`def __init__(self, nom, pv):
    nom = nom
    pv = pv`,
      opts:[ {l:'Un return', why:'Un constructeur ne renvoie rien : il remplit l’objet.'},
             {l:'self. devant les attributs', ok:1},
             {l:'Des valeurs par défaut', why:'Les valeurs par défaut sont facultatives.'},
             {l:'Rien, c’est correct', why:'Sans <code>self.</code>, on ne crée que des variables locales : l’objet reste vide.'} ],
      ex:'Il faut <code>self.nom = nom</code> et <code>self.pv = pv</code>. Sinon, c’est le bug de l’ombre.' },
    { t:'say', h:'Deux genres de méthodes', file:'genres.py', mem:1,
      p:`<p>Certaines méthodes <strong>renvoient</strong> une information sans rien changer : on les appelle des accesseurs (<em>accessors</em>, ou <em>queries</em>). D'autres <strong>modifient</strong> l'état de l'objet : ce sont des modificateurs (<em>mutators</em>, ou <em>commands</em>).</p><p>Une méthode sans <code>return</code> renvoie <code>None</code>, le « rien » de Python.</p>`,
      code:`class Heros:
    def __init__(self, nom):
        self.nom = nom
        self.niveau = 1

    def titre(self):
        return f"{self.nom}, niveau {self.niveau}"

    def monter_niveau(self):
        self.niveau += 1

sam = Heros("Sam")
sam.monter_niveau()
print(sam.titre())` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Avec la classe ci-dessus, qu'affiche ce code ?</p>`, snip:`lea = Heros("Léa")
print(lea.monter_niveau())`,
      opts:[ {l:'2', why:'<code>monter_niveau</code> change bien le niveau, mais elle ne le renvoie pas : pas de <code>return</code>.'},
             {l:'Léa, niveau 2', why:'Ça, c’est ce que renvoie <code>titre()</code>, qu’on n’appelle pas ici.'},
             {l:'None', ok:1},
             {l:'Une erreur', why:'Afficher le résultat d’une méthode sans <code>return</code> ne plante pas.'} ],
      ex:'Sans <code>return</code>, une méthode renvoie <code>None</code>. Le niveau de Léa est bien passé à 2, mais <code>print</code> affiche ce que la méthode renvoie.' },
    { t:'say', h:'Des attributs qui surgissent', file:'surprise.py', mem:1,
      p:`<p>En Python, on peut ajouter un attribut à un objet n'importe quand, même hors de la classe. Il n'existe alors que sur <strong>cet</strong> objet.</p><p>Pratique ? Surtout dangereux : une faute de frappe crée un nouvel attribut sans aucune erreur. Regarde la mémoire : <code>sam</code> a maintenant un attribut <code>nivaeu</code>.</p>`,
      code:`class Heros:
    def __init__(self, nom):
        self.nom = nom
        self.niveau = 1

sam = Heros("Sam")
lea = Heros("Léa")
sam.familier = "Chouette"
sam.nivaeu = 10
print(sam.niveau)
print(sam.__dict__)
print(lea.__dict__)` },
    { t:'quiz', h:'Et chez Léa ?', p:`<p>Toujours avec ces objets, que donne <code>print(lea.familier)</code> ?</p>`,
      opts:[ {l:'Chouette', why:'L’attribut a été ajouté à l’objet <code>sam</code> seulement, pas à la classe.'},
             {l:'None', why:'Un attribut qui n’existe pas ne vaut pas <code>None</code> : il n’existe pas, tout simplement.'},
             {l:'Une AttributeError', ok:1},
             {l:'Une chaîne vide', why:'Python ne fabrique pas de valeur pour un attribut absent.'} ],
      ex:'<code>familier</code> n’existe que sur <code>sam</code>. Chez <code>lea</code>, Python lève une <code>AttributeError</code>.' },
    { t:'compare', h:'Et en Java ? Des attributs fixés d’avance',
      p:`<p>En Java, la liste des attributs est fixée dans la classe. Impossible d'en ajouter un en cours de route : le compilateur refuse. Une faute de frappe est donc attrapée tout de suite.</p>`,
      py:`sam = Heros("Sam")
sam.nivaeu = 10     # accepté sans un mot`,
      java:`Heros sam = new Heros("Sam");
sam.nivaeu = 10;    // erreur de compilation :
                    // cannot find symbol nivaeu`,
      notes:['Java connaît tous les attributs à la compilation : une faute de frappe ne passe pas.','Python crée l’attribut au moment où on lui donne une valeur.','En Python, on peut bloquer ça avec <code>__slots__ = ("nom", "niveau")</code> dans la classe. Seuls ces attributs seront alors permis.'] },
    { t:'say', h:'Des listes d’objets', file:'equipe.py', mem:1,
      p:`<p>Une liste peut contenir des objets. Avec une boucle <code>for</code>, chaque tour donne un objet complet, sur lequel on peut lire des attributs et appeler des méthodes.</p>`,
      code: HEROS23 + `
    def entrainer(self):
        self.force += 2

equipe = [Heros("Sam", 12), Heros("Léa", 15), Heros("Zoé", 9)]
for h in equipe:
    h.entrainer()
    print(h.nom, "a maintenant", h.force, "de force")` },
    { t:'compare', h:'Et en Java ? Tableaux et ArrayList',
      p:`<p>Java a deux façons de ranger plusieurs objets : le <strong>tableau</strong> (taille fixe) et l'<code>ArrayList</code> (qui grandit, comme une liste Python).</p>`,
      py:`equipe = [Heros("Sam", 12), Heros("Léa", 15)]
equipe.append(Heros("Zoé", 9))

for h in equipe:
    print(h.nom)`,
      java:`import java.util.ArrayList;

Heros[] trio = new Heros[3];      // 3 cases, toutes à null !
trio[0] = new Heros("Sam", 12);

ArrayList<Heros> equipe = new ArrayList<>();
equipe.add(new Heros("Sam", 12));
equipe.add(new Heros("Léa", 15));

for (Heros h : equipe) {
    System.out.println(h.nom);
}`,
      notes:['<code>new Heros[3]</code> crée 3 cases vides (<code>null</code>), pas 3 héros.','<code>ArrayList&lt;Heros&gt;</code> : une liste qui ne contient que des <code>Heros</code>. On la remplit avec <code>add</code>, on lit avec <code>get(i)</code>, on mesure avec <code>size()</code>.','<code>for (Heros h : equipe)</code> se lit « pour chaque Heros h dans equipe » : c’est le <code>for h in equipe</code> de Python.'] },
    { t:'quiz', lang:'java', h:'Le tableau vide', p:`<p>Qu'affiche ce code Java ?</p>`, snip:`Heros[] trio = new Heros[3];
System.out.println(trio[1]);`,
      opts:[ {l:'Un héros sans nom', why:'<code>new Heros[3]</code> ne crée aucun héros : seulement 3 cases.'},
             {l:'null', ok:1},
             {l:'0', why:'0 est la valeur par défaut des <code>int</code>. Pour des objets, c’est <code>null</code>.'},
             {l:'Une erreur : la case 1 n’existe pas', why:'Le tableau a 3 cases : 0, 1 et 2. La case 1 existe, mais elle est vide.'} ],
      ex:'Un tableau d’objets démarre rempli de <code>null</code>. Il faut créer chaque objet avec <code>new</code>.' },
    { t:'code', h:'À toi : le plus fort', file:'plus_fort.py',
      p:`<p>Écris une fonction <code>plus_fort(equipe)</code> qui reçoit une liste de héros et <strong>renvoie le héros</strong> (l'objet, pas son nom) qui a la plus grande force. Utilise une boucle. Puis affiche le nom du plus fort de <code>equipe</code>.</p>`,
      code: HEROS23 + `
equipe = [Heros("Sam", 12), Heros("Léa", 15), Heros("Zoé", 9)]
`,
      sol: HEROS23 + `
def plus_fort(equipe):
    meilleur = equipe[0]
    for h in equipe:
        if h.force > meilleur.force:
            meilleur = h
    return meilleur

equipe = [Heros("Sam", 12), Heros("Léa", 15), Heros("Zoé", 9)]
print(plus_fort(equipe).nom)`,
      hints:['Commence avec <code>meilleur = equipe[0]</code>, puis parcours la liste : si un héros a plus de force que <code>meilleur</code>, il prend sa place.','À la fin : <code>return meilleur</code>. Pour afficher le nom : <code>print(plus_fort(equipe).nom)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/def\s+plus_fort\s*\(/.test(code)) return 'Il faut une fonction <code>plus_fort(equipe)</code>.';
        if (!/Léa/.test(r.out)) return 'Affiche le nom du plus fort : ce devrait être Léa.';
        const t = await test([], code + '\n_e = [Heros("A", 3), Heros("B", 1), Heros("C", 30), Heros("D", 29)]\n_p = plus_fort(_e)\nprint("#T", _p.nom, _p is _e[2])');
        if (t.err) return TESTERR(t);
        if (/#T C False/.test(t.out)) return 'Ta fonction donne le bon nom, mais elle doit renvoyer l’objet lui-même, pas une copie.';
        if (!/#T C True/.test(t.out)) return /#T/.test(t.out) ? 'Avec une autre équipe (le plus fort est en 3e position), ta fonction ne renvoie pas le bon héros. Elle doit renvoyer l’objet <code>Heros</code>.' : 'Ta fonction doit renvoyer le héros avec <code>return</code>.';
        return true;
      },
      ok:'Ta fonction renvoie l’objet entier : on peut ensuite lire son nom, sa force, ou lui envoyer des messages.' },
    { t:'code', defi:1, h:'L’expérience et les niveaux', file:'xp.py', mem:1,
      p:`<p>Ajoute une méthode <code>gagner_xp(self, n)</code>. Elle ajoute <code>n</code> à <code>xp</code>. Puis, <strong>tant que</strong> <code>xp</code> atteint 100 ou plus, le héros monte d'un niveau et perd 100 xp.</p><p>Exemple : avec 80 xp au niveau 1, <code>gagner_xp(250)</code> donne le niveau 4 et 30 xp.</p>`,
      code:`class Heros:
    def __init__(self, nom):
        self.nom = nom
        self.niveau = 1
        self.xp = 80

sam = Heros("Sam")
sam.gagner_xp(250)
`,
      sol:`class Heros:
    def __init__(self, nom):
        self.nom = nom
        self.niveau = 1
        self.xp = 80

    def gagner_xp(self, n):
        self.xp += n
        while self.xp >= 100:
            self.niveau += 1
            self.xp -= 100

sam = Heros("Sam")
sam.gagner_xp(250)`,
      hints:['Après <code>self.xp += n</code>, une boucle <code>while self.xp &gt;= 100:</code> fait monter le niveau autant de fois qu’il faut.','Dans la boucle : <code>self.niveau += 1</code> et <code>self.xp -= 100</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (attr(r, 'sam', 'niveau') !== '4' || attr(r, 'sam', 'xp') !== '30') return `Après <code>gagner_xp(250)</code>, Sam devrait être niveau 4 avec 30 xp. Il est niveau ${esc(attr(r, 'sam', 'niveau'))} avec ${esc(attr(r, 'sam', 'xp'))} xp.`;
        const t = await test([], code + '\n_h = Heros("H")\n_h.gagner_xp(19)\nprint("#A", _h.niveau, _h.xp)\n_h.gagner_xp(1)\nprint("#B", _h.niveau, _h.xp)');
        if (t.err) return TESTERR(t);
        if (!/#A 1 99/.test(t.out)) return 'Avec 80 + 19 = 99 xp, le héros doit rester niveau 1.';
        if (!/#B 2 0/.test(t.out)) return 'Avec 99 + 1 = 100 xp pile, le héros doit passer niveau 2 avec 0 xp.';
        return true;
      },
      ok:'Testé avec 99 et 100 xp pile : ta boucle gère les cas limites.' },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code devrait afficher <code>Fiche : Sam, niveau 1</code>. Il plante. Trouve pourquoi et répare la <strong>méthode</strong>.</p>`,
      code: BUG23,
      sol: BUG23.replace('        print(self.nom + ", niveau " + str(self.niveau))', '        return self.nom + ", niveau " + str(self.niveau)'),
      hints:['La méthode <code>titre</code> affiche le texte, mais que renvoie-t-elle ? Et que se passe-t-il quand on colle <code>"Fiche : "</code> avec ça ?','Remplace le <code>print(...)</code> de la méthode par <code>return ...</code>.'],
      check:(r, code) => {
        if (same(code, BUG23)) return START;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        if (!/def titre[\s\S]*return/.test(code)) return 'Répare la méthode : elle doit <strong>renvoyer</strong> le texte.';
        if (!/Fiche : Sam, niveau 1/.test(r.out)) return 'Il faut afficher <code>Fiche : Sam, niveau 1</code>.';
        return true;
      },
      ok:'Une méthode qui fait <code>print</code> renvoie <code>None</code>, et on ne peut pas coller du texte avec <code>None</code>. Une méthode qui calcule un texte doit le renvoyer : c’est l’appelant qui décide de l’afficher.' }
  ],
  recap:['Accesseur (<em>query</em>) : renvoie une info sans rien changer. Modificateur (<em>command</em>) : change l’état.','Une méthode sans <code>return</code> renvoie <code>None</code>.','Python accepte de nouveaux attributs n’importe quand (attention aux fautes de frappe). Java fixe la liste dans la classe.','Listes d’objets : <code>[Heros(...), ...]</code> en Python, <code>ArrayList&lt;Heros&gt;</code> en Java. <code>new Heros[3]</code> donne 3 cases à <code>null</code>.'] };

/* ---------- 2.4 ---------- */
const POTION = `class Potion:
    def __init__(self, nom, soin):
        self.nom = nom
        self.soin = soin
`;
const BUG24 = `class Heros:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

castor = Heros("Castor", 100)
pollux = castor
pollux.nom = "Pollux"
print(castor.nom, "et", pollux.nom)`;
LES['p2-4'] = { title:'Références et alias', dur:'15 min',
  intro:'Une variable ne contient pas un objet : elle contient une référence, comme une adresse. Cette idée explique beaucoup de surprises. Elle marche pareil en Python et en Java.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`class Heros:
    def __init__(self):
        self.niveau = 1
    def monter(self):
        self.niveau += 1

h = Heros()
print(h.monter())`,
      opts:[ {l:'2', why:'<code>monter</code> n’a pas de <code>return</code>.'},
             {l:'1', why:'<code>print</code> affiche ce que renvoie la méthode, pas l’attribut.'},
             {l:'None', ok:1},
             {l:'Une erreur', why:'Pas d’erreur : la méthode renvoie simplement <code>None</code>.'} ],
      ex:'Sans <code>return</code>, la méthode renvoie <code>None</code>.' },
    { t:'say', h:'Deux noms, un seul objet', file:'alias.py', mem:1,
      p:`<p>Une variable contient une <strong>référence</strong> (<em>reference</em>) vers l'objet, pas l'objet lui-même. <code>b = a</code> copie la <strong>référence</strong>. Résultat : <code>a</code> et <code>b</code> désignent le même objet. On dit que <code>b</code> est un <strong>alias</strong> (<em>alias</em>) de <code>a</code>.</p><p>Ni Python ni Java ne copient un objet quand on fait <code>=</code>. (En C, copier une <code>struct</code> copiait toutes ses valeurs : ici, non.)</p>`,
      code: POTION + `
a = Potion("Soin", 20)
b = a
b.soin = 999
print(a.soin)
print(a is b)` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`p = Potion("Soin", 20)
q = p
r = Potion("Soin", 20)
q.soin = 50
print(p.soin, r.soin, p is q, p is r)`,
      opts:[ {l:'20 20 True False', why:'<code>q</code> est un alias de <code>p</code> : modifier <code>q.soin</code>, c’est modifier l’objet de <code>p</code>.'},
             {l:'50 50 True True', why:'<code>r</code> est un objet créé à part : il garde 20, et ce n’est pas le même objet.'},
             {l:'50 20 True False', ok:1},
             {l:'50 20 False False', why:'<code>q = p</code> copie la référence : p et q sont bien le même objet.'} ],
      ex:'p et q : un seul objet, deux noms. r : un autre objet, avec les mêmes valeurs au départ.' },
    { t:'say', h:'id() : l’adresse de l’objet', file:'id.py',
      p:`<p>La fonction <code>id()</code> donne un numéro unique pour chaque objet vivant, un peu comme son adresse en mémoire. Deux alias ont le même <code>id</code>.</p><p>Et pour l'instant, <code>==</code> entre deux objets de ta classe fait comme <code>is</code> : il compare les identités. On apprendra à changer ça au chapitre 4.</p>`,
      code: POTION + `
a = Potion("Soin", 20)
b = a
c = Potion("Soin", 20)
print(id(a) == id(b))
print(id(a) == id(c))
print(a == c)` },
    { t:'compare', h:'Et en Java ? Pareil',
      p:`<p>En Java, une variable d'un type objet contient aussi une référence. Et <code>==</code> compare les <strong>références</strong> : « est-ce le même objet ? ».</p>`,
      py:`a = Potion("Soin", 20)
b = a
b.soin = 999
print(a.soin)    # 999
print(a is b)    # True`,
      java:`Potion a = new Potion("Soin", 20);
Potion b = a;          // copie de la référence
b.soin = 999;
System.out.println(a.soin);     // 999
System.out.println(a == b);     // true`,
      notes:['<code>Potion b = a;</code> ne crée aucun objet : seul <code>new</code> en crée un.','Le <code>==</code> de Java sur des objets fait comme le <code>is</code> de Python.','Les types de base de Java (<code>int</code>, <code>double</code>, <code>boolean</code>…) ne sont pas des objets : pour eux, <code>=</code> copie vraiment la valeur.'] },
    { t:'say', h:'Passer un objet à une fonction', file:'passage.py', mem:1,
      p:`<p>Quand on passe un objet à une fonction, elle reçoit une <strong>copie de la référence</strong>. Elle peut donc <strong>modifier l'objet</strong>, et ça se voit dehors.</p><p>Mais si elle range un <strong>autre objet</strong> dans son paramètre, ça ne change que sa variable locale. La variable de l'appelant n'est pas touchée.</p>`,
      code: POTION + `
def doubler(p):
    p.soin = p.soin * 2

def remplacer(p):
    p = Potion("Eau", 0)

fiole = Potion("Soin", 20)
doubler(fiole)
print(fiole.soin)
remplacer(fiole)
print(fiole.nom, fiole.soin)` },
    { t:'quiz', h:'Et là ?', p:`<p>Qu'affiche ce code ?</p>`, snip:`def renommer(h):
    h.nom = "Bob"
    h = Heros("Zed")
    h.nom = "Max"

sam = Heros("Sam")
renommer(sam)
print(sam.nom)`,
      opts:[ {l:'Sam', why:'La première ligne de la fonction modifie bien l’objet de <code>sam</code>.'},
             {l:'Bob', ok:1},
             {l:'Zed', why:'<code>h = Heros("Zed")</code> range un nouvel objet dans la variable locale <code>h</code>. <code>sam</code> n’est pas touché.'},
             {l:'Max', why:'Au moment de <code>h.nom = "Max"</code>, <code>h</code> désigne le nouvel objet, plus celui de <code>sam</code>.'} ],
      ex:'D’abord, <code>h</code> désigne l’objet de sam : il devient Bob. Ensuite, <code>h</code> désigne un nouvel objet. Sam reste Bob.' },
    { t:'say', h:'None : aucun objet', file:'none.py', mem:1,
      p:`<p><code>None</code> veut dire « aucun objet ». Une variable qui vaut <code>None</code> ne désigne rien. Si on essaie de lire un attribut dessus, Python lève une <code>AttributeError</code>.</p><p>Le réflexe : vérifier avec <code>is not None</code> avant d'utiliser une variable qui peut être vide.</p>`,
      code:`class Heros:
    def __init__(self, nom):
        self.nom = nom
        self.arme = None

sam = Heros("Sam")
if sam.arme is not None:
    print(sam.nom, "a une arme :", sam.arme)
else:
    print(sam.nom, "se bat à mains nues")` },
    { t:'compare', h:'Et en Java ? null',
      p:`<p>En Java, « aucun objet » s'écrit <code>null</code>. Appeler une méthode ou lire un attribut sur <code>null</code> provoque la célèbre <code>NullPointerException</code>. Son inventeur l'a appelée « l'erreur à un milliard de dollars ».</p>`,
      py:`arme = None
if arme is not None:
    print(arme.nom)

arme.nom      # AttributeError`,
      java:`Arme arme = null;
if (arme != null) {
    System.out.println(arme.nom);
}

arme.nom;     // NullPointerException`,
      notes:['<code>None</code> en Python, <code>null</code> en Java.','Test en Python : <code>is None</code> / <code>is not None</code>. En Java : <code>== null</code> / <code>!= null</code>.','En Java, un attribut de type objet non initialisé vaut <code>null</code> : pense à l’initialiser dans le constructeur.'] },
    { t:'quiz', lang:'java', h:'Où ça plante ?', p:`<p>À quelle ligne ce code Java plante-t-il ?</p>`, snip:`Heros[] equipe = new Heros[2];             // ligne 1
equipe[0] = new Heros("Sam");              // ligne 2
System.out.println(equipe[0].nom);         // ligne 3
System.out.println(equipe[1].nom);         // ligne 4`,
      opts:[ {l:'Ligne 1', why:'Créer un tableau de 2 cases est permis.'},
             {l:'Ligne 3', why:'La case 0 contient bien Sam.'},
             {l:'Ligne 4', ok:1},
             {l:'Nulle part', why:'La case 1 n’a jamais reçu de héros : elle vaut <code>null</code>.'} ],
      ex:'<code>equipe[1]</code> vaut <code>null</code>. Lire <code>.nom</code> dessus provoque une <code>NullPointerException</code>.' },
    { t:'code', h:'À toi : une vraie copie', file:'copie.py', mem:1,
      p:`<p>Crée <code>copie</code>, une <strong>vraie copie</strong> de <code>fiole</code> : un nouvel objet <code>Potion</code> avec le même nom et le même soin. Puis change le soin de la copie à 80. La fiole doit garder 20.</p>`,
      code: POTION + `
fiole = Potion("Soin", 20)
`,
      sol: POTION + `
fiole = Potion("Soin", 20)
copie = Potion(fiole.nom, fiole.soin)
copie.soin = 80`,
      hints:['<code>copie = fiole</code> ne crée pas d’objet : ce serait un alias. Il faut appeler <code>Potion(...)</code>.','<code>copie = Potion(fiole.nom, fiole.soin)</code>, puis <code>copie.soin = 80</code>.'],
      check:r => {
        if (r.err) return ERR;
        if (!memOf(r, 'copie')) return 'Il faut une variable <code>copie</code>.';
        if (attr(r, 'fiole', 'soin') !== '20') return 'La fiole a changé ! <code>copie</code> est sans doute un alias de <code>fiole</code>. Crée un nouvel objet avec <code>Potion(...)</code>.';
        if (attr(r, 'copie', 'soin') !== '80') return 'Change le soin de la copie à 80.';
        if (attr(r, 'copie', 'nom') !== "'Soin'") return 'La copie doit avoir le même nom que la fiole.';
        return true;
      },
      ok:'Deux objets distincts : changer l’un ne touche pas l’autre. Python a aussi le module <code>copy</code> pour ça, que tu croiseras peut-être.' },
    { t:'code', bug:1, h:'Les faux jumeaux', file:'bug.py', mem:1,
      p:`<p>On voulait deux héros jumeaux, Castor et Pollux, avec 100 PV chacun. Mais le code affiche <code>Pollux et Pollux</code>. Répare-le.</p>`,
      code: BUG24,
      sol: BUG24.replace('pollux = castor\npollux.nom = "Pollux"', 'pollux = Heros("Pollux", 100)'),
      hints:['<code>pollux = castor</code> ne crée pas un deuxième héros.','Crée Pollux avec <code>Heros("Pollux", 100)</code>.'],
      check:(r, code) => {
        if (same(code, BUG24)) return START;
        if (r.err) return ERR;
        if (attr(r, 'castor', 'nom') !== "'Castor'") return 'Castor doit garder son nom.';
        if (attr(r, 'pollux', 'nom') !== "'Pollux'" || attr(r, 'pollux', 'pv') !== '100') return 'Pollux doit s’appeler Pollux et avoir 100 PV.';
        if (!/Castor et Pollux/.test(r.out)) return 'Garde le <code>print</code> final : il doit afficher <code>Castor et Pollux</code>.';
        return true;
      },
      ok:'Seul l’appel de la classe crée un objet. <code>=</code> ne fait que donner un nom de plus.' },
    { t:'code', defi:1, h:'Échanger les armes', file:'echange.py', mem:1,
      p:`<p>Écris une fonction <code>echanger_armes(h1, h2)</code> qui échange l'attribut <code>arme</code> des deux héros. Puis échange les armes de Sam et Léa.</p>`,
      code:`class Heros:
    def __init__(self, nom, arme):
        self.nom = nom
        self.arme = arme

sam = Heros("Sam", "épée")
lea = Heros("Léa", "arc")
`,
      sol:`class Heros:
    def __init__(self, nom, arme):
        self.nom = nom
        self.arme = arme

def echanger_armes(h1, h2):
    h1.arme, h2.arme = h2.arme, h1.arme

sam = Heros("Sam", "épée")
lea = Heros("Léa", "arc")
echanger_armes(sam, lea)`,
      hints:['La fonction reçoit des références vers les deux objets : elle peut modifier leurs attributs.','<code>h1.arme, h2.arme = h2.arme, h1.arme</code>, ou avec une variable temporaire.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/def\s+echanger_armes\s*\(/.test(code)) return 'Il faut une fonction <code>echanger_armes(h1, h2)</code>.';
        if (attr(r, 'sam', 'arme') !== "'arc'" || attr(r, 'lea', 'arme') !== "'épée'") return 'Après l’échange, Sam doit avoir l’arc et Léa l’épée.';
        const t = await test([], code + '\n_a = Heros("A", "x")\n_b = Heros("B", "y")\nechanger_armes(_a, _b)\nprint("#T", _a.arme, _b.arme)');
        if (t.err || !/#T y x/.test(t.out)) return 'Ta fonction ne marche pas avec d’autres héros : elle doit échanger les attributs de <code>h1</code> et <code>h2</code>.';
        return true;
      },
      ok:'La fonction n’a rien renvoyé, et pourtant les deux objets ont changé : elle a travaillé à travers les références.' }
  ],
  recap:['Une variable contient une <strong>référence</strong> vers un objet. <code>b = a</code> crée un <strong>alias</strong> : un objet, deux noms.','<code>is</code> (Python) et <code>==</code> (Java) sur des objets : « est-ce le même objet ? ».','Une fonction qui reçoit un objet peut le modifier. Mais réaffecter son paramètre ne change pas la variable de l’appelant.','<code>None</code> / <code>null</code> : aucun objet. Vérifie avant d’utiliser : <code>is not None</code>, <code>!= null</code>. Sinon : <code>AttributeError</code> / <code>NullPointerException</code>.'] };

/* ---------- 2.5 ---------- */
const P1 = `class Personnage:
    def __init__(self, nom, pv_max=100, force=10):
        self.nom = nom
        self.pv_max = pv_max
        self.pv = pv_max
        self.force = force
        self.niveau = 1`;
const P2 = `
    def est_vivant(self):
        return self.pv > 0

    def recevoir(self, degats):
        self.pv = max(0, self.pv - degats)

    def soigner(self, n):
        self.pv = min(self.pv_max, self.pv + n)`;
const P3 = `
    def attaquer(self, cible):
        cible.recevoir(self.force)
        return f"{self.nom} attaque {cible.nom} ({self.force} dégâts)"`;
const P4 = `
heros = Personnage("Sam", 100, 15)
gobelin = Personnage("Gobelin", 60, 8)
while heros.est_vivant() and gobelin.est_vivant():
    print(heros.attaquer(gobelin))
    if gobelin.est_vivant():
        print(gobelin.attaquer(heros))
if heros.est_vivant():
    print("Victoire de", heros.nom)
else:
    print("Victoire de", gobelin.nom)`;
LES['p2-5'] = { title:'Projet : la classe Personnage', dur:'18 min',
  intro:'Tu construis la classe centrale de notre jeu de rôle, étape par étape, puis tu lances un vrai combat. On la fera grandir dans les chapitres suivants.',
  steps:[
    { t:'say', h:'Le projet',
      p:`<p>Voici ce que ton programme affichera à la fin : un combat au tour par tour entre Sam et un gobelin.</p>`,
      snip:`Sam attaque Gobelin (15 dégâts)
Gobelin attaque Sam (8 dégâts)
Sam attaque Gobelin (15 dégâts)
Gobelin attaque Sam (8 dégâts)
Sam attaque Gobelin (15 dégâts)
Gobelin attaque Sam (8 dégâts)
Sam attaque Gobelin (15 dégâts)
Victoire de Sam`,
      p2:`<p>On le construit en quatre étapes. À chaque étape, je reprends ton code de l'étape d'avant.</p>` },
    { t:'code', h:'Étape 1 : le constructeur', file:'personnage.py', mem:1,
      p:`<p>Écris la classe <code>Personnage</code>. Son constructeur reçoit <code>nom</code>, <code>pv_max</code> (100 par défaut) et <code>force</code> (10 par défaut). Il crée cinq attributs : <code>nom</code>, <code>pv_max</code>, <code>pv</code> (qui démarre égal à <code>pv_max</code>), <code>force</code> et <code>niveau</code> (qui démarre à 1).</p><p>Pour tester, crée <code>sam = Personnage("Sam", 120)</code>.</p>`,
      code:``,
      sol: P1 + `

sam = Personnage("Sam", 120)`,
      hints:['<code>def __init__(self, nom, pv_max=100, force=10):</code>','<code>self.pv = pv_max</code> et <code>self.niveau = 1</code> ne viennent pas de paramètres à eux.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/class\s+Personnage/.test(code)) return 'Il faut une classe <code>Personnage</code>.';
        const t = await test([], code + '\n_p = Personnage("P")\n_q = Personnage("Q", 50, 7)\nprint("#T", _p.nom, _p.pv_max, _p.pv, _p.force, _p.niveau, _q.pv_max, _q.pv, _q.force)');
        if (t.err) return TESTERR(t);
        if (!/#T P 100 100 10 1 50 50 7/.test(t.out)) return 'Je crée <code>Personnage("P")</code> et <code>Personnage("Q", 50, 7)</code>, et les attributs ne sont pas bons. Vérifie les valeurs par défaut, et que <code>pv</code> démarre à <code>pv_max</code>.';
        return true;
      },
      ok:'Le constructeur crée tous les attributs, et l’objet démarre plein de vie.' },
    { t:'code', carry:1, h:'Étape 2 : vivre, souffrir, guérir', file:'personnage.py', mem:1,
      p:`<p>Ajoute trois méthodes <strong>dans la classe</strong> (décalées de 4 espaces, avant <code>sam = ...</code>) :</p><ul><li><code>est_vivant()</code> renvoie <code>True</code> si les PV sont au-dessus de 0 ;</li><li><code>recevoir(degats)</code> enlève les dégâts, sans descendre sous 0 ;</li><li><code>soigner(n)</code> ajoute n PV, sans dépasser <code>pv_max</code>.</li></ul>`,
      code:`# Étape 2 : place tes méthodes dans la classe, au-dessus de sam = ...
`,
      sol: P1 + P2 + `

sam = Personnage("Sam", 120)`,
      hints:['<code>max(0, ...)</code> empêche de descendre sous 0, <code>min(self.pv_max, ...)</code> empêche de dépasser le maximum.','<code>self.pv = max(0, self.pv - degats)</code> et <code>self.pv = min(self.pv_max, self.pv + n)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + '\n_p = Personnage("P", 50)\n_p.recevoir(20)\nprint("#A", _p.pv, _p.est_vivant())\n_p.soigner(100)\nprint("#B", _p.pv)\n_p.recevoir(80)\nprint("#C", _p.pv, _p.est_vivant())');
        if (t.err) return TESTERR(t);
        if (!/#A 30 True/.test(t.out)) return 'Un personnage de 50 PV qui reçoit 20 dégâts doit avoir 30 PV et être vivant.';
        if (!/#B 50/.test(t.out)) return 'Un soin de 100 ne doit pas dépasser <code>pv_max</code> (50 ici).';
        if (!/#C 0 False/.test(t.out)) return '80 dégâts sur 50 PV doivent laisser le personnage à 0 PV (pas en négatif), et il n’est plus vivant.';
        return true;
      },
      ok:'Les PV restent toujours entre 0 et le maximum. Ce sont les méthodes qui font respecter cette règle.' },
    { t:'code', carry:1, h:'Étape 3 : attaquer', file:'personnage.py', mem:1,
      p:`<p>Ajoute dans la classe une méthode <code>attaquer(cible)</code> : la cible reçoit autant de dégâts que la force de l'attaquant, et la méthode <strong>renvoie</strong> un texte comme <code>Sam attaque Gobelin (15 dégâts)</code>.</p>`,
      code:`# Étape 3 : ajoute attaquer dans la classe
`,
      sol: P1 + P2 + P3 + `

sam = Personnage("Sam", 120)`,
      hints:['La cible est un autre Personnage : appelle sa méthode <code>recevoir</code> avec <code>self.force</code>.','<code>cible.recevoir(self.force)</code>, puis <code>return f"{self.nom} attaque {cible.nom} ({self.force} dégâts)"</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + '\n_a = Personnage("Ana", 100, 7)\n_b = Personnage("Bob", 30)\nprint("#T", _a.attaquer(_b))\nprint("#P", _b.pv, _a.pv)');
        if (t.err) return TESTERR(t);
        if (!/#P 23 100/.test(t.out)) return 'Quand Ana (force 7) attaque Bob (30 PV), Bob doit tomber à 23 PV, et Ana garder les siens.';
        if (!/#T Ana attaque Bob \(7 dégâts\)/.test(t.out)) return 'La méthode doit <strong>renvoyer</strong> le texte <code>Ana attaque Bob (7 dégâts)</code>.';
        return true;
      },
      ok:'Un objet qui envoie un message à un autre objet. Tout le jeu va reposer là-dessus.' },
    { t:'code', carry:1, h:'Étape 4 : le combat', file:'personnage.py',
      p:`<p>Remplace la ligne <code>sam = ...</code> par le combat : crée <code>heros</code> (Sam, 100 PV, force 15) et <code>gobelin</code> (Gobelin, 60 PV, force 8). Tant que les deux sont vivants, le héros attaque, puis le gobelin riposte s'il est encore vivant. Affiche chaque attaque, puis <code>Victoire de ...</code>.</p>`,
      code:`# Étape 4 : le combat (remplace la ligne sam = ...)
`,
      sol: P1 + P2 + P3 + '\n' + P4,
      hints:['La boucle : <code>while heros.est_vivant() and gobelin.est_vivant():</code>, avec <code>print(heros.attaquer(gobelin))</code> dedans.','La riposte : <code>if gobelin.est_vivant():</code> puis <code>print(gobelin.attaquer(heros))</code>. Après la boucle, un <code>if</code> pour annoncer le vainqueur.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const l = linesOf(r.out);
        if (l.filter(x => /^Sam attaque Gobelin \(15 dégâts\)$/.test(x)).length !== 4) return 'Sam doit attaquer 4 fois le gobelin (60 PV, 15 dégâts par coup).';
        if (l.filter(x => /^Gobelin attaque Sam \(8 dégâts\)$/.test(x)).length !== 3) return 'Le gobelin doit riposter 3 fois : pas de riposte quand il vient de tomber.';
        if (!/Victoire de Sam/.test(r.out)) return 'Il manque l’annonce <code>Victoire de Sam</code>.';
        const t = await test([], code.replace(/Personnage\(\s*"Gobelin"\s*,\s*60\s*,\s*8\s*\)/, 'Personnage("Gobelin", 500, 40)'));
        if (t.err || !/Victoire de Gobelin/.test(t.out)) return 'Je donne 500 PV et 40 de force au gobelin : il devrait gagner, mais ton code n’annonce pas <code>Victoire de Gobelin</code>.';
        return true;
      },
      ok:'Testé aussi avec un gobelin géant : il gagne, et ton code l’annonce. Tu as un vrai petit moteur de combat !' },
    { t:'compare', h:'Ta classe en Java',
      p:`<p>Voici ta classe <code>Personnage</code> traduite en Java. Compare ligne à ligne.</p>`,
      py: P1 + P2 + P3,
      java:`public class Personnage {
    String nom;
    int pvMax, pv, force, niveau;

    Personnage(String nom, int pvMax, int force) {
        this.nom = nom;
        this.pvMax = pvMax;
        this.pv = pvMax;
        this.force = force;
        this.niveau = 1;
    }

    Personnage(String nom) {
        this(nom, 100, 10);
    }

    boolean estVivant() {
        return pv > 0;
    }

    void recevoir(int degats) {
        pv = Math.max(0, pv - degats);
    }

    void soigner(int n) {
        pv = Math.min(pvMax, pv + n);
    }

    String attaquer(Personnage cible) {
        cible.recevoir(force);
        return nom + " attaque " + cible.nom + " (" + force + " dégâts)";
    }
}`,
      notes:['Les valeurs par défaut deviennent un deuxième constructeur qui appelle le premier avec <code>this(...)</code>.','<code>max</code> et <code>min</code> deviennent <code>Math.max</code> et <code>Math.min</code>.','<code>int pvMax, pv, force, niveau;</code> déclare quatre attributs du même type sur une ligne.'] },
    { t:'say', h:'Mini-défi dans VS Code',
      p:`<p>Recopie cette classe Java dans <code>Personnage.java</code>, et ajoute une méthode <code>main</code> qui rejoue le combat Sam contre Gobelin. Tu dois obtenir exactement le même affichage qu'en Python.</p><p>Indice : la boucle s'écrit <code>while (heros.estVivant() &amp;&amp; gobelin.estVivant()) { ... }</code>.</p><p>Au chapitre 3, on protégera les PV pour que personne ne puisse tricher avec <code>heros.pv = 9999</code>.</p>` }
  ],
  recap:['Un constructeur complet initialise <strong>tous</strong> les attributs, certains depuis les paramètres, d’autres avec une valeur de départ.','Les méthodes font respecter les règles (PV entre 0 et le maximum).','Un objet coopère avec un autre en appelant ses méthodes : <code>cible.recevoir(self.force)</code>.','Construire par petites étapes, et tester chaque méthode avant de passer à la suite.'] };

Atelier.chapter({ part:"poo", n:2, title:"Classes et objets",
  lessons:['p2-1','p2-2','p2-3','p2-4','p2-5'].map(id => ({ id, ...LES[id] })) });
})();
