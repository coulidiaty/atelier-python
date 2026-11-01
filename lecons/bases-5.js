/* Partie 1 · Chapitre 5 : Ranger des données */
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has } = Atelier.h;
const LES = {};

/* Petites aides pour les corrections de ce chapitre */
const BUG = 'Voilà le bug ! Exécute, lis ce qui se passe, puis corrige le code.';
const same = (code, start) => code.trim() === start.trim();
const bugOf = id => LES[id].steps.find(s => s.bug).code;
// Ce que le programme affiche après la dernière réponse donnée à input().
const tail = (t, ins) => { let p = 0; for (const v of ins) { const k = t.out.indexOf(v + '\n', p); if (k >= 0) p = k + v.length + 1; } return t.out.slice(p); };
// Exécute le code de l'élève, puis calcule expr avec ses variables et ses fonctions.
// Renvoie { err, val, out } : val est la valeur écrite comme en Python (repr).
async function call(test, code, expr, ins = []){
  const t = await test(ins, code + '\n\nprint("@@" + repr(' + expr + '))');
  if (t.err) return { err:t.err, out:t.out };
  const k = t.out.lastIndexOf('@@');
  return { val:k >= 0 ? t.out.slice(k + 2).trim() : null, out:t.out.slice(0, Math.max(k, 0)) };
}
const defined = (code, name) => new RegExp('^\\s*def\\s+' + name + '\\s*\\(', 'm').test(strip(code));
const noFn = name => `Je ne trouve pas la fonction <code>${name}</code>. Elle commence par <code>def ${name}(</code>.`;
const callErr = (expr, e) => `Quand j’exécute <code>${esc(expr)}</code>, ça plante : ${esc(e.title)}.`;
// Remplace la valeur d'une variable (première affectation) par une autre, écrite en Python.
const swap = (code, name, py) => code.replace(new RegExp('^(\\s*' + name + '\\s*=\\s*).*$', 'm'), '$1' + py);
const num = v => v === null || v === undefined ? NaN : parseFloat(v);

LES['5-1'] = { title:'Les listes', dur:'12 min',
  intro:'Jusqu’ici, une variable contenait une seule valeur. Mais un inventaire, une classe, une liste de courses, c’est plein de valeurs. Pour ça, Python a les <strong>listes</strong>.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur le chapitre 4', p:`<p>Qu'affiche ce code ?</p>`, snip:`def bonus(x):
    print(x + 5)

y = bonus(10)
print(y)`,
      opts:[ {l:'15 puis 15', why:'La fonction affiche 15 mais ne le renvoie pas : y reçoit None.'},
             {l:'15 puis None', ok:1},
             {l:'None', why:'L’appel exécute d’abord le <code>print(x + 5)</code> : 15 s’affiche.'},
             {l:'Une erreur', why:'Pas d’erreur : une fonction sans <code>return</code> renvoie None, tout simplement.'} ],
      ex:'<code>print</code> montre, <code>return</code> donne. Sans <code>return</code>, la fonction renvoie None.' },
    { t:'say', h:'Une boîte à plusieurs cases', file:'liste.py', mem:1,
      p:`<p>Une <strong>liste</strong> s'écrit entre crochets <code>[ ]</code>, avec des valeurs séparées par des virgules. Elle garde l'ordre.</p><p>Comme pour le texte, chaque élément a un indice qui commence à <strong>0</strong>. <code>liste[0]</code> est le premier, <code>liste[-1]</code> le dernier, et <code>len(liste)</code> donne le nombre d'éléments.</p>`,
      code:`inventaire = ["épée", "potion", "carte"]
print(inventaire)
print(inventaire[0])
print(inventaire[-1])
print(len(inventaire))` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`sac = ["pomme", "corde", "torche", "clé"]
print(sac[2])`,
      opts:[ {l:'corde', why:'On compte à partir de 0 : pomme = 0, corde = 1, torche = 2.'},
             {l:'torche', ok:1},
             {l:'clé', why:'La clé est à l’indice 3 (ou -1).'},
             {l:'pomme corde', why:'<code>sac[2]</code> donne un seul élément : celui à l’indice 2.'} ],
      ex:'pomme est en 0, corde en 1, <strong>torche en 2</strong>. Les indices des listes marchent exactement comme ceux du texte.' },
    { t:'say', h:'Des listes de nombres', file:'notes.py', mem:1,
      p:`<p>Une liste peut contenir n'importe quoi : du texte, des nombres, et même d'autres listes. Avec des nombres, trois fonctions font gagner un temps fou : <code>sum()</code>, <code>max()</code> et <code>min()</code>.</p>`,
      code:`notes = [12, 15, 9, 17, 14]
print("Total :", sum(notes))
print("Meilleure :", max(notes))
print("Pire :", min(notes))
print("Moyenne :", sum(notes) / len(notes))` },
    { t:'quiz', h:'Le bout de la liste', p:`<p>Que se passe-t-il ?</p>`, snip:`couleurs = ["rouge", "vert", "bleu"]
print(couleurs[3])`,
      opts:[ {l:'Ça affiche bleu', why:'bleu est à l’indice 2. Avec 3 éléments, les indices vont de 0 à 2.'},
             {l:'Ça affiche None', why:'Python ne renvoie pas None pour une case qui n’existe pas : il s’arrête avec une erreur.'},
             {l:'Une IndexError', ok:1},
             {l:'Ça affiche rouge', why:'Python ne revient pas au début de la liste : il signale l’erreur.'} ],
      ex:'Une liste de 3 éléments a les indices 0, 1 et 2. Le dernier indice, c’est toujours <code>len(liste) - 1</code>, ou plus simplement <code>-1</code>.' },
    { t:'say', h:'Est-ce que c’est dedans ?', file:'dedans.py',
      p:`<p><code>in</code> marche aussi avec les listes : <code>"potion" in inventaire</code> vaut <code>True</code> si l'élément y est.</p><p>Et <code>liste.index(valeur)</code> donne la position du premier élément égal à cette valeur.</p>`,
      code:`inventaire = ["épée", "potion", "carte"]
if "potion" in inventaire:
    print("Tu as une potion, en position", inventaire.index("potion"))
if "arc" not in inventaire:
    print("Pas d'arc dans ton sac.")` },
    { t:'code', h:'À toi : le bulletin', file:'bulletin.py',
      p:`<p>La liste <code>notes</code> contient les notes d'un élève. Affiche sur trois lignes : <code>Moyenne : 13.4</code>, <code>Meilleure : 17</code> et <code>Pire : 9</code>.</p><p>Je testerai aussi avec d'autres notes, donc n'écris aucun résultat toi-même.</p>`,
      code:`notes = [12, 15, 9, 17, 14]
`,
      hints:['La moyenne : <code>sum(notes) / len(notes)</code>.','<code>print("Moyenne :", sum(notes) / len(notes))</code>, puis la même chose avec <code>max(notes)</code> et <code>min(notes)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        for (const [l, m, b, p] of [['[12, 15, 9, 17, 14]', 13.4, 17, 9], ['[10, 20]', 15, 20, 10], ['[8, 8, 11]', 9, 11, 8]]) {
          const t = await test([], swap(code, 'notes', l));
          if (t.err) return `Avec les notes ${l}, ton code plante : ${esc(t.err.title)}.`;
          const o = norm(t.out);
          const get = w => { const k = o.match(new RegExp(w + '[^0-9\\-]*(-?\\d+(\\.\\d+)?)')); return k ? parseFloat(k[1]) : NaN; };
          if (Math.abs(get('moyenne') - m) > 0.01) return `Avec les notes ${l}, je devrais lire <code>Moyenne : ${m}</code>.`;
          if (get('meilleure') !== b) return `Avec les notes ${l}, je devrais lire <code>Meilleure : ${b}</code>.`;
          if (get('pire') !== p) return `Avec les notes ${l}, je devrais lire <code>Pire : ${p}</code>.`;
        }
        return true;
      },
      ok:'Testé avec trois bulletins. Avec <code>sum</code>, <code>len</code>, <code>max</code> et <code>min</code>, ton code marche pour 5 notes comme pour 500.',
      sol:`notes = [12, 15, 9, 17, 14]
print("Moyenne :", sum(notes) / len(notes))
print("Meilleure :", max(notes))
print("Pire :", min(notes))` },
    { t:'code', defi:1, h:'Où est mon objet ?', file:'cherche.py',
      p:`<p>Si <code>objet</code> est dans <code>inventaire</code>, affiche sa place en comptant à partir de 1, comme un humain : <code>potion : emplacement 2</code>. Sinon, affiche <code>Tu n'as pas de potion.</code> (avec le nom de l'objet).</p>`,
      code:`inventaire = ["épée", "potion", "carte", "potion"]
objet = "potion"
`,
      hints:['<code>if objet in inventaire:</code>, sinon <code>else:</code>.','La place pour un humain : <code>inventaire.index(objet) + 1</code>. Puis <code>print(f"{objet} : emplacement {place}")</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        for (const [o, w] of [['potion', 'potion : emplacement 2'], ['épée', 'épée : emplacement 1'], ['carte', 'carte : emplacement 3'], ['arc', 'Tu n\'as pas de arc.']]) {
          const t = await test([], swap(code, 'objet', `"${o}"`));
          if (t.err) return `Avec l’objet « ${o} », ton code plante : ${esc(t.err.title)}.${/ValueError/.test(t.err.raw) ? ' <code>index()</code> plante si l’objet n’est pas là : vérifie d’abord avec <code>in</code>.' : ''}`;
          const ok = w.startsWith('Tu') ? /pas de arc/i.test(t.out) : norm(t.out).replace(/\s+/g, ' ').includes(norm(w));
          if (!ok) return `Avec l’objet « ${o} », je devrais lire <code>${esc(w)}</code>.${o === 'potion' && /emplacement 4/.test(t.out) ? ' <code>index()</code> donne la <strong>première</strong> potion.' : ''}`;
        }
        return true;
      },
      ok:'Testé avec quatre objets, dont un absent. <code>in</code> avant <code>index()</code> : c’est le bon réflexe pour éviter la <code>ValueError</code>.',
      sol:`inventaire = ["épée", "potion", "carte", "potion"]
objet = "potion"
if objet in inventaire:
    place = inventaire.index(objet) + 1
    print(f"{objet} : emplacement {place}")
else:
    print(f"Tu n'as pas de {objet}.")` },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code devrait afficher le dernier objet du sac. Il plante. Exécute-le, lis l'explication, puis répare-le.</p>`,
      code:`sac = ["corde", "torche", "clé"]
print(sac[len(sac)])`,
      hints:['<code>len(sac)</code> vaut 3. Et l’indice 3 n’existe pas : les indices vont de 0 à 2.','Utilise <code>sac[len(sac) - 1]</code>, ou plus court : <code>sac[-1]</code>.'],
      check:(r, code) => same(code, bugOf('5-1')) ? BUG : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : linesOf(r.out).join() !== 'clé' ? 'Il faut afficher <code>clé</code>, le dernier objet.' : strip(code).split('\n').slice(1).join('\n').includes('clé') ?'N’écris pas « clé » toi-même : va le chercher dans la liste.' : true,
      ok:'Le dernier élément, c’est <code>len(liste) - 1</code>. Ou <code>-1</code>, que tous les développeurs Python préfèrent.',
      sol:`sac = ["corde", "torche", "clé"]
print(sac[-1])` }
  ],
  recap:['Une liste : <code>[1, 2, 3]</code>. Elle garde l’ordre et peut contenir n’importe quoi.','Indices à partir de 0 : <code>liste[0]</code> le premier, <code>liste[-1]</code> le dernier.','<code>len()</code>, <code>sum()</code>, <code>max()</code>, <code>min()</code> marchent sur les listes.','<code>x in liste</code> pour tester, <code>liste.index(x)</code> pour trouver la position.','Un indice trop grand donne une <code>IndexError</code>.'] };

