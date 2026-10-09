/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Bell, Wallet, CreditCard, LogOut, Check, RefreshCw, Smartphone, Wifi, WifiOff, Signal, Menu, X, Download, Sun, Moon, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { AndroidInstallModal } from './AndroidInstallModal';
import { StatsHub } from './StatsHub';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    notifications, 
    markNotificationAsRead, 
    clearNotifications, 
    resetAllData, 
    logoutUser,
    isOnline,
    connectivityMode,
    setConnectivityMode,
    syncOfflineQueue,
    offlineQueueCount,
    activeApp,
    setActiveApp,
    theme,
    toggleTheme
  } = useApp();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [showNetworkSettings, setShowNetworkSettings] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!currentUser) return null;

  const userNotifs = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = userNotifs.filter(n => !n.read).length;

  return (
    <header className="bg-white dark:bg-[#071a3a] border-b border-slate-200 dark:border-[#16315c] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Gauche : menu + logo + nom */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="relative w-10 h-10 shrink-0 rounded-xl bg-brand-50 dark:bg-[#0f2347] text-brand-700 dark:text-brand-200 flex items-center justify-center cursor-pointer"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <Logo size="sm" showText={false} />
          <div className="min-w-0 leading-tight">
            <p className="font-display font-extrabold text-[17px] text-brand-800 dark:text-white truncate">STUD'S <span className="text-brand-500 dark:text-brand-300">Services</span></p>
            <p className="text-[11px] text-slate-500 dark:text-brand-200/80 truncate">
              {connectivityMode === 'online' ? '● En ligne' : connectivityMode === 'unstable' ? '● Réseau instable' : '● Hors-ligne'} · Ebolowa
            </p>
          </div>
        </div>

        {/* Droite : actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => setIsStatsOpen(true)} className="hidden md:flex w-10 h-10 rounded-xl bg-brand-50 dark:bg-[#0f2347] text-brand-700 dark:text-brand-200 items-center justify-center cursor-pointer" title="Statistiques">
            <BarChart3 className="w-5 h-5" />
          </button>
          <button onClick={() => setShowInstallModal(true)} className="hidden md:flex w-10 h-10 rounded-xl bg-brand-50 dark:bg-[#0f2347] text-brand-700 dark:text-brand-200 items-center justify-center cursor-pointer" title="Installer l'application">
            <Smartphone className="w-5 h-5" />
          </button>
          <button onClick={toggleTheme} className="hidden md:flex w-10 h-10 rounded-xl bg-brand-50 dark:bg-[#0f2347] text-brand-700 dark:text-brand-200 items-center justify-center cursor-pointer" title="Changer de thème">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
          <span className="px-3 h-8 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[13px] font-bold flex items-center whitespace-nowrap">
            {currentUser.role === 'client' ? `${currentUser.loyaltyPoints || 0} pts` : `${(currentUser.balance || 0).toLocaleString()} F`}
          </span>
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="w-9 h-9 rounded-full brand-gradient text-[12px] font-bold flex items-center justify-center cursor-pointer uppercase"
            aria-label="Mon profil"
          >
            {(currentUser.firstName?.[0] || '') + (currentUser.lastName?.[0] || '')}
          </button>
        </div>
      </div>

      {/* RETRACTABLE SIDE DRAWER MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-start">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm"
            />

            {/* Sidebar Drawer Card */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-80 max-w-[85vw] h-full bg-white border-r border-slate-100 p-6 flex flex-col justify-between font-sans shadow-2xl z-10"
            >
              {/* Header inside drawer */}
              <div>
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
                  <div className="flex items-center space-x-2.5">
                    <Logo />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 border-2 border-transparent hover:border-slate-900 rounded-xl cursor-pointer"
                  >
                    <X className="w-5 h-5 stroke-[2.5px]" />
                  </button>
                </div>

                {/* Main Content of Drawer */}
                <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-1">
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => { setIsMenuOpen(false); setIsStatsOpen(true); }} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-brand-50 text-brand-700 text-xs font-semibold cursor-pointer"><BarChart3 className="w-5 h-5" />Stats</button>
                    <button type="button" onClick={() => { setIsMenuOpen(false); setShowInstallModal(true); }} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-brand-50 text-brand-700 text-xs font-semibold cursor-pointer"><Smartphone className="w-5 h-5" />Installer</button>
                    <button type="button" onClick={toggleTheme} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-brand-50 text-brand-700 text-xs font-semibold cursor-pointer">{theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}Thème</button>
                  </div>
                  {/* User Profile Summary */}
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
                    <img
                      src={currentUser.avatar}
                      alt={`${currentUser.firstName} ${currentUser.lastName}`}
                      className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-sm shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900 leading-tight truncate">
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                      <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider truncate mt-0.5">
                        {currentUser.role === 'admin'
                          ? 'Administrateur Général 🛡️'
                          : currentUser.role === 'provider'
                            ? 'Prestataire Étudiant 🎓'
                            : currentUser.role === 'supervisor'
                              ? 'Superviseur de Qualité 👁️'
                              : 'Client Grand Public 📱'}
                      </p>
                    </div>
                        {/* Mon Portefeuille & Réseau STUD'S */}
                  <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-blue-100 rounded-2xl p-4 space-y-3.5 shadow-sm">
                    <span className="text-[9px] font-black uppercase text-blue-800 tracking-wider block">
                      Mon Portefeuille & Réseau STUD'S
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Solde (prestataires et équipe uniquement) */}
                      {currentUser.role !== 'client' && (
                      <div className="bg-white border border-blue-100 rounded-xl p-2.5 flex flex-col justify-between shadow-sm">
                        <div className="flex items-center space-x-1 mb-1 text-blue-700">
                          <Wallet className="w-3.5 h-3.5 text-blue-800" />
                          <span className="text-[8px] font-black uppercase tracking-wider">Solde</span>
                        </div>
                        <p className="text-xs font-black text-blue-950 font-mono leading-none">
                          {currentUser.balance.toLocaleString()} <span className="text-[8px] text-blue-600 font-sans font-black">F</span>
                        </p>
                      </div>
                      )}

                      {/* Points */}
                      <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-2.5 flex flex-col justify-between shadow-sm">
                        <div className="flex items-center space-x-1 mb-1 text-amber-700">
                          <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-[8px] font-black uppercase tracking-wider">Points</span>
                        </div>
                        <p className="text-xs font-black text-yellow-950 font-mono leading-none">
                          {currentUser.loyaltyPoints} <span className="text-[8px] font-sans font-black">pts</span>
                        </p>
                      </div>
                    </div>
 
                    {/* NFC Card info if present */}
                    {currentUser.nfcCardId && (
                      <div className="bg-emerald-50/50 border border-emerald-200 text-emerald-950 px-3 py-1.5 rounded-xl text-xs font-black flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[9px]">Carte NFC liée</span>
                        </div>
                        <span className="font-mono text-[9px] bg-white border border-emerald-300 px-1.5 py-0.5 rounded shadow-sm">
                          {currentUser.nfcCardId}
                        </span>
                      </div>
                    )}
 
                    {/* Network Status indicator */}
                    <div className={`p-2.5 border rounded-xl text-xs font-black flex items-center justify-between ${
                      connectivityMode === 'online'
                        ? 'bg-emerald-50/50 border-emerald-100 text-emerald-950'
                        : connectivityMode === 'unstable'
                        ? 'bg-amber-50/50 border-amber-100 text-amber-950'
                        : 'bg-rose-50/50 border-rose-100 text-rose-950'
                    }`}>
                      <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Réseau Ebolowa</span>
                      <div className="flex items-center space-x-1.5">
                        {connectivityMode === 'online' ? (
                          <>
                            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[9px] font-black uppercase">En Ligne</span>
                          </>
                        ) : connectivityMode === 'unstable' ? (
                          <>
                            <Signal className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            <span className="text-[9px] font-black uppercase">Instable</span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                            <span className="text-[9px] font-black uppercase">Hors-Ligne</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notifications & Alertes Section inside Drawer */}
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider flex items-center space-x-1.5">
                        <Bell className="w-3.5 h-3.5 text-slate-800" />
                        <span>Alertes & Notifications</span>
                      </span>
                      {userNotifs.length > 0 && (
                        <button
                          onClick={() => clearNotifications(currentUser.id)}
                          className="text-[8px] text-rose-600 hover:text-rose-800 transition-colors font-black uppercase tracking-wider cursor-pointer"
                        >
                          Effacer tout
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {userNotifs.length === 0 ? (
                        <p className="text-[9px] text-slate-400 font-bold text-center py-4">Aucune notification pour le moment.</p>
                      ) : (
                        <div className="space-y-2">
                          {userNotifs.map(notif => (
                            <div
                              key={notif.id}
                              className={`p-2.5 rounded-xl border transition-all text-left flex items-start space-x-2 ${
                                notif.read 
                                  ? 'bg-white border-slate-100 text-slate-800' 
                                  : 'bg-blue-50/40 border-blue-200 text-slate-900 shadow-sm'
                              }`}
                            >
                              <div className="mt-0.5">
                                {notif.type === 'success' ? (
                                  <span className="block w-2 h-2 rounded-full bg-emerald-500 border border-emerald-900" />
                                ) : notif.type === 'warning' ? (
                                  <span className="block w-2 h-2 rounded-full bg-amber-500 border border-amber-900" />
                                ) : (
                                  <span className="block w-2 h-2 rounded-full bg-blue-700 border border-blue-900" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] font-black leading-tight truncate">{notif.title}</p>
                                  {!notif.read && (
                                    <button
                                      onClick={() => markNotificationAsRead(notif.id)}
                                      className="text-slate-900 hover:text-blue-800 p-0.5 shrink-0"
                                      title="Marquer comme lu"
                                    >
                                      <Check className="w-3 h-3 stroke-[3.5px]" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-[9px] text-slate-600 mt-0.5 leading-relaxed font-semibold break-words">{notif.message}</p>
                                <span className="text-[7.5px] text-slate-400 font-mono font-bold mt-1 block">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* App Switcher and Mode Propositions */}
                  {/* Only administrator can manage the mode switcher, each interface only shows what concerns them */}
                  {currentUser.role === 'admin' ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                          Contrôle Multi-Applications (Admin)
                        </span>
                        <p className="text-[9px] text-slate-500 mt-0.5 leading-normal">
                          En tant qu'administrateur, vous pouvez naviguer entre les différentes interfaces de la suite :
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveApp('client');
                            setIsMenuOpen(false);
                          }}
                          className={`w-full p-3 rounded-xl border font-black text-xs uppercase tracking-wide transition-all cursor-pointer flex items-center justify-between ${
                            activeApp === 'client'
                              ? 'bg-blue-700 border-blue-800 text-white shadow-md'
                              : 'bg-white border-slate-200 text-blue-900 hover:bg-blue-50'
                          }`}
                        >
                          <span>📱 Mode Client</span>
                          {activeApp === 'client' && <Check className="w-4 h-4 text-white stroke-[2px]" />}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setActiveApp('provider');
                            setIsMenuOpen(false);
                          }}
                          className={`w-full p-3 rounded-xl border font-black text-xs uppercase tracking-wide transition-all cursor-pointer flex items-center justify-between ${
                            activeApp === 'provider'
                              ? 'bg-indigo-600 border-indigo-700 text-white shadow-md'
                              : 'bg-white border-slate-200 text-blue-800 hover:bg-blue-50'
                          }`}
                        >
                          <span>🎓 Mode Prestataire</span>
                          {activeApp === 'provider' && <Check className="w-4 h-4 text-white stroke-[2px]" />}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setActiveApp('admin');
                            setIsMenuOpen(false);
                          }}
                          className={`w-full p-3 rounded-xl border font-black text-xs uppercase tracking-wide transition-all cursor-pointer flex items-center justify-between ${
                            activeApp === 'admin'
                              ? 'bg-brand-700 border-slate-950 text-white shadow-md'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>🛡️ Mode Admin</span>
                          {activeApp === 'admin' && <Check className="w-4 h-4 text-white stroke-[2px]" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-indigo-50 border-2 border-indigo-200 rounded-2xl text-[11px] text-indigo-950 font-semibold space-y-1">
                      <p className="font-extrabold text-xs text-indigo-900 flex items-center gap-1">
                        <span>🔒 Accès Sécurisé Unique</span>
                      </p>
                      <p className="leading-relaxed">
                        Cette interface est exclusive à votre rôle de{' '}
                        {currentUser.role === 'provider' ? 'prestataire' : 'client'}. 
                        Seul l'administrateur de STUD'S dispose des droits pour gérer la console centrale et basculer de mode.
                      </p>
                    </div>
                  )}

                  {/* Settings and Utilities inside Drawer */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                      Services & Outils
                    </span>
                    

 
                      <button
                        onClick={() => {
                          setShowInstallModal(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all text-left flex items-center space-x-2 cursor-pointer"
                      >
                        <Smartphone className="w-4 h-4 text-indigo-600" />
                        <span>Installer l'App Android 🤖</span>
                      </button>
 
                      <button
                        onClick={async () => {
                          setIsMenuOpen(false);
                          if (window.confirm("Voulez-vous forcer la mise à jour et recharger l'application pour avoir la toute dernière version ?")) {
                            try {
                              // Unregister service worker
                              if ('serviceWorker' in navigator) {
                                const registrations = await navigator.serviceWorker.getRegistrations();
                                for (const registration of registrations) {
                                  await registration.unregister();
                                }
                              }
                              // Clear caches
                              if ('caches' in window) {
                                const cacheNames = await caches.keys();
                                for (const name of cacheNames) {
                                  await caches.delete(name);
                                }
                              }
                              // Reload
                              window.location.reload();
                            } catch (e) {
                              window.location.reload();
                            }
                          }
                        }}
                        className="w-full p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all text-left flex items-center space-x-2 cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
                        <span>Forcer la Mise à Jour ⚡</span>
                      </button>
 
                      <button
                        onClick={() => {
                          setShowNetworkSettings(!showNetworkSettings);
                          setIsMenuOpen(false);
                        }}
                        className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all text-left flex items-center space-x-2 cursor-pointer"
                      >
                        <Signal className="w-4 h-4 text-amber-600 animate-pulse" />
                        <span>Réseau d'Ebolowa ({
                          connectivityMode === 'online' ? 'Stable' : connectivityMode === 'unstable' ? 'Instable' : 'Hors-Ligne'
                        })</span>
                      </button>
 
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            if (window.confirm("Voulez-vous réinitialiser toutes les données de l'application ?")) {
                              resetAllData();
                              setIsMenuOpen(false);
                            }
                          }}
                          className="w-full p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl text-xs font-bold transition-all text-left flex items-center space-x-2 cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4 text-rose-600" />
                          <span>Réinitialiser Données 🔄</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Logout */}
              <div className="pt-4 border-t border-slate-200/80">
                <button
                  onClick={() => {
                    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
                      logoutUser();
                      setIsMenuOpen(false);
                    }
                  }}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold border border-rose-700 rounded-xl text-xs uppercase tracking-wider shadow-sm cursor-pointer flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se Déconnecter de l'App</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AndroidInstallModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
      <StatsHub isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
    </header>
  );
};
