import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const today = new Date().toISOString().split('T')[0];

    // Update tutor analytics
    const { data: tutors, error: tutorsError } = await supabase
      .from('tutors')
      .select('id');

    if (tutorsError) throw tutorsError;

    for (const tutor of tutors) {
      const { data: stats, error: statsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('tutor_id', tutor.id)
        .eq('date', today);

      if (statsError) throw statsError;

      await supabase
        .from('tutor_analytics')
        .upsert({
          tutor_id: tutor.id,
          date: today,
          total_sessions: stats.length,
          completed_sessions: stats.filter(s => s.status === 'completed').length,
          cancelled_sessions: stats.filter(s => s.status === 'cancelled').length,
          total_earnings: stats.reduce((sum, s) => sum + (s.price || 0), 0),
          avg_rating: calculateAverageRating(stats)
        });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }
})

const calculateAverageRating = (sessions: any[]) => {
  const ratings = sessions.filter(s => s.student_rating);
  return ratings.length ? 
    ratings.reduce((sum, s) => sum + s.student_rating, 0) / ratings.length : 
    null;
};