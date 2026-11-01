/* Partie POO · Chapitre 1 : Penser en objets */
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has } = Atelier.h;
const LES = {};
// Aides locales : l'attribut d'un objet en mémoire, et un code de départ inchangé.
const attr = (r, o, a) => { const m = memOf(r, o); const x = m && m.attrs && m.attrs.find(t => t.name === a); return x ? x.repr : undefined; };
const same = (code, start) => code.trim() === start.trim();
const START = 'Voilà le bug ! Exécute, lis ce qui se passe, puis corrige le code.';

const PERSO = `class Personnage:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

    def recevoir(self, degats):
        self.pv -= degats
`;

/* ---------- 1.1 ---------- */
const BUG11 = `heros = {"nom": "Sam", "pv": 100}
heros["pvv"] = heros["pv"] - 10
print(heros["pv"])`;
LES['p1-1'] = { title:'Pourquoi la POO ?', dur:'10 min',
  intro:'Tu sais déjà écrire des programmes avec des variables, des listes et des fonctions. Ici, tu découvres pourquoi les grands programmes s’organisent autrement : avec des objets.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur les bases', p:`<p>Qu'affiche ce code ?</p>`, snip:`heros = {"nom": "Sam", "pv": 80}

def soigner(perso, n):
    perso["pv"] += n

soigner(heros, 15)
print(heros["pv"])`,
      opts:[ {l:'80', why:'La fonction reçoit le dictionnaire lui-même, pas une copie. Elle le modifie pour de bon.'},
             {l:'15', why:'<code>+=</code> ajoute 15 à la valeur déjà présente, il ne la remplace pas.'},
             {l:'95', ok:1},
             {l:'Une erreur', why:'Tout est correct : la fonction modifie la clé <code>"pv"</code> du dictionnaire.'} ],
      ex:'La fonction modifie le dictionnaire qu’on lui donne. Retiens ce style : des données d’un côté, des fonctions de l’autre. On va le comparer aux objets.' },
    { t:'say', h:'Une façon d’organiser un programme', file:'procedural.py', mem:1,
      p:`<p>Un <strong>paradigme</strong> (<em>paradigm</em>), c'est une façon d'organiser un programme. Jusqu'ici, tu as codé en style <strong>procédural</strong> (<em>procedural</em>) : des données (des dictionnaires) et des fonctions qui agissent dessus, chacun de son côté.</p><p>C'est aussi le style du C, avec ses <code>struct</code> et ses fonctions. Exécute et regarde la mémoire.</p>`,
      code:`heros = {"nom": "Sam", "pv": 100}
monstre = {"nom": "Gobelin", "pv": 30}

def frapper(cible, degats):
    cible["pv"] -= degats

frapper(monstre, 12)
print(monstre["nom"], "a encore", monstre["pv"], "PV")` },
    { t:'say', h:'Le problème : tout le monde touche à tout', file:'triche.py', mem:1,
      p:`<p>Dans ce style, <strong>n'importe quelle ligne</strong> du programme peut modifier les données. Rien n'empêche un PV négatif, ou une faute de frappe qui crée une nouvelle clé sans prévenir.</p><p>Sur 50 lignes, ça va. Sur 50 000 lignes écrites par une équipe pendant des années, quand un bug arrive, chaque ligne est suspecte.</p>`,
      code:`heros = {"nom": "Sam", "pv": 100}

# Quelque part, très loin dans le programme...
heros["pv"] = -500
heros["nmo"] = "Bob"

print(heros)` },
    { t:'say', h:'La même chose avec des objets', file:'objets.py', mem:1,
      p:`<p>La <strong>programmation orientée objet</strong> (<em>object-oriented programming</em>, la POO) range ensemble les données <strong>et</strong> les fonctions qui les utilisent, dans une même unité : un <strong>objet</strong>.</p><p>Ne cherche pas encore à tout comprendre dans la classe. Regarde surtout les deux dernières lignes : on <strong>demande au monstre</strong> de recevoir des dégâts. Et dans la mémoire, chaque objet garde ses propres valeurs.</p>`,
      code: PERSO + `
heros = Personnage("Sam", 100)
monstre = Personnage("Gobelin", 30)

monstre.recevoir(12)
print(monstre.nom, "a encore", monstre.pv, "PV")` },
    { t:'quiz', h:'Les paradigmes', p:`<p>Quel paradigme organise un programme autour d'objets qui regroupent des données et le comportement qui va avec ?</p>`,
      opts:[ {l:'Le procédural', why:'Le procédural sépare les données et les fonctions. C’est ce que tu faisais avec les dictionnaires.'},
             {l:'Le fonctionnel', why:'Le fonctionnel (<em>functional</em>) construit tout avec des fonctions « pures » et des valeurs qui ne changent pas, comme en Haskell.'},
             {l:'Le logique', why:'La programmation logique décrit des faits et des règles, comme en Prolog. Rien à voir avec des objets.'},
             {l:'L’orienté objet', ok:1} ],
      ex:'La POO (<em>object-oriented</em>) : chaque objet porte ses données et ses méthodes. Java et Python savent faire les deux styles : on dit qu’ils sont multi-paradigmes.' },
    { t:'quiz', h:'Tu utilises déjà des objets', p:`<p>Dans ce code, que représente <code>upper</code> ?</p>`, snip:`nom = "sam"
print(nom.upper())`,
      opts:[ {l:'Une variable', why:'La variable, c’est <code>nom</code>. <code>upper</code> vient après le point et a des parenthèses.'},
             {l:'Une action que le texte sait faire', ok:1},
             {l:'Un module à importer', why:'Pas besoin d’import : <code>upper</code> appartient au texte lui-même.'},
             {l:'Un type, comme str', why:'Le type de <code>nom</code> est <code>str</code>. <code>upper</code> est une action de ce type.'} ],
      ex:'En Python, tout est objet, même le texte. <code>upper()</code> est une <strong>méthode</strong> (<em>method</em>) : une fonction qui appartient à l’objet. La POO, c’est apprendre à créer tes propres objets.' },
    { t:'code', h:'À toi : un deuxième monstre', file:'dragon.py', mem:1,
      p:`<p>La classe <code>Personnage</code> est prête. Sous le code, crée un objet <code>dragon</code> qui s'appelle <code>"Dragon"</code> et a 200 PV. Frappe-le de 45 dégâts avec sa méthode <code>recevoir</code>, puis affiche ses PV.</p>`,
      code: PERSO + `
# Crée le dragon ici
`,
      sol: PERSO + `
dragon = Personnage("Dragon", 200)
dragon.recevoir(45)
print(dragon.pv)`,
      hints:['On crée un objet comme dans l’exemple : <code>dragon = Personnage("Dragon", 200)</code>.','Puis <code>dragon.recevoir(45)</code> et <code>print(dragon.pv)</code>.'],
      check:(r, code) => {
        if (r.err) return ERR;
        const d = memOf(r, 'dragon');
        if (!d || !d.attrs) return 'Je ne trouve pas d’objet <code>dragon</code> dans la mémoire. Crée-le avec <code>Personnage(...)</code>.';
        if (attr(r, 'dragon', 'nom') !== "'Dragon'") return 'Ton dragon doit s’appeler <code>"Dragon"</code>.';
        if (!/\.recevoir\s*\(/.test(strip(code))) return 'Utilise la méthode <code>recevoir</code> pour frapper le dragon.';
        if (attr(r, 'dragon', 'pv') !== '155') return `Ton dragon a ${esc(attr(r, 'dragon', 'pv'))} PV. Avec 200 PV et 45 dégâts, il devrait en avoir 155.`;
        if (!/(^|\D)155(\D|$)/.test(r.out)) return 'Le dragon a bien 155 PV. Affiche-les avec <code>print(dragon.pv)</code>.';
        return true;
      },
      ok:'Tu as créé un objet et tu lui as envoyé un message. Le dragon et le gobelin partagent le même plan, mais chacun garde ses PV.' },
    { t:'code', defi:1, h:'Combien de coups ?', file:'coups.py', mem:1,
      p:`<p>Le gobelin a 30 PV. Avec une boucle <code>while</code>, frappe-le de 7 dégâts tant qu'il a plus de 0 PV, et compte les coups. Affiche ensuite <code>5 coups</code>.</p><p>Je testerai aussi ton code avec un gobelin de 50 PV.</p>`,
      code: PERSO + `
gobelin = Personnage("Gobelin", 30)
coups = 0
`,
      sol: PERSO + `
gobelin = Personnage("Gobelin", 30)
coups = 0
while gobelin.pv > 0:
    gobelin.recevoir(7)
    coups += 1
print(coups, "coups")`,
      hints:['La condition de la boucle : <code>while gobelin.pv &gt; 0:</code>','Dans la boucle : <code>gobelin.recevoir(7)</code> puis <code>coups += 1</code>. Après la boucle : <code>print(coups, "coups")</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/while/.test(strip(code))) return 'Il faut une boucle <code>while</code>.';
        if (!/(^|\D)5\s*coups/.test(r.out)) return 'Pour 30 PV et 7 dégâts par coup, il faut afficher <code>5 coups</code>.';
        const t = await test([], code.replace(/Personnage\(\s*"Gobelin"\s*,\s*30\s*\)/, 'Personnage("Gobelin", 50)'));
        if (t.err || !/(^|\D)8\s*coups/.test(t.out)) return 'Ça marche pour 30 PV, mais avec 50 PV il faudrait <code>8 coups</code>. Laisse la boucle compter toute seule.';
        return true;
      },
      ok:'Testé avec 50 PV : 8 coups. Ta boucle parle à l’objet avec <code>gobelin.pv</code> et <code>gobelin.recevoir(7)</code>.' },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py', mem:1,
      p:`<p>Ce code devrait enlever 10 PV au héros et afficher <code>90</code>. Il ne plante pas, mais il affiche 100. Regarde la mémoire pour trouver ce qui cloche.</p>`,
      code: BUG11,
      sol:`heros = {"nom": "Sam", "pv": 100}
heros["pv"] = heros["pv"] - 10
print(heros["pv"])`,
      hints:['Dans la mémoire, le dictionnaire a une clé en trop.','La clé <code>"pvv"</code> a une faute de frappe : il faut <code>"pv"</code>.'],
      check:(r, code) => {
        if (same(code, BUG11)) return START;
        if (r.err) return ERR;
        const h = memOf(r, 'heros');
        if (h && /pvv/.test(h.repr)) return 'Le dictionnaire contient encore une clé <code>"pvv"</code>.';
        if (!/(^|\D)90(\D|$)/.test(r.out)) return 'Il faut afficher 90.';
        return true;
      },
      ok:'Une faute de frappe, et Python crée une clé sans rien dire. Ce genre de bug est fréquent quand les données sont à la merci de tout le programme. Les objets vont nous aider à les protéger.' }
  ],
  recap:['Un <strong>paradigme</strong> (<em>paradigm</em>) est une façon d’organiser un programme : procédural, objet, fonctionnel…','Procédural : les données et les fonctions sont séparées, et tout le monde peut tout modifier.','POO : un <strong>objet</strong> regroupe ses données et ses méthodes. On lui envoie des messages : <code>monstre.recevoir(12)</code>.','La POO sert à maîtriser la complexité des gros programmes.'] };

