/**
 * SMS Notification Service
 * Supports multiple SMS providers: Netgsm (Turkish), Twilio (International)
 */

export interface SmsProvider {
  send(phone: string, message: string): Promise<boolean>;
}

/**
 * Netgsm SMS Provider (Turkish SMS service)
 * https://www.netgsm.com.tr/
 */
export class NetgsmProvider implements SmsProvider {
  private username: string;
  private password: string;
  private apiUrl = 'https://api.netgsm.com.tr/sms/send/get/';

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  async send(phone: string, message: string): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        usercode: this.username,
        password: this.password,
        gsmno: this.normalizePhone(phone),
        message,
        msgheader: 'iyiki.app',
      });

      const response = await fetch(`${this.apiUrl}?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        console.error('[SMS/Netgsm] HTTP error:', response.status);
        return false;
      }

      const text = await response.text();
      console.log('[SMS/Netgsm] Response:', text);

      // Netgsm returns success codes like "00" or "01"
      // Any code in the first 2 characters can indicate various states
      // We consider 00, 01, 20-29 as successful
      const code = text.trim().substring(0, 2);
      const success = !code.startsWith('2') || code.startsWith('20');

      if (!success) {
        console.error('[SMS/Netgsm] API returned error code:', code);
      }

      return success;
    } catch (error) {
      console.error('[SMS/Netgsm] Error sending SMS:', error);
      return false;
    }
  }

  private normalizePhone(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');

    // If Turkish number, ensure it starts with 90
    if (digits.length === 10 && digits.startsWith('5')) {
      return '90' + digits;
    } else if (digits.length === 12 && digits.startsWith('90')) {
      return digits;
    }

    return digits;
  }
}

/**
 * Twilio SMS Provider (International)
 * https://www.twilio.com/
 */
export class TwilioProvider implements SmsProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  private apiUrl: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
    this.apiUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;
  }

  async send(phone: string, message: string): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        From: this.fromNumber,
        To: this.normalizePhone(phone),
        Body: message,
      });

      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

      const response = await fetch(`${this.apiUrl}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('[SMS/Twilio] API error:', error);
        return false;
      }

      const result = await response.json();
      console.log('[SMS/Twilio] Message sent:', result.sid);
      return true;
    } catch (error) {
      console.error('[SMS/Twilio] Error sending SMS:', error);
      return false;
    }
  }

  private normalizePhone(phone: string): string {
    // Twilio expects E.164 format: +[country code][number]
    const digits = phone.replace(/\D/g, '');

    // If no country code, assume +90 (Turkey)
    if (!phone.startsWith('+')) {
      if (digits.length === 10 && digits.startsWith('5')) {
        return '+90' + digits;
      } else if (digits.length === 12 && digits.startsWith('90')) {
        return '+' + digits;
      }
    }

    return phone;
  }
}

/**
 * Mock SMS Provider for development
 * Logs to console instead of sending actual SMS
 */
export class MockSmsProvider implements SmsProvider {
  async send(phone: string, message: string): Promise<boolean> {
    console.log('[SMS/Mock] Would send SMS to', phone, ':', message);
    return true;
  }
}

/**
 * Factory function to create the appropriate SMS provider
 * Priority: Netgsm > Twilio > Mock
 */
export function createSmsProvider(): SmsProvider {
  const netgsmUsername = process.env.NETGSM_USERNAME;
  const netgsmPassword = process.env.NETGSM_PASSWORD;

  if (netgsmUsername && netgsmPassword) {
    console.log('[SMS] Using Netgsm provider');
    return new NetgsmProvider(netgsmUsername, netgsmPassword);
  }

  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFromNumber = process.env.TWILIO_FROM_NUMBER;

  if (twilioAccountSid && twilioAuthToken && twilioFromNumber) {
    console.log('[SMS] Using Twilio provider');
    return new TwilioProvider(twilioAccountSid, twilioAuthToken, twilioFromNumber);
  }

  console.warn('[SMS] No SMS provider configured, using mock provider');
  return new MockSmsProvider();
}

/**
 * Send SMS notification with automatic provider selection
 */
export async function sendSmsNotification(phone: string, message: string): Promise<boolean> {
  const provider = createSmsProvider();

  // Truncate message to SMS limits
  const maxLength = 160;
  const truncatedMessage = message.length > maxLength
    ? message.substring(0, maxLength - 3) + '...'
    : message;

  try {
    const success = await provider.send(phone, truncatedMessage);
    if (!success) {
      console.error('[SMS] Failed to send SMS to', phone);
    }
    return success;
  } catch (error) {
    console.error('[SMS] Error in sendSmsNotification:', error);
    return false;
  }
}
