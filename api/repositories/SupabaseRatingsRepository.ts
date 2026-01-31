import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  RatingsRepository,
  Rating,
  ProverbRatingStats,
  UserRating
} from './RatingsRepository';

export class SupabaseRatingsRepository implements RatingsRepository {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async upsertRating(proverbId: string, sessionId: string, rating: number): Promise<Rating> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const { data, error } = await this.supabase
      .from('ratings')
      .upsert(
        {
          proverb_id: proverbId,
          session_id: sessionId,
          rating: rating,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'proverb_id,session_id',
        }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert rating: ${error.message}`);
    }

    return {
      id: data.id,
      proverbId: data.proverb_id,
      sessionId: data.session_id,
      rating: data.rating,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async getRatingStats(proverbIds: string[]): Promise<ProverbRatingStats[]> {
    if (proverbIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase.rpc('get_rating_stats', {
      proverb_ids: proverbIds,
    });

    if (error) {
      // Fallback if RPC function doesn't exist - do it manually
      console.warn('RPC function not found, falling back to manual aggregation');
      return this.getRatingStatsManual(proverbIds);
    }

    return data.map((row: any) => ({
      proverbId: row.proverb_id,
      averageRating: parseFloat(row.average_rating),
      totalVotes: row.total_votes,
    }));
  }

  private async getRatingStatsManual(proverbIds: string[]): Promise<ProverbRatingStats[]> {
    const { data, error } = await this.supabase
      .from('ratings')
      .select('proverb_id, rating')
      .in('proverb_id', proverbIds);

    if (error) {
      throw new Error(`Failed to fetch ratings: ${error.message}`);
    }

    // Group by proverb_id and calculate stats
    const statsMap = new Map<string, { sum: number; count: number }>();

    data.forEach((row: any) => {
      const existing = statsMap.get(row.proverb_id) || { sum: 0, count: 0 };
      statsMap.set(row.proverb_id, {
        sum: existing.sum + row.rating,
        count: existing.count + 1,
      });
    });

    return Array.from(statsMap.entries()).map(([proverbId, stats]) => ({
      proverbId,
      averageRating: stats.sum / stats.count,
      totalVotes: stats.count,
    }));
  }

  async getUserRatings(sessionId: string): Promise<UserRating[]> {
    const { data, error } = await this.supabase
      .from('ratings')
      .select('proverb_id, rating')
      .eq('session_id', sessionId);

    if (error) {
      throw new Error(`Failed to fetch user ratings: ${error.message}`);
    }

    return data.map((row: any) => ({
      proverbId: row.proverb_id,
      rating: row.rating,
    }));
  }

  async getRating(proverbId: string, sessionId: string): Promise<Rating | null> {
    const { data, error } = await this.supabase
      .from('ratings')
      .select('*')
      .eq('proverb_id', proverbId)
      .eq('session_id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to fetch rating: ${error.message}`);
    }

    return {
      id: data.id,
      proverbId: data.proverb_id,
      sessionId: data.session_id,
      rating: data.rating,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
