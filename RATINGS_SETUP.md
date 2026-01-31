# Ratings Feature Setup Guide

This guide explains how to set up the star rating feature for proverbs.

## Prerequisites

- Vercel project deployed
- Vercel Postgres database (can be created in Vercel dashboard)

## Setup Steps

### 1. Create Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Click "Create Database" → "Postgres"
4. Follow the setup wizard

Vercel will automatically add the necessary environment variables to your project:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- And other Postgres-related variables

### 2. Set Migration Key

Add a migration key to your environment variables for security:

1. In Vercel dashboard, go to Settings → Environment Variables
2. Add: `MIGRATION_KEY` with a secure random value (e.g., a UUID)
3. Redeploy your application

### 3. Run Database Migration

After deployment, run the migration to create the ratings table:

```bash
curl -X POST https://your-app.vercel.app/api/migrate \
  -H "x-migration-key: YOUR_MIGRATION_KEY_HERE"
```

You should see a success response:
```json
{
  "success": true,
  "message": "Database migration completed successfully"
}
```

### 4. Verify Setup

Visit your application and you should now see:
- Star rating UI on each proverb
- Ability to click stars to rate (1-5)
- Average rating and vote count displayed
- "Your rating: X ★" text when you've voted
- Slightly faded stars after you've voted

## Architecture

### Database Layer (Abstraction)
- **`RatingsRepository`** (interface): Abstract repository pattern
- **`PostgresRatingsRepository`**: Postgres implementation using `@vercel/postgres`
- Easy to swap storage backend by implementing the interface

### API Layer
- **`/api/ratings`** (GET): Fetch rating stats or user ratings
  - Query params: `proverbIds` (comma-separated) or `sessionId`
- **`/api/ratings`** (POST): Submit or update a rating
  - Body: `{ proverbId, sessionId, rating }`
- **`/api/migrate`** (POST): Run database migration (one-time setup)

### Frontend Layer
- **`ratingsAPI`**: Service for making rating API calls
- **`StarRating`** component: Reusable 5-star rating widget
- Session ID stored in `sessionStorage` to track user votes
- Maps used for efficient rating lookups

## Session Storage

User votes are tracked using a session ID stored in `sessionStorage`:
- Generated automatically on first vote
- Persists during the browser session
- Cleared when browser/tab is closed or storage is cleared
- No login required - anonymous voting

## Features

- ✅ 5-star rating system
- ✅ Average rating calculation
- ✅ Vote counting
- ✅ Re-voting allowed (updates previous vote)
- ✅ Visual feedback (opacity change for voted items)
- ✅ Text indicator showing user's rating
- ✅ Mobile-friendly design
- ✅ No authentication required for voting
- ✅ Abstracted storage layer for easy backend swapping

## Database Schema

```sql
CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  proverb_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(proverb_id, session_id)
);

CREATE INDEX idx_ratings_proverb_id ON ratings(proverb_id);
CREATE INDEX idx_ratings_session_id ON ratings(session_id);
```

## Swapping Storage Backend

To use a different database:

1. Implement the `RatingsRepository` interface in `api/repositories/`
2. Update the repository instantiation in `api/ratings.ts`:

```typescript
// Example: Switch to a different implementation
import { MyCustomRatingsRepository } from './repositories/MyCustomRatingsRepository';

const ratingsRepo: RatingsRepository = new MyCustomRatingsRepository();
```

No other code changes needed - the abstraction handles the rest!
