/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { 
  Wallet, 
  Calendar, 
  Cpu, 
  Wifi, 
  WifiOff, 
  Signal, 
  Bell, 
  Sparkles, 
  CheckCircle, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  RefreshCw, 
  Info 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MiniDashboardHeaderProps {
  role: 'client' | 'provider' | 'admin' | 'supervisor';
}

export const MiniDashboardHeader: React.FC<MiniDashboardHeaderProps> = ({ role }) => {
  const {
    currentUser,
    orders,
    cards,
    connectivityMode,
    setConnectivityMode,
    notifications,
    getFinancialReport
  } = useApp();

  const [toast, setToast] = useState<{ id: string; title: string; message: string; type: 'info' | 'success' | 'warning' } | null>(null);
  const [prevNotifCount, setPrevNotifCount] = useState(notifications.length);
  const [prevOrderCount, setPrevOrderCount] = useState(orders.length);

  // Show/Hide balance logic (persisted in localStorage)
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem('studs_balance_visible');
    return saved !== 'false'; // default to true
  });

  // State for copying NFC UID feedback
  const [copiedUid, setCopiedUid] = useState<boolean>(false);

  // Today's date string in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Persist balance visibility changes
  const toggleBalanceVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBalanceVisible(prev => {
      localStorage.setItem('studs_balance_visible', String(!prev));
      return !prev;
    });
  };

  // 1. Calculate Balance / Financial Metric
  const getBalanceDisplayValue = () => {
    if (!currentUser) return '0';

    if (role === 'admin' || role === 'supervisor') {
      try {
        const report = getFinancialReport();
        return report.totalRevenue.toLocaleString();
      } catch (e) {
        return currentUser.balance.toLocaleString();
      }
    }

    if (role === 'client') return (currentUser.loyaltyPoints || 0).toLocaleString();
    return currentUser.balance.toLocaleString();
  };

  const getBalanceLabel = () => {
    if (role === 'admin' || role === 'supervisor') {
      return 'Trésorerie Globale';
    }
    if (role === 'provider') {
      return 'Solde Courant';
    }
    return 'Points fidélité';
  };

  // 2. Calculate Daily Transactions
  const getDailyTransactionsCount = () => {
    const todayOrders = orders.filter(o => {
      const orderDate = o.createdAt ? o.createdAt.split('T')[0] : '';
      return orderDate === todayStr || o.scheduledDate === todayStr;
    });

    if (role === 'client') {
      return todayOrders.filter(o => o.clientId === currentUser?.id).length;
    }
    if (role === 'provider') {
      return todayOrders.filter(o => o.providerId === currentUser?.id).length;
    }
    return todayOrders.length;
  };

  // 3. Get NFC Card Status
  const getMyCard = () => {
    if (!currentUser) return null;
    return cards.find(c => c.userId === currentUser.id);
  };

  const myCard = getMyCard();

  // Click on Connectivity Card - Cycles through modes dynamically!
  const cycleConnectivityMode = () => {
    const modes: ('online' | 'unstable' | 'offline')[] = ['online', 'unstable', 'offline'];
    const currentIndex = modes.indexOf(connectivityMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];
    
    setConnectivityMode(nextMode);

    let statusText = "4G Réseau Stable (Ebolowa)";
    let desc = "L'application synchronise l'ensemble des données en temps réel.";
    let type: 'info' | 'success' | 'warning' = 'success';

    if (nextMode === 'unstable') {
      statusText = "Réseau Instable détecté";
      desc = "La connexion est lente. Les données se synchronisent de manière asynchrone.";
      type = 'warning';
    } else if (nextMode === 'offline') {
      statusText = "Mode Hors-Ligne Activé";
      desc = "L'application fonctionne à 100% en local grâce au service worker et à la queue d'attente hors-ligne.";
      type = 'info';
    }

    setToast({
      id: 'network-switch',
      title: `🌐 Mode réseau : ${nextMode.toUpperCase()}`,
      message: `${statusText}. ${desc}`,
      type
    });
  };

  // Click on NFC card card - Copies card UID or simulates tap!
  const handleNfcCardClick = () => {
    if (myCard) {
      const uid = myCard.nfcUid || myCard.id.slice(0, 8).toUpperCase();
      navigator.clipboard.writeText(uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);

      setToast({
        id: 'nfc-copied',
        title: '🔑 NFC Copié avec succès !',
        message: `L'identifiant de la carte (${uid}) a été copié dans votre presse-papiers pour simulation rapide.`,
        type: 'success'
      });
    } else {
      setToast({
        id: 'nfc-not-found',
        title: '📡 Scanner NFC Virtuel',
        message: role === 'admin' || role === 'supervisor' 
          ? "Le simulateur NFC d'administration est prêt. Utilisez les cartes d'étudiant pour valider les transactions."
          : "Aucune carte NFC n'est liée à votre profil. Demandez-en une à l'administration.",
        type: 'info'
      });
    }
  };

  // Click on daily activities card - shows a recap toast
  const handleDailyActivitiesClick = () => {
    const count = getDailyTransactionsCount();
    setToast({
      id: 'daily-recap',
      title: '📅 Résumé de votre Journée',
      message: count > 0 
        ? `Vous avez actuellement ${count} mission(s) ou commande(s) planifiée(s) pour aujourd'hui (${todayStr}).`
        : `Aucune activité enregistrée pour aujourd'hui. Préparez ou planifiez de nouveaux services !`,
      type: 'info'
    });
  };

  // Watch for new notifications or new orders to show an interactive Toast alert in real-time
  useEffect(() => {
    if (notifications.length > prevNotifCount) {
      const latestNotif = notifications[notifications.length - 1];
      if (latestNotif && latestNotif.userId === currentUser?.id) {
        setToast({
          id: latestNotif.id,
          title: latestNotif.title,
          message: latestNotif.message,
          type: latestNotif.type
        });

        // Auto-dismiss after 4.5 seconds
        const timer = setTimeout(() => {
          setToast(null);
        }, 4500);
        return () => clearTimeout(timer);
      }
    }
    setPrevNotifCount(notifications.length);
  }, [notifications.length, currentUser?.id, prevNotifCount]);

  useEffect(() => {
    if (orders.length > prevOrderCount) {
      const latestOrder = orders[orders.length - 1];
      if (latestOrder) {
        const isRelated = 
          role === 'admin' || 
          role === 'supervisor' ||
          latestOrder.clientId === currentUser?.id ||
          latestOrder.providerId === currentUser?.id;

        if (isRelated) {
          setToast({
            id: latestOrder.id,
            title: `🔔 Nouvelle Activité : ${latestOrder.serviceTitle}`,
            message: `Une commande de ${latestOrder.servicePrice.toLocaleString()} FCFA est enregistrée en statut : ${latestOrder.status}.`,
            type: 'success'
          });

          const timer = setTimeout(() => {
            setToast(null);
          }, 4500);
          return () => clearTimeout(timer);
        }
      }
    }
    setPrevOrderCount(orders.length);
  }, [orders.length, currentUser?.id, role, prevOrderCount]);

  return (
    <div className="space-y-4 font-sans">
      {/* Mini-dashboard layout - 50% shorter and 2x2 grid on mobile, beautifully responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4">
        
        {/* Card 1: Balance Card with Show/Hide toggle */}
        <div 
          onClick={toggleBalanceVisibility}
          className="bg-white border border-slate-200/50 rounded-xl p-2.5 md:p-3 flex items-center space-x-2 md:space-x-3 shadow-sm border-slate-100/50 hover:shadow-lg shadow-slate-100 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative overflow-hidden group"
          title="Cliquez pour afficher/masquer le solde"
        >
          <div className="p-2 bg-blue-50 text-blue-900 border border-slate-200/50 rounded-lg shrink-0">
            <Wallet className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5 justify-between">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider truncate">
                {getBalanceLabel()}
              </span>
              <button 
                onClick={toggleBalanceVisibility}
                className="text-slate-400 hover:text-slate-900 transition-colors p-0.5"
                aria-label="Toggle Balance"
              >
                {isBalanceVisible ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-xs md:text-sm font-black text-slate-950 font-mono tracking-tight mt-0.5 truncate">
              {isBalanceVisible ? (
                <span>{getBalanceDisplayValue()} FCFA</span>
              ) : (
                <span className="text-slate-400 tracking-[0.25em]">•••••••</span>
              )}
            </p>
          </div>
        </div>

        {/* Card 2: Daily Transactions Card */}
        <div 
          onClick={handleDailyActivitiesClick}
          className="bg-white border border-slate-200/50 rounded-xl p-2.5 md:p-3 flex items-center space-x-2 md:space-x-3 shadow-sm border-slate-100/50 hover:shadow-lg shadow-slate-100 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative overflow-hidden group"
          title="Cliquez pour voir le résumé de la journée"
        >
          <div className="p-2 bg-amber-50 text-amber-900 border border-slate-200/50 rounded-lg shrink-0 group-hover:rotate-12 transition-transform duration-200">
            <Calendar className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider truncate">Missions du jour</p>
            <p className="text-xs md:text-sm font-black text-slate-950 font-mono tracking-tight mt-0.5">
              {getDailyTransactionsCount()} active{getDailyTransactionsCount() !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Card 3: NFC Card Status Card (Interactive) */}
        <div 
          onClick={handleNfcCardClick}
          className="bg-white border border-slate-200/50 rounded-xl p-2.5 md:p-3 flex items-center space-x-2 md:space-x-3 shadow-sm border-slate-100/50 hover:shadow-lg shadow-slate-100 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative overflow-hidden group"
          title={myCard ? "Cliquez pour copier l'UID de votre carte NFC" : "Cliquez pour voir le scanner NFC"}
        >
          <div className={`p-2 border border-slate-200/50 rounded-lg shrink-0 transition-all duration-200 ${
            myCard 
              ? 'bg-emerald-50 text-emerald-950 group-hover:bg-emerald-100' 
              : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
          }`}>
            {copiedUid ? (
              <Check className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
            ) : (
              <Cpu className={`w-4 h-4 md:w-5 md:h-5 ${myCard ? 'animate-pulse' : ''}`} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between space-x-1">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider truncate">NFC & Étudiant</span>
              {myCard && <Copy className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </div>
            <div className="flex items-center space-x-1 mt-0.5 min-w-0">
              {myCard ? (
                <>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                  <span className="text-[10px] md:text-[11px] font-black uppercase text-emerald-900 font-mono truncate">
                    ID: {myCard.nfcUid || myCard.id.slice(0, 8).toUpperCase()}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0" />
                  <span className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase truncate">
                    {role === 'admin' || role === 'supervisor' ? 'NFC PRÊT (SIM)' : 'NON LIÉE'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Connection Network Mode Card (Clickable to switch mode!) */}
        <div 
          onClick={cycleConnectivityMode}
          className={`border border-slate-200/50 rounded-xl p-2.5 md:p-3 flex items-center space-x-2 md:space-x-3 shadow-sm border-slate-100/50 hover:shadow-lg shadow-slate-100 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative overflow-hidden group ${
            connectivityMode === 'online'
              ? 'bg-emerald-50 text-emerald-950 hover:bg-emerald-100/70'
              : connectivityMode === 'unstable'
              ? 'bg-amber-50 text-amber-950 hover:bg-amber-100/70'
              : 'bg-rose-50 text-rose-950 hover:bg-rose-100/70'
          }`}
          title="Cliquez pour changer dynamiquement de mode réseau"
        >
          <div className="p-2 bg-white text-slate-900 border border-slate-200/50 rounded-lg shrink-0 shadow-[1px_1px_0px_rgba(0,0,0,1)] relative">
            {connectivityMode === 'online' ? (
              <Wifi className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 animate-pulse" />
            ) : connectivityMode === 'unstable' ? (
              <Signal className="w-4 h-4 md:w-5 md:h-5 text-amber-600 animate-bounce" />
            ) : (
              <WifiOff className="w-4 h-4 md:w-5 md:h-5 text-rose-600" />
            )}
            <div className="absolute -top-1.5 -right-1.5 bg-brand-700 text-[6px] font-black text-white px-0.5 rounded-full scale-75 uppercase">
              <RefreshCw className="w-1.5 h-1.5 animate-spin" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider truncate">Réseau (Ebolowa)</p>
            <p className="text-[10px] md:text-[11px] font-black uppercase font-mono tracking-tight mt-0.5 truncate">
              {connectivityMode === 'online' ? (
                <span className="text-emerald-900">Stable</span>
              ) : connectivityMode === 'unstable' ? (
                <span className="text-amber-900">Instable</span>
              ) : (
                <span className="text-rose-900">Hors-ligne</span>
              )}
            </p>
          </div>
        </div>

      </div>

      {/* Floating Animated Toast Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 z-50 max-w-sm w-[90%] md:w-full bg-white border-2 border-slate-950 rounded-xl p-3 shadow-lg shadow-slate-100 cursor-pointer hover:-translate-y-0.5 transition-transform"
            onClick={() => setToast(null)}
          >
            <div className="flex items-start space-x-2.5">
              <div className="p-1.5 bg-blue-50 text-blue-900 border border-slate-950 rounded-lg shrink-0">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans font-black text-xs text-slate-900 uppercase tracking-tight truncate">
                  {toast.title}
                </p>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-0.5">
                  {toast.message}
                </p>
                <div className="flex items-center space-x-1 mt-1 text-[8px] text-slate-400 font-mono uppercase font-black">
                  <Info className="w-2.5 h-2.5" />
                  <span>Cliquer pour fermer</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