LES['5-2'] = { title:'Modifier une liste', dur:'14 min',
  intro:'Un inventaire, ça bouge : on ramasse des objets, on en utilise, on en vend. Contrairement au texte, une liste peut être modifiée sur place.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`scores = [40, 10, 30]
print(max(scores) - min(scores))`,
      opts:[ {l:'30', ok:1},
             {l:'10', why:'<code>max</code> donne 40 et <code>min</code> donne 10.'},
             {l:'40', why:'On soustrait le minimum au maximum.'},
             {l:'Une erreur', why:'<code>max</code> et <code>min</code> renvoient des nombres, qu’on peut soustraire.'} ],
      ex:'40 - 10 = 30 : l’écart entre le meilleur et le pire score.' },
    { t:'say', h:'Ajouter', file:'ajouter.py', mem:1,
      p:`<p><code>append(x)</code> ajoute un élément <strong>à la fin</strong>. <code>insert(i, x)</code> l'insère à la position i, et décale les autres.</p><p>Ce sont des méthodes : on les écrit après un point, comme <code>upper()</code> pour le texte. Mais elles modifient la liste elle-même, sans en créer une nouvelle.</p>`,
      code:`inventaire = ["épée"]
inventaire.append("potion")
inventaire.append("carte")
inventaire.insert(0, "bouclier")
print(inventaire)` },
    { t:'say', h:'Enlever et remplacer', file:'enlever.py', mem:1,
      p:`<ul><li><code>remove(x)</code> enlève le premier élément égal à x.</li><li><code>pop()</code> enlève le dernier élément et le <strong>renvoie</strong>. <code>pop(i)</code> fait pareil à la position i.</li><li><code>liste[i] = x</code> remplace l'élément à la position i.</li></ul>`,
      code:`inventaire = ["bouclier", "épée", "potion", "carte"]
inventaire.remove("carte")
bue = inventaire.pop()
print("Tu bois :", bue)
inventaire[1] = "épée de feu"
print(inventaire)` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`l = [1, 2, 3]
l.append(4)
l.pop(0)
print(l)`,
      opts:[ {l:'[1, 2, 3, 4]', why:'<code>pop(0)</code> enlève l’élément à l’indice 0.'},
             {l:'[2, 3, 4]', ok:1},
             {l:'[1, 2, 3]', why:'<code>append(4)</code> a bien ajouté 4, puis <code>pop(0)</code> a enlevé le 1.'},
             {l:'[2, 3]', why:'<code>pop(0)</code> enlève le premier élément, pas le dernier.'} ],
      ex:'Après <code>append</code> : [1, 2, 3, 4]. Après <code>pop(0)</code>, le premier part : [2, 3, 4].' },
    { t:'quiz', h:'Le piège de append', p:`<p>Qu'affiche ce code ?</p>`, snip:`sac = ["corde"]
sac = sac.append("torche")
print(sac)`,
      opts:[ {l:"['corde', 'torche']", why:'<code>append</code> modifie la liste, mais elle ne renvoie rien (None). Et ce None est rangé dans sac.'},
             {l:"['torche']", why:'Le problème n’est pas là : c’est la valeur renvoyée par <code>append</code> qui est rangée dans sac.'},
             {l:'None', ok:1},
             {l:'Une erreur', why:'Python ne plante pas ici, mais le sac est perdu.'} ],
      ex:'<code>append</code> modifie la liste et renvoie None. Écrire <code>sac = sac.append(…)</code> remplace ta liste par None. On écrit juste <code>sac.append("torche")</code>.' },
    { t:'say', h:'Deux noms, une seule liste', file:'alias.py', mem:1,
      p:`<p>Attention, piège important (il reviendra en POO) : <code>b = a</code> ne copie pas la liste. Ça donne un <strong>deuxième nom</strong> à la même liste. Modifier par b, c'est modifier a.</p><p>Pour avoir une vraie copie indépendante, on écrit <code>a.copy()</code>.</p>`,
      code:`sac_sam = ["corde", "pain"]
sac_lea = sac_sam
sac_lea.append("épée")
print("Sam :", sac_sam)

sac_leo = sac_sam.copy()
sac_leo.append("arc")
print("Sam :", sac_sam)
print("Léo :", sac_leo)` },
    { t:'quiz', h:'Qui a changé ?', p:`<p>Qu'affiche ce code ?</p>`, snip:`a = [1, 2]
b = a
b[0] = 99
print(a)`,
      opts:[ {l:'[1, 2]', why:'b et a sont deux noms pour la <strong>même</strong> liste. Changer b, c’est changer a.'},
             {l:'[99, 2]', ok:1},
             {l:'[99, 1, 2]', why:'<code>b[0] = 99</code> remplace l’élément, il n’en ajoute pas.'},
             {l:'Une erreur', why:'Le code est valide.'} ],
      ex:'Avec les nombres et le texte, <code>b = a</code> ne pose jamais de problème, car on ne peut pas les modifier sur place. Avec les listes, si : il faut <code>a.copy()</code> pour une copie.' },
    { t:'code', h:'À toi : la journée d’aventure', file:'journee.py', mem:1,
      p:`<p>En partant de cet inventaire, et <strong>sans réécrire la liste</strong>, fais dans l'ordre :</p><ol><li>le héros boit une potion (enlève une <code>"potion"</code>) ;</li><li>il trouve un <code>"bouclier"</code> (ajoute-le à la fin) ;</li><li>il vend sa <code>"carte"</code> ;</li><li>son <code>"épée"</code> devient une <code>"épée de feu"</code> (remplace-la à sa place).</li></ol><p>Affiche l'inventaire à la fin.</p>`,
      code:`inventaire = ["épée", "potion", "potion", "carte"]
`,
      hints:['<code>inventaire.remove("potion")</code>, <code>inventaire.append("bouclier")</code>, <code>inventaire.remove("carte")</code>.','L’épée est à l’indice 0 : <code>inventaire[0] = "épée de feu"</code>.'],
      check:(r, code) => {
        if (r.err) return ERR;
        if ((strip(code).match(/\[\s*["']/g) || []).length > 1) return 'Ne réécris pas la liste : modifie-la avec les méthodes <code>remove</code>, <code>append</code> et l’affectation <code>inventaire[i] = …</code>.';
        const m = memOf(r, 'inventaire');
        if (!m) return 'Garde la variable <code>inventaire</code>.';
        if (m.repr !== "['épée de feu', 'potion', 'bouclier']") return `À la fin, l’inventaire devrait être <code>['épée de feu', 'potion', 'bouclier']</code>, et il vaut <code>${esc(m.repr)}</code>.`;
        if (!r.out.includes('épée de feu')) return 'L’inventaire est bon. Affiche-le avec <code>print</code>.';
        return true;
      },
      ok:'Trois méthodes et une affectation : tu sais faire vivre un inventaire.',
      sol:`inventaire = ["épée", "potion", "potion", "carte"]
inventaire.remove("potion")
inventaire.append("bouclier")
inventaire.remove("carte")
inventaire[0] = "épée de feu"
print(inventaire)` },
    { t:'code', defi:1, h:'La file d’attente de la boutique', file:'file.py',
      p:`<p>Les clients attendent dans l'ordre de la liste <code>clients</code>. Tant qu'il reste quelqu'un, sers le <strong>premier</strong> de la file : enlève-le de la liste et affiche <code>Je sers Sam</code>. Quand la file est vide, affiche <code>Plus personne !</code></p><p>Souviens-toi : une liste vide compte comme faux dans une condition.</p>`,
      code:`clients = ["Sam", "Inès", "Léo"]
`,
      hints:['<code>while clients:</code> tourne tant que la liste n’est pas vide. Ou <code>while len(clients) &gt; 0:</code>.','Dans la boucle : <code>client = clients.pop(0)</code> puis <code>print(f"Je sers {client}")</code>. Après la boucle : <code>print("Plus personne !")</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!/\bwhile\b/.test(code)) return 'Utilise une boucle <code>while</code> qui tourne tant qu’il reste des clients.';
        for (const l of [['Sam', 'Inès', 'Léo'], ['Zoé'], []]) {
          const t = await test([], swap(code, 'clients', '[' + l.map(x => `"${x}"`).join(', ') + ']'));
          if (t.err) return `Avec la file ${esc(JSON.stringify(l))}, ton code plante : ${esc(t.err.title)}.`;
          const ls = linesOf(t.out);
          const want = l.map(x => `Je sers ${x}`).concat(['Plus personne !']);
          if (ls.map(x => norm(x)).join('|') !== want.map(x => norm(x)).join('|')) return `Avec la file ${esc(JSON.stringify(l))}, je devrais lire :<br><code>${want.map(esc).join('<br>')}</code>`;
          const m = memOf(t, 'clients');
          if (!m || m.repr !== '[]') return 'À la fin, la liste <code>clients</code> doit être vide : enlève chaque client servi avec <code>pop(0)</code>.';
        }
        return true;
      },
      ok:'Testé avec trois clients, un seul, et une file vide. <code>pop(0)</code> pour le premier arrivé : c’est le principe d’une file d’attente, partout en informatique.',
      sol:`clients = ["Sam", "Inès", "Léo"]
while clients:
    client = clients.pop(0)
    print(f"Je sers {client}")
print("Plus personne !")` },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code devrait afficher le nombre d'objets du sac après en avoir ajouté un : 3. Il plante. Exécute-le, lis l'explication, puis répare-le.</p>`,
      code:`sac = ["corde", "torche"]
sac = sac.append("clé")
print(len(sac))`,
      hints:['Que renvoie <code>append</code> ? Et que contient sac après la ligne 2 ?','<code>append</code> modifie la liste toute seule : la ligne doit être <code>sac.append("clé")</code>, sans <code>sac =</code>.'],
      check:(r, code) => same(code, bugOf('5-2')) ? BUG : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : linesOf(r.out).join() !== '3' ? 'Il faut afficher 3.' : true,
      ok:'Le <code>NoneType</code> dans le message, c’était le None renvoyé par <code>append</code>. Les méthodes qui modifient une liste renvoient None.',
      sol:`sac = ["corde", "torche"]
sac.append("clé")
print(len(sac))` }
  ],
  recap:['<code>append(x)</code> ajoute à la fin, <code>insert(i, x)</code> à la position i.','<code>remove(x)</code> enlève une valeur, <code>pop()</code> / <code>pop(i)</code> enlève et renvoie un élément.','<code>liste[i] = x</code> remplace l’élément i.','Ces méthodes renvoient None : jamais <code>sac = sac.append(…)</code>.','<code>b = a</code> donne un deuxième nom à la même liste. Pour copier : <code>a.copy()</code>.'] };

LES['5-3'] = { title:'Parcourir et découper une liste', dur:'14 min',
  intro:'Une liste et une boucle <code>for</code>, c’est le duo le plus utilisé en Python. Dans cette leçon, tu parcours, tu filtres, tu tries et tu découpes.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`l = ["a", "b", "c"]
x = l.pop()
print(x, len(l))`,
      opts:[ {l:'c 2', ok:1},
             {l:'a 2', why:'Sans indice, <code>pop()</code> enlève le <strong>dernier</strong> élément.'},
             {l:'c 3', why:'<code>pop()</code> enlève l’élément de la liste : il n’en reste que 2.'},
             {l:'None 2', why:'Contrairement à <code>append</code>, <code>pop</code> renvoie l’élément enlevé.'} ],
      ex:'<code>pop()</code> enlève "c" et le renvoie. Il reste 2 éléments.' },
    { t:'say', h:'Parcourir une liste', file:'parcourir.py',
      p:`<p><code>for</code> parcourt une liste élément par élément, exactement comme un texte lettre par lettre.</p><p>Si tu as aussi besoin de la position, utilise <code>enumerate()</code> : il donne la position <strong>et</strong> l'élément à chaque tour. Le <code>1</code> veut dire « commence à compter à 1 ».</p>`,
      code:`monstres = ["gobelin", "troll", "dragon"]
for m in monstres:
    print("Un", m, "approche !")

for i, m in enumerate(monstres, 1):
    print(f"{i}. {m}")` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`total = 0
for prix in [3, 8, 2, 10]:
    if prix > 5:
        total += prix
print(total)`,
      opts:[ {l:'23', why:'On n’ajoute que les prix plus grands que 5.'},
             {l:'18', ok:1},
             {l:'5', why:'C’est 3 + 2, les prix qu’on <strong>n’ajoute pas</strong>.'},
             {l:'8, 10', why:'Le <code>print</code> est après la boucle : il affiche le total, une seule fois.'} ],
      ex:'Seuls 8 et 10 dépassent 5 : 8 + 10 = 18.' },
    { t:'say', h:'Découper une liste', file:'decouper.py',
      p:`<p>Le <em>slicing</em> (découpage) extrait un morceau : <code>liste[debut:fin]</code>. Comme <code>range</code>, la fin est <strong>exclue</strong>.</p><ul><li><code>l[:3]</code> : les 3 premiers</li><li><code>l[2:]</code> : à partir de l'indice 2</li><li><code>l[-2:]</code> : les 2 derniers</li><li><code>l[::-1]</code> : toute la liste à l'envers</li></ul><p>Ça marche aussi sur le texte : <code>"Python"[:3]</code> donne <code>"Pyt"</code>.</p>`,
      code:`l = [10, 20, 30, 40, 50]
print(l[1:3])
print(l[:3])
print(l[2:])
print(l[-2:])
print(l[::-1])
print("Python"[:3])` },
    { t:'quiz', h:'Quel morceau ?', p:`<p>Qu'affiche ce code ?</p>`, snip:`lettres = ["a", "b", "c", "d", "e"]
print(lettres[1:4])`,
      opts:[ {l:"['a', 'b', 'c', 'd']", why:'On commence à l’indice 1, donc à "b".'},
             {l:"['b', 'c', 'd', 'e']", why:'La fin (4) est exclue : on s’arrête à l’indice 3, "d".'},
             {l:"['b', 'c', 'd']", ok:1},
             {l:"['b', 'e']", why:'Le découpage prend tout ce qui est entre les deux indices, pas seulement les bornes.'} ],
      ex:'De l’indice 1 inclus à l’indice 4 exclu : b, c, d. Astuce : <code>fin - debut</code> = le nombre d’éléments (4 - 1 = 3).' },
    { t:'say', h:'Filtrer et trier', file:'filtrer.py', mem:1,
      p:`<p>Pour <strong>filtrer</strong>, on crée une liste vide, puis on y ajoute avec <code>append</code> les éléments qui nous intéressent. C'est le schéma de l'accumulateur, avec une liste.</p><p>Pour <strong>trier</strong>, <code>sorted(liste)</code> renvoie une nouvelle liste triée. <code>reverse=True</code> trie du plus grand au plus petit. (<code>liste.sort()</code> trie la liste sur place et renvoie None.)</p>`,
      code:`pv_monstres = [30, 120, 45, 80, 15]
costauds = []
for pv in pv_monstres:
    if pv > 50:
        costauds.append(pv)
print(costauds)
print(sorted(pv_monstres))
print(sorted(pv_monstres, reverse=True))` },
    { t:'code', h:'À toi : les notes au-dessus de 10', file:'admis.py', mem:1,
      p:`<p>Crée une liste <code>reussies</code> qui contient seulement les notes supérieures ou égales à 10, dans le même ordre. Affiche-la, puis affiche combien il y en a.</p><p>Je testerai avec d'autres notes.</p>`,
      code:`notes = [12, 8, 15, 10, 6, 17]
`,
      hints:['<code>reussies = []</code> avant une boucle <code>for n in notes:</code>.','Dans la boucle : <code>if n &gt;= 10: reussies.append(n)</code>. Après : <code>print(reussies)</code> et <code>print(len(reussies))</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        for (const l of [[12, 8, 15, 10, 6, 17], [5, 4], [10, 20, 9.5]]) {
          const t = await test([], swap(code, 'notes', JSON.stringify(l).replace(/,/g, ', ')));
          if (t.err) return `Avec les notes ${JSON.stringify(l)}, ton code plante : ${esc(t.err.title)}.`;
          const want = l.filter(n => n >= 10);
          const m = memOf(t, 'reussies');
          if (!m) return 'Range les bonnes notes dans une liste <code>reussies</code>.';
          if (m.repr !== JSON.stringify(want).replace(/,/g, ', ')) return `Avec ${JSON.stringify(l)}, <code>reussies</code> devrait valoir <code>${JSON.stringify(want).replace(/,/g, ', ')}</code>, et vaut <code>${esc(m.repr)}</code>.${want.includes(10) && !m.repr.includes('10') ? ' 10 compte : « supérieur <strong>ou égal</strong> ».' : ''}`;
          if (!linesOf(t.out).includes(String(want.length))) return `Affiche aussi le nombre de notes réussies (${want.length}), sur sa propre ligne.`;
        }
        return true;
      },
      ok:'Testé avec trois séries, dont une sans aucune note réussie. Le schéma « liste vide + append dans un if » est partout dans le vrai code.',
      sol:`notes = [12, 8, 15, 10, 6, 17]
reussies = []
for n in notes:
    if n >= 10:
        reussies.append(n)
print(reussies)
print(len(reussies))` },
    { t:'code', defi:1, h:'Le podium', file:'podium.py',
      p:`<p>Affiche les 3 meilleurs scores, du plus grand au plus petit, sous cette forme :</p><pre class="snippet">1. 950
2. 870
3. 640</pre><p>La liste <code>scores</code> ne doit pas être modifiée. Je testerai avec d'autres scores.</p>`,
      code:`scores = [640, 120, 950, 870, 300]
`,
      hints:['<code>sorted(scores, reverse=True)</code> donne une nouvelle liste triée. <code>[:3]</code> garde les 3 premiers.','<code>for i, s in enumerate(podium, 1):</code> puis <code>print(f"{i}. {s}")</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        for (const l of [[640, 120, 950, 870, 300], [5, 50, 500, 5000], [1, 2, 3]]) {
          const lit = '[' + l.join(', ') + ']';
          const t = await test([], swap(code, 'scores', lit));
          if (t.err) return `Avec les scores ${lit}, ton code plante : ${esc(t.err.title)}.`;
          const want = [...l].sort((a, b) => b - a).slice(0, 3).map((s, k) => `${k + 1}. ${s}`);
          const ls = linesOf(t.out).map(x => x.replace(/\s+/g, ' '));
          if (ls.join('|') !== want.join('|')) return `Avec les scores ${lit}, je devrais lire :<br><code>${want.join('<br>')}</code>`;
          const m = memOf(t, 'scores');
          if (!m || m.repr !== lit) return 'La liste <code>scores</code> a été modifiée. Utilise <code>sorted()</code>, qui crée une nouvelle liste, plutôt que <code>scores.sort()</code>.';
        }
        return true;
      },
      ok:'Trier, découper, numéroter : trois outils, trois lignes. Et la liste d’origine est intacte.',
      sol:`scores = [640, 120, 950, 870, 300]
podium = sorted(scores, reverse=True)[:3]
for i, s in enumerate(podium, 1):
    print(f"{i}. {s}")` },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code devrait additionner tous les scores et afficher 94. Il plante. Exécute-le, lis l'explication, puis répare-le.</p>`,
      code:`scores = [12, 45, 7, 30]
total = 0
for i in range(1, len(scores) + 1):
    total += scores[i]
print(total)`,
      hints:['Les indices d’une liste de 4 éléments vont de 0 à 3. Ici, la boucle oublie le 0 et essaie le 4.','Le plus simple est de parcourir directement les valeurs : <code>for s in scores:</code> puis <code>total += s</code>.'],
      check:(r, code) => same(code, bugOf('5-3')) ? BUG : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : linesOf(r.out).join() !== '94' ? 'Il faut afficher 94, la somme des quatre scores.' : true,
      ok:'Quand on n’a pas besoin de la position, on parcourt directement les éléments. Moins d’indices, moins de bugs.',
      sol:`scores = [12, 45, 7, 30]
total = 0
for s in scores:
    total += s
print(total)` }
  ],
  recap:['<code>for x in liste:</code> parcourt les éléments. <code>enumerate(liste, 1)</code> donne aussi la position.','Découper : <code>l[debut:fin]</code>, fin exclue. <code>l[:3]</code>, <code>l[-2:]</code>, <code>l[::-1]</code>. Marche aussi sur le texte.','Filtrer : une liste vide, puis <code>append</code> dans un <code>if</code>.','<code>sorted(l)</code> renvoie une nouvelle liste triée. <code>l.sort()</code> trie sur place et renvoie None.'] };

