import React, { useState } from 'react';

// Récupération de mot de passe : l'utilisateur demande un code, l'administration STUD'S le lui
// remet (appel / WhatsApp), puis il choisit un nouveau mot de passe.
export const ForgotPassword: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [id, setId] = useState('');
  const [code, setCode] = useState('');
  const [pwd, setPwd] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const post = async (url: string, body: any) => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      setMsg({ ok: res.ok && data.success !== false, text: data.message || 'Erreur.' });
      return res.ok && data.success !== false;
    } catch {
      setMsg({ ok: false, text: 'Serveur injoignable.' });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const input = 'w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0c1221] border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500';
  const btn = 'w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-xs uppercase rounded-xl cursor-pointer';

  return (
    <div className="space-y-3 text-left">
      <p className="text-[11px] font-black uppercase text-slate-500">Mot de passe oublié</p>
      <input className={input} placeholder="Votre e-mail ou téléphone" value={id} onChange={e => setId(e.target.value)} />
      {step === 1 ? (
        <button disabled={busy || !id.trim()} className={btn} onClick={async () => { if (await post('/api/auth/forgot', { emailOrPhone: id })) setStep(2); }}>
          Demander un code
        </button>
      ) : (
        <>
          <p className="text-[10px] text-slate-500">Contactez l'équipe STUD'S (WhatsApp / appel) pour recevoir votre code à 6 chiffres, puis saisissez-le ici.</p>
          <input className={input} placeholder="Code à 6 chiffres" inputMode="numeric" value={code} onChange={e => setCode(e.target.value)} />
          <input className={input} type="password" placeholder="Nouveau mot de passe (8 caractères min.)" value={pwd} onChange={e => setPwd(e.target.value)} />
          <button disabled={busy || !code || pwd.length < 8} className={btn} onClick={async () => { if (await post('/api/auth/reset', { emailOrPhone: id, code, newPassword: pwd })) setTimeout(onDone, 1500); }}>
            Changer mon mot de passe
          </button>
        </>
      )}
      {msg && <p className={`text-[11px] font-bold rounded-lg p-2 ${msg.ok ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>{msg.text}</p>}
      <button type="button" onClick={onDone} className="w-full text-[11px] font-bold text-slate-500 underline cursor-pointer">Retour à la connexion</button>
    </div>
  );
};
