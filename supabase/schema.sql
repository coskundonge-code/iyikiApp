-- TEŞEKKÜRLER (İYİ Kİ) - Dijital Hediye Platformu
-- Supabase PostgreSQL Schema

-- Enum Types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'partner', 'sponsor');
CREATE TYPE premium_tier AS ENUM ('free', 'premium');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deleted');
CREATE TYPE gift_category AS ENUM ('coffee', 'chocolate', 'book', 'flower', 'experience', 'food');
CREATE TYPE gift_action_status AS ENUM ('pending', 'claimed', 'expired', 'social_pool', 'distributed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('gift_received', 'gift_redeemed', 'gift_expiring', 'gift_expired', 'gift_to_pool', 'gift_distributed', 'premium', 'system');
CREATE TYPE fraud_type AS ENUM ('looping', 'fake_gps', 'emulator', 'cloning', 'rate_abuse', 'suspicious_behavior');
CREATE TYPE fraud_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Users table (linked to auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  phone_hash TEXT,
  name TEXT,
  avatar TEXT,
  birthday DATE,
  role user_role DEFAULT 'user',
  tier premium_tier DEFAULT 'free',
  iyki_score INT DEFAULT 0,
  daily_send_count INT DEFAULT 0,
  daily_send_limit INT DEFAULT 1,
  daily_receive_count INT DEFAULT 0,
  status user_status DEFAULT 'active',
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT true,
  premium_started_at TIMESTAMPTZ,
  premium_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_users_role ON public.users(role);

-- Partners table
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT,
  api_key TEXT UNIQUE,
  api_secret TEXT,
  webhook_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Branches table
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  district TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_branches_partner ON public.branches(partner_id);

-- Sponsors table
CREATE TABLE public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  budget DOUBLE PRECISION DEFAULT 0,
  spent DOUBLE PRECISION DEFAULT 0,
  campaign_start TIMESTAMPTZ NOT NULL,
  campaign_end TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  gifts_sponsored_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Gifts table
CREATE TABLE public.gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  category gift_category NOT NULL,
  stock INT DEFAULT 0,
  expiry_hours INT DEFAULT 72,
  sponsor_id UUID REFERENCES public.sponsors(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gifts_partner ON public.gifts(partner_id);
CREATE INDEX idx_gifts_category ON public.gifts(category);
CREATE INDEX idx_gifts_active ON public.gifts(is_active);
CREATE INDEX idx_gifts_sponsor ON public.gifts(sponsor_id);

-- Gift Actions table (gift lifecycle)
CREATE TABLE public.gift_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID REFERENCES public.gifts(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  receiver_phone TEXT NOT NULL,
  note TEXT,
  status gift_action_status DEFAULT 'pending',
  redeem_code TEXT UNIQUE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  claimed_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  pooled_at TIMESTAMPTZ,
  distributed_at TIMESTAMPTZ
);

CREATE INDEX idx_gift_actions_sender ON public.gift_actions(sender_id);
CREATE INDEX idx_gift_actions_receiver ON public.gift_actions(receiver_id);
CREATE INDEX idx_gift_actions_phone ON public.gift_actions(receiver_phone);
CREATE INDEX idx_gift_actions_status ON public.gift_actions(status);
CREATE INDEX idx_gift_actions_code ON public.gift_actions(redeem_code);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);

-- Devices table (fraud protection)
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  fingerprint TEXT UNIQUE NOT NULL,
  platform TEXT NOT NULL,
  os_version TEXT,
  app_version TEXT,
  trust_score DOUBLE PRECISION DEFAULT 1.0,
  is_blacklisted BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_devices_user ON public.devices(user_id);
CREATE INDEX idx_devices_fingerprint ON public.devices(fingerprint);

-- Fraud Flags table
CREATE TABLE public.fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type fraud_type NOT NULL,
  severity fraud_severity NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fraud_user ON public.fraud_flags(user_id);
CREATE INDEX idx_fraud_type ON public.fraud_flags(type);
CREATE INDEX idx_fraud_resolved ON public.fraud_flags(resolved);

-- Scheduled Gifts (Premium feature)
CREATE TABLE public.scheduled_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  gift_id TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  receiver_name TEXT,
  note TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  occasion TEXT,
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  action TEXT NOT NULL,
  target TEXT,
  metadata JSONB,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_action ON public.audit_logs(action);

-- Analytics Events
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  user_id TEXT,
  properties JSONB,
  platform TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analytics_event ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_user ON public.analytics_events(user_id);

-- Function to handle new user from auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, phone, name, role, tier, status, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'user',
    'free',
    'active',
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users: authenticated users can read all, update own
CREATE POLICY "Users can read all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can manage users" ON public.users USING (auth.jwt()->>'role' = 'service_role');

-- Gifts: everyone can read active gifts
CREATE POLICY "Anyone can read active gifts" ON public.gifts FOR SELECT USING (is_active = true);
CREATE POLICY "Service role can manage gifts" ON public.gifts USING (auth.jwt()->>'role' = 'service_role');

-- Partners: everyone can read active partners
CREATE POLICY "Anyone can read active partners" ON public.partners FOR SELECT USING (is_active = true);

-- Branches: everyone can read active branches
CREATE POLICY "Anyone can read active branches" ON public.branches FOR SELECT USING (is_active = true);

-- Sponsors: everyone can read active sponsors
CREATE POLICY "Anyone can read active sponsors" ON public.sponsors FOR SELECT USING (is_active = true);

-- Gift Actions: users can read their own
CREATE POLICY "Users can read own gift actions" ON public.gift_actions FOR SELECT USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);
CREATE POLICY "Users can create gift actions" ON public.gift_actions FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can update own received gifts" ON public.gift_actions FOR UPDATE USING (
  receiver_id = auth.uid() OR sender_id = auth.uid()
);

-- Notifications: users can read own
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Fraud flags: admin only (use service role)
CREATE POLICY "Service role manages fraud flags" ON public.fraud_flags USING (auth.jwt()->>'role' = 'service_role');

-- Devices: users can manage own
CREATE POLICY "Users can manage own devices" ON public.devices FOR ALL USING (user_id = auth.uid());

-- Scheduled gifts: users can manage own
CREATE POLICY "Users can manage own scheduled gifts" ON public.scheduled_gifts FOR ALL USING (user_id = auth.uid());

-- Audit/Analytics: service role only
CREATE POLICY "Service role manages audit logs" ON public.audit_logs USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role manages analytics" ON public.analytics_events USING (auth.jwt()->>'role' = 'service_role');