LES['5-4'] = { title:'Les méthodes du texte', dur:'14 min',
  intro:'Maintenant que tu connais les listes, le texte devient beaucoup plus puissant : on peut le découper en mots, le nettoyer, puis le recoller. C’est ce que fait tout programme qui lit ce qu’un humain a tapé.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`l = [5, 3, 8, 1]
print(sorted(l)[-1])`,
      opts:[ {l:'1', why:'<code>sorted</code> trie du plus petit au plus grand. Le dernier est donc le plus grand.'},
             {l:'8', ok:1},
             {l:'5', why:'<code>sorted(l)</code> vaut [1, 3, 5, 8], et <code>[-1]</code> prend le dernier.'},
             {l:'[1, 3, 5, 8]', why:'Le <code>[-1]</code> prend un seul élément de la liste triée.'} ],
      ex:'La liste triée est [1, 3, 5, 8], et son dernier élément est 8. (<code>max(l)</code> aurait fait pareil.)' },
    { t:'say', h:'Découper en mots : split', file:'split.py', mem:1,
      p:`<p><code>texte.split()</code> découpe un texte en <strong>liste de mots</strong>, en coupant aux espaces (même s'il y en a plusieurs).</p><p>On peut choisir le séparateur : <code>split(";")</code> coupe aux points-virgules. C'est comme ça qu'on lit les fichiers de données.</p>`,
      code:`phrase = "le  dragon dort   dans la grotte"
mots = phrase.split()
print(mots)
print(len(mots), "mots")

ligne = "Sam;Mage;7"
morceaux = ligne.split(";")
print(morceaux[1])` },
    { t:'quiz', h:'Combien de mots ?', p:`<p>Qu'affiche ce code ?</p>`, snip:`print(len("Python, c'est génial".split()))`,
      opts:[ {l:'20', why:'Ça, c’est le nombre de caractères du texte. Ici, on compte les éléments de la liste après <code>split()</code>.'},
             {l:'3', ok:1},
             {l:'2', why:'Il y a deux espaces, donc trois morceaux.'},
             {l:'4', why:'L’apostrophe ne coupe pas : seuls les espaces comptent. « c\'est » reste un seul morceau.'} ],
      ex:'<code>split()</code> donne <code>["Python,", "c\'est", "génial"]</code> : 3 éléments. La virgule reste collée au mot.' },
    { t:'say', h:'Nettoyer et transformer', file:'nettoyer.py',
      p:`<p>Tu connais déjà <code>upper()</code>, <code>lower()</code>, <code>replace()</code> et <code>strip()</code>. Voici d'autres méthodes utiles :</p><ul><li><code>capitalize()</code> : une majuscule au début, le reste en minuscules</li><li><code>startswith(x)</code> et <code>endswith(x)</code> : commence ou finit par x ?</li><li><code>count(x)</code> : combien de fois x apparaît</li><li><code>find(x)</code> : la position de x, ou -1 s'il n'y est pas</li></ul>`,
      code:`nom = "  sAM  "
propre = nom.strip().capitalize()
print(f"[{propre}]")
fichier = "dragon.png"
print(fichier.endswith(".png"))
print("abracadabra".count("a"))
print("abracadabra".find("cad"))` },
    { t:'quiz', h:'Dans quel ordre ?', p:`<p>Qu'affiche ce code ?</p>`, snip:`print("  Bonjour  ".strip().upper())`,
      opts:[ {l:'  BONJOUR  ', why:'<code>strip()</code> a enlevé les espaces avant que <code>upper()</code> passe.'},
             {l:'BONJOUR', ok:1},
             {l:'Bonjour', why:'<code>upper()</code> met tout en majuscules.'},
             {l:'Une erreur', why:'On peut enchaîner les méthodes : chacune s’applique au résultat de la précédente.'} ],
      ex:'Les méthodes s’enchaînent de gauche à droite : <code>strip()</code> donne "Bonjour", puis <code>upper()</code> donne "BONJOUR".' },
    { t:'say', h:'Recoller : join', file:'join.py',
      p:`<p><code>join</code> fait l'inverse de <code>split</code> : il colle les éléments d'une liste de textes. Le texte <strong>avant</strong> le point est la colle.</p><p>Rappel important : le texte ne se modifie jamais sur place. Toutes ces méthodes renvoient un <strong>nouveau</strong> texte.</p>`,
      code:`objets = ["épée", "potion", "carte"]
print(", ".join(objets))
print(" > ".join(["Village", "Forêt", "Grotte"]))
mot = "secret"
mot.upper()
print(mot)
mot = mot.upper()
print(mot)` },
    { t:'code', h:'À toi : comprendre une commande', file:'commande.py',
      p:`<p>Dans un jeu d'aventure, le joueur tape une commande comme <code>  Prendre   POTION </code>. Nettoie-la et découpe-la, puis affiche : <code>Action : prendre, objet : potion</code> (tout en minuscules).</p><p>Je testerai avec d'autres commandes.</p>`,
      code:`commande = "  Prendre   POTION "
`,
      hints:['<code>mots = commande.lower().split()</code> : <code>split()</code> enlève tous les espaces en trop.','<code>mots[0]</code> est l’action, <code>mots[1]</code> l’objet. Puis <code>print(f"Action : {mots[0]}, objet : {mots[1]}")</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        for (const [c, a, o] of [['  Prendre   POTION ', 'prendre', 'potion'], ['ATTAQUER dragon', 'attaquer', 'dragon'], ['   ouvrir  Coffre', 'ouvrir', 'coffre']]) {
          const t = await test([], swap(code, 'commande', `"${c}"`));
          if (t.err) return `Avec la commande « ${esc(c)} », ton code plante : ${esc(t.err.title)}.`;
          const w = `Action : ${a}, objet : ${o}`;
          if (!t.out.replace(/[ \t]+/g, ' ').includes(w)) return `Avec la commande « ${esc(c)} », je devrais lire <code>${w}</code>.${t.out.trim() ? ` J’ai lu : <code>${esc(t.out.trim())}</code>` : ''}`;
        }
        return true;
      },
      ok:'Testé avec trois commandes mal tapées. <code>lower().split()</code> : deux méthodes, et le texte d’un humain devient des données propres.',
      sol:`commande = "  Prendre   POTION "
mots = commande.lower().split()
print(f"Action : {mots[0]}, objet : {mots[1]}")` },
    { t:'code', defi:1, h:'Le titre bien écrit', file:'titre.py',
      p:`<p>Écris dans <code>resultat</code> le <code>titre</code> avec une majuscule à chaque mot, <strong>sauf</strong> les petits mots de 3 lettres ou moins (de, la, des…), qui restent en minuscules. Le premier mot prend toujours une majuscule. Affiche le résultat.</p><pre class="snippet">"le SEIGNEUR des anneaux"  →  "Le Seigneur des Anneaux"</pre>`,
      code:`titre = "le SEIGNEUR des anneaux"
`,
      hints:['Découpe avec <code>split()</code>, puis parcours les mots avec <code>enumerate</code> pour connaître la position. Range chaque mot transformé dans une nouvelle liste.','Pour chaque mot : <code>if i == 0 or len(mot) &gt; 3:</code> → <code>mot.capitalize()</code>, sinon <code>mot.lower()</code>. À la fin : <code>resultat = " ".join(nouveaux)</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        for (const [t0, w] of [['le SEIGNEUR des anneaux', 'Le Seigneur des Anneaux'], ['la guerre DES étoiles', 'La Guerre des Étoiles'], ['un sac de billes', 'Un sac de Billes'], ['les aventures de TINTIN', 'Les Aventures de Tintin']]) {
          const t = await test([], swap(code, 'titre', `"${t0}"`));
          if (t.err) return `Avec « ${esc(t0)} », ton code plante : ${esc(t.err.title)}.`;
          const m = strOf(memOf(t, 'resultat'));
          if (m === null) return 'Range le titre transformé dans une variable <code>resultat</code>.';
          if (m !== w) return `Avec « ${esc(t0)} », <code>resultat</code> devrait valoir « ${esc(w)} », et vaut « ${esc(m)} ».${w === 'Un sac de Billes' ? ' « Un » prend une majuscule car c’est le premier mot, mais « sac » n’a que 3 lettres.' : ''}`;
          if (!t.out.includes(w)) return 'Le résultat est bon. Affiche-le.';
        }
        return true;
      },
      ok:'split, une boucle avec des conditions, capitalize, join : c’est exactement comme ça qu’on écrit un vrai traitement de texte.',
      sol:`titre = "le SEIGNEUR des anneaux"
nouveaux = []
for i, mot in enumerate(titre.split()):
    if i == 0 or len(mot) > 3:
        nouveaux.append(mot.capitalize())
    else:
        nouveaux.append(mot.lower())
resultat = " ".join(nouveaux)
print(resultat)` },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code devrait afficher le nombre de mots de la phrase : 5. Il plante. Exécute-le, lis le message original, puis répare-le.</p>`,
      code:`phrase = "le dragon garde son trésor"
