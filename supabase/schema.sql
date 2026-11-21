CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  gender VARCHAR(10),
  age INT,
  height_cm NUMERIC(5,2),
  current_weight_kg NUMERIC(5,2),
  target_weight_kg NUMERIC(5,2),
  goal VARCHAR(20) DEFAULT 'lose_weight',
  daily_calorie_target INT DEFAULT 1800,
  daily_protein_target_g INT DEFAULT 120,
  daily_carbs_target_g INT DEFAULT 180,
  daily_fat_target_g INT DEFAULT 55,
  plan_tier VARCHAR(20) DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '3 days'),
  plan_expires_at TIMESTAMPTZ,
  onboarding_step VARCHAR(30) DEFAULT 'ask_profile',
  pending_image_url TEXT,
  pending_caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel OTP Login WhatsApp
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone_number, created_at DESC);

-- 3. Tabel Log Makanan Harian
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  meal_type VARCHAR(20) DEFAULT 'snack',
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

CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, log_date DESC);
