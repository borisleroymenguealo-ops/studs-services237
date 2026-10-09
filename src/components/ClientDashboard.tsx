/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TabBar } from './TabBar';
import { LayoutGrid as TbGrid, ClipboardList as TbList, Gift as TbGift, User as TbUser, CirclePlay as TbPlay } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { MiniDashboardHeader } from './MiniDashboardHeader';
import { AleneWidget } from './AleneWidget';
import { PromoVideoSimulator } from './PromoVideoSimulator';
import { Service, Order, ServiceCategory } from '../types';
import { jsPDF } from 'jspdf';
import {
  Search,
  Filter,
  WashingMachine,
  Sparkles,
  Truck,
  ShoppingBag,
  GraduationCap,
  Home,
  Eye,
  PartyPopper,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  CreditCard,
  Plus,
  Star,
  Receipt,
  Download,
  CheckCircle,
  AlertTriangle,
  Compass,
  DollarSign,
  QrCode,
  Smartphone,
  Activity,
  TrendingUp,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

export interface Property {
  id: string;
  title: string;
  rent: number;
  caution: number;
  neighborhood: string;
  photoUrl: string;
  conditions: string[];
  modalities: string[];
}

export const REAL_ESTATE_PROPERTIES: Property[] = [
  {
    id: "prop-001",
    title: "Studio Moderne Mekalat",
    rent: 45000,
    caution: 135000,
    neighborhood: "Mekalat",
    photoUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=60",
    conditions: [
      "Compteur prépayé ENEO individuel",
      "Eau de forage (gratuite & permanente)",
      "Entièrement carrelé avec douche interne",
      "Gardien de nuit inclus"
    ],
    modalities: [
      "Bail de 12 mois minimum",
      "Caution de 3 mois requise à la signature",
      "Frais de visite : 2 000 FCFA",
      "État des lieux contradictoire obligatoire à l'entrée"
    ]
  },
  {
    id: "prop-002",
    title: "Chambre Étudiante Nko'ovos",
    rent: 25000,
    caution: 50000,
    neighborhood: "John Holt",
    photoUrl: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&auto=format&fit=crop&q=60",
    conditions: [
      "Sanitaires internes privatifs",
      "Espace cuisine extérieur partagé",
      "Calme absolu, idéal pour les études",
      "Proche de l'Université de Maroua / Ebolowa"
    ],
    modalities: [
      "Bail de 10 mois minimum (année académique)",
      "Caution de 2 mois remboursable",
      "Frais de visite : 1 500 FCFA",
      "Eau incluse dans le loyer"
    ]
  },
  {
    id: "prop-003",
    title: "Appartement Familial Angalé",
    rent: 85000,
    caution: 255000,
    neighborhood: "Angalé",
    photoUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=60",
    conditions: [
      "Grand salon, 2 chambres spacieuses, 2 douches",
      "Cuisine moderne avec balcon d'aération",
      "Parking voiture sécurisé",
      "Clôturé avec barrière de sécurité"
    ],
    modalities: [
      "Contrat de bail certifié par la mairie d'Ebolowa",
      "Caution de 3 mois exigée",
      "Frais de visite : 3 000 FCFA",
      "Abonnement eau de ville Camwater individuel"
    ]
  }
];

export const detectOperator = (phone: string): 'mtn' | 'orange' | null => {
  const cleanPhone = phone.replace(/[\s\-\+]/g, '');
  let localNumber = cleanPhone;
  if (cleanPhone.startsWith('237') && cleanPhone.length > 9) {
    localNumber = cleanPhone.substring(3);
  }
  
  if (localNumber.length < 3) return null;
  
  if (localNumber.startsWith('67')) {
    return 'mtn';
  }
  
  const prefix3 = localNumber.substring(0, 3);
  const prefix3Num = parseInt(prefix3);
  if (!isNaN(prefix3Num)) {
    if (prefix3Num >= 680 && prefix3Num <= 684) {
      return 'mtn';
    }
    if (prefix3Num >= 650 && prefix3Num <= 654) {
      return 'mtn';
    }
  }
  
  if (localNumber.startsWith('6')) {
    return 'orange';
  }
  
  return null;
};

export const ClientDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    services,
    orders,
    createOrder,
    redeemService,
    rateOrder,
    issueNfcCard,
    cards,
    validateOrderManually,
    connectivityMode,
    syncOfflineQueue,
    offlineQueueCount,
    loyaltyPointsRate,
    loyaltyPointValue
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('14:00');
  const [bookingAddress, setBookingAddress] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Mekalat');
  const [addressDetails, setAddressDetails] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'cash'>('momo');

  // Loyalty Point Conversion Form State
  const [selectedRedeemService, setSelectedRedeemService] = useState<Service | null>(null);
  const [redeemDate, setRedeemDate] = useState('');
  const [redeemTime, setRedeemTime] = useState('14:00');
  const [redeemNeighborhood, setRedeemNeighborhood] = useState('Mekalat');
  const [redeemAddressDetails, setRedeemAddressDetails] = useState('');
  const [redeemNotes, setRedeemNotes] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Selected Provider ID for history & performance modal lookup
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);

  // QR Code Simulator & Potential Client State
  const [hasScannedQr, setHasScannedQr] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('qr') === 'ebolowa' || params.get('qr_access') === 'true' || localStorage.getItem('studs_qr_scanned') === 'true';
    }
    return false;
  });
  const [guestName, setGuestName] = useState(() => {
    return localStorage.getItem('studs_guest_name') || '';
  });
  const [guestPhone, setGuestPhone] = useState(() => {
    return localStorage.getItem('studs_guest_phone') || '';
  });
  const [qrFlash, setQrFlash] = useState(false);

  // Rating States
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  // Invoice display states
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Wallet top up state

  // Manual Validation states
  const [validatingOrderId, setValidatingOrderId] = useState<string | null>(null);
  const [validationSuccessMsg, setValidationSuccessMsg] = useState<string | null>(null);
  const [validationErrorMsg, setValidationErrorMsg] = useState<string | null>(null);

  // Active tab inside client space
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'loyalty' | 'profile' | 'video'>('catalog');

  // Chart Metric Selection State
  const [chartMetric, setChartMetric] = useState<'amount' | 'count'>('amount');

  // Tutoring state variables
  const [tutoringSection, setTutoringSection] = useState<'francophone' | 'anglophone'>('francophone');
  const [tutoringSeries, setTutoringSeries] = useState<'general' | 'A' | 'C' | 'D' | 'TI'>('general');
  const [tutoringClass, setTutoringClass] = useState<'primaire' | 'college' | 'lycee' | 'universite'>('primaire');

  // Billing frequency state variable
  const [billingFrequency, setBillingFrequency] = useState<'one_off' | 'weekly' | 'monthly'>('one_off');

  // Selected property reference for real estate info panel
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Helper to construct Weekly NFC Transactions
  const getWeeklyNfcData = () => {
    const result = [];
    // We align the time to June 27, 2026 to match our mock data dates perfectly
    const baseDate = new Date("2026-06-27T12:00:00");
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short' });
      const formattedDay = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1, 3);
      
      // Get actual NFC-validated orders for this client on this day
      const dayOrders = orders.filter(o => 
        o.clientId === currentUser.id && 
        o.validatedByNfc === true &&
        o.scheduledDate === dateStr
      );
      
      const realCount = dayOrders.length;
      const realAmount = dayOrders.reduce((sum, o) => sum + o.servicePrice, 0);
      
      let count = realCount;
      let amount = realAmount;
      
      // Seed pre-existing historical transactions for days without actual live mock orders
      // so the chart shows a realistic activity stream of their 14 total card scans
      if (count === 0) {
        const dayNum = d.getDate();
        if (dayNum % 3 === 0) {
          count = 1;
          amount = 1500 + (dayNum % 3) * 500;
        } else if (dayNum % 5 === 0) {
          count = 2;
          amount = 3500 + (dayNum % 2) * 500;
        } else if (dayNum % 7 === 0) {
          count = 1;
          amount = 2000;
        }
      }
      
      result.push({
        date: dateStr,
        day: formattedDay,
        "Transactions": count,
        "Montant": amount,
      });
    }
    return result;
  };

  if (!currentUser) return null;

  // Filter services
  const filteredServices = services.filter(srv => {
    const matchesSearch = srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || srv.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Client's specific orders
  const clientOrders = orders.filter(o => o.clientId === currentUser.id);

  // Resolve icons dynamically
  const getIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'WashingMachine': return <WashingMachine className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Truck': return <Truck className={className} />;
      case 'ShoppingBag': return <ShoppingBag className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'Home': return <Home className={className} />;
      case 'Eye': return <Eye className={className} />;
      case 'PartyPopper': return <PartyPopper className={className} />;
      default: return <Compass className={className} />;
    }
  };

  const getCategoryLabel = (cat: ServiceCategory) => {
    switch (cat) {
      case 'domestic': return 'Service Domestique';
      case 'logistics': return 'Logistique & Proximity';
      case 'education': return 'Services Éducatifs';
      case 'immobilier': return 'Services Immobiliers';
      case 'custom': return 'Services Personnalisés';
    }
  };

  // Booking Submit handler
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    const isGuest = hasScannedQr && !!guestName;

    let finalPrice = selectedService.price;

    // Apply frequency billing discount
    if (billingFrequency === 'weekly') {
      finalPrice = Math.round(finalPrice * 0.95);
    } else if (billingFrequency === 'monthly') {
      finalPrice = Math.round(finalPrice * 0.88);
    }

    // Apply NFC Member -10% discount if user has a registered NFC Card
    if (myCard) {
      finalPrice = Math.round(finalPrice * 0.90);
    }

    const finalAddress = `${selectedNeighborhood}, Ebolowa (${addressDetails || 'Sans précisions d\'adresse'})`;

    const dynamicTitle = selectedService.id === 'srv-005'
      ? `Soutien Répétition (${tutoringClass.toUpperCase()}, Section ${tutoringSection === 'anglophone' ? 'Anglophone' : 'Francophone'}${tutoringSeries !== 'general' ? ', Série ' + tutoringSeries : ''})`
      : selectedService.title;

    const finalNotes = selectedPropertyId
      ? `[Bien visé : ${REAL_ESTATE_PROPERTIES.find(p => p.id === selectedPropertyId)?.title || selectedPropertyId}] ${bookingNotes}`
      : bookingNotes;

    createOrder({
      serviceId: selectedService.id,
      serviceTitle: dynamicTitle,
      servicePrice: finalPrice,
      category: selectedService.category,
      scheduledDate: bookingDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10), // tomorrow by default
      scheduledTime: bookingTime,
      address: finalAddress,
      notes: finalNotes,
      paymentMethod,
      customClientName: isGuest ? guestName : undefined,
      customClientPhone: isGuest ? guestPhone : undefined,
      tutoringSection: selectedService.id === 'srv-005' ? tutoringSection : undefined,
      tutoringSeries: selectedService.id === 'srv-005' ? tutoringSeries : undefined,
      tutoringClass: selectedService.id === 'srv-005' ? tutoringClass : undefined,
      billingFrequency,
      realEstatePropertyId: selectedPropertyId || undefined,
      realEstatePropertyName: selectedPropertyId ? REAL_ESTATE_PROPERTIES.find(p => p.id === selectedPropertyId)?.title : undefined
    });

    if (paymentMethod === 'momo' && connectivityMode === 'online') {
      setTimeout(() => window.dispatchEvent(new Event('studs:open-payments')), 1200);
    }

    if (connectivityMode !== 'online') {
      alert(`⚡ [Mode Connectivité Réduite] Votre commande pour "${dynamicTitle}" a été sauvegardée localement sur votre téléphone ! Elle sera automatiquement synchronisée avec les administrateurs d'Ebolowa dès que le réseau sera rétabli. Vous pouvez forcer la synchronisation depuis le bouton réseau en haut.`);
    } else {
      if (isGuest) {
        alert(`🎉 Félicitations ${guestName} ! Votre commande en tant que Potentiel Client (accès QR Code) a été enregistrée avec succès. Elle apparaît directement sur le tableau de bord des administrateurs.`);
      } else {
        alert(`🎉 Votre commande a été validée avec succès et apparaît directement sur le tableau de bord des administrateurs.`);
      }
    }

    // Reset Form
    setSelectedService(null);
    setBookingNotes('');
    setBookingAddress('');
    setAddressDetails('');
    setSelectedPropertyId(null);
    setBillingFrequency('one_off');
    setActiveTab('orders'); // switch to see order list
  };

  // Loyalty Point Conversion Submit handler
  const handleRedeemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRedeemService) return;

    setIsRedeeming(true);
    const finalAddress = `${redeemNeighborhood}, Ebolowa (${redeemAddressDetails || 'Sans précisions d\'adresse'})`;

    const res = await redeemService(
      currentUser.id,
      selectedRedeemService.id,
      redeemDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      redeemTime,
      finalAddress,
      redeemNotes
    );

    setIsRedeeming(false);
    if (res.success) {
      alert(`🎉 Félicitations ! Votre demande gratuite pour "${selectedRedeemService.title}" payée par points de fidélité a été validée avec succès !`);
      setSelectedRedeemService(null);
      setRedeemNotes('');
      setRedeemAddressDetails('');
      setActiveTab('orders'); // Switch to orders list to see it
    } else {
      alert(`✖ Échec de la conversion : ${res.message}`);
    }
  };

  // Submit Rating
  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingOrderId) return;
    rateOrder(ratingOrderId, ratingStars, ratingComment);
    setRatingOrderId(null);
    setRatingStars(5);
    setRatingComment('');
  };

  // Download Receipt as PDF
  const downloadReceiptPdf = (order: Order) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a6', // standard receipt size
      });

      // Colors
      const primaryColor = '#0f172a'; // slate-900
      const accentColor = '#2563eb';  // blue-600
      const lightGray = '#f8fafc';     // slate-50

      // Header
      doc.setTextColor(primaryColor);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text("STUD'S App SARL", 52, 12, { align: 'center' });

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor('#64748b'); // slate-500
      doc.text("Ebolowa, Cameroun | RCCM : RC/EBL/2026/B/150", 52, 16, { align: 'center' });
      doc.text("Tel: +237 677 889 900 | contact@studs-app.com", 52, 20, { align: 'center' });

      // Title Separator
      doc.setDrawColor('#e2e8f0'); // slate-200
      doc.setLineWidth(0.2);
      doc.line(8, 23, 97, 23);

      doc.setTextColor(primaryColor);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text("FACTURE ELECTRONIQUE", 52, 28, { align: 'center' });

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor('#475569'); // slate-600
      doc.text(`No: ${order.id.toUpperCase()}`, 52, 32, { align: 'center' });

      doc.line(8, 35, 97, 35);

      // Details Block
      doc.setFillColor(lightGray);
      doc.rect(8, 38, 89, 24, 'F');

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor('#334155'); // slate-700
      doc.text("DATE:", 11, 43);
      doc.text("CLIENT:", 11, 48);
      doc.text("TEL:", 11, 53);
      if (order.providerName) {
        doc.text("ETUDIANT:", 11, 58);
      }

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor('#0f172a');
      doc.text(new Date(order.createdAt).toLocaleString('fr-FR'), 28, 43);
      doc.text(order.clientName, 28, 48);
      doc.text(order.clientPhone || 'N/A', 28, 53);
      if (order.providerName) {
        doc.text(order.providerName, 28, 58);
      }

      // Items table header
      let y = 68;
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor('#64748b');
      doc.text("DESIGNATION", 10, y);
      doc.text("MONTANT", 95, y, { align: 'right' });

      doc.line(8, y + 2, 97, y + 2);

      // Item row
      y += 7;
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor('#0f172a');
      const displayTitle = order.serviceTitle.length > 25 ? order.serviceTitle.substring(0, 23) + '...' : order.serviceTitle;
      doc.text(`Prestation: ${displayTitle}`, 10, y);
      doc.text(`${order.servicePrice.toLocaleString()} FCFA`, 95, y, { align: 'right' });

      doc.line(8, y + 4, 97, y + 4);

      // Total summary
      y += 9;
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor('#64748b');
      doc.text(`METHODE: ${order.paymentMethod.toUpperCase()}`, 10, y);
      
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(primaryColor);
      doc.text(`NET A PAYER : ${order.servicePrice.toLocaleString()} FCFA`, 95, y, { align: 'right' });

      y += 4;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor('#94a3b8');
      doc.text("STATUT TAXE: EXONERE (Economie Sociale)", 95, y, { align: 'right' });

      // Footer
      y += 12;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor('#64748b');
      doc.text("Merci pour votre confiance en la jeunesse", 52, y, { align: 'center' });
      doc.text("estudiantine camerounaise.", 52, y + 3, { align: 'center' });

      doc.setFont('Times', 'italic');
      doc.setTextColor(accentColor);
      doc.text('"Servir avec excellence aujourd\'hui, c\'est"', 52, y + 8, { align: 'center' });
      doc.text('construire la confiance de demain.', 52, y + 11, { align: 'center' });

      doc.save(`Facture-STUDS-${order.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Une erreur s'est produite lors de la génération du PDF.");
    }
  };

  // Top Up Wallet
  // Get current active user's card details
  const myCard = cards.find(c => c.userId === currentUser.id);

  return (
    <div className="space-y-6">
      {/* Mini-tableau récapitulatif en haut du tableau de bord */}
      <MiniDashboardHeader role="client" />

      {/* Bannière d'accueil */}
      <div className="relative overflow-hidden rounded-3xl brand-gradient p-5 shadow-lg">
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10" />
        <div className="absolute -right-2 bottom-[-40px] w-32 h-32 rounded-full bg-white/5" />
        <span className="relative inline-block px-3 py-1 rounded-full bg-amber-400 text-[#1a1200] text-xs font-bold">Étudiants certifiés STUD'S</span>
        <h2 className="relative mt-3 font-display text-2xl font-extrabold leading-tight text-white">Trouvez votre prestataire en 1 clic</h2>
        <p className="relative mt-1.5 text-sm text-white/80">Paiement sécurisé par MTN MoMo &amp; Orange Money, ou en espèces.</p>
        <div className="relative mt-4 flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('catalog')} className="px-4 py-2.5 rounded-xl bg-white text-brand-800 text-sm font-bold cursor-pointer">Voir les services</button>
          <button onClick={() => window.dispatchEvent(new Event('studs:open-payments'))} className="px-4 py-2.5 rounded-xl bg-amber-400 text-[#1a1200] text-sm font-bold cursor-pointer">💳 Mes paiements</button>
        </div>
      </div>

      {/* Navigation */}
      <TabBar
        active={activeTab}
        onChange={(id) => setActiveTab(id as any)}
        tabs={[
          { id: 'catalog', label: 'Services', icon: TbGrid },
          { id: 'orders', label: 'Commandes', icon: TbList },
          { id: 'loyalty', label: 'Cadeaux', icon: TbGift },
          { id: 'profile', label: 'Profil', icon: TbUser },
          { id: 'video', label: 'Démo', icon: TbPlay },
        ]}
      />

      <AnimatePresence mode="wait">
        {/* TAB 1: SERVICE CATALOGUE */}
        {activeTab === 'catalog' && (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6"
          >
            {/* Search and Filters Deck */}
            <div className="bento-card grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="relative md:col-span-6">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-800 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un service (ex: lessive, ménage...)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:bg-white font-sans font-medium"
                />
              </div>

              <div className="flex items-center space-x-2 md:col-span-6 overflow-x-auto py-1">
                <Filter className="text-slate-800 w-3.5 h-3.5 flex-shrink-0" />
                {(['all', 'domestic', 'logistics', 'education', 'immobilier', 'custom'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black whitespace-nowrap uppercase tracking-wider transition-all border-2 ${
                      activeCategory === cat
                        ? 'bg-brand-700 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-900'
                    }`}
                  >
                    {cat === 'all' ? 'Tous' : cat === 'domestic' ? 'Domestique' : cat === 'logistics' ? 'Logistique' : cat === 'education' ? 'Éducation' : cat === 'immobilier' ? 'Immobilier' : 'Spécial'}
                  </button>
                ))}
              </div>
            </div>

            {/* Inspiration Quote Box */}
            <div className="bento-card-dark flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="font-extrabold text-xl tracking-tight text-white uppercase">Prêt à simplifier votre quotidien ?</h3>
                <p className="text-slate-300 text-xs font-serif italic max-w-xl">
                  "Servir avec excellence aujourd'hui, c'est construire la confiance de demain." — STUD'S App
                </p>
              </div>
            </div>

            {/* Custom Real Estate Section if Category is Immobilier */}
            {activeCategory === 'immobilier' && (
              <div className="space-y-6">
                <div className="bg-brand-700 text-white rounded-2xl p-6 border-4 border-slate-950 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-2">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <Home className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Plateforme Intégrée d'Ebolowa</span>
                  </div>
                  <h3 className="font-extrabold text-lg uppercase tracking-tight">🔎 Annonces Immobilières Actives</h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    Découvrez ci-dessous les biens immobiliers ciblés et disponibles en location à Ebolowa. Vous pouvez consulter les photos, les charges, les conditions juridiques d'accès, et réserver instantanément un étudiant pour aller inspecter les lieux ou finaliser le dossier de location pour vous.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {REAL_ESTATE_PROPERTIES.map(prop => (
                    <div
                      key={prop.id}
                      className="bg-white border-4 border-slate-950 rounded-2xl overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all flex flex-col justify-between"
                    >
                      {/* Photo Header */}
                      <div className="relative h-44 border-b-4 border-slate-950">
                        <img
                          src={prop.photoUrl}
                          referrerPolicy="no-referrer"
                          alt={prop.title}
                          className="w-full h-full object-cover bg-slate-100"
                        />
                        <div className="absolute top-3 left-3 bg-brand-900 text-white font-mono text-[10px] font-black px-2.5 py-1 rounded-md border border-white">
                          {prop.neighborhood.toUpperCase()}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-blue-600 text-white font-mono font-black text-xs px-3 py-1.5 rounded-lg border-2 border-slate-950 shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)]">
                          {prop.rent.toLocaleString()} FCFA <span className="text-[9px] font-bold">/ mois</span>
                        </div>
                      </div>

                      {/* Info body */}
                      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{prop.title}</h4>
                          <p className="text-[10px] text-slate-500 font-bold font-mono">ID de Référence: {prop.id}</p>
                          
                          {/* Conditions & Modalités */}
                          <div className="space-y-2 pt-2.5">
                            <div>
                              <p className="text-[9px] uppercase font-black text-blue-900 flex items-center space-x-1">
                                <span>📌</span>
                                <span>Caractéristiques & Conditions</span>
                              </p>
                              <ul className="text-[10px] text-slate-600 space-y-0.5 pl-3 list-disc mt-1">
                                {prop.conditions.map((cond, idx) => (
                                  <li key={idx} className="font-medium">{cond}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="border-t border-slate-100 pt-2">
                              <p className="text-[9px] uppercase font-black text-amber-800 flex items-center space-x-1">
                                <span>⚖</span>
                                <span>Modalités financières & Bail</span>
                              </p>
                              <ul className="text-[10px] text-slate-600 space-y-0.5 pl-3 list-disc mt-1">
                                {prop.modalities.map((mod, idx) => (
                                  <li key={idx} className="font-medium">{mod}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Order delegation action */}
                        <div className="pt-3 border-t-2 border-slate-150 space-y-2">
                          <div className="text-[9.5px] text-slate-500 font-bold leading-tight">
                            Besoins de visiter ce lieu à Ebolowa ou d'effectuer des démarches ? Mandatez un étudiant de confiance :
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const srv = services.find(s => s.id === 'srv-007') || filteredServices[0];
                                setSelectedPropertyId(prop.id);
                                setSelectedService(srv);
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                setBookingDate(tomorrow.toISOString().split('T')[0]);
                                alert(`📸 Option sélectionnée : Visite immobilière par procuration de "${prop.title}". L'étudiant ira prendre des photos, vidéos et tester le voisinage pour vous.`);
                              }}
                              className="py-1.5 px-2 bg-white hover:bg-slate-50 border border-slate-200/60 text-slate-800 font-black rounded-lg text-[9px] text-center transition-all cursor-pointer shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none flex items-center justify-center space-x-1"
                            >
                              <Eye className="w-3 h-3 text-blue-600" />
                              <span>Commander Visite</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const srv = services.find(s => s.id === 'srv-006') || filteredServices[0];
                                setSelectedPropertyId(prop.id);
                                setSelectedService(srv);
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                setBookingDate(tomorrow.toISOString().split('T')[0]);
                                alert(`🏠 Option sélectionnée : Recherche/accompagnement de logement ciblé pour "${prop.title}". L'étudiant vous accompagnera et gérera les formalités du dossier.`);
                              }}
                              className="py-1.5 px-2 bg-brand-700 hover:bg-slate-850 border border-slate-200/60 text-white font-black rounded-lg text-[9px] text-center transition-all cursor-pointer shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none flex items-center justify-center space-x-1"
                            >
                              <Home className="w-3 h-3 text-amber-400" />
                              <span>Prendre en Location</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-1 bg-slate-200 rounded-full my-6" />
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Services Immobiliers associés :</h4>
              </div>
            )}

            {/* Catalogue Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(srv => (
                <div
                  key={srv.id}
                  className="bento-card flex flex-col justify-between group"
                >
                  <div className="space-y-3.5">
                    {/* Header line */}
                    <div className="flex items-center justify-between">
                      <span className="bento-badge">
                        {getCategoryLabel(srv.category)}
                      </span>
                      <div className="flex items-center space-x-1 text-yellow-500 font-extrabold font-mono text-xs">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-slate-900">{srv.rating}</span>
                        <span className="text-slate-400">({srv.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Title and Icon */}
                    <div className="flex items-start space-x-3.5 pt-2">
                      <div className="p-3 bg-slate-100 rounded-xl text-slate-900 border border-slate-200/60 group-hover:bg-slate-900 group-hover:text-white transition-all">
                        {getIcon(srv.iconName, "w-6 h-6")}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 tracking-tight">
                          {srv.title}
                        </h4>
                        <p className="text-slate-600 text-xs mt-1 leading-relaxed line-clamp-2">
                          {srv.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="border-t-2 border-slate-150 mt-5 pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider">
                        {myCard ? "Tarif Membre NFC (-10%)" : "Tarif étudiant"}
                      </p>
                      {myCard ? (
                        <div className="flex items-baseline space-x-1.5">
                          <p className="text-sm font-black text-blue-600 font-mono">
                            {Math.round(srv.price * 0.90).toLocaleString()}{' '}
                            <span className="text-xs font-bold">FCFA</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold line-through font-mono">
                            {srv.price.toLocaleString()}
                          </p>
                          <span className="text-[9px] text-slate-500 font-sans"> / {srv.unit}</span>
                        </div>
                      ) : (
                        <p className="text-sm font-black text-slate-900 font-mono">
                          {srv.price.toLocaleString()}{' '}
                          <span className="text-xs text-slate-900 font-bold">FCFA</span>
                          <span className="text-xs text-slate-500 font-sans font-normal"> / {srv.unit}</span>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedService(srv);
                        // set default tomorrow date
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setBookingDate(tomorrow.toISOString().split('T')[0]);
                      }}
                      className="bento-button"
                    >
                      <span>Commander</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 2: CLIENT BOOKINGS/HISTORY */}
        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-4"
          >
            {clientOrders.length === 0 ? (
              <div className="bento-card text-center max-w-lg mx-auto p-12">
                <ShoppingBag className="w-12 h-12 text-slate-800 mx-auto mb-4 animate-bounce" />
                <h3 className="font-extrabold text-lg text-slate-900 uppercase tracking-tight">Aucune commande en cours</h3>
                <p className="text-slate-600 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                  Trouvez et réservez des étudiants talentueux et professionnels pour vos besoins du quotidien à Ebolowa !
                </p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="bento-button mt-6"
                >
                  Découvrir le catalogue
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {clientOrders.map(order => (
                  <div
                    key={order.id}
                    className="bento-card flex flex-col md:flex-row md:items-center md:justify-between gap-5"
                  >
                    {/* Left details */}
                    <div className="space-y-3.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-0.5 rounded font-bold">
                          REF: {order.id}
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border-2 ${
                          order.status === 'completed' ? 'bg-emerald-100 text-emerald-900 border-emerald-900' :
                          order.status === 'in_progress' ? 'bg-blue-100 text-blue-900 border-blue-900' :
                          order.status === 'assigned' ? 'bg-indigo-100 text-indigo-900 border-indigo-900' :
                          order.status === 'cancelled' ? 'bg-rose-100 text-rose-900 border-rose-900' :
                          'bg-amber-100 text-amber-900 border-amber-900'
                        }`}>
                          {order.status === 'pending' && 'En attente d\'attribution'}
                          {order.status === 'assigned' && 'Prestataire attribué'}
                          {order.status === 'in_progress' && 'Prestation en cours'}
                          {order.status === 'completed' && 'Service terminé'}
                          {order.status === 'cancelled' && 'Annulée'}
                        </span>
                        {order.validatedByNfc && (
                          <span className="text-[9px] font-black bg-emerald-500 border-2 border-emerald-950 text-white px-2 py-0.5 rounded flex items-center space-x-0.5">
                            <span>✔ NFC CERTIFIÉ (PTS DOUBLÉS)</span>
                          </span>
                        )}
                        {order.nfcPriority && (
                          <span className="text-[9px] font-black bg-blue-600 border border-slate-200/60 text-white px-2 py-0.5 rounded flex items-center space-x-0.5">
                            <span>🚀 TRAITEMENT PRIORITAIRE NFC</span>
                          </span>
                        )}
                        {order.isOfflinePending && (
                          <span className="text-[9px] font-black bg-amber-500 border-2 border-amber-950 text-slate-950 px-2 py-0.5 rounded flex items-center space-x-0.5 animate-pulse">
                            <span>⏳ EN ATTENTE SYNC (EBOLOWA)</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-extrabold text-base text-slate-900 tracking-tight">{order.serviceTitle}</h4>
                        <p className="text-xs text-slate-600 flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-800" />
                          <span>{order.address}</span>
                        </p>
                        <p className="text-xs text-slate-600 flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-800" />
                          <span>Prévu le : {order.scheduledDate} à {order.scheduledTime}</span>
                        </p>
                        {order.notes && (
                          <p className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-xl mt-2 border border-slate-200/60 font-sans">
                            📝 <strong>Note :</strong> {order.notes}
                          </p>
                        )}
                      </div>

                      {/* Provider Info Row if assigned */}
                      {order.providerName && (() => {
                        const provUser = users.find(u => u.id === order.providerId || (u.firstName && u.lastName && `${u.firstName} ${u.lastName}` === order.providerName));
                        const provOrders = orders.filter(o => (o.providerId === order.providerId || o.providerName === order.providerName) && o.status === 'completed' && o.rating);
                        const avgRating = provOrders.length > 0 
                          ? (provOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / provOrders.length).toFixed(1)
                          : '4.9';

                        return (
                          <div className="bento-card-amber p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-w-md w-full">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={provUser?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(order.providerName)}`} 
                                className="w-10 h-10 rounded-full border border-slate-200/60 object-cover bg-white" 
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <p className="text-[9px] text-amber-800 uppercase font-black tracking-wider leading-none">Prestataire Étudiant</p>
                                <p className="text-xs font-black text-amber-950 mt-1">{order.providerName}</p>
                                <div className="flex items-center space-x-1 mt-0.5">
                                  <span className="text-yellow-600 text-xs">★</span>
                                  <span className="text-[10px] font-bold text-amber-900">{avgRating} ({provOrders.length} avis)</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto">
                              <p className="text-[10px] font-black font-mono text-amber-900">{order.providerPhone}</p>
                              <button
                                onClick={() => {
                                  if (order.providerId) {
                                    setSelectedProviderId(order.providerId);
                                  } else if (provUser) {
                                    setSelectedProviderId(provUser.id);
                                  } else {
                                    alert("Profil de l'étudiant introuvable.");
                                  }
                                }}
                                className="px-2.5 py-1 bg-brand-700 hover:bg-brand-800 text-white font-black text-[9px] rounded-lg border-2 border-slate-950 transition-all uppercase tracking-wider cursor-pointer shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none"
                              >
                                👤 Qui vient chez moi ?
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Right Price & Actions */}
                    <div className="flex flex-row md:flex-col justify-between items-center md:items-end border-t-2 md:border-t-0 border-slate-200 pt-3 md:pt-0 gap-3 min-w-[140px]">
                      <div>
                        <p className="text-[9px] text-slate-400 text-left md:text-right uppercase font-bold tracking-wider">Tarif Total</p>
                        <p className="text-base font-black text-slate-900 font-mono text-left md:text-right pt-0.5">
                          {order.servicePrice.toLocaleString()}{' '}
                          <span className="text-xs text-slate-900 font-bold">FCFA</span>
                        </p>
                        <p className="text-[9px] font-mono text-slate-500 text-left md:text-right mt-1 font-bold">
                          Paiement: <span className="uppercase text-slate-900 font-black">{order.paymentMethod}</span> ({order.paymentStatus === 'paid' ? 'Payé' : 'En attente'})
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 justify-end">
                        <button
                          onClick={() => setInvoiceOrder(order)}
                          className="bento-button-light py-1 px-2.5 text-[10px]"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Facture</span>
                        </button>

                        {(order.status === 'assigned' || order.status === 'pending') && (
                          <button
                            disabled={validatingOrderId !== null}
                            onClick={async () => {
                              setValidatingOrderId(order.id);
                              setValidationErrorMsg(null);
                              setValidationSuccessMsg(null);
                              try {
                                const res = await validateOrderManually(order.id, 'in_progress');
                                if (res.success) {
                                  setValidationSuccessMsg(res.message);
                                } else {
                                  setValidationErrorMsg(res.message);
                                }
                              } catch (err) {
                                setValidationErrorMsg("Une erreur s'est produite.");
                              } finally {
                                setValidatingOrderId(null);
                              }
                            }}
                            className="bento-button py-1 px-2.5 text-[10px] bg-amber-400 hover:bg-amber-300 border border-slate-200/60 flex items-center space-x-1"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Confirmer Arrivée (Sans NFC)</span>
                          </button>
                        )}

                        {order.status === 'in_progress' && (
                          <button
                            disabled={validatingOrderId !== null}
                            onClick={async () => {
                              setValidatingOrderId(order.id);
                              setValidationErrorMsg(null);
                              setValidationSuccessMsg(null);
                              try {
                                const res = await validateOrderManually(order.id, 'completed');
                                if (res.success) {
                                  setValidationSuccessMsg(res.message);
                                } else {
                                  setValidationErrorMsg(res.message);
                                }
                              } catch (err) {
                                setValidationErrorMsg("Une erreur s'est produite.");
                              } finally {
                                setValidatingOrderId(null);
                              }
                            }}
                            className="bento-button py-1 px-2.5 text-[10px] bg-emerald-500 hover:bg-emerald-400 text-white border border-slate-200/60 flex items-center space-x-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Libérer les fonds (Sans NFC)</span>
                          </button>
                        )}

                        {order.status === 'completed' && !order.rating && (
                          <button
                            onClick={() => {
                              setRatingOrderId(order.id);
                              setRatingStars(5);
                              setRatingComment('');
                            }}
                            className="bento-button py-1 px-2.5 text-[10px] bg-yellow-500 hover:bg-yellow-400 border border-slate-200/60"
                          >
                            <Star className="w-3 h-3 fill-current" />
                            <span>Évaluer</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB: LOYALTY POINTS REDEMPTION */}
        {activeTab === 'loyalty' && (
          <motion.div
            key="loyalty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6"
          >
            {/* Loyalty points status card */}
            <div className="bento-card bg-brand-700 text-white grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-3">
                <span className="px-2.5 py-0.5 text-[9px] bg-yellow-500 text-slate-950 rounded font-black tracking-widest uppercase border border-yellow-400">
                  PROGRAMME AVANTAGES ÉTUDIANTS
                </span>
                <h3 className="font-extrabold text-2xl tracking-tight uppercase text-white">Vos Points de Fidélité</h3>
                <p className="text-slate-300 text-xs leading-relaxed max-w-xl">
                  En choisissant les services éco-responsables de nos étudiants à Ebolowa, vous cumulez de précieux points de fidélité certifiés par NFC.
                  Convertissez-les instantanément ici en demandes de services gratuites pour votre domicile ou entreprise !
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-mono pt-1 text-slate-300">
                  <span className="flex items-center space-x-1">
                    <span>💡 Taux d'accumulation :</span>
                    <strong className="text-yellow-400 font-black">{loyaltyPointsRate}%</strong>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>💎 Valeur d'un point :</span>
                    <strong className="text-yellow-400 font-black">{loyaltyPointValue} FCFA</strong>
                  </span>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-brand-800 rounded-2xl border-2 border-slate-700 shadow-inner">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 font-mono">SOLDE ACTUEL</p>
                <div className="flex items-baseline space-x-1 mt-1 animate-pulse">
                  <span className="text-4xl font-black text-yellow-400 font-mono">{currentUser?.loyaltyPoints || 0}</span>
                  <span className="text-xs font-bold text-slate-300">Points</span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans mt-2">
                  Équivaut à <strong className="text-yellow-400 font-mono font-black">{((currentUser?.loyaltyPoints || 0) * loyaltyPointValue).toLocaleString()} FCFA</strong> de services gratuits.
                </p>
              </div>
            </div>

            {/* Redeemable Services List */}
            <div className="space-y-4">
              <div className="border-b-2 border-slate-900 pb-2">
                <h4 className="font-extrabold text-base text-slate-900 uppercase">Cadeaux et Services Disponibles en Échange</h4>
                <p className="text-xs text-slate-500">Sélectionnez la prestation étudiante de votre choix ci-dessous à régler à 100% avec vos points.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(srv => {
                  const pointsNeeded = Math.round(srv.price / loyaltyPointValue);
                  const currentPoints = currentUser?.loyaltyPoints || 0;
                  const hasEnoughPoints = currentPoints >= pointsNeeded;
                  const progressPercentage = Math.min(100, Math.round((currentPoints / pointsNeeded) * 100));

                  return (
                    <div
                      key={`redeem-${srv.id}`}
                      className={`bento-card flex flex-col justify-between group transition-all ${
                        hasEnoughPoints 
                          ? 'border-yellow-500 bg-yellow-50/15 hover:bg-yellow-50/30' 
                          : 'opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="bento-badge">
                            {getCategoryLabel(srv.category)}
                          </span>
                          <span className="text-[10px] font-black font-mono bg-brand-700 text-yellow-400 px-2.5 py-0.5 rounded border border-slate-950 uppercase tracking-tight">
                            💎 {pointsNeeded} PTS
                          </span>
                        </div>

                        <div className="flex items-start space-x-3.5 pt-2">
                          <div className={`p-3 bg-slate-100 rounded-xl text-slate-900 border border-slate-200/60 ${
                            hasEnoughPoints ? 'group-hover:bg-yellow-500 group-hover:text-slate-950' : 'group-hover:bg-slate-900 group-hover:text-white'
                          } transition-all`}>
                            {getIcon(srv.iconName, "w-6 h-6")}
                          </div>
                          <div>
                            <h5 className="font-extrabold text-sm text-slate-900 tracking-tight">
                              {srv.title}
                            </h5>
                            <p className="text-slate-500 text-[11px] mt-1 leading-relaxed line-clamp-2">
                              {srv.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Points Cost and Progress bar or Redeem button */}
                      <div className="border-t-2 border-slate-150 mt-5 pt-4 space-y-3">
                        {!hasEnoughPoints ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono font-bold text-slate-600">
                              <span>Progression ({currentPoints}/{pointsNeeded})</span>
                              <span>{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-slate-100 border border-slate-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-slate-400 h-full transition-all duration-500" 
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            <p className="text-[9px] text-slate-400 italic">Il vous manque {pointsNeeded - currentPoints} points pour débloquer ce service gratuit.</p>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedRedeemService(srv);
                              const tomorrow = new Date();
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              setRedeemDate(tomorrow.toISOString().split('T')[0]);
                            }}
                            className="w-full py-2 px-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black border-2 border-slate-950 rounded-xl text-xs transition-all shadow-sm border-slate-100/50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer text-center font-bold"
                          >
                            🎁 Convertir mes Points
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: CLIENT PROFILE & NFC CARD */}
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Left Box: Card status */}
            <div className="bento-card md:col-span-5 flex flex-col items-center justify-between text-center min-h-[300px]">
              <div className="space-y-4 w-full flex flex-col items-center">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Votre Carte NFC STUD'S</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Votre identifiant matériel unique pour s'authentifier instantanément, cumuler des points de fidélité et valider les services.
                </p>

                {myCard ? (
                  /* High Fidelity NFC Card representation */
                  <div className="relative w-full max-w-[280px] h-[170px] rounded-2xl overflow-hidden shadow-xl text-white font-mono bg-brand-700 p-4 border border-slate-200/60 flex flex-col justify-between group hover:scale-[1.02] transition-transform">
                    {/* Glowing mesh overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)]" />
                    <div className="flex justify-between items-start z-10">
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-blue-400">STUD'S App</p>
                        <p className="text-[7px] text-slate-400 font-sans font-bold">CARTE NFC CLIENT</p>
                      </div>
                      <span className="text-lg">⚡</span>
                    </div>

                    {/* Chip simulation */}
                    <div className="w-9 h-7 bg-amber-400 rounded border border-amber-500 z-10 shadow-inner flex items-center justify-center">
                      <div className="w-6 h-4 border border-slate-800/20" />
                    </div>

                    <div className="z-10">
                      <p className="text-sm font-black tracking-widest text-white leading-none">{myCard.id}</p>
                      <div className="flex justify-between items-end mt-2">
                        <p className="text-[9px] text-slate-300 uppercase truncate max-w-[150px] font-bold">{currentUser.firstName} {currentUser.lastName}</p>
                        <div className="text-right">
                          <p className="text-[6px] text-slate-400 font-sans uppercase font-bold">Points cumulés</p>
                          <p className="text-xs font-black text-yellow-400">{myCard.loyaltyPoints} PTS</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-[280px]">
                    <div className="bento-card-amber p-6 text-center space-y-3">
                      <CreditCard className="w-10 h-10 text-slate-800 mx-auto animate-pulse" />
                      <p className="text-xs font-black text-slate-900">Aucune carte NFC liée</p>
                      <p className="text-[11px] text-slate-700 leading-normal">
                        Obtenez votre carte physique gratuite auprès de l'administration pour bénéficier de 15 points d'inscription.
                      </p>
                      <button
                        onClick={() => issueNfcCard(currentUser.id)}
                        className="bento-button w-full"
                      >
                        Émettre ma carte NFC
                      </button>
                    </div>

                    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 text-left space-y-2">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">🎁 Avantages d'être détenteur :</p>
                      <ul className="text-[10px] text-slate-600 space-y-1 list-disc pl-3">
                        <li><strong>-10% de réduction</strong> sur toutes vos commandes</li>
                        <li><strong>Points doublés (20%)</strong> par validation physique NFC</li>
                        <li><strong>Prise en charge PRIORITAIRE</strong> par les étudiants</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {myCard && (
                <div className="bento-card-amber text-left font-sans mt-4 space-y-2.5">
                  <h4 className="font-extrabold text-[12px] uppercase text-amber-950 flex items-center space-x-1">
                    <span>💎</span>
                    <span>Vos privilèges Club NFC Actifs</span>
                  </h4>
                  <ul className="text-[10.5px] text-slate-800 space-y-2 pl-3 list-disc leading-relaxed">
                    <li>
                      <strong>Réduction systématique de -10% :</strong> Appliquée d'office sur tous les tarifs du catalogue de services à Ebolowa.
                    </li>
                    <li>
                      <strong>Points de fidélité doublés (x2) :</strong> Gagnez 20% du montant de vos commandes en points lors de chaque validation physique par scan NFC.
                    </li>
                    <li>
                      <strong>Attribution Prioritaire VIP :</strong> Vos demandes sont mises en avant auprès de nos étudiants pour une prise en charge ultra-rapide.
                    </li>
                    <li>
                      <strong>Fidélité payante :</strong> À 200 points, débloquez un service gratuit d'une valeur maximale de 5,000 FCFA.
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Right Box: PII details and loyalty history */}
            <div className="bento-card md:col-span-7 space-y-6">
              <h3 className="font-extrabold text-base text-slate-900 border-b-2 border-slate-100 pb-3 uppercase tracking-wider">
                Informations du Compte
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Nom complet</p>
                  <p className="text-xs font-black text-slate-800">{currentUser.firstName} {currentUser.lastName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Numéro de téléphone</p>
                  <p className="text-xs font-black text-slate-800">{currentUser.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Adresse e-mail</p>
                  <p className="text-xs font-black text-slate-800">{currentUser.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Membre depuis</p>
                  <p className="text-xs font-black text-slate-800">{new Date(currentUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Wallet actions */}
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Portefeuille Mobile Money</p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">Prépayer vos commandes pour un traitement 100% sécurisé sans espèces.</p>
                </div>
              </div>
            </div>

            {/* Weekly NFC Transactions Chart Box (md:col-span-12) */}
            <div className="bento-card md:col-span-12 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b-2 border-slate-100 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 bg-blue-50 text-blue-600 border border-slate-200/60 rounded-xl shadow-sm">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 uppercase tracking-tight">Historique des Transactions NFC</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Activité hebdomadaire et volume d'achats via carte intelligente</p>
                  </div>
                </div>

                {/* Metric toggle selector buttons */}
                <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setChartMetric('amount')}
                    className={`px-3 py-1.5 rounded-lg font-black text-[10px] uppercase transition-all cursor-pointer ${
                      chartMetric === 'amount'
                        ? 'bg-blue-600 border border-slate-950 text-white shadow-[1px_1px_0px_rgba(0,0,0,1)]'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    💰 Volume (FCFA)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMetric('count')}
                    className={`px-3 py-1.5 rounded-lg font-black text-[10px] uppercase transition-all cursor-pointer ${
                      chartMetric === 'count'
                        ? 'bg-emerald-600 border border-slate-950 text-white shadow-[1px_1px_0px_rgba(0,0,0,1)]'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    ⚡ Fréquence Scans
                  </button>
                </div>
              </div>

              {/* Dynamic stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 border border-slate-200/60 rounded-2xl">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Total de la semaine</p>
                  <p className="text-xl font-black text-slate-950 mt-1 font-mono">
                    {chartMetric === 'amount' 
                      ? `${getWeeklyNfcData().reduce((sum, item) => sum + item.Montant, 0).toLocaleString()} FCFA`
                      : `${getWeeklyNfcData().reduce((sum, item) => sum + item.Transactions, 0)} scans NFC`
                    }
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Moyenne quotidienne</p>
                  <p className="text-xl font-black text-slate-950 mt-1 font-mono">
                    {chartMetric === 'amount'
                      ? `${Math.round(getWeeklyNfcData().reduce((sum, item) => sum + item.Montant, 0) / 7).toLocaleString()} FCFA`
                      : `${(getWeeklyNfcData().reduce((sum, item) => sum + item.Transactions, 0) / 7).toFixed(1)} scans`
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📈</span>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Jour le plus actif</p>
                    <p className="text-xs font-extrabold text-slate-800 mt-0.5">
                      {(() => {
                        const data = getWeeklyNfcData();
                        const maxItem = data.reduce((max, item) => 
                          (chartMetric === 'amount' ? item.Montant : item.Transactions) > (chartMetric === 'amount' ? max.Montant : max.Transactions) ? item : max
                        , data[0]);
                        return `${maxItem.day} (${chartMetric === 'amount' ? maxItem.Montant.toLocaleString() + ' FCFA' : maxItem.Transactions + ' scans'})`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart container */}
              <div className="h-64 w-full bg-white p-2.5 rounded-xl border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  {chartMetric === 'amount' ? (
                    <AreaChart data={getWeeklyNfcData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="day" 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        fontWeight="bold" 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={9} 
                        fontWeight="bold" 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        content={({ active, payload, label }: any) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white border border-slate-200/60 rounded-xl p-3 shadow-[3px_3px_0px_rgba(0,0,0,1)] text-xs font-sans">
                                <p className="font-black text-slate-900 uppercase tracking-wide">{label} — {payload[0].payload.date}</p>
                                <div className="mt-1.5">
                                  <p className="text-blue-600 font-extrabold font-mono">
                                    Montant : <span className="text-slate-900">{payload[0].value.toLocaleString()} FCFA</span>
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                        cursor={{ stroke: '#64748b', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Montant" 
                        stroke="#2563eb" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorAmount)" 
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={getWeeklyNfcData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="day" 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        fontWeight="bold" 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={9} 
                        fontWeight="bold" 
                        tickLine={false} 
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip 
                        content={({ active, payload, label }: any) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white border border-slate-200/60 rounded-xl p-3 shadow-[3px_3px_0px_rgba(0,0,0,1)] text-xs font-sans">
                                <p className="font-black text-slate-900 uppercase tracking-wide">{label} — {payload[0].payload.date}</p>
                                <div className="mt-1.5">
                                  <p className="text-emerald-600 font-extrabold font-mono">
                                    Transactions : <span className="text-slate-900">{payload[0].value} scan(s) NFC</span>
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                        cursor={{ fill: '#f1f5f9', opacity: 0.6 }}
                      />
                      <Bar 
                        dataKey="Transactions" 
                        fill="#10b981" 
                        radius={[6, 6, 0, 0]} 
                        maxBarSize={36} 
                        stroke="#065f46" 
                        strokeWidth={1.5}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-medium">
                <span className="p-1 bg-blue-50 text-blue-600 rounded">💡</span>
                <span>Chaque validation par carte NFC ajoute des points de fidélité instantanés à votre compte et sécurise la transaction.</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'video' && (
          <motion.div
            key="video"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6"
          >
            <PromoVideoSimulator />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 1: BOOKING WIZARD */}
      <AnimatePresence>
        {selectedService && (() => {
          let price = selectedService.price;
          if (billingFrequency === 'weekly') {
            price = Math.round(price * 0.95);
          } else if (billingFrequency === 'monthly') {
            price = Math.round(price * 0.88);
          }

          if (myCard) {
            price = Math.round(price * 0.90);
          }

          const calculatedDisplayPrice = price;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-brand-700/60 backdrop-blur-sm"
                onClick={() => {
                  setSelectedService(null);
                  setSelectedPropertyId(null);
                }}
              />

              {/* Content card */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-50 flex flex-col"
              >
                {/* Header */}
                <div className="bg-brand-700 text-white p-5">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-blue-400">NOUVELLE COMMANDE</p>
                  <h3 className="font-sans font-bold text-lg">
                    {selectedService.id === 'srv-005'
                      ? `Soutien Répétition (${tutoringClass.toUpperCase()})`
                      : selectedService.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">{selectedService.description}</p>
                </div>

                {/* Form body */}
                <form onSubmit={handleBookingSubmit} className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
                  {/* Selected Real Estate Property Preview */}
                  {selectedPropertyId && (() => {
                    const prop = REAL_ESTATE_PROPERTIES.find(p => p.id === selectedPropertyId);
                    if (!prop) return null;
                    return (
                      <div className="bg-amber-50 border border-slate-200/60 rounded-xl overflow-hidden p-3 flex space-x-3 items-center shadow-sm">
                        <img
                          src={prop.photoUrl}
                          referrerPolicy="no-referrer"
                          alt={prop.title}
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200/60 bg-white"
                        />
                        <div className="flex-1 space-y-0.5">
                          <p className="text-[9px] uppercase font-black text-amber-800">Logement Sélectionné</p>
                          <h5 className="font-extrabold text-xs text-slate-900 leading-tight">{prop.title}</h5>
                          <p className="text-[10px] text-slate-700 font-mono">
                            Loyer : <span className="font-extrabold text-slate-900">{prop.rent.toLocaleString()} FCFA/mois</span>
                          </p>
                          <p className="text-[9px] text-slate-500 font-medium">
                            Caution exigée : {prop.caution.toLocaleString()} FCFA ({Math.round(prop.caution / prop.rent)} mois)
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Guest / Potential Client Details if via QR Code */}
                  {hasScannedQr && (
                    <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                          Commande Prospect (Accès QR Code)
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-950 font-medium leading-relaxed">
                        Saisissez vos coordonnées de contact ci-dessous pour que l'administration puisse attribuer un étudiant et valider la mission à Ebolowa.
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-600">Nom complet</label>
                          <input
                            type="text"
                            required={hasScannedQr}
                            placeholder="Ex: Jean Paul"
                            value={guestName}
                            onChange={e => {
                              const val = e.target.value;
                              setGuestName(val);
                              localStorage.setItem('studs_guest_name', val);
                            }}
                            className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-600">Téléphone</label>
                          <input
                            type="text"
                            required={hasScannedQr}
                            placeholder="Ex: +237 6xx xx xx xx"
                            value={guestPhone}
                            onChange={e => {
                              const val = e.target.value;
                              setGuestPhone(val);
                              localStorage.setItem('studs_guest_phone', val);
                            }}
                            className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tutoring Custom Fields */}
                  {selectedService.id === 'srv-005' && (
                    <div className="bg-blue-50/70 border-2 border-blue-900 rounded-xl p-3.5 space-y-3 shadow-sm">
                      <div className="flex items-center space-x-1.5 text-blue-900">
                        <GraduationCap className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Critères de Répétition académique</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Section Language */}
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-500">Section linguistique</label>
                          <select
                            value={tutoringSection}
                            onChange={e => setTutoringSection(e.target.value as any)}
                            className="w-full bg-white border border-slate-200/60 rounded-lg p-1.5 text-xs text-slate-800 font-bold focus:outline-none"
                          >
                            <option value="francophone">Francophone (Standard)</option>
                            <option value="anglophone">Anglophone (+500 FCFA/h)</option>
                          </select>
                        </div>

                        {/* Class level */}
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-500">Niveau scolaire</label>
                          <select
                            value={tutoringClass}
                            onChange={e => {
                              const val = e.target.value as any;
                              setTutoringClass(val);
                              if (val === 'primaire' || val === 'college') {
                                setTutoringSeries('general');
                              }
                            }}
                            className="w-full bg-white border border-slate-200/60 rounded-lg p-1.5 text-xs text-slate-800 font-bold focus:outline-none"
                          >
                            <option value="primaire">Primaire (SIL - CM2)</option>
                            <option value="college">Collège (6e - 3e, +500/h)</option>
                            <option value="lycee">Lycée (2de - Tle, +1000/h)</option>
                            <option value="universite">Université (+2500/h)</option>
                          </select>
                        </div>
                      </div>

                      {/* Série Selection (only if Lycée or Université) */}
                      {(tutoringClass === 'lycee' || tutoringClass === 'universite') && (
                        <div className="space-y-1.5 pt-1">
                          <label className="text-[9px] uppercase font-extrabold text-slate-600 block">Série académique / Spécialité</label>
                          <div className="grid grid-cols-5 gap-1.5">
                            {(['general', 'A', 'C', 'D', 'TI'] as const).map(ser => (
                              <button
                                key={ser}
                                type="button"
                                onClick={() => setTutoringSeries(ser)}
                                className={`p-1.5 text-[10px] font-black border-2 rounded-lg text-center uppercase tracking-wider transition-all ${
                                  tutoringSeries === ser
                                    ? 'bg-blue-600 border-slate-900 text-white shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-900'
                                }`}
                              >
                                {ser === 'general' ? 'Gén' : ser}
                              </button>
                            ))}
                          </div>
                          <div className="text-[9px] text-blue-900 bg-blue-100/50 p-2 rounded-lg font-bold font-mono mt-1">
                            {tutoringSeries === 'A' && "Série A (Littéraire) : +200 FCFA/heure"}
                            {tutoringSeries === 'C' && "Série C (Mathématiques & Physiques) : +800 FCFA/heure"}
                            {tutoringSeries === 'D' && "Série D (Sciences de la vie & terre) : +500 FCFA/heure"}
                            {tutoringSeries === 'TI' && "Série TI (Technologies de l'Information) : +1000 FCFA/heure"}
                            {tutoringSeries === 'general' && "Général / Tronc commun"}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recurring billing options (weekly/monthly subscription) */}
                  {(['domestic', 'custom'].includes(selectedService.category) || selectedService.id === 'srv-005') && (
                    <div className="bg-slate-50 border-2 border-slate-950 rounded-xl p-3.5 space-y-2.5 shadow-sm">
                      <label className="text-[10px] uppercase font-black text-slate-900 flex items-center space-x-1.5">
                        <span>🔄</span>
                        <span>Option de Fréquence de Facturation</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setBillingFrequency('one_off')}
                          className={`p-2 border-2 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                            billingFrequency === 'one_off'
                              ? 'bg-emerald-50 border-slate-900 text-emerald-950 font-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                          }`}
                        >
                          <span className="text-[10.5px] uppercase font-black">Ponctuel</span>
                          <span className="text-[8px] text-slate-400 font-bold">Intervention Unique</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBillingFrequency('weekly')}
                          className={`p-2 border-2 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                            billingFrequency === 'weekly'
                              ? 'bg-emerald-50 border-slate-900 text-emerald-950 font-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                          }`}
                        >
                          <span className="text-[10.5px] uppercase font-black">Hebdo 🔄</span>
                          <span className="text-[9px] text-emerald-700 font-extrabold font-mono">-5% Réduction</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBillingFrequency('monthly')}
                          className={`p-2 border-2 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                            billingFrequency === 'monthly'
                              ? 'bg-emerald-50 border-slate-900 text-emerald-950 font-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                          }`}
                        >
                          <span className="text-[10.5px] uppercase font-black">Mensuel 🔄</span>
                          <span className="text-[9px] text-emerald-700 font-extrabold font-mono">-12% Réduction</span>
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-600 leading-tight font-medium bg-white p-2 rounded border border-slate-200">
                        {billingFrequency === 'one_off' && "📌 Prestation ponctuelle simple, facturée au tarif normal sans engagement."}
                        {billingFrequency === 'weekly' && "⚡ Engagement Hebdomadaire : Un étudiant intervient chaque semaine. Économisez 5% !"}
                        {billingFrequency === 'monthly' && "💎 Engagement Mensuel de Fidélité : Prestations régulières tout au long du mois. Économisez 12% !"}
                      </p>
                    </div>
                  )}

                  {/* Datetime Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Date souhaitée</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={e => setBookingDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Heure souhaitée</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={bookingTime}
                        onChange={e => setBookingTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 font-bold"
                      />
                    </div>
                  </div>

                  {/* Intervention Address */}
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Quartier d'intervention (Ebolowa)</span>
                      </label>
                      <select
                        value={selectedNeighborhood}
                        onChange={e => setSelectedNeighborhood(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                      >
                        <option value="Mekalat">Mekalat</option>
                        <option value="John Holt">John Holt</option>
                        <option value="Angalé">Angalé</option>
                        <option value="Ebolowa Si 1">Ebolowa Si 1</option>
                        <option value="Ebolowa Si 2">Ebolowa Si 2</option>
                        <option value="Angone">Angone</option>
                        <option value="Adoum">Adoum</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Précisions d'adresse (Ex: face école, près de la chefferie...)</label>
                      <input
                        type="text"
                        required
                        placeholder="Rue, repère physique, barrière..."
                        value={addressDetails}
                        onChange={e => setAddressDetails(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Specific notes */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center space-x-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Instructions spécifiques (Facultatif)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Précisez vos besoins : type de linge, consignes d'accès, matières scolaires..."
                      value={bookingNotes}
                      onChange={e => setBookingNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Payment Option */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500 flex items-center space-x-1">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Mode de paiement sécurisé</span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('momo')}
                        className={`p-2.5 border-2 rounded-xl text-center flex flex-col items-center justify-between transition-all cursor-pointer ${
                          paymentMethod === 'momo'
                            ? 'bg-blue-50 border-slate-900 text-blue-900 font-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                        }`}
                      >
                        <span className="text-xs uppercase font-mono tracking-tighter">Mobile Money</span>
                        <span className="text-[9px] text-slate-400 font-bold">MTN / Orange</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-2.5 border-2 rounded-xl text-center flex flex-col items-center justify-between transition-all cursor-pointer ${
                          paymentMethod === 'cash'
                            ? 'bg-blue-50 border-slate-900 text-blue-900 font-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                        }`}
                      >
                        <span className="text-xs uppercase font-mono tracking-tighter">Espèces</span>
                        <span className="text-[9px] text-slate-400 font-bold">Au prestataire</span>
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold">
                      {paymentMethod === 'momo'
                        ? "Après la réservation, envoyez le montant aux numéros officiels STUD'S puis saisissez l'identifiant de transaction."
                        : "Payez le prestataire à la fin du service, puis déclarez « J'ai payé en espèces » dans Paiements."}
                    </p>
                  </div>

                  {/* Cost recap */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 flex flex-col space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Montant total calculé</p>
                        <p className="text-lg font-black text-slate-900 font-mono">
                          {calculatedDisplayPrice.toLocaleString()}{' '}
                          <span className="text-xs text-blue-600">FCFA</span>
                          {billingFrequency !== 'one_off' && (
                            <span className="text-[10px] text-emerald-700 font-bold block">
                              (Abonnement {billingFrequency === 'weekly' ? 'Hebdomadaire' : 'Mensuel'})
                            </span>
                          )}
                          {myCard && (
                            <span className="text-[10px] text-blue-700 font-bold block">
                              (Tarif Membre Privilégié NFC -10% inclus)
                            </span>
                          )}
                        </p>
                      </div>

                    </div>
                    {myCard && (
                      <div className="text-[9px] text-blue-900 bg-blue-50 border border-blue-200 rounded p-1.5 font-bold flex items-center justify-between">
                        <span>✨ Avantage Carte NFC Active :</span>
                        <span>-10% de réduction immédiate appliquée</span>
                      </div>
                    )}
                  </div>

                  {/* Buttons footer */}
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedService(null);
                        setSelectedPropertyId(null);
                      }}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 font-black rounded-xl text-xs transition-all text-center cursor-pointer shadow-sm active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white border-2 border-slate-950 font-black rounded-xl text-xs transition-all text-center cursor-pointer shadow-sm active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none"
                    >
                      Confirmer la réservation
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* MODAL 2: RATING SUBMISSION */}
      <AnimatePresence>
        {ratingOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-700/60 backdrop-blur-sm"
              onClick={() => setRatingOrderId(null)}
            />

            {/* Content card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-50 text-center space-y-4"
            >
              <h3 className="font-bold text-base text-slate-900 uppercase">Évaluer la prestation</h3>
              <p className="text-xs text-slate-500">
                Votre retour permet d'améliorer constamment la qualité du réseau STUD'S App.
              </p>

              <form onSubmit={handleRatingSubmit} className="space-y-4 text-left">
                {/* Stars selector */}
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingStars(star)}
                      className="p-1 text-yellow-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-8 h-8 ${star <= ratingStars ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>

                {/* Comment box */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Commentaire (Facultatif)</label>
                  <textarea
                    rows={3}
                    placeholder="Comment s'est déroulée la tâche ? Politesse, rapidité, rigueur..."
                    value={ratingComment}
                    onChange={e => setRatingComment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRatingOrderId(null)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                  >
                    Plus tard
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow"
                  >
                    Soumettre l'avis
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ELECTRONIC RECEIPT (FACTURE) */}
      <AnimatePresence>
        {invoiceOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-700/60 backdrop-blur-sm"
              onClick={() => setInvoiceOrder(null)}
            />

            {/* Content card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100 font-mono text-xs text-slate-800 flex flex-col space-y-4"
            >
              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-slate-200 pb-4 space-y-1">
                <h3 className="font-bold text-sm text-slate-900">STUD'S App SARL</h3>
                <p className="text-[10px] text-slate-400">Ebolowa, Cameroun | RCCM : RC/EBL/2026/B/150</p>
                <p className="text-[10px] text-slate-400">Tél: +237 677 889 900 | contact@studs-app.com</p>
                <h4 className="font-bold text-xs text-slate-800 uppercase pt-2">FACTURE ÉLECTRONIQUE</h4>
                <p className="text-[9px] text-slate-500">N° {invoiceOrder.id.toUpperCase()}</p>
              </div>

              {/* Invoice details */}
              <div className="space-y-1 bg-slate-50 p-3 rounded-lg">
                <p className="text-[10px]"><span className="text-slate-400">DATE:</span> {new Date(invoiceOrder.createdAt).toLocaleString()}</p>
                <p className="text-[10px]"><span className="text-slate-400">CLIENT:</span> {invoiceOrder.clientName}</p>
                <p className="text-[10px]"><span className="text-slate-400">TÉL:</span> {invoiceOrder.clientPhone}</p>
                {invoiceOrder.providerName && (
                  <p className="text-[10px]"><span className="text-slate-400">ÉTUDIANT:</span> {invoiceOrder.providerName}</p>
                )}
              </div>

              {/* Line items table */}
              <div className="border-b border-dashed border-slate-200 pb-2">
                <div className="flex justify-between font-bold text-[10px] border-b border-slate-200 pb-1.5 uppercase text-slate-400">
                  <span>Désignation</span>
                  <span>Montant</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Prestation: {invoiceOrder.serviceTitle}</span>
                  <span>{invoiceOrder.servicePrice.toLocaleString()} FCFA</span>
                </div>
              </div>

              {/* Total Summary */}
              <div className="space-y-1 text-right">
                <p className="text-[10px] text-slate-400">MÉTHODE: <span className="uppercase text-slate-700 font-bold">{invoiceOrder.paymentMethod}</span></p>
                <p className="text-[10px] text-slate-400">STATUT TAXE: EXONÉRÉ (Réseau d'Économie Sociale)</p>
                <p className="text-sm font-bold text-slate-900">NET À PAYER : {invoiceOrder.servicePrice.toLocaleString()} FCFA</p>
              </div>

              <div className="text-center pt-2 text-[9px] text-slate-400 leading-normal">
                <p>Merci pour votre confiance en la jeunesse estudiantine camerounaise.</p>
                <p className="mt-1 font-serif italic text-blue-600">"Servir avec excellence aujourd'hui, c'est construire la confiance de demain."</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => downloadReceiptPdf(invoiceOrder)}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl font-sans text-xs transition-all flex items-center justify-center space-x-1 border border-slate-200/50 cursor-pointer shadow-sm border-slate-100/50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger PDF</span>
                </button>
                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl font-sans text-xs transition-all text-center border border-slate-300 cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* MODAL: LOYALTY REDEMPTION CONFIRMATION */}
      <AnimatePresence>
        {selectedRedeemService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-700/60 backdrop-blur-sm"
              onClick={() => setSelectedRedeemService(null)}
            />

            {/* Content card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200/60 flex flex-col z-10"
            >
              {/* Header */}
              <div className="bg-yellow-500 text-slate-950 p-5 border-b-2 border-slate-900">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-900">CONVERSION DE POINTS</p>
                  <span className="text-xs font-black bg-brand-900 text-yellow-400 px-2 py-0.5 rounded border border-slate-950">
                    💎 {Math.round(selectedRedeemService.price / loyaltyPointValue)} Points Requis
                  </span>
                </div>
                <h3 className="font-sans font-black text-lg mt-1">Échanger contre : {selectedRedeemService.title}</h3>
                <p className="text-xs text-slate-800 mt-1">{selectedRedeemService.description}</p>
              </div>

              {/* Form body */}
              <form onSubmit={handleRedeemSubmit} className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
                <div className="bg-slate-50 border-2 border-slate-950 rounded-xl p-3 text-xs text-slate-700 leading-normal space-y-1 font-sans">
                  <p className="font-bold text-slate-900">ℹ️ Règle de fidélité :</p>
                  <p>Votre quota de points sera automatiquement réduit de <strong className="text-yellow-600 font-mono font-bold">{Math.round(selectedRedeemService.price / loyaltyPointValue)} points</strong> dès la validation de cette demande.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-700 block">Date de passage</label>
                    <input
                      type="date"
                      required
                      value={redeemDate}
                      onChange={e => setRedeemDate(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-200/60 rounded-xl font-bold bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {/* Time */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-700 block">Heure souhaitée</label>
                    <input
                      type="time"
                      required
                      value={redeemTime}
                      onChange={e => setRedeemTime(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-200/60 rounded-xl font-mono bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                {/* Neighborhood select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-700 block">Quartier à Ebolowa</label>
                  <select
                    value={redeemNeighborhood}
                    onChange={e => setRedeemNeighborhood(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200/60 rounded-xl font-bold bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Mekalat">Mekalat</option>
                    <option value="John Holt">John Holt</option>
                    <option value="Angalé">Angalé</option>
                    <option value="Ebolowa Si 1">Ebolowa Si 1</option>
                    <option value="Nko'ovos">Nko'ovos</option>
                    <option value="New Bell">New Bell</option>
                    <option value="Somalco">Somalco</option>
                    <option value="Akon">Akon</option>
                  </select>
                </div>

                {/* Address Details */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-700 block">Précisions d'adresse / Repères physiques</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Face Boulangerie du Centre, à côté du carrefour"
                    value={redeemAddressDetails}
                    onChange={e => setRedeemAddressDetails(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-200/60 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-700 block">Remarques ou consignes spécifiques</label>
                  <textarea
                    placeholder="Ex: Apporter du matériel de nettoyage supplémentaire..."
                    rows={2}
                    value={redeemNotes}
                    onChange={e => setRedeemNotes(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-200/60 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
                  />
                </div>

                {/* Submit Row */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRedeemService(null)}
                    className="py-2 px-4 border border-slate-200/60 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isRedeeming}
                    className="py-2 px-5 bg-brand-700 hover:bg-brand-800 text-white font-black border border-slate-200/60 rounded-xl text-xs shadow-[2px_2px_0px_rgba(234,179,8,1)] transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    {isRedeeming ? 'Enregistrement...' : 'Confirmer le Service Gratuit 🎁'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: STUDENT PROVIDER DETAIL PROFILE & MISSION HISTORY */}
      <AnimatePresence>
        {selectedProviderId && (() => {
          const selectedProv = users.find(u => u.id === selectedProviderId);
          if (!selectedProv) return null;

          // Compute dynamics
          const provCompletedOrders = orders.filter(o => (o.providerId === selectedProviderId || o.providerName === `${selectedProv.firstName} ${selectedProv.lastName}`) && o.status === 'completed');
          const provRatings = provCompletedOrders.filter(o => o.rating);
          const provAvgRating = provRatings.length > 0
            ? (provRatings.reduce((sum, o) => sum + (o.rating || 0), 0) / provRatings.length).toFixed(1)
            : '4.8';

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-brand-700/60 backdrop-blur-sm"
                onClick={() => setSelectedProviderId(null)}
              />

              {/* Content Card */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200/60 flex flex-col z-10 font-sans"
              >
                {/* Header Profile Photo */}
                <div className="bg-brand-700 text-white p-6 relative overflow-hidden border-b-2 border-slate-900">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-10 -mt-10 blur-xl" />
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4.5 relative z-10">
                    <img 
                      src={selectedProv.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(selectedProv.firstName)}`}
                      className="w-20 h-20 rounded-full border-4 border-amber-500 object-cover bg-white shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-center sm:text-left space-y-1">
                      <span className="px-2.5 py-0.5 text-[9px] bg-amber-500 text-slate-950 rounded font-black tracking-widest uppercase border border-amber-400">
                        Étudiant Prestataire Certifié 🎓
                      </span>
                      <h3 className="font-extrabold text-xl tracking-tight text-white">{selectedProv.firstName} {selectedProv.lastName}</h3>
                      <p className="text-slate-300 text-xs font-mono">{selectedProv.phone} • {selectedProv.email}</p>
                    </div>
                  </div>
                </div>

                {/* Biography & Performance Metrics */}
                <div className="p-5 space-y-5 max-h-[420px] overflow-y-auto">
                  {/* Bento Performance Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bento-card bg-amber-50/20 border-amber-500/40 p-3.5 text-center flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider font-mono">Performance Moyenne</span>
                      <div className="flex items-center space-x-1 mt-1.5">
                        <span className="text-yellow-500 text-2xl">★</span>
                        <span className="text-2xl font-black text-slate-900 font-mono">{provAvgRating}</span>
                        <span className="text-xs text-slate-400 font-bold">/5</span>
                      </div>
                      <p className="text-[9px] text-slate-500 italic mt-1">Sur {provRatings.length} évaluations clients</p>
                    </div>

                    <div className="bento-card p-3.5 text-center flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider font-mono">Missions Complétées</span>
                      <span className="text-3xl font-black text-slate-900 mt-1 font-mono">{provCompletedOrders.length}</span>
                      <p className="text-[9px] text-slate-500 italic mt-1.5">Pool de services d'Ebolowa</p>
                    </div>
                  </div>

                  {/* About the Student */}
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">À propos du prestataire</h4>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 border border-slate-200/60 rounded-xl">
                      Cet intervenant fait partie du collectif étudiant d'Ebolowa certifié STUD'S. Chaque prestation contribue à financer directement son cursus académique tout en maintenant des standards élevés de ponctualité, d'éthique verte et de qualité de service.
                    </p>
                  </div>

                  {/* Historical Missions list */}
                  <div className="space-y-2.5">
                    <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">Historique des missions à domicile</h4>
                    
                    {provCompletedOrders.length === 0 ? (
                      <div className="text-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-xs font-bold text-slate-500">Première série de prestations !</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Cet étudiant démarre son aventure. Laissez-lui un avis après sa visite !</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {provCompletedOrders.map(completedOrd => (
                          <div 
                            key={`hist-${completedOrd.id}`}
                            className="bg-white border border-slate-200/60 p-2.5 rounded-xl text-xs flex flex-col gap-1.5 hover:bg-slate-50/50"
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-extrabold text-slate-900">{completedOrd.serviceTitle}</span>
                              <span className="text-[9px] font-mono text-slate-400 font-bold">{completedOrd.scheduledDate}</span>
                            </div>
                            
                            {completedOrd.rating && (
                              <div className="flex items-center space-x-1 bg-yellow-50 border border-yellow-200 px-1.5 py-0.5 rounded-lg w-fit">
                                <span className="text-yellow-500 text-[10px]">★</span>
                                <span className="font-mono text-[9px] font-bold text-yellow-900">{completedOrd.rating} / 5</span>
                              </div>
                            )}

                            {completedOrd.ratingComment && (
                              <p className="text-[10px] text-slate-600 italic bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                                "{completedOrd.ratingComment}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setSelectedProviderId(null)}
                    className="w-full py-2 bg-brand-700 hover:bg-brand-800 text-white font-black border border-slate-200/60 rounded-xl text-xs uppercase tracking-wider cursor-pointer text-center"
                  >
                    Fermer la Fiche
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Manual Validation Feedback Modal */}
      <AnimatePresence>
        {(validationSuccessMsg || validationErrorMsg) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-brand-700/60 backdrop-blur-sm" 
              onClick={() => {
                setValidationSuccessMsg(null);
                setValidationErrorMsg(null);
              }} 
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200/80 space-y-4 text-center z-10"
            >
              <div className={`w-12 h-12 rounded-2xl border border-slate-200/60 flex items-center justify-center mx-auto shadow-sm ${
                validationSuccessMsg ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {validationSuccessMsg ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>

              <div>
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">
                  {validationSuccessMsg ? "Validation Réussie !" : "Oups ! Erreur"}
                </h3>
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed font-medium">
                  {validationSuccessMsg || validationErrorMsg}
                </p>
              </div>

              <button
                onClick={() => {
                  setValidationSuccessMsg(null);
                  setValidationErrorMsg(null);
                }}
                className="w-full py-2 bg-brand-700 hover:bg-brand-800 text-white font-black border border-slate-200/60 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                Super, merci !
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AleneWidget />
    </div>
  );
};
