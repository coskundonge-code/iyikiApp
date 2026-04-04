'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  mapWeeklyDrop,
  mapCommunityPool,
  mapAchievement,
  mapPlusOneOffer,
} from '@/lib/supabase/mappers';
import { ACHIEVEMENTS_LIST } from '@/types';
import type { WeeklyDrop, CommunityPool, Achievement, PlusOneOffer } from '@/types';
import type { ServerActionResponse } from './index';

// ==========================================
// WEEKLY DROPS
// ==========================================

/**
 * Get all active weekly drops
 */
export async function getActiveDrops(): Promise<ServerActionResponse<WeeklyDrop[]>> {
  try {
    const supabase = await createServerSupabaseClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('weekly_drops')
      .select(`
        *,
        drop_gifts (
          *,
          gifts (*)
        )
      `)
      .eq('is_active', true)
      .lte('starts_at', now)
      .gte('ends_at', now);

    if (error) {
      return { data: null, error: error.message };
    }

    const drops = (data || []).map(mapWeeklyDrop);
    return { data: drops, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch drops';
    return { data: null, error: message };
  }
}

/**
 * Claim a gift from a weekly drop
 */
export async function claimDropGift(dropGiftId: string): Promise<ServerActionResponse<{ success: boolean; message: string }>> {
  try {
    if (!dropGiftId || dropGiftId.trim().length === 0) {
      return { data: null, error: 'Drop gift ID is required' };
    }

    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    // Call the RPC function to claim drop gift
    const { data, error } = await supabase.rpc('claim_drop_gift', {
      p_user_id: user.id,
      p_drop_gift_id: dropGiftId,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: { success: data[0]?.success || false, message: data[0]?.message || '' },
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to claim drop gift';
    return { data: null, error: message };
  }
}

// ==========================================
// COMMUNITY POOLS
// ==========================================

/**
 * Get all active community pools
 */
export async function getCommunityPools(): Promise<ServerActionResponse<CommunityPool[]>> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('community_pools')
      .select('*')
      .eq('is_active', true)
      .order('member_count', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    const pools = (data || []).map(mapCommunityPool);
    return { data: pools, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch community pools';
    return { data: null, error: message };
  }
}

/**
 * Get all communities that a user is member of
 */
export async function getUserCommunities(userId: string): Promise<ServerActionResponse<CommunityPool[]>> {
  try {
    if (!userId || userId.trim().length === 0) {
      return { data: null, error: 'User ID is required' };
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('community_members')
      .select('community_pools (*)')
      .eq('user_id', userId);

    if (error) {
      return { data: null, error: error.message };
    }

    const pools = (data || [])
      .map((item: any) => item.community_pools)
      .filter(Boolean)
      .map(mapCommunityPool);

    return { data: pools, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user communities';
    return { data: null, error: message };
  }
}

/**
 * Join a community pool
 */
export async function joinCommunity(poolId: string): Promise<ServerActionResponse<{ success: boolean }>> {
  try {
    if (!poolId || poolId.trim().length === 0) {
      return { data: null, error: 'Pool ID is required' };
    }

    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    // Call the RPC function to join community
    const { data, error } = await supabase.rpc('join_community', {
      p_user_id: user.id,
      p_pool_id: poolId,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: { success: data[0]?.success ?? true }, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to join community';
    return { data: null, error: message };
  }
}

/**
 * Leave a community pool
 */
export async function leaveCommunity(poolId: string): Promise<ServerActionResponse<{ success: boolean }>> {
  try {
    if (!poolId || poolId.trim().length === 0) {
      return { data: null, error: 'Pool ID is required' };
    }

    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    // Call the RPC function to leave community
    const { data, error } = await supabase.rpc('leave_community', {
      p_user_id: user.id,
      p_pool_id: poolId,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: { success: data[0]?.success ?? true }, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to leave community';
    return { data: null, error: message };
  }
}

// ==========================================
// USER ACHIEVEMENTS
// ==========================================

/**
 * Get achievements unlocked by a user
 */
export async function getUserAchievements(userId: string): Promise<ServerActionResponse<Achievement[]>> {
  try {
    if (!userId || userId.trim().length === 0) {
      return { data: null, error: 'User ID is required' };
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    // Enrich with achievement metadata from ACHIEVEMENTS_LIST
    const achievements = (data || [])
      .map((row: any) => {
        const achievementDef = ACHIEVEMENTS_LIST.find((a) => a.id === row.achievement_id);
        return {
          ...achievementDef,
          unlockedAt: row.unlocked_at,
        } as Achievement;
      })
      .filter((a): a is Achievement => !!a);

    return { data: achievements, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch achievements';
    return { data: null, error: message };
  }
}

/**
 * Check and unlock achievements based on user stats
 */
export async function checkAndUnlockAchievements(userId: string): Promise<ServerActionResponse<string[]>> {
  try {
    if (!userId || userId.trim().length === 0) {
      return { data: null, error: 'User ID is required' };
    }

    const supabase = await createServerSupabaseClient();

    // Fetch user data
    const { data: userData, error: userError } = await supabase.from('users').select('*').eq('id', userId).single();

    if (userError || !userData) {
      return { data: null, error: 'User not found' };
    }

    // Fetch gift action counts for the user
    const { data: sentGifts, error: sentError } = await supabase
      .from('gift_actions')
      .select('id')
      .eq('sender_id', userId)
      .eq('status', 'claimed');

    const { data: receivedGifts, error: receivedError } = await supabase
      .from('gift_actions')
      .select('id')
      .eq('receiver_id', userId)
      .eq('status', 'claimed');

    if (sentError || receivedError) {
      return { data: null, error: 'Failed to fetch gift data' };
    }

    const sentCount = sentGifts?.length || 0;
    const receivedCount = receivedGifts?.length || 0;
    const unlockedAchievements: string[] = [];

    // Check achievements
    const achievementsToCheck = [
      { id: 'first-gift', condition: sentCount >= 1 },
      { id: 'five-gifts', condition: sentCount >= 5 },
      { id: 'ten-gifts', condition: sentCount >= 10 },
      { id: 'twenty-five-gifts', condition: sentCount >= 25 },
      { id: 'first-receive', condition: receivedCount >= 1 },
      { id: 'five-receive', condition: receivedCount >= 5 },
    ];

    for (const achievement of achievementsToCheck) {
      if (achievement.condition) {
        const { data, error } = await supabase.rpc('unlock_achievement', {
          p_user_id: userId,
          p_achievement_id: achievement.id,
        });

        if (!error && data?.[0]?.success) {
          if (!data[0].already_unlocked) {
            unlockedAchievements.push(achievement.id);
          }
        }
      }
    }

    return { data: unlockedAchievements, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to check achievements';
    return { data: null, error: message };
  }
}

// ==========================================
// PLUS ONE OFFERS
// ==========================================

/**
 * Get all active plus one offers
 */
export async function getActiveOffers(): Promise<ServerActionResponse<PlusOneOffer[]>> {
  try {
    const supabase = await createServerSupabaseClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('plus_one_offers')
      .select(`
        *,
        gifts (*),
        sponsors (*)
      `)
      .eq('is_active', true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`);

    if (error) {
      return { data: null, error: error.message };
    }

    const offers = (data || []).map(mapPlusOneOffer);
    return { data: offers, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch offers';
    return { data: null, error: message };
  }
}

/**
 * Claim a plus one offer for another user
 */
export async function claimPlusOneOffer(
  offerId: string,
  receiverPhone: string
): Promise<ServerActionResponse<{ success: boolean; message: string }>> {
  try {
    if (!offerId || offerId.trim().length === 0) {
      return { data: null, error: 'Offer ID is required' };
    }

    if (!receiverPhone || receiverPhone.trim().length === 0) {
      return { data: null, error: 'Receiver phone is required' };
    }

    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    // Get the offer details
    const { data: offerData, error: offerError } = await supabase
      .from('plus_one_offers')
      .select('*')
      .eq('id', offerId)
      .eq('is_active', true)
      .single();

    if (offerError || !offerData) {
      return { data: null, error: 'Offer not found or expired' };
    }

    // Create a gift action for the receiver
    const redeemCode = `PO-${Date.now().toString(36).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString();

    const { error: insertError } = await supabase.from('gift_actions').insert({
      gift_id: offerData.gift_id,
      sender_id: user.id,
      receiver_phone: receiverPhone,
      note: offerData.message,
      status: 'pending',
      redeem_code: redeemCode,
      expires_at: expiresAt,
    });

    if (insertError) {
      return { data: null, error: insertError.message };
    }

    // Unlock plus-one achievement
    await supabase.rpc('unlock_achievement', {
      p_user_id: user.id,
      p_achievement_id: 'plus-one',
    });

    return {
      data: { success: true, message: 'Plus one offer claimed successfully' },
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to claim plus one offer';
    return { data: null, error: message };
  }
}
