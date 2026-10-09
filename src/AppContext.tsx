/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Service, Order, NfcCard, Notification, FinancialReport, UserRole, ServiceCategory, ChatMessage, ProviderAvailability } from './types';
import { INITIAL_SERVICES, INITIAL_USERS, INITIAL_CARDS, INITIAL_ORDERS, INITIAL_NOTIFICATIONS } from './mockData';
import { apiFetch as fetch, setToken, clearSession, getToken } from './lib/api';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  services: Service[];
  orders: Order[];
  cards: NfcCard[];
  notifications: Notification[];
  distributionMode: 'manual' | 'automatic';
  setDistributionMode: (mode: 'manual' | 'automatic') => void;
  setCurrentUserRole: (role: UserRole) => void;
  refreshState: () => Promise<void>;
  createOrder: (orderData: Omit<Order, 'id' | 'clientId' | 'clientName' | 'clientPhone' | 'status' | 'createdAt' | 'updatedAt' | 'paymentStatus'> & { clientId?: string; customClientName?: string; customClientPhone?: string }) => void;
  assignOrder: (orderId: string, providerId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  validateOrderWithNfc: (cardId: string, orderId: string, serial?: string) => Promise<{ success: boolean; message: string }>;
  validateOrderManually: (orderId: string, status: 'in_progress' | 'completed') => Promise<{ success: boolean; message: string }>;
  rateOrder: (orderId: string, rating: number, comment: string) => void;
  addNotification: (userId: string, title: string, message: string, type: Notification['type']) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: (userId: string) => void;
  updateUserBalance: (userId: string, amount: number) => void;
  issueNfcCard: (userId: string) => void;
  resetAllData: () => void;
  getFinancialReport: () => FinancialReport;
  registerUser: (userData: { firstName: string; lastName: string; phone: string; email: string; birthDate: string; role: 'client' | 'provider'; avatar?: string; password: string }) => Promise<{ success: boolean; message: string; user?: User }>;
  loginUser: (emailOrPhone: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  logoutUser: () => void;
  approveProvider: (userId: string) => void;
  rejectProvider: (userId: string) => void;
  updateProviderAvailability: (userId: string, availabilities: ProviderAvailability[]) => Promise<{ success: boolean; message: string }>;
  signalOrder: (orderId: string) => Promise<void>;
  moderateRating: (orderId: string, updates: { rating?: number; comment?: string; ratingHidden?: boolean }) => Promise<void>;
  isOnline: boolean;
  connectivityMode: 'online' | 'unstable' | 'offline';
  setConnectivityMode: (mode: 'online' | 'unstable' | 'offline') => void;
  syncOfflineQueue: () => void;
  offlineQueueCount: number;
  loyaltyPointsRate: number;
  setLoyaltyPointsRate: (rate: number) => void;
  loyaltyPointValue: number;
  nfcPointsMultiplier: number;
  setLoyaltyPointValue: (value: number) => void;
  activeApp: 'client' | 'provider' | 'admin';
  setActiveApp: (app: 'client' | 'provider' | 'admin') => void;
  redeemService: (clientId: string, serviceId: string, scheduledDate: string, scheduledTime: string, address: string, notes: string) => Promise<{ success: boolean; message: string }>;
  registerDirector: (directorData: { firstName: string; lastName: string; phone: string; email: string; grade: string; avatar?: string; allowedTabs?: string[] }) => Promise<{ success: boolean; message: string }>;
  updateDirectorTabs: (id: string, allowedTabs: string[], status?: 'active' | 'suspended', grade?: string) => Promise<{ success: boolean; message: string }>;
  deleteDirector: (id: string) => Promise<{ success: boolean; message: string }>;
  logAssistantActivity: (action: string) => Promise<void>;
  fetchAssistantLogs: () => Promise<any[]>;
  momoConfigs: any;
  momoLogs: any[];
  loadMomoConfigs: () => Promise<void>;
  loadMomoLogs: () => Promise<void>;
  saveMomoConfig: (provider: 'mtn' | 'orange', config: any) => Promise<{ success: boolean; message: string }>;
  testMomoConnection: (provider: 'mtn' | 'orange') => Promise<{ success: boolean; message: string; data?: any }>;
  requestMomoPayment: (provider: 'mtn' | 'orange', phone: string, amount: number, userId: string, orderId?: string) => Promise<{ success: boolean; simulated?: boolean; message: string; data?: any }>;
  chatMessages: ChatMessage[];
  sendChatMessage: (message: string, channelId: string) => Promise<{ success: boolean; error?: string }>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cards, setCards] = useState<NfcCard[]>(INITIAL_CARDS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [momoConfigs, setMomoConfigs] = useState<any>(null);
  const [momoLogs, setMomoLogs] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('studs_theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('studs_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    // Sans jeton de session valide, on ne restaure aucune identité
    return getToken() ? localStorage.getItem('studs_current_user_id') : null;
  });

  const currentUserIdRef = useRef(currentUserId);
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  // Sync session variables in localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('studs_current_user_id', currentUser.id);
      localStorage.setItem('studs_current_user_email', currentUser.email || '');
      localStorage.setItem('studs_current_user_role', currentUser.role || '');
    } else {
      localStorage.removeItem('studs_current_user_id');
      localStorage.removeItem('studs_current_user_email');
      localStorage.removeItem('studs_current_user_role');
    }
  }, [currentUser]);

  // Sync currentUser with currentUserId from local list immediately (for offline/instant loading)
  useEffect(() => {
    if (currentUserId) {
      const found = users.find(u => u.id === currentUserId);
      if (found) {
        setCurrentUser(found);
      }
    } else {
      setCurrentUser(null);
    }
  }, [currentUserId, users]);

  // Auto login QR visitors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isQr = params.get('qr') === 'ebolowa' || params.get('qr_access') === 'true';
      if (isQr) {
        localStorage.setItem('studs_qr_scanned', 'true');
        
        const silentAutoLogin = async () => {
          try {
            const res = await fetch('/api/auth/guest', { method: 'POST' });
            const data = await res.json();
            if (res.ok && data.success && data.user) {
              setToken(data.token);
              setCurrentUserId(data.user.id);
              localStorage.setItem('studs_current_user_id', data.user.id);
              localStorage.setItem('studs_active_app', 'client');
              setActiveAppState('client');
            }
          } catch (e) {
            console.error("Silent QR login failed:", e);
          }
        };

        silentAutoLogin();
      }
    }
  }, []);

  const [distributionMode, setDistributionModeState] = useState<'manual' | 'automatic'>('manual');
  const [connectivityMode, setConnectivityModeState] = useState<'online' | 'unstable' | 'offline'>(() => {
    return (localStorage.getItem('studs_connectivity_mode') as 'online' | 'unstable' | 'offline') || 'online';
  });

  const [activeApp, setActiveAppState] = useState<'client' | 'provider' | 'admin'>(() => {
    return (localStorage.getItem('studs_active_app') as 'client' | 'provider' | 'admin') || 'client';
  });

  const [loyaltyPointsRate, setLoyaltyPointsRateState] = useState<number>(10);
  const [loyaltyPointValue, setLoyaltyPointValueState] = useState<number>(5);
  const [nfcPointsMultiplier, setNfcPointsMultiplier] = useState<number>(1.5);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Local Offline Queue (to persist offline orders while backend is unreachable)
  const [offlineOrdersQueue, setOfflineOrdersQueue] = useState<Order[]>(() => {
    const saved = localStorage.getItem('studs_offline_orders_queue');
    return saved ? JSON.parse(saved) : [];
  });

  const isFirstLoad = useRef(true);

  // Save offline queue to LocalStorage
  useEffect(() => {
    localStorage.setItem('studs_offline_orders_queue', JSON.stringify(offlineOrdersQueue));
  }, [offlineOrdersQueue]);

  // Handle connectivity states
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setConnectivityMode = (mode: 'online' | 'unstable' | 'offline') => {
    setConnectivityModeState(mode);
    localStorage.setItem('studs_connectivity_mode', mode);
  };

  const setActiveApp = (app: 'client' | 'provider' | 'admin') => {
    setActiveAppState(app);
    localStorage.setItem('studs_active_app', app);
  };

  const loadMomoConfigs = async () => {
    if (connectivityMode === 'offline') return;
    // Safety check: Only query the private configs if logged in as the master admin (DG Boris MENGUE)
    if (!currentUser?.isMaster) return;

    try {
      const res = await fetch('/api/momo-api/config');
      if (res.ok) {
        const data = await res.json();
        setMomoConfigs(data);
      }
    } catch (e) {
      console.error('Error fetching MoMo configs:', e);
    }
  };

  const loadMomoLogs = async () => {
    if (connectivityMode === 'offline') return;
    // Safety check: Only query the private logs if logged in as the master admin (DG Boris MENGUE)
    if (!currentUser?.isMaster) return;

    try {
      const res = await fetch('/api/momo-api/logs');
      if (res.ok) {
        const data = await res.json();
        setMomoLogs(data.logs);
      }
    } catch (e) {
      console.error('Error fetching MoMo logs:', e);
    }
  };

  // Sync state from Express backend API
  const fetchStateFromServer = async () => {
    if (connectivityMode === 'offline') return;
    if (!getToken()) return; // pas de session : rien à synchroniser

    try {
      const response = await fetch('/api/state');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setServices(data.services);
        setOrders([...offlineOrdersQueue, ...data.orders]); // Prepend offline pending orders locally
        setCards(data.cards);
        setNotifications(data.notifications);
        setLoyaltyPointsRateState(data.loyaltyPointsRate);
        setLoyaltyPointValueState(data.loyaltyPointValue);
        if (data.nfcPointsMultiplier !== undefined) setNfcPointsMultiplier(data.nfcPointsMultiplier);
        setDistributionModeState(data.distributionMode);
        if (data.chatMessages) {
          setChatMessages(data.chatMessages);
        }

        // Update current user state dynamically
        const latestId = currentUserIdRef.current;
        if (latestId) {
          const found = data.users.find((u: any) => u.id === latestId);
          if (found) {
            setCurrentUser(found);
          } else {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }

        // Fetch MoMo Configs and logs concurrently
        loadMomoConfigs();
        loadMomoLogs();
      }
    } catch (e) {
      console.warn('Unable to sync state with the server:', e);
    }
  };

  // Poll server state every 4 seconds when online
  useEffect(() => {
    fetchStateFromServer();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchStateFromServer();
    }, 5000);

    return () => clearInterval(interval);
  }, [connectivityMode, currentUserId, offlineOrdersQueue]);

  const setDistributionMode = async (mode: 'manual' | 'automatic') => {
    setDistributionModeState(mode);
    if (connectivityMode !== 'offline') {
      try {
        await fetch('/api/admin/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ distributionMode: mode }),
        });
      } catch (e) {
        console.error('Error setting distribution mode', e);
      }
    }
  };

  const setLoyaltyPointsRate = async (rate: number) => {
    setLoyaltyPointsRateState(rate);
    if (connectivityMode !== 'offline') {
      try {
        await fetch('/api/admin/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ loyaltyPointsRate: rate }),
        });
      } catch (e) {
        console.error('Error setting points rate', e);
      }
    }
  };

  const setLoyaltyPointValue = async (value: number) => {
    setLoyaltyPointValueState(value);
    if (connectivityMode !== 'offline') {
      try {
        await fetch('/api/admin/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ loyaltyPointValue: value }),
        });
      } catch (e) {
        console.error('Error setting point value', e);
      }
    }
  };

  // Sync offline queue orders to backend
  const syncOfflineQueue = async () => {
    if (offlineOrdersQueue.length === 0) return;
    if (connectivityMode === 'offline') {
      alert("Impossible de synchroniser en mode hors-ligne. Veuillez d'abord rétablir le réseau.");
      return;
    }

    const remainingQueue: Order[] = [];
    let successCount = 0;

    for (const offlineOrder of offlineOrdersQueue) {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...offlineOrder,
            isOfflinePending: undefined,
          }),
        });
        if (res.ok) {
          successCount++;
        } else {
          remainingQueue.push(offlineOrder);
        }
      } catch (e) {
        remainingQueue.push(offlineOrder);
      }
    }

    setOfflineOrdersQueue(remainingQueue);
    await fetchStateFromServer();

    if (successCount > 0) {
      alert(`⚡ [Mode Réseau Rétabli] ${successCount} commande(s) sauvegardée(s) hors-ligne ont été synchronisées et soumises avec succès au serveur STUD'S !`);
    }
  };

  const offlineQueueCount = offlineOrdersQueue.length;

  const setCurrentUserRole = (role: UserRole) => {
    // Sécurité : on ne change plus de compte sans authentification.
    // On autorise seulement le changement de vue pour les comptes administrateurs.
    if (!currentUser) return;
    if (role === 'client' || role === 'provider') {
      if (currentUser.role === 'admin' || currentUser.role === 'supervisor') {
        setActiveAppState(role);
        localStorage.setItem('studs_active_app', role);
      }
    } else if (currentUser.role === 'admin' || currentUser.role === 'supervisor') {
      setActiveAppState('admin');
      localStorage.setItem('studs_active_app', 'admin');
    }
  };

  // Real user sign up connected to Express
  const registerUser = async (userData: { firstName: string; lastName: string; phone: string; email: string; birthDate: string; role: 'client' | 'provider'; avatar?: string; password: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) setToken(data.token);
        await fetchStateFromServer();
        if (userData.role === 'client') {
          // Log client in automatically after sign up
          setCurrentUserId(data.user.id);
          localStorage.setItem('studs_current_user_id', data.user.id);
          setCurrentUser(data.user);
          setActiveAppState('client');
          localStorage.setItem('studs_active_app', 'client');
        } else if (userData.role === 'provider') {
          // Providers go to provider view upon sign up (pending approval)
          setCurrentUserId(data.user.id);
          localStorage.setItem('studs_current_user_id', data.user.id);
          setCurrentUser(data.user);
          setActiveAppState('provider');
          localStorage.setItem('studs_active_app', 'provider');
        }
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.message || 'Une erreur est survenue lors de l\'inscription.' };
      }
    } catch (e) {
      return { success: false, message: "Impossible de joindre le serveur STUD'S. Vérifiez votre connexion Internet." };
    }
  };

  // Real user login connected to Express
  const loginUser = async (emailOrPhone: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.token);
        setCurrentUserId(data.user.id);
        localStorage.setItem('studs_current_user_id', data.user.id);
        setCurrentUser(data.user);
        
        // Instant routing based on authenticated user role
        if (data.user.role === 'client') {
          setActiveAppState('client');
          localStorage.setItem('studs_active_app', 'client');
        } else if (data.user.role === 'provider') {
          setActiveAppState('provider');
          localStorage.setItem('studs_active_app', 'provider');
        } else if (data.user.role === 'admin' || data.user.role === 'supervisor') {
          setActiveAppState('admin');
          localStorage.setItem('studs_active_app', 'admin');
        }

        await fetchStateFromServer();
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.message || 'Identifiants incorrects.' };
      }
    } catch (e) {
      return { success: false, message: "Impossible de joindre le serveur STUD'S. Vérifiez votre connexion Internet." };
    }
  };

  const logoutUser = () => {
    clearSession();
    setCurrentUserId(null);
    setCurrentUser(null);
    setUsers([]);
    setOrders([]);
    setCards([]);
    setNotifications([]);
    setChatMessages([]);
  };

  // Session expirée (jeton invalide) : retour à l'écran de connexion
  useEffect(() => {
    const onExpired = () => {
      setCurrentUserId(null);
      setCurrentUser(null);
    };
    window.addEventListener('studs:session-expired', onExpired);
    return () => window.removeEventListener('studs:session-expired', onExpired);
  }, []);

  const approveProvider = async (userId: string) => {
    if (connectivityMode === 'offline') return;
    try {
      await fetch('/api/admin/approve-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      await fetchStateFromServer();
    } catch (e) {
      console.error('Error approving provider', e);
    }
  };

  const rejectProvider = async (userId: string) => {
    if (connectivityMode === 'offline') return;
    try {
      await fetch('/api/admin/reject-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      await fetchStateFromServer();
    } catch (e) {
      console.error('Error rejecting provider', e);
    }
  };

  const updateProviderAvailability = async (userId: string, availabilities: ProviderAvailability[]) => {
    if (connectivityMode === 'offline') {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, availabilities } : u));
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, availabilities } : null);
      }
      return { success: true, message: 'Disponibilités enregistrées localement (Hors-ligne)' };
    }
    try {
      const res = await fetch('/api/provider/update-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, availabilities }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchStateFromServer();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Erreur lors de la mise à jour.' };
      }
    } catch (e) {
      console.error('Error updating provider availability', e);
      return { success: false, message: 'Erreur réseau.' };
    }
  };

  // Notifications APIs
  const addNotification = async (userId: string, title: string, message: string, type: Notification['type']) => {
    // Sent via client-side trigger or handled server-side. For compatibility:
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (connectivityMode !== 'offline') {
      try {
        await fetch('/api/notifications/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
      } catch (e) {
        console.error('Error reading notification', e);
      }
    }
  };

  const clearNotifications = async (userId: string) => {
    setNotifications(prev => prev.filter(n => n.userId !== userId));
    if (connectivityMode !== 'offline') {
      try {
        await fetch('/api/notifications/clear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
      } catch (e) {
        console.error('Error clearing notifications', e);
      }
    }
  };

  // Account wallet balances
  const updateUserBalance = async (userId: string, amount: number) => {
    // Handled in backend, but optimistically updated locally
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: Math.max(0, u.balance + amount) } : u));
    
    if (connectivityMode !== 'offline') {
      // Custom endpoint or trigger recharge
      // Let's recharge via admin or mock API
      try {
        await fetch('/api/admin/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ balanceUpdate: { userId, amount } }),
        });
        await fetchStateFromServer();
      } catch (e) {
        console.error('Error updating balance on server', e);
      }
    }
  };

  // Issue intelligent NFC card
  const issueNfcCard = async (userId: string) => {
    if (connectivityMode === 'offline') return;
    try {
      const res = await fetch('/api/cards/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchStateFromServer();
        alert(`💳 ${data.message}`);
      }
    } catch (e) {
      console.error('Error issuing card', e);
    }
  };

  // Real order creation
  const createOrder = async (orderData: Omit<Order, 'id' | 'clientId' | 'clientName' | 'clientPhone' | 'status' | 'createdAt' | 'updatedAt' | 'paymentStatus'> & { clientId?: string; customClientName?: string; customClientPhone?: string }) => {
    const isGuest = !!orderData.customClientName;
    const clientId = orderData.clientId || (isGuest ? 'cli-guest' : (currentUser ? currentUser.id : 'unknown'));

    const clientUser = orderData.clientId ? users.find(u => u.id === orderData.clientId) : null;
    const clientName = orderData.customClientName || (clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : (currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Anonyme'));
    const clientPhone = orderData.customClientPhone || (clientUser ? clientUser.phone : (currentUser ? currentUser.phone : ''));

    const tempOrder: Order = {
      ...orderData,
      id: `cmd-temp-${Date.now()}`,
      clientId,
      clientName,
      clientPhone,
      status: orderData.providerId ? 'assigned' : 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOfflinePending: connectivityMode === 'offline' ? true : undefined
    };

    // If offline, add to offline queue
    if (connectivityMode === 'offline') {
      setOfflineOrdersQueue(prev => [tempOrder, ...prev]);
      setOrders(prev => [tempOrder, ...prev]);
      return;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          clientId,
          customClientName: orderData.customClientName || (clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : undefined),
          customClientPhone: orderData.customClientPhone || (clientUser ? clientUser.phone : undefined),
        }),
      });
      if (res.ok) {
        await fetchStateFromServer();
      } else {
        // Fallback to queue if server is down
        setOfflineOrdersQueue(prev => [tempOrder, ...prev]);
        setOrders(prev => [tempOrder, ...prev]);
      }
    } catch (e) {
      setOfflineOrdersQueue(prev => [tempOrder, ...prev]);
      setOrders(prev => [tempOrder, ...prev]);
    }
  };

  const assignOrder = async (orderId: string, providerId: string) => {
    if (connectivityMode === 'offline') return;
    try {
      await fetch(`/api/orders/${orderId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId }),
      });
      await fetchStateFromServer();
    } catch (e) {
      console.error('Error assigning order', e);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (connectivityMode === 'offline') return;
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await fetchStateFromServer();
    } catch (e) {
      console.error('Error updating order status', e);
    }
  };

  const validateOrderWithNfc = async (cardId: string, orderId: string, serial?: string) => {
    if (connectivityMode === 'offline') {
      return { success: false, message: "Impossible de valider par NFC en mode hors-ligne." };
    }
    try {
      const res = await fetch(`/api/orders/${orderId}/nfc-validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cardId, serial }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchStateFromServer();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Échec de la validation NFC.' };
      }
    } catch (e) {
      return { success: false, message: 'Le serveur est inaccessible pour certifier le NFC.' };
    }
  };

  const validateOrderManually = async (orderId: string, status: 'in_progress' | 'completed') => {
    if (connectivityMode === 'offline') {
      return { success: false, message: "Impossible de valider manuellement en mode hors-ligne." };
    }
    try {
      const res = await fetch(`/api/orders/${orderId}/manual-validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, clientId: currentUser?.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchStateFromServer();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Échec de la validation manuelle.' };
      }
    } catch (e) {
      return { success: false, message: 'Le serveur est inaccessible pour valider la prestation.' };
    }
  };

  const rateOrder = async (orderId: string, rating: number, comment: string) => {
    if (connectivityMode === 'offline') return;
    try {
      await fetch(`/api/orders/${orderId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      await fetchStateFromServer();
    } catch (e) {
      console.error('Error rating order', e);
    }
  };

  const resetAllData = async () => {
    try {
      const res = await fetch('/api/reset-data', { method: 'POST' });
      if (res.ok) {
        setOfflineOrdersQueue([]);
        localStorage.removeItem('studs_offline_orders_queue');
        await fetchStateFromServer();
        alert('Base de données réinitialisée avec succès !');
      }
    } catch (e) {
      console.error('Error resetting server data', e);
    }
  };

  const sendChatMessage = async (message: string, channelId: string) => {
    if (!currentUser) return { success: false, error: 'Vous devez être connecté.' };
    
    try {
      const payload = {
        senderId: currentUser.id,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        senderRole: currentUser.role,
        senderAvatar: currentUser.avatar,
        message,
        channelId
      };

      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.chatMessages) {
            setChatMessages(data.chatMessages);
          }
          return { success: true };
        } else {
          return { success: false, error: data.message };
        }
      } else {
        return { success: false, error: 'Erreur réseau lors de l\'envoi.' };
      }
    } catch (e: any) {
      console.error('Error sending chat message:', e);
      return { success: false, error: e.message || 'Une erreur inattendue est survenue.' };
    }
  };

  const getFinancialReport = (): FinancialReport => {
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((acc, o) => acc + o.servicePrice, 0);
    const platformCommission = Math.floor(totalRevenue * 0.3);
    const providerPayouts = totalRevenue - platformCommission;

    const monthlyStats = [
      { month: 'Mars', revenue: 75000, ordersCount: 18 },
      { month: 'Avril', revenue: 110000, ordersCount: 25 },
      { month: 'Mai', revenue: 145000, ordersCount: 32 },
      { month: 'Juin (Actuel)', revenue: totalRevenue, ordersCount: completedOrders.length }
    ];

    const categories: ServiceCategory[] = ['domestic', 'logistics', 'education', 'immobilier', 'custom'];
    const categoryStats = categories.map(cat => {
      const catOrders = completedOrders.filter(o => o.category === cat);
      const rev = catOrders.reduce((acc, o) => acc + o.servicePrice, 0);
      return {
        category: cat,
        revenue: rev,
        count: catOrders.length
      };
    });

    return {
      totalRevenue,
      providerPayouts,
      platformCommission,
      netMargin: platformCommission,
      monthlyStats,
      categoryStats
    };
  };

  const signalOrder = async (orderId: string) => {
    if (connectivityMode === 'offline') return;
    try {
      await fetch(`/api/orders/${orderId}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      await fetchStateFromServer();
    } catch (e) {
      console.error('Error signaling order', e);
    }
  };

  const moderateRating = async (orderId: string, updates: { rating?: number; comment?: string; ratingHidden?: boolean }) => {
    if (connectivityMode === 'offline') return;
    try {
      await fetch(`/api/orders/${orderId}/moderate-rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      await fetchStateFromServer();
    } catch (e) {
      console.error('Error moderating rating', e);
    }
  };

  const redeemService = async (clientId: string, serviceId: string, scheduledDate: string, scheduledTime: string, address: string, notes: string) => {
    try {
      const res = await fetch('/api/client/redeem-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, serviceId, scheduledDate, scheduledTime, address, notes }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchStateFromServer();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Erreur lors de la conversion.' };
      }
    } catch (e) {
      return { success: false, message: 'Le serveur est inaccessible.' };
    }
  };

  const registerDirector = async (directorData: { firstName: string; lastName: string; phone: string; email: string; grade: string; avatar?: string; allowedTabs?: string[] }) => {
    try {
      const res = await fetch('/api/admin/register-director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(directorData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchStateFromServer();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Erreur lors de l\'enregistrement.' };
      }
    } catch (e) {
      return { success: false, message: 'Le serveur est inaccessible.' };
    }
  };

  const updateDirectorTabs = async (id: string, allowedTabs: string[], status?: 'active' | 'suspended', grade?: string) => {
    try {
      const res = await fetch('/api/admin/update-director-tabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, allowedTabs, status, grade }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchStateFromServer();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Erreur de mise à jour.' };
      }
    } catch (e) {
      return { success: false, message: 'Le serveur est inaccessible.' };
    }
  };

  const deleteDirector = async (id: string) => {
    try {
      const res = await fetch('/api/admin/delete-director', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchStateFromServer();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Erreur de suppression.' };
      }
    } catch (e) {
      return { success: false, message: 'Le serveur est inaccessible.' };
    }
  };

  const logAssistantActivity = async (action: string) => {
    if (!currentUser) return;
    try {
      await fetch('/api/admin/log-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userEmail: currentUser.email,
          userName: `${currentUser.firstName} ${currentUser.lastName}`,
          action
        }),
      });
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  };

  const fetchAssistantLogs = async () => {
    try {
      const res = await fetch('/api/admin/assistant-logs');
      if (res.ok) {
        const data = await res.json();
        return data;
      }
      return [];
    } catch (e) {
      console.error('Failed to fetch activity logs:', e);
      return [];
    }
  };

  const saveMomoConfig = async (provider: 'mtn' | 'orange', config: any) => {
    try {
      const res = await fetch('/api/momo-api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          mtnMomoConfig: provider === 'mtn' ? config : undefined,
          orangeMoneyConfig: provider === 'orange' ? config : undefined,
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await loadMomoConfigs();
        await loadMomoLogs();
      }
      return data;
    } catch (e: any) {
      console.error('Error saving MoMo config', e);
      return { success: false, message: e.message };
    }
  };

  const testMomoConnection = async (provider: 'mtn' | 'orange') => {
    try {
      const res = await fetch('/api/momo-api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      const data = await res.json();
      await loadMomoLogs();
      return data;
    } catch (e: any) {
      console.error('Error testing MoMo connection', e);
      return { success: false, message: e.message };
    }
  };

  const requestMomoPayment = async (provider: 'mtn' | 'orange', phone: string, amount: number, userId: string, orderId?: string) => {
    try {
      const res = await fetch('/api/momo-api/request-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, phone, amount, userId, orderId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchStateFromServer();
      }
      return data;
    } catch (e: any) {
      console.error('Error calling request-payment', e);
      return { success: false, message: e.message };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        services,
        orders,
        cards,
        notifications,
        distributionMode,
        setDistributionMode,
        setCurrentUserRole,
        refreshState: fetchStateFromServer,
        createOrder,
        assignOrder,
        updateOrderStatus,
        validateOrderWithNfc,
        validateOrderManually,
        rateOrder,
        addNotification,
        markNotificationAsRead,
        clearNotifications,
        updateUserBalance,
        issueNfcCard,
        resetAllData,
        getFinancialReport,
        registerUser,
        loginUser,
        logoutUser,
        approveProvider,
        rejectProvider,
        updateProviderAvailability,
        signalOrder,
        moderateRating,
        isOnline,
        connectivityMode,
        setConnectivityMode,
        syncOfflineQueue,
        offlineQueueCount,
        loyaltyPointsRate,
        setLoyaltyPointsRate,
        loyaltyPointValue,
        nfcPointsMultiplier,
        setLoyaltyPointValue,
        activeApp,
        setActiveApp,
        redeemService,
        registerDirector,
        updateDirectorTabs,
        deleteDirector,
        logAssistantActivity,
        fetchAssistantLogs,
        momoConfigs,
        momoLogs,
        loadMomoConfigs,
        loadMomoLogs,
        saveMomoConfig,
        testMomoConnection,
        requestMomoPayment,
        chatMessages,
        sendChatMessage,
        theme,
        toggleTheme
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
