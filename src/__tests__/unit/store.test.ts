import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAppStore } from '@/lib/store'

// Mock the action functions
vi.mock('@/lib/actions', () => ({
  getUsers: vi.fn(() => Promise.resolve([])),
  getGifts: vi.fn(() => Promise.resolve([])),
  getGiftActions: vi.fn(() => Promise.resolve([])),
  getAllGiftActions: vi.fn(() => Promise.resolve([])),
  sendGift: vi.fn(() => Promise.resolve(null)),
  redeemGift: vi.fn(() => Promise.resolve(null)),
  getPartners: vi.fn(() => Promise.resolve([])),
  getSponsors: vi.fn(() => Promise.resolve([])),
  getNotifications: vi.fn(() => Promise.resolve([])),
  markNotificationAsRead: vi.fn(() => Promise.resolve(null)),
  markAllNotificationsRead: vi.fn(() => Promise.resolve(null)),
  getFraudFlags: vi.fn(() => Promise.resolve([])),
}))

vi.mock('@/lib/actions/auth', () => ({
  getCurrentUser: vi.fn(() => Promise.resolve(null)),
  signInWithPhone: vi.fn(() => Promise.resolve(null)),
}))

describe('App Store (Zustand)', () => {
  beforeEach(() => {
    // Clear store state before each test
    useAppStore.getState().logout()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAppStore.getState()

      expect(state.currentUser).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.pendingPhone).toBeNull()
      expect(state.gifts).toEqual([])
      expect(state.giftActions).toEqual([])
      expect(state.selectedCategory).toBeNull()
      expect(state.notifications).toEqual([])
      expect(state.unreadCount).toBe(0)
      expect(state.isSending).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.isInitialized).toBe(false)
    })
  })

  describe('setPhone', () => {
    it('should set pending phone', () => {
      const store = useAppStore.getState()
      store.setPhone('+905551234567')

      expect(useAppStore.getState().pendingPhone).toBe('+905551234567')
    })
  })

  describe('logout', () => {
    it('should clear all authentication and data state', () => {
      const store = useAppStore.getState()

      // Setup some state first
      store.setPhone('+905551234567')

      // Logout
      store.logout()

      const state = useAppStore.getState()
      expect(state.currentUser).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.pendingPhone).toBeNull()
      expect(state.gifts).toEqual([])
      expect(state.giftActions).toEqual([])
      expect(state.notifications).toEqual([])
      expect(state.unreadCount).toBe(0)
      expect(state.isInitialized).toBe(false)
    })
  })

  describe('setSelectedCategory', () => {
    it('should update selected category', () => {
      const store = useAppStore.getState()
      store.setSelectedCategory('coffee')

      expect(useAppStore.getState().selectedCategory).toBe('coffee')
    })

    it('should clear selected category with null', () => {
      const store = useAppStore.getState()
      store.setSelectedCategory('food')
      store.setSelectedCategory(null)

      expect(useAppStore.getState().selectedCategory).toBeNull()
    })
  })

  describe('updateProfile', () => {
    it('should update current user profile', () => {
      const store = useAppStore.getState()

      // Set a user first
      store.currentUser = {
        id: 'user-1',
        phone: '+905551234567',
        name: 'John',
        role: 'user',
        tier: 'free',
        iyikiScore: 0,
        dailySendCount: 0,
        dailySendLimit: 1,
        dailyReceiveCount: 0,
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        notificationPrefs: { push: true, sms: true },
      }

      store.updateProfile({ name: 'Jane', avatar: 'https://example.com/avatar.jpg' })

      const updated = useAppStore.getState().currentUser
      expect(updated?.name).toBe('Jane')
      expect(updated?.avatar).toBe('https://example.com/avatar.jpg')
      expect(updated?.phone).toBe('+905551234567') // Should not change
    })

    it('should not update if no current user', () => {
      const store = useAppStore.getState()
      expect(store.currentUser).toBeNull()

      store.updateProfile({ name: 'Jane' })

      expect(useAppStore.getState().currentUser).toBeNull()
    })
  })

  describe('upgradeToPremium', () => {
    it('should upgrade user to premium tier', () => {
      const store = useAppStore.getState()

      store.currentUser = {
        id: 'user-1',
        phone: '+905551234567',
        name: 'John',
        role: 'user',
        tier: 'free',
        iyikiScore: 0,
        dailySendCount: 0,
        dailySendLimit: 1,
        dailyReceiveCount: 0,
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        notificationPrefs: { push: true, sms: true },
      }

      store.upgradeToPremium()

      const upgraded = useAppStore.getState().currentUser
      expect(upgraded?.tier).toBe('premium')
      expect(upgraded?.dailySendLimit).toBe(3)
    })
  })

  describe('getFilteredGifts', () => {
    it('should return empty array when no gifts', () => {
      const store = useAppStore.getState()
      const filtered = store.getFilteredGifts()

      expect(filtered).toEqual([])
    })

    it('should filter by active and stock', () => {
      const store = useAppStore.getState()

      useAppStore.setState({
        gifts: [
          {
            id: 'gift-1',
            partnerId: 'partner-1',
            name: 'Coffee',
            category: 'coffee',
            stock: 10,
            isActive: true,
            isPremium: false,
            expiryHours: 72,
            partnerName: 'Starbucks',
            partnerLogo: '',
            description: '',
            image: '',
          },
          {
            id: 'gift-2',
            partnerId: 'partner-2',
            name: 'Inactive',
            category: 'food',
            stock: 5,
            isActive: false,
            isPremium: false,
            expiryHours: 72,
            partnerName: 'Partner',
            partnerLogo: '',
            description: '',
            image: '',
          },
          {
            id: 'gift-3',
            partnerId: 'partner-3',
            name: 'Out of Stock',
            category: 'food',
            stock: 0,
            isActive: true,
            isPremium: false,
            expiryHours: 72,
            partnerName: 'Partner',
            partnerLogo: '',
            description: '',
            image: '',
          },
        ],
      })

      const filtered = store.getFilteredGifts()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('gift-1')
    })

    it('should filter premium gifts for free users', () => {
      const store = useAppStore.getState()

      useAppStore.setState({
        currentUser: {
          id: 'user-1',
          phone: '+905551234567',
          name: 'John',
          role: 'user',
          tier: 'free',
          iyikiScore: 0,
          dailySendCount: 0,
          dailySendLimit: 1,
          dailyReceiveCount: 0,
          status: 'active',
          createdAt: '2026-01-01T00:00:00Z',
          notificationPrefs: { push: true, sms: true },
        },
        gifts: [
          {
            id: 'gift-1',
            partnerId: 'partner-1',
            name: 'Free Gift',
            category: 'coffee',
            stock: 10,
            isActive: true,
            isPremium: false,
            expiryHours: 72,
            partnerName: 'Starbucks',
            partnerLogo: '',
            description: '',
            image: '',
          },
          {
            id: 'gift-2',
            partnerId: 'partner-2',
            name: 'Premium Gift',
            category: 'food',
            stock: 5,
            isActive: true,
            isPremium: true,
            expiryHours: 72,
            partnerName: 'Partner',
            partnerLogo: '',
            description: '',
            image: '',
          },
        ],
      })

      const filtered = store.getFilteredGifts()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].isPremium).toBe(false)
    })

    it('should show premium gifts for premium users', () => {
      const store = useAppStore.getState()

      useAppStore.setState({
        currentUser: {
          id: 'user-1',
          phone: '+905551234567',
          name: 'John',
          role: 'user',
          tier: 'premium',
          iyikiScore: 0,
          dailySendCount: 0,
          dailySendLimit: 3,
          dailyReceiveCount: 0,
          status: 'active',
          createdAt: '2026-01-01T00:00:00Z',
          notificationPrefs: { push: true, sms: true },
        },
        gifts: [
          {
            id: 'gift-2',
            partnerId: 'partner-2',
            name: 'Premium Gift',
            category: 'food',
            stock: 5,
            isActive: true,
            isPremium: true,
            expiryHours: 72,
            partnerName: 'Partner',
            partnerLogo: '',
            description: '',
            image: '',
          },
        ],
      })

      const filtered = store.getFilteredGifts()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].isPremium).toBe(true)
    })

    it('should filter by selected category', () => {
      const store = useAppStore.getState()

      useAppStore.setState({
        selectedCategory: 'coffee',
        gifts: [
          {
            id: 'gift-1',
            partnerId: 'partner-1',
            name: 'Coffee',
            category: 'coffee',
            stock: 10,
            isActive: true,
            isPremium: false,
            expiryHours: 72,
            partnerName: 'Starbucks',
            partnerLogo: '',
            description: '',
            image: '',
          },
          {
            id: 'gift-2',
            partnerId: 'partner-2',
            name: 'Pizza',
            category: 'food',
            stock: 5,
            isActive: true,
            isPremium: false,
            expiryHours: 72,
            partnerName: 'Dominos',
            partnerLogo: '',
            description: '',
            image: '',
          },
        ],
      })

      const filtered = store.getFilteredGifts()

      expect(filtered).toHaveLength(1)
      expect(filtered[0].category).toBe('coffee')
    })
  })

  describe('markNotificationRead', () => {
    it('should mark notification as read', () => {
      const store = useAppStore.getState()

      useAppStore.setState({
        notifications: [
          {
            id: 'notif-1',
            userId: 'user-1',
            type: 'gift_received',
            title: 'Hediye',
            message: 'Hediye aldın',
            isRead: false,
            createdAt: '2026-04-04T12:00:00Z',
          },
        ],
        unreadCount: 1,
      })

      store.markNotificationRead('notif-1')

      const state = useAppStore.getState()
      expect(state.notifications[0].isRead).toBe(true)
      expect(state.unreadCount).toBe(0)
    })

    it('should decrease unread count', () => {
      const store = useAppStore.getState()

      useAppStore.setState({
        notifications: [
          {
            id: 'notif-1',
            userId: 'user-1',
            type: 'gift_received',
            title: 'Hediye',
            message: 'Hediye aldın',
            isRead: false,
            createdAt: '2026-04-04T12:00:00Z',
          },
          {
            id: 'notif-2',
            userId: 'user-1',
            type: 'gift_redeemed',
            title: 'Hediye Kullanıldı',
            message: 'Hediye kullanıldı',
            isRead: false,
            createdAt: '2026-04-04T12:00:00Z',
          },
        ],
        unreadCount: 2,
      })

      store.markNotificationRead('notif-1')

      expect(useAppStore.getState().unreadCount).toBe(1)
    })
  })

  describe('markAllRead', () => {
    it('should mark all notifications as read', () => {
      const store = useAppStore.getState()

      useAppStore.setState({
        notifications: [
          {
            id: 'notif-1',
            userId: 'user-1',
            type: 'gift_received',
            title: 'Hediye',
            message: 'Hediye aldın',
            isRead: false,
            createdAt: '2026-04-04T12:00:00Z',
          },
          {
            id: 'notif-2',
            userId: 'user-1',
            type: 'gift_redeemed',
            title: 'Hediye Kullanıldı',
            message: 'Hediye kullanıldı',
            isRead: false,
            createdAt: '2026-04-04T12:00:00Z',
          },
        ],
        unreadCount: 2,
      })

      store.markAllRead()

      const state = useAppStore.getState()
      expect(state.notifications.every(n => n.isRead)).toBe(true)
      expect(state.unreadCount).toBe(0)
    })
  })

  describe('getReceivedGifts', () => {
    it('should return gifts received by current user', () => {
      const store = useAppStore.getState()

      useAppStore.setState({
        currentUser: {
          id: 'user-1',
          phone: '+905551234567',
          name: 'John',
          role: 'user',
          tier: 'free',
          iyikiScore: 0,
          dailySendCount: 0,
          dailySendLimit: 1,
          dailyReceiveCount: 0,
          status: 'active',
          createdAt: '2026-01-01T00:00:00Z',
          notificationPrefs: { push: true, sms: true },
        },
        giftActions: [
          {
            id: 'action-1',
            giftId: 'gift-1',
            senderId: 'user-2',
            receiverPhone: '+905551234567',
            status: 'pending',
            redeemCode: 'ABC123',
            createdAt: '2026-04-04T12:00:00Z',
            expiresAt: '2026-04-07T12:00:00Z',
            gift: {
              id: 'gift-1',
              partnerId: 'partner-1',
              name: 'Coffee',
              category: 'coffee',
              stock: 10,
              isActive: true,
              isPremium: false,
              expiryHours: 72,
              partnerName: 'Starbucks',
              partnerLogo: '',
              description: '',
              image: '',
            },
          } as any,
        ],
      })

      const received = store.getReceivedGifts()

      expect(received).toHaveLength(1)
      expect(received[0].receiverPhone).toBe('+905551234567')
    })

    it('should return empty array if no current user', () => {
      const store = useAppStore.getState()

      useAppStore.setState({
        currentUser: null,
        giftActions: [
          {
            id: 'action-1',
            giftId: 'gift-1',
            senderId: 'user-2',
            receiverPhone: '+905551234567',
            status: 'pending',
            redeemCode: 'ABC123',
            createdAt: '2026-04-04T12:00:00Z',
            expiresAt: '2026-04-07T12:00:00Z',
          } as any,
        ],
      })

      const received = store.getReceivedGifts()

      expect(received).toEqual([])
    })
  })

  describe('getSentGifts', () => {
    it('should return gifts sent by current user', () => {
      const store = useAppStore.getState()

      useAppStore.setState({
        currentUser: {
          id: 'user-1',
          phone: '+905551234567',
          name: 'John',
          role: 'user',
          tier: 'free',
          iyikiScore: 0,
          dailySendCount: 0,
          dailySendLimit: 1,
          dailyReceiveCount: 0,
          status: 'active',
          createdAt: '2026-01-01T00:00:00Z',
          notificationPrefs: { push: true, sms: true },
        },
        giftActions: [
          {
            id: 'action-1',
            giftId: 'gift-1',
            senderId: 'user-1',
            receiverPhone: '+905559999999',
            status: 'pending',
            redeemCode: 'ABC123',
            createdAt: '2026-04-04T12:00:00Z',
            expiresAt: '2026-04-07T12:00:00Z',
            gift: {
              id: 'gift-1',
              partnerId: 'partner-1',
              name: 'Coffee',
              category: 'coffee',
              stock: 10,
              isActive: true,
              isPremium: false,
              expiryHours: 72,
              partnerName: 'Starbucks',
              partnerLogo: '',
              description: '',
              image: '',
            },
          } as any,
        ],
      })

      const sent = store.getSentGifts()

      expect(sent).toHaveLength(1)
      expect(sent[0].senderId).toBe('user-1')
    })

    it('should return empty array if no current user', () => {
      const store = useAppStore.getState()

      const sent = store.getSentGifts()

      expect(sent).toEqual([])
    })
  })
})
