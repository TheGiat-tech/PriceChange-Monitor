-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  plan_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create monitors table
CREATE TABLE IF NOT EXISTS monitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  label text,
  selector text NOT NULL,
  value_type text NOT NULL DEFAULT 'text',
  interval_minutes int NOT NULL,
  notification_email text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_value text,
  last_hash text,
  last_checked_at timestamptz,
  last_status text NOT NULL DEFAULT 'new',
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id uuid NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  old_value text,
  new_value text,
  old_hash text,
  new_hash text,
  changed_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_monitors_user_id ON monitors(user_id);
CREATE INDEX IF NOT EXISTS idx_monitors_is_active ON monitors(is_active);
CREATE INDEX IF NOT EXISTS idx_monitors_last_checked ON monitors(last_checked_at);
CREATE INDEX IF NOT EXISTS idx_events_monitor_id ON events(monitor_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS Policies for monitors
CREATE POLICY "Users can view own monitors" 
  ON monitors FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own monitors" 
  ON monitors FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monitors" 
  ON monitors FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monitors" 
  ON monitors FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for events
CREATE POLICY "Users can view own events" 
  ON events FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own events" 
  ON events FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
