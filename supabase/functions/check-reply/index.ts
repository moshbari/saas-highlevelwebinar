import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, webinarId, lastSeenAt } = await req.json();

    if (!userEmail || !webinarId) {
      throw new Error('userEmail and webinarId are required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Checking reply for ${userEmail} in webinar ${webinarId}`);

    // Find the session for this user
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('id, mode')
      .eq('user_email', userEmail)
      .eq('webinar_id', webinarId)
      .eq('is_active', true)
      .single();

    if (!session) {
      return new Response(
        JSON.stringify({ hasReply: false, mode: 'ai' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all NEW human replies since lastSeenAt (not just the latest)
    let query = supabase
      .from('chat_messages')
      .select('id, ai_response, responded_at')
      .eq('session_id', session.id)
      .eq('response_type', 'human')
      .not('responded_at', 'is', null)
      .order('responded_at', { ascending: true });

    if (lastSeenAt) {
      query = query.gt('responded_at', lastSeenAt);
    }

    const { data: newHumanMessages } = await query;

    if (newHumanMessages && newHumanMessages.length > 0) {
      // Return all new replies so the viewer can render them
      const replies = newHumanMessages.map(m => ({
        id: m.id,
        text: m.ai_response,
        at: m.responded_at,
      }));
      
      // Return the latest timestamp so the next poll skips these
      const latestAt = newHumanMessages[newHumanMessages.length - 1].responded_at;
      
      return new Response(
        JSON.stringify({
          hasReply: true,
          replies,
          replyAt: latestAt,
          mode: session.mode,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ hasReply: false, mode: session.mode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Check reply error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, hasReply: false }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
