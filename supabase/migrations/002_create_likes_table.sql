-- ========================================
-- LIKES TABLE (Swipe History)
-- ========================================

CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  is_like BOOLEAN NOT NULL, -- true = like, false = skip

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(from_user_id, to_user_id)
);

-- Indexes
CREATE INDEX likes_from_user_idx ON likes(from_user_id);
CREATE INDEX likes_to_user_idx ON likes(to_user_id);
CREATE INDEX likes_mutual_idx ON likes(from_user_id, to_user_id) WHERE is_like = true;
CREATE INDEX likes_created_at_idx ON likes(created_at DESC);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can create their own likes
CREATE POLICY "Users can create own likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = from_user_id));

-- Users can view likes where they are involved
CREATE POLICY "Users can view own likes"
  ON likes FOR SELECT
  USING (
    auth.uid() = (SELECT auth_id FROM users WHERE id = from_user_id)
    OR auth.uid() = (SELECT auth_id FROM users WHERE id = to_user_id)
  );

-- Comments
COMMENT ON TABLE likes IS 'Stores all swipe actions (like/skip)';
COMMENT ON COLUMN likes.is_like IS 'true = like (swipe right), false = skip (swipe left)';
