// src/lib/api.ts
// Toutes les requêtes passent par apiFetch : le jeton de session signé par le serveur
// est joint automatiquement. (Les anciens en-têtes X-User-* falsifiables sont supprimés.)

const TOKEN_KEY = 'studs_token';

export function getToken(): string {
  try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
}
export function setToken(token: string) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch {}
}
export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('studs_current_user_id');
    localStorage.removeItem('studs_current_user_email');
    localStorage.removeItem('studs_current_user_role');
  } catch {}
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(input, { ...init, headers });
  // Session expirée ou révoquée : on nettoie, l'écran de connexion s'affichera.
  if (res.status === 401 && token) {
    clearSession();
    window.dispatchEvent(new Event('studs:session-expired'));
  }
  return res;
}
