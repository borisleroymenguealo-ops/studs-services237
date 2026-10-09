import crypto from 'crypto';

/**
 * Logique métier STUD'S (prix, règlement, points) — fonctions pures sur l'objet « db »,
 * sans dépendance à Express, donc testables (voir tests/logic.test.ts).
 */

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
}

/** Prix calculé côté serveur : catalogue + remises (abonnement, carte NFC). */
export function computePrice(basePrice: number, billingFrequency: string, hasNfcCard: boolean) {
  let price = Number(basePrice) || 0;
  if (billingFrequency === 'weekly') price = Math.round(price * 0.95);
  else if (billingFrequency === 'monthly') price = Math.round(price * 0.88);
  if (hasNfcCard) price = Math.round(price * 0.9);
  return price;
}

// ---------------------------------------------------------------------------
// LOGIQUE MÉTIER PARTAGÉE
// ---------------------------------------------------------------------------
export const PROVIDER_SHARE = 0.7; // 70% prestataire / 30% STUD'S (cf. business plan §XI)

export function pushNotif(db: any, userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') {
  db.notifications.push({ id: uid('notif'), userId, title, message, type, isRead: false, createdAt: new Date().toISOString() });
}

/**
 * Règlement financier d'une commande — exécuté UNE SEULE FOIS, quand la prestation est
 * terminée ET que le paiement du client est confirmé.
 *  - Mobile Money / points : le prestataire est crédité de 70 %.
 *  - Espèces : le prestataire a déjà encaissé 100 % → il doit 30 % à STUD'S (commissionOwed).
 */
export function settleOrder(db: any, order: any) {
  if (order.settled) return { settled: false, earnedPoints: 0, providerPay: 0 };
  if (order.status !== 'completed' || order.paymentStatus !== 'paid') return { settled: false, earnedPoints: 0, providerPay: 0 };

  const price = Number(order.servicePrice) || 0;
  const providerPay = Math.round(price * PROVIDER_SHARE);
  const commission = price - providerPay;
  const isCash = order.paymentMethod === 'cash';
  const paidByPoints = order.paymentMethod === 'points';
  const multiplier = order.validatedByNfc ? (Number(db.nfcPointsMultiplier) || 1) : 1;
  // Récompense = rate % du prix, convertie en points (1 point = loyaltyPointValue FCFA)
  const rewardFcfa = (price * (Number(db.loyaltyPointsRate) || 0) * multiplier) / 100;
  const earnedPoints = paidByPoints ? 0 : Math.round(rewardFcfa / (Number(db.loyaltyPointValue) || 5));

  db.users = db.users.map((u: any) => {
    if (u.id === order.clientId) return { ...u, loyaltyPoints: (u.loyaltyPoints || 0) + earnedPoints };
    if (u.id === order.providerId) {
      return isCash
        ? { ...u, commissionOwed: (u.commissionOwed || 0) + commission }
        : { ...u, balance: (u.balance || 0) + providerPay };
    }
    return u;
  });
  if (earnedPoints > 0) {
    db.cards = db.cards.map((c: any) => (c.userId === order.clientId ? { ...c, loyaltyPoints: (c.loyaltyPoints || 0) + earnedPoints } : c));
  }
  order.settled = true;

  if (order.providerId) {
    pushNotif(
      db, order.providerId, 'Prestation réglée 💸',
      isCash
        ? `"${order.serviceTitle}" : espèces encaissées. Commission STUD'S à reverser : ${commission} FCFA.`
        : `"${order.serviceTitle}" : +${providerPay} FCFA crédités sur votre solde.`,
      'success'
    );
  }
  if (earnedPoints > 0) pushNotif(db, order.clientId, 'Points de fidélité 🌟', `+${earnedPoints} points pour "${order.serviceTitle}".`, 'success');
  return { settled: true, earnedPoints, providerPay: isCash ? 0 : providerPay };
}

/** Marque la prestation comme terminée, puis tente le règlement (idempotent). */
export function finalizeOrder(db: any, order: any, opts: { byNfc?: boolean; byManual?: boolean }) {
  if (order.status === 'completed') {
    return { alreadyDone: true, earnedPoints: 0, providerPay: 0, awaitingPayment: false };
  }
  order.status = 'completed';
  order.validatedByNfc = !!opts.byNfc || !!order.validatedByNfc;
  order.validatedManually = !!opts.byManual || !!order.validatedManually;
  order.updatedAt = new Date().toISOString();
  pushNotif(db, order.clientId, 'Service terminé 🌟', `Votre prestation "${order.serviceTitle}" est terminée.`, 'success');
  const r = settleOrder(db, order);
  const awaitingPayment = order.paymentStatus !== 'paid';
  if (awaitingPayment) {
    pushNotif(db, order.clientId, 'Paiement à confirmer 💳', `Merci de déclarer votre paiement pour "${order.serviceTitle}" (${order.servicePrice} FCFA).`, 'warning');
    pushNotif(db, 'usr-admin', 'Prestation terminée, paiement non confirmé', `"${order.serviceTitle}" de ${order.clientName} (${order.servicePrice} FCFA).`, 'warning');
  }
  return { alreadyDone: false, earnedPoints: r.earnedPoints, providerPay: r.providerPay, awaitingPayment };
}