mots = phrase.split
print(len(mots))`,
      hints:['Le message parle de <code>builtin_function_or_method</code> : mots contient la méthode elle-même, pas son résultat.','Il manque les parenthèses : <code>phrase.split()</code>.'],
      check:(r, code) => same(code, bugOf('5-4')) ? BUG : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : linesOf(r.out).join() !== '5' ? 'Il faut afficher 5.' : true,
      ok:'Sans parenthèses, on parle de la méthode sans l’appeler. Le même piège qu’avec les fonctions au chapitre 4.',
      sol:`phrase = "le dragon garde son trésor"
mots = phrase.split()
print(len(mots))` }
  ],
  recap:['<code>split()</code> découpe en liste de mots. <code>split(";")</code> coupe à un autre séparateur.','<code>"colle".join(liste)</code> recolle une liste de textes.','<code>strip</code>, <code>lower</code>, <code>upper</code>, <code>capitalize</code>, <code>replace</code>, <code>startswith</code>, <code>endswith</code>, <code>count</code>, <code>find</code>.','Les méthodes s’enchaînent : <code>texte.strip().lower().split()</code>.','Le texte ne change jamais sur place : <code>mot = mot.upper()</code>.'] };

LES['5-5'] = { title:'Tuples et ensembles', dur:'12 min',
  intro:'Les listes ne sont pas les seules boîtes à plusieurs cases. Les <strong>tuples</strong> rangent des valeurs qui vont ensemble et ne bougent plus. Les <strong>ensembles</strong> ne gardent jamais deux fois la même chose.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`print("-".join("a b c".split()))`,
      opts:[ {l:'a b c', why:'<code>split()</code> découpe en ["a", "b", "c"], puis <code>join</code> recolle avec des tirets.'},
             {l:'a-b-c', ok:1},
             {l:'-a-b-c-', why:'La colle se met seulement <strong>entre</strong> les éléments.'},
             {l:'a- -b- -c', why:'<code>split()</code> a déjà enlevé les espaces.'} ],
      ex:'On découpe aux espaces, puis on recolle avec des tirets. Une façon courte de remplacer les espaces.' },
    { t:'say', h:'Les tuples', file:'tuple.py', mem:1,
      p:`<p>Un <strong>tuple</strong> s'écrit avec des parenthèses : <code>(3, 7)</code>. Il ressemble à une liste, mais on ne peut plus le modifier. On s'en sert pour des valeurs qui forment un tout : une position, une date, une couleur.</p><p>On peut le <strong>déballer</strong> : <code>x, y = position</code> range chaque valeur dans sa variable. C'est ce qui se passait dans l'échange <code>a, b = b, a</code> du chapitre 1.</p>`,
      code:`position = (3, 7)
print(position[0])
x, y = position
print(f"Le héros est en x={x}, y={y}")
a, b = 1, 2
a, b = b, a
print(a, b)` },
    { t:'quiz', h:'On peut changer ?', p:`<p>Que se passe-t-il ?</p>`, snip:`pos = (3, 7)
pos[0] = 5`,
      opts:[ {l:'pos devient (5, 7)', why:'C’est ce qui se passerait avec une liste. Un tuple, lui, ne se modifie pas.'},
             {l:'Une TypeError', ok:1},
             {l:'pos devient (5, 3, 7)', why:'Même une liste ne ferait pas ça : <code>[0] = </code> remplace, il n’insère pas.'},
             {l:'Rien ne change, sans erreur', why:'Python ne laisse pas passer ça en silence : il signale l’erreur.'} ],
      ex:'« \'tuple\' does not support item assignment ». Pour une nouvelle position, on crée un nouveau tuple : <code>pos = (5, 7)</code>.' },
    { t:'say', h:'Renvoyer plusieurs valeurs', file:'stats.py',
      p:`<p>Une fonction ne renvoie qu'une valeur… mais cette valeur peut être un tuple ! On écrit <code>return a, b</code>, et on déballe à l'appel.</p>`,
      code:`def stats(notes):
    return min(notes), max(notes), sum(notes) / len(notes)

pire, meilleure, moyenne = stats([12, 8, 17])
print(pire, meilleure, round(moyenne, 1))` },
    { t:'say', h:'Les ensembles (set)', file:'set.py', mem:1,
      p:`<p>Un <strong>ensemble</strong> (<em>set</em>) s'écrit avec des accolades <code>{1, 2, 3}</code>. Il ne garde <strong>jamais de doublon</strong>, et il n'a pas d'ordre (pas d'indice). Python l'affiche donc dans un ordre qui peut te surprendre.</p><p>Il sert à deux choses : enlever les doublons (<code>set(liste)</code>), et tester très vite si un élément est dedans.</p><p>Attention : <code>{}</code> tout seul crée un dictionnaire vide (leçon suivante). Un ensemble vide s'écrit <code>set()</code>.</p>`,
      code:`butin = ["or", "potion", "or", "rubis", "or"]
