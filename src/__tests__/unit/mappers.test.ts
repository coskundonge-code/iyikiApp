import { describe, it, expect } from 'vitest'
import {
  mapUser,
  mapGift,
  mapGiftAction,
  mapPartner,
  mapBranch,
  mapSponsor,
  mapNotification,
  mapFraudFlag,
} from '@/lib/supabase/mappers'

describe('Data Mappers', () => {
  describe('mapUser', () => {
    it('should map user with all fields', () => {
      const row = {
        id: 'user-1',
        phone: '+905551234567',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        birthday: '1990-01-15',
        role: 'user',
        tier: 'premium',
        iyki_score: 100,
        daily_send_count: 2,
        daily_send_limit: 3,
        daily_receive_count: 5,
        created_at: '2026-01-01T00:00:00Z',
        status: 'active',
        push_enabled: true,
        sms_enabled: false,
      }

      const user = mapUser(row)

      expect(user.id).toBe('user-1')
      expect(user.phone).toBe('+905551234567')
      expect(user.name).toBe('John Doe')
      expect(user.avatar).toBe('https://example.com/avatar.jpg')
      expect(user.birthday).toBe('1990-01-15')
      expect(user.role).toBe('user')
      expect(user.tier).toBe('premium')
      expect(user.iyikiScore).toBe(100)
      expect(user.dailySendCount).toBe(2)
      expect(user.dailySendLimit).toBe(3)
      expect(user.dailyReceiveCount).toBe(5)
      expect(user.status).toBe('active')
      expect(user.notificationPrefs.push).toBe(true)
      expect(user.notificationPrefs.sms).toBe(false)
    })

    it('should apply defaults for missing fields', () => {
      const row = {
        id: 'user-2',
        phone: '+905551234567',
      }

      const user = mapUser(row)

      expect(user.name).toBeUndefined()
      expect(user.role).toBe('user')
      expect(user.tier).toBe('free')
      expect(user.iyikiScore).toBe(0)
      expect(user.status).toBe('active')
    })

    it('should default notification prefs to true', () => {
      const row = {
        id: 'user-3',
        phone: '+905551234567',
      }

      const user = mapUser(row)

      expect(user.notificationPrefs.push).toBe(true)
      expect(user.notificationPrefs.sms).toBe(true)
    })
  })

  describe('mapGift', () => {
    it('should map gift with partner and sponsor', () => {
      const row = {
        id: 'gift-1',
        partner_id: 'partner-1',
        partners: {
          name: 'Starbucks',
          logo: 'https://example.com/starbucks.png',
        },
        name: 'Coffee',
        description: 'Free coffee',
        image: 'https://example.com/coffee.jpg',
        category: 'coffee',
        stock: 50,
        expiry_hours: 72,
        sponsor_id: 'sponsor-1',
        sponsors: {
          name: 'Garanti BBVA',
        },
        is_active: true,
        is_premium: false,
      }

      const gift = mapGift(row)

      expect(gift.id).toBe('gift-1')
      expect(gift.partnerId).toBe('partner-1')
      expect(gift.partnerName).toBe('Starbucks')
      expect(gift.partnerLogo).toBe('https://example.com/starbucks.png')
      expect(gift.name).toBe('Coffee')
      expect(gift.description).toBe('Free coffee')
      expect(gift.image).toBe('https://example.com/coffee.jpg')
      expect(gift.category).toBe('coffee')
      expect(gift.stock).toBe(50)
      expect(gift.expiryHours).toBe(72)
      expect(gift.sponsorId).toBe('sponsor-1')
      expect(gift.sponsorName).toBe('Garanti BBVA')
      expect(gift.isActive).toBe(true)
      expect(gift.isPremium).toBe(false)
    })

    it('should handle gift without partner or sponsor', () => {
      const row = {
        id: 'gift-2',
        partner_id: 'partner-2',
        name: 'Gift',
        category: 'other',
        stock: 10,
      }

      const gift = mapGift(row)

      expect(gift.partnerName).toBe('')
      expect(gift.partnerLogo).toBe('')
      expect(gift.sponsorName).toBeUndefined()
      expect(gift.sponsorId).toBeUndefined()
    })

    it('should apply defaults for missing fields', () => {
      const row = {
        id: 'gift-3',
        partner_id: 'partner-3',
        name: 'Test Gift',
        category: 'food',
      }

      const gift = mapGift(row)

      expect(gift.description).toBe('')
      expect(gift.image).toBe('')
      expect(gift.stock).toBe(0)
      expect(gift.expiryHours).toBe(72)
      expect(gift.isActive).toBe(true)
      expect(gift.isPremium).toBe(false)
    })
  })

  describe('mapGiftAction', () => {
    it('should map gift action with nested gift', () => {
      const row = {
        id: 'action-1',
        gift_id: 'gift-1',
        gifts: {
          id: 'gift-1',
          name: 'Coffee',
          category: 'coffee',
        },
        sender_id: 'user-1',
        sender: { name: 'John' },
        receiver_id: 'user-2',
        receiver: { name: 'Jane' },
        receiver_phone: '+905551234567',
        receiver_name: 'Jane',
        note: 'Enjoy!',
        status: 'pending',
        redeem_code: 'ABC123',
        created_at: '2026-01-01T00:00:00Z',
        expires_at: '2026-01-04T00:00:00Z',
        claimed_at: '2026-01-02T00:00:00Z',
        branch_id: 'branch-1',
      }

      const action = mapGiftAction(row)

      expect(action.id).toBe('action-1')
      expect(action.giftId).toBe('gift-1')
      expect(action.gift.name).toBe('Coffee')
      expect(action.senderId).toBe('user-1')
      expect(action.senderName).toBe('John')
      expect(action.receiverId).toBe('user-2')
      expect(action.receiverPhone).toBe('+905551234567')
      expect(action.receiverName).toBe('Jane')
      expect(action.note).toBe('Enjoy!')
      expect(action.status).toBe('pending')
      expect(action.redeemCode).toBe('ABC123')
      expect(action.claimedAt).toBe('2026-01-02T00:00:00Z')
      expect(action.branchId).toBe('branch-1')
    })

    it('should handle action without nested gift', () => {
      const row = {
        id: 'action-2',
        gift_id: 'gift-2',
        sender_id: 'user-1',
        receiver_phone: '+905551234567',
        status: 'pending',
        redeem_code: 'XYZ789',
        created_at: '2026-01-01T00:00:00Z',
        expires_at: '2026-01-04T00:00:00Z',
      }

      const action = mapGiftAction(row)

      expect(action.gift.name).toBe('Hediye')
      expect(action.senderName).toBe('Bilinmeyen')
    })

    it('should apply defaults for optional fields', () => {
      const row = {
        id: 'action-3',
        gift_id: 'gift-3',
        sender_id: 'user-1',
        receiver_phone: '+905551234567',
        status: 'pending',
        redeem_code: 'DEF456',
        created_at: '2026-01-01T00:00:00Z',
        expires_at: '2026-01-04T00:00:00Z',
      }

      const action = mapGiftAction(row)

      expect(action.receiverId).toBeUndefined()
      expect(action.receiverName).toBeUndefined()
      expect(action.note).toBeUndefined()
      expect(action.claimedAt).toBeUndefined()
      expect(action.branchId).toBeUndefined()
    })
  })

  describe('mapPartner', () => {
    it('should map partner with branches', () => {
      const row = {
        id: 'partner-1',
        name: 'Starbucks',
        logo: 'https://example.com/logo.png',
        api_key: 'key-123',
        is_active: true,
        branches: [
          {
            id: 'branch-1',
            partner_id: 'partner-1',
            name: 'Istanbul',
            address: 'Taksim',
            lat: 41.0,
            lng: 29.0,
          },
        ],
      }

      const partner = mapPartner(row)

      expect(partner.id).toBe('partner-1')
      expect(partner.name).toBe('Starbucks')
      expect(partner.logo).toBe('https://example.com/logo.png')
      expect(partner.apiKey).toBe('key-123')
      expect(partner.isActive).toBe(true)
      expect(partner.branches).toHaveLength(1)
      expect(partner.branches[0].name).toBe('Istanbul')
    })

    it('should handle partner without branches', () => {
      const row = {
        id: 'partner-2',
        name: 'Partner Name',
      }

      const partner = mapPartner(row)

      expect(partner.branches).toHaveLength(0)
    })
  })

  describe('mapBranch', () => {
    it('should map branch correctly', () => {
      const row = {
        id: 'branch-1',
        partner_id: 'partner-1',
        name: 'Istanbul Taksim',
        address: 'Taksim Meydanı',
        lat: 41.036,
        lng: 29.017,
      }

      const branch = mapBranch(row)

      expect(branch.id).toBe('branch-1')
      expect(branch.partnerId).toBe('partner-1')
      expect(branch.name).toBe('Istanbul Taksim')
      expect(branch.address).toBe('Taksim Meydanı')
      expect(branch.lat).toBe(41.036)
      expect(branch.lng).toBe(29.017)
      expect(branch.stockStatus).toBe('available')
    })

    it('should default lat/lng to 0', () => {
      const row = {
        id: 'branch-2',
        partner_id: 'partner-2',
        name: 'Branch',
        address: 'Address',
      }

      const branch = mapBranch(row)

      expect(branch.lat).toBe(0)
      expect(branch.lng).toBe(0)
    })
  })

  describe('mapSponsor', () => {
    it('should map sponsor with all fields', () => {
      const row = {
        id: 'sponsor-1',
        name: 'Garanti BBVA',
        logo: 'https://example.com/sponsor-logo.png',
        budget: 10000,
        spent: 5000,
        campaign_start: '2026-01-01T00:00:00Z',
        campaign_end: '2026-12-31T23:59:59Z',
        is_active: true,
        gifts_sponsored_count: 25,
      }

      const sponsor = mapSponsor(row)

      expect(sponsor.id).toBe('sponsor-1')
      expect(sponsor.name).toBe('Garanti BBVA')
      expect(sponsor.logo).toBe('https://example.com/sponsor-logo.png')
      expect(sponsor.budget).toBe(10000)
      expect(sponsor.spent).toBe(5000)
      expect(sponsor.campaignStart).toBe('2026-01-01T00:00:00Z')
      expect(sponsor.campaignEnd).toBe('2026-12-31T23:59:59Z')
      expect(sponsor.isActive).toBe(true)
      expect(sponsor.giftsSponsoredCount).toBe(25)
    })

    it('should apply defaults for missing fields', () => {
      const row = {
        id: 'sponsor-2',
        name: 'Sponsor Name',
      }

      const sponsor = mapSponsor(row)

      expect(sponsor.logo).toBe('')
      expect(sponsor.budget).toBe(0)
      expect(sponsor.spent).toBe(0)
      expect(sponsor.isActive).toBe(true)
      expect(sponsor.giftsSponsoredCount).toBe(0)
    })
  })

  describe('mapNotification', () => {
    it('should map notification with all fields', () => {
      const row = {
        id: 'notif-1',
        user_id: 'user-1',
        type: 'gift_received',
        title: 'Yeni Hediye',
        message: 'Bir hediye aldın!',
        is_read: false,
        created_at: '2026-04-04T12:00:00Z',
        action_id: 'action-1',
      }

      const notif = mapNotification(row)

      expect(notif.id).toBe('notif-1')
      expect(notif.userId).toBe('user-1')
      expect(notif.type).toBe('gift_received')
      expect(notif.title).toBe('Yeni Hediye')
      expect(notif.message).toBe('Bir hediye aldın!')
      expect(notif.isRead).toBe(false)
      expect(notif.createdAt).toBe('2026-04-04T12:00:00Z')
      expect(notif.actionId).toBe('action-1')
    })

    it('should default is_read to false', () => {
      const row = {
        id: 'notif-2',
        user_id: 'user-2',
        type: 'system',
        title: 'System',
        message: 'Message',
        created_at: '2026-04-04T12:00:00Z',
      }

      const notif = mapNotification(row)

      expect(notif.isRead).toBe(false)
      expect(notif.actionId).toBeUndefined()
    })
  })

  describe('mapFraudFlag', () => {
    it('should map fraud flag with all fields', () => {
      const row = {
        id: 'fraud-1',
        user_id: 'user-1',
        type: 'multiple_accounts',
        severity: 'high',
        description: 'User created multiple accounts',
        created_at: '2026-04-04T12:00:00Z',
        resolved: true,
      }

      const flag = mapFraudFlag(row)

      expect(flag.id).toBe('fraud-1')
      expect(flag.userId).toBe('user-1')
      expect(flag.type).toBe('multiple_accounts')
      expect(flag.severity).toBe('high')
      expect(flag.description).toBe('User created multiple accounts')
      expect(flag.createdAt).toBe('2026-04-04T12:00:00Z')
      expect(flag.resolved).toBe(true)
    })

    it('should default resolved to false', () => {
      const row = {
        id: 'fraud-2',
        user_id: 'user-2',
        type: 'suspicious_activity',
        severity: 'medium',
        description: 'Suspicious activity detected',
        created_at: '2026-04-04T12:00:00Z',
      }

      const flag = mapFraudFlag(row)

      expect(flag.resolved).toBe(false)
    })
  })
})
