/* Partie POO · Chapitre 4 : Membres de classe, égalité et cycle de vie */
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has } = Atelier.h;
const LES = {};
const attr = (r, o, a) => { const m = memOf(r, o); const x = m && m.attrs && m.attrs.find(t => t.name === a); return x ? x.repr : undefined; };
const same = (code, start) => code.trim() === start.trim();
const START = 'Voilà le bug ! Exécute, lis ce qui se passe, puis corrige le code.';
const TESTERR = t => 'Mes tests font planter ton code : ' + esc(t.err.title) + '. Vérifie les noms de ta classe, de tes méthodes et de leurs paramètres.';
const tryPy = (tag, stmt, exc = 'ValueError') => `\ntry:\n    ${stmt}\n    print("#${tag} PASSE")\nexcept ${exc}:\n    print("#${tag} ERREUR")`;

/* ---------- 4.1 ---------- */
const BUG41 = `class Monstre:
    nombre = 0

    def __init__(self, nom):
        self.nom = nom
        self.nombre += 1

a = Monstre("Rat")
b = Monstre("Loup")
c = Monstre("Ours")
print("Monstres créés :", Monstre.nombre)`;
LES['p4-1'] = { title:'Attributs et méthodes de classe (static)', dur:'14 min',
  intro:'Jusqu’ici, chaque objet avait ses propres attributs. Mais certaines informations appartiennent à la classe entière : un compteur, une constante, une fonction utilitaire. Ce sont les membres de classe, le static de Java.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur le chapitre d’avant', p:`<p>Quel est l'invariant le plus logique pour une classe <code>Inventaire</code> qui a une capacité ?</p>`,
      opts:[ {l:'Le nombre d’objets est toujours égal à la capacité', why:'Un inventaire peut être à moitié vide. L’invariant est une limite, pas une égalité.'},
             {l:'Le nombre d’objets ne dépasse jamais la capacité', ok:1},
             {l:'On ne peut jamais retirer d’objet', why:'Ce serait une règle bizarre, et pas nécessaire pour que l’objet reste cohérent.'},
             {l:'La liste des objets est publique', why:'C’est même le contraire : on la cache pour protéger l’invariant.'} ],
      ex:'<code>len(objets) &lt;= capacite</code> : le constructeur l’établit (sac vide), et <code>ajouter</code> le préserve.' },
    { t:'say', h:'Un attribut partagé par toute la classe', file:'compteur.py', mem:1,
      p:`<p>Un attribut écrit <strong>directement dans la classe</strong> (hors de <code>__init__</code>) est un <strong>attribut de classe</strong> (<em>class attribute</em>). Il en existe <strong>une seule copie</strong>, partagée par tous les objets. On le lit et on le modifie à travers la classe : <code>Potion.fabriquees</code>.</p><p>Ici, chaque potion reçoit un numéro de série grâce au compteur commun. Regarde la mémoire : <code>numero</code> est dans chaque objet, <code>fabriquees</code> n'y est pas.</p>`,
      code:`class Potion:
    fabriquees = 0
    SOIN_MAX = 100

    def __init__(self, nom, soin):
        Potion.fabriquees += 1
        self.numero = Potion.fabriquees
        self.nom = nom
        self.soin = min(soin, Potion.SOIN_MAX)

p1 = Potion("Petite", 20)
p2 = Potion("Géante", 300)
p3 = Potion("Moyenne", 50)
print("Potions fabriquées :", Potion.fabriquees)
print(p2.nom, "n°", p2.numero, ":", p2.soin, "PV")` },
    { t:'say', h:'Membre d’objet ou membre de classe ?',
      p:`<p>Un <strong>membre d'instance</strong> (<em>instance member</em>) appartient à chaque objet : chacun a sa copie. Exemple : les PV d'un personnage.</p><p>Un <strong>membre de classe</strong> (<em>class member</em>, ou <em>static member</em> en Java) appartient à la classe : une seule copie pour tous. Exemples : le nombre de personnages créés, le niveau maximum du jeu.</p><p>Les constantes s'écrivent en MAJUSCULES par convention : <code>SOIN_MAX</code>, <code>NIVEAU_MAX</code>.</p>` },
    { t:'compare', h:'Et en Java ? static',
      p:`<p>En Java, le mot <code>static</code> fait d'un attribut un attribut de classe. Et <code>static final</code> crée une constante.</p>`,
      py:`class Potion:
    fabriquees = 0
    SOIN_MAX = 100

    def __init__(self, nom, soin):
        Potion.fabriquees += 1
        self.numero = Potion.fabriquees
        self.nom = nom

print(Potion.fabriquees)`,
      java:`public class Potion {
    private static int fabriquees = 0;          // une seule copie
    public static final int SOIN_MAX = 100;     // constante

    private final int numero;                   // une par objet
    private String nom;

    public Potion(String nom) {
        fabriquees++;
        numero = fabriquees;
        this.nom = nom;
    }

    public static int getFabriquees() {
        return fabriquees;
    }
}

System.out.println(Potion.getFabriquees());
System.out.println(Potion.SOIN_MAX);`,
      notes:['On accède à un membre <code>static</code> par le nom de la classe : <code>Potion.SOIN_MAX</code>.','<code>static final</code> = constante : partagée et jamais modifiée. Nom en MAJUSCULES.','<code>fabriquees++</code> veut dire <code>fabriquees += 1</code>.'] },
    { t:'say', h:'Le piège du self.compteur', file:'piege.py', mem:1,
      p:`<p>Attention, piège classique ! <code>self.nombre += 1</code> <strong>lit</strong> l'attribut de classe (0), puis <strong>crée un attribut d'objet</strong> <code>nombre</code> qui vaut 1. Le compteur commun ne bouge jamais.</p><p>Regarde la mémoire : chaque monstre a son propre <code>nombre</code> à 1, et le compteur de la classe est resté à 0.</p>`,
      code: BUG41 },
    { t:'code', bug:1, h:'Répare le compteur', file:'bug.py', mem:1,
      p:`<p>Corrige ce code pour que <code>Monstre.nombre</code> compte vraiment les monstres créés.</p>`,
      code: BUG41,
      sol: BUG41.replace('self.nombre += 1', 'Monstre.nombre += 1'),
      hints:['Pour modifier un attribut de classe, on passe par la classe, pas par <code>self</code>.','Écris <code>Monstre.nombre += 1</code>.'],
      check:(r, code) => {
        if (same(code, BUG41)) return START;
        if (r.err) return ERR;
        if (attr(r, 'a', 'nombre') !== undefined) return 'Les monstres ont encore un attribut <code>nombre</code> à eux. Modifie celui de la classe.';
        if (!/Monstres créés : 3/.test(r.out)) return 'Il faut afficher <code>Monstres créés : 3</code>.';
        return true;
      },
      ok:'Pour lire, <code>self.nombre</code> marcherait. Pour modifier un attribut de classe, passe toujours par la classe.' },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`class Jeu:
    NIVEAU_MAX = 50

a = Jeu()
b = Jeu()
Jeu.NIVEAU_MAX = 60
print(a.NIVEAU_MAX, b.NIVEAU_MAX)`,
      opts:[ {l:'50 50', why:'On a modifié l’attribut de la classe, et a et b le lisent à travers elle.'},
             {l:'60 60', ok:1},
             {l:'50 60', why:'a et b n’ont pas de copie à eux : ils lisent tous les deux l’attribut de la classe.'},
             {l:'Une erreur', why:'On peut lire un attribut de classe à travers un objet.'} ],
      ex:'Une seule copie, dans la classe. Tous les objets voient le changement. (Une vraie constante, on ne devrait pas la modifier : en Java, <code>final</code> l’interdirait.)' },
    { t:'say', h:'Les méthodes statiques', file:'statique.py',
      p:`<p>Une <strong>méthode statique</strong> (<em>static method</em>) appartient à la classe et ne travaille sur <strong>aucun objet</strong> : elle n'a pas de <code>self</code>. C'est une fonction utilitaire rangée dans la classe qui lui correspond. En Python, on la marque avec <code>@staticmethod</code>.</p><p>Tu en utilises déjà en Java : <code>Math.max(a, b)</code>, <code>Math.sqrt(2)</code>, <code>Integer.parseInt("42")</code>.</p>`,
      code:`class De:
    @staticmethod
    def lancer_total(resultats):
        return sum(resultats)

    @staticmethod
    def est_critique(resultat):
        return resultat == 20

print(De.lancer_total([4, 6, 12]))
print(De.est_critique(20))` },
    { t:'compare', h:'Méthodes statiques en Java',
      p:`<p>En Java, une méthode <code>static</code> ne peut pas utiliser les attributs d'objet : il n'y a pas de <code>this</code>. C'est pour ça que <code>main</code> est <code>static</code> : au démarrage du programme, aucun objet n'existe encore.</p>`,
      py:`class De:
    @staticmethod
    def est_critique(resultat):
        return resultat == 20

print(De.est_critique(20))`,
      java:`public class De {
    public static boolean estCritique(int resultat) {
        return resultat == 20;
    }

    public static void main(String[] args) {
        System.out.println(De.estCritique(20));
    }
}`,
      notes:['On appelle une méthode statique par la classe : <code>De.estCritique(20)</code>.','Dans une méthode <code>static</code>, utiliser un attribut d’objet (non <code>static</code>) donne une erreur de compilation.','Au chapitre 1, nos méthodes Java étaient <code>static</code> parce qu’on n’avait pas encore d’objets.'] },
    { t:'quiz', lang:'java', h:'Ça compile ?', p:`<p>Pourquoi ce code Java ne compile-t-il pas ?</p>`, snip:`public class Heros {
    private int pv = 100;

    public static boolean estVivant() {
        return pv > 0;
    }
}`,
      opts:[ {l:'pv doit être public', why:'Une méthode de la classe a le droit de lire un attribut <code>private</code>. Le problème est ailleurs.'},
             {l:'Une méthode static ne peut pas lire un attribut d’objet', ok:1},
             {l:'Il manque un return', why:'Le <code>return</code> est bien là.'},
             {l:'boolean doit s’écrire Boolean', why:'<code>boolean</code> en minuscules est correct.'} ],
      ex:'Une méthode <code>static</code> n’est liée à aucun objet : de quel héros lirait-elle les PV ? Il faut enlever <code>static</code>.' },
    { t:'code', h:'À toi : des héros numérotés', file:'numeros.py', mem:1,
      p:`<p>Écris une classe <code>Heros</code> avec un attribut de classe <code>total</code> (0 au départ) et une constante <code>NIVEAU_MAX = 99</code>. Le constructeur reçoit un <code>nom</code>, augmente <code>total</code>, et donne à chaque héros un <code>matricule</code> : <code>"H-1"</code>, <code>"H-2"</code>…</p><p>Crée trois héros <code>a</code>, <code>b</code>, <code>c</code>, puis affiche <code>Heros.total</code>.</p>`,
      code:``,
      sol:`class Heros:
    total = 0
    NIVEAU_MAX = 99

    def __init__(self, nom):
        Heros.total += 1
        self.nom = nom
        self.matricule = "H-" + str(Heros.total)

a = Heros("Sam")
b = Heros("Léa")
c = Heros("Zoé")
print(Heros.total)`,
      hints:['<code>total = 0</code> et <code>NIVEAU_MAX = 99</code> s’écrivent dans la classe, au-dessus de <code>__init__</code>.','Dans le constructeur : <code>Heros.total += 1</code>, puis <code>self.matricule = "H-" + str(Heros.total)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (attr(r, 'a', 'matricule') !== "'H-1'" || attr(r, 'c', 'matricule') !== "'H-3'") return 'Les matricules doivent être H-1 pour a, H-2 pour b et H-3 pour c.';
        if (attr(r, 'a', 'total') !== undefined) return 'Les héros ne doivent pas avoir leur propre <code>total</code> : modifie celui de la classe avec <code>Heros.total</code>.';
        if (!/^3$/m.test(r.out.trim())) return 'Affiche <code>Heros.total</code> : 3.';
        const t = await test([], code + '\n_d = Heros("D")\nprint("#T", _d.matricule, Heros.total, Heros.NIVEAU_MAX)');
        if (t.err || !/#T H-4 4 99/.test(t.out)) return 'Un quatrième héros devrait avoir le matricule H-4, et la constante <code>NIVEAU_MAX</code> doit valoir 99.';
        return true;
      },
      ok:'Un compteur partagé, un numéro par objet, une constante : tu sais faire la différence entre les deux genres de membres.' },
    { t:'code', defi:1, h:'Une boîte à outils statique', file:'outils.py',
      p:`<p>Écris une classe <code>Regles</code> avec deux méthodes statiques :</p><ul><li><code>degats(force, defense)</code> renvoie <code>force - defense</code>, mais jamais moins de 1 ;</li><li><code>xp_pour(niveau)</code> renvoie l'expérience nécessaire pour atteindre ce niveau : <code>100 * niveau * niveau</code>.</li></ul><p>Affiche <code>Regles.degats(5, 12)</code> et <code>Regles.xp_pour(3)</code>.</p>`,
      code:``,
      sol:`class Regles:
    @staticmethod
    def degats(force, defense):
        return max(1, force - defense)

    @staticmethod
    def xp_pour(niveau):
        return 100 * niveau * niveau

print(Regles.degats(5, 12))
print(Regles.xp_pour(3))`,
      hints:['Chaque méthode a <code>@staticmethod</code> au-dessus, et <strong>pas</strong> de <code>self</code>.','<code>return max(1, force - defense)</code> et <code>return 100 * niveau * niveau</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if ((code.match(/@staticmethod/g) || []).length < 2) return 'Les deux méthodes doivent être marquées <code>@staticmethod</code>.';
        if (/def\s+\w+\s*\(\s*self/.test(code)) return 'Une méthode statique n’a pas de <code>self</code>.';
        const t = await test([], code + '\nprint("#T", Regles.degats(5, 12), Regles.degats(20, 8), Regles.xp_pour(1), Regles.xp_pour(10))');
        if (t.err) return TESTERR(t);
        if (!/#T 1 12 100 10000/.test(t.out)) return 'J’attends <code>degats(5, 12)</code> = 1, <code>degats(20, 8)</code> = 12, <code>xp_pour(1)</code> = 100 et <code>xp_pour(10)</code> = 10000.';
        return true;
      },
      ok:'Les règles du jeu sont regroupées au même endroit, et on les appelle sans créer d’objet.' }
  ],
  recap:['<strong>Attribut de classe</strong> (<em>class / static attribute</em>) : une seule copie, partagée. On le modifie par la classe : <code>Potion.fabriquees += 1</code>.','Piège : <code>self.compteur += 1</code> crée un attribut d’objet, le compteur commun ne bouge pas.','Constantes en MAJUSCULES. En Java : <code>public static final int NIVEAU_MAX = 99;</code>','<strong>Méthode statique</strong> : pas de <code>self</code> / <code>this</code>. <code>@staticmethod</code> en Python, <code>static</code> en Java. <code>main</code> est <code>static</code>.'] };

/* ---------- 4.2 ---------- */
const PERSO42 = `class Personnage:
    def __init__(self, nom, pv, force, magie):
        self.nom = nom
        self.pv = pv
        self.force = force
        self.magie = magie
`;
const BUG42 = `class Arme:
    def __init__(self, nom, degats):
        self.nom = nom
        self.degats = degats

    @classmethod
    def depuis_texte(texte):
        nom, degats = texte.split(";")
        return cls(nom, int(degats))

hache = Arme.depuis_texte("Hache;14")
print(hache.nom, hache.degats)`;
LES['p4-2'] = { title:'Méthodes de fabrique', dur:'13 min',
  intro:'Parfois, un seul constructeur ne suffit pas : on veut créer un objet à partir d’un texte, ou avec des réglages tout prêts. Les méthodes de fabrique sont des constructeurs avec un nom.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`class C:
    n = 0
    def inc(self):
        self.n += 1

x = C()
x.inc()
x.inc()
print(C.n, x.n)`,
      opts:[ {l:'2 2', why:'<code>self.n += 1</code> crée un attribut <code>n</code> dans x. Celui de la classe reste à 0.'},
             {l:'0 2', ok:1},
             {l:'0 0', why:'<code>x.n</code> existe bien : il a été créé par <code>self.n += 1</code>, et vaut 2 après deux appels.'},
             {l:'2 0', why:'C’est l’inverse : la classe n’a pas bougé, l’objet a son propre n.'} ],
      ex:'Le piège du chapitre : <code>self.n += 1</code> crée un attribut d’objet. <code>C.n</code> reste 0.' },
    { t:'say', h:'@classmethod : une méthode qui reçoit la classe', file:'fabrique.py', mem:1,
      p:`<p>Une <strong>méthode de classe</strong> (<em>class method</em>), marquée <code>@classmethod</code>, reçoit la <strong>classe</strong> en premier paramètre, nommé <code>cls</code> par convention. Appeler <code>cls(...)</code>, c'est appeler le constructeur.</p><p>Usage idéal : les <strong>méthodes de fabrique</strong> (<em>factory methods</em>), des constructeurs alternatifs avec un nom qui dit ce qu'ils font.</p>`,
      code: PERSO42 + `
    @classmethod
    def guerrier(cls, nom):
        return cls(nom, 150, 18, 0)

    @classmethod
    def mage(cls, nom):
        return cls(nom, 80, 5, 25)

    @classmethod
    def depuis_texte(cls, ligne):
        nom, pv, force, magie = ligne.split(";")
        return cls(nom, int(pv), int(force), int(magie))

conan = Personnage.guerrier("Conan")
merlin = Personnage.mage("Merlin")
zoe = Personnage.depuis_texte("Zoé;100;10;10")` },
    { t:'say', h:'Trois genres de méthodes en Python',
      p:`<p>Récapitulons. Python a trois genres de méthodes :</p>`,
      snip:`Genre                Décorateur       1er paramètre    Usage typique
méthode d'objet      (aucun)          self (l'objet)   la plupart des méthodes
méthode de classe    @classmethod     cls (la classe)  fabriques, compteurs
méthode statique     @staticmethod    (aucun)          fonction utilitaire`,
      p2:`<p>Java n'a que deux genres : les méthodes d'objet et les méthodes <code>static</code>. Le <code>static</code> de Java couvre les deux dernières lignes.</p>` },
    { t:'quiz', h:'Lequel choisir ?', p:`<p>Tu veux une méthode <code>Potion.depuis_recette("soin;30")</code> qui crée une potion à partir d'un texte. Quel genre de méthode ?</p>`,
      opts:[ {l:'Une méthode d’objet avec self', why:'Il n’y a pas encore d’objet : c’est justement ce qu’on veut créer.'},
             {l:'Une méthode de classe avec @classmethod', ok:1},
             {l:'Une méthode statique', why:'Ça pourrait marcher en écrivant <code>Potion(...)</code> dedans. Mais <code>@classmethod</code> reçoit la classe dans <code>cls</code>, ce qui marchera aussi avec les classes filles (chapitre 5).'},
             {l:'Un deuxième __init__', why:'Python n’a qu’un seul <code>__init__</code> par classe : un deuxième remplacerait le premier.'} ],
      ex:'Une fabrique reçoit la classe et renvoie <code>cls(...)</code> : c’est le travail de <code>@classmethod</code>.' },
    { t:'compare', h:'Et en Java ? Des fabriques static',
      p:`<p>En Java, une fabrique est une méthode <code>static</code> qui renvoie <code>new ...</code>. Souvent, on rend même le constructeur <code>private</code> : on oblige ainsi à passer par les fabriques, qui ont des noms clairs et peuvent vérifier les valeurs.</p>`,
      py: PERSO42 + `
    @classmethod
    def guerrier(cls, nom):
        return cls(nom, 150, 18, 0)

conan = Personnage.guerrier("Conan")`,
      java:`public class Personnage {
    private String nom;
    private int pv, force, magie;

    private Personnage(String nom, int pv, int force, int magie) {
        this.nom = nom;
        this.pv = pv;
        this.force = force;
        this.magie = magie;
    }

    public static Personnage guerrier(String nom) {
        return new Personnage(nom, 150, 18, 0);
    }

    public static Personnage mage(String nom) {
        return new Personnage(nom, 80, 5, 25);
    }
}

Personnage conan = Personnage.guerrier("Conan");`,
      notes:['Le type de retour d’une fabrique, c’est la classe elle-même : <code>public static Personnage guerrier(...)</code>.','Avec un constructeur <code>private</code>, <code>new Personnage(...)</code> est interdit hors de la classe.','Les fabriques ont un nom qui dit ce qu’elles créent, alors que tous les constructeurs s’appellent pareil.'] },
    { t:'fill', lang:'java', h:'Complète la fabrique',
      p:`<p>Complète la fabrique Java qui crée une potion à partir d'un texte comme <code>"Soin;30"</code>.</p>`,
      tpl:`public class Potion {
    private String nom;
    private int soin;

    [[private]] Potion(String nom, int soin) {
        this.nom = nom;
        this.soin = soin;
    }

    public [[static]] [[Potion]] depuisTexte(String texte) {
        String[] morceaux = texte.split(";");
        return [[new]] Potion(morceaux[0], Integer.parseInt(morceaux[1]));
    }
}`,
      hints:['Le constructeur est caché pour forcer le passage par la fabrique. La fabrique appartient à la classe, pas à un objet.','<code>private</code>, <code>static</code>, elle renvoie une <code>Potion</code>, créée avec <code>new</code>.'],
      ok:'<code>Integer.parseInt</code> est le <code>int()</code> de Java, et c’est elle-même une méthode statique.' },
    { t:'code', h:'À toi : la fabrique de potions', file:'potions.py', mem:1,
      p:`<p>Ajoute à la classe <code>Potion</code> deux méthodes de fabrique :</p><ul><li><code>petite(cls)</code> crée une <code>"Petite potion"</code> qui soigne 20 ;</li><li><code>depuis_texte(cls, texte)</code> crée une potion à partir d'un texte comme <code>"Élixir;80"</code>.</li></ul><p>Crée <code>p1 = Potion.petite()</code> et <code>p2 = Potion.depuis_texte("Élixir;80")</code>.</p>`,
      code:`class Potion:
    def __init__(self, nom, soin):
        self.nom = nom
        self.soin = soin
`,
      sol:`class Potion:
    def __init__(self, nom, soin):
        self.nom = nom
        self.soin = soin

    @classmethod
    def petite(cls):
        return cls("Petite potion", 20)

    @classmethod
    def depuis_texte(cls, texte):
        nom, soin = texte.split(";")
        return cls(nom, int(soin))

p1 = Potion.petite()
p2 = Potion.depuis_texte("Élixir;80")`,
      hints:['Chaque fabrique a <code>@classmethod</code> au-dessus et <code>cls</code> en premier paramètre. Elle finit par <code>return cls(...)</code>.','Pour le texte : <code>nom, soin = texte.split(";")</code>, puis <code>return cls(nom, int(soin))</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if ((code.match(/@classmethod/g) || []).length < 2) return 'Les deux fabriques doivent être des <code>@classmethod</code>.';
        if (attr(r, 'p1', 'nom') !== "'Petite potion'" || attr(r, 'p1', 'soin') !== '20') return '<code>p1</code> doit être une Petite potion qui soigne 20.';
        if (attr(r, 'p2', 'soin') !== '80') return attr(r, 'p2', 'soin') === "'80'" ? 'Le soin de p2 est du texte <code>\'80\'</code> : convertis-le avec <code>int()</code>.' : '<code>p2</code> doit soigner 80.';
        const t = await test([], code + '\n_x = Potion.depuis_texte("Eau;3")\nprint("#T", _x.nom, _x.soin + 1)');
        if (t.err || !/#T Eau 4/.test(t.out)) return '<code>depuis_texte("Eau;3")</code> doit créer une potion Eau qui soigne 3 (un nombre).';
        return true;
      },
      ok:'Deux nouvelles façons de créer une potion, avec un nom qui dit tout.' },
    { t:'code', bug:1, h:'Répare la fabrique', file:'bug.py',
      p:`<p>Cette fabrique plante. Exécute, lis l'explication, puis répare-la.</p>`,
      code: BUG42,
      sol: BUG42.replace('def depuis_texte(texte):', 'def depuis_texte(cls, texte):'),
      hints:['Une méthode de classe reçoit automatiquement un premier argument. Lequel ?','Il manque <code>cls</code> : <code>def depuis_texte(cls, texte):</code>.'],
      check:(r, code) => {
        if (same(code, BUG42)) return START;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        if (!/Hache 14/.test(r.out)) return 'Il faut afficher <code>Hache 14</code>.';
        return true;
      },
      ok:'<code>self</code> pour les méthodes d’objet, <code>cls</code> pour les méthodes de classe, rien pour les statiques.' },
    { t:'code', defi:1, h:'Une fabrique qui vérifie', file:'verif.py', mem:1,
      p:`<p>Écris une classe <code>Monstre</code> (attributs <code>nom</code> et <code>pv</code>) avec une fabrique <code>aleatoire(cls, nom, niveau)</code>. Elle crée un monstre avec <code>pv = niveau * 10 + un nombre au hasard entre 1 et 10</code> (utilise <code>random.randint</code>). Si le niveau n'est pas entre 1 et 20, elle lève <code>ValueError</code>.</p><p>Crée <code>loup = Monstre.aleatoire("Loup", 3)</code>.</p>`,
      code:`import random
`,
      sol:`import random

class Monstre:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

    @classmethod
    def aleatoire(cls, nom, niveau):
        if not 1 <= niveau <= 20:
            raise ValueError("niveau impossible")
        return cls(nom, niveau * 10 + random.randint(1, 10))

loup = Monstre.aleatoire("Loup", 3)`,
      hints:['La fabrique vérifie d’abord le niveau : <code>if not 1 &lt;= niveau &lt;= 20: raise ValueError("niveau impossible")</code>.','Puis <code>return cls(nom, niveau * 10 + random.randint(1, 10))</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/@classmethod/.test(code)) return '<code>aleatoire</code> doit être une <code>@classmethod</code>.';
        const pv = +attr(r, 'loup', 'pv');
        if (!(pv >= 31 && pv <= 40)) return 'Un loup de niveau 3 doit avoir entre 31 et 40 PV.';
        const t = await test([], code + '\n_v = set()\nfor _i in range(200):\n    _v.add(Monstre.aleatoire("M", 5).pv)\nprint("#T", min(_v), max(_v), len(_v))' + tryPy('A', 'Monstre.aleatoire("X", 0)') + tryPy('B', 'Monstre.aleatoire("X", 21)'));
        if (t.err) return TESTERR(t);
        if (!/#T 51 60 10/.test(t.out)) return 'Sur 200 monstres de niveau 5, j’attends des PV de 51 à 60, avec les 10 valeurs possibles. Vérifie <code>random.randint(1, 10)</code>.';
        if (!/#A ERREUR/.test(t.out) || !/#B ERREUR/.test(t.out)) return 'Les niveaux 0 et 21 doivent lever une <code>ValueError</code>.';
        return true;
      },
      ok:'Une fabrique peut cacher des calculs, du hasard et des vérifications derrière un simple nom.' }
  ],
  recap:['<strong>Méthode de classe</strong> : <code>@classmethod</code>, premier paramètre <code>cls</code> (la classe). <code>cls(...)</code> appelle le constructeur.','<strong>Méthode de fabrique</strong> (<em>factory method</em>) : un constructeur avec un nom, qui peut vérifier, calculer, ou convertir un texte.','En Java : une méthode <code>public static Classe nom(...)</code> qui fait <code>return new Classe(...)</code>, souvent avec un constructeur <code>private</code>.','Python : <code>self</code> (objet), <code>cls</code> (classe), rien (statique). Java : objet ou <code>static</code>.'] };

/* ---------- 4.3 ---------- */
const BUG43 = `class Arme:
    def __init__(self, nom, degats):
        self.nom = nom
        self.degats = degats

    def __str__(self):
        print(f"{self.nom} ({self.degats} dégâts)")

epee = Arme("Épée", 12)
print(epee)`;
LES['p4-3'] = { title:'__str__, __repr__ et toString()', dur:'12 min',
  intro:'Quand tu fais print(objet), Python affiche un charabia. Ici, tu apprends à donner à tes objets un affichage lisible, pour les joueurs et pour les développeurs.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Quel est le premier paramètre d'une méthode marquée <code>@classmethod</code> ?</p>`,
      opts:[ {l:'self', why:'<code>self</code>, c’est pour les méthodes d’objet.'},
             {l:'cls', ok:1},
             {l:'Aucun', why:'C’est le cas des méthodes statiques.'},
             {l:'this', why:'<code>this</code> est un mot de Java, et il n’est jamais écrit dans les paramètres.'} ],
      ex:'<code>cls</code> reçoit la classe, et <code>cls(...)</code> crée un objet.' },
    { t:'say', h:'Un affichage illisible', file:'charabia.py',
      p:`<p>Par défaut, <code>print</code> d'un objet affiche son genre (sa classe), et rien de ses valeurs. Inutile pour le joueur, inutile pour déboguer.</p>`,
      code:`class Arme:
    def __init__(self, nom, degats):
        self.nom = nom
        self.degats = degats

epee = Arme("Épée", 12)
print(epee)` },
    { t:'say', h:'__str__ : le texte pour les humains', file:'str.py',
      p:`<p>La méthode spéciale <code>__str__(self)</code> renvoie le texte à afficher. <code>print(objet)</code>, <code>str(objet)</code> et les f-strings l'utilisent automatiquement.</p><p>Attention : elle doit <strong>renvoyer</strong> un texte avec <code>return</code>, pas l'afficher.</p>`,
      code:`class Arme:
    def __init__(self, nom, degats):
        self.nom = nom
        self.degats = degats

    def __str__(self):
        return f"{self.nom} ({self.degats} dégâts)"

epee = Arme("Épée", 12)
print(epee)
print(f"Tu ramasses : {epee}")
texte = str(epee)
print(len(texte), "caractères")` },
    { t:'say', h:'__repr__ : le texte pour les développeurs', file:'repr.py',
      p:`<p><code>__repr__(self)</code> renvoie un texte pour les <strong>développeurs</strong> : clair et sans ambiguïté, idéalement le code Python qui recrée l'objet. C'est lui qu'on voit quand on affiche une <strong>liste</strong> d'objets, et dans le débogueur.</p><p>Le <code>!r</code> dans la f-string met des guillemets autour du texte. Retiens : <code>print(objet)</code> → <code>__str__</code>, <code>print(liste)</code> → <code>__repr__</code> de chaque élément.</p>`,
      code:`class Arme:
    def __init__(self, nom, degats):
        self.nom = nom
        self.degats = degats

    def __str__(self):
        return f"{self.nom} ({self.degats} dégâts)"

    def __repr__(self):
        return f"Arme({self.nom!r}, {self.degats})"

epee = Arme("Épée", 12)
arc = Arme("Arc", 9)
print(epee)
print([epee, arc])
print(repr(epee))` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Avec la classe <code>Arme</code> ci-dessus (qui a <code>__str__</code> et <code>__repr__</code>), qu'affiche ce code ?</p>`, snip:`sac = [Arme("Dague", 4)]
print(sac)`,
      opts:[ {l:'[Dague (4 dégâts)]', why:'Pour les éléments d’une liste, Python utilise <code>__repr__</code>, pas <code>__str__</code>.'},
             {l:"[Arme('Dague', 4)]", ok:1},
             {l:'Dague (4 dégâts)', why:'On affiche une liste : les crochets restent.'},
             {l:'[<__main__.Arme object>]', why:'La classe définit <code>__repr__</code> : Python l’utilise.'} ],
      ex:'Une liste s’affiche avec le <code>__repr__</code> de ses éléments. Si une classe n’a que <code>__str__</code>, ses objets restent illisibles dans les listes.' },
    { t:'compare', h:'Et en Java ? toString()',
      p:`<p>En Java, la méthode <code>toString()</code> joue le rôle de <code>__str__</code>. Toutes les classes en ont une par défaut, qui affiche par exemple <code>Arme@1b6d3586</code>. On la <strong>redéfinit</strong> (<em>override</em>) avec <code>@Override</code> au-dessus. Tu comprendras ce mot au chapitre 5.</p>`,
      py:`class Arme:
    def __init__(self, nom, degats):
        self.nom = nom
        self.degats = degats

    def __str__(self):
        return f"{self.nom} ({self.degats} dégâts)"

print(Arme("Épée", 12))`,
      java:`public class Arme {
    private String nom;
    private int degats;

    public Arme(String nom, int degats) {
        this.nom = nom;
        this.degats = degats;
    }

    @Override
    public String toString() {
        return nom + " (" + degats + " dégâts)";
    }
}

System.out.println(new Arme("Épée", 12));
String texte = "Tu ramasses : " + new Arme("Arc", 9);`,
      notes:['<code>System.out.println(objet)</code> appelle <code>toString()</code> automatiquement, comme <code>print</code> appelle <code>__str__</code>.','Coller un objet à du texte avec <code>+</code> appelle aussi <code>toString()</code>.','La signature doit être exacte : <code>public String toString()</code>. <code>@Override</code> demande au compilateur de vérifier qu’on remplace bien la méthode existante.'] },
    { t:'fill', lang:'java', h:'Complète toString()',
      p:`<p>Complète la méthode Java pour que <code>System.out.println(p)</code> affiche par exemple <code>Grande potion (+50 PV)</code>.</p>`,
      tpl:`public class Potion {
    private String nom;
    private int soin;

    [[@Override]]
    public [[String]] [[toString]]() {
        [[return]] nom + " (+" + soin + " PV)";
    }
}`,
      hints:['Une annotation demande au compilateur de vérifier qu’on remplace la méthode existante.','<code>@Override</code>, <code>String</code>, <code>toString</code>, <code>return</code>.'],
      ok:'Avec <code>toString()</code>, tes objets Java s’affichent proprement partout.' },
    { t:'code', h:'À toi : un monstre lisible', file:'monstre.py',
      p:`<p>Ajoute deux méthodes à la classe <code>Monstre</code> :</p><ul><li><code>__str__</code> renvoie par exemple <code>Gobelin (30 PV)</code> ;</li><li><code>__repr__</code> renvoie par exemple <code>Monstre('Gobelin', 30)</code>.</li></ul><p>Puis affiche <code>gob</code>, et la liste <code>horde</code>.</p>`,
      code:`class Monstre:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

gob = Monstre("Gobelin", 30)
horde = [gob, Monstre("Orc", 55)]
`,
      sol:`class Monstre:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

    def __str__(self):
        return f"{self.nom} ({self.pv} PV)"

    def __repr__(self):
        return f"Monstre({self.nom!r}, {self.pv})"

gob = Monstre("Gobelin", 30)
horde = [gob, Monstre("Orc", 55)]
print(gob)
print(horde)`,
      hints:['<code>def __str__(self): return f"{self.nom} ({self.pv} PV)"</code>','<code>def __repr__(self): return f"Monstre({self.nom!r}, {self.pv})"</code>. Puis <code>print(gob)</code> et <code>print(horde)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + '\n_m = Monstre("Rat", 3)\nprint("#S", str(_m))\nprint("#R", repr(_m))');
        if (t.err) return TESTERR(t);
        if (!/#S Rat \(3 PV\)/.test(t.out)) return '<code>str()</code> d’un Rat de 3 PV doit donner <code>Rat (3 PV)</code>. N’oublie pas le <code>return</code>.';
        if (!/#R Monstre\('Rat', 3\)/.test(t.out)) return '<code>repr()</code> d’un Rat de 3 PV doit donner <code>Monstre(\'Rat\', 3)</code>. Le <code>!r</code> ajoute les guillemets.';
        if (!/^Gobelin \(30 PV\)$/m.test(r.out)) return 'Affiche <code>gob</code> avec <code>print(gob)</code>.';
        if (!/\[Monstre\('Gobelin', 30\), Monstre\('Orc', 55\)\]/.test(r.out)) return 'Affiche aussi la liste <code>horde</code>.';
        return true;
      },
      ok:'Un affichage pour le joueur, un autre pour le développeur. Ta liste de monstres est enfin lisible.' },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code affiche le bon texte… puis plante. Exécute, puis répare la méthode.</p>`,
      code: BUG43,
      sol: BUG43.replace('        print(f"{self.nom} ({self.degats} dégâts)")', '        return f"{self.nom} ({self.degats} dégâts)"'),
      hints:['<code>__str__</code> doit donner le texte à <code>print</code>, pas l’afficher lui-même. Que renvoie-t-elle ici ?','Remplace le <code>print(...)</code> de la méthode par <code>return ...</code>.'],
      check:(r, code) => {
        if (same(code, BUG43)) return START;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        if (!/^Épée \(12 dégâts\)$/m.test(r.out.trim())) return 'Il faut afficher <code>Épée (12 dégâts)</code>, une seule fois.';
        return true;
      },
      ok:'<code>__str__</code> doit renvoyer un texte. Sans <code>return</code>, elle renvoie <code>None</code>, et Python refuse : « __str__ returned non-string ».' },
    { t:'code', defi:1, h:'Une fiche sur plusieurs lignes', file:'fiche.py',
      p:`<p>Écris la classe <code>Heros</code> (<code>nom</code>, <code>niveau</code>, liste <code>sac</code>) avec un <code>__str__</code> qui renvoie le nom et le niveau, puis le sac, séparés par un retour à la ligne :</p><pre class="snippet">Sam (niv. 3)
Sac : corde, torche</pre><p>Si le sac est vide, la 2e ligne est <code>Sac : vide</code>. Astuce : <code>", ".join(liste)</code> colle les éléments d'une liste avec une virgule.</p><p>Crée <code>sam = Heros("Sam", 3, ["corde", "torche"])</code> et affiche-le.</p>`,
      code:``,
      sol:`class Heros:
    def __init__(self, nom, niveau, sac):
        self.nom = nom
        self.niveau = niveau
        self.sac = sac

    def __str__(self):
        contenu = ", ".join(self.sac) if self.sac else "vide"
        return f"{self.nom} (niv. {self.niveau})" + chr(10) + "Sac : " + contenu

sam = Heros("Sam", 3, ["corde", "torche"])
print(sam)`,
      hints:['Prépare d’abord le contenu : <code>", ".join(self.sac)</code> si le sac n’est pas vide, sinon <code>"vide"</code>.','Pour le retour à la ligne, colle le caractère <code>"\\n"</code> entre les deux morceaux du texte renvoyé.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const l = linesOf(r.out);
        if (l[0] !== 'Sam (niv. 3)' || l[1] !== 'Sac : corde, torche') return 'Pour Sam, j’attends deux lignes : <code>Sam (niv. 3)</code> puis <code>Sac : corde, torche</code>.';
        const t = await test([], code + '\nprint("#T", str(Heros("Léa", 1, [])))');
        if (t.err) return TESTERR(t);
        if (!/#T Léa \(niv\. 1\)\nSac : vide/.test(t.out)) return 'Pour un héros au sac vide, la 2e ligne doit être <code>Sac : vide</code>.';
        return true;
      },
      ok:'<code>__str__</code> peut construire un texte aussi riche que tu veux, tant qu’elle le renvoie.' }
  ],
  recap:['<code>__str__</code> : le texte pour les humains, utilisé par <code>print(objet)</code>, <code>str()</code> et les f-strings.','<code>__repr__</code> : le texte pour les développeurs, utilisé dans les listes et le débogueur. Idéalement : <code>Arme(\'Épée\', 12)</code>.','Ces méthodes <strong>renvoient</strong> un texte (<code>return</code>), elles ne l’affichent pas.','Java : <code>@Override public String toString()</code>, appelée par <code>println</code> et par <code>+</code> avec du texte.'] };

