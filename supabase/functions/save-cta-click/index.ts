import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { webinar_id, lead_id, button_text, button_url, minutes_watched } = await req.json();

    console.log('Saving CTA click:', { webinar_id, button_text, minutes_watched });

    if (!webinar_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: webinar_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabase
      .from('cta_clicks')
      .insert({
        webinar_id,
        lead_id: lead_id || null,
        button_text: button_text || null,
        button_url: button_url || null,
        minutes_watched: minutes_watched || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving CTA click:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('CTA click saved successfully:', data.id);

    return new Response(
      JSON.stringify({ success: true, click_id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
