/* Partie POO · Chapitre 8 : Relations entre objets et UML */
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has } = Atelier.h;
const LES = {};
const attr = (r, o, a) => { const m = memOf(r, o); const x = m && m.attrs && m.attrs.find(t => t.name === a); return x ? x.repr : undefined; };
const same = (code, start) => code.trim() === start.trim();
const START = 'Voilà le bug ! Exécute, lis ce qui se passe, puis corrige le code.';
const TESTERR = t => 'Mes tests font planter ton code : ' + esc(t.err.title) + '. Vérifie les noms de tes classes, de tes méthodes et de leurs paramètres.';
const tryPy = (tag, stmt, exc = 'ValueError') => `\ntry:\n    ${stmt}\n    print("#${tag} PASSE")\nexcept ${exc}:\n    print("#${tag} ERREUR")`;

const FLECHES = `Association     A ────────> B     A connaît B (un attribut)
Dépendance      A - - - - > B     A utilise B un moment (dans une méthode)
Agrégation      A ◇──────── B     A a des B, qui vivent sans lui
Composition     A ◆──────── B     A possède des B, qui meurent avec lui
Héritage        B ────────▷ A     B est un A (extends)
Réalisation     C - - - - ▷ I     C implémente l'interface I`;

/* ---------- 8.1 ---------- */
const BUG81 = `class Coeur:
    def __init__(self, force):
        self.force = force

class Golem:
    def __init__(self, nom, coeur):
        self.nom = nom
        self.coeur = coeur

pierre = Coeur(50)
g1 = Golem("Golem A", pierre)
g2 = Golem("Golem B", pierre)
g1.coeur.force -= 50
print(g2.nom, "a un cœur de force", g2.coeur.force)`;
LES['p8-1'] = { title:'Association, agrégation, composition', dur:'15 min',
  intro:'Les objets ne vivent pas seuls : un héros a un inventaire, rejoint une guilde, achète dans une boutique. Ces liens n’ont pas tous la même force. Le cours en distingue plusieurs, avec des noms précis.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur le chapitre d’avant', p:`<p>Quelle est la différence principale entre une classe abstraite et une interface en Java ?</p>`,
      opts:[ {l:'Une interface peut avoir des attributs d’objet, pas une classe abstraite', why:'C’est l’inverse : une interface n’a pas d’état (seulement des constantes).'},
             {l:'Une classe peut implémenter plusieurs interfaces, mais n’étendre qu’une classe abstraite', ok:1},
             {l:'On peut instancier une interface', why:'On ne peut instancier ni l’une ni l’autre.'},
             {l:'Aucune différence', why:'Elles diffèrent sur l’état, les constructeurs, et le nombre par classe.'} ],
      ex:'Un seul <code>extends</code>, plusieurs <code>implements</code>. Et une interface n’a ni attributs d’objet ni constructeur.' },
    { t:'say', h:'L’association : un objet en connaît un autre', file:'association.py', mem:1,
      p:`<p>L'<strong>association</strong> (<em>association</em>) est le lien le plus général : un objet <strong>garde une référence</strong> vers un autre, dans un attribut, et s'en sert. « Un héros a un familier », « une quête est donnée par un PNJ ».</p><p>Regarde la mémoire : l'attribut <code>familier</code> du héros contient un autre objet.</p>`,
      code:`class Familier:
    def __init__(self, nom):
        self.nom = nom

class Heros:
    def __init__(self, nom):
        self.nom = nom
        self.familier = None

    def adopter(self, familier):
        self.familier = familier

    def appeler(self):
        if self.familier is None:
            return self.nom + " est seul."
        return self.nom + " siffle, et " + self.familier.nom + " arrive."

hibou = Familier("Hedwige")
sam = Heros("Sam")
sam.adopter(hibou)
print(sam.appeler())` },
    { t:'say', h:'La multiplicité',
      p:`<p>On précise souvent <strong>combien</strong> d'objets sont liés : c'est la <strong>multiplicité</strong> (<em>multiplicity</em>), écrite à chaque bout du lien.</p>`,
      snip:`1       exactement un
0..1    zéro ou un (facultatif)
*       zéro, un ou plusieurs (aussi écrit 0..*)
1..*    au moins un
2..4    entre 2 et 4

Heros  1 ─────────── 0..1  Familier     un héros a au plus un familier
Guilde 1 ─────────── *     Heros        une guilde a des membres`,
      p2:`<p>Dans le code, « au plus un » donne un attribut qui peut valoir <code>None</code>. « Plusieurs » donne une liste.</p>` },
    { t:'say', h:'Agrégation et composition : deux sortes de « a un »', file:'has_a.py', mem:1,
      p:`<p>Quand un objet en <strong>contient</strong> d'autres, il y a deux cas :</p><ul><li><strong>Composition</strong> (<em>composition</em>) : le tout <strong>possède</strong> ses parties. Il les crée lui-même, personne d'autre ne les a, et elles disparaissent avec lui. Un héros et son inventaire.</li><li><strong>Agrégation</strong> (<em>aggregation</em>) : le tout <strong>regroupe</strong> des parties qui existent sans lui. On les lui donne de l'extérieur, et elles lui survivent. Une guilde et ses membres.</li></ul>`,
      code:`class Inventaire:
    def __init__(self):
        self.objets = []

class Heros:
    def __init__(self, nom):
        self.nom = nom
        self.inventaire = Inventaire()     # composition : créé ici

class Guilde:
    def __init__(self, nom):
        self.nom = nom
        self.membres = []                  # agrégation : donnés de dehors

    def recruter(self, heros):
        self.membres.append(heros)

sam = Heros("Sam")
lea = Heros("Léa")
guilde = Guilde("Les Lames")
guilde.recruter(sam)
guilde.recruter(lea)
guilde = None
print(sam.nom, "existe toujours, même sans la guilde")` },
    { t:'say', h:'La dépendance : un usage passager', file:'dependance.py',
      p:`<p>La <strong>dépendance</strong> (<em>dependency</em>) est le lien le plus faible : une classe utilise une autre <strong>seulement dans une méthode</strong> (un paramètre, une variable locale), sans la garder dans un attribut.</p><p>Ici, le forgeron utilise un héros le temps d'un affûtage, puis l'oublie. Moins il y a de dépendances, et plus elles sont faibles, plus le code est facile à changer : on parle de <strong>couplage faible</strong> (<em>low coupling</em>).</p>`,
      code:`class Heros:
    def __init__(self, nom, degats):
        self.nom = nom
        self.degats = degats

class Forgeron:
    def affuter(self, heros):          # dépendance : simple paramètre
        heros.degats += 3
        return heros.nom + " a une arme plus tranchante."

sam = Heros("Sam", 10)
print(Forgeron().affuter(sam))
print(sam.degats)` },
    { t:'quiz', h:'Quelle relation ?', p:`<p>Quelle relation y a-t-il entre <code>Dragon</code> et <code>Ecaille</code> ?</p>`, snip:`class Dragon:
    def __init__(self, nom):
        self.nom = nom
        self.ecailles = [Ecaille() for i in range(100)]`,
      opts:[ {l:'Une agrégation', why:'Les écailles sont créées par le dragon lui-même, et personne d’autre ne les a : elles disparaîtront avec lui.'},
             {l:'Une composition', ok:1},
             {l:'Une dépendance', why:'Une dépendance ne garde rien dans un attribut. Ici, les écailles sont rangées dans <code>self.ecailles</code>.'},
             {l:'Un héritage', why:'Un dragon n’est pas une écaille.'} ],
      ex:'Le tout crée ses parties dans son constructeur, et elles ne vivent que par lui : composition.' },
    { t:'quiz', h:'Et celle-ci ?', p:`<p>Quelle relation y a-t-il entre <code>Taverne</code> et <code>Heros</code> ?</p>`, snip:`class Taverne:
    def servir(self, heros, boisson):
        heros.pv += 5
        return heros.nom + " boit " + boisson`,
      opts:[ {l:'Une composition', why:'La taverne ne garde aucun héros dans un attribut.'},
             {l:'Une association', why:'Une association garde une référence durable (un attribut). Ici, le héros n’est utilisé que le temps de la méthode.'},
             {l:'Une dépendance', ok:1},
             {l:'Une agrégation', why:'Pas d’attribut qui regroupe des héros.'} ],
      ex:'Le héros n’est qu’un paramètre de <code>servir</code> : la taverne l’utilise, puis l’oublie. C’est une dépendance.' },
    { t:'compare', h:'Et en Java ?',
      p:`<p>En Java, c'est pareil : la composition crée la partie dans le constructeur (souvent <code>private final</code>), l'agrégation la reçoit de l'extérieur.</p>`,
      py:`class Heros:
    def __init__(self, nom):
        self.nom = nom
        self._inventaire = Inventaire()   # composition

class Guilde:
    def __init__(self):
        self._membres = []

    def recruter(self, heros):            # agrégation
        self._membres.append(heros)`,
      java:`public class Heros {
    private final String nom;
    private final Inventaire inventaire;

    public Heros(String nom) {
        this.nom = nom;
        this.inventaire = new Inventaire();   // composition
    }
}

public class Guilde {
    private final List<Heros> membres = new ArrayList<>();

    public void recruter(Heros h) {           // agrégation
        membres.add(h);
    }
}`,
      notes:['Composition : <code>new</code> dans le constructeur du tout, et la partie n’est jamais donnée à l’extérieur.','Agrégation : la partie arrive par un paramètre, elle existait avant.','Quand plus personne ne référence le héros, son inventaire devient inaccessible aussi : le ramasse-miettes récupère les deux.'] },
    { t:'code', h:'À toi : composition et agrégation', file:'relations.py', mem:1,
      p:`<p>Écris :</p><ul><li>une classe <code>Sac</code> avec une liste <code>objets</code> vide ;</li><li>une classe <code>Aventurier</code> (<code>nom</code>) qui <strong>crée son propre</strong> <code>Sac</code> dans <code>self.sac</code> (composition) ;</li><li>une classe <code>Equipe</code> avec une liste <code>membres</code>, et une méthode <code>ajouter(aventurier)</code> (agrégation).</li></ul><p>Crée deux aventuriers <code>a</code> et <code>b</code>, une équipe <code>e</code>, et ajoute-les.</p>`,
      code:``,
      sol:`class Sac:
    def __init__(self):
        self.objets = []

class Aventurier:
    def __init__(self, nom):
        self.nom = nom
        self.sac = Sac()

class Equipe:
    def __init__(self):
        self.membres = []

    def ajouter(self, aventurier):
        self.membres.append(aventurier)

a = Aventurier("Sam")
b = Aventurier("Léa")
e = Equipe()
e.ajouter(a)
e.ajouter(b)`,
      hints:['Composition : dans le constructeur d’Aventurier, <code>self.sac = Sac()</code>.','Agrégation : <code>Equipe</code> a <code>self.membres = []</code> et <code>ajouter</code> fait <code>self.membres.append(aventurier)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + '\n_x = Aventurier("X")\n_y = Aventurier("Y")\n_e = Equipe()\n_e.ajouter(_x)\nprint("#T", type(_x.sac).__name__, _x.sac is _y.sac, _x.sac.objets, len(_e.membres), _e.membres[0] is _x)');
        if (t.err) return TESTERR(t);
        if (!/#T Sac False \[\] 1 True/.test(t.out)) return 'Chaque aventurier doit créer son propre Sac (vide), et l’équipe doit garder les aventuriers qu’on lui donne, sans les copier.';
        if (attr(r, 'e', 'membres') === undefined || !/Aventurier object.*Aventurier object/.test(attr(r, 'e', 'membres'))) return 'Ajoute <code>a</code> et <code>b</code> à l’équipe <code>e</code>.';
        return true;
      },
      ok:'Chaque aventurier a son propre sac, que personne d’autre ne partage. L’équipe, elle, regroupe des aventuriers qui existaient avant elle.' },
    { t:'code', bug:1, h:'Le cœur partagé', file:'bug.py', mem:1,
      p:`<p>Chaque golem devrait avoir <strong>son propre</strong> cœur : c'est une composition. Mais ici, les deux golems reçoivent le même objet <code>Coeur</code> de l'extérieur. Quand le premier perd sa force, le second aussi ! Corrige la classe pour que chaque golem crée son cœur lui-même : le constructeur reçoit la <strong>force</strong> du cœur, plus le cœur.</p>`,
      code: BUG81,
      sol:`class Coeur:
    def __init__(self, force):
        self.force = force

class Golem:
    def __init__(self, nom, force):
        self.nom = nom
        self.coeur = Coeur(force)

g1 = Golem("Golem A", 50)
g2 = Golem("Golem B", 50)
g1.coeur.force -= 50
print(g2.nom, "a un cœur de force", g2.coeur.force)`,
      hints:['Le constructeur de Golem doit recevoir un nombre (la force), et créer le cœur avec <code>Coeur(force)</code>.','<code>def __init__(self, nom, force):</code> → <code>self.coeur = Coeur(force)</code>. Puis <code>g1 = Golem("Golem A", 50)</code>, sans variable <code>pierre</code>.'],
      check:async (r, code, test) => {
        if (same(code, BUG81)) return START;
        if (r.err) return ERR;
        if (!/Golem B a un cœur de force 50/.test(r.out)) return 'Le golem B doit garder un cœur de force 50.';
        const t = await test([], code + '\n_a = Golem("A", 7)\n_b = Golem("B", 7)\nprint("#T", _a.coeur is _b.coeur, _a.coeur.force)');
        if (t.err || !/#T False 7/.test(t.out)) return 'Le constructeur doit recevoir la force et créer un nouveau Coeur : <code>Golem("A", 7)</code> doit avoir un cœur à lui, de force 7.';
        return true;
      },
      ok:'La composition, c’est aussi une protection : une partie que personne d’autre ne connaît ne peut pas être abîmée par quelqu’un d’autre.' }
  ],
  recap:['<strong>Association</strong> : un objet garde une référence vers un autre (un attribut). Avec une <strong>multiplicité</strong> : <code>1</code>, <code>0..1</code>, <code>*</code>, <code>1..*</code>.','<strong>Composition</strong> : le tout crée et possède ses parties, qui meurent avec lui (héros → inventaire).','<strong>Agrégation</strong> : le tout regroupe des parties venues de l’extérieur, qui lui survivent (guilde → héros).','<strong>Dépendance</strong> : utilisation passagère, dans une méthode (paramètre, variable locale). Le lien le plus faible.'] };

