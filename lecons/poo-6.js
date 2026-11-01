/* Partie POO · Chapitre 6 : Polymorphisme */
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has } = Atelier.h;
const LES = {};
const attr = (r, o, a) => { const m = memOf(r, o); const x = m && m.attrs && m.attrs.find(t => t.name === a); return x ? x.repr : undefined; };
const same = (code, start) => code.trim() === start.trim();
const START = 'Voilà le bug ! Exécute, lis ce qui se passe, puis corrige le code.';
const TESTERR = t => 'Mes tests font planter ton code : ' + esc(t.err.title) + '. Vérifie les noms de tes classes, de tes méthodes et de leurs paramètres.';

const FAMILLE = `class Personnage:
    def __init__(self, nom):
        self.nom = nom

    def action(self):
        return f"{self.nom} attend."

class Guerrier(Personnage):
    def action(self):
        return f"{self.nom} frappe à l'épée !"

class Mage(Personnage):
    def action(self):
        return f"{self.nom} lance une boule de feu !"

class Voleur(Personnage):
    def action(self):
        return f"{self.nom} attaque dans le dos !"
`;

/* ---------- 6.1 ---------- */
const BUG61 = `class Guerrier:
    def __init__(self, nom):
        self.nom = nom

class Mage:
    def __init__(self, nom):
        self.nom = nom

class Archer:
    def __init__(self, nom):
        self.nom = nom

def portee(perso):
    if isinstance(perso, Guerrier):
        return 1
    elif isinstance(perso, Mage):
        return 5

for p in [Guerrier("Conan"), Mage("Merlin"), Archer("Robin")]:
    print(p.nom, "a une portée de", portee(p) * 2, "cases")`;
