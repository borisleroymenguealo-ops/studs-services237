import React, { useEffect, useState } from 'react';
import { Smartphone, QrCode, Copy, Check, Download, Chrome, Plus, Home, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../AppContext';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const { activeApp, setActiveApp } = useApp();
  const [localActiveApp, setLocalActiveApp] = useState<'client' | 'provider' | 'admin'>(activeApp);
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [installPlatform, setInstallPlatform] = useState<'android' | 'ios'>('android');
  const [canPrompt, setCanPrompt] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalActiveApp(activeApp);
    }
  }, [isOpen, activeApp]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let url = window.location.href || 'https://ais-pre-afml67ouakw3rcaye3ia5v-166202788567.europe-west3.run.app';
      const isDev = url.includes('ais-dev-') || url.includes('localhost') || url.includes('127.0.0.1') || (url.includes('.run.app') && !url.includes('ais-pre-'));
      const isIframe = window.self !== window.top;
      if (isDev || isIframe) {
        url = 'https://ais-pre-afml67ouakw3rcaye3ia5v-166202788567.europe-west3.run.app';
      }
      setCurrentUrl(url);

      if ((window as any).deferredPwaPrompt) {
        setCanPrompt(true);
      }
      const handlePwaReady = () => setCanPrompt(true);
      window.addEventListener('pwaPromptReady', handlePwaReady);
      return () => window.removeEventListener('pwaPromptReady', handlePwaReady);
    }
  }, []);

  const handleNativeInstall = async () => {
    const promptEvent = (window as any).deferredPwaPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('L\'utilisateur a accepté l\'installation !');
      }
      (window as any).deferredPwaPrompt = null;
      setCanPrompt(false);
    } else {
      alert("Pour installer sur votre Redmi A3 Pro ou smartphone Android :\n\n1. Ouvrez cette page dans Google Chrome.\n2. Appuyez sur les 3 points du menu en haut à droite.\n3. Choisissez 'Ajouter à l'écran d'accueil' ou 'Installer l'application'.");
    }
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}`;

  const getAppInstallConfig = () => {
    switch (localActiveApp) {
      case 'client':
        return {
          title: "Installer STUD'S Client",
          badge: "STUD'S Client — App Grand Public",
          desc: "Ouvrez l'application grand public pour commander des services de proximité et gérer vos points de fidélité à Ebolowa.",
          colorClass: "bg-blue-100 text-blue-900 border-blue-900"
        };
      case 'provider':
        return {
          title: "Installer STUD'S Pro",
          badge: "STUD'S Pro — Prestataires",
          desc: "Ouvrez l'application prestataire pour accepter des missions de proximité, suivre vos gains (70%) et valider via NFC.",
          colorClass: "bg-emerald-100 text-emerald-900 border-emerald-900"
        };
      case 'admin':
        return {
          title: "Installer STUD'S Admin",
          badge: "STUD'S Admin — Console de Contrôle",
          desc: "Ouvrez la console d'administration pour valider les prestataires, gérer les tarifs et suivre la qualité.",
          colorClass: "bg-brand-100 text-brand-900 border-brand-900"
        };
    }
  };

  const config = getAppInstallConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-brand-700/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/60 w-full max-w-2xl overflow-hidden z-55 flex flex-col md:flex-row"
      >
        {/* Left Side: Scan / QR Code */}
        <div className="bg-brand-900 text-white p-6 flex flex-col items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-slate-900 md:w-[42%] shrink-0">
          <div className="bg-white p-3.5 rounded-2xl border-2 border-slate-700 shadow-md">
            <img 
              src={qrCodeUrl} 
              alt="QR Code d'installation" 
              className="w-40 h-40 object-contain select-none"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="mt-4 text-center space-y-1">
            <p className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest">Étape d'Appairage</p>
            <h4 className="font-extrabold text-sm uppercase text-slate-100">Scannez ce QR Code</h4>
            <p className="text-[11px] text-slate-400 font-sans max-w-[200px] leading-relaxed">
              Ouvrez l'appareil photo de votre téléphone Android pour lancer STUD'S App en direct.
            </p>
          </div>
        </div>

        {/* Right Side: Step-by-Step Instructions */}
        <div className="p-6 flex-1 flex flex-col justify-between space-y-5 bg-white">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className={`p-1 rounded-lg ${config?.colorClass || 'bg-blue-100 text-blue-900'}`}>
                  <Smartphone className="w-4 h-4" />
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider">
                  {config?.badge}
                </span>
              </div>
              <h3 className="font-black text-lg text-slate-900 uppercase leading-none mt-1">{config?.title}</h3>
              <p className="text-[10px] text-slate-500 font-bold leading-normal">{config?.desc}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-xl transition-all shadow-sm border-slate-100/50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-900 stroke-[3px]" />
            </button>
          </div>

          {/* 1-Click Native PWA Install Banner for Android & Redmi */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-3 shadow-md border border-blue-500 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base">📱</span>
                <div>
                  <h4 className="font-extrabold text-xs uppercase leading-tight">Installation Universelle PWA</h4>
                  <p className="text-[10px] text-blue-100">Compatible Redmi A3 Pro, Xiaomi HyperOS, Samsung, Android 14+</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleNativeInstall}
                className="py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] uppercase rounded-xl shadow transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Installer (1-Clic)</span>
              </button>
            </div>
            <p className="text-[9.5px] text-blue-100/90 leading-tight border-t border-blue-400/40 pt-1.5">
              💡 <strong>Important :</strong> Si votre téléphone indique que "l'application a été créée pour une version ancienne d'Android", c'est parce qu'il s'agit d'un fichier APK obsolète. Installez directement STUD'S App comme <strong>Application Web (PWA)</strong> via Google Chrome ci-dessous sans aucun problème de compatibilité !
            </p>
          </div>

          {/* Interactive PWA Installation Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 border border-slate-200/60 rounded-2xl shadow-sm">
            <button
              onClick={() => setLocalActiveApp('client')}
              className={`py-2 text-center rounded-xl text-[9px] uppercase font-black tracking-wider transition-all cursor-pointer border-2 ${
                localActiveApp === 'client'
                  ? 'bg-blue-600 text-white border-slate-900 shadow-sm border-slate-100/50'
                  : 'bg-white text-slate-500 hover:text-slate-800 border-transparent'
              }`}
            >
              📱 Client
            </button>
            <button
              onClick={() => setLocalActiveApp('provider')}
              className={`py-2 text-center rounded-xl text-[9px] uppercase font-black tracking-wider transition-all cursor-pointer border-2 ${
                localActiveApp === 'provider'
                  ? 'bg-emerald-600 text-white border-slate-900 shadow-sm border-slate-100/50'
                  : 'bg-white text-slate-500 hover:text-slate-800 border-transparent'
              }`}
            >
              🎓 Pro (Prestataire)
            </button>
            <button
              onClick={() => setLocalActiveApp('admin')}
              className={`py-2 text-center rounded-xl text-[9px] uppercase font-black tracking-wider transition-all cursor-pointer border-2 ${
                localActiveApp === 'admin'
                  ? 'bg-brand-600 text-white border-slate-900 shadow-sm border-slate-100/50'
                  : 'bg-white text-slate-500 hover:text-slate-800 border-transparent'
              }`}
            >
              🛡️ Admin
            </button>
          </div>

          {/* OS Platform Selector */}
          <div className="flex bg-slate-100 p-1 border border-slate-200/60 rounded-xl max-w-[240px] shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)]">
            <button
              type="button"
              onClick={() => setInstallPlatform('android')}
              className={`flex-1 py-1 text-center rounded-lg text-[9px] uppercase font-black transition-all cursor-pointer border ${
                installPlatform === 'android'
                  ? 'bg-brand-700 text-white border-slate-950 shadow-sm'
                  : 'bg-transparent text-slate-500 hover:text-slate-800 border-transparent'
              }`}
            >
              🤖 Android
            </button>
            <button
              type="button"
              onClick={() => setInstallPlatform('ios')}
              className={`flex-1 py-1 text-center rounded-lg text-[9px] uppercase font-black transition-all cursor-pointer border ${
                installPlatform === 'ios'
                  ? 'bg-brand-700 text-white border-slate-950 shadow-sm'
                  : 'bg-transparent text-slate-500 hover:text-slate-800 border-transparent'
              }`}
            >
              🍎 iPhone / iOS
            </button>
          </div>

          {/* Steps List */}
          <div className="space-y-3 min-h-[175px]">
            {installPlatform === 'android' ? (
              <>
                {/* Step 1 */}
                <div className="flex items-start space-x-3">
                  <div className="w-5.5 h-5.5 rounded-lg bg-brand-700 border border-slate-950 text-white font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase">Ouvrir dans Google Chrome</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
                      Après avoir scanné le QR Code, assurez-vous de bien ouvrir l'adresse dans le navigateur <strong className="text-slate-800">Google Chrome</strong> de votre smartphone.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-3">
                  <div className="w-5.5 h-5.5 rounded-lg bg-brand-700 border border-slate-950 text-white font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase">Ouvrir le menu de Chrome</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
                      Appuyez sur les <strong className="text-slate-800">3 points verticaux (menu)</strong> situés en haut à droite de Google Chrome.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-3">
                  <div className="w-5.5 h-5.5 rounded-lg bg-brand-700 border border-slate-950 text-white font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase">Ajouter à l'écran d'accueil</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-sans flex flex-wrap items-center gap-1">
                      Sélectionnez 
                      <span className="inline-flex items-center space-x-1 bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded font-bold text-[9px] text-slate-800">
                        <Plus className="w-3 h-3" />
                        <span>Ajouter à l'écran d'accueil</span>
                      </span> 
                      ou 
                      <span className="inline-flex items-center space-x-1 bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded font-bold text-[9px] text-slate-800">
                        <Download className="w-3 h-3" />
                        <span>Installer l'application</span>
                      </span>.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start space-x-3">
                  <div className="w-5.5 h-5.5 rounded-lg bg-brand-700 border border-slate-950 text-white font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase">Profiter du Plein Écran</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
                      L'icône de l'application est ajoutée à vos applications Android. Lancez-la pour profiter d'une expérience 100% immersive et fluide.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* iOS Step 1 */}
                <div className="flex items-start space-x-3">
                  <div className="w-5.5 h-5.5 rounded-lg bg-brand-700 border border-slate-950 text-white font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase">Ouvrir dans Safari</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
                      Sur iPhone, scannez le QR code et ouvrez l'adresse exclusivement dans le navigateur natif <strong className="text-slate-800">Safari</strong>.
                    </p>
                  </div>
                </div>

                {/* iOS Step 2 */}
                <div className="flex items-start space-x-3">
                  <div className="w-5.5 h-5.5 rounded-lg bg-brand-700 border border-slate-950 text-white font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase">Appuyer sur "Partager"</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
                      Appuyez sur le bouton de <strong className="text-slate-800">Partage</strong> (icône avec un carré et une flèche pointant vers le haut) situé au bas de votre écran.
                    </p>
                  </div>
                </div>

                {/* iOS Step 3 */}
                <div className="flex items-start space-x-3">
                  <div className="w-5.5 h-5.5 rounded-lg bg-brand-700 border border-slate-950 text-white font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase">Ajouter sur l'écran d'accueil</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
                      Faites défiler le menu de partage vers le bas et sélectionnez <strong className="text-slate-800">Sur l'écran d'accueil</strong>. L'application s'installera instantanément en mode autonome !
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Active Trigger Action */}
          <div className="pt-2 border-t-2 border-dashed border-slate-200 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-slate-50 border border-slate-200/60 rounded-2xl p-2.5 flex items-center justify-between gap-3 font-mono">
              <div className="overflow-hidden">
                <p className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Lien de l'application</p>
                <p className="text-[9px] text-slate-600 truncate pt-0.5">{currentUrl}</p>
              </div>
              <button
                onClick={handleCopy}
                className={`py-1 px-2.5 border-2 rounded-xl text-[10px] font-black flex items-center space-x-1 transition-all shrink-0 cursor-pointer ${
                  copied 
                    ? 'bg-emerald-600 border-emerald-700 text-white shadow-[1px_1px_0px_rgba(0,0,0,1)]' 
                    : 'bg-white border-slate-900 text-slate-850 hover:bg-slate-50 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                setActiveApp(localActiveApp);
                onClose();
              }}
              className={`py-2.5 px-4 rounded-2xl border border-slate-200/60 font-black text-xs uppercase transition-all cursor-pointer flex items-center justify-center space-x-1 shadow-[2.5px_2.5px_0px_rgba(15,23,42,1)] hover:shadow-none active:translate-x-0.5 active:translate-y-0.5 text-white ${
                localActiveApp === 'client' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : localActiveApp === 'provider' 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              <span>Activer & Lancer 🚀</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
