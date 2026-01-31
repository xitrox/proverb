import { sql } from '@vercel/postgres';
import type {
  RatingsRepository,
  Rating,
  ProverbRatingStats,
  UserRating
} from './RatingsRepository';

export class PostgresRatingsRepository implements RatingsRepository {
  async upsertRating(proverbId: string, sessionId: string, rating: number): Promise<Rating> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const result = await sql`
      INSERT INTO ratings (proverb_id, session_id, rating, updated_at)
      VALUES (${proverbId}, ${sessionId}, ${rating}, NOW())
      ON CONFLICT (proverb_id, session_id)
      DO UPDATE SET
        rating = ${rating},
        updated_at = NOW()
      RETURNING *
    `;

    const row = result.rows[0];
    return {
      id: row.id,
      proverbId: row.proverb_id,
      sessionId: row.session_id,
      rating: row.rating,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  async getRatingStats(proverbIds: string[]): Promise<ProverbRatingStats[]> {
    if (proverbIds.length === 0) {
      return [];
    }

    const result = await sql`
      SELECT
        proverb_id,
        AVG(rating)::DECIMAL(10,2) as average_rating,
        COUNT(*)::INTEGER as total_votes
      FROM ratings
      WHERE proverb_id = ANY(${proverbIds})
      GROUP BY proverb_id
    `;

    return result.rows.map(row => ({
      proverbId: row.proverb_id,
      averageRating: parseFloat(row.average_rating),
      totalVotes: row.total_votes,
    }));
  }

  async getUserRatings(sessionId: string): Promise<UserRating[]> {
    const result = await sql`
      SELECT proverb_id, rating
      FROM ratings
      WHERE session_id = ${sessionId}
    `;

    return result.rows.map(row => ({
      proverbId: row.proverb_id,
      rating: row.rating,
    }));
  }

  async getRating(proverbId: string, sessionId: string): Promise<Rating | null> {
    const result = await sql`
      SELECT *
      FROM ratings
      WHERE proverb_id = ${proverbId} AND session_id = ${sessionId}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      proverbId: row.proverb_id,
      sessionId: row.session_id,
      rating: row.rating,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
