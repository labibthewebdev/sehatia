CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabel Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL, -- Format konsisten: 628xxxx
  name VARCHAR(100),
  gender VARCHAR(10), -- 'male' | 'female'
  age INT,
  height_cm NUMERIC(5,2),
  current_weight_kg NUMERIC(5,2),
  target_weight_kg NUMERIC(5,2),
  goal VARCHAR(20) DEFAULT 'lose_weight', -- 'lose_weight' | 'maintain' | 'gain_muscle'
  daily_calorie_target INT DEFAULT 1800,
  daily_protein_target_g INT DEFAULT 120,
  daily_carbs_target_g INT DEFAULT 180,
  daily_fat_target_g INT DEFAULT 55,
  plan_tier VARCHAR(20) DEFAULT 'trial', -- 'trial' | 'free' | 'pro'
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '3 days'),
  plan_expires_at TIMESTAMPTZ,
  onboarding_step VARCHAR(30) DEFAULT 'ask_profile', -- 'ask_profile' | 'completed'
  pending_image_url TEXT,
  pending_caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel OTP Login WhatsApp
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_otp_phone ON otp_codes(phone_number, created_at DESC);

-- 3. Tabel Log Makanan Harian
CREATE TABLE food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  meal_type VARCHAR(20) DEFAULT 'snack', -- 'breakfast' | 'lunch' | 'dinner' | 'snack'
  raw_input_text TEXT,
  image_url TEXT,
  meal_summary VARCHAR(255) NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_calories INT NOT NULL DEFAULT 0,
  total_protein_g NUMERIC(6,2) NOT NULL DEFAULT 0,
  total_carbs_g NUMERIC(6,2) NOT NULL DEFAULT 0,
  total_fat_g NUMERIC(6,2) NOT NULL DEFAULT 0,
  total_sugar_g NUMERIC(6,2) NOT NULL DEFAULT 0,
  ai_confidence VARCHAR(10) DEFAULT 'medium',
  short_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, log_date DESC);

-- 4. Tabel Langganan & Transaksi Midtrans
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id VARCHAR(100) UNIQUE NOT NULL,
  plan_name VARCHAR(50) NOT NULL, -- 'pro_monthly' | 'pro_quarterly'
  amount_idr INT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'paid' | 'expired' | 'failed'
  snap_token TEXT,
  payment_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