/* ---------- 1.2 ---------- */
const TORCHE = `class Torche:
    def __init__(self, lieu):
        self.lieu = lieu
        self.allumee = False

    def basculer(self):
        self.allumee = not self.allumee

    def etat(self):
        if self.allumee:
            return self.lieu + " : allumée"
        return self.lieu + " : éteinte"
`;
const BUG12 = TORCHE + `
t = Torche("Grotte")
t.basculer
print(t.etat())`;
LES['p1-2'] = { title:'Objets : état, comportement, identité', dur:'12 min',
  intro:'Classe, objet, attribut, méthode : ces mots reviendront dans chaque cours de POO. Ici, tu les apprends en manipulant des objets, et tu découvres les trois choses que possède chaque objet.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Dans <code>monstre.recevoir(12)</code>, que fait-on ?</p>`,
      opts:[ {l:'On crée un nouveau monstre', why:'Pour créer un objet, on appelle la classe : <code>Personnage("Gobelin", 30)</code>.'},
             {l:'On demande au monstre de recevoir 12 dégâts', ok:1},
             {l:'On range 12 dans la variable monstre', why:'Il n’y a pas de <code>=</code> : on ne range rien, on appelle une méthode.'},
             {l:'On appelle une fonction qui s’appelle monstre', why:'<code>monstre</code> est un objet. Ce qui vient après le point est sa méthode.'} ],
      ex:'On envoie un <strong>message</strong> (<em>message</em>) à l’objet : on appelle sa méthode <code>recevoir</code>.' },
    { t:'say', h:'Un plan, plusieurs objets', file:'potions.py', mem:1,
      p:`<p>Une <strong>classe</strong> (<em>class</em>) est un plan qui décrit un genre d'objet. Un <strong>objet</strong> (<em>object</em>, ou <em>instance</em>) est fabriqué à partir de ce plan, avec ses propres valeurs.</p><p>Les données d'un objet sont ses <strong>attributs</strong> (<em>attributes</em>, ou <em>fields</em>). Ses actions sont ses <strong>méthodes</strong> (<em>methods</em>). Exécute : trois potions, un seul plan.</p>`,
      code:`class Potion:
    def __init__(self, nom, soin):
        self.nom = nom
        self.soin = soin

    def decrire(self):
        return f"{self.nom} (+{self.soin} PV)"

petite = Potion("Petite potion", 10)
grande = Potion("Grande potion", 50)
elixir = Potion("Élixir", 100)
print(grande.decrire())` },
    { t:'say', h:'L’état d’un objet', file:'torches.py', mem:1,
      p:`<p>L'<strong>état</strong> (<em>state</em>) d'un objet, ce sont les valeurs actuelles de ses attributs. Ses méthodes forment son <strong>comportement</strong> (<em>behaviour</em>) : ce qu'il sait faire. Souvent, elles changent son état.</p><p>Ici, on bascule une seule des deux torches. Regarde la mémoire : l'autre n'a pas bougé.</p>`,
      code: TORCHE + `
grotte = Torche("Grotte")
donjon = Torche("Donjon")
grotte.basculer()
print(grotte.etat())
print(donjon.etat())` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Avec la classe <code>Torche</code> de l'étape d'avant, qu'affiche ce code ?</p>`, snip:`a = Torche("Tour")
b = Torche("Cave")
a.basculer()
a.basculer()
b.basculer()
print(a.allumee, b.allumee)`,
      opts:[ {l:'True True', why:'<code>a</code> est basculée deux fois : allumée, puis éteinte.'},
             {l:'False True', ok:1},
             {l:'True False', why:'Chaque objet a son propre état. <code>b</code> a été basculée une fois, donc elle est allumée.'},
             {l:'False False', why:'<code>b.basculer()</code> allume la torche b.'} ],
      ex:'Deux bascules ramènent <code>a</code> à éteinte. <code>b</code> vit sa vie : une bascule, elle est allumée. Même plan, états différents.' },
    { t:'say', h:'L’identité', file:'identite.py', mem:1,
      p:`<p>Chaque objet a aussi une <strong>identité</strong> (<em>identity</em>) : c'est <strong>cet</strong> objet-là et pas un autre, même si un autre a exactement les mêmes valeurs. Comme deux jumeaux : même tête, deux personnes.</p><p>L'opérateur <code>is</code> demande : « est-ce le même objet ? ». Tu creuseras ça au chapitre 2.</p>`,
      code:`class Potion:
    def __init__(self, nom, soin):
        self.nom = nom
        self.soin = soin

p1 = Potion("Soin", 20)
p2 = Potion("Soin", 20)
print(p1 is p2)
print(p1 is p1)` },
    { t:'quiz', h:'Le bon mot', p:`<p>Dans <code>sac.ajouter(epee)</code>, quel objet reçoit le message ?</p>`,
      opts:[ {l:'epee', why:'<code>epee</code> est l’argument : ce qu’on donne au sac. Le message est envoyé à l’objet avant le point.'},
             {l:'ajouter', why:'<code>ajouter</code> est la méthode, le message lui-même.'},
             {l:'sac', ok:1},
             {l:'Aucun, c’est une fonction', why:'Le point montre qu’on appelle une méthode d’un objet.'} ],
      ex:'L’objet avant le point reçoit le message. Lis-le comme une phrase : « sac, ajoute l’épée ».' },
    { t:'quiz', h:'Vocabulaire', p:`<p>Dans la classe <code>Torche</code>, qu'est-ce que <code>allumee</code> ?</p>`,
      opts:[ {l:'Une méthode', why:'Une méthode s’écrit avec <code>def</code> et s’appelle avec des parenthèses. <code>allumee</code> est une valeur.'},
             {l:'Un attribut', ok:1},
             {l:'Une classe', why:'La classe, c’est <code>Torche</code>, avec une majuscule.'},
             {l:'Un objet', why:'Les objets, ce sont <code>grotte</code> et <code>donjon</code>.'} ],
      ex:'<code>allumee</code> est un attribut : une donnée rangée dans chaque objet. Les attributs forment l’état, les méthodes le comportement.' },
    { t:'code', h:'À toi : deux torches', file:'deux_torches.py', mem:1,
      p:`<p>Crée deux torches : <code>cave</code> (lieu <code>"Cave"</code>) et <code>tour</code> (lieu <code>"Tour"</code>). Allume seulement la cave avec <code>basculer()</code>, puis affiche l'état des deux.</p>`,
      code: TORCHE + `
# Tes deux torches
`,
      sol: TORCHE + `
cave = Torche("Cave")
tour = Torche("Tour")
cave.basculer()
print(cave.etat())
print(tour.etat())`,
      hints:['<code>cave = Torche("Cave")</code>, et pareil pour la tour.','<code>cave.basculer()</code>, puis <code>print(cave.etat())</code> et <code>print(tour.etat())</code>.'],
      check:r => {
        if (r.err) return ERR;
        if (!memOf(r, 'cave') || !memOf(r, 'tour')) return 'Il faut deux objets : <code>cave</code> et <code>tour</code>.';
        if (attr(r, 'cave', 'allumee') !== 'True') return 'La torche de la cave doit être allumée.';
        if (attr(r, 'tour', 'allumee') !== 'False') return 'La torche de la tour doit rester éteinte.';
        if (!/Cave : allumée/.test(r.out) || !/Tour : éteinte/.test(r.out)) return 'Les torches sont bonnes. Affiche leur état avec <code>etat()</code>.';
        return true;
      },
      ok:'Regarde la mémoire : deux objets, deux états. Ils partagent le code, pas les valeurs.' },
    { t:'code', defi:1, h:'Le total des soins', file:'total.py', mem:1,
      p:`<p>Crée une liste <code>sac</code> qui contient trois potions de ton choix. Puis, avec une boucle <code>for</code>, calcule le total des soins de ton sac et affiche-le.</p><p>Je testerai aussi ton code avec un autre sac.</p>`,
      code:`class Potion:
    def __init__(self, nom, soin):
        self.nom = nom
        self.soin = soin

sac = []
`,
      sol:`class Potion:
    def __init__(self, nom, soin):
        self.nom = nom
        self.soin = soin

sac = [Potion("Petite", 10), Potion("Moyenne", 25), Potion("Grande", 50)]
total = 0
for p in sac:
    total += p.soin
print(total)`,
      hints:['Une liste d’objets : <code>sac = [Potion("Petite", 10), Potion("Grande", 50), ...]</code>.','<code>total = 0</code>, puis <code>for p in sac:</code> et <code>total += p.soin</code>. Enfin, <code>print(total)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const s = memOf(r, 'sac');
        if (!s || s.type !== 'list') return 'Garde la liste <code>sac</code>.';
        if ((s.repr.match(/Potion object/g) || []).length < 3) return 'Ton sac doit contenir trois objets <code>Potion</code>.';
        if (!/for\s/.test(strip(code))) return 'Calcule le total avec une boucle <code>for</code>.';
        const t = await test([], code + '\nprint("#S", sum([p.soin for p in sac]))');
        const m = t.out.match(/#S (-?\d+)/);
        if (t.err || !m) return 'Je n’arrive pas à relire les soins de ton sac. Garde une liste <code>sac</code> de potions.';
        if (!new RegExp('(^|\\D)' + m[1] + '(\\D|$)').test(r.out)) return `Les potions de ton sac soignent ${m[1]} PV en tout, mais je ne vois pas ce total dans ce que tu affiches. Additionne les <code>p.soin</code> dans la boucle, puis affiche le total.`;
        return true;
      },
      ok:'Une liste d’objets et une boucle : tu vas voir ça partout. Chaque <code>p</code> est un objet complet, avec ses attributs.' },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py', mem:1,
      p:`<p>Ce code devrait allumer la torche et afficher <code>Grotte : allumée</code>. Il ne plante pas, mais la torche reste éteinte. Trouve l'erreur.</p>`,
      code: BUG12,
      sol: TORCHE + `
t = Torche("Grotte")
t.basculer()
print(t.etat())`,
      hints:['Compare la ligne <code>t.basculer</code> avec la ligne du dessous.','Pour appeler une méthode, il faut des parenthèses : <code>t.basculer()</code>.'],
      check:(r, code) => {
        if (same(code, BUG12)) return START;
        if (r.err) return ERR;
        if (!/Grotte : allumée/.test(r.out)) return 'La torche est encore éteinte.';
        return true;
      },
      ok:'Sans parenthèses, Python désigne la méthode sans l’appeler. Rien ne se passe, et aucune erreur ne prévient. Erreur très fréquente !' }
  ],
  recap:['Une <strong>classe</strong> (<em>class</em>) est un plan. Un <strong>objet</strong> (<em>instance</em>) est fabriqué avec ce plan.','<strong>Attributs</strong> (<em>attributes</em>) : les données de l’objet. <strong>Méthodes</strong> (<em>methods</em>) : ses actions.','Chaque objet a un <strong>état</strong> (ses valeurs), un <strong>comportement</strong> (ses méthodes) et une <strong>identité</strong> (c’est lui et pas un autre).','<code>a is b</code> teste si a et b sont le même objet.','On appelle une méthode avec des parenthèses : <code>t.basculer()</code>.'] };

