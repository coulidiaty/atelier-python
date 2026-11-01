/* Leçon de démonstration : montre chaque type d'étape utile en POO.
   Elle n'est chargée que par dev/demo.html, jamais par le vrai site. */
(() => {
const { ERR, memOf, strOf, esc } = Atelier.h;
const LES = {};
LES['p0-1'] = { title:'Démo : une classe Personnage', dur:'5 min',
  intro:'Cette leçon de démonstration montre tous les types d’étapes disponibles pour la POO.',
  steps:[
    { t:'say', h:'Une classe, c’est un plan', file:'personnage.py', mem:1,
      p:`<p>Une <strong>classe</strong> (<em>class</em>) est un plan. Avec ce plan, on fabrique des <strong>objets</strong> (<em>instances</em>). Exécute, puis regarde la mémoire : l'objet <code>heros</code> montre ses attributs.</p>`,
      code:`class Personnage:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

    def __str__(self):
        return f"{self.nom} ({self.pv} PV)"

heros = Personnage("Sam", 100)
print(heros)` },
    { t:'compare', h:'La même classe en Java',
      p:`<p>En Java, on déclare le <strong>type</strong> de chaque attribut, le constructeur porte le nom de la classe, et <code>this</code> remplace <code>self</code>.</p>`,
      py:`class Personnage:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

heros = Personnage("Sam", 100)`,
      java:`public class Personnage {
    private String nom;
    private int pv;

    public Personnage(String nom, int pv) {
        this.nom = nom;
        this.pv = pv;
    }
}

Personnage heros = new Personnage("Sam", 100);`,
      notes:['<code>__init__</code> devient un <strong>constructeur</strong> qui porte le nom de la classe.','<code>self</code> devient <code>this</code>, et il n’est pas écrit dans les paramètres.','Java demande le type de chaque attribut (<code>String</code>, <code>int</code>) et le mot <code>new</code> pour créer un objet.'] },
    { t:'quiz', h:'Repère l’erreur Java', p:`<p>Ce code Java ne compile pas. Pourquoi ?</p>`, lang:'java',
      snip:`Personnage heros = Personnage("Sam", 100);`,
      opts:[ {l:'Il manque new', ok:1},
             {l:'Il manque self', why:'<code>self</code> n’existe pas en Java : c’est <code>this</code>, et on ne l’écrit pas ici.'},
             {l:'Les guillemets doivent être simples', why:'En Java, le texte (<code>String</code>) se met entre guillemets doubles.'},
             {l:'Rien, il compile', why:'Java exige le mot <code>new</code> pour créer un objet.'} ],
      ex:'En Java, on crée un objet avec <code>new Personnage("Sam", 100)</code>.' },
    { t:'fill', lang:'java', h:'Complète la classe Java',
      p:`<p>Remplis les trous pour que cette classe Java corresponde à la version Python.</p>`,
      tpl:`public class Personnage {
    private [[String]] nom;
    private [[int]] pv;

    public [[Personnage]](String nom, int pv) {
        [[this]].nom = nom;
        this.pv = pv;
    }
}`,
      hints:['Le texte en Java, c’est <code>String</code>, avec une majuscule. Un entier, c’est <code>int</code>.','Le constructeur porte le nom de la classe, et <code>this</code> remplace <code>self</code>.'],
      ok:'Ta classe Java est correcte.' },
    { t:'code', h:'À toi : ajoute une méthode', file:'soin.py', mem:1,
      p:`<p>Ajoute une méthode <code>soigner(self, n)</code> qui ajoute <code>n</code> points de vie. Puis soigne <code>heros</code> de 20 et affiche-le.</p>`,
      code:`class Personnage:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

    def __str__(self):
        return f"{self.nom} ({self.pv} PV)"

heros = Personnage("Sam", 100)
`,
      sol:`class Personnage:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

    def __str__(self):
        return f"{self.nom} ({self.pv} PV)"

    def soigner(self, n):
        self.pv += n

heros = Personnage("Sam", 100)
heros.soigner(20)
print(heros)`,
      hints:['Une méthode s’écrit dans la classe, décalée de 4 espaces, avec <code>self</code> en premier paramètre.','<code>def soigner(self, n):</code> puis <code>self.pv += n</code>. Ensuite, <code>heros.soigner(20)</code>.'],
      check:(r, code, test) => {
        if (r.err) return ERR;
        const h = memOf(r, 'heros');
        if (!h || !h.attrs) return 'Garde l’objet <code>heros</code>.';
        const pv = h.attrs.find(a => a.name === 'pv');
        if (!/def\s+soigner\s*\(\s*self\s*,/.test(code)) return 'Il faut une méthode <code>soigner(self, n)</code> dans la classe.';
        if (!pv || pv.repr !== '120') return `heros a ${pv ? esc(pv.repr) : '?'} PV. Après un soin de 20, il devrait en avoir 120.`;
        if (!/Sam \(120 PV\)/.test(r.out)) return 'Affiche <code>heros</code> avec <code>print()</code>.';
        return true;
      },
      ok:'Ta première méthode ! Regarde la mémoire : l’attribut pv est passé à 120.' }
  ],
  recap:['Une classe est un plan, un objet est fabriqué à partir de ce plan.','<code>__init__</code> (Python) et le constructeur (Java) initialisent les attributs.','<code>self</code> en Python, <code>this</code> en Java : l’objet lui-même.'] };

Atelier.chapter({ part:'poo', n:0, title:'Démo', lessons:['p0-1'].map(id => ({ id, ...LES[id] })), plan:[] });
})();
