// Lecture / écriture NFC réelle via Web NFC (Chrome pour Android, HTTPS obligatoire).
// Étiquettes recommandées : NTAG213 / NTAG215 (cartes PVC ou stickers).

export function nfcSupported(): boolean {
  return typeof window !== 'undefined' && 'NDEFReader' in window && window.isSecureContext;
}

function explain(e: any): Error {
  const name = e?.name || '';
  if (name === 'NotAllowedError') return new Error("Autorisation NFC refusée. Autorisez le NFC pour ce site dans Chrome.");
  if (name === 'NotSupportedError') return new Error("NFC indisponible ou désactivé sur ce téléphone (Paramètres > NFC).");
  if (name === 'AbortError') return new Error('Lecture annulée.');
  return new Error(e?.message || 'Erreur NFC.');
}

/** Attend qu'une carte soit approchée du téléphone et renvoie son contenu texte + numéro de série. */
export async function readNfcTag(timeoutMs = 25000): Promise<{ text: string; serial: string }> {
  if (!nfcSupported()) throw new Error("Le NFC web n'est pas disponible ici. Utilisez Chrome sur Android, en HTTPS.");
  const reader = new (window as any).NDEFReader();
  const ctrl = new AbortController();
  try {
    await reader.scan({ signal: ctrl.signal });
  } catch (e) {
    throw explain(e);
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ctrl.abort();
      reject(new Error("Aucune carte détectée. Approchez la carte du dos du téléphone puis réessayez."));
    }, timeoutMs);
    reader.onreadingerror = () => {
      clearTimeout(timer);
      ctrl.abort();
      reject(new Error('Carte illisible. Repositionnez la carte et réessayez.'));
    };
    reader.onreading = (ev: any) => {
      clearTimeout(timer);
      ctrl.abort();
      let text = '';
      for (const rec of ev.message?.records || []) {
        if (rec.recordType === 'text') {
          text = new TextDecoder(rec.encoding || 'utf-8').decode(rec.data);
          break;
        }
      }
      resolve({ text: text.trim(), serial: ev.serialNumber || '' });
    };
  });
}

/** Écrit le code STUD'S sur la carte et renvoie le numéro de série de la puce. */
export async function writeNfcTag(text: string, timeoutMs = 25000): Promise<{ serial: string }> {
  if (!nfcSupported()) throw new Error("Le NFC web n'est pas disponible ici. Utilisez Chrome sur Android, en HTTPS.");
  const reader = new (window as any).NDEFReader();
  const ctrl = new AbortController();
  try {
    await reader.scan({ signal: ctrl.signal });
  } catch (e) {
    throw explain(e);
  }
  // 1) on attend la détection de la puce (pour obtenir son numéro de série)
  const serial: string = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ctrl.abort();
      reject(new Error('Aucune carte détectée.'));
    }, timeoutMs);
    reader.onreading = (ev: any) => {
      clearTimeout(timer);
      resolve(ev.serialNumber || '');
    };
    reader.onreadingerror = () => {
      clearTimeout(timer);
      ctrl.abort();
      reject(new Error('Carte illisible.'));
    };
  });
  // 2) on écrit pendant que la carte est encore près du téléphone
  try {
    await reader.write({ records: [{ recordType: 'text', data: text }] }, { overwrite: true });
  } catch (e) {
    throw explain(e);
  } finally {
    ctrl.abort();
  }
  if (!serial) throw new Error("Numéro de série illisible : cette carte ne peut pas être sécurisée.");
  return { serial };
}