types = set(butin)
print(len(types), "sortes d'objets")
visitees = set()
visitees.add("A1")
visitees.add("B2")
visitees.add("A1")
print(len(visitees), "cases visitées")
print("B2" in visitees)` },
    { t:'quiz', h:'Combien d’éléments ?', p:`<p>Qu'affiche ce code ?</p>`, snip:`print(len({1, 2, 2, 3, 3, 3}))`,
      opts:[ {l:'6', why:'Un ensemble ne garde pas les doublons.'},
             {l:'3', ok:1},
             {l:'1', why:'Il reste 1, 2 et 3 : trois valeurs différentes.'},
             {l:'Une erreur', why:'Écrire des doublons est permis, Python les enlève tout seul.'} ],
      ex:'Il reste {1, 2, 3}. Un ensemble compte les valeurs <strong>différentes</strong>.' },
    { t:'say', h:'Comparer deux ensembles', file:'ensembles.py',
      p:`<p>Les ensembles ont des opérations venues des maths :</p><ul><li><code>a &amp; b</code> : ce qui est dans a <strong>et</strong> dans b (intersection)</li><li><code>a | b</code> : ce qui est dans a <strong>ou</strong> dans b (union)</li><li><code>a - b</code> : ce qui est dans a mais pas dans b</li></ul><p>On trie le résultat avec <code>sorted()</code> pour l'afficher dans un ordre fixe.</p>`,
      code:`sam = {"épée", "corde", "potion"}
lea = {"potion", "arc", "corde"}
print("En commun :", sorted(sam & lea))
print("Tout :", sorted(sam | lea))
print("Seulement Sam :", sorted(sam - lea))` },
    { t:'code', h:'À toi : les bornes', file:'bornes.py',
      p:`<p>Crée une fonction <code>bornes(liste)</code> qui renvoie un tuple : le plus petit et le plus grand élément. Puis utilise-la sur <code>temperatures</code> en déballant le résultat, et affiche <code>De -2 à 9 degrés</code>.</p>`,
      code:`temperatures = [3, -2, 7, 9, 0]
`,
      hints:['<code>def bornes(liste):</code> puis <code>return min(liste), max(liste)</code>.','<code>mini, maxi = bornes(temperatures)</code> puis <code>print(f"De {mini} à {maxi} degrés")</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'bornes')) return noFn('bornes');
        for (const [l, w] of [['[3, -2, 7, 9, 0]', '(-2, 9)'], ['[5]', '(5, 5)'], ['[10, 20, 15]', '(10, 20)']]) {
          const x = await call(test, code, `bornes(${l})`);
          if (x.err) return callErr(`bornes(${l})`, x.err);
          if (x.val === 'None') return '<code>bornes</code> renvoie None : il manque le <code>return</code>.';
          if (x.val !== w) return `<code>bornes(${l})</code> devrait renvoyer <code>${w}</code>, et renvoie <code>${esc(x.val)}</code>.`;
        }
        if (!/De -2 à 9 degr/.test(r.out)) return 'La fonction est parfaite. Utilise-la pour afficher <code>De -2 à 9 degrés</code>.';
        return true;
      },
      ok:'Une fonction, deux résultats, déballés en une ligne. Tu verras ce schéma très souvent.',
      sol:`temperatures = [3, -2, 7, 9, 0]

def bornes(liste):
    return min(liste), max(liste)

mini, maxi = bornes(temperatures)
print(f"De {mini} à {maxi} degrés")` },
    { t:'code', defi:1, h:'Les deux coffres', file:'coffres.py',
      p:`<p>Deux coffres contiennent des objets, parfois en double. Affiche :</p><ul><li>sur une ligne, la liste triée des objets présents dans <strong>les deux</strong> coffres ;</li><li>sur la ligne suivante, le nombre d'objets <strong>différents</strong> en tout.</li></ul><p>Pour l'exemple : <code>['corde', 'potion']</code> puis <code>5</code>. Je testerai avec d'autres coffres.</p>`,
      code:`coffre1 = ["potion", "corde", "potion", "or"]
coffre2 = ["corde", "rubis", "potion", "arc", "arc"]
`,
      hints:['Transforme les listes en ensembles : <code>a = set(coffre1)</code> et <code>b = set(coffre2)</code>.','<code>print(sorted(a &amp; b))</code> puis <code>print(len(a | b))</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const lit = l => '[' + l.map(x => `'${x}'`).join(', ') + ']';
        for (const [c1, c2] of [[['potion', 'corde', 'potion', 'or'], ['corde', 'rubis', 'potion', 'arc', 'arc']], [['a', 'b'], ['c']], [['x', 'x'], ['x', 'y', 'y']]]) {
          const t = await test([], swap(swap(code, 'coffre1', lit(c1)), 'coffre2', lit(c2)));
          if (t.err) return `Avec d’autres coffres, ton code plante : ${esc(t.err.title)}.`;
          const both = [...new Set(c1)].filter(x => c2.includes(x)).sort();
          const all = new Set([...c1, ...c2]).size;
          const ls = linesOf(t.out);
          if (ls[0] !== lit(both)) return `Avec les coffres ${esc(lit(c1))} et ${esc(lit(c2))}, la première ligne devrait être <code>${esc(lit(both))}</code>, et je lis <code>${esc(ls[0] || '')}</code>.`;
          if (ls[1] !== String(all)) return `Avec les coffres ${esc(lit(c1))} et ${esc(lit(c2))}, il y a ${all} objets différents en tout.`;
        }
        return true;
      },
      ok:'Testé avec trois paires de coffres. Sans les ensembles, il aurait fallu deux boucles imbriquées et des tests de doublons.',
      sol:`coffre1 = ["potion", "corde", "potion", "or"]
coffre2 = ["corde", "rubis", "potion", "arc", "arc"]
a = set(coffre1)
b = set(coffre2)
print(sorted(a & b))
print(len(a | b))` },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code note les cases visitées par le héros, sans doublon, et devrait afficher 2. Il plante. Exécute-le, lis l'explication, puis répare-le.</p>`,
      code:`visitees = {}
visitees.add("A1")
visitees.add("B2")
visitees.add("A1")
print(len(visitees))`,
      hints:['Le message dit que <code>dict</code> n’a pas de méthode <code>add</code>. Les accolades vides créent un dictionnaire, pas un ensemble.','Un ensemble vide s’écrit <code>set()</code>.'],
      check:(r, code) => same(code, bugOf('5-5')) ? BUG : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : linesOf(r.out).join() !== '2' ? 'Il faut afficher 2.' : true,
      ok:'<code>{}</code> est un dictionnaire vide, <code>set()</code> un ensemble vide. Un piège que même les habitués oublient.',
      sol:`visitees = set()
visitees.add("A1")
visitees.add("B2")
visitees.add("A1")
print(len(visitees))` }
  ],
  recap:['Tuple : <code>(3, 7)</code>. Comme une liste, mais impossible à modifier.','Déballer : <code>x, y = position</code>. Une fonction peut faire <code>return a, b</code>.','Ensemble : <code>{1, 2, 3}</code>. Pas de doublon, pas d’ordre, pas d’indice.','<code>set(liste)</code> enlève les doublons. <code>&amp;</code> intersection, <code>|</code> union, <code>-</code> différence.','Ensemble vide : <code>set()</code>. <code>{}</code> est un dictionnaire vide.'] };

