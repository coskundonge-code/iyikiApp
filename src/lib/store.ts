import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Gift, GiftAction, Notification, GiftCategory } from '@/types';
import { MOCK_USERS, MOCK_GIFTS, MOCK_GIFT_ACTIONS, MOCK_NOTIFICATIONS } from './mock-data';

interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  pendingPhone: string | null;

  // Gifts
  gifts: Gift[];
  giftActions: GiftAction[];
  selectedCategory: GiftCategory | null;

  // Notifications
  notifications: Notification[];
  unreadCount: number;

  // UI
  isSending: boolean;

  // Auth Actions
  setPhone: (phone: string) => void;
  login: (phone: string) => void;
  loginAsRole: (role: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  upgradeToPremium: () => void;

  // Gift Actions
  setSelectedCategory: (cat: GiftCategory | null) => void;
  sendGift: (giftId: string, receiverPhone: string, receiverName: string, note?: string) => GiftAction | null;
  redeemGift: (actionId: string, branchId: string, branchName: string) => boolean;

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
      gifts: MOCK_GIFTS,
      giftActions: MOCK_GIFT_ACTIONS,
      selectedCategory: null,
      notifications: MOCK_NOTIFICATIONS,
      unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length,
      isSending: false,

      // Auth
      setPhone: (phone) => set({ pendingPhone: phone }),

      login: (phone) => {
        const user = MOCK_USERS.find(u => u.phone === phone);
        if (user) {
          set({ currentUser: user, isAuthenticated: true, pendingPhone: null });
        } else {
          // Create new user
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
      },

      loginAsRole: (role) => {
        let user: User | undefined;
        if (role === 'admin') user = MOCK_USERS.find(u => u.role === 'admin');
        else if (role === 'partner') user = MOCK_USERS.find(u => u.role === 'partner');
        else if (role === 'sponsor') user = MOCK_USERS.find(u => u.role === 'sponsor');
        else user = MOCK_USERS[0]; // default user
        if (user) {
          set({ currentUser: user, isAuthenticated: true, pendingPhone: null });
        }
      },

      logout: () => set({
        currentUser: null,
        isAuthenticated: false,
        pendingPhone: null,
      }),

      updateProfile: (data) => set(state => ({
        currentUser: state.currentUser ? { ...state.currentUser, ...data } : null,
      })),

      upgradeToPremium: () => set(state => ({
        currentUser: state.currentUser
          ? { ...state.currentUser, tier: 'premium' as const, dailySendLimit: 3 }
          : null,
      })),

      // Gifts
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),

      sendGift: (giftId, receiverPhone, receiverName, note) => {
        const state = get();
        const user = state.currentUser;
        if (!user) return null;

        // Check limits
        if (user.dailySendCount >= user.dailySendLimit) return null;
        // Check self-send
        if (user.phone === receiverPhone) return null;

        const gift = state.gifts.find(g => g.id === giftId);
        if (!gift || gift.stock <= 0) return null;

        const now = new Date();
        const action: GiftAction = {
          id: `action-${Date.now()}`,
          giftId,
          gift,
          senderId: user.id,
          senderName: user.name || 'Bilinmeyen',
          receiverPhone,
          receiverName,
          note,
          status: 'pending',
          redeemCode: `TKR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          createdAt: now.toISOString(),
          expiresAt: new Date(now.getTime() + gift.expiryHours * 3600000).toISOString(),
        };

        const newNotif: Notification = {
          id: `notif-${Date.now()}`,
          userId: 'receiver',
          type: 'gift_received',
          title: 'Yeni Hediye!',
          message: `${user.name || 'Biri'} sana bir ${gift.name} ısmarladı ${gift.image}`,
          isRead: false,
          createdAt: now.toISOString(),
          actionId: action.id,
        };

        set(state => ({
          giftActions: [action, ...state.giftActions],
          gifts: state.gifts.map(g =>
            g.id === giftId ? { ...g, stock: g.stock - 1 } : g
          ),
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                dailySendCount: state.currentUser.dailySendCount + 1,
                iyikiScore: state.currentUser.iyikiScore + 1,
              }
            : null,
          notifications: [newNotif, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));

        return action;
      },

      redeemGift: (actionId, branchId, branchName) => {
        const state = get();
        const action = state.giftActions.find(a => a.id === actionId);
        if (!action || action.status !== 'pending') return false;

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
      markNotificationRead: (id) => set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      })),

      markAllRead: () => set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      })),

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
        giftActions: state.giftActions,
        notifications: state.notifications,
      }),
    }
  )
);
