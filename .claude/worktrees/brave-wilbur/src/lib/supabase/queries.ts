import { createClient } from './client';
import { mapUser, mapGift, mapGiftAction, mapPartner, mapSponsor, mapNotification, mapFraudFlag } from './mappers';
import type { User, Gift, GiftAction, Partner, Sponsor, Notification, FraudFlag } from '@/types';

function getSupabase() {
  return createClient();
}

// ==========================================
// USERS
// ==========================================

export async function fetchCurrentUser(userId: string): Promise<User | null> {
  const { data, error } = await getSupabase()
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !data) return null;
  return mapUser(data);
}

export async function updateUser(userId: string, updates: Partial<Record<string, unknown>>): Promise<boolean> {
  const { error } = await getSupabase()
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);
  
  return !error;
}

export async function fetchAllUsers(): Promise<User[]> {
  const { data, error } = await getSupabase()
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapUser);
}

// ==========================================
// GIFTS
// ==========================================

export async function fetchGifts(): Promise<Gift[]> {
  const { data, error } = await getSupabase()
    .from('gifts')
    .select(`
      *,
      partners:partner_id (name, logo),
      sponsors:sponsor_id (name, logo)
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  
  if (error || !data) return [];
  return data.map(mapGift);
}

// ==========================================
// GIFT ACTIONS
// ==========================================

export async function fetchGiftActions(userId: string, phone: string): Promise<GiftAction[]> {
  const { data, error } = await getSupabase()
    .from('gift_actions')
    .select(`
      *,
      gifts:gift_id (*, partners:partner_id (name, logo), sponsors:sponsor_id (name, logo))
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId},receiver_phone.eq.${phone}`)
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapGiftAction);
}

export async function fetchAllGiftActions(): Promise<GiftAction[]> {
  const { data, error } = await getSupabase()
    .from('gift_actions')
    .select(`
      *,
      gifts:gift_id (*, partners:partner_id (name, logo), sponsors:sponsor_id (name, logo)),
      sender:sender_id (name, phone),
      receiver:receiver_id (name, phone)
    `)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error || !data) return [];
  return data.map(mapGiftAction);
}

export async function createGiftAction(action: {
  giftId: string;
  senderId: string;
  receiverPhone: string;
  note?: string;
  redeemCode: string;
  expiresAt: string;
}): Promise<GiftAction | null> {
  const { data, error } = await getSupabase()
    .from('gift_actions')
    .insert({
      gift_id: action.giftId,
      sender_id: action.senderId,
      receiver_phone: action.receiverPhone,
      note: action.note,
      redeem_code: action.redeemCode,
      expires_at: action.expiresAt,
      status: 'pending',
    })
    .select(`
      *,
      gifts:gift_id (*, partners:partner_id (name, logo), sponsors:sponsor_id (name, logo))
    `)
    .single();
  
  if (error || !data) return null;
  return mapGiftAction(data);
}

export async function redeemGiftAction(actionId: string, branchId: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('gift_actions')
    .update({
      status: 'claimed',
      claimed_at: new Date().toISOString(),
      branch_id: branchId,
    })
    .eq('id', actionId);
  
  return !error;
}

// ==========================================
// PARTNERS & BRANCHES
// ==========================================

export async function fetchPartners(): Promise<Partner[]> {
  const { data, error } = await getSupabase()
    .from('partners')
    .select('*, branches (*)')
    .eq('is_active', true);
  
  if (error || !data) return [];
  return data.map(mapPartner);
}

// ==========================================
// SPONSORS
// ==========================================

export async function fetchSponsors(): Promise<Sponsor[]> {
  const { data, error } = await getSupabase()
    .from('sponsors')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapSponsor);
}

// ==========================================
// NOTIFICATIONS
// ==========================================

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await getSupabase()
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error || !data) return [];
  return data.map(mapNotification);
}

export async function markNotificationRead(notifId: string): Promise<boolean> {
  const { error } = await getSupabase()
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notifId);
  
  return !error;
}

export async function createNotification(notif: {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionId?: string;
}): Promise<boolean> {
  const { error } = await getSupabase()
    .from('notifications')
    .insert({
      user_id: notif.userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      action_id: notif.actionId,
    });
  
  return !error;
}

// ==========================================
// FRAUD FLAGS
// ==========================================

export async function fetchFraudFlags(): Promise<FraudFlag[]> {
  const { data, error } = await getSupabase()
    .from('fraud_flags')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapFraudFlag);
}

// ==========================================
// GIFT STOCK
// ==========================================

export async function decrementGiftStock(giftId: string): Promise<boolean> {
  const { error } = await getSupabase().rpc('decrement_gift_stock', { p_gift_id: giftId });
  return !error;
}

export async function incrementUserScore(userId: string): Promise<boolean> {
  const { error } = await getSupabase().rpc('increment_user_score', { p_user_id: userId });
  return !error;
}
