'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  mapUser,
  mapGift,
  mapGiftAction,
  mapPartner,
  mapSponsor,
  mapNotification,
  mapFraudFlag,
} from '@/lib/supabase/mappers';
import type { User, Gift, GiftAction, Partner, Sponsor, Notification, FraudFlag, DailyStats } from '@/types';

export interface ServerActionResponse<T = unknown> {
  data: T | null;
  error: string | null;
}

// ==========================================
// USERS
// ==========================================

/**
 * Fetch a single user by ID
 */
export async function getUserById(userId: string): Promise<ServerActionResponse<User>> {
  try {
    if (!userId || userId.trim().length === 0) {
      return { data: null, error: 'User ID is required' };
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return { data: null, error: 'User not found' };
    }

    return { data: mapUser(data), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user';
    return { data: null, error: message };
  }
}

/**
 * Get all users (admin only)
 */
export async function getUsers(): Promise<ServerActionResponse<User[]>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return { data: [], error: null };
    }

    return { data: data.map(mapUser), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch users';
    return { data: null, error: message };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    name: string;
    avatar: string;
    birthday: string;
  }>,
): Promise<ServerActionResponse<User>> {
  try {
    if (!userId || userId.trim().length === 0) {
      return { data: null, error: 'User ID is required' };
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .update({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.avatar !== undefined && { avatar: updates.avatar }),
        ...(updates.birthday !== undefined && { birthday: updates.birthday }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) {
      return { data: null, error: 'Failed to update user profile' };
    }

    return { data: mapUser(data), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update user profile';
    return { data: null, error: message };
  }
}

// ==========================================
// GIFTS
// ==========================================

/**
 * Get all active gifts with partner and sponsor details
 */
export async function getGifts(): Promise<ServerActionResponse<Gift[]>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('gifts')
      .select(`
        *,
        partners:partner_id (name, logo),
        sponsors:sponsor_id (name, logo)
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data) {
      return { data: [], error: null };
    }

    return { data: data.map(mapGift), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch gifts';
    return { data: null, error: message };
  }
}

/**
 * Get gift actions for a specific user
 */
export async function getGiftActions(userId: string, phone: string): Promise<ServerActionResponse<GiftAction[]>> {
  try {
    if (!userId || userId.trim().length === 0) {
      return { data: null, error: 'User ID is required' };
    }

    if (!phone || phone.trim().length === 0) {
      return { data: null, error: 'Phone number is required' };
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('gift_actions')
      .select(`
        *,
        gifts:gift_id (*, partners:partner_id (name, logo), sponsors:sponsor_id (name, logo))
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId},receiver_phone.eq.${phone}`)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return { data: [], error: null };
    }

    return { data: data.map(mapGiftAction), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch gift actions';
    return { data: null, error: message };
  }
}

/**
 * Get all gift actions (admin only)
 */
export async function getAllGiftActions(): Promise<ServerActionResponse<GiftAction[]>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('gift_actions')
      .select(`
        *,
        gifts:gift_id (*, partners:partner_id (name, logo), sponsors:sponsor_id (name, logo)),
        sender:sender_id (name, phone),
        receiver:receiver_id (name, phone)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) {
      return { data: [], error: null };
    }

    return { data: data.map(mapGiftAction), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch all gift actions';
    return { data: null, error: message };
  }
}

/**
 * Send a gift - creates gift action, decrements stock, and increments sender's score
 */
export async function sendGift(
  senderId: string,
  giftData: {
    giftId: string;
    receiverPhone: string;
    receiverName?: string;
    note?: string;
  },
): Promise<ServerActionResponse<GiftAction>> {
  try {
    if (!senderId || senderId.trim().length === 0) {
      return { data: null, error: 'Sender ID is required' };
    }

    if (!giftData.giftId || giftData.giftId.trim().length === 0) {
      return { data: null, error: 'Gift ID is required' };
    }

    if (!giftData.receiverPhone || giftData.receiverPhone.trim().length === 0) {
      return { data: null, error: 'Receiver phone is required' };
    }

    const supabase = await createServerSupabaseClient();

    // Check gift exists and has stock
    const { data: giftData_raw, error: giftError } = await supabase
      .from('gifts')
      .select('stock')
      .eq('id', giftData.giftId)
      .single();

    if (giftError || !giftData_raw || giftData_raw.stock <= 0) {
      return { data: null, error: 'Gift is not available' };
    }

    // Generate redeem code
    const redeemCode = Math.random().toString(36).substring(2, 12).toUpperCase();

    // Create gift action
    const { data: actionData, error: actionError } = await supabase
      .from('gift_actions')
      .insert({
        gift_id: giftData.giftId,
        sender_id: senderId,
        receiver_phone: giftData.receiverPhone,
        receiver_name: giftData.receiverName || undefined,
        note: giftData.note || undefined,
        redeem_code: redeemCode,
        status: 'pending',
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      })
      .select(`
        *,
        gifts:gift_id (*, partners:partner_id (name, logo), sponsors:sponsor_id (name, logo))
      `)
      .single();

    if (actionError || !actionData) {
      return { data: null, error: 'Failed to create gift action' };
    }

    // Atomically decrement gift stock
    const { error: decrementError } = await supabase.rpc('decrement_gift_stock', {
      p_gift_id: giftData.giftId,
    });

    if (decrementError) {
      // Roll back gift action creation
      await supabase.from('gift_actions').delete().eq('id', actionData.id);
      return { data: null, error: 'Failed to update gift stock' };
    }

    // Increment user score
    const { error: scoreError } = await supabase.rpc('increment_user_score', {
      p_user_id: senderId,
    });

    if (scoreError) {
      // Log but don't fail - score increment is secondary
      console.error('Failed to increment user score:', scoreError);
    }

    return { data: mapGiftAction(actionData), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send gift';
    return { data: null, error: message };
  }
}

/**
 * Redeem/claim a gift action at a branch
 */
export async function redeemGift(
  actionId: string,
  branchId: string,
): Promise<ServerActionResponse<GiftAction>> {
  try {
    if (!actionId || actionId.trim().length === 0) {
      return { data: null, error: 'Action ID is required' };
    }

    if (!branchId || branchId.trim().length === 0) {
      return { data: null, error: 'Branch ID is required' };
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('gift_actions')
      .update({
        status: 'claimed',
        claimed_at: new Date().toISOString(),
        branch_id: branchId,
      })
      .eq('id', actionId)
      .select(`
        *,
        gifts:gift_id (*, partners:partner_id (name, logo), sponsors:sponsor_id (name, logo))
      `)
      .single();

    if (error || !data) {
      return { data: null, error: 'Failed to redeem gift' };
    }

    return { data: mapGiftAction(data), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to redeem gift';
    return { data: null, error: message };
  }
}

// ==========================================
// PARTNERS & SPONSORS
// ==========================================

/**
 * Get all active partners with their branches
 */
export async function getPartners(): Promise<ServerActionResponse<Partner[]>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('partners')
      .select('*, branches (*)')
      .eq('is_active', true);

    if (error || !data) {
      return { data: [], error: null };
    }

    return { data: data.map(mapPartner), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch partners';
    return { data: null, error: message };
  }
}

/**
 * Get all sponsors
 */
export async function getSponsors(): Promise<ServerActionResponse<Sponsor[]>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return { data: [], error: null };
    }

    return { data: data.map(mapSponsor), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch sponsors';
    return { data: null, error: message };
  }
}

// ==========================================
// NOTIFICATIONS
// ==========================================

/**
 * Get notifications for a user
 */
export async function getNotifications(userId: string): Promise<ServerActionResponse<Notification[]>> {
  try {
    if (!userId || userId.trim().length === 0) {
      return { data: null, error: 'User ID is required' };
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) {
      return { data: [], error: null };
    }

    return { data: data.map(mapNotification), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
    return { data: null, error: message };
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notifId: string): Promise<ServerActionResponse<Notification>> {
  try {
    if (!notifId || notifId.trim().length === 0) {
      return { data: null, error: 'Notification ID is required' };
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notifId)
      .select()
      .single();

    if (error || !data) {
      return { data: null, error: 'Failed to update notification' };
    }

    return { data: mapNotification(data), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to mark notification as read';
    return { data: null, error: message };
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string): Promise<ServerActionResponse<{ count: number }>> {
  try {
    if (!userId || userId.trim().length === 0) {
      return { data: null, error: 'User ID is required' };
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      return { data: null, error: 'Failed to update notifications' };
    }

    // Get count of updated notifications
    const { data: countData } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', true);

    return { data: { count: countData?.length || 0 }, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to mark all notifications as read';
    return { data: null, error: message };
  }
}

// ==========================================
// ADMIN - FRAUD & STATS
// ==========================================

/**
 * Get fraud flags (admin only)
 */
export async function getFraudFlags(): Promise<ServerActionResponse<FraudFlag[]>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('fraud_flags')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return { data: [], error: null };
    }

    return { data: data.map(mapFraudFlag), error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch fraud flags';
    return { data: null, error: message };
  }
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats(): Promise<ServerActionResponse<DailyStats>> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Fetch stats in parallel
    const [
      { data: giftsToday },
      { data: redeemedToday },
      { data: newUsersToday },
      { data: activeUsersData },
      { data: askidaData },
    ] = await Promise.all([
      supabase
        .from('gift_actions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .eq('status', 'pending'),
      supabase
        .from('gift_actions')
        .select('*', { count: 'exact', head: true })
        .gte('claimed_at', `${today}T00:00:00`)
        .lte('claimed_at', `${today}T23:59:59`)
        .eq('status', 'claimed'),
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`),
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('gift_actions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'social_pool'),
    ]);

    return {
      data: {
        totalGiftsSent: giftsToday?.length || 0,
        totalGiftsRedeemed: redeemedToday?.length || 0,
        totalNewUsers: newUsersToday?.length || 0,
        totalAskida: askidaData?.length || 0,
        activeUsers: activeUsersData?.length || 0,
      },
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch admin stats';
    return { data: null, error: message };
  }
}
