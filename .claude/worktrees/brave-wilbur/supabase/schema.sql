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

-- RPC Functions for atomic operations

-- Decrement gift stock (only if stock > 0)
CREATE OR REPLACE FUNCTION public.decrement_gift_stock(p_gift_id UUID)
RETURNS TABLE(success BOOLEAN, new_stock INT) AS $$
BEGIN
  UPDATE public.gifts
  SET stock = stock - 1
  WHERE id = p_gift_id AND stock > 0
  RETURNING (stock > 0) as success_flag, stock as new_stock_value;

  RETURN QUERY
  SELECT
    CASE WHEN stock > 0 THEN true ELSE false END as success,
    stock as new_stock
  FROM public.gifts
  WHERE id = p_gift_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment user score by 1
CREATE OR REPLACE FUNCTION public.increment_user_score(p_user_id UUID)
RETURNS TABLE(success BOOLEAN, new_score INT) AS $$
BEGIN
  UPDATE public.users
  SET iyki_score = iyki_score + 1
  WHERE id = p_user_id;

  RETURN QUERY
  SELECT
    true as success,
    iyki_score as new_score
  FROM public.users
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset daily counts for all users
CREATE OR REPLACE FUNCTION public.reset_daily_counts()
RETURNS TABLE(users_updated INT) AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE public.users
  SET daily_send_count = 0, daily_receive_count = 0
  WHERE status = 'active';

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN QUERY
  SELECT v_count as users_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Expire pending gifts where expires_at < now()
CREATE OR REPLACE FUNCTION public.expire_pending_gifts()
RETURNS TABLE(gifts_expired INT) AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE public.gift_actions
  SET status = 'expired', expired_at = now()
  WHERE status = 'pending' AND expires_at < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN QUERY
  SELECT v_count as gifts_expired;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Move expired gifts to social pool
CREATE OR REPLACE FUNCTION public.move_expired_to_pool()
RETURNS TABLE(gifts_pooled INT) AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE public.gift_actions
  SET status = 'social_pool', pooled_at = now()
  WHERE status = 'expired' AND pooled_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN QUERY
  SELECT v_count as gifts_pooled;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Distribute one random gift from pool to receiver
CREATE OR REPLACE FUNCTION public.distribute_from_pool(p_receiver_id UUID, p_receiver_phone TEXT)
RETURNS TABLE(
  success BOOLEAN,
  gift_action_id UUID,
  gift_id UUID,
  sender_id UUID,
  note TEXT
) AS $$
DECLARE
  v_action_id UUID;
  v_gift_id UUID;
  v_sender_id UUID;
  v_note TEXT;
BEGIN
  -- Select one random gift from social pool
  SELECT id, gift_id, sender_id, note INTO v_action_id, v_gift_id, v_sender_id, v_note
  FROM public.gift_actions
  WHERE status = 'social_pool' AND pooled_at IS NOT NULL
  ORDER BY RANDOM()
  LIMIT 1
  FOR UPDATE;

  IF v_action_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, NULL::UUID, NULL::TEXT;
    RETURN;
  END IF;

  -- Update the gift action with receiver and distributed status
  UPDATE public.gift_actions
  SET
    status = 'distributed',
    receiver_id = p_receiver_id,
    receiver_phone = p_receiver_phone,
    distributed_at = now()
  WHERE id = v_action_id;

  RETURN QUERY
  SELECT true, v_action_id, v_gift_id, v_sender_id, v_note;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- WEEKLY DROPS - CLAIM MODEL
-- ==========================================
CREATE TABLE public.weekly_drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  total_stock INT DEFAULT 0,
  claimed_count INT DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.drop_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id UUID REFERENCES public.weekly_drops(id) ON DELETE CASCADE,
  gift_id UUID REFERENCES public.gifts(id) ON DELETE CASCADE,
  stock INT DEFAULT 0,
  claimed_count INT DEFAULT 0
);

CREATE INDEX idx_drop_gifts_drop ON public.drop_gifts(drop_id);
CREATE INDEX idx_drop_gifts_gift ON public.drop_gifts(gift_id);

-- ==========================================
-- COMMUNITY POOLS
-- ==========================================
CREATE TABLE public.community_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT,
  type TEXT NOT NULL,
  member_count INT DEFAULT 0,
  gifts_shared INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  requirement TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES public.community_pools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pool_id, user_id)
);

CREATE INDEX idx_community_members_pool ON public.community_members(pool_id);
CREATE INDEX idx_community_members_user ON public.community_members(user_id);

-- ==========================================
-- USER ACHIEVEMENTS / BADGES
-- ==========================================
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON public.user_achievements(achievement_id);

