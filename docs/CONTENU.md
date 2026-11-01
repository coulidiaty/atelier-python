# Écrire une leçon pour l'Atelier Python

Ce guide est le cahier des charges du contenu. Lis-le en entier avant d'écrire une leçon.
Le meilleur exemple à suivre est `lecons/bases-1.js` (chapitre 1, complet et testé).
Pour la POO, regarde aussi `dev/demo-poo.js`, qui montre les étapes `compare` et `fill`.

## Le public et l'objectif

- Des étudiants de 2e année d'informatique. Ils ont eu des cours de Python, de C et de JavaScript, mais « personne ne sait vraiment coder » : ils ont surtout utilisé l'IA. Ils veulent **vraiment comprendre**.
- Le site doit être **ludique et facile**, l'inverse d'un gros cours qu'on lit et qui ennuie. On apprend en faisant, par petits morceaux, avec un retour immédiat.
- Ordre du parcours : les bases (partie 1), puis la POO en Python et Java (partie 2), qui suit l'ordre du cours de POO de leur prof.

## Le ton : Pyo, le mentor

- Pyo est un petit serpent qui parle dans des bulles. Il **tutoie**, il est chaleureux, simple et précis.
- Des phrases courtes. Un seul concept par bulle. Trois paragraphes courts au maximum par étape.
- Écris comme quelqu'un qui connaît son sujet et parle normalement : pas de tirets cadratins (—) pour faire des incises, pas de « non pas X, mais Y », pas de formules toutes faites.
- Français correct, avec les accents. Les apostrophes peuvent être `'` ou `’`.
- Le code Python et les noms de variables sont en français sans accents (`prenom`, `annee`, `points_de_vie`). Les textes affichés peuvent avoir des accents.

## Structure d'un fichier de chapitre

Chaque fichier `lecons/bases-N.js` ou `lecons/poo-N.js` est déjà créé avec la liste des leçons prévues dans `plan`. Quand tu écris une leçon, ajoute-la dans `LES`, mets son id dans `lessons`, et **retire son titre de `plan`**. Tu peux ajuster les titres prévus si c'est mieux pour la pédagogie.

```js
(() => {
const { ERR, strip, memOf, strOf, linesOf, nInputs, norm, esc, has } = Atelier.h;
const LES = {};
LES['2-1'] = { title:'Comparer des valeurs', dur:'10 min', intro:'…', steps:[ … ], recap:[ … ] };
// …
Atelier.chapter({ part:'bases', n:2, title:'Prendre des décisions',
  lessons:['2-1','2-2'].map(id => ({ id, ...LES[id] })),
  plan:['…titres pas encore écrits…'] });
})();
```

- Le fichier est entouré de `(() => { … })();` : **ne l'enlève pas** (sinon les `const` de deux fichiers se marchent dessus).
- Ids : `'2-1'`, `'2-2'`… pour les bases. `'p1-1'`, `'p1-2'`… pour la POO.
- `dur` : durée estimée (`'10 min'`). `intro` : une ou deux phrases de Pyo qui disent ce qu'on va apprendre et pourquoi c'est utile.
- `recap` : de 3 à 5 points, courts, en HTML. C'est la fiche mémo que l'élève relira avant un contrôle.

## Plan type d'une leçon (6 à 10 étapes, 8 à 15 minutes)

1. **Révision éclair** : un `quiz` avec `rev:1` sur la leçon d'avant. Pour la première leçon d'un chapitre, porte sur le chapitre d'avant.
2. **Explications courtes** (`say` avec du `code` à exécuter), une idée à la fois. L'élève exécute et peut modifier le code.
3. **Devinettes** (`quiz`) : « Qu'affiche ce code ? » avant de l'avoir exécuté. Chaque mauvaise réponse a une explication (`why`) qui corrige l'erreur de raisonnement précise.
4. **Exercices** (`code`) : au moins 2 par leçon, dont un `defi:1` un peu plus dur.
5. **Bug à réparer** (`code` avec `bug:1`) : un code qui plante ou qui se trompe, avec une erreur fréquente chez les débutants.
6. La **fiche mémo** (`recap`) s'affiche automatiquement à la fin.

