# Atelier Python

Un site pour apprendre **les bases de Python**, puis **la programmation orientée objet en Python et en Java**, avec Pyo, un petit serpent mentor. On code directement dans la page : pas d'installation, pas de compte.

- **Partie 1 · Les bases** : 7 chapitres, 44 leçons (print, variables, types, conditions, boucles, fonctions, listes et dictionnaires, VS Code, erreurs, fichiers, projet final).
- **Partie 2 · La POO** : 10 chapitres, 51 leçons (classes, encapsulation, membres statiques, égalité, héritage, polymorphisme, abstraction et interfaces, UML, exceptions et génériques, SOLID et design patterns). Chaque notion est vue en Python, puis en Java.

Chaque leçon : une révision éclair, des explications courtes, des devinettes, des exercices corrigés automatiquement, un bug à réparer et une fiche mémo.

Pour donner envie de revenir : de l'XP, 12 niveaux (de « Œuf » à « Python légendaire »), une série de jours avec des gels de série, un objectif du jour, des combos, 15 badges, des confettis, et une carte à partager. Le site est une **appli installable** (PWA) qui marche hors ligne. Avec Supabase, il y a aussi des **comptes** et un **classement par classe**, remis à zéro chaque semaine.

## Activer les comptes et le classement (Supabase)

Sans cette étape, le site marche quand même : la progression reste dans le navigateur de chaque élève.

1. Crée un projet gratuit sur [supabase.com](https://supabase.com).
2. **SQL Editor** : colle le contenu de `supabase/schema.sql` et clique sur **Run**.
3. **Authentication → Sign In / Providers** : active **Allow anonymous sign-ins**, **Email**, et **Allow manual linking** (pour qu'un élève puisse relier son compte à un e-mail ou à Google). Pour Google, il faut aussi un identifiant OAuth Google : suis le guide lié dans cette page. Tant que Google n'est pas activé, le bouton « Continuer avec Google » n'apparaît pas sur le site.
4. **Authentication → URL Configuration** : mets l'adresse du site (`https://TON-PSEUDO.github.io/atelier-python/`) dans *Site URL* et dans *Redirect URLs*.
5. **Project Settings → API** : copie la *Project URL* et la clé *anon public* dans `config.js`, puis publie (`git commit` et `git push`).

Le site sert à une seule classe, **CS28** (constante `CLASSE` dans `cloud.js`). L'accueil propose de la rejoindre avec un simple pseudo, sans e-mail. C'est facultatif. L'élève peut ensuite relier son compte à Google pour le retrouver sur un autre appareil.

À savoir : avec l'offre gratuite, l'envoi d'e-mails par Supabase est très limité (quelques e-mails par heure). C'est pour ça que l'entrée dans la classe se fait sans e-mail. Un projet gratuit se met aussi en pause après une semaine sans aucune visite : la tâche GitHub `reveil-supabase` l'en empêche. Les réglages en ligne du projet actuel sont décrits dans [docs/EXPLOITATION.md](docs/EXPLOITATION.md).

## Mettre le site en ligne avec GitHub Pages

1. Sur [github.com](https://github.com), crée un nouveau dépôt **public** nommé `atelier-python`, sans README.
2. Dans ce dossier, envoie le code (remplace `TON-PSEUDO`) :
   ```bash
   git remote add origin https://github.com/TON-PSEUDO/atelier-python.git
   git push -u origin main
   ```
3. Sur la page du dépôt : **Settings** → **Pages** → *Build and deployment* → Source : **Deploy from a branch**, branche **main**, dossier **/ (root)** → **Save**.
4. Après une ou deux minutes, le site est en ligne à l'adresse `https://TON-PSEUDO.github.io/atelier-python/`.

Pour publier une modification : `git add -A`, `git commit -m "…"`, puis `git push`. Quand tu modifies `app.js`, `cloud.js`, `style.css`, `config.js` ou un fichier de `lecons/`, augmente son numéro `?v=` dans `index.html`, pour que les navigateurs de tes camarades chargent la nouvelle version.

## Travailler sur le site en local

```bash
python -m http.server 8000
```
Puis ouvre :
- `http://localhost:8000/` pour le site ;
- `http://localhost:8000/dev/tests.html` pour les tests du contenu. Chaque solution de référence est passée dans la correction, avec le vrai moteur Python. Il doit y avoir 0 échec. Tu peux filtrer avec `?ch=bases-3` ou `?ch=poo` ;
- `http://localhost:8000/dev/demo.html` pour une leçon de démonstration de chaque type d'étape.

## Organisation

| Fichier | Rôle |
|---|---|
| `index.html` | la page du site |
| `app.js` | le moteur : bulles, console Python, corrections, progression |
| `cloud.js` | les comptes, la classe CS28, la synchronisation et le classement (Supabase) |
| `config.js` | l'adresse et la clé publique Supabase |
| `style.css` | le design (clair et sombre) |
| `lecons/bases-*.js`, `lecons/poo-*.js` | le contenu, un fichier par chapitre |
| `sw.js`, `manifest.webmanifest`, `icons/` | l'appli installable et le mode hors ligne |
| `confidentialite.html` | la page confidentialité et conditions d'utilisation |
| `supabase/schema.sql` | la base de données : tables, règles de sécurité, fonctions |
| `.github/workflows/` | la tâche qui empêche la mise en pause de Supabase |
| `AGENTS.md`, `CLAUDE.md` | les consignes pour les agents de code |
| `docs/ARCHITECTURE.md` | comment le site est construit, et les règles pour qu'il reste propre |
| `docs/CONTENU.md` | le guide pour écrire ou modifier une leçon |
| `docs/EXPLOITATION.md` | les services en ligne, leurs réglages et les requêtes utiles |
| `docs/A-FAIRE.md` | les travaux prévus, et ceux déjà faits |
| `docs/VISION.md` | où va le projet : vers un « Duolingo du code » |
| `dev/` | les tests et la démo (pas utilisés par le site) |
| `vendor/skulpt/` | [Skulpt](https://skulpt.org) (licence MIT), qui exécute Python dans le navigateur |
| `vendor/supabase/` | supabase-js (licence MIT), le client Supabase |

Java ne s'exécute pas dans la page. Les leçons montrent le code Java à côté du Python, le font pratiquer avec des exercices à trous, et expliquent comment le lancer dans VS Code.
