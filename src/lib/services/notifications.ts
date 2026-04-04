import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { sendPushNotification } from './push';
import { sendSmsNotification } from './sms';

export type NotificationChannel = 'db' | 'push' | 'sms';
export type NotificationType =
  | 'gift_received'
  | 'gift_redeemed'
  | 'gift_expiring'
  | 'gift_expired'
  | 'gift_to_pool'
  | 'gift_distributed'
  | 'premium'
  | 'system';

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionId?: string;
  channels: NotificationChannel[];
  data?: Record<string, string>;
}

interface NotificationTemplate {
  title: string;
  message: string;
}

// Notification templates for different event types
const NOTIFICATION_TEMPLATES: Record<NotificationType, (vars: Record<string, string>) => NotificationTemplate> = {
  gift_received: (vars) => ({
    title: 'Hediye Aldın!',
    message: `${vars.senderName || 'Biri'} sana bir hediye gönderdi! 🎁`,
  }),
  gift_redeemed: (vars) => ({
    title: 'Hediye Kullanıldı',
    message: `Hediyenizi ${vars.branchName || 'şubede'} başarıyla kullandınız ✨`,
  }),
  gift_expiring: (vars) => ({
    title: 'Hediyenin Süresi Doluyor!',
    message: `${vars.giftName || 'Hediyeniz'} süresi ${vars.expiresIn || '1 saat'} içinde doluyor ⏰`,
  }),
  gift_expired: (vars) => ({
    title: 'Hediye Süresi Doldu',
    message: `${vars.giftName || 'Hediyeniz'} süresi doldu, askıda havuzuna taşındı 💛`,
  }),
  gift_to_pool: (vars) => ({
    title: 'Askıda Hediye Bekleniyor',
    message: `Bir askıda hediye seni bekliyor! Hızlıca al! 💝`,
  }),
  gift_distributed: (vars) => ({
    title: 'Askıda Havuzundan Hediye!',
    message: `Askıda havuzundan ${vars.giftName || 'bir hediye'} aldın! 🎉`,
  }),
  premium: (vars) => ({
    title: 'Premium Özellikleri',
    message: vars.message || 'Premium özelliklerinizi keşfedin',
  }),
  system: (vars) => ({
    title: vars.title || 'Sistem Bildirimi',
    message: vars.message || 'Yeni bir bildirim var',
  }),
};

/**
 * Get notification template and fill in variables
 */
export function getNotificationTemplate(
  type: NotificationType,
  vars: Record<string, string> = {}
): NotificationTemplate {
  const templateFn = NOTIFICATION_TEMPLATES[type];
  if (!templateFn) {
    return {
      title: 'Bildirinim',
      message: 'Yeni bir bildirim var',
    };
  }
  return templateFn(vars);
}

/**
 * Send notification through multiple channels
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  console.log('[Notifications] Sending notification:', {
    userId: payload.userId,
    type: payload.type,
    channels: payload.channels,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Notifications] Supabase credentials not configured');
    return;
  }

  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

  // 1. Save to database
  if (payload.channels.includes('db')) {
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        action_id: payload.actionId,
        is_read: false,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('[Notifications] Failed to save to DB:', error);
      } else {
        console.log('[Notifications] Saved to database');
      }
    } catch (error) {
      console.error('[Notifications] Error saving to database:', error);
    }
  }

  // Get user details for push and SMS
  let userPhone: string | null = null;
  let deviceTokens: string[] = [];
  let pushEnabled = true;
  let smsEnabled = true;

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('phone, push_enabled, sms_enabled')
      .eq('id', payload.userId)
      .single();

    if (userError) {
      console.error('[Notifications] Failed to fetch user:', userError);
    } else if (userData) {
      userPhone = userData.phone;
      pushEnabled = userData.push_enabled ?? true;
      smsEnabled = userData.sms_enabled ?? true;
    }

    // Get device tokens for push notifications
    if (pushEnabled) {
      const { data: devices, error: devicesError } = await supabase
        .from('user_devices')
        .select('fcm_token')
        .eq('user_id', payload.userId)
        .eq('is_active', true);

      if (!devicesError && devices) {
        deviceTokens = devices
          .map((d: { fcm_token: string }) => d.fcm_token)
          .filter((token): token is string => !!token);
      }
    }
  } catch (error) {
    console.error('[Notifications] Error fetching user details:', error);
  }

  // 2. Send push notification
  if (payload.channels.includes('push') && pushEnabled && deviceTokens.length > 0) {
    try {
      await sendPushNotification(deviceTokens, payload.title, payload.message, {
        type: payload.type,
        actionId: payload.actionId || '',
        ...payload.data,
      });
      console.log('[Notifications] Push sent to', deviceTokens.length, 'devices');
    } catch (error) {
      console.error('[Notifications] Failed to send push:', error);
    }
  }

  // 3. Send SMS notification
  if (payload.channels.includes('sms') && smsEnabled && userPhone) {
    try {
      await sendSmsNotification(userPhone, payload.message);
      console.log('[Notifications] SMS sent to', userPhone);
    } catch (error) {
      console.error('[Notifications] Failed to send SMS:', error);
    }
  }
}

/**
 * Send batch notifications to multiple users
 */
export async function sendNotificationBatch(
  payloads: NotificationPayload[]
): Promise<void> {
  console.log('[Notifications] Sending batch of', payloads.length, 'notifications');

  for (const payload of payloads) {
    await sendNotification(payload);
  }
}

/**
 * Send reminder notification for expiring gifts
 */
export async function sendExpiringGiftReminder(
  userId: string,
  giftName: string,
  expiresInMinutes: number
): Promise<void> {
  const hoursOrMinutes = expiresInMinutes >= 60
    ? `${Math.floor(expiresInMinutes / 60)} saat`
    : `${expiresInMinutes} dakika`;

  const template = getNotificationTemplate('gift_expiring', {
    giftName,
    expiresIn: hoursOrMinutes,
  });

  await sendNotification({
    userId,
    type: 'gift_expiring',
    title: template.title,
    message: template.message,
    channels: ['db', 'push', 'sms'],
  });
}
