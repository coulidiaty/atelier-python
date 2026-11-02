# Architecture

Ce document décrit comment le site est construit aujourd'hui, les pièges déjà rencontrés, et les règles pour qu'il reste lisible en grandissant.
Mets-le à jour dans le même commit que tout changement d'architecture.

## Vue d'ensemble

```
index.html ─┬─ vendor/skulpt/       exécute Python dans le navigateur
            ├─ config.js            adresse et clé publique Supabase
            ├─ vendor/supabase/     client supabase-js 2.45.4
            ├─ app.js               le moteur : état, leçons, corrections, jeu, rendu
            ├─ cloud.js             comptes, classe CS28, synchronisation, classement
            ├─ lecons/*.js          le contenu : un fichier par chapitre
            └─ Atelier.start()      lance le site une fois tout chargé
sw.js                               service worker : hors ligne et cache
supabase/schema.sql                 tables, règles RLS et fonctions de la base
dev/                                tests du contenu et démo (jamais chargés par le site)
.github/workflows/                  tâches automatiques (réveil de la base)
```

Tout est du JavaScript sans build, chargé dans l'ordre par des balises `<script>`. Chaque fichier est une fonction auto-exécutée qui communique avec les autres **uniquement** par l'objet global `window.Atelier`.

## Les modules

### `app.js` : le moteur (aucune dépendance réseau)
Sections, dans l'ordre du fichier :
1. **Aides pour les corrections** : `strip`, `memOf`, `linesOf`, `norm`, `esc`… utilisées par les fonctions `check` des leçons.
2. **Jeu** : niveaux (`LEVELS`), barème d'XP (`XP`), badges (`BADGES`), dates.
3. **Enregistrement des chapitres** : `Atelier.chapter({...})`, appelé par chaque fichier de `lecons/`.
4. **État** : l'objet `S`, sa sauvegarde dans `localStorage` (clé `atelier-python-v1`), `migrate`, `exportState`, `mergeState`, `setOwner`.
5. **Python (Skulpt)** : `runPy`, la mémoire de Python (`readMem`), l'explication des erreurs en français (`explain`).
6. **Exercices à trous**, **sons et célébrations**, **gain d'XP** (`award`, `gain`, `touchStreak`, `unlockBadge`, `lessonComplete`).
7. **Rendu** : des fonctions `xxxHTML()` qui renvoient des chaînes HTML, et `renderView`, `renderTop`, `renderSide`.
8. **Actions** : `run`, `checkFill`, `pick`, `next`, `go` (navigation par `#ancre`), `share`.
9. **`bind()`** : un seul écouteur délégué par type d'événement (`click`, `change`, `input`, `keydown`…), qui lit les attributs `data-go`, `data-act`, `data-act2`.

### `cloud.js` : les comptes (se branche sur le moteur, jamais l'inverse)
- Sans `config.js` rempli, il ne fait rien : le site marche entièrement hors ligne.
- Il écoute le moteur avec `Atelier.on(...)` et ajoute de l'affichage avec `Atelier.ext.*`.
- Il ne modifie l'état du moteur que par `mergeState`, `setOwner` et `save`.

### `lecons/*.js` : le contenu
Un fichier par chapitre (`bases-1.js` … `poo-10.js`), qui appelle `Atelier.chapter({ part, n, title, lessons, plan })`. Chaque leçon a un `id`, un `title`, une durée `dur`, une `intro`, un `recap` (la fiche mémo) et des `steps` de type `say`, `quiz`, `code`, `compare` ou `fill`. Tout est décrit dans [CONTENU.md](CONTENU.md).

## Contrats entre modules

