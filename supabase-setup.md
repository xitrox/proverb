# Supabase Setup for Ratings Feature

Since you're using Supabase instead of direct Vercel Postgres, the migration needs to be run through the Supabase SQL Editor.

## Steps:

1. **Go to your Supabase project dashboard**:
   - The URL should be in your `.env.local` file as `SUPABASE_URL`
   - Or find it at: https://supabase.com/dashboard/projects

2. **Open the SQL Editor**:
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run this SQL**:

```sql
-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  proverb_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(proverb_id, session_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ratings_proverb_id ON ratings(proverb_id);
CREATE INDEX IF NOT EXISTS idx_ratings_session_id ON ratings(session_id);

-- Enable Row Level Security (recommended)
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations (since we handle auth in our API)
CREATE POLICY "Allow all operations" ON ratings
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

4. **Click "Run" or press Cmd/Ctrl + Enter**

5. **Verify** the table was created:
   - Go to "Table Editor" in the left sidebar
   - You should see a "ratings" table

## Alternative: Run from command line

If you prefer, you can use the Supabase CLI, but it's easier to just use the SQL Editor.

## Next Steps

After creating the table:
1. Deploy the updated code: `vercel --prod`
2. Test the ratings feature in your app

The ratings should now work!