LES['5-6'] = { title:'Les dictionnaires', dur:'14 min',
  intro:'Dans une liste, on retrouve une valeur par sa position. Dans un <strong>dictionnaire</strong>, on la retrouve par un nom. C’est la structure la plus utile de Python, et elle prépare directement la POO.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`a, b, c = (10, 20, 30)
print(b)`,
      opts:[ {l:'10', why:'Le déballage range les valeurs dans l’ordre : a reçoit 10, b reçoit 20.'},
             {l:'(10, 20, 30)', why:'Le tuple a été déballé dans trois variables.'},
             {l:'20', ok:1},
             {l:'Une erreur', why:'Trois variables pour trois valeurs : le déballage marche.'} ],
      ex:'a = 10, b = 20, c = 30. Autant de variables que de valeurs.' },
    { t:'say', h:'Des étiquettes au lieu des positions', file:'dico.py', mem:1,
      p:`<p>Un dictionnaire s'écrit avec des accolades, et des paires <code>clé: valeur</code>. On accède à une valeur par sa clé : <code>heros["pv"]</code>.</p><p>C'est bien plus clair que <code>heros[1]</code> : on n'a pas besoin de se souvenir de l'ordre.</p>`,
      code:`heros = {"nom": "Sam", "classe": "Mage", "pv": 100, "force": 7}
print(heros["nom"])
print(heros["pv"])
print(len(heros), "informations")` },
    { t:'say', h:'Modifier, ajouter, supprimer', file:'modifier.py', mem:1,
      p:`<ul><li><code>d[cle] = valeur</code> modifie la valeur si la clé existe, et <strong>l'ajoute</strong> sinon.</li><li><code>del d[cle]</code> supprime une paire.</li><li><code>cle in d</code> teste si la clé existe.</li></ul>`,
      code:`heros = {"nom": "Sam", "pv": 100}
heros["pv"] -= 25
heros["arme"] = "bâton"
print(heros)
del heros["arme"]
print("arme" in heros)` },
    { t:'quiz', h:'Majuscule ou pas ?', p:`<p>Que se passe-t-il ?</p>`, snip:`heros = {"nom": "Sam", "force": 7}
print(heros["Force"])`,
      opts:[ {l:'Ça affiche 7', why:'Les clés sont du texte, et "Force" n’est pas "force" : la majuscule compte.'},
             {l:'Ça affiche None', why:'Avec les crochets, une clé absente fait planter. (Avec <code>.get()</code>, on aurait eu None.)'},
             {l:'Une KeyError', ok:1},
             {l:'Ça ajoute la clé "Force"', why:'On ajoute une clé seulement en lui donnant une valeur avec <code>=</code>.'} ],
      ex:'<code>KeyError: \'Force\'</code> : cette clé n’existe pas. Pour ne pas planter, on peut écrire <code>heros.get("Force", 0)</code>, qui renvoie 0 si la clé manque.' },
    { t:'say', h:'get et parcourir', file:'parcourir.py',
      p:`<p><code>d.get(cle, defaut)</code> renvoie la valeur, ou <code>defaut</code> si la clé n'existe pas. Pas de plantage.</p><p>Pour parcourir un dictionnaire, <code>for cle in d</code> donne les clés, et <code>for cle, valeur in d.items()</code> donne les paires.</p>`,
      code:`prix = {"potion": 5, "épée": 30, "bouclier": 25}
print(prix.get("arc", "pas en vente"))
for objet, p in prix.items():
    print(f"{objet} : {p} pièces")` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Qu'affiche ce code ?</p>`, snip:`d = {"a": 1}
d["a"] = 5
d["b"] = 2
print(d)`,
      opts:[ {l:"{'a': 1, 'b': 2}", why:'<code>d["a"] = 5</code> remplace l’ancienne valeur de la clé "a".'},
             {l:"{'a': 1, 'a': 5, 'b': 2}", why:'Une clé est unique : on ne peut pas l’avoir deux fois.'},
             {l:"{'a': 5, 'b': 2}", ok:1},
             {l:'Une KeyError', why:'Donner une valeur à une clé qui n’existe pas l’ajoute. Seule la <strong>lecture</strong> d’une clé absente plante.'} ],
      ex:'"a" existait : sa valeur est remplacée. "b" n’existait pas : il est ajouté.' },
    { t:'say', h:'Compter avec un dictionnaire', file:'compter.py', mem:1,
      p:`<p>Un usage très courant : compter combien de fois chaque chose apparaît. Pour chaque élément, on prend son compte actuel (0 s'il n'existe pas encore, grâce à <code>get</code>) et on ajoute 1.</p>`,
      code:`butin = ["or", "potion", "or", "rubis", "or", "potion"]
comptes = {}
for objet in butin:
    comptes[objet] = comptes.get(objet, 0) + 1
print(comptes)` },
    { t:'code', h:'À toi : la boutique', file:'boutique.py',
      p:`<p>Le dictionnaire <code>prix</code> donne le prix de chaque objet. Si <code>achat</code> est en vente, affiche <code>épée : 30 pièces</code>. Sinon, affiche <code>Désolé, pas de arc ici.</code> (avec le nom de l'objet).</p><p>Je testerai avec d'autres achats.</p>`,
      code:`prix = {"potion": 5, "épée": 30, "bouclier": 25}
achat = "épée"
`,
      hints:['<code>if achat in prix:</code> teste si la clé existe.','Dans le <code>if</code> : <code>print(f"{achat} : {prix[achat]} pièces")</code>. Dans le <code>else</code> : le message d’excuse.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        for (const [a, w] of [['épée', 'épée : 30 pièces'], ['potion', 'potion : 5 pièces'], ['arc', 'pas de arc']]) {
          const t = await test([], swap(code, 'achat', `"${a}"`));
          if (t.err) return `Avec l’achat « ${a} », ton code plante : ${esc(t.err.title)}.${/KeyError/.test(t.err.raw) ? ' Vérifie d’abord que la clé existe, avec <code>in</code>.' : ''}`;
          if (!norm(t.out).replace(/\s+/g, ' ').includes(norm(w))) return `Avec l’achat « ${a} », je devrais lire <code>${esc(w)}</code>.`;
        }
        const t2 = await test([], swap(code, 'prix', '{"arc": 12}').replace(/^(\s*achat\s*=\s*).*$/m, '$1"arc"'));
        if (t2.err || !/12/.test(t2.out)) return 'Ton code doit lire le prix dans le dictionnaire, sans l’écrire lui-même.';
        return true;
      },
      ok:'Testé avec trois achats et une autre boutique. <code>in</code> avant de lire avec des crochets : plus jamais de <code>KeyError</code>.',
      sol:`prix = {"potion": 5, "épée": 30, "bouclier": 25}
achat = "épée"
if achat in prix:
    print(f"{achat} : {prix[achat]} pièces")
else:
    print(f"Désolé, pas de {achat} ici.")` },
    { t:'code', defi:1, h:'Les lettres d’un mot', file:'lettres.py', mem:1,
      p:`<p>Range dans un dictionnaire <code>comptes</code> le nombre de fois que chaque lettre apparaît dans <code>mot</code>. Puis affiche la lettre la plus fréquente et son nombre : <code>a : 5</code>.</p><p>Pour "abracadabra", <code>comptes</code> vaut <code>{'a': 5, 'b': 2, 'r': 2, 'c': 1, 'd': 1}</code>.</p>`,
      code:`mot = "abracadabra"
`,
      hints:['Comme pour le butin : <code>comptes = {}</code>, puis pour chaque lettre <code>comptes[lettre] = comptes.get(lettre, 0) + 1</code>.','Pour la plus fréquente, le schéma du record : <code>meilleure = ""</code> et <code>record = 0</code>, puis <code>for lettre, n in comptes.items():</code> avec un <code>if n &gt; record:</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        for (const [w, top, n] of [['abracadabra', 'a', 5], ['mississippi', 'i', 4], ['zzz', 'z', 3]]) {
          const c = swap(code, 'mot', `"${w}"`);
          const x = await call(test, c, 'sorted(comptes.items())');
          if (x.err) return /NameError/.test(x.err.raw) && /comptes/.test(x.err.raw) ? 'Range les comptes dans un dictionnaire nommé <code>comptes</code>.' : `Avec le mot « ${w} », ton code plante : ${esc(x.err.title)}.`;
          const freq = {}; for (const ch of w) freq[ch] = (freq[ch] || 0) + 1;
          const want = '[' + Object.keys(freq).sort().map(k => `('${k}', ${freq[k]})`).join(', ') + ']';
          if (x.val !== want) return `Avec le mot « ${w} », les comptes ne sont pas bons. Il faudrait <code>${esc(JSON.stringify(freq).replace(/"/g, "'").replace(/:/g, ': ').replace(/,/g, ', '))}</code>.`;
          if (!new RegExp(top + '\\D*' + n).test(x.out)) return `Avec le mot « ${w} », la lettre la plus fréquente est « ${top} » (${n} fois) : je devrais lire <code>${top} : ${n}</code>.`;
        }
        return true;
      },
      ok:'Testé avec trois mots. Compter avec un dictionnaire, puis chercher le record : c’est la base de toutes les statistiques.',
      sol:`mot = "abracadabra"
comptes = {}
for lettre in mot:
    comptes[lettre] = comptes.get(lettre, 0) + 1
meilleure = ""
record = 0
for lettre, n in comptes.items():
    if n > record:
        meilleure = lettre
        record = n
print(f"{meilleure} : {record}")` },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code compte les monstres vaincus par espèce. Il plante dès le premier. Exécute-le, lis l'explication, puis répare-le.</p>`,
      code:`vaincus = ["gobelin", "troll", "gobelin"]
tableau = {}
for m in vaincus:
    tableau[m] += 1
print(tableau)`,
      hints:['<code>tableau[m] += 1</code> veut dire <code>tableau[m] = tableau[m] + 1</code>. Au premier gobelin, <code>tableau["gobelin"]</code> n’existe pas encore.','Utilise <code>get</code> avec 0 par défaut : <code>tableau[m] = tableau.get(m, 0) + 1</code>.'],
      check:(r, code) => {
        if (same(code, bugOf('5-6'))) return BUG;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        const m = memOf(r, 'tableau');
        return m && m.repr === "{'gobelin': 2, 'troll': 1}" ? true : 'Il faut obtenir <code>{\'gobelin\': 2, \'troll\': 1}</code>.';
      },
      ok:'Lire une clé qui n’existe pas, même pour lui ajouter 1, fait planter. <code>get(cle, 0)</code> règle ça en une ligne.',
      sol:`vaincus = ["gobelin", "troll", "gobelin"]
tableau = {}
for m in vaincus:
    tableau[m] = tableau.get(m, 0) + 1
print(tableau)` }
  ],
  recap:['Dictionnaire : <code>{"nom": "Sam", "pv": 100}</code>. On accède par la clé : <code>d["pv"]</code>.','<code>d[cle] = v</code> modifie ou ajoute. <code>del d[cle]</code> supprime. <code>cle in d</code> teste.','Une clé absente lue avec des crochets donne une <code>KeyError</code>. <code>d.get(cle, defaut)</code> ne plante pas.','<code>for cle, valeur in d.items():</code> parcourt les paires.','Compter : <code>d[x] = d.get(x, 0) + 1</code>.'] };

