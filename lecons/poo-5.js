/* Partie POO · Chapitre 5 : Héritage */
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has } = Atelier.h;
const LES = {};
const attr = (r, o, a) => { const m = memOf(r, o); const x = m && m.attrs && m.attrs.find(t => t.name === a); return x ? x.repr : undefined; };
const same = (code, start) => code.trim() === start.trim();
const START = 'Voilà le bug ! Exécute, lis ce qui se passe, puis corrige le code.';
const TESTERR = t => 'Mes tests font planter ton code : ' + esc(t.err.title) + '. Vérifie les noms de tes classes, de tes méthodes et de leurs paramètres.';

const BASE = `class Personnage:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

    def recevoir(self, degats):
        self.pv = max(0, self.pv - degats)

    def presenter(self):
        return f"{self.nom} ({self.pv} PV)"
`;

/* ---------- 5.1 ---------- */
LES['p5-1'] = { title:'La relation « est un »', dur:'13 min',
  intro:'Un Guerrier et un Mage ont beaucoup en commun : un nom, des PV, une façon de recevoir des coups. L’héritage permet d’écrire ce qui est commun une seule fois, et de spécialiser le reste.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur le chapitre d’avant', p:`<p>En Java, comment teste-t-on si deux objets <code>a</code> et <code>b</code> ont la même <strong>valeur</strong> ?</p>`,
      opts:[ {l:'a == b', why:'En Java, <code>==</code> sur des objets teste l’identité : est-ce le même objet ?'},
             {l:'a.equals(b)', ok:1},
             {l:'a is b', why:'<code>is</code> n’existe pas en Java. En Python, il teste l’identité.'},
             {l:'a.hashCode() == b.hashCode()', why:'Deux objets différents peuvent avoir le même hash. Le hash aide les sets, il ne remplace pas <code>equals</code>.'} ],
      ex:'<code>equals</code> pour la valeur, <code>==</code> pour l’identité. C’est l’inverse de Python.' },
    { t:'say', h:'Le problème : du code en double', file:'double.py', mem:1,
      p:`<p>Regarde ces deux classes. Le nom, les PV, <code>recevoir</code> et <code>presenter</code> sont écrits <strong>deux fois</strong>. Si on trouve un bug dans <code>recevoir</code>, il faudra le corriger à deux endroits. Et avec dix genres de personnages, à dix endroits.</p><p>Pourtant, un Guerrier et un Mage sont tous les deux des personnages.</p>`,
      code:`class Guerrier:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

    def recevoir(self, degats):
        self.pv = max(0, self.pv - degats)

    def frapper(self):
        return self.nom + " frappe avec son épée !"

class Mage:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

    def recevoir(self, degats):
        self.pv = max(0, self.pv - degats)

    def lancer_sort(self):
        return self.nom + " lance un éclair !"

conan = Guerrier("Conan", 150)
merlin = Mage("Merlin", 80)` },
    { t:'say', h:'L’héritage', file:'heritage.py', mem:1,
      p:`<p>L'<strong>héritage</strong> (<em>inheritance</em>) permet de définir une classe comme une <strong>spécialisation</strong> d'une autre. On écrit la classe parente entre parenthèses : <code>class Guerrier(Personnage)</code>.</p><p>La classe fille récupère <strong>tous</strong> les attributs et méthodes de la classe parente, et ajoute les siens. Ici, <code>Guerrier</code> n'a qu'une méthode, mais il sait aussi recevoir des coups et se présenter.</p>`,
      code: BASE + `
class Guerrier(Personnage):
    def frapper(self):
        return self.nom + " frappe avec son épée !"

class Mage(Personnage):
    def lancer_sort(self):
        return self.nom + " lance un éclair !"

conan = Guerrier("Conan", 150)
merlin = Mage("Merlin", 80)
conan.recevoir(30)
print(conan.presenter())
print(conan.frapper())
print(merlin.lancer_sort())` },
    { t:'say', h:'Le vocabulaire',
      p:`<p>Plusieurs mots désignent la même chose. Ils tombent tous aux examens :</p>`,
      snip:`Le parent                      L'enfant
classe parente (parent)        classe fille (child)
superclasse (superclass)       sous-classe (subclass)
classe de base (base class)    classe dérivée (derived class)
plus générale                  plus spécialisée`,
      p2:`<p>La classe fille peut faire trois choses : <strong>hériter</strong> de ce qu'a sa parente, <strong>ajouter</strong> ses propres attributs et méthodes, et <strong>redéfinir</strong> (<em>override</em>) une méthode héritée. On verra ce dernier point dans la leçon 5.3.</p>` },
    { t:'quiz', h:'Le test « est un »', p:`<p>L'héritage exprime la relation « <strong>est un</strong> » (<em>is-a</em>). Dans lequel de ces cas l'héritage est-il justifié ?</p>`,
      opts:[ {l:'Un Héros hérite de Inventaire, pour avoir une liste d’objets', why:'Un héros n’<em>est</em> pas un inventaire : il <em>a</em> un inventaire. C’est une autre relation, qu’on verra au chapitre 8.'},
             {l:'Une Épée hérite de Arme', ok:1},
             {l:'Un Dragon hérite de Trésor, parce qu’il garde un trésor', why:'Garder un trésor, c’est « avoir » un trésor. Un dragon n’est pas un trésor.'},
             {l:'Une Boutique hérite de Heros, pour réutiliser la méthode payer', why:'Réutiliser une méthode ne suffit pas : une boutique n’est pas un héros.'} ],
      ex:'« Une épée <strong>est une</strong> arme » : la phrase est vraie, l’héritage a du sens. Si la phrase qui marche est « X <strong>a un</strong> Y », il ne faut pas d’héritage.' },
    { t:'compare', h:'Et en Java ? extends',
      p:`<p>En Java, on hérite avec le mot <code>extends</code> (« étend »).</p>`,
      py:`class Personnage:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

class Guerrier(Personnage):
    def frapper(self):
        return self.nom + " frappe !"`,
      java:`public class Personnage {
    protected String nom;
    protected int pv;

    public Personnage(String nom, int pv) {
        this.nom = nom;
        this.pv = pv;
    }
}

public class Guerrier extends Personnage {
    public Guerrier(String nom, int pv) {
        super(nom, pv);       // on verra ça en 5.2
    }

    public String frapper() {
        return nom + " frappe !";
    }
}`,
      notes:['<code>class Guerrier(Personnage)</code> devient <code>class Guerrier extends Personnage</code>.','Les attributs sont <code>protected</code> : accessibles par la classe et ses filles (leçon 5.2).','En Java, chaque classe publique va dans son propre fichier : <code>Personnage.java</code> et <code>Guerrier.java</code>.'] },
    { t:'say', h:'isinstance : tester la famille', file:'isinstance.py',
      p:`<p>Un objet d'une classe fille est aussi une instance de sa classe parente. <code>isinstance(objet, Classe)</code> le vérifie, et <code>issubclass(Fille, Parente)</code> teste les classes.</p><p>Et toutes les classes héritent d'une classe racine : <code>object</code> en Python, <code>Object</code> en Java. C'est de là que viennent <code>__str__</code>, <code>__eq__</code>… et <code>toString()</code>, <code>equals()</code>.</p>`,
      code: BASE + `
class Guerrier(Personnage):
    pass

conan = Guerrier("Conan", 150)
print(isinstance(conan, Guerrier))
print(isinstance(conan, Personnage))
print(isinstance(conan, object))
print(issubclass(Guerrier, Personnage))
print(type(conan).__name__)` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Avec les classes ci-dessus, qu'affiche ce code ?</p>`, snip:`perso = Personnage("Sam", 100)
print(isinstance(perso, Guerrier))`,
      opts:[ {l:'True', why:'Un Guerrier est un Personnage, mais un Personnage n’est pas forcément un Guerrier.'},
             {l:'False', ok:1},
             {l:'Une erreur', why:'<code>isinstance</code> accepte n’importe quel objet et n’importe quelle classe.'},
             {l:'Personnage', why:'<code>isinstance</code> renvoie un booléen.'} ],
      ex:'L’héritage va dans un seul sens : un Guerrier est un Personnage, l’inverse est faux.' },
    { t:'quiz', lang:'java', h:'instanceof', p:`<p>En Java, l'équivalent de <code>isinstance</code> est l'opérateur <code>instanceof</code>. Qu'affiche ce code ?</p>`, snip:`Guerrier conan = new Guerrier("Conan", 150);
System.out.println(conan instanceof Personnage);
System.out.println(conan instanceof Object);`,
      opts:[ {l:'true puis true', ok:1},
             {l:'true puis false', why:'Toute classe Java hérite de <code>Object</code>, même sans l’écrire.'},
             {l:'false puis true', why:'Guerrier étend Personnage : un Guerrier est un Personnage.'},
             {l:'Ça ne compile pas', why:'<code>instanceof</code> est un opérateur Java tout à fait valide.'} ],
      ex:'Un objet est une instance de sa classe et de tous ses ancêtres, jusqu’à <code>Object</code>.' },
    { t:'code', h:'À toi : le Voleur', file:'voleur.py', mem:1,
      p:`<p>Crée une classe <code>Voleur</code> qui hérite de <code>Personnage</code>, avec une méthode <code>voler(cible)</code> qui renvoie par exemple <code>Robin vole la bourse de Gobelin</code>.</p><p>Crée <code>robin = Voleur("Robin", 90)</code>, puis affiche <code>robin.presenter()</code> et <code>robin.voler(gob)</code>.</p>`,
      code: BASE + `
gob = Personnage("Gobelin", 30)
`,
      sol: BASE + `
class Voleur(Personnage):
    def voler(self, cible):
        return f"{self.nom} vole la bourse de {cible.nom}"

gob = Personnage("Gobelin", 30)
robin = Voleur("Robin", 90)
print(robin.presenter())
print(robin.voler(gob))`,
      hints:['<code>class Voleur(Personnage):</code>, puis une seule méthode : pas besoin de réécrire le constructeur.','<code>def voler(self, cible): return f"{self.nom} vole la bourse de {cible.nom}"</code>'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/class\s+Voleur\s*\(\s*Personnage\s*\)/.test(code)) return 'Voleur doit hériter de Personnage : <code>class Voleur(Personnage):</code>.';
        if (/class\s+Voleur[\s\S]*def\s+(presenter|recevoir)/.test(code)) return 'Pas besoin de réécrire les méthodes de Personnage dans Voleur : il en hérite.';
        if (!/Robin \(90 PV\)/.test(r.out)) return 'Affiche <code>robin.presenter()</code> : <code>Robin (90 PV)</code>.';
        if (!/Robin vole la bourse de Gobelin/.test(r.out)) return 'Affiche <code>robin.voler(gob)</code> : <code>Robin vole la bourse de Gobelin</code>.';
        const t = await test([], code + '\nprint("#T", Voleur("A", 1).voler(Personnage("B", 1)), isinstance(Voleur("C", 1), Personnage))');
        if (t.err || !/#T A vole la bourse de B True/.test(t.out)) return 'La méthode <code>voler</code> doit utiliser le nom du voleur et celui de la cible.';
        return true;
      },
      ok:'Une seule méthode écrite, trois disponibles. Et si on corrige <code>recevoir</code> dans Personnage, le Voleur en profite aussi.' },
    { t:'code', defi:1, h:'Factorise le code', file:'factorise.py', mem:1,
      p:`<p>Ces deux classes ont du code en double. Crée une classe parente <code>Objet</code> qui contient ce qui est commun (le constructeur et <code>decrire</code>), et fais hériter <code>Arme</code> et <code>Potion</code> de <code>Objet</code>. Chacune ne doit plus garder que sa méthode à elle.</p>`,
      code:`class Arme:
    def __init__(self, nom, prix):
        self.nom = nom
        self.prix = prix

    def decrire(self):
        return f"{self.nom} : {self.prix} po"

    def equiper(self):
        return self.nom + " est équipée"

class Potion:
    def __init__(self, nom, prix):
        self.nom = nom
        self.prix = prix

    def decrire(self):
        return f"{self.nom} : {self.prix} po"

    def boire(self):
        return self.nom + " est bue"

hache = Arme("Hache", 40)
fiole = Potion("Fiole", 8)
print(hache.decrire(), fiole.boire())`,
      sol:`class Objet:
    def __init__(self, nom, prix):
        self.nom = nom
        self.prix = prix

    def decrire(self):
        return f"{self.nom} : {self.prix} po"

class Arme(Objet):
    def equiper(self):
        return self.nom + " est équipée"

class Potion(Objet):
    def boire(self):
        return self.nom + " est bue"

hache = Arme("Hache", 40)
fiole = Potion("Fiole", 8)
print(hache.decrire(), fiole.boire())`,
      hints:['Écris <code>class Objet:</code> avec le constructeur et <code>decrire</code>, tout en haut.','Puis <code>class Arme(Objet):</code> avec seulement <code>equiper</code>, et <code>class Potion(Objet):</code> avec seulement <code>boire</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/class\s+Arme\s*\(\s*Objet\s*\)/.test(code) || !/class\s+Potion\s*\(\s*Objet\s*\)/.test(code)) return 'Arme et Potion doivent hériter de Objet.';
        if ((code.match(/def\s+__init__/g) || []).length !== 1) return 'Il ne doit rester qu’un seul <code>__init__</code>, dans Objet.';
        if ((code.match(/def\s+decrire/g) || []).length !== 1) return 'Il ne doit rester qu’un seul <code>decrire</code>, dans Objet.';
        const t = await test([], code + '\nprint("#T", Arme("A", 1).equiper(), Potion("P", 2).decrire(), isinstance(Potion("Q", 1), Objet))');
        if (t.err || !/#T A est équipée P : 2 po True/.test(t.out)) return 'Chaque classe doit garder sa méthode à elle, et hériter du reste.';
        return true;
      },
      ok:'Tu viens de faire une <em>généralisation</em> : remonter le code commun dans une classe parente. Le code est plus court, et chaque correction se fait à un seul endroit.' }
  ],
  recap:['L’<strong>héritage</strong> (<em>inheritance</em>) : <code>class Guerrier(Personnage)</code> en Python, <code>class Guerrier extends Personnage</code> en Java.','La classe fille hérite de tout, peut ajouter des membres, et peut redéfinir des méthodes.','Parent = superclasse = classe de base. Enfant = sous-classe = classe dérivée.','N’hérite que si « X <strong>est un</strong> Y » est vrai (<em>is-a</em>).','<code>isinstance</code> / <code>instanceof</code>. Toute classe hérite de <code>object</code> (Python) ou <code>Object</code> (Java).'] };

/* ---------- 5.2 ---------- */
const BUG52 = BASE + `
class Mage(Personnage):
    def __init__(self, nom, pv, mana):
        self.mana = mana

    def lancer_sort(self, cout):
        self.mana -= cout
        return self.nom + " lance un sort"

merlin = Mage("Merlin", 80, 50)
print(merlin.lancer_sort(10))
print(merlin.presenter())`;
LES['p5-2'] = { title:'super() et le constructeur parent', dur:'14 min',
  intro:'Le Mage a besoin d’un attribut de plus : sa mana. Il lui faut donc son propre constructeur. Mais alors, qui crée le nom et les PV ? C’est le travail de super().',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Quelle phrase justifie qu'une classe <code>Dragon</code> hérite de <code>Monstre</code> ?</p>`,
      opts:[ {l:'Un dragon a un monstre', why:'« A un », c’est une autre relation. L’héritage, c’est « est un ».'},
             {l:'Un dragon est un monstre', ok:1},
             {l:'Un dragon utilise un monstre', why:'Utiliser, c’est encore une autre relation (chapitre 8).'},
             {l:'Les deux classes ont des PV', why:'Partager un attribut ne suffit pas : une boutique peut avoir de l’or comme un héros, sans être un héros.'} ],
      ex:'L’héritage, c’est la relation « est un » (<em>is-a</em>).' },
    { t:'say', h:'Un constructeur dans la classe fille', file:'super.py', mem:1,
      p:`<p>Les constructeurs ne s'héritent pas comme les autres méthodes : si la classe fille a son propre <code>__init__</code>, il <strong>remplace</strong> celui du parent. Il doit donc demander au parent d'initialiser sa partie.</p><p>C'est le rôle de <code>super().__init__(...)</code> : il appelle le constructeur de la classe parente. Ensuite, on ajoute ce qui est propre à la fille.</p>`,
      code: BASE + `
class Mage(Personnage):
    def __init__(self, nom, pv, mana):
        super().__init__(nom, pv)
        self.mana = mana

merlin = Mage("Merlin", 80, 50)
print(merlin.presenter())
print("Mana :", merlin.mana)` },
    { t:'say', h:'Si on oublie super()', file:'oubli.py', mem:1,
      p:`<p>Sans <code>super().__init__(...)</code>, le constructeur du parent n'est jamais appelé. L'objet n'a donc ni <code>nom</code> ni <code>pv</code> : regarde la mémoire. Le plantage arrive plus tard, quand une méthode essaie de les lire.</p>`,
      code: BASE + `
class Mage(Personnage):
    def __init__(self, nom, pv, mana):
        self.mana = mana

merlin = Mage("Merlin", 80, 50)
print(merlin.__dict__)` },
    { t:'code', bug:1, h:'Répare le Mage', file:'bug.py', mem:1,
      p:`<p>Ce code plante. Exécute, lis l'explication, puis répare le constructeur du Mage.</p>`,
      code: BUG52,
      sol: BUG52.replace('    def __init__(self, nom, pv, mana):\n        self.mana = mana', '    def __init__(self, nom, pv, mana):\n        super().__init__(nom, pv)\n        self.mana = mana'),
      hints:['Le message dit que le Mage n’a pas d’attribut <code>nom</code>. Qui devait le créer ?','Ajoute <code>super().__init__(nom, pv)</code> au début du constructeur du Mage.'],
      check:(r, code) => {
        if (same(code, BUG52)) return START;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        if (!/super\(\)\.__init__\s*\(/.test(code)) return 'Appelle le constructeur parent avec <code>super().__init__(...)</code>.';
        if (attr(r, 'merlin', 'mana') !== '40' || attr(r, 'merlin', 'pv') !== '80') return 'Merlin doit avoir 80 PV et 40 de mana après son sort.';
        return true;
      },
      ok:'Le parent initialise sa partie, la fille ajoute la sienne. Oublier <code>super().__init__</code> est l’erreur numéro 1 avec l’héritage.' },
    { t:'compare', h:'Et en Java ? super(...)',
      p:`<p>En Java, on appelle le constructeur parent avec <code>super(...)</code>, et ce doit être la <strong>première instruction</strong> du constructeur. Si on l'oublie, Java ajoute tout seul un <code>super()</code> sans argument… ce qui ne compile pas si le parent n'a pas de constructeur sans argument.</p>`,
      py:`class Mage(Personnage):
    def __init__(self, nom, pv, mana):
        super().__init__(nom, pv)
        self.mana = mana`,
      java:`public class Mage extends Personnage {
    private int mana;

    public Mage(String nom, int pv, int mana) {
        super(nom, pv);       // toujours en premier
        this.mana = mana;
    }
}`,
      notes:['Python : <code>super().__init__(...)</code>, n’importe où dans le constructeur (mais en premier, c’est plus sûr).','Java : <code>super(...)</code>, obligatoirement en première ligne.','Sans appel explicite, Java insère <code>super()</code>. Python, lui, n’appelle rien du tout.'] },
    { t:'quiz', lang:'java', h:'L’ordre de construction', p:`<p>Qu'affiche <code>new Archimage();</code> ?</p>`, snip:`class Personnage {
    Personnage() { System.out.println("Personnage"); }
}
class Mage extends Personnage {
    Mage() { System.out.println("Mage"); }
}
class Archimage extends Mage {
    Archimage() {
        super();
        System.out.println("Archimage");
    }
}`,
      opts:[ {l:'Archimage', why:'Chaque constructeur appelle celui de son parent avant de faire son propre travail, même sans <code>super()</code> écrit.'},
             {l:'Archimage, Mage, Personnage', why:'C’est l’inverse : le parent est construit d’abord.'},
             {l:'Personnage, Mage, Archimage', ok:1},
             {l:'Mage, Archimage', why:'Le constructeur de Mage appelle aussi <code>super()</code> en cachette : Personnage s’affiche en premier.'} ],
      ex:'L’objet se construit du haut vers le bas : la partie parente doit exister avant que la fille y ajoute la sienne.' },
    { t:'fill', lang:'java', h:'Le constructeur du Guerrier',
      p:`<p>Complète la classe Java <code>Guerrier</code>, qui ajoute une <code>rage</code> à Personnage.</p>`,
      tpl:`public class Guerrier [[extends]] Personnage {
    private int rage;

    public Guerrier(String nom, int pv, int rage) {
        [[super]](nom, pv);
        [[this]].rage = rage;
    }
}`,
      hints:['Le mot-clé de l’héritage en Java, puis l’appel au constructeur parent.','<code>extends</code>, <code>super</code>, <code>this</code>.'],
      ok:'Le constructeur parent d’abord, puis l’attribut propre au Guerrier.' },
    { t:'say', h:'protected : un accès pour la famille',
      p:`<p>Si les attributs de <code>Personnage</code> sont <code>private</code> en Java, même ses classes filles ne peuvent pas les lire directement. Ils existent bien dans l'objet, mais seules les méthodes de <code>Personnage</code> y ont accès.</p><p>Le modificateur <code>protected</code> ouvre l'accès à la classe <strong>et à ses classes filles</strong> (et au même package). En Python, un seul <code>_</code> veut dire, par convention : « réservé à ma classe et à mes filles ».</p>`, lang:'java',
      snip:`public class Personnage {
    private String secret;     // Personnage seulement
    protected String nom;      // Personnage + ses filles
}

public class Mage extends Personnage {
    void test() {
        nom = "Merlin";        // OK : protected
        secret = "x";          // erreur : private
    }
}`,
      p2:`<p>Beaucoup de développeurs préfèrent garder les attributs <code>private</code>, et donner aux filles des getters <code>protected</code> ou <code>public</code>. Les deux se voient en cours.</p>` },
    { t:'code', h:'À toi : le Guerrier', file:'guerrier.py', mem:1,
      p:`<p>Écris une classe <code>Guerrier</code> qui hérite de <code>Personnage</code>. Son constructeur reçoit <code>nom</code>, <code>pv</code> et <code>armure</code>, appelle le constructeur parent, puis range l'armure. Ajoute une méthode <code>encaisser(degats)</code> : le guerrier reçoit les dégâts <strong>moins son armure</strong> (jamais moins de 0), en réutilisant <code>recevoir</code>.</p><p>Crée <code>conan = Guerrier("Conan", 150, 5)</code> et fais-lui encaisser 20 dégâts.</p>`,
      code: BASE,
      sol: BASE + `
class Guerrier(Personnage):
    def __init__(self, nom, pv, armure):
        super().__init__(nom, pv)
        self.armure = armure

    def encaisser(self, degats):
        self.recevoir(max(0, degats - self.armure))

conan = Guerrier("Conan", 150, 5)
conan.encaisser(20)`,
      hints:['Le constructeur : <code>super().__init__(nom, pv)</code>, puis <code>self.armure = armure</code>.','<code>encaisser</code> appelle la méthode héritée : <code>self.recevoir(max(0, degats - self.armure))</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/class\s+Guerrier\s*\(\s*Personnage\s*\)/.test(code)) return 'Guerrier doit hériter de Personnage.';
        if (!/super\(\)\.__init__/.test(code)) return 'Appelle le constructeur parent avec <code>super().__init__(nom, pv)</code>.';
        if (attr(r, 'conan', 'pv') !== '135') return `Conan a ${esc(attr(r, 'conan', 'pv'))} PV. Avec 5 d’armure, 20 dégâts n’en font que 15 : il devrait avoir 135 PV.`;
        const t = await test([], code + '\n_g = Guerrier("G", 50, 10)\n_g.encaisser(3)\nprint("#A", _g.pv)\n_g.encaisser(100)\nprint("#B", _g.pv, _g.presenter())');
        if (t.err) return TESTERR(t);
        if (!/#A 50/.test(t.out)) return 'Des dégâts plus petits que l’armure ne doivent rien enlever (et surtout pas soigner !).';
        if (!/#B 0 G \(0 PV\)/.test(t.out)) return 'Réutilise <code>recevoir</code> : les PV ne doivent pas descendre sous 0.';
        return true;
      },
      ok:'Ton Guerrier réutilise le constructeur et la méthode <code>recevoir</code> de son parent. Aucun code recopié.' },
    { t:'code', defi:1, h:'Trois générations', file:'generations.py', mem:1,
      p:`<p>Crée une classe <code>Mage(Personnage)</code> qui ajoute <code>mana</code>, puis une classe <code>Archimage(Mage)</code> qui ajoute <code>familier</code> (un texte). Chaque constructeur appelle celui de son parent.</p><p>Crée <code>gandalf = Archimage("Gandalf", 90, 200, "Hibou")</code>.</p>`,
      code: BASE,
      sol: BASE + `
class Mage(Personnage):
    def __init__(self, nom, pv, mana):
        super().__init__(nom, pv)
        self.mana = mana

class Archimage(Mage):
    def __init__(self, nom, pv, mana, familier):
        super().__init__(nom, pv, mana)
        self.familier = familier

gandalf = Archimage("Gandalf", 90, 200, "Hibou")`,
      hints:['Le constructeur de Mage appelle <code>super().__init__(nom, pv)</code>. Celui d’Archimage appelle <code>super().__init__(nom, pv, mana)</code> : son parent, c’est Mage.','<code>class Archimage(Mage):</code>, puis <code>self.familier = familier</code> après l’appel à <code>super()</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/class\s+Archimage\s*\(\s*Mage\s*\)/.test(code)) return 'Archimage doit hériter de Mage.';
        const want = [['nom', "'Gandalf'"], ['pv', '90'], ['mana', '200'], ['familier', "'Hibou'"]];
        for (const [a, v] of want) if (attr(r, 'gandalf', a) !== v) return `Gandalf doit avoir l’attribut <code>${a}</code> = ${esc(v)}. Chaque constructeur doit appeler celui de son parent.`;
        const t = await test([], code + '\n_a = Archimage("A", 1, 2, "Chat")\nprint("#T", isinstance(_a, Personnage), isinstance(Mage("M", 1, 1), Archimage), _a.presenter())');
        if (t.err || !/#T True False A \(1 PV\)/.test(t.out)) return 'Un Archimage doit être un Personnage (et savoir se présenter), mais un simple Mage n’est pas un Archimage.';
        return true;
      },
      ok:'Trois étages, et chacun s’occupe de sa partie. La mémoire montre les quatre attributs dans un seul objet.' }
  ],
  recap:['Un constructeur dans la classe fille remplace celui du parent : il doit appeler <code>super().__init__(...)</code> (Python) ou <code>super(...)</code> (Java, en première ligne).','Oublier <code>super().__init__</code> : les attributs du parent ne sont jamais créés (<code>AttributeError</code> plus tard).','Ordre de construction : du parent vers l’enfant.','Java <code>protected</code> : accès pour la classe et ses filles. Python : un <code>_</code> par convention.'] };

/* ---------- 5.3 ---------- */
const ANIMAUX = `class Monstre:
    def __init__(self, nom):
        self.nom = nom

    def cri(self):
        return "..."

    def rugir(self):
        return f"{self.nom} : {self.cri()}"
`;
const BUG53 = `class Arme:
    def __init__(self, nom, degats):
        self.nom = nom
        self.degats = degats

    def degats_infliges(self, force):
        return self.degats + force

class Arc(Arme):
    def degats_infligés(self, force):
        return self.degats * 2

arc = Arc("Arc long", 10)
print(arc.degats_infliges(5))`;
LES['p5-3'] = { title:'Redéfinir une méthode (override)', dur:'14 min',
  intro:'Tous les monstres crient, mais pas de la même façon. Une classe fille peut remplacer une méthode héritée par sa propre version : c’est la redéfinition, l’override.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Que se passe-t-il si le constructeur d'une classe fille Python n'appelle pas <code>super().__init__(...)</code> ?</p>`,
      opts:[ {l:'Python l’appelle tout seul', why:'C’est Java qui insère un <code>super()</code> implicite. Python n’appelle rien.'},
             {l:'Les attributs créés par le parent n’existent pas', ok:1},
             {l:'Une erreur dès la ligne class', why:'La classe se définit sans problème. Le souci apparaît à l’utilisation.'},
             {l:'Rien de grave', why:'Dès qu’une méthode lira <code>self.nom</code>, ce sera une <code>AttributeError</code>.'} ],
      ex:'Sans <code>super().__init__</code>, l’objet n’a pas les attributs du parent.' },
    { t:'say', h:'Remplacer une méthode héritée', file:'override.py',
      p:`<p><strong>Redéfinir</strong> une méthode (<em>override</em>), c'est écrire dans la classe fille une méthode avec le <strong>même nom et les mêmes paramètres</strong> qu'une méthode du parent. Pour les objets de la fille, c'est la nouvelle version qui est utilisée.</p><p>Regarde bien : <code>rugir</code> est écrite une seule fois, dans <code>Monstre</code>. Elle appelle <code>self.cri()</code>, et chaque objet fournit son propre cri.</p>`,
      code: ANIMAUX + `
class Loup(Monstre):
    def cri(self):
        return "Aouuuh !"

class Dragon(Monstre):
    def cri(self):
        return "ROOOAAR !"

class Slime(Monstre):
    pass

print(Loup("Croc").rugir())
print(Dragon("Smaug").rugir())
print(Slime("Glu").rugir())` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`class A:
    def nom(self):
        return "A"
    def parler(self):
        return "Je suis " + self.nom()

class B(A):
    def nom(self):
        return "B"

print(B().parler())`,
      opts:[ {l:'Je suis A', why:'<code>parler</code> est écrite dans A, mais <code>self</code> est un objet B : <code>self.nom()</code> cherche d’abord dans B.'},
             {l:'Je suis B', ok:1},
             {l:'Une erreur : B n’a pas de méthode parler', why:'B hérite de <code>parler</code>.'},
             {l:'Je suis AB', why:'B remplace <code>nom</code>, il ne l’ajoute pas à celui de A.'} ],
      ex:'Python cherche toujours la méthode en partant de la classe de l’objet : B d’abord, puis A. C’est le cœur du polymorphisme (chapitre 6).' },
    { t:'compare', h:'Et en Java ? @Override',
      p:`<p>En Java, on redéfinit pareil, en ajoutant l'annotation <code>@Override</code> au-dessus. Elle n'est pas obligatoire, mais elle demande au compilateur de vérifier qu'on remplace bien une méthode du parent. Une faute de frappe dans le nom ? Erreur de compilation.</p>`,
      py:`class Monstre:
    def cri(self):
        return "..."

class Loup(Monstre):
    def cri(self):
        return "Aouuuh !"`,
      java:`public class Monstre {
    public String cri() {
        return "...";
    }
}

public class Loup extends Monstre {
    @Override
    public String cri() {
        return "Aouuuh !";
    }
}`,
      notes:['Même nom, mêmes paramètres, même type de retour.','On ne peut pas réduire la visibilité : une méthode <code>public</code> du parent ne peut pas devenir <code>private</code> dans la fille.','Python n’a pas de <code>@Override</code> : une faute de frappe crée une nouvelle méthode sans prévenir. Méfiance !'] },
    { t:'code', bug:1, h:'La redéfinition ratée', file:'bug.py',
      p:`<p>L'arc devrait infliger le double de ses dégâts, sans tenir compte de la force : <code>20</code>. Mais le code affiche <code>15</code>. Trouve pourquoi la redéfinition ne marche pas.</p>`,
      code: BUG53,
      sol: BUG53.replace('def degats_infligés(self, force):', 'def degats_infliges(self, force):'),
      hints:['Compare lettre par lettre le nom de la méthode dans Arme et dans Arc.','Il y a un accent dans <code>degats_infligés</code> chez Arc : ce n’est pas le même nom. Enlève-le.'],
      check:(r, code) => {
        if (same(code, BUG53)) return START;
        if (r.err) return ERR;
        if (!/^20$/m.test(r.out.trim())) return 'L’arc doit infliger 20.';
        if (/infligés/.test(code)) return 'Il reste une méthode <code>degats_infligés</code> avec un accent.';
        return true;
      },
      ok:'Une lettre de différence, et Python crée une nouvelle méthode au lieu de remplacer l’ancienne. En Java, <code>@Override</code> aurait refusé de compiler.' },
    { t:'say', h:'Redéfinition ou surcharge ?',
      p:`<p>Deux mots proches, deux idées différentes. Le prof adore cette question :</p>`,
      snip:`                Redéfinition (override)          Surcharge (overload, Java)
Où ?            dans une classe fille            dans la même classe
Signature       même nom, mêmes paramètres       même nom, paramètres différents
Choisie quand ? à l'exécution (classe de         à la compilation (types des
                l'objet)                         arguments)
Exemple         Loup.cri() remplace              soigner(int) et
                Monstre.cri()                    soigner(Potion)`,
      p2:`<p>Python n'a pas de vraie surcharge : deux méthodes avec le même nom dans une classe, et la seconde efface la première. Tu verras la surcharge en détail au chapitre 6.</p>` },
    { t:'quiz', lang:'java', h:'Override ou overload ?', p:`<p>Dans ce code Java, que fait la méthode <code>attaquer(Monstre m, int bonus)</code> de <code>Guerrier</code> ?</p>`, snip:`public class Personnage {
    public void attaquer(Monstre m) { ... }
}

public class Guerrier extends Personnage {
    public void attaquer(Monstre m, int bonus) { ... }
}`,
      opts:[ {l:'Elle redéfinit attaquer', why:'Pour redéfinir, il faut les mêmes paramètres. Ici, il y en a un de plus.'},
             {l:'Elle surcharge attaquer', ok:1},
             {l:'Elle ne compile pas', why:'C’est permis : deux méthodes de même nom avec des paramètres différents.'},
             {l:'Elle remplace attaquer pour tous les personnages', why:'Elle n’existe que dans Guerrier, et ne remplace rien.'} ],
      ex:'Paramètres différents : c’est une surcharge. Un Guerrier a maintenant deux méthodes <code>attaquer</code>. Avec <code>@Override</code>, le compilateur aurait signalé l’erreur.' },
    { t:'say', h:'Tu redéfinis depuis le chapitre 4 !', file:'object.py',
      p:`<p>Quand tu écris <code>__str__</code> ou <code>__eq__</code>, tu redéfinis en fait les méthodes héritées de la classe <code>object</code>. Pareil en Java avec <code>toString()</code> et <code>equals()</code>, héritées de <code>Object</code> : voilà pourquoi on met <code>@Override</code> au-dessus.</p>`,
      code:`class Potion:
    def __init__(self, nom):
        self.nom = nom

class BellePotion(Potion):
    def __str__(self):
        return "Potion : " + self.nom

print(Potion("Soin"))
print(BellePotion("Soin"))` },
    { t:'compare', h:'Interdire l’héritage : final',
      p:`<p>En Java, <code>final</code> devant une classe interdit d'en hériter. Devant une méthode, il interdit de la redéfinir. Utile pour les classes qui ne sont pas conçues pour être étendues, ou les méthodes sensibles. Python n'a pas d'équivalent obligatoire.</p>`,
      py:`# Pas d'équivalent imposé en Python.
# On documente simplement :
class Regles:
    """Ne pas hériter de cette classe."""
    def degats(self, force):
        return force * 2`,
      java:`public final class Regles {       // pas de classe fille
    ...
}

public class Personnage {
    public final int getPv() {     // pas de redéfinition
        return pv;
    }
}

public class Triche extends Regles { }  // erreur !`,
      notes:['<code>String</code> est une classe <code>final</code> en Java : impossible d’en hériter.','Règle d’or : « conçois ta classe pour l’héritage, ou interdis-le ».'] },
    { t:'code', h:'À toi : chaque monstre attaque à sa façon', file:'attaques.py',
      p:`<p>La classe <code>Monstre</code> a une méthode <code>degats()</code> qui renvoie 5. Crée :</p><ul><li><code>Rat(Monstre)</code> : ses dégâts valent 2 ;</li><li><code>Troll(Monstre)</code> : ses dégâts valent 5 fois sa <code>taille</code> (un attribut en plus, donné au constructeur).</li></ul><p>Puis affiche les dégâts de <code>Rat("Raton")</code> et de <code>Troll("Grok", 3)</code>.</p>`,
      code:`class Monstre:
    def __init__(self, nom):
        self.nom = nom

    def degats(self):
        return 5
`,
      sol:`class Monstre:
    def __init__(self, nom):
        self.nom = nom

    def degats(self):
        return 5

class Rat(Monstre):
    def degats(self):
        return 2

class Troll(Monstre):
    def __init__(self, nom, taille):
        super().__init__(nom)
        self.taille = taille

    def degats(self):
        return 5 * self.taille

print(Rat("Raton").degats())
print(Troll("Grok", 3).degats())`,
      hints:['Rat redéfinit seulement <code>degats</code>. Troll a besoin d’un constructeur avec <code>super().__init__(nom)</code> pour ajouter la taille.','Dans Troll : <code>def degats(self): return 5 * self.taille</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + '\nprint("#T", Rat("a").degats(), Troll("b", 7).degats(), Monstre("c").degats(), Troll("d", 1).nom)');
        if (t.err) return TESTERR(t);
        if (!/#T 2 35 5 d/.test(t.out)) return 'J’attends : un Rat fait 2, un Troll de taille 7 fait 35, un Monstre ordinaire fait toujours 5, et le Troll garde son nom.';
        if (!/^2$/m.test(r.out) || !/^15$/m.test(r.out)) return 'Affiche les dégâts du Rat (2) et du Troll de taille 3 (15).';
        return true;
      },
      ok:'Chaque classe donne sa réponse à la même question : « combien de dégâts ? ».' },
    { t:'code', defi:1, h:'Une méthode modèle', file:'modele.py',
      p:`<p>Dans <code>Monstre</code>, écris une méthode <code>tour()</code> qui renvoie <code>NOM attaque : X dégâts</code>, en appelant <code>self.degats()</code>. Elle ne doit être écrite <strong>qu'une fois</strong>, dans Monstre.</p><p>Puis crée <code>Goule(Monstre)</code> dont les dégâts valent 8, et <code>Spectre(Monstre)</code> dont les dégâts valent 12. Affiche le tour de chacun dans une boucle sur <code>[Goule("Goule"), Spectre("Spectre")]</code>.</p>`,
      code:`class Monstre:
    def __init__(self, nom):
        self.nom = nom

    def degats(self):
        return 1
`,
      sol:`class Monstre:
    def __init__(self, nom):
        self.nom = nom

    def degats(self):
        return 1

    def tour(self):
        return f"{self.nom} attaque : {self.degats()} dégâts"

class Goule(Monstre):
    def degats(self):
        return 8

class Spectre(Monstre):
    def degats(self):
        return 12

for m in [Goule("Goule"), Spectre("Spectre")]:
    print(m.tour())`,
      hints:['<code>tour</code> est dans Monstre : <code>return f"{self.nom} attaque : {self.degats()} dégâts"</code>.','Goule et Spectre ne redéfinissent que <code>degats</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if ((code.match(/def\s+tour/g) || []).length !== 1) return 'La méthode <code>tour</code> doit être écrite une seule fois, dans Monstre.';
        if (!/Goule attaque : 8 dégâts/.test(r.out) || !/Spectre attaque : 12 dégâts/.test(r.out)) return 'J’attends <code>Goule attaque : 8 dégâts</code> et <code>Spectre attaque : 12 dégâts</code>.';
        const t = await test([], code + '\nprint("#T", Monstre("M").tour())');
        if (t.err || !/#T M attaque : 1 dégâts/.test(t.out)) return 'Un Monstre ordinaire doit aussi avoir son tour : <code>M attaque : 1 dégâts</code>.';
        return true;
      },
      ok:'La méthode générale est dans le parent, le détail dans chaque fille. Ce schéma a un nom : le <em>Template Method</em>, qu’on reverra au chapitre 7.' }
  ],
  recap:['<strong>Redéfinir</strong> (<em>override</em>) : même nom, mêmes paramètres, dans la classe fille. C’est la version de la classe de l’objet qui est utilisée.','Java : <code>@Override</code> fait vérifier la redéfinition par le compilateur. Python : attention aux fautes de frappe.','<strong>Surcharge</strong> (<em>overload</em>, Java) : même nom, paramètres différents, choisie à la compilation. Ce n’est pas une redéfinition.','<code>__str__</code>, <code>__eq__</code>, <code>toString()</code>, <code>equals()</code> sont des redéfinitions de méthodes de <code>object</code> / <code>Object</code>.','Java <code>final</code> : classe sans fille, ou méthode non redéfinissable.'] };

/* ---------- 5.4 ---------- */
const BUG54 = BASE + `
class Paladin(Personnage):
    def __init__(self, nom, pv, foi):
        super().__init__(nom, pv)
        self.foi = foi

    def presenter(self):
        return presenter() + f" [foi {self.foi}]"

arthur = Paladin("Arthur", 120, 7)
print(arthur.presenter())`;
LES['p5-4'] = { title:'Étendre une méthode avec super()', dur:'15 min',
  intro:'Redéfinir, c’est remplacer. Mais souvent, on veut garder ce que fait le parent et ajouter quelque chose. super() sert aussi à ça. Et on verra l’héritage multiple, puis quand il ne faut pas hériter.',
  steps:[
    { t:'quiz', rev:1, lang:'java', h:'Une question sur la leçon d’avant', p:`<p>Quel est le rôle de <code>@Override</code> en Java ?</p>`,
      opts:[ {l:'Il rend la méthode obligatoire', why:'Il ne rend rien obligatoire : il fait vérifier une redéfinition.'},
             {l:'Il demande au compilateur de vérifier qu’on redéfinit bien une méthode du parent', ok:1},
             {l:'Il permet la surcharge', why:'La surcharge n’a besoin d’aucune annotation. Et avec <code>@Override</code>, une surcharge serait refusée.'},
             {l:'Il rend la méthode privée', why:'Ça n’a aucun rapport avec la visibilité.'} ],
      ex:'<code>@Override</code> attrape les fautes de frappe et les mauvais paramètres à la compilation.' },
    { t:'say', h:'Garder, puis ajouter', file:'etendre.py',
      p:`<p>Dans une méthode redéfinie, <code>super().methode(...)</code> appelle la <strong>version du parent</strong>. On peut ainsi réutiliser son travail, puis le compléter.</p><p>Ici, le Mage se présente comme un Personnage, puis ajoute sa mana. Et sa façon de recevoir des coups : le parent enlève les PV, puis le Mage perd aussi un peu de mana.</p>`,
      code: BASE + `
class Mage(Personnage):
    def __init__(self, nom, pv, mana):
        super().__init__(nom, pv)
        self.mana = mana

    def presenter(self):
        return super().presenter() + f" [mana {self.mana}]"

    def recevoir(self, degats):
        super().recevoir(degats)
        self.mana = max(0, self.mana - degats // 2)

merlin = Mage("Merlin", 80, 50)
merlin.recevoir(20)
print(merlin.presenter())` },
    { t:'compare', h:'Et en Java ? super.methode()',
      p:`<p>En Java, on écrit <code>super.methode(...)</code>, sans parenthèses après <code>super</code>.</p>`,
      py:`class Mage(Personnage):
    def presenter(self):
        return super().presenter() + f" [mana {self.mana}]"`,
      java:`public class Mage extends Personnage {
    private int mana;

    @Override
    public String presenter() {
        return super.presenter() + " [mana " + mana + "]";
    }
}`,
      notes:['Python : <code>super().presenter()</code>. Java : <code>super.presenter()</code>.','Dans un constructeur Java, <code>super(...)</code> appelle le constructeur parent. Dans une méthode, <code>super.m()</code> appelle la méthode du parent.','Pareil pour <code>toString()</code> : <code>return super.toString() + "...";</code>'] },
    { t:'code', bug:1, h:'Répare le Paladin', file:'bug.py',
      p:`<p>Ce code plante. Le Paladin veut réutiliser la présentation de son parent. Répare la ligne fautive.</p>`,
      code: BUG54,
      sol: BUG54.replace('return presenter() +', 'return super().presenter() +'),
      hints:['<code>presenter()</code> tout seul n’existe pas : c’est une méthode, pas une fonction libre.','Pour appeler la version du parent : <code>super().presenter()</code>.'],
      check:(r, code) => {
        if (same(code, BUG54)) return START;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        if (!/Arthur \(120 PV\) \[foi 7\]/.test(r.out)) return 'Il faut afficher <code>Arthur (120 PV) [foi 7]</code>.';
        return true;
      },
      ok:'Attention : <code>self.presenter()</code> aurait rappelé la méthode du Paladin elle-même, sans fin. Pour la version du parent, c’est <code>super()</code>.' },
    { t:'quiz', h:'self ou super() ?', p:`<p>Que se passe-t-il si, dans <code>Paladin.presenter</code>, on écrit <code>return self.presenter() + "..."</code> ?</p>`,
      opts:[ {l:'Ça appelle la version de Personnage', why:'<code>self.presenter()</code> cherche d’abord dans la classe de l’objet : Paladin. C’est la méthode elle-même.'},
             {l:'La méthode s’appelle elle-même sans fin : RecursionError', ok:1},
             {l:'Ça marche pareil que super()', why:'<code>super()</code> part du parent. <code>self</code> part de la classe de l’objet.'},
             {l:'Une erreur de syntaxe', why:'La syntaxe est correcte. C’est l’exécution qui tourne en boucle.'} ],
      ex:'<code>self.m()</code> appelle la version de l’objet (ici, celle du Paladin). <code>super().m()</code> appelle celle du parent.' },
    { t:'code', h:'À toi : le soin du Prêtre', file:'pretre.py', mem:1,
      p:`<p>Le <code>Personnage</code> a une méthode <code>soigner(n)</code>. Crée une classe <code>Pretre(Personnage)</code> qui redéfinit <code>soigner</code> : un prêtre se soigne <strong>deux fois plus</strong>. Utilise <code>super().soigner(...)</code> pour ne pas recopier le plafond.</p><p>Crée <code>frere = Pretre("Tuck", 100)</code>, inflige-lui 50 dégâts avec <code>recevoir</code>, puis soigne-le de 15.</p>`,
      code:`class Personnage:
    def __init__(self, nom, pv_max):
        self.nom = nom
        self.pv_max = pv_max
        self.pv = pv_max

    def recevoir(self, degats):
        self.pv = max(0, self.pv - degats)

    def soigner(self, n):
        self.pv = min(self.pv_max, self.pv + n)
`,
      sol:`class Personnage:
    def __init__(self, nom, pv_max):
        self.nom = nom
        self.pv_max = pv_max
        self.pv = pv_max

    def recevoir(self, degats):
        self.pv = max(0, self.pv - degats)

    def soigner(self, n):
        self.pv = min(self.pv_max, self.pv + n)

class Pretre(Personnage):
    def soigner(self, n):
        super().soigner(n * 2)

frere = Pretre("Tuck", 100)
frere.recevoir(50)
frere.soigner(15)`,
      hints:['Pretre n’a besoin que d’une méthode : <code>def soigner(self, n):</code>.','Dedans, une seule ligne : <code>super().soigner(n * 2)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/super\(\)\.soigner\s*\(/.test(code)) return 'Utilise <code>super().soigner(...)</code> dans la méthode du Prêtre.';
        if (attr(r, 'frere', 'pv') !== '80') return `Tuck a ${esc(attr(r, 'frere', 'pv'))} PV. Avec 50 PV et un soin de 15 doublé, il devrait en avoir 80.`;
        const t = await test([], code + '\n_p = Pretre("P", 30)\n_p.recevoir(10)\n_p.soigner(50)\nprint("#T", _p.pv)\n_q = Personnage("Q", 30)\n_q.recevoir(10)\n_q.soigner(5)\nprint("#U", _q.pv)');
        if (t.err) return TESTERR(t);
        if (!/#T 30/.test(t.out)) return 'Le soin du prêtre doit garder le plafond de <code>pv_max</code> : réutilise la méthode du parent.';
        if (!/#U 25/.test(t.out)) return 'Un Personnage ordinaire doit toujours soigner normalement.';
        return true;
      },
      ok:'Une ligne, et le Prêtre profite du plafond déjà écrit dans le parent.' },
    { t:'say', h:'L’héritage multiple en Python', file:'multiple.py',
      p:`<p>Python permet d'hériter de <strong>plusieurs</strong> classes : <code>class Paladin(Guerrier, Pretre)</code>. Si deux parents ont la même méthode, Python suit un ordre précis : le <strong>MRO</strong> (<em>Method Resolution Order</em>), de gauche à droite, chaque parent après tous ses enfants.</p><p>Et <code>super()</code> suit ce MRO, pas seulement « mon parent ». Ici, en forme de losange, chaque classe n'est appelée qu'une fois.</p>`,
      code:`class Personnage:
    def benir(self):
        print("Personnage : bénédiction de base")

class Guerrier(Personnage):
    def benir(self):
        print("Guerrier : courage")
        super().benir()

class Pretre(Personnage):
    def benir(self):
        print("Prêtre : lumière")
        super().benir()

class Paladin(Guerrier, Pretre):
    pass

Paladin().benir()
print([c.__name__ for c in Paladin.__mro__])` },
    { t:'compare', h:'Et en Java ? Un seul parent',
      p:`<p>Java interdit l'héritage multiple de classes : une classe a <strong>exactement un</strong> parent. Ça évite le « problème du losange » (<em>diamond problem</em>) : quelle version prendre quand deux parents ont la même méthode ? Java a une autre solution, les <strong>interfaces</strong> : une classe peut en avoir plusieurs (chapitre 7).</p>`,
      py:`class Paladin(Guerrier, Pretre):
    pass`,
      java:`public class Paladin extends Guerrier, Pretre { }
// erreur : une classe ne peut étendre qu'une classe

public class Paladin extends Guerrier
                     implements Soigneur { }
// OK : un parent, et des interfaces (chapitre 7)`,
      notes:['Python : héritage multiple permis, avec le MRO pour savoir quelle méthode gagne.','Java : un seul <code>extends</code>, mais plusieurs <code>implements</code>.','Même en Python, l’héritage multiple complique vite le code. Utilise-le avec prudence.'] },
    { t:'say', h:'Quand ne pas hériter',
      p:`<p>L'héritage est un lien <strong>très fort</strong> : chaque changement dans le parent touche toutes les filles. Avant d'hériter, pose-toi deux questions :</p><ol><li><strong>« Est-ce que X est un Y ? »</strong> Si la bonne phrase est « X <em>a un</em> Y », il faut un attribut, pas un héritage (chapitre 8).</li><li><strong>Est-ce qu'un X peut remplacer un Y partout ?</strong> Un piège classique : une <code>StatueVivante</code> qui hérite de <code>Personnage</code>, mais qui ne peut pas bouger ni être soignée. Partout où le jeu attend un Personnage, la statue risque de tout casser. On reparlera de cette règle (le principe de Liskov) au chapitre 10.</li></ol>`,
      snip:`class Heros(Inventaire):      # mauvais : un héros A un inventaire
    ...

class Heros:                  # bon : un attribut
    def __init__(self):
        self.inventaire = Inventaire()` },
    { t:'quiz', h:'Hériter ou pas ?', p:`<p>Une classe <code>Equipe</code> doit contenir des héros. Que choisir ?</p>`,
      opts:[ {l:'class Equipe(Heros)', why:'Une équipe n’est pas un héros.'},
             {l:'class Equipe(list), pour avoir append et len', why:'Tentant, mais l’équipe hériterait de <strong>toutes</strong> les méthodes de list, même celles qui cassent ses règles (ajouter n’importe quoi, sans limite…).'},
             {l:'Un attribut self.membres = [] dans Equipe', ok:1},
             {l:'class Heros(Equipe)', why:'Un héros n’est pas une équipe.'} ],
      ex:'Une équipe <strong>a</strong> des membres. Un attribut liste, avec des méthodes pour contrôler l’ajout : c’est la composition (chapitre 8).' },
    { t:'code', defi:1, h:'Étendre __str__ sur deux étages', file:'etages.py',
      p:`<p>Écris trois classes, chacune avec son <code>__str__</code> qui <strong>étend</strong> celui du parent avec <code>super().__str__()</code> :</p><ul><li><code>Arme(nom, degats)</code> → <code>Épée (12)</code></li><li><code>ArmeMagique(Arme)</code> ajoute <code>element</code> → <code>Épée (12) de feu</code></li><li><code>ArmeLegendaire(ArmeMagique)</code> ajoute <code>proprietaire</code> → <code>Épée (12) de feu, ayant appartenu à Arthur</code></li></ul><p>Affiche <code>ArmeLegendaire("Excalibur", 30, "lumière", "Arthur")</code>.</p>`,
      code:``,
      sol:`class Arme:
    def __init__(self, nom, degats):
        self.nom = nom
        self.degats = degats

    def __str__(self):
        return f"{self.nom} ({self.degats})"

class ArmeMagique(Arme):
    def __init__(self, nom, degats, element):
        super().__init__(nom, degats)
        self.element = element

    def __str__(self):
        return super().__str__() + " de " + self.element

class ArmeLegendaire(ArmeMagique):
    def __init__(self, nom, degats, element, proprietaire):
        super().__init__(nom, degats, element)
        self.proprietaire = proprietaire

    def __str__(self):
        return super().__str__() + ", ayant appartenu à " + self.proprietaire

print(ArmeLegendaire("Excalibur", 30, "lumière", "Arthur"))`,
      hints:['Chaque constructeur appelle celui de son parent, puis ajoute son attribut.','Chaque <code>__str__</code> : <code>return super().__str__() + ...</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if ((code.match(/super\(\)\.__str__\s*\(/g) || []).length < 2) return 'Les deux classes filles doivent étendre <code>__str__</code> avec <code>super().__str__()</code>.';
        if (!/Excalibur \(30\) de lumière, ayant appartenu à Arthur/.test(r.out)) return 'J’attends <code>Excalibur (30) de lumière, ayant appartenu à Arthur</code>.';
        const t = await test([], code + '\nprint("#T", str(Arme("A", 1)), "|", str(ArmeMagique("B", 2, "glace")))');
        if (t.err || !/#T A \(1\) \| B \(2\) de glace/.test(t.out)) return 'Chaque étage doit s’afficher correctement : <code>A (1)</code> et <code>B (2) de glace</code>.';
        return true;
      },
      ok:'Trois étages, chacun ajoute sa touche sans rien recopier.' }
  ],
  recap:['<code>super().m()</code> (Python) / <code>super.m()</code> (Java) appelle la version du parent : on la réutilise, puis on ajoute.','<code>self.m()</code> appelle la version de l’objet. Dans <code>m</code> elle-même, ça boucle à l’infini.','Python permet l’héritage multiple (ordre : le <strong>MRO</strong>). Java n’autorise qu’un seul parent, mais plusieurs interfaces.','N’hérite pas pour réutiliser du code si « est un » est faux. « A un » → un attribut (composition).'] };

/* ---------- 5.5 ---------- */
const G1 = `class Personnage:
    def __init__(self, nom, pv, force):
        self.nom = nom
        self.pv = pv
        self.force = force

    def est_vivant(self):
        return self.pv > 0

    def recevoir(self, degats):
        self.pv = max(0, self.pv - degats)

    def degats(self):
        return self.force

    def attaquer(self, cible):
        d = self.degats()
        cible.recevoir(d)
        return f"{self.nom} inflige {d} dégâts à {cible.nom}"

    def __str__(self):
        return f"{self.nom} ({self.pv} PV)"`;
const G2 = `

class Guerrier(Personnage):
    def __init__(self, nom, pv, force):
        super().__init__(nom, pv, force)
        self.rage = 0

    def recevoir(self, degats):
        super().recevoir(degats)
        self.rage += 1

    def degats(self):
        return self.force + self.rage * 2`;
const G3 = `

class Mage(Personnage):
    def __init__(self, nom, pv, force, mana):
        super().__init__(nom, pv, force)
        self.mana = mana

    def degats(self):
        if self.mana >= 10:
            self.mana -= 10
            return self.force * 3
        return self.force

    def __str__(self):
        return super().__str__() + f" [mana {self.mana}]"`;
const G4 = `

conan = Guerrier("Conan", 120, 10)
merlin = Mage("Merlin", 70, 6, 25)
ogre = Personnage("Ogre", 200, 12)
for h in [conan, merlin]:
    print(h.attaquer(ogre))
print(ogre.attaquer(conan))
print(conan.attaquer(ogre))
print(merlin.attaquer(ogre))
print(merlin.attaquer(ogre))
for p in [conan, merlin, ogre]:
    print(p)`;
LES['p5-5'] = { title:'Projet : Guerrier et Mage', dur:'18 min',
  intro:'Tu construis une petite famille de classes pour le jeu : un Personnage de base, un Guerrier qui enrage quand on le frappe, un Mage qui brûle sa mana. Et tu les fais combattre ensemble.',
  steps:[
    { t:'say', h:'Le projet',
      p:`<p>La classe <code>Personnage</code> a une méthode <code>attaquer</code> qui appelle <code>self.degats()</code>. Les classes filles vont redéfinir <code>degats</code> (et un peu plus). À la fin, ce combat doit s'afficher :</p>`,
      snip:`Conan inflige 10 dégâts à Ogre
Merlin inflige 18 dégâts à Ogre
Ogre inflige 12 dégâts à Conan
Conan inflige 12 dégâts à Ogre
Merlin inflige 18 dégâts à Ogre
Merlin inflige 6 dégâts à Ogre
Conan (108 PV)
Merlin (70 PV) [mana 5]
Ogre (136 PV)`,
      p2:`<p>Quatre étapes, et je reprends ton code à chaque fois.</p>` },
    { t:'code', h:'Étape 1 : la classe de base', file:'combat.py', mem:1,
      p:`<p>Écris la classe <code>Personnage</code> :</p><ul><li>constructeur : <code>nom</code>, <code>pv</code>, <code>force</code> ;</li><li><code>est_vivant()</code> et <code>recevoir(degats)</code> (jamais sous 0) ;</li><li><code>degats()</code> renvoie la force ;</li><li><code>attaquer(cible)</code> calcule <code>d = self.degats()</code>, le fait recevoir à la cible, et renvoie <code>Conan inflige 10 dégâts à Ogre</code> ;</li><li><code>__str__</code> renvoie <code>Conan (120 PV)</code>.</li></ul>`,
      code:``,
      sol: G1,
      hints:['Dans <code>attaquer</code>, il est important de passer par <code>self.degats()</code> : c’est ce qui permettra aux filles de changer les dégâts.','<code>d = self.degats()</code>, <code>cible.recevoir(d)</code>, puis <code>return f"{self.nom} inflige {d} dégâts à {cible.nom}"</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + '\n_a = Personnage("A", 50, 7)\n_b = Personnage("B", 10, 3)\nprint("#T", _a.attaquer(_b), "|", _b, _b.est_vivant())\n_a.attaquer(_b)\nprint("#U", _b.pv, _b.est_vivant(), _a.degats())');
        if (t.err) return TESTERR(t);
        if (!/#T A inflige 7 dégâts à B \| B \(3 PV\) True/.test(t.out)) return 'Quand A (force 7) attaque B (10 PV) : <code>attaquer</code> doit renvoyer <code>A inflige 7 dégâts à B</code>, et B s’affiche <code>B (3 PV)</code>.';
        if (!/#U 0 False 7/.test(t.out)) return 'Les PV ne doivent pas descendre sous 0, et <code>degats()</code> renvoie la force.';
        if (!/self\.degats\s*\(\s*\)/.test(code)) return 'Dans <code>attaquer</code>, calcule les dégâts avec <code>self.degats()</code>.';
        return true;
      },
      ok:'La classe de base est prête. Le point clé : <code>attaquer</code> demande les dégâts à <code>self.degats()</code>.' },
    { t:'code', carry:1, h:'Étape 2 : le Guerrier', file:'combat.py', mem:1,
      p:`<p>Sous la classe Personnage, ajoute <code>Guerrier(Personnage)</code> :</p><ul><li>son constructeur appelle celui du parent, et met <code>rage</code> à 0 ;</li><li>il redéfinit <code>recevoir</code> : il reçoit les dégâts <strong>comme un Personnage</strong> (avec <code>super()</code>), puis sa rage augmente de 1 ;</li><li>il redéfinit <code>degats</code> : force + rage × 2.</li></ul>`,
      code:`# Étape 2 : la classe Guerrier
`,
      sol: G1 + G2,
      hints:['<code>recevoir</code> : <code>super().recevoir(degats)</code>, puis <code>self.rage += 1</code>.','<code>degats</code> : <code>return self.force + self.rage * 2</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/class\s+Guerrier\s*\(\s*Personnage\s*\)/.test(code)) return 'Guerrier doit hériter de Personnage.';
        const t = await test([], code + '\n_g = Guerrier("G", 30, 5)\n_m = Personnage("M", 100, 8)\nprint("#A", _g.degats(), _g.rage)\n_m.attaquer(_g)\nprint("#B", _g.pv, _g.rage, _g.degats())\nprint("#C", _g.attaquer(_m), _m.pv)\n_g.recevoir(99)\nprint("#D", _g.pv, _g.rage)');
        if (t.err) return TESTERR(t);
        if (!/#A 5 0/.test(t.out)) return 'Un Guerrier tout neuf a 0 de rage, et ses dégâts valent sa force.';
        if (!/#B 22 1 7/.test(t.out)) return 'Quand un Guerrier de 30 PV reçoit 8 dégâts : 22 PV, rage 1, et ses dégâts passent à force + 2.';
        if (!/#C G inflige 7 dégâts à M 93/.test(t.out)) return 'Son attaque doit utiliser ses dégâts redéfinis : <code>G inflige 7 dégâts à M</code>.';
        if (!/#D 0 2/.test(t.out)) return 'Réutilise <code>super().recevoir</code> : les PV du Guerrier ne doivent pas descendre sous 0.';
        return true;
      },
      ok:'Le Guerrier n’a pas touché à <code>attaquer</code>, et pourtant ses attaques deviennent plus fortes avec la rage.' },
    { t:'code', carry:1, h:'Étape 3 : le Mage', file:'combat.py', mem:1,
      p:`<p>Ajoute <code>Mage(Personnage)</code> :</p><ul><li>son constructeur reçoit en plus <code>mana</code> ;</li><li><code>degats()</code> : s'il a au moins 10 de mana, il en dépense 10 et inflige force × 3 ; sinon, juste sa force ;</li><li><code>__str__</code> étend celui du parent : <code>Merlin (70 PV) [mana 5]</code>.</li></ul>`,
      code:`# Étape 3 : la classe Mage
`,
      sol: G1 + G2 + G3,
      hints:['<code>degats</code> : <code>if self.mana &gt;= 10:</code> → <code>self.mana -= 10</code> et <code>return self.force * 3</code>. Sinon <code>return self.force</code>.','<code>__str__</code> : <code>return super().__str__() + f" [mana {self.mana}]"</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/class\s+Mage\s*\(\s*Personnage\s*\)/.test(code)) return 'Mage doit hériter de Personnage.';
        const t = await test([], code + '\n_m = Mage("M", 40, 4, 15)\nprint("#A", str(_m))\nprint("#B", _m.degats(), _m.mana, _m.degats(), _m.mana)\n_x = Personnage("X", 100, 1)\nprint("#C", _m.attaquer(_x))');
        if (t.err) return TESTERR(t);
        if (!/#A M \(40 PV\) \[mana 15\]/.test(t.out)) return 'Un Mage s’affiche <code>M (40 PV) [mana 15]</code>, en étendant le <code>__str__</code> du parent.';
        if (!/#B 12 5 4 5/.test(t.out)) return 'Un Mage de force 4 avec 15 de mana : premier sort 12 dégâts (il reste 5 de mana), puis seulement 4 (pas assez de mana).';
        if (!/#C M inflige 4 dégâts à X/.test(t.out)) return 'Son attaque doit utiliser ses dégâts redéfinis.';
        return true;
      },
      ok:'Deux classes filles, deux façons différentes de calculer les dégâts, et une seule méthode <code>attaquer</code>.' },
    { t:'code', carry:1, h:'Étape 4 : le combat', file:'combat.py',
      p:`<p>Sous les classes, crée <code>conan = Guerrier("Conan", 120, 10)</code>, <code>merlin = Mage("Merlin", 70, 6, 25)</code> et <code>ogre = Personnage("Ogre", 200, 12)</code>. Puis :</p><ol><li>dans une boucle sur <code>[conan, merlin]</code>, chacun attaque l'ogre ;</li><li>l'ogre attaque Conan ;</li><li>Conan attaque l'ogre, puis Merlin l'attaque deux fois ;</li><li>affiche les trois personnages.</li></ol><p>Chaque attaque est affichée. Compare avec le résultat attendu au début.</p>`,
      code:`# Étape 4 : le combat
`,
      sol: G1 + G2 + G3 + G4,
      hints:['<code>for h in [conan, merlin]: print(h.attaquer(ogre))</code>','Puis <code>print(ogre.attaquer(conan))</code>, <code>print(conan.attaquer(ogre))</code>, deux fois <code>print(merlin.attaquer(ogre))</code>, et une boucle pour afficher les trois.'],
      check:(r, code) => {
        if (r.err) return ERR;
        const want = ['Conan inflige 10 dégâts à Ogre', 'Merlin inflige 18 dégâts à Ogre', 'Ogre inflige 12 dégâts à Conan', 'Conan inflige 12 dégâts à Ogre', 'Merlin inflige 6 dégâts à Ogre', 'Conan (108 PV)', 'Merlin (70 PV) [mana 5]', 'Ogre (136 PV)'];
        const l = linesOf(r.out);
        for (const w of want) if (!l.includes(w)) return `Il manque la ligne <code>${esc(w)}</code>. Vérifie l’ordre des attaques.`;
        if (l.filter(x => x === 'Merlin inflige 18 dégâts à Ogre').length !== 2) return 'Merlin doit infliger 18 dégâts deux fois (tant qu’il a de la mana), puis 6.';
        return true;
      },
      ok:'Regarde la boucle : <code>h.attaquer(ogre)</code> donne 10 pour Conan et 18 pour Merlin. Le même appel, des comportements différents selon l’objet. C’est exactement le sujet du chapitre 6 : le polymorphisme.' },
    { t:'compare', h:'Le Guerrier en Java',
      p:`<p>Voici la classe <code>Guerrier</code> traduite en Java. Repère <code>extends</code>, <code>super(...)</code>, <code>@Override</code> et <code>super.recevoir(...)</code>.</p>`,
      py: G2.trim(),
      java:`public class Guerrier extends Personnage {
    private int rage;

    public Guerrier(String nom, int pv, int force) {
        super(nom, pv, force);
        this.rage = 0;
    }

    @Override
    public void recevoir(int degats) {
        super.recevoir(degats);
        rage++;
    }

    @Override
    public int degats() {
        return force + rage * 2;     // force est protected
    }
}`,
      notes:['<code>super(nom, pv, force)</code> en première ligne du constructeur.','<code>@Override</code> sur chaque méthode redéfinie.','Pour lire <code>force</code>, l’attribut doit être <code>protected</code> dans Personnage (ou il faut un getter).'] },
    { t:'say', h:'Mini-défi dans VS Code',
      p:`<p>Écris les trois classes en Java, chacune dans son fichier : <code>Personnage.java</code>, <code>Guerrier.java</code>, <code>Mage.java</code>. Puis un <code>Combat.java</code> avec le <code>main</code> qui rejoue la bataille.</p><p>Astuce : pour la boucle, crée une liste de personnages avec <code>List&lt;Personnage&gt; heros = List.of(conan, merlin);</code> (et <code>import java.util.List;</code> en haut). Tu remarqueras que la liste est déclarée avec le type <code>Personnage</code>, mais contient un Guerrier et un Mage… On en parle au chapitre 6 !</p>` }
  ],
  recap:['Une classe de base avec une méthode générale (<code>attaquer</code>) qui appelle une méthode que les filles redéfinissent (<code>degats</code>).','Chaque fille appelle <code>super().__init__</code>, et peut étendre une méthode avec <code>super().m()</code>.','Le même appel <code>h.attaquer(ogre)</code> se comporte différemment selon la classe de <code>h</code>.','En Java : <code>extends</code>, <code>super(...)</code>, <code>@Override</code>, <code>super.m()</code>, attributs <code>protected</code>.'] };

Atelier.chapter({ part:"poo", n:5, title:"Héritage",
  lessons:['p5-1','p5-2','p5-3','p5-4','p5-5'].map(id => ({ id, ...LES[id] })) });
})();