La dernière leçon d'un chapitre est souvent un **projet** construit en plusieurs étapes `code` qui s'enchaînent (`carry:1`, voir plus bas).

Le fil rouge des exemples : un **jeu de rôle** (héros, points de vie, force, inventaire, monstres, potions, boutique). Varie aussi avec la vie d'étudiant (notes, budget, pizza, transports). Jamais de lorem ipsum. Invente tes propres exemples : **ne recopie jamais le cours du prof**, ni ses exemples (sa banque, ses rectangles, ses employés).

## Les types d'étapes

Champs communs : `t` (le type), `h` (le titre de l'étape), `p` (le HTML de l'explication), et en option `snip` (un code affiché, non exécuté), `lang:'java'` (pour étiqueter `snip` en Java) et `p2` (du HTML affiché après `snip`).

### `say` : Pyo explique
```js
{ t:'say', h:'Titre', p:`<p>…</p>`, code:`print("exemple")`, file:'exemple.py', mem:1, solIn:['19'] }
```
- Avec `code`, l'élève doit cliquer sur Exécuter avant de continuer. Sans `code`, un bouton « On continue » s'affiche tout de suite.
- `mem:1` affiche la Mémoire de Python (les variables sous forme de boîtes, et les objets avec leurs attributs).
- `solIn` : les réponses à donner si le code appelle `input()` (utilisé seulement par les tests).

### `quiz` : devinette ou révision
```js
{ t:'quiz', rev:1, h:'…', p:`<p>Qu'affiche ce code ?</p>`, snip:`print(2 + 3)`,
  opts:[ {l:'5', ok:1}, {l:'2 + 3', why:'…pourquoi c’est faux…'}, … ],
  ex:'…explication affichée quand c’est juste…' }
```
- 4 options en général, **exactement une** avec `ok:1`, et un `why` pour chaque mauvaise réponse. Mélange la place de la bonne réponse.
- Les mauvaises réponses doivent être des erreurs que les débutants font vraiment.

### `code` : exercice corrigé automatiquement
```js
{ t:'code', h:'…', file:'exercice.py', mem:1, p:`<p>Consigne précise…</p>`,
  code:`# code de départ\n`,
  hints:['indice 1, léger', 'indice 2, presque la solution'],
  check:async (r, code, test) => { … return true ou 'message' },
  ok:'Message de bravo, qui ajoute une info utile.',
  sol:`solution de référence`, solIn:['réponses', 'à input()'] }