/* ---------- 1.3 ---------- */
const BUG13 = `class Monstre:
    def __init__(self, nom, pv):
        self.nom = nom
        self._pv = pv

    def recevoir(self, degats):
        self._pv = max(0, self._pv - degats)

    def pv(self):
        return self._pv

orc = Monstre("Orc", 40)
orc._pv = orc._pv - 55
print(orc.pv())`;
LES['p1-3'] = { title:'Les quatre piliers', dur:'12 min',
  intro:'La POO repose sur quatre idées, qu’on appelle ses piliers. Chacune aura son chapitre. Ici, tu les vois une fois chacune, en action, pour savoir où on va.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`p1 = Potion("Soin", 20)
p2 = Potion("Soin", 20)
print(p1 is p2)`,
      opts:[ {l:'True', why:'Ils ont les mêmes valeurs, mais ce sont deux objets créés séparément : deux identités.'},
             {l:'False', ok:1},
             {l:'Soin', why:'<code>is</code> donne un booléen : True ou False.'},
             {l:'Une erreur', why:'<code>is</code> fonctionne avec n’importe quels objets.'} ],
      ex:'Mêmes valeurs, mais deux objets : chacun a son identité.' },
    { t:'say', h:'Quatre piliers',
      p:`<p>Voici les quatre piliers (<em>pillars</em>) de la POO, en une phrase chacun :</p><ul><li><strong>Encapsulation</strong> (<em>encapsulation</em>) : protéger les données d'un objet, et ne laisser passer que des actions sûres.</li><li><strong>Abstraction</strong> (<em>abstraction</em>) : montrer <strong>ce que</strong> fait un objet, cacher <strong>comment</strong> il le fait.</li><li><strong>Héritage</strong> (<em>inheritance</em>) : créer une classe à partir d'une autre, en la spécialisant.</li><li><strong>Polymorphisme</strong> (<em>polymorphism</em>) : le même appel fait des choses différentes selon l'objet.</li></ul><p>Ce sont des idées de conception, pas de la syntaxe. Java et Python les permettent toutes les quatre.</p>` },
    { t:'say', h:'Encapsulation : des PV protégés', file:'encapsulation.py', mem:1,
      p:`<p>Le <code>_</code> devant <code>_pv</code> veut dire « ne touche pas directement ». On passe par la méthode <code>recevoir</code>, qui garantit que les PV ne descendent jamais sous 0.</p><p>Le monstre fait respecter ses propres règles. Tu verras ça en détail au chapitre 3.</p>`,
      code:`class Monstre:
    def __init__(self, nom, pv):
        self.nom = nom
        self._pv = pv

    def recevoir(self, degats):
        self._pv = max(0, self._pv - degats)

    def pv(self):
        return self._pv

orc = Monstre("Orc", 40)
orc.recevoir(55)
print(orc.nom, "a", orc.pv(), "PV")` },
    { t:'say', h:'Héritage : un Mage est un Personnage', file:'heritage.py', mem:1,
      p:`<p><code>class Mage(Personnage)</code> veut dire : un Mage <strong>est un</strong> Personnage, avec quelque chose en plus. Le Mage récupère <code>presenter()</code> sans la réécrire, et il ajoute sa propre méthode.</p><p>C'est le sujet du chapitre 5.</p>`,
      code:`class Personnage:
    def __init__(self, nom):
        self.nom = nom

    def presenter(self):
        return "Je suis " + self.nom

class Mage(Personnage):
    def lancer_sort(self):
        return self.nom + " lance une boule de feu !"

merlin = Mage("Merlin")
print(merlin.presenter())
print(merlin.lancer_sort())` },
    { t:'say', h:'Polymorphisme : un appel, plusieurs effets', file:'polymorphisme.py',
      p:`<p>Chaque classe a sa propre méthode <code>cri()</code>. La boucle appelle <code>p.cri()</code> sans se demander de quel genre est <code>p</code> : chaque objet répond à sa façon.</p><p>Tu y reviendras au chapitre 6. Et l'abstraction, au chapitre 7.</p>`,
      code:`class Guerrier:
    def cri(self):
        return "Pour la gloire !"

class Mage:
    def cri(self):
        return "Abracadabra !"

groupe = [Guerrier(), Mage(), Guerrier()]
for p in groupe:
    print(p.cri())` },
    { t:'quiz', h:'Quel pilier ?', p:`<p>« La même ligne <code>p.attaquer()</code> fait une chose avec un Guerrier, une autre avec un Mage. » De quel pilier parle-t-on ?</p>`,
      opts:[ {l:'L’encapsulation', why:'L’encapsulation protège les données. Ici, on parle d’un même appel aux effets différents.'},
             {l:'Le polymorphisme', ok:1},
             {l:'L’héritage', why:'L’héritage crée une classe à partir d’une autre. Il aide souvent le polymorphisme, mais ce n’est pas ce qu’on décrit ici.'},
             {l:'L’abstraction', why:'L’abstraction cache le « comment ». Ici, on parle de plusieurs comportements pour un même appel.'} ],
      ex:'Poly-morphisme = « plusieurs formes ». Un appel, plusieurs comportements.' },
    { t:'quiz', h:'Et celui-là ?', p:`<p>« Pour conduire une voiture, tu utilises le volant et les pédales. Tu n'as pas besoin de savoir comment marche le moteur. » Quel pilier ?</p>`,
      opts:[ {l:'L’abstraction', ok:1},
             {l:'L’héritage', why:'L’héritage, ce serait « une voiture de course est une voiture ».'},
             {l:'Le polymorphisme', why:'Le polymorphisme, ce serait « chaque véhicule démarre à sa façon quand on appelle demarrer() ».'},
             {l:'Aucun', why:'C’est exactement l’idée d’un des piliers : montrer le « quoi », cacher le « comment ».'} ],
      ex:'L’abstraction : on utilise un objet par ce qu’il fait, sans connaître ses détails internes.' },
    { t:'code', h:'À toi : un troisième cri', file:'voleur.py',
      p:`<p>Ajoute une classe <code>Voleur</code> dont la méthode <code>cri()</code> renvoie <code>"Hop, ni vu ni connu !"</code>. Puis ajoute un Voleur dans la liste <code>groupe</code>.</p>`,
      code:`class Guerrier:
    def cri(self):
        return "Pour la gloire !"

class Mage:
    def cri(self):
        return "Abracadabra !"

# Ta classe Voleur ici

groupe = [Guerrier(), Mage()]
for p in groupe:
    print(p.cri())`,
      sol:`class Guerrier:
    def cri(self):
        return "Pour la gloire !"

class Mage:
    def cri(self):
        return "Abracadabra !"

class Voleur:
    def cri(self):
        return "Hop, ni vu ni connu !"

groupe = [Guerrier(), Mage(), Voleur()]
for p in groupe:
    print(p.cri())`,
      hints:['Copie la forme de la classe Mage : <code>class Voleur:</code>, puis <code>def cri(self):</code> décalé de 4 espaces.','Ensuite, ajoute <code>Voleur()</code> dans la liste : <code>groupe = [Guerrier(), Mage(), Voleur()]</code>.'],
      check:(r, code) => {
        if (r.err) return ERR;
        if (!/class\s+Voleur/.test(code)) return 'Il faut une classe <code>Voleur</code>.';
        const g = memOf(r, 'groupe');
        if (!g || !/Voleur object/.test(g.repr)) return 'La liste <code>groupe</code> doit contenir un <code>Voleur()</code>.';
        if (!/ni vu ni connu/i.test(r.out)) return 'Le Voleur doit crier <code>Hop, ni vu ni connu !</code>.';
        return true;
      },
      ok:'La boucle n’a pas changé d’une ligne, et elle gère pourtant un nouveau genre de personnage. C’est la force du polymorphisme.' },
    { t:'code', defi:1, h:'Un Archer qui hérite', file:'archer.py',
      p:`<p>Crée une classe <code>Archer</code> qui hérite de <code>Personnage</code> et ajoute une méthode <code>tirer()</code> qui renvoie le nom suivi de <code>" tire une flèche !"</code>. Crée <code>robin = Archer("Robin")</code> et affiche <code>robin.presenter()</code> puis <code>robin.tirer()</code>.</p>`,
      code:`class Personnage:
    def __init__(self, nom):
        self.nom = nom

    def presenter(self):
        return "Je suis " + self.nom
`,
      sol:`class Personnage:
    def __init__(self, nom):
        self.nom = nom

    def presenter(self):
        return "Je suis " + self.nom

class Archer(Personnage):
    def tirer(self):
        return self.nom + " tire une flèche !"

robin = Archer("Robin")
print(robin.presenter())
print(robin.tirer())`,
      hints:['L’héritage s’écrit entre parenthèses : <code>class Archer(Personnage):</code>.','Dans la classe : <code>def tirer(self):</code> puis <code>return self.nom + " tire une flèche !"</code>.'],
      check:(r, code) => {
        if (r.err) return ERR;
        if (!/class\s+Archer\s*\(\s*Personnage\s*\)/.test(code)) return 'La classe doit hériter : <code>class Archer(Personnage):</code>.';
        if (/class\s+Archer[\s\S]*def\s+presenter/.test(code)) return 'Pas besoin de réécrire <code>presenter</code> dans Archer : il en hérite.';
        if (!/Je suis Robin/.test(r.out)) return 'Affiche <code>robin.presenter()</code> : on doit lire <code>Je suis Robin</code>.';
        if (!/Robin tire une flèche/.test(r.out)) return 'Affiche aussi <code>robin.tirer()</code> : <code>Robin tire une flèche !</code>.';
        return true;
      },
      ok:'Archer n’a qu’une méthode, mais il en sait deux. Hériter, c’est réutiliser sans copier.' },
    { t:'code', bug:1, h:'Répare la triche', file:'bug.py', mem:1,
      p:`<p>Ce code triche : il modifie <code>_pv</code> directement, sans passer par la méthode. Résultat, l'orc a des PV négatifs. Corrige-le pour qu'il passe par <code>recevoir</code>, et que l'orc finisse à 0 PV.</p>`,
      code: BUG13,
      sol: BUG13.replace('orc._pv = orc._pv - 55', 'orc.recevoir(55)'),
      hints:['La ligne fautive est celle qui écrit <code>orc._pv = ...</code>.','Remplace-la par <code>orc.recevoir(55)</code>.'],
      check:(r, code) => {
        if (same(code, BUG13)) return START;
        if (r.err) return ERR;
        if (/orc\._pv\s*=/.test(strip(code))) return 'Il reste une ligne qui modifie <code>orc._pv</code> directement.';
        if (attr(r, 'orc', '_pv') !== '0') return 'L’orc doit finir à 0 PV : passe par <code>recevoir(55)</code>.';
        return true;
      },
      ok:'La méthode protège la règle « jamais sous 0 ». Toucher aux attributs directement, c’est contourner les règles de l’objet. On verra au chapitre 3 comment l’empêcher.' }
  ],
  recap:['<strong>Encapsulation</strong> (<em>encapsulation</em>) : protéger les données, passer par des méthodes sûres.','<strong>Abstraction</strong> (<em>abstraction</em>) : montrer ce que fait un objet, cacher comment.','<strong>Héritage</strong> (<em>inheritance</em>) : <code>class Mage(Personnage)</code>, un Mage est un Personnage.','<strong>Polymorphisme</strong> (<em>polymorphism</em>) : le même appel, des comportements différents selon l’objet.'] };

