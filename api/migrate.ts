import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

/**
 * API endpoint to run database migrations
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
  if (migrationKey !== process.env.MIGRATION_KEY) {
    res.status(401).json({ error: 'Invalid migration key' });
    return;
  }

  try {
    console.log('Running database migration...');

    // Create the ratings table
    await sql`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        proverb_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(proverb_id, session_id)
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_ratings_proverb_id ON ratings(proverb_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ratings_session_id ON ratings(session_id)`;

    console.log('Migration completed successfully');

    res.status(200).json({
      success: true,
      message: 'Database migration completed successfully'
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      error: 'Migration failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
