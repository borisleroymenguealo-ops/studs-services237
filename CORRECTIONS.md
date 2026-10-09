# STUD'S SERVICES — Journal des corrections (v1.0)

> Revue du code généré par IA. Les correctifs ont été appliqués par analyse statique
> (pas de réseau dans mon environnement → `npm install`, build et tests d'exécution **à lancer chez vous**, voir « Mise en route »).

## 🔴 Failles critiques corrigées

| # | Problème d'origine | Correction |
|---|---|---|
| 1 | **Connexion sans mot de passe** : l'e-mail seul suffisait (`/api/auth/login`). | Mot de passe obligatoire (min. 8 car.), hash `scrypt` + sel. Message d'erreur identique compte inconnu / mauvais mot de passe. |
| 2 | **Bouton « Boris (Admin) » en un clic** sur l'écran d'accueil = n'importe qui devenait Directeur Général. | Supprimé. Connexion rapide démo uniquement si `VITE_DEMO_MODE=true`, sans compte admin. |
| 3 | **Authentification falsifiable** : le serveur croyait les en-têtes `X-User-Id / X-User-Email` envoyés par le navigateur. | Jetons de session signés (HMAC-SHA256, 7 jours) via `Authorization: Bearer`. En-têtes X-User-* supprimés. |
| 4 | **Presque toutes les routes `/api/*` étaient publiques** (commandes, notifications, cartes, chat, assignation…). | Toute route exige un jeton valide, sauf login / inscription / invité / catalogue. Contrôles de rôle et de propriété sur chaque route. |
| 5 | **`/api/download-zip`** publiait le code source ET `database.json` (données clients). | Route supprimée, lien retiré du menu. |
| 6 | **`/api/state`** envoyait toute la base (téléphones, soldes, e-mails de tous) à chaque utilisateur, toutes les 4 s. | État filtré par rôle : un client ne reçoit que ses commandes/notifications/carte ; annuaire minimal des prestataires ; chat limité à ses canaux. Rafraîchissement 5 s, suspendu si l'onglet est masqué. |
| 7 | **`/api/reset-data`** (effacement total) accessible sans droits. | Réservé au Directeur Général. |
| 8 | **Prix pris dans la requête du navigateur** (`servicePrice`) : un client pouvait commander à 1 FCFA. | Prix lu dans le catalogue serveur. |
| 9 | **Double paiement NFC** : rescanner une commande terminée la relançait puis la repayait. | Machine d'états stricte (`assigned → in_progress → completed`) + fonction unique `finalizeOrder` idempotente. |
| 10 | **Paiement sans contrôle** : n'importe qui pouvait valider, noter, signaler ou changer le statut d'une commande. | Scan NFC : seul le prestataire affecté. Validation manuelle/notation : seul le client propriétaire. Statut `completed` par route générique : staff uniquement. |
| 11 | Un prestataire non approuvé pouvait être affecté / agir. | Affectation limitée aux prestataires `active`. Un prestataire ne peut prendre qu'une mission libre. |
| 12 | Les assistants (supervisors) pouvaient modifier les soldes via `/admin/config`. | Ajustement de solde réservé au Directeur Général ; valeurs de config validées. |
| 13 | Comptes démo (Aline, Arnaud) et solde admin fictif de 550 000 FCFA présents en production. | Seul l'admin est créé. Démo via `SEED_DEMO=true`. |
| 14 | `setCurrentUserRole` permettait de changer d'identité sans login. | Ne change plus que la vue pour un compte admin. |
| 15 | Compte invité QR : créé via inscription publique avec 25 000 FCFA. | Route dédiée `/api/auth/guest`, solde 0. |

## 🟠 Bugs fonctionnels corrigés

- Commandes créées **sans adresse ni catégorie** → ajoutées (`address`, `category`, `providerPhone`).
- Bouton « Alerter la Qualité » appelait une route inexistante (échec silencieux) → nouvelle route `/api/admin/notify`.
- Notation : valeur non bornée, modifiable à l'infini → 1 à 5, une seule fois, après service terminé.
- Points de fidélité crédités sur commandes payées **par points** → plus de points dans ce cas.
- Inscription : doublon de téléphone non détecté si espaces différents → numéros normalisés.
- `database.json` **écrasé par les valeurs par défaut** si le fichier était illisible (perte totale des données) → copie de secours `.corrupt-…` et écriture atomique (fichier temporaire + renommage).
- Fuite mémoire du limiteur de débit + contournement via `X-Forwarded-For` → `trust proxy`, nettoyage périodique, limite stricte sur login/inscription (30 / 15 min).
- Ancien filtre « anti-XSS » par regex qui déformait des textes légitimes → remplacé par trim + limite de taille (React échappe déjà l'affichage).
- Supervisors : seuls onglets réellement vérifiés (`members`, `financials`, `ratings`) ; création d'un assistant génère un **mot de passe temporaire** affiché dans le message de confirmation.
- Modèle Gemini codé en dur (`gemini-3.5-flash`) → variable `GEMINI_MODEL` (défaut `gemini-2.5-flash`). Historique et taille des messages limités.
- `PORT` forcé à 3000 → `process.env.PORT`.
- `package.json` : doublon `vite`, nom générique → nettoyé.
- Types : commentaire « commission 20 % » obsolète — la règle appliquée partout est **30 % STUD'S / 70 % prestataire** (conforme au business plan).

## ⚠️ Changements de comportement à connaître

1. **Le prestataire ne peut plus clôturer lui-même une mission** (le bouton « Terminer » côté prestataire renverra un message d'explication) : la fin doit être validée par le **client** (2ᵉ scan NFC ou validation manuelle). C'est la règle du business plan ; sinon un prestataire se paierait seul.
2. Tous les utilisateurs existants doivent se (ré)inscrire : l'ancien `database.json` n'avait pas de mots de passe. Le compte DG reçoit son mot de passe via `ADMIN_PASSWORD` (sinon un mot de passe temporaire s'affiche une fois dans la console).

## 🆕 Version 1.1 — fonctionnalités ajoutées

| Domaine | Ce qui a été fait |
|---|---|
| **Prix** | Tous les services à **5 000 FCFA / prestation** (prix moyen du business plan §11.1). Commission **30 % / 70 %** inchangée. Remises existantes conservées (abonnement hebdo −5 %, mensuel −12 %, carte NFC −10 %), calculées **côté serveur**. |
| **Paiement Mobile Money** | Suppression du portefeuille/recharge (impossible sans API). Le client envoie l'argent aux numéros **MTN 671 711 046 / Orange 696 356 036** (affichés dans l'app, modifiables via variables d'environnement), saisit l'**identifiant de transaction**, l'admin confirme « Reçu ✔ » ou « Introuvable ✖ ». Une référence ne peut pas être réutilisée. |
| **Espèces** | Le client déclare « J'ai payé en espèces » ; le **prestataire confirme la réception** ; vous voyez les deux sur le tableau « Paiements & NFC ». Le prestataire a encaissé 100 % → il doit **30 % de commission** : suivie par prestataire, bouton « Commission reçue » pour l'admin. |
| **Règlement** | Le prestataire n'est crédité (70 %) / la commission n'est enregistrée que si la prestation est **terminée ET payée**, une seule fois. |
| **NFC réel** | Web NFC (Chrome Android) : programmation de la carte depuis l'app admin, code signé + **numéro de série de la puce** (anti-copie), scan prestataire réel. Voir `GUIDE_NFC.md`. |
| **Mot de passe** | « Mot de passe oublié » : code à 6 chiffres remis par l'admin (appel/WhatsApp), valable 30 min, 5 essais. Changement de mot de passe (route prête). |
| **Design** | Palette extraite du logo (bleu marine #072B57 → bleu signature #0B4A94 → bleu vif #1A78D4, gris #505050), appliquée à toute l'app via le thème ; polices **Plus Jakarta Sans** (texte) et **Outfit** (titres) ; fond, boutons, cartes et mode sombre harmonisés. |
| **Hébergement** | Guide `DEPLOIEMENT.md` (Railway + disque persistant + HTTPS). |

## 🆕 Version 1.2 — les 5 corrections avant le premier vrai test

| # | Constat | Correction |
|---|---|---|
| 1 | **Deux routes `/api/auth/login`** : la seconde (ancienne) connectait sans mot de passe. Express utilisait la première, donc pas exploitable, mais un simple réordonnancement l'aurait réactivée. | Seconde route **supprimée**. |
| 2 | Ancien portefeuille / recharge MoMo (simulateur USSD) encore présent. | Modale, formulaires et boutons de recharge **supprimés** côté client ; route `/api/momo-api/request-payment` désactivée (elle créditait des soldes fictifs) ; le solde disparaît de l'écran client (remplacé par les **points de fidélité**). |
| 3 | **500 000 FCFA fictifs** donnés à l'admin par la réinitialisation ; soldes de démonstration (550 000, 75 000…). | Tous les soldes repartent de **0**. |
| 4 | Alene expliquait encore la recharge de solde et le simulateur USSD. | Prompt, message d'accueil, question suggérée et fiche d'aide mis à jour : paiement Mobile Money (numéros officiels + identifiant de transaction) ou espèces. |
| 5 | L'IA de gestion des membres **exécutait directement** ses décisions (et ré-interrogeait le modèle à chaque clic, donc pouvait appliquer autre chose que ce que vous aviez vu). Elle pouvait aussi créditer de l'argent, et ses consignes pouvaient être détournées par un texte malveillant dans un nom ou un avis (injection de prompt). | L'IA **propose seulement**. Application via une route dédiée, **réservée au DG**, qui exige une confirmation explicite, revalide chaque action (liste blanche, cible client/prestataire uniquement, jamais admin/assistant/DG, points plafonnés à 500) et journalise. Le crédit d'argent par l'IA est **supprimé**. Le consigne système traite désormais les données utilisateurs comme des données, pas des ordres. |

## 🆕 Version 1.3 — refonte visuelle (couleurs, polices, navigation)

- **Navigation** : nouvelle barre d'onglets unique (`TabBar`). Sur téléphone : barre fixe **en bas de l'écran** (icône + libellé court, badge de missions), avec un menu « Plus » pour l'admin (8 sections). Sur ordinateur : onglets en pastilles dégradé bleu logo. Fini les libellés longs qui défilent.
- **Couleurs** : boutons, onglets actifs, panneaux sombres et bordures noires passent au bleu du logo (marine → bleu vif) ; les contours noirs épais et les ombres « brutalistes » sont remplacés par des ombres douces teintées de bleu ; mode sombre en bleu marine.
- **Polices** : Plus Jakarta Sans (texte) et Outfit (titres). Les capitales omniprésentes sont supprimées, le graissage excessif (« font-black » ×600) est ramené à une graisse moderne, et les textes microscopiques (6 à 10 px) sont agrandis (12 à 13,5 px). Les chiffres restent alignés.
- **Mobile** : champs plus grands (15 px), retour visuel au toucher, boutons flottants Paiements et Alene remontés pour ne pas masquer la barre du bas.

## 🆕 Version 1.4 — style « application mobile » sombre (d'après votre modèle)

- **Thème sombre par défaut** : fond bleu marine profond, cartes bleu nuit, texte clair, accents bleu logo + ambre (bouton de paiement), comme sur votre capture de référence. Le mode clair reste disponible (icône soleil/lune dans le menu).
- **En-tête compact** : menu, logo, « STUD'S Services · ● En ligne · Ebolowa », pastille de points (client) ou de solde (prestataire/admin) et avatar à initiales. Les boutons Stats / Installer / Thème passent dans le menu sur téléphone.
- **Bug du menu corrigé** : le menu latéral et les fenêtres s'affichaient « à l'intérieur » de l'en-tête (cause : effet de flou sur l'en-tête) ; elles couvrent maintenant tout l'écran.
- **Barre de navigation en bas** (Services, Commandes, Cadeaux, Profil, Démo) avec icônes et pastille active, au-dessus de tout le reste.
- **Accueil client** : le bloc de démonstration « Simuler le scan du code QR » est remplacé par une bannière « Trouvez votre prestataire en 1 clic » avec boutons *Voir les services* et *Mes paiements*.
- **Fenêtre d'installation** : boutons rouges remplacés par le bleu de la marque.

## 🆕 Version 1.5 — contrôle qualité d'une revue externe

| # | Constat (vérifié dans le code) | Correction |
|---|---|---|
| 4 | `icon-512.png` était en réalité un **JPEG** 1024×1024, déclaré « 144/192/512 px » dans le manifeste. | Vraies images PNG générées : 192, 512, 180 (iOS) et une icône **maskable** (logo réduit sur fond uni) ; manifeste, `index.html` et service worker mis à jour (cache renouvelé). |
| 5 | `npm run lint` impossible : `@types/react` et `@types/react-dom` absents de `package.json`. (J'avais attribué à tort ces erreurs à mon environnement : une partie venait bien du projet.) | Dépendances ajoutées. |
| 6 | Pas de fichier de verrouillage (`package-lock.json`). | **Non corrigé ici** : il ne peut être produit qu'avec un accès Internet (`npm install`). Voir ci-dessous. |
| 7 | Textes « Cloud Run » restants (messages d'erreur, confirmation de réinitialisation). | Remplacés par « serveur STUD'S » / « l'application ». |

**Lockfile** : sans lui, Railway installe les dernières versions compatibles à chaque déploiement ; un jour une mise à jour peut casser le build. Risque faible aujourd'hui, à traiter avant le lancement public : depuis un ordinateur (ou Termux), `npm install` puis envoyer le fichier `package-lock.json` créé dans GitHub.

## 🆕 Version 1.6 — mot de passe admin, tarifs/points modifiables, Alene, PWA

| Sujet | Constat | Correction |
|---|---|---|
| **Build v1.5 cassé** | Mon remplacement des textes « Cloud Run » avait mis une apostrophe dans une chaîne entre guillemets simples (`'…STUD'S…'`) : erreur de syntaxe dans `AppContext.tsx`, qui aurait fait échouer `npm run build`. | Corrigé. Toute la syntaxe du projet est revérifiée. |
| **Mot de passe admin** | Changer `ADMIN_PASSWORD` dans Railway n'avait aucun effet une fois le compte créé (le hash restait en base). | `ADMIN_PASSWORD` **fait autorité** : s'il change, le mot de passe du DG est remplacé au redémarrage. Pour garder un mot de passe changé depuis l'app, supprimez la variable. |
| **Tarifs** | Prix fixes (aucune interface). | Nouvel onglet **Tarifs & points** (bouton « 💳 Paiements & NFC » côté admin) : modifier le prix de chaque service, le masquer/réactiver, en ajouter un. Les commandes déjà passées gardent leur prix. Accès : DG, ou assistant ayant le module Finances. |
| **Points** | Bug de calcul : une prestation de 5 000 FCFA rapportait 500 points (= 2 500 FCFA, soit **50 %** de remise gratuite) au lieu de 10 %. | Formule corrigée : *récompense = taux % du prix, converti en points (1 point = X FCFA)* → 100 points (= 500 FCFA = 10 %). Taux, valeur du point et **multiplicateur NFC** (1,5 par défaut) réglables, avec exemple chiffré et alerte si la marge de STUD'S est menacée. |
| **Alene** | Plusieurs défauts : (1) l'historique commençait par un message « model » (le mot d'accueil), ce que l'API Gemini refuse → erreur systématique ; (2) tarifs, taux de points et numéros écrits en dur (donc faux dès qu'on les modifie) ; (3) section « recharge MoMo » obsolète ; (4) une seule tentative de modèle, erreurs brutes ; (5) aucun secours si la clé IA manque. | Historique nettoyé ; connaissances **construites en direct** depuis la base (services, prix, taux, numéros de paiement) ; modèles de repli (`GEMINI_MODEL`, `gemini-flash-latest`…) ; **réponses de secours sans IA** (prix, paiement, NFC, points, annulation, mot de passe) si la clé est absente ou le quota atteint ; limite de 20 messages / 10 min ; consignes anti-détournement. |
| **PWA (Railway)** | Plusieurs causes possibles, dont une icône mal formée dans les anciennes versions. | Icônes/manifeste corrigés (v1.5) ; icônes et manifeste n'ont plus un cache d'un an ; correction du service worker (clone de réponse) ; erreurs `/api` en JSON ; et un **diagnostic intégré** : menu ⋮ → Installer → « 🔎 Pourquoi je ne peux pas installer l'app ? » liste chaque contrôle (HTTPS, manifeste, icônes PNG, service worker). |

## 🆕 Version 1.7 — suites d'une revue externe (corrigé ET testé quand c'était possible)

| Point de la revue | Vérifié dans le code ? | Correction |
|---|---|---|
| Reconnaissance du super-admin différente côté interface et côté serveur | **Oui** : l'adresse du DG était écrite en dur à 3 endroits du client, alors que le serveur lit `MASTER_ADMIN_EMAIL` | Le serveur envoie `isMaster` ; le client n'utilise plus aucune adresse e-mail. Journaux du serveur : adresse issue de la configuration. |
| Erreurs de sauvegarde ignorées (A3) | **Oui** : `saveDb()` journalisait l'échec puis la route répondait « succès » | Un échec d'écriture interrompt la requête et renvoie une erreur claire (« votre action n'a PAS été prise en compte »). Un gestionnaire d'erreurs final évite toute fausse réussite. |
| Service worker : ancienne version affichée après mise à jour (A4) | **Oui** (risque réel pour les fichiers non hachés) | Identifiant de build injecté à chaque déploiement (ancien cache supprimé) ; fichiers `/assets/` en cache d'abord (noms hachés) ; icônes, manifeste et autres en réseau d'abord. |
| `ADMIN_PASSWORD` à clarifier | Comportement déjà corrigé en v1.6 | Documenté dans `.env.example` et `DEPLOIEMENT.md` (tableau des variables obligatoires/facultatives, `MASTER_ADMIN_EMAIL`, `DATA_DIR`). Avertissements au démarrage si `SESSION_SECRET`, `DATA_DIR` ou `ADMIN_PASSWORD` manquent en production. |
| Mot de passe de démonstration prérempli | **Oui** (`Demo@2026` en valeur par défaut, côté serveur et côté interface) | Plus aucune valeur par défaut : la démo exige `DEMO_PASSWORD` / `VITE_DEMO_PASSWORD` explicites ; jamais active en production par défaut. |
| Opérations financières comptabilisées deux fois | Logique déjà protégée (drapeau `settled`) | **Prouvé par des tests automatiques exécutés** (`npm test`, 11 tests verts) : règlement unique, commission espèces, attente de paiement Mobile Money, points et multiplicateur NFC, remises, jetons falsifiés, cartes NFC contrefaites. La logique financière est extraite dans `serverLogic.ts` pour être testable. |
| Liste de contrôle de validation (11 points) | — | `CHECKLIST_VALIDATION.md` à cocher sur le site en ligne. |
| `package-lock.json` | Oui, absent | **Toujours non corrigé** : impossible sans accès Internet (voir plus haut). |

**Ce qui a été exécuté ici** : `npm test` (11/11) et les vérifications de syntaxe TypeScript du serveur et de l'interface. **Non exécuté** (pas d'Internet) : `npm install`, `npm run build`, `npm run lint` complet, et tout essai dans un navigateur.

## 🚧 Reste à faire

- **Vérification SMS** à l'inscription et envoi automatique du code de réinitialisation : nécessite un fournisseur SMS payant (ex. Africa's Talking, Orange SMS API). Le code est prêt à l'accueillir ; en attendant, l'admin remet le code.
- **Paiement automatique** MTN MoMo / Orange Money : nécessite un contrat marchand + clés API (le jour où vous les avez, la confirmation manuelle sera remplacée par un webhook).
- **Opérateurs** : j'ai supposé 671… = MTN et 696… = Orange (préfixes camerounais). À confirmer.
- **Tests d'exécution** : l'environnement où j'ai travaillé n'avait pas Internet ; lancez `npm install && npm run lint && npm run dev` et testez les scénarios du guide NFC.
- Base JSON → PostgreSQL quand l'activité grandit.

## Mise en route

```bash
npm install
cp .env.example .env      # renseigner SESSION_SECRET, ADMIN_PASSWORD, GEMINI_API_KEY
npm run dev               # développement
npm run build && npm start  # production
npm run lint              # vérification de types (à lancer chez vous)
```
