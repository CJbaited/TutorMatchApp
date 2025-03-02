import { useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import supabase from '../services/supabase';

export const useAnalytics = () => {
  const trackEvent = useCallback(async (eventType: string, properties?: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await analyticsService.trackEvent({
        event_type: eventType,
        user_id: user.id,
        properties
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, []);

  return { trackEvent };
};