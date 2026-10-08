/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'client' | 'provider' | 'admin' | 'supervisor';

export interface ProviderAvailability {
  id: string;
  day: string;       // e.g. "Lundi", "Mardi", "2026-07-08", "Tous les jours"
  timeSlot: string;  // e.g. "08:00 - 12:00", "Après-midi", "Soirée", "Toute la journée"
  isAvailable: boolean; // true = Available, false = Busy
  notes?: string;    // e.g. "Cours de physique à l'IUT d'Ebolowa", "Sauf imprévu"
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  balance: number; // in FCFA
  loyaltyPoints: number;
  nfcCardId?: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  birthDate?: string;
  availabilities?: ProviderAvailability[];
  commissionOwed?: number; // FCFA dus à STUD'S (paiements en espèces)
}

export type ServiceCategory = 'domestic' | 'logistics' | 'education' | 'immobilier' | 'custom';

export interface Service {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  price: number; // in FCFA
  unit: 'heure' | 'prestation' | 'm²';
  rating: number;
  reviewsCount: number;
  imageUrl?: string;
  iconName: string; // Lucide icon identifier
}

export type OrderStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  providerId?: string;
  providerName?: string;
  providerPhone?: string;
  serviceId: string;
  serviceTitle: string;
  servicePrice: number;
  category: ServiceCategory;
  status: OrderStatus;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  notes?: string;
  paymentMethod: 'momo' | 'cash' | 'points' | 'card';
  paymentStatus: 'pending' | 'declared' | 'rejected' | 'paid';
  paymentDeclaration?: {
    operator: 'mtn' | 'orange' | 'cash';
    reference?: string;
    payerPhone?: string;
    declaredAt: string;
  };
  paymentRejectedReason?: string;
  paidAt?: string;
  paymentConfirmedBy?: string;
  settled?: boolean;
  rating?: number;
  comment?: string;
  isSignaled?: boolean;
  ratingHidden?: boolean;
  createdAt: string;
  updatedAt: string;
  validatedByNfc?: boolean;
  isOfflinePending?: boolean;
  tutoringSection?: 'francophone' | 'anglophone';
  tutoringSeries?: 'general' | 'A' | 'C' | 'D' | 'TI';
  tutoringClass?: 'primaire' | 'college' | 'lycee' | 'universite';
  billingFrequency?: 'one_off' | 'weekly' | 'monthly';
  realEstatePropertyId?: string;
  realEstatePropertyName?: string;
  hasNfcCard?: boolean;
  nfcPriority?: boolean;
}

export interface NfcCard {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  loyaltyPoints: number;
  status: 'active' | 'blocked';
  issuedAt: string;
  lastScannedAt?: string;
  scansCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  createdAt: string;
}

export interface FinancialReport {
  totalRevenue: number;
  providerPayouts: number;
  platformCommission: number; // 30%
  netMargin: number;
  monthlyStats: { month: string; revenue: number; ordersCount: number }[];
  categoryStats: { category: ServiceCategory; revenue: number; count: number }[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  message: string;
  createdAt: string;
  channelId: string; // 'general' or 'direct_usr-xxx'
}
