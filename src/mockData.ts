import { User, Service, Order, NfcCard, Notification } from './types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-001',
    title: 'Lessive & Repassage',
    description: 'Lavage délicat à la main ou machine, repassage soigné de vos vêtements et pliage professionnel à domicile.',
    category: 'domestic',
    price: 5000,
    unit: 'prestation',
    rating: 4.8,
    reviewsCount: 34,
    iconName: 'WashingMachine'
  },
  {
    id: 'srv-002',
    title: 'Ménage à domicile',
    description: 'Nettoyage complet de vos pièces, dépoussiérage, lavage des sols et rangement optimal pour un intérieur frais.',
    category: 'domestic',
    price: 5000,
    unit: 'prestation',
    rating: 4.6,
    reviewsCount: 42,
    iconName: 'Sparkles'
  },
  {
    id: 'srv-003',
    title: 'Déménagement & Manutention',
    description: 'Aide active pour emballer, transporter, charger et installer vos cartons et mobiliers en toute sécurité.',
    category: 'logistics',
    price: 5000,
    unit: 'prestation',
    rating: 4.9,
    reviewsCount: 28,
    iconName: 'Truck'
  },
  {
    id: 'srv-004',
    title: 'Courses & Commissions',
    description: "Achat de vos provisions au marché (Marché Central, Nko'ovos), livraisons de colis urgents ou démarches administratives simples.",
    category: 'logistics',
    price: 5000,
    unit: 'prestation',
    rating: 4.7,
    reviewsCount: 19,
    iconName: 'ShoppingBag'
  },
  {
    id: 'srv-005',
    title: 'Cours de répétition',
    description: 'Soutien scolaire sur-mesure pour élèves du primaire au lycée en Mathématiques, Physiques, Français ou Anglais.',
    category: 'education',
    price: 5000,
    unit: 'prestation',
    rating: 4.9,
    reviewsCount: 56,
    iconName: 'GraduationCap'
  },
  {
    id: 'srv-006',
    title: 'Aide à la recherche de logement',
    description: "Prospection physique de studios, appartements ou chambres étudiantes à Ebolowa selon vos critères et budget.",
    category: 'immobilier',
    price: 5000,
    unit: 'prestation',
    rating: 4.4,
    reviewsCount: 15,
    iconName: 'Home'
  },
  {
    id: 'srv-007',
    title: 'Visite immobilière par procuration',
    description: "Rapport complet avec photos, vidéos haute définition et vérification du voisinage d'un logement ciblé.",
    category: 'immobilier',
    price: 5000,
    unit: 'prestation',
    rating: 4.5,
    reviewsCount: 11,
    iconName: 'Eye'
  },
  {
    id: 'srv-008',
    title: 'Assistance événementielle',
    description: "Service d'accueil, installation de matériel, soutien en cuisine et logistique lors de vos réceptions et fêtes.",
    category: 'custom',
    price: 5000,
    unit: 'prestation',
    rating: 4.8,
    reviewsCount: 22,
    iconName: 'PartyPopper'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    firstName: 'Boris',
    lastName: 'MENGUE',
    email: 'borisleroymenguealo@gmail.com',
    phone: '+237 677 889 900',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150',
    balance: 0,
    loyaltyPoints: 1200,
    status: 'active',
    createdAt: '2026-01-15T08:30:00Z'
  },
  {
    id: 'usr-client-demo',
    firstName: 'Aline',
    lastName: 'NGO',
    email: 'aline.ngo@gmail.com',
    phone: '+237 655 443 322',
    role: 'client',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    balance: 0,
    loyaltyPoints: 340,
    status: 'active',
    createdAt: '2026-02-10T10:15:00Z'
  },
  {
    id: 'usr-provider-demo',
    firstName: 'Arnaud',
    lastName: 'NGASSA',
    email: 'arnaud.ngassa@gmail.com',
    phone: '+237 699 887 766',
    role: 'provider',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    balance: 0,
    loyaltyPoints: 50,
    status: 'active',
    createdAt: '2026-03-01T14:20:00Z'
  }
];

export const INITIAL_CARDS: NfcCard[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];
