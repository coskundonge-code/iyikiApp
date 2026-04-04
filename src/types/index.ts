export type UserRole = 'user' | 'admin' | 'partner' | 'sponsor';
export type UserStatus = 'active' | 'suspended' | 'deleted';
export type GiftStatus = 'pending' | 'claimed' | 'expired' | 'social_pool' | 'distributed';
export type PremiumTier = 'free' | 'premium';

export interface User {
  id: string;
  phone: string;
  name?: string;
  avatar?: string;
  birthday?: string;
  role: UserRole;
  tier: PremiumTier;
  iyikiScore: number;
  dailySendCount: number;
  dailySendLimit: number;
  dailyReceiveCount: number;
  createdAt: string;
  status: UserStatus;
  notificationPrefs: {
    push: boolean;
    sms: boolean;
  };
}

export interface Gift {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerLogo: string;
  name: string;
  description: string;
  image: string;
  productLogo?: string;
  corporateLogo?: string;
  category: GiftCategory;
  stock: number;
  expiryHours: number;
  sponsorId?: string;
  sponsorName?: string;
  isActive: boolean;
  isPremium: boolean;
}

export type GiftCategory = 'coffee' | 'chocolate' | 'book' | 'flower' | 'experience' | 'food';

export interface GiftAction {
  id: string;
  giftId: string;
  gift: Gift;
  senderId: string;
  senderName: string;
  receiverId?: string;
  receiverPhone: string;
  receiverName?: string;
  note?: string;
  quickNote?: string;
  status: GiftStatus;
  redeemCode: string;
  createdAt: string;
  expiresAt: string;
  claimedAt?: string;
  branchId?: string;
  branchName?: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  apiKey: string;
  isActive: boolean;
  totalGifts: number;
  totalRedeemed: number;
  branches: Branch[];
}

export interface Branch {
  id: string;
  partnerId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  stockStatus: 'available' | 'low' | 'out';
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  budget: number;
  spent: number;
  campaignStart: string;
  campaignEnd: string;
  isActive: boolean;
  giftsSponsoredCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'gift_received' | 'gift_redeemed' | 'gift_expiring' | 'gift_expired' | 'gift_to_pool' | 'system' | 'premium';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionId?: string;
}

export interface FraudFlag {
  id: string;
  userId: string;
  type: 'looping' | 'fake_gps' | 'emulator' | 'cloning' | 'rate_abuse';
  severity: 'low' | 'medium' | 'high';
  description: string;
  createdAt: string;
  resolved: boolean;
}

export interface DailyStats {
  totalGiftsSent: number;
  totalGiftsRedeemed: number;
  totalNewUsers: number;
  totalAskida: number;
  activeUsers: number;
}

export interface CategoryInfo {
  id: GiftCategory;
  name: string;
  emoji: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'coffee', name: 'Kahve', emoji: '☕' },
  { id: 'chocolate', name: 'Tatlı', emoji: '🍫' },
  { id: 'book', name: 'Kitap', emoji: '📖' },
  { id: 'flower', name: 'Çiçek', emoji: '🌹' },
  { id: 'experience', name: 'Deneyim', emoji: '✨' },
  { id: 'food', name: 'Yemek', emoji: '🍽️' },
];

export const QUICK_NOTES = [
  'Bugün aklıma geldin',
  'Sebepsiz',
  'Geçen hafta için',
  'Teşekkürler',
  'İyi ki varsın',
  'Kendine iyi bak',
];

// ==========================================
// PAZAR ARAŞTIRMASI - YENİ ÖZELLİKLER
// ==========================================

// Haftalık Drop (Claim modeli)
export interface WeeklyDrop {
  id: string;
  title: string;
  description: string;
  gifts: Gift[];
  totalStock: number;
  claimedCount: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

// Başarım/Rozet sistemi
export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement: number;
  type: 'send' | 'receive' | 'streak' | 'social' | 'community';
  unlockedAt?: string;
}

// Topluluk Kampanyası (Üniversite modu - PIF modeli)
export interface CommunityPool {
  id: string;
  name: string;
  emoji: string;
  description: string;
  type: 'university' | 'event' | 'neighborhood' | 'workplace';
  memberCount: number;
  giftsShared: number;
  isActive: boolean;
  requirement?: string; // ör. ".edu.tr e-posta"
}

// 1+1 İkram (Claim multiplayer modeli)
export interface PlusOneOffer {
  id: string;
  giftId: string;
  giftName: string;
  giftImage: string;
  sponsorName: string;
  message: string;
  isActive: boolean;
}

// Al-Ver Dengesi
export interface GiveGetRatio {
  totalSent: number;
  totalReceived: number;
  ratio: number; // sent/received
  status: 'generous' | 'balanced' | 'receiver';
  message: string;
}

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'first-gift', name: 'İlk Jest', description: 'İlk hediyeni gönder', emoji: '🎁', requirement: 1, type: 'send' },
  { id: 'five-gifts', name: 'Jest Ustası', description: '5 hediye gönder', emoji: '⭐', requirement: 5, type: 'send' },
  { id: 'ten-gifts', name: 'Jest Kahramanı', description: '10 hediye gönder', emoji: '🏆', requirement: 10, type: 'send' },
  { id: 'twenty-five-gifts', name: 'Jest Efsanesi', description: '25 hediye gönder', emoji: '👑', requirement: 25, type: 'send' },
  { id: 'first-receive', name: 'Seviliyorsun', description: 'İlk hediyeni al', emoji: '💝', requirement: 1, type: 'receive' },
  { id: 'five-receive', name: 'Popüler', description: '5 hediye al', emoji: '🌟', requirement: 5, type: 'receive' },
  { id: 'streak-3', name: '3 Gün Üst Üste', description: '3 gün art arda hediye gönder', emoji: '🔥', requirement: 3, type: 'streak' },
  { id: 'streak-7', name: 'Haftalık Seri', description: '7 gün art arda hediye gönder', emoji: '💫', requirement: 7, type: 'streak' },
  { id: 'askida-hero', name: 'Askıda Kahraman', description: 'Hediyenin askıda birine ulaşsın', emoji: '💛', requirement: 1, type: 'social' },
  { id: 'community-join', name: 'Topluluk Üyesi', description: 'Bir topluluğa katıl', emoji: '🤝', requirement: 1, type: 'community' },
  { id: 'drop-hunter', name: 'Drop Avcısı', description: 'Haftalık Drop\'tan hediye yakala', emoji: '⚡', requirement: 1, type: 'community' },
  { id: 'plus-one', name: 'Beraber Güzel', description: '1+1 İkram kullan', emoji: '👫', requirement: 1, type: 'social' },
];
