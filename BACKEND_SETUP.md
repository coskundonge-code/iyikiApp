# Backend Infrastructure Setup - FAZ 2

Complete guide to setting up the backend infrastructure for iyikiApp core functionality.

## Overview

This document describes the backend infrastructure created for FAZ 2, including:

1. **Notification Services** - Push notifications (FCM), SMS (Netgsm/Twilio)
2. **Webhook System** - Partner integrations with HMAC verification
3. **Supabase Edge Functions** - Gift expiry and pool distribution
4. **Cron Job Routes** - Safe API endpoints for scheduled tasks

## Architecture

```
User Actions
    ↓
Gift System (API Routes)
    ↓
Notification Service ← → Push Service (FCM)
                   ↓
                   SMS Service (Netgsm/Twilio)
                   ↓
                   Database Notifications
    ↓
Gift Expiry Cron (/api/cron/expire-gifts)
    ↓
Social Pool Distribution (/api/cron/distribute-pool)
    ↓
Partner Webhooks (/api/webhooks/partner)
```

## Services Created

### 1. Notification Service (`src/lib/services/notifications.ts`)

**Purpose**: Central hub for sending notifications across multiple channels

**Features**:
- Multi-channel delivery: Database, Push, SMS
- Template system for common notification types
- Automatic device token lookup
- Preference-aware sending (respects user's push_enabled, sms_enabled)

**Notification Types**:
- `gift_received` - "Biri sana bir hediye gönderdi!"
- `gift_redeemed` - "Hediyenizi başarıyla kullandınız"
- `gift_expiring` - "Hediyenin süresi doluyor!"
- `gift_expired` - "Hediyenin süresi doldu, askıda havuzuna aktarıldı"
- `gift_to_pool` - "Bir askıda hediye seni bekliyor!"
- `gift_distributed` - "Askıda havuzundan bir hediye aldın!"
- `premium` - Premium feature notifications
- `system` - Generic system notifications

**Usage**:
```typescript
import { sendNotification } from '@/lib/services/notifications';

await sendNotification({
  userId: 'user-id',
  type: 'gift_received',
  title: 'Hediye Aldın!',
  message: 'Ahmet sana bir hediye gönderdi! 🎁',
  channels: ['db', 'push', 'sms'],
  data: { senderName: 'Ahmet' }
});
```

### 2. Push Notification Service (`src/lib/services/push.ts`)

**Purpose**: Firebase Cloud Messaging integration for push notifications

**Features**:
- Multiple device token support
- Mock/console mode when FCM not configured
- Automatic error logging and retry tracking
- Android & iOS specific configurations

**Environment Variables**:
```
FCM_API_KEY=your-fcm-api-key
FCM_PROJECT_ID=your-firebase-project-id
```

**Status**:
- ✅ Production-ready interface
- ⚠️ Development: Mock mode (logs to console)
- 🚀 Production: Requires FCM credentials

**Usage**:
```typescript
import { sendPushNotification } from '@/lib/services/push';

await sendPushNotification(
  ['device-token-1', 'device-token-2'],
  'Hediye Aldın!',
  'Biri sana bir hediye gönderdi! 🎁',
  { senderName: 'Ahmet' }
);
```

### 3. SMS Service (`src/lib/services/sms.ts`)

**Purpose**: Multi-provider SMS delivery (Netgsm, Twilio)

**Providers**:

#### Netgsm (Turkish)
- Best for Turkish market
- Phone number normalization for Turkish numbers
- Integration with Netgsm API

**Environment Variables**:
```
NETGSM_USERNAME=your-username
NETGSM_PASSWORD=your-password
```

#### Twilio (International)
- Global SMS delivery
- E.164 phone number format
- Support for any country

**Environment Variables**:
```
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_FROM_NUMBER=+15551234567
```

#### Auto-Selection
The service automatically selects the first available provider in order:
1. Netgsm (if NETGSM_USERNAME + NETGSM_PASSWORD configured)
2. Twilio (if TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER configured)
3. Mock (development, logs to console)

**Usage**:
```typescript
import { sendSmsNotification } from '@/lib/services/sms';

await sendSmsNotification('+905551234567', 'Hediye aldın! 🎁');
```

### 4. Webhook Service (`src/lib/services/webhooks.ts`)

**Purpose**: Partner system integration with security and retry logic

**Features**:
- HMAC-SHA256 signature verification
- Automatic retry logic (3 attempts with exponential backoff)
- Webhook event logging
- Manual resend capability

**Retry Delays**:
- Attempt 1: 5 seconds
- Attempt 2: 30 seconds
- Attempt 3: 5 minutes

**Usage**:
```typescript
import { triggerPartnerWebhook } from '@/lib/services/webhooks';

await triggerPartnerWebhook(
  'partner-id',
  'gift_redeemed',
  {
    actionId: 'action-123',
    branchId: 'branch-456',
    redeemedAt: new Date().toISOString()
  }
);
```

## Supabase Edge Functions

### 1. Expire Gifts (`supabase/functions/expire-gifts/index.ts`)

**Purpose**: Periodically check for expired gift actions and move them to social pool

**Flow**:
1. Find all `gift_actions` with `status='pending'` AND `expires_at < now()`
2. Update them to `status='expired'`, set `expired_at=now()`
3. Create entries in `social_pool` for each expired gift
4. Send `gift_expired` notifications to receivers
5. Log summary to console

**Deployment**:
```bash
# Deploy to Supabase
supabase functions deploy expire-gifts

# Or trigger manually via API
curl https://your-project.supabase.co/functions/v1/expire-gifts
```

**Logging**:
- Logs number of expired gifts
- Logs number of items moved to pool
- Logs number of notifications sent

### 2. Distribute Pool (`supabase/functions/distribute-pool/index.ts`)

**Purpose**: Randomly distribute available pool gifts to eligible users

**Flow**:
1. Find available gifts in `social_pool` with `status='available'`
2. Find eligible receivers (active users, haven't received from pool today)
3. Randomly assign gifts to receivers (round-robin distribution)
4. Update `social_pool` items to `status='distributed'`
5. Create `gift_actions` records
6. Send `gift_distributed` notifications
7. Update user `daily_receive_count`

**Distribution Algorithm**:
- Simple round-robin based on gift order vs. eligible users
- Each user receives at most 1 pool gift per day

**Deployment**:
```bash
supabase functions deploy distribute-pool
```

## API Routes

### 1. Partner Webhook Receiver (`src/app/api/webhooks/partner/route.ts`)

**Endpoint**: `POST /api/webhooks/partner`

**Authentication**:
- Header `X-API-Key`: Partner's API key
- Header `X-Webhook-Signature`: HMAC-SHA256 signature of body

**Events Supported**:
- `stock_update` - Update gift stock from partner
- `gift_redeemed` - Partner confirms gift redemption
- `branch_status` - Update branch active status
- `campaign_update` - Update sponsor campaign metrics

**Example Request**:
```bash
curl -X POST http://localhost:3000/api/webhooks/partner \
  -H "Content-Type: application/json" \
  -H "X-API-Key: partner-api-key" \
  -H "X-Webhook-Signature: hmac-signature" \
  -d '{
    "id": "webhook-123",
    "event": "gift_redeemed",
    "partnerId": "partner-id",
    "timestamp": "2026-04-04T10:00:00Z",
    "data": {
      "action_id": "action-123",
      "branch_id": "branch-456"
    }
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Webhook received",
  "webhookId": "webhook-123"
}
```

### 2. Expire Gifts Cron (`src/app/api/cron/expire-gifts/route.ts`)

**Endpoint**: `GET /api/cron/expire-gifts`

**Authentication**: Query parameter `secret` must match `CRON_SECRET` environment variable

**Query Parameters**:
- `secret` (required): CRON_SECRET value
- `webhook` (optional): `true` to use Supabase Edge Function (default: local logic)

**Example Requests**:
```bash
# Using local logic
curl "http://localhost:3000/api/cron/expire-gifts?secret=your-cron-secret"

# Using Supabase Edge Function
curl "http://localhost:3000/api/cron/expire-gifts?secret=your-cron-secret&webhook=true"
```

**Response**:
```json
{
  "success": true,
  "message": "Gifts expired and moved to pool",
  "expiredCount": 5,
  "pooledCount": 5,
  "notificationsSent": 5,
  "executedAt": "2026-04-04T10:00:00Z",
  "method": "local"
}
```

### 3. Distribute Pool Cron (`src/app/api/cron/distribute-pool/route.ts`)

**Endpoint**: `GET /api/cron/distribute-pool`

**Authentication**: Query parameter `secret` must match `CRON_SECRET`

**Query Parameters**:
- `secret` (required): CRON_SECRET value
- `webhook` (optional): `true` to use Supabase Edge Function

**Example Request**:
```bash
curl "http://localhost:3000/api/cron/distribute-pool?secret=your-cron-secret"
```

**Response**:
```json
{
  "success": true,
  "message": "Gifts distributed from pool",
  "distributedCount": 10,
  "recipientCount": 8,
  "notificationsSent": 8,
  "executedAt": "2026-04-04T10:00:00Z",
  "method": "local"
}
```

## Environment Setup

### 1. Copy Example Configuration
```bash
cp .env.local.example .env.local
```

### 2. Configure Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Configure Cron Secret
```bash
# Generate a secure random secret
openssl rand -base64 32
```

```env
CRON_SECRET=generated-secret-here
```

### 4. Configure Push Notifications (Optional)

**For Production**:
```env
FCM_API_KEY=your-fcm-api-key
FCM_PROJECT_ID=your-firebase-project-id
```

**For Development**: Omit these; the service will use mock mode and log to console.

### 5. Configure SMS Provider

**Option A: Netgsm (Recommended for Turkey)**:
```env
NETGSM_USERNAME=your-username
NETGSM_PASSWORD=your-password
```

**Option B: Twilio (International)**:
```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_NUMBER=+15551234567
```

**Option C: None (Development)**:
- Omit all SMS provider variables
- Service will use mock provider, logging to console

## Database Tables Required

Ensure these tables exist in your Supabase database:

```sql
-- Existing tables (from schema.sql)
- users
- gifts
- gift_actions
- partners
- branches
- sponsors
- notifications
- webhook_logs
- user_devices (for FCM tokens)

-- New tables needed:
CREATE TABLE social_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID NOT NULL REFERENCES gifts(id),
  original_sender_id UUID,
  original_action_id UUID REFERENCES gift_actions(id),
  status TEXT DEFAULT 'available', -- available, distributed
  pooled_at TIMESTAMPTZ DEFAULT now(),
  distributed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE gift_actions ADD COLUMN from_pool BOOLEAN DEFAULT false;
ALTER TABLE gift_actions ADD COLUMN pool_gift_id UUID;
```

## Scheduling Cron Jobs

### Option 1: External Cron Service
Use services like cron-job.org, easycron, or BetterStack

**Setup**:
1. Go to cron service
2. Create two scheduled jobs:
   - `GET /api/cron/expire-gifts?secret=YOUR_CRON_SECRET` - Every 15 minutes
   - `GET /api/cron/distribute-pool?secret=YOUR_CRON_SECRET` - Every hour

### Option 2: Supabase pg_cron
Already available in Supabase PostgreSQL:

```sql
-- Expire gifts every 15 minutes
SELECT cron.schedule('expire-gifts', '*/15 * * * *', 'SELECT net.http_post(''https://your-app.vercel.app/api/cron/expire-gifts?secret=YOUR_CRON_SECRET'')');

-- Distribute pool daily at 6 AM UTC
SELECT cron.schedule('distribute-pool', '0 6 * * *', 'SELECT net.http_post(''https://your-app.vercel.app/api/cron/distribute-pool?secret=YOUR_CRON_SECRET'')');
```

### Option 3: Vercel Cron (Next.js 16+)
Using `/scheduled` routes (requires serverless deployment):

```typescript
// src/app/api/scheduled/expire-gifts/route.ts
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // This runs automatically at scheduled times on Vercel
}
```

### Option 4: Docker/Kubernetes
Run a sidecar container with node-cron or similar scheduler

## Development Testing

### 1. Test Notification Service
```typescript
import { sendNotification } from '@/lib/services/notifications';

// In your Next.js route handler or server action
await sendNotification({
  userId: 'test-user-id',
  type: 'gift_received',
  title: 'Test Title',
  message: 'Test message',
  channels: ['db'], // Start with DB only
});
```

### 2. Test Partner Webhook
```bash
curl -X POST http://localhost:3000/api/webhooks/partner \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key" \
  -H "X-Webhook-Signature: test-signature" \
  -d '{"event": "stock_update", "data": {}}'
```

### 3. Test Cron Routes
```bash
# Test expire gifts
curl "http://localhost:3000/api/cron/expire-gifts?secret=test-secret"

# Test distribute pool
curl "http://localhost:3000/api/cron/distribute-pool?secret=test-secret"
```

### 4. Monitor Webhook Logs
```typescript
import { getWebhookLogs } from '@/lib/services/webhooks';

const logs = await getWebhookLogs('partner-id', 20);
console.log(logs);
```

## Security Considerations

1. **CRON_SECRET**: Use strong, cryptographically random secrets (minimum 32 characters)
2. **API Keys**: Rotate partner API keys regularly
3. **Webhook Signatures**: Always verify HMAC signatures before processing
4. **Service Role Key**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code
5. **Rate Limiting**: Consider adding rate limiting to webhook routes
6. **Logging**: Be careful not to log sensitive user data

## Monitoring & Logging

All services include comprehensive logging:

```
[Notifications] - sendNotification, channel selection
[Push] - FCM API calls, token handling
[SMS/Netgsm] - Provider-specific logs
[SMS/Twilio] - Provider-specific logs
[Webhooks] - Signature verification, retry logic
[Cron] - Job execution, record counts
[Webhook] - Event processing, errors
```

Monitor logs in:
- **Development**: Console output
- **Production**: Vercel/Cloud logs, or integrate with external logging service

## Troubleshooting

### Notifications Not Sending
1. Check `SUPABASE_SERVICE_ROLE_KEY` is configured
2. Verify user exists and is active
3. Check device tokens exist (for push) or phone number exists (for SMS)
4. Review console logs for specific errors

### Cron Jobs Not Running
1. Verify `CRON_SECRET` is set and matches API call
2. Check cron service configuration (external or Supabase)
3. Monitor endpoint response codes
4. Review application logs

### Webhook Not Processing
1. Verify partner has valid `api_key` and `api_secret`
2. Check HMAC signature calculation
3. Review webhook logs in database
4. Test with mock request (include valid signature)

### SMS Not Sending
1. Verify SMS provider credentials
2. Check phone number format (Netgsm: Turkish format, Twilio: E.164)
3. Check SMS provider balance/quota
4. Review provider API response in logs

### Push Notifications Not Sending
1. Verify FCM credentials if configured
2. Check device has valid FCM token
3. Verify user has `push_enabled=true`
4. Review FCM API logs

## Future Enhancements

1. **Message Queue**: Add Bull/Redis for async notification delivery
2. **Batch Processing**: Optimize large-scale distributions
3. **Analytics**: Track notification delivery rates
4. **A/B Testing**: Test notification content variations
5. **Personalization**: Learn user preferences and timing
6. **Multi-language**: Add notification template internationalization

## References

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Netgsm SMS API](https://www.netgsm.com.tr/api-dokumantasyon)
- [Twilio SMS API](https://www.twilio.com/docs/sms/api)
- [HMAC-SHA256 Signatures](https://en.wikipedia.org/wiki/HMAC)