/* ---------- 1.4 ---------- */
LES['p1-4'] = { title:'Java pour ceux qui connaissent Python', dur:'20 min',
  intro:'Le cours de POO se fait en Python et en Java. Tu connais Python : cette leçon te donne tout ce qu’il faut pour lire et écrire du Java simple. Types, accolades, points-virgules, main : on y va.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Que veut dire <code>class Mage(Personnage):</code> ?</p>`,
      opts:[ {l:'Un Mage contient un Personnage', why:'Contenir, ce serait un attribut. Les parenthèses après le nom de la classe veulent dire « hérite de ».'},
             {l:'Un Mage est un Personnage', ok:1},
             {l:'On appelle Mage avec un Personnage', why:'C’est la définition d’une classe, pas un appel.'},
             {l:'Mage et Personnage sont la même classe', why:'Ce sont deux classes. Mage récupère ce qu’a Personnage, et peut ajouter des choses.'} ],
      ex:'Les parenthèses dans <code>class Mage(Personnage)</code> veulent dire « hérite de » : c’est l’héritage.' },
    { t:'say', h:'Important : Java ne s’exécute pas ici',
      p:`<p>Sur ce site, le Python s'exécute directement dans la page. <strong>Le Java, non</strong> : il n'y a pas de bouton Exécuter pour lui. Ici, tu vas le <strong>lire</strong>, le comparer à Python, le compléter et répondre à des questions dessus. Pour le lancer pour de vrai, on utilisera VS Code (je te montre comment à la fin).</p><p>Pourquoi ? Java est un langage <strong>compilé</strong> (<em>compiled</em>) : un outil, <code>javac</code>, vérifie tout ton code et le traduit en <em>bytecode</em>. Ensuite, la machine virtuelle Java (la <em>JVM</em>) l'exécute.</p>`,
      snip:`javac Bonjour.java    (compile : crée Bonjour.class)
java Bonjour          (lance le programme sur la JVM)`,
      p2:`<p>Avantage de la compilation : beaucoup d'erreurs sont trouvées <strong>avant</strong> de lancer le programme. Une faute de type, et ça ne compile pas.</p>` },
    { t:'compare', h:'Bonjour en Python et en Java',
      p:`<p>Le même programme dans les deux langages. En Java, même un simple « bonjour » doit vivre dans une classe.</p>`,
      py:`print("Bonjour !")`,
      java:`public class Bonjour {
    public static void main(String[] args) {
        System.out.println("Bonjour !");
    }
}`,
      notes:['En Java, <strong>tout</strong> est dans une classe. Le fichier doit s’appeler comme la classe publique : <code>Bonjour.java</code>.','Le programme démarre dans la méthode <code>public static void main(String[] args)</code>. Apprends cette ligne par cœur, elle revient toujours.','<code>System.out.println(...)</code> remplace <code>print(...)</code>. <code>System.out.print(...)</code> affiche sans retour à la ligne.','Les blocs sont entre <code>{ }</code> (l’indentation n’est là que pour la lisibilité), et chaque instruction finit par un <code>;</code>.'] },
    { t:'compare', h:'Des variables avec un type',
      p:`<p>En Python, une variable prend le type de ce qu'on y range (typage <strong>dynamique</strong>, <em>dynamic typing</em>). En Java, on <strong>déclare</strong> le type, et il ne change plus jamais (typage <strong>statique</strong>, <em>static typing</em>).</p>`,
      py:`nom = "Sam"
pv = 100
force = 7.5
vivant = True
initiale = "S"`,
      java:`String nom = "Sam";
int pv = 100;
double force = 7.5;
boolean vivant = true;
char initiale = 'S';`,
      notes:['<code>int</code> pour les entiers, <code>double</code> pour les nombres à virgule, <code>boolean</code> pour vrai ou faux.','<code>String</code> prend une majuscule (c’est une classe). Le texte se met entre guillemets <strong>doubles</strong>. Les guillemets simples sont pour un seul caractère (<code>char</code>).','<code>true</code> et <code>false</code> s’écrivent en minuscules en Java.','Les commentaires : <code>// sur une ligne</code> ou <code>/* sur plusieurs */</code>, au lieu de <code>#</code>.'] },
    { t:'quiz', lang:'java', h:'Ça compile ?', p:`<p>Laquelle de ces lignes Java <strong>ne compile pas</strong> ?</p>`,
      opts:[ {l:'int vies = 3;', why:'Un entier dans un <code>int</code> : parfait.'},
             {l:'double prix = 4.5;', why:'Un nombre à virgule dans un <code>double</code> : parfait.'},
             {l:'int vies = 3.5;', ok:1},
             {l:'String nom = "Léa";', why:'Du texte entre guillemets doubles dans un <code>String</code> : parfait.'} ],
      ex:'On ne range pas 3.5 dans un <code>int</code> : le compilateur refuse, car on perdrait le 0.5. En Python, ça aurait marché sans rien dire.' },
    { t:'quiz', lang:'java', h:'Le piège de la division', p:`<p>Qu'affiche ce code Java ?</p>`, snip:`int a = 7;
int b = 2;
System.out.println(a / b);`,
      opts:[ {l:'3.5', why:'C’est ce que donnerait Python avec <code>/</code>. En Java, deux <code>int</code> donnent une division entière.'},
             {l:'3', ok:1},
             {l:'4', why:'Java n’arrondit pas : il coupe la partie décimale.'},
             {l:'Une erreur', why:'Ça compile très bien.'} ],
      ex:'Entre deux <code>int</code>, le <code>/</code> de Java fait comme le <code>//</code> de Python. Pour avoir 3.5, il faut au moins un <code>double</code> : <code>7.0 / 2</code>.' },
    { t:'compare', h:'Conditions et boucles',
      p:`<p>Les idées sont les mêmes. Ce qui change : les <strong>parenthèses</strong> autour des conditions, les <strong>accolades</strong> pour les blocs, et la forme de la boucle <code>for</code>.</p>`,
      py:`pv = 30
if pv > 50:
    print("En forme")
elif pv > 0 and pv <= 50:
    print("Blessé")
else:
    print("K.O.")

for i in range(3):
    print("Tour", i)

while pv > 0:
    pv -= 12`,
      java:`int pv = 30;
if (pv > 50) {
    System.out.println("En forme");
} else if (pv > 0 && pv <= 50) {
    System.out.println("Blessé");
} else {
    System.out.println("K.O.");
}

for (int i = 0; i < 3; i++) {
    System.out.println("Tour " + i);
}

while (pv > 0) {
    pv -= 12;
}`,
      notes:['<code>elif</code> devient <code>else if</code>. <code>and</code>, <code>or</code>, <code>not</code> deviennent <code>&&</code>, <code>||</code>, <code>!</code>.','Le <code>for</code> Java a trois parties : départ (<code>int i = 0</code>), condition (<code>i &lt; 3</code>), pas (<code>i++</code>, qui veut dire <code>i += 1</code>).','<code>println</code> ne met pas d’espace entre les morceaux : on colle avec <code>+</code>, et on ajoute l’espace soi-même.'] },
    { t:'fill', lang:'java', h:'Complète le programme Java',
      p:`<p>Ce programme additionne les nombres de 1 à 5 et affiche le total. Remplis les trous.</p>`,
      tpl:`public class Somme {
    public static void [[main]](String[] args) {
        [[int]] total = 0;
        for (int i = 1; i <= 5; [[i++|i += 1|i = i + 1|++i]]) {
            total += i;
        }
        [[System.out.println]](total);
    }
}`,
      hints:['La méthode de départ s’appelle toujours pareil. Un total entier se déclare avec le type des entiers.','<code>main</code>, <code>int</code>, <code>i++</code>, et pour afficher : <code>System.out.println</code>.'],
      ok:'Tu viens d’écrire ta première boucle Java. Elle affichera 15.' },
    { t:'quiz', lang:'java', h:'Texte et nombres', p:`<p>Qu'affiche ce code Java ?</p>`, snip:`String nom = "Sam";
System.out.println(nom + 1 + 2);`,
      opts:[ {l:'Sam3', why:'Java lit de gauche à droite : <code>"Sam" + 1</code> donne déjà du texte, <code>"Sam1"</code>. Puis on colle 2.'},
             {l:'Sam12', ok:1},
             {l:'Une erreur', why:'En Java, coller un nombre à du texte avec <code>+</code> est permis : le nombre devient du texte.'},
             {l:'Sam 1 2', why:'<code>+</code> colle sans ajouter d’espace.'} ],
      ex:'En Java, <code>texte + nombre</code> donne du texte (en Python, ce serait une <code>TypeError</code>). Pour avoir Sam3, il faut des parenthèses : <code>nom + (1 + 2)</code>.' },
    { t:'code', h:'Traduis en Python', file:'traduction.py',
      p:`<p>Traduis ce programme Java en Python, puis exécute-le.</p>`, lang:'java',
      snip:`int pv = 100;
for (int i = 0; i < 4; i++) {
    pv -= 15;
    System.out.println("Coup " + i + " : " + pv + " PV");
}`,
      code:`# Ta traduction en Python
`,
      sol:`pv = 100
for i in range(4):
    pv -= 15
    print("Coup " + str(i) + " : " + str(pv) + " PV")`,
      hints:['<code>int pv = 100;</code> devient <code>pv = 100</code>, et le <code>for</code> devient <code>for i in range(4):</code>.','Pour l’affichage, une f-string est le plus simple : <code>print(f"Coup {i} : {pv} PV")</code>.'],
      check:r => {
        if (r.err) return ERR;
        const l = linesOf(r.out).map(norm);
        const want = ['coup 0 : 85 pv', 'coup 1 : 70 pv', 'coup 2 : 55 pv', 'coup 3 : 40 pv'];
        for (const w of want) if (!l.includes(w)) return `Il me manque la ligne <code>${esc(w.replace('coup', 'Coup').replace('pv', 'PV'))}</code>. Attention : en Java, le <code>for</code> commence à <code>i = 0</code>.`;
        return true;
      },
      ok:'Quatre lignes, de 85 à 40 PV. Tu sais lire une boucle Java : c’est la moitié du travail.' },
    { t:'compare', h:'Les fonctions deviennent des méthodes',
      p:`<p>En Java, une fonction s'appelle toujours une méthode, car elle vit dans une classe. On écrit le <strong>type de ce qu'elle renvoie</strong> devant son nom, et le type de chaque paramètre. <code>void</code> veut dire « ne renvoie rien ».</p><p>Pour l'instant, on met <code>static</code> devant : ça veut dire qu'on l'appelle sans créer d'objet. Tu comprendras pourquoi au chapitre 4.</p>`,
      py:`def degats(force, bonus):
    return force * 2 + bonus

def annoncer(nom):
    print(nom + " attaque !")

print(degats(7, 3))
annoncer("Sam")`,
      java:`public class Combat {
    static int degats(int force, int bonus) {
        return force * 2 + bonus;
    }

    static void annoncer(String nom) {
        System.out.println(nom + " attaque !");
    }

    public static void main(String[] args) {
        System.out.println(degats(7, 3));
        annoncer("Sam");
    }
}`,
      notes:['<code>def</code> disparaît : à la place, le type de retour (<code>int</code>, <code>String</code>, <code>void</code>…).','Chaque paramètre a son type : <code>int force</code>.','Les noms suivent le <em>camelCase</em> en Java (<code>pointsDeVie</code>), et le <em>snake_case</em> en Python (<code>points_de_vie</code>). Les classes prennent une majuscule dans les deux.'] },
    { t:'code', defi:1, h:'Traduis une méthode Java', file:'methode.py',
      p:`<p>Traduis cette méthode Java en fonction Python <code>prix_total(prix, quantite, reduction)</code>. Puis affiche <code>prix_total(12.5, 4, 10)</code>.</p><p>Je testerai ta fonction avec d'autres valeurs.</p>`, lang:'java',
      snip:`static double prixTotal(double prix, int quantite, double reduction) {
    double total = prix * quantite;
    if (total > 40) {
        total = total - reduction;
    }
    return total;
}`,
      code:`# Ta fonction en Python
`,
      sol:`def prix_total(prix, quantite, reduction):
    total = prix * quantite
    if total > 40:
        total = total - reduction
    return total

print(prix_total(12.5, 4, 10))`,
      hints:['<code>def prix_total(prix, quantite, reduction):</code> puis les mêmes lignes, sans types ni <code>;</code>.','Le <code>if (total &gt; 40) { ... }</code> devient <code>if total &gt; 40:</code> avec un bloc décalé. N’oublie pas le <code>return total</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/def\s+prix_total\s*\(/.test(code)) return 'Il faut une fonction <code>prix_total</code>.';
        if (!/return/.test(strip(code))) return 'Ta fonction doit renvoyer le total avec <code>return</code>.';
        const t = await test([], code + '\nprint("#A", prix_total(10, 2, 5))\nprint("#B", prix_total(10, 5, 5))\nprint("#C", prix_total(20, 2, 3))');
        if (t.err) return 'Ta fonction plante quand je l’appelle avec d’autres valeurs : ' + esc(t.err.title);
        if (!/#A 20(\.0)?\b/.test(t.out)) return 'Avec 10 € × 2 (total 20, pas plus de 40), il ne faut pas de réduction : j’attends 20.';
        if (!/#B 45(\.0)?\b/.test(t.out)) return 'Avec 10 € × 5 (total 50, plus de 40), on enlève la réduction de 5 : j’attends 45.';
        if (!/#C 40(\.0)?\b/.test(t.out)) return 'Avec un total d’exactement 40, pas de réduction : la condition est « strictement plus que 40 ».';
        return true;
      },
      ok:'Ta traduction se comporte exactement comme la méthode Java, cas limite compris.' },
    { t:'say', h:'Lancer du Java dans VS Code',
      p:`<p>Pour écrire et lancer du Java chez toi :</p><ol><li>Installe un <strong>JDK</strong> (le kit Java), par exemple <em>Temurin 21</em> sur <code>adoptium.net</code>.</li><li>Dans VS Code, onglet Extensions, installe l'<strong>Extension Pack for Java</strong> (de Microsoft).</li><li>Crée un fichier <code>Bonjour.java</code>, avec <code>public class Bonjour</code> dedans : <strong>même nom</strong> que le fichier.</li><li>Clique sur <strong>Run</strong>, qui apparaît juste au-dessus de <code>main</code>. Le résultat s'affiche dans le terminal.</li></ol><p>Tu peux aussi passer par le terminal :</p>`,
      snip:`javac Bonjour.java
java Bonjour

(ou, pour un seul fichier, en une seule commande)
java Bonjour.java`,
      p2:`<p>À la fin de chaque chapitre, je te proposerai un mini-défi à faire dans VS Code. Le premier : recopie le programme <code>Somme</code> de tout à l'heure et vérifie qu'il affiche 15.</p>` },
    { t:'quiz', lang:'java', h:'Le nom du fichier', p:`<p>Ton fichier s'appelle <code>Jeu.java</code>, et il contient ceci. Que se passe-t-il quand tu compiles ?</p>`, snip:`public class Partie {
    public static void main(String[] args) {
        System.out.println("Go !");
    }
}`,
      opts:[ {l:'Ça affiche Go !', why:'Java est strict : une classe publique doit être dans un fichier du même nom.'},
             {l:'Une erreur de compilation', ok:1},
             {l:'Ça crée un fichier Jeu.class', why:'La compilation s’arrête avant, à cause du nom.'},
             {l:'Une erreur seulement au moment de lancer', why:'C’est le compilateur qui refuse, avant même de lancer.'} ],
      ex:'La classe <code>public class Partie</code> doit être dans <code>Partie.java</code>. Renomme le fichier ou la classe.' }
  ],
  recap:['Java ne s’exécute pas dans la page : on le lance dans VS Code (JDK + <em>Extension Pack for Java</em>), ou avec <code>javac</code> puis <code>java</code>.','Tout est dans une classe. Le programme démarre dans <code>public static void main(String[] args)</code>. Fichier = nom de la classe publique.','Types déclarés : <code>int</code>, <code>double</code>, <code>boolean</code>, <code>char</code>, <code>String</code>. Blocs en <code>{ }</code>, instructions finies par <code>;</code>.','<code>System.out.println()</code> pour afficher. <code>7 / 2</code> vaut 3 entre deux <code>int</code>.','<code>&&</code>, <code>||</code>, <code>!</code>, <code>else if</code>, <code>for (int i = 0; i &lt; n; i++)</code>.'] };

/* ---------- 1.5 ---------- */
const ARME = `class Arme:
    def __init__(self, nom, degats):
        self.nom = nom
        self.degats = degats

    def decrire(self):
        return f"{self.nom} ({self.degats} dégâts)"
`;
const BUG15 = `class Bouclier:
    def __init__(self, nom, defense):
        self.nom = nom
        self.defense = defense

    def decrire():
        return f"{self.nom} (défense {self.defense})"

b = Bouclier("Pavois", 8)
print(b.decrire())`;
LES['p1-5'] = { title:'Ta première classe en Python et en Java', dur:'15 min',
  intro:'Jusqu’ici, tu as utilisé des classes toutes prêtes. Maintenant, tu écris les tiennes, en Python puis en Java. Ce sont les premières pièces de notre jeu de rôle.',
  steps:[
    { t:'quiz', rev:1, lang:'java', h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code Java ?</p>`, snip:`System.out.println("PV : " + 10 + 5);`,
      opts:[ {l:'PV : 15', why:'Java lit de gauche à droite : <code>"PV : " + 10</code> est déjà du texte. Puis on colle 5.'},
             {l:'PV : 105', ok:1},
             {l:'Une erreur', why:'Java accepte de coller un nombre à du texte.'},
             {l:'PV : 10 5', why:'<code>+</code> n’ajoute pas d’espace.'} ],
      ex:'Dès qu’il y a du texte à gauche, <code>+</code> colle. Pour additionner d’abord : <code>"PV : " + (10 + 5)</code>.' },
    { t:'say', h:'Anatomie d’une classe Python', file:'arme.py', mem:1,
      p:`<p>Une classe a quatre parties : son <strong>nom</strong> (avec une majuscule), un <strong>constructeur</strong> (<em>constructor</em>) <code>__init__</code> qui s'exécute à la création de chaque objet, des <strong>attributs</strong> créés avec <code>self.nom = ...</code>, et des <strong>méthodes</strong>.</p><p><code>self</code>, c'est l'objet en train d'être utilisé. Chaque méthode le reçoit en premier paramètre. On creusera <code>__init__</code> et <code>self</code> au chapitre 2.</p>`,
      code: ARME + `
epee = Arme("Épée", 12)
arc = Arme("Arc", 9)
print(epee.decrire())
print(arc.decrire())` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Avec la classe <code>Arme</code>, qu'affiche ce code ?</p>`, snip:`hache = Arme("Hache", 15)
hache.degats = hache.degats + 5
print(hache.decrire())`,
      opts:[ {l:'Hache (15 dégâts)', why:'La deuxième ligne change l’attribut <code>degats</code> de cet objet. <code>decrire()</code> lit la valeur actuelle.'},
             {l:'Hache (20 dégâts)', ok:1},
             {l:'Une erreur', why:'On peut lire et modifier un attribut avec <code>objet.attribut</code>.'},
             {l:'{self.nom} ({self.degats} dégâts)', why:'C’est une f-string : Python remplace les accolades par les valeurs.'} ],
      ex:'<code>decrire()</code> lit l’état actuel de l’objet : 15 + 5 = 20 dégâts.' },
    { t:'compare', h:'La même classe en Java',
      p:`<p>Même plan, autre syntaxe. En Java, on déclare d'abord les attributs avec leur type. Le constructeur porte le <strong>nom de la classe</strong> et n'a pas de type de retour. Et on crée l'objet avec <code>new</code>.</p>`,
      py: ARME + `
epee = Arme("Épée", 12)
print(epee.decrire())`,
      java:`public class Arme {
    String nom;
    int degats;

    Arme(String nom, int degats) {
        this.nom = nom;
        this.degats = degats;
    }

    String decrire() {
        return nom + " (" + degats + " dégâts)";
    }

    public static void main(String[] args) {
        Arme epee = new Arme("Épée", 12);
        System.out.println(epee.decrire());
    }
}`,
      notes:['Les attributs sont déclarés en haut de la classe, avec leur type. En Python, ils naissent dans <code>__init__</code>.','<code>__init__</code> devient un constructeur qui porte le nom de la classe. <code>self</code> devient <code>this</code>, qu’on n’écrit pas dans les paramètres.','Dans une méthode Java, <code>this.</code> est facultatif s’il n’y a pas d’ambiguïté : <code>nom</code> suffit. En Python, <code>self.</code> est obligatoire.','On crée un objet avec <code>new Arme(...)</code>, et la variable a un type : <code>Arme epee</code>.'] },
    { t:'fill', lang:'java', h:'Complète la classe Potion',
      p:`<p>Voici une classe <code>Potion</code> en Java. Remplis les trous.</p>`,
      tpl:`public class Potion {
    String nom;
    [[int]] soin;

    [[Potion]](String nom, int soin) {
        [[this]].nom = nom;
        this.soin = soin;
    }

    [[String]] decrire() {
        return nom + " (+" + soin + " PV)";
    }
}

// Ailleurs, dans main :
Potion p = [[new]] Potion("Grande potion", 50);`,
      hints:['Le soin est un entier. Le constructeur porte le nom de la classe.','<code>int</code>, <code>Potion</code>, <code>this</code>, le type de retour de <code>decrire</code> est du texte : <code>String</code>. Et on crée l’objet avec <code>new</code>.'],
      ok:'Classe complète : attributs typés, constructeur, méthode, et <code>new</code> pour créer l’objet.' },
    { t:'code', h:'À toi : la classe Potion en Python', file:'potion.py', mem:1,
      p:`<p>Écris la classe <code>Potion</code> en Python : un constructeur qui reçoit <code>nom</code> et <code>soin</code>, et une méthode <code>decrire()</code> qui renvoie par exemple <code>Grande potion (+50 PV)</code>.</p><p>Crée ensuite <code>potion = Potion("Grande potion", 50)</code> et affiche sa description.</p>`,
      code:`# Ta classe Potion
`,
      sol:`class Potion:
    def __init__(self, nom, soin):
        self.nom = nom
        self.soin = soin

    def decrire(self):
        return f"{self.nom} (+{self.soin} PV)"

potion = Potion("Grande potion", 50)
print(potion.decrire())`,
      hints:['Pars du modèle de la classe <code>Arme</code> : <code>class Potion:</code>, puis <code>def __init__(self, nom, soin):</code> avec <code>self.nom = nom</code> et <code>self.soin = soin</code>.','La méthode : <code>def decrire(self):</code> puis <code>return f"{self.nom} (+{self.soin} PV)"</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/class\s+Potion/.test(code)) return 'Il faut une classe <code>Potion</code>.';
        const p = memOf(r, 'potion');
        if (!p || !p.attrs) return 'Crée l’objet <code>potion = Potion("Grande potion", 50)</code>.';
        if (attr(r, 'potion', 'nom') === undefined || attr(r, 'potion', 'soin') === undefined) return 'Ton objet doit avoir deux attributs : <code>nom</code> et <code>soin</code>. Crée-les dans <code>__init__</code> avec <code>self.</code>.';
        const t = await test([], code + '\nprint("#T", Potion("Mini", 5).decrire())');
        if (t.err) return 'Quand j’appelle <code>decrire()</code> sur une autre potion, ça plante : ' + esc(t.err.title);
        if (!/#T Mini \(\+5 PV\)/.test(t.out)) return 'Pour <code>Potion("Mini", 5)</code>, <code>decrire()</code> doit renvoyer <code>Mini (+5 PV)</code>. Vérifie que la méthode utilise <code>return</code> et les attributs.';
        if (!/Grande potion \(\+50 PV\)/.test(r.out)) return 'Affiche la description de ta potion avec <code>print(potion.decrire())</code>.';
        return true;
      },
      ok:'Ta première classe écrite toute seule. Regarde la mémoire : l’objet potion montre ses deux attributs.' },
    { t:'code', h:'Une méthode qui change l’état', file:'ameliorer.py', mem:1,
      p:`<p>Ajoute à la classe <code>Arme</code> une méthode <code>ameliorer(self, bonus)</code> qui ajoute <code>bonus</code> aux dégâts. Puis améliore <code>epee</code> de 3 et affiche sa description.</p>`,
      code: ARME + `
epee = Arme("Épée", 12)
`,
      sol: ARME + `
    def ameliorer(self, bonus):
        self.degats += bonus

epee = Arme("Épée", 12)
epee.ameliorer(3)
print(epee.decrire())`,
      hints:['La méthode se place dans la classe, décalée de 4 espaces comme <code>decrire</code> : <code>def ameliorer(self, bonus):</code>.','Dedans : <code>self.degats += bonus</code>. Puis <code>epee.ameliorer(3)</code> et <code>print(epee.decrire())</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/def\s+ameliorer\s*\(\s*self\s*,/.test(code)) return 'Il faut une méthode <code>ameliorer(self, bonus)</code> dans la classe.';
        if (attr(r, 'epee', 'degats') !== '15') return `L’épée a ${esc(attr(r, 'epee', 'degats'))} dégâts. Après une amélioration de 3, elle devrait en avoir 15.`;
        const t = await test([], code + '\n_a = Arme("Dague", 4)\n_a.ameliorer(10)\nprint("#T", _a.degats)');
        if (t.err || !/#T 14\b/.test(t.out)) return 'Ta méthode ne marche pas avec une autre arme : une dague de 4, améliorée de 10, devrait avoir 14 dégâts. Utilise bien <code>bonus</code>.';
        if (!/Épée \(15 dégâts\)/.test(r.out)) return 'Affiche la description de l’épée avec <code>print(epee.decrire())</code>.';
        return true;
      },
      ok:'Ta méthode modifie l’état de l’objet. Tu l’as appelée sur l’épée, mais elle marche pour n’importe quelle arme.' },
    { t:'quiz', lang:'java', h:'Repère l’erreur Java', p:`<p>Cette méthode Java ne compile pas. Pourquoi ?</p>`, snip:`decrire() {
    return nom + " (" + degats + " dégâts)";
}`,
      opts:[ {l:'Il manque le type de retour', ok:1},
             {l:'Il manque self entre les parenthèses', why:'Il n’y a pas de <code>self</code> en Java : <code>this</code> existe sans qu’on l’écrive.'},
             {l:'Il faut écrire def devant', why:'<code>def</code> n’existe pas en Java. À sa place, on écrit le type de retour.'},
             {l:'On ne peut pas coller du texte avec +', why:'En Java, <code>+</code> colle très bien du texte et des nombres.'} ],
      ex:'Toute méthode Java annonce ce qu’elle renvoie : <code>String decrire()</code>. Seul le constructeur n’a pas de type de retour.' },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code plante. Exécute-le, lis l'explication, puis répare-le.</p>`,
      code: BUG15,
      sol: BUG15.replace('def decrire():', 'def decrire(self):'),
      hints:['Le message dit que <code>decrire</code> reçoit un argument de trop. Lequel ? L’objet lui-même !','Chaque méthode reçoit <code>self</code> en premier paramètre : <code>def decrire(self):</code>.'],
      check:(r, code) => {
        if (same(code, BUG15)) return START;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        if (!/Pavois \(défense 8\)/.test(r.out)) return 'Plus d’erreur, mais il faut afficher <code>Pavois (défense 8)</code>.';
        return true;
      },
      ok:'Quand tu écris <code>b.decrire()</code>, Python appelle en fait <code>decrire(b)</code>. Sans <code>self</code> pour recevoir b, ça plante. L’oubli de <code>self</code> est un grand classique.' },
    { t:'code', defi:1, h:'La classe Monstre', file:'monstre.py', mem:1,
      p:`<p>Écris une classe <code>Monstre</code> avec un <code>nom</code> et des <code>pv</code>, et deux méthodes :</p><ul><li><code>recevoir(degats)</code> enlève les dégâts aux PV ;</li><li><code>est_vivant()</code> renvoie <code>True</code> si les PV sont au-dessus de 0, sinon <code>False</code>.</li></ul><p>Crée <code>troll = Monstre("Troll", 50)</code>, frappe-le de 20 puis de 35, et affiche <code>troll.est_vivant()</code>.</p>`,
      code:``,
      sol:`class Monstre:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

    def recevoir(self, degats):
        self.pv -= degats

    def est_vivant(self):
        return self.pv > 0

troll = Monstre("Troll", 50)
troll.recevoir(20)
troll.recevoir(35)
print(troll.est_vivant())`,
      hints:['Le constructeur : <code>def __init__(self, nom, pv):</code> avec deux <code>self.… = …</code>. <code>recevoir</code> fait <code>self.pv -= degats</code>.','<code>est_vivant</code> peut renvoyer directement une comparaison : <code>return self.pv &gt; 0</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/class\s+Monstre/.test(code)) return 'Il faut une classe <code>Monstre</code>.';
        if (!memOf(r, 'troll')) return 'Crée l’objet <code>troll</code>.';
        if (attr(r, 'troll', 'pv') !== '-5') return 'Après 20 puis 35 dégâts, le troll de 50 PV devrait avoir -5 PV.';
        if (!/False/.test(r.out)) return 'Le troll n’a plus de PV : affiche <code>troll.est_vivant()</code>, qui doit donner False.';
        const t = await test([], code + '\n_m = Monstre("Rat", 10)\nprint("#A", _m.est_vivant())\n_m.recevoir(10)\nprint("#B", _m.est_vivant())');
        if (t.err) return 'Ta classe plante avec un autre monstre : ' + esc(t.err.title);
        if (!/#A True/.test(t.out)) return 'Un rat tout neuf de 10 PV doit être vivant : <code>est_vivant()</code> doit renvoyer True (avec <code>return</code>).';
        if (!/#B False/.test(t.out)) return 'Un rat à 0 PV n’est plus vivant : il faut des PV <strong>strictement</strong> au-dessus de 0.';
        return true;
      },
      ok:'Une classe complète, avec un état et deux comportements. Testée sur un autre monstre, cas limite à 0 PV compris.' },
    { t:'say', h:'Mini-défi dans VS Code',
      p:`<p>Écris ta classe <code>Monstre</code> en Java dans un fichier <code>Monstre.java</code>. Voici un squelette pour démarrer :</p>`, lang:'java',
      snip:`public class Monstre {
    String nom;
    int pv;

    Monstre(String nom, int pv) {
        // à toi
    }

    void recevoir(int degats) {
        // à toi
    }

    boolean estVivant() {
        // à toi
    }

    public static void main(String[] args) {
        Monstre troll = new Monstre("Troll", 50);
        troll.recevoir(20);
        troll.recevoir(35);
        System.out.println(troll.estVivant());   // doit afficher false
    }
}`,
      p2:`<p>Lance-le avec Run. Si le compilateur râle, lis bien son message : il indique la ligne et souvent la solution. C'est la fin du chapitre 1 !</p>` }
  ],
  recap:['Une classe Python : <code>class Nom:</code>, un constructeur <code>__init__(self, ...)</code>, des attributs <code>self.x = ...</code>, des méthodes <code>def m(self, ...)</code>.','Chaque méthode reçoit <code>self</code>, l’objet sur lequel on l’appelle. L’oublier donne une <code>TypeError</code>.','En Java : attributs typés en haut, constructeur au nom de la classe (sans type de retour), méthodes avec un type de retour, <code>new</code> pour créer.','<code>self</code> en Python, <code>this</code> en Java : l’objet lui-même.'] };

Atelier.chapter({ part:"poo", n:1, title:"Penser en objets",
  lessons:['p1-1','p1-2','p1-3','p1-4','p1-5'].map(id => ({ id, ...LES[id] })) });
})();
