-- ========================================
-- LOOP TABLE (Shared Social Feed)
-- ========================================

CREATE TABLE loops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  match_id UUID UNIQUE REFERENCES matches(id) ON DELETE CASCADE NOT NULL,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX loops_match_idx ON loops(match_id);

-- Enable RLS
ALTER TABLE loops ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view loops of own matches"
  ON loops FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id
      AND (
        auth.uid() = (SELECT auth_id FROM users WHERE id = m.user1_id)
        OR auth.uid() = (SELECT auth_id FROM users WHERE id = m.user2_id)
      )
    )
  );

-- Function to create loop when match is created
CREATE OR REPLACE FUNCTION create_loop_for_match()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO loops (match_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create loop
CREATE TRIGGER create_loop_on_match
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION create_loop_for_match();


-- ========================================
-- LOOP_POSTS TABLE
-- ========================================

CREATE TABLE loop_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  loop_id UUID REFERENCES loops(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  content TEXT NOT NULL,
  image_url TEXT,

  -- Engagement counters
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX loop_posts_loop_idx ON loop_posts(loop_id, created_at DESC);
CREATE INDEX loop_posts_author_idx ON loop_posts(author_id);

-- Enable RLS
ALTER TABLE loop_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can create posts in their own loops
CREATE POLICY "Users can create posts in own loops"
  ON loop_posts FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT auth_id FROM users WHERE id = author_id)
    AND EXISTS (
      SELECT 1 FROM loops l
      JOIN matches m ON l.match_id = m.id
      WHERE l.id = loop_id
      AND (
        auth.uid() = (SELECT auth_id FROM users WHERE id = m.user1_id)
        OR auth.uid() = (SELECT auth_id FROM users WHERE id = m.user2_id)
      )
    )
  );

-- Users can view posts in their own loops
CREATE POLICY "Users can view posts in own loops"
  ON loop_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loops l
      JOIN matches m ON l.match_id = m.id
      WHERE l.id = loop_id
      AND (
        auth.uid() = (SELECT auth_id FROM users WHERE id = m.user1_id)
        OR auth.uid() = (SELECT auth_id FROM users WHERE id = m.user2_id)
      )
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_loop_posts_updated_at
  BEFORE UPDATE ON loop_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ========================================
-- LOOP_COMMENTS TABLE
-- ========================================

CREATE TABLE loop_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  post_id UUID REFERENCES loop_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  content TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX loop_comments_post_idx ON loop_comments(post_id, created_at);
CREATE INDEX loop_comments_author_idx ON loop_comments(author_id);

-- Enable RLS
ALTER TABLE loop_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create comments in own loops"
  ON loop_comments FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT auth_id FROM users WHERE id = author_id)
    AND EXISTS (
      SELECT 1 FROM loop_posts lp
      JOIN loops l ON lp.loop_id = l.id
      JOIN matches m ON l.match_id = m.id
      WHERE lp.id = post_id
      AND (
        auth.uid() = (SELECT auth_id FROM users WHERE id = m.user1_id)
        OR auth.uid() = (SELECT auth_id FROM users WHERE id = m.user2_id)
      )
    )
  );

CREATE POLICY "Users can view comments in own loops"
  ON loop_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM loop_posts lp
      JOIN loops l ON lp.loop_id = l.id
      JOIN matches m ON l.match_id = m.id
      WHERE lp.id = post_id
      AND (
        auth.uid() = (SELECT auth_id FROM users WHERE id = m.user1_id)
        OR auth.uid() = (SELECT auth_id FROM users WHERE id = m.user2_id)
      )
    )
  );

-- Trigger to update post comment count
CREATE TRIGGER increment_comments_count
  AFTER INSERT ON loop_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_match_activity();


-- ========================================
-- LOOP_LIKES TABLE
-- ========================================

CREATE TABLE loop_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  post_id UUID REFERENCES loop_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(post_id, user_id)
);

-- Indexes
CREATE INDEX loop_likes_post_idx ON loop_likes(post_id);
CREATE INDEX loop_likes_user_idx ON loop_likes(user_id);

-- Enable RLS
ALTER TABLE loop_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can like posts in own loops"
  ON loop_likes FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
  );

CREATE POLICY "Users can view likes in own loops"
  ON loop_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can delete own likes"
  ON loop_likes FOR DELETE
  USING (
    auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
  );


-- ========================================
-- HELPER FUNCTIONS FOR COUNTERS
-- ========================================

-- Increment post likes
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE loop_posts SET likes_count = likes_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement post likes
CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE loop_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Increment post comments
CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE loop_posts SET comments_count = comments_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;


-- Comments
COMMENT ON TABLE loops IS 'Shared social feed for each match';
COMMENT ON TABLE loop_posts IS 'Posts within a loop';
COMMENT ON TABLE loop_comments IS 'Comments on loop posts';
COMMENT ON TABLE loop_likes IS 'Likes on loop posts';