/* ---------- 4.4 ---------- */
const POS = `class Case:
    def __init__(self, x, y):
        self.x = x
        self.y = y
`;
const BUG44 = `class Objet:
    def __init__(self, nom, prix):
        self.nom = nom
        self.prix = prix

    def __eq__(self, other):
        if not isinstance(other, Objet):
            return NotImplemented
        return self.nom == other.nom

boutique = {Objet("Corde", 5), Objet("Torche", 3)}
print(Objet("Corde", 5) in boutique)`;
LES['p4-4'] = { title:'Identité ou égalité : is, == et equals()', dur:'16 min',
  intro:'Deux potions identiques sont-elles « égales » ? Ça dépend de ce qu’on demande : est-ce le même objet, ou ont-elles la même valeur ? C’est un grand classique des examens, en Java comme en Python.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Quelle méthode Python est utilisée quand on affiche une <strong>liste</strong> d'objets ?</p>`,
      opts:[ {l:'__str__', why:'<code>__str__</code> sert pour <code>print(objet)</code>. Dans une liste, Python utilise l’autre.'},
             {l:'__repr__', ok:1},
             {l:'toString', why:'C’est le nom Java.'},
             {l:'__init__', why:'<code>__init__</code> construit l’objet, il n’affiche rien.'} ],
      ex:'<code>print(liste)</code> affiche le <code>__repr__</code> de chaque élément.' },
    { t:'say', h:'Deux questions différentes', file:'identite.py',
      p:`<p>Il y a deux questions à ne pas confondre :</p><ul><li><strong>Identité</strong> (<em>identity</em>) : est-ce le <strong>même objet</strong> ? En Python : <code>is</code>.</li><li><strong>Égalité</strong> (<em>equality</em>) : ont-ils la <strong>même valeur</strong> ? En Python : <code>==</code>.</li></ul><p>Pour tes propres classes, par défaut, <code>==</code> fait comme <code>is</code> : Python ne sait pas ce que « même valeur » veut dire pour une <code>Case</code>. C'est à toi de le lui dire.</p>`,
      code: POS + `
a = Case(2, 3)
b = Case(2, 3)
c = a
print(a is b, a == b)
print(a is c, a == c)` },
    { t:'say', h:'__eq__ : définir l’égalité', file:'eq.py',
      p:`<p>La méthode spéciale <code>__eq__(self, other)</code> est appelée par <code>==</code>. On y décide ce que « égal » veut dire. Ici : deux cases sont égales si elles ont les mêmes coordonnées.</p><p>Bonne pratique : si <code>other</code> n'est pas une <code>Case</code>, on renvoie <code>NotImplemented</code>. Python comprend alors que la comparaison n'a pas de sens, et <code>==</code> donne <code>False</code>.</p>`,
      code: POS + `
    def __eq__(self, other):
        if not isinstance(other, Case):
            return NotImplemented
        return self.x == other.x and self.y == other.y

a = Case(2, 3)
b = Case(2, 3)
print(a == b)
print(a is b)
print(a == Case(9, 9))
print(a == "bonjour")` },
    { t:'compare', h:'Et en Java ? == et equals()',
      p:`<p>Attention, c'est <strong>inversé</strong> par rapport à Python ! En Java, <code>==</code> sur des objets teste l'<strong>identité</strong>. Pour l'égalité, on appelle la méthode <code>equals()</code>, qu'on redéfinit.</p>`,
      py:`a is b      # même objet ?
a == b      # même valeur ? (__eq__)`,
      java:`a == b          // même objet ?
a.equals(b)     // même valeur ?

@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Case)) return false;
    Case autre = (Case) o;
    return x == autre.x && y == autre.y;
}`,
      notes:['Python : <code>is</code> = identité, <code>==</code> = égalité. Java : <code>==</code> = identité, <code>equals</code> = égalité.','<code>equals</code> reçoit un <code>Object</code> (n’importe quel objet). <code>instanceof</code> vérifie son type, puis <code>(Case) o</code> le convertit (<em>cast</em>).','En Python, on n’utilise <code>is</code> presque que pour <code>None</code> : <code>if x is None</code>.'] },
    { t:'quiz', lang:'java', h:'Le piège des String', p:`<p>Qu'affiche ce code Java ?</p>`, snip:`String a = new String("épée");
String b = new String("épée");
System.out.println(a == b);
System.out.println(a.equals(b));`,
      opts:[ {l:'true puis true', why:'<code>new</code> crée deux objets distincts : <code>==</code> compare les références.'},
             {l:'false puis true', ok:1},
             {l:'true puis false', why:'C’est l’inverse : mêmes caractères (<code>equals</code> vrai), mais deux objets (<code>==</code> faux).'},
             {l:'false puis false', why:'<code>String</code> redéfinit <code>equals</code> pour comparer les caractères.'} ],
      ex:'En Java, <strong>ne compare jamais deux String avec ==</strong> : utilise <code>equals</code>. C’est une erreur très fréquente aux examens.' },
    { t:'quiz', h:'Et en Python ?', p:`<p>Avec la classe <code>Case</code> qui a un <code>__eq__</code>, qu'affiche ce code ?</p>`, snip:`a = Case(1, 1)
b = Case(1, 1)
print(a == b, a is b, a != b)`,
      opts:[ {l:'True False False', ok:1},
             {l:'True True False', why:'<code>a</code> et <code>b</code> sont deux objets créés séparément : <code>is</code> donne False.'},
             {l:'False False True', why:'<code>__eq__</code> compare les coordonnées : elles sont égales.'},
             {l:'True False True', why:'Python déduit <code>!=</code> de <code>__eq__</code> : si <code>==</code> est vrai, <code>!=</code> est faux.'} ],
      ex:'Même valeur, mais deux objets. Et <code>!=</code> est automatiquement l’inverse de <code>==</code>.' },
    { t:'say', h:'Égalité et hachage', file:'hash.py',
      p:`<p>Les <code>set</code> et les <code>dict</code> rangent les objets grâce à un numéro calculé, le <strong>hash</strong> (<em>hash code</em>), avant de comparer avec <code>==</code>. La règle d'or : <strong>deux objets égaux doivent avoir le même hash</strong>.</p><p>En Python, dès que tu écris <code>__eq__</code>, tes objets ne peuvent plus aller dans un <code>set</code>… sauf si tu écris aussi <code>__hash__</code>. On calcule le hash avec les mêmes attributs que l'égalité, réunis dans un tuple.</p>`,
      code: POS + `
    def __eq__(self, other):
        if not isinstance(other, Case):
            return NotImplemented
        return (self.x, self.y) == (other.x, other.y)

    def __hash__(self):
        return hash((self.x, self.y))

visitees = {Case(0, 0), Case(1, 0), Case(0, 0)}
print(len(visitees), "cases différentes")
print(Case(1, 0) in visitees)` },
    { t:'compare', h:'Et en Java ? equals et hashCode',
      p:`<p>Même contrat en Java : si <code>a.equals(b)</code>, alors <code>a.hashCode() == b.hashCode()</code>. On redéfinit <strong>les deux, ou aucun</strong>. Sinon, un <code>HashSet</code> ne retrouve pas tes objets.</p>`,
      py:`def __eq__(self, other):
    if not isinstance(other, Case):
        return NotImplemented
    return (self.x, self.y) == (other.x, other.y)

def __hash__(self):
    return hash((self.x, self.y))`,
      java:`@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Case)) return false;
    Case autre = (Case) o;
    return x == autre.x && y == autre.y;
}

@Override
public int hashCode() {
    return Objects.hash(x, y);
}`,
      notes:['<code>Objects.hash(x, y)</code> (de <code>java.util</code>) est le <code>hash((x, y))</code> de Python.','Ne calcule le hash qu’avec des attributs qui ne changent pas. Sinon, un objet modifié se « perd » dans son set.','Les <code>record</code> de Java génèrent automatiquement <code>equals</code>, <code>hashCode</code> et <code>toString</code>. En Python, <code>@dataclass</code> fait pareil (dans VS Code).'] },
    { t:'code', bug:1, h:'L’objet introuvable', file:'bug.py',
      p:`<p>Ce code plante : la classe définit <code>__eq__</code>, mais ses objets ne peuvent plus aller dans un <code>set</code>. Ajoute ce qu'il faut pour que le code affiche <code>True</code>. L'égalité repose sur le nom.</p>`,
      code: BUG44,
      sol: BUG44.replace('        return self.nom == other.nom\n', '        return self.nom == other.nom\n\n    def __hash__(self):\n        return hash(self.nom)\n'),
      hints:['Lis l’erreur : « unhashable type ». Il manque une méthode spéciale.','Ajoute <code>def __hash__(self): return hash(self.nom)</code> dans la classe : le même attribut que dans <code>__eq__</code>.'],
      check:async (r, code, test) => {
        if (same(code, BUG44)) return START;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        if (!/def\s+__hash__/.test(code)) return 'Il faut une méthode <code>__hash__</code>.';
        if (!/True/.test(r.out)) return 'Le code doit afficher <code>True</code>.';
        const t = await test([], code + '\nprint("#T", hash(Objet("A", 1)) == hash(Objet("A", 99)))');
        if (t.err || !/#T True/.test(t.out)) return 'Deux objets égaux (même nom, prix différents) doivent avoir le même hash : calcule-le seulement avec <code>self.nom</code>.';
        return true;
      },
      ok:'<code>__eq__</code> et <code>__hash__</code> vont toujours ensemble, et utilisent les mêmes attributs.' },
    { t:'code', h:'À toi : des objets comparables', file:'objets.py',
      p:`<p>Dans la boutique, deux objets sont <strong>le même article</strong> s'ils ont le même <code>nom</code> et la même <code>rarete</code>, peu importe leur prix. Écris <code>__eq__</code> et <code>__hash__</code> pour la classe <code>Article</code>.</p><p>Puis crée la liste <code>stock</code> avec trois articles, dont deux identiques, et affiche <code>len(set(stock))</code>.</p>`,
      code:`class Article:
    def __init__(self, nom, rarete, prix):
        self.nom = nom
        self.rarete = rarete
        self.prix = prix
`,
      sol:`class Article:
    def __init__(self, nom, rarete, prix):
        self.nom = nom
        self.rarete = rarete
        self.prix = prix

    def __eq__(self, other):
        if not isinstance(other, Article):
            return NotImplemented
        return (self.nom, self.rarete) == (other.nom, other.rarete)

    def __hash__(self):
        return hash((self.nom, self.rarete))

stock = [Article("Anneau", "rare", 300), Article("Anneau", "rare", 250), Article("Anneau", "commun", 20)]
print(len(set(stock)))`,
      hints:['<code>__eq__</code> compare le tuple <code>(self.nom, self.rarete)</code> avec celui de <code>other</code>, après avoir vérifié <code>isinstance</code>.','<code>__hash__</code> renvoie <code>hash((self.nom, self.rarete))</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + '\n_a = Article("X", "rare", 1)\nprint("#T", _a == Article("X", "rare", 999), _a == Article("X", "commun", 1), _a == Article("Y", "rare", 1), _a == 5, len({_a, Article("X", "rare", 2)}))');
        if (t.err) return TESTERR(t);
        if (!/#T True False False False 1/.test(t.out)) return 'Deux articles sont égaux s’ils ont le même nom <strong>et</strong> la même rareté, quel que soit le prix. Comparés à autre chose qu’un Article, ils ne sont pas égaux. Et deux articles égaux ne comptent qu’une fois dans un set.';
        if (!memOf(r, 'stock')) return 'Crée la liste <code>stock</code>.';
        if (!/^2$/m.test(r.out.trim())) return 'Avec trois articles dont deux identiques, <code>len(set(stock))</code> doit afficher 2.';
        return true;
      },
      ok:'Le set a éliminé le doublon tout seul, grâce à ton <code>__eq__</code> et ton <code>__hash__</code>.' },
    { t:'say', h:'Bonus : trier des objets', file:'tri.py',
      p:`<p>Pour trier des objets, Python a deux solutions. Soit on donne une <code>key</code> à <code>sorted</code> : une petite fonction (<code>lambda</code>) qui dit quel attribut utiliser. Soit on écrit <code>__lt__</code> (<em>less than</em>, « plus petit que »), appelée par <code>&lt;</code>.</p><p>En Java, on implémente l'interface <code>Comparable</code> avec une méthode <code>compareTo</code>. On verra les interfaces au chapitre 7.</p>`,
      code:`class Article:
    def __init__(self, nom, prix):
        self.nom = nom
        self.prix = prix

    def __repr__(self):
        return f"{self.nom}:{self.prix}"

    def __lt__(self, other):
        return self.prix < other.prix

stock = [Article("Corde", 5), Article("Arc", 40), Article("Torche", 3)]
print(sorted(stock))
print(sorted(stock, key=lambda a: a.nom))` },
    { t:'code', defi:1, h:'Le classement des héros', file:'classement.py',
      p:`<p>Ajoute à <code>Heros</code> une méthode <code>__lt__</code> : un héros est « plus petit » qu'un autre s'il a un niveau plus bas. À niveau égal, on compare les noms par ordre alphabétique.</p><p>Puis affiche <code>sorted(equipe)</code>.</p>`,
      code:`class Heros:
    def __init__(self, nom, niveau):
        self.nom = nom
        self.niveau = niveau

    def __repr__(self):
        return f"{self.nom}({self.niveau})"

equipe = [Heros("Zoé", 5), Heros("Sam", 7), Heros("Ana", 5), Heros("Bob", 1)]
`,
      sol:`class Heros:
    def __init__(self, nom, niveau):
        self.nom = nom
        self.niveau = niveau

    def __repr__(self):
        return f"{self.nom}({self.niveau})"

    def __lt__(self, other):
        return (self.niveau, self.nom) < (other.niveau, other.nom)

equipe = [Heros("Zoé", 5), Heros("Sam", 7), Heros("Ana", 5), Heros("Bob", 1)]
print(sorted(equipe))`,
      hints:['Les tuples se comparent élément par élément : d’abord le niveau, puis le nom si les niveaux sont égaux.','<code>def __lt__(self, other): return (self.niveau, self.nom) &lt; (other.niveau, other.nom)</code>'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/def\s+__lt__/.test(code)) return 'Il faut une méthode <code>__lt__</code>.';
        if (!/\[Bob\(1\), Ana\(5\), Zoé\(5\), Sam\(7\)\]/.test(r.out)) return 'J’attends <code>[Bob(1), Ana(5), Zoé(5), Sam(7)]</code> : par niveau, puis par nom.';
        const t = await test([], code + '\nprint("#T", sorted([Heros("C", 2), Heros("A", 2), Heros("B", 9), Heros("Z", 0)]))');
        if (t.err || !/#T \[Z\(0\), A\(2\), C\(2\), B\(9\)\]/.test(t.out)) return 'Avec une autre équipe, le tri n’est pas bon. Compare le niveau d’abord, puis le nom.';
        return true;
      },
      ok:'Comparer des tuples, c’est l’astuce pour trier sur plusieurs critères.' }
  ],
  recap:['<strong>Identité</strong> : même objet ? Python <code>is</code>, Java <code>==</code>. <strong>Égalité</strong> : même valeur ? Python <code>==</code> (<code>__eq__</code>), Java <code>equals()</code>.','Java : ne compare jamais des <code>String</code> avec <code>==</code>, utilise <code>equals</code>.','<code>__eq__</code> vérifie <code>isinstance</code> et renvoie <code>NotImplemented</code> sinon.','Contrat : objets égaux ⇒ même hash. Redéfinis <code>__eq__</code> et <code>__hash__</code> (Java : <code>equals</code> et <code>hashCode</code>) ensemble, avec les mêmes attributs.','Trier : <code>sorted(liste, key=lambda o: o.attr)</code>, ou <code>__lt__</code>. Java : <code>Comparable</code> et <code>compareTo</code>.'] };