```
- Options : `bug:1` (l'étiquette « Bug à réparer »), `defi:1` (l'étiquette « Défi »), `carry:1` (le code de départ devient le code de l'étape `code` précédente + `code`, pour les projets en plusieurs étapes).
- Le copier-coller est bloqué dans les exercices.
- **`sol` est obligatoire** : c'est la solution de référence que les tests passent dans la correction. Elle doit être acceptée. Et le code de départ doit être refusé (sauf avec `carry`).
- Après 3 essais ratés et tous les indices vus, un bouton « Passer pour l'instant » apparaît.

**La correction `check(r, code, test)`**
- `r` = le résultat de l'exécution de l'élève : `{ out, err, mem }`.
  - `out` : tout le texte de la console (les questions de `input()` et les réponses y sont aussi).
  - `err` : `null`, ou `{ title, text, raw }` si ça a planté (`raw` = message Python original).
  - `mem` : la liste des variables `{ name, type, repr }`. `repr` est la valeur écrite comme en Python (`'10'`, `"'Sam'"`, `'[1, 2]'`). Pour un objet d'une classe de l'élève, il y a aussi `attrs:[{ name, repr }]`.
- `code` : le texte du code de l'élève.
- `test(inputs, autreCode)` : relance le code (ou `autreCode`) **sans interface**, avec les réponses `inputs` à `input()`. Renvoie le même format que `r`. Sers-t'en pour :
  - tester les programmes qui utilisent `input()` (dans ce cas, ne te fie pas à `r`) ;
  - vérifier que le code marche **aussi avec d'autres valeurs**, pour refuser une réponse écrite en dur. Par exemple : `test([], code.replace(/minutes\s*=\s*135/, 'minutes = 200'))`.
- Renvoie `true` si c'est réussi. Sinon, renvoie un **message en français, précis et encourageant**, qui dit ce qui ne va pas et oriente sans donner la solution. Le HTML est permis. Passe toute valeur venant de l'élève dans `esc()`.
- Les aides : `ERR` (le message standard quand le code plante), `strip(code)` (enlève les commentaires), `memOf(r, 'nom')`, `strOf(m)` (le texte d'une variable str, sans les guillemets), `linesOf(out)` (les lignes non vides), `nInputs(code)` (le nombre d'`input(`), `norm(s)` (minuscules, sans accents, espaces simplifiés : pour comparer des textes avec tolérance), `has(r, /regex/)`.
- Sois tolérant sur la forme (espaces, majuscules du texte affiché, accents) et exigeant sur le fond (le bon calcul, la bonne structure, `return` plutôt que `print` quand c'est le sujet…).
- Pour un code qui utilise `random`, ne teste pas les valeurs exactes : teste la structure, les bornes, ou relance plusieurs fois.

### `compare` : la même chose en Python et en Java (pour la POO)
```js
{ t:'compare', h:'…', p:`<p>…</p>`, py:`…code Python…`, java:`…code Java…`,
  notes:['différence 1', 'différence 2', 'différence 3'] }
```
Les deux codes s'affichent côte à côte (l'un sous l'autre sur téléphone), puis la liste des différences. Bouton « On continue » directement.

### `fill` : code à trous (surtout pour Java)
```js
{ t:'fill', lang:'java', h:'…', p:`<p>…</p>`,
  tpl:`public class [[Personnage]] {\n    private [[int]] pv;\n}`,
  hints:['…'], ok:'…' }
```
- Un trou s'écrit `[[réponse]]`, ou `[[réponse|autre réponse acceptée]]`. La comparaison respecte les majuscules (comme Java) et ignore les espaces en trop.
- 2 à 6 trous, sur les mots qui comptent vraiment (types, mots-clés, `this`, `new`, `extends`, `@Override`…).

## Spécial POO (partie 2)

- Le cours du prof (à ne pas recopier) suit cet ordre, en Java et en Python, en anglais : 1. paradigmes et première classe · 2. classes et objets en détail (constructeurs, `self`/`this`, références et alias) · 3. encapsulation (`private`, `_`, `@property`, invariants, « tell, don't ask ») · 4. membres statiques, méthodes de fabrique, `toString`/`__str__`/`__repr__`, identité et égalité (`equals`/`hashCode`, `==`/`is`), cycle de vie · 5. héritage (`extends`, `super`, redéfinition) · 6. polymorphisme (type statique et dynamique, surcharge et redéfinition, duck typing, méthodes spéciales) · 7. abstraction (classes abstraites, interfaces, ABC et Protocol) · 8. relations et UML (association, agrégation, composition, dépendance, héritage, réalisation) · 9. exceptions, génériques et collections (`throw`/`raise`, `try`, `finally`, exceptions vérifiées, exceptions personnalisées, `Box<T>`, itération, `yield`) · 10. SOLID et design patterns.
- Chaque notion : d'abord **en Python** (exécutable, avec `mem:1` pour voir les objets), puis **« Et en Java ? »** (`compare`), puis des exercices Java (`fill`, et des `quiz` sur des extraits Java avec `lang:'java'`).
- Explications en français, avec le **terme anglais du cours** entre parenthèses la première fois : une classe (*class*), l'héritage (*inheritance*), redéfinir (*override*). Ça fait le lien avec les examens.
- Java ne s'exécute pas dans la page. Dis-le clairement dans la leçon « Java pour ceux qui connaissent Python », et montre comment lancer du Java dans VS Code (le pack d'extensions Java). Chaque chapitre peut proposer un mini-défi « dans VS Code ».
- Fil rouge : le jeu de rôle (`Personnage`, `Guerrier`, `Mage`, `Inventaire`, `Arme`, `Potion`, `Boutique`…).

## Ce que le moteur Python (Skulpt) sait faire, ou pas

Testé et qui marche : `input()`, f-strings (`f"{x:.2f}"`), `//`, `%`, `**`, listes, dictionnaires, tuples, sets, slicing, `sorted`, `sum`, `max`, `join`, `split`, les modules `math` et `random`, les fonctions, les classes, `__init__`, `__str__`, `__repr__`, `__eq__`, `__add__`, `__len__`, `__iter__`, `super()`, l'héritage, `@property` avec setter, `@classmethod`, `@staticmethod`, `isinstance`, les exceptions personnalisées, `try`/`except`/`finally`, `yield`.

À savoir :
- **Le module `abc` n'existe pas.** Pour une classe abstraite qu'on peut exécuter, utilise une méthode qui fait `raise NotImplementedError`. Montre le vrai `from abc import ABC, abstractmethod` dans un `snip` (non exécuté), en précisant qu'il marche dans VS Code.
- `round(2.675, 2)` donne 2.68 (2.67 dans le vrai Python). Évite ce genre de cas limite.
- Pas d'écriture de fichiers. Pour le chapitre sur les fichiers, explique avec des `snip` et fais pratiquer dans VS Code. Ou simule le contenu d'un fichier avec une liste de lignes.
- Les programmes trop longs (plus de 4 secondes, par exemple une boucle infinie) sont arrêtés avec une erreur expliquée.
- En cas de doute, **teste** : la page de tests exécute tout dans le vrai moteur.

## Tester (obligatoire avant de dire qu'un chapitre est fini)

1. Lance le serveur local. Dans l'appli, utilise l'aperçu avec la configuration `.claude/launch.json` : `atelier-bases` (port 8001) pour le chantier des bases, `atelier-poo` (port 8002) pour la POO. Sinon : `python -m http.server 8001 --bind 127.0.0.1` depuis la racine du projet.
2. Ouvre `http://127.0.0.1:8001/dev/tests.html?ch=bases-2` (ou `?ch=poo-3`, ou `?ch=poo` pour toute la POO). La page exécute la solution de chaque exercice dans la correction, vérifie que le code de départ est refusé, que les exemples ne plantent pas, et que les quiz sont bien formés.
3. Lis le résultat avec JavaScript dans la page : `window.__results` (attends que `done` soit à `true`). **Il doit y avoir 0 échec.**
4. Fais aussi une leçon pour de vrai dans `index.html` : coche « Tout débloquer » dans le sommaire, ouvre la leçon (`#l2-1`, `#lp3-2`…), exécute, réponds, vérifie que tout s'affiche bien.
5. Vérifie la syntaxe avec `node --check lecons/le-fichier.js`.

## Règles du travail en parallèle

- Le chantier des bases ne modifie **que** `lecons/bases-2.js` à `lecons/bases-7.js`. Le chantier POO ne modifie **que** `lecons/poo-1.js` à `lecons/poo-10.js`.
- Ne touche pas à `app.js`, `style.css`, `index.html`, `dev/`, `docs/` ni `vendor/`. Si le moteur a besoin d'un changement, contourne-le dans le contenu, et signale-le dans ton compte rendu final.
- Ne fais pas de commit et ne change pas de branche : la session principale s'en occupe.
