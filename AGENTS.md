# AGENTS.md : consignes pour les agents de code

Ce fichier s'adresse aux agents (Claude Code, Codex, etc.) et aux personnes qui modifient le projet.
Lis-le en entier avant de toucher au code.

## Le projet en bref

**Atelier Python** est un site gratuit, sans installation, pour apprendre les bases de Python puis la POO en Python et en Java, avec Pyo, un petit serpent mentor. On code directement dans la page. Il y a de l'XP, des niveaux, une série de jours, des badges, une classe (CS28) avec son classement, et une appli installable (PWA).

- En ligne : https://coulidiaty.github.io/atelier-python/ (GitHub Pages, branche `main`).
- Public : la classe **CS28** (Computer Science, promo 2028), sur téléphone surtout (iPhone et Android).
- Ambition à long terme : devenir un « Duolingo du code ». Voir [docs/VISION.md](docs/VISION.md).

## Où trouver quoi

| Document | Contenu |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Les fichiers, l'état, les événements, la base de données, les pièges connus, les règles pour éviter le code spaghetti |
| [docs/CONTENU.md](docs/CONTENU.md) | Écrire ou modifier une leçon (ton, types d'étapes, tests) |
| [docs/EXPLOITATION.md](docs/EXPLOITATION.md) | Supabase, Google, réglages en ligne, requêtes utiles (qui est inscrit, qui est actif) |
| [docs/A-FAIRE.md](docs/A-FAIRE.md) | Les travaux prévus (prochainement, plus tard, idées) et ceux déjà faits |
| [docs/VISION.md](docs/VISION.md) | Où va le projet : du cours Python au Duolingo du code |
| [README.md](README.md) | Présentation, mise en ligne, travail en local |

## Règles

### Les travaux prévus
- Au début de chaque session, relis [docs/A-FAIRE.md](docs/A-FAIRE.md). Si une tâche « Prochainement » touche au travail demandé, rappelle-la au propriétaire.
- Quand une tâche est faite, coche-la, puis déplace-la dans « Fait » avec la date, dans le même commit. Une nouvelle idée ou un travail remis à plus tard s'ajoute dans ce fichier.

### Langue et ton
- Tout ce que voit l'élève est **en français**, simple et direct, tutoiement. Pas de jargon sans explication.
- Les commentaires du code, les messages de commit et la documentation sont aussi en français.

### Pas d'étape de build
- Le site est du HTML, CSS et JavaScript « nus » : pas de npm, pas de bundler, pas de framework. Garde-le ainsi tant que [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) ne dit pas le contraire.
- Les bibliothèques externes sont copiées dans `vendor/` (Skulpt, supabase-js), avec leur licence.

### Cache des navigateurs : toujours augmenter `?v=`
- Quand tu modifies `app.js`, `cloud.js`, `style.css`, `config.js` ou un fichier de `lecons/`, augmente son numéro `?v=` dans `index.html`. Sinon, les téléphones des élèves gardent l'ancienne version (service worker).

### Tester avant de dire que c'est fini
- Contenu : `http://localhost:8000/dev/tests.html` doit afficher **0 échec**. Chaque solution de référence est passée dans la correction, avec le vrai moteur Python.
- Interface : vérifier dans un navigateur, **à la taille d'un téléphone** (375 px de large), puis en clair et en sombre si le style change.
- Comptes : on peut créer des comptes de test sur le vrai projet Supabase, mais avec un pseudo qui commence par `TestClaude`, et on les **supprime ensuite** (requête dans [docs/EXPLOITATION.md](docs/EXPLOITATION.md)).

### Données et sécurité
- Ne jamais commiter de secret : ni code secret OAuth, ni clé `service_role`. La clé `anon` de `config.js` est publique par conception : la sécurité vient des règles RLS.
- Toute modification de la base passe par `supabase/schema.sql` (à garder à jour) **et** par une migration appliquée au projet. Après un changement de schéma, regarder les alertes de sécurité Supabase.
- Ne jamais supprimer de données d'élèves sans l'accord explicite du propriétaire du projet.

### Git
- Branche `main`, publiée directement par GitHub Pages. Petits commits, message en français qui dit **pourquoi**.
- Ne pas pousser sans l'accord du propriétaire, sauf s'il l'a déjà donné pour la tâche en cours.

## Démarrer en local

```bash
python -m http.server 8000
```

- `http://localhost:8000/` : le site (les comptes utilisent le vrai projet Supabase).
- `http://localhost:8000/dev/tests.html` : les tests du contenu (filtre : `?ch=bases-3` ou `?ch=poo`).
- `http://localhost:8000/dev/demo.html` : une leçon de démonstration de chaque type d'étape.