/* ---------- 8.2 ---------- */
LES['p8-2'] = { title:'Lire un diagramme de classes UML', dur:'15 min',
  intro:'L’UML est le langage graphique des développeurs pour dessiner leurs classes. Le prof va t’en montrer, et t’en demander. Ici, tu apprends à lire chaque case et chaque flèche, puis à traduire un diagramme en code.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Une <code>Partie</code> crée son propre <code>Plateau</code> dans son constructeur, et le plateau disparaît avec la partie. Quelle relation ?</p>`,
      opts:[ {l:'Agrégation', why:'Dans une agrégation, la partie vient de l’extérieur et survit au tout.'},
             {l:'Composition', ok:1},
             {l:'Dépendance', why:'Le plateau est gardé dans un attribut : c’est plus fort qu’une dépendance.'},
             {l:'Héritage', why:'Une partie n’est pas un plateau.'} ],
      ex:'Créé par le tout, possédé par lui seul, et mort avec lui : composition.' },
    { t:'say', h:'UML, c’est quoi ?',
      p:`<p><strong>UML</strong> (<em>Unified Modeling Language</em>) est un langage visuel standard pour décrire un logiciel. Il a beaucoup de sortes de diagrammes. En POO, le plus utilisé est le <strong>diagramme de classes</strong> (<em>class diagram</em>) : il montre les classes, leur contenu, et les liens entre elles.</p><p>On s'en sert pour réfléchir avant de coder, et pour expliquer un programme. Un diagramme est un modèle : on y met ce qui compte pour la discussion, pas forcément tout. Outils : draw.io, PlantUML, Mermaid, StarUML…</p>` },
    { t:'say', h:'Anatomie d’une classe',
      p:`<p>Une classe se dessine en trois cases : son <strong>nom</strong>, ses <strong>attributs</strong>, ses <strong>opérations</strong> (les méthodes). Le type vient <strong>après</strong> le nom, séparé par <code>:</code>.</p>`,
      snip:`┌──────────────────────────────────┐
│            Personnage            │   ← nom
├──────────────────────────────────┤
│ - nom : String                   │   ← attributs
│ - pv : int                       │
│ # force : int                    │
│ + NIVEAU_MAX : int  {static}     │
├──────────────────────────────────┤
│ + Personnage(nom : String)       │   ← opérations
│ + recevoir(degats : int) : void  │
│ + getPv() : int                  │
│ - journal(msg : String) : void   │
└──────────────────────────────────┘

Visibilité :  + public   - private   # protected   ~ package`,
      p2:`<p>Autres conventions : un nom <em>en italique</em> (ou marqué <code>{abstract}</code>) = classe ou méthode abstraite ; <code>«interface»</code> au-dessus du nom = interface ; un membre <u>souligné</u> (ou marqué <code>{static}</code>) = membre de classe.</p>` },
    { t:'quiz', h:'Lis la case', p:`<p>Dans un diagramme, que veut dire cette ligne ?</p>`, snip:`- soigner(n : int) : boolean`,
      opts:[ {l:'Un attribut public soigner, de type boolean', why:'Il y a des parenthèses : c’est une opération (une méthode), pas un attribut. Et <code>-</code> veut dire private.'},
             {l:'Une méthode privée soigner, qui reçoit un entier n et renvoie un booléen', ok:1},
             {l:'Une méthode qui enlève n PV', why:'Le <code>-</code> n’est pas une soustraction : c’est la visibilité (private).'},
             {l:'Une méthode publique qui renvoie un entier', why:'<code>-</code> = private, et le type de retour est après les parenthèses : boolean.'} ],
      ex:'<code>-</code> = private, <code>soigner(n : int)</code> = nom et paramètres typés, <code>: boolean</code> = type de retour. En Java : <code>private boolean soigner(int n)</code>.' },
    { t:'say', h:'Les six flèches',
      p:`<p>Chaque relation a sa flèche. Les trois symboles à retenir : le <strong>losange</strong> (côté du tout), le <strong>triangle vide</strong> (côté du parent ou de l'interface), et les <strong>pointillés</strong> (lien plus faible, ou interface).</p>`,
      snip: FLECHES,
      p2:`<p>Moyen mnémotechnique : losange <strong>plein</strong> = lien <strong>plein</strong> (la partie meurt avec le tout). Losange vide = lien plus lâche. Le triangle pointe toujours vers le plus général.</p>` },
    { t:'quiz', h:'Quelle flèche ?', p:`<p>Que représente ce lien ?</p>`, snip:`Guerrier ─────────▷ Personnage`,
      opts:[ {l:'Un Guerrier contient un Personnage', why:'Contenir, ce serait un losange. Le triangle vide, c’est l’héritage.'},
             {l:'Guerrier hérite de Personnage', ok:1},
             {l:'Personnage hérite de Guerrier', why:'Le triangle pointe vers le parent : c’est Personnage.'},
             {l:'Guerrier implémente l’interface Personnage', why:'La réalisation utilise des pointillés. Ici, le trait est plein.'} ],
      ex:'Trait plein + triangle vide vers le parent : héritage. En Python : <code>class Guerrier(Personnage)</code>.' },
    { t:'quiz', h:'Et celle-là ?', p:`<p>Que représente ce lien ?</p>`, snip:`Chateau ◆──────── 1..* Tour`,
      opts:[ {l:'Composition : un château possède au moins une tour, qui disparaît avec lui', ok:1},
             {l:'Agrégation : les tours existent sans le château', why:'Le losange est plein : c’est la composition.'},
             {l:'Héritage : une tour est un château', why:'L’héritage se dessine avec un triangle, pas un losange.'},
             {l:'Un château a exactement une tour', why:'<code>1..*</code> veut dire « au moins une ».'} ],
      ex:'Losange plein côté Chateau : composition. <code>1..*</code> côté Tour : au moins une tour.' },
    { t:'quiz', h:'Les pointillés', p:`<p>Que représente ce lien ?</p>`, snip:`Tourelle - - - - ▷ «interface» Attaquant`,
      opts:[ {l:'Tourelle hérite de la classe Attaquant', why:'L’héritage d’une classe a un trait plein. Les pointillés avec un triangle, c’est autre chose.'},
             {l:'Tourelle utilise Attaquant dans une méthode', why:'La dépendance est en pointillés, mais avec une flèche ouverte <code>&gt;</code>, pas un triangle.'},
             {l:'Tourelle implémente l’interface Attaquant', ok:1},
             {l:'Tourelle contient des Attaquants', why:'Contenir, c’est un losange.'} ],
      ex:'Pointillés + triangle vide vers une interface : la <strong>réalisation</strong>. En Java : <code>class Tourelle implements Attaquant</code>.' },
    { t:'say', h:'Un diagramme complet',
      p:`<p>Lis ce diagramme, puis regarde sa traduction en Python à l'étape suivante. Les flèches de composition et d'association disent quels attributs créer, et les multiplicités disent s'il faut une liste.</p>`,
      snip:`┌───────────────────────┐
│ «interface»           │
│ Attaquant             │
├───────────────────────┤
│ + attaquer(c) : str   │
└───────────────────────┘
            △
            ┊  réalisation
            ┊
┌───────────────────────┐ 1      0..1 ┌──────────────────────┐
│ Heros                 │ ──────────> │ Arme                 │
├───────────────────────┤    arme     ├──────────────────────┤
│ - nom : str           │             │ - nom : str          │
│ - pv : int            │             │ - degats : int       │
├───────────────────────┤             └──────────────────────┘
│ + attaquer(c) : str   │
│ + equiper(a : Arme)   │ 1         1 ┌──────────────────────┐
│                       │ ◆────────── │ Inventaire           │
└───────────────────────┘             ├──────────────────────┤
                                      │ - objets : list      │
                                      │ + ajouter(o) : void  │
                                      └──────────────────────┘`,
      p2:`<p>À retenir : Heros <strong>implémente</strong> Attaquant ; il est <strong>associé</strong> à 0 ou 1 Arme (un attribut <code>arme</code> qui peut valoir <code>None</code>) ; il est <strong>composé</strong> d'exactement un Inventaire, qu'il crée lui-même.</p>` },
    { t:'code', h:'À toi : du diagramme au code', file:'diagramme.py', mem:1,
      p:`<p>Traduis ce diagramme en Python (sans l'interface). Les attributs privés prennent un <code>_</code>.</p><ul><li><code>Arme</code> : <code>_nom</code>, <code>_degats</code>, et une propriété <code>degats</code> ;</li><li><code>Inventaire</code> : <code>_objets</code> (liste vide), <code>ajouter(o)</code> ;</li><li><code>Heros</code> : <code>_nom</code>, <code>_pv</code> (100 au départ), <code>_arme</code> (<code>None</code> au départ), <code>_inventaire</code> (créé par le héros) ; <code>equiper(a)</code> range l'arme ; <code>attaquer(c)</code> renvoie <code>Sam frappe Orc (12)</code>, avec les dégâts de l'arme, ou 1 sans arme.</li></ul><p>Crée <code>sam = Heros("Sam")</code> et équipe-le d'une <code>Arme("Épée", 12)</code>.</p>`,
      code:``,
      sol:`class Arme:
    def __init__(self, nom, degats):
        self._nom = nom
        self._degats = degats

    @property
    def degats(self):
        return self._degats

class Inventaire:
    def __init__(self):
        self._objets = []

    def ajouter(self, o):
        self._objets.append(o)

class Heros:
    def __init__(self, nom):
        self._nom = nom
        self._pv = 100
        self._arme = None
        self._inventaire = Inventaire()

    def equiper(self, a):
        self._arme = a

    def attaquer(self, c):
        d = 1 if self._arme is None else self._arme.degats
        return f"{self._nom} frappe {c} ({d})"

sam = Heros("Sam")
sam.equiper(Arme("Épée", 12))`,
      hints:['Composition : <code>self._inventaire = Inventaire()</code> dans le constructeur du héros. Association 0..1 : <code>self._arme = None</code>.','<code>attaquer</code> : <code>d = 1 if self._arme is None else self._arme.degats</code>, puis <code>return f"{self._nom} frappe {c} ({d})"</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + '\n_h = Heros("H")\n_g = Heros("G")\nprint("#A", _h.attaquer("Rat"), "|", _h._pv, _h._arme, type(_h._inventaire).__name__, _h._inventaire is _g._inventaire)\n_h.equiper(Arme("Arc", 9))\nprint("#B", _h.attaquer("Loup"), Arme("X", 4).degats)\n_h._inventaire.ajouter("corde")\nprint("#C", _h._inventaire._objets)');
        if (t.err) return TESTERR(t);
        if (!/#A H frappe Rat \(1\) \| 100 None Inventaire False/.test(t.out)) return 'Un héros neuf : 100 PV, pas d’arme (<code>None</code>), son propre Inventaire, et il frappe à 1 dégât.';
        if (!/#B H frappe Loup \(9\) 4/.test(t.out)) return 'Équipé d’un arc de 9, le héros frappe à 9. Et la propriété <code>degats</code> de l’arme doit marcher.';
        if (!/#C \['corde'\]/.test(t.out)) return 'L’inventaire doit savoir <code>ajouter</code> un objet dans <code>_objets</code>.';
        return true;
      },
      ok:'Chaque flèche du diagramme est devenue un attribut : <code>_arme</code> pour l’association, <code>_inventaire</code> pour la composition.' },
    { t:'fill', lang:'java', h:'Du diagramme au Java',
      p:`<p>Traduis cette case UML en Java :</p><pre class="snippet">┌────────────────────────────────┐
│ Potion                         │
├────────────────────────────────┤
│ - soin : int                   │
│ + FABRIQUEES : int  {static}   │
├────────────────────────────────┤
│ + boire() : int                │
│ - verifier() : boolean         │
└────────────────────────────────┘</pre>`,
      tpl:`public class Potion {
    [[private]] int soin;
    public [[static]] int FABRIQUEES;

    public [[int]] boire() { ... }

    [[private]] [[boolean]] verifier() { ... }
}`,
      hints:['<code>-</code> = private, <code>+</code> = public, <code>{static}</code> = static. Le type de retour est après les parenthèses dans le diagramme, avant le nom en Java.','<code>private</code>, <code>static</code>, <code>int</code>, <code>private</code>, <code>boolean</code>.'],
      ok:'En UML, le type est après le nom (<code>soin : int</code>). En Java, il est avant (<code>int soin</code>). Attention à ne pas te mélanger à l’examen.' }
  ],
  recap:['Une classe UML : trois cases (nom, attributs, opérations). Le type après le nom : <code>pv : int</code>, <code>getPv() : int</code>.','Visibilité : <code>+</code> public, <code>-</code> private, <code>#</code> protected, <code>~</code> package. Souligné ou <code>{static}</code> = de classe. Italique = abstrait.','Flèches : association <code>──&gt;</code>, dépendance <code>- -&gt;</code>, agrégation <code>◇──</code>, composition <code>◆──</code>, héritage <code>──▷</code>, réalisation <code>- -▷</code>.','Le losange est du côté du tout. Le triangle pointe vers le parent ou l’interface.'] };

/* ---------- 8.3 ---------- */
LES['p8-3'] = { title:'Dessiner ses classes', dur:'14 min',
  intro:'Face à un énoncé en français, comment trouver les classes, leurs attributs et leurs méthodes ? Deux techniques simples, utilisées en vrai : l’analyse des noms et des verbes, et les cartes CRC.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Dans un diagramme UML, de quel côté se trouve le losange d'une composition ?</p>`,
      opts:[ {l:'Du côté de la partie', why:'C’est l’inverse : le losange touche le tout.'},
             {l:'Du côté du tout', ok:1},
             {l:'Au milieu du trait', why:'Il est toujours collé à une des deux classes.'},
             {l:'Des deux côtés', why:'Un seul losange, du côté du tout.'} ],
      ex:'<code>Chateau ◆──── Tour</code> : le losange touche le château, qui possède les tours.' },
    { t:'say', h:'Les noms et les verbes',
      p:`<p>Première technique : lis l'énoncé et souligne les <strong>noms</strong> (candidats pour des classes ou des attributs) et les <strong>verbes</strong> (candidats pour des méthodes). Voici l'énoncé d'un tableau de quêtes :</p>`,
      snip:`« La taverne affiche un tableau de quêtes. Chaque quête a un titre,
une récompense en or et un niveau minimum. Un héros peut accepter
une quête s'il a le niveau requis, et au plus trois quêtes à la fois.
Quand il termine une quête, il reçoit la récompense. La taverne peut
lister les quêtes encore disponibles. »

Noms  → Taverne, Tableau, Quête, Héros   (classes)
        titre, récompense, niveau minimum, niveau   (attributs)
Verbes → accepter, terminer, recevoir, lister   (méthodes)`,
      p2:`<p>Ensuite, on décide : qui est <strong>responsable</strong> de chaque méthode ? Règle d'or : la classe qui <strong>a les données</strong> nécessaires. « Accepter une quête » demande le niveau du héros et ses quêtes en cours : c'est une méthode de <code>Heros</code>.</p>` },
    { t:'quiz', h:'Qui est responsable ?', p:`<p>Dans l'énoncé de la taverne, quelle classe devrait avoir la méthode <code>quetes_disponibles()</code> ?</p>`,
      opts:[ {l:'Heros', why:'Le héros ne connaît que ses propres quêtes, pas tout le tableau.'},
             {l:'Quete', why:'Une quête ne connaît qu’elle-même : elle ne peut pas lister les autres.'},
             {l:'Taverne', ok:1},
             {l:'Recompense', why:'Ce n’est même pas une classe : c’est un attribut de la quête.'} ],
      ex:'C’est la taverne qui a le tableau de toutes les quêtes : c’est donc à elle de lister celles qui sont disponibles.' },
    { t:'say', h:'Les cartes CRC',
      p:`<p>Deuxième technique, très utilisée en équipe : les <strong>cartes CRC</strong> (<em>Class, Responsibilities, Collaborators</em>). Une petite fiche par classe, avec ce qu'elle doit faire et avec qui elle travaille.</p>`,
      snip:`┌─────────────────────────────────────────────┐
│ Heros                                       │
├──────────────────────────────┬──────────────┤
│ Responsabilités              │ Collaborent  │
│ - connaître son niveau       │ Quete        │
│ - accepter une quête         │              │
│ - terminer une quête         │              │
│ - gagner de l'or             │              │
└──────────────────────────────┴──────────────┘
┌─────────────────────────────────────────────┐
│ Quete                                       │
├──────────────────────────────┬──────────────┤
│ - connaître titre, récompense│ (aucun)      │
│   et niveau minimum          │              │
│ - savoir si elle est prise   │              │
└──────────────────────────────┴──────────────┘`,
      p2:`<p>Si une carte déborde de responsabilités, la classe en fait trop : il faut sans doute la découper. On reparlera de ça au chapitre 10 (principe de responsabilité unique).</p>` },
    { t:'quiz', h:'Du code au diagramme', p:`<p>Quel diagramme correspond à ce code ?</p>`, snip:`class Taverne:
    def __init__(self):
        self.quetes = []

    def afficher(self, quete):
        self.quetes.append(quete)`,
      opts:[ {l:'Taverne ◆──── * Quete', why:'Les quêtes viennent de l’extérieur (paramètre) : la taverne ne les crée pas. Ce n’est pas une composition.'},
             {l:'Taverne ◇──── * Quete', ok:1},
             {l:'Taverne - - -> Quete', why:'La taverne garde les quêtes dans un attribut : c’est plus qu’une dépendance.'},
             {l:'Quete ────▷ Taverne', why:'Il n’y a aucun héritage ici.'} ],
      ex:'Une liste remplie avec des objets venus de dehors : agrégation, avec une multiplicité <code>*</code>.' },
    { t:'code', h:'À toi : la quête', file:'quete.py', mem:1,
      p:`<p>D'après l'énoncé et la carte CRC, écris la classe <code>Quete</code> : <code>titre</code>, <code>recompense</code>, <code>niveau_min</code>, et un attribut <code>prise</code> à <code>False</code>. Puis la classe <code>Heros</code> : <code>nom</code>, <code>niveau</code>, <code>or_</code> (à 0), une liste <code>quetes</code> vide, et deux méthodes :</p><ul><li><code>accepter(quete)</code> : refuse (renvoie <code>False</code>) si la quête est déjà prise, si le niveau est trop bas, ou si le héros a déjà 3 quêtes. Sinon, il l'ajoute, la marque prise, et renvoie <code>True</code> ;</li><li><code>terminer(quete)</code> : si le héros a cette quête, il la retire de sa liste et gagne la récompense.</li></ul>`,
      code:``,
      sol:`class Quete:
    def __init__(self, titre, recompense, niveau_min):
        self.titre = titre
        self.recompense = recompense
        self.niveau_min = niveau_min
        self.prise = False

class Heros:
    def __init__(self, nom, niveau):
        self.nom = nom
        self.niveau = niveau
        self.or_ = 0
        self.quetes = []

    def accepter(self, quete):
        if quete.prise or self.niveau < quete.niveau_min or len(self.quetes) >= 3:
            return False
        self.quetes.append(quete)
        quete.prise = True
        return True

    def terminer(self, quete):
        if quete in self.quetes:
            self.quetes.remove(quete)
            self.or_ += quete.recompense

sam = Heros("Sam", 4)
q = Quete("Chasser les loups", 30, 2)
print(sam.accepter(q))
sam.terminer(q)
print(sam.or_)`,
      hints:['<code>accepter</code> commence par les trois refus : <code>if quete.prise or self.niveau &lt; quete.niveau_min or len(self.quetes) &gt;= 3: return False</code>.','<code>terminer</code> : <code>if quete in self.quetes:</code> → <code>self.quetes.remove(quete)</code> et <code>self.or_ += quete.recompense</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
_h = Heros("H", 3)
_qs = [Quete("Q" + str(i), 10 * i, 1) for i in range(1, 6)]
_dur = Quete("Dure", 99, 9)
print("#A", _h.accepter(_dur), _dur.prise, _h.accepter(_qs[0]), _qs[0].prise, Heros("X", 9).accepter(_qs[0]))
print("#B", _h.accepter(_qs[1]), _h.accepter(_qs[2]), _h.accepter(_qs[3]), len(_h.quetes))
_h.terminer(_qs[1])
_h.terminer(_qs[4])
print("#C", _h.or_, len(_h.quetes), _h.accepter(_qs[3]))`);
        if (t.err) return TESTERR(t);
        if (!/#A False False True True False/.test(t.out)) return 'Une quête de niveau trop élevé doit être refusée (et rester libre). Une quête acceptée devient <code>prise</code>, et un autre héros ne peut plus la prendre.';
        if (!/#B True True False 3/.test(t.out)) return 'Un héros ne peut pas avoir plus de 3 quêtes à la fois.';
        if (!/#C 20 2 True/.test(t.out)) return 'Terminer une quête qu’on a : on la retire et on gagne la récompense (20 pour Q2). Terminer une quête qu’on n’a pas ne fait rien. Ensuite, il y a de nouveau de la place.';
        return true;
      },
      ok:'Chaque méthode est dans la classe qui a les données : le héros connaît son niveau et ses quêtes, la quête sait si elle est prise.' },
    { t:'code', defi:1, h:'La taverne', file:'taverne.py', mem:1,
      p:`<p>Ajoute la classe <code>Taverne</code> : une liste <code>tableau</code> de quêtes (agrégation), une méthode <code>afficher(quete)</code> qui l'ajoute au tableau, et une méthode <code>disponibles(niveau)</code> qui renvoie la liste des <strong>titres</strong> des quêtes non prises dont le niveau minimum est inférieur ou égal à <code>niveau</code>.</p>`,
      code:`class Quete:
    def __init__(self, titre, recompense, niveau_min):
        self.titre = titre
        self.recompense = recompense
        self.niveau_min = niveau_min
        self.prise = False
`,
      sol:`class Quete:
    def __init__(self, titre, recompense, niveau_min):
        self.titre = titre
        self.recompense = recompense
        self.niveau_min = niveau_min
        self.prise = False

class Taverne:
    def __init__(self):
        self.tableau = []

    def afficher(self, quete):
        self.tableau.append(quete)

    def disponibles(self, niveau):
        titres = []
        for q in self.tableau:
            if not q.prise and q.niveau_min <= niveau:
                titres.append(q.titre)
        return titres

t = Taverne()
t.afficher(Quete("Rats", 5, 1))
t.afficher(Quete("Dragon", 900, 20))
print(t.disponibles(3))`,
      hints:['<code>disponibles</code> parcourt <code>self.tableau</code> et garde les titres des quêtes qui vérifient deux conditions.','<code>if not q.prise and q.niveau_min &lt;= niveau: titres.append(q.titre)</code>'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
_t = Taverne()
_a = Quete("A", 1, 1)
_b = Quete("B", 1, 5)
_c = Quete("C", 1, 2)
for _q in (_a, _b, _c):
    _t.afficher(_q)
_c.prise = True
print("#T", _t.disponibles(2), _t.disponibles(5), Taverne().disponibles(99))`);
        if (t.err) return TESTERR(t);
        if (!/#T \['A'\] \['A', 'B'\] \[\]/.test(t.out)) return 'Je teste un tableau avec A (niveau 1), B (niveau 5) et C (niveau 2, déjà prise). Pour le niveau 2 : seulement A. Pour le niveau 5 : A et B. Une taverne vide : liste vide.';
        return true;
      },
      ok:'Ta taverne et tes quêtes forment un petit modèle propre. Tu viens de passer d’un énoncé en français à un code orienté objet, comme au partiel.' },
    { t:'say', h:'Mini-défi sur papier',
      p:`<p>Prends une feuille (ou draw.io) et dessine le diagramme de classes de la taverne : <code>Taverne</code>, <code>Quete</code>, <code>Heros</code>, avec leurs attributs, leurs méthodes, les visibilités, et les flèches avec leurs multiplicités.</p><p>Indices : la taverne <strong>agrège</strong> des quêtes (<code>◇── *</code>), et un héros est <strong>associé</strong> à 0 à 3 quêtes (<code>──&gt; 0..3</code>). Compare ensuite avec un camarade : vous n'aurez sûrement pas exactement le même dessin, et c'est normal.</p>` }
  ],
  recap:['Analyse de l’énoncé : les <strong>noms</strong> donnent des classes ou des attributs, les <strong>verbes</strong> des méthodes.','Chaque méthode va dans la classe qui <strong>a les données</strong> nécessaires.','<strong>Cartes CRC</strong> : Classe, Responsabilités, Collaborateurs. Une carte trop remplie = une classe qui en fait trop.','Du code au diagramme : un objet créé dans le constructeur = composition ; reçu en paramètre et gardé = agrégation ou association ; seulement utilisé = dépendance.'] };

/* ---------- 8.4 ---------- */
const BUG84 = `class Pile(list):
    def empiler(self, x):
        self.append(x)

    def depiler(self):
        return self.pop()

assiettes = Pile()
assiettes.empiler("bleue")
assiettes.empiler("rouge")
assiettes.insert(0, "verte")
print(assiettes.depiler(), assiettes.depiler(), assiettes.depiler())`;
LES['p8-4'] = { title:'La composition plutôt que l’héritage', dur:'15 min',
  intro:'« Préfère la composition à l’héritage » : c’est l’un des conseils les plus célèbres de la conception objet. Tu vas voir pourquoi un héritage mal choisi casse les règles, et comment la composition répare tout.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Dans un énoncé, que représentent souvent les <strong>verbes</strong> ?</p>`,
      opts:[ {l:'Des classes', why:'Les classes viennent plutôt des noms.'},
             {l:'Des méthodes', ok:1},
             {l:'Des attributs', why:'Les attributs viennent aussi des noms (titre, niveau…).'},
             {l:'Des relations d’héritage', why:'L’héritage vient des phrases « X est un Y ».'} ],
      ex:'Verbes → méthodes. Puis on cherche quelle classe a les données pour les faire.' },
    { t:'say', h:'Un héritage qui casse les règles', file:'pile.py',
      p:`<p>Une <strong>pile</strong> (comme une pile d'assiettes) a une règle : on ne touche qu'au sommet. On ajoute en haut, on retire en haut (le dernier arrivé sort le premier).</p><p>Tentation : <code>class Pile(list)</code>, pour réutiliser la liste. Mais la pile hérite alors de <strong>toutes</strong> les méthodes de <code>list</code>, même celles qui cassent sa règle : <code>insert</code> pour glisser une assiette tout en bas ! Java a fait exactement cette erreur avec sa classe <code>Stack</code>.</p>`,
      code: BUG84 },
    { t:'say', h:'La solution : composition et délégation', file:'pile_ok.py',
      p:`<p>Avec la <strong>composition</strong>, la pile <strong>a</strong> une liste, cachée dans un attribut. Elle ne montre que les méthodes qu'elle choisit, et pour faire le travail, elle le confie à sa liste : c'est la <strong>délégation</strong> (<em>delegation</em>).</p><p>Plus de <code>insert</code> possible. Et demain, on pourra changer la liste interne contre autre chose sans que personne ne le remarque.</p>`,
      code:`class Pile:
    def __init__(self):
        self._elements = []

    def empiler(self, x):
        self._elements.append(x)

    def depiler(self):
        return self._elements.pop()

    def est_vide(self):
        return len(self._elements) == 0

    def __len__(self):
        return len(self._elements)

assiettes = Pile()
assiettes.empiler("bleue")
assiettes.empiler("rouge")
print(assiettes.depiler(), len(assiettes))
try:
    assiettes.insert(0, "verte")
except AttributeError:
    print("Impossible de glisser une assiette en dessous !")` },
    { t:'code', bug:1, h:'Répare la pile', file:'bug.py',
      p:`<p>Réécris <code>Pile</code> avec la composition : elle ne doit plus hériter de <code>list</code>, mais garder une liste cachée <code>_elements</code>. Le code du bas doit alors refuser le <code>insert</code> : entoure-le d'un <code>try</code> / <code>except AttributeError</code> qui affiche <code>Refusé</code>.</p>`,
      code: BUG84,
      sol:`class Pile:
    def __init__(self):
        self._elements = []

    def empiler(self, x):
        self._elements.append(x)

    def depiler(self):
        return self._elements.pop()

assiettes = Pile()
assiettes.empiler("bleue")
assiettes.empiler("rouge")
try:
    assiettes.insert(0, "verte")
except AttributeError:
    print("Refusé")
print(assiettes.depiler(), assiettes.depiler())`,
      hints:['<code>class Pile:</code> sans parenthèses, avec <code>self._elements = []</code> dans le constructeur. <code>empiler</code> et <code>depiler</code> délèguent à <code>self._elements</code>.','En bas : <code>try:</code> → <code>assiettes.insert(0, "verte")</code>, <code>except AttributeError:</code> → <code>print("Refusé")</code>. Et ne dépile plus que deux assiettes.'],
      check:async (r, code, test) => {
        if (same(code, BUG84)) return START;
        if (r.err) return ERR;
        if (/class\s+Pile\s*\(\s*list\s*\)/.test(code)) return 'La pile ne doit plus hériter de <code>list</code>.';
        if (!/Refusé/.test(r.out)) return 'Le <code>insert</code> doit être refusé, et ton <code>except</code> doit afficher <code>Refusé</code>.';
        const t = await test([], code + '\n_p = Pile()\n_p.empiler(1)\n_p.empiler(2)\nprint("#T", _p.depiler(), _p.depiler(), hasattr(_p, "append"), _p._elements)');
        if (t.err || !/#T 2 1 False \[\]/.test(t.out)) return 'La pile doit rendre le dernier élément empilé en premier, et ne plus avoir les méthodes d’une liste.';
        return true;
      },
      ok:'Ta pile n’expose que ce qu’elle veut. Plus personne ne peut casser sa règle.' },
    { t:'say', h:'Héritage ou composition : le tableau',
      p:`<p>Les deux permettent de réutiliser du code, mais pas de la même façon :</p>`,
      snip:`                    Héritage                     Composition
Relation            « est un » (is-a)            « a un » (has-a)
Couplage            fort : la fille voit tout    faible : on ne voit que
                    l'intérieur du parent        l'interface de la partie
Décidé              à la compilation, figé       à l'exécution, modifiable
Ce qui est exposé   toutes les méthodes          seulement ce qu'on délègue
                    héritées`,
      p2:`<p>La règle : utilise l'héritage quand la fille peut <strong>vraiment remplacer</strong> le parent partout (« est un » au sens fort). Sinon, compose.</p>` },
    { t:'say', h:'Changer de pièce en cours de partie', file:'changer.py', mem:1,
      p:`<p>Un autre avantage de la composition : on peut <strong>changer la pièce pendant l'exécution</strong>. Avec l'héritage, il faudrait des classes <code>HerosAvecEpee</code>, <code>HerosAvecArc</code>, <code>HerosAvecEpeeEtBouclier</code>… et un héros ne pourrait jamais changer d'arme.</p><p>Avec la composition, le héros <strong>a</strong> une arme, qu'il délègue pour calculer ses dégâts. Il change d'arme quand il veut.</p>`,
      code:`class Epee:
    def degats(self, force):
        return force + 8

class Arc:
    def degats(self, force):
        return force * 2

class Poings:
    def degats(self, force):
        return force

class Heros:
    def __init__(self, nom, force):
        self.nom = nom
        self.force = force
        self.arme = Poings()

    def equiper(self, arme):
        self.arme = arme

    def attaquer(self):
        return f"{self.nom} inflige {self.arme.degats(self.force)}"

sam = Heros("Sam", 10)
print(sam.attaquer())
sam.equiper(Epee())
print(sam.attaquer())
sam.equiper(Arc())
print(sam.attaquer())` },
    { t:'quiz', h:'Le bon choix', p:`<p>Un <code>Familier</code> doit pouvoir suivre le héros et attaquer. Lequel de ces choix est le meilleur ?</p>`,
      opts:[ {l:'class Familier(Heros), pour réutiliser attaquer', why:'Un familier n’est pas un héros : il hériterait de l’inventaire, des quêtes, de la bourse…'},
             {l:'class Heros(Familier)', why:'Un héros n’est pas un familier non plus.'},
             {l:'Le héros a un attribut familier, et lui délègue une partie de l’attaque', ok:1},
             {l:'Copier la méthode attaquer dans les deux classes', why:'Ça marche, mais tout bug devra être corrigé deux fois.'} ],
      ex:'« Un héros <strong>a</strong> un familier » : composition. Le héros peut appeler <code>self.familier.attaquer(...)</code>, et changer de familier quand il veut.' },
    { t:'code', h:'À toi : l’armure interchangeable', file:'armure.py', mem:1,
      p:`<p>Écris deux classes d'armure, chacune avec une méthode <code>reduire(degats)</code> qui renvoie les dégâts subis :</p><ul><li><code>Cuir</code> : enlève 2 (jamais sous 0) ;</li><li><code>Plaques</code> : divise par 2 (division entière).</li></ul><p>Puis complète <code>Heros</code> : il a une armure (<code>None</code> au départ), une méthode <code>porter(armure)</code>, et <code>recevoir(degats)</code> <strong>délègue</strong> à l'armure s'il en a une. Crée <code>sam</code>, fais-lui porter des <code>Plaques()</code>, et inflige-lui 30.</p>`,
      code:`class Heros:
    def __init__(self, nom):
        self.nom = nom
        self.pv = 100
`,
      sol:`class Cuir:
    def reduire(self, degats):
        return max(0, degats - 2)

class Plaques:
    def reduire(self, degats):
        return degats // 2

class Heros:
    def __init__(self, nom):
        self.nom = nom
        self.pv = 100
        self.armure = None

    def porter(self, armure):
        self.armure = armure

    def recevoir(self, degats):
        if self.armure is not None:
            degats = self.armure.reduire(degats)
        self.pv -= degats

sam = Heros("Sam")
sam.porter(Plaques())
sam.recevoir(30)`,
      hints:['Le héros crée <code>self.armure = None</code> dans son constructeur, et <code>porter</code> la remplace.','<code>recevoir</code> : <code>if self.armure is not None: degats = self.armure.reduire(degats)</code>, puis <code>self.pv -= degats</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (attr(r, 'sam', 'pv') !== '85') return 'Avec des plaques, 30 dégâts n’en font que 15 : Sam doit finir à 85 PV.';
        const t = await test([], code + '\n_h = Heros("H")\n_h.recevoir(10)\n_h.porter(Cuir())\n_h.recevoir(10)\n_h.recevoir(1)\nprint("#T", _h.pv, Plaques().reduire(7))');
        if (t.err) return TESTERR(t);
        if (!/#T 82 3/.test(t.out)) return 'Sans armure, 10 dégâts font 10. Avec le cuir, 10 en font 8, et 1 n’en fait plus aucun (jamais négatif !). Les plaques : 7 // 2 = 3.';
        return true;
      },
      ok:'Le héros ne sait pas comment chaque armure calcule : il délègue. On peut inventer une armure de dragon demain sans toucher à Heros.' },
    { t:'code', defi:1, h:'Du mauvais héritage à la composition', file:'refacto.py',
      p:`<p>Ce code fait hériter <code>Heros</code> de <code>Bourse</code> pour réutiliser <code>depenser</code>. Résultat : un héros « est une » bourse… Réécris-le avec la composition : <code>Heros</code> a un attribut <code>bourse</code> (créé par lui, avec l'or de départ), et une méthode <code>acheter(prix)</code> qui délègue à <code>self.bourse.depenser(prix)</code>.</p>`,
      code:`class Bourse:
    def __init__(self, po):
        self.po = po

    def depenser(self, prix):
        if prix <= self.po:
            self.po -= prix
            return True
        return False

class Heros(Bourse):
    def __init__(self, nom, po):
        super().__init__(po)
        self.nom = nom

sam = Heros("Sam", 50)
print(sam.depenser(20), sam.po)`,
      sol:`class Bourse:
    def __init__(self, po):
        self.po = po

    def depenser(self, prix):
        if prix <= self.po:
            self.po -= prix
            return True
        return False

class Heros:
    def __init__(self, nom, po):
        self.nom = nom
        self.bourse = Bourse(po)

    def acheter(self, prix):
        return self.bourse.depenser(prix)

sam = Heros("Sam", 50)
print(sam.acheter(20), sam.bourse.po)`,
      hints:['<code>class Heros:</code> sans parent, et dans le constructeur : <code>self.bourse = Bourse(po)</code>.','<code>def acheter(self, prix): return self.bourse.depenser(prix)</code>. En bas : <code>sam.acheter(20)</code> et <code>sam.bourse.po</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (/class\s+Heros\s*\(\s*Bourse\s*\)/.test(code)) return 'Heros ne doit plus hériter de Bourse.';
        const t = await test([], code + '\n_h = Heros("H", 10)\nprint("#T", type(_h.bourse).__name__, _h.acheter(4), _h.acheter(7), _h.bourse.po, isinstance(_h, Bourse), hasattr(_h, "depenser"))');
        if (t.err) return TESTERR(t);
        if (!/#T Bourse True False 6 False False/.test(t.out)) return 'Le héros doit avoir un attribut <code>bourse</code> (un objet Bourse), acheter en déléguant, et ne plus être lui-même une bourse.';
        if (!/True 30/.test(r.out)) return 'Affiche <code>sam.acheter(20)</code> et l’or restant : <code>True 30</code>.';
        return true;
      },
      ok:'Un héros <strong>a</strong> une bourse. Si demain la bourse devient une banque magique, le héros ne verra que la méthode <code>depenser</code>.' }
  ],
  recap:['Un héritage pour « réutiliser du code » expose <strong>toutes</strong> les méthodes du parent, même celles qui cassent les règles.','<strong>Composition + délégation</strong> : l’objet a une partie cachée, et lui confie le travail. Il n’expose que ce qu’il choisit.','La composition est plus souple : la partie peut changer pendant l’exécution (changer d’arme, d’armure).','« Préfère la composition à l’héritage » : n’hérite que si la fille peut vraiment remplacer le parent partout.'] };

/* ---------- 8.5 ---------- */
const I1 = `class Objet:
    def __init__(self, nom, poids, prix):
        self.nom = nom
        self.poids = poids
        self.prix = prix

    def __repr__(self):
        return self.nom

class Inventaire:
    def __init__(self, poids_max):
        self._poids_max = poids_max
        self._objets = []

    def poids(self):
        return sum(o.poids for o in self._objets)

    def ajouter(self, objet):
        if self.poids() + objet.poids > self._poids_max:
            return False
        self._objets.append(objet)
        return True

    def retirer(self, nom):
        for o in self._objets:
            if o.nom == nom:
                self._objets.remove(o)
                return o
        return None

    @property
    def objets(self):
        return tuple(self._objets)`;
const I2 = `

class Heros:
    def __init__(self, nom, force, po):
        self.nom = nom
        self.po = po
        self.inventaire = Inventaire(force * 2)
        self.arme = None

    def ramasser(self, objet):
        return self.inventaire.ajouter(objet)

    def equiper(self, nom):
        objet = self.inventaire.retirer(nom)
        if objet is None:
            return False
        if self.arme is not None:
            self.inventaire.ajouter(self.arme)
        self.arme = objet
        return True`;
const I3 = `

class Marchand:
    def __init__(self, stock):
        self._stock = stock

    def vendre(self, heros, nom):
        for o in self._stock:
            if o.nom == nom:
                if heros.po < o.prix:
                    return "Pas assez d'or."
                if not heros.ramasser(o):
                    return "Trop lourd !"
                heros.po -= o.prix
                self._stock.remove(o)
                return f"{heros.nom} achète {nom}."
        return "Je n'ai pas ça."`;
const I4 = `

marchand = Marchand([Objet("Épée", 6, 40), Objet("Enclume", 30, 5), Objet("Arc", 4, 70)])
sam = Heros("Sam", 8, 60)
print(marchand.vendre(sam, "Épée"))
print(marchand.vendre(sam, "Enclume"))
print(marchand.vendre(sam, "Arc"))
print(marchand.vendre(sam, "Dragon"))
sam.equiper("Épée")
print(sam.arme, sam.inventaire.objets, sam.po)`;
LES['p8-5'] = { title:'Projet : l’inventaire du héros', dur:'18 min',
  intro:'Tu construis un petit système complet : des objets, un inventaire limité par le poids, un héros qui le possède, et un marchand qui vend. Chaque relation du chapitre y apparaît.',
  steps:[
    { t:'say', h:'Le projet',
      p:`<p>Voici le diagramme de ce qu'on va construire :</p>`,
      snip:`┌──────────────────┐   ┌──────────────────┐
│ Heros            │   │ Inventaire       │
├──────────────────┤   ├──────────────────┤
│ nom, po, arme    │   │ - poids_max      │
├──────────────────┤   ├──────────────────┤
│ ramasser(o)      │   │ ajouter(o)       │
│ equiper(nom)     │   │ retirer(nom)     │
└──────────────────┘   │ poids()          │
                       └──────────────────┘
┌──────────────────┐   ┌────────────────────┐
│ Objet            │   │ Marchand           │
├──────────────────┤   ├────────────────────┤
│ nom, poids, prix │   │ - stock            │
└──────────────────┘   ├────────────────────┤
                       │ vendre(heros, nom) │
                       └────────────────────┘

Heros      1 ◆─────────── 1    Inventaire   composition
Inventaire 1 ◇─────────── *    Objet        agrégation
Heros      1 ───────────> 0..1 Objet        association (arme)
Marchand   1 ◇─────────── *    Objet        agrégation (stock)
Marchand     - - - - - -> Heros             dépendance (dans vendre)`,
      p2:`<p>Le héros <strong>possède</strong> son inventaire (composition). L'inventaire <strong>regroupe</strong> des objets qui existent sans lui (agrégation : ils passent du marchand au héros). Le héros est <strong>associé</strong> à une arme. Le marchand <strong>utilise</strong> le héros le temps d'une vente (dépendance). Quatre étapes.</p>` },
    { t:'code', h:'Étape 1 : Objet et Inventaire', file:'inventaire.py', mem:1,
      p:`<p>Écris :</p><ul><li><code>Objet</code> : <code>nom</code>, <code>poids</code>, <code>prix</code>, et <code>__repr__</code> qui renvoie le nom ;</li><li><code>Inventaire</code> : <code>_poids_max</code> et <code>_objets</code> (liste vide). Méthodes : <code>poids()</code> (la somme des poids), <code>ajouter(objet)</code> (refuse avec <code>False</code> si le poids total dépasserait le maximum, sinon ajoute et renvoie <code>True</code>), <code>retirer(nom)</code> (retire et renvoie le premier objet de ce nom, ou <code>None</code>), et une propriété <code>objets</code> qui renvoie un tuple.</li></ul>`,
      code:``,
      sol: I1,
      hints:['<code>poids</code> : <code>return sum(o.poids for o in self._objets)</code>. <code>ajouter</code> : <code>if self.poids() + objet.poids &gt; self._poids_max: return False</code>.','<code>retirer</code> : une boucle qui cherche <code>o.nom == nom</code>, fait <code>self._objets.remove(o)</code> et <code>return o</code>. Après la boucle : <code>return None</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
_i = Inventaire(10)
_a = Objet("A", 6, 1)
print("#A", _i.ajouter(_a), _i.ajouter(Objet("B", 5, 1)), _i.ajouter(Objet("C", 4, 1)), _i.poids(), _i.objets)
_r = _i.retirer("A")
print("#B", _r is _a, _i.retirer("Z"), _i.objets, _i.poids(), type(_i.objets).__name__)`);
        if (t.err) return TESTERR(t);
        if (!/#A True False True 10 \(A, C\)/.test(t.out)) return 'Inventaire de 10 : A (6) passe, B (5) dépasserait (11), C (4) passe pile (10). Et <code>objets</code> renvoie <code>(A, C)</code> grâce au <code>__repr__</code>.';
        if (!/#B True None \(C,\) 4 tuple/.test(t.out)) return '<code>retirer("A")</code> doit renvoyer l’objet A lui-même et l’enlever. <code>retirer("Z")</code> renvoie <code>None</code>.';
        return true;
      },
      ok:'L’inventaire fait respecter sa limite de poids, et ne laisse pas fuir sa liste.' },
    { t:'code', carry:1, h:'Étape 2 : le Héros', file:'inventaire.py', mem:1,
      p:`<p>Ajoute la classe <code>Heros</code> : <code>nom</code>, <code>force</code>, <code>po</code>. Il <strong>crée</strong> son inventaire avec un poids maximum de <code>force * 2</code> (composition), et son <code>arme</code> vaut <code>None</code> au départ.</p><ul><li><code>ramasser(objet)</code> délègue à l'inventaire ;</li><li><code>equiper(nom)</code> retire l'objet de l'inventaire et le met dans <code>arme</code>. S'il avait déjà une arme, elle retourne dans l'inventaire. Renvoie <code>False</code> si l'objet n'est pas dans l'inventaire.</li></ul>`,
      code:`# Étape 2 : la classe Heros
`,
      sol: I1 + I2,
      hints:['Constructeur : <code>self.inventaire = Inventaire(force * 2)</code> et <code>self.arme = None</code>. <code>ramasser</code> : <code>return self.inventaire.ajouter(objet)</code>.','<code>equiper</code> : <code>objet = self.inventaire.retirer(nom)</code> ; si None, <code>return False</code> ; si une arme est déjà là, <code>self.inventaire.ajouter(self.arme)</code> ; puis <code>self.arme = objet</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
_h = Heros("H", 5, 0)
_g = Heros("G", 5, 0)
print("#A", _h.inventaire is _g.inventaire, _h.arme, _h.ramasser(Objet("Dague", 3, 1)), _h.ramasser(Objet("Hache", 8, 1)), _h.ramasser(Objet("Arc", 4, 1)))
print("#B", _h.equiper("Zzz"), _h.equiper("Dague"), _h.arme, _h.inventaire.objets)
print("#C", _h.equiper("Arc"), _h.arme, _h.inventaire.objets)`);
        if (t.err) return TESTERR(t);
        if (!/#A False None True False True/.test(t.out)) return 'Chaque héros crée son propre inventaire (force 5 → 10 kg max) : la dague (3) passe, la hache (8) dépasserait, l’arc (4) passe. Et pas d’arme au départ.';
        if (!/#B False True Dague \(Arc,\)/.test(t.out)) return '<code>equiper</code> renvoie False pour un objet absent. Équiper la dague la sort de l’inventaire.';
        if (!/#C True Arc \(Dague,\)/.test(t.out)) return 'En équipant l’arc, l’ancienne arme (la dague) doit retourner dans l’inventaire.';
        return true;
      },
      ok:'Le héros délègue le rangement à son inventaire, qu’il est seul à posséder.' },
    { t:'code', carry:1, h:'Étape 3 : le Marchand', file:'inventaire.py', mem:1,
      p:`<p>Ajoute la classe <code>Marchand</code> : il reçoit une liste <code>stock</code> d'objets. Sa méthode <code>vendre(heros, nom)</code> (le héros est un simple paramètre : dépendance) :</p><ul><li>renvoie <code>Je n'ai pas ça.</code> si l'objet n'est pas en stock ;</li><li><code>Pas assez d'or.</code> si le héros n'a pas assez de <code>po</code> ;</li><li><code>Trop lourd !</code> si le héros ne peut pas le ramasser ;</li><li>sinon, le héros paie, l'objet quitte le stock, et la méthode renvoie <code>Sam achète Épée.</code></li></ul>`,
      code:`# Étape 3 : la classe Marchand
`,
      sol: I1 + I2 + I3,
      hints:['Cherche l’objet dans <code>self._stock</code> avec une boucle. Vérifie d’abord l’or, puis <code>heros.ramasser(o)</code> (qui ajoute l’objet s’il passe).','Si tout va bien : <code>heros.po -= o.prix</code>, <code>self._stock.remove(o)</code>, puis <code>return f"{heros.nom} achète {nom}."</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
_m = Marchand([Objet("A", 1, 10), Objet("Lourd", 99, 1), Objet("Cher", 1, 500)])
_h = Heros("H", 5, 20)
print("#A", _m.vendre(_h, "Rien"), "|", _m.vendre(_h, "Cher"), "|", _m.vendre(_h, "Lourd"), "|", _h.po, _h.inventaire.objets)
print("#B", _m.vendre(_h, "A"), "|", _h.po, _h.inventaire.objets, _m.vendre(_h, "A"))`);
        if (t.err) return TESTERR(t);
        if (!/#A Je n'ai pas ça\. \| Pas assez d'or\. \| Trop lourd ! \| 20 \(\)/.test(t.out)) return 'Vérifie les trois refus (objet absent, pas assez d’or, trop lourd). Un refus ne doit coûter aucune pièce ni ajouter d’objet.';
        if (!/#B H achète A\. \| 10 \(A,\) Je n'ai pas ça\./.test(t.out)) return 'Une vente réussie : le héros paie, reçoit l’objet, et l’objet quitte le stock du marchand (on ne peut pas l’acheter deux fois).';
        return true;
      },
      ok:'Le marchand ne garde aucune référence au héros : il l’utilise le temps de la vente. C’est la relation la plus légère.' },
    { t:'code', carry:1, h:'Étape 4 : une journée au marché', file:'inventaire.py',
      p:`<p>Joue la scène : un marchand avec une Épée (poids 6, prix 40), une Enclume (30, 5) et un Arc (4, 70). Sam a une force de 8 et 60 pièces. Il essaie d'acheter l'Épée, l'Enclume, l'Arc, puis un Dragon. Affiche chaque réponse du marchand. Ensuite, Sam équipe l'Épée, et tu affiches <code>sam.arme</code>, <code>sam.inventaire.objets</code> et <code>sam.po</code>.</p>`,
      code:`# Étape 4 : la scène au marché
`,
      sol: I1 + I2 + I3 + I4,
      hints:['<code>marchand = Marchand([Objet("Épée", 6, 40), ...])</code> et <code>sam = Heros("Sam", 8, 60)</code>.','Quatre <code>print(marchand.vendre(sam, "..."))</code>, puis <code>sam.equiper("Épée")</code> et <code>print(sam.arme, sam.inventaire.objets, sam.po)</code>.'],
      check:r => {
        if (r.err) return ERR;
        const want = ['Sam achète Épée.', 'Trop lourd !', "Pas assez d'or.", "Je n'ai pas ça.", 'Épée () 20'];
        const l = linesOf(r.out);
        for (const [i, w] of want.entries()) if (l[i] !== w) return `La ligne ${i + 1} devrait être <code>${esc(w)}</code>${l[i] ? `, mais j’ai <code>${esc(l[i])}</code>` : ''}.`;
        return true;
      },
      ok:'Composition, agrégation, association, dépendance : les quatre relations du chapitre travaillent ensemble dans ton programme.' },
    { t:'compare', h:'La composition en Java',
      p:`<p>En Java, la composition se voit à l'attribut <code>private final</code> créé dans le constructeur. L'association avec l'arme est un attribut qui peut valoir <code>null</code>.</p>`,
      py: I2.trim(),
      java:`public class Heros {
    private final String nom;
    private int po;
    private final Inventaire inventaire;   // composition
    private Objet arme;                    // association 0..1

    public Heros(String nom, int force, int po) {
        this.nom = nom;
        this.po = po;
        this.inventaire = new Inventaire(force * 2);
        this.arme = null;
    }

    public boolean ramasser(Objet o) {
        return inventaire.ajouter(o);      // délégation
    }

    public boolean equiper(String nom) {
        Objet o = inventaire.retirer(nom);
        if (o == null) return false;
        if (arme != null) inventaire.ajouter(arme);
        arme = o;
        return true;
    }
}`,
      notes:['<code>final</code> sur <code>inventaire</code> : le héros garde le même inventaire toute sa vie.','<code>retirer</code> renvoie <code>null</code> quand l’objet n’est pas là : on teste avec <code>== null</code>.'] },
    { t:'say', h:'Mini-défi dans VS Code',
      p:`<p>Écris le projet en Java (une classe par fichier). Dans <code>Inventaire</code>, utilise une <code>ArrayList&lt;Objet&gt;</code>, et pour la propriété <code>objets</code>, renvoie <code>List.copyOf(objets)</code>.</p><p>Bonus UML : installe l'extension <em>PlantUML</em> ou <em>Draw.io Integration</em> dans VS Code, et dessine le diagramme de ton projet. Compare-le avec celui du début de la leçon.</p>` }
  ],
  recap:['Composition : le héros crée son inventaire (<code>Inventaire(force * 2)</code>) et lui délègue le rangement.','Agrégation : l’inventaire et le stock regroupent des objets qui existent sans eux.','Association 0..1 : l’arme, qui peut valoir <code>None</code> / <code>null</code>.','Dépendance : le marchand utilise le héros seulement dans <code>vendre</code>.','Chaque classe garde ses règles (poids max, or suffisant) et ne laisse pas fuir ses listes.'] };

Atelier.chapter({ part:"poo", n:8, title:"Relations entre objets et UML",
  lessons:['p8-1','p8-2','p8-3','p8-4','p8-5'].map(id => ({ id, ...LES[id] })) });
})();
