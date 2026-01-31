// Simple migration runner script
const { sql } = require('@vercel/postgres');

// Load .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Parse and set environment variables
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)="?([^"]+)"?$/);
  if (match) {
    const [, key, value] = match;
    process.env[key] = value.replace(/\\n$/, ''); // Remove trailing \n
  }
});

(async () => {
  try {
    console.log('🔄 Starting database migration...');

    console.log('Creating ratings table...');
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

    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_ratings_proverb_id ON ratings(proverb_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ratings_session_id ON ratings(session_id)`;

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
