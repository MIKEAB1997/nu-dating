-- ========================================
-- BLOCKS TABLE (Safety Feature)
-- ========================================

CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(blocker_id, blocked_id)
);

-- Indexes
CREATE INDEX blocks_blocker_idx ON blocks(blocker_id);
CREATE INDEX blocks_blocked_idx ON blocks(blocked_id);

-- Enable RLS
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can create their own blocks
CREATE POLICY "Users can create own blocks"
  ON blocks FOR INSERT
  WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = blocker_id));

-- Users can view their own blocks
CREATE POLICY "Users can view own blocks"
  ON blocks FOR SELECT
  USING (auth.uid() = (SELECT auth_id FROM users WHERE id = blocker_id));

-- Users can delete their own blocks (unblock)
CREATE POLICY "Users can delete own blocks"
  ON blocks FOR DELETE
  USING (auth.uid() = (SELECT auth_id FROM users WHERE id = blocker_id));


-- ========================================
-- REPORTS TABLE (Safety Feature)
-- ========================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_post_id UUID REFERENCES loop_posts(id) ON DELETE CASCADE,

  reason TEXT NOT NULL CHECK (reason IN (
    'inappropriate_content',
    'harassment',
    'fake_profile',
    'spam',
    'other'
  )),
  description TEXT,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned')),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Must report either a user or a post (not both)
  CHECK (
    (reported_user_id IS NOT NULL AND reported_post_id IS NULL)
    OR (reported_user_id IS NULL AND reported_post_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX reports_status_idx ON reports(status) WHERE status = 'pending';
CREATE INDEX reports_reporter_idx ON reports(reporter_id);
CREATE INDEX reports_reported_user_idx ON reports(reported_user_id);
CREATE INDEX reports_created_idx ON reports(created_at DESC);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can create reports
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = reporter_id));

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = (SELECT auth_id FROM users WHERE id = reporter_id));


-- ========================================
-- DISCOVERY FUNCTION (excluding blocked users)
-- ========================================

CREATE OR REPLACE FUNCTION get_discover_users(
  current_user_id UUID,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  age INTEGER,
  gender TEXT,
  city TEXT,
  bio TEXT,
  photos TEXT[],
  interests TEXT[],
  occupation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.age,
    u.gender,
    u.city,
    u.bio,
    u.photos,
    u.interests,
    u.occupation
  FROM users u
  WHERE u.id != current_user_id
    AND u.is_active = true
    -- Exclude users already liked/skipped
    AND u.id NOT IN (
      SELECT to_user_id FROM likes WHERE from_user_id = current_user_id
    )
    -- Exclude blocked users
    AND u.id NOT IN (
      SELECT blocked_id FROM blocks WHERE blocker_id = current_user_id
    )
    -- Exclude users who blocked me
    AND u.id NOT IN (
      SELECT blocker_id FROM blocks WHERE blocked_id = current_user_id
    )
    -- Gender filtering (to be implemented in app layer for flexibility)
  ORDER BY RANDOM()
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Comments
COMMENT ON TABLE blocks IS 'User blocking for safety';
COMMENT ON TABLE reports IS 'User and content reports';
COMMENT ON FUNCTION get_discover_users IS 'Get random users for discovery (excluding blocked/already swiped)';
