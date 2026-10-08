/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TabBar } from './TabBar';
import { LayoutDashboard as TbDash, ClipboardList as TbList, Users as TbUsers, Coins as TbCoins, Star as TbStar, MessageCircle as TbChat, Briefcase as TbBriefcase, Plug as TbPlug } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { apiFetch as fetch } from '../lib/api';
import { MiniDashboardHeader } from './MiniDashboardHeader';
import { Order, User, NfcCard, ServiceCategory } from '../types';
import { ChatComponent } from './ChatComponent';
import {
  Users,
  Compass,
  Cpu,
  TrendingUp,
  Award,
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  UserPlus,
  CreditCard,
  Briefcase,
  Plus,
  RefreshCw,
  Minus,
  Star,
  MessageSquare,
  EyeOff,
  Eye,
  Radio,
  Megaphone,
  ChevronRight,
  ChevronDown,
  Check,
  ExternalLink,
  ShieldAlert,
  Sliders,
  Smartphone,
  FileText,
  Download,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { MomoApiDashboard } from './MomoApiDashboard';

function getDayOfWeekFrench(dateStr: string): string {
  if (!dateStr) return '';
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  if (days.includes(dateStr.toLowerCase())) return dateStr;
  
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return dayNames[d.getDay()];
  } catch (e) {
    return '';
  }
}

