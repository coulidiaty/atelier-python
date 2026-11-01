/* Partie POO · Chapitre 7 : Abstraction et interfaces */
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has } = Atelier.h;
const LES = {};
const attr = (r, o, a) => { const m = memOf(r, o); const x = m && m.attrs && m.attrs.find(t => t.name === a); return x ? x.repr : undefined; };
const same = (code, start) => code.trim() === start.trim();
const START = 'Voilà le bug ! Exécute, lis ce qui se passe, puis corrige le code.';
const TESTERR = t => 'Mes tests font planter ton code : ' + esc(t.err.title) + '. Vérifie les noms de tes classes, de tes méthodes et de leurs paramètres.';
const tryPy = (tag, stmt, exc = 'ValueError') => `\ntry:\n    ${stmt}\n    print("#${tag} PASSE")\nexcept ${exc}:\n    print("#${tag} ERREUR")`;

const SORT = `class Sort:
    def __init__(self, nom, cout):
        if type(self) is Sort:
            raise TypeError("Sort est une classe abstraite")
        self.nom = nom
        self.cout = cout

    def effet(self):
        raise NotImplementedError("effet() doit être redéfinie")

    def lancer(self):
        return f"{self.nom} ({self.cout} mana) : {self.effet()}"
`;

/* ---------- 7.1 ---------- */
const BUG71 = SORT + `
class Soin(Sort):
    def effet(self):
        return "rend 30 PV"

class Gel(Sort):
    def efet(self):
        return "immobilise la cible"

for s in [Soin("Soin", 5), Gel("Gel", 8)]:
    print(s.lancer())`;
