/**
 * Cron Job Route: Expire Gifts
 * GET /api/cron/expire-gifts
 *
 * Protected by CRON_SECRET environment variable
 * Calls the Supabase Edge Function or local logic to:
 * 1. Find expired gifts
 * 2. Update status to expired
 * 3. Move to social pool
 * 4. Send notifications
 *
 * Can be triggered by:
 * - External cron service (cron-job.org, easycron, etc.)
 * - Node cron scheduler in background
 * - GitHub Actions workflow
 * - Vercel cron
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/cron/expire-gifts
 *
 * Query params (optional):
 * - secret: CRON_SECRET for verification
 * - webhook: true to use Supabase Edge Function
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify CRON_SECRET
    const cronSecret = process.env.CRON_SECRET;
    const providedSecret = request.headers.get('authorization')?.replace('Bearer ', '') || request.nextUrl.searchParams.get('secret');

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

    console.log('[Cron] Expire gifts job started');

    // 2. Check if we should use Supabase Edge Function or local logic
    const useEdgeFunction = request.nextUrl.searchParams.get('webhook') === 'true';

    if (useEdgeFunction) {
      return await callEdgeFunction();
    } else {
      return await runLocalLogic();
    }
  } catch (error) {
    console.error('[Cron] Error in expire-gifts:', error);
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

    const functionUrl = `${supabaseUrl}/functions/v1/expire-gifts`;

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
 * Run expiry logic locally
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

    console.log('[Cron] Starting local expiry logic');

    // 1. Find expired gifts
    const { data: expiredGifts, error: selectError } = await supabase
      .from('gift_actions')
      .select('id, gift_id, sender_id, receiver_id, gift:gifts(name)')
      .eq('status', 'pending')
      .lt('expires_at', now);

    if (selectError) {
      throw new Error(`Failed to fetch expired gifts: ${selectError.message}`);
    }

    const giftsToExpire = expiredGifts || [];
    console.log(`[Cron] Found ${giftsToExpire.length} expired gifts`);

    if (giftsToExpire.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'No expired gifts',
          expiredCount: 0,
          pooledCount: 0,
          notificationsSent: 0,
          executedAt: new Date().toISOString(),
          method: 'local',
        },
        { status: 200 }
      );
    }

    // 2. Update to expired status
    const expiredIds = giftsToExpire.map((g: any) => g.id);

    const { error: updateError } = await supabase
      .from('gift_actions')
      .update({
        status: 'expired',
        expired_at: now,
      })
      .in('id', expiredIds);

    if (updateError) {
      throw new Error(`Failed to update gifts: ${updateError.message}`);
    }

    console.log(`[Cron] Marked ${giftsToExpire.length} gifts as expired`);

    // 3. Move to social pool
    const poolEntries = giftsToExpire.map((gift: any) => ({
      gift_id: gift.gift_id,
      original_sender_id: gift.sender_id,
      original_action_id: gift.id,
      pooled_at: now,
      status: 'available',
    }));

    const { error: poolError, data: pooledData } = await supabase
      .from('social_pool')
      .insert(poolEntries)
      .select();

    if (poolError) {
      console.error('[Cron] Warning - pool insertion error:', poolError.message);
    }

    const pooledCount = pooledData?.length || 0;
    console.log(`[Cron] Added ${pooledCount} gifts to social pool`);

    // 4. Send notifications
    const uniqueReceiverIds = [...new Set(
      giftsToExpire
        .filter((g: any) => g.receiver_id)
        .map((g: any) => g.receiver_id)
    )];

    if (uniqueReceiverIds.length > 0) {
      const notifications = uniqueReceiverIds.map((userId: string) => ({
        user_id: userId,
        type: 'gift_expired',
        title: 'Hediye Süresi Doldu',
        message: 'Bir hediyenizin süresi doldu, askıda havuzuna aktarıldı',
        is_read: false,
        created_at: now,
      }));

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.warn('[Cron] Notification error:', notifError.message);
      }
    }

    console.log('[Cron] Expire gifts job completed');

    return NextResponse.json(
      {
        success: true,
        message: 'Gifts expired and moved to pool',
        expiredCount: giftsToExpire.length,
        pooledCount,
        notificationsSent: uniqueReceiverIds.length,
        executedAt: new Date().toISOString(),
        method: 'local',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Cron] Expire gifts error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}