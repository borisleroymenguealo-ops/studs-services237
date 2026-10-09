# Liste de contrôle avant ouverture au public

Cochez chaque point après l'avoir **réellement essayé** sur le site en ligne.

**Technique**
- [ ] Le déploiement Railway est « Success » (onglet Deployments).
- [ ] Variables obligatoires renseignées (voir DEPLOIEMENT.md) et volume `/data` monté.
- [ ] (Sur ordinateur) `npm test` : 11 tests verts. `npm run lint` : noter les erreurs éventuelles et me les envoyer.

**Comptes**
- [ ] Connexion DG (borisleroymenguealo@gmail.com + ADMIN_PASSWORD) : l'onglet « Équipe » est visible.
- [ ] Inscription et connexion d'un client test ; d'un prestataire test (approuvé ensuite par l'admin).
- [ ] « Mot de passe oublié » : code généré par l'admin, nouveau mot de passe accepté.
- [ ] Aucun bouton de connexion démo n'apparaît.

**Commandes et argent**
- [ ] Le client réserve ; la commande apparaît chez l'admin ; le prestataire est affecté.
- [ ] Paiement Mobile Money : déclaration par le client → confirmation « Reçu ✔ » par l'admin.
- [ ] Paiement espèces : déclaration client → confirmation prestataire → commission due visible chez l'admin → « Commission reçue ».
- [ ] Fin de service validée par le client : le solde du prestataire n'augmente **qu'une fois** (rejouer le scan ou le clic ne crédite rien).
- [ ] Les points gagnés correspondent à l'exemple affiché dans « Tarifs & points ».

**Réglages**
- [ ] Modifier un prix dans « Tarifs & points » : une nouvelle commande utilise le nouveau prix, l'ancienne garde le sien.
- [ ] Masquer un service : il disparaît du catalogue client.

**NFC**
- [ ] Carte programmée (« Puce liée ✔ ») ; scan début puis fin sur une vraie commande ; une carte copiée/vierge est refusée.

**Persistance et installation**
- [ ] Redéployer l'application (ou « Restart » dans Railway) : les comptes et commandes sont toujours là.
- [ ] Installation PWA depuis Chrome ; après un nouveau déploiement, l'app installée affiche la nouvelle version.
- [ ] Alene répond (avec ou sans clé IA) et cite les bons prix.
