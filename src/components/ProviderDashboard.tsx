/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TabBar } from './TabBar';
import { Briefcase as TbBriefcase, Coins as TbCoins, CalendarDays as TbCal, MessageCircle as TbChat } from 'lucide-react';
import { readNfcTag, nfcSupported } from '../lib/nfc';
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { MiniDashboardHeader } from './MiniDashboardHeader';
import { Order, ProviderAvailability } from '../types';
import { ChatComponent } from './ChatComponent';
import {
  Sparkles,
  DollarSign,
  Star,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  TrendingUp,
  Cpu,
  Bookmark,
  BookOpen,
  Calendar,
  Wallet,
  Smartphone,
  MessageSquare,
  Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProviderDashboard: React.FC = () => {
  const {
    currentUser,
    orders,
    updateOrderStatus,
    cards,
    users,
    connectivityMode,
    validateOrderWithNfc,
    updateUserBalance,
    updateProviderAvailability
  } = useApp();

  const [activeTab, setActiveTab] = useState<'missions' | 'history' | 'chat' | 'availability'>('missions');
  const [selectedOrderForNfc, setSelectedOrderForNfc] = useState<string | null>(null);
  const [nfcCardInput, setNfcCardInput] = useState<string>('');
  const [nfcStatus, setNfcStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isNfcSubmitting, setIsNfcSubmitting] = useState(false);

  // Availability states
  const [myAvailabilities, setMyAvailabilities] = useState<ProviderAvailability[]>([]);
  const [newAvailDay, setNewAvailDay] = useState<string>('Lundi');
  const [newAvailSlot, setNewAvailSlot] = useState<string>('Toute la journée');
  const [newAvailIsAvailable, setNewAvailIsAvailable] = useState<boolean>(true);
  const [newAvailNotes, setNewAvailNotes] = useState<string>('');
  const [isSavingAvail, setIsSavingAvail] = useState<boolean>(false);

  // Withdrawal modal and form states
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawProvider, setWithdrawProvider] = useState<'mtn' | 'orange'>('mtn');
  const [withdrawPhone, setWithdrawPhone] = useState(currentUser ? currentUser.phone : '');
  const [withdrawalStep, setWithdrawalStep] = useState<'input' | 'processing' | 'success'>('input');
  const [withdrawalError, setWithdrawalError] = useState('');

  if (!currentUser) return null;

  // Sync availabilities when currentUser loads or changes
  React.useEffect(() => {
    if (currentUser?.availabilities) {
      setMyAvailabilities(currentUser.availabilities);
    }
  }, [currentUser]);

  const handleAddAvailability = () => {
    const newAvail: ProviderAvailability = {
      id: `avail-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      day: newAvailDay,
      timeSlot: newAvailSlot,
      isAvailable: newAvailIsAvailable,
      notes: newAvailNotes.trim() || undefined,
    };
    setMyAvailabilities(prev => [...prev, newAvail]);
    setNewAvailNotes('');
  };

  const handleRemoveAvailability = (id: string) => {
    setMyAvailabilities(prev => prev.filter(a => a.id !== id));
  };

  const handleSaveAvailabilities = async () => {
    setIsSavingAvail(true);
    const res = await updateProviderAvailability(currentUser.id, myAvailabilities);
    setIsSavingAvail(false);
    if (res.success) {
      alert("✅ Vos disponibilités ont été enregistrées avec succès et sont visibles par l'administration.");
    } else {
      alert("❌ Erreur : " + res.message);
    }
  };

  // Filter orders assigned to this student provider
  const myMissions = orders.filter(o => o.providerId === currentUser.id);
  const activeMissions = myMissions.filter(o => o.status === 'assigned' || o.status === 'in_progress');
  const completedMissions = myMissions.filter(o => o.status === 'completed');

  const targetOrderForNfc = orders.find(o => o.id === selectedOrderForNfc);
  const isStartScan = targetOrderForNfc && targetOrderForNfc.status !== 'in_progress';

  // Find this student's university/field of study (or mock it beautifully based on email domain)
  const getUniversityName = (email: string) => {
    if (email.includes('polytechnique')) return "École Normale Supérieure d'Ebolowa (Université d'Ebolowa)";
    if (email.includes('uy1')) return "Faculté des Sciences Juridiques et Politiques d'Ebolowa";
    if (email.includes('uy2')) return "Institut Supérieur d'Agriculture et du Management d'Ebolowa";
    return "Université d'Ebolowa";
  };

  const getStatusBadgeColor = (status: Order['status']) => {
    switch (status) {
      case 'assigned': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const myCard = cards.find(c => c.userId === currentUser.id);

  // Calculate stats
  const totalEarned = completedMissions.reduce((acc, m) => acc + Math.floor(m.servicePrice * 0.7), 0);
  const averageRating = completedMissions.filter(m => m.rating).length > 0
    ? (completedMissions.reduce((acc, m) => acc + (m.rating || 0), 0) / completedMissions.filter(m => m.rating).length).toFixed(1)
    : '5.0';

  // Handle mobile money withdrawal
  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalError('');

    const amountNum = parseInt(withdrawAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawalError('Veuillez saisir un montant de retrait valide.');
      return;
    }

    if (amountNum < 500) {
      setWithdrawalError('Le montant minimum de retrait est de 500 FCFA.');
      return;
    }

    if (amountNum > (currentUser.balance || 0)) {
      setWithdrawalError('Solde insuffisant pour effectuer ce retrait.');
      return;
    }

    if (!withdrawPhone || withdrawPhone.trim().length < 9) {
      setWithdrawalError('Veuillez saisir un numéro Mobile Money valide (ex: 6XXXXXXXX).');
      return;
    }

    setWithdrawalStep('processing');

    setTimeout(async () => {
      try {
        await updateUserBalance(currentUser.id, -amountNum);
        setWithdrawalStep('success');
      } catch (err) {
        console.error(err);
        setWithdrawalError('Une erreur est survenue lors de la communication avec l\'opérateur.');
        setWithdrawalStep('input');
      }
    }, 1500);
  };

  return (
     <div className="space-y-6">
       {/* Mini-tableau récapitulatif en haut du tableau de bord */}
       <MiniDashboardHeader role="provider" />

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Earnings & Wallet */}
        <div className="bento-card-emerald flex flex-col justify-between p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white text-slate-900 border border-slate-200/60 rounded-xl shrink-0">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[9px] text-emerald-800 uppercase font-black tracking-wider">Solde Retirable</p>
              <p className="text-base font-black text-slate-900 font-mono">{(currentUser.balance || 0).toLocaleString()} FCFA</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-emerald-200/50 pt-2 gap-2">
            <div className="text-left">
              <span className="text-[8px] text-emerald-700 font-bold uppercase block">Gains Cumulés</span>
              <span className="text-[11px] font-mono font-black text-slate-700">{totalEarned.toLocaleString()} FCFA</span>
            </div>
            <button
              onClick={() => {
                setWithdrawAmount('');
                setWithdrawalStep('input');
                setWithdrawalError('');
                setIsWithdrawModalOpen(true);
              }}
              className="px-3 py-1.5 bg-brand-700 hover:bg-brand-800 text-white font-black uppercase rounded-xl text-[9px] border border-slate-200/60 cursor-pointer shadow-sm border-slate-100/50 hover:translate-y-[-1px] active:translate-y-[1px] transition-all"
            >
              Retirer
            </button>
          </div>
        </div>

        {/* Rating */}
        <div className="bento-card flex items-center space-x-3.5">
          <div className="p-3 bg-yellow-100 text-slate-900 border border-slate-200/60 rounded-xl">
            <Star className="w-5 h-5 fill-yellow-400" />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Évaluation Moyenne</p>
            <p className="text-sm font-black text-slate-900 font-mono">{averageRating} / 5</p>
          </div>
        </div>

        {/* Completed count */}
        <div className="bento-card flex items-center space-x-3.5">
          <div className="p-3 bg-blue-100 text-slate-900 border border-slate-200/60 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Missions Accomplies</p>
            <p className="text-sm font-black text-slate-900 font-mono">{completedMissions.length}</p>
          </div>
        </div>

        {/* Academic status card */}
        <div className="bento-card-amber flex items-center space-x-3.5">
          <div className="p-3 bg-white text-slate-900 border border-slate-200/60 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="truncate flex-1">
            <p className="text-[9px] text-amber-800 uppercase font-black tracking-wider">Profil Estudiantin</p>
            <p className="text-xs font-black text-slate-900 truncate">{getUniversityName(currentUser.email)}</p>
          </div>
        </div>
      </div>

      {/* Inspirational Quote and Card Info */}
      <div className="bento-card-dark grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-8 space-y-2">
          <h3 className="font-extrabold text-lg flex items-center space-x-2 text-white">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>MON ESPACE ÉTUDIANT</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            "Chaque mission est une opportunité de valoriser vos compétences, d'acquérir de l'expérience et de financer sereinement vos études universitaires."
          </p>
        </div>

        <div className="md:col-span-4 flex justify-end">
          {myCard ? (
            <div className="bg-brand-800 border-2 border-white rounded-xl p-3 flex items-center space-x-3.5 w-full max-w-[240px]">
              <div className="p-2 bg-indigo-600 text-white rounded-lg border border-white">
                <Cpu className="w-4 h-4 animate-spin" />
              </div>
              <div className="font-mono">
                <p className="text-[8px] text-indigo-300 uppercase font-black">Badge NFC Validateur</p>
                <p className="text-xs font-black text-white">{myCard.id}</p>
                <p className="text-[9px] text-slate-400 font-bold">{myCard.scansCount} scans effectués</p>
              </div>
            </div>
          ) : (
            <div className="text-right text-xs text-slate-400 font-mono">
              Aucune carte NFC liée. Demandez un badge à l'administrateur.
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <TabBar
        active={activeTab}
        onChange={(id) => setActiveTab(id as any)}
        tabs={[
          { id: 'missions', label: 'Missions', icon: TbBriefcase, badge: activeMissions.length },
          { id: 'history', label: 'Revenus', icon: TbCoins },
          { id: 'availability', label: 'Agenda', icon: TbCal },
          { id: 'chat', label: 'Chat', icon: TbChat },
        ]}
      />

      <AnimatePresence mode="wait">
        {/* TAB 1: ACTIVE MISSIONS */}
        {activeTab === 'missions' && (
          <motion.div
            key="missions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4"
          >
            {activeMissions.length === 0 ? (
              <div className="bento-card text-center max-w-lg mx-auto p-12">
                <Bookmark className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <h3 className="font-extrabold text-lg text-slate-900 uppercase">Aucune mission pour le moment</h3>
                <p className="text-slate-600 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
                  Dès que l'administration vous attribue un nouveau service de proximité à Ebolowa, il apparaîtra ici en temps réel.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeMissions.map(mission => (
                  <div
                    key={mission.id}
                    className="bento-card flex flex-col md:flex-row md:items-center md:justify-between gap-5"
                  >
                    {/* Details */}
                    <div className="space-y-3.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-0.5 rounded font-bold">
                          REF: {mission.id}
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded border-2 uppercase tracking-wider ${
                          mission.status === 'assigned'
                            ? 'bg-indigo-100 text-indigo-900 border-indigo-900'
                            : 'bg-blue-100 text-blue-900 border-blue-900'
                        }`}>
                          {mission.status === 'assigned' ? 'À démarrer' : 'En cours'}
                        </span>
                        {mission.isOfflinePending && (
                          <span className="text-[9px] font-black bg-amber-500 border-2 border-amber-950 text-slate-950 px-2 py-0.5 rounded flex items-center space-x-0.5 animate-pulse">
                            <span>⏳ EN ATTENTE SYNC (EBOLOWA)</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-extrabold text-base text-slate-900 tracking-tight">{mission.serviceTitle}</h4>
                        <p className="text-xs text-slate-600 flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-800" />
                          <span>{mission.address}</span>
                        </p>
                        <p className="text-xs text-slate-600 flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-800" />
                          <span>Prévu le : {mission.scheduledDate} à {mission.scheduledTime}</span>
                        </p>
                        {mission.notes && (
                          <p className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-xl mt-2 border border-slate-200/60 font-sans">
                            📢 <strong>Consigne Client :</strong> {mission.notes}
                          </p>
                        )}
                      </div>

                      {/* Contact client box */}
                      <div className="flex items-center space-x-4 bento-card bg-slate-50 p-2.5 rounded-xl max-w-sm">
                        <div className="w-8 h-8 rounded-full bg-brand-700 border border-slate-200/60 text-white flex items-center justify-center font-bold text-xs uppercase">
                          {mission.clientName.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Client de proximité</p>
                          <p className="text-xs font-black text-slate-900">{mission.clientName}</p>
                        </div>
                        <a
                          href={`tel:${mission.clientPhone}`}
                          className="ml-auto p-1.5 bg-white text-slate-900 border border-slate-200/60 hover:bg-brand-800 hover:text-white rounded-lg transition-colors flex items-center justify-center shadow-sm border-slate-100/50"
                          title="Appeler le client"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Actions / Step update */}
                    <div className="flex flex-row md:flex-col justify-between items-center md:items-end border-t-2 md:border-t-0 border-slate-200 pt-3 md:pt-0 gap-3 min-w-[160px]">
                      <div className="text-left md:text-right">
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Ma Rémunération (70%)</p>
                        <p className="text-sm font-black text-slate-900 font-mono pt-0.5">
                          {Math.floor(mission.servicePrice * 0.7).toLocaleString()}{' '}
                          <span className="text-xs text-emerald-700 font-bold">FCFA</span>
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono">
                          Base: {mission.servicePrice.toLocaleString()} FCFA
                        </p>
                      </div>

                      <div className="flex flex-col space-y-2 w-full">
                        {mission.status === 'assigned' ? (
                          <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <button
                              onClick={() => updateOrderStatus(mission.id, 'in_progress')}
                              className="bento-button flex-1 text-[10px]"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Arrivée (Sans NFC)</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedOrderForNfc(mission.id);
                                setNfcCardInput('');
                                setNfcStatus(null);
                              }}
                              className="bento-button-light flex-1 border-blue-900 bg-blue-50 text-blue-950 font-black cursor-pointer text-[10px]"
                            >
                              <Cpu className="w-3.5 h-3.5 animate-pulse" />
                              <span>Débuter par NFC 📡</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <button
                              onClick={() => updateOrderStatus(mission.id, 'completed')}
                              className="bento-button flex-1 bg-emerald-600 border-emerald-900 hover:text-emerald-700 shadow text-[10px]"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Finaliser (Sans NFC)</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedOrderForNfc(mission.id);
                                setNfcCardInput('');
                                setNfcStatus(null);
                              }}
                              className="bento-button-light flex-1 border-blue-900 bg-blue-50 text-blue-950 font-black cursor-pointer text-[10px]"
                            >
                              <Cpu className="w-3.5 h-3.5 animate-pulse" />
                              <span>Valider par NFC 📡</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: COMPLETED HISTORY & PAYMENTS */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4"
          >
            {completedMissions.length === 0 ? (
              <div className="bento-card text-center max-w-lg mx-auto p-12">
                <TrendingUp className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <h3 className="font-extrabold text-lg text-slate-900 uppercase">Historique vierge</h3>
                <p className="text-slate-600 text-xs mt-2">
                  Une fois vos premières tâches complétées et validées, vous pourrez suivre vos versements en détail ici.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {completedMissions.map(m => (
                  <div
                    key={m.id}
                    className="bento-card flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-800 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded font-bold">
                        REF: {m.id}
                      </span>
                      <h5 className="font-extrabold text-sm text-slate-900 tracking-tight pt-1">{m.serviceTitle}</h5>
                      <p className="text-[11px] text-slate-500">
                        Client : {m.clientName} | Réalisé le : {m.scheduledDate}
                      </p>
                      {m.rating && (
                        <div className="flex items-center space-x-1.5 mt-2 bg-yellow-50 border border-slate-200/50 p-1 px-2.5 rounded-xl w-fit">
                          <div className="flex text-yellow-500">
                            {Array.from({ length: m.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400" />
                            ))}
                          </div>
                          <span className="text-[10px] italic text-slate-800 font-bold">"{m.comment}"</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 font-mono uppercase font-black">Versements reçus (70%)</p>
                      <p className="text-xs font-black text-emerald-700 font-mono">
                        +{Math.floor(m.servicePrice * 0.7).toLocaleString()} FCFA
                      </p>
                      <span className="text-[9px] font-mono uppercase font-black bg-emerald-100 border-2 border-emerald-900 text-emerald-950 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                        Versé sur solde
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <ChatComponent />
          </motion.div>
        )}

        {activeTab === 'availability' && (
          <motion.div
            key="availability"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6 max-w-xl mx-auto"
          >
            {/* Header Card */}
            <div className="bento-card bg-brand-700 text-white p-5 space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide">📅 Gérer mes Disponibilités</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Signalez vos jours et créneaux horaires libres pour que l'administration puisse vous proposer les meilleures missions sans perturber vos cours ou vos autres activités à Ebolowa.
              </p>
            </div>

            {/* Form for adding new slot */}
            <div className="bento-card bg-white p-5 space-y-4">
              <h4 className="font-extrabold text-xs uppercase text-slate-900 border-b pb-2">Ajouter un créneau de disponibilité</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Jour de la semaine</label>
                  <select
                    value={newAvailDay}
                    onChange={(e) => setNewAvailDay(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2 text-xs font-bold focus:outline-none"
                  >
                    <option value="Lundi">Lundi</option>
                    <option value="Mardi">Mardi</option>
                    <option value="Mercredi">Mercredi</option>
                    <option value="Jeudi">Jeudi</option>
                    <option value="Vendredi">Vendredi</option>
                    <option value="Samedi">Samedi</option>
                    <option value="Dimanche">Dimanche</option>
                    <option value="Tous les jours">Tous les jours</option>
                    <option value="Week-end">Week-end</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Créneau horaire</label>
                  <select
                    value={newAvailSlot}
                    onChange={(e) => setNewAvailSlot(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2 text-xs font-bold focus:outline-none"
                  >
                    <option value="Toute la journée">Toute la journée</option>
                    <option value="Matinée (08:00 - 12:00)">Matinée (08:00 - 12:00)</option>
                    <option value="Midi (12:00 - 14:00)">Midi (12:00 - 14:00)</option>
                    <option value="Après-midi (14:00 - 18:00)">Après-midi (14:00 - 18:00)</option>
                    <option value="Soirée (18:00 - 21:00)">Soirée (18:00 - 21:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Statut</label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setNewAvailIsAvailable(true)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                        newAvailIsAvailable 
                          ? 'bg-emerald-100 border-emerald-900 text-emerald-900' 
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      Disponible ✅
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAvailIsAvailable(false)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                        !newAvailIsAvailable 
                          ? 'bg-rose-100 border-rose-900 text-rose-900' 
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      Occupé ❌
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Notes / Occupation (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: Cours IUT d'Ebolowa, examen..."
                    value={newAvailNotes}
                    onChange={(e) => setNewAvailNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddAvailability}
                className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-black rounded-xl text-xs transition-all shadow-[3px_3px_0px_rgba(0,0,0,1)] cursor-pointer text-center"
              >
                + Ajouter ce créneau
              </button>
            </div>

            {/* List of current availabilities */}
            <div className="bento-card bg-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-extrabold text-xs uppercase text-slate-900">Vos créneaux de disponibilité</h4>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold font-mono">
                  {myAvailabilities.length} créneau(x)
                </span>
              </div>

              {myAvailabilities.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400 italic">Aucune disponibilité enregistrée. Vous êtes considéré comme disponible à tout moment par défaut.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myAvailabilities.map((avail) => (
                    <div 
                      key={avail.id} 
                      className={`p-3 border-2 rounded-xl flex justify-between items-center transition-all ${
                        avail.isAvailable 
                          ? 'bg-emerald-50/45 border-emerald-900 text-emerald-950' 
                          : 'bg-rose-50/45 border-rose-900 text-rose-950'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-black text-xs">{avail.day}</span>
                          <span className="text-[10px] text-slate-500 font-medium">•</span>
                          <span className="text-[10px] font-mono font-bold uppercase">{avail.timeSlot}</span>
                        </div>
                        {avail.notes && (
                          <p className="text-[10px] text-slate-500 italic font-medium">✏️ {avail.notes}</p>
                        )}
                        <span className={`inline-block text-[8px] uppercase font-black px-1.5 py-0.5 rounded-md border mt-1 ${
                          avail.isAvailable 
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-900' 
                            : 'bg-rose-100 text-rose-900 border-rose-900'
                        }`}>
                          {avail.isAvailable ? 'Disponible' : 'Occupé'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAvailability(avail.id)}
                        className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200/60 rounded-lg transition-all shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
                        title="Supprimer ce créneau"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveAvailabilities}
                disabled={isSavingAvail}
                className={`w-full py-2.5 ${
                  isSavingAvail ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                } text-white font-black rounded-xl text-xs transition-all cursor-pointer text-center`}
              >
                {isSavingAvail ? 'Sauvegarde...' : '💾 Enregistrer définitivement'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive NFC Certification Modal */}
      <AnimatePresence>
        {selectedOrderForNfc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brand-700/60 backdrop-blur-sm" onClick={() => setSelectedOrderForNfc(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200/80 space-y-4 text-center font-sans"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl border border-slate-200/60 flex items-center justify-center mx-auto shadow-sm">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">
                  {isStartScan ? "Début de Service (Scan NFC Client)" : "Validation de Fin (Scan NFC Client)"}
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  {isStartScan 
                    ? "Scannez la carte intelligente du client pour valider et annoncer le début officiel du service." 
                    : "Scannez la carte intelligente du client pour certifier la fin du service et débloquer les fonds."}
                </p>
              </div>

              {nfcStatus ? (
                <div className={`p-4 border-2 rounded-2xl text-left space-y-2 ${
                  nfcStatus.success ? 'bg-emerald-50 border-emerald-900 text-emerald-950' : 'bg-rose-50 border-rose-900 text-rose-950'
                }`}>
                  <p className="text-xs font-black uppercase">
                    {nfcStatus.success ? '✅ Certification Validée' : '⚠️ Erreur de validation'}
                  </p>
                  <p className="text-[11px] leading-relaxed font-medium">{nfcStatus.message}</p>
                  {nfcStatus.success && (
                    <button
                      onClick={() => setSelectedOrderForNfc(null)}
                      className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 border border-slate-200/60 text-white font-black rounded-xl text-[10px] uppercase cursor-pointer"
                    >
                      Terminer
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={isNfcSubmitting}
                      onClick={async () => {
                        setIsNfcSubmitting(true);
                        setNfcStatus(null);
                        try {
                          const tag = await readNfcTag();
                          if (!tag.text) throw new Error("Cette carte n'est pas une carte STUD'S programmée.");
                          const result = await validateOrderWithNfc(tag.text, selectedOrderForNfc!, tag.serial);
                          setNfcStatus(result);
                        } catch (e: any) {
                          setNfcStatus({ success: false, message: e?.message || 'Erreur de lecture NFC.' });
                        } finally {
                          setIsNfcSubmitting(false);
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl text-xs font-black uppercase shadow-sm cursor-pointer"
                    >
                      {isNfcSubmitting ? 'Approchez la carte du téléphone…' : '📡 Scanner la carte NFC du client'}
                    </button>
                    {!nfcSupported() && (
                      <p className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                        NFC web indisponible : utilisez Chrome sur Android avec le NFC activé (site en HTTPS).
                      </p>
                    )}
                  </div>
                </div>
              )}

              {!nfcStatus && (
                <button
                  onClick={() => setSelectedOrderForNfc(null)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all border border-slate-200 cursor-pointer"
                >
                  Annuler
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WITHDRAWAL MODAL */}
      <AnimatePresence>
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm"
              onClick={() => setIsWithdrawModalOpen(false)}
            />

            {/* Content card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-xl shadow-slate-200/60 p-6 border border-slate-200/60 space-y-4 font-sans z-10"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-emerald-500 border border-slate-200/50 rounded-xl text-slate-950">
                    <Wallet className="w-4 h-4" />
                  </span>
                  <h3 className="font-black text-sm uppercase text-slate-900 tracking-tight">Retrait de fonds</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="font-bold text-lg">✕</span>
                </button>
              </div>

              {withdrawalStep === 'input' && (
                <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                  <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 text-slate-800 text-xs">
                    <p className="font-bold text-emerald-900 uppercase tracking-wide text-[10px] mb-1">Votre solde disponible :</p>
                    <p className="text-xl font-black text-emerald-950 font-mono">{(currentUser.balance || 0).toLocaleString()} FCFA</p>
                    <p className="text-[9px] text-emerald-700 italic mt-1">Le retrait de fonds est instantané et sans frais vers votre compte Mobile Money.</p>
                  </div>

                  {/* Sourced Corporate Account Information */}
                  <div className="p-3 bg-brand-700 border-2 border-slate-950 rounded-xl text-white text-[10px] space-y-1.5 shadow-sm">
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Origine des Fonds de Trésorerie Centrale STUD'S</p>
                    <p className="font-semibold text-slate-200">
                      Vos gains sont sécurisés et reversés directement de carte SIM à carte SIM depuis nos comptes officiels :
                    </p>
                    <div className="flex flex-col gap-1 font-mono text-amber-400 font-bold text-[9px] pt-1">
                      <div className="flex justify-between border-b border-slate-800 pb-0.5">
                        <span>🟡 MTN MoMo Entreprise :</span>
                        <span>671711046</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🍊 Orange Money Entreprise :</span>
                        <span>696356036</span>
                      </div>
                    </div>
                  </div>

                  {withdrawalError && (
                    <div className="bg-rose-50 border-2 border-rose-500 text-rose-900 px-3 py-2.5 rounded-xl text-xs font-semibold">
                      ⚠️ {withdrawalError}
                    </div>
                  )}

                  {/* Provider selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Opérateur Mobile Money</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setWithdrawProvider('mtn')}
                        className={`p-2.5 border-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer text-xs ${
                          withdrawProvider === 'mtn'
                            ? 'bg-amber-100 border-amber-500 text-slate-900 font-black'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-extrabold text-amber-600">MTN MoMo</span>
                        <span className="text-[8px] uppercase tracking-wider text-slate-400 mt-0.5">Instanttrans</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setWithdrawProvider('orange')}
                        className={`p-2.5 border-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer text-xs ${
                          withdrawProvider === 'orange'
                            ? 'bg-orange-50 border-orange-500 text-slate-900 font-black'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-extrabold text-orange-600">Orange Money</span>
                        <span className="text-[8px] uppercase tracking-wider text-slate-400 mt-0.5">Orange OM</span>
                      </button>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Numéro de Téléphone (9 chiffres)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-slate-400 text-xs font-mono font-bold">+237</span>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 677889900"
                        value={withdrawPhone}
                        onChange={e => setWithdrawPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl pl-14 pr-3 py-2.5 text-xs font-mono font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Montant à Retirer (FCFA)</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        placeholder="Min 500"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 text-xs font-mono font-semibold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(String(currentUser.balance || 0))}
                        className="absolute right-2.5 top-1.5 px-2 py-1 bg-brand-700 hover:bg-brand-800 text-white border border-slate-200/50 text-[9px] uppercase font-bold rounded-lg cursor-pointer"
                      >
                        Tout retirer
                      </button>
                    </div>
                  </div>

                  {/* Footer buttons */}
                  <div className="flex space-x-3 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setIsWithdrawModalOpen(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/60 font-extrabold rounded-xl text-xs transition-all cursor-pointer text-center"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-black rounded-xl text-xs transition-all shadow-sm cursor-pointer text-center"
                    >
                      Valider le Retrait
                    </button>
                  </div>
                </form>
              )}

              {withdrawalStep === 'processing' && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <div className="space-y-1">
                    <h4 className="font-black text-xs uppercase text-slate-900">Transfert de fonds en cours...</h4>
                    <p className="text-[10px] text-slate-500 max-w-[280px]">Veuillez patienter pendant que le réseau Mobile Money de l'opérateur traite votre demande.</p>
                  </div>
                </div>
              )}

              {withdrawalStep === 'success' && (
                <div className="py-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-emerald-100 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-sm uppercase text-slate-900">Retrait Réussi ! 🎉</h4>
                    <p className="text-[10px] text-slate-500 max-w-[300px]">
                      Le montant de <span className="font-bold text-slate-900 font-mono">{parseInt(withdrawAmount).toLocaleString()} FCFA</span> a été transféré instantanément sur votre compte 
                      <span className="font-bold text-slate-900"> {withdrawProvider === 'mtn' ? 'MTN MoMo' : 'Orange Money'}</span> (+237 {withdrawPhone}).
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold">Votre nouveau solde est de <span className="font-bold text-emerald-700 font-mono">{(currentUser.balance || 0).toLocaleString()} FCFA</span>.</p>
                  </div>
                  <button
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="w-full py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-black rounded-xl text-xs transition-all shadow-sm cursor-pointer text-center"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
