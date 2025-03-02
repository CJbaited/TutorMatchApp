import { PostgrestError } from '@supabase/supabase-js';
import supabase from './supabase';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export interface TutorAnalytics {
  id: string;
  tutor_id: string;
  date: string;
  views: number;
  total_sessions: number;
  completed_sessions: number;
  total_earnings: number;
  avg_rating: number;
}

export interface AnalyticsResponse {
  data: TutorAnalytics[] | null;
  error: PostgrestError | null;
}

export class AnalyticsService {
  async trackEvent(eventData: {
    event_type: string;
    user_id: string;
    properties?: any;
  }) {
    const { error } = await supabase
      .from('analytics_events')
      .insert([eventData]);

    if (error) {
      throw error;
    }
  }

  async getTutorAnalytics(
    tutorId: string, 
    startDate: string, 
    endDate: string
  ): Promise<AnalyticsResponse> {
    try {
      const { data, error } = await supabase
        .from('tutor_analytics')
        .select('*')
        .eq('tutor_id', tutorId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      return { data, error };
    } catch (error) {
      console.error('Analytics fetch error:', error);
      return { data: null, error: error as PostgrestError };
    }
  }

  async updateTutorDailyStats(tutorId: string, date: string, stats: any) {
    return await supabase
      .from('tutor_analytics')
      .upsert({
        tutor_id: tutorId,
        date,
        ...stats
      }, {
        onConflict: 'tutor_id,date'
      });
  }

  async getPlatformAnalytics(startDate: string, endDate: string) {
    return await supabase
      .from('platform_analytics')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
  }

  async getWeeklyStats(tutorId: string) {
    const startDate = format(startOfWeek(new Date()), 'yyyy-MM-dd');
    const endDate = format(endOfWeek(new Date()), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('tutor_analytics')
      .select('total_earnings, total_sessions')
      .eq('tutor_id', tutorId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    return {
      weeklyEarnings: data?.reduce((sum, day) => sum + (day.total_earnings || 0), 0) || 0,
      activeStudents: await this.getActiveStudents(tutorId)
    };
  }

  private async getActiveStudents(tutorId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('student_id')
      .eq('tutor_id', tutorId)
      .eq('status', 'upcoming')
      .or('status.eq.confirmed,status.eq.in_progress');

    if (error) throw error;

    // Get unique student count
    return new Set(data?.map(booking => booking.student_id)).size;
  }
}

export const analyticsService = new AnalyticsService();