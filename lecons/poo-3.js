/* Partie POO · Chapitre 3 : Encapsulation */
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has } = Atelier.h;
const LES = {};
const attr = (r, o, a) => { const m = memOf(r, o); const x = m && m.attrs && m.attrs.find(t => t.name === a); return x ? x.repr : undefined; };
const same = (code, start) => code.trim() === start.trim();
const START = 'Voilà le bug ! Exécute, lis ce qui se passe, puis corrige le code.';
const TESTERR = t => 'Mes tests font planter ton code : ' + esc(t.err.title) + '. Vérifie les noms de ta classe, de tes méthodes et de leurs paramètres.';
// Code Python qui essaie une instruction et affiche « #nom ERREUR » si elle lève l'exception attendue.
const tryPy = (tag, stmt, exc = 'ValueError') => `\ntry:\n    ${stmt}\n    print("#${tag} PASSE")\nexcept ${exc}:\n    print("#${tag} ERREUR")`;

/* ---------- 3.1 ---------- */
const BOURSE = `class Bourse:
    def __init__(self, po):
        self.po = po
`;
const BUG31 = `class Coffre:
    def __init__(self, contenu):
        self.contenu = contenu
        self.ouvert = False

    def ouvrir(self, cle):
        if cle == "clé d'or":
            self.ouvert = True

    def prendre(self):
        if self.ouvert:
            return self.contenu
        return "Le coffre est fermé."

coffre = Coffre("1000 pièces")
coffre.ouvert = True
print(coffre.prendre())`;
LES['p3-1'] = { title:'Protéger les données', dur:'12 min',
  intro:'Pour l’instant, n’importe qui peut écrire heros.pv = 9999. Dans ce chapitre, tu apprends à protéger l’état de tes objets. On commence par comprendre le problème, et l’idée qui le règle : l’encapsulation.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur le chapitre d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`a = Personnage("Sam")
b = a
b.pv = 1
print(a.pv)`,
      opts:[ {l:'100', why:'<code>b = a</code> ne copie pas l’objet : a et b désignent le même personnage.'},
             {l:'1', ok:1},
             {l:'Une erreur', why:'Modifier un attribut par un alias est permis.'},
             {l:'None', why:'<code>a.pv</code> vaut bien un nombre : celui que b vient de changer.'} ],
      ex:'a et b sont deux noms pour le même objet. Et tu remarques le problème : n’importe qui a pu mettre les PV à 1, sans passer par aucune règle.' },
    { t:'say', h:'Le problème : un état sans protection', file:'triche.py', mem:1,
      p:`<p>Dans ce code, rien n'empêche de mettre des PV au-dessus du maximum, une force négative, ou de vider la bourse. N'importe quelle ligne, n'importe où, peut mettre l'objet dans un état absurde.</p><p>Et quand un bug apparaît, chaque ligne du programme est suspecte. C'est le même souci que les variables globales en C.</p>`,
      code:`class Heros:
    def __init__(self, nom):
        self.nom = nom
        self.pv = 100
        self.pv_max = 100
        self.force = 10

sam = Heros("Sam")
sam.pv = 9999
sam.force = -50
sam.nom = None
print(sam.__dict__)` },
    { t:'say', h:'L’encapsulation',
      p:`<p>L'<strong>encapsulation</strong> (<em>encapsulation</em>), c'est deux choses : regrouper les données avec les méthodes qui les utilisent, et <strong>limiter l'accès direct</strong> à ces données.</p><p>Le reste du programme ne parle à l'objet qu'à travers ses méthodes publiques : son <strong>interface</strong> (<em>interface</em>). Ces méthodes vérifient les règles. Résultat : si les PV deviennent absurdes, le coupable est forcément dans la classe. Le bug est localisé.</p>`,
      snip:`         ┌───────────────────────────┐
appels → │ recevoir()     soigner()  │ ← interface publique
         │ ┌───────────────────────┐ │
         │ │ pv      pv_max  force │ │ ← données cachées
         │ └───────────────────────┘ │
         └───────────────────────────┘` },
    { t:'say', h:'Des méthodes qui expriment une intention', file:'intention.py', mem:1,
      p:`<p>Au lieu de laisser le reste du programme écrire <code>bourse.po = bourse.po - 30</code>, on donne à la bourse une méthode <code>payer(montant)</code>. C'est elle qui décide si le paiement est possible.</p><p>Le nom de la méthode dit ce qu'on veut faire (une intention), et la règle « pas de dette » est écrite à un seul endroit.</p>`,
      code: BOURSE + `
    def payer(self, montant):
        if montant <= self.po:
            self.po -= montant
            return True
        return False

bourse = Bourse(50)
print(bourse.payer(30))
print(bourse.payer(30))
print("Il reste", bourse.po, "pièces d'or")` },
    { t:'quiz', h:'Demander ou ordonner ?', p:`<p>Lequel de ces deux codes respecte le mieux l'encapsulation ?</p>`, snip:`# Code A
if heros.bourse.po >= prix:
    heros.bourse.po -= prix

# Code B
heros.bourse.payer(prix)`,
      opts:[ {l:'Le code A, car il vérifie le prix', why:'Il vérifie, oui, mais la règle est écrite hors de la bourse. Il faudra la recopier partout où on paie, et un jour quelqu’un l’oubliera.'},
             {l:'Le code B', ok:1},
             {l:'Les deux se valent', why:'Ils donnent le même résultat aujourd’hui, mais le code A disperse la règle dans tout le programme.'},
             {l:'Aucun des deux', why:'Le code B fait exactement ce qu’on veut : il laisse la bourse appliquer sa propre règle.'} ],
      ex:'C’est le principe « <strong>Tell, don’t ask</strong> » : dis à l’objet quoi faire, au lieu de lui demander ses données pour décider à sa place.' },
    { t:'code', h:'À toi : dépenser et gagner', file:'bourse.py', mem:1,
      p:`<p>Ajoute deux méthodes à <code>Bourse</code> :</p><ul><li><code>gagner(montant)</code> ajoute le montant, mais seulement s'il est positif ;</li><li><code>payer(montant)</code> enlève le montant s'il y a assez d'or et renvoie <code>True</code>, sinon ne change rien et renvoie <code>False</code>.</li></ul><p>Puis la bourse gagne 40 et paie 25.</p>`,
      code: BOURSE + `
bourse = Bourse(10)
`,
      sol: BOURSE + `
    def gagner(self, montant):
        if montant > 0:
            self.po += montant

    def payer(self, montant):
        if montant <= self.po:
            self.po -= montant
            return True
        return False

bourse = Bourse(10)
bourse.gagner(40)
bourse.payer(25)`,
      hints:['<code>gagner</code> : <code>if montant &gt; 0:</code> puis <code>self.po += montant</code>.','<code>payer</code> : si <code>montant &lt;= self.po</code>, on enlève et on renvoie <code>True</code>. Sinon, <code>return False</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (attr(r, 'bourse', 'po') !== '25') return `La bourse a ${esc(attr(r, 'bourse', 'po'))} pièces. Avec 10, puis +40, puis -25, il en faut 25.`;
        const t = await test([], code + '\n_b = Bourse(20)\n_b.gagner(-5)\nprint("#A", _b.po)\nprint("#B", _b.payer(30), _b.po)\nprint("#C", _b.payer(20), _b.po)');
        if (t.err) return TESTERR(t);
        if (!/#A 20/.test(t.out)) return '<code>gagner(-5)</code> ne doit rien changer : un gain négatif, c’est une triche.';
        if (!/#B False 20/.test(t.out)) return 'Avec 20 pièces, <code>payer(30)</code> doit renvoyer False et ne rien enlever.';
        if (!/#C True 0/.test(t.out)) return 'Avec 20 pièces, <code>payer(20)</code> doit marcher : True, et il reste 0.';
        return true;
      },
      ok:'La bourse fait respecter ses règles elle-même. Le reste du jeu n’a plus qu’à lui dire quoi faire.' },
    { t:'code', bug:1, h:'Le coffre forcé', file:'bug.py', mem:1,
      p:`<p>Ce coffre ne devrait s'ouvrir qu'avec la clé d'or. Mais le code le force en modifiant directement un attribut. Corrige la ligne fautive : ouvre le coffre <strong>en passant par la méthode</strong>, avec la bonne clé.</p>`,
      code: BUG31,
      sol: BUG31.replace('coffre.ouvert = True', 'coffre.ouvrir("clé d\'or")'),
      hints:['La ligne qui triche est <code>coffre.ouvert = True</code>.','Remplace-la par <code>coffre.ouvrir("clé d\'or")</code>.'],
      check:(r, code) => {
        if (same(code, BUG31)) return START;
        if (r.err) return ERR;
        if (/coffre\.ouvert\s*=/.test(strip(code))) return 'Il reste une ligne qui modifie <code>coffre.ouvert</code> directement.';
        if (!/\.ouvrir\s*\(/.test(code)) return 'Ouvre le coffre avec sa méthode <code>ouvrir</code>.';
        if (!/1000 pièces/.test(r.out)) return 'Le coffre est encore fermé : il faut la bonne clé, <code>"clé d\'or"</code>.';
        return true;
      },
      ok:'Pour l’instant, Python laisse encore tricher. Dans la leçon suivante, tu vas voir comment signaler, et en Java interdire, l’accès direct.' },
    { t:'code', defi:1, h:'La jauge de mana', file:'mana.py', mem:1,
      p:`<p>Écris une classe <code>Mana</code> : le constructeur reçoit un maximum <code>max_mana</code>, et la jauge démarre pleine (attribut <code>valeur</code>). Deux méthodes :</p><ul><li><code>lancer(cout)</code> : si la jauge contient assez de mana, elle l'enlève et renvoie <code>True</code>, sinon <code>False</code> ;</li><li><code>recharger(n)</code> : ajoute n, sans dépasser le maximum.</li></ul><p>Crée <code>jauge = Mana(50)</code>.</p>`,
      code:``,
      sol:`class Mana:
    def __init__(self, max_mana):
        self.max_mana = max_mana
        self.valeur = max_mana

    def lancer(self, cout):
        if cout <= self.valeur:
            self.valeur -= cout
            return True
        return False

    def recharger(self, n):
        self.valeur = min(self.max_mana, self.valeur + n)

jauge = Mana(50)`,
      hints:['Le constructeur crée <code>self.max_mana</code> et <code>self.valeur</code>, qui valent tous les deux <code>max_mana</code> au départ.','<code>lancer</code> ressemble à <code>payer</code>. <code>recharger</code> utilise <code>min(self.max_mana, ...)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (attr(r, 'jauge', 'valeur') !== '50') return 'Crée <code>jauge = Mana(50)</code> : la jauge doit démarrer pleine, avec <code>valeur</code> à 50.';
        const t = await test([], code + '\n_m = Mana(30)\nprint("#A", _m.lancer(20), _m.valeur)\nprint("#B", _m.lancer(20), _m.valeur)\n_m.recharger(100)\nprint("#C", _m.valeur)');
        if (t.err) return TESTERR(t);
        if (!/#A True 10/.test(t.out)) return 'Avec 30 de mana, <code>lancer(20)</code> doit renvoyer True et laisser 10.';
        if (!/#B False 10/.test(t.out)) return 'Avec 10 de mana, <code>lancer(20)</code> doit renvoyer False sans rien enlever.';
        if (!/#C 30/.test(t.out)) return '<code>recharger(100)</code> ne doit pas dépasser le maximum (30).';
        return true;
      },
      ok:'Ta jauge ne peut ni passer sous 0, ni dépasser son maximum, tant qu’on passe par ses méthodes.' }
  ],
  recap:['Sans protection, n’importe quelle ligne peut mettre un objet dans un état absurde.','<strong>Encapsulation</strong> (<em>encapsulation</em>) : regrouper données et méthodes, et limiter l’accès direct aux données.','L’<strong>interface</strong> d’un objet, ce sont ses méthodes publiques. Elles font respecter les règles.','<strong>Tell, don’t ask</strong> : <code>bourse.payer(prix)</code> plutôt que vérifier et modifier <code>bourse.po</code> soi-même.'] };

/* ---------- 3.2 ---------- */
const BUG32 = `class Heros:
    def __init__(self, nom):
        self.nom = nom
        self._pv = 100

    def recevoir(self, degats):
        self._pv = max(0, self._pv - degats)

    def pv(self):
        return self._pv

sam = Heros("Sam")
sam.recevoir(30)
print("PV de Sam :", sam._pv)
sam._pv = 500
print("PV de Sam :", sam.pv())`;
LES['p3-2'] = { title:'Attributs privés : _ et private', dur:'14 min',
  intro:'Java interdit vraiment l’accès aux attributs privés. Python, lui, compte sur une convention. Tu apprends les deux, et quand utiliser quoi.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Que dit le principe « Tell, don't ask » ?</p>`,
      opts:[ {l:'Ne jamais lire un attribut', why:'Lire une information n’est pas interdit. Le principe parle de qui prend les décisions.'},
             {l:'Dire à l’objet quoi faire, plutôt que lui prendre ses données pour décider à sa place', ok:1},
             {l:'Poser des questions avec input()', why:'Rien à voir avec <code>input()</code> : on parle de la façon dont les objets se parlent.'},
             {l:'Toujours renvoyer True ou False', why:'Certaines méthodes renvoient un booléen, mais ce n’est pas le principe.'} ],
      ex:'On écrit <code>bourse.payer(30)</code> : la règle reste dans la bourse.' },
    { t:'compare', h:'Java : private et public',
      p:`<p>En Java, on met un <strong>modificateur d'accès</strong> (<em>access modifier</em>) devant chaque attribut et chaque méthode. <code>private</code> veut dire : accessible seulement depuis l'intérieur de la classe. <code>public</code> : accessible de partout.</p><p>C'est le <strong>compilateur</strong> qui vérifie. Une ligne qui touche un attribut privé depuis l'extérieur ne compile même pas.</p>`,
      py:`class Heros:
    def __init__(self, nom):
        self.nom = nom
        self._pv = 100

    def recevoir(self, degats):
        self._pv = max(0, self._pv - degats)

sam = Heros("Sam")
sam._pv = 500     # possible, mais mal élevé`,
      java:`public class Heros {
    private String nom;
    private int pv = 100;

    public Heros(String nom) {
        this.nom = nom;
    }

    public void recevoir(int degats) {
        pv = Math.max(0, pv - degats);
    }
}

Heros sam = new Heros("Sam");
sam.pv = 500;   // erreur : pv has private access in Heros`,
      notes:['Règle simple : <strong>attributs <code>private</code></strong>, méthodes <code>public</code> si elles font partie de l’interface, <code>private</code> si ce sont des aides internes.','En Python, rien n’est vraiment interdit : on signale l’intention avec un <code>_</code> devant le nom.','On peut initialiser un attribut directement dans sa déclaration Java : <code>private int pv = 100;</code>.'] },
    { t:'say', h:'Les quatre niveaux d’accès en Java',
      p:`<p>Java a quatre niveaux. Le tableau dit qui peut accéder à un membre selon son modificateur :</p>`,
      snip:`Modificateur     Même classe   Même package   Classe fille   Partout
private              oui           non            non          non
(rien)               oui           oui            non          non
protected            oui           oui            oui          non
public               oui           oui            oui          oui`,
      p2:`<p>Un <em>package</em>, c'est un dossier de classes qui vont ensemble. Sans modificateur, l'accès est limité au package (<em>package-private</em>). <code>protected</code> sert avec l'héritage : on le reverra au chapitre 5. Pour l'instant, retiens surtout <code>private</code> et <code>public</code>.</p>` },
    { t:'quiz', lang:'java', h:'Ça compile ?', p:`<p>On est dans une <strong>autre</strong> classe, <code>Jeu</code>. Quelle ligne ne compile pas ?</p>`, snip:`public class Coffre {
    private int pieces = 50;
    public boolean ouvert = false;

    public int prendre() {
        int p = pieces;
        pieces = 0;
        return p;
    }
}`,
      opts:[ {l:'coffre.ouvert = true;', why:'<code>ouvert</code> est <code>public</code> : accessible de partout (même si ce n’est pas une bonne idée).'},
             {l:'int n = coffre.prendre();', why:'<code>prendre()</code> est <code>public</code> : c’est l’interface du coffre.'},
             {l:'coffre.pieces = 999;', ok:1},
             {l:'Coffre coffre = new Coffre();', why:'Le constructeur par défaut est accessible.'} ],
      ex:'<code>pieces</code> est <code>private</code> : seule la classe <code>Coffre</code> peut y toucher. Le compilateur refuse la ligne.' },
    { t:'say', h:'Python : la convention du _', file:'convention.py', mem:1,
      p:`<p>Python ne bloque rien. À la place, une <strong>convention</strong> que tous les développeurs respectent : un nom qui commence par <code>_</code> est <strong>interne</strong>. Ça veut dire « ne touche pas ça depuis l'extérieur, ça peut changer sans prévenir ».</p><p>La devise de Python : « nous sommes entre adultes responsables ». Techniquement, <code>sam._pv</code> marche. Mais l'écrire hors de la classe, c'est une faute.</p>`,
      code:`class Heros:
    def __init__(self, nom):
        self.nom = nom
        self._pv = 100

    def recevoir(self, degats):
        self._pv = max(0, self._pv - degats)

    def pv(self):
        return self._pv

sam = Heros("Sam")
sam.recevoir(120)
print(sam.nom, "a", sam.pv(), "PV")` },
    { t:'say', h:'Le double _ : le nom déformé', file:'mangling.py', mem:1,
      p:`<p>Avec <strong>deux</strong> <code>_</code> devant (<code>__or</code>), Python va plus loin : il renomme l'attribut en <code>_Coffre__or</code>. On appelle ça le <em>name mangling</em> (le nom déformé). Depuis l'extérieur, <code>coffre.__or</code> ne marche plus.</p><p>Regarde la mémoire : le vrai nom de l'attribut. C'est une protection contre les accidents, pas contre les tricheurs : <code>coffre._Coffre__or</code> marche encore.</p>`,
      code:`class Coffre:
    def __init__(self, quantite):
        self.__or = quantite

    def contenu(self):
        return self.__or

coffre = Coffre(300)
print(coffre.contenu())
try:
    print(coffre.__or)
except AttributeError:
    print("coffre.__or : introuvable depuis l'extérieur")` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`class Sac:
    def __init__(self):
        self._objets = ["corde"]
        self.__secret = "carte"

s = Sac()
print(s._objets)
print(s.__secret)`,
      opts:[ {l:"['corde'] puis carte", why:'Le double <code>_</code> renomme l’attribut en <code>_Sac__secret</code> : <code>s.__secret</code> n’existe pas.'},
             {l:"['corde'] puis une AttributeError", ok:1},
             {l:'Une AttributeError dès la première ligne', why:'Un seul <code>_</code>, c’est une convention : Python laisse passer.'},
             {l:'Rien : les attributs privés sont cachés', why:'Python ne cache rien pour un seul <code>_</code>.'} ],
      ex:'<code>_objets</code> est lisible (mais on ne devrait pas). <code>__secret</code> a été renommé : il faudrait écrire <code>s._Sac__secret</code>.' },
    { t:'code', h:'À toi : rends le coffre discret', file:'coffre.py', mem:1,
      p:`<p>Modifie la classe pour que l'attribut <code>pieces</code> devienne interne : renomme-le <code>_pieces</code> <strong>partout dans la classe</strong>. Ajoute une méthode <code>combien()</code> qui le renvoie, et utilise-la dans le <code>print</code> à la place de l'accès direct.</p>`,
      code:`class Coffre:
    def __init__(self, pieces):
        self.pieces = pieces

    def deposer(self, n):
        if n > 0:
            self.pieces += n

coffre = Coffre(100)
coffre.deposer(50)
print(coffre.pieces)`,
      sol:`class Coffre:
    def __init__(self, pieces):
        self._pieces = pieces

    def deposer(self, n):
        if n > 0:
            self._pieces += n

    def combien(self):
        return self._pieces

coffre = Coffre(100)
coffre.deposer(50)
print(coffre.combien())`,
      hints:['Remplace <code>self.pieces</code> par <code>self._pieces</code> dans le constructeur et dans <code>deposer</code>.','Ajoute <code>def combien(self):</code> → <code>return self._pieces</code>, puis <code>print(coffre.combien())</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (attr(r, 'coffre', '_pieces') === undefined) return 'Je ne vois pas d’attribut <code>_pieces</code> dans le coffre.';
        if (attr(r, 'coffre', 'pieces') !== undefined) return 'Le coffre a encore un attribut <code>pieces</code> sans <code>_</code>.';
        if (/coffre\._pieces/.test(strip(code))) return 'Hors de la classe, n’écris pas <code>coffre._pieces</code> : passe par <code>combien()</code>.';
        if (!/(^|\D)150(\D|$)/.test(r.out)) return 'Affiche le contenu du coffre avec <code>combien()</code> : 150.';
        const t = await test([], code + '\nprint("#T", Coffre(7).combien())');
        if (t.err || !/#T 7/.test(t.out)) return 'La méthode <code>combien()</code> doit renvoyer le nombre de pièces.';
        return true;
      },
      ok:'Maintenant, ton code dit clairement : « _pieces, c’est mon affaire ». Le reste du programme passe par <code>deposer</code> et <code>combien</code>.' },
    { t:'fill', lang:'java', h:'Le coffre en Java',
      p:`<p>Écris la même classe en Java, avec le bon niveau d'accès pour chaque membre.</p>`,
      tpl:`public class Coffre {
    [[private]] int pieces;

    [[public]] Coffre(int pieces) {
        this.pieces = pieces;
    }

    public void deposer(int n) {
        if (n > 0) {
            pieces += n;
        }
    }

    public [[int]] combien() {
        [[return]] pieces;
    }
}`,
      hints:['L’attribut est caché, le constructeur doit être utilisable de partout.','<code>private</code>, <code>public</code>, puis <code>combien</code> renvoie un entier : <code>int</code>, avec <code>return</code>.'],
      ok:'L’attribut est <code>private</code>, l’interface est <code>public</code>. En Java, c’est le compilateur qui monte la garde.' },
    { t:'code', bug:1, h:'Répare la triche', file:'bug.py',
      p:`<p>Ce code lit et modifie <code>_pv</code> depuis l'extérieur de la classe : deux fautes contre la convention. Corrige-le : lis les PV avec la méthode <code>pv()</code>, et <strong>supprime</strong> la ligne qui triche.</p>`,
      code: BUG32,
      sol:`class Heros:
    def __init__(self, nom):
        self.nom = nom
        self._pv = 100

    def recevoir(self, degats):
        self._pv = max(0, self._pv - degats)

    def pv(self):
        return self._pv

sam = Heros("Sam")
sam.recevoir(30)
print("PV de Sam :", sam.pv())
print("PV de Sam :", sam.pv())`,
      hints:['Hors de la classe, le mot <code>_pv</code> ne doit plus apparaître.','Remplace <code>sam._pv</code> par <code>sam.pv()</code> dans le premier <code>print</code>, et efface la ligne <code>sam._pv = 500</code>.'],
      check:(r, code) => {
        if (same(code, BUG32)) return START;
        if (r.err) return ERR;
        const dehors = strip(code).split('\n').filter(l => /^\S/.test(l)).join('\n');
        if (/sam\._pv/.test(dehors)) return 'Il reste un <code>sam._pv</code> hors de la classe.';
        if (attr(r, 'sam', '_pv') !== '70') return 'Sam doit finir à 70 PV : 100 moins 30 dégâts, sans triche.';
        return true;
      },
      ok:'Hors de la classe, plus aucun <code>_pv</code>. Ton code respecte la convention : un autre développeur saura qu’il peut changer l’intérieur de Heros sans tout casser.' },
    { t:'code', defi:1, h:'Une aide interne', file:'aide.py', mem:1,
      p:`<p>Un <strong>parchemin</strong> a un texte et un nombre d'utilisations restantes (<code>_charges</code>, 3 au départ). Écris :</p><ul><li>une méthode interne <code>_use()</code> qui enlève une charge et renvoie <code>True</code> s'il en restait, sinon <code>False</code> ;</li><li>une méthode publique <code>lire()</code> qui utilise <code>_use()</code> : elle renvoie le texte s'il restait une charge, sinon <code>"Le parchemin est usé."</code></li></ul><p>Crée <code>p = Parchemin("Feu !")</code> et lis-le 4 fois en affichant le résultat.</p>`,
      code:``,
      sol:`class Parchemin:
    def __init__(self, texte):
        self._texte = texte
        self._charges = 3

    def _use(self):
        if self._charges > 0:
            self._charges -= 1
            return True
        return False

    def lire(self):
        if self._use():
            return self._texte
        return "Le parchemin est usé."

p = Parchemin("Feu !")
for i in range(4):
    print(p.lire())`,
      hints:['<code>_use</code> : <code>if self._charges &gt; 0:</code> on enlève 1 et on renvoie True, sinon False.','<code>lire</code> : <code>if self._use(): return self._texte</code>, puis <code>return "Le parchemin est usé."</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/def\s+_use\s*\(\s*self\s*\)/.test(code)) return 'Il faut une méthode interne <code>_use(self)</code>.';
        if (!/self\._use\s*\(\s*\)/.test(code)) return '<code>lire</code> doit appeler <code>self._use()</code>.';
        const l = linesOf(r.out);
        if (l.length < 4 || l.slice(0, 3).some(x => x !== 'Feu !') || !/usé/.test(l[3])) return 'Les 3 premières lectures doivent afficher <code>Feu !</code>, la 4e <code>Le parchemin est usé.</code>';
        const t = await test([], code + '\n_q = Parchemin("X")\nprint("#T", _q.lire(), _q.lire(), _q.lire(), _q._charges)');
        if (t.err || !/#T X X X 0/.test(t.out)) return 'Ton parchemin ne marche pas avec un autre texte. Utilise bien <code>self._texte</code>.';
        return true;
      },
      ok:'Une méthode interne avec <code>_</code>, une méthode publique pour le reste du monde. En Java, <code>_use</code> serait <code>private</code>.' }
  ],
  recap:['Java : <code>private</code> (la classe seulement), rien (le package), <code>protected</code> (+ les classes filles), <code>public</code> (partout). Vérifié par le compilateur.','Règle : attributs <code>private</code>, méthodes de l’interface <code>public</code>, aides internes <code>private</code>.','Python : <code>_nom</code> = interne, par convention. On ne l’utilise pas hors de la classe.','<code>__nom</code> : Python le renomme en <code>_Classe__nom</code> (<em>name mangling</em>). Une protection contre les accidents.'] };

/* ---------- 3.3 ---------- */
const BUG33 = `class Arme:
    def __init__(self, nom, degats):
        self.nom = nom
        self.degats = degats

    @property
    def degats(self):
        return self.degats

    @degats.setter
    def degats(self, valeur):
        if valeur < 0:
            raise ValueError("dégâts négatifs")
        self.degats = valeur

hache = Arme("Hache", 14)
print(hache.degats)`;
LES['p3-3'] = { title:'Getters, setters et @property', dur:'15 min',
  intro:'Lire un attribut caché, le modifier avec contrôle : en Java, on écrit des getters et des setters. Python a une solution plus élégante, @property. Tu vas maîtriser les deux.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Que fait Python avec un attribut nommé <code>self.__or</code> dans la classe <code>Coffre</code> ?</p>`,
      opts:[ {l:'Il l’interdit complètement', why:'Python n’interdit jamais vraiment : <code>coffre._Coffre__or</code> marche encore.'},
             {l:'Il le renomme en _Coffre__or', ok:1},
             {l:'Rien de spécial', why:'C’est le cas d’un seul <code>_</code>. Avec deux, Python renomme l’attribut.'},
             {l:'Il le rend public', why:'C’est plutôt l’inverse : il le rend plus difficile à atteindre.'} ],
      ex:'C’est le <em>name mangling</em> : <code>__or</code> devient <code>_Coffre__or</code>.' },
    { t:'compare', h:'Java : getters et setters',
      p:`<p>Un attribut <code>private</code> est invisible de l'extérieur. Pour le lire, on écrit un <strong>getter</strong> (accesseur) : <code>getPv()</code>, ou <code>isVivant()</code> pour un booléen. Pour le modifier avec contrôle, un <strong>setter</strong> (mutateur) : <code>setPv(...)</code>, qui vérifie la valeur.</p>`,
      py:`class Heros:
    def __init__(self, nom, pv):
        self._nom = nom
        self._pv = pv

    def get_nom(self):
        return self._nom

    def get_pv(self):
        return self._pv

    def set_pv(self, valeur):
        if valeur < 0:
            raise ValueError("PV négatifs")
        self._pv = valeur`,
      java:`public class Heros {
    private String nom;
    private int pv;

    public String getNom() { return nom; }

    public int getPv() { return pv; }

    public void setPv(int valeur) {
        if (valeur < 0) {
            throw new IllegalArgumentException("PV négatifs");
        }
        this.pv = valeur;
    }
}`,
      notes:['Pas de setter = l’attribut est en <strong>lecture seule</strong> depuis l’extérieur. Ici, le nom ne peut plus changer.','<code>throw new IllegalArgumentException(...)</code> (Java) et <code>raise ValueError(...)</code> (Python) <strong>lèvent une exception</strong> : le programme refuse la valeur et s’arrête là, sauf si quelqu’un l’attrape avec <code>try</code>. Tu creuseras ça au chapitre 9.','Attention : un setter sans vérification pour chaque attribut, ce n’est pas de l’encapsulation. C’est un attribut public avec des étapes en plus.'] },
    { t:'say', h:'raise : refuser une valeur', file:'raise.py',
      p:`<p><code>raise ValueError("message")</code> lève une erreur volontairement. C'est la bonne façon de dire « cette valeur est interdite » : l'objet refuse d'entrer dans un état invalide.</p><p>Tu connais déjà <code>try</code> et <code>except</code> : ils permettent d'attraper l'erreur et de continuer.</p>`,
      code:`class Heros:
    def __init__(self, pv):
        self._pv = pv

    def set_pv(self, valeur):
        if valeur < 0:
            raise ValueError("PV négatifs interdits")
        self._pv = valeur

sam = Heros(100)
sam.set_pv(80)
try:
    sam.set_pv(-10)
except ValueError as e:
    print("Refusé :", e)
print(sam._pv)` },
    { t:'say', h:'@property : un getter déguisé', file:'property.py', mem:1,
      p:`<p>En Python, écrire <code>sam.get_pv()</code> partout est lourd. Avec <code>@property</code> au-dessus d'une méthode, on la lit <strong>comme un attribut</strong>, sans parenthèses : <code>sam.pv</code>.</p><p>Et avec <code>@pv.setter</code>, on définit ce qui se passe quand on écrit <code>sam.pv = ...</code>. La vraie valeur est rangée dans <code>_pv</code>. Regarde la mémoire.</p>`,
      code:`class Heros:
    def __init__(self, nom, pv):
        self._nom = nom
        self.pv = pv          # passe déjà par le setter !

    @property
    def nom(self):
        return self._nom

    @property
    def pv(self):
        return self._pv

    @pv.setter
    def pv(self, valeur):
        if valeur < 0:
            raise ValueError("PV négatifs interdits")
        self._pv = valeur

sam = Heros("Sam", 100)
sam.pv = 75
print(sam.nom, sam.pv)
try:
    sam.pv = -5
except ValueError as e:
    print("Refusé :", e)
try:
    sam.nom = "Bob"
except AttributeError:
    print("Le nom est en lecture seule")` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Avec la classe <code>Heros</code> ci-dessus, que se passe-t-il ?</p>`, snip:`lea = Heros("Léa", -20)`,
      opts:[ {l:'Léa est créée avec -20 PV', why:'Dans <code>__init__</code>, <code>self.pv = pv</code> passe par le setter, qui vérifie la valeur.'},
             {l:'Léa est créée avec 0 PV', why:'Le setter ne corrige pas la valeur : il la refuse.'},
             {l:'Une ValueError', ok:1},
             {l:'Une AttributeError', why:'Le setter existe. C’est lui qui lève une erreur, mais pas celle-là.'} ],
      ex:'Le constructeur écrit <code>self.pv = pv</code> (sans <code>_</code>) : il passe donc par le setter. Même à la création, l’objet refuse un état invalide.' },
    { t:'say', h:'Une propriété calculée', file:'calculee.py',
      p:`<p>Une propriété n'est pas forcément rangée quelque part : elle peut être <strong>calculée</strong> à chaque lecture. Ici, <code>pourcentage</code> et <code>en_danger</code> sont calculés à partir des PV.</p><p>Pour celui qui utilise la classe, impossible de faire la différence avec un attribut. C'est l'abstraction : il voit le « quoi », pas le « comment ».</p>`,
      code:`class Heros:
    def __init__(self, pv, pv_max):
        self._pv = pv
        self._pv_max = pv_max

    @property
    def pourcentage(self):
        return self._pv * 100 // self._pv_max

    @property
    def en_danger(self):
        return self.pourcentage < 25

sam = Heros(30, 150)
print(sam.pourcentage, "%")
print("En danger :", sam.en_danger)` },
    { t:'code', h:'À toi : une arme protégée', file:'arme.py', mem:1,
      p:`<p>Écris une classe <code>Arme</code> avec un <code>nom</code> en lecture seule et des <code>degats</code> protégés par une propriété :</p><ul><li><code>nom</code> : une propriété sans setter, qui lit <code>_nom</code> ;</li><li><code>degats</code> : une propriété avec un setter qui lève <code>ValueError</code> si la valeur est négative.</li></ul><p>Crée <code>epee = Arme("Épée", 12)</code>, puis passe ses dégâts à 15 avec <code>epee.degats = 15</code>.</p>`,
      code:``,
      sol:`class Arme:
    def __init__(self, nom, degats):
        self._nom = nom
        self.degats = degats

    @property
    def nom(self):
        return self._nom

    @property
    def degats(self):
        return self._degats

    @degats.setter
    def degats(self, valeur):
        if valeur < 0:
            raise ValueError("dégâts négatifs")
        self._degats = valeur

epee = Arme("Épée", 12)
epee.degats = 15`,
      hints:['Pars du modèle de la classe Heros : <code>@property</code> au-dessus de <code>def nom(self):</code>, et pareil pour <code>degats</code>, avec en plus <code>@degats.setter</code>.','Dans le setter : <code>if valeur &lt; 0: raise ValueError("dégâts négatifs")</code>, puis <code>self._degats = valeur</code>. Dans <code>__init__</code>, écris <code>self.degats = degats</code> pour passer par le setter.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/@property/.test(code)) return 'Utilise <code>@property</code>.';
        if (attr(r, 'epee', '_degats') !== '15') return 'L’épée doit finir avec 15 dégâts, rangés dans <code>_degats</code>.';
        const t = await test([], code + '\n_a = Arme("Arc", 9)\nprint("#V", _a.nom, _a.degats)' + tryPy('N', '_a.degats = -1') + tryPy('C', 'Arme("Bâton", -3)') + tryPy('L', '_a.nom = "Fronde"', 'AttributeError'));
        if (t.err) return TESTERR(t);
        if (!/#V Arc 9/.test(t.out)) return 'Je crée <code>Arme("Arc", 9)</code> : <code>a.nom</code> doit valoir Arc et <code>a.degats</code> 9.';
        if (!/#N ERREUR/.test(t.out)) return '<code>a.degats = -1</code> doit lever une <code>ValueError</code>.';
        if (!/#C ERREUR/.test(t.out)) return 'Créer une arme avec des dégâts négatifs doit aussi lever une <code>ValueError</code>. Dans <code>__init__</code>, passe par le setter : <code>self.degats = degats</code>.';
        if (!/#L ERREUR/.test(t.out)) return 'Le nom doit être en lecture seule : pas de setter pour <code>nom</code>, et range la valeur dans <code>_nom</code>.';
        return true;
      },
      ok:'Testé de tous les côtés : dégâts négatifs refusés, même à la création, et nom en lecture seule.' },
    { t:'code', bug:1, h:'La propriété qui tourne en rond', file:'bug.py',
      p:`<p>Ce code plante avec une erreur bizarre. Exécute-le, puis trouve le problème. Indice : regarde bien les noms dans la propriété et le setter.</p>`,
      code: BUG33,
      sol: BUG33.replace('        return self.degats', '        return self._degats').replace('        self.degats = valeur', '        self._degats = valeur'),
      hints:['Dans le getter, <code>return self.degats</code> relit… la propriété elle-même, qui relit la propriété, qui relit…','La vraie valeur doit être rangée sous un autre nom : <code>self._degats</code>, dans le getter et dans le setter.'],
      check:(r, code) => {
        if (same(code, BUG33)) return START;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        if (!/self\._degats\s*=\s*valeur/.test(code)) return 'Dans le setter, range la valeur dans <code>self._degats</code>.';
        if (!/^14$/m.test(r.out.trim())) return 'Il faut afficher 14.';
        return true;
      },
      ok:'Une propriété et sa valeur rangée ne doivent jamais avoir le même nom : <code>degats</code> pour la propriété, <code>_degats</code> pour la donnée.' },
    { t:'fill', lang:'java', h:'Getter et setter en Java',
      p:`<p>Complète la classe Java <code>Arme</code> : un getter pour le nom, un getter et un setter qui vérifie les dégâts.</p>`,
      tpl:`public class Arme {
    private String nom;
    private int degats;

    public String [[getNom]]() {
        return nom;
    }

    public int getDegats() {
        return degats;
    }

    public [[void]] setDegats(int valeur) {
        if (valeur < 0) {
            [[throw]] new IllegalArgumentException("dégâts négatifs");
        }
        [[this]].degats = valeur;
    }
}`,
      hints:['Le getter du nom suit la convention : <code>get</code> + le nom de l’attribut avec une majuscule.','<code>getNom</code>, un setter ne renvoie rien (<code>void</code>), on lève une exception avec <code>throw</code>, et <code>this</code> pour l’attribut.'],
      ok:'C’est la convention <em>JavaBeans</em> : <code>getX</code>, <code>setX</code>, <code>isX</code>. Beaucoup d’outils Java s’appuient dessus.' },
    { t:'code', defi:1, h:'Deux vues, une seule donnée', file:'temps.py',
      p:`<p>Un sablier magique garde une durée en secondes, dans <code>_secondes</code>. Écris la classe <code>Sablier</code> :</p><ul><li>une propriété <code>secondes</code> avec un setter qui refuse les valeurs négatives (<code>ValueError</code>) ;</li><li>une propriété <code>minutes</code>, <strong>calculée</strong> : <code>secondes / 60</code> ;</li><li>un setter pour <code>minutes</code>, qui range <code>minutes * 60</code> dans <code>secondes</code>.</li></ul><p>Crée <code>s = Sablier(90)</code>, affiche <code>s.minutes</code>, puis fais <code>s.minutes = 3</code> et affiche <code>s.secondes</code>.</p>`,
      code:``,
      sol:`class Sablier:
    def __init__(self, secondes):
        self.secondes = secondes

    @property
    def secondes(self):
        return self._secondes

    @secondes.setter
    def secondes(self, valeur):
        if valeur < 0:
            raise ValueError("durée négative")
        self._secondes = valeur

    @property
    def minutes(self):
        return self.secondes / 60

    @minutes.setter
    def minutes(self, valeur):
        self.secondes = valeur * 60

s = Sablier(90)
print(s.minutes)
s.minutes = 3
print(s.secondes)`,
      hints:['Une seule vraie donnée : <code>_secondes</code>. La propriété <code>minutes</code> ne range rien elle-même.','Le setter de minutes écrit <code>self.secondes = valeur * 60</code> : il passe par le setter de secondes, qui vérifie la valeur.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/1\.5/.test(r.out) || !/(^|\D)180(\D|$)/.test(r.out)) return 'J’attends 1.5 (90 secondes en minutes), puis 180 (3 minutes en secondes).';
        const t = await test([], code + '\n_s = Sablier(30)\n_s.minutes = 2\nprint("#T", _s.secondes, _s.__dict__)' + tryPy('N', '_s.minutes = -1'));
        if (t.err) return TESTERR(t);
        if (!/#T 120 \{'_secondes': 120\}/.test(t.out)) return 'L’objet ne doit ranger qu’une seule donnée, <code>_secondes</code>. Les minutes se calculent à partir d’elle.';
        if (!/#N ERREUR/.test(t.out)) return '<code>s.minutes = -1</code> doit aussi être refusé : fais passer le setter de minutes par celui de secondes.';
        return true;
      },
      ok:'Une seule donnée, deux façons de la voir. Si demain tu ranges des millisecondes à la place, le reste du programme ne verra aucune différence.' }
  ],
  recap:['Java : getter <code>getX()</code> / <code>isX()</code> pour lire, setter <code>setX(v)</code> qui vérifie pour écrire. Pas de setter = lecture seule.','Python : <code>@property</code> pour lire comme un attribut, <code>@x.setter</code> pour contrôler l’écriture. La valeur est rangée dans <code>_x</code>.','Dans <code>__init__</code>, écris <code>self.x = x</code> pour passer par le setter dès la création.','<code>raise ValueError(...)</code> / <code>throw new IllegalArgumentException(...)</code> refusent une valeur invalide.','Une propriété peut être calculée : <code>pourcentage</code>, <code>minutes</code>…'] };

/* ---------- 3.4 ---------- */
const BUG34 = `class Inventaire:
    def __init__(self):
        self._objets = []

    def ajouter(self, objet):
        if len(self._objets) < 3:
            self._objets.append(objet)

    @property
    def objets(self):
        return self._objets

sac = Inventaire()
sac.ajouter("corde")
liste = sac.objets
liste.append("dragon apprivoisé")
liste.append("couronne")
liste.append("trône")
print(len(sac.objets), "objets :", sac.objets)`;
LES['p3-4'] = { title:'Les invariants', dur:'14 min',
  intro:'Un invariant, c’est une règle qui doit être vraie pour un objet à chaque instant. C’est le mot qui résume tout le chapitre, et le prof y tient. Tu vas apprendre à les garantir, et à boucher les fuites.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Dans une classe avec une propriété <code>pv</code> et son setter, pourquoi écrit-on <code>self.pv = pv</code> dans <code>__init__</code>, et pas <code>self._pv = pv</code> ?</p>`,
      opts:[ {l:'Pour que la valeur passe par la vérification du setter', ok:1},
             {l:'Parce que _pv n’existe pas encore', why:'<code>self._pv = pv</code> le créerait sans problème… mais sans vérification.'},
             {l:'C’est juste une question de style', why:'Ça change le comportement : avec <code>_pv</code>, une valeur invalide passerait à la création.'},
             {l:'Pour rendre pv public', why:'La propriété est déjà publique. La question est de savoir si la vérification a lieu.'} ],
      ex:'Ainsi, même un objet tout neuf ne peut pas naître dans un état invalide.' },
    { t:'say', h:'Une règle toujours vraie',
      p:`<p>Un <strong>invariant</strong> (<em>invariant</em>) est une condition qui doit être vraie pour chaque objet de la classe, à tout moment (entre deux appels de méthodes). Exemples dans notre jeu :</p><ul><li>Personnage : <code>0 &lt;= pv &lt;= pv_max</code></li><li>Bourse : <code>po &gt;= 0</code></li><li>Inventaire : pas plus de 10 objets</li><li>Date du calendrier du jeu : <code>1 &lt;= mois &lt;= 12</code></li></ul><p>Deux règles pour le garantir : le <strong>constructeur établit</strong> l'invariant, et chaque <strong>méthode publique le préserve</strong>. Si les attributs sont privés, seule la classe peut le casser.</p>` },
    { t:'say', h:'Un invariant en action', file:'invariant.py', mem:1,
      p:`<p>Cette jauge de faim respecte l'invariant <code>0 &lt;= faim &lt;= 10</code>. Le constructeur refuse une valeur hors limites, et chaque méthode garde la valeur dans les bornes.</p><p>Modifie le code pour essayer de casser l'invariant… sans toucher à <code>_faim</code>. Tu n'y arriveras pas.</p>`,
      code:`class Faim:
    def __init__(self, niveau=0):
        if not 0 <= niveau <= 10:
            raise ValueError("la faim va de 0 à 10")
        self._faim = niveau

    def marcher(self, heures):
        self._faim = min(10, self._faim + heures)

    def manger(self, portions):
        self._faim = max(0, self._faim - 3 * portions)

    @property
    def faim(self):
        return self._faim

f = Faim(4)
f.marcher(20)
print("Après la marche :", f.faim)
f.manger(5)
print("Après le repas :", f.faim)` },
    { t:'quiz', h:'Qui doit vérifier ?', p:`<p>L'invariant de la classe <code>Bourse</code> est <code>po &gt;= 0</code>. Quelles méthodes doivent le garantir ?</p>`,
      opts:[ {l:'Seulement le constructeur', why:'Le constructeur l’établit, mais une méthode <code>payer</code> mal écrite pourrait le casser ensuite.'},
             {l:'Seulement payer()', why:'Et si on crée une bourse avec -50 dès le départ ?'},
             {l:'Le constructeur et toutes les méthodes publiques qui modifient po', ok:1},
             {l:'Le code qui utilise la bourse', why:'C’est tout l’inverse de l’encapsulation : la règle serait éparpillée partout.'} ],
      ex:'Le constructeur établit l’invariant, chaque méthode publique le préserve. Le reste du programme n’a pas à s’en soucier.' },
    { t:'say', h:'La fuite de référence', file:'fuite.py', mem:1,
      p:`<p>Attention à un trou subtil. Si une propriété renvoie la <strong>liste interne</strong> elle-même, le reste du programme reçoit une référence vers elle (chapitre 2 !) et peut la modifier sans passer par aucune méthode.</p><p>La solution : renvoyer une <strong>copie</strong>, ou un <strong>tuple</strong>, qu'on ne peut pas modifier.</p>`,
      code:`class Grimoire:
    def __init__(self):
        self._sorts = ["Lumière"]

    def apprendre(self, sort):
        if sort not in self._sorts:
            self._sorts.append(sort)

    @property
    def sorts(self):
        return tuple(self._sorts)

g = Grimoire()
g.apprendre("Feu")
s = g.sorts
print(s)
try:
    s.append("Sort interdit")
except AttributeError:
    print("Impossible de modifier un tuple")` },
    { t:'code', bug:1, h:'Le sac qui fuit', file:'bug.py', mem:1,
      p:`<p>L'inventaire ne doit jamais contenir plus de 3 objets. Pourtant, ce code en met 4. Répare la <strong>classe</strong> pour boucher la fuite : la propriété <code>objets</code> doit renvoyer un tuple.</p>`,
      code: BUG34,
      sol: BUG34.replace('        return self._objets', '        return tuple(self._objets)').replace(`liste.append("dragon apprivoisé")
liste.append("couronne")
liste.append("trône")
`, ''),
      hints:['La propriété <code>objets</code> renvoie la vraie liste. Fais-lui renvoyer <code>tuple(self._objets)</code>.','Ensuite, les <code>liste.append(...)</code> du bas vont planter : c’est normal, la fuite est bouchée. Supprime ces lignes.'],
      check:async (r, code, test) => {
        if (same(code, BUG34)) return START;
        if (!/tuple\s*\(\s*self\._objets\s*\)/.test(code)) return 'La propriété <code>objets</code> doit renvoyer <code>tuple(self._objets)</code>.';
        if (r.err) return 'La fuite est bouchée, et maintenant les <code>liste.append</code> plantent. Supprime ces lignes : on n’ajoute que par <code>ajouter()</code>.';
        const t = await test([], code + '\n_s = Inventaire()\nfor _o in "abcde":\n    _s.ajouter(_o)\nprint("#T", len(_s.objets))');
        if (t.err || !/#T 3/.test(t.out)) return 'L’inventaire doit refuser au-delà de 3 objets.';
        return true;
      },
      ok:'Un tuple ne se modifie pas : seule la méthode <code>ajouter</code> peut remplir le sac, et elle fait respecter la limite.' },
    { t:'compare', h:'Et en Java ? Copies et objets immuables',
      p:`<p>Même souci en Java : un getter qui renvoie la liste interne la laisse fuir. On renvoie une copie non modifiable avec <code>List.copyOf(...)</code>.</p><p>Encore mieux, parfois : un objet <strong>immuable</strong> (<em>immutable</em>), qui ne change plus après sa création. Ses attributs sont <code>final</code> : affectés une fois, dans le constructeur. Pour « modifier », on crée un nouvel objet.</p>`,
      py:`class Position:
    def __init__(self, x, y):
        self._x = x
        self._y = y

    @property
    def x(self):
        return self._x

    @property
    def y(self):
        return self._y

    def deplacer(self, dx, dy):
        return Position(self._x + dx, self._y + dy)`,
      java:`public final class Position {
    private final int x;
    private final int y;

    public Position(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int getX() { return x; }
    public int getY() { return y; }

    public Position deplacer(int dx, int dy) {
        return new Position(x + dx, y + dy);
    }
}

// Depuis Java 16, en une ligne :
record Position(int x, int y) {}`,
      notes:['<code>final</code> sur un attribut : il reçoit sa valeur une seule fois. <code>final</code> sur la classe : personne ne peut en hériter.','<code>deplacer</code> ne modifie rien : elle renvoie une nouvelle position. Un objet immuable peut être partagé sans risque, pas de surprise d’alias.','<code>String</code> en Java et <code>str</code> en Python sont immuables : <code>upper()</code> renvoie un nouveau texte.','En Python, <code>@dataclass(frozen=True)</code> (module <code>dataclasses</code>) crée une classe immuable en quelques lignes. Ce module ne marche pas sur ce site, mais tu peux l’essayer dans VS Code.'] },
    { t:'quiz', lang:'java', h:'final', p:`<p>Que se passe-t-il à la compilation ?</p>`, snip:`public class Position {
    private final int x;

    public Position(int x) {
        this.x = x;
    }

    public void avancer() {
        x = x + 1;
    }
}`,
      opts:[ {l:'Ça compile, et avancer() ajoute 1', why:'<code>final</code> interdit de réaffecter l’attribut après le constructeur.'},
             {l:'Erreur : on ne peut pas réaffecter un attribut final', ok:1},
             {l:'Erreur dans le constructeur', why:'Le constructeur a le droit de donner sa valeur à un attribut <code>final</code> : c’est même le seul endroit permis.'},
             {l:'Ça compile, mais avancer() ne fait rien', why:'Java ne laisse pas passer silencieusement : le compilateur refuse.'} ],
      ex:'Un attribut <code>final</code> reçoit sa valeur une fois, dans le constructeur. Pour avancer, il faudrait renvoyer une nouvelle <code>Position</code>.' },
    { t:'code', h:'À toi : le calendrier du jeu', file:'calendrier.py', mem:1,
      p:`<p>Écris une classe <code>Jour</code> pour le calendrier du jeu. Chaque mois du jeu a 30 jours, et l'année a 12 mois. L'invariant : <code>1 &lt;= jour &lt;= 30</code> et <code>1 &lt;= mois &lt;= 12</code>.</p><ul><li>Le constructeur reçoit <code>jour</code> et <code>mois</code>, et lève <code>ValueError</code> si l'invariant n'est pas respecté.</li><li>La méthode <code>suivant()</code> renvoie un <strong>nouveau</strong> <code>Jour</code> : le lendemain. Après le 30, on passe au 1 du mois suivant, et après le mois 12, au mois 1.</li></ul><p>Crée <code>d = Jour(30, 12)</code> et <code>demain = d.suivant()</code>.</p>`,
      code:``,
      sol:`class Jour:
    def __init__(self, jour, mois):
        if not 1 <= jour <= 30 or not 1 <= mois <= 12:
            raise ValueError("date invalide")
        self._jour = jour
        self._mois = mois

    @property
    def jour(self):
        return self._jour

    @property
    def mois(self):
        return self._mois

    def suivant(self):
        if self._jour < 30:
            return Jour(self._jour + 1, self._mois)
        if self._mois < 12:
            return Jour(1, self._mois + 1)
        return Jour(1, 1)

d = Jour(30, 12)
demain = d.suivant()`,
      hints:['Dans le constructeur : <code>if not 1 &lt;= jour &lt;= 30 or not 1 &lt;= mois &lt;= 12: raise ValueError("date invalide")</code>.','<code>suivant</code> a trois cas : jour &lt; 30 → même mois, jour + 1 ; sinon mois &lt; 12 → <code>Jour(1, mois + 1)</code> ; sinon <code>Jour(1, 1)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
def _v(o):
    return str(o.jour) + "/" + str(o.mois)
_a = Jour(5, 3)
print("#A", _v(_a.suivant()), _v(_a))
print("#B", _v(Jour(30, 4).suivant()), _v(Jour(30, 12).suivant()))` + tryPy('C', 'Jour(31, 1)') + tryPy('D', 'Jour(0, 5)') + tryPy('E', 'Jour(10, 13)'));
        if (t.err) return /jour|mois/.test(t.err.raw || '') ? 'J’ai besoin de lire <code>d.jour</code> et <code>d.mois</code> : ajoute ces deux propriétés.' : TESTERR(t);
        if (!/#A 6\/3 5\/3/.test(t.out)) return 'Le lendemain du 5/3 est le 6/3, et l’objet d’origine doit rester le 5/3 : <code>suivant()</code> renvoie un nouveau Jour.';
        if (!/#B 1\/5 1\/1/.test(t.out)) return 'Le lendemain du 30/4 est le 1/5, et celui du 30/12 est le 1/1.';
        if (!/#C ERREUR/.test(t.out) || !/#D ERREUR/.test(t.out) || !/#E ERREUR/.test(t.out)) return 'Le constructeur doit refuser Jour(31, 1), Jour(0, 5) et Jour(10, 13) avec une <code>ValueError</code>.';
        return true;
      },
      ok:'Ta classe est immuable et son invariant ne peut jamais être cassé. Le prof adore ce genre de classe.' },
    { t:'code', defi:1, h:'L’inventaire limité', file:'inventaire.py', mem:1,
      p:`<p>Écris une classe <code>Inventaire</code> dont l'invariant est : <strong>au plus <code>capacite</code> objets</strong>, et jamais deux fois le même.</p><ul><li>Le constructeur reçoit <code>capacite</code> (5 par défaut).</li><li><code>ajouter(objet)</code> renvoie <code>True</code> si l'objet a été ajouté, <code>False</code> si le sac est plein ou s'il contient déjà l'objet.</li><li><code>retirer(objet)</code> l'enlève s'il est là.</li><li>La propriété <code>objets</code> renvoie un tuple.</li></ul><p>Crée <code>sac = Inventaire(2)</code> et ajoute <code>"corde"</code>.</p>`,
      code:``,
      sol:`class Inventaire:
    def __init__(self, capacite=5):
        self._capacite = capacite
        self._objets = []

    def ajouter(self, objet):
        if len(self._objets) >= self._capacite or objet in self._objets:
            return False
        self._objets.append(objet)
        return True

    def retirer(self, objet):
        if objet in self._objets:
            self._objets.remove(objet)

    @property
    def objets(self):
        return tuple(self._objets)

sac = Inventaire(2)
sac.ajouter("corde")`,
      hints:['Dans <code>ajouter</code>, refuse d’abord : <code>if len(self._objets) &gt;= self._capacite or objet in self._objets: return False</code>.','<code>retirer</code> : <code>if objet in self._objets: self._objets.remove(objet)</code>. La propriété : <code>return tuple(self._objets)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
_s = Inventaire(2)
print("#A", _s.ajouter("a"), _s.ajouter("a"), _s.ajouter("b"), _s.ajouter("c"))
print("#B", _s.objets)
_s.retirer("a")
_s.retirer("zzz")
print("#C", _s.ajouter("c"), _s.objets)
print("#D", len(Inventaire()._objets) if hasattr(Inventaire(), "_objets") else "?", type(_s.objets).__name__)
_d = Inventaire()
for _o in "abcdefg":
    _d.ajouter(_o)
print("#E", len(_d.objets))`);
        if (t.err) return TESTERR(t);
        if (!/#A True False True False/.test(t.out)) return 'Avec une capacité de 2 : ajouter "a" → True, encore "a" → False (doublon), "b" → True, "c" → False (plein).';
        if (!/#B \('a', 'b'\)/.test(t.out)) return 'La propriété <code>objets</code> doit renvoyer un tuple avec les objets dans l’ordre d’ajout.';
        if (!/#C True \('b', 'c'\)/.test(t.out)) return 'Après <code>retirer("a")</code>, il doit y avoir de la place pour "c". Et retirer un objet absent ne doit pas planter.';
        if (!/tuple/.test(t.out)) return '<code>objets</code> doit renvoyer un <strong>tuple</strong>.';
        if (!/#E 5/.test(t.out)) return 'Par défaut, la capacité doit être de 5.';
        return true;
      },
      ok:'Toutes les portes d’entrée vérifient l’invariant, et la seule porte de sortie donne un tuple. Ton inventaire est blindé.' }
  ],
  recap:['Un <strong>invariant</strong> (<em>invariant</em>) est une règle toujours vraie pour l’objet : <code>0 &lt;= pv &lt;= pv_max</code>.','Le constructeur l’<strong>établit</strong>, chaque méthode publique le <strong>préserve</strong>. Avec des attributs privés, seule la classe peut le casser.','Ne laisse pas fuir une liste interne : renvoie <code>tuple(...)</code> en Python, <code>List.copyOf(...)</code> en Java.','Objet <strong>immuable</strong> (<em>immutable</em>) : attributs <code>final</code> en Java, propriétés sans setter en Python. Pour « modifier », on renvoie un nouvel objet.'] };

/* ---------- 3.5 ---------- */
const H1 = `class Personnage:
    def __init__(self, nom, pv_max=100):
        if pv_max <= 0:
            raise ValueError("pv_max doit être positif")
        self._nom = nom
        self._pv_max = pv_max
        self._pv = pv_max

    @property
    def nom(self):
        return self._nom

    @property
    def pv(self):
        return self._pv

    @property
    def pv_max(self):
        return self._pv_max`;
const H2 = `

    def recevoir(self, degats):
        if degats < 0:
            raise ValueError("dégâts négatifs")
        self._pv = max(0, self._pv - degats)

    def soigner(self, n):
        if n < 0:
            raise ValueError("soin négatif")
        self._pv = min(self._pv_max, self._pv + n)

    @property
    def est_vivant(self):
        return self._pv > 0`;
const H3 = `

    def __str__(self):
        return f"{self._nom} [{self._pv}/{self._pv_max} PV]"`;
LES['p3-5'] = { title:'Projet : des points de vie protégés', dur:'16 min',
  intro:'Tu reprends le Personnage du chapitre 2 et tu le blindes : attributs internes, propriétés en lecture seule, vérifications, invariant garanti. Plus personne ne pourra tricher.',
  steps:[
    { t:'say', h:'Le projet',
      p:`<p>L'invariant de notre <code>Personnage</code> : <strong><code>0 &lt;= pv &lt;= pv_max</code></strong>, et <code>pv_max &gt; 0</code>. Le nom ne change jamais. À la fin, ce code devra marcher :</p>`,
      snip:`sam = Personnage("Sam", 120)
sam.recevoir(50)
print(sam)            # Sam [70/120 PV]
sam.soigner(500)
print(sam.pv)         # 120
sam.pv = 9999         # AttributeError : lecture seule
sam.recevoir(-10)     # ValueError : dégâts négatifs`,
      p2:`<p>Trois étapes. Je reprends ton code à chaque fois.</p>` },
    { t:'code', h:'Étape 1 : attributs internes et propriétés', file:'personnage.py', mem:1,
      p:`<p>Écris la classe <code>Personnage</code>. Le constructeur reçoit <code>nom</code> et <code>pv_max</code> (100 par défaut), lève <code>ValueError</code> si <code>pv_max &lt;= 0</code>, et range <code>_nom</code>, <code>_pv_max</code> et <code>_pv</code> (qui démarre au maximum).</p><p>Ajoute trois propriétés <strong>en lecture seule</strong> : <code>nom</code>, <code>pv</code> et <code>pv_max</code>. Crée <code>sam = Personnage("Sam", 120)</code>.</p>`,
      code:``,
      sol: H1 + `

sam = Personnage("Sam", 120)`,
      hints:['Trois attributs avec <code>_</code> dans le constructeur, après la vérification de <code>pv_max</code>.','Pour chaque propriété : <code>@property</code>, puis <code>def pv(self): return self._pv</code>. Pas de setter.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (attr(r, 'sam', '_pv') !== '120' || attr(r, 'sam', '_pv_max') !== '120' || attr(r, 'sam', '_nom') !== "'Sam'") return 'L’objet <code>sam</code> doit avoir trois attributs internes : <code>_nom</code> (Sam), <code>_pv_max</code> (120) et <code>_pv</code> (120).';
        const t = await test([], code + '\n_p = Personnage("P")\nprint("#V", _p.nom, _p.pv, _p.pv_max)' + tryPy('A', '_p.pv = 5', 'AttributeError') + tryPy('B', '_p.nom = "X"', 'AttributeError') + tryPy('C', 'Personnage("Z", 0)'));
        if (t.err) return TESTERR(t);
        if (!/#V P 100 100/.test(t.out)) return 'Je crée <code>Personnage("P")</code> : nom P, pv 100, pv_max 100 attendus, lus par les propriétés.';
        if (!/#A ERREUR/.test(t.out) || !/#B ERREUR/.test(t.out)) return '<code>pv</code> et <code>nom</code> doivent être en lecture seule : des propriétés sans setter.';
        if (!/#C ERREUR/.test(t.out)) return '<code>Personnage("Z", 0)</code> doit lever une <code>ValueError</code>.';
        return true;
      },
      ok:'Le constructeur établit l’invariant, et les propriétés empêchent d’écrire directement.' },
    { t:'code', carry:1, h:'Étape 2 : les seules portes d’entrée', file:'personnage.py', mem:1,
      p:`<p>Ajoute dans la classe :</p><ul><li><code>recevoir(degats)</code> : <code>ValueError</code> si les dégâts sont négatifs, et les PV ne descendent pas sous 0 ;</li><li><code>soigner(n)</code> : <code>ValueError</code> si n est négatif, et les PV ne dépassent pas <code>pv_max</code> ;</li><li>une propriété <code>est_vivant</code>.</li></ul>`,
      code:`# Étape 2 : recevoir, soigner et est_vivant, dans la classe
`,
      sol: H1 + H2 + `

sam = Personnage("Sam", 120)`,
      hints:['Chaque méthode commence par vérifier : <code>if degats &lt; 0: raise ValueError("dégâts négatifs")</code>.','Puis <code>max(0, ...)</code> et <code>min(self._pv_max, ...)</code>, comme au chapitre 2. <code>est_vivant</code> est une propriété : <code>@property</code> au-dessus.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + '\n_p = Personnage("P", 50)\n_p.recevoir(20)\nprint("#A", _p.pv, _p.est_vivant)\n_p.soigner(99)\nprint("#B", _p.pv)\n_p.recevoir(99)\nprint("#C", _p.pv, _p.est_vivant)' + tryPy('D', '_p.recevoir(-1)') + tryPy('E', '_p.soigner(-1)'));
        if (t.err) return TESTERR(t);
        if (!/#A 30 True/.test(t.out)) return '50 PV moins 20 : 30 PV, et <code>est_vivant</code> (sans parenthèses) vaut True.';
        if (!/#B 50/.test(t.out)) return 'Le soin ne doit pas dépasser <code>pv_max</code>.';
        if (!/#C 0 False/.test(t.out)) return 'Les PV ne doivent pas descendre sous 0.';
        if (!/#D ERREUR/.test(t.out) || !/#E ERREUR/.test(t.out)) return 'Des dégâts ou un soin négatifs doivent lever une <code>ValueError</code> (sinon, des dégâts négatifs serviraient à soigner sans limite !).';
        return true;
      },
      ok:'Chaque porte d’entrée vérifie l’invariant. Même un « soin déguisé » en dégâts négatifs est refusé.' },
    { t:'code', carry:1, h:'Étape 3 : l’affichage et la preuve', file:'personnage.py',
      p:`<p>Ajoute une méthode <code>__str__(self)</code> qui renvoie par exemple <code>Sam [70/120 PV]</code> : avec elle, <code>print(sam)</code> affiche ce texte (tu en sauras plus au chapitre 4).</p><p>Puis, sous la classe, rejoue le scénario : Sam reçoit 50, on l'affiche, il est soigné de 500, on affiche ses PV. Enfin, essaie <code>sam.pv = 9999</code> dans un <code>try</code>, et affiche <code>Triche refusée</code> dans le <code>except AttributeError</code>.</p>`,
      code:`# Étape 3 : __str__ dans la classe, puis le scénario
`,
      sol: H1 + H2 + H3 + `

sam = Personnage("Sam", 120)
sam.recevoir(50)
print(sam)
sam.soigner(500)
print(sam.pv)
try:
    sam.pv = 9999
except AttributeError:
    print("Triche refusée")`,
      hints:['<code>def __str__(self): return f"{self._nom} [{self._pv}/{self._pv_max} PV]"</code>','Le <code>try</code> : <code>try:</code> → <code>sam.pv = 9999</code>, puis <code>except AttributeError:</code> → <code>print("Triche refusée")</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/Sam \[70\/120 PV\]/.test(r.out)) return 'Après 50 dégâts, <code>print(sam)</code> doit afficher <code>Sam [70/120 PV]</code>.';
        if (!/^120$/m.test(r.out)) return 'Après un soin de 500, affiche <code>sam.pv</code> : 120.';
        if (!/Triche refusée/.test(r.out)) return 'Il manque le <code>try</code> qui tente <code>sam.pv = 9999</code> et affiche <code>Triche refusée</code>.';
        const t = await test([], code + '\nprint("#T", Personnage("Zoé", 30))');
        if (t.err || !/#T Zoé \[30\/30 PV\]/.test(t.out)) return '<code>__str__</code> doit marcher pour tout personnage : <code>Zoé [30/30 PV]</code>.';
        return true;
      },
      ok:'Ton Personnage est blindé : son invariant tient quoi que fasse le reste du programme.' },
    { t:'compare', h:'La version Java',
      p:`<p>La même classe en Java. Les attributs sont <code>private</code>, le nom est <code>final</code>, et il n'y a aucun setter : seulement des méthodes d'intention.</p>`,
      py: H1 + H2,
      java:`public class Personnage {
    private final String nom;
    private final int pvMax;
    private int pv;

    public Personnage(String nom, int pvMax) {
        if (pvMax <= 0) {
            throw new IllegalArgumentException("pvMax doit être positif");
        }
        this.nom = nom;
        this.pvMax = pvMax;
        this.pv = pvMax;
    }

    public String getNom() { return nom; }
    public int getPv() { return pv; }
    public int getPvMax() { return pvMax; }
    public boolean isVivant() { return pv > 0; }

    public void recevoir(int degats) {
        if (degats < 0) throw new IllegalArgumentException("dégâts négatifs");
        pv = Math.max(0, pv - degats);
    }

    public void soigner(int n) {
        if (n < 0) throw new IllegalArgumentException("soin négatif");
        pv = Math.min(pvMax, pv + n);
    }
}`,
      notes:['Les propriétés Python deviennent des getters : <code>getPv()</code>, et <code>isVivant()</code> pour le booléen.','<code>final</code> garantit que le nom et le maximum ne changent jamais, même depuis la classe.','Un <code>if</code> Java avec une seule instruction peut s’écrire sans accolades, sur une ligne.'] },
    { t:'fill', lang:'java', h:'Dernière vérification Java',
      p:`<p>Complète cette partie de la classe Java.</p>`,
      tpl:`public class Personnage {
    [[private]] [[final]] String nom;
    private int pv;

    public [[boolean]] isVivant() {
        return pv > 0;
    }

    public void recevoir(int degats) {
        if (degats < 0) [[throw]] new IllegalArgumentException("dégâts négatifs");
        pv = Math.max(0, pv - degats);
    }
}`,
      hints:['Le nom est caché, et il ne change jamais.','<code>private</code>, <code>final</code>, <code>boolean</code>, <code>throw</code>.'],
      ok:'Tu sais maintenant lire et écrire une classe Java bien encapsulée. C’est exactement ce qu’on attend dans un examen.' },
    { t:'say', h:'Mini-défi dans VS Code',
      p:`<p>Dans VS Code, crée <code>Personnage.java</code> avec la classe ci-dessus, et une classe <code>Jeu.java</code> avec un <code>main</code> qui :</p><ol><li>crée Sam avec 120 PV ;</li><li>lui inflige 50 dégâts, puis affiche <code>sam.getPv()</code> ;</li><li>essaie d'écrire <code>sam.pv = 9999;</code>.</li></ol><p>Lis l'erreur du compilateur sur la ligne 3 : c'est l'encapsulation en action. Enlève-la, puis entoure un <code>sam.recevoir(-10)</code> d'un <code>try { ... } catch (IllegalArgumentException e) { System.out.println("Refusé"); }</code>.</p>` }
  ],
  recap:['Attributs internes (<code>_pv</code>), propriétés en lecture seule, et seulement des méthodes d’intention pour modifier.','Chaque méthode publique vérifie ses paramètres et préserve l’invariant <code>0 &lt;= pv &lt;= pv_max</code>.','<code>__str__</code> donne le texte affiché par <code>print(objet)</code>.','En Java : <code>private</code>, <code>final</code>, getters, et <code>throw new IllegalArgumentException(...)</code>.'] };

Atelier.chapter({ part:"poo", n:3, title:"Encapsulation",
  lessons:['p3-1','p3-2','p3-3','p3-4','p3-5'].map(id => ({ id, ...LES[id] })) });
})();
