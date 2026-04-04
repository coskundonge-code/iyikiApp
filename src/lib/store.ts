import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Gift, GiftAction, Notification, GiftCategory, Partner, Sponsor, FraudFlag } from '@/types';
import toast from 'react-hot-toast';

// Import server actions
import {
  getUsers,
  getGifts,
  getGiftActions,
  getAllGiftActions,
  sendGift,
  redeemGift,
  getPartners,
  getSponsors,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsRead,
  getFraudFlags,
} from './actions';

import {
  getCurrentUser,
  signInWithPhone,
} from './actions/auth';

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

  // Error handling
  errors: Record<string, string>;

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

  // Error handling
  addError: (key: string, message: string) => void;
  clearError: (key: string) => void;

  // Helpers
  getReceivedGifts: () => GiftAction[];
  getSentGifts: () => GiftAction[];
  getFilteredGifts: () => Gift[];

  // Admin/Partner Actions
  addGift: (gift: Omit<Gift, 'id' | 'partnerLogo' | 'expiryHours' | 'isActive' | 'sponsorId' | 'sponsorName'> & { productLogo?: string; corporateLogo?: string }) => void;
  resolveFraudFlag: (flagId: string) => void;
  suspendUser: (userId: string) => void;
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
      errors: {},

      // Auth
      setPhone: (phone) => set({ pendingPhone: phone }),

      login: async (phone) => {
        set({ isLoading: true });
        try {
          // Try server auth first
          const result = await signInWithPhone(phone);
          if (result.error) {
            // Fallback to demo mode
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
            set({ currentUser: newUser, isAuthenticated: true, pendingPhone: null, isLoading: false });
            toast.success('Demo mode activated');
          } else {
            // Try to fetch current user from server
            const userResult = await getCurrentUser();
            if (userResult.data) {
              set({ currentUser: userResult.data, isAuthenticated: true, pendingPhone: null, isLoading: false });
              get().initializeData();
            } else {
              // Fallback to demo
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
              set({ currentUser: newUser, isAuthenticated: true, pendingPhone: null, isLoading: false });
              toast.success('Demo mode activated');
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          get().addError('login', message);
          toast.error(message);
          set({ isLoading: false });
        }
      },

      loginAsRole: async (role) => {
        set({ isLoading: true });
        try {
          const result = await getUsers();
          let user: User | undefined;

          if (result.data && result.data.length > 0) {
            if (role === 'admin') user = result.data.find(u => u.role === 'admin');
            else if (role === 'partner') user = result.data.find(u => u.role === 'partner');
            else if (role === 'sponsor') user = result.data.find(u => u.role === 'sponsor');
            else user = result.data.find(u => u.role === 'user');
          }

          if (!user) {
            // Fallback to demo data
            const demo = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
            user = demo as User;
            toast(`Using demo ${role} account`, { icon: 'ℹ️' });
          }

          set({ currentUser: user, isAuthenticated: true, pendingPhone: null, isLoading: false });
          get().initializeData();
        } catch (error) {
          const message = error instanceof Error ? error.message : `Failed to login as ${role}`;
          get().addError('loginAsRole', message);
          toast.error(message);
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
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load data';
          get().addError('initializeData', message);
          // Fallback to mock data - batch with queueMicrotask
          queueMicrotask(() => {
            set({
              gifts: MOCK_GIFTS,
              giftActions: MOCK_GIFT_ACTIONS,
              notifications: MOCK_NOTIFICATIONS,
              unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length,
            });
          });
        }
        set({ isLoading: false, isInitialized: true });
      },

      loadGifts: async () => {
        try {
          const result = await getGifts();
          if (result.error) {
            get().addError('loadGifts', result.error);
            set({ gifts: MOCK_GIFTS });
          } else {
            set({ gifts: result.data && result.data.length > 0 ? result.data : MOCK_GIFTS });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load gifts';
          get().addError('loadGifts', message);
          set({ gifts: MOCK_GIFTS });
        }
      },

      loadGiftActions: async () => {
        const user = get().currentUser;
        if (!user) return;
        try {
          const result = await getGiftActions(user.id, user.phone);
          if (result.error) {
            get().addError('loadGiftActions', result.error);
            set({ giftActions: MOCK_GIFT_ACTIONS });
          } else {
            set({ giftActions: result.data && result.data.length > 0 ? result.data : MOCK_GIFT_ACTIONS });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load gift actions';
          get().addError('loadGiftActions', message);
          set({ giftActions: MOCK_GIFT_ACTIONS });
        }
      },

      loadNotifications: async () => {
        const user = get().currentUser;
        if (!user) return;
        try {
          const result = await getNotifications(user.id);
          if (result.error) {
            get().addError('loadNotifications', result.error);
            set({
              notifications: MOCK_NOTIFICATIONS,
              unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length,
            });
          } else {
            const data = result.data && result.data.length > 0 ? result.data : MOCK_NOTIFICATIONS;
            set({
              notifications: data,
              unreadCount: data.filter(n => !n.isRead).length,
            });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load notifications';
          get().addError('loadNotifications', message);
          set({
            notifications: MOCK_NOTIFICATIONS,
            unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length,
          });
        }
      },

      loadAdminData: async () => {
        set({ isLoading: true });
        try {
          const [partnersResult, sponsorsResult, usersResult, fraudFlagsResult, actionsResult] = await Promise.all([
            getPartners(),
            getSponsors(),
            getUsers(),
            getFraudFlags(),
            getAllGiftActions(),
          ]);

          // Batch updates with queueMicrotask to avoid blocking the main thread
          queueMicrotask(() => {
            set({
              partners: partnersResult.data && partnersResult.data.length > 0 ? partnersResult.data : MOCK_PARTNERS,
              sponsors: sponsorsResult.data && sponsorsResult.data.length > 0 ? sponsorsResult.data : MOCK_SPONSORS,
              allUsers: usersResult.data && usersResult.data.length > 0 ? usersResult.data : (MOCK_USERS as User[]),
              fraudFlags: fraudFlagsResult.data && fraudFlagsResult.data.length > 0 ? fraudFlagsResult.data : MOCK_FRAUD_FLAGS,
              giftActions: actionsResult.data && actionsResult.data.length > 0 ? actionsResult.data : MOCK_GIFT_ACTIONS,
              isLoading: false,
            });
          });

          // Log errors if any occurred
          if (partnersResult.error) get().addError('loadAdminData_partners', partnersResult.error);
          if (sponsorsResult.error) get().addError('loadAdminData_sponsors', sponsorsResult.error);
          if (usersResult.error) get().addError('loadAdminData_users', usersResult.error);
          if (fraudFlagsResult.error) get().addError('loadAdminData_fraudFlags', fraudFlagsResult.error);
          if (actionsResult.error) get().addError('loadAdminData_actions', actionsResult.error);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load admin data';
          get().addError('loadAdminData', message);
          toast.error(message);
          // Wrap fallback data set in queueMicrotask as well
          queueMicrotask(() => {
            set({
              partners: MOCK_PARTNERS,
              sponsors: MOCK_SPONSORS,
              allUsers: MOCK_USERS as User[],
              fraudFlags: MOCK_FRAUD_FLAGS,
              giftActions: MOCK_GIFT_ACTIONS,
              isLoading: false,
            });
          });
        }
      },

      // Gifts
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),

      sendGift: async (giftId, receiverPhone, receiverName, note) => {
        const state = get();
        const user = state.currentUser;
        if (!user) {
          get().addError('sendGift', 'User not authenticated');
          return null;
        }

        if (user.dailySendCount >= user.dailySendLimit) {
          const msg = 'Daily send limit reached';
          get().addError('sendGift', msg);
          toast.error(msg);
          return null;
        }

        if (user.phone === receiverPhone) {
          const msg = 'Cannot send gift to yourself';
          get().addError('sendGift', msg);
          toast.error(msg);
          return null;
        }

        const gift = state.gifts.find(g => g.id === giftId);
        if (!gift || gift.stock <= 0) {
          const msg = 'Gift is not available';
          get().addError('sendGift', msg);
          toast.error(msg);
          return null;
        }

        set({ isSending: true });

        try {
          const result = await sendGift(user.id, {
            giftId,
            receiverPhone,
            receiverName,
            note,
          });

          if (result.error) {
            get().addError('sendGift', result.error);
            toast.error(result.error);
            set({ isSending: false });
            // Fallback: create action locally
            const now = new Date();
            const redeemCode = `TKR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const expiresAt = new Date(now.getTime() + gift.expiryHours * 3600000).toISOString();
            const localAction: GiftAction = {
              id: `action-${Date.now()}`,
              giftId,
              gift,
              senderId: user.id,
              senderName: user.name || 'Bilinmeyen',
              receiverPhone,
              receiverName,
              note,
              status: 'pending',
              redeemCode,
              createdAt: now.toISOString(),
              expiresAt,
            };
            set(state => ({
              giftActions: [localAction, ...state.giftActions],
              gifts: state.gifts.map(g => g.id === giftId ? { ...g, stock: g.stock - 1 } : g),
              currentUser: state.currentUser ? {
                ...state.currentUser,
                dailySendCount: state.currentUser.dailySendCount + 1,
                iyikiScore: state.currentUser.iyikiScore + 1,
              } : null,
            }));
            return localAction;
          }

          if (result.data) {
            // Update local state with server response
            set(state => ({
              giftActions: [result.data!, ...state.giftActions],
              gifts: state.gifts.map(g => g.id === giftId ? { ...g, stock: g.stock - 1 } : g),
              currentUser: state.currentUser ? {
                ...state.currentUser,
                dailySendCount: state.currentUser.dailySendCount + 1,
                iyikiScore: state.currentUser.iyikiScore + 1,
              } : null,
              isSending: false,
            }));
            toast.success('Gift sent successfully!');
            return result.data;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to send gift';
          get().addError('sendGift', message);
          toast.error(message);
          set({ isSending: false });
        }

        return null;
      },

      redeemGift: async (actionId, branchId, branchName) => {
        const state = get();
        const action = state.giftActions.find(a => a.id === actionId);
        if (!action || action.status !== 'pending') {
          const msg = 'Gift cannot be redeemed';
          get().addError('redeemGift', msg);
          toast.error(msg);
          return false;
        }

        try {
          const result = await redeemGift(actionId, branchId);
          if (result.error) {
            get().addError('redeemGift', result.error);
            toast.error(result.error);
            // Still update local state as fallback
            set(state => ({
              giftActions: state.giftActions.map(a =>
                a.id === actionId
                  ? { ...a, status: 'claimed' as const, claimedAt: new Date().toISOString(), branchId, branchName }
                  : a
              ),
            }));
            return true;
          }

          if (result.data) {
            set(state => ({
              giftActions: state.giftActions.map(a =>
                a.id === actionId ? result.data! : a
              ),
            }));
            toast.success('Gift redeemed successfully!');
            return true;
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to redeem gift';
          get().addError('redeemGift', message);
          toast.error(message);
        }

        return false;
      },

      // Notifications
      markNotificationRead: (id) => {
        markNotificationAsRead(id).catch(error => {
          const message = error instanceof Error ? error.message : 'Failed to mark notification as read';
          get().addError('markNotificationRead', message);
        });
        set(state => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllRead: () => {
        const user = get().currentUser;
        if (user) {
          markAllNotificationsRead(user.id).catch(error => {
            const message = error instanceof Error ? error.message : 'Failed to mark all notifications as read';
            get().addError('markAllRead', message);
          });
        }
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      },

      // Error handling
      addError: (key, message) => {
        set(state => ({
          errors: { ...state.errors, [key]: message },
        }));
      },

      clearError: (key) => {
        set(state => {
          const newErrors = { ...state.errors };
          delete newErrors[key];
          return { errors: newErrors };
        });
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

      // Admin/Partner Actions
      addGift: (giftData) => {
        const { productLogo, corporateLogo, ...rest } = giftData;
        const newGift: Gift = {
          id: `gift-${Date.now()}`,
          ...rest,
          productLogo: productLogo || undefined,
          corporateLogo: corporateLogo || undefined,
          partnerLogo: '🏪',
          expiryHours: 48,
          isActive: true,
        };
        set(state => ({
          gifts: [newGift, ...state.gifts],
        }));
      },

      resolveFraudFlag: (flagId) => {
        set(state => ({
          fraudFlags: state.fraudFlags.map(f =>
            f.id === flagId ? { ...f, resolved: true } : f
          ),
        }));
      },

      suspendUser: (userId) => {
        set(state => ({
          allUsers: state.allUsers.map(u =>
            u.id === userId ? { ...u, status: 'suspended' as const } : u
          ),
        }));
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
