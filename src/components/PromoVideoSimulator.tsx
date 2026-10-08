import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Download, 
  UserPlus, 
  ShoppingBag, 
  CreditCard, 
  QrCode, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  Clock,
  Mic,
  Tv,
  ExternalLink,
  Percent,
  TrendingUp,
  Award,
  Share2,
  Send,
  FileText,
  Check,
  Copy,
  MessageSquare
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useApp } from '../AppContext';

interface VideoSegment {
  id: number;
  timeStart: number;
  timeEnd: number;
  title: string;
  subTitle: string;
  narration: string;
  visuals: React.ReactNode;
  icon: React.ReactNode;
}

export const PromoVideoSimulator: React.FC = () => {
  const { currentUser, cards } = useApp();
  const myCard = cards?.find(c => c.userId === currentUser?.id);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const totalDuration = 150; // 2 minutes 30 seconds = 150 seconds

  // Video segments
  const segments: VideoSegment[] = [
    {
      id: 1,
      timeStart: 0,
      timeEnd: 25,
      title: "1. Intro & Téléchargement",
      subTitle: "Accès instantané et installation en 2 secondes",
      narration: "Wassup la famille ! C'est Loïc ! Vous en avez marre de perdre du temps avec les corvées ménagères ou de galérer à trouver un bon répétiteur à Ebolowa ? Pas de panique ! STUD'S SERVICES débarque dans ton téléphone. Un clic sur notre site ou le flash de notre QR Code, et hop, l'application s'installe en 2 secondes chrono. C'est parti, viens je te montre !",
      icon: <Download className="w-5 h-5 text-blue-500" />,
      visuals: (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 overflow-hidden">
          {/* Animated floating circles */}
          <div className="absolute top-10 left-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />

          {/* Phone Frame Mockup */}
          <div className="relative w-[220px] h-[360px] bg-brand-900 rounded-[40px] border-4 border-slate-700 shadow-2xl flex flex-col p-4 items-center justify-between z-10">
            {/* Speaker & camera bar */}
            <div className="w-20 h-4 bg-brand-800 rounded-full mb-2 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-brand-700" />
            </div>

            {/* Simulated App Home */}
            <div className="flex-1 w-full bg-brand-700 rounded-2xl p-3 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                <span className="text-white font-black text-xl tracking-tighter">STUD'S</span>
              </div>
              <div className="text-center">
                <h3 className="text-white text-xs font-black uppercase">STUD'S Services</h3>
                <p className="text-[9px] text-slate-400">Ebolowa, Cameroun</p>
              </div>

              {/* Progress animation */}
              <div className="w-full bg-brand-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <motion.div 
                  className="bg-emerald-500 h-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="text-[8px] text-emerald-400 font-bold font-mono">Téléchargement de l'APK (4.8 Mo) : 100%</p>
            </div>

            {/* Android bar */}
            <div className="w-16 h-1.5 bg-brand-800 rounded-full mt-2" />
          </div>

          <div className="absolute bottom-6 flex items-center space-x-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-white font-bold font-mono">APK Léger • Économe en données</span>
          </div>
        </div>
      )
    },
    {
      id: 2,
      timeStart: 25,
      timeEnd: 50,
      title: "2. Inscription & Bonus NFC",
      subTitle: "Création de compte rapide et 15 Points offerts",
      narration: "Première étape : on se connecte ! Tu entres ton prénom, ton numéro de téléphone pour les paiements, et ton mot de passe. C'est tout ! Pas de paperasse inutile. En plus, si tu demandes ta carte physique NFC gratuite auprès de notre équipe d'administration sur le campus, tu reçois directement 15 points de bienvenue gratuits. C'est cadeau !",
      icon: <UserPlus className="w-5 h-5 text-amber-500" />,
      visuals: (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 p-6 overflow-hidden">
          <div className="absolute -top-10 right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-xl animate-pulse" />

          {/* Two panels: Signup Mockup & Card Mockup */}
          <div className="flex items-center space-x-4 z-10">
            {/* Phone Signup */}
            <div className="w-[170px] h-[280px] bg-brand-900 rounded-[30px] border-4 border-slate-700 shadow-xl flex flex-col p-3 items-center justify-between">
              <div className="w-12 h-3 bg-brand-800 rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-700" />
              </div>
              
              <div className="flex-1 w-full bg-brand-700 rounded-xl p-2 flex flex-col justify-center space-y-2 text-left">
                <p className="text-[9px] font-black text-amber-400 uppercase tracking-wider">Créer un compte</p>
                <div className="space-y-1">
                  <div className="bg-brand-800 p-1 rounded border border-slate-700">
                    <p className="text-[6px] text-slate-400">Prénom</p>
                    <p className="text-[8px] text-white font-bold">Boris Leroy</p>
                  </div>
                  <div className="bg-brand-800 p-1 rounded border border-slate-700">
                    <p className="text-[6px] text-slate-400">Téléphone Mobile Money</p>
                    <p className="text-[8px] text-white font-bold">699-123-456</p>
                  </div>
                  <div className="bg-brand-800 p-1 rounded border border-slate-700">
                    <p className="text-[6px] text-slate-400">Rôle</p>
                    <p className="text-[8px] text-white font-bold">Client</p>
                  </div>
                </div>
                <div className="bg-blue-600 text-white text-[8px] font-bold text-center py-1 rounded cursor-pointer">
                  Valider mon profil
                </div>
              </div>
              <div className="w-10 h-1 bg-brand-800 rounded-full" />
            </div>

            {/* NFC Card flying in */}
            <motion.div 
              className="w-[180px] h-[110px] bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl border-2 border-amber-400 p-3 shadow-2xl flex flex-col justify-between"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center border border-white/20">
                  <QrCode className="w-5 h-5 text-slate-950" />
                </div>
                <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 font-black">STUD'S CARD</span>
              </div>
              <div>
                <p className="text-[7px] text-slate-400 font-mono">STUD'S CLIENT PRIVILÈGE</p>
                <p className="text-[10px] font-black text-white font-mono tracking-wider">UID: NFC-884A293B</p>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[6px] text-emerald-400 font-bold font-mono">🟢 CARTE ACTIVE</span>
                <span className="text-[9px] font-black text-amber-400 font-mono">+15 PTS CADEAU</span>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-4 flex items-center space-x-1.5 bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[9px] text-amber-200 font-bold">Inscription Gratuite & Carte Offerte</span>
          </div>
        </div>
      )
    },
    {
      id: 3,
      timeStart: 50,
      timeEnd: 75,
      title: "3. Commande d'un Service",
      subTitle: "Choix fluide parmi le catalogue de proximité",
      narration: "Regarde-moi ce catalogue ! Ménage, repassage, plomberie, ou même des cours de soutien scolaire dispensés par les meilleurs étudiants de l'Université ! Tu choisis ton service, tu indiques tes préférences en deux clics, et l'application calcule instantanément le tarif étudiant le plus bas. Zéro surprise, tout est clair !",
      icon: <ShoppingBag className="w-5 h-5 text-emerald-500" />,
      visuals: (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-6 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl animate-pulse" />

          {/* Animated Service Cards Grid */}
          <div className="grid grid-cols-2 gap-3 z-10 max-w-[340px]">
            <motion.div 
              className="bg-brand-900 border-2 border-slate-800 p-3 rounded-xl space-y-2 shadow-lg"
              whileHover={{ scale: 1.03 }}
            >
              <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                <span className="text-xs">👕</span>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-white">Lessive Professionnelle</h4>
                <p className="text-[8px] text-slate-400">Lavage & Repassage à Mekalat</p>
              </div>
              <p className="text-[9px] font-bold text-emerald-400 font-mono">1,500 FCFA / Bassine</p>
            </motion.div>

            <motion.div 
              className="bg-brand-900 border-2 border-emerald-500 p-3 rounded-xl space-y-2 shadow-lg relative"
              initial={{ scale: 0.95 }}
              animate={{ scale: [0.95, 1.02, 0.95] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase border border-white">
                Sélectionné
              </div>
              <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                <span className="text-xs">📚</span>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-white">Cours de Répétition</h4>
                <p className="text-[8px] text-slate-400">Soutien scolaire personnalisé</p>
              </div>
              <div className="flex items-center space-x-1">
                <p className="text-[9px] font-bold text-slate-400 font-mono line-through">2,500</p>
                <p className="text-[9px] font-bold text-emerald-400 font-mono">2,250 FCFA <span className="text-[6px] text-blue-400 block font-sans">(-10% Carte NFC)</span></p>
              </div>
            </motion.div>

            <motion.div 
              className="bg-brand-900 border-2 border-slate-800 p-3 rounded-xl space-y-2 shadow-lg opacity-60"
            >
              <div className="w-7 h-7 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                <span className="text-xs">🧹</span>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-white">Ménage Studio</h4>
                <p className="text-[8px] text-slate-400">Nettoyage de fond en comble</p>
              </div>
              <p className="text-[9px] font-bold text-slate-400 font-mono">3,000 FCFA</p>
            </motion.div>

            <motion.div 
              className="bg-brand-900 border-2 border-slate-800 p-3 rounded-xl space-y-2 shadow-lg opacity-60"
            >
              <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center border border-amber-500/30">
                <span className="text-xs">📦</span>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-white">Déménagement</h4>
                <p className="text-[8px] text-slate-400">Aide au transport & cartons</p>
              </div>
              <p className="text-[9px] font-bold text-slate-400 font-mono">5,000 FCFA</p>
            </motion.div>
          </div>

          <div className="absolute bottom-4 flex items-center space-x-1.5 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[9px] text-emerald-200 font-bold">Tarifs transparents • Aucune majoration cachée</span>
          </div>
        </div>
      )
    },
    {
      id: 4,
      timeStart: 75,
      timeEnd: 100,
      title: "4. Paiement Mobile Sécurisé",
      subTitle: "Orange Money / MTN Mobile Money sécurisé",
      narration: "Pour le paiement, on est au Cameroun donc on fait simple et ultra sécurisé ! Orange Money ou MTN Mobile Money, c'est toi qui décides. Tu saisis ton numéro, tu valides la notification sur ton écran, et tes fonds sont bloqués en toute sécurité sur notre compte séquestre officiel. Le prestataire étudiant n'est payé que lorsque tu es entièrement satisfait !",
      icon: <CreditCard className="w-5 h-5 text-indigo-500" />,
      visuals: (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 overflow-hidden">
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl" />

          {/* MoMo Transaction Screen */}
          <div className="relative w-[280px] bg-brand-900 rounded-2xl border-2 border-slate-700 p-4 shadow-2xl space-y-3.5 z-10 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Passerelle de Paiement</h4>
              <span className="text-[7px] font-mono bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/40">SÉCURISÉ SSL</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-amber-500/10 border-2 border-amber-500 p-2 rounded-lg flex flex-col items-center justify-center space-y-1">
                <span className="text-xs">🍊</span>
                <span className="text-[8px] font-black text-white">Orange Money</span>
              </div>
              <div className="bg-brand-700 border border-slate-800 p-2 rounded-lg flex flex-col items-center justify-center space-y-1 opacity-70">
                <span className="text-xs">🟡</span>
                <span className="text-[8px] font-black text-slate-400">MTN MoMo</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[7px] uppercase font-bold text-slate-400">Numéro de débit Cameroun</label>
              <div className="bg-brand-700 border border-slate-800 p-2 rounded text-white font-mono text-[10px] flex justify-between">
                <span>+237 699-123-456</span>
                <span className="text-emerald-400">✓ Valide</span>
              </div>
            </div>

            <div className="bg-indigo-950 border border-indigo-800 p-2 rounded text-[8px] text-indigo-200 leading-relaxed font-medium">
              🔒 <strong>Compte Séquestre :</strong> Vos fonds restent en sécurité et ne sont libérés qu'après validation de la mission.
            </div>

            <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-center py-2 rounded text-[10px] uppercase shadow-lg shadow-emerald-500/20">
              Confirmer 2,250 FCFA
            </button>
          </div>

          <div className="absolute bottom-4 flex items-center space-x-1.5 bg-indigo-500/20 border border-indigo-500/40 px-3 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[9px] text-indigo-200 font-bold">Validation instantanée par code OTP</span>
          </div>
        </div>
      )
    },
    {
      id: 5,
      timeStart: 100,
      timeEnd: 130,
      title: "5. L'Expérience Magique NFC",
      subTitle: "Le double scan : sécurité & récompenses VIP",
      narration: "Et voilà la vraie magie : la carte physique STUD'S NFC ! Quand ton prestataire arrive, tu scannes ta carte sur son smartphone. Ça certifie le début du travail. Quand il finit, un second scan et bam ! Les fonds sont libérés pour l'étudiant. Mieux encore : chaque scan te donne des points de fidélité doublés et t'offre -10% de réduction permanente ! C'est ça l'expérience membre privilège !",
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      visuals: (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6 overflow-hidden">
          {/* Pulsing radar waves */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-purple-500/20 animate-ping" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-indigo-500/10 animate-pulse" />

          {/* Phone scanning NFC Card animation */}
          <div className="relative flex flex-col items-center z-10 space-y-4">
            
            {/* Hovering phone */}
            <motion.div 
              className="w-[110px] h-[190px] bg-brand-900 rounded-2xl border-2 border-purple-400 shadow-2xl p-2 flex flex-col justify-between items-center"
              animate={{ y: [0, 8, 0], rotate: [0, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-6 h-1 bg-brand-800 rounded-full" />
              <div className="flex-1 w-full bg-purple-950/40 rounded-xl p-1.5 flex flex-col items-center justify-center text-center space-y-1">
                <QrCode className="w-8 h-8 text-purple-400 animate-pulse" />
                <p className="text-[7px] text-white font-black uppercase">SCAN NFC EN COURS</p>
                <span className="text-[5px] text-slate-300 font-mono">Approchez la STUD'S Card</span>
              </div>
              <div className="w-4 h-0.5 bg-brand-800 rounded-full" />
            </motion.div>

            {/* Glowing Card underneath */}
            <motion.div 
              className="w-[160px] h-[95px] bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl border-2 border-amber-400 p-2.5 shadow-xl flex flex-col justify-between"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex justify-between items-start">
                <span className="text-[5px] text-white bg-amber-500/20 border border-amber-400/30 px-1 py-0.5 rounded font-black font-mono">CONTACTLESS CARD</span>
                <span className="text-[6px] text-amber-400 font-extrabold uppercase">STUD'S CLUB</span>
              </div>
              
              <div className="flex items-center space-x-1.5 py-1">
                <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-[8px]">✨</span>
                </div>
                <div>
                  <p className="text-[8px] font-black text-white font-mono">UID: NFC-884A293B</p>
                  <p className="text-[5px] text-emerald-400 font-black font-mono">MEMBER VALIDATION ACTIVATED</p>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-1">
                <span className="text-[5px] text-slate-400">Boris Leroy</span>
                <span className="text-[7px] font-black text-amber-400 font-mono">POINTS X2 (DOUBLÉS) 💎</span>
              </div>
            </motion.div>

          </div>

          {/* Success pop-up overlay */}
          <motion.div 
            className="absolute top-1/4 bg-brand-700/90 backdrop-blur-md border-2 border-emerald-500 text-white rounded-xl p-3 shadow-2xl z-20 flex items-center space-x-2.5 max-w-[220px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <p className="text-[9px] font-black text-emerald-400">Certification Validée !</p>
              <p className="text-[8px] text-slate-300 font-medium">Double points gagnés, prestataire crédité.</p>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: 6,
      timeStart: 130,
      timeEnd: 150,
      title: "6. Conclusion & Impact",
      subTitle: "Simplifier la vie & soutenir la jeunesse",
      narration: "Bref, STUD'S SERVICES, c'est rapide, c'est sécurisé, et ça fait travailler la jeunesse étudiante locale d'Ebolowa. Alors n'attends plus : télécharge l'appli, demande ton badge NFC gratuit, et rejoins la révolution dès aujourd'hui ! Ciao !",
      icon: <Award className="w-5 h-5 text-rose-500" />,
      visuals: (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 p-6 overflow-hidden">
          <div className="absolute top-5 left-10 w-24 h-24 bg-rose-500/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-5 right-10 w-28 h-28 bg-blue-500/10 rounded-full blur-xl animate-pulse" />

          {/* Highly stylized call to action board */}
          <div className="text-center space-y-4 max-w-[280px] z-10">
            <div className="inline-flex p-3 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-2xl border-2 border-white shadow-xl animate-bounce">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-white tracking-tight uppercase">STUD'S SERVICES</h3>
              <p className="text-[10px] text-slate-300 leading-normal">
                La plateforme révolutionnaire d'Ebolowa pour des services de proximité et l'insertion des étudiants.
              </p>
            </div>

            <div className="p-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl space-y-1">
              <p className="text-[8px] text-amber-400 font-black uppercase">🔥 Prêt à commencer ?</p>
              <p className="text-[10px] text-white font-black">Scan d'éco-badge & Carte NFC gratuite</p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-white text-slate-950 font-black py-2 rounded-xl text-[10px] uppercase border-2 border-white hover:bg-slate-100 flex items-center justify-center space-x-1">
                <span>Télécharger</span>
                <Download className="w-3.5 h-3.5" />
              </button>
              <button className="flex-1 bg-blue-600 text-white font-black py-2 rounded-xl text-[10px] uppercase border border-slate-200/60 hover:bg-blue-500 flex items-center justify-center space-x-1">
                <span>Nous contacter</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="absolute bottom-4 text-[8px] text-slate-400 font-mono">Conçu avec passion à Ebolowa • Cameroun</p>
        </div>
      )
    }
  ];

  // Auto progression timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prevTime => {
          const nextTime = prevTime + 1 * playbackSpeed;
          if (nextTime >= totalDuration) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return nextTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // Sync segment with current time
  useEffect(() => {
    const matchedIndex = segments.findIndex(
      seg => currentTime >= seg.timeStart && currentTime < seg.timeEnd
    );
    if (matchedIndex !== -1 && matchedIndex !== activeSegmentIndex) {
      setActiveSegmentIndex(matchedIndex);
    }
  }, [currentTime, activeSegmentIndex, segments]);

  // Text-To-Speech Narration triggers
  const speakCurrentNarration = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel current speech

      if (isMuted) return;

      const currentSegment = segments[activeSegmentIndex];
      const utterance = new SpeechSynthesisUtterance(currentSegment.narration);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.15 * playbackSpeed; // fast, young energetic tempo
      utterance.pitch = 1.2; // youthful pitch level
      
      utteranceRef.current = utterance;
      setSpeechSynthesisActive(true);
      window.speechSynthesis.speak(utterance);

      utterance.onend = () => {
        setSpeechSynthesisActive(false);
      };
    }
  };

  // Speak when active segment changes during active play
  useEffect(() => {
    if (isPlaying && !isMuted) {
      speakCurrentNarration();
    }
  }, [activeSegmentIndex, isPlaying]);

  // Speak when user manually toggles mute off while playing
  useEffect(() => {
    if (isPlaying && !isMuted) {
      speakCurrentNarration();
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isMuted]);

  const handlePlayPause = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      speakCurrentNarration();
    } else {
      setIsPlaying(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setActiveSegmentIndex(0);
    setIsPlaying(true);
    // Timeout to allow state change to register
    setTimeout(() => {
      speakCurrentNarration();
    }, 100);
  };

  const jumpToSegment = (index: number) => {
    const targetSegment = segments[index];
    setCurrentTime(targetSegment.timeStart);
    setActiveSegmentIndex(index);
    if (isPlaying) {
      // Small timeout for state sync
      setTimeout(() => {
        speakCurrentNarration();
      }, 100);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [isCopied, setIsCopied] = useState(false);
  const shareText = `Wassup ! Regarde ce projet de fou d'Ebolowa : STUD'S SERVICES ! Tu commandes un service (cours de répétition, ménage, repassage) en 2 clics avec ta carte physique NFC. C'est ultra rapide, sécurisé et l'argent est protégé. Regarde la vidéo démo interactive ici : ${window.location.origin}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareSMS = () => {
    const url = `sms:?body=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    const url = `mailto:?subject=STUD'S SERVICES Ebolowa - Vidéo Démo&body=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const generatePDFStoryboard = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(15, 23, 42); // dark blue/gray
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text("STUD'S SERVICES EBOLOWA", 15, 18);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text("Storyboard Officiel du Spot Publicitaire Commercial (Durée: 2m30)", 15, 26);
    doc.text("Voix-off : Loïc (22 ans) - Jeune, Dynamique et Chaleureux", 15, 33);
    
    // Body info
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("FICHE TECHNIQUE & STRATÉGIE MARKETING", 15, 50);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let y = 58;
    const metadata = [
      "• Objectif : Acquisition de nouveaux clients à Ebolowa (Mekalat, Nko'ovos, Campus).",
      "• Cible : Ménages, professionnels, parents d'élèves, commerçants locaux.",
      "• Message clé : Commandez en 2 clics des services de confiance, validez de manière magique via carte NFC.",
      "• Avantage exclusif : Réduction de -10% immédiate pour tout détenteur de la carte physique NFC."
    ];
    metadata.forEach(line => {
      doc.text(line, 15, y);
      y += 6;
    });
    
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text("DÉTAIL DES SÉQUENCES & DE LA VOIX OFF", 15, y);
    y += 8;
    
    segments.forEach((seg, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y, 180, 8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`${seg.title} (${formatTime(seg.timeStart)} - ${formatTime(seg.timeEnd)})`, 18, y + 5);
      y += 12;
      
      doc.setFont('helvetica', 'bold');
      doc.text("Visuel :", 15, y);
      doc.setFont('helvetica', 'normal');
      doc.text(seg.subTitle, 32, y);
      y += 6;
      
      doc.setFont('helvetica', 'bold');
      doc.text("Script Voix Off :", 15, y);
      doc.setFont('helvetica', 'oblique');
      
      const lines = doc.splitTextToSize(`"${seg.narration}"`, 170);
      lines.forEach((line: string) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 15, y + 5);
        y += 5;
      });
      
      y += 10;
    });
    
    // Page footer
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 282, 210, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text("STUD'S SERVICES EBOLOWA - Solution d'insertion professionnelle pour étudiants", 15, 291);
    doc.text("Généré le " + new Date().toLocaleDateString(), 160, 291);
    
    doc.save("Studs_Services_Ebolowa_Storyboard_Promo.pdf");
  };

  const downloadInteractiveVideoHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>STUD'S SERVICES - Spot Promotionnel Ebolowa</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Space+Grotesk:wght@500;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            background: #090d16;
        }
        .font-display {
            font-family: 'Space Grotesk', sans-serif;
        }
    </style>
</head>
<body class="text-white min-h-screen flex flex-col items-center justify-center p-4">

    <div class="max-w-md w-full bg-brand-700 rounded-3xl border-4 border-slate-950 overflow-hidden shadow-2xl flex flex-col my-8">
        
        <!-- Header -->
        <div class="p-4 bg-brand-900 border-b border-slate-800 flex justify-between items-center">
            <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xs font-display">S</div>
                <div>
                    <h1 class="text-xs font-black uppercase font-display tracking-tight">STUD'S SERVICES</h1>
                    <p class="text-[8px] text-slate-400">Spot Publicitaire Ebolowa</p>
                </div>
            </div>
            <span id="scene-tag" class="bg-blue-500/20 text-blue-400 text-[8px] font-mono font-bold px-2 py-0.5 rounded border border-blue-500/30">SCÈNE 1 / 6</span>
        </div>

        <!-- Video Screen -->
        <div id="video-screen" class="aspect-[16/10] bg-brand-900 relative flex items-center justify-center p-4">
            
            <!-- Slide 1 Content -->
            <div id="slide-1" class="slide-content w-full h-full flex flex-col items-center justify-center space-y-4 text-center">
                <div class="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                    <span class="text-white font-black text-sm">STUD'S</span>
                </div>
                <div>
                    <h3 class="text-white text-xs font-black uppercase">STUD'S SERVICES</h3>
                    <p class="text-[9px] text-slate-400">Installation instantanée en 2 secondes</p>
                </div>
                <div class="w-48 bg-brand-800 rounded-full h-2 overflow-hidden">
                    <div class="bg-emerald-500 h-full animate-[pulse_2s_infinite]" style="width: 100%"></div>
                </div>
                <p class="text-[8px] text-emerald-400 font-bold font-mono font-black">APK Léger • Économe en données • 100%</p>
            </div>

            <!-- Slide 2 Content -->
            <div id="slide-2" class="slide-content hidden w-full h-full flex flex-col items-center justify-center space-y-3 text-center">
                <div class="w-32 h-20 bg-brand-800 rounded-xl border-2 border-amber-400 p-2 flex flex-col justify-between text-left shadow-lg">
                    <div class="flex justify-between items-start">
                        <span class="text-[6px] bg-amber-400 text-slate-950 font-black px-1 rounded">STUD'S CARD</span>
                        <span class="text-[6px] text-emerald-400 font-bold">🟢 CONTACTLESS</span>
                    </div>
                    <p class="text-[9px] font-mono font-bold text-white leading-none">UID: NFC-884A293B</p>
                    <div class="flex justify-between items-end">
                        <span class="text-[5px] text-slate-400">Boris Leroy</span>
                        <span class="text-[8px] font-black text-amber-400">+15 PTS OFFERTS</span>
                    </div>
                </div>
                <p class="text-[9px] font-bold text-amber-200">Création de compte simple & carte NFC offerte</p>
            </div>

            <!-- Slide 3 Content -->
            <div id="slide-3" class="slide-content hidden w-full h-full flex flex-col items-center justify-center space-y-2">
                <div class="bg-brand-700 border border-emerald-500 rounded-xl p-3 max-w-[260px] space-y-1.5 text-left shadow-lg">
                    <span class="bg-emerald-500/20 text-emerald-400 text-[6px] font-black px-1.5 py-0.5 rounded">SÉLECTIONNÉ</span>
                    <h4 class="text-xs font-black text-white">📚 Cours de Répétition</h4>
                    <p class="text-[9px] text-slate-400 font-medium font-sans">Soutien scolaire personnalisé par nos meilleurs universitaires</p>
                    <p class="text-[10px] font-bold text-emerald-400">2,250 FCFA <span class="text-[7px] text-slate-400 line-through">2,500 FCFA</span> <span class="text-[7px] text-blue-400 font-bold">(-10% NFC)</span></p>
                </div>
            </div>

            <!-- Slide 4 Content -->
            <div id="slide-4" class="slide-content hidden w-full h-full flex flex-col items-center justify-center space-y-2">
                <div class="bg-brand-700 border border-slate-800 rounded-xl p-3 w-[240px] text-left space-y-2 shadow-lg">
                    <p class="text-[8px] font-black text-indigo-400 uppercase font-sans">Orange Money / MTN MoMo</p>
                    <p class="text-[11px] font-bold text-white font-mono font-black">Débit sécurisé : 2,250 FCFA</p>
                    <p class="text-[7px] text-slate-400 font-sans">Compte Séquestre : Argent protégé jusqu'à satisfaction complète.</p>
                </div>
            </div>

            <!-- Slide 5 Content -->
            <div id="slide-5" class="slide-content hidden w-full h-full flex flex-col items-center justify-center space-y-3">
                <div class="relative w-28 h-16 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl border-2 border-amber-400 p-2 flex flex-col justify-between text-left shadow-lg animate-pulse">
                    <span class="text-[6px] text-white font-bold">NFC VALIDATION ACTIVATED</span>
                    <span class="text-[9px] text-white font-mono font-bold font-black">DOUBLE POINTS FIDÉLITÉ 💎</span>
                </div>
                <div class="bg-emerald-500 text-slate-950 text-[8px] font-black px-2.5 py-1 rounded-full uppercase">
                    ✓ Certification NFC Double Scan Validée
                </div>
            </div>

            <!-- Slide 6 Content -->
            <div id="slide-6" class="slide-content hidden w-full h-full flex flex-col items-center justify-center space-y-3 text-center">
                <div class="inline-flex p-2.5 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-xl animate-bounce">
                    <span class="text-white text-sm">✨</span>
                </div>
                <h3 class="text-xs font-black uppercase font-display">STUD'S SERVICES</h3>
                <p class="text-[9px] text-slate-300 px-6 font-sans">La révolution d'Ebolowa pour des services de proximité professionnels et l'insertion des étudiants.</p>
                <div class="bg-blue-600 text-white text-[8px] font-bold px-4 py-1.5 rounded-full uppercase font-mono border border-slate-950">
                    Rejoignez l'aventure !
                </div>
            </div>

        </div>

        <!-- Video Controls -->
        <div class="p-4 bg-brand-900 flex flex-col space-y-3">
            <div class="flex items-center space-x-2">
                <span id="current-time-label" class="text-[9px] font-mono text-slate-400">0:00</span>
                <input id="timeline-slider" type="range" min="0" max="150" value="0" class="flex-1 accent-blue-500 h-1 bg-brand-800 rounded">
                <span class="text-[9px] font-mono text-slate-400">2:30</span>
            </div>

            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                    <button id="play-btn" class="bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight">Play ▶</button>
                    <button id="restart-btn" class="bg-brand-800 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded-xl text-xs font-black">🔄</button>
                </div>
                
                <button id="voice-btn" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase">🔊 Voix : active</button>
            </div>
        </div>

        <!-- Narration Box -->
        <div class="p-4 bg-brand-700 border-t border-slate-800 text-left">
            <p class="text-[9px] font-bold text-blue-400 uppercase tracking-wider mb-1">Loïc (Voix off active) :</p>
            <p id="narration-script" class="text-slate-300 text-[10.5px] leading-relaxed italic font-sans">
                "Wassup la famille ! C'est Loïc ! Vous en avez marre de perdre du temps avec les corvées ménagères ou de galérer à trouver un bon répétiteur à Ebolowa ? Pas de panique ! STUD'S SERVICES débarque dans ton téléphone."
            </p>
        </div>

    </div>

    <script>
        const segments = [
            {
                start: 0, end: 25, title: "1. Intro & Téléchargement",
                narration: "Wassup la famille ! C'est Loïc ! Vous en avez marre de perdre du temps avec les corvées ménagères ou de galérer à trouver un bon répétiteur à Ebolowa ? Pas de panique ! STUD'S SERVICES débarque dans ton téléphone. Un clic sur notre site ou le flash de notre QR Code, et hop, l'application s'installe en 2 secondes chrono. C'est parti, viens je te montre !"
            },
            {
                start: 25, end: 50, title: "2. Inscription & Bonus NFC",
                narration: "Première étape : on se connecte ! Tu entres ton prénom, ton numéro de téléphone pour les paiements, et ton mot de passe. C'est tout ! Pas de paperasse inutile. En plus, si tu demandes ta carte physique NFC gratuite auprès de notre équipe d'administration sur le campus, tu reçois directement 15 points de bienvenue gratuits. C'est cadeau !"
            },
            {
                start: 50, end: 75, title: "3. Commande d'un Service",
                narration: "Regarde-moi ce catalogue ! Ménage, repassage, plomberie, ou même des cours de soutien scolaire dispensés par les meilleurs étudiants de l'Université ! Tu choisis ton service, tu indiques tes préférences en deux clics, et l'application calcule instantanément le tarif étudiant le plus bas. Zéro surprise, tout est clair !"
            },
            {
                start: 75, end: 100, title: "4. Paiement Mobile Sécurisé",
                narration: "Pour le paiement, on est au Cameroun donc on fait simple et ultra sécurisé ! Orange Money ou MTN Mobile Money, c'est toi qui décides. Tu saisis ton numéro, tu valides la notification sur ton écran, et tes fonds sont bloqués en toute sécurité sur notre compte séquestre officiel. Le prestataire étudiant n'est payé que lorsque tu es entièrement satisfait !"
            },
            {
                start: 100, end: 130, title: "5. L'Expérience Magique NFC",
                narration: "Et voilà la vraie magie : la carte physique STUD'S NFC ! Quand ton prestataire arrive, tu scannes ta carte sur son smartphone. Ça certifie le début du travail. Quand il finit, un second scan et bam ! Les fonds sont libérés pour l'étudiant. Mieux encore : chaque scan te donne des points de fidélité doublés et t'offre -10% de réduction permanente ! C'est ça l'expérience membre privilège !"
            },
            {
                start: 130, end: 150, title: "6. Conclusion & Impact",
                narration: "Bref, STUD'S SERVICES, c'est rapide, c'est sécurisé, et ça fait travailler la jeunesse étudiante locale d'Ebolowa. Alors n'attends plus : télécharge l'appli, demande ton badge NFC gratuit, et rejoins la révolution dès aujourd'hui ! Ciao !"
            }
        ];

        let isPlaying = false;
        let currentTime = 0;
        let isMuted = false;
        let activeIndex = 0;
        let timer = null;

        const playBtn = document.getElementById('play-btn');
        const restartBtn = document.getElementById('restart-btn');
        const voiceBtn = document.getElementById('voice-btn');
        const slider = document.getElementById('timeline-slider');
        const currentLabel = document.getElementById('current-time-label');
        const narrationScript = document.getElementById('narration-script');
        const sceneTag = document.getElementById('scene-tag');

        function formatTime(s) {
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return m + ":" + sec.toString().padStart(2, '0');
        }

        function speak(text) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                if (isMuted) return;
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'fr-FR';
                utterance.rate = 1.15;
                utterance.pitch = 1.2;
                window.speechSynthesis.speak(utterance);
            }
        }

        function updateScreen(index) {
            activeIndex = index;
            sceneTag.innerText = "SCÈNE " + (index + 1) + " / 6";
            narrationScript.innerText = '"' + segments[index].narration + '"';
            
            // Hide all slides
            for(let i = 1; i <= 6; i++) {
                document.getElementById('slide-' + i).classList.add('hidden');
            }
            // Show active slide
            document.getElementById('slide-' + (index + 1)).classList.remove('hidden');
        }

        function tick() {
            if (!isPlaying) return;
            currentTime++;
            if (currentTime >= 150) {
                isPlaying = false;
                playBtn.innerText = "Play ▶";
                currentTime = 0;
                clearInterval(timer);
                return;
            }
            slider.value = currentTime;
            currentLabel.innerText = formatTime(currentTime);

            // Find matching segment
            const matchedIndex = segments.findIndex(s => currentTime >= s.start && currentTime < s.end);
            if (matchedIndex !== -1 && matchedIndex !== activeIndex) {
                updateScreen(matchedIndex);
                speak(segments[matchedIndex].narration);
            }
        }

        playBtn.addEventListener('click', () => {
            if (isPlaying) {
                isPlaying = false;
                playBtn.innerText = "Play ▶";
                clearInterval(timer);
                window.speechSynthesis.cancel();
            } else {
                isPlaying = true;
                playBtn.innerText = "Pause ⏸";
                speak(segments[activeIndex].narration);
                timer = setInterval(tick, 1000);
            }
        });

        restartBtn.addEventListener('click', () => {
            currentTime = 0;
            slider.value = 0;
            currentLabel.innerText = "0:00";
            updateScreen(0);
            if (isPlaying) {
                speak(segments[0].narration);
            }
        });

        voiceBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            if (isMuted) {
                voiceBtn.innerText = "🔇 Muet";
                voiceBtn.classList.replace('bg-blue-600', 'bg-red-600');
                window.speechSynthesis.cancel();
            } else {
                voiceBtn.innerText = "🔊 Voix : active";
                voiceBtn.classList.replace('bg-red-600', 'bg-blue-600');
                if (isPlaying) {
                    speak(segments[activeIndex].narration);
                }
            }
        });

        slider.addEventListener('input', (e) => {
            currentTime = parseInt(e.target.value);
            currentLabel.innerText = formatTime(currentTime);
            const matchedIndex = segments.findIndex(s => currentTime >= s.start && currentTime < s.end);
            if (matchedIndex !== -1) {
                updateScreen(matchedIndex);
                if (isPlaying) {
                    speak(segments[matchedIndex].narration);
                }
            }
        });
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "Studs_Services_Promo_Interactive_Ebolowa.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Pitch Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 border border-slate-200/80 rounded-3xl p-6 text-white shadow-[6px_6px_0px_rgba(15,23,42,1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <span className="bg-yellow-400 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-950">
              🎥 PROJECTION DE LA VIDÉO COMMERCIALE (2m 30s)
            </span>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight font-sans">
              STUD'S SERVICES : L'expérience Client Révolutionnaire
            </h2>
            <p className="text-xs text-blue-100 max-w-xl">
              Découvrez le spot promotionnel interactif conçu pour séduire et guider vos nouveaux clients à Ebolowa. De l'installation à la validation magique de la carte NFC !
            </p>
          </div>
          
          <div className="flex items-center space-x-2 bg-brand-900/40 border border-white/10 px-3.5 py-2 rounded-2xl shrink-0">
            <Mic className="w-4.5 h-4.5 text-yellow-400 animate-pulse" />
            <div className="text-left">
              <p className="text-[8px] uppercase font-black text-slate-400 font-mono">NARRATEUR JEUNE</p>
              <p className="text-[10px] font-black text-white">Voix de Loïc (22 ans)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand: The Main Player Container */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[6px_6px_0px_rgba(15,23,42,1)] flex flex-col">
            
            {/* The Visual Stage (Screen) */}
            <div className="aspect-[16/10] bg-brand-900 relative border-b border-slate-200/80 flex items-center justify-center">
              
              {/* Actual Active Slide Visual */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeSegmentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  {segments[activeSegmentIndex].visuals}
                </motion.div>
              </AnimatePresence>

              {/* Status HUD Overlays */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded-lg text-[9px] font-mono text-white flex items-center space-x-1.5 border border-white/10">
                <Tv className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-bold">SCÈNE {activeSegmentIndex + 1} / {segments.length}</span>
              </div>

              {speechSynthesisActive && (
                <div className="absolute top-3 right-3 bg-blue-600 text-white px-2.5 py-1 rounded-lg text-[8px] font-black tracking-wider uppercase flex items-center space-x-1 animate-pulse border border-slate-950">
                  <Mic className="w-3 h-3" />
                  <span>VOIX ACTIVE</span>
                </div>
              )}
            </div>

            {/* Video Controls Bar */}
            <div className="p-4 bg-brand-700 text-white flex flex-col space-y-3">
              
              {/* Timeline Progress Slider */}
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-mono font-bold text-slate-300">
                  {formatTime(currentTime)}
                </span>
                
                <div className="flex-1 relative group h-3 flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={totalDuration}
                    value={currentTime}
                    onChange={(e) => setCurrentTime(Number(e.target.value))}
                    className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  
                  {/* Segment Markers */}
                  {segments.map((seg, idx) => {
                    const leftPercent = (seg.timeStart / totalDuration) * 100;
                    return (
                      <div 
                        key={seg.id}
                        style={{ left: `${leftPercent}%` }}
                        className={`absolute w-1 h-3 rounded-full border-x border-slate-900 -translate-y-0.5 ${
                          currentTime >= seg.timeStart ? 'bg-blue-400' : 'bg-slate-500'
                        }`}
                        title={seg.title}
                      />
                    );
                  })}
                </div>

                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {formatTime(totalDuration)}
                </span>
              </div>

              {/* Controls and Knobs */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePlayPause}
                    className={`p-2.5 rounded-xl border-2 border-slate-950 shadow-sm text-slate-950 font-black flex items-center justify-center transition-all ${
                      isPlaying ? 'bg-yellow-400 hover:bg-yellow-300' : 'bg-emerald-400 hover:bg-emerald-300'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 fill-current" />}
                  </button>

                  <button
                    onClick={handleRestart}
                    className="p-2.5 rounded-xl border-2 border-slate-950 shadow-sm bg-brand-800 hover:bg-slate-700 text-white flex items-center justify-center transition-all"
                    title="Recommencer"
                  >
                    <RotateCcw className="w-4.5 h-4.5" />
                  </button>

                  <div className="h-6 w-[1px] bg-brand-800" />

                  {/* Speed Selector */}
                  <div className="flex items-center space-x-1">
                    {([1, 1.25, 1.5] as const).map(speed => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-2 py-1 rounded text-[9px] font-black border ${
                          playbackSpeed === speed 
                            ? 'bg-blue-600 border-blue-500 text-white' 
                            : 'bg-brand-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtitles & Volume Controller */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border-2 border-slate-950 shadow-[1px_1px_0px_rgba(0,0,0,1)] text-[9px] font-black tracking-wider uppercase transition-all ${
                      isMuted 
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300' 
                        : 'bg-blue-500/20 border-blue-500 text-blue-300'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isMuted ? "Sans Voix" : "Voix Activée"}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Narration Script (Youthful French Teleprompter) */}
            <div className="bg-slate-50 p-5 border-t-4 border-slate-900 text-left space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-black tracking-wider text-blue-600 flex items-center space-x-1.5 font-mono">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Transcription de la voix off (Loïc, 22 ans) :</span>
                </span>
                <span className="text-[9px] text-slate-400 font-mono italic">Langue : Français Camerounais Décontracté</span>
              </div>
              
              <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-md shadow-slate-100 min-h-[90px] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
                <p className="text-slate-800 text-xs font-bold leading-relaxed font-sans pl-1.5 italic">
                  "{segments[activeSegmentIndex].narration}"
                </p>
              </div>

              {/* Tips */}
              <div className="text-[9px] text-slate-500 leading-relaxed font-medium bg-blue-50 border border-blue-100 p-2.5 rounded-xl flex items-start space-x-2">
                <span className="text-xs">💡</span>
                <span>
                  <strong>Conseil d'intégration :</strong> Cette vidéo de 2min30 est idéale pour être placée en haut de votre page d'accueil ou partagée sur les réseaux sociaux d'Ebolowa (WhatsApp, TikTok, Facebook) pour acquérir de nouveaux clients en masse en démontrant la simplicité de la carte NFC.
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Hand: Scene Index & NFC Special Privileges */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* List of Scenes / Storyboard Timeline */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[6px_6px_0px_rgba(15,23,42,1)] space-y-4">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider pb-2 border-b-2 border-slate-100 flex items-center space-x-1.5">
              <span>📋</span>
              <span>SÉQUENCES DU SPOT PUBLICITAIRE</span>
            </h3>

            <div className="space-y-2.5">
              {segments.map((seg, idx) => {
                const isActive = activeSegmentIndex === idx;
                return (
                  <button
                    key={seg.id}
                    onClick={() => jumpToSegment(idx)}
                    className={`w-full text-left p-3 rounded-2xl border-2 transition-all flex items-start space-x-3 ${
                      isActive 
                        ? 'bg-brand-700 border-slate-950 text-white shadow-[3px_3px_0px_rgba(59,130,246,1)] scale-[1.01]' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300'
                    }`}
                  >
                    <span className={`p-1.5 rounded-xl border flex-shrink-0 ${
                      isActive ? 'bg-brand-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-500'
                    }`}>
                      {seg.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className={`text-[10px] font-black ${isActive ? 'text-blue-400' : 'text-slate-900'}`}>
                          {seg.title}
                        </p>
                        <span className="text-[8px] font-mono font-bold opacity-75">
                          {formatTime(seg.timeStart)} - {formatTime(seg.timeEnd)}
                        </span>
                      </div>
                      <p className={`text-[9px] mt-0.5 truncate ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                        {seg.subTitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special NFC Value Added Checklist Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-200/80 rounded-3xl p-5 text-white shadow-[6px_6px_0px_rgba(15,23,42,1)] space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-500/20 rounded-xl border border-blue-400/30">
                <Percent className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-[11px] font-black uppercase text-blue-400 tracking-wider">PLUS VALUE CARTE NFC</h4>
                <p className="text-[9px] text-slate-300">Privilèges par rapport aux clients standards</p>
              </div>
            </div>

            <div className="bg-brand-900/40 border border-white/10 p-3 rounded-2xl space-y-3">
              <p className="text-[10px] text-slate-200 leading-normal font-medium">
                Comme demandé, nous avons configuré et mis en place de réels avantages exclusifs pour les détenteurs de la carte physique intelligente NFC :
              </p>

              <div className="space-y-2.5">
                <div className="flex items-start space-x-2.5">
                  <span className="text-emerald-400 text-xs mt-0.5">✔</span>
                  <div>
                    <h5 className="text-[10px] font-black text-white">-10% De Réduction Immédiate</h5>
                    <p className="text-[9px] text-slate-400">Le catalogue de services s'ajuste automatiquement d'office si vous possédez la carte NFC.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <span className="text-emerald-400 text-xs mt-0.5">✔</span>
                  <div>
                    <h5 className="text-[10px] font-black text-white">Points Fidélité Doublés (Bonus x2)</h5>
                    <p className="text-[9px] text-slate-400">Gagnez le double de points à chaque transaction validée par double scan physique NFC.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <span className="text-emerald-400 text-xs mt-0.5">✔</span>
                  <div>
                    <h5 className="text-[10px] font-black text-white">Traitement VIP Prioritaire</h5>
                    <p className="text-[9px] text-slate-400">Vos demandes s'affichent avec un badge prioritaire spécial dans l'espace administratif et l'espace étudiant.</p>
                  </div>
                </div>
              </div>
            </div>

            {myCard ? (
              <div className="bg-emerald-500/10 border-2 border-dashed border-emerald-500/40 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[7px] text-emerald-400 uppercase font-bold">VOTRE STATUT ACTUEL</p>
                  <p className="text-[10px] font-black text-emerald-200">✨ Membre Club NFC Actif</p>
                </div>
                <span className="text-[11px] font-black text-emerald-400 font-mono">-{myCard.loyaltyPoints || 0} PTS</span>
              </div>
            ) : (
              <div className="bg-brand-900 p-3 rounded-2xl flex items-center justify-between border border-white/10">
                <div>
                  <p className="text-[7px] text-slate-400 uppercase font-bold">VOTRE STATUT ACTUEL</p>
                  <p className="text-[10px] font-bold text-slate-300">Aucune carte NFC liée</p>
                </div>
                <span className="text-[8px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded">Obtenir 15 PTS</span>
              </div>
            )}
          </div>

          {/* New Share & Download Panel */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[6px_6px_0px_rgba(15,23,42,1)] space-y-4">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider pb-2 border-b-2 border-slate-100 flex items-center space-x-1.5">
              <span>🚀</span>
              <span>PARTAGE & TÉLÉCHARGEMENT</span>
            </h3>

            <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
              Faites connaître <strong>STUD'S SERVICES</strong> ! Partagez notre spot de démonstration à vos proches d'Ebolowa ou téléchargez les fichiers directement dans votre téléphone :
            </p>

            <div className="space-y-2.5">
              {/* WhatsApp Share Button */}
              <button
                onClick={handleShareWhatsApp}
                className="w-full bg-[#25D366] text-white border border-slate-200/60 rounded-2xl p-3 font-black text-[11px] uppercase tracking-wide shadow-md shadow-slate-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Partager sur WhatsApp d'Ebolowa</span>
              </button>

              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className={`w-full border border-slate-200/60 rounded-2xl p-3 font-black text-[11px] uppercase tracking-wide shadow-md shadow-slate-100 transition-all flex items-center justify-center space-x-2 ${
                  isCopied ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                }`}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Lien de la Vidéo Copié !' : 'Copier le message commercial'}</span>
              </button>

              <div className="h-[2px] bg-slate-100 my-1" />

              {/* Download Standalone Video Applet Button */}
              <button
                onClick={downloadInteractiveVideoHTML}
                className="w-full bg-brand-700 text-white border-2 border-slate-950 rounded-2xl p-3 font-black text-[11px] uppercase tracking-wide shadow-[3px_3px_0px_rgba(59,130,246,1)] hover:bg-brand-800 transition-all flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Télécharger la Vidéo Interactive (.html)</span>
              </button>

              {/* Download Presentation PDF Button */}
              <button
                onClick={generatePDFStoryboard}
                className="w-full bg-rose-50 text-rose-900 border-2 border-rose-900 rounded-2xl p-3 font-black text-[11px] uppercase tracking-wide shadow-[3px_3px_0px_rgba(225,29,72,1)] hover:bg-rose-100 transition-all flex items-center justify-center space-x-2"
              >
                <FileText className="w-4 h-4 text-rose-600" />
                <span>Fiche Pitch Commercial & Storyboard (PDF)</span>
              </button>
            </div>

            {/* Quick social sharing shortcuts */}
            <div className="flex items-center justify-center gap-4 pt-1.5">
              <button
                onClick={handleShareSMS}
                className="text-slate-600 hover:text-blue-600 text-[10px] font-bold flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>SMS</span>
              </button>
              <span className="text-slate-200">|</span>
              <button
                onClick={handleShareEmail}
                className="text-slate-600 hover:text-blue-600 text-[10px] font-bold flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