export const AdminDashboard: React.FC = () => {
  const {
    users,
    services,
    orders,
    cards,
    currentUser,
    createOrder,
    assignOrder,
    updateOrderStatus,
    updateUserBalance,
    issueNfcCard,
    getFinancialReport,
    distributionMode,
    setDistributionMode,
    approveProvider,
    rejectProvider,
    loyaltyPointsRate,
    setLoyaltyPointsRate,
    loyaltyPointValue,
    setLoyaltyPointValue,
    signalOrder,
    moderateRating,
    registerDirector,
    momoConfigs,
    momoLogs,
    saveMomoConfig,
    testMomoConnection,
    loadMomoConfigs,
    loadMomoLogs,
    updateDirectorTabs,
    deleteDirector,
    logAssistantActivity,
    fetchAssistantLogs
  } = useApp();

  const isMasterAdmin = currentUser?.email?.toLowerCase() === 'borisleroymenguealo@gmail.com';

  const [activeTab, setActiveTab] = useState<'kpis' | 'orders' | 'members' | 'directors' | 'ratings' | 'financials' | 'apis' | 'chat'>('kpis');

  const isTabAllowed = activeTab === 'chat' || isMasterAdmin || (activeTab !== 'directors' && (currentUser?.allowedTabs || []).includes(activeTab));

  const visibleTabs = (['kpis', 'orders', 'members', 'directors', 'ratings', 'financials', 'apis', 'chat'] as const).filter(tab => {
    if (tab === 'chat') return true; // Chat is always allowed for all admins and assistants
    if (isMasterAdmin) return true;
    if (tab === 'directors') return false;
    return currentUser?.allowedTabs?.includes(tab);
  });

  // Adjust activeTab if current role is assistant and does not have access to current tab
  React.useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0]);
    }
  }, [currentUser]);

  // Assistant Logs states
  const [logs, setLogs] = useState<any[]>([]);
  const loadLogs = async () => {
    const fetched = await fetchAssistantLogs();
    setLogs(fetched);
  };

  React.useEffect(() => {
    if (isMasterAdmin && activeTab === 'directors') {
      loadLogs();
    }
  }, [activeTab, currentUser]);

  // New Director form states
  const [showDirectorModal, setShowDirectorModal] = useState(false);
  const [dirFirstName, setDirFirstName] = useState('');
  const [dirLastName, setDirLastName] = useState('');
  const [dirPhone, setDirPhone] = useState('');
  const [dirEmail, setDirEmail] = useState('');
  const [dirGrade, setDirGrade] = useState('Directeur d’Exploitation 🛠️');
  const [dirAvatar, setDirAvatar] = useState('https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=150');
  const [dirAllowedTabs, setDirAllowedTabs] = useState<string[]>(['kpis', 'orders']);
  const [isRegisteringDir, setIsRegisteringDir] = useState(false);

  // Edit Director modal states
  const [selectedDirForEdit, setSelectedDirForEdit] = useState<any>(null);
  const [editDirGrade, setEditDirGrade] = useState('');
  const [editDirAllowedTabs, setEditDirAllowedTabs] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);

  // AI Member Assistant States
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const executeAutomatically = false; // L'IA ne s'exécute jamais seule : confirmation obligatoire
  const [aiError, setAiError] = useState('');
  const [isApplyingSingleAction, setIsApplyingSingleAction] = useState<string | null>(null);

  const handleAiAction = async (directPrompt?: string) => {
    const activePrompt = directPrompt || aiPrompt;
    if (!activePrompt.trim()) {
      setAiError("Veuillez saisir une consigne ou choisir un modèle d'action.");
      return;
    }

    setIsAiLoading(true);
    setAiError('');
    setAiResult(null);

    try {
      const res = await fetch('/api/admin/ai-manage-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: activePrompt })
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data);
      } else {
        setAiError(data.message || "Une erreur est survenue lors de l'analyse IA.");
      }
    } catch (err: any) {
      setAiError("Erreur réseau: " + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const describeAiAction = (a: any) =>
    `• ${a.userName} → ${a.action}${a.pointsAmount ? ` (${a.pointsAmount} points)` : ''}\n  Motif : ${a.reason || '—'}`;

  const applyAiActions = async (actions: any[]) => {
    const res = await fetch('/api/admin/ai-apply-actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actions, confirm: true })
    });
    return res.json();
  };

  const handleApplySingleAiAction = async (actionItem: any) => {
    if (!window.confirm(`Confirmer cette action sur la base de données ?\n\n${describeAiAction(actionItem)}`)) return;
    setIsApplyingSingleAction(actionItem.userId);
    try {
      const data = await applyAiActions([actionItem]);
      if (data.success && data.executedActions?.length) {
        alert(`Action appliquée pour ${actionItem.userName}.`);
        setAiResult((prev: any) => prev && ({
          ...prev,
          suggestedActions: prev.suggestedActions.map((act: any) => act.userId === actionItem.userId ? { ...act, applied: true } : act)
        }));
      } else {
        alert(data.message || "Action refusée ou sans effet.");
      }
    } catch (err: any) {
      alert("Erreur réseau: " + err.message);
    } finally {
      setIsApplyingSingleAction(null);
    }
  };

  const handleApplyAllAiActions = async () => {
    if (!aiResult || !aiResult.suggestedActions) return;
    const actionsToRun = aiResult.suggestedActions.filter((a: any) => !a.applied && a.action !== 'none');
    if (actionsToRun.length === 0) {
      alert("Aucune action en attente.");
      return;
    }
    if (!window.confirm(`Confirmer l'application de ${actionsToRun.length} action(s) ?\n\n${actionsToRun.map(describeAiAction).join('\n')}`)) return;
    setIsAiLoading(true);
    try {
      const data = await applyAiActions(actionsToRun);
      if (data.success) {
        alert(`${data.executedActions?.length || 0} action(s) appliquée(s).`);
        window.location.reload();
      } else {
        alert("Erreur: " + data.message);
      }
    } catch (err: any) {
      alert("Erreur réseau: " + err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Corporate Transfer States
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferRecipientId, setTransferRecipientId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMotif, setTransferMotif] = useState('Frais de Mission 💼');
  const [transferCustomMotif, setTransferCustomMotif] = useState('');
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [isTransferSending, setIsTransferSending] = useState(false);
  const [transferStep, setTransferStep] = useState(0);
  const [lastTransferDetails, setLastTransferDetails] = useState<any>(null);

  // Corporate Treasury Withdraw states
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawProvider, setWithdrawProvider] = useState<'MTN MoMo' | 'Orange Money'>('MTN MoMo');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [isWithdrawSending, setIsWithdrawSending] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState(0);
  const [lastWithdrawDetails, setLastWithdrawDetails] = useState<any>(null);
  const [withdrawMotif, setWithdrawMotif] = useState('Approvisionnement Caisse Physique 🏢');
  const [withdrawCustomMotif, setWithdrawCustomMotif] = useState('');

  const generateReceiptPDF = (tx: {
    id: string;
    date: string;
    recipientName: string;
    recipientRole: string;
    recipientPhone: string;
    operator: 'MTN MoMo' | 'Orange Money';
    amount: number;
    motif: string;
    reference: string;
  }) => {
    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({
      title: `Recu_STUD-S_Virement_${tx.reference}`,
      subject: 'Reçu de Virement Direct',
      author: "STUD'S SERVICES Central Administration",
      keywords: 'recu, virement, momo, orange, studs',
      creator: "STUD'S Secure Payment Engine v1.2"
    });

    // Outer framing card
    doc.setDrawColor(15, 23, 42); // slate-900
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277); // Outer border with 10mm padding

    // 1. HEADER BANNER
    doc.setFillColor(15, 23, 42); // slate-900 background
    doc.rect(12, 12, 186, 32, 'F');

    // Branding Title "STUD'S"
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text("STUD'S SERVICES", 20, 26);

    // Branding Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175); // gray-400
    doc.text("PLATEFORME D'ADMINISTRATION CENTRALE ET DE DISTRIBUTION", 20, 33);
    doc.text("Yaoundé, Cameroun | Email: contact@studs-services.com", 20, 38);

    // Right-aligned status badge in header
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(142, 20, 46, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("VIREMENT DIRECT RÉUSSI", 143, 25);

    // Reference right-aligned in header
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(209, 213, 219); // gray-300
    doc.text(`ID: ${tx.id}`, 142, 33);
    doc.text(`Réf: ${tx.reference}`, 142, 38);

    // 2. MAIN TITLE OF THE RECEIPT
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("REÇU DE DISTRIBUTION DIRECTE MOBILE MONEY", 15, 54);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Attestation de transfert instantané de trésorerie sans transit intermédiaire.", 15, 59);

    // Subtle horizontal line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(15, 62, 195, 62);

    // 3. TRANSACTION GENERAL METADATA
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(15, 66, 180, 28, 'F');
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.5);
    doc.rect(15, 66, 180, 28, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text("MÉTADONNÉES DE LA TRANSACTION", 20, 72);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42); // slate-900

    const formattedDate = new Date(tx.date).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    doc.text(`• Date d'Exécution : ${formattedDate}`, 20, 79);
    doc.text(`• Référence Opérateur : ${tx.reference}`, 20, 84);
    doc.text(`• Mode de Transfert : Passerelle API Directe vers Carte SIM`, 20, 89);

    // 4. SENDER & RECIPIENT DOUBLE BLOCKS
    // SENDER CARD (Left)
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(15, 23, 42); // slate-900
    doc.setLineWidth(0.5);
    doc.rect(15, 102, 87, 48, 'F');
    doc.rect(15, 102, 87, 48, 'S');
    // Top banner for card
    doc.setFillColor(15, 23, 42);
    doc.rect(15, 102, 87, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("EMETTEUR / DEBITEUR", 20, 106);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("STUD'S SERVICES (Corporate Pool)", 20, 114);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text("Trésorerie Centrale d'Entreprise", 20, 119);
    doc.text("Compte Source : Admin Central", 20, 124);
    doc.text("Frais de réseau : Pris en charge par l'entreprise", 20, 129);
    doc.text("Statut Solde Débité : Succès", 20, 134);

    // RECIPIENT CARD (Right)
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(15, 23, 42); // slate-900
    doc.setLineWidth(0.5);
    doc.rect(108, 102, 87, 48, 'F');
    doc.rect(108, 102, 87, 48, 'S');
    // Top banner for card
    const opColor = tx.operator === 'Orange Money' ? [249, 115, 22] : [245, 158, 11]; // orange vs amber
    doc.setFillColor(opColor[0], opColor[1], opColor[2]);
    doc.rect(108, 102, 87, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`RECIPIENDAIRE (PORTABLE ${tx.operator.toUpperCase()})`, 113, 106);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(tx.recipientName, 113, 114);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Poste : ${tx.recipientRole}`, 113, 119);
    doc.text(`N° Telephone : ${tx.recipientPhone}`, 113, 124);
    doc.text(`Reseau cible : ${tx.operator}`, 113, 129);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text("Depot Direct Portefeuille : Recu", 113, 134);

    // 5. FINANCIAL TABLE
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    // Table Header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(15, 158, 180, 8, 'F');
    doc.rect(15, 158, 180, 8, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("Description du Virement", 18, 163);
    doc.text("Montant", 160, 163);

    // Table Row 1
    doc.rect(15, 166, 180, 10, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Virement Tresorerie - Motif: ${tx.motif}`, 18, 172);
    doc.setFont('helvetica', 'bold');
    doc.text(`${tx.amount.toLocaleString()} FCFA`, 160, 172);

    // Table Row 2 (Fees)
    doc.rect(15, 176, 180, 10, 'S');
    doc.setFont('helvetica', 'normal');
    doc.text("Frais d'execution reseau (Negocies et offerts par STUD'S)", 18, 182);
    doc.text("0 FCFA", 160, 182);

    // Table Row 3 (Transit intermediaries)
    doc.rect(15, 186, 180, 10, 'S');
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text("Frais de transit / Comptes intermediaires", 18, 192);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("AUCUN", 160, 192);

    // GRAND TOTAL BANNER
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.rect(15, 198, 180, 14, 'F');
    doc.setDrawColor(79, 70, 229); // indigo-600 border
    doc.setLineWidth(0.8);
    doc.rect(15, 198, 180, 14, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    doc.text("MONTANT TOTAL PARVENU SUR LA CARTE SIM :", 18, 207);
    doc.setFontSize(13);
    doc.text(`${tx.amount.toLocaleString()} FCFA`, 150, 207);

    // 6. LEGAL CLAUSE & DISCLOSURE
    doc.setFillColor(254, 252, 232); // yellow-50
    doc.setDrawColor(234, 179, 8); // yellow-500
    doc.setLineWidth(0.5);
    doc.rect(15, 220, 180, 24, 'F');
    doc.rect(15, 220, 180, 24, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(133, 77, 14); // yellow-850
    doc.text("CLAUSE DE NON-TRANSIT ET SECURITE DES FONDS :", 18, 225);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(133, 77, 14);
    const splitClause = doc.splitTextToSize(
      "Ce virement a ete opere via la passerelle de paiement direct automatisee de la Tresorerie Centrale de STUD'S SERVICES. En stricte conformite avec le reglement interne de l'entreprise, ces fonds n'ont transite par aucun autre compte utilisateur, portefeuille virtuel d'application tierce ou intermediaire de depot. Les fonds ont ete deposes directement et immediatement au credit du compte Mobile Money lie au numero de telephone specifie ci-dessus.",
      174
    );
    doc.text(splitClause, 18, 229);

    // 7. FOOTER AND DIGITAL SIGNATURE STAMP
    // Left-side disclaimer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Ce document numerique fait office de preuve comptable officielle de virement de tresorerie.", 15, 258);
    doc.text("STUD'S SERVICES Cameroun - Technologie Instant Payment Gateway.", 15, 262);

    // Right-side secure stamp mockup
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.rect(140, 250, 55, 22, 'F');
    doc.rect(140, 250, 55, 22, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text("STUD'S SECURE TRANSACTION", 142, 254);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(`GATEWAY STATUS: CERTIFIED`, 142, 258);
    doc.text(`HASH ID: SHA256-${tx.reference.replace('-', '')}`, 142, 262);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text("APPROVED BY CENTRAL TREASURY", 142, 268);

    // Save the PDF
    doc.save(`Recu_Virement_STUDS_${tx.reference}.pdf`);
  };

  const getDirectorWalletInfo = (phone: string) => {
    const cleaned = (phone || '').replace(/\s+/g, '');
    if (cleaned.includes('699') || cleaned.includes('691') || cleaned.includes('695') || cleaned.includes('693')) {
      return {
        provider: 'Orange Money' as const,
        color: 'bg-orange-500 border-orange-600',
        textColor: 'text-orange-950',
        badgeColor: 'bg-orange-50 border-orange-300 text-orange-900',
        logoText: 'Orange Money 🍊'
      };
    } else {
      return {
        provider: 'MTN MoMo' as const,
        color: 'bg-amber-400 border-amber-500',
        textColor: 'text-amber-950',
        badgeColor: 'bg-amber-50 border-amber-300 text-amber-900',
        logoText: 'MTN MoMo 🟡'
      };
    }
  };

  const [internalTransfers, setInternalTransfers] = useState<{
    id: string;
    date: string;
    recipientName: string;
    recipientRole: string;
    recipientPhone: string;
    operator: 'MTN MoMo' | 'Orange Money';
    amount: number;
    motif: string;
    reference: string;
  }[]>(() => {
    const saved = localStorage.getItem('studs_internal_transfers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [
      {
        id: 'tx-001',
        date: '2026-06-25T14:30:00Z',
        recipientName: 'Marie NKOLO',
        recipientRole: 'Directrice de la Supervision',
        recipientPhone: '+237 699 112 233',
        operator: 'Orange Money',
        amount: 15000,
        motif: 'Budget Supervision Ebolowa II 📈',
        reference: 'OM-TX-7712903'
      },
      {
        id: 'tx-002',
        date: '2026-06-26T10:15:00Z',
        recipientName: 'Boris MENGUE',
        recipientRole: 'Directeur Général',
        recipientPhone: '+237 677 889 900',
        operator: 'MTN MoMo',
        amount: 25000,
        motif: 'Frais opérationnels / Carburant 🚗',
        reference: 'MTN-TX-8812904'
      }
    ];
  });

  const saveTransfers = (newTransfers: any) => {
    setInternalTransfers(newTransfers);
    localStorage.setItem('studs_internal_transfers', JSON.stringify(newTransfers));
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');
    setTransferSuccess(false);

    if (!currentUser) {
      setTransferError("Vous devez être connecté en tant qu'administrateur.");
      return;
    }

    const amountNum = parseInt(transferAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      setTransferError("Veuillez entrer un montant valide.");
      return;
    }

    if (amountNum < 500) {
      setTransferError("Le montant minimum de virement est de 500 FCFA.");
      return;
    }

    if (amountNum > (currentUser.balance || 0)) {
      setTransferError(`Solde insuffisant. Votre solde disponible est de ${(currentUser.balance || 0).toLocaleString()} FCFA.`);
      return;
    }

    if (!transferRecipientId) {
      setTransferError("Veuillez sélectionner un destinataire.");
      return;
    }

    const recipient = users.find(u => u.id === transferRecipientId);
    if (!recipient) {
      setTransferError("Destinataire introuvable.");
      return;
    }

    const walletInfo = getDirectorWalletInfo(recipient.phone);

    try {
      // Start real-time dispatch simulation
      setIsTransferSending(true);
      setTransferStep(1); // "Connexion à la passerelle de paiement..."

      await new Promise(resolve => setTimeout(resolve, 800));
      setTransferStep(2); // "Authentification de la Trésorerie d'Entreprise..."

      await new Promise(resolve => setTimeout(resolve, 800));
      setTransferStep(3); // "Interrogation du portefeuille Mobile Money externe..."

      await new Promise(resolve => setTimeout(resolve, 900));
      setTransferStep(4); // "Transfert direct des fonds et notification SMS..."

      await new Promise(resolve => setTimeout(resolve, 1000));

      // 1. Debit Admin (Corporate Treasury pool)
      await updateUserBalance(currentUser.id, -amountNum);
      
      // 2. NO recipient in-app balance credit (goes directly to their external mobile wallet!)
      // This is exactly "Cet argent ne doit pas transiter par un autre compte."

      // Generate a realistic transaction reference
      const isOrange = walletInfo.provider === 'Orange Money';
      const randNum = Math.floor(1000000 + Math.random() * 9000000);
      const reference = `${isOrange ? 'OM' : 'MTN'}-TX-${randNum}`;

      // Save transfer to history
      const finalMotif = transferMotif === 'Autre 📝' ? (transferCustomMotif || 'Virement Divers 📝') : transferMotif;
      
      // Map roles properly for display
      let displayRole = 'Directeur';
      if (recipient.id === 'usr-admin') displayRole = 'Directeur Général';
      else if (recipient.id === 'usr-supervisor') displayRole = 'Directrice de la Supervision';
      else if (recipient.id === 'usr-dir-tech') displayRole = 'Directeur Technique (CTO)';
      else if (recipient.id === 'usr-dir-daf') displayRole = 'Directrice Financière (DAF)';
      else if (recipient.id === 'usr-dir-ops') displayRole = 'Directeur des Opérations (COO)';
      else if (recipient.id === 'usr-dir-pr') displayRole = 'Directrice des Relations Publiques';
      else if (recipient.id === 'usr-dir-log') displayRole = 'Directeur de la Logistique';
      else if (recipient.id === 'usr-dir-innov') displayRole = 'Directrice de l\'Innovation';

      const newTx = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString(),
        recipientName: `${recipient.firstName} ${recipient.lastName}`,
        recipientRole: displayRole,
        recipientPhone: recipient.phone,
        operator: walletInfo.provider,
        amount: amountNum,
        motif: finalMotif,
        reference
      };

      const updated = [newTx, ...internalTransfers];
      saveTransfers(updated);

      setIsTransferSending(false);
      setTransferSuccess(true);
      setLastTransferDetails(newTx);
      setTransferAmount('');
      setTransferCustomMotif('');
      
      setTimeout(() => {
        setIsTransferModalOpen(false);
        setTransferSuccess(false);
        setLastTransferDetails(null);
      }, 6500);

    } catch (err) {
      console.error(err);
      setIsTransferSending(false);
      setTransferError("Erreur lors de l'exécution du virement.");
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess(false);

    if (!currentUser) {
      setWithdrawError("Vous devez être connecté en tant qu'administrateur.");
      return;
    }

    const amountNum = parseInt(withdrawAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError("Veuillez entrer un montant valide.");
      return;
    }

    if (amountNum < 500) {
      setWithdrawError("Le montant minimum de retrait est de 500 FCFA.");
      return;
    }

    if (amountNum > (currentUser.balance || 0)) {
      setWithdrawError(`Solde insuffisant. Votre trésorerie disponible est de ${(currentUser.balance || 0).toLocaleString()} FCFA.`);
      return;
    }

    try {
      setIsWithdrawSending(true);
      setWithdrawStep(1); // "Connexion à la passerelle de retrait..."

      await new Promise(resolve => setTimeout(resolve, 800));
      setWithdrawStep(2); // "Authentification de la Trésorerie d'Entreprise..."

      await new Promise(resolve => setTimeout(resolve, 800));
      setWithdrawStep(3); // "Validation du numéro récepteur d'entreprise..."

      await new Promise(resolve => setTimeout(resolve, 900));
      setWithdrawStep(4); // "Retrait direct des fonds et écriture sur SIM..."

      await new Promise(resolve => setTimeout(resolve, 1000));

      // 1. Debit Admin
      await updateUserBalance(currentUser.id, -amountNum);

      // 2. Generate transaction reference
      const isOrange = withdrawProvider === 'Orange Money';
      const randNum = Math.floor(1000000 + Math.random() * 9000000);
      const reference = `${isOrange ? 'OM' : 'MTN'}-RET-${randNum}`;

      const finalMotif = withdrawMotif === 'Autre 📝' ? (withdrawCustomMotif || 'Retrait de Trésorerie 📝') : withdrawMotif;
      const recipientPhone = withdrawProvider === 'MTN MoMo' ? '671711046' : '696356036';

      const newTx = {
        id: `tx-ret-${Date.now()}`,
        date: new Date().toISOString(),
        recipientName: 'Retrait de Trésorerie',
        recipientRole: 'Compte Entreprise Officiel',
        recipientPhone,
        operator: withdrawProvider,
        amount: amountNum,
        motif: `[RETRAIT] ${finalMotif}`,
        reference
      };

      const updated = [newTx, ...internalTransfers];
      saveTransfers(updated);

      setIsWithdrawSending(false);
      setWithdrawSuccess(true);
      setLastWithdrawDetails(newTx);
      setWithdrawAmount('');
      setWithdrawCustomMotif('');

      setTimeout(() => {
        setIsWithdrawModalOpen(false);
        setWithdrawSuccess(false);
        setLastWithdrawDetails(null);
      }, 6500);

    } catch (err) {
      console.error(err);
      setIsWithdrawSending(false);
      setWithdrawError("Une erreur est survenue lors du retrait de fonds.");
    }
  };

  const handleRegisterDirectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirFirstName || !dirLastName || !dirPhone || !dirEmail || !dirGrade) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsRegisteringDir(true);
    const res = await registerDirector({
      firstName: dirFirstName,
      lastName: dirLastName,
      phone: dirPhone,
      email: dirEmail,
      grade: dirGrade,
      avatar: dirAvatar,
      allowedTabs: dirAllowedTabs
    });
    setIsRegisteringDir(false);

    if (res.success) {
      alert(res.message);
      setShowDirectorModal(false);
      // Reset form fields
      setDirFirstName('');
      setDirLastName('');
      setDirPhone('');
      setDirEmail('');
      setDirGrade('Directeur d’Exploitation 🛠️');
      setDirAllowedTabs(['kpis', 'orders']);
      if (isMasterAdmin) loadLogs();
    } else {
      alert(`✖ Erreur d'inscription : ${res.message}`);
    }
  };

  const handleEditDirectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDirForEdit) return;

    const res = await updateDirectorTabs(
      selectedDirForEdit.id,
      editDirAllowedTabs,
      selectedDirForEdit.status,
      editDirGrade
    );

    if (res.success) {
      alert("Permissions et informations de l'assistant d'administration mises à jour !");
      setShowEditModal(false);
      setSelectedDirForEdit(null);
      if (isMasterAdmin) loadLogs();
    } else {
      alert(`✖ Erreur lors de la mise à jour : ${res.message}`);
    }
  };

  const handleDeleteDirectorClick = async (dirId: string, dirName: string) => {
    const confirm = window.confirm(`Voulez-vous vraiment révoquer les accès et supprimer l'assistant d'administration ${dirName} ? Cette action est irréversible.`);
    if (!confirm) return;

    const res = await deleteDirector(dirId);
    if (res.success) {
      alert("L'assistant d'administration a été révoqué et retiré avec succès !");
      if (isMasterAdmin) loadLogs();
    } else {
      alert(`✖ Erreur de révocation : ${res.message}`);
    }
  };

  // Accordion (expanded cards) state
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Rating moderation states
  const [editingRatingOrderId, setEditingRatingOrderId] = useState<string | null>(null);
  const [editingRatingStars, setEditingRatingStars] = useState(5);
  const [editingRatingComment, setEditingRatingComment] = useState('');
  const [moderationFeedback, setModerationFeedback] = useState<string | null>(null);
  
  // Loyalty Program configuration states
  const [rateInput, setRateInput] = useState(loyaltyPointsRate.toString());
  const [valueInput, setValueInput] = useState(loyaltyPointValue.toString());
  const [showLoyaltyFeedback, setShowLoyaltyFeedback] = useState(false);
  
  // User search/filter
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'provider'>('all');

  // Order filters
  const [orderFilter, setOrderFilter] = useState<Order['status'] | 'all'>('all');

  // Selected order for assignment
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);

  // Balance adjust modal
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('10000');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');

  // New Mission Modal States
  const [isNewMissionModalOpen, setIsNewMissionModalOpen] = useState(false);
  const [newMissionServiceType, setNewMissionServiceType] = useState<'predefined' | 'custom'>('predefined');
  const [newMissionPredefinedServiceId, setNewMissionPredefinedServiceId] = useState('');
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionCategory, setNewMissionCategory] = useState<ServiceCategory>('domestic');
  const [newMissionPrice, setNewMissionPrice] = useState('');
  const [newMissionScheduledDate, setNewMissionScheduledDate] = useState('');
  const [newMissionScheduledTime, setNewMissionScheduledTime] = useState('');
  const [newMissionAddress, setNewMissionAddress] = useState('');
  const [newMissionComments, setNewMissionComments] = useState('');
  const [newMissionPaymentMethod, setNewMissionPaymentMethod] = useState<'momo' | 'card' | 'cash'>('cash');
  const [newMissionClientType, setNewMissionClientType] = useState<'enrolled' | 'guest'>('enrolled');
  const [newMissionClientId, setNewMissionClientId] = useState('');
  const [newMissionCustomClientName, setNewMissionCustomClientName] = useState('');
  const [newMissionCustomClientPhone, setNewMissionCustomClientPhone] = useState('');
  const [newMissionAssignedProviderId, setNewMissionAssignedProviderId] = useState('');

  const report = getFinancialReport();

  // Active student providers for picker (with fallback for approval status)
  const availableStudents = users.filter(u => 
    u.role === 'provider' && 
    (u.status === 'active' || (u as any).isApproved === true) && 
    u.status !== 'suspended'
  );

  const getCategoryLabel = (cat: ServiceCategory) => {
    switch (cat) {
      case 'domestic': return 'Domestique';
      case 'logistics': return 'Logistique';
      case 'education': return 'Éducation';
      case 'immobilier': return 'Immobilier';
      case 'custom': return 'Personnalisé';
    }
  };

  const handleAssignSubmit = (orderId: string, providerId: string) => {
    assignOrder(orderId, providerId);
    setAssigningOrderId(null);
  };

  const handleBalanceAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser) return;

    const amount = parseInt(adjustAmount);
    if (isNaN(amount) || amount <= 0) return;

    const multiplier = adjustType === 'credit' ? 1 : -1;
    updateUserBalance(adjustingUser.id, amount * multiplier);
    setAdjustingUser(null);
    setAdjustAmount('10000');
    alert(`Solde ajusté avec succès de ${multiplier > 0 ? '+' : '-'}${amount.toLocaleString()} FCFA pour ${adjustingUser.firstName}.`);
  };

  const handlePredefinedServiceChange = (serviceId: string) => {
    setNewMissionPredefinedServiceId(serviceId);
    const selectedService = services.find(s => s.id === serviceId);
    if (selectedService) {
      setNewMissionTitle(selectedService.title);
      setNewMissionCategory(selectedService.category);
      setNewMissionPrice(selectedService.price.toString());
    }
  };

  const resetNewMissionForm = () => {
    setNewMissionServiceType('predefined');
    setNewMissionPredefinedServiceId('');
    setNewMissionTitle('');
    setNewMissionCategory('domestic');
    setNewMissionPrice('');
    setNewMissionScheduledDate('');
    setNewMissionScheduledTime('');
    setNewMissionAddress('');
    setNewMissionComments('');
    setNewMissionPaymentMethod('cash');
    setNewMissionClientType('enrolled');
    setNewMissionClientId('');
    setNewMissionCustomClientName('');
    setNewMissionCustomClientPhone('');
    setNewMissionAssignedProviderId('');
  };

  const handleNewMissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!newMissionTitle || !newMissionPrice || !newMissionScheduledDate || !newMissionScheduledTime || !newMissionAddress) {
      alert("Veuillez remplir tous les champs obligatoires de la mission.");
      return;
    }

    if (newMissionClientType === 'enrolled' && !newMissionClientId) {
      alert("Veuillez sélectionner un client enregistré ou opter pour un client invité.");
      return;
    }

    if (newMissionClientType === 'guest' && !newMissionCustomClientName) {
      alert("Veuillez saisir le nom du client invité.");
      return;
    }

    // Prepare client or custom details
    const clientIdParam = newMissionClientType === 'enrolled' ? newMissionClientId : undefined;
    const customClientNameParam = newMissionClientType === 'guest' ? newMissionCustomClientName : undefined;
    const customClientPhoneParam = newMissionClientType === 'guest' ? newMissionCustomClientPhone : undefined;

    // Prepare provider if any
    let providerIdParam: string | undefined = undefined;
    let providerNameParam: string | undefined = undefined;

    if (newMissionAssignedProviderId) {
      const assignedProvider = users.find(u => u.id === newMissionAssignedProviderId);
      if (assignedProvider) {
        providerIdParam = assignedProvider.id;
        providerNameParam = `${assignedProvider.firstName} ${assignedProvider.lastName}`;
      }
    }

    const priceNum = parseInt(newMissionPrice, 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Le tarif doit être un nombre positif.");
      return;
    }

    try {
      await createOrder({
        serviceId: newMissionServiceType === 'predefined' ? newMissionPredefinedServiceId : 'srv-custom',
        serviceTitle: newMissionTitle,
        servicePrice: priceNum,
        category: newMissionCategory,
        scheduledDate: newMissionScheduledDate,
        scheduledTime: newMissionScheduledTime,
        address: newMissionAddress,
        comments: newMissionComments,
        paymentMethod: newMissionPaymentMethod,
        clientId: clientIdParam,
        customClientName: customClientNameParam,
        customClientPhone: customClientPhoneParam,
        providerId: providerIdParam,
        providerName: providerNameParam,
      });

      alert("🎉 Nouvelle mission créée avec succès !");
      
      // Close modal and reset states
      setIsNewMissionModalOpen(false);
      resetNewMissionForm();
    } catch (err) {
      console.error(err);
      alert("Une erreur s'est produite lors de la création de la mission.");
    }
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.phone.includes(userSearch);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole && u.role !== 'admin' && u.role !== 'supervisor';
  });

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    return orderFilter === 'all' || o.status === orderFilter;
  });

  return (
    <div className="space-y-6">
      {/* Mini-tableau récapitulatif en haut du tableau de bord */}
      <MiniDashboardHeader role="admin" />

      {/* Navigation */}
      <TabBar
        active={activeTab}
        onChange={(id) => setActiveTab(id as any)}
        maxBottom={5}
        tabs={(['kpis', 'orders', 'members', 'financials', 'ratings', 'chat', 'directors', 'apis'] as const)
          .filter(t => (visibleTabs as string[]).includes(t))
          .map(t => ({
            id: t,
            label: { kpis: 'Accueil', orders: 'Missions', members: 'Membres', financials: 'Compta', ratings: 'Avis', chat: 'Chat', directors: 'Équipe', apis: 'APIs' }[t],
            icon: { kpis: TbDash, orders: TbList, members: TbUsers, financials: TbCoins, ratings: TbStar, chat: TbChat, directors: TbBriefcase, apis: TbPlug }[t],
          }))}
      />

      {!isTabAllowed ? (
        <motion.div
          key="security-lock"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bento-card bg-rose-50 border-4 border-rose-950 p-8 text-center max-w-lg mx-auto my-12 space-y-4 shadow-[8px_8px_0px_rgba(225,29,72,0.15)] rounded-2xl font-sans"
        >
          <div className="w-16 h-16 bg-rose-950 border-4 border-rose-900 text-rose-100 rounded-full flex items-center justify-center mx-auto text-3xl shadow-md animate-bounce">
            🔒
          </div>
          <div className="space-y-2 text-left">
            <h3 className="font-black text-rose-950 uppercase text-center text-sm tracking-wide border-b-2 border-rose-200 pb-2">
              ⚠️ ZONE DE RESPONSABILITÉ RESTREINTE
            </h3>
            <p className="text-xs text-rose-900 leading-relaxed font-bold pt-2">
              Accès Interdit. Votre poste de responsabilité d'assistant d'administration ("{currentUser?.grade || 'Directeur de Pôle'}") ne vous accorde pas les privilèges d'accès requis pour administrer le module : <span className="underline uppercase">"{activeTab === 'kpis' ? 'Indicateurs (KPIs)' : activeTab === 'orders' ? 'Missions & Commandes' : activeTab === 'members' ? 'Membres & NFC' : activeTab === 'ratings' ? 'Avis & Notations' : activeTab === 'financials' ? 'Comptabilité (Dépôts/Retraits)' : activeTab === 'apis' ? 'Passerelles APIs' : activeTab}"</span>.
            </p>
            <p className="text-[10.5px] text-rose-800 leading-relaxed">
              Il est strictement interdit d'accéder aux zones de responsabilités qui ne vous concernent pas pour des raisons de conformité et de sécurité financière.
            </p>
            <p className="text-[10px] text-rose-600 italic">
              Veuillez vous adresser au Directeur Général de Zone (Boris MENGUE) pour demander l'affectation de cette compétence si nécessaire.
            </p>
          </div>
          <div className="pt-2 border-t border-rose-200">
            <span className="inline-block text-[8.5px] font-mono uppercase bg-rose-950 text-white font-extrabold px-3 py-1 rounded-md tracking-wider">
              SHIELD ANTI-PIRATAGE INTRUSION v2.6 ACTIVÉ
            </span>
          </div>
        </motion.div>
      ) : (
        <>
          <AnimatePresence mode="wait">
        {/* TAB 1: OPERATIONAL KPIS & SUMMARY */}
        {activeTab === 'kpis' && (
          <motion.div
            key="kpis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6"
          >
            {/* KPI metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Registered clients */}
              <div className="bento-card flex items-center space-x-3.5">
                <div className="p-3 bg-blue-100 text-slate-900 border border-slate-200/60 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Membres Actifs</p>
                  <p className="text-base font-black text-slate-900 font-mono pt-0.5">
                    {users.filter(u => u.role === 'client').length}{' '}
                    <span className="text-xs text-slate-500 font-bold">Clients</span>
                  </p>
                </div>
              </div>

              {/* Providers count */}
              <div className="bento-card flex items-center space-x-3.5">
                <div className="p-3 bg-indigo-100 text-slate-900 border border-slate-200/60 rounded-xl">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Prestataires Étudiants</p>
                  <p className="text-base font-black text-slate-900 font-mono pt-0.5">
                    {users.filter(u => u.role === 'provider').length}{' '}
                    <span className="text-xs text-slate-500 font-bold">Actifs</span>
                  </p>
                </div>
              </div>

              {/* Commission Revenue */}
              <div className="bento-card-emerald flex items-center space-x-3.5">
                <div className="p-3 bg-white text-slate-900 border border-slate-200/60 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] text-emerald-800 uppercase font-black tracking-wider">Marge Plateforme (30%)</p>
                  <p className="text-sm font-black text-slate-900 font-mono pt-0.5">
                    {report.platformCommission.toLocaleString()} FCFA
                  </p>
                </div>
              </div>

              {/* NFC Cards issued */}
              <div className="bento-card-amber flex items-center space-x-3.5">
                <div className="p-3 bg-white text-slate-900 border border-slate-200/60 rounded-xl">
                  <Cpu className="w-5 h-5 text-slate-900 animate-spin" />
                </div>
                <div>
                  <p className="text-[9px] text-amber-800 uppercase font-black tracking-wider">Cartes NFC Émises</p>
                  <p className="text-sm font-black text-slate-900 font-mono pt-0.5">
                    {cards.length}{' '}
                    <span className="text-xs text-amber-900 font-bold">Cartes</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Core admin notice */}
            <div className="bento-card-dark flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="font-extrabold text-lg text-white">CONTRÔLE OPÉRATIONNEL STUD'S</h4>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Bienvenue dans l'espace administratif centralisé. Vous pouvez superviser l'attribution des missions de proximité aux étudiants, valider ou annuler des transactions et administrer les cartes NFC.
                </p>
              </div>
              <div className="px-3.5 py-1.5 bg-brand-800 text-white rounded-xl font-mono text-[9px] tracking-wider uppercase font-black border-2 border-slate-600">
                Statut: En Ligne
              </div>
            </div>

            {/* Quick overview of latest activity logs */}
            <div className="bento-card space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-slate-900" />
                <span>Rapports d'activité de la plateforme</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl shadow-md shadow-slate-100 text-center">
                  <p className="text-2xl font-black text-slate-900 font-mono">{orders.length}</p>
                  <p className="text-[9px] text-slate-500 font-black uppercase mt-1">Total Commandes</p>
                </div>
                <div className="p-4 bg-indigo-50 border-2 border-indigo-900 rounded-2xl shadow-md shadow-slate-100 text-center">
                  <p className="text-2xl font-black text-indigo-900 font-mono">
                    {orders.filter(o => o.status === 'pending').length}
                  </p>
                  <p className="text-[9px] text-indigo-700 font-black uppercase mt-1">En attente d'attribution</p>
                </div>
                <div className="p-4 bg-emerald-50 border-2 border-emerald-900 rounded-2xl shadow-md shadow-slate-100 text-center">
                  <p className="text-2xl font-black text-emerald-900 font-mono">
                    {orders.filter(o => o.status === 'completed').length}
                  </p>
                  <p className="text-[9px] text-emerald-700 font-black uppercase mt-1">Missions complétées</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: MISSIONS & ASSIGNMENT CENTER */}
        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4 font-sans"
          >
            {/* Distribution Mode Bento Card */}
            <div className="bento-card bg-slate-50 border border-slate-200/60 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-7 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-[8px] bg-blue-700 text-white rounded font-mono font-black tracking-normal uppercase border border-blue-800">
                    Mode Actuel : {distributionMode === 'automatic' ? 'AUTOMATIQUE' : 'MANUEL'}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 uppercase">Mode de Distribution des Missions</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  {distributionMode === 'automatic' 
                    ? "L'algorithme affecte instantanément les nouvelles commandes au premier étudiant disponible."
                    : "L'administrateur étudie chaque demande de service et sélectionne l'étudiant le plus adapté."}
                </p>
              </div>
              <div className="md:col-span-5 flex gap-3">
                <button
                  onClick={() => setDistributionMode('manual')}
                  className={`flex-1 py-2 px-3 border-2 rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer ${
                    distributionMode === 'manual'
                      ? 'bg-brand-700 border-slate-900 text-white'
                      : 'bg-white border-slate-900 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  👐 Manuel
                </button>
                <button
                  onClick={() => setDistributionMode('automatic')}
                  className={`flex-1 py-2 px-3 border-2 rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer ${
                    distributionMode === 'automatic'
                      ? 'bg-blue-700 border-blue-900 text-white'
                      : 'bg-white border-blue-950 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  ⚡ Automatique
                </button>
              </div>
            </div>

            {/* Action header with Filters and New Mission button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="bento-card flex items-center space-x-2 overflow-x-auto py-3 flex-1">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider mr-2 shrink-0">Filtrer par statut :</span>
                {(['all', 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap border cursor-pointer ${
                      orderFilter === status
                        ? 'bg-brand-700 text-white border-slate-900'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {status === 'all' ? 'Toutes' : status === 'pending' ? 'En attente' : status === 'assigned' ? 'Assignée' : status === 'in_progress' ? 'En cours' : status === 'completed' ? 'Terminée' : 'Annulée'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  resetNewMissionForm();
                  setIsNewMissionModalOpen(true);
                }}
                className="flex items-center justify-center space-x-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 border border-slate-200/60 text-slate-950 font-black uppercase rounded-2xl text-xs transition-all shadow-sm hover:translate-y-[-2px] cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle Mission</span>
              </button>
            </div>

            {/* Orders list with Expandable and Signaling features */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-white">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-bold">Aucune mission ne correspond à ce filtre.</p>
                </div>
              ) : (
                filteredOrders.map(order => {
                  const isExpanded = expandedOrderId === order.id;
                  const hasNfc = order.validatedByNfc;
                  
                  // Simple matchmaking score calculation
                  const getSuitabilityScore = (student: User) => {
                    let score = 95;
                    const activeCount = orders.filter(o => o.providerId === student.id && o.status !== 'completed' && o.status !== 'cancelled').length;
                    score -= activeCount * 15;
                    
                    const studentOrders = orders.filter(o => o.providerId === student.id && o.rating !== undefined);
                    const avgRating = studentOrders.length > 0 
                      ? studentOrders.reduce((acc, o) => acc + (o.rating || 0), 0) / studentOrders.length 
                      : 4.5;
                      
                    if (avgRating >= 4.7) score += 5;
                    if (avgRating <= 3.5) score -= 15;
                    
                    const previousMatch = orders.some(o => o.providerId === student.id && o.category === order.category && o.status === 'completed');
                    if (previousMatch) score += 10;
                    
                    return Math.min(100, Math.max(30, score));
                  };

                  return (
                    <motion.div
                      key={order.id}
                      layout
                      className={`bento-card relative overflow-hidden transition-all duration-300 ${
                        order.isSignaled 
                          ? 'border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.15)] bg-rose-50/10' 
                          : 'border-slate-900'
                      } ${isExpanded ? 'ring-2 ring-slate-900 bg-slate-50/30' : ''}`}
                    >
                      {/* Pulse sonar rings if signaled */}
                      {order.isSignaled && (
                        <div className="absolute top-2 right-2 flex items-center space-x-1">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </span>
                          <span className="text-[8px] font-black uppercase text-rose-600 tracking-wider font-mono">BROADCAST RADAR ACTIF</span>
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        {/* Summary details */}
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-0.5 rounded font-bold">
                              REF: {order.id}
                            </span>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded border-2 uppercase tracking-wider ${
                              order.status === 'completed' ? 'bg-emerald-100 text-emerald-900 border-emerald-900' :
                              order.status === 'in_progress' ? 'bg-blue-100 text-blue-900 border-blue-900' :
                              order.status === 'assigned' ? 'bg-indigo-100 text-indigo-900 border-indigo-900' :
                              order.status === 'cancelled' ? 'bg-rose-100 text-rose-900 border-rose-900' :
                              'bg-amber-100 text-amber-900 border-amber-900'
                            }`}>
                              {order.status === 'pending' && 'En attente d\'attribution'}
                              {order.status === 'assigned' && 'Assigné'}
                              {order.status === 'in_progress' && 'En cours'}
                              {order.status === 'completed' && 'Complété'}
                              {order.status === 'cancelled' && 'Annulé'}
                            </span>

                            {order.isSignaled && (
                              <span className="px-2 py-0.5 text-[8px] bg-amber-500 text-white font-extrabold rounded-md uppercase tracking-wider border border-amber-600 animate-pulse">
                                📢 Demande Signalée / Urgente
                              </span>
                            )}

                            {order.nfcPriority && (
                              <span className="px-2 py-0.5 text-[8px] bg-blue-600 text-white font-extrabold rounded-md uppercase tracking-wider border border-slate-200/60 animate-pulse flex items-center space-x-0.5">
                                <span>💎 PRIORITÉ CLUB NFC VIP</span>
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center space-x-1.5">
                              <span>{order.serviceTitle}</span>
                              <span className="text-xs text-slate-400">({getCategoryLabel(order.category)})</span>
                            </h4>
                            <p className="text-xs text-slate-600">
                              📅 Prévu: <strong className="text-slate-800">{order.scheduledDate} à {order.scheduledTime}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Price Column */}
                        <div className="flex md:flex-col justify-between items-center md:items-end gap-1 shrink-0 bg-white/40 md:bg-transparent p-2 md:p-0 rounded-xl border border-slate-100 md:border-0">
                          <div className="text-left md:text-right font-mono text-xs">
                            <p className="text-[9px] text-slate-400 uppercase font-black">
                              Tarif Étudiant {order.hasNfcCard && " (Club NFC)"}
                            </p>
                            <p className="font-black text-slate-900 text-sm pt-0.5">{order.servicePrice.toLocaleString()} FCFA</p>
                            <p className="text-[8px] text-slate-500 font-bold">Marge 30% : {Math.floor(order.servicePrice * 0.3).toLocaleString()} FCFA</p>
                          </div>
                        </div>

                        {/* Expand / Close button */}
                        <button
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="p-1.5 border border-slate-200/60 bg-white hover:bg-slate-100 rounded-xl cursor-pointer self-start flex items-center space-x-1 shrink-0"
                        >
                          <span className="text-[9px] font-black uppercase px-1">Ouvrir</span>
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* EXPANDABLE AREA: "ouvrable" detail panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t-2 border-dashed border-slate-300 mt-4 pt-4 space-y-4 text-xs text-slate-800"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Client Info Card */}
                              <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1.5 shadow-sm">
                                <span className="text-[9px] uppercase font-black text-slate-400">Informations Client</span>
                                <p className="font-extrabold text-slate-950 text-xs">{order.clientName}</p>
                                <p className="text-slate-600 font-mono text-[10px]">📞 {order.clientPhone}</p>
                                <p className="text-slate-600 text-[10px]">📍 {order.address}</p>
                                {order.comments && (
                                  <p className="text-[10px] text-slate-500 italic bg-slate-50 p-1 rounded border border-slate-200 mt-1">
                                    " {order.comments} "
                                  </p>
                                )}
                              </div>

                              {/* Student Provider Card */}
                              <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1.5 shadow-sm flex flex-col justify-between">
                                <div>
                                  <span className="text-[9px] uppercase font-black text-slate-400">Étudiant Affecté</span>
                                  {order.providerName ? (
                                    <div className="space-y-1 mt-1">
                                      <p className="font-extrabold text-slate-950 text-xs">{order.providerName}</p>
                                      {order.providerPhone && <p className="text-slate-600 font-mono text-[10px]">📞 {order.providerPhone}</p>}
                                      <div className="flex items-center space-x-1.5 pt-0.5">
                                        <span className={`px-1.5 py-0.5 text-[8px] font-black rounded-md ${
                                          hasNfc ? 'bg-emerald-100 text-emerald-950 border border-emerald-400' : 'bg-slate-100 text-slate-500 border border-slate-300'
                                        }`}>
                                          {hasNfc ? '🔒 CERTIFIÉ PAR NFC' : '⏳ NFC NON SCANNÉ'}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-slate-400 italic font-medium pt-2">Aucun prestataire étudiant n'est encore affecté.</p>
                                  )}
                                </div>

                                {order.status !== 'completed' && order.status !== 'cancelled' && (
                                  <button
                                    onClick={() => setAssigningOrderId(assigningOrderId === order.id ? null : order.id)}
                                    className="w-full text-center py-1 bg-slate-100 hover:bg-brand-800 hover:text-white border border-slate-200/50 rounded-lg text-[9px] font-black uppercase transition-all mt-2 cursor-pointer"
                                  >
                                    {order.providerId ? 'Modifier l\'affectation' : 'Affecter un étudiant'}
                                  </button>
                                )}
                              </div>

                              {/* NFC & Control History */}
                              <div className="p-3 bg-white border border-slate-200/60 rounded-xl space-y-1.5 shadow-sm">
                                <span className="text-[9px] uppercase font-black text-slate-400">Rapport de Sécurité</span>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 font-bold">Méthode Paiement:</span>
                                    <span className="font-black uppercase text-slate-900 font-mono">{order.paymentMethod}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 font-bold">Statut Financier:</span>
                                    <span className={`font-black uppercase px-1.5 py-0.2 text-[8px] rounded ${
                                      order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-amber-100 text-amber-950 border border-amber-300'
                                    }`}>
                                      {order.paymentStatus === 'paid' ? 'Payé' : 'Non payé'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 font-bold">Validation Badge:</span>
                                    <span className="font-bold text-slate-800">{hasNfc ? '✅ NFC Validé' : '❌ Non Certifié'}</span>
                                  </div>

                                  {/* Broadcast status */}
                                  {order.status === 'pending' && (
                                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                                      <span className="text-[9px] text-slate-400 font-bold">Signal Radar:</span>
                                      <span className={`px-1 rounded text-[8px] font-black ${order.isSignaled ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                                        {order.isSignaled ? 'URGENT/SIGNALÉ' : 'NORMAL'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Custom Order Specifications Panel */}
                            {(order.tutoringClass || (order.billingFrequency && order.billingFrequency !== 'one_off') || order.realEstatePropertyId) && (
                              <div className="bg-blue-50/70 border border-slate-200/60 rounded-xl p-3.5 space-y-2.5 shadow-sm text-slate-900">
                                <div className="flex items-center space-x-1.5 text-slate-900 font-black">
                                  <span>📋</span>
                                  <span className="text-[10px] font-black uppercase tracking-wider">Spécifications personnalisées de la commande (Ebolowa)</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {/* Tutoring Specifics */}
                                  {order.tutoringClass && (
                                    <div className="bg-white border border-slate-200/60 p-2.5 rounded-lg space-y-1 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                      <span className="text-[9px] uppercase font-black text-blue-900">🎓 Répétition académique</span>
                                      <p className="font-extrabold text-slate-800 text-xs uppercase leading-tight">Niveau: {order.tutoringClass}</p>
                                      <p className="text-slate-600 text-[10px] font-semibold">
                                        Section: <span className="text-slate-900 uppercase font-bold">{order.tutoringSection === 'anglophone' ? 'Anglophone' : 'Francophone'}</span>
                                      </p>
                                      {order.tutoringSeries && order.tutoringSeries !== 'general' && (
                                        <p className="text-slate-600 text-[10px] font-semibold">
                                          Série: <span className="text-slate-900 uppercase font-bold">{order.tutoringSeries}</span>
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {/* Recurring Billing Specifics */}
                                  {order.billingFrequency && order.billingFrequency !== 'one_off' && (
                                    <div className="bg-white border border-slate-200/60 p-2.5 rounded-lg space-y-1 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                      <span className="text-[9px] uppercase font-black text-emerald-950">🔄 Fréquence de facturation</span>
                                      <p className="font-extrabold text-slate-800 text-xs uppercase leading-tight">
                                        {order.billingFrequency === 'monthly' ? 'Abonnement Mensuel' :
                                         order.billingFrequency === 'weekly' ? 'Abonnement Hebdomadaire' : 'Prestation Unique'}
                                      </p>
                                      <p className="text-[9px] text-slate-500 font-medium leading-snug">
                                        {order.billingFrequency === 'monthly' ? 'Renouvellement automatique mensuel (-12% inclus)' :
                                         order.billingFrequency === 'weekly' ? 'Plan hebdomadaire récurrent (-5% inclus)' : 'Paiement ponctuel simple'}
                                      </p>
                                    </div>
                                  )}

                                  {/* Real Estate Specifics */}
                                  {order.realEstatePropertyId && (
                                    <div className="bg-white border border-slate-200/60 p-2.5 rounded-lg space-y-1 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                                      <span className="text-[9px] uppercase font-black text-amber-900">🏠 Logement visé</span>
                                      <p className="font-extrabold text-slate-800 text-xs leading-tight">{order.realEstatePropertyName || order.realEstatePropertyId}</p>
                                      <p className="text-slate-500 text-[10px] font-mono">ID Réf: {order.realEstatePropertyId}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Matchmaker & Smart Assignment System Drawer */}
                            {order.status === 'pending' && assigningOrderId === order.id && (
                              <div className="bg-brand-700 p-4 border border-slate-200/60 rounded-2xl space-y-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-white animate-fade-in">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-xs">🤖</span>
                                    <h5 className="text-[10px] uppercase font-black text-slate-300 tracking-wider">Algorithme d'affectation intelligente - STUD'S MATCH</h5>
                                  </div>
                                  <span className="text-[9px] font-mono text-slate-400 font-bold">Ebolowa Matchmaker v1.1</span>
                                </div>

                                {availableStudents.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic">Aucun étudiant prestataire disponible n'est actuellement en ligne et certifié.</p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    {availableStudents.map(student => {
                                      const score = getSuitabilityScore(student);
                                      const activeJobs = orders.filter(o => o.providerId === student.id && o.status !== 'completed' && o.status !== 'cancelled').length;

                                      // Find matching availability for this student on the order's scheduled day
                                      const orderDayOfWeek = getDayOfWeekFrench(order.scheduledDate);
                                      const matchingAvail = (student.availabilities || []).find(av => {
                                        const avDayLower = av.day.toLowerCase();
                                        const orderDayLower = order.scheduledDate.toLowerCase();
                                        const calculatedDayLower = orderDayOfWeek.toLowerCase();
                                        return avDayLower === orderDayLower || 
                                               avDayLower === calculatedDayLower || 
                                               avDayLower === 'tous les jours' ||
                                               (avDayLower === 'week-end' && (calculatedDayLower === 'samedi' || calculatedDayLower === 'dimanche'));
                                      });

                                      return (
                                        <button
                                          key={student.id}
                                          onClick={() => handleAssignSubmit(order.id, student.id)}
                                          className={`p-2.5 bg-brand-800 hover:bg-white hover:text-slate-900 rounded-xl border ${
                                            matchingAvail && !matchingAvail.isAvailable 
                                              ? 'border-rose-500 bg-brand-700/85 hover:border-slate-900' 
                                              : 'border-slate-700'
                                          } text-left transition-all flex justify-between items-center cursor-pointer group`}
                                        >
                                          <div className="space-y-0.5 min-w-0 flex-1">
                                            <div className="flex items-center space-x-1.5 flex-wrap">
                                              <p className="font-extrabold text-xs text-white group-hover:text-slate-950 truncate">{student.firstName} {student.lastName}</p>
                                              {matchingAvail && !matchingAvail.isAvailable && (
                                                <span className="bg-rose-500 text-white font-bold text-[8px] uppercase px-1 py-0.5 rounded tracking-wide animate-pulse">Occupé ⚠️</span>
                                              )}
                                            </div>
                                            <p className="text-[9px] text-slate-400 group-hover:text-slate-600 font-mono">
                                              💼 {activeJobs} en cours | Solde: {student.balance.toLocaleString()} FCFA
                                            </p>
                                            {/* Availability Indicator */}
                                            <div className="pt-1 flex items-center gap-1.5">
                                              {matchingAvail ? (
                                                <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase ${
                                                  matchingAvail.isAvailable 
                                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500 group-hover:bg-emerald-100 group-hover:text-emerald-800' 
                                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500 group-hover:bg-rose-100 group-hover:text-rose-800'
                                                }`}>
                                                  {matchingAvail.isAvailable ? '✅ Dispo' : '❌ Occupé'} {matchingAvail.timeSlot !== 'Toute la journée' && `(${matchingAvail.timeSlot})`}
                                                </span>
                                              ) : (
                                                <span className="px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase bg-slate-700 text-slate-300 border border-slate-600 group-hover:bg-slate-100 group-hover:text-slate-700">
                                                  ❔ Dispo par défaut
                                                </span>
                                              )}
                                              {matchingAvail && matchingAvail.notes && (
                                                <span className="text-[8px] text-slate-400 italic font-mono truncate max-w-[120px] group-hover:text-slate-500">
                                                  ({matchingAvail.notes})
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <div className="text-right shrink-0">
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-black ${
                                              score >= 85 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500' :
                                              score >= 60 ? 'bg-amber-500/20 text-amber-300 border border-amber-500' :
                                              'bg-rose-500/20 text-rose-300 border border-rose-500'
                                            }`}>
                                              {score}% Match
                                            </span>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                                <div className="flex justify-between items-center pt-2">
                                  <button
                                    onClick={() => setAssigningOrderId(null)}
                                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold font-mono uppercase tracking-wide cursor-pointer"
                                  >
                                    Annuler l'attribution
                                  </button>
                                  <p className="text-[9px] text-slate-500 italic">Cliquez sur un profil pour l'assigner à la mission.</p>
                                </div>
                              </div>
                            )}

                            {/* SIGNAL BUTTON & PRIMARY ACTIONS CONTROLS */}
                            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/60 p-3 rounded-2xl shadow-sm">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-black uppercase text-slate-500">Actions Administratives :</span>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {/* Le bouton de signalisation des demandes de services lancées par les clients */}
                                {order.status === 'pending' && (
                                  <button
                                    onClick={async () => {
                                      await signalOrder(order.id);
                                      alert(`🚨 Demande de service pour "${order.serviceTitle}" diffusée d'urgence à tous les étudiants de la communauté !`);
                                    }}
                                    className={`py-1.5 px-3.5 border-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center space-x-2 shadow-sm border-slate-100/50 cursor-pointer transition-all ${
                                      order.isSignaled 
                                        ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-900 animate-pulse' 
                                        : 'bg-white hover:bg-rose-50 text-rose-600 border-slate-900'
                                    }`}
                                  >
                                    <Megaphone className="w-3.5 h-3.5 animate-bounce" />
                                    <span>{order.isSignaled ? 'Relancer le Signal Radar (Diffusé)' : '🚨 Signaler & Diffuser la Demande'}</span>
                                  </button>
                                )}

                                {order.status !== 'completed' && order.status !== 'cancelled' && (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => {
                                        updateOrderStatus(order.id, 'completed');
                                        alert("Mission marquée comme complétée par l'administrateur.");
                                      }}
                                      className="py-1.5 px-3 bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-950 text-emerald-950 font-black uppercase rounded-xl text-[9px] tracking-wide cursor-pointer flex items-center space-x-1 shadow-sm"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Forcer la Complétion</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm("Voulez-vous vraiment annuler cette commande ?")) {
                                          updateOrderStatus(order.id, 'cancelled');
                                        }
                                      }}
                                      className="py-1.5 px-3 bg-rose-100 hover:bg-rose-200 border-2 border-rose-950 text-rose-950 font-black uppercase rounded-xl text-[9px] tracking-wide cursor-pointer flex items-center space-x-1 shadow-sm"
                                    >
                                      <XCircle className="w-3 h-3" />
                                      <span>Annuler la Mission</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: USER DIRECTORY & NFC CARDS */}
        {activeTab === 'members' && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6"
          >
            {/* AI COPILOT MEMBER MANAGEMENT PORTAL */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-slate-200/80 rounded-[28px] p-6 shadow-[6px_6px_0px_rgba(15,23,42,1)] space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-slate-900 pb-4 gap-4">
                <div className="flex items-center space-x-3">
                  <span className="p-2.5 bg-indigo-600 border border-slate-200/60 rounded-2xl text-white shadow-sm border-slate-100/50 animate-bounce">
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  </span>
                  <div>
                    <h3 className="font-sans font-black text-sm uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                      <span>Copilote IA : Gestion Automatique des Membres</span>
                      <span className="text-[10px] bg-indigo-200 text-indigo-800 font-bold px-2 py-0.5 rounded-full uppercase">Assistant Officiel</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                      Auditez les profils, motivez les étudiants d'Ebolowa et appliquez des actions d'administration intelligentes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Prompt Templates */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-700 block">Modèles d'instructions rapides :</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAiPrompt("Analyse générale de tous les membres : propose un rapport global de fidélité pour les clients, de conformité pour les prestataires et d'efficacité pour les assistants.");
                      void 0;
                    }}
                    className="p-2.5 bg-white border border-slate-200/60 rounded-xl text-left text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-sm border-slate-100/50"
                  >
                    <span className="text-sm">📊</span>
                    <span>Analyse générale et rapport global</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAiPrompt("Trouve les 3 étudiants/prestataires les plus actifs et dévoués, justifie ton choix, attribue-leur un bonus de fidélité de 2000 FCFA et rédige un message de félicitations pour chacun d'eux.");
                      void 0;
                    }}
                    className="p-2.5 bg-white border border-slate-200/60 rounded-xl text-left text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-sm border-slate-100/50"
                  >
                    <span className="text-sm">🎁</span>
                    <span>Récompenser les 3 meilleurs étudiants</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAiPrompt("Identifie les comptes de prestataires inactifs depuis longtemps ou ceux ayant des notes inférieures à 3.5/5. Propose un avertissement ou une suspension motivée.");
                      void 0;
                    }}
                    className="p-2.5 bg-white border border-slate-200/60 rounded-xl text-left text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-sm border-slate-100/50"
                  >
                    <span className="text-sm">⚠️</span>
                    <span>Détecter les comptes inactifs / mal notés</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAiPrompt("Identifie les clients les plus réguliers sur la plateforme, propose de leur offrir 10 points de fidélité gratuits avec un beau message d'appréciation pour fidéliser la communauté.");
                      void 0;
                    }}
                    className="p-2.5 bg-white border border-slate-200/60 rounded-xl text-left text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-sm border-slate-100/50"
                  >
                    <span className="text-sm">✨</span>
                    <span>Fidéliser les clients fidèles (Points)</span>
                  </button>
                </div>
              </div>

              {/* Input section */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-700 block">Saisissez vos instructions personnalisées :</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: Analyse les prestataires et suspends ceux qui n'ont aucune photo de profil valide, tout en leur envoyant une notification pour s'expliquer..."
                  className="w-full p-3 border border-slate-200/60 rounded-2xl bg-white font-sans text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[90px]"
                />
              </div>

              {/* Execution logic */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <p className="text-[10.5px] font-black text-slate-700 bg-blue-50 border border-blue-200 rounded-xl p-2.5">🔒 L'IA propose, vous décidez : aucune action n'est appliquée sans votre confirmation.</p>

                <button
                  type="button"
                  onClick={() => handleAiAction()}
                  disabled={isAiLoading}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white border border-slate-200/60 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-md shadow-slate-100 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isAiLoading ? 'L\'IA analyse...' : 'Lancer le Copilote IA 🚀'}</span>
                </button>
              </div>

              {/* Error area */}
              {aiError && (
                <div className="p-3.5 bg-rose-50 border-2 border-rose-300 text-rose-950 rounded-xl text-xs font-bold">
                  ⚠️ {aiError}
                </div>
              )}

              {/* Loading indicator */}
              {isAiLoading && (
                <div className="py-8 text-center space-y-3 bg-white border border-slate-200/60 border-dashed rounded-2xl">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <div className="space-y-1">
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest font-black animate-pulse">L'IA de STUD'S est à l'œuvre</p>
                    <p className="text-[10px] text-slate-400 font-bold px-8 leading-normal">
                      Vérification des profils étudiants, de la conformité des cartes NFC, des historiques d'avis et des volumes de services...
                    </p>
                  </div>
                </div>
              )}

              {/* Results display area */}
              {aiResult && (
                <div className="space-y-5 border-t-2 border-dashed border-slate-300 pt-5">
                  {/* Analysis Rapport */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 space-y-2">
                    <h4 className="font-sans font-black text-[11px] text-indigo-950 uppercase tracking-wide flex items-center gap-1.5 border-b pb-1.5 border-slate-100">
                      <span>Rapport & Analyse Stratégique de l'IA</span>
                    </h4>
                    <p className="text-[11px] text-slate-700 font-bold leading-relaxed whitespace-pre-wrap font-sans">
                      {aiResult.analysis}
                    </p>
                  </div>

                  {/* Actions suggestions table */}
                  {aiResult.suggestedActions && aiResult.suggestedActions.length > 0 && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-sans font-black text-[11px] text-slate-800 uppercase tracking-wider">
                          Actions Recommandées de Gestion ({aiResult.suggestedActions.length})
                        </h4>
                        {!executeAutomatically && (
                          <button
                            type="button"
                            onClick={handleApplyAllAiActions}
                            className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white border border-slate-200/60 rounded-lg text-[10px] font-black uppercase shadow-sm border-slate-100/50 cursor-pointer"
                          >
                            Appliquer Toutes les Actions (Batch)
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {aiResult.suggestedActions.map((actionItem: any, idx: number) => {
                          const isApplied = actionItem.applied;
                          const hasNoneAction = actionItem.action === 'none';

                          return (
                            <div
                              key={`${actionItem.userId}-${idx}`}
                              className={`bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-sm border-slate-100/50 transition-all ${
                                isApplied ? 'opacity-65 bg-slate-50/50' : ''
                              }`}
                            >
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2.5 border-b pb-2.5 border-slate-100">
                                <div>
                                  <h5 className="font-black text-xs text-slate-950 flex items-center gap-2">
                                    <span>{actionItem.userName}</span>
                                    <span className="text-[9px] text-slate-400 font-mono">ID: {actionItem.userId}</span>
                                  </h5>
                                  <p className="text-[10px] text-rose-950 font-semibold italic mt-0.5">
                                    " {actionItem.reason} "
                                  </p>
                                </div>

                                <div className="shrink-0">
                                  {actionItem.action === 'suspend' && (
                                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 font-black text-[9px] rounded-lg uppercase tracking-tight">
                                      🚫 Suspendre
                                    </span>
                                  )}
                                  {(actionItem.action === 'activate' || actionItem.action === 'approve') && (
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[9px] rounded-lg uppercase tracking-tight">
                                      🟢 Activer/Approuver
                                    </span>
                                  )}
                                  {actionItem.action === 'reject' && (
                                    <span className="px-2.5 py-1 bg-red-100 text-red-800 border border-red-300 font-black text-[9px] rounded-lg uppercase tracking-tight">
                                      ❌ Rejeter Candidature
                                    </span>
                                  )}
                                  {actionItem.action === 'addBonus' && (
                                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 border border-indigo-300 font-black text-[9px] rounded-lg uppercase tracking-tight">
                                      💸 Bonus : +{actionItem.bonusAmount} FCFA
                                    </span>
                                  )}
                                  {actionItem.action === 'addPoints' && (
                                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 font-black text-[9px] rounded-lg uppercase tracking-tight">
                                      🏆 Fidélité : +{actionItem.pointsAmount} pts
                                    </span>
                                  )}
                                  {actionItem.action === 'warn' && (
                                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 font-black text-[9px] rounded-lg uppercase tracking-tight">
                                      ⚠️ Avertissement
                                    </span>
                                  )}
                                  {hasNoneAction && (
                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-300 font-bold text-[9px] rounded-lg uppercase tracking-tight">
                                      ℹ️ Conseil simple
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* AI message suggestion */}
                              {actionItem.notificationMessage && (
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                                  <p className="text-[8px] font-black uppercase text-indigo-600">Message rédigé par l'IA :</p>
                                  <p className="text-[10px] text-slate-600 font-bold italic">
                                    "{actionItem.notificationMessage}"
                                  </p>
                                </div>
                              )}

                              {/* Apply individual actions triggers */}
                              {!executeAutomatically && !hasNoneAction && (
                                <div className="flex items-center justify-end mt-1">
                                  {isApplied ? (
                                    <span className="text-[10px] text-emerald-600 font-black uppercase flex items-center gap-1">
                                      <span>✓ Action Appliquée</span>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={isApplyingSingleAction === actionItem.userId}
                                      onClick={() => handleApplySingleAiAction(actionItem)}
                                      className="py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200/60 rounded-xl text-[10px] font-black uppercase shadow-sm cursor-pointer disabled:opacity-50"
                                    >
                                      {isApplyingSingleAction === actionItem.userId ? 'Application...' : 'Appliquer l\'action'}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pending Student Registrations Approval Section */}
            {users.some(u => u.role === 'provider' && u.status === 'pending') && (
              <div className="bg-amber-50 border border-slate-200/80 rounded-[24px] p-5 shadow-lg shadow-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 bg-amber-500 border border-slate-200/50 rounded-lg text-white">
                      <UserCheck className="w-4 h-4" />
                    </span>
                    <h3 className="font-sans font-black text-xs uppercase tracking-wider text-amber-950">
                      Candidatures Étudiantes en Attente de Validation (Ebolowa)
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 bg-brand-700 text-white font-mono text-[9px] font-black rounded-lg">
                    {users.filter(u => u.role === 'provider' && u.status === 'pending').length} en attente
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.filter(u => u.role === 'provider' && u.status === 'pending').map(candidate => (
                    <div key={candidate.id} className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between gap-3.5 shadow-sm border-slate-100/50">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-xl border border-slate-200/60 bg-slate-100 flex items-center justify-center font-black text-xs shrink-0 uppercase overflow-hidden shadow-sm">
                          {candidate.avatar ? (
                            <img src={candidate.avatar} alt="Photo" className="w-full h-full object-cover" />
                          ) : (
                            <span>{candidate.firstName.slice(0, 1)}{candidate.lastName.slice(0, 1)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-xs text-slate-900 truncate">
                            {candidate.firstName} {candidate.lastName}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium truncate">{candidate.email}</p>
                          <p className="text-[9px] text-slate-500 font-mono font-semibold">{candidate.phone}</p>
                          {candidate.birthDate && (
                            <p className="text-[9px] text-slate-400 font-sans mt-0.5 font-bold">
                              🎂 Naissance: {candidate.birthDate}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-t border-slate-150 pt-2.5">
                        <button
                          onClick={() => {
                            if (window.confirm(`Valider l'inscription de l'étudiant ${candidate.firstName} ${candidate.lastName} ? Sa carte intelligente NFC sera émise.`)) {
                              approveProvider(candidate.id);
                            }
                          }}
                          className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wide border border-slate-200/60 rounded-lg transition-all shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer text-center"
                        >
                          Approuver ✅
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Refuser la candidature de ${candidate.firstName} ${candidate.lastName} ?`)) {
                              rejectProvider(candidate.id);
                            }
                          }}
                          className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-[10px] uppercase tracking-wide border border-slate-200/60 rounded-lg transition-all shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer text-center"
                        >
                          Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search and Role Filter header */}
            <div className="bento-card grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="relative md:col-span-7">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-800 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, téléphone..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none font-bold"
                />
              </div>

              <div className="flex space-x-2 md:col-span-5">
                {(['all', 'client', 'provider'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`flex-1 py-1.5 border-2 rounded-xl text-xs font-black transition-all ${
                      roleFilter === role
                        ? 'bg-brand-700 border-slate-900 text-white'
                        : 'bg-white border-slate-900 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {role === 'all' ? 'Tous' : role === 'client' ? 'Clients' : 'Étudiants'}
                  </button>
                ))}
              </div>
            </div>

            {/* Members Grid list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map(user => {
                const hasCard = cards.some(c => c.userId === user.id);
                return (
                  <div
                    key={user.id}
                    className="bento-card flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-12 h-12 rounded-xl border border-slate-200/60 bg-slate-100 flex items-center justify-center font-black text-xs shrink-0 uppercase overflow-hidden shadow-sm">
                        {user.avatar ? (
                          <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.firstName.slice(0, 1)}{user.lastName.slice(0, 1)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">
                            {user.firstName} {user.lastName}
                          </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                            user.role === 'client' ? 'bg-blue-100 text-blue-900 border-blue-900' : 'bg-indigo-100 text-indigo-900 border-indigo-900'
                          }`}>
                            {user.role === 'client' ? 'Client' : 'Étudiant'}
                          </span>

                          {user.status === 'pending' && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-amber-100 text-amber-900 border-amber-900 animate-pulse">
                              En attente de validation
                            </span>
                          )}

                          {/* Live Availability Status for Active Student Providers */}
                          {user.role === 'provider' && user.status === 'active' && (() => {
                            const isBusy = orders.some(o => o.providerId === user.id && (o.status === 'assigned' || o.status === 'in_progress'));
                            return isBusy ? (
                              <button
                                onClick={() => {
                                  const currentMissions = orders.filter(o => o.providerId === user.id && (o.status === 'assigned' || o.status === 'in_progress'));
                                  alert(`Étudiant occupé : ${user.firstName} est affecté à ${currentMissions.length} mission(s) active(s) : "${currentMissions.map(m => m.serviceTitle).join(', ')}".`);
                                }}
                                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 border border-rose-950 font-black rounded text-white text-[9px] uppercase tracking-wider flex items-center space-x-1 shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                              >
                                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                <span>OCCUPÉ</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  alert(`${user.firstName} est libre et disponible pour de nouvelles attributions de missions.`);
                                }}
                                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-950 font-black rounded text-white text-[9px] uppercase tracking-wider flex items-center space-x-1 shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                              >
                                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                <span>DISPONIBLE</span>
                              </button>
                            );
                          })()}
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">{user.email}</p>
                        <p className="text-[10px] text-slate-500 truncate font-mono font-bold">{user.phone}</p>
                      </div>
                    </div>

                    {/* Declared Availability Slots Roster (Provider/Student only) */}
                    {user.role === 'provider' && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-1 space-y-1.5 text-left">
                        <p className="text-[8.5px] text-slate-500 font-mono uppercase font-black tracking-wider flex items-center gap-1">
                          📅 Calendrier des Disponibilités
                        </p>
                        {!user.availabilities || user.availabilities.length === 0 ? (
                          <p className="text-[10px] text-slate-400 italic">Aucun créneau déclaré (disponible à tout moment par défaut).</p>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-h-[72px] overflow-y-auto">
                            {user.availabilities.map((av: any) => (
                              <span 
                                key={av.id} 
                                className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-md border flex items-center gap-1 ${
                                  av.isAvailable 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                                title={av.notes || (av.isAvailable ? 'Disponible' : 'Occupé')}
                              >
                                {av.isAvailable ? '✅' : '❌'} {av.day} ({av.timeSlot})
                                {av.notes && <span className="text-[7.5px] text-slate-400 italic font-normal max-w-[65px] truncate">({av.notes})</span>}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions and Balance bar */}
                    <div className="border-t-2 border-slate-100 pt-3 flex items-center justify-between">
                      <div>
                        <p className="text-[8px] text-slate-400 font-mono uppercase font-black">Solde</p>
                        <p className="text-xs font-black font-mono text-slate-900">{user.balance.toLocaleString()} FCFA</p>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {/* Adjust balance btn */}
                        <button
                          onClick={() => setAdjustingUser(user)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg text-slate-800 hover:text-slate-950 shadow-sm"
                          title="Ajuster le solde"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>

                        {/* Issue card button if missing (Clients only) */}
                        {user.role === 'client' && (!hasCard ? (
                          <button
                            onClick={() => {
                              const card = issueNfcCard(user.id);
                              if (card) alert(`Carte NFC émise : ${card.id}`);
                            }}
                            className="bento-button-light px-2.5 py-1 text-[9px]"
                          >
                            <Cpu className="w-3 h-3" />
                            <span>Lier NFC</span>
                          </button>
                        ) : (
                          <span className="text-[9px] font-mono bg-emerald-100 text-emerald-950 border-2 border-emerald-900 px-2 py-0.5 rounded-lg flex items-center space-x-0.5 font-bold">
                            <span>NFC Activé</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB: DIRECTORS MANAGEMENT */}
        {activeTab === 'directors' && (() => {
          const directorsList = users.filter(u => u.role === 'supervisor');
          
          return (
            <motion.div
              key="directors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-6 font-sans"
            >
              {/* Header section with instructions */}
              <div className="bento-card bg-brand-700 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 text-[9px] bg-amber-500 text-slate-950 rounded font-black tracking-widest uppercase border border-amber-400">
                    POOL EXÉCUTIF STUD'S EBOLOWA
                  </span>
                  <h3 className="font-extrabold text-lg uppercase tracking-tight text-white">
                    Annuaire & Gestion des 8 Directeurs
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    Inscrivez et supervisez les 8 Directeurs de Pôles d'Ebolowa. Les transferts financiers de mission s'effectuent directement vers leur portefeuille électronique mobile (Orange Money / MTN MoMo) sans transiter par d'autres comptes.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    if (directorsList.length >= 8) {
                      const proceed = window.confirm("Attention : Vous avez déjà inscrit " + directorsList.length + " directeurs (limite cible de 8). Souhaitez-vous inscrire un directeur supplémentaire ?");
                      if (!proceed) return;
                    }
                    setShowDirectorModal(true);
                  }}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black border-2 border-slate-950 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[2.5px_2.5px_0px_rgba(255,255,255,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer flex items-center space-x-1"
                >
                  <span>Inscrire un Directeur 👔</span>
                </button>
              </div>

              {/* Grid list of registered directors */}
              {directorsList.length === 0 ? (
                <div className="text-center p-12 bg-white border-2 border-dashed border-slate-300 rounded-3xl space-y-3">
                  <p className="text-sm font-bold text-slate-500 uppercase">Aucun directeur enregistré pour le moment.</p>
                  <p className="text-xs text-slate-400">Cliquez sur le bouton ci-dessus pour enregistrer le premier directeur de pôle d'Ebolowa.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {directorsList.map(dir => {
                    const isMtn = dir.phone.startsWith('67') || dir.phone.startsWith('650') || dir.phone.startsWith('651') || dir.phone.startsWith('652') || dir.phone.startsWith('653') || dir.phone.startsWith('654') || dir.phone.startsWith('68');
                    const walletProvider = isMtn ? 'MTN MoMo 🟡' : 'Orange Money 🍊';

                    return (
                      <div 
                        key={dir.id}
                        className="bento-card flex flex-col justify-between hover:border-slate-950 transition-all group relative overflow-hidden"
                      >
                        {/* Grade banner at the top of card */}
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-700 group-hover:bg-amber-500 transition-colors" />

                        <div className="space-y-4 pt-2">
                          {/* Profile photo preset & details */}
                          <div className="flex flex-col items-center text-center space-y-2 pb-3 border-b border-dashed border-slate-150">
                            <img 
                              src={dir.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(dir.firstName)}`}
                              alt={dir.firstName}
                              className="w-16 h-16 rounded-full border border-slate-200/60 object-cover bg-slate-50 shadow-inner"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                                {dir.firstName} {dir.lastName}
                              </h4>
                              <p className="text-[10px] font-black text-amber-600 uppercase tracking-wide mt-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg w-fit mx-auto">
                                {dir.grade || 'Directeur de Pôle'}
                              </p>
                            </div>
                          </div>

                          {/* Info Rows */}
                          <div className="space-y-2 text-xs font-medium">
                            <div className="flex justify-between font-mono">
                              <span className="text-slate-400 text-[10px] font-sans font-bold">Portefeuille</span>
                              <span className="text-slate-900 font-bold">{walletProvider}</span>
                            </div>
                            <div className="flex justify-between font-mono">
                              <span className="text-slate-400 text-[10px] font-sans font-bold">Numéro</span>
                              <span className="text-slate-900 font-black">{dir.phone}</span>
                            </div>
                            <div className="flex justify-between font-mono">
                              <span className="text-slate-400 text-[10px] font-sans font-bold">Email</span>
                              <span className="text-slate-700 truncate max-w-[130px]">{dir.email}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-[10px] font-bold">Statut</span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-950 font-black border border-emerald-300 px-2 py-0.5 rounded-lg flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                <span>Actif</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Direct Transfer Button */}
                        <div className="border-t-2 border-slate-100 mt-5 pt-3.5 space-y-2">
                          <button
                            onClick={() => {
                              setTransferRecipientId(dir.id);
                              setTransferMotif("Frais de Mission 💼");
                              setIsTransferModalOpen(true);
                            }}
                            className="w-full py-2 bg-brand-700 hover:bg-brand-800 text-white font-black border border-slate-200/60 rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-sm active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none cursor-pointer flex items-center justify-center space-x-1 font-bold font-sans"
                          >
                            <span>Faire un Virement Direct 💸</span>
                          </button>

                          {isMasterAdmin && (
                            <div className="grid grid-cols-2 gap-2 mt-2 pt-1 border-t border-dashed border-slate-150">
                              <button
                                onClick={() => {
                                  setSelectedDirForEdit(dir);
                                  setEditDirGrade(dir.grade || 'Directeur de Pôle');
                                  setEditDirAllowedTabs(dir.allowedTabs || ['kpis', 'orders']);
                                  setShowEditModal(true);
                                }}
                                className="py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black border-2 border-slate-950 rounded-xl text-[9px] uppercase tracking-wider transition-all cursor-pointer text-center"
                              >
                                Droits ⚙️
                              </button>
                              <button
                                onClick={() => handleDeleteDirectorClick(dir.id, `${dir.firstName} ${dir.lastName}`)}
                                className="py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold border-2 border-rose-900 rounded-xl text-[9px] uppercase tracking-wider transition-all cursor-pointer text-center"
                              >
                                Révoquer ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Activity Log Feed (Télémétrie) */}
              {isMasterAdmin && (
                <div className="bento-card bg-white space-y-4 border border-slate-200/60 shadow-lg shadow-slate-100 rounded-2xl p-5 font-sans mt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 border-slate-100 gap-2">
                    <div className="space-y-0.5">
                      <h3 className="font-extrabold text-sm uppercase tracking-tight text-slate-900 flex items-center space-x-2">
                        <span>📜 Journal d'Activité & Télémétrie des Assistants</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">Contrôlez les actions effectuées par vos collaborateurs en temps réel.</p>
                    </div>
                    <button 
                      onClick={loadLogs}
                      className="px-3 py-1.5 text-[9px] bg-brand-700 hover:bg-brand-800 text-white border border-slate-200/60 rounded-xl font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-[1.5px_1.5px_0px_rgba(245,158,11,1)]"
                    >
                      Rafraîchir 🔄
                    </button>
                  </div>

                  {logs.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 space-y-1">
                      <p className="text-xs font-bold uppercase">Aucune activité enregistrée.</p>
                      <p className="text-[10px]">Les actions réalisées par les assistants d'administration apparaîtront ici.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-start space-x-3 text-xs border-b border-dashed border-slate-100 pb-3 last:border-none last:pb-0">
                          <span className="px-2.5 py-1 bg-amber-100 border border-amber-300 text-slate-900 font-black rounded-lg text-[9px] uppercase tracking-wide">
                            {log.userName}
                          </span>
                          <div className="flex-1 space-y-0.5 text-left">
                            <p className="font-bold text-slate-800">{log.action}</p>
                            <p className="text-[9px] text-slate-400 font-mono">
                              {log.userEmail} • {new Date(log.timestamp).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })()}

        {/* TAB 4: CLIENT RATINGS & MODERATION CONTROL */}
        {activeTab === 'ratings' && (
          <motion.div
            key="ratings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6 font-sans"
          >
            {/* Header / Intro Banner */}
            <div className="bento-card bg-amber-50 border border-slate-200/60 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-amber-500 border border-slate-200/50 rounded-xl text-white">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-sm uppercase text-slate-900">
                  Centre de Modération des Avis & Notations Écologiques
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                En tant qu'administrateur de STUD'S, vous contrôlez la réputation de la plateforme. Vous pouvez corriger les notations injustes, anonymiser ou masquer les avis non-constructifs, et transmettre directement les conflits sérieux au département de <strong>Supervision Qualité</strong>.
              </p>
            </div>

            {/* Ratings Overview KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {(() => {
                const ratedOrders = orders.filter(o => o.rating !== undefined);
                const average = ratedOrders.length > 0 
                  ? (ratedOrders.reduce((acc, o) => acc + (o.rating || 0), 0) / ratedOrders.length).toFixed(1)
                  : 'N/A';
                const hiddenCount = ratedOrders.filter(o => o.ratingHidden).length;
                const criticalCount = ratedOrders.filter(o => (o.rating || 0) <= 3).length;

                return (
                  <>
                    <div className="p-4 bg-white border border-slate-200/60 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] text-center">
                      <p className="text-2xl font-black text-slate-900 font-mono flex items-center justify-center space-x-1.5">
                        <span>{average}</span>
                        <Star className="w-5 h-5 fill-amber-400 text-amber-500 shrink-0" />
                      </p>
                      <p className="text-[9px] text-slate-500 font-black uppercase mt-1">Moyenne Générale</p>
                    </div>

                    <div className="p-4 bg-white border border-slate-200/60 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] text-center">
                      <p className="text-2xl font-black text-slate-900 font-mono">{ratedOrders.length}</p>
                      <p className="text-[9px] text-slate-500 font-black uppercase mt-1">Total Évaluations</p>
                    </div>

                    <div className="p-4 bg-brand-700 border border-slate-200/60 rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)] text-center text-white">
                      <p className="text-2xl font-black text-amber-400 font-mono">{hiddenCount}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase mt-1">Avis Masqués du Public</p>
                    </div>

                    <div className="p-4 bg-rose-50 border-2 border-rose-900 rounded-2xl shadow-md shadow-slate-100 text-center">
                      <p className="text-2xl font-black text-rose-600 font-mono">{criticalCount}</p>
                      <p className="text-[9px] text-rose-700 font-black uppercase mt-1">Litiges Critiques (Note ≤ 3)</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Evaluations Feed list */}
            <div className="space-y-4">
              {orders.filter(o => o.rating !== undefined).length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-white">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-bold">Aucun avis client n'a été enregistré sur la plateforme pour le moment.</p>
                </div>
              ) : (
                orders.filter(o => o.rating !== undefined).map(order => {
                  const isEditing = editingRatingOrderId === order.id;
                  const scoreStars = order.rating || 0;
                  const isHidden = order.ratingHidden;
                  const commentText = order.comment || order.reviewComment || '';

                  return (
                    <div
                      key={order.id}
                      className={`bento-card flex flex-col md:flex-row md:items-start justify-between gap-5 transition-all duration-300 ${
                        isHidden ? 'bg-slate-50 border-dashed opacity-85' : 'bg-white'
                      } ${scoreStars <= 3 ? 'border-l-8 border-l-rose-500' : 'border-l-8 border-l-emerald-500'}`}
                    >
                      {/* Review core content */}
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Stars layout */}
                          <div className="flex items-center space-x-0.5 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-lg">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < scoreStars 
                                    ? 'fill-amber-400 text-amber-500' 
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs font-black text-slate-800 font-mono ml-1.5">{scoreStars}/5</span>
                          </div>

                          <span className="text-[10px] font-mono text-slate-400">
                            REF: {order.id} | {order.serviceTitle}
                          </span>

                          {isHidden ? (
                            <span className="px-2 py-0.5 text-[8px] bg-brand-700 text-white rounded font-extrabold flex items-center space-x-1">
                              <EyeOff className="w-2.5 h-2.5" />
                              <span>🚫 MASQUÉ DU SITE PUBLIC</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[8px] bg-emerald-100 text-emerald-950 rounded font-extrabold border border-emerald-300 flex items-center space-x-1">
                              <Eye className="w-2.5 h-2.5" />
                              <span>✅ PUBLIÉ SUR LE SITE</span>
                            </span>
                          )}
                        </div>

                        {/* Text comment body */}
                        {isEditing ? (
                          <div className="bg-slate-50 p-4 border border-slate-200/60 rounded-xl space-y-3 max-w-xl animate-fade-in">
                            <p className="text-[10px] text-slate-500 font-black uppercase">Éditeur de Modération Administratif</p>
                            
                            {/* Score adjuster */}
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-700">Ajuster la note :</span>
                              <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((starVal) => (
                                  <button
                                    key={starVal}
                                    type="button"
                                    onClick={() => setEditingRatingStars(starVal)}
                                    className="cursor-pointer"
                                  >
                                    <Star className={`w-5 h-5 ${starVal <= editingRatingStars ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Comment text editor */}
                            <div className="space-y-1">
                              <label className="text-[9px] text-slate-400 font-mono uppercase font-black">Commentaire Client</label>
                              <textarea
                                value={editingRatingComment}
                                onChange={(e) => setEditingRatingComment(e.target.value)}
                                className="w-full text-xs font-medium p-2 bg-white border border-slate-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                                rows={2}
                                placeholder="Modifier le texte ou censurer les propos vulgaires..."
                              />
                            </div>

                            <div className="flex space-x-2 pt-1.5">
                              <button
                                onClick={async () => {
                                  await moderateRating(order.id, {
                                    rating: editingRatingStars,
                                    comment: editingRatingComment
                                  });
                                  setEditingRatingOrderId(null);
                                  alert("L'évaluation client a été modifiée avec succès par la direction.");
                                }}
                                className="px-3 py-1 bg-brand-700 hover:bg-brand-800 text-white font-black rounded-lg text-[10px] uppercase cursor-pointer"
                              >
                                Sauvegarder
                              </button>
                              <button
                                onClick={() => setEditingRatingOrderId(null)}
                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[10px] uppercase border border-slate-300 cursor-pointer"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-slate-900 font-medium text-sm leading-relaxed italic bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl">
                              "{commentText || 'Aucun commentaire textuel rédigé.'}"
                            </p>
                            
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 font-medium pt-1">
                              <p>👤 <strong>Client émetteur :</strong> {order.clientName}</p>
                              <p>🎓 <strong>Prestataire Noté :</strong> {order.providerName || 'N/A'}</p>
                              <p>📅 Date service: {order.scheduledDate}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Administrative Moderation Buttons */}
                      {!isEditing && (
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t-2 md:border-t-0 border-slate-100 pt-3 md:pt-0 min-w-[170px] shrink-0">
                          {/* Toggle visibility */}
                          <button
                            onClick={async () => {
                              await moderateRating(order.id, { ratingHidden: !isHidden });
                              alert(`L'avis du client a été ${isHidden ? 'remis en ligne' : 'masqué du site public'} !`);
                            }}
                            className={`w-full py-1.5 px-3 border border-slate-200/50 rounded-lg text-[9px] font-black uppercase tracking-wide flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                              isHidden 
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-500 hover:bg-emerald-100'
                                : 'bg-brand-700 text-white hover:bg-brand-800'
                            }`}
                          >
                            {isHidden ? (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>Rétablir l'avis</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Masquer du site</span>
                              </>
                            )}
                          </button>

                          {/* Quick Edit */}
                          <button
                            onClick={() => {
                              setEditingRatingOrderId(order.id);
                              setEditingRatingStars(order.rating || 5);
                              setEditingRatingComment(commentText);
                            }}
                            className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200/50 text-slate-800 font-extrabold rounded-lg text-[9px] uppercase tracking-wide flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Modifier la note</span>
                          </button>

                          {/* Trigger Quality Investigation */}
                          <button
                            onClick={async () => {
                              // Send push notification to quality controller
                              const res = await fetch('/api/admin/notify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  target: 'supervisors',
                                  title: '⚠️ LITIGE & LITIGES CLIENT',
                                  message: `L'administrateur signale l'évaluation insatisfaisante de ${order.clientName} pour la mission "${order.serviceTitle}" (${scoreStars}/5). Inspection nécessaire.`,
                                  type: 'warning'
                                })
                              });
                              if (res.ok) {
                                alert(`🚨 Signalement transmis avec succès au Superviseur Qualité. Le litige a été placé en file d'attente d'arbitrage !`);
                              }
                            }}
                            className="w-full py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-950 border border-rose-300 font-black rounded-lg text-[9px] uppercase tracking-wide flex items-center justify-center space-x-1.5 cursor-pointer"
                          >
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>Alerter la Qualité</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 5: FINANCIAL ACCOUNTABILITY */}
        {activeTab === 'financials' && (
          <motion.div
            key="financials"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6"
          >
            {/* Margins details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bento-card">
                <p className="text-[9px] text-slate-400 font-mono uppercase font-black tracking-wider">Volume d'affaires total</p>
                <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                  {report.totalRevenue.toLocaleString()} FCFA
                </p>
                <p className="text-[9px] text-slate-500 font-medium mt-1">100% des fonds sécurisés traités</p>
              </div>

              <div className="bento-card-emerald">
                <p className="text-[9px] text-emerald-800 font-mono uppercase font-black tracking-wider">Revenus reversés (70%)</p>
                <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                  {report.providerPayouts.toLocaleString()} FCFA
                </p>
                <p className="text-[9px] text-slate-700 font-medium mt-1">Financement direct de l'éducation locale</p>
              </div>

              <div className="bento-card">
                <p className="text-[9px] text-slate-400 font-mono uppercase font-black tracking-wider">Commissions plateforme (30%)</p>
                <p className="text-lg font-black text-indigo-950 font-mono mt-0.5">
                  {report.platformCommission.toLocaleString()} FCFA
                </p>
                <p className="text-[9px] text-slate-500 font-medium mt-1">Marges nettes opérationnelles</p>
              </div>
            </div>

            {/* Custom High-Quality SVG Charts Center */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly stats chart */}
              <div className="bento-card space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
                  Évolution Mensuelle des Revenus (FCFA)
                </h4>

                {/* SVG Visual bar chart */}
                <div className="relative h-48 w-full border-b-2 border-slate-200 flex items-end justify-around pb-1.5 pt-6 font-mono text-[9px] text-slate-500">
                  {report.monthlyStats.map((item, index) => {
                    const maxRev = Math.max(...report.monthlyStats.map(m => m.revenue));
                    const percentage = maxRev > 0 ? (item.revenue / maxRev) * 100 : 0;
                    return (
                      <div key={index} className="flex flex-col items-center space-y-2 flex-1 group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-700 text-white p-2 rounded text-[8px] font-sans font-bold whitespace-nowrap z-10 shadow border border-slate-700">
                          Revenus: {item.revenue.toLocaleString()} FCFA <br />
                          Commandes: {item.ordersCount}
                        </div>
                        {/* Chart bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(10, percentage * 1.2)}px` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="w-10 bg-brand-700 hover:bg-brand-800 rounded-t-lg border-2 border-slate-950 shadow"
                        />
                        <span className="text-slate-800 font-black">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Share Breakdown */}
              <div className="bento-card space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
                  Répartition des Activités par Catégorie
                </h4>

                <div className="space-y-3 pt-2">
                  {report.categoryStats.map((item, index) => {
                    const totalCount = report.categoryStats.reduce((acc, c) => acc + c.count, 0);
                    const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-700">
                          <span className="font-extrabold text-slate-800">{getCategoryLabel(item.category)}</span>
                          <span className="font-mono font-black">{item.revenue.toLocaleString()} FCFA ({percentage}%)</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 border border-slate-200/60 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full bg-brand-700 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Loyalty Configuration Panel */}
            <div className="bento-card border border-slate-200/80 bg-amber-50/40 rounded-[24px] space-y-4">
              <div className="border-b-2 border-slate-900 pb-2 flex items-center space-x-2">
                <span className="p-1.5 bg-amber-500 border border-slate-200/50 rounded-lg text-white">
                  <Award className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">Configuration du Programme Fidélité (STUD'S)</h4>
                  <p className="text-[10px] text-slate-500 font-bold">Ajustez le taux d'attribution automatique et la valeur monétaire des points.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                {/* Points rate input card */}
                <div className="p-4 bg-white border border-slate-200/60 rounded-2xl space-y-3 shadow-sm border-slate-100/50">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">Taux d'Attribution</span>
                    <span className="px-2 py-0.5 text-[8px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">Automatique</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-normal">
                    Points attribués au client pour chaque tranche de <strong className="text-slate-900 font-extrabold">1 000 FCFA</strong> payée ou rechargée.
                  </p>
                  <div className="flex items-center space-x-3.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.max(1, parseInt(rateInput) - 1);
                        setRateInput(next.toString());
                      }}
                      className="p-1.5 border border-slate-200/60 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer flex items-center justify-center"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={rateInput}
                      onChange={e => setRateInput(e.target.value)}
                      className="w-16 text-center border border-slate-200/60 rounded-xl py-1 text-xs font-black"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = parseInt(rateInput) + 1;
                        setRateInput(next.toString());
                      }}
                      className="p-1.5 border border-slate-200/60 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-extrabold text-slate-800">points / 1 000 FCFA</span>
                  </div>
                </div>

                {/* Points monetary value input card */}
                <div className="p-4 bg-white border border-slate-200/60 rounded-2xl space-y-3 shadow-sm border-slate-100/50">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">Valeur Monétaire</span>
                    <span className="px-2 py-0.5 text-[8px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded">Rachat</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-normal">
                    Valeur en <strong className="text-slate-900 font-extrabold">FCFA</strong> de chaque point de fidélité lors d'un rachat ou réduction de service.
                  </p>
                  <div className="flex items-center space-x-3.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.max(1, parseInt(valueInput) - 1);
                        setValueInput(next.toString());
                      }}
                      className="p-1.5 border border-slate-200/60 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer flex items-center justify-center"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={valueInput}
                      onChange={e => setValueInput(e.target.value)}
                      className="w-16 text-center border border-slate-200/60 rounded-xl py-1 text-xs font-black"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = parseInt(valueInput) + 1;
                        setValueInput(next.toString());
                      }}
                      className="p-1.5 border border-slate-200/60 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-extrabold text-slate-800">FCFA / point</span>
                  </div>
                </div>
              </div>

              {showLoyaltyFeedback && (
                <div className="p-2.5 bg-emerald-100 border-2 border-emerald-400 text-emerald-950 font-black uppercase text-[10px] tracking-wider rounded-xl text-center">
                  ✅ Paramètres fidélité sauvegardés avec succès !
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const r = parseInt(rateInput);
                    const v = parseInt(valueInput);
                    if (!isNaN(r) && r > 0) setLoyaltyPointsRate(r);
                    if (!isNaN(v) && v > 0) setLoyaltyPointValue(v);
                    setShowLoyaltyFeedback(true);
                    setTimeout(() => setShowLoyaltyFeedback(false), 3000);
                  }}
                  className="py-2 px-6 bg-brand-700 hover:bg-brand-800 text-white font-black border border-slate-200/60 rounded-xl text-xs uppercase tracking-wider shadow-sm cursor-pointer"
                >
                  Sauvegarder les Tarifs de Fidélité
                </button>
              </div>
            </div>

            {/* CORPORATE WIRE TRANSFERS (VIREMENTS DIRECTEURS) */}
            <div className="bento-card border border-slate-200/80 bg-indigo-50/30 rounded-[24px] space-y-5">
              <div className="border-b-2 border-slate-900 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center space-x-2.5">
                  <span className="p-2 bg-indigo-600 border border-slate-200/50 rounded-xl text-white shadow-sm">
                    <CreditCard className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">Virements d'Entreprise (Directeurs & Dirigeants)</h4>
                    <p className="text-[10px] text-slate-500 font-bold">Distribuez les fonds de trésorerie interne de STUD'S vers les portefeuilles mobiles MTN MoMo ou Orange Money des 8 directeurs (Sans transit intermédiaire).</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Admin current balance indicator */}
                  <div className="px-3 py-1.5 bg-white border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-900 shadow-sm border-slate-100/50 shrink-0">
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-black block">Votre Trésorerie d'Admin</span>
                    <span className="font-mono font-black text-slate-900">{currentUser ? currentUser.balance.toLocaleString() : '0'} FCFA</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTransferRecipientId('');
                      setTransferAmount('');
                      setTransferError('');
                      setTransferSuccess(false);
                      setIsTransferModalOpen(true);
                    }}
                    className="py-2 px-3.5 bg-brand-700 hover:bg-brand-800 text-white font-black border border-slate-200/60 rounded-xl text-xs uppercase tracking-wider shadow-sm cursor-pointer hover:translate-y-[-1px] active:translate-y-[1px] transition-all flex items-center space-x-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Initier un Virement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawAmount('');
                      setWithdrawError('');
                      setWithdrawSuccess(false);
                      setIsWithdrawModalOpen(true);
                    }}
                    className="py-2 px-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black border border-slate-200/60 rounded-xl text-xs uppercase tracking-wider shadow-sm border-slate-100/50 cursor-pointer hover:translate-y-[-1px] active:translate-y-[1px] transition-all flex items-center space-x-1 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Faire un Retrait Exclusif</span>
                  </button>
                </div>
              </div>

              {/* Company Directors/Supervisors List Grid */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
                  <h5 className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Membres du Comité de Direction & Cadres (8 Personnes)</h5>
                  <span className="text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                    ⚡ Mode Direct Mobile Money Actif
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  {users.filter(u => u.role === 'supervisor' || u.role === 'admin').map(member => {
                    const wallet = getDirectorWalletInfo(member.phone);
                    // Map roles properly for display
                    let displayRole = 'Directeur';
                    if (member.id === 'usr-admin') displayRole = 'Directeur Général';
                    else if (member.id === 'usr-supervisor') displayRole = 'Directrice de la Supervision';
                    else if (member.id === 'usr-dir-tech') displayRole = 'Directeur Technique (CTO)';
                    else if (member.id === 'usr-dir-daf') displayRole = 'Directrice Financière (DAF)';
                    else if (member.id === 'usr-dir-ops') displayRole = 'Directeur des Opérations (COO)';
                    else if (member.id === 'usr-dir-pr') displayRole = 'Directrice des Relations Publiques';
                    else if (member.id === 'usr-dir-log') displayRole = 'Directeur de la Logistique';
                    else if (member.id === 'usr-dir-innov') displayRole = 'Directrice de l\'Innovation';

                    return (
                      <div key={member.id} className="bg-white border border-slate-200/60 rounded-2xl p-3.5 shadow-md flex flex-col justify-between gap-3 relative overflow-hidden group hover:shadow-lg transition-all">
                        <div className="flex items-start space-x-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl border border-slate-200/60 bg-slate-100 flex items-center justify-center font-black text-[10px] uppercase overflow-hidden shrink-0 shadow-sm">
                            {member.avatar ? (
                              <img src={member.avatar} alt="Photo" className="w-full h-full object-cover" />
                            ) : (
                              <span>{member.firstName.slice(0, 1)}{member.lastName.slice(0, 1)}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h6 className="font-extrabold text-[12px] text-slate-900 truncate leading-tight">{member.firstName} {member.lastName}</h6>
                            <span className="text-[8px] font-black text-slate-400 uppercase block mt-0.5">{displayRole}</span>
                          </div>
                        </div>

                        {/* Direct Mobile Money Wallet badge */}
                        <div className={`mt-1 border-2 p-2 rounded-xl flex flex-col gap-1 ${wallet.badgeColor}`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[7px] font-black uppercase tracking-wider opacity-75">Portefeuille Mobile</span>
                            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-white border border-slate-200/50 rounded-md shadow-sm flex items-center gap-1 shrink-0 font-mono">
                              {wallet.provider === 'Orange Money' ? '🍊 Orange' : '🟡 MTN'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold font-mono tracking-tight text-slate-950">{member.phone}</span>
                            <span className="flex items-center space-x-1 shrink-0">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full absolute" />
                              <span className="text-[7px] font-black uppercase tracking-wider text-emerald-800">Actif</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transactions History Table */}
              <div className="space-y-2 pt-1">
                <h5 className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Historique des Virements Directs MoMo & Orange Money</h5>
                <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm border-slate-100/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-brand-700 text-white font-sans text-[9px] uppercase tracking-wider border-b-2 border-slate-900">
                          <th className="p-3">Date / Heure</th>
                          <th className="p-3">Directeur Destinataire</th>
                          <th className="p-3">Portefeuille Mobile</th>
                          <th className="p-3">Référence Opérateur</th>
                          <th className="p-3">Motif de Distribution</th>
                          <th className="p-3 text-right">Montant</th>
                          <th className="p-3 text-center">Statut</th>
                          <th className="p-3 text-center">Reçu (PDF)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-slate-100 font-sans text-xs">
                        {internalTransfers.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-4 text-center text-slate-400 font-bold italic">
                              Aucun virement d'entreprise émis pour le moment.
                            </td>
                          </tr>
                        ) : (
                          internalTransfers.map(tx => {
                            const isOrange = tx.operator === 'Orange Money';
                            return (
                              <tr key={tx.id} className="hover:bg-slate-50">
                                <td className="p-3 font-mono text-[10px] text-slate-500 font-semibold">
                                  {new Date(tx.date).toLocaleString('fr-FR')}
                                </td>
                                <td className="p-3">
                                  <div className="font-extrabold text-slate-900">{tx.recipientName}</div>
                                  <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{tx.recipientRole}</div>
                                </td>
                                <td className="p-3">
                                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase ${
                                    isOrange ? 'bg-orange-50 border-orange-300 text-orange-900' : 'bg-amber-50 border-amber-300 text-amber-900'
                                  }`}>
                                    <span>{isOrange ? '🍊 Orange Money' : '🟡 MTN MoMo'}</span>
                                  </span>
                                  <div className="text-[10px] font-mono font-bold text-slate-600 mt-0.5">{tx.recipientPhone || '+237'}</div>
                                </td>
                                <td className="p-3 font-mono text-[10px] font-black text-indigo-600">
                                  {tx.reference || 'STU-TX-PENDING'}
                                </td>
                                <td className="p-3 text-slate-600 font-medium">
                                  {tx.motif}
                                </td>
                                <td className="p-3 text-right font-mono font-black text-slate-900">
                                  {tx.amount.toLocaleString()} FCFA
                                </td>
                                <td className="p-3 text-center">
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-950 border-2 border-emerald-900 text-[8px] font-black uppercase rounded-lg">
                                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                    <span>Direct & Reçu</span>
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => generateReceiptPDF(tx)}
                                    className="inline-flex items-center space-x-1 px-2 py-1 bg-indigo-50 border border-indigo-900 text-indigo-950 text-[9px] font-black uppercase rounded-lg hover:bg-indigo-100 active:translate-y-0.5 cursor-pointer shadow-sm hover:shadow-none transition-all duration-150"
                                    title="Télécharger le reçu PDF"
                                  >
                                    <FileText className="w-3 h-3 text-indigo-900" />
                                    <span>PDF</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BALANCE ADJUST MODAL */}
      <AnimatePresence>
        {adjustingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm" onClick={() => setAdjustingUser(null)} />

            {/* Content card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl shadow-slate-200/60 p-6 border border-slate-200/60 space-y-4 font-sans"
            >
              <div className="text-center">
                <h3 className="font-black text-base text-slate-900 uppercase tracking-tight">Ajustement du Solde</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Modifier manuellement le solde de : <br />
                  <strong className="text-slate-900 font-extrabold">{adjustingUser.firstName} {adjustingUser.lastName}</strong>
                </p>
              </div>

              <form onSubmit={handleBalanceAdjust} className="space-y-4">
                {/* Adjust Type */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Opération administrative</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustType('credit')}
                      className={`p-2 border-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                        adjustType === 'credit'
                          ? 'bg-emerald-100 border-emerald-900 text-emerald-950 font-black'
                          : 'bg-white border-slate-300 text-slate-500'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-xs">Créditer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdjustType('debit')}
                      className={`p-2 border-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                        adjustType === 'debit'
                          ? 'bg-rose-100 border-rose-900 text-rose-950 font-black'
                          : 'bg-white border-slate-300 text-slate-500'
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                      <span className="text-xs">Débiter</span>
                    </button>
                  </div>
                </div>

                {/* Amount field */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Montant (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={adjustAmount}
                    onChange={e => setAdjustAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs text-slate-850 font-mono font-black focus:outline-none"
                  />
                </div>

                {/* Buttons footer */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdjustingUser(null)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/60 font-extrabold rounded-xl text-xs transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-brand-700 hover:bg-brand-800 text-white font-black rounded-xl text-xs transition-all shadow-sm"
                  >
                    Confirmer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW MISSION MODAL */}
      <AnimatePresence>
        {isNewMissionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm" onClick={() => setIsNewMissionModalOpen(false)} />

            {/* Content card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl shadow-slate-200/60 p-6 border border-slate-200/60 space-y-4 font-sans my-8 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-emerald-500 border border-slate-200/50 rounded-xl text-slate-950">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <h3 className="font-black text-sm uppercase text-slate-900 tracking-tight">Nouvelle Mission Administrative</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewMissionModalOpen(false)}
                  className="p-1 hover:bg-slate-100 border border-transparent hover:border-slate-300 rounded-lg text-slate-500 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleNewMissionSubmit} className="space-y-4">
                {/* 1. Client selection section */}
                <div className="space-y-2 border-b pb-4">
                  <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">1. Informations Client</h4>
                  
                  {/* Client Type Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewMissionClientType('enrolled')}
                      className={`p-2 border-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer text-xs ${
                        newMissionClientType === 'enrolled'
                          ? 'bg-brand-700 border-slate-900 text-white font-black'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Client Inscrit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMissionClientType('guest')}
                      className={`p-2 border-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer text-xs ${
                        newMissionClientType === 'guest'
                          ? 'bg-brand-700 border-slate-900 text-white font-black'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Client Invité / Nouveau</span>
                    </button>
                  </div>

                  {newMissionClientType === 'enrolled' ? (
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Sélectionner le client</label>
                      <select
                        value={newMissionClientId}
                        onChange={e => setNewMissionClientId(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                      >
                        <option value="">-- Choisir un client dans l'annuaire --</option>
                        {users.filter(u => u.role === 'client').map(client => (
                          <option key={client.id} value={client.id}>
                            {client.firstName} {client.lastName} ({client.phone})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Nom du Client</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Jean Dupont"
                          value={newMissionCustomClientName}
                          onChange={e => setNewMissionCustomClientName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Numéro de Téléphone</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: +237 6..."
                          value={newMissionCustomClientPhone}
                          onChange={e => setNewMissionCustomClientPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-mono font-semibold focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Service selection section */}
                <div className="space-y-2 border-b pb-4">
                  <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">2. Détails de la Prestation</h4>
                  
                  {/* Service Type Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewMissionServiceType('predefined');
                        setNewMissionPredefinedServiceId('');
                        setNewMissionTitle('');
                        setNewMissionPrice('');
                      }}
                      className={`p-2 border-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer text-xs ${
                        newMissionServiceType === 'predefined'
                          ? 'bg-brand-700 border-slate-900 text-white font-black'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>Catalogue de Services</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewMissionServiceType('custom');
                        setNewMissionPredefinedServiceId('');
                        setNewMissionTitle('');
                        setNewMissionPrice('');
                      }}
                      className={`p-2 border-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer text-xs ${
                        newMissionServiceType === 'custom'
                          ? 'bg-brand-700 border-slate-900 text-white font-black'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>Service Personnalisé</span>
                    </button>
                  </div>

                  {newMissionServiceType === 'predefined' ? (
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Sélectionner un service prédéfini</label>
                      <select
                        value={newMissionPredefinedServiceId}
                        onChange={e => handlePredefinedServiceChange(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                      >
                        <option value="">-- Choisir un service au catalogue --</option>
                        {services.map(srv => (
                          <option key={srv.id} value={srv.id}>
                            {srv.title} ({srv.price.toLocaleString()} FCFA)
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Titre du service personnalisable</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Entretien climatisation d'urgence"
                          value={newMissionTitle}
                          onChange={e => setNewMissionTitle(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Catégorie</label>
                          <select
                            value={newMissionCategory}
                            onChange={e => setNewMissionCategory(e.target.value as ServiceCategory)}
                            required
                            className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                          >
                            <option value="domestic">Domestique</option>
                            <option value="logistics">Logistique</option>
                            <option value="education">Éducation</option>
                            <option value="immobilier">Immobilier</option>
                            <option value="custom">Personnalisé / Autre</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Tarif (FCFA)</label>
                          <input
                            type="number"
                            required
                            placeholder="Ex: 15000"
                            value={newMissionPrice}
                            onChange={e => setNewMissionPrice(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-mono font-semibold focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {newMissionServiceType === 'predefined' && newMissionTitle && (
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[8px] text-slate-400 uppercase font-black block">Titre du service</span>
                        <span className="font-extrabold text-slate-900">{newMissionTitle}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 uppercase font-black block">Tarif Automatique</span>
                        <span className="font-mono font-black text-slate-900">{parseInt(newMissionPrice || '0').toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Planning & Address & Comments section */}
                <div className="space-y-2 border-b pb-4">
                  <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">3. Logistique & Planification</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Date d'exécution</label>
                      <input
                        type="date"
                        required
                        value={newMissionScheduledDate}
                        onChange={e => setNewMissionScheduledDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Heure</label>
                      <input
                        type="time"
                        required
                        value={newMissionScheduledTime}
                        onChange={e => setNewMissionScheduledTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Adresse complète du Lieu</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Quartier Essos, Yaoundé"
                      value={newMissionAddress}
                      onChange={e => setNewMissionAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Notes / Instructions spéciales (Optionnel)</label>
                    <textarea
                      placeholder="Indiquez ici les détails d'accès ou consignes particulières..."
                      value={newMissionComments}
                      onChange={e => setNewMissionComments(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Méthode de Paiement Prévue</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['cash', 'momo', 'card'] as const).map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setNewMissionPaymentMethod(method)}
                          className={`p-2 border-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer text-xs uppercase font-mono ${
                            newMissionPaymentMethod === method
                              ? 'bg-brand-700 border-slate-900 text-white font-black'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{method === 'cash' ? '💵 Cash' : method === 'momo' ? '📱 MoMo' : '💳 Carte'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Instant student provider assignment (optional) */}
                <div className="space-y-2 pb-2">
                  <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">4. Assignation Immédiate (Optionnel)</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Sélectionner un étudiant disponible</label>
                    <select
                      value={newMissionAssignedProviderId}
                      onChange={e => setNewMissionAssignedProviderId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                    >
                      <option value="">-- Laisser non-assigné (En attente d'attribution) --</option>
                      {availableStudents.map(student => (
                        <option key={student.id} value={student.id}>
                          🎓 {student.firstName} {student.lastName} ({student.phone})
                        </option>
                      ))}
                    </select>
                    <p className="text-[9px] text-slate-400 italic">Si vous choisissez un étudiant, le statut passera immédiatement à "Assigné". Sinon, il sera proposé aux étudiants en mode "Manuel" ou "Automatique".</p>
                  </div>
                </div>

                {/* Buttons footer */}
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsNewMissionModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/60 font-extrabold rounded-xl text-xs transition-all cursor-pointer text-center"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-black rounded-xl text-xs transition-all shadow-sm cursor-pointer text-center"
                  >
                    Lancer la Mission
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CORPORATE WIRE TRANSFER MODAL */}
      <AnimatePresence>
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm animate-fade-in" onClick={() => !isTransferSending && setIsTransferModalOpen(false)} />

            {/* Content card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-xl shadow-slate-200/60 p-6 border border-slate-200/80 space-y-4 font-sans z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-900">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-indigo-500 border border-slate-200/60 rounded-xl text-white">
                    <CreditCard className="w-5 h-5" />
                  </span>
                  <h3 className="font-black text-sm uppercase text-slate-900 tracking-tight">Dispachement Direct Mobile Money</h3>
                </div>
                {!isTransferSending && (
                  <button
                    type="button"
                    onClick={() => setIsTransferModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold text-lg"
                  >
                    ✕
                  </button>
                )}
              </div>

              {isTransferSending ? (
                /* LIVE SENDING PROGRESS SCREEN (MULTIPORTAL GATEWAY) */
                <div className="py-8 text-center space-y-5">
                  <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                    <Smartphone className="w-6 h-6 text-indigo-600 animate-bounce" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-black text-xs uppercase text-slate-900 tracking-wider">Transaction Mobile Money en cours...</h4>
                    
                    {/* Step Messages */}
                    <div className="px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl inline-block max-w-[340px] mx-auto text-[11px] font-bold text-slate-700">
                      {transferStep === 1 && (
                        <div className="flex items-center justify-center space-x-2">
                          <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                          <span>Connexion sécurisée aux passerelles MTN/Orange...</span>
                        </div>
                      )}
                      {transferStep === 2 && (
                        <div className="flex items-center justify-center space-x-2">
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                          <span>Authentification Trésorerie d'Entreprise STUD'S...</span>
                        </div>
                      )}
                      {transferStep === 3 && (
                        <div className="flex items-center justify-center space-x-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                          <span>Interrogation & Validation du numéro destinataire...</span>
                        </div>
                      )}
                      {transferStep === 4 && (
                        <div className="flex items-center justify-center space-x-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                          <span>Débit Trésorerie & Envoi direct des fonds FCFA...</span>
                        </div>
                      )}
                    </div>

                    {/* Progress dots */}
                    <div className="flex items-center justify-center space-x-1.5 pt-1">
                      {[1, 2, 3, 4].map(s => (
                        <div
                          key={s}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            transferStep >= s ? 'bg-indigo-600 scale-125' : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : transferSuccess ? (
                /* SUCCESS SCREEN */
                <div className="py-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-emerald-100 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-6 h-6 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-sm uppercase text-emerald-900">Virement Direct Réussi ! 🎉</h4>
                    <p className="text-[11px] text-slate-500 leading-normal max-w-[320px] mx-auto font-medium">
                      Les fonds ont été injectés instantanément vers le portefeuille mobile du directeur. 
                    </p>
                    <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-2.5 max-w-[320px] mx-auto text-[10px] text-emerald-950 font-semibold space-y-1">
                      <p>🏦 Solde d'Admin débité avec succès.</p>
                      <p className="font-black text-slate-900">⚠️ Aucun transit intermédiaire : l'argent est disponible directement sur sa carte SIM Orange / MTN !</p>
                    </div>
                    {lastTransferDetails && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => generateReceiptPDF(lastTransferDetails)}
                          className="w-full inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase rounded-xl cursor-pointer shadow-sm border-slate-100/50 hover:shadow-none active:translate-y-0.5 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Télécharger le Reçu PDF</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* FORM SCREEN */
                <form onSubmit={handleTransferSubmit} className="space-y-4 text-left">
                  {/* Treasury Status banner */}
                  <div className="bg-indigo-50 border-2 border-indigo-500 rounded-2xl p-4 text-slate-800 text-xs">
                    <p className="font-bold text-indigo-950 uppercase tracking-wide text-[10px] mb-1">Votre trésorerie disponible :</p>
                    <p className="text-xl font-black text-indigo-900 font-mono">{currentUser ? (currentUser.balance || 0).toLocaleString() : '0'} FCFA</p>
                    <p className="text-[9px] text-indigo-700 font-extrabold italic mt-1.5 flex items-center gap-1">
                      <span>💡</span>
                      <span>L'argent sera débité d'ici et envoyé directement sur le téléphone du destinataire.</span>
                    </p>
                  </div>

                  {transferError && (
                    <div className="bg-rose-50 border-2 border-rose-500 text-rose-950 px-3 py-2.5 rounded-xl text-xs font-semibold">
                      ⚠️ {transferError}
                    </div>
                  )}

                  {/* Destinataire selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Directeur Destinataire</label>
                    <select
                      required
                      value={transferRecipientId}
                      onChange={e => setTransferRecipientId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                    >
                      <option value="">-- Choisir un directeur destinataire --</option>
                      {users.filter(u => u.role === 'supervisor' || u.role === 'admin').map(member => {
                        const wallet = getDirectorWalletInfo(member.phone);
                        let displayRole = 'Directeur';
                        if (member.id === 'usr-admin') displayRole = 'Directeur Général';
                        else if (member.id === 'usr-supervisor') displayRole = 'Directrice Supervision';
                        else if (member.id === 'usr-dir-tech') displayRole = 'Directeur Technique (CTO)';
                        else if (member.id === 'usr-dir-daf') displayRole = 'Directrice Financière (DAF)';
                        else if (member.id === 'usr-dir-ops') displayRole = 'Directeur des Opérations (COO)';
                        else if (member.id === 'usr-dir-pr') displayRole = 'Directrice Relations Publiques';
                        else if (member.id === 'usr-dir-log') displayRole = 'Directeur Logistique';
                        else if (member.id === 'usr-dir-innov') displayRole = 'Directrice Innovation';

                        return (
                          <option key={member.id} value={member.id}>
                            {member.firstName} {member.lastName} ({displayRole}) ➔ {wallet.logoText} ({member.phone})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Motif selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Motif du Virement</label>
                    <select
                      required
                      value={transferMotif}
                      onChange={e => setTransferMotif(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Frais de Mission 💼">Frais de Mission 💼</option>
                      <option value="Rémunération Mensuelle 💵">Rémunération Mensuelle 💵</option>
                      <option value="Frais de Transport / Déplacement 🚗">Frais de Transport / Déplacement 🚗</option>
                      <option value="Budget Logistique de Terrain 📦">Budget Logistique de Terrain 📦</option>
                      <option value="Prime Exceptionnelle de Performance 🌟">Prime Exceptionnelle de Performance 🌟</option>
                      <option value="Autre 📝">Autre 📝</option>
                    </select>
                  </div>

                  {/* Custom Motif text input if "Autre" is selected */}
                  {transferMotif === 'Autre 📝' && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Saisir le Motif Personnalisé</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Remboursement frais de repas d'affaires"
                        value={transferCustomMotif}
                        onChange={e => setTransferCustomMotif(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Amount field */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Montant du Virement (FCFA)</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        placeholder="Min 500"
                        value={transferAmount}
                        onChange={e => setTransferAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 pr-12 text-xs font-mono font-semibold focus:outline-none"
                      />
                      <span className="absolute right-3.5 top-3 text-[10px] font-black text-slate-400 font-mono uppercase">FCFA</span>
                    </div>
                  </div>

                  {/* Warning banner regarding non-transiting */}
                  <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-3 text-amber-950 text-[10px] font-bold">
                    ⚠️ <span className="uppercase font-black text-amber-900">Important :</span> En cliquant sur confirmer, l'argent sera débité de la trésorerie et envoyé directement sur le portefeuille MTN MoMo ou Orange Money du destinataire. <span className="underline">Aucun transit par un solde de compte applicatif interne.</span>
                  </div>

                  {/* Footer buttons */}
                  <div className="flex space-x-3 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setIsTransferModalOpen(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/60 font-extrabold rounded-xl text-xs transition-all cursor-pointer text-center"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black border border-slate-200/60 rounded-xl text-xs transition-all shadow-sm cursor-pointer text-center"
                    >
                      Confirmer le Virement
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CORPORATE TREASURY WITHDRAWAL MODAL */}
      <AnimatePresence>
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm animate-fade-in" onClick={() => !isWithdrawSending && setIsWithdrawModalOpen(false)} />

            {/* Content card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-xl shadow-slate-200/60 p-6 border border-slate-200/80 space-y-4 font-sans z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-900">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-amber-500 border border-slate-200/60 rounded-xl text-slate-950">
                    <Download className="w-5 h-5" />
                  </span>
                  <h3 className="font-black text-sm uppercase text-slate-900 tracking-tight">Retrait Exclusif de Trésorerie</h3>
                </div>
                {!isWithdrawSending && (
                  <button
                    type="button"
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold text-lg"
                  >
                    ✕
                  </button>
                )}
              </div>

              {isWithdrawSending ? (
                /* LIVE SENDING PROGRESS SCREEN (MULTIPORTAL GATEWAY) */
                <div className="py-8 text-center space-y-5">
                  <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                    <Smartphone className="w-6 h-6 text-amber-500 animate-bounce" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-black text-xs uppercase text-slate-900 tracking-wider">Traitement du Retrait de Trésorerie...</h4>
                    
                    {/* Step Messages */}
                    <div className="px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl inline-block max-w-[340px] mx-auto text-[11px] font-bold text-slate-700">
                      {withdrawStep === 1 && (
                        <div className="flex items-center justify-center space-x-2">
                          <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                          <span>Initialisation du canal de retrait sécurisé...</span>
                        </div>
                      )}
                      {withdrawStep === 2 && (
                        <div className="flex items-center justify-center space-x-2">
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                          <span>Validation de la signature de l'administrateur principal...</span>
                        </div>
                      )}
                      {withdrawStep === 3 && (
                        <div className="flex items-center justify-center space-x-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                          <span>Vérification de la SIM d'entreprise destinataire...</span>
                        </div>
                      )}
                      {withdrawStep === 4 && (
                        <div className="flex items-center justify-center space-x-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                          <span>Crédit de la SIM & Écriture comptable de retrait...</span>
                        </div>
                      )}
                    </div>

                    {/* Progress dots */}
                    <div className="flex items-center justify-center space-x-1.5 pt-1">
                      {[1, 2, 3, 4].map(s => (
                        <div
                          key={s}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            withdrawStep >= s ? 'bg-amber-500 scale-125' : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : withdrawSuccess ? (
                /* SUCCESS SCREEN */
                <div className="py-6 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-emerald-100 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-6 h-6 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-sm uppercase text-emerald-900">Retrait Effectué ! 🎉</h4>
                    <p className="text-[11px] text-slate-500 leading-normal max-w-[320px] mx-auto font-medium">
                      Les fonds ont été retirés avec succès de la trésorerie centrale et déposés sur votre SIM de destination.
                    </p>
                    <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-2.5 max-w-[320px] mx-auto text-[10px] text-emerald-950 font-semibold space-y-1">
                      <p>🏦 Solde débité de la trésorerie.</p>
                      <p className="font-black text-slate-900">
                        📱 Reçu sur : {withdrawProvider === 'MTN MoMo' ? 'MTN (671711046)' : 'Orange (696356036)'}
                      </p>
                    </div>
                    {lastWithdrawDetails && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => generateReceiptPDF(lastWithdrawDetails)}
                          className="w-full inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase rounded-xl cursor-pointer shadow-sm border-slate-100/50 hover:shadow-none active:translate-y-0.5 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Télécharger le Reçu PDF</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* FORM SCREEN */
                <form onSubmit={handleWithdrawalSubmit} className="space-y-4 text-left">
                  {/* Treasury Status banner */}
                  <div className="bg-amber-50 border-2 border-amber-500 rounded-2xl p-4 text-slate-800 text-xs">
                    <p className="font-bold text-amber-950 uppercase tracking-wide text-[10px] mb-1">Votre trésorerie disponible :</p>
                    <p className="text-xl font-black text-amber-900 font-mono">{currentUser ? (currentUser.balance || 0).toLocaleString() : '0'} FCFA</p>
                    <p className="text-[9px] text-amber-700 font-extrabold italic mt-1.5 flex items-center gap-1">
                      <span>💡</span>
                      <span>Les retraits d'administration centrale sont exclusifs aux comptes officiels de l'entreprise.</span>
                    </p>
                  </div>

                  {withdrawError && (
                    <div className="bg-rose-50 border-2 border-rose-500 text-rose-950 px-3 py-2.5 rounded-xl text-xs font-semibold">
                      ⚠️ {withdrawError}
                    </div>
                  )}

                  {/* Account Selector (EXCLUSIVE) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Compte de Destination Exclusif</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setWithdrawProvider('MTN MoMo')}
                        className={`p-3 border-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer text-xs ${
                          withdrawProvider === 'MTN MoMo'
                            ? 'bg-amber-100 border-amber-500 text-slate-900 font-black shadow-sm border-slate-100/50'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-extrabold text-amber-600">MTN MoMo Officiel</span>
                        <span className="text-[10px] font-mono font-black text-slate-950 mt-1">671 71 10 46</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setWithdrawProvider('Orange Money')}
                        className={`p-3 border-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer text-xs ${
                          withdrawProvider === 'Orange Money'
                            ? 'bg-orange-100 border-orange-500 text-slate-900 font-black shadow-sm border-slate-100/50'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-extrabold text-orange-600">Orange Officiel</span>
                        <span className="text-[10px] font-mono font-black text-slate-950 mt-1">696 35 60 36</span>
                      </button>
                    </div>
                  </div>

                  {/* Motif selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Motif du Retrait</label>
                    <select
                      required
                      value={withdrawMotif}
                      onChange={e => setWithdrawMotif(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Approvisionnement Caisse Physique Ebolowa I 🏢">Approvisionnement Caisse Physique Ebolowa I 🏢</option>
                      <option value="Remboursement Avance Trésorerie 💵">Remboursement Avance Trésorerie 💵</option>
                      <option value="Paiement de Prestataires en Espèces 👥">Paiement de Prestataires en Espèces 👥</option>
                      <option value="Achat de Matériel Éco-Responsable / Outils 🌿">Achat de Matériel Éco-Responsable / Outils 🌿</option>
                      <option value="Autre 📝">Autre 📝</option>
                    </select>
                  </div>

                  {/* Custom Motif text input if "Autre" is selected */}
                  {withdrawMotif === 'Autre 📝' && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Saisir le Motif Personnalisé</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Frais logistiques imprévus"
                        value={withdrawCustomMotif}
                        onChange={e => setWithdrawCustomMotif(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Amount field */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Montant du Retrait (FCFA)</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        placeholder="Min 500"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 pr-12 text-xs font-mono font-semibold focus:outline-none"
                      />
                      <span className="absolute right-3.5 top-3 text-[10px] font-black text-slate-400 font-mono uppercase">FCFA</span>
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
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 border border-slate-200/60 font-black rounded-xl text-xs transition-all shadow-sm cursor-pointer text-center"
                    >
                      Confirmer le Retrait
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activeTab === 'apis' && (
        <MomoApiDashboard />
      )}

      {activeTab === 'chat' && (
        <motion.div
          key="chat"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <ChatComponent />
        </motion.div>
      )}
        </>
      )}

      {/* NEW DIRECTOR REGISTRATION MODAL */}
      <AnimatePresence>
        {showDirectorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm animate-fade-in" 
              onClick={() => !isRegisteringDir && setShowDirectorModal(false)} 
            />

            {/* Content card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-xl shadow-slate-200/60 p-6 border border-slate-200/80 space-y-4 font-sans z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-3 border-slate-900">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-amber-500 border border-slate-200/60 rounded-xl text-white">
                    <UserPlus className="w-5 h-5 text-slate-950" />
                  </span>
                  <h3 className="font-black text-sm uppercase text-slate-900 tracking-tight">Inscrire un Nouveau Directeur</h3>
                </div>
                {!isRegisteringDir && (
                  <button
                    type="button"
                    onClick={() => setShowDirectorModal(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold text-lg"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Form body */}
              <form onSubmit={handleRegisterDirectorSubmit} className="space-y-3 text-left">
                {/* First and Last names */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-700 block">Prénom</label>
                    <input
                      type="text"
                      required
                      placeholder="Jean"
                      value={dirFirstName}
                      onChange={e => setDirFirstName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2 text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-700 block">Nom de Famille</label>
                    <input
                      type="text"
                      required
                      placeholder="Mvondo"
                      value={dirLastName}
                      onChange={e => setDirLastName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2 text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Mobile wallet phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-700 block">Portefeuille Électronique (Téléphone)</label>
                  <input
                    type="tel"
                    required
                    placeholder="67XXXXXXX ou 69XXXXXXX"
                    value={dirPhone}
                    onChange={e => setDirPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2 text-xs font-mono font-black focus:outline-none"
                  />
                  <span className="text-[8.5px] text-slate-500 font-medium">Doit correspondre à une puce Orange Money ou MTN MoMo pour les virements de fonds.</span>
                </div>

                {/* Email address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-700 block">Adresse Email</label>
                  <input
                    type="email"
                    required
                    placeholder="jean.mvondo@studs-ebolowa.com"
                    value={dirEmail}
                    onChange={e => setDirEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2 text-xs focus:outline-none"
                  />
                </div>

                {/* Director Grade */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-700 block">Poste de Responsabilité / Grade (Saisie Libre ✍️)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Directeur Technique, Assistant Logistique..."
                    value={dirGrade}
                    onChange={e => setDirGrade(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <div className="flex flex-wrap gap-1 mt-1 pb-1">
                    {[
                      "Directeur Technique 🛠️",
                      "Directeur d’Exploitation 🚜",
                      "Directeur de l'Hygiène Publique 🍃",
                      "Directeur Administratif & Financier 📊",
                      "Directeur des Ressources Humaines 👥",
                      "Directeur Général de Zone (Ebolowa) 👔"
                    ].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDirGrade(preset)}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[8.5px] font-bold text-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allowed Tabs / Specific Functions Checkboxes */}
                <div className="space-y-1.5 border-t border-dashed border-slate-200 pt-3">
                  <label className="text-[10px] font-black uppercase text-slate-700 block">Zones de Responsabilité Associées (Droits d'Accès)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'kpis', label: '📈 Indicateurs (KPIs)' },
                      { id: 'orders', label: '💼 Missions & Commandes' },
                      { id: 'members', label: '👥 Membres & NFC' },
                      { id: 'ratings', label: '⭐ Avis & Notations' },
                      { id: 'financials', label: '📊 Comptabilité' },
                      { id: 'apis', label: '🔌 Passerelles APIs' }
                    ].map(item => (
                      <label key={item.id} className="flex items-center space-x-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors select-none">
                        <input
                          type="checkbox"
                          checked={dirAllowedTabs.includes(item.id)}
                          onChange={() => {
                            if (dirAllowedTabs.includes(item.id)) {
                              setDirAllowedTabs(prev => prev.filter(t => t !== item.id));
                            } else {
                              setDirAllowedTabs(prev => [...prev, item.id]);
                            }
                          }}
                          className="rounded text-amber-500 focus:ring-amber-500 h-3.5 w-3.5"
                        />
                        <span className="text-[10px] font-bold text-slate-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preset & Gallery Avatar Selection */}
                <div className="space-y-2 border-t border-dashed border-slate-200 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-slate-700 block">Photo de Profil de l'Assistant</label>
                    <label 
                      htmlFor="dir-avatar-upload"
                      className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-slate-900 border border-slate-200/60 rounded-lg text-[9px] font-black uppercase cursor-pointer transition-colors flex items-center space-x-1"
                    >
                      <span>Importer de la galerie 📱</span>
                      <input 
                        id="dir-avatar-upload"
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setDirAvatar(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex items-center space-x-3 justify-center py-2 bg-slate-50 border-2 border-slate-200 rounded-xl px-2">
                    <div className="flex-shrink-0 flex flex-col items-center border-r-2 border-slate-200 pr-3 mr-1">
                      <img src={dirAvatar} className="w-11 h-11 rounded-full object-cover border-2 border-slate-950" alt="Preview" />
                      <span className="text-[8px] font-black uppercase text-slate-500 mt-1">Aperçu</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {[
                        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
                        'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=150',
                        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150',
                        'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=150'
                      ].map((imgUrl, idx) => (
                        <button
                          key={imgUrl}
                          type="button"
                          onClick={() => setDirAvatar(imgUrl)}
                          className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all hover:scale-110 cursor-pointer ${
                            dirAvatar === imgUrl ? 'border-amber-500 scale-105 shadow' : 'border-slate-300'
                          }`}
                        >
                          <img src={imgUrl} className="w-full h-full object-cover" alt={`Preset ${idx + 1}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-3 pt-3 border-t">
                  <button
                    type="button"
                    disabled={isRegisteringDir}
                    onClick={() => setShowDirectorModal(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/60 font-extrabold rounded-xl text-xs transition-all cursor-pointer text-center"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isRegisteringDir}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black border border-slate-200/60 rounded-xl text-xs transition-all shadow-sm cursor-pointer text-center"
                  >
                    {isRegisteringDir ? "Enregistrement..." : "Inscrire 👔"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT DIRECTOR PERMISSIONS MODAL */}
      <AnimatePresence>
        {showEditModal && selectedDirForEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm animate-fade-in" 
              onClick={() => setShowEditModal(false)} 
            />

            {/* Content card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-xl shadow-slate-200/60 p-6 border border-slate-200/80 space-y-4 font-sans z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-3 border-slate-900">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-amber-500 border border-slate-200/60 rounded-xl text-white">
                    <UserPlus className="w-5 h-5 text-slate-950" />
                  </span>
                  <h3 className="font-black text-sm uppercase text-slate-900 tracking-tight">Modifier les Droits</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs text-slate-500 font-medium text-left">
                Assistant : <span className="font-bold text-slate-800">{selectedDirForEdit.firstName} {selectedDirForEdit.lastName}</span> ({selectedDirForEdit.email})
              </div>

              {/* Form body */}
              <form onSubmit={handleEditDirectorSubmit} className="space-y-4 text-left">
                {/* Director Grade */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-700 block">Poste de Responsabilité / Grade (Saisie Libre ✍️)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Directeur Technique, Assistant Logistique..."
                    value={editDirGrade}
                    onChange={e => setEditDirGrade(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <div className="flex flex-wrap gap-1 mt-1 pb-1">
                    {[
                      "Directeur Technique 🛠️",
                      "Directeur d’Exploitation 🚜",
                      "Directeur de l'Hygiène Publique 🍃",
                      "Directeur Administratif & Financier 📊",
                      "Directeur des Ressources Humaines 👥",
                      "Directeur Général de Zone (Ebolowa) 👔"
                    ].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setEditDirGrade(preset)}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[8.5px] font-bold text-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific Functions Checkboxes */}
                <div className="space-y-1.5 border-t border-dashed border-slate-200 pt-3">
                  <label className="text-[10px] font-black uppercase text-slate-700 block">Fonctions Spécifiques (Permissions)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'kpis', label: '📈 Indicateurs (KPIs)' },
                      { id: 'orders', label: '💼 Missions & Commandes' },
                      { id: 'members', label: '👥 Membres & NFC' },
                      { id: 'ratings', label: '⭐ Avis & Notations' },
                      { id: 'financials', label: '📊 Comptabilité' },
                      { id: 'apis', label: '🔌 Passerelles APIs' }
                    ].map(item => (
                      <label key={item.id} className="flex items-center space-x-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors select-none">
                        <input
                          type="checkbox"
                          checked={editDirAllowedTabs.includes(item.id)}
                          onChange={() => {
                            if (editDirAllowedTabs.includes(item.id)) {
                              setEditDirAllowedTabs(prev => prev.filter(t => t !== item.id));
                            } else {
                              setEditDirAllowedTabs(prev => [...prev, item.id]);
                            }
                          }}
                          className="rounded text-amber-500 focus:ring-amber-500 h-3.5 w-3.5"
                        />
                        <span className="text-[10px] font-bold text-slate-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/60 font-extrabold rounded-xl text-xs transition-all cursor-pointer text-center"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black border border-slate-200/60 rounded-xl text-xs transition-all shadow-sm cursor-pointer text-center"
                  >
                    Enregistrer Droits 💾
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
