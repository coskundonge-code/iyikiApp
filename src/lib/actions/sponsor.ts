'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { mapSponsor } from '@/lib/supabase/mappers';
import type { Sponsor } from '@/types';

export interface SponsorDashboard {
  sponsor: Sponsor;
  totalSpent: number;
  budgetRemaining: number;
  budgetUtilization: number;
  campaignCount: number;
  activeCampaigns: any[];
  giftsSponsoredByCategory: Record<string, number>;
  monthlySpend: Array<{ month: string; spent: number }>;
}

export interface ImpactReport {
  sponsorId: string;
  totalBudget: number;
  spent: number;
  giftsSponsoredCount: number;
  costPerGift: number;
  estimatedHappinessFactor: number;
  demographicReach: {
    ageGroups: Record<string, number>;
    genderDistribution: { male: number; female: number };
  };
  topCategories: Array<{ category: string; count: number; percentage: number }>;
}

/**
 * Get sponsor dashboard
 */
export async function getSponsorDashboard(
  sponsorId: string
): Promise<{ data: SponsorDashboard | null; error: string | null }> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get sponsor
    const { data: sponsorData } = await supabase
      .from('sponsors')
      .select('*')
      .eq('id', sponsorId)
      .single();

    if (!sponsorData) {
      return { data: null, error: 'Sponsor not found' };
    }

    // Get campaigns
    const { data: campaignsData } = await supabase
      .from('campaigns')
      .select('*')
      .eq('sponsor_id', sponsorId);

    // Get sponsored gifts
    const { data: giftsData } = await supabase
      .from('gifts')
      .select('*')
      .eq('sponsor_id', sponsorId);

    // Get gift actions for sponsored gifts
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

    // Calculate metrics
    const totalSpent = sponsorData.spent;
    const budgetRemaining = sponsorData.budget - totalSpent;
    const budgetUtilization = sponsorData.budget > 0 ? (totalSpent / sponsorData.budget) * 100 : 0;

    // Get active campaigns
    const now = new Date();
    const activeCampaigns = (campaignsData || []).filter(
      c => new Date(c.start_date) <= now && new Date(c.end_date) >= now
    );

    // Count gifts by category
    const categoryMap = new Map<string, number>();
    giftsData?.forEach(gift => {
      const category = gift.category || 'other';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    // Calculate monthly spend
    const monthlyMap = new Map<string, number>();
    actionsData.forEach(action => {
      const date = new Date(action.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
    });

    const monthlySpend = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({
        month,
        spent: count * (totalSpent / Math.max(actionsData.length, 1)),
      }));

    return {
      data: {
        sponsor: mapSponsor(sponsorData),
        totalSpent,
        budgetRemaining: Math.max(0, budgetRemaining),
        budgetUtilization,
        campaignCount: (campaignsData || []).length,
        activeCampaigns,
        giftsSponsoredByCategory: Object.fromEntries(categoryMap),
        monthlySpend,
      },
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load sponsor dashboard';
    return { data: null, error: message };
  }
}

/**
 * Create a new sponsor campaign
 */
export async function createSponsorCampaign(data: {
  name: string;
  giftId: string;
  budget: number;
  startDate: string;
  endDate: string;
  description?: string;
  targetRedemptions?: number;
}): Promise<{ success: boolean; campaignId?: string; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get gift to find sponsor
    const { data: giftData } = await supabase
      .from('gifts')
      .select('sponsor_id')
      .eq('id', data.giftId)
      .single();

    if (!giftData || !giftData.sponsor_id) {
      return { success: false, error: 'Gift or sponsor not found' };
    }

    const { data: result, error } = await supabase
      .from('campaigns')
      .insert({
        sponsor_id: giftData.sponsor_id,
        name: data.name,
        description: data.description,
        start_date: data.startDate,
        end_date: data.endDate,
        budget: data.budget,
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

/**
 * Get sponsor impact report
 */
export async function getSponsorImpactReport(
  sponsorId: string
): Promise<{ data: ImpactReport | null; error: string | null }> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get sponsor
    const { data: sponsorData } = await supabase
      .from('sponsors')
      .select('*')
      .eq('id', sponsorId)
      .single();

    if (!sponsorData) {
      return { data: null, error: 'Sponsor not found' };
    }

    // Get sponsored gifts
    const { data: giftsData } = await supabase
      .from('gifts')
      .select('*')
      .eq('sponsor_id', sponsorId);

    const giftIds = giftsData?.map(g => g.id) || [];

    // Get gift actions
    let actionsData = [];
    if (giftIds.length > 0) {
      const { data } = await supabase
        .from('gift_actions')
        .select('*')
        .in('gift_id', giftIds);
      actionsData = data || [];
    }

    // Get user data for demographics
    const { data: usersData } = await supabase.from('users').select('id, birthday');
    const redeemerIds = new Set(actionsData.map(a => a.receiver_id).filter(Boolean));

    // Calculate demographics
    const ageGroups: Record<string, number> = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56+': 0,
    };

    let maleCount = 0;
    let femaleCount = 0;

    usersData?.forEach(user => {
      if (!redeemerIds.has(user.id)) return;

      if (user.birthday) {
        const age = new Date().getFullYear() - new Date(user.birthday).getFullYear();
        if (age >= 18 && age <= 25) ageGroups['18-25']++;
        else if (age >= 26 && age <= 35) ageGroups['26-35']++;
        else if (age >= 36 && age <= 45) ageGroups['36-45']++;
        else if (age >= 46 && age <= 55) ageGroups['46-55']++;
        else if (age > 55) ageGroups['56+']++;
      }
    });

    // Calculate category distribution
    const categoryMap = new Map<string, number>();
    giftsData?.forEach(gift => {
      const category = gift.category || 'other';
      const count = actionsData.filter(a => a.gift_id === gift.id).length;
      categoryMap.set(category, (categoryMap.get(category) || 0) + count);
    });

    const totalGifts = actionsData.length;
    const topCategories = Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / Math.max(totalGifts, 1)) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Estimate happiness (based on redemption rate and reach)
    const costPerGift = totalGifts > 0 ? sponsorData.spent / totalGifts : 0;
    const redemptionRate = actionsData.filter(a => a.status === 'claimed').length / Math.max(totalGifts, 1);
    const estimatedHappinessFactor = (redemptionRate * redeemerIds.size) / Math.max(sponsorData.budget, 1);

    return {
      data: {
        sponsorId,
        totalBudget: sponsorData.budget,
        spent: sponsorData.spent,
        giftsSponsoredCount: totalGifts,
        costPerGift,
        estimatedHappinessFactor: Math.round(estimatedHappinessFactor * 100) / 100,
        demographicReach: {
          ageGroups,
          genderDistribution: { male: maleCount, female: femaleCount },
        },
        topCategories,
      },
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get impact report';
    return { data: null, error: message };
  }
}

/**
 * Update sponsor campaign
 */
export async function updateSponsorCampaign(
  campaignId: string,
  updates: Partial<{
    name: string;
    description: string;
    budget: number;
    startDate: string;
    endDate: string;
    targetRedemptions: number;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    const updatePayload: Record<string, any> = {};
    if (updates.name !== undefined) updatePayload.name = updates.name;
    if (updates.description !== undefined) updatePayload.description = updates.description;
    if (updates.budget !== undefined) updatePayload.budget = updates.budget;
    if (updates.startDate !== undefined) updatePayload.start_date = updates.startDate;
    if (updates.endDate !== undefined) updatePayload.end_date = updates.endDate;
    if (updates.targetRedemptions !== undefined) updatePayload.target_redemptions = updates.targetRedemptions;

    const { error } = await supabase
      .from('campaigns')
      .update(updatePayload)
      .eq('id', campaignId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update campaign';
    return { success: false, error: message };
  }
}
