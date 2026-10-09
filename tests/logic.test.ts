// Tests de la logique financière et de sécurité — lancer avec : npm test
import test from 'node:test';
import assert from 'node:assert/strict';

process.env.SESSION_SECRET = 'test-secret-0123456789-abcdefghij';
const { computePrice, settleOrder, finalizeOrder } = await import('../serverLogic');
const auth = await import('../serverAuth');

function makeDb(over: any = {}) {
  return {
    users: [
      { id: 'c1', role: 'client', loyaltyPoints: 0, balance: 0 },
      { id: 'p1', role: 'provider', loyaltyPoints: 0, balance: 0, commissionOwed: 0 },
    ],
    cards: [{ id: 'card1', userId: 'c1', loyaltyPoints: 0 }],
    notifications: [] as any[],
    loyaltyPointsRate: 10,
    loyaltyPointValue: 5,
    nfcPointsMultiplier: 1.5,
    ...over,
  };
}
function makeOrder(over: any = {}) {
  return { id: 'o1', clientId: 'c1', providerId: 'p1', serviceTitle: 'Test', servicePrice: 5000, status: 'in_progress', paymentMethod: 'momo', paymentStatus: 'pending', ...over };
}
const user = (db: any, id: string) => db.users.find((u: any) => u.id === id);

test('prix : remises appliquées côté serveur', () => {
  assert.equal(computePrice(5000, 'one_off', false), 5000);
  assert.equal(computePrice(5000, 'weekly', false), 4750);
  assert.equal(computePrice(5000, 'monthly', false), 4400);
  assert.equal(computePrice(5000, 'one_off', true), 4500);
});

test('Mobile Money : pas de paiement au prestataire tant que le client n\'a pas payé', () => {
  const db = makeDb(); const o = makeOrder();
  const r = finalizeOrder(db, o, { byManual: true });
  assert.equal(r.awaitingPayment, true);
  assert.equal(user(db, 'p1').balance, 0);
  assert.equal(user(db, 'c1').loyaltyPoints, 0);
});

test('Mobile Money : règlement après confirmation, une seule fois (70 % prestataire)', () => {
  const db = makeDb(); const o = makeOrder();
  finalizeOrder(db, o, { byManual: true });
  o.paymentStatus = 'paid';
  assert.equal(settleOrder(db, o).settled, true);
  assert.equal(user(db, 'p1').balance, 3500);
  assert.equal(user(db, 'c1').loyaltyPoints, 100); // 5000 × 10 % ÷ 5 FCFA/point
  // rejouer ne doit RIEN changer
  assert.equal(settleOrder(db, o).settled, false);
  assert.equal(settleOrder(db, o).settled, false);
  finalizeOrder(db, o, { byNfc: true });
  assert.equal(user(db, 'p1').balance, 3500);
  assert.equal(user(db, 'c1').loyaltyPoints, 100);
});

test('NFC : multiplicateur configurable sur les points', () => {
  const db = makeDb(); const o = makeOrder({ paymentStatus: 'paid' });
  finalizeOrder(db, o, { byNfc: true });
  assert.equal(user(db, 'c1').loyaltyPoints, 150); // 100 × 1,5
  assert.equal(user(db, 'p1').balance, 3500);
});

test('Espèces : le prestataire doit 30 % à STUD\'S, aucun crédit de solde', () => {
  const db = makeDb(); const o = makeOrder({ paymentMethod: 'cash', paymentStatus: 'paid' });
  finalizeOrder(db, o, { byManual: true });
  assert.equal(user(db, 'p1').balance, 0);
  assert.equal(user(db, 'p1').commissionOwed, 1500);
  finalizeOrder(db, o, { byManual: true });
  assert.equal(user(db, 'p1').commissionOwed, 1500);
});

test('Paiement par points : pas de points gagnés', () => {
  const db = makeDb(); const o = makeOrder({ paymentMethod: 'points', paymentStatus: 'paid' });
  finalizeOrder(db, o, { byManual: true });
  assert.equal(user(db, 'c1').loyaltyPoints, 0);
  assert.equal(user(db, 'p1').balance, 3500);
});

test('Réglages de points modifiables par l\'admin (taux et valeur du point)', () => {
  const db = makeDb({ loyaltyPointsRate: 5, loyaltyPointValue: 10 }); const o = makeOrder({ paymentStatus: 'paid' });
  finalizeOrder(db, o, { byManual: true });
  assert.equal(user(db, 'c1').loyaltyPoints, 25); // 5000 × 5 % ÷ 10
});

test('Commande annulée ou non terminée : aucun règlement', () => {
  const db = makeDb(); const o = makeOrder({ status: 'assigned', paymentStatus: 'paid' });
  assert.equal(settleOrder(db, o).settled, false);
  assert.equal(user(db, 'p1').balance, 0);
});

test('Mots de passe : hash vérifiable, mauvais mot de passe refusé', () => {
  const h = auth.hashPassword('Secret123');
  assert.equal(auth.verifyPassword('Secret123', h), true);
  assert.equal(auth.verifyPassword('secret123', h), false);
  assert.equal(auth.verifyPassword('x', undefined), false);
});

test('Jetons de session : falsification refusée', () => {
  const t = auth.createToken('usr-1');
  assert.deepEqual(auth.verifyToken(t), { userId: 'usr-1' });
  assert.equal(auth.verifyToken(t.slice(0, -2) + 'xx'), null);
  assert.equal(auth.verifyToken('usr-admin'), null);
  assert.equal(auth.verifyToken(undefined), null);
});

test('Cartes NFC : code signé authentique, faux code refusé', () => {
  const code = auth.cardCode('A1B2C3D4');
  assert.equal(auth.parseCardCode(code), 'A1B2C3D4');
  assert.equal(auth.parseCardCode('STUDS-A1B2C3D4-000000000000'), null);
  assert.equal(auth.parseCardCode('A1B2C3D4'), null);
  assert.equal(auth.normalizeSerial('04:A1:b2:C3'), '04A1B2C3');
});
