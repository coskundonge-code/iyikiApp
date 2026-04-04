import type { User, Gift, GiftAction, Partner, Branch, Sponsor, Notification, FraudFlag } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export function mapUser(row: any): User {
  return {
    id: row.id,
    phone: row.phone || '',
    name: row.name || undefined,
    avatar: row.avatar || undefined,
    birthday: row.birthday || undefined,
    role: row.role || 'user',
    tier: row.tier || 'free',
    iyikiScore: row.iyki_score || 0,
    dailySendCount: row.daily_send_count || 0,
    dailySendLimit: row.daily_send_limit || 1,
    dailyReceiveCount: row.daily_receive_count || 0,
    createdAt: row.created_at || new Date().toISOString(),
    status: row.status || 'active',
    notificationPrefs: {
      push: row.push_enabled ?? true,
      sms: row.sms_enabled ?? true,
    },
  };
}

export function mapGift(row: any): Gift {
  return {
    id: row.id,
    partnerId: row.partner_id,
    partnerName: row.partners?.name || '',
    partnerLogo: row.partners?.logo || '',
    name: row.name,
    description: row.description || '',
    image: row.image || '',
    category: row.category,
    stock: row.stock || 0,
    expiryHours: row.expiry_hours || 72,
    sponsorId: row.sponsor_id || undefined,
    sponsorName: row.sponsors?.name || undefined,
    isActive: row.is_active ?? true,
    isPremium: row.is_premium ?? false,
  };
}

export function mapGiftAction(row: any): GiftAction {
  const gift = row.gifts ? mapGift(row.gifts) : {
    id: row.gift_id,
    partnerId: '',
    partnerName: '',
    partnerLogo: '',
    name: 'Hediye',
    description: '',
    image: '🎁',
    category: 'coffee' as const,
    stock: 0,
    expiryHours: 72,
    isActive: true,
    isPremium: false,
  };

  return {
    id: row.id,
    giftId: row.gift_id,
    gift,
    senderId: row.sender_id,
    senderName: row.sender?.name || 'Bilinmeyen',
    receiverId: row.receiver_id || undefined,
    receiverPhone: row.receiver_phone,
    receiverName: row.receiver?.name || undefined,
    note: row.note || undefined,
    status: row.status,
    redeemCode: row.redeem_code,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    claimedAt: row.claimed_at || undefined,
    branchId: row.branch_id || undefined,
    branchName: undefined,
  };
}

export function mapPartner(row: any): Partner {
  return {
    id: row.id,
    name: row.name,
    logo: row.logo || '',
    apiKey: row.api_key || '',
    isActive: row.is_active ?? true,
    totalGifts: 0,
    totalRedeemed: 0,
    branches: (row.branches || []).map(mapBranch),
  };
}

export function mapBranch(row: any): Branch {
  return {
    id: row.id,
    partnerId: row.partner_id,
    name: row.name,
    address: row.address,
    lat: row.lat || 0,
    lng: row.lng || 0,
    stockStatus: 'available',
  };
}

export function mapSponsor(row: any): Sponsor {
  return {
    id: row.id,
    name: row.name,
    logo: row.logo || '',
    budget: row.budget || 0,
    spent: row.spent || 0,
    campaignStart: row.campaign_start,
    campaignEnd: row.campaign_end,
    isActive: row.is_active ?? true,
    giftsSponsoredCount: row.gifts_sponsored_count || 0,
  };
}

export function mapNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    isRead: row.is_read ?? false,
    createdAt: row.created_at,
    actionId: row.action_id || undefined,
  };
}

export function mapFraudFlag(row: any): FraudFlag {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    severity: row.severity,
    description: row.description,
    createdAt: row.created_at,
    resolved: row.resolved ?? false,
  };
}