### `window.Atelier`
| Membre | Rôle |
|---|---|
| `chapter(c)` | enregistrer un chapitre (appelé par `lecons/`) |
| `start()` | lancer le site (dernière ligne de `index.html`) |
| `on(événement, fn)` | s'abonner à un événement du moteur |
| `ext` | points d'extension d'affichage (voir plus bas) |
| `state`, `view` | l'état et la vue en cours (lecture) |
| `save`, `renderAll`, `renderView`, `renderTop`, `toast`, `go` | actions sur l'interface |
| `exportState`, `mergeState`, `setOwner` | synchronisation avec un compte |
| `chapters`, `lessons` | les chapitres et les leçons enregistrés (lecture) |
| `h` | les aides de correction (`esc`, `norm`, `memOf`…), pour les leçons et `cloud.js` |
| `runPy`, `parseFill`, `fillNorm`, `prepare`, `levelOf` | utilisés par `dev/tests.html` |

### Événements (`Atelier.on`)
| Événement | Quand | Donnée |
|---|---|---|
| `start` | le site est prêt | — |
| `render` | une vue vient d'être affichée | la vue |
| `save` | l'état vient d'être enregistré | l'état |
| `xp` | l'élève gagne de l'XP | le montant |
| `badge` | un badge est débloqué | son identifiant |
| `lesson` | une leçon est terminée | son identifiant |
| `reset` | « Tout recommencer » | — |

