/**
 * Supabase Edge Function: Expire Gifts
 *
 * This function:
 * 1. Finds all gift_actions where status='pending' AND expires_at < now()
 * 2. Updates them to status='expired', expired_at=now()
 * 3. Moves expired gifts to social_pool (pooled_at=now())
 * 4. Sends expiration notifications to users
 * 5. Logs the count to console
 *
 * Should be triggered by:
 * - Supabase cron job (pg_cron)
 * - External scheduler (e.g., n8n, cron-job.org)
 * - Manual API call via /api/cron/expire-gifts
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.101.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface GiftAction {
  id: string;
  gift_id: string;
  sender_id: string;
  receiver_id?: string;
  expires_at: string;
  created_at: string;
  gift?: {
    name: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[Expire Gifts] Starting job...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Find expired gifts (pending and expires_at < now)
    const now = new Date().toISOString();

    const { data: expiredGifts, error: selectError } = await supabase
      .from('gift_actions')
      .select('id, gift_id, sender_id, receiver_id, expires_at, created_at, gift:gifts(id, name)')
      .eq('status', 'pending')
      .lt('expires_at', now);

    if (selectError) {
      throw new Error(`Failed to fetch expired gifts: ${selectError.message}`);
    }

    const giftsToExpire = (expiredGifts || []) as unknown as GiftAction[];
    console.log(`[Expire Gifts] Found ${giftsToExpire.length} expired gifts`);

    if (giftsToExpire.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No expired gifts to process',
          expiredCount: 0,
          pooledCount: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Update gift_actions to expired status
    const expiredIds = giftsToExpire.map((g) => g.id);

    const { error: updateError } = await supabase
      .from('gift_actions')
      .update({
        status: 'expired',
        expired_at: now,
      })
      .in('id', expiredIds);

    if (updateError) {
      throw new Error(`Failed to update expired gifts: ${updateError.message}`);
    }

    console.log(`[Expire Gifts] Marked ${giftsToExpire.length} gifts as expired`);

    // 3. Move expired gifts to social_pool
    const poolEntries = giftsToExpire.map((gift) => ({
      gift_id: gift.gift_id,
      original_sender_id: gift.sender_id,
      original_action_id: gift.id,
      pooled_at: now,
      status: 'available',
    }));

    const { error: poolError } = await supabase
      .from('social_pool')
      .insert(poolEntries);

    if (poolError) {
      console.error('[Expire Gifts] Warning: Failed to add to social pool:', poolError.message);
      // Continue anyway - we've already marked as expired
    } else {
      console.log(`[Expire Gifts] Added ${poolEntries.length} gifts to social pool`);
    }

    // 4. Send notifications to gift receivers about expiration
    const uniqueReceiverIds = [...new Set(
      giftsToExpire
        .filter((g) => g.receiver_id)
        .map((g) => g.receiver_id)
    )] as string[];

    if (uniqueReceiverIds.length > 0) {
      const notifications = uniqueReceiverIds.map((userId) => ({
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
        console.warn('[Expire Gifts] Failed to send expiration notifications:', notifError.message);
      } else {
        console.log(`[Expire Gifts] Sent ${notifications.length} expiration notifications`);
      }
    }

    // 5. Log summary
    console.log('[Expire Gifts] Job completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Gifts expired and moved to pool',
        expiredCount: giftsToExpire.length,
        pooledCount: poolEntries.length,
        notificationsSent: uniqueReceiverIds.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Expire Gifts] Error:', error);

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
