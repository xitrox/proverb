import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint to run database migrations on Supabase
 * Call this once after deployment to set up the database schema
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Simple security: require a migration key
  const migrationKey = req.headers['x-migration-key'];
  if (!migrationKey || migrationKey !== process.env.MIGRATION_KEY) {
    res.status(401).json({ error: 'Invalid migration key' });
    return;
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Running database migration...');

    // Create the ratings table using raw SQL through Supabase
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ratings (
          id SERIAL PRIMARY KEY,
          proverb_id VARCHAR(255) NOT NULL,
          session_id VARCHAR(255) NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(proverb_id, session_id)
        );

        CREATE INDEX IF NOT EXISTS idx_ratings_proverb_id ON ratings(proverb_id);
        CREATE INDEX IF NOT EXISTS idx_ratings_session_id ON ratings(session_id);
      `
    });

    if (tableError) {
      console.error('Migration error:', tableError);
      throw tableError;
    }

    console.log('Migration completed successfully');

    res.status(200).json({
      success: true,
      message: 'Database migration completed successfully. You can now use the Supabase SQL Editor to verify the table was created.'
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      error: 'Migration failed',
      details: error instanceof Error ? error.message : String(error),
      instruction: 'Please run the SQL from api/db/schema.sql in your Supabase SQL Editor'
    });
  }
}