LES['p7-1'] = { title:'Les classes abstraites', dur:'14 min',
  intro:'Un « Sort », tout court, ça n’existe pas : il y a des sorts de feu, de soin, de glace. Certaines classes représentent une idée générale, incomplète toute seule. Ce sont les classes abstraites.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur le chapitre d’avant', p:`<p>Qu'est-ce que le <em>duck typing</em> ?</p>`,
      opts:[ {l:'Un objet convient s’il a les méthodes qu’on appelle, quelle que soit sa classe', ok:1},
             {l:'Un objet doit hériter de la bonne classe pour être accepté', why:'C’est justement ce que le duck typing n’exige pas.'},
             {l:'Une façon de convertir un type en un autre', why:'Rien à voir avec les conversions.'},
             {l:'La surcharge des opérateurs', why:'Les méthodes spéciales utilisent le duck typing, mais ce n’est pas la définition.'} ],
      ex:'« Si ça cancane comme un canard… » : Python regarde ce que l’objet sait faire, pas sa famille.' },
    { t:'say', h:'L’abstraction',
      p:`<p>L'<strong>abstraction</strong> (<em>abstraction</em>) : montrer <strong>ce que</strong> fait un objet, cacher <strong>comment</strong> il le fait. Tu en profites tout le temps : <code>liste.sort()</code> trie sans que tu saches quel algorithme il utilise, <code>print</code> affiche sans que tu écrives toi-même sur l'écran.</p><p>L'encapsulation cache les <strong>données</strong>. L'abstraction cache l'<strong>implémentation</strong> derrière un <strong>contrat</strong> : une liste de méthodes promises. En POO, deux outils servent à écrire ce contrat : les <strong>classes abstraites</strong> et les <strong>interfaces</strong>.</p>` },
    { t:'say', h:'Une classe abstraite', file:'abstraite.py', mem:1,
      p:`<p>Une <strong>classe abstraite</strong> (<em>abstract class</em>) représente un concept général, incomplet tout seul :</p><ul><li>on ne peut pas créer d'objet directement avec elle ;</li><li>elle déclare des <strong>méthodes abstraites</strong> (<em>abstract methods</em>) : une promesse sans code, que chaque classe fille doit tenir ;</li><li>elle peut aussi avoir des attributs, un constructeur et des méthodes normales, partagés par toutes ses filles.</li></ul><p>Sur ce site, on simule ça : le constructeur refuse <code>Sort</code> tout seul, et la méthode abstraite lève <code>NotImplementedError</code>. (Le vrai outil Python est pour la leçon suivante.)</p>`,
      code: SORT + `
class BouleDeFeu(Sort):
    def effet(self):
        return "inflige 40 dégâts"

class Soin(Sort):
    def effet(self):
        return "rend 30 PV"

for s in [BouleDeFeu("Boule de feu", 10), Soin("Soin", 5)]:
    print(s.lancer())

try:
    Sort("Sort vague", 1)
except TypeError as e:
    print("Refusé :", e)` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Avec la classe <code>Sort</code> ci-dessus, que se passe-t-il ?</p>`, snip:`class Eclair(Sort):
    pass

e = Eclair("Éclair", 7)
print(e.lancer())`,
      opts:[ {l:'Ça affiche Éclair (7 mana) : ', why:'<code>lancer</code> appelle <code>self.effet()</code>, et Eclair n’a pas redéfini <code>effet</code>.'},
             {l:'Une TypeError à la création', why:'Le constructeur refuse seulement <code>Sort</code> lui-même (<code>type(self) is Sort</code>). Eclair passe.'},
             {l:'Une NotImplementedError au moment de lancer', ok:1},
             {l:'Rien ne s’affiche', why:'<code>lancer</code> appelle <code>effet()</code>, qui lève une erreur.'} ],
      ex:'L’objet se crée, mais dès qu’on appelle <code>effet()</code>, c’est la version abstraite qui s’exécute et proteste. (Avec le vrai module <code>abc</code>, l’erreur arriverait dès la création.)' },
    { t:'code', bug:1, h:'Le sort qui ne marche pas', file:'bug.py',
      p:`<p>Ce code plante sur le sort de Gel. Exécute, lis l'erreur, puis répare-le.</p>`,
      code: BUG71,
      sol: BUG71.replace('def efet(self):', 'def effet(self):'),
      hints:['L’erreur dit que <code>effet()</code> n’a pas été redéfinie dans Gel. Pourtant, il y a bien une méthode…','Regarde son nom : <code>efet</code> au lieu de <code>effet</code>.'],
      check:(r, code) => {
        if (same(code, BUG71)) return START;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        if (!/Gel \(8 mana\) : immobilise la cible/.test(r.out)) return 'J’attends <code>Gel (8 mana) : immobilise la cible</code>.';
        return true;
      },
      ok:'La méthode abstraite a joué son rôle : elle a signalé tout de suite la promesse non tenue, au lieu de laisser le jeu continuer avec un sort vide.' },
    { t:'code', h:'À toi : deux sorts de plus', file:'sorts.py',
      p:`<p>Crée deux classes filles de <code>Sort</code> :</p><ul><li><code>Bouclier</code> : son effet est <code>protège pendant 3 tours</code> ;</li><li><code>Invocation</code> : elle a un attribut en plus, <code>creature</code>, et son effet est par exemple <code>invoque un loup</code>.</li></ul><p>Puis lance <code>Bouclier("Bouclier", 6)</code> et <code>Invocation("Appel", 12, "loup")</code> dans une boucle.</p>`,
      code: SORT,
      sol: SORT + `
class Bouclier(Sort):
    def effet(self):
        return "protège pendant 3 tours"

class Invocation(Sort):
    def __init__(self, nom, cout, creature):
        super().__init__(nom, cout)
        self.creature = creature

    def effet(self):
        return "invoque un " + self.creature

for s in [Bouclier("Bouclier", 6), Invocation("Appel", 12, "loup")]:
    print(s.lancer())`,
      hints:['Bouclier ne redéfinit que <code>effet</code>. Invocation a besoin d’un constructeur : <code>super().__init__(nom, cout)</code>, puis <code>self.creature = creature</code>.','L’effet de l’invocation : <code>return "invoque un " + self.creature</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/Bouclier \(6 mana\) : protège pendant 3 tours/.test(r.out)) return 'J’attends <code>Bouclier (6 mana) : protège pendant 3 tours</code>.';
        if (!/Appel \(12 mana\) : invoque un loup/.test(r.out)) return 'J’attends <code>Appel (12 mana) : invoque un loup</code>.';
        const t = await test([], code + '\nprint("#T", Invocation("X", 1, "golem").lancer())');
        if (t.err || !/#T X \(1 mana\) : invoque un golem/.test(t.out)) return 'L’effet de l’invocation doit utiliser l’attribut <code>creature</code>.';
        return true;
      },
      ok:'Chaque sort tient la promesse du contrat. La méthode <code>lancer</code>, écrite une seule fois dans la classe abstraite, marche pour tous.' },
    { t:'quiz', h:'Abstraite ou pas ?', p:`<p>Laquelle de ces classes ferait une bonne classe abstraite ?</p>`,
      opts:[ {l:'Epee, avec ses dégâts', why:'Une épée est concrète : on peut en créer une et l’utiliser telle quelle.'},
             {l:'Arme, dont chaque sorte calcule ses dégâts différemment', ok:1},
             {l:'Potion de soin, qui rend toujours 20 PV', why:'Rien d’incomplet : elle fait tout ce qu’il faut toute seule.'},
             {l:'Bourse, qui garde des pièces', why:'Une bourse est complète : pas de méthode à laisser aux filles.'} ],
      ex:'« Une arme » en général ne sait pas calculer ses dégâts : ce sont l’épée, l’arc, la dague qui savent. <code>Arme</code> est abstraite, avec une méthode abstraite <code>degats()</code>.' },
    { t:'code', defi:1, h:'Les armes abstraites', file:'armes.py',
      p:`<p>Écris une classe abstraite <code>Arme</code> :</p><ul><li>son constructeur reçoit <code>nom</code> et refuse d'instancier <code>Arme</code> elle-même (<code>TypeError</code>) ;</li><li>une méthode abstraite <code>degats(force)</code> ;</li><li>une méthode normale <code>frapper(force)</code> qui renvoie par exemple <code>Épée : 17 dégâts</code>.</li></ul><p>Puis deux armes concrètes : <code>Epee</code> (dégâts = 10 + force) et <code>Arc</code> (dégâts = 3 × force).</p>`,
      code:``,
      sol:`class Arme:
    def __init__(self, nom):
        if type(self) is Arme:
            raise TypeError("Arme est abstraite")
        self.nom = nom

    def degats(self, force):
        raise NotImplementedError("degats() doit être redéfinie")

    def frapper(self, force):
        return f"{self.nom} : {self.degats(force)} dégâts"

class Epee(Arme):
    def degats(self, force):
        return 10 + force

class Arc(Arme):
    def degats(self, force):
        return 3 * force

print(Epee("Épée").frapper(7))
print(Arc("Arc").frapper(7))`,
      hints:['Copie le schéma de la classe Sort : <code>if type(self) is Arme: raise TypeError(...)</code> dans le constructeur, et <code>raise NotImplementedError(...)</code> dans <code>degats</code>.','<code>frapper</code> : <code>return f"{self.nom} : {self.degats(force)} dégâts"</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + '\nprint("#T", Epee("E").frapper(5), "|", Arc("A").frapper(5))' + tryPy('A', 'Arme("X")', 'TypeError') + `
class _Vide(Arme):
    pass` + tryPy('B', '_Vide("V").frapper(1)', 'NotImplementedError'));
        if (t.err) return TESTERR(t);
        if (!/#T E : 15 dégâts \| A : 15 dégâts/.test(t.out)) return 'Avec une force de 5 : l’épée fait 15 (10 + 5), l’arc aussi (3 × 5). Et <code>frapper</code> renvoie <code>E : 15 dégâts</code>.';
        if (!/#A ERREUR/.test(t.out)) return '<code>Arme("X")</code> doit lever une <code>TypeError</code>.';
        if (!/#B ERREUR/.test(t.out)) return 'Une arme qui ne redéfinit pas <code>degats</code> doit lever <code>NotImplementedError</code> quand on frappe.';
        return true;
      },
      ok:'Le concept général (Arme) fixe le contrat et le code commun. Les détails sont dans les classes concrètes.' }
  ],
  recap:['<strong>Abstraction</strong> : montrer ce que fait un objet, cacher comment. On l’exprime par un <strong>contrat</strong>.','<strong>Classe abstraite</strong> (<em>abstract class</em>) : un concept incomplet, qu’on n’instancie pas. Elle peut avoir des attributs et du code commun.','<strong>Méthode abstraite</strong> : une promesse sans code, que chaque classe fille concrète doit tenir.','Sur ce site : <code>raise NotImplementedError</code> dans la méthode abstraite, et <code>if type(self) is Classe: raise TypeError</code> dans le constructeur.'] };

/* ---------- 7.2 ---------- */
const QUETE = `class Quete:
    def jouer(self):
        lignes = [self.debut()]
        lignes.append(self.epreuve())
        lignes.append(self.recompense())
        return lignes

    def debut(self):
        return "Un villageois demande de l'aide."

    def epreuve(self):
        raise NotImplementedError("epreuve() doit être redéfinie")

    def recompense(self):
        return "Tu gagnes 10 pièces."
`;
LES['p7-2'] = { title:'ABC en Python, abstract en Java', dur:'14 min',
  intro:'Tu as simulé les classes abstraites à la main. Voici les vrais outils : abstract en Java, et le module abc en Python. Puis un schéma très utile qui repose dessus : la méthode modèle.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Que doit faire une classe fille <strong>concrète</strong> d'une classe abstraite ?</p>`,
      opts:[ {l:'Redéfinir toutes les méthodes du parent', why:'Seulement les méthodes abstraites. Les méthodes normales du parent sont héritées.'},
             {l:'Redéfinir toutes les méthodes abstraites', ok:1},
             {l:'Ne rien redéfinir', why:'Alors elle resterait incomplète, donc abstraite elle aussi.'},
             {l:'Appeler raise NotImplementedError', why:'C’est ce que fait la méthode abstraite du parent. La fille, elle, fournit le vrai code.'} ],
      ex:'Une fille qui tient toutes les promesses (toutes les méthodes abstraites) est concrète : on peut l’instancier.' },
    { t:'compare', h:'Le mot abstract en Java',
      p:`<p>En Java, on écrit <code>abstract</code> devant la classe et devant chaque méthode abstraite. Une méthode abstraite n'a pas de corps : juste sa signature et un <code>;</code>. C'est le <strong>compilateur</strong> qui vérifie tout.</p>`,
      py: SORT,
      java:`public abstract class Sort {
    protected final String nom;
    protected final int cout;

    protected Sort(String nom, int cout) {
        this.nom = nom;
        this.cout = cout;
    }

    public abstract String effet();          // pas de corps

    public String lancer() {                 // méthode concrète
        return nom + " (" + cout + " mana) : " + effet();
    }
}

public class Soin extends Sort {
    public Soin() { super("Soin", 5); }

    @Override
    public String effet() { return "rend 30 PV"; }
}

new Sort("x", 1);   // erreur : Sort is abstract; cannot be instantiated`,
      notes:['<code>new Sort(...)</code> ne compile pas.','Une fille qui n’implémente pas toutes les méthodes abstraites doit elle-même être déclarée <code>abstract</code>, sinon erreur de compilation.','Une classe abstraite peut avoir un constructeur : il est appelé par <code>super(...)</code> depuis les filles.'] },
    { t:'say', h:'Le vrai module abc de Python',
      p:`<p>En vrai Python, on écrit une classe abstraite avec le module <code>abc</code> (<em>Abstract Base Classes</em>) : la classe hérite de <code>ABC</code>, et chaque méthode abstraite reçoit le décorateur <code>@abstractmethod</code>.</p><p>Python refuse alors de créer l'objet si une méthode abstraite n'est pas redéfinie, <strong>dès la création</strong>. Ce module ne fonctionne pas sur ce site, mais il marche dans VS Code : c'est lui qu'on attend dans le cours.</p>`,
      snip:`from abc import ABC, abstractmethod

class Sort(ABC):
    def __init__(self, nom, cout):
        self.nom = nom
        self.cout = cout

    @abstractmethod
    def effet(self):
        ...

    def lancer(self):
        return f"{self.nom} ({self.cout} mana) : {self.effet()}"

class Soin(Sort):
    def effet(self):
        return "rend 30 PV"

class Eclair(Sort):
    pass

Soin("Soin", 5).lancer()    # marche
Sort("x", 1)                # TypeError: Can't instantiate abstract class Sort
Eclair("Éclair", 7)         # TypeError aussi : effet n'est pas redéfinie`,
      p2:`<p>Le <code>...</code> (trois points) veut dire « rien ici » : c'est la façon habituelle d'écrire le corps vide d'une méthode abstraite.</p>` },
    { t:'quiz', h:'Avec le vrai abc', p:`<p>Avec le vrai module <code>abc</code> (dans VS Code), à quelle ligne l'erreur arrive-t-elle ?</p>`, snip:`class Eclair(Sort):          # ligne 1
    pass                     # ligne 2

e = Eclair("Éclair", 7)      # ligne 4
print(e.lancer())            # ligne 5`,
      opts:[ {l:'Ligne 1', why:'Définir une classe fille incomplète est permis : elle est simplement abstraite elle aussi.'},
             {l:'Ligne 4', ok:1},
             {l:'Ligne 5', why:'Ce serait le cas avec notre simulation <code>NotImplementedError</code>. Le vrai <code>abc</code> refuse plus tôt.'},
             {l:'Nulle part', why:'Eclair ne redéfinit pas la méthode abstraite <code>effet</code> : impossible de l’instancier.'} ],
      ex:'Avec <code>abc</code>, Python refuse d’instancier une classe qui a encore des méthodes abstraites. L’erreur arrive dès la création : c’est plus sûr que notre simulation.' },
    { t:'fill', lang:'java', h:'Complète la classe abstraite',
      p:`<p>Complète ce code Java : une classe abstraite <code>Monstre</code> et une classe concrète <code>Loup</code>.</p>`,
      tpl:`public [[abstract]] class Monstre {
    protected String nom;

    public abstract int degats()[[;]]

    public String attaquer() {
        return nom + " inflige " + degats();
    }
}

public class Loup [[extends]] Monstre {
    [[@Override]]
    public int degats() {
        return 7;
    }
}`,
      hints:['La classe est incomplète. La méthode abstraite n’a pas de corps : sa ligne se termine directement.','<code>abstract</code>, <code>;</code>, <code>extends</code>, <code>@Override</code>.'],
      ok:'Une classe abstraite Java : <code>abstract</code> devant la classe et la méthode, et une méthode sans corps qui finit par <code>;</code>.' },
    { t:'say', h:'La méthode modèle (Template Method)', file:'modele.py',
      p:`<p>Un usage classique des classes abstraites : la <strong>méthode modèle</strong> (<em>Template Method</em>). La classe abstraite fixe le <strong>squelette</strong> d'un algorithme dans une méthode, et laisse certaines étapes aux classes filles.</p><p>Ici, toutes les quêtes se jouent pareil (début, épreuve, récompense), mais chaque quête a sa propre épreuve. On dit parfois : « ne nous appelle pas, c'est nous qui t'appellerons » (le parent appelle les méthodes de la fille).</p>`,
      code: QUETE + `
class QueteDragon(Quete):
    def epreuve(self):
        return "Tu affrontes un dragon dans sa grotte."

    def recompense(self):
        return "Tu gagnes 500 pièces et une écaille."

class QueteChat(Quete):
    def epreuve(self):
        return "Tu fais descendre un chat d'un arbre."

for q in [QueteDragon(), QueteChat()]:
    for ligne in q.jouer():
        print(ligne)
    print("---")` },
    { t:'quiz', h:'Qui appelle qui ?', p:`<p>Dans l'exemple des quêtes, qui appelle la méthode <code>epreuve()</code> de <code>QueteDragon</code> ?</p>`,
      opts:[ {l:'Le code du bas, directement', why:'Le code du bas appelle seulement <code>q.jouer()</code>.'},
             {l:'La méthode jouer(), écrite dans Quete', ok:1},
             {l:'Le constructeur de QueteDragon', why:'Il n’y a même pas de constructeur ici.'},
             {l:'Personne : elle est abstraite', why:'Elle est abstraite dans Quete, mais QueteDragon la redéfinit, et c’est cette version qui est appelée.'} ],
      ex:'<code>jouer()</code>, dans la classe parente, appelle <code>self.epreuve()</code>. Grâce au polymorphisme, c’est la version de la fille qui s’exécute.' },
    { t:'code', h:'À toi : une nouvelle quête', file:'quete.py',
      p:`<p>Crée une classe <code>QueteMine</code> (fille de <code>Quete</code>) : son épreuve est <code>Tu explores une mine abandonnée.</code> et son début est <code>Un nain a perdu sa pioche.</code> Elle garde la récompense par défaut.</p><p>Puis affiche chaque ligne de <code>QueteMine().jouer()</code>.</p>`,
      code: QUETE,
      sol: QUETE + `
class QueteMine(Quete):
    def debut(self):
        return "Un nain a perdu sa pioche."

    def epreuve(self):
        return "Tu explores une mine abandonnée."

for ligne in QueteMine().jouer():
    print(ligne)`,
      hints:['Redéfinis <code>debut</code> et <code>epreuve</code>, pas <code>jouer</code> : le squelette ne change pas.','Puis <code>for ligne in QueteMine().jouer(): print(ligne)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (/class\s+QueteMine[\s\S]*def\s+jouer/.test(code)) return 'Ne redéfinis pas <code>jouer</code> : c’est le squelette commun. Redéfinis seulement les étapes.';
        const l = linesOf(r.out);
        if (l.join('|') !== "Un nain a perdu sa pioche.|Tu explores une mine abandonnée.|Tu gagnes 10 pièces.") return 'J’attends trois lignes : <code>Un nain a perdu sa pioche.</code>, <code>Tu explores une mine abandonnée.</code>, puis la récompense par défaut.';
        return true;
      },
      ok:'Tu as rempli les cases du squelette, sans toucher à l’algorithme. C’est tout l’intérêt de la méthode modèle.' },
    { t:'code', defi:1, h:'Le marchand modèle', file:'marchand.py',
      p:`<p>Écris une classe abstraite <code>Marchand</code> avec une méthode modèle <code>vendre(prix)</code> qui renvoie le prix final :</p><ol><li>elle applique <code>self.remise(prix)</code> (méthode abstraite, qui renvoie le prix après remise) ;</li><li>puis ajoute <code>self.taxe()</code> (par défaut 2 pièces) ;</li><li>et ne descend jamais sous 1.</li></ol><p>Puis <code>Nain</code> (remise de 10 %, c'est-à-dire <code>prix * 0.9</code>, taxe par défaut) et <code>Elfe</code> (pas de remise, mais une taxe de 5).</p>`,
      code:``,
      sol:`class Marchand:
    def vendre(self, prix):
        final = self.remise(prix) + self.taxe()
        return max(1, final)

    def remise(self, prix):
        raise NotImplementedError("remise() doit être redéfinie")

    def taxe(self):
        return 2

class Nain(Marchand):
    def remise(self, prix):
        return prix * 0.9

class Elfe(Marchand):
    def remise(self, prix):
        return prix

    def taxe(self):
        return 5

print(Nain().vendre(100))
print(Elfe().vendre(100))`,
      hints:['<code>vendre</code> : <code>final = self.remise(prix) + self.taxe()</code>, puis <code>return max(1, final)</code>.','Nain ne redéfinit que <code>remise</code> ; Elfe redéfinit <code>remise</code> (qui renvoie le prix tel quel) et <code>taxe</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
print("#T", Nain().vendre(50), Elfe().vendre(50), Nain().vendre(0), Elfe().vendre(-10))
class _M(Marchand):
    pass` + tryPy('A', '_M().vendre(10)', 'NotImplementedError'));
        if (t.err) return TESTERR(t);
        if (!/#T 47(\.0)? 55 2(\.0)? 1/.test(t.out)) return 'J’attends : Nain 50 → 47 (45 + 2), Elfe 50 → 55, Nain 0 → 2, et jamais moins de 1 (Elfe -10 → 1).';
        if (!/#A ERREUR/.test(t.out)) return 'Un marchand qui ne redéfinit pas <code>remise</code> doit lever <code>NotImplementedError</code>.';
        return true;
      },
      ok:'Une étape abstraite (la remise), une étape avec une valeur par défaut qu’on peut changer (la taxe, qu’on appelle un « crochet », <em>hook</em>), et un squelette fixe.' }
  ],
  recap:['Java : <code>public abstract class X</code>, et <code>public abstract int m();</code> (sans corps). <code>new X()</code> ne compile pas.','Python : <code>from abc import ABC, abstractmethod</code>, <code>class X(ABC)</code>, <code>@abstractmethod</code>. Refus dès la création. (Pas disponible sur ce site, mais dans VS Code.)','Une fille qui ne redéfinit pas toutes les méthodes abstraites reste abstraite.','<strong>Méthode modèle</strong> (<em>Template Method</em>) : le parent fixe le squelette, les filles remplissent les étapes.'] };

/* ---------- 7.3 ---------- */
const BUG73 = `class Volant:
    def voler(self):
        raise NotImplementedError

class Nageur:
    def nager(self):
        raise NotImplementedError

class Canard(Volant, Nageur):
    def voler(self):
        return "Le canard s'envole"

donald = Canard()
print(donald.voler())
print(donald.nager())`;
LES['p7-3'] = { title:'Les interfaces Java', dur:'15 min',
  intro:'Une interface, c’est un contrat pur : une liste de méthodes, sans données. Une classe peut en signer plusieurs. C’est la réponse de Java à l’héritage multiple, et un outil central du cours.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Dans la méthode modèle (<em>Template Method</em>), qui fixe l'ordre des étapes ?</p>`,
      opts:[ {l:'Chaque classe fille', why:'Les filles remplissent les étapes, mais l’ordre est fixé une seule fois.'},
             {l:'La classe parente, dans la méthode modèle', ok:1},
             {l:'Le code qui utilise les objets', why:'Il appelle juste la méthode modèle, sans connaître les étapes.'},
             {l:'Le compilateur', why:'Le compilateur vérifie les types, il ne décide pas de l’algorithme.'} ],
      ex:'Le parent écrit le squelette (<code>jouer</code>, <code>vendre</code>…) et appelle les étapes que les filles redéfinissent.' },
    { t:'compare', h:'Une interface : un contrat pur',
      p:`<p>Une <strong>interface</strong> (<em>interface</em>) liste ce qu'une classe <strong>sait faire</strong> : des signatures de méthodes, sans attributs d'objet. Une classe l'<strong>implémente</strong> avec le mot <code>implements</code>, et doit alors fournir toutes ses méthodes.</p><p>Python n'a pas de mot-clé <code>interface</code> : on utilise une classe abstraite qui ne contient que des méthodes abstraites.</p>`,
      py:`class Volant:
    def voler(self):
        raise NotImplementedError

class Dragon(Volant):
    def voler(self):
        return "Le dragon déploie ses ailes"

class Griffon(Volant):
    def voler(self):
        return "Le griffon plane"`,
      java:`public interface Volant {
    String voler();      // public abstract, implicitement
}

public class Dragon implements Volant {
    @Override
    public String voler() {
        return "Le dragon déploie ses ailes";
    }
}

public class Griffon implements Volant {
    @Override
    public String voler() {
        return "Le griffon plane";
    }
}`,
      notes:['Les méthodes d’une interface sont automatiquement <code>public abstract</code> : pas besoin de l’écrire.','On « implémente » une interface (<code>implements</code>), on « étend » une classe (<code>extends</code>).','Dans la classe, les méthodes doivent être <code>public</code>.'] },
    { t:'compare', h:'Plusieurs interfaces à la fois',
      p:`<p>Une classe Java ne peut étendre (<code>extends</code>) qu'<strong>une</strong> classe, mais elle peut implémenter <strong>plusieurs</strong> interfaces. En Python, on hérite simplement de plusieurs classes « contrat ».</p>`,
      py:`class Dragon(Monstre, Volant, CracheurDeFeu):
    def voler(self):
        return "vole"

    def cracher(self):
        return "crache du feu"`,
      java:`public class Dragon extends Monstre
                    implements Volant, CracheurDeFeu {
    @Override
    public String voler() { return "vole"; }

    @Override
    public String cracher() { return "crache du feu"; }
}`,
      notes:['<code>extends</code> d’abord (une seule classe), puis <code>implements</code> (autant d’interfaces que voulu, séparées par des virgules).','Une interface décrit souvent une <strong>capacité</strong> (« sait voler », « est comparable ») plutôt qu’une famille.'] },
    { t:'say', h:'Ce qu’une interface Java peut contenir',
      p:`<p>Depuis Java 8, une interface peut contenir un peu plus que des méthodes abstraites :</p>`,
      snip:`Contenu                       Permis ?   Remarque
méthodes abstraites           oui        public abstract, implicitement
méthodes default              oui        avec du code, partagé (Java 8+)
méthodes static               oui        fonctions utilitaires
constantes                    oui        public static final, implicitement
attributs d'objet             non        une interface n'a pas d'état
constructeur                  non        on ne crée pas d'objet avec`,
      p2:`<p>Une méthode <code>default</code> a un corps : les classes qui implémentent l'interface la reçoivent toute faite (elles peuvent la redéfinir). Exemple ci-dessous.</p>`, lang:'java' },
    { t:'compare', h:'Une méthode default',
      p:`<p>Ici, l'interface <code>Soignable</code> promet <code>soigner(int n)</code>, et offre gratuitement <code>soinComplet()</code>, écrite à partir de la méthode abstraite.</p>`,
      py:`class Soignable:
    def soigner(self, n):
        raise NotImplementedError

    def soin_complet(self):
        self.soigner(9999)`,
      java:`public interface Soignable {
    int SOIN_MAX = 9999;         // constante

    void soigner(int n);         // abstraite

    default void soinComplet() { // default : avec du code
        soigner(SOIN_MAX);
    }
}`,
      notes:['La méthode <code>default</code> appelle la méthode abstraite : chaque classe fournit <code>soigner</code>, et reçoit <code>soinComplet</code> en cadeau.','<code>SOIN_MAX</code> est automatiquement <code>public static final</code>.'] },
    { t:'quiz', lang:'java', h:'Ça compile ?', p:`<p>Laquelle de ces déclarations Java <strong>ne compile pas</strong> ?</p>`,
      opts:[ {l:'class Dragon extends Monstre implements Volant, Nageur', why:'Une classe parente et deux interfaces : parfait.'},
             {l:'class Dragon extends Monstre, Bete', ok:1},
             {l:'class Canard implements Volant, Nageur', why:'Deux interfaces sans classe parente : permis.'},
             {l:'interface Volant { String voler(); }', why:'Une interface avec une méthode abstraite : parfait.'} ],
      ex:'Java n’autorise qu’une classe après <code>extends</code>. Pour plusieurs « parents », il faut des interfaces.' },
    { t:'say', h:'Classe abstraite ou interface ?',
      p:`<p>La question piège du cours. Le tableau à retenir :</p>`,
      snip:`                        Classe abstraite          Interface
But                     base commune de classes   capacité, rôle, pour
                        de la même famille        n'importe quelle classe
Attributs (état)        oui                       non (constantes seulement)
Constructeur            oui                       non
Méthodes avec du code   oui                       seulement default / static
Combien par classe ?    une seule (extends)       plusieurs (implements)
Relation                « est un » (is-a)         « sait faire » (can-do)`,
      p2:`<p>Règle pratique : commence par une <strong>interface</strong> pour le contrat. Ajoute une <strong>classe abstraite</strong> quand plusieurs implémentations partagent du code ou des attributs.</p>` },
    { t:'quiz', h:'Le bon outil', p:`<p>Des objets très différents (un coffre, une porte, un livre de sorts) peuvent tous être « ouverts ». Que choisir ?</p>`,
      opts:[ {l:'Une classe abstraite Ouvrable dont ils héritent tous', why:'Ils n’ont rien d’autre en commun : en Java, ça les empêcherait d’avoir leur vraie classe parente.'},
             {l:'Une interface Ouvrable', ok:1},
             {l:'Une classe concrète Ouvrable', why:'« Ouvrable » tout seul ne sait pas comment s’ouvrir : ce n’est pas une classe concrète.'},
             {l:'Rien : copier la méthode ouvrir partout', why:'Sans type commun, Java ne pourrait pas les mettre dans une même liste.'} ],
      ex:'« Sait s’ouvrir » est une capacité, partagée par des classes sans lien de famille : c’est le rôle d’une interface.' },
    { t:'code', bug:1, h:'Le contrat non tenu', file:'bug.py',
      p:`<p>Le Canard « signe » deux contrats, <code>Volant</code> et <code>Nageur</code>, mais il n'en tient qu'un. Ajoute ce qui manque : un canard qui nage renvoie <code>Le canard barbote</code>.</p>`,
      code: BUG73,
      sol: BUG73.replace(`        return "Le canard s'envole"
`, `        return "Le canard s'envole"

    def nager(self):
        return "Le canard barbote"
`),
      hints:['L’erreur vient de <code>nager()</code> : le Canard n’a pas redéfini cette méthode du contrat Nageur.','Ajoute dans Canard : <code>def nager(self): return "Le canard barbote"</code>.'],
      check:(r, code) => {
        if (same(code, BUG73)) return START;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        if (!/Le canard barbote/.test(r.out)) return 'J’attends <code>Le canard barbote</code>.';
        return true;
      },
      ok:'Signer un contrat, c’est s’engager à fournir toutes ses méthodes. En Java, le compilateur aurait refusé la classe incomplète.' },
    { t:'code', h:'À toi : les capacités', file:'capacites.py',
      p:`<p>Crée deux « interfaces » Python : <code>Volant</code> (méthode abstraite <code>voler()</code>) et <code>CracheurDeFeu</code> (méthode abstraite <code>cracher()</code>). Puis deux classes :</p><ul><li><code>Dragon</code> implémente les deux : <code>voler()</code> renvoie <code>vole haut</code>, <code>cracher()</code> renvoie <code>crache du feu</code> ;</li><li><code>ChauveSouris</code> implémente seulement Volant : <code>voler()</code> renvoie <code>vole la nuit</code>.</li></ul><p>Affiche <code>isinstance(ChauveSouris(), CracheurDeFeu)</code>.</p>`,
      code:``,
      sol:`class Volant:
    def voler(self):
        raise NotImplementedError

class CracheurDeFeu:
    def cracher(self):
        raise NotImplementedError

class Dragon(Volant, CracheurDeFeu):
    def voler(self):
        return "vole haut"

    def cracher(self):
        return "crache du feu"

class ChauveSouris(Volant):
    def voler(self):
        return "vole la nuit"

print(isinstance(ChauveSouris(), CracheurDeFeu))`,
      hints:['Chaque interface est une classe avec une seule méthode qui fait <code>raise NotImplementedError</code>.','<code>class Dragon(Volant, CracheurDeFeu):</code> et <code>class ChauveSouris(Volant):</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + '\n_d = Dragon()\n_c = ChauveSouris()\nprint("#T", _d.voler(), "|", _d.cracher(), "|", _c.voler(), isinstance(_d, Volant), isinstance(_d, CracheurDeFeu), isinstance(_c, Volant), isinstance(_c, CracheurDeFeu))' + tryPy('A', 'Volant().voler()', 'NotImplementedError'));
        if (t.err) return TESTERR(t);
        if (!/#T vole haut \| crache du feu \| vole la nuit True True True False/.test(t.out)) return 'Vérifie les textes renvoyés, et les héritages : le Dragon a les deux capacités, la ChauveSouris seulement Volant.';
        if (!/#A ERREUR/.test(t.out)) return 'Dans Volant, <code>voler()</code> doit lever <code>NotImplementedError</code>.';
        if (!/^False$/m.test(r.out.trim())) return 'Affiche <code>isinstance(ChauveSouris(), CracheurDeFeu)</code> : False.';
        return true;
      },
      ok:'Chaque créature « signe » les contrats qui correspondent à ses capacités. En Java, ce seraient deux <code>interface</code> et des <code>implements</code>.' },
    { t:'fill', lang:'java', h:'Les capacités en Java',
      p:`<p>Écris la version Java de l'exercice.</p>`,
      tpl:`public [[interface]] Volant {
    String voler();
}

public interface CracheurDeFeu {
    String cracher();
}

public class Dragon [[implements]] Volant[[,]] CracheurDeFeu {
    @Override
    [[public]] String voler() { return "vole haut"; }

    @Override
    public String cracher() { return "crache du feu"; }
}`,
      hints:['Un contrat pur se déclare avec un mot-clé spécial. Une classe le signe avec un autre.','<code>interface</code>, <code>implements</code>, une virgule entre les interfaces, et les méthodes sont <code>public</code>.'],
      ok:'Deux interfaces, une classe qui les implémente toutes les deux. C’est l’« héritage multiple » à la façon Java.' },
    { t:'say', h:'Python : le Protocol',
      p:`<p>Python moderne a une autre façon d'écrire une interface : le <code>Protocol</code> (module <code>typing</code>). Avec lui, une classe n'a même pas besoin d'hériter : il suffit qu'elle ait les bonnes méthodes. C'est du duck typing, vérifié par les outils (l'éditeur, <em>mypy</em>) avant l'exécution.</p>`,
      snip:`from typing import Protocol

class Volant(Protocol):
    def voler(self) -> str: ...

class Dragon:                    # aucun héritage !
    def voler(self) -> str:
        return "vole haut"

def decoller(v: Volant) -> None:
    print(v.voler())

decoller(Dragon())               # accepté par l'éditeur`,
      p2:`<p>Résumé Python : une <strong>ABC</strong> est un contrat qu'on signe en héritant (comme Java), un <strong>Protocol</strong> est un contrat qu'on respecte sans le signer. Ces deux modules marchent dans VS Code, pas sur ce site.</p>` },
    { t:'code', defi:1, h:'Une méthode « default » en Python', file:'default.py', mem:1,
      p:`<p>Écris l'interface <code>Soignable</code> : une méthode abstraite <code>soigner(n)</code>, et une méthode normale <code>soin_complet()</code> qui appelle <code>self.soigner(9999)</code> (comme une méthode <code>default</code> Java).</p><p>Puis une classe <code>Heros(Soignable)</code> avec <code>pv</code> et <code>pv_max</code>, dont <code>soigner</code> plafonne à <code>pv_max</code>. Crée <code>sam = Heros(20, 80)</code> et appelle <code>sam.soin_complet()</code>.</p>`,
      code:``,
      sol:`class Soignable:
    def soigner(self, n):
        raise NotImplementedError

    def soin_complet(self):
        self.soigner(9999)

class Heros(Soignable):
    def __init__(self, pv, pv_max):
        self.pv = pv
        self.pv_max = pv_max

    def soigner(self, n):
        self.pv = min(self.pv_max, self.pv + n)

sam = Heros(20, 80)
sam.soin_complet()`,
      hints:['Soignable a deux méthodes : <code>soigner</code> (qui lève <code>NotImplementedError</code>) et <code>soin_complet</code> (qui appelle <code>self.soigner(9999)</code>).','Heros ne redéfinit que <code>soigner</code> : <code>self.pv = min(self.pv_max, self.pv + n)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (attr(r, 'sam', 'pv') !== '80') return 'Après <code>soin_complet()</code>, Sam doit être à 80 PV, son maximum.';
        if (/class\s+Heros[\s\S]*def\s+soin_complet/.test(code)) return 'Heros ne doit pas redéfinir <code>soin_complet</code> : il la reçoit de Soignable.';
        const t = await test([], code + '\n_h = Heros(1, 10)\n_h.soigner(3)\nprint("#T", _h.pv, isinstance(_h, Soignable))' + tryPy('A', 'Soignable().soin_complet()', 'NotImplementedError'));
        if (t.err) return TESTERR(t);
        if (!/#T 4 True/.test(t.out)) return '<code>soigner(3)</code> sur un héros à 1 PV doit donner 4, et Heros doit hériter de Soignable.';
        if (!/#A ERREUR/.test(t.out)) return 'Dans Soignable, <code>soigner</code> doit lever <code>NotImplementedError</code>.';
        return true;
      },
      ok:'Le contrat fournit une méthode toute faite, construite sur la méthode que chaque classe doit écrire. Exactement comme une méthode <code>default</code> en Java.' }
  ],
  recap:['<strong>Interface</strong> (<em>interface</em>) : un contrat pur, des signatures sans état. Java : <code>interface</code> + <code>implements</code>.','Une classe Java : un seul <code>extends</code>, plusieurs <code>implements</code>.','Interface Java : méthodes abstraites (implicitement <code>public</code>), <code>default</code>, <code>static</code>, constantes. Pas d’attributs ni de constructeur.','Classe abstraite = « est un », avec état et code commun. Interface = « sait faire », pour n’importe quelle classe.','Python : ABC (on hérite) ou <code>Protocol</code> (il suffit d’avoir les méthodes).'] };

/* ---------- 7.4 ---------- */
const BOUTIQUE = `class Boutique:
    def __init__(self, paiement):
        self.paiement = paiement

    def acheter(self, objet, prix):
        if self.paiement.payer(prix):
            return f"Tu achètes {objet}."
        return f"Paiement refusé pour {objet}."
`;
LES['p7-4'] = { title:'Programmer pour une interface', dur:'14 min',
  intro:'Un grand principe de conception : dépendre du contrat, pas de l’implémentation. Ton code devient souple : on peut changer une pièce sans toucher au reste.',
  steps:[
    { t:'quiz', rev:1, lang:'java', h:'Une question sur la leçon d’avant', p:`<p>Combien d'interfaces une classe Java peut-elle implémenter ?</p>`,
      opts:[ {l:'Aucune, seulement des classes', why:'C’est même le rôle des interfaces d’être implémentées par des classes.'},
             {l:'Une seule', why:'Une seule, c’est pour <code>extends</code>.'},
             {l:'Autant qu’elle veut', ok:1},
             {l:'Deux au maximum', why:'Il n’y a pas de limite.'} ],
      ex:'Un seul parent avec <code>extends</code>, mais autant d’interfaces qu’on veut avec <code>implements</code>.' },
    { t:'compare', h:'Le principe',
      p:`<p>« <strong>Programme pour une interface, pas pour une implémentation</strong> » (<em>program to an interface, not an implementation</em>). Pour les variables, les paramètres et les types de retour, utilise le type <strong>le plus général</strong> qui offre ce dont tu as besoin.</p><p>Si demain tu changes d'implémentation, une seule ligne bouge.</p>`,
      py:`# Python : on s'appuie sur ce que l'objet sait faire
def total(prix):
    return sum(prix)

total([10, 20])         # une liste
total((10, 20))         # un tuple
total({10, 20})         # un ensemble`,
      java:`// lié à une implémentation précise
ArrayList<String> noms = new ArrayList<>();

// dépend seulement du contrat List
List<String> noms = new ArrayList<>();
// changer plus tard : rien d'autre ne bouge
List<String> noms = new LinkedList<>();

// un paramètre général accepte toutes les listes
static int total(List<Integer> prix) { ... }`,
      notes:['<code>List</code> est une interface Java. <code>ArrayList</code> et <code>LinkedList</code> sont deux classes qui l’implémentent.','Le code qui utilise <code>noms</code> ne voit que les méthodes de <code>List</code> : <code>add</code>, <code>get</code>, <code>size</code>…','En Python, le duck typing donne cette souplesse naturellement. Le module <code>collections.abc</code> nomme ces contrats : <code>Iterable</code>, <code>Sized</code>, <code>Container</code>…'] },
    { t:'say', h:'Une boutique qui ne connaît que le contrat', file:'boutique.py',
      p:`<p>La <code>Boutique</code> reçoit un moyen de paiement dans son constructeur. Elle ne sait <strong>pas</strong> si c'est une bourse, une carte de guilde ou un bon d'achat : elle sait seulement qu'il a une méthode <code>payer(prix)</code> qui renvoie <code>True</code> ou <code>False</code>. C'est le contrat.</p><p>Donner ainsi à un objet ce dont il dépend, au lieu qu'il le crée lui-même, s'appelle l'<strong>injection de dépendance</strong> (<em>dependency injection</em>). On en reparlera au chapitre 10.</p>`,
      code: BOUTIQUE + `
class Bourse:
    def __init__(self, po):
        self.po = po

    def payer(self, prix):
        if prix <= self.po:
            self.po -= prix
            return True
        return False

class CarteGuilde:
    def payer(self, prix):
        return prix <= 100      # crédit illimité jusqu'à 100 par achat

b1 = Boutique(Bourse(30))
print(b1.acheter("une corde", 5))
print(b1.acheter("une épée", 40))
b2 = Boutique(CarteGuilde())
print(b2.acheter("une épée", 40))` },
    { t:'quiz', h:'Qu’est-ce qui change ?', p:`<p>On ajoute un nouveau moyen de paiement, <code>BonAchat</code>, avec une méthode <code>payer(prix)</code>. Que faut-il modifier dans la classe <code>Boutique</code> ?</p>`,
      opts:[ {l:'Ajouter un if isinstance(paiement, BonAchat)', why:'Justement non : la boutique ne teste pas le genre du paiement.'},
             {l:'Rien du tout', ok:1},
             {l:'Ajouter une méthode acheter_avec_bon', why:'Inutile : <code>acheter</code> marche avec tout objet qui a <code>payer</code>.'},
             {l:'La faire hériter de BonAchat', why:'Une boutique n’est pas un bon d’achat.'} ],
      ex:'La boutique dépend du contrat <code>payer(prix)</code>, pas d’une classe précise. On peut ajouter des moyens de paiement sans jamais la toucher.' },
    { t:'code', h:'À toi : le bon d’achat', file:'bon.py',
      p:`<p>Écris une classe <code>BonAchat</code> qui respecte le contrat de paiement : son constructeur reçoit une <code>valeur</code>. <code>payer(prix)</code> accepte un seul achat dont le prix ne dépasse pas la valeur ; après, le bon est utilisé et refuse tout.</p><p>Puis crée <code>boutique = Boutique(BonAchat(50))</code> et achète une potion à 20 puis une autre à 20.</p>`,
      code: BOUTIQUE,
      sol: BOUTIQUE + `
class BonAchat:
    def __init__(self, valeur):
        self.valeur = valeur
        self.utilise = False

    def payer(self, prix):
        if self.utilise or prix > self.valeur:
            return False
        self.utilise = True
        return True

boutique = Boutique(BonAchat(50))
print(boutique.acheter("une potion", 20))
print(boutique.acheter("une potion", 20))`,
      hints:['Le bon garde un attribut <code>utilise</code>, à <code>False</code> au départ.','<code>payer</code> : refuse si <code>self.utilise</code> ou si <code>prix &gt; self.valeur</code>. Sinon, passe <code>utilise</code> à True et renvoie True.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (/class\s+Boutique[\s\S]*isinstance/.test(code)) return 'Ne modifie pas la Boutique : elle doit rester indépendante des moyens de paiement.';
        const l = linesOf(r.out);
        if (l[0] !== 'Tu achètes une potion.' || l[1] !== 'Paiement refusé pour une potion.') return 'Le premier achat doit passer, le second être refusé (le bon est déjà utilisé).';
        const t = await test([], code + '\n_b = BonAchat(10)\nprint("#T", _b.payer(11), _b.payer(10), _b.payer(1))');
        if (t.err || !/#T False True False/.test(t.out)) return 'Un bon de 10 : un achat à 11 est refusé (sans consommer le bon), un achat à 10 passe, puis tout est refusé.';
        return true;
      },
      ok:'Nouveau moyen de paiement, zéro modification de la boutique. Ton code est ouvert aux extensions : on en reparlera au chapitre 10.' },
    { t:'say', h:'Les interfaces que tu utilises déjà',
      p:`<p>Tu as déjà respecté des contrats sans le savoir ! En implémentant ces interfaces (Java) ou ces méthodes spéciales (Python), tes objets marchent avec les outils du langage :</p>`,
      snip:`Java                         Python                        Ça permet
Comparable<T>  compareTo     __lt__ (et __eq__)            sort, sorted, max
Iterable<T>    iterator()    __iter__                      for ... in ...
AutoCloseable  close()       __enter__ / __exit__          try (...) / with
(size, contains)             __len__, __contains__         len(), in
List, Map, Set               list, dict, set               les collections`,
      p2:`<p>C'est l'abstraction en action : <code>sorted()</code> ne connaît pas ta classe, il connaît le contrat « comparable ». On verra <code>Iterable</code> et <code>__iter__</code> au chapitre 9.</p>` },
    { t:'compare', h:'Comparable en Java',
      p:`<p>Pour trier des objets en Java, la classe implémente l'interface <code>Comparable&lt;T&gt;</code>. Sa méthode <code>compareTo</code> renvoie un nombre négatif, zéro ou positif.</p>`,
      py:`class Heros:
    def __init__(self, nom, niveau):
        self.nom = nom
        self.niveau = niveau

    def __lt__(self, autre):
        return self.niveau < autre.niveau

sorted(equipe)`,
      java:`public class Heros implements Comparable<Heros> {
    private String nom;
    private int niveau;

    @Override
    public int compareTo(Heros autre) {
        return Integer.compare(niveau, autre.niveau);
    }
}

Collections.sort(equipe);`,
      notes:['<code>compareTo</code> : négatif si <code>this</code> vient avant, 0 si égal, positif s’il vient après.','<code>Integer.compare(a, b)</code> fait ce calcul pour toi.','<code>Collections.sort</code> accepte n’importe quelle liste d’objets <code>Comparable</code>.'] },
    { t:'quiz', lang:'java', h:'compareTo', p:`<p>Avec ce <code>compareTo</code>, dans quel ordre <code>Collections.sort</code> range-t-il les héros ?</p>`, snip:`@Override
public int compareTo(Heros autre) {
    return autre.niveau - this.niveau;
}`,
      opts:[ {l:'Du plus petit niveau au plus grand', why:'Regarde l’ordre de la soustraction : c’est <code>autre - this</code>, pas <code>this - autre</code>.'},
             {l:'Du plus grand niveau au plus petit', ok:1},
             {l:'Par ordre alphabétique', why:'Le nom n’est jamais utilisé.'},
             {l:'Ça ne compile pas', why:'Le code est valide : il renvoie bien un <code>int</code>.'} ],
      ex:'Si <code>this</code> a un niveau plus grand, le résultat est négatif : <code>this</code> passe avant. Tri décroissant.' },
    { t:'code', defi:1, h:'Une fonction très générale', file:'general.py',
      p:`<p>Écris une fonction <code>plus_cher(articles)</code> qui renvoie l'article le plus cher. Elle doit marcher avec <strong>n'importe quoi qu'on peut parcourir</strong> : une liste, un tuple, ou un objet <code>Vitrine</code>. Donc pas de <code>articles[0]</code> : uniquement une boucle <code>for</code>. Si c'est vide, elle renvoie <code>None</code>.</p><p>Écris aussi la classe <code>Vitrine</code> : elle garde une liste <code>_articles</code>, et sa méthode <code>__iter__</code> renvoie <code>iter(self._articles)</code> pour être parcourable.</p>`,
      code:`class Article:
    def __init__(self, nom, prix):
        self.nom = nom
        self.prix = prix
`,
      sol:`class Article:
    def __init__(self, nom, prix):
        self.nom = nom
        self.prix = prix

class Vitrine:
    def __init__(self, articles):
        self._articles = articles

    def __iter__(self):
        return iter(self._articles)

def plus_cher(articles):
    meilleur = None
    for a in articles:
        if meilleur is None or a.prix > meilleur.prix:
            meilleur = a
    return meilleur

v = Vitrine([Article("Corde", 5), Article("Arc", 40)])
print(plus_cher(v).nom)`,
      hints:['Commence avec <code>meilleur = None</code>, puis dans la boucle : <code>if meilleur is None or a.prix &gt; meilleur.prix:</code>.','Vitrine : <code>def __iter__(self): return iter(self._articles)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const fn = (code.match(/def\s+plus_cher[\s\S]*?(?=\n\S|$)/) || [''])[0];
        if (!fn) return 'Il faut une fonction <code>plus_cher(articles)</code>.';
        if (/articles\s*\[/.test(fn)) return 'N’utilise pas d’indice comme <code>articles[0]</code> : une Vitrine ne le permet pas. Seulement une boucle <code>for</code>.';
        const t = await test([], code + '\n_l = [Article("A", 3), Article("B", 9), Article("C", 1)]\nprint("#T", plus_cher(_l).nom, plus_cher(tuple(_l)).nom, plus_cher(Vitrine(_l)).nom, plus_cher([]), plus_cher(Vitrine([])))');
        if (t.err) return TESTERR(t);
        if (!/#T B B B None None/.test(t.out)) return 'Ta fonction doit renvoyer l’article le plus cher pour une liste, un tuple et une Vitrine, et <code>None</code> si c’est vide.';
        return true;
      },
      ok:'Ta fonction dépend seulement du contrat « parcourable ». Liste, tuple, Vitrine : tout passe. Au chapitre 9, tu sauras écrire <code>__iter__</code> toi-même, de A à Z.' }
  ],
  recap:['« <strong>Programme pour une interface</strong> » : utilise le type le plus général qui suffit (<code>List</code> plutôt que <code>ArrayList</code>).','Un objet qui reçoit ses dépendances (un moyen de paiement…) au lieu de les créer est plus souple : <strong>injection de dépendance</strong>.','Ajouter une implémentation ne doit pas obliger à modifier le code qui utilise le contrat.','Interfaces courantes : <code>Comparable</code> (<code>__lt__</code>), <code>Iterable</code> (<code>__iter__</code>), <code>AutoCloseable</code> (<code>__enter__</code>/<code>__exit__</code>).'] };

/* ---------- 7.5 ---------- */
const A1 = `class Attaquant:
    def attaquer(self, cible):
        raise NotImplementedError("attaquer() doit être redéfinie")

class Cible:
    def recevoir(self, degats):
        raise NotImplementedError("recevoir() doit être redéfinie")

    def est_detruite(self):
        raise NotImplementedError("est_detruite() doit être redéfinie")`;
const A2 = `

class Heros(Attaquant, Cible):
    def __init__(self, nom, pv, force):
        self.nom = nom
        self.pv = pv
        self.force = force

    def attaquer(self, cible):
        cible.recevoir(self.force)
        return f"{self.nom} frappe ({self.force})"

    def recevoir(self, degats):
        self.pv = max(0, self.pv - degats)

    def est_detruite(self):
        return self.pv == 0

class Tourelle(Attaquant):
    def __init__(self, degats):
        self.degats = degats

    def attaquer(self, cible):
        cible.recevoir(self.degats)
        return f"La tourelle tire ({self.degats})"

class Muraille(Cible):
    def __init__(self, solidite):
        self.solidite = solidite

    def recevoir(self, degats):
        self.solidite = max(0, self.solidite - degats // 2)

    def est_detruite(self):
        return self.solidite == 0`;
const A3 = `

def assaut(attaquants, cible):
    for a in attaquants:
        if not isinstance(a, Attaquant):
            raise TypeError("pas un Attaquant")
    tours = 0
    while not cible.est_detruite():
        for a in attaquants:
            if not cible.est_detruite():
                print(a.attaquer(cible))
        tours += 1
    return tours`;
const A4 = `

class Belier(Attaquant):
    def attaquer(self, cible):
        cible.recevoir(40)
        return "Le bélier enfonce (40)"

mur = Muraille(50)
n = assaut([Heros("Sam", 100, 10), Tourelle(6), Belier()], mur)
print("Muraille détruite en", n, "tours")`;
LES['p7-5'] = { title:'Projet : le contrat Attaquant', dur:'18 min',
  intro:'Dans ce projet, tu écris deux contrats, Attaquant et Cible, puis des classes très différentes qui les signent : un héros, une tourelle, une muraille, un bélier. Un siège peut commencer.',
  steps:[
    { t:'say', h:'Le projet',
      p:`<p>Deux « interfaces » :</p><ul><li><code>Attaquant</code> : sait <code>attaquer(cible)</code> et renvoie un texte ;</li><li><code>Cible</code> : sait <code>recevoir(degats)</code> et dire si elle <code>est_detruite()</code>.</li></ul><p>Un héros est les deux. Une tourelle attaque seulement. Une muraille est seulement une cible. La fonction <code>assaut</code> ne connaîtra que les contrats. À la fin :</p>`,
      snip:`Sam frappe (10)
La tourelle tire (6)
Le bélier enfonce (40)
Sam frappe (10)
La tourelle tire (6)
Le bélier enfonce (40)
Muraille détruite en 2 tours`,
      p2:`<p>Quatre étapes. Je reprends ton code à chaque fois.</p>` },
    { t:'code', h:'Étape 1 : les deux contrats', file:'siege.py',
      p:`<p>Écris les deux interfaces : <code>Attaquant</code> avec la méthode abstraite <code>attaquer(cible)</code>, et <code>Cible</code> avec les méthodes abstraites <code>recevoir(degats)</code> et <code>est_detruite()</code>. Chaque méthode abstraite lève <code>NotImplementedError</code>.</p>`,
      code:``,
      sol: A1,
      hints:['Deux classes, trois méthodes en tout, et chacune contient seulement <code>raise NotImplementedError(...)</code>.','<code>class Attaquant:</code> → <code>def attaquer(self, cible): raise NotImplementedError("...")</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + tryPy('A', 'Attaquant().attaquer(None)', 'NotImplementedError') + tryPy('B', 'Cible().recevoir(1)', 'NotImplementedError') + tryPy('C', 'Cible().est_detruite()', 'NotImplementedError'));
        if (t.err) return TESTERR(t);
        if (!/#A ERREUR/.test(t.out)) return '<code>Attaquant().attaquer(...)</code> doit lever <code>NotImplementedError</code>.';
        if (!/#B ERREUR/.test(t.out) || !/#C ERREUR/.test(t.out)) return 'Les deux méthodes de Cible doivent lever <code>NotImplementedError</code>.';
        return true;
      },
      ok:'Les contrats sont écrits. Aucun code utile pour l’instant : seulement des promesses.' },
    { t:'code', carry:1, h:'Étape 2 : ceux qui signent', file:'siege.py', mem:1,
      p:`<p>Écris trois classes :</p><ul><li><code>Heros(Attaquant, Cible)</code> : <code>nom</code>, <code>pv</code>, <code>force</code>. Il attaque en infligeant sa force et renvoie <code>Sam frappe (10)</code> ; il reçoit les dégâts (jamais sous 0) ; il est détruit à 0 PV.</li><li><code>Tourelle(Attaquant)</code> : un attribut <code>degats</code>, et elle renvoie <code>La tourelle tire (6)</code>.</li><li><code>Muraille(Cible)</code> : un attribut <code>solidite</code>. Elle ne perd que la <strong>moitié</strong> des dégâts (<code>degats // 2</code>), jamais sous 0, et elle est détruite à 0.</li></ul>`,
      code:`# Étape 2 : Heros, Tourelle et Muraille
`,
      sol: A1 + A2,
      hints:['Chaque classe redéfinit toutes les méthodes des contrats qu’elle signe. Pour attaquer : <code>cible.recevoir(...)</code>, puis <code>return</code> du texte.','Muraille : <code>self.solidite = max(0, self.solidite - degats // 2)</code> et <code>return self.solidite == 0</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
_h = Heros("H", 20, 7)
_t = Tourelle(5)
_m = Muraille(9)
print("#A", _h.attaquer(_m), "|", _m.solidite, _t.attaquer(_h), "|", _h.pv)
_h.recevoir(99)
_m.recevoir(100)
print("#B", _h.pv, _h.est_detruite(), _m.solidite, _m.est_detruite(), Muraille(5).est_detruite())
print("#C", isinstance(_h, Attaquant), isinstance(_h, Cible), isinstance(_t, Cible), isinstance(_m, Attaquant))`);
        if (t.err) return TESTERR(t);
        if (!/#A H frappe \(7\) \| 6 La tourelle tire \(5\) \| 15/.test(t.out)) return 'Un héros de force 7 qui attaque une muraille de 9 : elle tombe à 6 (moitié des dégâts, 7 // 2 = 3). Une tourelle de 5 qui attaque le héros (20 PV) le laisse à 15. Vérifie aussi les textes renvoyés.';
        if (!/#B 0 True 0 True False/.test(t.out)) return 'PV et solidité ne doivent pas descendre sous 0, et <code>est_detruite()</code> vaut True seulement à 0.';
        if (!/#C True True False False/.test(t.out)) return 'Vérifie les contrats signés : Heros(Attaquant, Cible), Tourelle(Attaquant), Muraille(Cible).';
        return true;
      },
      ok:'Trois classes sans aucun lien de famille entre elles, mais qui respectent les mêmes contrats.' },
    { t:'code', carry:1, h:'Étape 3 : l’assaut', file:'siege.py',
      p:`<p>Écris la fonction <code>assaut(attaquants, cible)</code> :</p><ol><li>si un des attaquants n'est pas un <code>Attaquant</code>, elle lève <code>TypeError</code> avant de commencer ;</li><li>tant que la cible n'est pas détruite, chaque attaquant attaque à son tour (s'il reste quelque chose à détruire), et on affiche le texte renvoyé ;</li><li>elle renvoie le nombre de tours complets joués.</li></ol>`,
      code:`# Étape 3 : la fonction assaut
`,
      sol: A1 + A2 + A3,
      hints:['D’abord une boucle de vérification avec <code>isinstance(a, Attaquant)</code>. Puis <code>tours = 0</code> et <code>while not cible.est_detruite():</code>.','Dans le while, une boucle sur les attaquants avec <code>if not cible.est_detruite(): print(a.attaquer(cible))</code>, puis <code>tours += 1</code>. À la fin, <code>return tours</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
print("#A", assaut([Tourelle(4), Tourelle(4)], Heros("H", 10, 1)))
print("#B", assaut([Tourelle(100)], Muraille(30)))` + tryPy('C', 'assaut([Tourelle(1), Muraille(5)], Heros("X", 5, 1))', 'TypeError'));
        if (t.err) return TESTERR(t);
        const l = linesOf(t.out);
        if (l.slice(0, 4).join('|') !== 'La tourelle tire (4)|La tourelle tire (4)|La tourelle tire (4)|#A 2') return 'Deux tourelles de 4 contre un héros de 10 PV : trois tirs (le 4e n’a pas lieu, le héros est déjà détruit), et 2 tours renvoyés.';
        if (!/#B 1/.test(t.out)) return 'Une tourelle de 100 contre une muraille de 30 : 1 seul tour.';
        if (!/#C ERREUR/.test(t.out)) return 'Si la liste contient autre chose qu’un Attaquant (une Muraille, par exemple), <code>assaut</code> doit lever <code>TypeError</code>.';
        return true;
      },
      ok:'La fonction ne connaît que les contrats : <code>attaquer</code>, <code>est_detruite</code>. Elle ne sait même pas qu’il existe des héros ou des murailles.' },
    { t:'code', carry:1, h:'Étape 4 : le bélier et le siège', file:'siege.py',
      p:`<p>Ajoute une classe <code>Belier(Attaquant)</code> qui inflige 40 et renvoie <code>Le bélier enfonce (40)</code>. Puis lance le siège : une <code>Muraille(50)</code> attaquée par <code>Heros("Sam", 100, 10)</code>, <code>Tourelle(6)</code> et le bélier. Affiche <code>Muraille détruite en 2 tours</code> avec le nombre renvoyé.</p>`,
      code:`# Étape 4 : le Belier et le siège
`,
      sol: A1 + A2 + A3 + A4,
      hints:['<code>class Belier(Attaquant):</code> avec une seule méthode <code>attaquer</code>.','<code>n = assaut([Heros("Sam", 100, 10), Tourelle(6), Belier()], Muraille(50))</code>, puis <code>print("Muraille détruite en", n, "tours")</code>.'],
      check:r => {
        if (r.err) return ERR;
        const want = ['Sam frappe (10)', 'La tourelle tire (6)', 'Le bélier enfonce (40)', 'Sam frappe (10)', 'La tourelle tire (6)', 'Le bélier enfonce (40)', 'Muraille détruite en 2 tours'];
        const l = linesOf(r.out);
        for (const [i, w] of want.entries()) if (l[i] !== w) return `La ligne ${i + 1} devrait être <code>${esc(w)}</code>${l[i] ? `, mais j’ai <code>${esc(l[i])}</code>` : ''}.`;
        return true;
      },
      ok:'Un nouvel attaquant, et la fonction <code>assaut</code> n’a pas bougé d’un caractère. Le contrat fait tout le travail.' },
    { t:'compare', h:'Les contrats en Java',
      p:`<p>En Java, les deux contrats deviennent de vraies interfaces, et le compilateur vérifie que chaque classe tient ses promesses. La fonction <code>assaut</code> n'a même plus besoin de vérifier les types : la liste est déclarée <code>List&lt;Attaquant&gt;</code>.</p>`,
      py: A1,
      java:`public interface Attaquant {
    String attaquer(Cible cible);
}

public interface Cible {
    void recevoir(int degats);
    boolean estDetruite();
}

public class Heros implements Attaquant, Cible { ... }
public class Tourelle implements Attaquant { ... }
public class Muraille implements Cible { ... }

static int assaut(List<Attaquant> attaquants, Cible cible) {
    int tours = 0;
    while (!cible.estDetruite()) {
        for (Attaquant a : attaquants) {
            if (!cible.estDetruite()) {
                System.out.println(a.attaquer(cible));
            }
        }
        tours++;
    }
    return tours;
}`,
      notes:['Avec <code>List&lt;Attaquant&gt;</code>, mettre une Muraille dans la liste ne compile pas : plus besoin du <code>TypeError</code>.','Une interface peut être le type d’un paramètre : <code>Cible cible</code>.'] },
    { t:'say', h:'Mini-défi dans VS Code',
      p:`<p>Écris le projet en Java, avec les deux interfaces dans <code>Attaquant.java</code> et <code>Cible.java</code>.</p><p>Bonus : ajoute à l'interface <code>Cible</code> une méthode <code>default String etat()</code> qui renvoie <code>"détruite"</code> ou <code>"debout"</code> selon <code>estDetruite()</code>. Toutes les cibles la reçoivent sans rien écrire !</p><p>Et si tu veux pratiquer le vrai Python, refais le projet dans VS Code avec <code>from abc import ABC, abstractmethod</code>.</p>` }
  ],
  recap:['Un contrat (interface) par capacité : <code>Attaquant</code>, <code>Cible</code>. Une classe signe ceux qui lui correspondent.','Le code qui utilise les objets (<code>assaut</code>) ne dépend que des contrats : on ajoute des classes sans le modifier.','En Java : <code>interface</code>, <code>implements A, B</code>, et des paramètres typés par l’interface.','En vrai Python : <code>ABC</code> + <code>@abstractmethod</code>, ou <code>Protocol</code>.'] };

Atelier.chapter({ part:"poo", n:7, title:"Abstraction et interfaces",
  lessons:['p7-1','p7-2','p7-3','p7-4','p7-5'].map(id => ({ id, ...LES[id] })) });
})();
