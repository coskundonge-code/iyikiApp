/**
 * Supabase Edge Function: Distribute Pool Gifts
 *
 * This function:
 * 1. Finds available gifts in social_pool
 * 2. Finds eligible receivers (active users who haven't received from pool today)
 * 3. Randomly assigns pool gifts to receivers
 * 4. Updates status to 'distributed', distributed_at=now()
 * 5. Creates notifications for recipients
 * 6. Logs the distribution summary
 *
 * Should be triggered by:
 * - Supabase cron job (pg_cron)
 * - External scheduler
 * - Manual API call
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.101.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface PoolGift {
  id: string;
  gift_id: string;
  status: string;
  original_sender_id?: string;
}

interface EligibleUser {
  id: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[Distribute Pool] Starting distribution...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date().toISOString();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 1. Get available pool gifts
    const { data: poolGifts, error: poolError } = await supabase
      .from('social_pool')
      .select('id, gift_id, status, original_sender_id')
      .eq('status', 'available')
      .limit(100); // Limit to prevent overwhelming single execution

    if (poolError) {
      throw new Error(`Failed to fetch pool gifts: ${poolError.message}`);
    }

    const gifts = (poolGifts || []) as unknown as PoolGift[];
    console.log(`[Distribute Pool] Found ${gifts.length} available gifts in pool`);

    if (gifts.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No gifts to distribute',
          distributedCount: 0,
          recipientCount: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Find eligible receivers (active, non-deleted, haven't received from pool today)
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('status', 'active')
      .gt('daily_receive_limit', 0);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    // Filter out users who received from pool today
    const { data: todayPoolDistributions } = await supabase
      .from('gift_actions')
      .select('receiver_id')
      .eq('status', 'distributed')
      .gte('distributed_at', todayStart.toISOString())
      .eq('from_pool', true);

    const usersWithPoolToday = new Set(
      (todayPoolDistributions || []).map((d: { receiver_id?: string }) => d.receiver_id)
    );

    const eligibleUsers = (allUsers || [])
      .filter((u: EligibleUser) => !usersWithPoolToday.has(u.id))
      .map((u: EligibleUser) => u.id);

    console.log(
      `[Distribute Pool] Found ${eligibleUsers.length} eligible receivers (excluded ${usersWithPoolToday.size})`
    );

    if (eligibleUsers.length === 0) {
      console.warn('[Distribute Pool] No eligible receivers found');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No eligible receivers',
          distributedCount: 0,
          recipientCount: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Randomly assign gifts to receivers
    const distributions = gifts.map((gift, index) => {
      const recipientIndex = index % eligibleUsers.length;
      const recipientId = eligibleUsers[recipientIndex];

      return {
        id: crypto.randomUUID(),
        pool_gift_id: gift.id,
        gift_id: gift.gift_id,
        receiver_id: recipientId,
        status: 'distributed',
        distributed_at: now,
        from_pool: true,
      };
    });

    // 4. Create gift_actions records for distributed gifts
    const { error: distributionError } = await supabase
      .from('gift_actions')
      .insert(
        distributions.map((d) => ({
          id: d.id,
          gift_id: d.gift_id,
          receiver_id: d.receiver_id,
          status: 'distributed',
          distributed_at: now,
          from_pool: true,
          pool_gift_id: d.pool_gift_id,
        }))
      );

    if (distributionError) {
      throw new Error(`Failed to create distribution records: ${distributionError.message}`);
    }

    // 5. Update social_pool items to distributed
    const poolGiftIds = gifts.map((g) => g.id);

    const { error: poolUpdateError } = await supabase
      .from('social_pool')
      .update({
        status: 'distributed',
        distributed_at: now,
      })
      .in('id', poolGiftIds);

    if (poolUpdateError) {
      console.error('[Distribute Pool] Warning: Failed to update pool status:', poolUpdateError.message);
    }

    // 6. Create notifications for recipients
    const uniqueRecipients = [...new Set(distributions.map((d) => d.receiver_id))];

    const notifications = uniqueRecipients.map((recipientId) => ({
      user_id: recipientId,
      type: 'gift_distributed',
      title: 'Askıda Havuzundan Hediye!',
      message: 'Askıda havuzundan sana bir hediye aktarıldı! 🎉',
      is_read: false,
      created_at: now,
    }));

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notifError) {
      console.warn('[Distribute Pool] Warning: Failed to create notifications:', notifError.message);
    }

    // 7. Update daily_receive_count for recipients
    for (const recipientId of uniqueRecipients) {
      const { data: user } = await supabase
        .from('users')
        .select('daily_receive_count')
        .eq('id', recipientId)
        .single();

      if (user) {
        await supabase
          .from('users')
          .update({ daily_receive_count: (user.daily_receive_count || 0) + 1 })
          .eq('id', recipientId);
      }
    }

    console.log('[Distribute Pool] Distribution completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Gifts distributed from pool',
        distributedCount: gifts.length,
        recipientCount: uniqueRecipients.length,
        notificationsSent: uniqueRecipients.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Distribute Pool] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
