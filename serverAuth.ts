import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Authentification STUD'S — sans dépendance externe (crypto natif Node).
 * - Mots de passe : scrypt + sel aléatoire par utilisateur.
 * - Sessions : jeton signé HMAC-SHA256 (userId.expiration.signature).
 */

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 jours

function loadSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16) {
    return process.env.SESSION_SECRET;
  }
  // Repli : secret généré une fois et conservé sur disque (jamais dans database.json ni dans le ZIP).
  const file = path.join(process.cwd(), '.session_secret');
  try {
    if (fs.existsSync(file)) {
      const existing = fs.readFileSync(file, 'utf-8').trim();
      if (existing.length >= 32) return existing;
    }
    const generated = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(file, generated, { encoding: 'utf-8', mode: 0o600 });
    console.warn("[SÉCURITÉ] SESSION_SECRET absent : un secret local a été généré dans .session_secret. Définissez SESSION_SECRET en production.");
    return generated;
  } catch {
    console.warn('[SÉCURITÉ] Impossible de persister le secret de session : secret temporaire (les sessions expireront au redémarrage).');
    return crypto.randomBytes(48).toString('hex');
  }
}

const SECRET = loadSecret();

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored?: string): boolean {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  try {
    const candidate = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return expected.length === candidate.length && crypto.timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

function sign(data: string): string {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
}

export function createToken(userId: string): string {
  const exp = Date.now() + TOKEN_TTL_MS;
  const body = `${userId}.${exp}`;
  return `${Buffer.from(body).toString('base64url')}.${sign(body)}`;
}

export function verifyToken(token?: string): { userId: string } | null {
  if (!token) return null;
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return null;
  let body = '';
  try {
    body = Buffer.from(b64, 'base64url').toString('utf-8');
  } catch {
    return null;
  }
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const lastDot = body.lastIndexOf('.');
  const userId = body.slice(0, lastDot);
  const exp = Number(body.slice(lastDot + 1));
  if (!userId || !Number.isFinite(exp) || Date.now() > exp) return null;
  return { userId };
}

/** Retire tout champ sensible avant d'envoyer un utilisateur au navigateur. */
export function publicUser(u: any) {
  if (!u) return u;
  const { passwordHash, ...rest } = u;
  return rest;
}

/** Version minimale (annuaire) visible par les non-administrateurs. */
export function directoryUser(u: any) {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    avatar: u.avatar,
    role: u.role,
    status: u.status,
    isApproved: u.isApproved,
    grade: u.grade,
    availabilities: u.availabilities,
    loyaltyPoints: 0,
    balance: 0,
    email: '',
    phone: '',
    createdAt: u.createdAt,
  };
}

export function isValidPassword(p: unknown): p is string {
  return typeof p === 'string' && p.length >= 8 && p.length <= 128;
}

/** Signature d'une carte NFC : empêche de fabriquer un code valide sans le secret serveur. */
export function signCard(nfcUid: string): string {
  return crypto.createHmac('sha256', SECRET).update(`card:${nfcUid}`).digest('hex').slice(0, 12).toUpperCase();
}
export function cardCode(nfcUid: string): string {
  return `STUDS-${nfcUid}-${signCard(nfcUid)}`;
}
/** Retourne l'UID si le code est authentique, sinon null. */
export function parseCardCode(code: string): string | null {
  const m = /^STUDS-([0-9A-F]{8})-([0-9A-F]{12})$/i.exec((code || '').trim());
  if (!m) return null;
  const uid = m[1].toUpperCase();
  const a = Buffer.from(signCard(uid));
  const b = Buffer.from(m[2].toUpperCase());
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? uid : null;
}
export function normalizeSerial(s: unknown): string {
  return String(s || '').replace(/[^0-9a-f]/gi, '').toUpperCase();
}
export function hashCode(code: string): string {
  return crypto.createHmac('sha256', SECRET).update(`reset:${code}`).digest('hex');
}
