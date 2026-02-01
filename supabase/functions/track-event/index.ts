import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract IP address from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    
    // Try different headers in order of preference
    const ipAddress = cfConnectingIp 
      || (forwardedFor ? forwardedFor.split(',')[0].trim() : null)
      || realIp 
      || 'unknown';

    const payload = await req.json();

    console.log('Received tracking event:', {
      event_type: payload.event_type,
      webinar_id: payload.webinar_id,
      ip_address: ipAddress,
      session_id: payload.session_id
    });

    // Insert event with IP address
    const { error } = await supabase.from('webinar_events').insert({
      webinar_id: payload.webinar_id || '',
      webinar_name: payload.webinar_name || '',
      user_name: payload.user_name || 'Anonymous',
      user_email: payload.user_email || 'unknown@unknown.com',
      event_type: payload.event_type,
      watch_percent: payload.watch_percent || 0,
      watch_minutes: payload.watch_minutes || 0,
      session_id: payload.session_id || null,
      device_type: payload.device_type || null,
      cta_url: payload.cta_url || null,
      chat_message: payload.chat_message || null,
      ip_address: ipAddress
    });

    if (error) {
      console.error('Error inserting event:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Track event error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