LES['p6-1'] = { title:'Un appel, plusieurs comportements', dur:'14 min',
  intro:'Tu l’as vu à la fin du chapitre 5 : le même appel h.attaquer(ogre) ne fait pas la même chose pour Conan et pour Merlin. Ça a un nom, le polymorphisme, et c’est sans doute l’idée la plus puissante de la POO.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur le chapitre d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`class A:
    def qui(self):
        return "A"
    def dire(self):
        return "Je suis " + self.qui()

class B(A):
    def qui(self):
        return "B"

print(B().dire())`,
      opts:[ {l:'Je suis A', why:'<code>dire</code> est dans A, mais <code>self</code> est un objet B : <code>self.qui()</code> trouve d’abord la version de B.'},
             {l:'Je suis B', ok:1},
             {l:'Une erreur', why:'B hérite de <code>dire</code>, tout va bien.'},
             {l:'Je suis AB', why:'B remplace <code>qui</code>, il ne s’ajoute pas à A.'} ],
      ex:'Python cherche la méthode à partir de la classe de l’objet. C’est exactement ce mécanisme qu’on va exploiter.' },
    { t:'say', h:'Poly-morphisme : plusieurs formes', file:'poly.py',
      p:`<p>Le <strong>polymorphisme</strong> (<em>polymorphism</em>, « plusieurs formes ») : un même appel produit un comportement différent selon l'objet qui le reçoit.</p><p>La boucle ne sait pas, et n'a pas besoin de savoir, si <code>p</code> est un Guerrier ou un Mage. Elle envoie le message <code>action()</code>, et chaque objet répond avec <strong>sa</strong> version.</p>`,
      code: FAMILLE + `
equipe = [Guerrier("Conan"), Mage("Merlin"), Voleur("Robin"), Personnage("Paysan")]
for p in equipe:
    print(p.action())` },
    { t:'say', h:'Un paramètre polymorphe', file:'parametre.py',
      p:`<p>Une fonction (ou une méthode) qui attend un <code>Personnage</code> accepte aussi n'importe quel objet d'une classe fille. Elle est écrite <strong>une seule fois</strong>, et marche pour toutes les classes de la famille, même celles qui n'existent pas encore.</p><p>Ajoute une classe <code>Barde</code> avec sa propre <code>action</code> : <code>annoncer</code> marchera sans changer une ligne.</p>`,
      code: FAMILLE + `
def annoncer(perso):
    print(">>> Au tour de", perso.nom)
    print(perso.action())

annoncer(Mage("Merlin"))
annoncer(Voleur("Robin"))` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Avec les classes ci-dessus, qu'affiche ce code ?</p>`, snip:`class Archimage(Mage):
    pass

annoncer(Archimage("Gandalf"))`,
      opts:[ {l:'>>> Au tour de Gandalf, puis Gandalf attend.', why:'Archimage hérite de Mage, pas directement de Personnage : il prend l’<code>action</code> de Mage.'},
             {l:'>>> Au tour de Gandalf, puis Gandalf lance une boule de feu !', ok:1},
             {l:'Une erreur : annoncer attend un Personnage', why:'Un Archimage est un Mage, donc un Personnage. Et Python ne vérifie de toute façon pas les types des paramètres.'},
             {l:'Une erreur : Archimage n’a pas de méthode action', why:'Il en hérite de Mage.'} ],
      ex:'Python cherche <code>action</code> dans Archimage, puis dans Mage : trouvée ! Le polymorphisme marche sur toute la hiérarchie.' },
    { t:'say', h:'Les trois sortes de polymorphisme',
      p:`<p>Les cours distinguent souvent trois sortes :</p><ul><li>le polymorphisme <strong>de sous-type</strong> (<em>subtype polymorphism</em>) : celui de cette leçon, grâce à l'héritage et à la redéfinition. C'est le plus important en POO.</li><li>le polymorphisme <strong>ad hoc</strong> : la <strong>surcharge</strong> (même nom, paramètres différents) et les opérateurs (<code>+</code> additionne des nombres, colle des textes). Leçons 6.3 et 6.4.</li><li>le polymorphisme <strong>paramétrique</strong> : les <strong>génériques</strong>, comme <code>ArrayList&lt;Heros&gt;</code>. Chapitre 9.</li></ul>` },
    { t:'say', h:'Remplacer les if par du polymorphisme', file:'sans_if.py',
      p:`<p>Sans polymorphisme, on écrit des cascades de <code>if isinstance(...)</code>. À chaque nouvelle classe, il faut retrouver <strong>tous</strong> ces <code>if</code> dans le programme et en ajouter un. On en oublie forcément.</p><p>Avec le polymorphisme, chaque classe porte sa propre réponse. Ajouter une classe, c'est ajouter du code, sans modifier celui qui existe. Compare les deux versions.</p>`,
      code:`# Version à éviter : la fonction connaît toutes les classes
def cout_sort_v1(perso):
    if perso["classe"] == "mage":
        return 10
    elif perso["classe"] == "pretre":
        return 6
    return 0

# Version polymorphe : chaque classe répond elle-même
class Lanceur:
    def cout_sort(self):
        return 0

class Mage(Lanceur):
    def cout_sort(self):
        return 10

class Pretre(Lanceur):
    def cout_sort(self):
        return 6

print(cout_sort_v1({"classe": "mage"}))
for p in [Mage(), Pretre(), Lanceur()]:
    print(type(p).__name__, ":", p.cout_sort())` },
    { t:'code', bug:1, h:'La portée oubliée', file:'bug.py',
      p:`<p>Ce code plante dès qu'il arrive à l'Archer : la fonction <code>portee</code> a oublié ce cas. Répare-le <strong>avec du polymorphisme</strong> : chaque classe a une méthode <code>portee()</code> (Guerrier 1, Mage 5, Archer 8), et la fonction disparaît.</p>`,
      code: BUG61,
      sol:`class Guerrier:
    def __init__(self, nom):
        self.nom = nom

    def portee(self):
        return 1

class Mage:
    def __init__(self, nom):
        self.nom = nom

    def portee(self):
        return 5

class Archer:
    def __init__(self, nom):
        self.nom = nom

    def portee(self):
        return 8

for p in [Guerrier("Conan"), Mage("Merlin"), Archer("Robin")]:
    print(p.nom, "a une portée de", p.portee() * 2, "cases")`,
      hints:['Ajoute dans chaque classe une méthode <code>def portee(self):</code> qui renvoie son nombre.','Supprime la fonction <code>portee(perso)</code>, et dans la boucle, écris <code>p.portee()</code>.'],
      check:async (r, code, test) => {
        if (same(code, BUG61)) return START;
        if (r.err) return ERR;
        if (/isinstance/.test(strip(code))) return 'Plus de <code>isinstance</code> : chaque classe doit répondre elle-même avec sa méthode <code>portee()</code>.';
        if ((code.match(/def\s+portee\s*\(\s*self\s*\)/g) || []).length < 3) return 'Chaque classe doit avoir sa méthode <code>portee(self)</code>.';
        if (!/Conan a une portée de 2 cases/.test(r.out) || !/Merlin a une portée de 10 cases/.test(r.out) || !/Robin a une portée de 16 cases/.test(r.out)) return 'J’attends des portées de 2, 10 et 16 cases (portée × 2).';
        return true;
      },
      ok:'Plus de <code>if</code> sur les classes : demain, un Lancier n’aura qu’à définir sa propre <code>portee()</code>.' },
    { t:'code', h:'À toi : le cri de guerre de l’équipe', file:'cris.py',
      p:`<p>Écris une fonction <code>tour_de_parole(equipe)</code> qui reçoit une liste de personnages et <strong>renvoie une liste</strong> de textes : l'action de chacun. Elle ne doit contenir <strong>aucun</strong> <code>if</code> ni <code>isinstance</code>.</p><p>Ajoute aussi une classe <code>Barde(Personnage)</code> dont l'action est <code>NOM joue de la lyre.</code>, puis affiche le résultat pour une équipe de ton choix qui contient un Barde.</p>`,
      code: FAMILLE + `
`,
      sol: FAMILLE + `
class Barde(Personnage):
    def action(self):
        return f"{self.nom} joue de la lyre."

def tour_de_parole(equipe):
    textes = []
    for p in equipe:
        textes.append(p.action())
    return textes

print(tour_de_parole([Guerrier("Conan"), Barde("Orphée")]))`,
      hints:['La fonction : une liste vide, une boucle qui ajoute <code>p.action()</code>, puis <code>return</code> de la liste.','La classe : <code>class Barde(Personnage):</code> avec <code>def action(self): return f"{self.nom} joue de la lyre."</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const fn = (code.match(/def\s+tour_de_parole[\s\S]*?(?=\n\S|$)/) || [''])[0];
        if (!fn) return 'Il faut une fonction <code>tour_de_parole(equipe)</code>.';
        if (/\bif\b|isinstance/.test(fn)) return 'La fonction ne doit contenir ni <code>if</code> ni <code>isinstance</code> : laisse chaque objet répondre.';
        const t = await test([], code + '\nprint("#T", tour_de_parole([Mage("M"), Barde("B"), Personnage("P")]))');
        if (t.err) return TESTERR(t);
        if (!/#T \['M lance une boule de feu !', 'B joue de la lyre\.', 'P attend\.'\]/.test(t.out)) return 'Pour <code>[Mage("M"), Barde("B"), Personnage("P")]</code>, j’attends la liste <code>[\'M lance une boule de feu !\', \'B joue de la lyre.\', \'P attend.\']</code>.';
        return true;
      },
      ok:'Ta fonction ne connaît aucune classe en particulier, et pourtant elle marche avec toutes. Même avec le Barde, écrit après elle.' },
    { t:'code', defi:1, h:'Le calcul du butin', file:'butin.py',
      p:`<p>Chaque monstre vaut un butin différent. Crée une classe <code>Monstre</code> (attribut <code>niveau</code>) dont la méthode <code>butin()</code> renvoie <code>niveau * 10</code>, et deux classes filles :</p><ul><li><code>Dragon</code> : son butin est 5 fois celui d'un monstre ordinaire (réutilise <code>super().butin()</code>) ;</li><li><code>Squelette</code> : son butin vaut toujours 1.</li></ul><p>Écris enfin <code>total_butin(monstres)</code>, sans <code>if</code>, qui renvoie la somme des butins.</p>`,
      code:``,
      sol:`class Monstre:
    def __init__(self, niveau):
        self.niveau = niveau

    def butin(self):
        return self.niveau * 10

class Dragon(Monstre):
    def butin(self):
        return super().butin() * 5

class Squelette(Monstre):
    def butin(self):
        return 1

def total_butin(monstres):
    total = 0
    for m in monstres:
        total += m.butin()
    return total

print(total_butin([Monstre(2), Dragon(3), Squelette(50)]))`,
      hints:['Dragon : <code>return super().butin() * 5</code>. Squelette : <code>return 1</code>.','<code>total_butin</code> additionne <code>m.butin()</code> dans une boucle, sans se soucier du genre de monstre.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const fn = (code.match(/def\s+total_butin[\s\S]*?(?=\n\S|$)/) || [''])[0];
        if (!fn) return 'Il faut une fonction <code>total_butin(monstres)</code>.';
        if (/\bif\b|isinstance/.test(fn)) return '<code>total_butin</code> ne doit pas tester le genre des monstres.';
        if (!/super\(\)\.butin\s*\(/.test(code)) return 'Dans Dragon, réutilise <code>super().butin()</code>.';
        const t = await test([], code + '\nprint("#T", Monstre(4).butin(), Dragon(1).butin(), Squelette(99).butin(), total_butin([Dragon(2), Squelette(1), Monstre(1)]), total_butin([]))');
        if (t.err) return TESTERR(t);
        if (!/#T 40 50 1 111 0/.test(t.out)) return 'J’attends : Monstre(4) → 40, Dragon(1) → 50, Squelette(99) → 1, un total de 111 pour [Dragon(2), Squelette(1), Monstre(1)], et 0 pour une liste vide.';
        return true;
      },
      ok:'Le Dragon réutilise le calcul du parent, le Squelette le remplace, et la fonction de total ne voit que des monstres.' }
  ],
  recap:['<strong>Polymorphisme</strong> (<em>polymorphism</em>) : un même appel, un comportement différent selon l’objet.','Une fonction qui attend un <code>Personnage</code> marche avec toutes ses classes filles, même futures.','Remplace les cascades de <code>if isinstance(...)</code> par une méthode redéfinie dans chaque classe.','Trois sortes : de sous-type (héritage + redéfinition), ad hoc (surcharge, opérateurs), paramétrique (génériques).'] };

/* ---------- 6.2 ---------- */
LES['p6-2'] = { title:'Type statique et type dynamique', dur:'14 min',
  intro:'En Java, une variable de type Personnage peut contenir un Mage. Alors, qui décide de ce qu’on peut appeler, et de quelle version s’exécute ? Deux types, deux rôles. C’est LA question piège des examens de POO.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Pourquoi préfère-t-on une méthode redéfinie à une cascade de <code>if isinstance(...)</code> ?</p>`,
      opts:[ {l:'Parce que isinstance n’existe pas en Java', why:'Java a <code>instanceof</code>, l’équivalent. La raison est ailleurs.'},
             {l:'Parce qu’ajouter une classe ne demande alors pas de modifier le code existant', ok:1},
             {l:'Parce que c’est plus rapide à exécuter', why:'La vitesse n’est pas la vraie raison. C’est une question de facilité à faire évoluer le code.'},
             {l:'Parce que les if sont interdits en POO', why:'Les <code>if</code> ne sont pas interdits, seulement les <code>if</code> qui testent la classe d’un objet sont souvent un mauvais signe.'} ],
      ex:'Chaque classe porte sa réponse : on ajoute du code, sans chercher les <code>if</code> à modifier partout.' },
    { t:'compare', h:'Une référence parente vers un objet enfant',
      p:`<p>En Java, une variable déclarée avec le type parent peut contenir un objet d'une classe fille : « un Mage est un Personnage ». On parle de <strong>conversion vers le haut</strong> (<em>upcasting</em>), automatique.</p><p>En Python, la question ne se pose pas : une variable n'a pas de type, seul l'objet en a un.</p>`,
      py:`p = Mage("Merlin")      # p n'a pas de type
print(p.action())
p = Guerrier("Conan")   # on peut y mettre n'importe quoi`,
      java:`Personnage p = new Mage("Merlin");   // permis : un Mage est un Personnage
System.out.println(p.action());

Personnage[] equipe = {
    new Guerrier("Conan"),
    new Mage("Merlin")
};

Mage m = new Personnage("Paysan");   // erreur : un Personnage
                                     // n'est pas forcément un Mage`,
      notes:['La flèche marche dans un seul sens : d’enfant vers parent.','C’est grâce à ça qu’une liste <code>List&lt;Personnage&gt;</code> peut contenir des Guerriers et des Mages.'] },
    { t:'say', h:'Deux types pour une même variable',
      p:`<p>Dans <code>Personnage p = new Mage("Merlin");</code>, il y a deux types :</p><ul><li>le <strong>type statique</strong> (<em>static type</em>) : celui de la variable, écrit dans le code (<code>Personnage</code>). Le <strong>compilateur</strong> s'en sert pour vérifier ce qu'on a le droit d'appeler.</li><li>le <strong>type dynamique</strong> (<em>dynamic type</em>) : celui de l'objet réellement créé (<code>Mage</code>). À l'<strong>exécution</strong>, c'est lui qui décide quelle version d'une méthode redéfinie s'exécute.</li></ul><p>Ce choix de la version à l'exécution s'appelle la <strong>liaison dynamique</strong> (<em>dynamic dispatch</em>, ou <em>late binding</em>).</p>`,
      snip:`Personnage p = new Mage("Merlin");
p.action();        // compile ? oui : Personnage a une méthode action()
                   // quelle version ? celle de Mage (type dynamique)
p.lancerSort();    // compile ? NON : Personnage n'a pas lancerSort()
                   // même si l'objet est bien un Mage`, lang:'java' },
    { t:'quiz', lang:'java', h:'Quelle version ?', p:`<p>Qu'affiche ce code Java ?</p>`, snip:`class Personnage {
    public String action() { return "attend"; }
}
class Mage extends Personnage {
    @Override
    public String action() { return "lance un sort"; }
}

Personnage p = new Mage();
System.out.println(p.action());`,
      opts:[ {l:'attend', why:'Le type statique (Personnage) sert seulement au compilateur. À l’exécution, l’objet est un Mage.'},
             {l:'lance un sort', ok:1},
             {l:'Ça ne compile pas', why:'Personnage a bien une méthode <code>action()</code> : le compilateur accepte.'},
             {l:'Une ClassCastException', why:'Aucune conversion ici : on appelle juste une méthode redéfinie.'} ],
      ex:'Le compilateur vérifie avec le type statique (Personnage a <code>action</code>), puis la JVM exécute la version du type dynamique (Mage).' },
    { t:'quiz', lang:'java', h:'Ça compile ?', p:`<p>La classe <code>Mage</code> a une méthode <code>lancerSort()</code> que <code>Personnage</code> n'a pas. Que se passe-t-il ?</p>`, snip:`Personnage p = new Mage();
p.lancerSort();`,
      opts:[ {l:'Ça marche, car l’objet est un Mage', why:'Le compilateur ne regarde que le type de la variable. Pour lui, <code>p</code> est un Personnage, sans <code>lancerSort</code>.'},
             {l:'Erreur de compilation', ok:1},
             {l:'Erreur seulement à l’exécution', why:'Java refuse dès la compilation : c’est tout l’intérêt du typage statique.'},
             {l:'Ça appelle la version de Personnage', why:'Personnage n’a pas de version de <code>lancerSort</code>.'} ],
      ex:'Ce qu’on <strong>peut</strong> appeler dépend du type statique. Ce qui <strong>s’exécute</strong> dépend du type dynamique.' },
    { t:'compare', h:'Redescendre : le downcasting',
      p:`<p>Pour appeler <code>lancerSort()</code>, il faut convertir la référence vers le type enfant : c'est le <strong>downcasting</strong>. Il est risqué : si l'objet n'est pas vraiment un Mage, Java lève une <code>ClassCastException</code>. On vérifie donc d'abord avec <code>instanceof</code>.</p>`,
      py:`for p in equipe:
    if isinstance(p, Mage):
        p.lancer_sort()`,
      java:`for (Personnage p : equipe) {
    if (p instanceof Mage) {
        Mage m = (Mage) p;      // downcast
        m.lancerSort();
    }
}

// Java 16+ : en une ligne
if (p instanceof Mage m) {
    m.lancerSort();
}`,
      notes:['<code>(Mage) p</code> : on dit au compilateur « fais-moi confiance, c’est un Mage ».','Si c’est faux, <code>ClassCastException</code> à l’exécution.','Des downcasts partout sont un mauvais signe : souvent, une méthode redéfinie ferait mieux l’affaire.'] },
    { t:'quiz', lang:'java', h:'Le cast risqué', p:`<p>Que se passe-t-il ?</p>`, snip:`Personnage p = new Guerrier();
Mage m = (Mage) p;`,
      opts:[ {l:'Ça marche : m est un Mage', why:'L’objet est un Guerrier : on ne peut pas le transformer en Mage.'},
             {l:'Erreur de compilation', why:'Le compilateur accepte : un Personnage <em>pourrait</em> être un Mage. Il ne connaît pas l’objet réel.'},
             {l:'ClassCastException à l’exécution', ok:1},
             {l:'m vaut null', why:'Java ne renvoie pas null : il lève une exception.'} ],
      ex:'Le compilateur laisse passer, mais à l’exécution la JVM voit que l’objet est un Guerrier : <code>ClassCastException</code>.' },
    { t:'say', h:'Et en Python ?', file:'python_types.py',
      p:`<p>En Python, les variables n'ont <strong>pas</strong> de type statique : tout se décide à l'exécution. Si l'objet a la méthode, l'appel marche. Sinon, <code>AttributeError</code>. Pas besoin de cast.</p><p>(Les <em>annotations de type</em>, comme <code>def f(p: Personnage)</code>, ne sont que des indications pour les outils et les humains. Python ne les vérifie pas.)</p>`,
      code:`class Personnage:
    def action(self):
        return "attend"

class Mage(Personnage):
    def action(self):
        return "lance un sort"

    def lancer_sort(self):
        return "Boule de feu !"

def tour(p: Personnage):
    print(p.action())
    if isinstance(p, Mage):
        print(p.lancer_sort())

tour(Mage())
tour(Personnage())` },
    { t:'fill', lang:'java', h:'Le bon cast',
      p:`<p>Complète ce code Java qui fait lancer un sort à tous les mages de l'équipe, sans risque de <code>ClassCastException</code>.</p>`,
      tpl:`for ([[Personnage]] p : equipe) {
    if (p [[instanceof]] Mage) {
        Mage m = ([[Mage]]) p;
        m.lancerSort();
    }
}`,
      hints:['La variable de boucle a le type des éléments de la liste. Puis on teste le type réel, avant de convertir.','<code>Personnage</code>, <code>instanceof</code>, <code>Mage</code>.'],
      ok:'On vérifie avec <code>instanceof</code> avant de caster : plus de mauvaise surprise.' },
    { t:'code', h:'À toi : seulement les soigneurs', file:'soigneurs.py',
      p:`<p>Seuls les <code>Pretre</code> savent <code>soigner()</code>. Écris une fonction <code>soins(equipe)</code> qui renvoie la liste des textes renvoyés par <code>soigner()</code>, pour les prêtres seulement (utilise <code>isinstance</code>). Un <code>Archipretre</code> est aussi un prêtre.</p>`,
      code:`class Personnage:
    def __init__(self, nom):
        self.nom = nom

class Pretre(Personnage):
    def soigner(self):
        return self.nom + " soigne l'équipe"

class Archipretre(Pretre):
    def soigner(self):
        return self.nom + " ressuscite l'équipe"

class Guerrier(Personnage):
    pass

equipe = [Guerrier("Conan"), Pretre("Tuck"), Archipretre("Élise")]
`,
      sol:`class Personnage:
    def __init__(self, nom):
        self.nom = nom

class Pretre(Personnage):
    def soigner(self):
        return self.nom + " soigne l'équipe"

class Archipretre(Pretre):
    def soigner(self):
        return self.nom + " ressuscite l'équipe"

class Guerrier(Personnage):
    pass

def soins(equipe):
    textes = []
    for p in equipe:
        if isinstance(p, Pretre):
            textes.append(p.soigner())
    return textes

equipe = [Guerrier("Conan"), Pretre("Tuck"), Archipretre("Élise")]
print(soins(equipe))`,
      hints:['<code>isinstance(p, Pretre)</code> est vrai aussi pour un Archipretre : pas besoin de tester les deux.','Dans la boucle : <code>if isinstance(p, Pretre): textes.append(p.soigner())</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (/type\s*\(\s*p\s*\)\s*==/.test(code)) return '<code>type(p) == Pretre</code> oublierait les Archiprêtres : utilise <code>isinstance</code>.';
        const t = await test([], code + '\nprint("#T", soins([Archipretre("A"), Guerrier("G"), Pretre("P"), Personnage("X")]), soins([]))');
        if (t.err) return TESTERR(t);
        if (!/#T \["A ressuscite l'équipe", "P soigne l'équipe"\] \[\]/.test(t.out)) return 'Pour <code>[Archipretre("A"), Guerrier("G"), Pretre("P"), Personnage("X")]</code>, j’attends les soins de A (sa version à lui !) et de P, dans l’ordre.';
        return true;
      },
      ok:'<code>isinstance</code> respecte l’héritage, et le polymorphisme choisit la bonne version de <code>soigner</code>.' },
    { t:'code', defi:1, h:'Le duel de types', file:'duel.py',
      p:`<p>Sans exécuter, devine ce qu'affiche ce code. Puis exécute-le, et écris dans la variable <code>reponse</code> la liste des trois lignes affichées, dans l'ordre (des textes).</p>`,
      code:`class Arme:
    def nom(self):
        return "arme"
    def decrire(self):
        return "Une " + self.nom()

class Epee(Arme):
    def nom(self):
        return "épée"

class EpeeMagique(Epee):
    def decrire(self):
        return super().decrire() + " magique"

for a in [Arme(), Epee(), EpeeMagique()]:
    print(a.decrire())

reponse = []
`,
      sol:`class Arme:
    def nom(self):
        return "arme"
    def decrire(self):
        return "Une " + self.nom()

class Epee(Arme):
    def nom(self):
        return "épée"

class EpeeMagique(Epee):
    def decrire(self):
        return super().decrire() + " magique"

for a in [Arme(), Epee(), EpeeMagique()]:
    print(a.decrire())

reponse = ["Une arme", "Une épée", "Une épée magique"]`,
      hints:['Pour EpeeMagique : <code>super().decrire()</code> exécute le <code>decrire</code> d’Arme, mais <code>self</code> est toujours l’épée magique. Quel <code>nom()</code> est appelé ?','La dernière ligne est <code>Une épée magique</code>.'],
      check:r => {
        if (r.err) return ERR;
        const m = memOf(r, 'reponse');
        if (!m || m.type !== 'list') return 'Garde la variable <code>reponse</code>, et mets-y une liste de trois textes.';
        if (m.repr !== "['Une arme', 'Une épée', 'Une épée magique']") return 'Ce n’est pas encore ça. Recopie les trois lignes affichées, exactement, dans l’ordre.';
        return true;
      },
      ok:'Même via <code>super()</code>, <code>self.nom()</code> suit le type dynamique : c’est l’épée magique, donc le nom d’Epee. Si tu avais deviné avant d’exécuter, bravo !' }
  ],
  recap:['Java : <code>Personnage p = new Mage();</code> est permis (<em>upcasting</em>).','<strong>Type statique</strong> (la variable) : décide de ce qui compile. <strong>Type dynamique</strong> (l’objet) : décide de la version qui s’exécute (<em>dynamic dispatch</em>).','<strong>Downcasting</strong> <code>(Mage) p</code> : vérifie avant avec <code>instanceof</code>, sinon <code>ClassCastException</code>.','Python : pas de type statique, tout se décide à l’exécution. <code>isinstance</code> respecte l’héritage.'] };

