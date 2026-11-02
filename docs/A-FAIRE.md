# À faire

La liste des travaux prévus, du plus proche au plus lointain.
Quand une tâche est faite, coche-la, puis déplace-la dans « Fait » avec la date. Une tâche abandonnée part aussi dans « Fait », avec la raison.

Les agents relisent ce fichier au début de chaque session, et rappellent au propriétaire les tâches « Prochainement » quand elles touchent au travail en cours.

## Prochainement

### Héberger le site sur Vercel, puis rendre le dépôt privé
**Pourquoi :** garder le code privé sans payer GitHub Pro. GitHub Pages gratuit n'accepte que les dépôts publics.
**Attention :** l'adresse du site va changer. Ne passer le dépôt en privé qu'une fois le site servi par Vercel, sinon il y aura une coupure.

- [ ] Créer le projet sur Vercel à partir du dépôt GitHub (site statique, sans build, dossier racine).
- [ ] Vérifier le site sur l'adresse Vercel : accueil, une leçon, `dev/tests.html` à 0 échec.
- [ ] Supabase → Authentication → URL Configuration : nouvelle *Site URL*, et ajouter `https://NOUVELLE-ADRESSE/**` dans *Redirect URLs*.
- [ ] Google Cloud → Clients → « Atelier Python Supabase » : ajouter la nouvelle origine JavaScript.
- [ ] Google Cloud → Branding : page d'accueil, lien de confidentialité et de conditions, domaine autorisé.
- [ ] Tester sur un téléphone : rejoindre la classe, puis « Continuer avec Google ».
- [ ] Mettre à jour [EXPLOITATION.md](EXPLOITATION.md), le [README](../README.md) et [AGENTS.md](../AGENTS.md) (adresse du site, hébergeur).
- [ ] Prévenir la classe de la nouvelle adresse. Une page de redirection sur GitHub Pages peut aider pendant la transition.
- [ ] Passer le dépôt en privé (GitHub → Settings → Danger Zone → Change visibility), puis vérifier que le site Vercel marche toujours.
- [ ] Vérifier que la tâche « Réveil Supabase » tourne toujours : les tâches GitHub Actions marchent aussi sur un dépôt privé, dans la limite des minutes gratuites.

## Plus tard

- [ ] **Page de confidentialité :** préciser que le nombre d'inscrits de la classe est visible par tout visiteur (sans aucun pseudo), et que le compteur « en ligne » utilise un identifiant d'appareil tiré au hasard.
- [ ] **Ancien compte « HDK » de L2-INFO :** il est inutilisable (compte anonyme déconnecté). À supprimer si le propriétaire le confirme.
- [ ] **Vérifier sur un vrai iPhone :** l'export des fiches en PDF depuis l'appli installée sur l'écran d'accueil (mode plein écran). Le service worker, lui, a été testé dans un vrai Chrome (enregistrement, hors ligne, nettoyage du cache).
- [ ] **Voir les données du site.** Trois options, de la moins chère à la plus complète (en tokens comme en travail) :
  1. *Requête toute prête* à enregistrer dans Supabase (SQL Editor → Save) : le tableau des élèves (pseudo, XP, leçons, où chacun s'est arrêté, dernière visite, Google ou pas, statut actif / à relancer / jamais commencé). Aucune modification du site.
  2. *Tableau de bord minimal* `admin.html`, réservé au compte du propriétaire (vérifié par une fonction de la base) : l'entonnoir (inscrits → ont commencé → 1 leçon → 3 leçons) et le tableau des élèves.
  3. *Tableau de bord complet* : en plus, en direct (personnes en ligne), activité jour par jour, étapes où les élèves abandonnent, compteur de visiteurs sans compte (identifiant d'appareil tiré au hasard) avec historique au-delà des 24 h des journaux, relevé automatique des erreurs JavaScript chez les élèves, et un bouton pour supprimer un pseudo déplacé. Mettre à jour la page de confidentialité.
- [ ] **Relancer les élèves bloqués au début** (constat du 2026-11-02 : 4 inscrits arrêtés pendant leur première leçon, 2 jamais commencé) : fil d'activité de la classe, objectif de classe de la semaine, bouton « Partager le classement » pour le groupe WhatsApp.
- [ ] **Encourager à relier son compte à Google** : 10 inscrits sur 12 ne le sont pas et perdraient leur progression en changeant de téléphone.

## Idées (long terme)

Voir [VISION.md](VISION.md) : révisions espacées, plusieurs cours, plusieurs classes, notifications de rappel, Java exécuté dans la page, logo sur l'écran de connexion Google (demande une vérification par Google).

## Fait

| Date | Tâche |
|---|---|
| 2026-11-02 | Connexion Google en production, classe unique CS28, proposition de la rejoindre sur l'accueil |
| 2026-11-02 | Réveil automatique de la base Supabase tous les 3 jours |
| 2026-11-02 | Documentation : AGENTS.md, ARCHITECTURE.md, EXPLOITATION.md, VISION.md |
| 2026-11-02 | Compteur des personnes en ligne sur l'accueil |
| 2026-11-02 | Sauter les bases pour aller directement à la POO (choix sur l'accueil et dans Paramètres) |
| 2026-11-02 | Fiches : terminées ou toutes, export en PDF et copie du texte |
| 2026-11-02 | Cache : pages toujours revalidées, cache hors ligne nettoyé, bandeau « nouvelle version » |
