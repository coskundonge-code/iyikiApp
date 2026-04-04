'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mapPartner, mapGift } from '@/lib/supabase/mappers';
import type { Partner, Gift } from '@/types';

export interface PartnerDashboard {
  partner: Partner;
  gifts: Gift[];
  totalGifts: number;
  totalRedeemed: number;
  redemptionRate: number;
  averageRedemptionTime: number;
  recentActions: any[];
}

export interface PartnerReport {
  period: { from: string; to: string };
  totalGifts: number;
  redeemedGifts: number;
  redemptionRate: number;
  revenue: number;
  topProducts: Array<{ giftId: string; name: string; count: number }>;
  branchPerformance: Array<{
    branchId: string;
    name: string;
    redeemCount: number;
    redemptionRate: number;
  }>;
}

/**
 * Get partner dashboard data
 */
export async function getPartnerDashboard(
  partnerId: string
): Promise<{ data: PartnerDashboard | null; error: string | null }> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get partner
    const { data: partnerData } = await supabase
      .from('partners')
      .select('*')
      .eq('id', partnerId)
      .single();

    if (!partnerData) {
      return { data: null, error: 'Partner not found' };
    }

    // Get partner gifts
    const { data: giftsData } = await supabase
      .from('gifts')
      .select('*')
      .eq('partner_id', partnerId);

    // Get gift actions for this partner
    const giftIds = giftsData?.map(g => g.id) || [];
    let actionsData = [];
    if (giftIds.length > 0) {
      const { data } = await supabase
        .from('gift_actions')
        .select('*')
        .in('gift_id', giftIds)
        .order('created_at', { ascending: false });
      actionsData = data || [];
    }

    const totalGifts = actionsData.length;
    const redeemedGifts = actionsData.filter(a => a.status === 'claimed').length;
    const redemptionRate = totalGifts > 0 ? (redeemedGifts / totalGifts) * 100 : 0;

    // Calculate average redemption time
    const redeemedActions = actionsData.filter(a => a.status === 'claimed' && a.claimed_at);
    const redemptionTimes = redeemedActions
      .map(a => (new Date(a.claimed_at).getTime() - new Date(a.created_at).getTime()) / (1000 * 60))
      .filter(t => t > 0);
    const averageRedemptionTime =
      redemptionTimes.length > 0
        ? redemptionTimes.reduce((a, b) => a + b, 0) / redemptionTimes.length
        : 0;

    return {
      data: {
        partner: mapPartner(partnerData),
        gifts: giftsData?.map(mapGift) || [],
        totalGifts,
        totalRedeemed: redeemedGifts,
        redemptionRate,
        averageRedemptionTime,
        recentActions: actionsData.slice(0, 10),
      },
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load partner dashboard';
    return { data: null, error: message };
  }
}

/**
 * Update partner product (gift)
 */
export async function updatePartnerProduct(
  giftId: string,
  updates: { stock?: number; isActive?: boolean; name?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    const updatePayload: Record<string, any> = {};
    if (updates.stock !== undefined) updatePayload.stock = updates.stock;
    if (updates.isActive !== undefined) updatePayload.is_active = updates.isActive;
    if (updates.name !== undefined) updatePayload.name = updates.name;

    const { error } = await supabase
      .from('gifts')
      .update(updatePayload)
      .eq('id', giftId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update product';
    return { success: false, error: message };
  }
}

/**
 * Add new branch for partner
 */
export async function addPartnerBranch(
  partnerId: string,
  data: { name: string; address: string; lat: number; lng: number }
): Promise<{ success: boolean; branchId?: string; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: result, error } = await supabase
      .from('branches')
      .insert({
        partner_id: partnerId,
        name: data.name,
        address: data.address,
        latitude: data.lat,
        longitude: data.lng,
        stock_status: 'available',
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, branchId: result?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add branch';
    return { success: false, error: message };
  }
}

/**
 * Update branch information
 */
export async function updateBranch(
  branchId: string,
  updates: Partial<{ name: string; address: string; lat: number; lng: number; stockStatus: string }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    const updatePayload: Record<string, any> = {};
    if (updates.name !== undefined) updatePayload.name = updates.name;
    if (updates.address !== undefined) updatePayload.address = updates.address;
    if (updates.lat !== undefined) updatePayload.latitude = updates.lat;
    if (updates.lng !== undefined) updatePayload.longitude = updates.lng;
    if (updates.stockStatus !== undefined) updatePayload.stock_status = updates.stockStatus;

    const { error } = await supabase
      .from('branches')
      .update(updatePayload)
      .eq('id', branchId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update branch';
    return { success: false, error: message };
  }
}

/**
 * Get partner reports for a date range
 */
export async function getPartnerReports(
  partnerId: string,
  dateRange?: { from: string; to: string }
): Promise<{ data: PartnerReport | null; error: string | null }> {
  try {
    const supabase = await createServerSupabaseClient();

    const from = dateRange?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const to = dateRange?.to || new Date().toISOString();

    // Get partner gifts
    const { data: giftsData } = await supabase
      .from('gifts')
      .select('*')
      .eq('partner_id', partnerId);

    const giftIds = giftsData?.map(g => g.id) || [];
    let actionsData = [];
    if (giftIds.length > 0) {
      const { data } = await supabase
        .from('gift_actions')
        .select('*')
        .in('gift_id', giftIds)
        .gte('created_at', from)
        .lte('created_at', to);
      actionsData = data || [];
    }

    const totalGifts = actionsData.length;
    const redeemedGifts = actionsData.filter(a => a.status === 'claimed').length;

    // Get top products
    const productMap = new Map<string, { name: string; count: number }>();
    actionsData.forEach(action => {
      const gift = giftsData?.find(g => g.id === action.gift_id);
      if (gift) {
        const current = productMap.get(gift.id) || { name: gift.name, count: 0 };
        productMap.set(gift.id, { ...current, count: current.count + 1 });
      }
    });

    const topProducts = Array.from(productMap.entries())
      .map(([giftId, data]) => ({ giftId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get branch performance
    const { data: branchesData } = await supabase
      .from('branches')
      .select('*')
      .eq('partner_id', partnerId);

    const branchPerformance = (branchesData || []).map(branch => {
      const branchRedeems = actionsData.filter(a => a.branch_id === branch.id && a.status === 'claimed');
      const branchTotal = actionsData.filter(a => a.branch_id === branch.id);
      return {
        branchId: branch.id,
        name: branch.name,
        redeemCount: branchRedeems.length,
        redemptionRate: branchTotal.length > 0 ? (branchRedeems.length / branchTotal.length) * 100 : 0,
      };
    });

    return {
      data: {
        period: { from, to },
        totalGifts,
        redeemedGifts,
        redemptionRate: totalGifts > 0 ? (redeemedGifts / totalGifts) * 100 : 0,
        revenue: 0,
        topProducts,
        branchPerformance,
      },
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get reports';
    return { data: null, error: message };
  }
}

/**
 * Create partner campaign
 */
export async function createPartnerCampaign(
  partnerId: string,
  data: {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    targetRedemptions?: number;
  }
): Promise<{ success: boolean; campaignId?: string; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: result, error } = await supabase
      .from('campaigns')
      .insert({
        partner_id: partnerId,
        name: data.name,
        description: data.description,
        start_date: data.startDate,
        end_date: data.endDate,
        target_redemptions: data.targetRedemptions,
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, campaignId: result?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create campaign';
    return { success: false, error: message };
  }
}
