/**
 * Abstract interface for ratings storage
 * Allows swapping out the underlying storage implementation
 */
export interface Rating {
  id: number;
  proverbId: string;
  sessionId: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProverbRatingStats {
  proverbId: string;
  averageRating: number;
  totalVotes: number;
}

export interface UserRating {
  proverbId: string;
  rating: number;
}

export interface RatingsRepository {
  /**
   * Get or create a rating for a specific proverb by a user session
   * If rating exists, updates it. Otherwise creates new one.
   */
  upsertRating(proverbId: string, sessionId: string, rating: number): Promise<Rating>;

  /**
   * Get aggregated rating statistics for multiple proverbs
   */
  getRatingStats(proverbIds: string[]): Promise<ProverbRatingStats[]>;

  /**
   * Get all ratings for a specific session
   */
  getUserRatings(sessionId: string): Promise<UserRating[]>;

  /**
   * Get a specific rating for a proverb by session
   */
  getRating(proverbId: string, sessionId: string): Promise<Rating | null>;
}
