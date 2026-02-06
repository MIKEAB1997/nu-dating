-- ========================================
-- USERS TABLE
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Auth
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT UNIQUE NOT NULL,

  -- Profile
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  looking_for TEXT[] NOT NULL DEFAULT '{}', -- Array: ['male', 'female']

  -- Location
  city TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Profile Content
  bio TEXT,
  photos TEXT[] NOT NULL DEFAULT '{}', -- Array of URLs
  interests TEXT[] DEFAULT '{}',
  occupation TEXT,

  -- Settings
  discovery_distance INTEGER DEFAULT 50, -- km
  age_range_min INTEGER DEFAULT 22,
  age_range_max INTEGER DEFAULT 45,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX users_auth_id_idx ON users(auth_id);
CREATE INDEX users_active_idx ON users(is_active) WHERE is_active = true;
CREATE INDEX users_city_idx ON users(city);
CREATE INDEX users_gender_idx ON users(gender);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view all active profiles
CREATE POLICY "Users can view active profiles"
  ON users FOR SELECT
  USING (is_active = true);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE users IS 'Main users table for NU! dating app';
COMMENT ON COLUMN users.looking_for IS 'Array of genders user is interested in';
COMMENT ON COLUMN users.photos IS 'Array of photo URLs from Supabase Storage';