/* ---------- 4.5 ---------- */
const BUG45 = `class Portail:
    ouverts = 0

    def __init__(self, lieu):
        self.lieu = lieu

    def __enter__(self):
        Portail.ouverts += 1
        print("Portail ouvert vers", self.lieu)
        return self

    def __exit__(self, type_err, err, trace):
        print("Portail refermé")
        return False

with Portail("la Forêt") as p:
    print("Voyage vers", p.lieu)
print("Portails encore ouverts :", Portail.ouverts)`;
LES['p4-5'] = { title:'Le cycle de vie d’un objet', dur:'14 min',
  intro:'Un objet naît, vit, puis disparaît. Qui le détruit ? Et comment être sûr de refermer ce qu’on a ouvert ? Dernière leçon du chapitre, avec un petit bilan à la fin.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>En Python, si tu définis <code>__eq__</code> dans ta classe, que dois-tu aussi définir pour mettre tes objets dans un <code>set</code> ?</p>`,
      opts:[ {l:'__str__', why:'<code>__str__</code> sert à l’affichage, pas aux sets.'},
             {l:'__hash__', ok:1},
             {l:'__lt__', why:'<code>__lt__</code> sert à trier. Un set ne trie pas.'},
             {l:'Rien', why:'Dès qu’on définit <code>__eq__</code>, Python retire le hash par défaut : les objets deviennent « unhashable ».'} ],
      ex:'<code>__eq__</code> et <code>__hash__</code> vont ensemble, comme <code>equals</code> et <code>hashCode</code> en Java.' },
    { t:'say', h:'De la naissance à la disparition',
      p:`<p>La vie d'un objet passe par ces étapes :</p>`,
      snip:`déclaré      créé           initialisé       utilisé          inaccessible       ramassé
(Java)       new Arme(...)  le constructeur  epee.affuter()   plus aucune        par le
Arme epee;   Arme(...)      s'exécute                         référence          ramasse-miettes`,
      p2:`<p>Un objet devient <strong>inaccessible</strong> quand plus aucune variable, liste ou attribut ne le référence. Le <strong>ramasse-miettes</strong> (<em>garbage collector</em>) récupère alors sa mémoire, tout seul. Contrairement au C, tu n'appelles jamais <code>free</code> : impossible d'oublier, ou de libérer deux fois.</p>` },
    { t:'say', h:'Quand un objet devient-il inaccessible ?', file:'vie.py',
      p:`<p>Python (dans sa version habituelle, CPython) compte les références vers chaque objet. Quand le compte tombe à zéro, l'objet est libéré tout de suite. Un ramasse-miettes en plus s'occupe des cas où des objets se référencent en cercle.</p><p>Java, lui, a un ramasse-miettes dans la JVM, qui passe quand il le décide. Suis les commentaires dans ce code.</p>`,
      code:`class Arme:
    def __init__(self, nom):
        self.nom = nom

epee = Arme("Épée")      # 1 référence : epee
sac = [epee]             # 2 références : epee et la liste
epee = None              # 1 référence : la liste
sac.clear()              # 0 référence : l'épée est libérée
print("L'épée n'est plus accessible par personne")` },
    { t:'quiz', h:'Encore accessible ?', p:`<p>Après ces lignes, combien d'objets <code>Arme</code> sont encore accessibles ?</p>`, snip:`a = Arme("Hache")
b = Arme("Arc")
c = a
a = None
b = None`,
      opts:[ {l:'0', why:'<code>c</code> référence encore la Hache.'},
             {l:'1', ok:1},
             {l:'2', why:'Plus rien ne référence l’Arc : <code>b</code> vaut None.'},
             {l:'3', why:'Il n’y a jamais eu que 2 objets : <code>c = a</code> ne crée pas d’objet.'} ],
      ex:'La Hache est encore référencée par <code>c</code>. L’Arc n’a plus de référence : il sera ramassé.' },
    { t:'say', h:'Ne compte pas sur la destruction',
      p:`<p>Python a une méthode spéciale <code>__del__</code>, appelée quand l'objet est détruit. Java avait <code>finalize()</code>, aujourd'hui abandonnée. <strong>Ne les utilise pas pour nettoyer</strong> : on ne sait pas quand (ni parfois si) elles seront appelées.</p>`,
      snip:`class Fichier:
    def __del__(self):          # à éviter !
        print("Destruction...")  # quand ? on ne sait pas`,
      p2:`<p>La mémoire est automatique, mais certaines <strong>ressources</strong> ne le sont pas : un fichier ouvert, une connexion réseau, une base de données. Il faut les fermer explicitement, et au bon moment.</p>` },
    { t:'compare', h:'Fermer à coup sûr : with et try-with-resources',
      p:`<p>Python a l'instruction <code>with</code>, et Java le <code>try</code> avec ressources (<em>try-with-resources</em>). Les deux garantissent que la ressource est fermée à la fin du bloc, <strong>même si une erreur arrive</strong> au milieu.</p>`,
      py:`with open("sauvegarde.txt") as f:
    print(f.readline())
# ici, f est déjà fermé,
# même en cas d'erreur dans le bloc`,
      java:`try (BufferedReader f = new BufferedReader(
         new FileReader("sauvegarde.txt"))) {
    System.out.println(f.readLine());
}
// ici, f est déjà fermé,
// même en cas d'erreur dans le bloc`,
      notes:['Tu as vu <code>with open(...)</code> dans les bases, au chapitre sur les fichiers. C’est le même mécanisme.','Java ferme automatiquement ce qui est déclaré entre les parenthèses du <code>try</code>.','Les fichiers ne marchent pas sur ce site : essaie ces codes dans VS Code.'] },
    { t:'say', h:'Tes propres objets avec with', file:'with.py',
      p:`<p>N'importe quelle classe peut marcher avec <code>with</code> : il suffit de deux méthodes spéciales. <code>__enter__</code> est appelée au début du bloc (ce qu'elle renvoie va dans la variable après <code>as</code>), et <code>__exit__</code> à la fin, quoi qu'il arrive.</p><p>Ici, une torche s'éteint toute seule en sortant de la grotte, même si un monstre surgit.</p>`,
      code:`class Torche:
    def __enter__(self):
        print("La torche s'allume")
        return self

    def __exit__(self, type_err, err, trace):
        print("La torche s'éteint")
        return False

try:
    with Torche() as t:
        print("On explore la grotte...")
        raise ValueError("Un monstre surgit !")
except ValueError as e:
    print("Fuite :", e)` },
    { t:'code', bug:1, h:'Le portail mal refermé', file:'bug.py',
      p:`<p>Ce portail compte combien de portails sont ouverts. Mais après le bloc <code>with</code>, il en compte encore 1. Répare <code>__exit__</code>.</p>`,
      code: BUG45,
      sol: BUG45.replace('        print("Portail refermé")', '        Portail.ouverts -= 1\n        print("Portail refermé")'),
      hints:['<code>__enter__</code> augmente le compteur. Que devrait faire <code>__exit__</code> ?','Ajoute <code>Portail.ouverts -= 1</code> dans <code>__exit__</code>.'],
      check:async (r, code, test) => {
        if (same(code, BUG45)) return START;
        if (r.err) return ERR;
        if (!/Portails encore ouverts : 0/.test(r.out)) return 'Après le bloc, il doit y avoir 0 portail ouvert.';
        const t = await test([], code + '\ntry:\n    with Portail("X"):\n        raise KeyError("boum")\nexcept KeyError:\n    pass\nprint("#T", Portail.ouverts)');
        if (t.err || !/#T 0/.test(t.out)) return 'Même si une erreur arrive dans le bloc, le portail doit être refermé : le compteur doit revenir à 0.';
        return true;
      },
      ok:'<code>__exit__</code> est appelée même en cas d’erreur : c’est l’endroit parfait pour nettoyer.' },
    { t:'code', h:'Bilan : l’atelier du forgeron', file:'forge.py', mem:1,
      p:`<p>Un petit bilan du chapitre. Écris une classe <code>Arme</code> :</p><ul><li>un attribut de classe <code>forgees</code> qui compte les armes créées ;</li><li>un constructeur (<code>nom</code>, <code>degats</code>) ;</li><li>une fabrique <code>depuis_texte(cls, texte)</code> pour un texte comme <code>"Hache;14"</code> ;</li><li><code>__str__</code> qui renvoie <code>Hache (14)</code> ;</li><li><code>__eq__</code> et <code>__hash__</code> : deux armes sont égales si elles ont le même nom et les mêmes dégâts.</li></ul><p>Crée <code>a = Arme("Hache", 14)</code> et <code>b = Arme.depuis_texte("Hache;14")</code>, puis affiche <code>a == b</code>, <code>a is b</code> et <code>Arme.forgees</code>.</p>`,
      code:``,
      sol:`class Arme:
    forgees = 0

    def __init__(self, nom, degats):
        Arme.forgees += 1
        self.nom = nom
        self.degats = degats

    @classmethod
    def depuis_texte(cls, texte):
        nom, degats = texte.split(";")
        return cls(nom, int(degats))

    def __str__(self):
        return f"{self.nom} ({self.degats})"

    def __eq__(self, other):
        if not isinstance(other, Arme):
            return NotImplemented
        return (self.nom, self.degats) == (other.nom, other.degats)

    def __hash__(self):
        return hash((self.nom, self.degats))

a = Arme("Hache", 14)
b = Arme.depuis_texte("Hache;14")
print(a == b, a is b, Arme.forgees)`,
      hints:['Tout ce chapitre en une classe : <code>forgees = 0</code> dans la classe, <code>Arme.forgees += 1</code> dans le constructeur, <code>@classmethod</code> pour la fabrique.','Pour l’égalité et le hash, utilise le tuple <code>(self.nom, self.degats)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/True False 2/.test(r.out)) return 'J’attends l’affichage <code>True False 2</code> : égales, pas le même objet, et 2 armes forgées.';
        const t = await test([], code + '\n_n = Arme.forgees\n_x = Arme.depuis_texte("Arc;9")\nprint("#T", str(_x), _x.degats + 1, Arme.forgees - _n, len({_x, Arme("Arc", 9), Arme("Arc", 8)}), _x == "Arc")');
        if (t.err) return TESTERR(t);
        if (!/#T Arc \(9\) 10 1 2 False/.test(t.out)) return 'Un test échoue : je crée <code>Arme.depuis_texte("Arc;9")</code> et j’attends l’affichage <code>Arc (9)</code>, des dégâts numériques, le compteur qui augmente de 1, un set qui élimine les doublons, et <code>False</code> quand on compare à un texte.';
        return true;
      },
      ok:'Compteur de classe, fabrique, affichage, égalité, hachage : tout le chapitre 4 dans une seule classe !' },
    { t:'say', h:'Mini-défi dans VS Code',
      p:`<p>Traduis la classe <code>Arme</code> du bilan en Java : un compteur <code>private static int forgees</code>, une fabrique <code>public static Arme depuisTexte(String texte)</code>, <code>toString()</code>, <code>equals()</code> et <code>hashCode()</code>.</p><p>Dans <code>main</code>, vérifie que <code>a == b</code> donne <code>false</code> et que <code>a.equals(b)</code> donne <code>true</code>. Puis mets les deux dans un <code>HashSet&lt;Arme&gt;</code> : sa taille doit être 1. Essaie d'enlever <code>hashCode()</code> pour voir ce qui change !</p>` }
  ],
  recap:['Cycle de vie : créé, initialisé (constructeur), utilisé, inaccessible (plus de référence), ramassé par le <strong>ramasse-miettes</strong> (<em>garbage collector</em>).','On ne libère jamais un objet à la main, ni en Java ni en Python.','Ne compte pas sur <code>__del__</code> ni <code>finalize()</code> pour nettoyer.','Les ressources (fichiers, connexions) se ferment avec <code>with</code> (Python) ou <code>try (...)</code> (Java), même en cas d’erreur.','Une classe marche avec <code>with</code> grâce à <code>__enter__</code> et <code>__exit__</code>.'] };

Atelier.chapter({ part:"poo", n:4, title:"Membres de classe, égalité et cycle de vie",
  lessons:['p4-1','p4-2','p4-3','p4-4','p4-5'].map(id => ({ id, ...LES[id] })) });
})();
