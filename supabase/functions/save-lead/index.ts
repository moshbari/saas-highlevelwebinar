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

    const { webinar_id, name, email, ip_address, user_agent } = await req.json();

    console.log('Saving lead:', { webinar_id, name, email });

    if (!webinar_id || !name || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: webinar_id, name, email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if lead already exists for this webinar
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('webinar_id', webinar_id)
      .eq('email', email)
      .maybeSingle();

    if (existingLead) {
      console.log('Lead already exists:', existingLead.id);
      return new Response(
        JSON.stringify({ success: true, lead_id: existingLead.id, message: 'Lead already captured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabase
      .from('leads')
      .insert({
        webinar_id,
        name,
        email,
        ip_address: ip_address || null,
        user_agent: user_agent || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving lead:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Lead saved successfully:', data.id);

    return new Response(
      JSON.stringify({ success: true, lead_id: data.id }),
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
