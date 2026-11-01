# Atelier Python

Un site pour apprendre **les bases de Python**, puis **la programmation orientée objet en Python et en Java**, avec Pyo, un petit serpent mentor. On code directement dans la page : pas d'installation, pas de compte.

- **Partie 1 · Les bases** : 7 chapitres, 44 leçons (print, variables, types, conditions, boucles, fonctions, listes et dictionnaires, VS Code, erreurs, fichiers, projet final).
- **Partie 2 · La POO** : 10 chapitres, 51 leçons (classes, encapsulation, membres statiques, égalité, héritage, polymorphisme, abstraction et interfaces, UML, exceptions et génériques, SOLID et design patterns). Chaque notion est vue en Python, puis en Java.

Chaque leçon : une révision éclair, des explications courtes, des devinettes, des exercices corrigés automatiquement, un bug à réparer et une fiche mémo. La progression est enregistrée dans le navigateur de chaque élève.

## Mettre le site en ligne avec GitHub Pages

1. Sur [github.com](https://github.com), crée un nouveau dépôt **public** nommé `atelier-python`, sans README.
2. Dans ce dossier, envoie le code (remplace `TON-PSEUDO`) :
   ```bash
   git remote add origin https://github.com/TON-PSEUDO/atelier-python.git
   git push -u origin main
   ```
3. Sur la page du dépôt : **Settings** → **Pages** → *Build and deployment* → Source : **Deploy from a branch**, branche **main**, dossier **/ (root)** → **Save**.
4. Après une ou deux minutes, le site est en ligne à l'adresse `https://TON-PSEUDO.github.io/atelier-python/`.

Pour publier une modification : `git add -A`, `git commit -m "…"`, puis `git push`. Quand tu modifies un fichier de `lecons/`, augmente son numéro `?v=` dans `index.html`, pour que les navigateurs de tes camarades chargent la nouvelle version.

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
| `style.css` | le design (clair et sombre) |
| `lecons/bases-*.js`, `lecons/poo-*.js` | le contenu, un fichier par chapitre |
| `docs/CONTENU.md` | le guide pour écrire ou modifier une leçon |
| `dev/` | les tests et la démo (pas utilisés par le site) |
| `vendor/skulpt/` | [Skulpt](https://skulpt.org) (licence MIT), qui exécute Python dans le navigateur |

Java ne s'exécute pas dans la page. Les leçons montrent le code Java à côté du Python, le font pratiquer avec des exercices à trous, et expliquent comment le lancer dans VS Code.