-- ==========================================
-- PLUS ONE OFFERS (1+1 İKRAM)
-- ==========================================
CREATE TABLE public.plus_one_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID REFERENCES public.gifts(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES public.sponsors(id) ON DELETE SET NULL,
  message TEXT,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_plus_one_offers_gift ON public.plus_one_offers(gift_id);
CREATE INDEX idx_plus_one_offers_sponsor ON public.plus_one_offers(sponsor_id);
CREATE INDEX idx_plus_one_offers_active ON public.plus_one_offers(is_active);

-- ==========================================
-- ENABLE RLS ON NEW TABLES
-- ==========================================
ALTER TABLE public.weekly_drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drop_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plus_one_offers ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES FOR NEW TABLES
-- ==========================================

-- Weekly Drops: Anyone can read active drops
CREATE POLICY "Anyone can read active drops" ON public.weekly_drops FOR SELECT USING (is_active = true);
CREATE POLICY "Service role can manage drops" ON public.weekly_drops USING (auth.jwt()->>'role' = 'service_role');

-- Drop Gifts: Anyone can read
CREATE POLICY "Anyone can read drop gifts" ON public.drop_gifts FOR SELECT USING (true);
CREATE POLICY "Service role can manage drop gifts" ON public.drop_gifts USING (auth.jwt()->>'role' = 'service_role');

-- Community Pools: Anyone can read active pools
CREATE POLICY "Anyone can read active pools" ON public.community_pools FOR SELECT USING (is_active = true);
CREATE POLICY "Service role can manage pools" ON public.community_pools USING (auth.jwt()->>'role' = 'service_role');

-- Community Members: Users can manage own memberships, anyone can read
CREATE POLICY "Users can manage own memberships" ON public.community_members FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Anyone can read memberships" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Service role can manage memberships" ON public.community_members USING (auth.jwt()->>'role' = 'service_role');

-- User Achievements: Users can read own, service can manage
CREATE POLICY "Users can read own achievements" ON public.user_achievements FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Service can manage achievements" ON public.user_achievements USING (auth.jwt()->>'role' = 'service_role');

-- Plus One Offers: Anyone can read active offers
CREATE POLICY "Anyone can read active offers" ON public.plus_one_offers FOR SELECT USING (is_active = true);
CREATE POLICY "Service role can manage offers" ON public.plus_one_offers USING (auth.jwt()->>'role' = 'service_role');

-- ==========================================
-- RPC FUNCTIONS FOR NEW FEATURES
-- ==========================================

-- Claim a drop gift
CREATE OR REPLACE FUNCTION public.claim_drop_gift(p_user_id UUID, p_drop_gift_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  v_drop_id UUID;
  v_stock INT;
  v_gift_id UUID;
BEGIN
  -- Get drop_gift details
  SELECT drop_id, stock, gift_id INTO v_drop_id, v_stock, v_gift_id
  FROM public.drop_gifts
  WHERE id = p_drop_gift_id AND stock > 0
  FOR UPDATE;

  IF v_drop_gift_id IS NULL THEN
    RETURN QUERY SELECT false, 'Gift not found or out of stock'::TEXT;
    RETURN;
  END IF;

  -- Decrement drop_gifts stock
  UPDATE public.drop_gifts
  SET claimed_count = claimed_count + 1, stock = stock - 1
  WHERE id = p_drop_gift_id;

  -- Increment weekly_drops claimed count
  UPDATE public.weekly_drops
  SET claimed_count = claimed_count + 1
  WHERE id = v_drop_id;

  -- Decrement actual gift stock
  UPDATE public.gifts
  SET stock = stock - 1
  WHERE id = v_gift_id AND stock > 0;

  -- Award achievement if first drop claimed
  INSERT INTO public.user_achievements (user_id, achievement_id)
  VALUES (p_user_id, 'drop-hunter')
  ON CONFLICT DO NOTHING;

  RETURN QUERY SELECT true, 'Gift claimed successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Join a community pool
CREATE OR REPLACE FUNCTION public.join_community(p_user_id UUID, p_pool_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  INSERT INTO public.community_members (pool_id, user_id)
  VALUES (p_pool_id, p_user_id)
  ON CONFLICT DO NOTHING;

  UPDATE public.community_pools
  SET member_count = member_count + 1
  WHERE id = p_pool_id AND NOT EXISTS (
    SELECT 1 FROM public.community_members
    WHERE pool_id = p_pool_id AND user_id = p_user_id
  );

  -- Award community badge if first pool joined
  INSERT INTO public.user_achievements (user_id, achievement_id)
  VALUES (p_user_id, 'community-join')
  ON CONFLICT DO NOTHING;

  RETURN QUERY SELECT true, 'Successfully joined community'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Leave a community pool
CREATE OR REPLACE FUNCTION public.leave_community(p_user_id UUID, p_pool_id UUID)
RETURNS TABLE(success BOOLEAN) AS $$
BEGIN
  DELETE FROM public.community_members
  WHERE user_id = p_user_id AND pool_id = p_pool_id;

  UPDATE public.community_pools
  SET member_count = GREATEST(0, member_count - 1)
  WHERE id = p_pool_id;

  RETURN QUERY SELECT true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unlock an achievement
CREATE OR REPLACE FUNCTION public.unlock_achievement(p_user_id UUID, p_achievement_id TEXT)
RETURNS TABLE(success BOOLEAN, already_unlocked BOOLEAN) AS $$
DECLARE
  v_already_exists BOOLEAN;
BEGIN
  -- Check if already unlocked
  SELECT EXISTS(
    SELECT 1 FROM public.user_achievements
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id
  ) INTO v_already_exists;

  IF v_already_exists THEN
    RETURN QUERY SELECT true, true;
    RETURN;
  END IF;

  INSERT INTO public.user_achievements (user_id, achievement_id)
  VALUES (p_user_id, p_achievement_id)
  ON CONFLICT DO NOTHING;

  RETURN QUERY SELECT true, false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- SOCIAL POOL (ASKIDA HEDIYE)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.social_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_action_id UUID NOT NULL REFERENCES public.gift_actions(id),
  gift_id UUID NOT NULL REFERENCES public.gifts(id),
  claimed_by UUID REFERENCES public.users(id),
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_social_pool_unclaimed ON public.social_pool(claimed_by) WHERE claimed_by IS NULL;
CREATE INDEX IF NOT EXISTS idx_social_pool_expires ON public.social_pool(expires_at) WHERE claimed_by IS NULL;

ALTER TABLE public.social_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view unclaimed pool items"
  ON public.social_pool FOR SELECT
  USING (claimed_by IS NULL OR claimed_by = auth.uid());

CREATE POLICY "Authenticated users can claim pool items"
  ON public.social_pool FOR UPDATE
  USING (claimed_by IS NULL)
  WITH CHECK (claimed_by = auth.uid());
