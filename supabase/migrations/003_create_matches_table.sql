-- ========================================
-- MATCHES TABLE
-- ========================================

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Always store user1_id < user2_id for consistency
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Match metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Ensure ordering
);

-- Indexes
CREATE INDEX matches_user1_idx ON matches(user1_id);
CREATE INDEX matches_user2_idx ON matches(user2_id);
CREATE INDEX matches_activity_idx ON matches(last_activity_at DESC);
CREATE INDEX matches_created_idx ON matches(created_at DESC);

-- Enable RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own matches
CREATE POLICY "Users can view own matches"
  ON matches FOR SELECT
  USING (
    auth.uid() = (SELECT auth_id FROM users WHERE id = user1_id)
    OR auth.uid() = (SELECT auth_id FROM users WHERE id = user2_id)
  );

-- Function to create match when mutual like exists
CREATE OR REPLACE FUNCTION check_and_create_match()
RETURNS TRIGGER AS $$
DECLARE
  v_match_exists BOOLEAN;
  v_user1_id UUID;
  v_user2_id UUID;
BEGIN
  -- Only check if this is a like (not a skip)
  IF NEW.is_like = false THEN
    RETURN NEW;
  END IF;

  -- Check if there's a mutual like
  SELECT EXISTS (
    SELECT 1 FROM likes
    WHERE from_user_id = NEW.to_user_id
      AND to_user_id = NEW.from_user_id
      AND is_like = true
  ) INTO v_match_exists;

  -- If mutual like exists, create match
  IF v_match_exists THEN
    -- Ensure user1_id < user2_id
    IF NEW.from_user_id < NEW.to_user_id THEN
      v_user1_id := NEW.from_user_id;
      v_user2_id := NEW.to_user_id;
    ELSE
      v_user1_id := NEW.to_user_id;
      v_user2_id := NEW.from_user_id;
    END IF;

    -- Create match (ignore if already exists)
    INSERT INTO matches (user1_id, user2_id)
    VALUES (v_user1_id, v_user2_id)
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create matches
CREATE TRIGGER create_match_on_mutual_like
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION check_and_create_match();

-- Function to update last_activity_at
CREATE OR REPLACE FUNCTION update_match_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE matches
  SET last_activity_at = NOW()
  WHERE id = NEW.match_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE matches IS 'Stores mutual matches between users';
COMMENT ON COLUMN matches.user1_id IS 'Lower UUID (for consistency)';
COMMENT ON COLUMN matches.user2_id IS 'Higher UUID (for consistency)';
