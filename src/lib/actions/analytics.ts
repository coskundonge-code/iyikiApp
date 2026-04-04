'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mapGiftAction, mapUser } from '@/lib/supabase/mappers';
import type { GiftAction, User } from '@/types';

export interface AnalyticsSummary {
  totalUsers: number;
  activeUsers: number;
  dailyActiveUsers: number;
  totalGifts: number;
  redeemedGifts: number;
  conversionRate: number;
  averageGiftsPerDay: number;
  pendingGifts: number;
  expiredGifts: number;
}

export interface GiftAnalytics {
  category: string;
  count: number;
  redeemRate: number;
  topGifts: Array<{
    id: string;
    name: string;
    count: number;
  }>;
}

export interface UserGrowth {
  date: string;
  newUsers: number;
  cumulativeUsers: number;
}

export interface PartnerPerformance {
  partnerId: string;
  partnerName: string;
  totalGifts: number;
  redeemedGifts: number;
  redemptionRate: number;
  averageRedemptionTime: number;
}

export interface SponsorImpact {
  sponsorId: string;
  sponsorName: string;
  totalBudget: number;
  spent: number;
  giftsSponsoredCount: number;
  costPerGift: number;
  roi: number;
}

/**
 * Track an analytics event
 */
export async function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.from('analytics_events').insert({
      event_name: eventName,
      properties: properties || {},
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Analytics tracking error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to track event';
    console.error('Analytics error:', message);
    return { success: false, error: message };
  }
}

/**
 * Get overall analytics summary
 */
export async function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
  try {
    const supabase = await createServerSupabaseClient();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get all users
    const { data: usersData } = await supabase.from('users').select('*');
    const totalUsers = usersData?.length || 0;

    // Get active users (created within date range)
    const { data: activeUsersData } = await supabase
      .from('users')
      .select('*')
      .gte('created_at', cutoffDate.toISOString());
    const activeUsers = activeUsersData?.length || 0;

    // Get daily active users (users with gift actions in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: dauData } = await supabase
      .from('gift_actions')
      .select('sender_id')
      .gte('created_at', sevenDaysAgo.toISOString());
    const dailyActiveUsers = new Set(dauData?.map(d => d.sender_id)).size;

    // Get gift actions
    const { data: allActionsData } = await supabase
      .from('gift_actions')
      .select('*')
      .gte('created_at', cutoffDate.toISOString());
    const totalGifts = allActionsData?.length || 0;

    // Get redeemed gifts
    const redeemedGifts = allActionsData?.filter(a => a.status === 'claimed').length || 0;
    const pendingGifts = allActionsData?.filter(a => a.status === 'pending').length || 0;
    const expiredGifts = allActionsData?.filter(a => a.status === 'expired').length || 0;

    const conversionRate = totalGifts > 0 ? (redeemedGifts / totalGifts) * 100 : 0;
    const averageGiftsPerDay = days > 0 ? totalGifts / days : 0;

    return {
      totalUsers,
      activeUsers,
      dailyActiveUsers,
      totalGifts,
      redeemedGifts,
      conversionRate,
      averageGiftsPerDay,
      pendingGifts,
      expiredGifts,
    };
  } catch (err) {
    console.error('Analytics summary error:', err);
    return {
      totalUsers: 0,
      activeUsers: 0,
      dailyActiveUsers: 0,
      totalGifts: 0,
      redeemedGifts: 0,
      conversionRate: 0,
      averageGiftsPerDay: 0,
      pendingGifts: 0,
      expiredGifts: 0,
    };
  }
}

/**
 * Get gift analytics by category
 */
