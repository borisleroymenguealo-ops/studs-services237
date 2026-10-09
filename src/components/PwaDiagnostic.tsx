import React, { useState } from 'react';

type Check = { label: string; ok: boolean; detail: string };

async function runChecks(): Promise<Check[]> {
  const out: Check[] = [];
  const add = (label: string, ok: boolean, detail: string) => out.push({ label, ok, detail });

  add('Connexion sécurisée (HTTPS)', location.protocol === 'https:' || location.hostname === 'localhost', location.protocol);
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  add("App ouverte en mode installé", standalone, standalone ? "Vous utilisez déjà l'app installée" : 'Vous êtes dans le navigateur');

  // Manifeste
  let manifest: any = null;
  try {
    const href = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')?.href || '/manifest.json';
    const r = await fetch(href, { cache: 'no-store' });
    const ct = r.headers.get('content-type') || '';
    manifest = await r.json();
    add('Manifeste lisible', r.ok && /json/.test(ct), `${r.status} • ${ct}`);
  } catch (e: any) {
    add('Manifeste lisible', false, e?.message || 'introuvable ou invalide (la page HTML a peut-être été renvoyée)');
  }
  if (manifest) {
    add('Nom, start_url, mode « standalone »', !!(manifest.name && manifest.start_url && ['standalone', 'fullscreen', 'minimal-ui'].includes(manifest.display)), `${manifest.name} • ${manifest.start_url} • ${manifest.display}`);
    for (const ic of manifest.icons || []) {
      try {
        const r = await fetch(ic.src, { cache: 'no-store' });
        const buf = new Uint8Array(await r.arrayBuffer());
        const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
        const bmp = await createImageBitmap(new Blob([buf]));
        const [w] = String(ic.sizes).split('x').map(Number);
        const okSize = bmp.width >= w;
        add(`Icône ${ic.sizes} (${ic.purpose || 'any'})`, r.ok && isPng && okSize, `${r.status} • ${isPng ? 'PNG' : 'PAS un PNG'} • ${bmp.width}×${bmp.height}`);
      } catch (e: any) {
        add(`Icône ${ic.sizes}`, false, e?.message || 'illisible');
      }
    }
    const sizes = (manifest.icons || []).map((i: any) => String(i.sizes));
    add('Icônes 192 et 512 déclarées', sizes.includes('192x192') && sizes.includes('512x512'), sizes.join(', '));
  }

  // Service worker
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    add('Service worker actif', !!reg?.active, reg?.active ? `état : ${reg.active.state}` : reg ? 'installé mais pas encore actif' : 'non enregistré');
  } catch (e: any) {
    add('Service worker actif', false, e?.message || 'indisponible');
  }
  add("Chrome propose l'installation", !!(window as any).deferredPwaPrompt, (window as any).deferredPwaPrompt ? 'oui' : "pas encore (voir conseils)");
  return out;
}

export const PwaDiagnostic: React.FC = () => {
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [busy, setBusy] = useState(false);
  const failed = checks?.filter(c => !c.ok && c.label !== "App ouverte en mode installé") || [];

  return (
    <div className="rounded-2xl border border-slate-200 p-3 space-y-2 text-xs">
      <button type="button" disabled={busy} onClick={async () => { setBusy(true); setChecks(await runChecks()); setBusy(false); }} className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-bold cursor-pointer disabled:opacity-60">
        {busy ? 'Analyse…' : "🔎 Pourquoi je ne peux pas installer l'app ?"}
      </button>
      {checks && (
        <ul className="space-y-1.5">
          {checks.map((c, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span>{c.ok ? '✅' : '❌'}</span>
              <span><b>{c.label}</b><br /><span className="opacity-70 break-all">{c.detail}</span></span>
            </li>
          ))}
        </ul>
      )}
      {checks && failed.length === 0 && (
        <p className="font-bold">Tout est conforme. Si le bouton d'installation n'apparaît pas : menu ⋮ de Chrome → « Installer l'application » ou « Ajouter à l'écran d'accueil ». Si l'app est déjà installée pour ce site, désinstallez-la d'abord. Si vous avez refusé l'installation plusieurs fois, Chrome attend quelques jours : effacez les données du site (Chrome → ⓘ à gauche de l'adresse → Paramètres du site → Effacer).</p>
      )}
      {checks && failed.length > 0 && (
        <p className="font-bold text-rose-700">Corrigez les points ❌ ci-dessus (envoyez-moi une capture de cette liste) puis rechargez la page.</p>
      )}
    </div>
  );
};
