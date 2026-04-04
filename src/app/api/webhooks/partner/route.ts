/**
 * Partner Webhook Handler
 * POST /api/webhooks/partner
 *
 * Receives webhook callbacks from partner systems
 * Verifies API key and HMAC signature
 * Processes partner events (stock updates, redemptions, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature } from '@/lib/services/webhooks';

interface PartnerWebhookPayload {
  id: string;
  event: string;
  partnerId: string;
  timestamp: string;
  data: Record<string, any>;
}

/**
 * POST /api/webhooks/partner
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get API key from headers
    const apiKey = request.headers.get('x-api-key');
    const signature = request.headers.get('x-webhook-signature');

    if (!apiKey || !signature) {
      console.error('[Webhook] Missing API key or signature');
      return NextResponse.json(
        { error: 'Missing API key or signature' },
        { status: 401 }
      );
    }

    // 2. Get request body
    const bodyText = await request.text();
    const body: PartnerWebhookPayload = JSON.parse(bodyText);

    // 3. Find partner by API key
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, api_key, api_secret, name')
      .eq('api_key', apiKey)
      .single();

    if (partnerError || !partner) {
      console.error('[Webhook] Partner not found:', partnerError?.message);
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // 4. Verify HMAC signature
    try {
      const isValid = verifyWebhookSignature(bodyText, signature, partner.api_secret || '');
      if (!isValid) {
        console.error('[Webhook] Invalid signature for partner:', partner.id);
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error('[Webhook] Signature verification error:', error);
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 403 }
      );
    }

    console.log('[Webhook] Valid webhook from partner:', partner.name, 'Event:', body.event);

    // 5. Process webhook based on event type
    await processWebhookEvent(supabase, partner.id, body);

    // 6. Log webhook
    await supabase.from('webhook_logs').insert({
      partner_id: partner.id,
      event: body.event,
      payload: body,
      status: 'verified',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Webhook received',
        webhookId: body.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process webhook', details: message },
      { status: 500 }
    );
  }
}

/**
 * Process webhook event
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processWebhookEvent(
  supabase: any,
  partnerId: string,
  webhook: PartnerWebhookPayload
): Promise<void> {
  const { event, data } = webhook;

  switch (event) {
    case 'stock_update':
      await handleStockUpdate(supabase, partnerId, data);
      break;

    case 'gift_redeemed':
      await handleGiftRedeemed(supabase, partnerId, data);
      break;

    case 'branch_status':
      await handleBranchStatus(supabase, partnerId, data);
      break;

    case 'campaign_update':
      await handleCampaignUpdate(supabase, partnerId, data);
      break;

    default:
      console.warn('[Webhook] Unknown event type:', event);
  }
}

/**
 * Handle stock update from partner
 */
async function handleStockUpdate(
  supabase: any,
  partnerId: string,
  data: Record<string, any>
): Promise<void> {
  console.log('[Webhook] Processing stock update:', data);

  const { gift_id, quantity, action } = data; // action: 'add' | 'set' | 'subtract'

  if (!gift_id) {
    console.error('[Webhook] Missing gift_id in stock update');
    return;
  }

  try {
    // Get current stock
    const { data: gift, error: getError } = await supabase
      .from('gifts')
      .select('stock')
      .eq('id', gift_id)
      .eq('partner_id', partnerId)
      .single();

    if (getError || !gift) {
      console.error('[Webhook] Gift not found:', gift_id);
      return;
    }

    let newStock = gift.stock;

    if (action === 'add') {
      newStock += quantity || 0;
    } else if (action === 'subtract') {
      newStock -= quantity || 0;
    } else if (action === 'set') {
      newStock = quantity || 0;
    }

    newStock = Math.max(0, newStock);

    // Update stock
    const { error: updateError } = await supabase
      .from('gifts')
      .update({ stock: newStock })
      .eq('id', gift_id)
      .eq('partner_id', partnerId);

    if (updateError) {
      console.error('[Webhook] Failed to update stock:', updateError.message);
    } else {
      console.log('[Webhook] Stock updated for gift', gift_id, '- New stock:', newStock);
    }
  } catch (error) {
    console.error('[Webhook] Error in handleStockUpdate:', error);
  }
}

/**
 * Handle gift redemption confirmation from partner
 */
async function handleGiftRedeemed(
  supabase: any,
  partnerId: string,
  data: Record<string, any>
): Promise<void> {
  console.log('[Webhook] Processing gift redemption:', data);

  const { action_id, branch_id, redeemed_at } = data;

  if (!action_id) {
    console.error('[Webhook] Missing action_id in redemption');
    return;
  }

  try {
    // Update gift_action
    const { error: updateError } = await supabase
      .from('gift_actions')
      .update({
        status: 'claimed',
        claimed_at: redeemed_at || new Date().toISOString(),
        branch_id: branch_id,
      })
      .eq('id', action_id);

    if (updateError) {
      console.error('[Webhook] Failed to update gift_action:', updateError.message);
    } else {
      console.log('[Webhook] Gift action marked as redeemed:', action_id);

      // Send notification to receiver
      const { data: giftAction } = await supabase
        .from('gift_actions')
        .select('receiver_id, gift:gifts(name)')
        .eq('id', action_id)
        .single();

      if (giftAction?.receiver_id) {
        const { data: branch } = await supabase
          .from('branches')
          .select('name')
          .eq('id', branch_id)
          .single();

        await supabase.from('notifications').insert({
          user_id: giftAction.receiver_id,
          type: 'gift_redeemed',
          title: 'Hediye Kullanıldı',
          message: `Hediyenizi ${branch?.name || 'şubede'} başarıyla kullandınız ✨`,
          is_read: false,
          action_id: action_id,
          created_at: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error('[Webhook] Error in handleGiftRedeemed:', error);
  }
}

/**
 * Handle branch status update
 */
async function handleBranchStatus(
  supabase: any,
  partnerId: string,
  data: Record<string, any>
): Promise<void> {
  console.log('[Webhook] Processing branch status:', data);

  const { branch_id, is_active } = data;

  if (!branch_id) {
    console.error('[Webhook] Missing branch_id');
    return;
  }

  try {
    const { error } = await supabase
      .from('branches')
      .update({ is_active })
      .eq('id', branch_id)
      .eq('partner_id', partnerId);

    if (error) {
      console.error('[Webhook] Failed to update branch:', error.message);
    } else {
      console.log('[Webhook] Branch status updated:', branch_id, '- Active:', is_active);
    }
  } catch (error) {
    console.error('[Webhook] Error in handleBranchStatus:', error);
  }
}

/**
 * Handle campaign/sponsor update
 */
async function handleCampaignUpdate(
  supabase: any,
  partnerId: string,
  data: Record<string, any>
): Promise<void> {
  console.log('[Webhook] Processing campaign update:', data);

  const { sponsor_id, spent, gifts_count } = data;

  if (!sponsor_id) {
    console.error('[Webhook] Missing sponsor_id');
    return;
  }

  try {
    const updates: Record<string, any> = {};
    if (spent !== undefined) updates.spent = spent;
    if (gifts_count !== undefined) updates.gifts_sponsored_count = gifts_count;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('sponsors')
        .update(updates)
        .eq('id', sponsor_id);

      if (error) {
        console.error('[Webhook] Failed to update sponsor:', error.message);
      } else {
        console.log('[Webhook] Sponsor updated:', sponsor_id);
      }
    }
  } catch (error) {
    console.error('[Webhook] Error in handleCampaignUpdate:', error);
  }
}
