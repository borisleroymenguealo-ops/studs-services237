/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Sun, Moon, LogIn, UserPlus, Sparkles, User, Mail, Phone, Calendar, ShieldCheck, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ForgotPassword } from './ForgotPassword';

export const WelcomeScreen: React.FC = () => {
  const { loginUser, registerUser, theme, toggleTheme } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [forgot, setForgot] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [password, setPassword] = useState('');
  const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' && !!import.meta.env.VITE_DEMO_PASSWORD;
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Registration State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [userRole, setUserRole] = useState<'client' | 'provider'>('client');
  const [isRegistering, setIsRegistering] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim() || !loginPassword) {
      setErrorMsg("Veuillez saisir votre email (ou téléphone) et votre mot de passe.");
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsLoggingIn(true);
    try {
      const res = await loginUser(loginInput.trim(), loginPassword);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg(`Connexion réussie ! Bienvenue ${res.user?.firstName}.`);
      }
    } catch (err) {
      setErrorMsg("Une erreur s'est produite lors de la connexion.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim() || !birthDate) {
      setErrorMsg("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsRegistering(true);
    try {
      const avatarUrl = userRole === 'client' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150';

      const res = await registerUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        birthDate: birthDate,
        role: userRole,
        avatar: avatarUrl,
        password
      });

      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg("Votre compte a été créé avec succès !");
      }
    } catch (err) {
      setErrorMsg("Une erreur s'est produite lors de l'inscription.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleQuickLogin = async (emailToLogin: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await loginUser(emailToLogin, import.meta.env.VITE_DEMO_PASSWORD);
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg("Erreur lors de la connexion rapide.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B101D] text-slate-900 dark:text-slate-100 flex flex-col justify-between select-none">
      
      {/* Mini header standard */}
      <header className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/60 bg-white/50 dark:bg-[#0c1221]/50 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-blue-600 dark:bg-blue-700 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/15">
            S
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-blue-900 dark:text-blue-400 leading-none">STUD'S SERVICES</h2>
            <span className="text-[8px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">Ebolowa Solidaire</span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 bg-white dark:bg-[#111928] hover:bg-slate-100 dark:hover:bg-[#13264a] text-slate-800 dark:text-slate-200 rounded-xl transition-all border border-slate-200/80 dark:border-slate-800 shadow-sm cursor-pointer"
          title={theme === 'dark' ? "Mode clair" : "Mode sombre"}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </header>

      {/* Main Content Space */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white dark:bg-[#111928] border border-slate-200/70 dark:border-slate-800/80 rounded-3xl shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
          
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Réseau d'Entraide</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Commandez des services de proximité à Ebolowa ou devenez prestataire étudiant qualifié.
            </p>
          </div>

          {/* Feedback banners */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl p-3 text-rose-900 dark:text-rose-200 text-[11px] font-semibold flex items-center space-x-2"
              >
                <span>⚠️ {errorMsg}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-3 text-emerald-950 dark:text-emerald-200 text-[11px] font-semibold flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login/Register Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-[#0b1a33] p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'login' 
                  ? 'bg-white dark:bg-[#111928] text-blue-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'register' 
                  ? 'bg-white dark:bg-[#111928] text-blue-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Créer un Compte
            </button>
          </div>

          {/* Tab content */}
          <div className="min-h-[250px]">
            {activeTab === 'login' && forgot ? (
              <ForgotPassword onDone={() => setForgot(false)} />
            ) : activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Email ou Téléphone
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Votre e-mail ou +237..."
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-[#0c1221] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0c1221] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoggingIn ? "Connexion..." : "Se connecter"}</span>
                </button>
                <button type="button" onClick={() => setForgot(true)} className="w-full text-[11px] font-bold text-blue-700 underline cursor-pointer">Mot de passe oublié ?</button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Prénom</label>
                    <input
                      type="text"
                      placeholder="Aline"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0c1221] border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Nom de famille</label>
                    <input
                      type="text"
                      placeholder="NGO"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0c1221] border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Numéro de téléphone</label>
                  <div className="relative flex items-center">
                    <Phone className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ex: +237 655 443 322"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0c1221] border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Adresse Email</label>
                  <div className="relative flex items-center">
                    <Mail className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Ex: aline.ngo@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0c1221] border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Date de naissance</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-2 py-2 bg-slate-50 dark:bg-[#0c1221] border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Votre Rôle</label>
                    <select
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value as 'client' | 'provider')}
                      className="w-full px-2 py-2 bg-slate-50 dark:bg-[#0c1221] border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    >
                      <option value="client">Client (Grand Public)</option>
                      <option value="provider">Prestataire (Étudiant)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Mot de passe (8 caractères min.)</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0c1221] border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isRegistering ? "Enregistrement..." : "Créer mon compte"}</span>
                </button>
              </form>
            )}
          </div>

          {DEMO_MODE && (
          <>
          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Developer Quick Switcher */}
          <div className="space-y-2.5">
            <span className="block text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest text-left">
              Connexion Rapide (Comptes Démo)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('aline.ngo@gmail.com')}
                className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1221] hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-200">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" className="w-full h-full object-cover" alt="Client" />
                </div>
                <span className="text-[8px] font-black text-slate-700 dark:text-slate-300">Aline (Client)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('arnaud.ngassa@gmail.com')}
                className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1221] hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden border border-slate-200">
                  <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=50" className="w-full h-full object-cover" alt="Provider" />
                </div>
                <span className="text-[8px] font-black text-slate-700 dark:text-slate-300">Arnaud (Student)</span>
              </button>
            </div>
          </div>

          </>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-200/80 dark:border-slate-800/60 text-center text-[9px] font-mono tracking-widest text-slate-400 uppercase">
        © 2026 STUD'S SERVICES EBOLOWA • TOUS DROITS RÉSERVÉS
      </footer>

    </div>
  );
};
