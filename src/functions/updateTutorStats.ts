import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface Booking {
  id: string;
  tutor_id: string;
  price: number;
  status: string;
  student_rating: number;
  date: string;
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // Get all tutors
    const { data: tutors, error: tutorsError } = await supabase
      .from('tutors')
      .select('id');

    if (tutorsError) throw tutorsError;

    for (const tutor of tutors) {
      await updateTutorStats(supabase, tutor.id);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
});

async function updateTutorStats(supabase: any, tutorId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Get today's bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('date', today);

    if (bookingsError) throw bookingsError;

    // Get profile views
    const { data: viewsData, error: viewsError } = await supabase
      .from('profile_views')
      .select('count')
      .eq('tutor_id', tutorId)
      .eq('date', today)
      .single();

    if (viewsError && viewsError.code !== 'PGRST116') throw viewsError;

    // Calculate analytics
    const analytics = {
      tutor_id: tutorId,
      date: today,
      views: viewsData?.count || 0,
      total_sessions: bookings?.length || 0,
      completed_sessions: bookings?.filter(b => b.status === 'completed').length || 0,
      cancelled_sessions: bookings?.filter(b => b.status === 'cancelled').length || 0,
      total_earnings: bookings?.reduce((sum, b) => sum + (b.price || 0), 0) || 0,
      avg_rating: calculateAverageRating(bookings || [])
    };

    // Update analytics
    const { error: upsertError } = await supabase
      .from('tutor_analytics')
      .upsert(analytics, {
        onConflict: 'tutor_id,date'
      });

    if (upsertError) throw upsertError;

  } catch (error) {
    console.error(`Error updating stats for tutor ${tutorId}:`, error);
  }
}

function calculateAverageRating(bookings: Booking[]): number | null {
  const ratings = bookings.filter(b => b.student_rating && b.status === 'completed');
  if (ratings.length === 0) return null;
  return ratings.reduce((sum, b) => sum + (b.student_rating || 0), 0) / ratings.length;
}