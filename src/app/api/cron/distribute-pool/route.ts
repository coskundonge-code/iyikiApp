/**
 * Cron Job Route: Distribute Pool Gifts
 * GET /api/cron/distribute-pool
 *
 * Protected by CRON_SECRET environment variable
 * Distributes gifts from the social pool to random eligible users
 *
 * Can be triggered by external cron service or internal scheduler
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/cron/distribute-pool
 *
 * Query params (optional):
 * - secret: CRON_SECRET for verification
 * - webhook: true to use Supabase Edge Function
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify CRON_SECRET
    const cronSecret = process.env.CRON_SECRET;
    const providedSecret = request.nextUrl.searchParams.get('secret');

    if (!cronSecret) {
      console.warn('[Cron] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 501 }
      );
    }

    if (providedSecret !== cronSecret) {
      console.error('[Cron] Invalid cron secret');
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      );
    }

    console.log('[Cron] Distribute pool job started');

    // 2. Check if we should use Supabase Edge Function or local logic
    const useEdgeFunction = request.nextUrl.searchParams.get('webhook') === 'true';

    if (useEdgeFunction) {
      return await callEdgeFunction();
    } else {
      return await runLocalLogic();
    }
  } catch (error) {
    console.error('[Cron] Error in distribute-pool:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Call Supabase Edge Function
 */
async function callEdgeFunction(): Promise<NextResponse> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }

    const functionUrl = `${supabaseUrl}/functions/v1/distribute-pool`;

    console.log('[Cron] Calling Edge Function:', functionUrl);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
      },
    });

    const data = await response.json();

    console.log('[Cron] Edge Function response:', data);

    return NextResponse.json(
      {
        success: response.ok,
        ...data,
        executedAt: new Date().toISOString(),
        method: 'edge-function',
      },
      { status: response.status }
    );
  } catch (error) {
    console.error('[Cron] Edge Function error:', error);
    throw error;
  }
}

/**
 * Run distribution logic locally
 */
async function runLocalLogic(): Promise<NextResponse> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date().toISOString();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    console.log('[Cron] Starting local distribution logic');

    // 1. Get available pool gifts
    const { data: poolGifts, error: poolError } = await supabase
      .from('social_pool')
      .select('id, gift_id, status, original_sender_id')
      .eq('status', 'available')
      .limit(100);

    if (poolError) {
      throw new Error(`Failed to fetch pool gifts: ${poolError.message}`);
    }

    const gifts = poolGifts || [];
    console.log(`[Cron] Found ${gifts.length} available gifts in pool`);

    if (gifts.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'No gifts to distribute',
          distributedCount: 0,
          recipientCount: 0,
          notificationsSent: 0,
          executedAt: new Date().toISOString(),
          method: 'local',
        },
        { status: 200 }
      );
    }

    // 2. Find eligible receivers
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, daily_receive_count, daily_receive_limit')
      .eq('status', 'active');

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    // Filter users who haven't received from pool today
    const { data: todayDistributions } = await supabase
      .from('gift_actions')
      .select('receiver_id')
      .eq('status', 'distributed')
      .gte('distributed_at', todayStart.toISOString())
      .eq('from_pool', true);

    const usersWithPoolToday = new Set(
      (todayDistributions || []).map((d: any) => d.receiver_id)
    );

    const eligibleUsers = (allUsers || [])
      .filter((u: any) => !usersWithPoolToday.has(u.id) && u.daily_receive_count < u.daily_receive_limit)
      .map((u: any) => u.id);

    console.log(
      `[Cron] Found ${eligibleUsers.length} eligible receivers (excluded ${usersWithPoolToday.size})`
    );

    if (eligibleUsers.length === 0) {
      console.warn('[Cron] No eligible receivers');
      return NextResponse.json(
        {
          success: true,
          message: 'No eligible receivers',
          distributedCount: 0,
          recipientCount: 0,
          executedAt: new Date().toISOString(),
          method: 'local',
        },
        { status: 200 }
      );
    }

    // 3. Randomly assign gifts to receivers
    const distributions = gifts.map((gift: any, index: number) => {
      const recipientIndex = index % eligibleUsers.length;
      const recipientId = eligibleUsers[recipientIndex];

      return {
        gift_id: gift.gift_id,
        receiver_id: recipientId,
        status: 'distributed',
        distributed_at: now,
        from_pool: true,
        pool_gift_id: gift.id,
      };
    });

    // 4. Create gift_actions records
    const { error: insertError } = await supabase
      .from('gift_actions')
      .insert(distributions);

    if (insertError) {
      throw new Error(`Failed to insert distributions: ${insertError.message}`);
    }

    console.log(`[Cron] Created ${distributions.length} gift_actions`);

    // 5. Update social_pool to distributed
    const poolGiftIds = gifts.map((g: any) => g.id);

    const { error: poolUpdateError } = await supabase
      .from('social_pool')
      .update({
        status: 'distributed',
        distributed_at: now,
      })
      .in('id', poolGiftIds);

    if (poolUpdateError) {
      console.warn('[Cron] Pool update warning:', poolUpdateError.message);
    }

    // 6. Create notifications
    const uniqueRecipients = [...new Set(distributions.map((d: any) => d.receiver_id))];

    const notifications = uniqueRecipients.map((recipientId: string) => ({
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
      console.warn('[Cron] Notification error:', notifError.message);
    }

    // 7. Update daily_receive_count
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

    console.log('[Cron] Distribution completed');

    return NextResponse.json(
      {
        success: true,
        message: 'Gifts distributed from pool',
        distributedCount: gifts.length,
        recipientCount: uniqueRecipients.length,
        notificationsSent: uniqueRecipients.length,
        executedAt: new Date().toISOString(),
        method: 'local',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Cron] Local logic error:', error);
    throw error;
  }
}