/* ---------- 6.3 ---------- */
const BUG63 = `class Potion:
    def __init__(self, soin):
        self.soin = soin

class Heros:
    def __init__(self):
        self.pv = 50

    def boire(self, potion):
        self.pv += potion.soin

    def boire(self, potion, nombre):
        self.pv += potion.soin * nombre

sam = Heros()
sam.boire(Potion(10))
sam.boire(Potion(5), 3)
print(sam.pv)`;
LES['p6-3'] = { title:'Surcharge et redéfinition', dur:'14 min',
  intro:'Surcharge et redéfinition : deux mots qui se ressemblent, deux mécanismes très différents. L’un est choisi à la compilation, l’autre à l’exécution. Et Python n’a pas de surcharge du tout !',
  steps:[
    { t:'quiz', rev:1, lang:'java', h:'Une question sur la leçon d’avant', p:`<p>Dans <code>Personnage p = new Guerrier();</code>, quel est le type dynamique de <code>p</code> ?</p>`,
      opts:[ {l:'Personnage', why:'C’est le type statique : celui de la variable.'},
             {l:'Guerrier', ok:1},
             {l:'Object', why:'Object est un ancêtre, mais l’objet créé est un Guerrier.'},
             {l:'Aucun, Java n’a que des types statiques', why:'Les objets ont un type réel à l’exécution : c’est le type dynamique.'} ],
      ex:'Le type dynamique, c’est celui de l’objet créé avec <code>new</code> : Guerrier.' },
    { t:'compare', h:'La surcharge en Java',
      p:`<p>La <strong>surcharge</strong> (<em>overloading</em>) : plusieurs méthodes avec le <strong>même nom</strong> dans la même classe, mais des <strong>paramètres différents</strong> (en nombre ou en type). Java choisit celle qui correspond aux arguments.</p><p>Python ne permet pas ça : on utilise des valeurs par défaut, ou on teste le type.</p>`,
      py:`class Heros:
    def soigner(self, quantite=10, nombre=1):
        self.pv += quantite * nombre

sam.soigner()        # 10
sam.soigner(25)      # 25
sam.soigner(25, 2)   # 50`,
      java:`public class Heros {
    private int pv;

    public void soigner() {
        soigner(10);
    }

    public void soigner(int quantite) {
        pv += quantite;
    }

    public void soigner(int quantite, int nombre) {
        pv += quantite * nombre;
    }

    public void soigner(Potion p) {
        pv += p.getSoin();
    }
}`,
      notes:['Java distingue les méthodes par leur <strong>signature</strong> : le nom + la liste des types des paramètres.','Le type de retour seul ne suffit pas à distinguer deux méthodes.','Tu connais déjà une méthode très surchargée : <code>System.out.println</code> accepte un <code>int</code>, un <code>String</code>, un <code>double</code>…'] },
    { t:'quiz', lang:'java', h:'Quelle méthode ?', p:`<p>Avec la classe <code>Heros</code> Java ci-dessus, quelle méthode est appelée par <code>sam.soigner(5, 4);</code> ?</p>`,
      opts:[ {l:'soigner()', why:'Il y a deux arguments.'},
             {l:'soigner(int quantite)', why:'Cette version n’accepte qu’un argument.'},
             {l:'soigner(int quantite, int nombre)', ok:1},
             {l:'Erreur : soigner existe en plusieurs exemplaires', why:'C’est permis, tant que les paramètres diffèrent : c’est la surcharge.'} ],
      ex:'Deux <code>int</code> : Java choisit <code>soigner(int, int)</code>. Sam gagne 20 PV.' },
    { t:'say', h:'Surcharge : choisie à la compilation',
      p:`<p>Voici la grande différence, celle qu'on te demandera :</p><ul><li>la <strong>surcharge</strong> est résolue à la <strong>compilation</strong>, avec les <strong>types statiques</strong> des arguments ;</li><li>la <strong>redéfinition</strong> est résolue à l'<strong>exécution</strong>, avec le <strong>type dynamique</strong> de l'objet.</li></ul><p>Regarde ce piège : la variable <code>m</code> a le type statique <code>Monstre</code>, même si l'objet est un Dragon. Le compilateur choisit donc la surcharge pour <code>Monstre</code>.</p>`, lang:'java',
      snip:`class Chasseur {
    String viser(Monstre m) { return "vise un monstre"; }
    String viser(Dragon d)  { return "vise un dragon"; }
}

Chasseur c = new Chasseur();
Dragon d = new Dragon();
Monstre m = new Dragon();

c.viser(d);   // "vise un dragon"  (type statique : Dragon)
c.viser(m);   // "vise un monstre" (type statique : Monstre !)` },
    { t:'quiz', lang:'java', h:'Le grand piège', p:`<p>Qu'affiche la dernière ligne ?</p>`, snip:`class Monstre {
    String cri() { return "grr"; }
}
class Dragon extends Monstre {
    @Override String cri() { return "ROAR"; }
}
class Chasseur {
    String viser(Monstre m) { return "monstre qui fait " + m.cri(); }
    String viser(Dragon d)  { return "dragon qui fait " + d.cri(); }
}

Monstre m = new Dragon();
System.out.println(new Chasseur().viser(m));`,
      opts:[ {l:'dragon qui fait ROAR', why:'La surcharge est choisie à la compilation, avec le type statique de <code>m</code> : Monstre.'},
             {l:'monstre qui fait grr', why:'La surcharge choisie est bien <code>viser(Monstre)</code>, mais <code>m.cri()</code> est une redéfinition : c’est la version du Dragon qui s’exécute.'},
             {l:'monstre qui fait ROAR', ok:1},
             {l:'dragon qui fait grr', why:'Les deux choix sont inversés.'} ],
      ex:'Deux mécanismes dans une ligne : la surcharge <code>viser(Monstre)</code> est choisie à la compilation (type statique), puis la redéfinition <code>cri()</code> du Dragon s’exécute (type dynamique).' },
    { t:'say', h:'Python n’a pas de surcharge', file:'pas_de_surcharge.py',
      p:`<p>En Python, une classe est comme un dictionnaire de méthodes : si tu écris deux fois <code>def attaquer</code>, la seconde <strong>remplace</strong> la première. Pas d'erreur, pas d'avertissement.</p><p>Pour accepter plusieurs formes d'appel, on utilise des <strong>valeurs par défaut</strong>, ou on teste le type de l'argument.</p>`,
      code:`class Heros:
    def __init__(self):
        self.pv = 50

    def soigner(self, soin=10, nombre=1):
        if isinstance(soin, Potion):
            soin = soin.soin
        self.pv += soin * nombre

class Potion:
    def __init__(self, soin):
        self.soin = soin

sam = Heros()
sam.soigner()
sam.soigner(5, 2)
sam.soigner(Potion(30))
print(sam.pv)` },
    { t:'code', bug:1, h:'La surcharge fantôme', file:'bug.py', mem:1,
      p:`<p>Ce code, inspiré du Java, plante. Lis l'erreur : la première méthode <code>boire</code> a disparu ! Garde une <strong>seule</strong> méthode <code>boire(self, potion, nombre=1)</code> qui gère les deux cas.</p>`,
      code: BUG63,
      sol:`class Potion:
    def __init__(self, soin):
        self.soin = soin

class Heros:
    def __init__(self):
        self.pv = 50

    def boire(self, potion, nombre=1):
        self.pv += potion.soin * nombre

sam = Heros()
sam.boire(Potion(10))
sam.boire(Potion(5), 3)
print(sam.pv)`,
      hints:['La deuxième définition de <code>boire</code> a remplacé la première. Il n’en faut qu’une.','Supprime la première, et donne une valeur par défaut au paramètre : <code>def boire(self, potion, nombre=1):</code>.'],
      check:async (r, code, test) => {
        if (same(code, BUG63)) return START;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        if ((code.match(/def\s+boire/g) || []).length !== 1) return 'Garde une seule méthode <code>boire</code>.';
        if (attr(r, 'sam', 'pv') !== '75') return 'Sam doit finir à 75 PV : 50 + 10 + 5 × 3.';
        return true;
      },
      ok:'En Python, une valeur par défaut remplace souvent toute une famille de surcharges Java.' },
    { t:'fill', lang:'java', h:'Surcharge ou redéfinition ?',
      p:`<p>Complète ce code Java. La classe <code>Mage</code> <strong>redéfinit</strong> <code>attaquer()</code> et ajoute une <strong>surcharge</strong> avec un bonus.</p>`,
      tpl:`public class Mage extends Personnage {
    [[@Override]]
    public int attaquer() {
        return 3 * force;
    }

    public int attaquer([[int]] bonus) {
        return [[attaquer]]() + bonus;
    }
}`,
      hints:['La première méthode remplace celle du parent : une annotation le signale. La seconde a un paramètre de plus.','<code>@Override</code>, <code>int</code>, puis on réutilise la première avec <code>attaquer()</code>.'],
      ok:'Redéfinition avec <code>@Override</code> (mêmes paramètres), surcharge avec un paramètre de plus.' },
    { t:'code', h:'À toi : une méthode, plusieurs formes', file:'formes.py', mem:1,
      p:`<p>Écris dans <code>Heros</code> une méthode <code>equiper(self, arme)</code> qui accepte :</p><ul><li>un objet <code>Arme</code> : le héros range ses dégâts dans <code>self.degats</code> ;</li><li>un nombre (<code>int</code>) : c'est directement la valeur des dégâts.</li></ul><p>Dans les autres cas, elle lève <code>TypeError</code>. Crée <code>sam</code>, équipe-le d'une <code>Arme(14)</code>.</p>`,
      code:`class Arme:
    def __init__(self, degats):
        self.degats = degats

class Heros:
    def __init__(self):
        self.degats = 1
`,
      sol:`class Arme:
    def __init__(self, degats):
        self.degats = degats

class Heros:
    def __init__(self):
        self.degats = 1

    def equiper(self, arme):
        if isinstance(arme, Arme):
            self.degats = arme.degats
        elif isinstance(arme, int):
            self.degats = arme
        else:
            raise TypeError("arme inconnue")

sam = Heros()
sam.equiper(Arme(14))`,
      hints:['Teste le type de l’argument : <code>isinstance(arme, Arme)</code>, puis <code>isinstance(arme, int)</code>.','Sinon : <code>raise TypeError("arme inconnue")</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (attr(r, 'sam', 'degats') !== '14') return 'Après <code>sam.equiper(Arme(14))</code>, Sam doit avoir 14 dégâts.';
        const t = await test([], code + '\n_h = Heros()\n_h.equiper(7)\nprint("#A", _h.degats)\ntry:\n    _h.equiper("bâton")\n    print("#B PASSE")\nexcept TypeError:\n    print("#B ERREUR")');
        if (t.err) return TESTERR(t);
        if (!/#A 7/.test(t.out)) return 'Avec un nombre, <code>equiper(7)</code> doit mettre les dégâts à 7.';
        if (!/#B ERREUR/.test(t.out)) return 'Avec un texte, <code>equiper("bâton")</code> doit lever une <code>TypeError</code>.';
        return true;
      },
      ok:'Une seule méthode qui s’adapte au type de l’argument : c’est la façon Python de faire de la « surcharge ».' },
    { t:'code', defi:1, h:'Prédis les choix de Java', file:'java_choix.py',
      p:`<p>Lis ce code Java, puis range dans la variable <code>lignes</code> la liste des 3 textes qu'il affiche, dans l'ordre.</p><pre class="snippet">class Sort { String nom() { return "sort"; } }
class Feu extends Sort { @Override String nom() { return "feu"; } }

class Grimoire {
    String lire(Sort s) { return "lit un " + s.nom(); }
    String lire(Feu f)  { return "brûle avec " + f.nom(); }
}

Grimoire g = new Grimoire();
Sort a = new Feu();
Feu b = new Feu();
Sort c = new Sort();
System.out.println(g.lire(a));
System.out.println(g.lire(b));
System.out.println(g.lire(c));</pre>`,
      code:`lignes = []
`,
      sol:`lignes = ["lit un feu", "brûle avec feu", "lit un sort"]`,
      hints:['Pour chaque appel : la surcharge de <code>lire</code> dépend du type <strong>déclaré</strong> de la variable. Le <code>nom()</code> dépend de l’objet réel.','<code>a</code> est déclaré <code>Sort</code> mais contient un Feu : <code>lire(Sort)</code> est choisie, puis <code>nom()</code> du Feu.'],
      check:r => {
        if (r.err) return ERR;
        const m = memOf(r, 'lignes');
        if (!m || m.type !== 'list') return 'Range les trois textes dans la liste <code>lignes</code>.';
        const v = m.repr;
        if (v === "['lit un feu', 'brûle avec feu', 'lit un sort']") return true;
        if (/brûle avec feu', 'brûle avec feu/.test(v)) return 'Pour <code>g.lire(a)</code> : <code>a</code> est déclaré <code>Sort</code>. La surcharge se choisit avec ce type statique.';
        if (/lit un sort', '/.test(v) && /^\['lit un sort'/.test(v)) return 'Pour <code>g.lire(a)</code> : la surcharge <code>lire(Sort)</code> est bien choisie, mais <code>s.nom()</code> est une redéfinition, et l’objet est un Feu.';
        return 'Pas encore. Pour chaque ligne, sépare les deux choix : la surcharge (type déclaré de la variable), puis la redéfinition (objet réel).';
      },
      ok:'Tu sais maintenant démêler surcharge et redéfinition dans la même ligne. C’est exactement le genre de question qui tombe aux examens.' }
  ],
  recap:['<strong>Surcharge</strong> (<em>overloading</em>, Java) : même nom, paramètres différents, dans la même classe. Choisie à la <strong>compilation</strong>, avec les types <strong>statiques</strong>.','<strong>Redéfinition</strong> (<em>overriding</em>) : même signature dans une classe fille. Choisie à l’<strong>exécution</strong>, avec le type <strong>dynamique</strong>.','Python n’a pas de surcharge : une deuxième définition remplace la première. On utilise des valeurs par défaut ou <code>isinstance</code>.','Une signature Java = nom + types des paramètres (pas le type de retour).'] };

/* ---------- 6.4 ---------- */
const BUG64 = `class Bourse:
    def __init__(self, po):
        self.po = po

    def __add__(self, autre):
        self.po += autre.po
        return self

a = Bourse(10)
b = Bourse(5)
total = a + b
print("Total :", total.po)
print("a contient encore :", a.po)`;
LES['p6-4'] = { title:'Duck typing et méthodes spéciales', dur:'15 min',
  intro:'En Python, pas besoin d’héritage pour être polymorphe : si un objet a la bonne méthode, ça marche. Et avec les méthodes spéciales, tes objets peuvent même utiliser +, len() ou in.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Que se passe-t-il en Python si une classe définit deux méthodes <code>attaquer</code> avec des paramètres différents ?</p>`,
      opts:[ {l:'Python choisit selon les arguments, comme Java', why:'Python n’a pas de surcharge.'},
             {l:'Une erreur de syntaxe', why:'Python accepte sans broncher… c’est bien le problème.'},
             {l:'La seconde remplace la première', ok:1},
             {l:'Les deux sont fusionnées', why:'Rien n’est fusionné : la dernière définition gagne.'} ],
      ex:'La dernière définition écrase les autres. En Python, on utilise des valeurs par défaut à la place.' },
    { t:'say', h:'Si ça cancane comme un canard…', file:'duck.py',
      p:`<p>Le <strong>duck typing</strong> : « si ça marche comme un canard et que ça cancane comme un canard, alors c'est un canard ». Python ne demande pas la classe d'un objet, seulement s'il a la méthode qu'on appelle.</p><p>Ici, <code>Coffre</code>, <code>Porte</code> et <code>Grimoire</code> n'ont <strong>aucun parent commun</strong>. Pourtant, la fonction <code>ouvrir_tout</code> marche avec les trois.</p>`,
      code:`class Coffre:
    def ouvrir(self):
        return "Le coffre grince : 50 pièces !"

class Porte:
    def ouvrir(self):
        return "La porte s'ouvre sur un couloir sombre."

class Grimoire:
    def ouvrir(self):
        return "Les pages brillent..."

def ouvrir_tout(objets):
    for o in objets:
        print(o.ouvrir())

ouvrir_tout([Coffre(), Porte(), Grimoire()])` },
    { t:'compare', h:'Et en Java ?',
      p:`<p>Java n'a pas de duck typing : le compilateur exige que le type déclaré possède la méthode. Pour obtenir la même souplesse, on donne aux classes un type commun : une <strong>interface</strong> (chapitre 7).</p>`,
      py:`def ouvrir_tout(objets):
    for o in objets:
        print(o.ouvrir())   # tant que o a ouvrir()`,
      java:`interface Ouvrable {
    String ouvrir();
}

class Coffre implements Ouvrable {
    public String ouvrir() { return "50 pièces !"; }
}

static void ouvrirTout(List<Ouvrable> objets) {
    for (Ouvrable o : objets) {
        System.out.println(o.ouvrir());
    }
}`,
      notes:['Python vérifie à l’exécution : l’objet a-t-il la méthode ? Sinon, <code>AttributeError</code>.','Java vérifie à la compilation : le type déclaré a-t-il la méthode ?','L’interface Java écrit noir sur blanc le « contrat » que le duck typing laisse implicite.'] },
    { t:'say', h:'Le polymorphisme que tu utilises déjà', file:'builtin.py',
      p:`<p>Python est rempli de polymorphisme : <code>len()</code> marche sur du texte, des listes, des dictionnaires. <code>+</code> additionne des nombres, colle des textes, joint des listes. <code>for</code> parcourt tout ce qui se parcourt.</p><p>Le secret : chaque type définit des <strong>méthodes spéciales</strong>. <code>len(x)</code> appelle <code>x.__len__()</code>, et <code>a + b</code> appelle <code>a.__add__(b)</code>.</p>`,
      code:`print(len("dragon"), len([1, 2, 3]), len({"a": 1}))
print(3 + 4, "ab" + "cd", [1] + [2, 3])
print("dragon".__len__())
print((3).__add__(4))` },
    { t:'say', h:'Surcharger les opérateurs', file:'operateurs.py',
      p:`<p>En écrivant ces méthodes spéciales dans ta classe, tes objets fonctionnent avec les opérateurs. C'est la <strong>surcharge d'opérateurs</strong> (<em>operator overloading</em>) :</p><ul><li><code>__add__</code> pour <code>+</code>, <code>__mul__</code> pour <code>*</code></li><li><code>__len__</code> pour <code>len()</code>, <code>__contains__</code> pour <code>in</code></li><li><code>__eq__</code> pour <code>==</code>, <code>__lt__</code> pour <code>&lt;</code> (chapitre 4)</li></ul><p>Bonne pratique : <code>__add__</code> renvoie un <strong>nouvel</strong> objet, sans modifier les deux autres.</p>`,
      code:`class Bourse:
    def __init__(self, po):
        self.po = po

    def __add__(self, autre):
        return Bourse(self.po + autre.po)

    def __mul__(self, n):
        return Bourse(self.po * n)

    def __repr__(self):
        return f"Bourse({self.po})"

class Sac:
    def __init__(self, objets):
        self._objets = objets

    def __len__(self):
        return len(self._objets)

    def __contains__(self, objet):
        return objet in self._objets

print(Bourse(10) + Bourse(5))
print(Bourse(3) * 4)
sac = Sac(["corde", "torche"])
print(len(sac), "torche" in sac, "épée" in sac)` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Avec la classe <code>Bourse</code> ci-dessus, qu'affiche ce code ?</p>`, snip:`a = Bourse(2)
b = a + Bourse(3) + Bourse(4)
print(a, b)`,
      opts:[ {l:'Bourse(9) Bourse(9)', why:'<code>__add__</code> renvoie une nouvelle bourse : <code>a</code> n’est pas modifiée.'},
             {l:'Bourse(2) Bourse(9)', ok:1},
             {l:'Bourse(2) Bourse(5)', why:'Python enchaîne les <code>+</code> de gauche à droite : (2 + 3) + 4.'},
             {l:'Une erreur : on ne peut pas enchaîner', why:'<code>a + Bourse(3)</code> renvoie une Bourse, qui a elle aussi <code>__add__</code>.'} ],
      ex:'(a + Bourse(3)) donne Bourse(5), puis + Bourse(4) donne Bourse(9). Et <code>a</code> reste intacte.' },
    { t:'compare', h:'Et en Java ? Pas de surcharge d’opérateurs',
      p:`<p>Java ne permet pas de redéfinir les opérateurs. Le seul cas spécial est <code>+</code> avec des <code>String</code>. Pour additionner deux bourses, on écrit une méthode.</p>`,
      py:`total = a + b        # appelle a.__add__(b)
print(len(sac))      # appelle sac.__len__()`,
      java:`Bourse total = a.plus(b);
System.out.println(sac.taille());

// a + b         ne compile pas pour des objets
// (sauf String : "a" + "b")`,
      notes:['En Java, on choisit des noms de méthodes clairs : <code>plus</code>, <code>taille</code>, <code>contient</code>.','Les collections Java ont <code>size()</code> et <code>contains()</code> : c’est leur <code>len</code> et leur <code>in</code>.'] },
    { t:'code', bug:1, h:'L’addition qui vole', file:'bug.py',
      p:`<p>Ce code ne plante pas, mais il a un défaut sournois : additionner deux bourses <strong>modifie</strong> la première. Après <code>a + b</code>, <code>a</code> devrait encore contenir 10. Répare <code>__add__</code>.</p>`,
      code: BUG64,
      sol: BUG64.replace('        self.po += autre.po\n        return self', '        return Bourse(self.po + autre.po)'),
      hints:['<code>__add__</code> modifie <code>self</code>, puis le renvoie : <code>total</code> et <code>a</code> sont le même objet !','Renvoie un nouvel objet : <code>return Bourse(self.po + autre.po)</code>.'],
      check:(r, code) => {
        if (same(code, BUG64)) return START;
        if (r.err) return ERR;
        if (!/Total : 15/.test(r.out)) return 'Le total doit valoir 15.';
        if (!/a contient encore : 10/.test(r.out)) return '<code>a</code> doit encore contenir 10 après l’addition.';
        return true;
      },
      ok:'Quand tu écris <code>x = a + b</code> avec des nombres, ni a ni b ne changent. Tes objets doivent se comporter pareil.' },
    { t:'code', h:'À toi : l’équipe', file:'equipe.py',
      p:`<p>Écris une classe <code>Equipe</code> qui garde une liste de noms dans <code>_membres</code> (vide au départ), avec :</p><ul><li><code>recruter(nom)</code> qui ajoute un nom ;</li><li><code>__len__</code> : le nombre de membres ;</li><li><code>__contains__</code> : pour écrire <code>"Sam" in equipe</code> ;</li><li><code>__add__</code> : <code>e1 + e2</code> renvoie une <strong>nouvelle</strong> équipe avec les membres des deux.</li></ul>`,
      code:``,
      sol:`class Equipe:
    def __init__(self):
        self._membres = []

    def recruter(self, nom):
        self._membres.append(nom)

    def __len__(self):
        return len(self._membres)

    def __contains__(self, nom):
        return nom in self._membres

    def __add__(self, autre):
        nouvelle = Equipe()
        for nom in self._membres + autre._membres:
            nouvelle.recruter(nom)
        return nouvelle

e = Equipe()
e.recruter("Sam")
print(len(e), "Sam" in e)`,
      hints:['<code>__len__</code> renvoie <code>len(self._membres)</code>, <code>__contains__</code> renvoie <code>nom in self._membres</code>.','<code>__add__</code> crée <code>nouvelle = Equipe()</code>, y recrute les membres des deux équipes, puis la renvoie.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + '\n_a = Equipe()\n_a.recruter("A")\n_a.recruter("B")\n_b = Equipe()\n_b.recruter("C")\n_c = _a + _b\nprint("#T", len(_a), len(_b), len(_c), "C" in _c, "C" in _a, "Z" in _c, type(_c).__name__, len(Equipe()))');
        if (t.err) return TESTERR(t);
        if (!/#T 2 1 3 True False False Equipe 0/.test(t.out)) return 'Je teste deux équipes (A, B) et (C) : j’attends des tailles 2 et 1, une somme de taille 3 qui contient C, une équipe A inchangée, et une équipe vide de taille 0.';
        return true;
      },
      ok:'<code>len</code>, <code>in</code> et <code>+</code> marchent avec ton équipe comme avec une liste. Tes objets parlent le langage de Python.' },
    { t:'code', defi:1, h:'Comparer des cartes', file:'cartes.py',
      p:`<p>Dans le jeu de cartes de la taverne, une carte a une <code>valeur</code> (1 à 13). Écris la classe <code>Carte</code> avec :</p><ul><li><code>__eq__</code> et <code>__lt__</code> qui comparent les valeurs ;</li><li><code>__repr__</code> qui renvoie par exemple <code>Carte(7)</code>.</li></ul><p>Ensuite, sans écrire de boucle, affiche la plus forte carte de <code>main</code> avec <code>max()</code>, et la main triée avec <code>sorted()</code>.</p>`,
      code:`main = []
`,
      sol:`class Carte:
    def __init__(self, valeur):
        self.valeur = valeur

    def __eq__(self, autre):
        if not isinstance(autre, Carte):
            return NotImplemented
        return self.valeur == autre.valeur

    def __lt__(self, autre):
        return self.valeur < autre.valeur

    def __repr__(self):
        return f"Carte({self.valeur})"

main = [Carte(7), Carte(12), Carte(3)]
print(max(main))
print(sorted(main))`,
      hints:['<code>max</code> et <code>sorted</code> utilisent <code>&lt;</code>, donc ta méthode <code>__lt__</code>.','<code>def __lt__(self, autre): return self.valeur &lt; autre.valeur</code>, puis <code>print(max(main))</code> et <code>print(sorted(main))</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/max\s*\(/.test(code) || !/sorted\s*\(/.test(code)) return 'Utilise <code>max()</code> et <code>sorted()</code>.';
        const t = await test([], code + '\n_m = [Carte(5), Carte(1), Carte(13), Carte(5)]\nprint("#T", max(_m), sorted(_m), Carte(4) == Carte(4), Carte(4) == Carte(5), Carte(4) < Carte(9), Carte(2) == 2)');
        if (t.err) return TESTERR(t);
        if (!/#T Carte\(13\) \[Carte\(1\), Carte\(5\), Carte\(5\), Carte\(13\)\] True False True False/.test(t.out)) return 'Un test échoue : vérifie <code>__repr__</code> (<code>Carte(13)</code>), <code>__lt__</code>, et <code>__eq__</code> (avec <code>NotImplemented</code> si on compare à autre chose qu’une carte).';
        return true;
      },
      ok:'<code>max</code> et <code>sorted</code> ne connaissent pas ta classe, mais ils savent utiliser <code>&lt;</code>. Polymorphisme et duck typing main dans la main.' }
  ],
  recap:['<strong>Duck typing</strong> : en Python, un objet convient s’il a la bonne méthode, quel que soit son parent.','Java n’a pas de duck typing : on passe par une <strong>interface</strong> commune.','Méthodes spéciales : <code>__add__</code> (<code>+</code>), <code>__mul__</code> (<code>*</code>), <code>__len__</code> (<code>len</code>), <code>__contains__</code> (<code>in</code>), <code>__eq__</code>, <code>__lt__</code>.','<code>__add__</code> renvoie un nouvel objet, sans modifier les opérandes.','Java ne permet pas de surcharger les opérateurs (sauf <code>+</code> pour les <code>String</code>).'] };

/* ---------- 6.5 ---------- */
const C1 = `class Combattant:
    def __init__(self, nom, pv, vitesse):
        self.nom = nom
        self.pv = pv
        self.vitesse = vitesse

    def est_vivant(self):
        return self.pv > 0

    def recevoir(self, degats):
        self.pv = max(0, self.pv - degats)

    def agir(self, allies, ennemis):
        return f"{self.nom} attend."

    def __repr__(self):
        return f"{self.nom}:{self.pv}"`;
const C2 = `

def vivants(groupe):
    return [c for c in groupe if c.est_vivant()]

class Guerrier(Combattant):
    def agir(self, allies, ennemis):
        cible = vivants(ennemis)[0]
        cible.recevoir(12)
        return f"{self.nom} frappe {cible.nom} (12)"

class Mage(Combattant):
    def agir(self, allies, ennemis):
        for e in vivants(ennemis):
            e.recevoir(5)
        return f"{self.nom} embrase tous les ennemis (5)"

class Soigneur(Combattant):
    def agir(self, allies, ennemis):
        blesse = min(vivants(allies), key=lambda c: c.pv)
        blesse.pv += 10
        return f"{self.nom} soigne {blesse.nom} (+10)"`;
const C3 = `

def tour(heros, monstres):
    tous = sorted(heros + monstres, key=lambda c: c.vitesse, reverse=True)
    for c in tous:
        if not c.est_vivant():
            continue
        if c in heros:
            allies, ennemis = heros, monstres
        else:
            allies, ennemis = monstres, heros
        if vivants(ennemis):
            print(c.agir(allies, ennemis))`;
const C4 = `

class Gobelin(Combattant):
    def agir(self, allies, ennemis):
        cible = min(vivants(ennemis), key=lambda c: c.pv)
        cible.recevoir(8)
        return f"{self.nom} poignarde {cible.nom} (8)"

heros = [Guerrier("Conan", 60, 5), Mage("Merlin", 30, 8), Soigneur("Tuck", 40, 3)]
monstres = [Gobelin("Gob", 20, 6), Gobelin("Lin", 25, 4)]
tour(heros, monstres)
print(heros, monstres)`;
LES['p6-5'] = { title:'Projet : le tour de combat', dur:'20 min',
  intro:'Un vrai tour de combat de jeu de rôle : chacun agit à son tour, dans l’ordre de vitesse, et chaque classe fait quelque chose de différent. Le moteur, lui, ne connaît aucune classe en particulier.',
  steps:[
    { t:'say', h:'Le projet',
      p:`<p>Chaque combattant a une méthode <code>agir(allies, ennemis)</code> qui fait son action et renvoie un texte. Le moteur de combat trie tout le monde par vitesse, puis appelle <code>agir</code> sur chacun. Le polymorphisme fait le reste. Voici le tour qu'on veut obtenir :</p>`,
      snip:`Merlin embrase tous les ennemis (5)
Gob poignarde Merlin (8)
Conan frappe Gob (12)
Lin poignarde Merlin (8)
Tuck soigne Merlin (+10)
[Conan:60, Merlin:24, Tuck:40] [Gob:3, Lin:20]`,
      p2:`<p>Quatre étapes. Je reprends ton code à chaque fois.</p>` },
    { t:'code', h:'Étape 1 : le Combattant', file:'tour.py', mem:1,
      p:`<p>Écris la classe <code>Combattant</code> : <code>nom</code>, <code>pv</code>, <code>vitesse</code> ; <code>est_vivant()</code> ; <code>recevoir(degats)</code> (jamais sous 0) ; <code>agir(allies, ennemis)</code> qui renvoie <code>NOM attend.</code> ; et <code>__repr__</code> qui renvoie par exemple <code>Conan:60</code>.</p>`,
      code:``,
      sol: C1,
      hints:['Tu connais tout ça par cœur maintenant. <code>agir</code> reçoit deux listes, mais ne s’en sert pas encore.','<code>def __repr__(self): return f"{self.nom}:{self.pv}"</code>'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + '\n_c = Combattant("C", 10, 3)\n_c.recevoir(4)\nprint("#T", [_c], _c.agir([], []), _c.est_vivant(), _c.vitesse)\n_c.recevoir(50)\nprint("#U", _c.pv, _c.est_vivant())');
        if (t.err) return TESTERR(t);
        if (!/#T \[C:6\] C attend\. True 3/.test(t.out)) return 'Je crée <code>Combattant("C", 10, 3)</code> et lui inflige 4 : j’attends <code>[C:6]</code>, <code>C attend.</code>, vivant, et une vitesse de 3.';
        if (!/#U 0 False/.test(t.out)) return 'Les PV ne doivent pas descendre sous 0.';
        return true;
      },
      ok:'La classe de base est prête. Toutes les autres vont redéfinir <code>agir</code>.' },
    { t:'code', carry:1, h:'Étape 2 : trois façons d’agir', file:'tour.py', mem:1,
      p:`<p>Ajoute une fonction <code>vivants(groupe)</code> qui renvoie la liste des combattants vivants du groupe. Puis trois classes filles qui redéfinissent <code>agir</code> :</p><ul><li><code>Guerrier</code> : frappe le <strong>premier</strong> ennemi vivant de 12, et renvoie <code>Conan frappe Gob (12)</code> ;</li><li><code>Mage</code> : inflige 5 à <strong>tous</strong> les ennemis vivants, et renvoie <code>Merlin embrase tous les ennemis (5)</code> ;</li><li><code>Soigneur</code> : soigne de 10 l'allié vivant qui a le <strong>moins</strong> de PV, et renvoie <code>Tuck soigne Merlin (+10)</code>.</li></ul>`,
      code:`# Étape 2 : vivants() et les trois classes
`,
      sol: C1 + C2,
      hints:['<code>vivants</code> : <code>return [c for c in groupe if c.est_vivant()]</code>. Le premier ennemi vivant : <code>vivants(ennemis)[0]</code>.','Pour le soigneur : <code>min(vivants(allies), key=lambda c: c.pv)</code> donne l’allié le plus blessé.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
_a = Combattant("A", 0, 1)
_b = Combattant("B", 30, 1)
_c = Combattant("C", 20, 1)
print("#V", vivants([_a, _b, _c]))
print("#G", Guerrier("G", 50, 1).agir([], [_a, _b, _c]), [_b, _c])
print("#M", Mage("M", 50, 1).agir([], [_a, _b, _c]), [_a, _b, _c])
_s = Soigneur("S", 40, 1)
print("#S", _s.agir([_s, _a, _b, _c], []), [_s, _a, _b, _c])`);
        if (t.err) return TESTERR(t);
        if (!/#V \[B:30, C:20\]/.test(t.out)) return '<code>vivants</code> doit renvoyer seulement les combattants qui ont des PV.';
        if (!/#G G frappe B \(12\) \[B:18, C:20\]/.test(t.out)) return 'Le Guerrier doit frapper le premier ennemi <strong>vivant</strong> (ici B, car A est à 0 PV) et renvoyer <code>G frappe B (12)</code>.';
        if (!/#M M embrase tous les ennemis \(5\) \[A:0, B:13, C:15\]/.test(t.out)) return 'Le Mage doit infliger 5 à chaque ennemi vivant, et renvoyer <code>M embrase tous les ennemis (5)</code>.';
        if (!/#S S soigne B \(\+10\) \[S:40, A:0, B:23, C:15\]/.test(t.out)) return 'Le Soigneur doit soigner l’allié <strong>vivant</strong> le plus blessé (pas celui à 0 PV), de 10 PV.';
        return true;
      },
      ok:'Trois classes, trois comportements, une seule signature : <code>agir(allies, ennemis)</code>.' },
    { t:'code', carry:1, h:'Étape 3 : le moteur', file:'tour.py',
      p:`<p>Écris la fonction <code>tour(heros, monstres)</code> :</p><ol><li>elle trie <strong>tous</strong> les combattants (héros + monstres) par vitesse, du plus rapide au plus lent ;</li><li>pour chacun, s'il est encore vivant, elle détermine ses alliés et ses ennemis (s'il est dans <code>heros</code>, ses alliés sont les héros, sinon les monstres) ;</li><li>s'il reste au moins un ennemi vivant, elle affiche ce que renvoie <code>c.agir(allies, ennemis)</code>.</li></ol><p>Aucun <code>isinstance</code> : le moteur ne connaît pas les classes.</p>`,
      code:`# Étape 3 : la fonction tour
`,
      sol: C1 + C2 + C3,
      hints:['Le tri : <code>sorted(heros + monstres, key=lambda c: c.vitesse, reverse=True)</code>.','<code>if c in heros: allies, ennemis = heros, monstres</code>, sinon l’inverse. Puis <code>if vivants(ennemis): print(c.agir(allies, ennemis))</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const fn = (code.match(/def\s+tour[\s\S]*?(?=\n\S|$)/) || [''])[0];
        if (!fn) return 'Il faut une fonction <code>tour(heros, monstres)</code>.';
        if (/isinstance/.test(fn)) return 'Pas de <code>isinstance</code> dans le moteur : c’est le travail du polymorphisme.';
        const t = await test([], code + `
class _Cri(Combattant):
    def agir(self, allies, ennemis):
        return self.nom + " agit contre " + str(len(vivants(ennemis)))
_h = [_Cri("Lent", 5, 1), _Cri("Mort", 0, 99), _Cri("Vif", 5, 9)]
_m = [_Cri("Moyen", 5, 5)]
tour(_h, _m)
tour([_Cri("Seul", 5, 1)], [Combattant("K", 0, 1)])`);
        if (t.err) return TESTERR(t);
        const l = linesOf(t.out);
        if (l.join('|') !== 'Vif agit contre 1|Moyen agit contre 2|Lent agit contre 1') return 'Avec mes combattants de test, j’attends dans l’ordre : Vif (vitesse 9), Moyen (5), Lent (1). Le mort ne doit pas agir, chacun doit recevoir les bons ennemis, et personne n’agit s’il ne reste aucun ennemi vivant.';
        return true;
      },
      ok:'Ton moteur trie, distribue les rôles et laisse chaque combattant décider. Il ne connaît pas une seule classe fille.' },
    { t:'code', carry:1, h:'Étape 4 : un nouveau monstre et la bataille', file:'tour.py',
      p:`<p>Ajoute une classe <code>Gobelin(Combattant)</code> : il poignarde l'ennemi vivant qui a le <strong>moins</strong> de PV, lui inflige 8, et renvoie <code>Gob poignarde Merlin (8)</code>. Remarque : tu n'as rien à changer dans le moteur !</p><p>Puis lance la bataille : les héros Conan (Guerrier, 60 PV, vitesse 5), Merlin (Mage, 30, 8), Tuck (Soigneur, 40, 3), contre Gob (Gobelin, 20, 6) et Lin (Gobelin, 25, 4). Joue un tour, puis affiche les deux listes.</p>`,
      code:`# Étape 4 : le Gobelin et la bataille
`,
      sol: C1 + C2 + C3 + C4,
      hints:['Le Gobelin ressemble au Soigneur, mais il vise <code>min(vivants(ennemis), key=lambda c: c.pv)</code> et appelle <code>recevoir(8)</code>.','<code>heros = [Guerrier("Conan", 60, 5), ...]</code>, <code>monstres = [...]</code>, <code>tour(heros, monstres)</code>, puis <code>print(heros, monstres)</code>.'],
      check:r => {
        if (r.err) return ERR;
        const want = ['Merlin embrase tous les ennemis (5)', 'Gob poignarde Merlin (8)', 'Conan frappe Gob (12)', 'Lin poignarde Merlin (8)', 'Tuck soigne Merlin (+10)', '[Conan:60, Merlin:24, Tuck:40] [Gob:3, Lin:20]'];
        const l = linesOf(r.out);
        for (const [i, w] of want.entries()) if (l[i] !== w) return `La ligne ${i + 1} devrait être <code>${esc(w)}</code>${l[i] ? `, mais j’ai <code>${esc(l[i])}</code>` : ''}.`;
        return true;
      },
      ok:'Un nouveau monstre, zéro ligne changée dans le moteur. C’est la promesse du polymorphisme, et tu viens de la tenir. Au chapitre 7, on rendra ce contrat <code>agir</code> obligatoire.' },
    { t:'compare', h:'Le moteur en Java',
      p:`<p>En Java, la liste est déclarée avec le type <code>Combattant</code> (type statique), mais elle contient des Guerriers, des Mages… (types dynamiques). La boucle appelle <code>agir</code> : la liaison dynamique choisit la bonne version.</p>`,
      py: C3.trim(),
      java:`static void tour(List<Combattant> heros, List<Combattant> monstres) {
    List<Combattant> tous = new ArrayList<>(heros);
    tous.addAll(monstres);
    tous.sort((a, b) -> b.getVitesse() - a.getVitesse());

    for (Combattant c : tous) {
        if (!c.estVivant()) continue;
        List<Combattant> allies  = heros.contains(c) ? heros : monstres;
        List<Combattant> ennemis = heros.contains(c) ? monstres : heros;
        if (!vivants(ennemis).isEmpty()) {
            System.out.println(c.agir(allies, ennemis));
        }
    }
}`,
      notes:['<code>(a, b) -&gt; b.getVitesse() - a.getVitesse()</code> est une <em>lambda</em> Java : elle trie du plus rapide au plus lent.','<code>condition ? x : y</code> est le « if en une ligne » de Java (en Python : <code>x if condition else y</code>).','<code>c.agir(...)</code> : vérifié à la compilation avec le type <code>Combattant</code>, exécuté avec la version de l’objet réel.'] },
    { t:'say', h:'Mini-défi dans VS Code',
      p:`<p>Traduis le projet en Java : une classe <code>Combattant</code> avec une méthode <code>public String agir(List&lt;Combattant&gt; allies, List&lt;Combattant&gt; ennemis)</code>, et les classes filles avec <code>@Override</code>.</p><p>Puis ajoute une classe <code>Archer</code> qui frappe le <strong>dernier</strong> ennemi vivant. Vérifie que tu n'as rien à modifier dans <code>tour</code>. Si tu y arrives, tu as compris le polymorphisme.</p>` }
  ],
  recap:['Une méthode commune (<code>agir</code>) redéfinie dans chaque classe : le moteur l’appelle sans connaître les classes.','Ajouter un nouveau genre de combattant ne demande aucune modification du moteur.','<code>sorted(..., key=lambda c: c.vitesse, reverse=True)</code> trie par un attribut.','En Java : <code>List&lt;Combattant&gt;</code> (type statique) qui contient des objets de classes filles (types dynamiques), et la liaison dynamique choisit la bonne méthode.'] };

Atelier.chapter({ part:"poo", n:6, title:"Polymorphisme",
  lessons:['p6-1','p6-2','p6-3','p6-4','p6-5'].map(id => ({ id, ...LES[id] })) });
})();
