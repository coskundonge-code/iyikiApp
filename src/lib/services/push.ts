/**
 * Push Notification Service via Firebase Cloud Messaging
 * Integrates with FCM for delivering push notifications to mobile devices
 */

interface FCMMessage {
  token: string;
  notification: {
    title: string;
    body: string;
  };
  data?: Record<string, string>;
  android?: {
    priority: string;
    notification?: {
      sound: string;
      channelId: string;
    };
  };
  apns?: {
    payload: {
      aps: {
        sound: string;
        badge: number;
      };
    };
  };
}

/**
 * Send push notification via Firebase Cloud Messaging
 * @param deviceTokens - Array of FCM device tokens
 * @param title - Notification title
 * @param body - Notification message body
 * @param data - Optional custom data to include in the notification
 */
export async function sendPushNotification(
  deviceTokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  const fcmApiKey = process.env.FCM_API_KEY;
  const fcmProjectId = process.env.FCM_PROJECT_ID;

  // If no credentials, log a warning and return (development mode)
  if (!fcmApiKey || !fcmProjectId) {
    console.warn('[Push] FCM credentials not configured. Push notifications disabled.');
    console.log('[Push] (Mock) Would send to', deviceTokens.length, 'devices:', {
      title,
      body,
      data,
    });
    return;
  }

  // Filter out empty tokens
  const validTokens = deviceTokens.filter((token) => token && token.length > 0);

  if (validTokens.length === 0) {
    console.warn('[Push] No valid device tokens provided');
    return;
  }

  try {
    // Send to each device token
    const sendPromises = validTokens.map((token) =>
      sendSinglePushNotification(token, title, body, data)
    );

    const results = await Promise.allSettled(sendPromises);

    // Log results
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(`[Push] Sent to ${successful}/${validTokens.length} devices (${failed} failed)`);

    if (failed > 0) {
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`[Push] Token ${validTokens[index]} failed:`, result.reason);
        }
      });
    }
  } catch (error) {
    console.error('[Push] Error sending push notifications:', error);
    throw error;
  }
}

/**
 * Send a single push notification to a device
 */
async function sendSinglePushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  const fcmApiKey = process.env.FCM_API_KEY;
  const fcmProjectId = process.env.FCM_PROJECT_ID;

  if (!fcmApiKey || !fcmProjectId) {
    console.log('[Push] (Mock) Single message to token:', token, {
      title,
      body,
      data,
    });
    return;
  }

  const message: FCMMessage = {
    token,
    notification: {
      title,
      body,
    },
    data,
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'iyiki_notifications',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  };

  try {
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${fcmProjectId}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${fcmApiKey}`,
        },
        body: JSON.stringify({ message }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('[Push] FCM API error:', error);
      throw new Error(`FCM error: ${error.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('[Push] Message sent:', result.name);
  } catch (error) {
    console.error('[Push] Error sending to token', token, ':', error);
    throw error;
  }
}

/**
 * Validate FCM token format
 */
export function isValidFcmToken(token: string): boolean {
  return typeof token === 'string' && token.length > 0;
}