import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../AppContext';
import { apiFetch } from '../lib/api';
import { readNfcTag, writeNfcTag, nfcSupported } from '../lib/nfc';

type Info = { mtn: string; orange: string; accountName: string };
type Tab = 'pay' | 'commissions' | 'cards' | 'passwords';

const money = (n: number) => `${(n || 0).toLocaleString('fr-FR')} FCFA`;

export const PaymentsCenter: React.FC = () => {
  const { currentUser, orders, cards, users, refreshState } = useApp();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('pay');
  const [info, setInfo] = useState<Info | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState('');
  const [form, setForm] = useState<Record<string, { operator: string; reference: string; phone: string }>>({});
  const [resets, setResets] = useState<any[]>([]);
  const [codes, setCodes] = useState<Record<string, string>>({});

  const role = currentUser?.role;
  const staff = role === 'admin' || role === 'supervisor';

  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener('studs:open-payments', h);
    return () => window.removeEventListener('studs:open-payments', h);
  }, []);

  useEffect(() => {
    if (!open || info) return;
    apiFetch('/api/payment-info').then(r => r.json()).then(setInfo).catch(() => {});
  }, [open, info]);

  useEffect(() => {
    if (open && staff && tab === 'passwords') {
      apiFetch('/api/admin/reset-requests').then(r => r.ok ? r.json() : []).then(setResets).catch(() => {});
    }
  }, [open, staff, tab]);

  const myOrders = useMemo(() => orders.filter(o => !(o as any).isOfflinePending), [orders]);

  const toPay = myOrders.filter(o => o.clientId === currentUser?.id && o.status !== 'cancelled' && (o.paymentStatus === 'pending' || o.paymentStatus === 'rejected' || o.paymentStatus === 'declared') && o.paymentMethod !== 'points');
  const cashToConfirm = myOrders.filter(o => o.providerId === currentUser?.id && o.paymentMethod === 'cash' && o.paymentStatus !== 'paid' && o.status !== 'cancelled');
  const declared = myOrders.filter(o => o.paymentStatus === 'declared' && o.status !== 'cancelled');
  const completedUnpaid = myOrders.filter(o => o.status === 'completed' && o.paymentStatus !== 'paid' && o.paymentStatus !== 'declared');
  const owing = users.filter(u => u.role === 'provider' && (u.commissionOwed || 0) > 0);

  const badge = staff ? declared.length : role === 'provider' ? cashToConfirm.length : toPay.filter(o => o.paymentStatus !== 'declared').length;

  if (!currentUser) return null;

  const call = async (key: string, url: string, body: any, okText?: string) => {
    setBusy(key);
    setMsg(null);
    try {
      const res = await apiFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      setMsg({ ok: res.ok && data.success !== false, text: data.message || (res.ok ? okText || 'Fait.' : 'Erreur.') });
      await refreshState();
      return data;
    } catch {
      setMsg({ ok: false, text: 'Serveur injoignable. Vérifiez votre connexion.' });
    } finally {
      setBusy('');
    }
  };

  const f = (id: string) => form[id] || { operator: 'mtn', reference: '', phone: '' };
  const setF = (id: string, patch: any) => setForm(prev => ({ ...prev, [id]: { ...f(id), ...patch } }));

  const card = 'bg-white dark:bg-[#111928] border border-slate-200 dark:border-slate-700 rounded-2xl p-3 space-y-2 text-xs';
  const btn = 'px-3 py-2 rounded-xl text-[11px] font-black uppercase cursor-pointer disabled:opacity-50';

  const NumberBox = ({ amount }: { amount: number }) => info ? (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-2.5 space-y-1">
      <p className="font-black text-blue-900 dark:text-blue-300">Envoyez {money(amount)} à {info.accountName} :</p>
      <p>🟡 <b>MTN MoMo</b> : <span className="font-mono font-black select-all">{info.mtn}</span></p>
      <p>🟠 <b>Orange Money</b> : <span className="font-mono font-black select-all">{info.orange}</span></p>
    </div>
  ) : null;

  const renderClient = () => (
    <div className="space-y-3">
      {toPay.length === 0 && <p className="text-slate-500 text-center py-6">Aucun paiement en attente. ✅</p>}
      {toPay.map(o => (
        <div key={o.id} className={card}>
          <div className="flex justify-between gap-2">
            <p className="font-black">{o.serviceTitle}</p>
            <p className="font-mono font-black text-blue-700">{money(o.servicePrice)}</p>
          </div>
          {o.paymentStatus === 'declared' ? (
            <p className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-2 font-bold">
              ⏳ Paiement déclaré ({o.paymentDeclaration?.operator === 'cash' ? 'espèces' : `${o.paymentDeclaration?.operator?.toUpperCase()} • ${o.paymentDeclaration?.reference}`}). En attente de confirmation.
            </p>
          ) : (
            <>
              {o.paymentStatus === 'rejected' && <p className="bg-rose-50 border border-rose-200 text-rose-900 rounded-lg p-2 font-bold">⚠️ {o.paymentRejectedReason || 'Paiement non retrouvé'}. Refaites votre déclaration.</p>}
              <div className="grid grid-cols-3 gap-1.5">
                {[['mtn', 'MTN'], ['orange', 'Orange'], ['cash', 'Espèces']].map(([v, l]) => (
                  <button key={v} onClick={() => setF(o.id, { operator: v })} className={`py-1.5 rounded-lg border-2 font-black ${f(o.id).operator === v ? 'border-slate-900 bg-blue-50 text-blue-900' : 'border-slate-200 text-slate-500'}`}>{l}</button>
                ))}
              </div>
              {f(o.id).operator !== 'cash' ? (
                <>
                  <NumberBox amount={o.servicePrice} />
                  <input value={f(o.id).reference} onChange={e => setF(o.id, { reference: e.target.value })} placeholder="Identifiant de transaction (reçu par SMS)" className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono uppercase bg-slate-50 dark:bg-[#0c1221]" />
                  <input value={f(o.id).phone} onChange={e => setF(o.id, { phone: e.target.value })} placeholder="Votre numéro Mobile Money (facultatif)" className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 dark:bg-[#0c1221]" />
                </>
              ) : (
                <p className="text-slate-600">Remettez {money(o.servicePrice)} au prestataire, puis cliquez ci-dessous. Il devra confirmer la réception.</p>
              )}
              <button disabled={busy === o.id} onClick={() => call(o.id, `/api/orders/${o.id}/declare-payment`, { operator: f(o.id).operator, reference: f(o.id).reference, payerPhone: f(o.id).phone })} className={`${btn} w-full bg-blue-600 text-white`}>
                {busy === o.id ? '…' : f(o.id).operator === 'cash' ? "J'ai payé en espèces" : "J'ai envoyé l'argent"}
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );

  const renderProvider = () => (
    <div className="space-y-3">
      {(currentUser.commissionOwed || 0) > 0 && info && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-amber-950 space-y-1">
          <p className="font-black">Commission à reverser à STUD'S : {money(currentUser.commissionOwed || 0)}</p>
          <p>30 % des prestations payées en espèces. MTN {info.mtn} • Orange {info.orange}</p>
        </div>
      )}
      {cashToConfirm.length === 0 && <p className="text-slate-500 text-center py-6">Aucun paiement en espèces à confirmer.</p>}
      {cashToConfirm.map(o => (
        <div key={o.id} className={card}>
          <div className="flex justify-between"><p className="font-black">{o.serviceTitle} — {o.clientName}</p><p className="font-mono font-black">{money(o.servicePrice)}</p></div>
          <p className={o.paymentStatus === 'declared' ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
            {o.paymentStatus === 'declared' ? '✅ Le client dit avoir payé en espèces.' : "Le client n'a pas encore déclaré son paiement."}
          </p>
          <button disabled={busy === o.id} onClick={() => call(o.id, `/api/orders/${o.id}/confirm-payment`, {}, 'Réception confirmée.')} className={`${btn} w-full bg-emerald-600 text-white`}>J'ai bien reçu les espèces</button>
        </div>
      ))}
    </div>
  );

  const renderStaffPay = () => (
    <div className="space-y-3">
      {declared.length === 0 && <p className="text-slate-500 text-center py-4">Aucun paiement déclaré à vérifier.</p>}
      {declared.map(o => (
        <div key={o.id} className={card}>
          <div className="flex justify-between"><p className="font-black">{o.clientName} — {o.serviceTitle}</p><p className="font-mono font-black">{money(o.servicePrice)}</p></div>
          <p className="font-bold">{o.paymentDeclaration?.operator === 'cash' ? '💵 Espèces' : `📱 ${o.paymentDeclaration?.operator?.toUpperCase()} • Réf. ${o.paymentDeclaration?.reference}`}{o.paymentDeclaration?.payerPhone ? ` • ${o.paymentDeclaration.payerPhone}` : ''}</p>
          <p className="text-slate-500">Vérifiez dans votre application MoMo / Orange Money que {money(o.servicePrice)} est bien arrivé avec cette référence.</p>
          <div className="grid grid-cols-2 gap-2">
            <button disabled={busy === o.id} onClick={() => call(o.id, `/api/orders/${o.id}/confirm-payment`, {}, 'Paiement confirmé.')} className={`${btn} bg-emerald-600 text-white`}>Reçu ✔</button>
            <button disabled={busy === o.id} onClick={() => { const reason = window.prompt('Motif du rejet ?', 'Paiement introuvable'); if (reason !== null) call(o.id, `/api/orders/${o.id}/reject-payment`, { reason }); }} className={`${btn} bg-rose-600 text-white`}>Introuvable ✖</button>
          </div>
        </div>
      ))}
      {completedUnpaid.length > 0 && (
        <div className="space-y-2">
          <p className="font-black uppercase text-[10px] text-slate-400">Terminées, aucun paiement déclaré</p>
          {completedUnpaid.map(o => <div key={o.id} className={card}><p className="font-bold">{o.clientName} — {o.serviceTitle} • {money(o.servicePrice)}</p></div>)}
        </div>
      )}
    </div>
  );

  const renderCommissions = () => (
    <div className="space-y-3">
      {owing.length === 0 && <p className="text-slate-500 text-center py-6">Aucune commission en attente. ✅</p>}
      {owing.map(u => (
        <div key={u.id} className={card}>
          <div className="flex justify-between"><p className="font-black">{u.firstName} {u.lastName}</p><p className="font-mono font-black text-amber-700">{money(u.commissionOwed || 0)}</p></div>
          <button disabled={busy === u.id} onClick={() => { if (window.confirm(`Confirmer la réception de ${money(u.commissionOwed || 0)} ?`)) call(u.id, '/api/admin/commission-settle', { providerId: u.id, amount: u.commissionOwed }, 'Commission enregistrée.'); }} className={`${btn} w-full bg-blue-600 text-white`}>Commission reçue</button>
        </div>
      ))}
    </div>
  );

  const renderCards = () => (
    <div className="space-y-3">
      <p className="text-slate-500">Programmez chaque carte avec le téléphone (Chrome Android, NFC activé). Cartes conseillées : NTAG213 / NTAG215.</p>
      {!nfcSupported() && <p className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-2 font-bold">NFC web indisponible sur cet appareil/navigateur (HTTPS + Chrome Android requis).</p>}
      <button disabled={busy === 'test'} onClick={async () => {
        setBusy('test'); setMsg({ ok: true, text: 'Approchez une carte…' });
        try { const t = await readNfcTag(); setMsg({ ok: true, text: `Série : ${t.serial || 'illisible'} • Contenu : ${t.text || '(vide)'}` }); }
        catch (e: any) { setMsg({ ok: false, text: e.message }); } finally { setBusy(''); }
      }} className={`${btn} w-full bg-brand-800 text-white`}>🔍 Tester la lecture d'une carte</button>
      {cards.length === 0 && <p className="text-slate-500 text-center py-4">Aucune carte émise. Émettez-en une depuis la liste des membres (« Lier NFC »).</p>}
      {cards.map((c: any) => (
        <div key={c.id} className={card}>
          <div className="flex justify-between items-center">
            <p className="font-black">{c.userName}</p>
            <span className={`px-2 py-0.5 rounded-full font-black text-[9px] ${c.tagSerial ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>{c.tagSerial ? 'Puce liée ✔' : 'Non programmée'}</span>
          </div>
          <p className="font-mono text-[10px] text-slate-500">UID {c.nfcUid}{c.tagSerial ? ` • Série ${c.tagSerial}` : ''}</p>
          <button disabled={busy === c.id || !nfcSupported()} onClick={async () => {
            setBusy(c.id); setMsg({ ok: true, text: 'Approchez la carte du dos du téléphone et ne bougez plus…' });
            try {
              const { serial } = await writeNfcTag(c.nfcCode);
              await call(c.id, `/api/cards/${c.id}/bind-tag`, { serial }, 'Carte programmée et sécurisée.');
            } catch (e: any) { setMsg({ ok: false, text: e.message }); } finally { setBusy(''); }
          }} className={`${btn} w-full bg-blue-600 text-white`}>{c.tagSerial ? 'Reprogrammer la carte' : 'Programmer la carte'}</button>
        </div>
      ))}
    </div>
  );

  const renderPasswords = () => (
    <div className="space-y-3">
      {resets.length === 0 && <p className="text-slate-500 text-center py-6">Aucune demande de réinitialisation.</p>}
      {resets.map(r => (
        <div key={r.id} className={card}>
          <p className="font-black">{r.userName} • {r.phone}</p>
          {codes[r.id] ? (
            <p className="bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-center">Code : <b className="font-mono text-lg select-all">{codes[r.id]}</b><br /><span className="text-[10px]">À communiquer par appel/WhatsApp. Valable 30 min.</span></p>
          ) : (
            <button disabled={busy === r.id} onClick={async () => { const d = await call(r.id, '/api/admin/reset-code', { requestId: r.id }); if (d?.code) setCodes(p => ({ ...p, [r.id]: d.code })); }} className={`${btn} w-full bg-blue-600 text-white`}>Générer un code</button>
          )}
        </div>
      ))}
    </div>
  );

  const tabs: [Tab, string][] = staff ? [['pay', `Paiements${declared.length ? ` (${declared.length})` : ''}`], ['commissions', 'Commissions'], ['cards', 'Cartes NFC'], ['passwords', 'Accès']] : [];

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-20 md:bottom-4 left-3 z-30 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase rounded-full shadow-lg px-4 py-3 flex items-center gap-2 cursor-pointer">
        💳 {staff ? 'Paiements & NFC' : 'Paiements'}
        {badge > 0 && <span className="bg-rose-500 text-white rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-[10px]">{badge}</span>}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full sm:max-w-lg max-h-[88vh] overflow-y-auto bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-slate-100 rounded-t-3xl sm:rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black uppercase text-sm">{staff ? 'Paiements & NFC' : 'Mes paiements'}</h3>
              <button onClick={() => setOpen(false)} className="text-slate-500 font-black px-2 cursor-pointer">✕</button>
            </div>
            {staff && (
              <div className="grid grid-cols-4 gap-1">
                {tabs.map(([k, l]) => <button key={k} onClick={() => { setTab(k); setMsg(null); }} className={`py-1.5 rounded-lg text-[10px] font-black ${tab === k ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-700'}`}>{l}</button>)}
              </div>
            )}
            {msg && <p className={`rounded-xl p-2.5 text-xs font-bold ${msg.ok ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'}`}>{msg.text}</p>}
            {staff ? (tab === 'pay' ? renderStaffPay() : tab === 'commissions' ? renderCommissions() : tab === 'cards' ? renderCards() : renderPasswords())
              : role === 'provider' ? renderProvider() : renderClient()}
          </div>
        </div>
      )}
    </>
  );
};