export async function getGiftAnalytics(days = 30): Promise<GiftAnalytics[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get all gifts and their categories
    const { data: giftsData } = await supabase.from('gifts').select('*');
    const { data: actionsData } = await supabase
      .from('gift_actions')
      .select('gift_id, status')
      .gte('created_at', cutoffDate.toISOString());

    if (!giftsData || !actionsData) {
      return [];
    }

    const categoryMap = new Map<string, GiftAnalytics>();

    giftsData.forEach(gift => {
      const category = gift.category || 'uncategorized';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          count: 0,
          redeemRate: 0,
          topGifts: [],
        });
      }
    });

    // Count actions by category
    actionsData.forEach(action => {
      const gift = giftsData.find(g => g.id === action.gift_id);
      if (!gift) return;

      const category = gift.category || 'uncategorized';
      const stats = categoryMap.get(category);
      if (stats) {
        stats.count += 1;
        if (action.status === 'claimed') {
          stats.redeemRate += 1;
        }
      }
    });

    // Calculate redemption rates and top gifts
    const result = Array.from(categoryMap.values()).map(stats => ({
      ...stats,
      redeemRate: stats.count > 0 ? (stats.redeemRate / stats.count) * 100 : 0,
      topGifts: giftsData
        .filter(g => g.category === stats.category)
        .map(g => ({
          id: g.id,
          name: g.name,
          count: actionsData.filter(a => a.gift_id === g.id).length,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    }));

    return result;
  } catch (err) {
    console.error('Gift analytics error:', err);
    return [];
  }
}

/**
 * Get user growth over time
 */
export async function getUserGrowthData(days = 30): Promise<UserGrowth[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data: usersData } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at');

    if (!usersData) {
      return [];
    }

    // Group by date
    const dateMap = new Map<string, number>();
    usersData.forEach(user => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    // Convert to growth data
    const dates = Array.from(dateMap.keys()).sort();
    let cumulative = 0;
    const result: UserGrowth[] = dates.map(date => {
      cumulative += dateMap.get(date) || 0;
      return {
        date,
        newUsers: dateMap.get(date) || 0,
        cumulativeUsers: cumulative,
      };
    });

    return result;
  } catch (err) {
    console.error('User growth error:', err);
    return [];
  }
}

/**
 * Get partner performance metrics
 */
export async function getPartnerPerformance(
  partnerId?: string
): Promise<PartnerPerformance[]> {
  try {
    const supabase = await createServerSupabaseClient();

    let query = supabase.from('partners').select('*');
    if (partnerId) {
      query = query.eq('id', partnerId);
    }

    const { data: partnersData } = await query;
    if (!partnersData || partnersData.length === 0) {
      return [];
    }

    // Get gift actions for these partners
    const { data: giftsData } = await supabase
      .from('gifts')
      .select('id, partner_id');

    const { data: actionsData } = await supabase
      .from('gift_actions')
      .select('gift_id, status, created_at, claimed_at');

    if (!giftsData || !actionsData) {
      return [];
    }

    const result = partnersData.map(partner => {
      const partnerGifts = giftsData.filter(g => g.partner_id === partner.id);
      const partnerActions = actionsData.filter(a =>
        partnerGifts.some(g => g.id === a.gift_id)
      );

      const redeemedActions = partnerActions.filter(a => a.status === 'claimed');
      const redemptionTimes = redeemedActions
        .map(a => {
          if (!a.claimed_at) return 0;
          return (new Date(a.claimed_at).getTime() - new Date(a.created_at).getTime()) / (1000 * 60);
        })
        .filter(t => t > 0);

      return {
        partnerId: partner.id,
        partnerName: partner.name,
        totalGifts: partnerActions.length,
        redeemedGifts: redeemedActions.length,
        redemptionRate:
          partnerActions.length > 0
            ? (redeemedActions.length / partnerActions.length) * 100
            : 0,
        averageRedemptionTime:
          redemptionTimes.length > 0
            ? redemptionTimes.reduce((a, b) => a + b, 0) / redemptionTimes.length
            : 0,
      };
    });

    return result;
  } catch (err) {
    console.error('Partner performance error:', err);
    return [];
  }
}

/**
 * Get sponsor impact metrics
 */
export async function getSponsorImpact(sponsorId?: string): Promise<SponsorImpact[]> {
  try {
    const supabase = await createServerSupabaseClient();

    let query = supabase.from('sponsors').select('*');
    if (sponsorId) {
      query = query.eq('id', sponsorId);
    }

    const { data: sponsorsData } = await query;
    if (!sponsorsData || sponsorsData.length === 0) {
      return [];
    }

    // Get sponsored gifts
    const { data: giftsData } = await supabase
      .from('gifts')
      .select('id, sponsor_id');

    const { data: actionsData } = await supabase
      .from('gift_actions')
      .select('gift_id, status');

    if (!giftsData || !actionsData) {
      return [];
    }

    const result = sponsorsData.map(sponsor => {
      const sponsoredGifts = giftsData.filter(g => g.sponsor_id === sponsor.id);
      const sponsorActions = actionsData.filter(a =>
        sponsoredGifts.some(g => g.id === a.gift_id)
      );

      const costPerGift = sponsorActions.length > 0
        ? sponsor.spent / sponsorActions.length
        : 0;

      const roi = sponsor.spent > 0
        ? ((sponsorActions.length * 100) - sponsor.spent) / sponsor.spent
        : 0;

      return {
        sponsorId: sponsor.id,
        sponsorName: sponsor.name,
        totalBudget: sponsor.budget,
        spent: sponsor.spent,
        giftsSponsoredCount: sponsorActions.length,
        costPerGift,
        roi,
      };
    });

    return result;
  } catch (err) {
    console.error('Sponsor impact error:', err);
    return [];
  }
}
