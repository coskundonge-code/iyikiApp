import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Gift, GiftAction, Notification, GiftCategory, Partner, Sponsor, FraudFlag } from '@/types';
import {
  fetchCurrentUser,
  fetchAllUsers,
  fetchGifts as fetchGiftsFromDB,
  fetchGiftActions as fetchGiftActionsFromDB,
  fetchAllGiftActions,
  createGiftAction,
  redeemGiftAction,
  fetchPartners as fetchPartnersFromDB,
  fetchSponsors as fetchSponsorsFromDB,
  fetchNotifications as fetchNotifsFromDB,
  markNotificationRead as markNotifReadInDB,
  createNotification,
  fetchFraudFlags as fetchFraudFlagsFromDB,
  decrementGiftStock,
  incrementUserScore,
} from './supabase/queries';
import {
  MOCK_USERS,
  MOCK_GIFTS,
  MOCK_GIFT_ACTIONS,
  MOCK_NOTIFICATIONS,
  MOCK_PARTNERS,
  MOCK_SPONSORS,
  MOCK_FRAUD_FLAGS,
} from './mock-data';

// Fallback mock data for when Supabase is unavailable
const DEMO_USERS: Partial<User>[] = [
  { id: 'e1000000-0000-0000-0000-000000000001', phone: '+905551234567', name: 'Coskun', role: 'user', tier: 'free', iyikiScore: 12, dailySendCount: 0, dailySendLimit: 1, dailyReceiveCount: 0, status: 'active', createdAt: '2026-03-01T10:00:00Z', notificationPrefs: { push: true, sms: true } },
  { id: 'e1000000-0000-0000-0000-000000000010', phone: '+905550001111', name: 'Admin', role: 'admin', tier: 'premium', iyikiScore: 0, dailySendCount: 0, dailySendLimit: 99, dailyReceiveCount: 0, status: 'active', createdAt: '2026-01-01T00:00:00Z', notificationPrefs: { push: true, sms: true } },
  { id: 'e1000000-0000-0000-0000-000000000011', phone: '+905550002222', name: 'Starbucks Yonetici', role: 'partner', tier: 'free', iyikiScore: 0, dailySendCount: 0, dailySendLimit: 0, dailyReceiveCount: 0, status: 'active', createdAt: '2026-01-01T00:00:00Z', notificationPrefs: { push: true, sms: true } },
  { id: 'e1000000-0000-0000-0000-000000000012', phone: '+905550003333', name: 'Garanti BBVA', role: 'sponsor', tier: 'free', iyikiScore: 0, dailySendCount: 0, dailySendLimit: 0, dailyReceiveCount: 0, status: 'active', createdAt: '2026-01-01T00:00:00Z', notificationPrefs: { push: true, sms: true } },
];

interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  pendingPhone: string | null;

  // Data
  gifts: Gift[];
  giftActions: GiftAction[];
  selectedCategory: GiftCategory | null;
  notifications: Notification[];
  unreadCount: number;
  partners: Partner[];
  sponsors: Sponsor[];
  allUsers: User[];
  fraudFlags: FraudFlag[];

  // UI
  isSending: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Auth Actions
  setPhone: (phone: string) => void;
  login: (phone: string) => Promise<void>;
  loginAsRole: (role: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  upgradeToPremium: () => void;

  // Data Loading
  initializeData: () => Promise<void>;
  loadGifts: () => Promise<void>;
  loadGiftActions: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  loadAdminData: () => Promise<void>;

  // Gift Actions
  setSelectedCategory: (cat: GiftCategory | null) => void;
  sendGift: (giftId: string, receiverPhone: string, receiverName: string, note?: string) => Promise<GiftAction | null>;
  redeemGift: (actionId: string, branchId: string, branchName: string) => Promise<boolean>;

  // Notification Actions
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;

  // Helpers
  getReceivedGifts: () => GiftAction[];
  getSentGifts: () => GiftAction[];
  getFilteredGifts: () => Gift[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      pendingPhone: null,
      gifts: [],
      giftActions: [],
      selectedCategory: null,
      notifications: [],
      unreadCount: 0,
      isSending: false,
      isLoading: false,
      isInitialized: false,
      partners: [],
      sponsors: [],
      allUsers: [],
      fraudFlags: [],

      // Auth
      setPhone: (phone) => set({ pendingPhone: phone }),

      login: async (phone) => {
        // Try to find user in Supabase
        const users = await fetchAllUsers();
        const user = users.find(u => u.phone === phone);
        if (user) {
          set({ currentUser: user, isAuthenticated: true, pendingPhone: null });
        } else {
          // Create a demo user locally
          const newUser: User = {
            id: `user-${Date.now()}`,
            phone,
            name: undefined,
            role: 'user',
            tier: 'free',
            iyikiScore: 0,
            dailySendCount: 0,
            dailySendLimit: 1,
            dailyReceiveCount: 0,
            createdAt: new Date().toISOString(),
            status: 'active',
            notificationPrefs: { push: true, sms: true },
          };
          set({ currentUser: newUser, isAuthenticated: true, pendingPhone: null });
        }
        // Load data after login
        get().initializeData();
      },

      loginAsRole: async (role) => {
        set({ isLoading: true });
        try {
          const users = await fetchAllUsers();
          let user: User | undefined;
          if (role === 'admin') user = users.find(u => u.role === 'admin');
          else if (role === 'partner') user = users.find(u => u.role === 'partner');
          else if (role === 'sponsor') user = users.find(u => u.role === 'sponsor');
          else user = users.find(u => u.role === 'user');
          
          if (!user) {
            // Fallback to demo data
            const demo = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
            user = demo as User;
          }
          
          set({ currentUser: user, isAuthenticated: true, pendingPhone: null, isLoading: false });
          get().initializeData();
        } catch {
          // Fallback
          const demo = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
          set({ currentUser: demo as User, isAuthenticated: true, pendingPhone: null, isLoading: false });
        }
      },

      logout: () => set({
        currentUser: null,
        isAuthenticated: false,
        pendingPhone: null,
        gifts: [],
        giftActions: [],
        notifications: [],
        unreadCount: 0,
        isInitialized: false,
      }),

      updateProfile: (data) => set(state => ({
        currentUser: state.currentUser ? { ...state.currentUser, ...data } : null,
      })),

      upgradeToPremium: () => set(state => ({
        currentUser: state.currentUser
          ? { ...state.currentUser, tier: 'premium' as const, dailySendLimit: 3 }
          : null,
      })),

      // Data Loading
      initializeData: async () => {
        const state = get();
        if (state.isInitialized) return;
        set({ isLoading: true });
        try {
          await Promise.all([
            state.loadGifts(),
            state.loadGiftActions(),
            state.loadNotifications(),
          ]);
        } catch {
          // Fallback to mock data
          set({
            gifts: MOCK_GIFTS,
            giftActions: MOCK_GIFT_ACTIONS,
            notifications: MOCK_NOTIFICATIONS,
            unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length,
          });
        }
        set({ isLoading: false, isInitialized: true });
      },

      loadGifts: async () => {
        try {
          const gifts = await fetchGiftsFromDB();
          set({ gifts: gifts.length > 0 ? gifts : MOCK_GIFTS });
        } catch {
          set({ gifts: MOCK_GIFTS });
        }
      },

      loadGiftActions: async () => {
        const user = get().currentUser;
        if (!user) return;
        try {
          const actions = await fetchGiftActionsFromDB(user.id, user.phone);
          set({ giftActions: actions.length > 0 ? actions : MOCK_GIFT_ACTIONS });
        } catch {
          set({ giftActions: MOCK_GIFT_ACTIONS });
        }
      },

      loadNotifications: async () => {
        const user = get().currentUser;
        if (!user) return;
        try {
          const notifs = await fetchNotifsFromDB(user.id);
          const data = notifs.length > 0 ? notifs : MOCK_NOTIFICATIONS;
          set({
            notifications: data,
            unreadCount: data.filter(n => !n.isRead).length,
          });
        } catch {
          set({
            notifications: MOCK_NOTIFICATIONS,
            unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length,
          });
        }
      },

      loadAdminData: async () => {
        set({ isLoading: true });
        try {
          const [partners, sponsors, users, fraudFlags, actions] = await Promise.all([
            fetchPartnersFromDB(),
            fetchSponsorsFromDB(),
            fetchAllUsers(),
            fetchFraudFlagsFromDB(),
            fetchAllGiftActions(),
          ]);
          set({
            partners: partners.length > 0 ? partners : MOCK_PARTNERS,
            sponsors: sponsors.length > 0 ? sponsors : MOCK_SPONSORS,
            allUsers: users.length > 0 ? users : (MOCK_USERS as User[]),
            fraudFlags: fraudFlags.length > 0 ? fraudFlags : MOCK_FRAUD_FLAGS,
            giftActions: actions.length > 0 ? actions : MOCK_GIFT_ACTIONS,
            isLoading: false,
          });
        } catch {
          set({
            partners: MOCK_PARTNERS,
            sponsors: MOCK_SPONSORS,
            allUsers: MOCK_USERS as User[],
            fraudFlags: MOCK_FRAUD_FLAGS,
            giftActions: MOCK_GIFT_ACTIONS,
            isLoading: false,
          });
        }
      },

      // Gifts
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),

      sendGift: async (giftId, receiverPhone, receiverName, note) => {
        const state = get();
        const user = state.currentUser;
        if (!user) return null;

        if (user.dailySendCount >= user.dailySendLimit) return null;
        if (user.phone === receiverPhone) return null;

        const gift = state.gifts.find(g => g.id === giftId);
        if (!gift || gift.stock <= 0) return null;

        set({ isSending: true });

        const now = new Date();
        const redeemCode = `TKR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const expiresAt = new Date(now.getTime() + gift.expiryHours * 3600000).toISOString();

        try {
          const action = await createGiftAction({
            giftId, senderId: user.id, receiverPhone, note, redeemCode, expiresAt,
          });

          if (action) {
            await Promise.all([
              decrementGiftStock(giftId),
              incrementUserScore(user.id),
            ]);

            // Update local state
            set(state => ({
              giftActions: [action, ...state.giftActions],
              gifts: state.gifts.map(g => g.id === giftId ? { ...g, stock: g.stock - 1 } : g),
              currentUser: state.currentUser ? {
                ...state.currentUser,
                dailySendCount: state.currentUser.dailySendCount + 1,
                iyikiScore: state.currentUser.iyikiScore + 1,
              } : null,
              isSending: false,
            }));

            return action;
          }
        } catch { /* ignore */ }

        // Fallback: create action locally
        const localAction: GiftAction = {
          id: `action-${Date.now()}`, giftId, gift, senderId: user.id,
          senderName: user.name || 'Bilinmeyen', receiverPhone, receiverName, note,
          status: 'pending', redeemCode, createdAt: now.toISOString(), expiresAt,
        };

        set(state => ({
          giftActions: [localAction, ...state.giftActions],
          gifts: state.gifts.map(g => g.id === giftId ? { ...g, stock: g.stock - 1 } : g),
          currentUser: state.currentUser ? {
            ...state.currentUser,
            dailySendCount: state.currentUser.dailySendCount + 1,
            iyikiScore: state.currentUser.iyikiScore + 1,
          } : null,
          isSending: false,
        }));

        return localAction;
      },

      redeemGift: async (actionId, branchId, branchName) => {
        const state = get();
        const action = state.giftActions.find(a => a.id === actionId);
        if (!action || action.status !== 'pending') return false;

        try {
          await redeemGiftAction(actionId, branchId);
        } catch { /* ignore */ }

        set(state => ({
          giftActions: state.giftActions.map(a =>
            a.id === actionId
              ? { ...a, status: 'claimed' as const, claimedAt: new Date().toISOString(), branchId, branchName }
              : a
          ),
        }));

        return true;
      },

      // Notifications
      markNotificationRead: (id) => {
        markNotifReadInDB(id).catch(() => {});
        set(state => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllRead: () => {
        const notifs = get().notifications.filter(n => !n.isRead);
        notifs.forEach(n => markNotifReadInDB(n.id).catch(() => {}));
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      },

      // Helpers
      getReceivedGifts: () => {
        const state = get();
        if (!state.currentUser) return [];
        return state.giftActions.filter(a =>
          a.receiverPhone === state.currentUser?.phone || a.receiverId === state.currentUser?.id
        );
      },

      getSentGifts: () => {
        const state = get();
        if (!state.currentUser) return [];
        return state.giftActions.filter(a => a.senderId === state.currentUser?.id);
      },

      getFilteredGifts: () => {
        const state = get();
        let filtered = state.gifts.filter(g => g.isActive && g.stock > 0);
        if (state.currentUser?.tier !== 'premium') {
          filtered = filtered.filter(g => !g.isPremium);
        }
        if (state.selectedCategory) {
          filtered = filtered.filter(g => g.category === state.selectedCategory);
        }
        return filtered;
      },
    }),
    {
      name: 'iyiki-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        selectedCategory: state.selectedCategory,
      }),
    }
  )
);
