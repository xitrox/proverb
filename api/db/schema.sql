-- Ratings table for storing user votes on proverbs
CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  proverb_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(proverb_id, session_id)
);

-- Index for faster lookups by proverb_id
CREATE INDEX IF NOT EXISTS idx_ratings_proverb_id ON ratings(proverb_id);

-- Index for faster lookups by session_id
CREATE INDEX IF NOT EXISTS idx_ratings_session_id ON ratings(session_id);
