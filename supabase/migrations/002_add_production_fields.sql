-- Add PayPal subscription fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS paypal_subscription_id text,
ADD COLUMN IF NOT EXISTS paypal_status text,
ADD COLUMN IF NOT EXISTS billing_provider text;

-- Add alert debouncing and error tracking fields to monitors table
ALTER TABLE monitors
ADD COLUMN IF NOT EXISTS cooldown_minutes int NOT NULL DEFAULT 60,
ADD COLUMN IF NOT EXISTS last_alert_sent_at timestamptz;

-- Update last_status to be an enum type (backwards compatible)
-- Note: last_error already exists in the schema

-- Create index for better query performance on billing provider
CREATE INDEX IF NOT EXISTS idx_profiles_billing_provider ON profiles(billing_provider);
CREATE INDEX IF NOT EXISTS idx_profiles_paypal_subscription_id ON profiles(paypal_subscription_id);
