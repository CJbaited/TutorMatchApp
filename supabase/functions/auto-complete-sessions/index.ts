import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get sessions that should be auto-completed
    const { data: sessionsToComplete, error: fetchError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('status', 'confirmed')
      .not('started_at', 'is', null)
      .is('completed_at', null)
      .lt('started_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // 2 hours ago

    if (fetchError) throw fetchError

    // Complete each session
    for (const session of sessionsToComplete) {
      const { error: updateError } = await supabaseClient
        .from('bookings')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_type: 'automatic',
          completion_notes: 'Auto-completed after 2 hours'
        })
        .eq('id', session.id)

      if (updateError) throw updateError

      // Trigger payment processing
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-session-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: req.headers.get('Authorization')!,
        },
        body: JSON.stringify({ bookingId: session.id }),
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        completed: sessionsToComplete.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