LES['5-7'] = { title:'Listes de dictionnaires', dur:'14 min',
  intro:'Un héros, c’est un dictionnaire. Une équipe de héros, c’est une liste de dictionnaires. En combinant les deux, on peut ranger presque toutes les données du monde réel.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`stock = {"potion": 3}
print(stock.get("potion", 0) + stock.get("arc", 0))`,
      opts:[ {l:'3', ok:1},
             {l:'Une KeyError', why:'<code>get</code> ne plante jamais : pour "arc", il renvoie la valeur par défaut, 0.'},
             {l:'None', why:'On a donné 0 comme valeur par défaut, donc pas de None.'},
             {l:'30', why:'Ce sont des nombres : 3 + 0 = 3.'} ],
      ex:'"potion" donne 3, "arc" n’existe pas et donne 0 : 3 + 0 = 3.' },
    { t:'say', h:'Une équipe de héros', file:'equipe.py', mem:1,
      p:`<p>Chaque héros est un dictionnaire, et l'équipe est une liste. Pour lire une information, on enchaîne les crochets : d'abord la position dans la liste, puis la clé.</p><p><code>equipe[0]["nom"]</code> se lit : « le nom du premier héros ».</p>`,
      code:`equipe = [
    {"nom": "Sam", "classe": "Mage", "pv": 70},
    {"nom": "Inès", "classe": "Guerrière", "pv": 120},
    {"nom": "Léo", "classe": "Archer", "pv": 0},
]
print(equipe[0]["nom"])
for h in equipe:
    print(f"{h['nom']} ({h['classe']}) : {h['pv']} pv")` },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Avec l'équipe d'avant, qu'affiche ce code ?</p>`, snip:`print(equipe[1]["pv"] - equipe[0]["pv"])`,
      opts:[ {l:'50', ok:1},
             {l:'-50', why:'<code>equipe[1]</code> est Inès (120 pv), <code>equipe[0]</code> est Sam (70 pv).'},
             {l:'120', why:'On soustrait les pv de Sam à ceux d’Inès.'},
             {l:'Une KeyError', why:'La clé "pv" existe dans chaque dictionnaire.'} ],
      ex:'equipe[1] est Inès (120), equipe[0] est Sam (70) : 120 - 70 = 50.' },
    { t:'say', h:'Chercher et filtrer', file:'chercher.py',
      p:`<p>Tout ce que tu sais faire avec les listes marche ici. On parcourt l'équipe, et on teste une clé de chaque héros.</p><p>Remarque : dans une f-string avec des guillemets doubles, on écrit les clés avec des guillemets simples : <code>f"{h['nom']}"</code>.</p>`,
      code:`equipe = [
    {"nom": "Sam", "classe": "Mage", "pv": 70},
    {"nom": "Inès", "classe": "Guerrière", "pv": 120},
    {"nom": "Léo", "classe": "Archer", "pv": 0},
]
debout = []
for h in equipe:
    if h["pv"] > 0:
        debout.append(h["nom"])
print("Encore debout :", ", ".join(debout))

for h in equipe:
    if h["nom"] == "Inès":
        print("Trouvée ! Elle a", h["pv"], "pv")` },
    { t:'say', h:'Trier selon une clé', file:'trier.py',
      p:`<p>Pour trier une liste de dictionnaires, il faut dire à <code>sorted</code> <strong>quoi comparer</strong>. On lui donne une fonction qui, pour un héros, renvoie la valeur à comparer : c'est l'argument <code>key</code>.</p><p>Attention : on donne la fonction elle-même, sans parenthèses. C'est <code>sorted</code> qui l'appellera pour chaque héros.</p>`,
      code:`equipe = [
    {"nom": "Sam", "pv": 70},
    {"nom": "Inès", "pv": 120},
    {"nom": "Léo", "pv": 15},
]
def les_pv(h):
    return h["pv"]

for h in sorted(equipe, key=les_pv):
    print(h["nom"], h["pv"])
print("Le plus solide :", max(equipe, key=les_pv)["nom"])` },
    { t:'quiz', h:'Des listes dans un dictionnaire', p:`<p>Qu'affiche ce code ?</p>`, snip:`sacs = {"Sam": ["épée", "potion"], "Inès": ["arc"]}
print(sacs["Sam"][1])`,
      opts:[ {l:'épée', why:'<code>sacs["Sam"]</code> donne la liste, et <code>[1]</code> son deuxième élément.'},
             {l:'potion', ok:1},
             {l:'arc', why:'"arc" est dans le sac d’Inès.'},
             {l:"['épée', 'potion']", why:'Le <code>[1]</code> prend un seul élément de cette liste.'} ],
      ex:'On lit de gauche à droite : le sac de Sam, puis l’élément 1 de ce sac. L’inverse marche aussi : un dictionnaire peut contenir des listes.' },
    { t:'code', h:'À toi : le trésor de l’équipe', file:'tresor.py',
      p:`<p>Chaque héros a de l'or. Affiche le total d'or de l'équipe (<code>Total : 185</code>), puis le nom du héros le plus riche (<code>Plus riche : Inès</code>).</p><p>Je testerai avec une autre équipe.</p>`,
      code:`equipe = [
    {"nom": "Sam", "or": 40},
    {"nom": "Inès", "or": 120},
    {"nom": "Léo", "or": 25},
]
`,
      hints:['Le total : un accumulateur, <code>total += h["or"]</code> dans une boucle.','Le plus riche : le schéma du record, ou <code>max(equipe, key=…)</code> avec une fonction qui renvoie <code>h["or"]</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        const other = '[{"nom": "Zoé", "or": 5}, {"nom": "Max", "or": 300}, {"nom": "Ali", "or": 300}, {"nom": "Lou", "or": 1}]';
        const code2 = code.replace(/equipe\s*=\s*\[[\s\S]*?\n\]/, 'equipe = ' + other);
        for (const [c, tot, rich] of [[code, 185, 'Inès'], [code2, 606, 'Max']]) {
          const t = await test([], c);
          if (t.err) return `${c === code ? 'Ton code' : 'Avec une autre équipe, ton code'} plante : ${esc(t.err.title)}.`;
          const o = t.out;
          if (!new RegExp('total\\D*' + tot + '\\b', 'i').test(o)) return `${c === code ? '' : 'Avec une autre équipe, '}je devrais lire <code>Total : ${tot}</code>.`;
          if (!new RegExp('riche\\W*' + rich, 'i').test(o)) return `${c === code ? '' : 'Avec une autre équipe (Zoé 5, Max 300, Ali 300, Lou 1), '}je devrais lire <code>Plus riche : ${rich}</code>.`;
        }
        return true;
      },
      ok:'Testé avec une autre équipe, dont deux héros à égalité : c’est bien le premier qui est gardé.',
      sol:`equipe = [
    {"nom": "Sam", "or": 40},
    {"nom": "Inès", "or": 120},
    {"nom": "Léo", "or": 25},
]
total = 0
for h in equipe:
    total += h["or"]
print("Total :", total)
riche = equipe[0]
for h in equipe:
    if h["or"] > riche["or"]:
        riche = h
print("Plus riche :", riche["nom"])` },
    { t:'code', defi:1, h:'Le classement', file:'classement.py',
      p:`<p>Crée une fonction <code>classement(joueurs)</code> qui reçoit une liste de dictionnaires (avec les clés <code>"nom"</code> et <code>"score"</code>) et renvoie la <strong>liste des noms</strong>, du meilleur score au moins bon.</p><pre class="snippet">classement([{"nom": "Sam", "score": 40}, {"nom": "Inès", "score": 95}])
→ ['Inès', 'Sam']</pre>`,
      code:``,
      hints:['Trie avec <code>sorted(joueurs, key=le_score, reverse=True)</code>, où <code>le_score(j)</code> renvoie <code>j["score"]</code>.','Puis construis la liste des noms : <code>noms = []</code>, une boucle et <code>noms.append(j["nom"])</code>. Et <code>return noms</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'classement')) return noFn('classement');
        const tries = [['[{"nom": "Sam", "score": 40}, {"nom": "Inès", "score": 95}]', "['Inès', 'Sam']"], ['[{"nom": "A", "score": 1}, {"nom": "B", "score": 3}, {"nom": "C", "score": 2}]', "['B', 'C', 'A']"], ['[]', '[]']];
        for (const [a, w] of tries) {
          const x = await call(test, code, `classement(${a})`);
          if (x.err) return callErr(`classement(${a})`, x.err);
          if (x.val === 'None') return '<code>classement</code> renvoie None : il manque le <code>return</code>.';
          if (x.val !== w) return `<code>classement(${esc(a)})</code> devrait renvoyer <code>${esc(w)}</code>, et renvoie <code>${esc(x.val)}</code>.`;
        }
        return true;
      },
      ok:'Une fonction qui prend des données brutes et renvoie un résultat propre : tu viens d’écrire le cœur d’un tableau des scores.',
      sol:`def le_score(j):
    return j["score"]

def classement(joueurs):
    noms = []
    for j in sorted(joueurs, key=le_score, reverse=True):
        noms.append(j["nom"])
    return noms

print(classement([{"nom": "Sam", "score": 40}, {"nom": "Inès", "score": 95}]))` },
    { t:'code', bug:1, h:'Répare le bug', file:'bug.py',
      p:`<p>Ce code devrait afficher le nom de chaque héros. Il plante. Exécute-le, lis l'explication, puis répare-le.</p>`,
      code:`equipe = [{"nom": "Sam"}, {"nom": "Inès"}]
for h in equipe:
    print(h.nom)`,
      hints:['Le message dit que <code>dict</code> n’a pas d’attribut <code>nom</code>. Avec un dictionnaire, le point ne marche pas.','On lit une clé avec des crochets : <code>h["nom"]</code>.'],
      check:(r, code) => same(code, bugOf('5-7')) ? BUG : r.err ? 'Le code plante encore. Lis l’explication dans la console.' : linesOf(r.out).join('|') !== 'Sam|Inès' ? 'Il faut afficher Sam puis Inès.' : true,
      ok:'Les crochets pour les dictionnaires. Le point, <code>h.nom</code>, c’est pour les objets : tu le découvriras en POO, et tu verras qu’un objet ressemble beaucoup à un dictionnaire.',
      sol:`equipe = [{"nom": "Sam"}, {"nom": "Inès"}]
for h in equipe:
    print(h["nom"])` }
  ],
  recap:['Une liste de dictionnaires : <code>equipe[0]["nom"]</code> = « le nom du premier ».','On parcourt avec <code>for h in equipe:</code> puis <code>h["cle"]</code>.','Dans une f-string : <code>f"{h[\'nom\']}"</code>, avec des guillemets simples dedans.','Trier selon une clé : <code>sorted(liste, key=fonction)</code>, la fonction sans parenthèses.','Un dictionnaire peut contenir des listes : <code>sacs["Sam"][1]</code>.'] };

/* Le projet : chaque étape reprend la précédente (carry). */
const D1 = `def ajouter(depenses, libelle, montant, categorie):
    depenses.append({"libelle": libelle, "montant": montant, "categorie": categorie})`;
const D2 = D1 + `

def total(depenses):
    somme = 0
    for d in depenses:
        somme += d["montant"]
    return somme

def par_categorie(depenses):
    sommes = {}
    for d in depenses:
        sommes[d["categorie"]] = sommes.get(d["categorie"], 0) + d["montant"]
    return sommes`;
const D3 = D2 + `

def afficher(depenses):
    if not depenses:
        print("Aucune dépense.")
    for i, d in enumerate(depenses, 1):
        print(f"{i}. {d['libelle']} : {d['montant']} € ({d['categorie']})")`;
const D4 = D3 + `

depenses = []
while True:
    choix = input("Commande (ajouter, liste, total, quitter) ? ").strip().lower()
    if choix == "quitter":
        print("À bientôt !")
        break
    elif choix == "ajouter":
        libelle = input("Libellé ? ")
        montant = float(input("Montant ? "))
        categorie = input("Catégorie ? ")
        ajouter(depenses, libelle, montant, categorie)
    elif choix == "liste":
        afficher(depenses)
    elif choix == "total":
        print(f"Total : {total(depenses)} €")
        for cat, s in par_categorie(depenses).items():
            print(f"  {cat} : {s} €")
    else:
        print("Commande inconnue.")`;
const EX = '[{"libelle": "Pizza", "montant": 12.5, "categorie": "sorties"}, {"libelle": "Bus", "montant": 2.0, "categorie": "transport"}, {"libelle": "Ciné", "montant": 9.5, "categorie": "sorties"}]';

