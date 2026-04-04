/**
 * Partner Webhook Service
 * Manages communication with partner systems via webhooks
 * Includes HMAC signature verification and retry logic
 */

import crypto from 'crypto';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export interface WebhookEvent {
  id: string;
  partnerId: string;
  eventType: string;
  payload: Record<string, any>;
  timestamp: string;
  signature: string;
}

interface WebhookLogEntry {
  partnerId: string;
  event: string;
  payload: Record<string, any>;
  status: 'pending' | 'sent' | 'failed' | 'verified';
  response?: string;
  error?: string;
  attempts: number;
  nextRetryAt?: string;
  createdAt: string;
  updatedAt: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [5000, 30000, 300000]; // 5s, 30s, 5m
const WEBHOOK_TIMEOUT = 30000; // 30 seconds

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verify webhook signature from partner
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Trigger webhook to partner with retry logic
 */
export async function triggerPartnerWebhook(
  partnerId: string,
  event: string,
  payload: Record<string, any>
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Webhooks] Supabase credentials not configured');
    return;
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get partner details
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('webhook_url, api_secret')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      console.error('[Webhooks] Partner not found:', partnerId);
      return;
    }

    if (!partner.webhook_url) {
      console.warn('[Webhooks] Partner has no webhook URL:', partnerId);
      return;
    }

    // Prepare webhook payload
    const webhookPayload = {
      id: crypto.randomUUID(),
      event,
      partnerId,
      timestamp: new Date().toISOString(),
      data: payload,
    };

    const payloadJson = JSON.stringify(webhookPayload);
    const signature = generateSignature(payloadJson, partner.api_secret || '');

    // Log webhook attempt
    const logEntry: WebhookLogEntry = {
      partnerId,
      event,
      payload: webhookPayload,
      status: 'pending',
      attempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await supabase.from('webhook_logs').insert(logEntry);

    // Send webhook with retry logic
    await sendWebhookWithRetry(
      partner.webhook_url,
      webhookPayload,
      signature,
      partnerId,
      event,
      0
    );
  } catch (error) {
    console.error('[Webhooks] Error triggering webhook:', error);
  }
}

/**
 * Send webhook with automatic retry
 */
async function sendWebhookWithRetry(
  url: string,
  payload: Record<string, any>,
  signature: string,
  partnerId: string,
  event: string,
  attempt: number
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return;
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': event,
        'X-Webhook-Timestamp': new Date().toISOString(),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('[Webhooks] Webhook sent successfully to', partnerId, 'event:', event);

      // Update log as sent
      await supabase
        .from('webhook_logs')
        .update({
          status: 'sent',
          attempts: attempt + 1,
          updatedAt: new Date().toISOString(),
        })
        .eq('partnerId', partnerId)
        .eq('event', event)
        .order('createdAt', { ascending: false })
        .limit(1);

      return;
    }

    const responseText = await response.text();
    throw new Error(
      `HTTP ${response.status}: ${responseText.substring(0, 200)}`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `[Webhooks] Attempt ${attempt + 1} failed for ${partnerId}:`,
      errorMessage
    );

    // Update log with error
    await supabase
      .from('webhook_logs')
      .update({
        status: 'failed',
        error: errorMessage,
        attempts: attempt + 1,
        updatedAt: new Date().toISOString(),
      })
      .eq('partnerId', partnerId)
      .eq('event', event)
      .order('createdAt', { ascending: false })
      .limit(1);

    // Retry if attempts remaining
    if (attempt < MAX_RETRIES - 1) {
      const delay = RETRY_DELAYS[attempt];
      console.log(`[Webhooks] Scheduling retry in ${delay}ms...`);

      setTimeout(() => {
        sendWebhookWithRetry(url, payload, signature, partnerId, event, attempt + 1);
      }, delay);
    } else {
      console.error(`[Webhooks] Max retries reached for ${partnerId}`);
    }
  }
}

/**
 * Get webhook logs for a partner
 */
export async function getWebhookLogs(
  partnerId: string,
  limit: number = 50
): Promise<WebhookLogEntry[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return [];
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('partnerId', partnerId)
      .order('createdAt', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Webhooks] Error fetching logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Webhooks] Error in getWebhookLogs:', error);
    return [];
  }
}

/**
 * Resend failed webhook
 */
export async function resendFailedWebhook(
  partnerId: string,
  event: string
): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return false;
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: logEntry } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('partnerId', partnerId)
      .eq('event', event)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (!logEntry) {
      console.error('[Webhooks] Log entry not found');
      return false;
    }

    const { data: partner } = await supabase
      .from('partners')
      .select('webhook_url, api_secret')
      .eq('id', partnerId)
      .single();

    if (!partner?.webhook_url) {
      console.error('[Webhooks] Partner webhook URL not found');
      return false;
    }

    const signature = generateSignature(
      JSON.stringify(logEntry.payload),
      partner.api_secret || ''
    );

    await sendWebhookWithRetry(
      partner.webhook_url,
      logEntry.payload,
      signature,
      partnerId,
      event,
      0
    );

    return true;
  } catch (error) {
    console.error('[Webhooks] Error resending webhook:', error);
    return false;
  }
}
