import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { apiFetch as fetch } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Smartphone,
  CreditCard,
  CheckCircle,
  Award,
  Send,
  WashingMachine,
  ArrowRight,
  Gift,
  Zap,
  Info
} from 'lucide-react';

interface Message {
  role: 'user' | 'alene';
  text: string;
}

export function AleneWidget() {
  const { currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'chat'>('guide');
  const [slideIndex, setSlideIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: 'alene',
      text: "Bonjour ! Je suis Alene, ton assistante virtuelle. 🌟 Pose-moi n'importe quelle question sur l'usage de STUD'S, la validation de tes services par carte NFC ou le paiement de tes commandes !"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-trigger guide on first connection (based on localStorage)
  useEffect(() => {
    if (currentUser?.role === 'client') {
      const onboardingShown = localStorage.getItem(`onboarding_alene_shown_${currentUser.id}`);
      if (!onboardingShown) {
        // Open the widget automatically for a dynamic welcome experience!
        setTimeout(() => {
          setIsOpen(true);
          setActiveTab('guide');
          setSlideIndex(0);
          localStorage.setItem(`onboarding_alene_shown_${currentUser.id}`, 'true');
        }, 1500);
      }
    }
  }, [currentUser]);

  // Show tooltip periodically to attract attention
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
      // hide after 6s
      setTimeout(() => setShowTooltip(false), 6000);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, loading]);

  if (!currentUser || currentUser.role !== 'client') return null;

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');
    setLoading(true);

    try {
      // Map previous messages to a simple history format
      const history = chatMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await fetch('/api/alene/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history })
      });

      const data = await res.json();
      if (data.success && data.text) {
        setChatMessages(prev => [...prev, { role: 'alene', text: data.text }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'alene', text: "Oups, j'ai rencontré un petit problème réseau. Réessaie, s'il te plaît !" }]);
      }
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'alene', text: "Pardon, la connexion avec mon cerveau IA a été coupée momentanément. Es-tu sûr d'être connecté ?" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const quickQuestions = [
    "Comment réserver un service ?",
    "C'est quoi la STUD'S Card NFC ?",
    "Comment payer ma commande ?",
    "Comment marche la fidélité ?"
  ];

  const slides = [
    {
      title: "Bienvenue sur STUD'S ! 🌴",
      subtitle: "Je suis Alene, ton IA d'accompagnement",
      icon: <Sparkles className="w-8 h-8 text-amber-500 animate-spin-slow" />,
      content: "Bienvenue à Ebolowa ! STUD'S connecte des étudiants travailleurs avec des clients pour des services de proximité écologiques. En tant que client, laisse-moi te montrer en 4 étapes simples comment l'application fonctionne.",
      visual: (
        <div className="relative h-28 w-full bg-blue-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200/60 mt-2">
          <motion.div 
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="flex flex-col items-center"
          >
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-amber-200 border border-slate-200/60 rounded-full flex items-center justify-center shadow-sm border-slate-100/50 overflow-hidden">
              <span className="text-2xl">🤖</span>
            </div>
            <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider mt-1">Alene en ligne</span>
          </motion.div>
          <div className="absolute top-2 right-2 flex space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      )
    },
    {
      title: "1. Réserver un Éco-Service 🧺",
      subtitle: "Simple, rapide et éco-responsable",
      icon: <WashingMachine className="w-8 h-8 text-blue-500" />,
      content: "Rends-toi dans l'onglet 'Catalogue'. Clique sur la prestation souhaitée (lessive, repassage, ménage, soutien scolaire...). Indique la date, l'heure, ton quartier à Ebolowa (Mekalat, Nko'ovos, etc.) et valide ta commande !",
      visual: (
        <div className="relative h-28 w-full bg-indigo-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200/60 mt-2 p-2">
          <div className="bg-white border border-slate-200/60 rounded-xl p-2 w-48 shadow-sm border-slate-100/50 flex justify-between items-center relative">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 border border-slate-200/50">
                <WashingMachine className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black text-slate-800">Lessive & Repassage</p>
                <p className="text-[8px] font-bold text-slate-500">5 000 FCFA</p>
              </div>
            </div>
            <motion.button 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="px-2 py-1 bg-blue-600 text-[8px] text-white font-extrabold rounded-lg border border-slate-950 shadow-sm"
            >
              Réserver
            </motion.button>
          </div>
        </div>
      )
    },
    {
      title: "2. Le Double Scan NFC 📡",
      subtitle: "La STUD'S Card pour certifier la qualité",
      icon: <Smartphone className="w-8 h-8 text-emerald-500" />,
      content: "Chaque client possède sa STUD'S Card NFC. Quand le prestataire arrive, tu scannes ta carte sur son smartphone pour valider le début de la mission. Une fois terminé, rescannes une seconde fois pour certifier et débloquer ses fonds !",
      visual: (
        <div className="relative h-28 w-full bg-emerald-50 rounded-2xl flex items-center justify-around overflow-hidden border border-slate-200/60 mt-2 p-2">
          {/* Card element */}
          <motion.div 
            animate={{ x: [-20, 20, -20] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-14 h-20 bg-gradient-to-tr from-emerald-600 to-emerald-400 border border-slate-200/60 rounded-xl p-1 shadow-sm border-slate-100/50 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <span className="text-[6px] font-black text-white">STUD'S</span>
              <span className="text-[8px]">📡</span>
            </div>
            <div className="w-4 h-4 rounded-full bg-white/20" />
            <span className="text-[5px] font-mono text-white/95">NFC UID: ACTIVE</span>
          </motion.div>

          <span className="text-slate-400 text-lg">➔</span>

          {/* Smartphone element */}
          <div className="w-12 h-20 bg-brand-800 border border-slate-200/60 rounded-xl p-1 relative flex flex-col justify-between">
            <div className="w-4 h-1 bg-brand-700 rounded-full mx-auto" />
            <motion.div 
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-emerald-500 text-[6px] font-black text-slate-950 p-1 text-center rounded border border-emerald-900 uppercase"
            >
              Scan Réussi !
            </motion.div>
            <div className="w-1.5 h-1.5 bg-brand-900 rounded-full mx-auto" />
          </div>
        </div>
      )
    },
    {
      title: "3. Payer sa commande 💳",
      subtitle: "Sécurisé par MTN ou Orange",
      icon: <CreditCard className="w-8 h-8 text-rose-500" />,
      content: "Après ta réservation, ouvre le bouton « Paiements » : envoie le montant par MTN MoMo (671 711 046) ou Orange Money (696 356 036), saisis l'identifiant de transaction reçu par SMS et valide. Tu peux aussi payer en espèces au prestataire puis le déclarer. L'équipe STUD'S confirme ton paiement.",
      visual: (
        <div className="relative h-28 w-full bg-rose-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200/60 mt-2 p-1">
          <div className="flex space-x-2">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-amber-400 border border-slate-200/60 rounded-xl p-2 w-18 text-center text-slate-950 shadow-sm border-slate-100/50"
            >
              <p className="text-[8px] font-black">MTN MoMo</p>
              <div className="w-4 h-4 bg-yellow-100 rounded-full mx-auto mt-1 flex items-center justify-center">
                <span className="text-[6px]">💛</span>
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-orange-500 border border-slate-200/60 rounded-xl p-2 w-18 text-center text-white shadow-sm border-slate-100/50"
            >
              <p className="text-[8px] font-black">Orange Money</p>
              <div className="w-4 h-4 bg-orange-100 rounded-full mx-auto mt-1 flex items-center justify-center">
                <span className="text-[6px]">🧡</span>
              </div>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      title: "4. Programme Fidélité 🎁",
      subtitle: "Gagnez des points à chaque scan",
      icon: <Award className="w-8 h-8 text-purple-500 animate-pulse" />,
      content: "Chaque service validé par NFC te rapporte 10% de sa valeur en points de fidélité. Accumule ces points et convertis-les contre des prestations 100% gratuites pour soutenir les étudiants d'Ebolowa !",
      visual: (
        <div className="relative h-28 w-full bg-purple-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200/60 mt-2 p-1">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="flex flex-col items-center bg-white border border-slate-200/60 rounded-2xl p-2.5 shadow-sm border-slate-100/50"
          >
            <div className="p-2 bg-purple-100 rounded-full border border-purple-200">
              <Gift className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-[9px] font-black text-slate-800 uppercase tracking-wider mt-1">+120 Points</span>
          </motion.div>
        </div>
      )
    }
  ];

  return (
    <>
      {/* Floating Button for Widget */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30 flex flex-col items-end">
        {/* Animated Tooltip / Speech bubble */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="bg-brand-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl border border-slate-200/60 shadow-[4px_4px_0px_rgba(245,158,11,1)] mb-3 mr-1 relative max-w-[200px] text-center"
            >
              <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-brand-700 border-r-2 border-b-2 border-slate-900 rotate-45" />
              👋 Salut ! Je suis <span className="text-amber-400 font-extrabold">Alene</span>. Laisse-moi t'aider à utiliser l'appli !
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger Avatar Button */}
        <motion.button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className={`w-14 h-14 rounded-full border border-slate-200/80 shadow-lg shadow-slate-100 flex items-center justify-center relative cursor-pointer overflow-hidden transition-colors ${
            isOpen ? 'bg-rose-400 hover:bg-rose-500' : 'bg-amber-400 hover:bg-amber-500'
          }`}
          aria-label="Assistant Alene"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-slate-950" />
          ) : (
            <div className="relative flex items-center justify-center w-full h-full">
              <span className="text-2xl animate-bounce mt-1">🤖</span>
              <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 border border-slate-200/60 rounded-full" />
              <span className="absolute bottom-0 bg-brand-900 text-[7px] text-white font-black px-1 rounded border border-slate-800 uppercase tracking-wider">Alene</span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Main Panel Console */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-36 md:bottom-24 right-4 md:right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[540px] bg-white border border-slate-200/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header section */}
            <div className="p-4 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 bg-amber-400 border border-slate-200/60 rounded-full flex items-center justify-center shadow-sm relative overflow-hidden">
                  <span className="text-xl">🤖</span>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-slate-200/60 rounded-full" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">Alene • Coach IA</h4>
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Prête à t'aider</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg border border-slate-200/60 hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-slate-950" />
              </button>
            </div>

            {/* Sub-tab selection */}
            <div className="grid grid-cols-2 border-b-2 border-slate-900 text-xs font-extrabold uppercase">
              <button
                onClick={() => setActiveTab('guide')}
                className={`py-2.5 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                  activeTab === 'guide'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>📖 Mode d'emploi</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-2.5 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>💬 Discussion</span>
              </button>
            </div>

            {/* Dynamic Content Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 flex flex-col justify-between">
              {activeTab === 'guide' ? (
                /* Onboarding Guide slide view */
                <div className="flex-1 flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-brand-700 text-white rounded-lg text-[8px] font-black uppercase tracking-wider">
                        Étape {slideIndex + 1} sur {slides.length}
                      </span>
                      <div className="flex space-x-1">
                        {slides.map((_, i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full border border-slate-200/50 ${
                              i === slideIndex ? 'bg-amber-400' : 'bg-white'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center space-x-2">
                        {slides[slideIndex].icon}
                        <div>
                          <h5 className="font-extrabold text-xs text-slate-900">{slides[slideIndex].title}</h5>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                            {slides[slideIndex].subtitle}
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] font-medium text-slate-600 leading-relaxed font-sans">
                        {slides[slideIndex].content}
                      </p>
                    </div>

                    {/* Animated visual frame */}
                    {slides[slideIndex].visual}
                  </div>

                  {/* Guide Navigation footer buttons */}
                  <div className="flex items-center justify-between border-t border-slate-200 pt-3 mt-4">
                    <button
                      disabled={slideIndex === 0}
                      onClick={() => setSlideIndex(prev => prev - 1)}
                      className="px-3 py-1.5 bg-white border border-slate-200/60 text-[10px] font-extrabold uppercase rounded-lg shadow-sm hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Retour</span>
                    </button>

                    {slideIndex < slides.length - 1 ? (
                      <button
                        onClick={() => setSlideIndex(prev => prev + 1)}
                        className="px-4 py-1.5 bg-amber-400 border border-slate-200/60 text-[10px] text-slate-950 font-black uppercase rounded-lg shadow-sm border-slate-100/50 hover:bg-amber-500 transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <span>Suivant</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveTab('chat');
                          setChatMessages(prev => [
                            ...prev,
                            {
                              role: 'alene',
                              text: "Génial ! Tu connais maintenant le fonctionnement de STUD'S sur le bout des doigts. 🚀 As-tu une question particulière à me poser ?"
                            }
                          ]);
                        }}
                        className="px-4 py-1.5 bg-blue-600 border border-slate-200/60 text-[10px] text-white font-black uppercase rounded-lg shadow-sm border-slate-100/50 hover:bg-blue-700 transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <span>Discuter</span>
                        <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* AI Chat room interface */
                <div className="flex-1 flex flex-col justify-between h-full max-h-full overflow-hidden">
                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
                    {chatMessages.map((msg, idx) => {
                      const isAlene = msg.role === 'alene';
                      return (
                        <div
                          key={idx}
                          className={`flex items-start space-x-2 ${
                            isAlene ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          {isAlene && (
                            <div className="w-6 h-6 rounded-full bg-amber-400 border border-slate-200/50 flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">
                              🤖
                            </div>
                          )}
                          <div className="max-w-[80%]">
                            <div
                              className={`p-2.5 rounded-2xl border-2 text-[10.5px] leading-relaxed font-sans shadow-sm whitespace-pre-line ${
                                isAlene
                                  ? 'bg-amber-50 text-slate-800 border-slate-900 rounded-tl-none'
                                  : 'bg-blue-600 text-white border-blue-900 rounded-tr-none'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {loading && (
                      <div className="flex items-start space-x-2 justify-start">
                        <div className="w-6 h-6 rounded-full bg-amber-400 border border-slate-200/50 flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5 animate-bounce">
                          🤖
                        </div>
                        <div className="p-2.5 bg-slate-100 border-2 border-slate-200 text-slate-500 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Pre-configured Quick reply questions */}
                  {chatMessages.length === 1 && !loading && (
                    <div className="mb-2.5 space-y-1 bg-white p-2 border border-slate-200/60 rounded-xl shadow-sm">
                      <p className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider text-left pl-1">Questions fréquentes :</p>
                      <div className="flex flex-wrap gap-1.5">
                        {quickQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickQuestion(q)}
                            className="text-[9px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 hover:border-slate-800 rounded-lg px-2 py-1 transition-all cursor-pointer text-left"
                          >
                            ⚡ {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chat message input form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage(inputValue);
                    }}
                    className="flex items-center space-x-1.5 border-t border-slate-200 pt-2"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Pose ta question à Alene..."
                      className="flex-1 bg-white border border-slate-200/60 px-3 py-2 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !inputValue.trim()}
                      className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white border border-slate-200/60 rounded-xl shadow-sm disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Info bar at bottom */}
            <div className="px-4 py-1.5 bg-brand-700 text-[8px] text-white/80 font-mono tracking-wider flex items-center justify-between border-t border-slate-200/80">
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ALENE ASSISTANT IA</span>
              </span>
              <span>v1.2 • EBOLOWA ZONE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