### Points d'extension d'affichage (`Atelier.ext`)
| Nom | Où | Fourni par |
|---|---|---|
| `hudStart()` | au début de la barre du haut, sur toutes les pages | `cloud.js` : le point vert et le nombre de personnes en ligne |
| `homeTop()` | tout en haut de l'accueil | `cloud.js` : le compteur « en ligne », et la proposition de rejoindre CS28 |
| `homeBanner()` | après le premier bloc de l'accueil | `cloud.js` : les membres de la classe (toucher son propre pseudo ouvre « Modifier mon pseudo ») |
| `accountHTML()` | Paramètres → Compte et classe | `cloud.js` |
| `boardHTML()` | Progrès → Classement de la classe | `cloud.js` |
| `hasAccount()` | (pas d'affichage) dit au moteur qu'un compte est connecté, pour l'avertissement de « Tout recommencer » | `cloud.js` |

Chaque point d'extension renvoie une chaîne HTML, ou `''` pour ne rien afficher.

## L'état de l'élève (`S`)

| Clé | Contenu |
|---|---|
| `done` | leçons terminées `{ id: true }` |
| `cur` | étape atteinte dans chaque leçon |
| `st` | l'état de chaque étape : code tapé, réponses, essais, indices… |
| `xp`, `combo`, `streak`, `daily`, `goal`, `goalDays` | le jeu |
| `badges`, `stats`, `ls` | badges, statistiques globales et par leçon |
| `settings` | son, thème, animations, barre latérale |
| `unlock` | « Tout débloquer » |
| `track`, `trackAt` | le parcours, et quand il a été choisi (le choix le plus récent l'emporte entre appareils) : `'bases'` (les bases puis la POO), `'poo'` (directement la POO), ou `null` (pas encore choisi, comme `'bases'`). Il décide de la leçon proposée par « Continuer » (`nextLesson`, `resumeLesson`) |
| `owner`, `ownerLinked` | le compte à qui appartient cette progression |
| `updated` | date de la dernière sauvegarde |

Toute nouvelle clé doit avoir une valeur par défaut dans `fresh()` : `migrate()` complète ainsi les anciens états.

## La base de données (Supabase)

Décrite dans [`supabase/schema.sql`](../supabase/schema.sql). Projet `atelier-python` (`zsbdvtjdhjqxibfjvgey`), en Europe (Paris).

| Objet | Rôle | Qui y accède |
|---|---|---|
| `profiles` | pseudo et classe | chacun sa ligne |
| `progress` | l'état complet (`data`), l'XP, les leçons faites, la série | chacun sa ligne |
| `xp_events` | chaque gain d'XP daté, pour le classement de la semaine | chacun ajoute et lit les siens ; maximum 3 000 XP par jour (déclencheur `limite_xp`) |
| `classement(classe, semaine)` | le classement d'une classe | seulement ses membres |
| `nb_eleves(classe)` | le nombre d'inscrits, sans pseudo | tout le monde |

### Comptes
- **Rejoindre la classe** crée un compte anonyme Supabase avec un pseudo. C'est facultatif : le site marche sans compte.
- **Continuer avec Google** relie ce compte à Google (`linkIdentity`), ou reconnecte un compte déjà relié (`signInWithOAuth`). Flux **PKCE** : au retour, l'adresse contient `?code=…`.
- Il n'y a qu'**une classe**, `CS28` (constante `CLASSE` dans `cloud.js`). Un profil d'une autre classe y passe automatiquement.

### Synchronisation
1. À la connexion : `setOwner`, puis lecture de `progress`, `mergeState` (on garde le maximum de chaque côté), puis réécriture.
2. Pendant le jeu : `push()` 4 s après une sauvegarde, et les gains d'XP sont envoyés par paquets toutes les 8 s (`flushXp`).
3. Quand la page passe en arrière-plan ou que le réseau revient : envoi immédiat.

### Cache et mises à jour
Trois couches peuvent servir une ancienne version :
1. **GitHub Pages** envoie `Cache-Control: max-age=600` : un navigateur peut garder un fichier 10 minutes.
2. **Le service worker** (`sw.js`, cache `atelier-v2`) :
   - les pages : réseau d'abord, en revalidant toujours auprès du serveur (`cache:'no-cache'`), copie locale hors ligne ; une seule copie par page, sans les paramètres de l'adresse ;
   - les autres fichiers : copie locale tout de suite, mise à jour en arrière-plan. Un fichier versionné (`?v=`) ne garde que sa dernière version ;
   - les requêtes `no-store` vont toujours au réseau.
3. **L'appli restée ouverte** (surtout installée sur iPhone) : `watchUpdates()` dans `app.js` relit `index.html` sans cache 10 s après le chargement, à chaque retour sur l'appli (au plus tous les quarts d'heure) et toutes les 30 minutes. Si ses `?v=` diffèrent, un bandeau propose « Mettre à jour ».

D'où la règle : **toujours augmenter `?v=`** d'un fichier modifié. Les fichiers de `vendor/` n'ont pas de `?v=` : si on les remplace, il faut leur en ajouter un. Changer le nom `CACHE` dans `sw.js` vide le cache de tous les appareils.

### Personnes en ligne
Supabase Realtime **Presence**, sur le canal `en-ligne`, sans table. Chaque appareil s'y annonce avec un identifiant tiré au hasard (`atelier-appareil` dans `localStorage`), seulement quand la page est visible. Il se retire quand elle passe en arrière-plan. Aucun pseudo n'est partagé, et les visiteurs sans compte comptent aussi. Le compteur est mis à jour directement dans le DOM (`showOnline`), sans refaire le rendu de la page.

## Pièges connus (déjà corrigés, ne pas les réintroduire)

- **Course au moment de rejoindre la classe** : la lecture du profil lancée par `onAuthStateChange` peut partir avant son enregistrement. Un résultat vide ne doit jamais effacer `C.profile` posé par `join()`.
- **Erreur au retour de Google** : si l'adresse contient `?error=…`, supabase-js 2.45 **efface la session en cours**. Le compte de classe, s'il est anonyme, serait perdu. `cloud.js` retire ces paramètres **avant** `createClient`.
- **Saisie effacée** : un nouveau rendu pendant la saisie vide les champs. `rerender()` dans `cloud.js` remet ce que l'élève tapait.
- **Appareil partagé** : sans `owner`, un nouvel élève récupérait la progression et les XP du précédent.
- **Déconnexion d'un compte anonyme** : le compte est perdu pour toujours. La déconnexion se fait donc en deux temps, avec un avertissement.
- **Guillemets de l'iPhone** : le clavier remplace `"` par `“ ”`, `--` par `—` et `...` par `…`. `straight()` les remet droits avant d'exécuter le code et de corriger les trous. Aucune solution de référence ne doit utiliser ces caractères.
- **Bouton « retour » du téléphone** : `go()` ajoute chaque vue à l'historique (`pushState`), et l'événement `hashchange` affiche la vue demandée. Sans ça, « retour » quittait le site.
- **Inscriptions sur un même WiFi** : Supabase limite les comptes anonymes par heure et par adresse IP (réglé à 200, voir [EXPLOITATION.md](EXPLOITATION.md)).

## Règles pour éviter le code spaghetti

1. **Le moteur ne connaît pas le réseau.** `app.js` ne parle jamais à Supabase. Tout ce qui touche aux comptes vit dans `cloud.js` et passe par `Atelier.on` et `Atelier.ext`.
2. **Le contenu ne connaît pas l'interface.** Une leçon décrit des étapes et des corrections. Elle n'écrit jamais dans le DOM et n'appelle pas les fonctions internes du moteur.
3. **Un nouvel affichage branché depuis l'extérieur = un nouveau point `Atelier.ext`**, documenté dans le tableau ci-dessus. Pas de `document.querySelector` d'un module dans le HTML d'un autre.
4. **Un seul écouteur délégué par type d'événement et par module**, piloté par des attributs `data-…`. Pas d'écouteurs posés élément par élément après chaque rendu.
5. **Tout texte venant de l'élève ou de la base passe par `esc()`** avant d'entrer dans du HTML (pseudos, code, sorties de la console).
6. **Seuil de découpage** : quand un fichier dépasse environ 1 000 lignes ou mélange deux responsabilités, on le découpe (voir la cible plus bas) avant d'ajouter une fonctionnalité.
7. **Une décision d'architecture = une ligne dans le journal ci-dessous**, dans le même commit.

## Cible : vers plusieurs cours

`app.js` (environ 900 lignes) arrive au seuil. Le jour où l'on ajoute un deuxième cours (voir [VISION.md](VISION.md)), découper ainsi, sans build, avec des modules ES (`<script type="module">`) :

```
src/
  core/        état, sauvegarde, migration, événements (sans DOM)
  game/        XP, niveaux, série, badges, objectifs
  runners/     un moteur d'exécution par langage : python (Skulpt), plus tard js, sql…
  ui/          rendu des vues et des étapes, navigation
  cloud/       comptes, classe, synchronisation (l'actuel cloud.js)
courses/
  python/      l'actuel lecons/ : un dossier par cours, un fichier par chapitre
```

Principes : un cours = un dossier de contenu + un moteur d'exécution déclaré ; le moteur de leçons ne dépend d'aucun langage en particulier ; l'état est rangé par cours (`S.courses[id]`) avec une migration de l'état actuel.

## Journal des décisions

| Date | Décision | Pourquoi |
|---|---|---|
| 2026-11 | Pas de build, JavaScript « nu » et `vendor/` | Simple à publier sur GitHub Pages et à modifier sans outillage |
| 2026-11 | Supabase pour les comptes, avec RLS | Gratuit, base Postgres, la clé publique peut rester dans le code |
| 2026-11 | Comptes anonymes + liaison Google, pas de lien par e-mail | L'offre gratuite n'envoie qu'environ 2 e-mails par heure |
| 2026-11 | Une seule classe, CS28, que l'on propose sans obliger à la rejoindre | Le site sert d'abord à une classe ; rejoindre doit rester un choix |
| 2026-11 | Flux PKCE pour Google | Le retour arrive dans `?code=…` et laisse le `#…` libre pour la navigation |
| 2026-11 | Réveil de la base tous les 3 jours par GitHub Actions | Un projet gratuit se met en pause après 7 jours sans activité |
| 2026-11 | Compteur « en ligne » avec Realtime Presence, et non une table | Temps réel, aucune écriture en base, aucune donnée personnelle |
| 2026-11 | Parcours `track` : on peut sauter les bases, sans rien verrouiller | Les élèves qui connaissent Python vont droit à la POO ; les bases restent ouvertes pour réviser |
| 2026-11 | Export des fiches par l'impression du navigateur (PDF) et le presse-papiers | Aucune bibliothèque PDF à embarquer ; marche sur iPhone, Android et ordinateur |
