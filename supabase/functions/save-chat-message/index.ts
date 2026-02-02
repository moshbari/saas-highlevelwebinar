import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Call ai-chat function to get AI response
async function getAIResponse(
  supabaseUrl: string,
  supabaseServiceKey: string,
  webinarId: string,
  userName: string,
  userEmail: string,
  userMessage: string,
  leadId?: string | null
): Promise<{ response: string; provider: string } | null> {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webinar_id: webinarId,
        user_name: userName,
        user_email: userEmail,
        user_message: userMessage,
        lead_id: leadId,
      }),
    });

    if (!response.ok) {
      console.error('ai-chat error:', await response.text());
      return null;
    }

    const data = await response.json();
    return { response: data.response, provider: data.provider };
  } catch (error) {
    console.error('Failed to call ai-chat:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      webinar_id,
      lead_id,
      user_name,
      user_email,
      user_message,
      ai_response: providedAiResponse,
      mode,
      skip_ai,
    }: {
      webinar_id?: string;
      lead_id?: string | null;
      user_name?: string | null;
      user_email?: string;
      user_message?: string;
      ai_response?: string | null;
      mode?: 'ai' | 'human' | null;
      skip_ai?: boolean;
    } = await req.json();

    console.log('Saving chat message:', { webinar_id, user_email, user_name, has_ai_response: !!providedAiResponse, mode, skip_ai });

    if (!webinar_id || !user_email || !user_message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: webinar_id, user_email, user_message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 1) Find or create an active session for this user+webinar
    const { data: existingSession, error: sessionLookupError } = await supabase
      .from('chat_sessions')
      .select('id, mode')
      .eq('webinar_id', webinar_id)
      .eq('user_email', user_email)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessionLookupError) {
      console.error('Error looking up chat session:', sessionLookupError);
      return new Response(
        JSON.stringify({ error: sessionLookupError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const nowIso = new Date().toISOString();
    const sessionMode = mode || (existingSession?.mode as string) || 'ai';

    let sessionId = existingSession?.id as string | undefined;
    if (!sessionId) {
      const { data: createdSession, error: createSessionError } = await supabase
        .from('chat_sessions')
        .insert({
          webinar_id,
          lead_id: lead_id || null,
          user_name: user_name || null,
          user_email,
          mode: sessionMode,
          is_active: true,
          last_message_at: nowIso,
        })
        .select('id')
        .single();

      if (createSessionError) {
        console.error('Error creating chat session:', createSessionError);
        return new Response(
          JSON.stringify({ error: createSessionError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      sessionId = createdSession.id;
      console.log('Created chat session:', sessionId);
    } else {
      // keep session fresh
      const { error: updateSessionError } = await supabase
        .from('chat_sessions')
        .update({
          last_message_at: nowIso,
          mode: sessionMode,
          user_name: user_name || null,
          lead_id: lead_id || null,
        })
        .eq('id', sessionId);

      if (updateSessionError) {
        console.error('Error updating chat session:', updateSessionError);
      }
    }

    // 2) Determine AI response
    let aiResponse = providedAiResponse || '';
    let responseProvider = 'provided';
    const isHumanMode = sessionMode === 'human';
    const shouldGetAI = !providedAiResponse && !isHumanMode && !skip_ai;

    if (shouldGetAI) {
      console.log('Calling ai-chat for response...');
      const aiResult = await getAIResponse(
        supabaseUrl,
        supabaseServiceKey,
        webinar_id,
        user_name || 'Anonymous',
        user_email,
        user_message,
        lead_id
      );

      if (aiResult) {
        aiResponse = aiResult.response;
        responseProvider = aiResult.provider;
        console.log(`AI response received from ${responseProvider}`);
      } else {
        // AI failed - mark as pending for human response
        console.log('AI response failed, marking as pending');
      }
    }

    // 3) Save message
    const isPending = !aiResponse && !isHumanMode;
    const responseType = isHumanMode ? 'human' : (aiResponse ? 'ai' : null);

    const { data: messageRow, error: messageInsertError } = await supabase
      .from('chat_messages')
      .insert({
        webinar_id,
        lead_id: lead_id || null,
        user_name: user_name || 'Anonymous',
        user_email,
        user_message,
        ai_response: aiResponse,
        response_type: responseType,
        session_id: sessionId,
        is_pending: isPending,
        responded_at: aiResponse ? nowIso : null,
        session_date: nowIso.split('T')[0],
      })
      .select('id')
      .single();

    if (messageInsertError) {
      console.error('Error saving chat message:', messageInsertError);
      return new Response(
        JSON.stringify({ error: messageInsertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 4) If pending (human mode or AI failed), create pending reply entry
    if (isPending || isHumanMode) {
      const { error: pendingInsertError } = await supabase
        .from('pending_replies')
        .insert({
          session_id: sessionId,
          chat_message_id: messageRow.id,
          webinar_id,
          user_name: user_name || null,
          user_email,
          user_message,
          is_answered: false,
        });

      if (pendingInsertError) {
        console.error('Error creating pending reply:', pendingInsertError);
      }
    }

    console.log('Chat message saved successfully:', messageRow.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_id: messageRow.id, 
        session_id: sessionId, 
        is_pending: isPending,
        ai_response: aiResponse,
        provider: responseProvider,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Unexpected error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