LES['5-8'] = { title:'Projet : le gestionnaire de dépenses', dur:'18 min',
  intro:'Fini les jeux pour un moment : tu construis un outil utile au quotidien. Un petit programme qui note tes dépenses et te dit où part ton argent. Listes, dictionnaires, fonctions et boucles : tout le chapitre y passe.',
  steps:[
    { t:'quiz', rev:1, h:'Une question sur la leçon d’avant', p:`<p>Qu'affiche ce code ?</p>`, snip:`notes = [{"matiere": "maths", "note": 14}, {"matiere": "info", "note": 17}]
print(notes[-1]["matiere"])`,
      opts:[ {l:'maths', why:'<code>[-1]</code> prend le dernier élément de la liste.'},
             {l:'17', why:'On lit la clé "matiere", pas la clé "note".'},
             {l:'info', ok:1},
             {l:'Une KeyError', why:'Le dernier dictionnaire a bien une clé "matiere".'} ],
      ex:'Le dernier dictionnaire de la liste, puis sa clé "matiere" : "info".' },
    { t:'say', h:'Le projet',
      p:`<p>Chaque dépense sera un dictionnaire, et toutes les dépenses seront rangées dans une liste. À la fin, ton programme fonctionnera comme ça :</p>`,
      snip:`Commande (ajouter, liste, total, quitter) ? ajouter
Libellé ? Pizza
Montant ? 12.5
Catégorie ? sorties
Commande (ajouter, liste, total, quitter) ? liste
1. Pizza : 12.5 € (sorties)
Commande (ajouter, liste, total, quitter) ? total
Total : 12.5 €
  sorties : 12.5 €
Commande (ajouter, liste, total, quitter) ? quitter
À bientôt !`,
      p2:`<p>On construit d'abord les fonctions qui manipulent les données, puis le menu. À chaque étape, je reprends ton code de l'étape d'avant.</p>` },
    { t:'code', h:'Étape 1 : ajouter une dépense', file:'depenses.py',
      p:`<p>Crée une fonction <code>ajouter(depenses, libelle, montant, categorie)</code> qui ajoute à la liste <code>depenses</code> un dictionnaire avec les clés <code>"libelle"</code>, <code>"montant"</code> et <code>"categorie"</code>.</p><p>Elle ne renvoie rien : elle modifie la liste qu'on lui donne.</p>`,
      code:`# Étape 1
`,
      hints:['Le dictionnaire : <code>{"libelle": libelle, "montant": montant, "categorie": categorie}</code>.','<code>depenses.append({...})</code> dans la fonction. Pas besoin de <code>return</code> : la liste est modifiée sur place.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'ajouter')) return noFn('ajouter');
        const x = await call(test, code, '(lambda L: (ajouter(L, "Pizza", 12.5, "sorties"), ajouter(L, "Bus", 2.0, "transport"), L)[2])([])');
        if (x.err) return callErr('ajouter([], "Pizza", 12.5, "sorties")', x.err);
        if (x.val !== "[{'libelle': 'Pizza', 'montant': 12.5, 'categorie': 'sorties'}, {'libelle': 'Bus', 'montant': 2.0, 'categorie': 'transport'}]") return `Après deux appels à <code>ajouter</code>, la liste devrait contenir deux dictionnaires avec les clés "libelle", "montant" et "categorie". J’obtiens : <code>${esc(x.val)}</code>`;
        return true;
      },
      ok:'La fonction modifie la liste qu’on lui donne : comme vu à la leçon 5.2, liste et paramètre sont deux noms pour la même liste.',
      sol:D1 },
    { t:'code', carry:1, h:'Étape 2 : les totaux', file:'depenses.py',
      p:`<p>Ajoute deux fonctions :</p><ul><li><code>total(depenses)</code> renvoie la somme de tous les montants ;</li><li><code>par_categorie(depenses)</code> renvoie un dictionnaire qui donne la somme par catégorie, par exemple <code>{'sorties': 22.0, 'transport': 2.0}</code>.</li></ul>`,
      code:`# Étape 2
`,
      hints:['<code>total</code> : un accumulateur, <code>somme += d["montant"]</code>.','<code>par_categorie</code> : comme pour compter, mais on ajoute le montant : <code>sommes[cat] = sommes.get(cat, 0) + d["montant"]</code>.'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'total')) return noFn('total');
        if (!defined(code, 'par_categorie')) return noFn('par_categorie');
        let x = await call(test, code, `total(${EX})`);
        if (x.err) return callErr('total(...)', x.err);
        if (num(x.val) !== 24) return `Pour Pizza 12.5, Bus 2.0 et Ciné 9.5, <code>total</code> devrait renvoyer 24.0, et renvoie ${esc(x.val)}.`;
        x = await call(test, code, 'total([])');
        if (x.err || num(x.val) !== 0) return 'Pour une liste vide, <code>total</code> doit renvoyer 0.';
        x = await call(test, code, `sorted(par_categorie(${EX}).items())`);
        if (x.err) return callErr('par_categorie(...)', x.err);
        if (x.val !== "[('sorties', 22.0), ('transport', 2.0)]") return `Pour Pizza 12.5 (sorties), Bus 2.0 (transport) et Ciné 9.5 (sorties), <code>par_categorie</code> devrait donner sorties : 22.0 et transport : 2.0. J’obtiens : <code>${esc(x.val)}</code>`;
        return true;
      },
      ok:'Deux fonctions qui ne font que calculer et renvoyer. Elles marcheront aussi bien avec 3 dépenses qu’avec 3000.',
      sol:D2 },
    { t:'quiz', h:'Devine avant d’exécuter', p:`<p>Avec ta fonction <code>par_categorie</code>, qu'affiche ce code ?</p>`, snip:`depenses = [
    {"libelle": "Pizza", "montant": 12.5, "categorie": "sorties"},
    {"libelle": "Bus", "montant": 2.0, "categorie": "transport"},
    {"libelle": "Ciné", "montant": 9.5, "categorie": "sorties"},
]
print(par_categorie(depenses)["sorties"])`,
      opts:[ {l:'12.5', why:'La pizza n’est pas la seule sortie : le ciné aussi est dans la catégorie « sorties ».'},
             {l:'24.0', why:'Ça, c’est le total de toutes les dépenses. Ici, on ne lit que la catégorie « sorties ».'},
             {l:'22.0', ok:1},
             {l:'Une KeyError', why:'La clé « sorties » existe bien dans le dictionnaire renvoyé.'} ],
      ex:'12.5 + 9.5 = 22.0 : <code>par_categorie</code> additionne les montants de chaque catégorie, puis on lit celle des sorties.' },
    { t:'code', carry:1, h:'Étape 3 : afficher la liste', file:'depenses.py',
      p:`<p>Ajoute une fonction <code>afficher(depenses)</code> qui affiche chaque dépense, numérotée à partir de 1 :</p><pre class="snippet">1. Pizza : 12.5 € (sorties)
2. Bus : 2.0 € (transport)</pre><p>Si la liste est vide, elle affiche <code>Aucune dépense.</code></p>`,
      code:`# Étape 3
`,
      hints:['<code>for i, d in enumerate(depenses, 1):</code>, puis une f-string avec <code>d[\'libelle\']</code>, <code>d[\'montant\']</code> et <code>d[\'categorie\']</code>.','Pour la liste vide : <code>if not depenses:</code> (une liste vide compte comme faux).'],
      check:async (r, code, test) => {
        if (r.err) return ERR;
        if (!defined(code, 'afficher')) return noFn('afficher');
        const base = (await test([], code)).out || '';
        let x = await call(test, code, `afficher(${EX})`);
        if (x.err) return callErr('afficher(...)', x.err);
        const ls = linesOf(x.out.slice(base.length)).map(l => l.replace(/\s+/g, ' '));
        const want = ['1. Pizza : 12.5 € (sorties)', '2. Bus : 2.0 € (transport)', '3. Ciné : 9.5 € (sorties)'];
        if (ls.join('|') !== want.join('|')) return `Avec trois dépenses, je devrais lire :<br><code>${want.join('<br>')}</code><br>J’obtiens :<br><code>${ls.map(esc).join('<br>') || '(rien)'}</code>`;
        x = await call(test, code, 'afficher([])');
        if (x.err || !/aucune d[ée]pense/i.test(x.out.slice(base.length))) return 'Avec une liste vide, il faut afficher <code>Aucune dépense.</code>';
        return true;
      },
      ok:'Toutes les briques sont prêtes. Il ne reste qu’à les brancher sur un menu.',
      sol:D3 },
    { t:'code', carry:1, defi:1, h:'Étape 4 : le menu', file:'depenses.py',
      p:`<p>Sous tes fonctions, crée la liste <code>depenses = []</code>, puis une boucle de menu qui demande une commande :</p><ul><li><code>ajouter</code> : demande le libellé, le montant (un nombre à virgule) et la catégorie, puis appelle <code>ajouter</code> ;</li><li><code>liste</code> : appelle <code>afficher</code> ;</li><li><code>total</code> : affiche <code>Total : 24.0 €</code>, puis une ligne par catégorie ;</li><li><code>quitter</code> : affiche <code>À bientôt !</code> et arrête la boucle.</li></ul><p>Pour toute autre commande, affiche <code>Commande inconnue.</code></p>`,
      code:`# Étape 4 : le menu
depenses = []
`,
      hints:['<code>while True:</code>, puis <code>choix = input("Commande ? ").strip().lower()</code>, et une chaîne <code>if</code>/<code>elif</code> sur choix. <code>break</code> pour quitter.','Pour le total : <code>print(f"Total : {total(depenses)} €")</code>, puis <code>for cat, s in par_categorie(depenses).items():</code> et un <code>print</code> par catégorie.'],
      check:async (r, code, test) => {
        const ins = ['ajouter', 'Pizza', '12.5', 'sorties', 'ajouter', 'Bus', '2', 'transport', 'liste', 'ajouter', 'Ciné', '9.5', 'sorties', 'total', 'danser', 'quitter'];
        const t = await test(ins);
        if (t.err) return `Avec ma série de commandes, ton code plante : ${esc(t.err.title)}.${/Valeur impossible/.test(t.err.title) ? ' Le montant doit être converti avec <code>float()</code>.' : ''}`;
        const o = t.out.replace(/[ \t]+/g, ' ');
        if (!/1\. Pizza : 12\.5 € \(sorties\)/.test(o) || !/2\. Bus : 2\.0 € \(transport\)/.test(o)) return 'Après deux ajouts, la commande <code>liste</code> doit afficher Pizza et Bus, numérotés. As-tu bien converti le montant avec <code>float()</code> ?';
        if (!/Total\s*:\s*24\.0\s*€/.test(o)) return 'La commande <code>total</code> doit afficher <code>Total : 24.0 €</code> pour Pizza 12.5, Bus 2 et Ciné 9.5.';
        if (!/sorties\s*:\s*22\.0/.test(o) || !/transport\s*:\s*2\.0/.test(o)) return 'Après le total, affiche une ligne par catégorie : sorties : 22.0 €, transport : 2.0 €.';
        if (!/inconnue/i.test(o)) return 'Pour une commande qui n’existe pas (j’ai tapé « danser »), affiche <code>Commande inconnue.</code>';
        if (!/bient[ôo]t/i.test(tail(t, ins))) return 'Avec <code>quitter</code>, affiche <code>À bientôt !</code> puis arrête la boucle.';
        const t2 = await test(['  LISTE ', 'quitter']);
        if (t2.err || !/aucune d[ée]pense/i.test(t2.out)) return 'Si je tape « LISTE » avec des majuscules et des espaces, ça devrait marcher aussi : nettoie la commande avec <code>strip()</code> et <code>lower()</code>.';
        return true;
      },
      ok:'Ton gestionnaire de dépenses est complet et il pardonne les fautes de frappe. Tu viens d’écrire une vraie application, avec ses données, ses fonctions et son interface.',
      sol:D4, solIn:['ajouter', 'Pizza', '12.5', 'sorties', 'liste', 'total', 'quitter'] },
    { t:'code', bug:1, h:'Répare le bug : append avec deux valeurs', file:'bug.py',
      p:`<p>Ce code veut ranger une dépense dans la liste. Il plante. Exécute-le, lis le message original, puis répare-le pour que la liste contienne <strong>un dictionnaire</strong> avec les clés <code>"libelle"</code> et <code>"montant"</code>.</p>`,
      code:`depenses = []
libelle = "Pizza"
montant = 12.5
depenses.append(libelle, montant)
print(depenses)`,
      hints:['Le message dit que <code>append</code> prend un seul argument. Il faut donc regrouper les deux valeurs en une seule.','Regroupe-les dans un dictionnaire : <code>depenses.append({"libelle": libelle, "montant": montant})</code>.'],
      check:async (r, code, test) => {
        if (same(code, bugOf('5-8'))) return BUG;
        if (r.err) return 'Le code plante encore. Lis l’explication dans la console.';
        const x = await call(test, code, '(len(depenses), depenses[0]["libelle"], depenses[0]["montant"])');
        if (x.err || x.val !== "(1, 'Pizza', 12.5)") return 'La liste doit contenir un seul élément : un dictionnaire avec <code>"libelle": "Pizza"</code> et <code>"montant": 12.5</code>.';
        return true;
      },
      ok:'<code>append</code> ajoute <strong>un</strong> élément. Pour ranger plusieurs informations ensemble, on les regroupe d’abord : un dictionnaire, ou un tuple.',
      sol:`depenses = []
libelle = "Pizza"
montant = 12.5
depenses.append({"libelle": libelle, "montant": montant})
print(depenses)` },
    { t:'say', h:'Bravo, et la suite',
      p:`<p>Ton programme range des données structurées, les calcule et dialogue avec l'utilisateur. C'est la forme de presque toutes les applications. Garde-le dans VS Code dans un fichier <code>depenses.py</code>.</p><p>Idées d'améliorations : une commande <code>supprimer</code> qui enlève une dépense par son numéro, un budget maximum par catégorie avec une alerte, ou la plus grosse dépense.</p><p>Un seul problème : quand on quitte, tout est perdu. Au chapitre 6, tu apprendras à <strong>enregistrer dans un fichier</strong>, à gérer les erreurs (et si on tape « douze » comme montant ?), et à travailler comme un pro dans VS Code.</p>` }
  ],
  recap:['Une donnée réelle = un dictionnaire. Plusieurs = une liste de dictionnaires.','Une fonction peut modifier la liste qu’on lui donne (<code>append</code>), sans <code>return</code>.','Séparer les fonctions de calcul (qui renvoient) et l’affichage : le code reste clair.','Une boucle de menu : <code>while True</code>, une commande nettoyée, des <code>elif</code>, et <code>break</code> pour quitter.'] };

Atelier.chapter({ part:"bases", n:5, title:"Ranger des données",
  lessons:['5-1','5-2','5-3','5-4','5-5','5-6','5-7','5-8'].map(id => ({ id, ...LES[id] })) });
})();
