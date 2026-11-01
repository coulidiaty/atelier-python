/* Partie POO · Chapitre 10 : SOLID et design patterns */
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has } = Atelier.h;
const LES = {};
const attr = (r, o, a) => { const m = memOf(r, o); const x = m && m.attrs && m.attrs.find(t => t.name === a); return x ? x.repr : undefined; };
const same = (code, start) => code.trim() === start.trim();
const START = 'Voilà le bug ! Exécute, lis ce qui se passe, puis corrige le code.';
const TESTERR = t => 'Mes tests font planter ton code : ' + esc(t.err.title) + '. Vérifie les noms de tes classes, de tes méthodes et de leurs paramètres.';
const tryPy = (tag, stmt, exc = 'ValueError') => `\ntry:\n    ${stmt}\n    print("#${tag} PASSE")\nexcept ${exc}:\n    print("#${tag} ERREUR")`;
const fnOf = (code, name) => (code.match(new RegExp('def\\s+' + name + '[\\s\\S]*?(?=\\n\\S|$)')) || [''])[0];
const clsOf = (code, name) => (code.match(new RegExp('class\\s+' + name + '\\b[\\s\\S]*?(?=\\n\\S|$)')) || [''])[0];

/* ---------- 10.1 ---------- */
const DIEU = `class Heros:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

    def recevoir(self, degats):
        self.pv = max(0, self.pv - degats)

    def fiche_html(self):
        return f"<b>{self.nom}</b> : {self.pv} PV"

    def sauvegarder(self):
        return f"{self.nom};{self.pv}"

    def envoyer_au_serveur(self):
        return "connexion... envoi de " + self.sauvegarder()
`;
LES['p10-1'] = { title:'Responsabilité unique', dur:'14 min',
  intro:'Dernier chapitre ! Tu sais écrire des classes, les relier, les faire hériter. Maintenant : comment savoir si un design est bon ? Les principes SOLID donnent des repères. On commence par le S.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur le chapitre d’avant', p:`<p>Que fait <code>yield</code> dans une fonction ?</p>`,
      opts:[ {l:'Il arrête la fonction et renvoie une valeur, comme return', why:'<code>return</code> arrête la fonction. <code>yield</code> la met seulement en pause.'},
             {l:'Il donne une valeur et met la fonction en pause, jusqu’à la demande suivante', ok:1},
             {l:'Il lève une exception', why:'Ça, c’est <code>raise</code>.'},
             {l:'Il affiche une valeur', why:'C’est <code>print</code> qui affiche.'} ],
      ex:'Une fonction avec <code>yield</code> est un générateur : elle produit ses valeurs une par une.' },
    { t:'say', h:'Cohésion et couplage',
      p:`<p>Deux mots pour juger un design :</p><ul><li>la <strong>cohésion</strong> (<em>cohesion</em>), <strong>à l'intérieur</strong> d'une classe : à quel point ses membres vont ensemble. On la veut <strong>forte</strong> : une classe, un rôle clair.</li><li>le <strong>couplage</strong> (<em>coupling</em>), <strong>entre</strong> les classes : à quel point une classe dépend des détails des autres. On le veut <strong>faible</strong> : dépendre de peu de choses, et de choses stables.</li></ul><p>Tous les principes et patterns de ce chapitre sont des recettes pour obtenir une <strong>forte cohésion</strong> et un <strong>faible couplage</strong>.</p>` },
    { t:'say', h:'SOLID',
      p:`<p>SOLID regroupe cinq principes de conception objet, rassemblés par Robert C. Martin. Une lettre par principe :</p>`,
      snip:`S  Single Responsibility    une seule raison de changer
O  Open / Closed            ouvert à l'extension, fermé à la modification
L  Liskov Substitution      une classe fille peut remplacer sa parente
I  Interface Segregation    plusieurs petites interfaces plutôt qu'une grosse
D  Dependency Inversion     dépendre d'abstractions, pas de détails`,
      p2:`<p>Ce ne sont pas des lois : ce sont des repères pour reconnaître un code qui sera pénible à faire évoluer.</p>` },
    { t:'say', h:'S : une seule raison de changer', file:'dieu.py',
      p:`<p>Le principe de <strong>responsabilité unique</strong> (<em>Single Responsibility Principle</em>) : une classe ne doit avoir qu'<strong>une seule raison de changer</strong>.</p><p>Regarde cette classe <code>Heros</code> : elle gère les règles du combat, l'affichage en HTML, le format de sauvegarde et le réseau. Si le graphiste change la fiche, si on change le format des sauvegardes, si le serveur change… c'est toujours elle qu'on modifie. On appelle ça une « classe Dieu ».</p>`,
      code: DIEU + `
sam = Heros("Sam", 100)
sam.recevoir(30)
print(sam.fiche_html())
print(sam.envoyer_au_serveur())` },
    { t:'say', h:'Découper par responsabilité', file:'decoupe.py',
      p:`<p>On découpe en classes qui ont chacune <strong>un</strong> rôle. Le héros garde seulement ses règles. L'affichage, la sauvegarde et le réseau partent dans des classes à part, qui reçoivent le héros.</p><p>Chaque classe est plus petite, plus facile à tester, et ne change que pour une raison.</p>`,
      code:`class Heros:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

    def recevoir(self, degats):
        self.pv = max(0, self.pv - degats)

class FicheHtml:
    def afficher(self, heros):
        return f"<b>{heros.nom}</b> : {heros.pv} PV"

class Sauvegarde:
    def exporter(self, heros):
        return f"{heros.nom};{heros.pv}"

class Reseau:
    def __init__(self, sauvegarde):
        self.sauvegarde = sauvegarde

    def envoyer(self, heros):
        return "connexion... envoi de " + self.sauvegarde.exporter(heros)

sam = Heros("Sam", 100)
sam.recevoir(30)
print(FicheHtml().afficher(sam))
print(Reseau(Sauvegarde()).envoyer(sam))` },
    { t:'quiz', h:'Combien de responsabilités ?', p:`<p>Combien de raisons de changer a cette classe ?</p>`, snip:`class Quete:
    def recompense_totale(self): ...       # règles du jeu
    def afficher_en_couleur(self): ...     # affichage
    def lire_depuis_fichier(self): ...     # stockage
    def recompense_bonus(self): ...        # règles du jeu`,
      opts:[ {l:'Une : tout concerne la quête', why:'Tout concerne la quête, mais pas pour les mêmes raisons : l’affichage et le stockage changent pour d’autres raisons que les règles.'},
             {l:'Deux', why:'Compte les commentaires : il y en a de trois sortes.'},
             {l:'Trois', ok:1},
             {l:'Quatre', why:'Deux méthodes concernent les mêmes règles du jeu : elles changent pour la même raison.'} ],
      ex:'Règles du jeu, affichage, stockage : trois raisons de changer. On garderait les règles dans <code>Quete</code>, et on sortirait l’affichage et le stockage.' },
    { t:'code', h:'À toi : sortir le journal', file:'journal.py',
      p:`<p>Cette classe <code>Combat</code> calcule les dégâts <strong>et</strong> met en forme le journal de combat. Sors la mise en forme dans une classe <code>Narrateur</code> avec une méthode <code>raconter(attaquant, cible, degats)</code> qui renvoie le texte. <code>Combat</code> reçoit un narrateur dans son constructeur et l'utilise. Le résultat affiché ne doit pas changer.</p>`,
      code:`class Combat:
    def degats(self, force, defense):
        return max(1, force - defense)

    def tour(self, attaquant, cible, force, defense):
        d = self.degats(force, defense)
        return f">> {attaquant} frappe {cible} : {d} dégâts"

c = Combat()
print(c.tour("Sam", "Orc", 12, 4))`,
      sol:`class Narrateur:
    def raconter(self, attaquant, cible, degats):
        return f">> {attaquant} frappe {cible} : {degats} dégâts"

class Combat:
    def __init__(self, narrateur):
        self.narrateur = narrateur

    def degats(self, force, defense):
        return max(1, force - defense)

    def tour(self, attaquant, cible, force, defense):
        d = self.degats(force, defense)
        return self.narrateur.raconter(attaquant, cible, d)

c = Combat(Narrateur())
print(c.tour("Sam", "Orc", 12, 4))`,
      hints:['<code>Narrateur.raconter</code> contient la f-string. <code>Combat.__init__(self, narrateur)</code> la garde dans <code>self.narrateur</code>.','Dans <code>tour</code> : <code>return self.narrateur.raconter(attaquant, cible, d)</code>. En bas : <code>Combat(Narrateur())</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/>> Sam frappe Orc : 8 dégâts/.test(r.out)) return 'L’affichage ne doit pas changer : <code>&gt;&gt; Sam frappe Orc : 8 dégâts</code>.';
        if (/f["'].*frappe/.test(clsOf(code, 'Combat'))) return 'Le texte <code>frappe</code> ne doit plus être fabriqué dans Combat : c’est le travail du Narrateur.';
        const t = await test([], code + `
class _Muet:
    def raconter(self, a, c, d):
        return "#" + str(d)
print("#T", Combat(_Muet()).tour("A", "B", 3, 9), Narrateur().raconter("X", "Y", 5))`);
        if (t.err) return TESTERR(t);
        if (!/#T #1 >> X frappe Y : 5 dégâts/.test(t.out)) return 'Je donne à Combat un autre narrateur : il doit l’utiliser (et calculer 1 dégât minimum). Et <code>Narrateur().raconter("X", "Y", 5)</code> doit renvoyer <code>&gt;&gt; X frappe Y : 5 dégâts</code>.';
        return true;
      },
      ok:'Le calcul et le récit sont séparés. On peut maintenant changer de narrateur (en anglais, en emojis, muet pour les tests) sans toucher aux règles du combat.' },
    { t:'code', defi:1, h:'Démonter la classe Dieu', file:'demonter.py',
      p:`<p>Reprends la classe Dieu du début et découpe-la : <code>Heros</code> ne garde que <code>nom</code>, <code>pv</code> et <code>recevoir</code>. Crée <code>FicheHtml</code> (méthode <code>afficher(heros)</code>) et <code>Sauvegarde</code> (méthode <code>exporter(heros)</code>), qui renvoient les mêmes textes qu'avant.</p>`,
      code: DIEU,
      sol:`class Heros:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

    def recevoir(self, degats):
        self.pv = max(0, self.pv - degats)

class FicheHtml:
    def afficher(self, heros):
        return f"<b>{heros.nom}</b> : {heros.pv} PV"

class Sauvegarde:
    def exporter(self, heros):
        return f"{heros.nom};{heros.pv}"

sam = Heros("Sam", 100)
sam.recevoir(30)
print(FicheHtml().afficher(sam))
print(Sauvegarde().exporter(sam))`,
      hints:['Déplace <code>fiche_html</code> dans <code>FicheHtml.afficher(self, heros)</code> : <code>self.nom</code> devient <code>heros.nom</code>.','Pareil pour la sauvegarde. Supprime <code>envoyer_au_serveur</code> (ou mets-le dans une classe Reseau, si tu veux aller plus loin).'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const h = clsOf(code, 'Heros');
        if (/fiche_html|sauvegarder|envoyer/.test(h)) return 'La classe Heros ne doit plus contenir l’affichage, la sauvegarde ni le réseau.';
        const t = await test([], code + '\n_h = Heros("Zoé", 40)\n_h.recevoir(5)\nprint("#T", FicheHtml().afficher(_h), Sauvegarde().exporter(_h), _h.pv)');
        if (t.err) return TESTERR(t);
        if (!/#T <b>Zoé<\/b> : 35 PV Zoé;35 35/.test(t.out)) return 'Pour Zoé (40 PV, -5) : <code>&lt;b&gt;Zoé&lt;/b&gt; : 35 PV</code> et <code>Zoé;35</code>.';
        return true;
      },
      ok:'Trois petites classes cohésives à la place d’une grosse. Chacune a sa raison de changer, et une seule.' }
  ],
  recap:['<strong>Cohésion</strong> forte (une classe, un rôle) et <strong>couplage</strong> faible (peu de dépendances, stables).','SOLID : <strong>S</strong>ingle responsibility, <strong>O</strong>pen/closed, <strong>L</strong>iskov, <strong>I</strong>nterface segregation, <strong>D</strong>ependency inversion.','<strong>S</strong> : une classe ne doit avoir qu’une seule raison de changer.','Une « classe Dieu » qui fait tout se découpe en classes plus petites, qui collaborent.'] };

/* ---------- 10.2 ---------- */
const PRIX = `def prix_final(prix, client):
    if client == "etudiant":
        return prix * 0.8
    elif client == "guilde":
        return prix - 5
    return prix
`;
LES['p10-2'] = { title:'Ouvert / fermé', dur:'14 min',
  intro:'Chaque nouvelle promo, chaque nouveau monstre t’oblige à modifier du code qui marchait ? Le principe ouvert/fermé dit comment l’éviter. Et tu connais déjà l’outil : le polymorphisme.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Que dit le principe de responsabilité unique ?</p>`,
      opts:[ {l:'Une classe ne doit avoir qu’une seule méthode', why:'Une classe peut avoir beaucoup de méthodes, tant qu’elles servent le même rôle.'},
             {l:'Une classe ne doit avoir qu’une seule raison de changer', ok:1},
             {l:'Un programme ne doit avoir qu’une seule classe', why:'C’est même plutôt l’inverse.'},
             {l:'Une méthode ne doit être appelée qu’une fois', why:'Rien à voir.'} ],
      ex:'Un rôle par classe : affichage, règles et stockage changent pour des raisons différentes, donc vont dans des classes différentes.' },
    { t:'say', h:'O : ouvert à l’extension, fermé à la modification', file:'avant.py',
      p:`<p>Le principe <strong>ouvert / fermé</strong> (<em>Open/Closed Principle</em>) : un module doit être <strong>ouvert à l'extension</strong> (on peut ajouter des comportements) mais <strong>fermé à la modification</strong> (sans toucher au code qui marche déjà).</p><p>Ce code ne le respecte pas : pour chaque nouvelle sorte de client, il faut rouvrir <code>prix_final</code>, ajouter un <code>elif</code>, et tout retester.</p>`,
      code: PRIX + `
print(prix_final(50, "etudiant"))
print(prix_final(50, "guilde"))
print(prix_final(50, "touriste"))` },
    { t:'say', h:'Étendre avec de nouvelles classes', file:'apres.py',
      p:`<p>On cache la variation derrière une abstraction : une classe <code>Remise</code> avec une méthode <code>appliquer</code>. Chaque sorte de remise est une classe fille. Pour une nouvelle promo, on <strong>ajoute</strong> une classe, sans modifier ce qui existe.</p><p>L'outil, c'est le polymorphisme des chapitres 6 et 7.</p>`,
      code:`class Remise:
    def appliquer(self, prix):
        return prix

class RemiseEtudiant(Remise):
    def appliquer(self, prix):
        return prix * 0.8

class RemiseGuilde(Remise):
    def appliquer(self, prix):
        return prix - 5

# Nouvelle promo : une nouvelle classe, rien d'autre à toucher
class Solstice(Remise):
    def appliquer(self, prix):
        return prix / 2

def prix_final(prix, remise):
    return remise.appliquer(prix)

for r in [RemiseEtudiant(), RemiseGuilde(), Solstice(), Remise()]:
    print(type(r).__name__, ":", prix_final(50, r))` },
    { t:'quiz', h:'Qu’est-ce qu’on modifie ?', p:`<p>Avec la version à base de classes, on veut ajouter une remise « fidélité » de 10 %. Que faut-il modifier dans le code existant ?</p>`,
      opts:[ {l:'La fonction prix_final', why:'<code>prix_final</code> appelle <code>remise.appliquer(prix)</code> : elle marche déjà avec n’importe quelle remise.'},
             {l:'La classe Remise', why:'Pas besoin : on crée une classe fille.'},
             {l:'Rien : on ajoute juste une classe Fidelite', ok:1},
             {l:'Toutes les classes de remise', why:'Les autres remises ne sont pas concernées.'} ],
      ex:'Ouvert à l’extension (une nouvelle classe), fermé à la modification (rien de changé). C’est le principe O.' },
    { t:'code', h:'À toi : la remise fidélité', file:'fidelite.py',
      p:`<p>Ajoute deux remises, <strong>sans modifier</strong> le code existant :</p><ul><li><code>Fidelite</code> : 10 % de réduction (<code>prix * 0.9</code>) ;</li><li><code>Plafond</code> : son constructeur reçoit un <code>maximum</code>, et le prix ne dépasse jamais ce maximum.</li></ul><p>Affiche <code>prix_final(100, Fidelite())</code> et <code>prix_final(100, Plafond(60))</code>.</p>`,
      code:`class Remise:
    def appliquer(self, prix):
        return prix

def prix_final(prix, remise):
    return remise.appliquer(prix)
`,
      sol:`class Remise:
    def appliquer(self, prix):
        return prix

def prix_final(prix, remise):
    return remise.appliquer(prix)

class Fidelite(Remise):
    def appliquer(self, prix):
        return prix * 0.9

class Plafond(Remise):
    def __init__(self, maximum):
        self.maximum = maximum

    def appliquer(self, prix):
        return min(prix, self.maximum)

print(prix_final(100, Fidelite()))
print(prix_final(100, Plafond(60)))`,
      hints:['Deux classes filles de <code>Remise</code>, qui redéfinissent <code>appliquer</code>. Ne touche pas à <code>prix_final</code>.','<code>Plafond</code> a un constructeur qui garde <code>self.maximum</code>, et <code>appliquer</code> renvoie <code>min(prix, self.maximum)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/def prix_final\(prix, remise\):\n    return remise\.appliquer\(prix\)/.test(code)) return 'Ne modifie pas <code>prix_final</code> : c’est tout l’intérêt du principe.';
        const t = await test([], code + '\nprint("#T", prix_final(50, Fidelite()), prix_final(50, Plafond(70)), prix_final(50, Plafond(20)), isinstance(Fidelite(), Remise))');
        if (t.err) return TESTERR(t);
        if (!/#T 45(\.0)? 50 20 True/.test(t.out)) return 'J’attends : fidélité sur 50 → 45, plafond 70 sur 50 → 50, plafond 20 sur 50 → 20. Et les remises héritent de Remise.';
        return true;
      },
      ok:'Deux nouvelles promos, zéro ligne modifiée. Le marchand peut inventer des remises tous les jours, <code>prix_final</code> ne bougera plus.' },
    { t:'compare', h:'Et en Java ?',
      p:`<p>En Java, on écrirait la remise comme une interface. L'idée est la même.</p>`,
      py:`class Remise:
    def appliquer(self, prix):
        return prix

class Fidelite(Remise):
    def appliquer(self, prix):
        return prix * 0.9

def prix_final(prix, remise):
    return remise.appliquer(prix)`,
      java:`public interface Remise {
    double appliquer(double prix);
}

public class Fidelite implements Remise {
    @Override
    public double appliquer(double prix) {
        return prix * 0.9;
    }
}

static double prixFinal(double prix, Remise remise) {
    return remise.appliquer(prix);
}`,
      notes:['<code>prixFinal</code> dépend de l’interface <code>Remise</code>, jamais d’une remise précise.','Ajouter une remise = ajouter une classe qui <code>implements Remise</code>.'] },
    { t:'code', bug:1, h:'Le if qui revient', file:'bug.py',
      p:`<p>Quelqu'un a ajouté le dragon en modifiant la fonction <code>cri</code>… et il a oublié le slime, qui fait planter le programme. Réécris le code pour respecter le principe ouvert/fermé : chaque classe a sa méthode <code>cri()</code> (Loup <code>Aouh</code>, Dragon <code>ROAR</code>, Slime <code>Blop</code>), et la fonction <code>cri</code> disparaît.</p>`,
      code:`class Loup:
    pass

class Dragon:
    pass

class Slime:
    pass

def cri(monstre):
    if isinstance(monstre, Loup):
        return "Aouh"
    if isinstance(monstre, Dragon):
        return "ROAR"

for m in [Loup(), Dragon(), Slime()]:
    print(cri(m).upper())`,
      sol:`class Loup:
    def cri(self):
        return "Aouh"

class Dragon:
    def cri(self):
        return "ROAR"

class Slime:
    def cri(self):
        return "Blop"

for m in [Loup(), Dragon(), Slime()]:
    print(m.cri().upper())`,
      hints:['Dans chaque classe, remplace <code>pass</code> par une méthode <code>def cri(self):</code> qui renvoie son cri.','Supprime la fonction <code>cri(monstre)</code>, et dans la boucle, écris <code>m.cri()</code>.'],
      check:(r, code) => {
        if (/def cri\(monstre\)/.test(code) && /isinstance/.test(code) && !/def cri\(self\)/.test(code)) return START;
        if (r.err) return ERR;
        if (/isinstance/.test(strip(code))) return 'Plus aucun <code>isinstance</code> : chaque classe répond elle-même.';
        const l = linesOf(r.out);
        if (l.join('|') !== 'AOUH|ROAR|BLOP') return 'J’attends <code>AOUH</code>, <code>ROAR</code>, <code>BLOP</code>.';
        return true;
      },
      ok:'Les <code>if isinstance</code> sur des classes sont le signe numéro 1 d’un code qui viole le principe ouvert/fermé.' },
    { t:'code', defi:1, h:'Des effets de statut extensibles', file:'effets.py', mem:1,
      p:`<p>Écris une classe de base <code>Effet</code> avec une méthode <code>appliquer(heros)</code> qui ne fait rien, puis trois effets : <code>Poison</code> (enlève 5 PV), <code>Regeneration</code> (ajoute 3 PV), <code>Rage</code> (ajoute 2 de force).</p><p>Puis une fonction <code>fin_de_tour(heros, effets)</code> qui applique chaque effet de la liste, <strong>sans aucun if</strong>. Le héros a <code>pv</code> et <code>force</code>.</p>`,
      code:`class Heros:
    def __init__(self, pv, force):
        self.pv = pv
        self.force = force
`,
      sol:`class Heros:
    def __init__(self, pv, force):
        self.pv = pv
        self.force = force

class Effet:
    def appliquer(self, heros):
        pass

class Poison(Effet):
    def appliquer(self, heros):
        heros.pv -= 5

class Regeneration(Effet):
    def appliquer(self, heros):
        heros.pv += 3

class Rage(Effet):
    def appliquer(self, heros):
        heros.force += 2

def fin_de_tour(heros, effets):
    for e in effets:
        e.appliquer(heros)

sam = Heros(50, 10)
fin_de_tour(sam, [Poison(), Regeneration(), Rage(), Rage()])`,
      hints:['Chaque effet est une classe fille de <code>Effet</code> qui redéfinit <code>appliquer(self, heros)</code>.','<code>fin_de_tour</code> : <code>for e in effets: e.appliquer(heros)</code>. C’est tout.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const fn = fnOf(code, 'fin_de_tour');
        if (!fn) return 'Il faut une fonction <code>fin_de_tour(heros, effets)</code>.';
        if (/\bif\b|isinstance/.test(fn)) return '<code>fin_de_tour</code> ne doit contenir aucun <code>if</code>.';
        const t = await test([], code + `
class _Double(Effet):
    def appliquer(self, heros):
        heros.force *= 2
_h = Heros(20, 3)
fin_de_tour(_h, [Poison(), Poison(), Regeneration(), Rage(), _Double(), Effet()])
print("#T", _h.pv, _h.force)`);
        if (t.err) return TESTERR(t);
        if (!/#T 13 10/.test(t.out)) return 'Avec 20 PV et 3 de force : deux poisons, une régénération (13 PV), une rage puis un effet qui double la force (10). Et un Effet de base ne fait rien.';
        return true;
      },
      ok:'J’ai même ajouté mon propre effet pendant le test, et ta fonction l’a appliqué sans broncher. Elle est vraiment fermée à la modification, et ouverte à l’extension.' }
  ],
  recap:['<strong>O</strong> (<em>Open/Closed</em>) : ouvert à l’extension, fermé à la modification.','Ajouter un cas = ajouter une classe, pas un <code>elif</code> dans une fonction existante.','L’outil : une abstraction (classe de base ou interface) et le polymorphisme.','Des <code>if isinstance(...)</code> sur les classes sont le signe d’une violation.'] };

/* ---------- 10.3 ---------- */
const BUG103 = `class Personnage:
    def __init__(self, pv):
        self.pv = pv

    def soigner(self, n):
        self.pv += n

class Squelette(Personnage):
    def soigner(self, n):
        raise TypeError("un squelette ne se soigne pas !")

def potion_de_groupe(groupe):
    for p in groupe:
        p.soigner(10)

equipe = [Personnage(50), Squelette(30), Personnage(20)]
potion_de_groupe(equipe)
print([p.pv for p in equipe])`;
LES['p10-3'] = { title:'Les autres principes SOLID', dur:'16 min',
  intro:'Il reste trois lettres : L, I et D. Elles parlent de substitution, de petites interfaces, et de dépendances. Tu as déjà croisé chacune d’elles sans la nommer.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Lequel de ces changements respecte le principe ouvert/fermé ?</p>`,
      opts:[ {l:'Ajouter un elif dans la fonction de calcul des prix', why:'C’est justement modifier du code qui marchait.'},
             {l:'Ajouter une nouvelle classe fille de Remise', ok:1},
             {l:'Copier la fonction de calcul et la modifier', why:'Du code en double : deux fois plus de bugs possibles.'},
             {l:'Mettre tous les prix dans des variables globales', why:'Ça n’aide pas à ajouter des comportements.'} ],
      ex:'On étend en ajoutant une classe, sans toucher à l’existant.' },
    { t:'say', h:'L : le principe de substitution de Liskov', file:'liskov.py',
      p:`<p>Le principe de <strong>substitution de Liskov</strong> (<em>Liskov Substitution Principle</em>, Barbara Liskov, 1987) : partout où le programme attend un objet de la classe parente, on doit pouvoir mettre un objet d'une classe fille <strong>sans rien casser</strong>.</p><p>Concrètement, une classe fille doit respecter le contrat de sa parente : accepter au moins les mêmes entrées, garantir au moins les mêmes résultats, garder les invariants, et ne pas lever de nouvelles sortes d'erreurs. Ici, tout va bien : le Paladin peut remplacer un Personnage.</p>`,
      code:`class Personnage:
    def __init__(self, pv):
        self.pv = pv

    def soigner(self, n):
        self.pv += n

class Paladin(Personnage):
    def soigner(self, n):
        self.pv += n + 2      # soigne un peu plus : le contrat est respecté

def potion_de_groupe(groupe):
    for p in groupe:
        p.soigner(10)

equipe = [Personnage(50), Paladin(30)]
potion_de_groupe(equipe)
print([p.pv for p in equipe])` },
    { t:'code', bug:1, h:'Le squelette qui casse tout', file:'bug.py',
      p:`<p>Le <code>Squelette</code> est un Personnage… mais il refuse d'être soigné en levant une erreur. La potion de groupe, écrite pour des Personnages, plante. C'est une violation de Liskov.</p><p>Répare <strong>le Squelette</strong> pour qu'il respecte le contrat : un soin ne lui fait simplement <strong>rien</strong> (ses PV ne bougent pas), mais il ne lève pas d'erreur.</p>`,
      code: BUG103,
      sol: BUG103.replace('        raise TypeError("un squelette ne se soigne pas !")', '        pass'),
      hints:['Le problème : la classe fille lève une erreur que le code écrit pour le parent n’attend pas.','Dans <code>Squelette.soigner</code>, remplace le <code>raise</code> par <code>pass</code> (ou un commentaire et <code>return</code>).'],
      check:(r, code) => {
        if (same(code, BUG103)) return START;
        if (r.err) return ERR;
        if (!/\[60, 30, 30\]/.test(r.out)) return 'J’attends <code>[60, 30, 30]</code> : le squelette garde ses 30 PV.';
        if (/def potion_de_groupe[\s\S]*(isinstance|try)/.test(code)) return 'Ne répare pas la potion : c’est le Squelette qui doit respecter le contrat de Personnage.';
        return true;
      },
      ok:'La potion n’a pas eu à connaître les squelettes. Si on avait réparé avec un <code>if isinstance(p, Squelette)</code> dans la potion, on aurait cassé le principe ouvert/fermé en prime.' },
    { t:'quiz', h:'Liskov respecté ?', p:`<p>La classe <code>Coffre</code> a une méthode <code>ouvrir(cle)</code> qui renvoie le contenu. Laquelle de ces classes filles <strong>viole</strong> le principe de Liskov ?</p>`,
      opts:[ {l:'CoffreDore, qui renvoie le contenu plus 10 pièces bonus', why:'Il donne au moins ce que promet le parent : le contrat est tenu.'},
             {l:'CoffreBavard, qui affiche un message puis renvoie le contenu', why:'Un message en plus ne casse pas le code qui l’utilise comme un Coffre.'},
             {l:'CoffreMaudit, qui exige deux clés au lieu d’une, et plante sinon', ok:1},
             {l:'CoffreRapide, qui renvoie le contenu sans animation', why:'Le résultat promis est le même.'} ],
      ex:'Exiger plus que le parent (deux clés au lieu d’une), c’est durcir les conditions d’entrée : le code écrit pour un Coffre plante avec un CoffreMaudit.' },
    { t:'say', h:'I : la ségrégation des interfaces',
      p:`<p>Le principe de <strong>ségrégation des interfaces</strong> (<em>Interface Segregation Principle</em>) : une classe ne doit pas être obligée de dépendre de méthodes qu'elle n'utilise pas. Mieux vaut <strong>plusieurs petites interfaces</strong> qu'une grosse.</p>`,
      snip:`# Une grosse interface : le Golem est obligé de « savoir » voler et nager
class Creature:
    def attaquer(self): ...
    def voler(self): ...
    def nager(self): ...

class Golem(Creature):
    def attaquer(self): return "coup de poing"
    def voler(self): raise NotImplementedError   # ??? un golem ne vole pas
    def nager(self): raise NotImplementedError   # ??? il coule

# De petites interfaces : chacun prend ce dont il a besoin
class Attaquant:  ...
class Volant:     ...
class Nageur:     ...

class Golem(Attaquant): ...
class Dragon(Attaquant, Volant): ...
class Kraken(Attaquant, Nageur): ...`,
      p2:`<p>Tu l'as fait au chapitre 7 avec <code>Volant</code>, <code>CracheurDeFeu</code>, <code>Attaquant</code> et <code>Cible</code>.</p>` },
    { t:'say', h:'D : l’inversion des dépendances', file:'dip.py',
      p:`<p>Le principe d'<strong>inversion des dépendances</strong> (<em>Dependency Inversion Principle</em>) : les classes importantes (la logique du jeu) ne doivent pas dépendre de détails concrets (un fichier, une base de données), mais d'<strong>abstractions</strong>.</p><p>La technique : l'<strong>injection de dépendance</strong> (<em>dependency injection</em>). On donne à l'objet ce dont il a besoin par son constructeur, au lieu qu'il le crée lui-même. Résultat : on peut lui donner une vraie sauvegarde en jeu, et une fausse pour les tests.</p>`,
      code:`class SauvegardeMemoire:
    def __init__(self):
        self.donnees = []

    def enregistrer(self, texte):
        self.donnees.append(texte)

class SauvegardeConsole:
    def enregistrer(self, texte):
        print("[sauvegarde]", texte)

class Partie:
    def __init__(self, sauvegarde):      # la dépendance est injectée
        self.sauvegarde = sauvegarde
        self.niveau = 1

    def niveau_suivant(self):
        self.niveau += 1
        self.sauvegarde.enregistrer(f"niveau {self.niveau}")

p1 = Partie(SauvegardeConsole())
p1.niveau_suivant()

test = SauvegardeMemoire()
p2 = Partie(test)
p2.niveau_suivant()
p2.niveau_suivant()
print("En mémoire :", test.donnees)` },
    { t:'compare', h:'Et en Java ? Injecter une interface',
      p:`<p>En Java, la dépendance injectée a le type d'une <strong>interface</strong>. La classe <code>Partie</code> ne connaît que ce contrat.</p>`,
      py:`class Partie:
    def __init__(self, sauvegarde):
        self.sauvegarde = sauvegarde

p = Partie(SauvegardeMemoire())`,
      java:`public interface Sauvegarde {
    void enregistrer(String texte);
}

public class Partie {
    private final Sauvegarde sauvegarde;

    public Partie(Sauvegarde sauvegarde) {   // injectée
        this.sauvegarde = sauvegarde;
    }
}

// en jeu :   new Partie(new SauvegardeFichier("partie.txt"));
// en test :  new Partie(new SauvegardeMemoire());`,
      notes:['À éviter : <code>private Sauvegarde s = new SauvegardeFichier();</code> dans Partie. Elle serait collée pour toujours au fichier.','Avec l’injection, changer de sauvegarde ne demande aucune modification de Partie.'] },
    { t:'code', h:'À toi : injecter le dé', file:'de.py',
      p:`<p>Cette classe <code>Combat</code> crée elle-même son dé aléatoire : impossible de tester ses résultats ! Modifie-la pour que le dé soit <strong>injecté</strong> par le constructeur. Puis écris une classe <code>DePipe</code> qui renvoie toujours la valeur donnée à son constructeur, pour les tests.</p><p>Crée <code>c = Combat(DePipe(6))</code> et affiche <code>c.degats(10)</code> (qui doit valoir 16).</p>`,
      code:`import random

class DeAleatoire:
    def lancer(self):
        return random.randint(1, 6)

class Combat:
    def __init__(self):
        self.de = DeAleatoire()

    def degats(self, force):
        return force + self.de.lancer()
`,
      sol:`import random

class DeAleatoire:
    def lancer(self):
        return random.randint(1, 6)

class DePipe:
    def __init__(self, valeur):
        self.valeur = valeur

    def lancer(self):
        return self.valeur

class Combat:
    def __init__(self, de):
        self.de = de

    def degats(self, force):
        return force + self.de.lancer()

c = Combat(DePipe(6))
print(c.degats(10))`,
      hints:['Le constructeur de Combat reçoit le dé : <code>def __init__(self, de): self.de = de</code>.','<code>DePipe</code> garde <code>self.valeur</code>, et sa méthode <code>lancer</code> la renvoie.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (/DeAleatoire\s*\(\s*\)/.test(clsOf(code, 'Combat'))) return 'Combat ne doit plus créer lui-même son <code>DeAleatoire()</code> : il le reçoit.';
        if (!/^16$/m.test(r.out.trim())) return 'Avec un dé pipé à 6 et une force de 10, j’attends 16.';
        const t = await test([], code + '\nprint("#T", Combat(DePipe(1)).degats(3), Combat(DePipe(4)).degats(0))\n_v = Combat(DeAleatoire()).degats(100)\nprint("#U", 101 <= _v <= 106)');
        if (t.err) return TESTERR(t);
        if (!/#T 4 4/.test(t.out) || !/#U True/.test(t.out)) return 'Combat doit marcher avec n’importe quel dé injecté : pipé (pour les tests) ou aléatoire (pour le jeu).';
        return true;
      },
      ok:'Maintenant, tes combats sont testables : un dé pipé donne toujours le même résultat. C’est la vraie raison d’être de l’injection de dépendance.' },
    { t:'code', defi:1, h:'Petites interfaces', file:'isp.py',
      p:`<p>Découpe la grosse interface <code>Creature</code> en trois petites : <code>Attaquant</code> (<code>attaquer()</code>), <code>Volant</code> (<code>voler()</code>), <code>Nageur</code> (<code>nager()</code>), chacune avec une méthode qui lève <code>NotImplementedError</code>.</p><p>Puis : <code>Golem(Attaquant)</code> (<code>coup de poing</code>), <code>Dragon(Attaquant, Volant)</code> (<code>griffes</code>, <code>plane</code>) et <code>Kraken(Attaquant, Nageur)</code> (<code>tentacules</code>, <code>plonge</code>). Aucune classe ne doit avoir de méthode qui lève une erreur.</p>`,
      code:`class Creature:
    def attaquer(self):
        raise NotImplementedError

    def voler(self):
        raise NotImplementedError

    def nager(self):
        raise NotImplementedError
`,
      sol:`class Attaquant:
    def attaquer(self):
        raise NotImplementedError

class Volant:
    def voler(self):
        raise NotImplementedError

class Nageur:
    def nager(self):
        raise NotImplementedError

class Golem(Attaquant):
    def attaquer(self):
        return "coup de poing"

class Dragon(Attaquant, Volant):
    def attaquer(self):
        return "griffes"

    def voler(self):
        return "plane"

class Kraken(Attaquant, Nageur):
    def attaquer(self):
        return "tentacules"

    def nager(self):
        return "plonge"`,
      hints:['Supprime <code>Creature</code> et écris trois petites classes, une méthode chacune.','Chaque créature hérite seulement des interfaces dont elle a besoin, et redéfinit leurs méthodes.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (/class\s+Creature/.test(code)) return 'Supprime la grosse interface <code>Creature</code>.';
        const t = await test([], code + `
_g, _d, _k = Golem(), Dragon(), Kraken()
print("#T", _g.attaquer(), _d.attaquer(), _d.voler(), _k.attaquer(), _k.nager())
print("#U", isinstance(_g, Volant), isinstance(_g, Nageur), isinstance(_d, Volant), isinstance(_d, Nageur), isinstance(_k, Nageur), all(isinstance(x, Attaquant) for x in (_g, _d, _k)))`);
        if (t.err) return TESTERR(t);
        if (!/#T coup de poing griffes plane tentacules plonge/.test(t.out)) return 'Vérifie les textes renvoyés par chaque créature.';
        if (!/#U False False True False True True/.test(t.out)) return 'Le Golem n’est ni Volant ni Nageur, le Dragon est Volant, le Kraken est Nageur, et tous sont des Attaquants.';
        return true;
      },
      ok:'Plus de méthodes absurdes : chaque créature ne promet que ce qu’elle sait faire.' }
  ],
  recap:['<strong>L</strong> (<em>Liskov</em>) : une classe fille doit pouvoir remplacer sa parente partout, sans exiger plus, sans promettre moins, sans nouvelles erreurs.','<strong>I</strong> (<em>Interface Segregation</em>) : plusieurs petites interfaces plutôt qu’une grosse qui force des méthodes inutiles.','<strong>D</strong> (<em>Dependency Inversion</em>) : dépendre d’abstractions, et recevoir ses dépendances par le constructeur (<strong>injection de dépendance</strong>).','Avantage concret de l’injection : on peut tester avec de fausses dépendances (un dé pipé, une sauvegarde en mémoire).'] };

/* ---------- 10.4 ---------- */
LES['p10-4'] = { title:'Quelques design patterns', dur:'18 min',
  intro:'Un design pattern, c’est une solution connue à un problème de conception qui revient souvent, avec un nom que tous les développeurs comprennent. Tu en connais déjà deux. Voici les quatre stars du cours.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'est-ce que l'injection de dépendance ?</p>`,
      opts:[ {l:'Créer toutes ses dépendances dans le constructeur', why:'C’est l’inverse : on les <em>reçoit</em>, au lieu de les créer.'},
             {l:'Recevoir les objets dont on a besoin de l’extérieur, souvent par le constructeur', ok:1},
             {l:'Hériter de toutes les classes dont on a besoin', why:'L’héritage n’a rien à voir ici.'},
             {l:'Mettre ses dépendances dans des variables globales', why:'Ce serait un couplage très fort, et difficile à tester.'} ],
      ex:'L’objet reçoit ses dépendances (une sauvegarde, un dé…) : on peut alors les changer sans le modifier.' },
    { t:'say', h:'Qu’est-ce qu’un design pattern ?',
      p:`<p>Un <strong>patron de conception</strong> (<em>design pattern</em>) est une solution réutilisable à un problème de conception courant. On le décrit par un nom, le problème, la solution et ses conséquences. Le livre de référence (1994) en décrit 23, écrit par quatre auteurs qu'on surnomme le <em>Gang of Four</em>.</p><p>Leur force : un vocabulaire commun. Dire « mets une Stratégie ici » dit beaucoup en trois mots.</p>`,
      snip:`Famille           Question                       Exemples
Création          comment créer les objets ?     Singleton, Fabrique, Builder
Structure         comment les assembler ?        Adaptateur, Décorateur, Composite
Comportement      comment ils interagissent ?    Stratégie, Observateur, Itérateur,
                                                 Méthode modèle`,
      p2:`<p>Tu en as déjà utilisé deux : l'<strong>Itérateur</strong> (chapitre 9, <code>__iter__</code>) et la <strong>Méthode modèle</strong> (chapitre 7).</p>` },
    { t:'say', h:'Singleton : un seul exemplaire', file:'singleton.py',
      p:`<p>Le <strong>Singleton</strong> garantit qu'une classe n'a <strong>qu'une seule instance</strong>, accessible partout. Exemple : la configuration du jeu.</p><p>En Python, on peut redéfinir <code>__new__</code>, la méthode qui fabrique l'objet (avant <code>__init__</code>) : elle renvoie toujours la même instance. (En vrai, un module Python est déjà un singleton : il n'est chargé qu'une fois.)</p><p>Attention : un Singleton est une variable globale déguisée, difficile à tester. Préfère l'injection de dépendance quand tu peux.</p>`,
      code:`class Config:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.volume = 5
        return cls._instance

a = Config()
b = Config()
a.volume = 9
print(b.volume)
print(a is b)` },
    { t:'compare', h:'Le Singleton en Java',
      p:`<p>En Java, la recette classique : un constructeur <code>private</code> (personne ne peut faire <code>new</code>), une instance <code>static final</code>, et une méthode <code>getInstance()</code>.</p>`,
      py:`class Config:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance`,
      java:`public final class Config {
    private static final Config INSTANCE = new Config();
    private int volume = 5;

    private Config() { }               // personne d'autre ne fait new

    public static Config getInstance() {
        return INSTANCE;
    }
}

Config.getInstance().setVolume(9);`,
      notes:['<code>new Config()</code> ne compile pas hors de la classe : le constructeur est privé.','<code>static</code> + <code>final</code> : une seule instance, créée une fois.'] },
    { t:'say', h:'Fabrique : centraliser la création', file:'fabrique.py',
      p:`<p>La <strong>Fabrique</strong> (<em>Factory</em>) rassemble la création des objets en <strong>un seul endroit</strong>. Le reste du programme demande « un gobelin », sans connaître les classes concrètes. Ici, un dictionnaire associe chaque nom à une classe.</p><p>Pour ajouter un monstre, on touche seulement la fabrique.</p>`,
      code:`class Gobelin:
    def __init__(self):
        self.pv = 20

class Orc:
    def __init__(self):
        self.pv = 40

class FabriqueMonstres:
    _modeles = {"gobelin": Gobelin, "orc": Orc}

    @classmethod
    def creer(cls, nom):
        if nom not in cls._modeles:
            raise ValueError(f"monstre inconnu : {nom}")
        return cls._modeles[nom]()

vague = [FabriqueMonstres.creer(n) for n in ["gobelin", "orc", "gobelin"]]
for m in vague:
    print(type(m).__name__, m.pv)` },
    { t:'say', h:'Stratégie : des algorithmes interchangeables', file:'strategie.py',
      p:`<p>La <strong>Stratégie</strong> (<em>Strategy</em>) : on définit une famille d'algorithmes derrière une interface commune, et l'objet <strong>a</strong> une stratégie, qu'on peut changer en cours de route. C'est la composition plutôt que l'héritage (chapitre 8).</p><p>Ici, le comportement d'un monstre au combat est une stratégie : agressif, prudent… On peut le changer pendant la partie.</p>`,
      code:`class Agressif:
    def decider(self, pv):
        return "attaque"

class Prudent:
    def decider(self, pv):
        return "fuit" if pv < 10 else "attaque"

class Monstre:
    def __init__(self, nom, pv, strategie):
        self.nom = nom
        self.pv = pv
        self.strategie = strategie

    def agir(self):
        return f"{self.nom} {self.strategie.decider(self.pv)}"

loup = Monstre("Loup", 5, Agressif())
print(loup.agir())
loup.strategie = Prudent()        # on change de stratégie en cours de partie
print(loup.agir())` },
    { t:'say', h:'Observateur : prévenir automatiquement', file:'observateur.py',
      p:`<p>L'<strong>Observateur</strong> (<em>Observer</em>) : un objet (le <strong>sujet</strong>) garde une liste d'<strong>abonnés</strong>, et les prévient quand quelque chose se passe. Le sujet ne connaît que l'interface des abonnés (une méthode <code>notifier</code>), rien de plus : couplage faible.</p><p>Tu le croises partout : les boutons d'une interface graphique, <code>addEventListener</code> en JavaScript, les notifications de ton téléphone.</p>`,
      code:`class Crieur:
    def __init__(self):
        self._abonnes = []

    def abonner(self, abonne):
        self._abonnes.append(abonne)

    def annoncer(self, nouvelle):
        for a in self._abonnes:
            a.notifier(nouvelle)

class Villageois:
    def __init__(self, nom):
        self.nom = nom

    def notifier(self, nouvelle):
        print(self.nom, "apprend :", nouvelle)

class Registre:
    def __init__(self):
        self.archives = []

    def notifier(self, nouvelle):
        self.archives.append(nouvelle)

crieur = Crieur()
registre = Registre()
crieur.abonner(Villageois("Marthe"))
crieur.abonner(registre)
crieur.annoncer("Un dragon approche !")
print("Archives :", registre.archives)` },
    { t:'quiz', h:'Quel pattern ?', p:`<p>Dans un jeu, quand le héros monte de niveau, la barre d'XP, le journal et le système de succès doivent tous réagir, sans que la classe <code>Heros</code> les connaisse. Quel pattern ?</p>`,
      opts:[ {l:'Singleton', why:'Le Singleton garantit une instance unique. Ici, on veut prévenir plusieurs objets.'},
             {l:'Fabrique', why:'La Fabrique sert à créer des objets.'},
             {l:'Stratégie', why:'La Stratégie rend un algorithme interchangeable. Ici, il s’agit de prévenir des abonnés.'},
             {l:'Observateur', ok:1} ],
      ex:'Le héros est le sujet, les trois systèmes sont des abonnés. Le héros appelle <code>notifier</code> sur chacun, sans savoir qui ils sont.' },
    { t:'quiz', h:'Et celui-là ?', p:`<p>Le joueur peut changer le niveau de difficulté pendant la partie, ce qui change la façon dont les ennemis calculent leurs dégâts. Quel pattern ?</p>`,
      opts:[ {l:'Stratégie', ok:1},
             {l:'Observateur', why:'Personne n’a besoin d’être prévenu : on veut changer un algorithme.'},
             {l:'Singleton', why:'Il n’est pas question d’instance unique ici.'},
             {l:'Méthode modèle', why:'La Méthode modèle fixe un squelette par héritage, qu’on ne change pas en cours de partie.'} ],
      ex:'Chaque difficulté est une stratégie de calcul des dégâts, et l’ennemi en <strong>a</strong> une, qu’on remplace en cours de partie.' },
    { t:'code', h:'À toi : la stratégie de soin', file:'strategie_soin.py',
      p:`<p>Écris deux stratégies de soin, chacune avec une méthode <code>choisir(allies)</code> qui renvoie l'allié à soigner :</p><ul><li><code>PlusBlesse</code> : l'allié qui a le moins de PV ;</li><li><code>Premier</code> : le premier de la liste.</li></ul><p>Puis complète <code>Pretre</code> : il <strong>a</strong> une stratégie (donnée au constructeur), et sa méthode <code>soigner(allies)</code> ajoute 10 PV à l'allié choisi par la stratégie et renvoie son nom.</p>`,
      code:`class Allie:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv
`,
      sol:`class Allie:
    def __init__(self, nom, pv):
        self.nom = nom
        self.pv = pv

class PlusBlesse:
    def choisir(self, allies):
        return min(allies, key=lambda a: a.pv)

class Premier:
    def choisir(self, allies):
        return allies[0]

class Pretre:
    def __init__(self, strategie):
        self.strategie = strategie

    def soigner(self, allies):
        cible = self.strategie.choisir(allies)
        cible.pv += 10
        return cible.nom

groupe = [Allie("Sam", 50), Allie("Léa", 15)]
print(Pretre(PlusBlesse()).soigner(groupe))`,
      hints:['<code>PlusBlesse.choisir</code> : <code>return min(allies, key=lambda a: a.pv)</code>. <code>Premier.choisir</code> : <code>return allies[0]</code>.','<code>Pretre.soigner</code> : <code>cible = self.strategie.choisir(allies)</code>, <code>cible.pv += 10</code>, <code>return cible.nom</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
_g = [Allie("A", 30), Allie("B", 5), Allie("C", 20)]
_p = Pretre(Premier())
print("#T", _p.soigner(_g), _g[0].pv)
_p.strategie = PlusBlesse()
print("#U", _p.soigner(_g), _g[1].pv)`);
        if (t.err) return TESTERR(t);
        if (!/#T A 40/.test(t.out)) return 'Avec la stratégie Premier, le prêtre soigne A (le premier) de 10 PV.';
        if (!/#U B 15/.test(t.out)) return 'Après avoir changé de stratégie (PlusBlesse), il soigne B (5 PV), le plus blessé.';
        return true;
      },
      ok:'J’ai changé la stratégie du prêtre pendant le test : son comportement a changé, sans toucher à sa classe.' },
    { t:'code', defi:1, h:'À toi : l’observateur de quêtes', file:'observateur_quetes.py',
      p:`<p>Écris un sujet <code>TableauQuetes</code> : il garde une liste d'abonnés, une méthode <code>abonner(a)</code>, et une méthode <code>publier(titre)</code> qui appelle <code>a.notifier(titre)</code> sur chaque abonné.</p><p>Puis deux abonnés : <code>Aventurier(nom)</code>, dont <code>notifier</code> ajoute le titre à sa liste <code>quetes_vues</code> ; et <code>Compteur</code>, dont <code>notifier</code> augmente son attribut <code>total</code>.</p>`,
      code:``,
      sol:`class TableauQuetes:
    def __init__(self):
        self._abonnes = []

    def abonner(self, a):
        self._abonnes.append(a)

    def publier(self, titre):
        for a in self._abonnes:
            a.notifier(titre)

class Aventurier:
    def __init__(self, nom):
        self.nom = nom
        self.quetes_vues = []

    def notifier(self, titre):
        self.quetes_vues.append(titre)

class Compteur:
    def __init__(self):
        self.total = 0

    def notifier(self, titre):
        self.total += 1

t = TableauQuetes()
sam = Aventurier("Sam")
c = Compteur()
t.abonner(sam)
t.abonner(c)
t.publier("Chasser les loups")
print(sam.quetes_vues, c.total)`,
      hints:['Le sujet ressemble au <code>Crieur</code> de l’exemple. Chaque abonné a une méthode <code>notifier(self, titre)</code>.','<code>Aventurier</code> : <code>self.quetes_vues.append(titre)</code>. <code>Compteur</code> : <code>self.total += 1</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
_t = TableauQuetes()
_a, _b, _c = Aventurier("A"), Aventurier("B"), Compteur()
_t.abonner(_a)
_t.abonner(_c)
_t.publier("Q1")
_t.abonner(_b)
_t.publier("Q2")
class _Espion:
    def notifier(self, titre):
        print("#E", titre)
_t.abonner(_Espion())
_t.publier("Q3")
print("#T", _a.quetes_vues, _b.quetes_vues, _c.total)`);
        if (t.err) return TESTERR(t);
        if (!/#E Q3/.test(t.out)) return 'Le tableau doit prévenir <strong>tout</strong> abonné qui a une méthode <code>notifier</code>, même d’une classe qu’il ne connaît pas.';
        if (!/#T \['Q1', 'Q2', 'Q3'\] \['Q2', 'Q3'\] 3/.test(t.out)) return 'Un abonné ne reçoit que les quêtes publiées après son abonnement. Vérifie aussi le compteur.';
        return true;
      },
      ok:'Ton tableau ne connaît aucun abonné en particulier. J’ai même glissé un espion dans le test : il a été prévenu comme les autres.' }
  ],
  recap:['<strong>Design pattern</strong> : une solution connue, avec un nom, à un problème de conception courant. Trois familles : création, structure, comportement.','<strong>Singleton</strong> : une seule instance (Java : constructeur <code>private</code> + <code>getInstance()</code>). À utiliser avec modération.','<strong>Fabrique</strong> : la création est centralisée, le reste du code ne connaît pas les classes concrètes.','<strong>Stratégie</strong> : l’objet <em>a</em> un algorithme interchangeable, même en cours de route.','<strong>Observateur</strong> : un sujet prévient une liste d’abonnés via une méthode commune (<code>notifier</code>).'] };

/* ---------- 10.5 ---------- */
const F1 = `class Journal:
    def __init__(self):
        self._abonnes = []

    def abonner(self, abonne):
        self._abonnes.append(abonne)

    def publier(self, evenement, texte):
        for a in self._abonnes:
            a.notifier(evenement, texte)

class Console:
    def notifier(self, evenement, texte):
        print(texte)

class Statistiques:
    def __init__(self):
        self.compte = {}

    def notifier(self, evenement, texte):
        self.compte[evenement] = self.compte.get(evenement, 0) + 1`;
const F2 = `

class Strategie:
    def choisir(self, ennemis):
        raise NotImplementedError

class Brute(Strategie):
    def choisir(self, ennemis):
        return ennemis[0]

class Rusee(Strategie):
    def choisir(self, ennemis):
        return min(ennemis, key=lambda e: e.pv)

class Combattant:
    def __init__(self, nom, pv, force, strategie, journal):
        self.nom = nom
        self.pv = pv
        self.force = force
        self.strategie = strategie
        self.journal = journal

    def est_vivant(self):
        return self.pv > 0

    def recevoir(self, degats):
        self.pv = max(0, self.pv - degats)
        if self.pv == 0:
            self.journal.publier("mort", f"{self.nom} est vaincu !")

    def jouer(self, ennemis):
        vivants = [e for e in ennemis if e.est_vivant()]
        if not vivants:
            return
        cible = self.strategie.choisir(vivants)
        self.journal.publier("attaque", f"{self.nom} attaque {cible.nom} ({self.force})")
        cible.recevoir(self.force)`;
const F3 = `

class Fabrique:
    MODELES = {"gobelin": (20, 4), "orc": (35, 7), "troll": (60, 9)}

    def __init__(self, journal):
        self._journal = journal

    def creer(self, texte):
        espece, nom = texte.split()
        if espece not in Fabrique.MODELES:
            raise ValueError(f"espèce inconnue : {espece}")
        pv, force = Fabrique.MODELES[espece]
        return Combattant(nom, pv, force, Brute(), self._journal)`;
const F4 = `

def partie(heros, monstres, journal):
    tour = 1
    while any(h.est_vivant() for h in heros) and any(m.est_vivant() for m in monstres):
        journal.publier("tour", f"--- Tour {tour} ---")
        for h in heros:
            if h.est_vivant():
                h.jouer(monstres)
        for m in monstres:
            if m.est_vivant():
                m.jouer(heros)
        tour += 1
    gagnants = "héros" if any(h.est_vivant() for h in heros) else "monstres"
    journal.publier("fin", f"Victoire des {gagnants} !")

journal = Journal()
stats = Statistiques()
journal.abonner(Console())
journal.abonner(stats)
fab = Fabrique(journal)
heros = [Combattant("Sam", 50, 12, Rusee(), journal), Combattant("Léa", 30, 8, Brute(), journal)]
monstres = [fab.creer("orc Grok"), fab.creer("gobelin Zig")]
partie(heros, monstres, journal)
print(stats.compte)`;
LES['p10-5'] = { title:'Projet final : le mini jeu de rôle complet', dur:'25 min',
  intro:'Le grand final ! Un moteur de combat complet qui réunit tout le cours : classes, encapsulation, polymorphisme, interfaces, composition, exceptions, et trois design patterns (Observateur, Stratégie, Fabrique).',
  steps:[
    { t:'say', h:'Le projet',
      p:`<p>L'architecture :</p><ul><li>un <strong>Journal</strong> (Observateur) prévient ses abonnés de chaque événement : une <code>Console</code> qui affiche, des <code>Statistiques</code> qui comptent ;</li><li>chaque <strong>Combattant</strong> a une <strong>Stratégie</strong> pour choisir sa cible (<code>Brute</code> : le premier, <code>Rusee</code> : le plus faible) ;</li><li>une <strong>Fabrique</strong> crée les monstres à partir d'un texte comme <code>"orc Grok"</code> ;</li><li>la fonction <code>partie</code> fait jouer tout le monde, tour après tour.</li></ul><p>Le résultat final :</p>`,
      snip:`--- Tour 1 ---
Sam attaque Zig (12)
Léa attaque Grok (8)
Grok attaque Sam (7)
Zig attaque Sam (4)
--- Tour 2 ---
Sam attaque Zig (12)
Zig est vaincu !
Léa attaque Grok (8)
Grok attaque Sam (7)
--- Tour 3 ---
Sam attaque Grok (12)
Léa attaque Grok (8)
Grok est vaincu !
Victoire des héros !
{'tour': 3, 'attaque': 9, 'mort': 2, 'fin': 1}`,
      p2:`<p>Quatre étapes. Je reprends ton code à chaque fois. Prends ton temps : c'est le projet le plus complet du site.</p>` },
    { t:'code', h:'Étape 1 : le Journal et ses abonnés (Observateur)', file:'jeu.py',
      p:`<p>Écris :</p><ul><li><code>Journal</code> : une liste d'abonnés, <code>abonner(abonne)</code>, et <code>publier(evenement, texte)</code> qui appelle <code>notifier(evenement, texte)</code> sur chaque abonné ;</li><li><code>Console</code> : son <code>notifier</code> affiche le texte ;</li><li><code>Statistiques</code> : un dictionnaire <code>compte</code> ; son <code>notifier</code> compte combien de fois chaque sorte d'événement est arrivée.</li></ul>`,
      code:``,
      sol: F1,
      hints:['Le Journal ressemble au Crieur de la leçon précédente, avec deux paramètres : <code>evenement</code> et <code>texte</code>.','Statistiques : <code>self.compte[evenement] = self.compte.get(evenement, 0) + 1</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
_j = Journal()
_s = Statistiques()
_j.abonner(Console())
_j.abonner(_s)
_j.publier("a", "#1 bonjour")
_j.publier("b", "#2 salut")
_j.publier("a", "#3 re")
print("#T", _s.compte)`);
        if (t.err) return TESTERR(t);
        const l = linesOf(t.out);
        if (l.slice(0, 3).join('|') !== '#1 bonjour|#2 salut|#3 re') return 'La Console doit afficher chaque texte publié, dans l’ordre.';
        if (!/#T \{'a': 2, 'b': 1\}/.test(t.out)) return 'Les Statistiques doivent compter les événements : <code>{\'a\': 2, \'b\': 1}</code>.';
        return true;
      },
      ok:'Le Journal ne sait pas qui l’écoute. On pourra ajouter un abonné (une sauvegarde, un son…) sans le modifier.' },
    { t:'code', carry:1, h:'Étape 2 : les Combattants et leurs Stratégies', file:'jeu.py',
      p:`<p>Ajoute :</p><ul><li><code>Strategie</code> (abstraite, <code>choisir(ennemis)</code> lève <code>NotImplementedError</code>), <code>Brute</code> (le premier ennemi) et <code>Rusee</code> (celui qui a le moins de PV) ;</li><li><code>Combattant(nom, pv, force, strategie, journal)</code> avec <code>est_vivant()</code> ; <code>recevoir(degats)</code> (jamais sous 0, et s'il tombe à 0, il publie l'événement <code>"mort"</code> avec le texte <code>Zig est vaincu !</code>) ; et <code>jouer(ennemis)</code> : parmi les ennemis vivants (s'il y en a), la stratégie choisit la cible, il publie <code>"attaque"</code> avec <code>Sam attaque Zig (12)</code>, <strong>puis</strong> la cible reçoit sa force.</li></ul>`,
      code:`# Étape 2 : les stratégies et le Combattant
`,
      sol: F1 + F2,
      hints:['Dans <code>jouer</code> : <code>vivants = [e for e in ennemis if e.est_vivant()]</code>, <code>if not vivants: return</code>, puis <code>cible = self.strategie.choisir(vivants)</code>.','Publie l’attaque avant <code>cible.recevoir(self.force)</code>, pour que la mort s’affiche après l’attaque.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
_j = Journal()
_j.abonner(Console())
_a = Combattant("A", 10, 6, Rusee(), _j)
_x = Combattant("X", 30, 1, Brute(), _j)
_y = Combattant("Y", 5, 1, Brute(), _j)
_a.jouer([_x, _y])
print("#P", _x.pv, _y.pv, _y.est_vivant())
_x.jouer([_a])
_a.jouer([_y])
print("#Q", _a.pv)
_b = Combattant("B", 9, 99, Brute(), _j)
_b.jouer([_y, _x])
print("#R", _x.pv)` + tryPy('S', 'Strategie().choisir([_x])', 'NotImplementedError'));
        if (t.err) return TESTERR(t);
        const l = linesOf(t.out);
        const want = ['A attaque Y (6)', 'Y est vaincu !', '#P 30 0 False', 'X attaque A (1)', '#Q 9', 'B attaque X (99)', 'X est vaincu !', '#R 0', '#S ERREUR'];
        if (l.join('|') !== want.join('|')) return 'Un test échoue. J’attends, dans l’ordre : <code>A attaque Y (6)</code> (la Rusée vise le plus faible), <code>Y est vaincu !</code>, puis X attaque A, puis A ne fait rien (plus d’ennemi vivant), puis B (Brute) vise le premier ennemi <strong>vivant</strong> : X. Et <code>Strategie().choisir</code> lève <code>NotImplementedError</code>.';
        return true;
      },
      ok:'Chaque combattant délègue son choix à sa stratégie, et raconte tout au journal sans savoir qui écoute.' },
    { t:'code', carry:1, h:'Étape 3 : la Fabrique de monstres', file:'jeu.py',
      p:`<p>Ajoute une classe <code>Fabrique</code> :</p><ul><li>un attribut de classe <code>MODELES</code> : <code>{"gobelin": (20, 4), "orc": (35, 7), "troll": (60, 9)}</code> (PV, force) ;</li><li>un constructeur qui reçoit le journal (injection de dépendance) ;</li><li><code>creer(texte)</code> : pour <code>"orc Grok"</code>, elle renvoie un Combattant nommé Grok avec les stats d'un orc et la stratégie <code>Brute</code>. Pour une espèce inconnue, elle lève <code>ValueError</code>.</li></ul>`,
      code:`# Étape 3 : la Fabrique
`,
      sol: F1 + F2 + F3,
      hints:['<code>espece, nom = texte.split()</code>, puis <code>if espece not in Fabrique.MODELES: raise ValueError(...)</code>.','<code>pv, force = Fabrique.MODELES[espece]</code> et <code>return Combattant(nom, pv, force, Brute(), self._journal)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const t = await test([], code + `
_j = Journal()
_f = Fabrique(_j)
_t = _f.creer("troll Ugg")
print("#T", type(_t).__name__, _t.nom, _t.pv, _t.force, type(_t.strategie).__name__, _t.journal is _j)` + tryPy('A', '_f.creer("dragon Smaug")'));
        if (t.err) return TESTERR(t);
        if (!/#T Combattant Ugg 60 9 Brute True/.test(t.out)) return '<code>creer("troll Ugg")</code> doit renvoyer un Combattant Ugg, 60 PV, force 9, stratégie Brute, avec le journal reçu par la fabrique.';
        if (!/#A ERREUR/.test(t.out)) return 'Une espèce inconnue doit lever <code>ValueError</code>.';
        return true;
      },
      ok:'Le reste du programme dira juste <code>fab.creer("orc Grok")</code>. Pour un nouveau monstre, une seule ligne à ajouter dans <code>MODELES</code>.' },
    { t:'code', carry:1, h:'Étape 4 : la partie', file:'jeu.py',
      p:`<p>Écris la fonction <code>partie(heros, monstres, journal)</code> : tant qu'il reste un héros vivant <strong>et</strong> un monstre vivant, elle publie <code>"tour"</code> (<code>--- Tour 1 ---</code>), fait jouer chaque héros vivant contre les monstres, puis chaque monstre vivant contre les héros. À la fin, elle publie <code>"fin"</code> avec <code>Victoire des héros !</code> ou <code>Victoire des monstres !</code>.</p><p>Puis lance la partie : un journal avec une Console et des Statistiques, Sam (50 PV, force 12, Rusée) et Léa (30, 8, Brute) contre <code>"orc Grok"</code> et <code>"gobelin Zig"</code>. Affiche <code>stats.compte</code> à la fin.</p>`,
      code:`# Étape 4 : la partie
`,
      sol: F1 + F2 + F3 + F4,
      hints:['<code>any(h.est_vivant() for h in heros)</code> vaut True s’il reste au moins un héros vivant.','Dans la boucle : publier le tour, une boucle sur les héros (<code>h.jouer(monstres)</code> s’il est vivant), une sur les monstres, puis <code>tour += 1</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const want = ['--- Tour 1 ---', 'Sam attaque Zig (12)', 'Léa attaque Grok (8)', 'Grok attaque Sam (7)', 'Zig attaque Sam (4)', '--- Tour 2 ---', 'Sam attaque Zig (12)', 'Zig est vaincu !', 'Léa attaque Grok (8)', 'Grok attaque Sam (7)', '--- Tour 3 ---', 'Sam attaque Grok (12)', 'Léa attaque Grok (8)', 'Grok est vaincu !', 'Victoire des héros !', "{'tour': 3, 'attaque': 9, 'mort': 2, 'fin': 1}"];
        const l = linesOf(r.out);
        for (const [i, w] of want.entries()) if (l[i] !== w) return `La ligne ${i + 1} devrait être <code>${esc(w)}</code>${l[i] ? `, mais j’ai <code>${esc(l[i])}</code>` : ''}.`;
        const t = await test([], code.replace(/fab\.creer\(\s*"orc Grok"\s*\)/, 'fab.creer("troll Grok")').replace(/fab\.creer\(\s*"gobelin Zig"\s*\)/, 'fab.creer("troll Zig")'));
        if (t.err || !/Victoire des monstres !/.test(t.out)) return 'Je remplace les monstres par deux trolls : ils devraient gagner, mais je ne lis pas <code>Victoire des monstres !</code>.';
        return true;
      },
      ok:'Testé aussi avec deux trolls : les monstres gagnent, et ton moteur l’annonce. Tu viens d’écrire un vrai petit moteur de jeu de rôle orienté objet. Bravo !' },
    { t:'compare', h:'Python et Java : la fiche de révision',
      p:`<p>Pour finir, voici l'essentiel du cours sur une seule fiche, à relire avant l'examen.</p>`,
      py:`class Heros(Personnage, Soignable):     # héritage, multiple OK
    NIVEAU_MAX = 99                      # attribut de classe

    def __init__(self, nom):             # constructeur
        super().__init__(nom)            # constructeur parent
        self._pv = 100                   # « privé » par convention

    @property
    def pv(self):                        # getter
        return self._pv

    def __str__(self):                   # affichage
        return f"{self.nom} ({self._pv})"

    def __eq__(self, autre): ...         # égalité (==)
    def __hash__(self): ...

    @classmethod
    def depuis_texte(cls, t): ...        # fabrique

    @staticmethod
    def regle(x): ...                    # méthode statique

# abstrait : from abc import ABC, abstractmethod
# exception : raise ValueError(...) / try / except / finally
# itérable : def __iter__(self): yield ...`,
      java:`public class Heros extends Personnage implements Soignable {
    public static final int NIVEAU_MAX = 99;

    private int pv;

    public Heros(String nom) {
        super(nom);
        this.pv = 100;
    }

    public int getPv() {
        return pv;
    }

    @Override
    public String toString() { return nom + " (" + pv + ")"; }

    @Override
    public boolean equals(Object o) { ... }
    @Override
    public int hashCode() { ... }

    public static Heros depuisTexte(String t) { ... }

    public static int regle(int x) { ... }
}
// abstrait : abstract class / interface
// exception : throw new ...Exception(...) / try / catch / finally / throws
// itérable : implements Iterable<T>`,
      notes:['Python : <code>self</code> explicite, typage dynamique, <code>_</code> par convention, héritage multiple, duck typing.','Java : <code>this</code> implicite, typage statique, <code>private</code> vérifié par le compilateur, un seul <code>extends</code> mais plusieurs <code>implements</code>, surcharge.','Dans les deux : encapsulation, héritage, polymorphisme, abstraction. Les quatre piliers du chapitre 1 !'] },
    { t:'say', h:'Et maintenant ?',
      p:`<p>Tu as parcouru tout le cours de POO : des premières classes aux design patterns, en Python et en Java. Tu sais lire un diagramme UML, choisir entre héritage et composition, écrire des interfaces, lever et attraper tes propres exceptions, et reconnaître un bon design grâce à SOLID.</p><p>Pour aller plus loin :</p><ul><li><strong>Le projet final dans VS Code</strong> : traduis ce moteur en Java, avec une interface <code>Strategie</code>, une interface <code>Abonne</code> et des exceptions vérifiées. Puis ajoute un Mage avec sa propre stratégie, et une sauvegarde abonnée au journal.</li><li><strong>Les tests unitaires</strong> : <em>pytest</em> en Python, <em>JUnit</em> en Java. L'injection de dépendance prend alors tout son sens.</li><li><strong>D'autres patterns</strong> : Décorateur, Adaptateur, Composite, Builder…</li></ul><p>Merci d'avoir codé avec moi. Ssssuper travail ! 🐍</p>` }
  ],
  recap:['<strong>Observateur</strong> : le Journal prévient ses abonnés (Console, Statistiques) sans les connaître.','<strong>Stratégie</strong> : chaque Combattant délègue le choix de sa cible à un objet interchangeable.','<strong>Fabrique</strong> : un seul endroit sait créer les monstres. Le journal lui est injecté.','Un bon design OO : des classes petites et cohésives, qui dépendent d’abstractions, et qu’on étend sans les modifier.'] };

Atelier.chapter({ part:"poo", n:10, title:"SOLID et design patterns",
  lessons:['p10-1','p10-2','p10-3','p10-4','p10-5'].map(id => ({ id, ...LES[id] })) });
})();
