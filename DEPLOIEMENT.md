# Mise en ligne — guide pas à pas (sans connaissances techniques)

## Choix recommandé : **Railway** (≈ 5 $/mois)
Pourquoi : il héberge une application Node + un **disque persistant** (indispensable : votre base de données est un fichier), fournit le **HTTPS** automatique (obligatoire pour le NFC), et se déploie en cliquant depuis GitHub. Les offres gratuites d'autres hébergeurs effacent les données à chaque redémarrage : à éviter. Prix et conditions vérifiés au moment de la rédaction (abonnement Hobby ≈ 5 $/mois, disque ≈ 0,15–0,25 $/Go/mois) : confirmez sur railway.com/pricing. Une **carte bancaire (Visa/Mastercard, y compris virtuelle)** est demandée.

## Étapes
1. Créez un compte sur **github.com** et un dépôt **privé** `studs-app`. Envoyez-y le contenu du ZIP (bouton *Add file > Upload files*). Le fichier `.gitignore` empêche d'envoyer vos secrets.
2. Créez un compte sur **railway.com** > *New Project* > *Deploy from GitHub repo* > choisissez `studs-app`.
3. Dans le service : onglet **Settings**
   - Build Command : `npm run build`
   - Start Command : `npm start`
   - Region : une région **Europe** (la plus proche du Cameroun en latence).
4. Onglet **Volumes** > *New Volume* > point de montage **`/data`** (1 Go suffit largement).
5. Onglet **Variables** > ajoutez :
   - `NODE_ENV` = `production`
   - `DATA_DIR` = `/data`
   - `SESSION_SECRET` = une longue suite aléatoire (48 caractères ou plus)
   - `ADMIN_PASSWORD` = le mot de passe du DG (à garder secret)
   - `GEMINI_API_KEY` = (optionnel, assistante Alene)
   - Les numéros de paiement (`COMPANY_MTN_NUMBER`, `COMPANY_ORANGE_NUMBER`) sont déjà intégrés par défaut.
6. Onglet **Settings > Networking > Generate Domain** : vous obtenez une adresse `https://…up.railway.app`. Un nom de domaine (`studs-services.com`, ≈ 10–15 $/an) peut s'ajouter plus tard.
7. Connexion : `borisleroymenguealo@gmail.com` + votre `ADMIN_PASSWORD`.
8. Sur Android : ouvrez l'adresse dans Chrome > menu ⋮ > **Installer l'application** (l'app se comporte alors comme une vraie app).

## Sauvegardes (important)
- Le fichier `database.json` contient **toutes** vos données. Chaque semaine, copiez-le (Railway > Volume > téléchargement, ou demandez-moi d'ajouter une sauvegarde automatique par e-mail).
- Ne perdez jamais `SESSION_SECRET` et `ADMIN_PASSWORD`.

## Capacité
Le fichier JSON suffit pour le pilote d'Ebolowa (quelques centaines d'utilisateurs). Au-delà (≈ 2 000 commandes/mois), migration vers PostgreSQL recommandée.
