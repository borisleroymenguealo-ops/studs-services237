import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { apiFetch as fetch } from '../lib/api';
import { 
  Wifi, 
  ShieldCheck, 
  Key, 
  Settings, 
  Play, 
  RefreshCw, 
  Terminal, 
  CheckCircle, 
  AlertTriangle, 
  Cpu,
  ChevronDown,
  ChevronUp,
  Info,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MomoApiDashboard: React.FC = () => {
  const {
    momoConfigs,
    momoLogs,
    saveMomoConfig,
    testMomoConnection,
    loadMomoConfigs,
    loadMomoLogs
  } = useApp();

  // MTN form states
  const [mtnSubscriptionKey, setMtnSubscriptionKey] = useState('');
  const [mtnApiUserId, setMtnApiUserId] = useState('');
  const [mtnApiKey, setMtnApiKey] = useState('');
  const [mtnEnvironment, setMtnEnvironment] = useState<'sandbox' | 'mtncameroun'>('sandbox');
  const [isSavingMtn, setIsSavingMtn] = useState(false);
  const [isTestingMtn, setIsTestingMtn] = useState(false);
  const [mtnTestResult, setMtnTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Orange form states
  const [orangeClientId, setOrangeClientId] = useState('');
  const [orangeClientSecret, setOrangeClientSecret] = useState('');
  const [orangeMerchantKey, setOrangeMerchantKey] = useState('');
  const [orangeEnvironment, setOrangeEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [isSavingOrange, setIsSavingOrange] = useState(false);
  const [isTestingOrange, setIsTestingOrange] = useState(false);
  const [orangeTestResult, setOrangeTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Log UI states
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isResettingDb, setIsResettingDb] = useState(false);

  const handleResetToProduction = async () => {
    const confirmed = window.confirm(
      "⚠️ Êtes-vous sûr de vouloir réinitialiser la base de données de STUD'S pour la PRODUCTION ?\n\nCela effacera définitivement tous les clients fictifs, les prestataires et les commandes de test. Seuls vos identifiants d'API de paiement et les comptes d'administrateurs seront conservés !"
    );
    if (!confirmed) return;

    setIsResettingDb(true);
    try {
      const res = await fetch('/api/admin/reset-database', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        window.location.reload();
      } else {
        alert("Erreur: " + data.message);
      }
    } catch (err: any) {
      alert("Erreur réseau : " + err.message);
    } finally {
      setIsResettingDb(false);
    }
  };

  // Sync inputs with DB values on load
  useEffect(() => {
    loadMomoConfigs();
    loadMomoLogs();
  }, []);

  useEffect(() => {
    if (momoConfigs) {
      if (momoConfigs.mtnMomoConfig) {
        setMtnSubscriptionKey(momoConfigs.mtnMomoConfig.subscriptionKey || '');
        setMtnApiUserId(momoConfigs.mtnMomoConfig.apiUserId || '');
        setMtnApiKey(momoConfigs.mtnMomoConfig.apiKey || '');
        setMtnEnvironment(momoConfigs.mtnMomoConfig.environment || 'sandbox');
      }
      if (momoConfigs.orangeMoneyConfig) {
        setOrangeClientId(momoConfigs.orangeMoneyConfig.clientId || '');
        setOrangeClientSecret(momoConfigs.orangeMoneyConfig.clientSecret || '');
        setOrangeMerchantKey(momoConfigs.orangeMoneyConfig.merchantKey || '');
        setOrangeEnvironment(momoConfigs.orangeMoneyConfig.environment || 'sandbox');
      }
    }
  }, [momoConfigs]);

  const handleSaveMtn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMtn(true);
    setMtnTestResult(null);
    try {
      const res = await saveMomoConfig('mtn', {
        subscriptionKey: mtnSubscriptionKey,
        apiUserId: mtnApiUserId,
        apiKey: mtnApiKey,
        environment: mtnEnvironment
      });
      alert(res.message || "Configuration MTN enregistrée avec succès !");
    } catch (err: any) {
      alert("Erreur de sauvegarde: " + err.message);
    } finally {
      setIsSavingMtn(false);
    }
  };

  const handleSaveOrange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingOrange(true);
    setOrangeTestResult(null);
    try {
      const res = await saveMomoConfig('orange', {
        clientId: orangeClientId,
        clientSecret: orangeClientSecret,
        merchantKey: orangeMerchantKey,
        environment: orangeEnvironment
      });
      alert(res.message || "Configuration Orange enregistrée avec succès !");
    } catch (err: any) {
      alert("Erreur de sauvegarde: " + err.message);
    } finally {
      setIsSavingOrange(false);
    }
  };

  const handleTestMtn = async () => {
    setIsTestingMtn(true);
    setMtnTestResult(null);
    try {
      const res = await testMomoConnection('mtn');
      setMtnTestResult({ success: res.success, message: res.message });
    } catch (err: any) {
      setMtnTestResult({ success: false, message: "Erreur réseau: " + err.message });
    } finally {
      setIsTestingMtn(false);
    }
  };

  const handleTestOrange = async () => {
    setIsTestingOrange(true);
    setOrangeTestResult(null);
    try {
      const res = await testMomoConnection('orange');
      setOrangeTestResult({ success: res.success, message: res.message });
    } catch (err: any) {
      setOrangeTestResult({ success: false, message: "Erreur réseau: " + err.message });
    } finally {
      setIsTestingOrange(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="space-y-6 font-sans text-slate-800"
    >
      {/* Banner Intro */}
      <div className="bento-card bg-white border border-slate-200/60 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-300 text-indigo-700 rounded-lg">PRO MODE</span>
            <span className="text-xs font-mono font-bold text-slate-500">API VERSION: v1.0</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Passerelles MTN MoMo & Orange Money</h2>
          <p className="text-xs text-slate-500 font-bold leading-normal">
            Gérez les informations d'authentification directes pour traiter les demandes de paiement et de recharges de portefeuille auprès des opérateurs nationaux au Cameroun. Si aucun paramètre n'est spécifié, l'application fonctionne en mode simulateur de transaction haute-fidélité.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-600">
          <Cpu className="w-5 h-5 text-indigo-500" />
          <span>Fonds directements crédités</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* API CONFIGURATIONS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* MTN MOMO API CARD */}
          <div className="bento-card bg-white border border-slate-200/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-dashed border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center font-black text-amber-700 text-xs shadow-inner">
                  MTN
                </div>
                <div>
                  <h3 className="font-black text-xs text-slate-900 uppercase">MTN Mobile Money Developer</h3>
                  <p className="text-[9px] text-slate-400 font-bold">API Collections / Request To Pay</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${momoConfigs?.mtnMomoConfig?.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <span className="text-[10px] font-black uppercase text-slate-500">
                  {momoConfigs?.mtnMomoConfig?.isConfigured ? 'Connecté aux serveurs' : 'Simulateur Actif'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveMtn} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Subscription Key */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1">
                    <span>Ocp-Apim-Subscription-Key</span>
                    <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Clé primaire d'abonnement API (Subscription)"
                    value={mtnSubscriptionKey}
                    onChange={e => setMtnSubscriptionKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-amber-400 focus:bg-white"
                  />
                </div>

                {/* API User ID */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1">
                    <span>X-Reference-Id (API User ID)</span>
                    <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="UUID généré (ex: d8f4e2...)"
                    value={mtnApiUserId}
                    onChange={e => setMtnApiUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-amber-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* API Key */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1">
                    <span>API Key (Secret)</span>
                    <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Clé secrète de connexion générée par MTN"
                    value={mtnApiKey}
                    onChange={e => setMtnApiKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-amber-400 focus:bg-white"
                  />
                </div>

                {/* Environment */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-500 tracking-wider">
                    Environnement Cible
                  </label>
                  <select
                    value={mtnEnvironment}
                    onChange={e => setMtnEnvironment(e.target.value as 'sandbox' | 'mtncameroun')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold focus:outline-none"
                  >
                    <option value="sandbox">Sandbox (Test MTN Developer)</option>
                    <option value="mtncameroun">Production (MTN Cameroun)</option>
                  </select>
                </div>
              </div>

              {/* Action and Test Tools */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingMtn}
                  className="flex-1 py-2 bg-brand-700 hover:bg-brand-800 text-white font-black text-xs uppercase tracking-wider rounded-xl border border-slate-950 transition-all shadow-md cursor-pointer text-center"
                >
                  {isSavingMtn ? 'Enregistrement...' : 'Enregistrer la Config'}
                </button>
                <button
                  type="button"
                  onClick={handleTestMtn}
                  disabled={isTestingMtn || !momoConfigs?.mtnMomoConfig?.isConfigured}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border-2 border-amber-300 text-xs font-black uppercase rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center justify-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingMtn ? 'animate-spin' : ''}`} />
                  <span>Tester Connection</span>
                </button>
              </div>

              {mtnTestResult && (
                <div className={`p-3 rounded-xl border-2 text-xs flex items-start space-x-2 ${
                  mtnTestResult.success 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}>
                  <span className="text-base">{mtnTestResult.success ? '🟢' : '🔴'}</span>
                  <div>
                    <p className="font-black uppercase text-[10px]">{mtnTestResult.success ? 'Succès de Connexion' : 'Échec de Connexion'}</p>
                    <p className="font-bold mt-0.5">{mtnTestResult.message}</p>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* ORANGE MONEY API CARD */}
          <div className="bento-card bg-white border border-slate-200/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-dashed border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center font-black text-orange-700 text-xs shadow-inner">
                  OM
                </div>
                <div>
                  <h3 className="font-black text-xs text-slate-900 uppercase">Orange Money Developer</h3>
                  <p className="text-[9px] text-slate-400 font-bold">Orange Web Payment API / CAMEROON</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${momoConfigs?.orangeMoneyConfig?.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <span className="text-[10px] font-black uppercase text-slate-500">
                  {momoConfigs?.orangeMoneyConfig?.isConfigured ? 'Connecté aux serveurs' : 'Simulateur Actif'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveOrange} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Client ID */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1">
                    <span>Consumer Client ID (API)</span>
                    <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Consumer Key Orange Developer Portal"
                    value={orangeClientId}
                    onChange={e => setOrangeClientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-orange-400 focus:bg-white"
                  />
                </div>

                {/* Client Secret */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1">
                    <span>Consumer Client Secret</span>
                    <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Consumer Secret Orange Developer Portal"
                    value={orangeClientSecret}
                    onChange={e => setOrangeClientSecret(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-orange-400 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Merchant Key */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-500 tracking-wider flex items-center gap-1">
                    <span>Orange Merchant Key (Cameroun)</span>
                    <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Code Marchand (Merchant Key)"
                    value={orangeMerchantKey}
                    onChange={e => setOrangeMerchantKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-orange-400 focus:bg-white"
                  />
                </div>

                {/* Environment */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-500 tracking-wider">
                    Environnement Orange
                  </label>
                  <select
                    value={orangeEnvironment}
                    onChange={e => setOrangeEnvironment(e.target.value as 'sandbox' | 'production')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold focus:outline-none"
                  >
                    <option value="sandbox">Sandbox (Orange Developer Platform)</option>
                    <option value="production">Production (Orange Cameroun)</option>
                  </select>
                </div>
              </div>

              {/* Action and Test Tools */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingOrange}
                  className="flex-1 py-2 bg-brand-700 hover:bg-brand-800 text-white font-black text-xs uppercase tracking-wider rounded-xl border border-slate-950 transition-all shadow-md cursor-pointer text-center"
                >
                  {isSavingOrange ? 'Enregistrement...' : 'Enregistrer la Config'}
                </button>
                <button
                  type="button"
                  onClick={handleTestOrange}
                  disabled={isTestingOrange || !momoConfigs?.orangeMoneyConfig?.isConfigured}
                  className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-800 border-2 border-orange-300 text-xs font-black uppercase rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center justify-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingOrange ? 'animate-spin' : ''}`} />
                  <span>Tester Connection</span>
                </button>
              </div>

              {orangeTestResult && (
                <div className={`p-3 rounded-xl border-2 text-xs flex items-start space-x-2 ${
                  orangeTestResult.success 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}>
                  <span className="text-base">{orangeTestResult.success ? '🟢' : '🔴'}</span>
                  <div>
                    <p className="font-black uppercase text-[10px]">{orangeTestResult.success ? 'Succès de Connexion' : 'Échec de Connexion'}</p>
                    <p className="font-bold mt-0.5">{orangeTestResult.message}</p>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* RESET DATABASE TO PRODUCTION STATE */}
          <div className="bg-rose-50 border border-slate-200/80 rounded-[24px] p-5 shadow-lg shadow-slate-100 space-y-4">
            <div className="flex items-center space-x-2 border-b-2 border-slate-900 pb-2">
              <span className="p-1 bg-rose-500 border border-slate-200/50 rounded-lg text-white">
                <Trash2 className="w-4 h-4 text-white" />
              </span>
              <h4 className="font-sans font-black text-xs uppercase tracking-wider text-rose-950">
                Mode Production & Nettoyage Réel 🧹
              </h4>
            </div>
            <p className="text-[10.5px] text-slate-600 font-bold leading-normal">
              Prêt à lancer l'activité réelle à Ebolowa ? Une fois vos API de paiement MTN & Orange configurées et connectées, vous pouvez vider instantanément toutes les données de simulation fictives (comptes de test, fausses commandes, logs d'essais). Vos clés d'API et vos comptes d'administration seront conservés intacts pour le démarrage officiel.
            </p>
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={handleResetToProduction}
                disabled={isResettingDb}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white border border-slate-200/60 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm border-slate-100/50 cursor-pointer disabled:opacity-50"
              >
                <span>{isResettingDb ? 'Nettoyage en cours...' : 'Mettre à Zéro pour la Production 🚀'}</span>
              </button>
              <p className="text-[9px] text-slate-400 font-bold text-center">
                ⚠️ Cette action est irréversible et effacera tous les clients, prestataires et commandes de test.
              </p>
            </div>
          </div>

          {/* HELP DOCUMENTATION FOR DEV */}
          <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-4 space-y-2 text-xs">
            <h4 className="font-black text-[11px] text-indigo-950 uppercase tracking-wide flex items-center gap-1">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>Où trouver vos identifiants d'API officiels ?</span>
            </h4>
            <ul className="list-disc pl-4 space-y-1 font-semibold text-slate-600">
              <li>
                <strong>MTN MoMo :</strong> Créez un compte sur <a href="https://momodeveloper.mtn.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">momodeveloper.mtn.com</a>. Souscrivez au produit "Collections". Obtenez votre clé d'abonnement, puis configurez un "API User" et son "API Key" via la console développeur ou l'API sandbox.
              </li>
              <li>
                <strong>Orange Money :</strong> Rendez-vous sur <a href="https://developer.orange.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">developer.orange.com</a>. Enregistrez une application et souscrivez à l'API "Orange Money Web Payment (Cameroon)". Récupérez votre Consumer Client ID et Secret ainsi que la clé de marchand délivrée par votre conseiller Orange Cameroun.
              </li>
            </ul>
          </div>

        </div>

        {/* CONNECTION & PAYMENT TELEMETRY LOGS */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bento-card bg-brand-900 text-white p-5 border border-slate-200/80 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black font-mono text-[11px] uppercase tracking-wider text-slate-100">Console Télémétrie API</h3>
              </div>
              <button
                onClick={() => {
                  loadMomoLogs();
                }}
                className="p-1 hover:bg-brand-800 text-slate-400 hover:text-white rounded-lg transition-all"
                title="Rafraîchir les logs"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {momoLogs.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="text-2xl animate-pulse">📡</div>
                  <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Aucune activité enregistrée</p>
                  <p className="text-[10px] text-slate-400 px-4 leading-normal">
                    Les journaux de requêtes et réponses HTTP s'afficheront ici en temps réel lors du test de connexion ou d'un paiement.
                  </p>
                </div>
              ) : (
                momoLogs.map((log: any) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <div 
                      key={log.id} 
                      className={`p-3 rounded-xl font-mono text-[10px] border transition-all ${
                        log.status === 'success' 
                          ? 'bg-brand-700/60 border-slate-800 text-emerald-400' 
                          : 'bg-rose-950/20 border-rose-900/40 text-rose-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="text-[8.5px] bg-brand-800 text-slate-400 px-1 py-0.5 rounded font-black">
                              {log.provider.toUpperCase()}
                            </span>
                            <span className={`text-[8px] px-1 py-0.5 rounded font-black ${
                              log.type === 'test_connection' 
                                ? 'bg-indigo-950 text-indigo-300' 
                                : log.type === 'config_update'
                                  ? 'bg-amber-950 text-amber-300'
                                  : 'bg-emerald-950 text-emerald-300'
                            }`}>
                              {log.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[10.5px] font-black leading-relaxed">{log.message}</p>
                          <p className="text-[8.5px] text-slate-500 font-bold">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                        {(log.rawRequest || log.rawResponse) && (
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="p-1 hover:bg-brand-800 rounded text-slate-400 hover:text-white"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}
                      </div>

                      {/* Expanded Technical details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-2.5 pt-2 border-t border-dashed border-slate-800/80 space-y-2 overflow-hidden text-slate-300"
                          >
                            {log.rawRequest && (
                              <div className="space-y-0.5">
                                <p className="text-[8px] font-bold text-slate-500 uppercase">Détails de la Requête (JSON):</p>
                                <pre className="p-2 bg-brand-900 rounded-lg text-[8.5px] overflow-x-auto text-indigo-300">
                                  {JSON.stringify(log.rawRequest, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.rawResponse && (
                              <div className="space-y-0.5">
                                <p className="text-[8px] font-bold text-slate-500 uppercase">Détails de la Réponse:</p>
                                <pre className="p-2 bg-brand-900 rounded-lg text-[8.5px] overflow-x-auto text-emerald-300">
                                  {JSON.stringify(log.rawResponse, null, 2)}
                                </pre>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
