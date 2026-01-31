import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken, extractTokenFromRequest } from './middleware/auth';
import { SupabaseRatingsRepository } from './repositories/SupabaseRatingsRepository';
import type { RatingsRepository } from './repositories/RatingsRepository';
import { setCorsHeaders, handleCorsPreFlight } from './middleware/cors';

// Use dependency injection - easy to swap out the repository
const ratingsRepo: RatingsRepository = new SupabaseRatingsRepository();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (handleCorsPreFlight(req, res)) {
    return;
  }

  // Check authentication
  const token = extractTokenFromRequest(req.headers.authorization);
  if (!token || !verifyToken(token)) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get ratings for proverbs
      // Query params: proverbIds (comma-separated) or sessionId
      const { proverbIds, sessionId } = req.query;

      if (sessionId && typeof sessionId === 'string') {
        // Get all ratings for a specific session
        const userRatings = await ratingsRepo.getUserRatings(sessionId);
        res.status(200).json({ ratings: userRatings });
        return;
      }

      if (proverbIds && typeof proverbIds === 'string') {
        // Get aggregated stats for multiple proverbs
        const ids = proverbIds.split(',').filter(id => id.trim());
        const stats = await ratingsRepo.getRatingStats(ids);
        res.status(200).json({ stats });
        return;
      }

      res.status(400).json({ error: 'Either proverbIds or sessionId query parameter is required' });
      return;
    }

    if (req.method === 'POST') {
      // Submit or update a rating
      const { proverbId, sessionId, rating } = req.body;

      if (!proverbId || !sessionId || rating === undefined) {
        res.status(400).json({
          error: 'proverbId, sessionId, and rating are required',
          received: { proverbId, sessionId, rating }
        });
        return;
      }

      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        res.status(400).json({ error: 'rating must be a number between 1 and 5' });
        return;
      }

      const result = await ratingsRepo.upsertRating(proverbId, sessionId, rating);

      // Also return updated stats for this proverb
      const stats = await ratingsRepo.getRatingStats([proverbId]);

      res.status(200).json({
        rating: result,
        stats: stats[0] || { proverbId, averageRating: rating, totalVotes: 1 }
      });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Ratings API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
