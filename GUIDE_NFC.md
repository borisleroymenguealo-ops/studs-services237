# Guide NFC — tester une vraie carte STUD'S

## Ce qu'il vous faut
- 2 à 5 cartes ou stickers **NTAG213 ou NTAG215** (≈ 300–500 FCFA l'unité en ligne ; modèle « blanc PVC » pour carte, « sticker » pour test).
- Un téléphone **Android avec NFC** + **Chrome** (le NFC web ne fonctionne pas sur iPhone/Safari).
- L'app en **HTTPS** (automatique une fois hébergée, voir DEPLOIEMENT.md). `http://localhost` marche aussi pour les tests sur ordinateur, mais le NFC se teste sur le téléphone, donc il faut l'hébergement.
- NFC activé : Paramètres > Connexions > NFC.

## Étape 1 — Créer la carte d'un client
1. Créez un compte client (ex. « Client Test ») depuis l'écran d'inscription.
2. Connectez-vous en **admin** > liste des membres > bouton **« Lier NFC »** sur ce client. Une carte (identifiant `nfcUid`) est créée côté serveur.

## Étape 2 — Programmer la puce (une seule fois par carte)
1. Admin, sur le téléphone Android : bouton bleu **« 💳 Paiements & NFC »** > onglet **Cartes NFC**.
2. Sur la ligne du client : **« Programmer la carte »**, puis posez la carte au dos du téléphone **sans bouger** jusqu'au message vert.
3. Ce que fait le système : il écrit sur la puce un code signé `STUDS-XXXXXXXX-YYYYYYYYYYYY` et enregistre le **numéro de série physique** de la puce → statut **« Puce liée ✔ »**.
4. Bouton **« Tester la lecture »** : approchez la carte, vous voyez série + contenu.

## Étape 3 — Vérifier une prestation (scénario complet)
1. Client Test : réserve un service, choisit un prestataire.
2. Admin affecte un prestataire (ou le prestataire accepte la mission).
3. Prestataire : sur la mission, **« Scanner la carte NFC du client »** > scan n°1 → *Début du service*.
4. En fin de service : scan n°2 → *Fin validée* ; le règlement se déclenche (voir ci-dessous).

## Ce que le serveur vérifie réellement
| Contrôle | Résultat si échec |
|---|---|
| Signature du code (impossible à fabriquer sans le secret serveur) | « Carte non authentique » |
| Numéro de série de la puce = celui enregistré | « Copie suspectée » |
| La carte appartient bien au client de la commande | Refusé |
| Seul le prestataire de la mission scanne | Refusé aux autres |
| Un scan sur une commande déjà terminée | Refusé (pas de double paiement) |

> Limite honnête : un téléphone peut lire le contenu d'une carte, mais ne peut pas en copier le numéro de série sur une puce standard : c'est ce qui rend la copie détectable. Pour une sécurité maximale plus tard, il existe des puces à authentification (NTAG 424 DNA) ; dites-le-moi si le projet grandit.

## En cas de problème
- « NFC web indisponible » : utilisez Chrome sur Android, site en HTTPS, NFC activé.
- « Carte illisible » : retirez la coque métallique, centrez la carte sur la zone NFC (souvent près de l'appareil photo).
- Carte à reprogrammer : même bouton, le nouveau numéro de série remplace l'ancien.
