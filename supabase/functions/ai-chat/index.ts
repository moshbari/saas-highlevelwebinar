import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AES-256-GCM decryption
async function decryptKey(encryptedData: string, secret: string): Promise<string> {
  const [ivHex, cipherHex, tagHex] = encryptedData.split(':');
  
  const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const ciphertext = new Uint8Array(cipherHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const tag = new Uint8Array(tagHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);
  
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret.padEnd(32, '0').slice(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    keyMaterial,
    combined
  );
  
  return new TextDecoder().decode(decrypted);
}

// Build system prompt from config
function buildSystemPrompt(config: any, faqs: any[]): string {
  let prompt = config.system_prompt || '';
  
  if (!prompt) {
    prompt = `You are ${config.bot_name || 'an AI assistant'} helping viewers during a live webinar.`;
  }
  
  if (config.webinar_description) {
    prompt += `\n\nAbout this webinar:\n${config.webinar_description}`;
  }
  
  if (config.webinar_transcript) {
    const transcript = config.webinar_transcript.slice(0, 8000);
    prompt += `\n\nWebinar transcript excerpt:\n${transcript}`;
  }
  
  if (config.additional_context) {
    prompt += `\n\nAdditional context:\n${config.additional_context}`;
  }
  
  const styleGuides: Record<string, string> = {
    professional: 'Respond in a professional, helpful tone.',
    friendly: 'Be warm, friendly, and approachable in your responses.',
    casual: 'Keep responses casual and conversational.',
    enthusiastic: 'Be enthusiastic and energetic in your responses!'
  };
  prompt += `\n\n${styleGuides[config.response_style] || styleGuides.professional}`;
  
  if (config.max_response_length) {
    prompt += `\nKeep responses concise, under ${config.max_response_length} characters.`;
  }
  
  if (faqs && faqs.length > 0) {
    prompt += '\n\nFrequently Asked Questions:';
    faqs.forEach(faq => {
      prompt += `\nQ: ${faq.question}\nA: ${faq.answer}`;
    });
  }
  
  if (config.redirect_off_topic) {
    prompt += `\n\nIf the question is off-topic or unrelated to the webinar, respond with: "${config.off_topic_message}"`;
  }
  
  if (config.handle_price_questions) {
    prompt += `\n\nFor pricing questions, respond with: "${config.price_redirect_message}"`;
  }
  
  if (config.encourage_engagement) {
    prompt += '\n\nEncourage viewers to keep watching and engage with the content.';
  }
  
  return prompt;
}

// Call OpenAI API
async function callOpenAI(apiKey: string, systemPrompt: string, userMessage: string, conversationHistory: any[]): Promise<string> {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-10).map(msg => ({
      role: msg.is_user ? 'user' : 'assistant',
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// Call Anthropic API
async function callAnthropic(apiKey: string, systemPrompt: string, userMessage: string, conversationHistory: any[]): Promise<string> {
  const messages = [
    ...conversationHistory.slice(-10).map(msg => ({
      role: msg.is_user ? 'user' : 'assistant',
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: systemPrompt,
      messages,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }
  
  const data = await response.json();
  return data.content[0].text;
}

// Call Lovable AI Gateway (fallback)
async function callLovableAI(systemPrompt: string, userMessage: string, conversationHistory: any[]): Promise<string> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!lovableApiKey) {
    throw new Error('LOVABLE_API_KEY not configured');
  }
  
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-10).map(msg => ({
      role: msg.is_user ? 'user' : 'assistant',
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages,
      max_tokens: 500,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Lovable AI error: ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const encryptionSecret = Deno.env.get('API_ENCRYPTION_SECRET')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      webinar_id, 
      user_name, 
      user_email, 
      user_message,
      lead_id,
      conversation_history 
    } = await req.json();

    if (!webinar_id || !user_email || !user_message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: webinar_id, user_email, user_message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`AI chat request for webinar ${webinar_id}, user: ${user_email}`);

    // Fetch webinar to get tenant_id and fallback error message
    const { data: webinar, error: webinarError } = await supabase
      .from('webinars')
      .select('tenant_id, error_message')
      .eq('id', webinar_id)
      .single();

    if (webinarError || !webinar) {
      console.error('Webinar not found:', webinarError);
      return new Response(
        JSON.stringify({ error: 'Webinar not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch chatbot config
    const { data: config } = await supabase
      .from('webinar_chatbot_config')
      .select('*')
      .eq('webinar_id', webinar_id)
      .single();

    // Fetch FAQs
    const { data: faqs } = await supabase
      .from('webinar_chatbot_faqs')
      .select('*')
      .eq('webinar_id', webinar_id)
      .eq('is_active', true)
      .order('sort_order');

    // Use provided history or fetch from DB
    let history = conversation_history || [];
    if (!conversation_history || conversation_history.length === 0) {
      const { data: dbHistory } = await supabase
        .from('chat_messages')
        .select('user_message, ai_response')
        .eq('webinar_id', webinar_id)
        .eq('user_email', user_email)
        .order('sent_at', { ascending: false })
        .limit(10);

      history = (dbHistory || []).reverse().flatMap(h => [
        { is_user: true, content: h.user_message },
        { is_user: false, content: h.ai_response }
      ]).filter(m => m.content);
    }

    // Build system prompt
    const systemPrompt = config 
      ? buildSystemPrompt(config, faqs || [])
      : `You are a helpful webinar assistant. Answer questions about the webinar content concisely.`;

    let aiResponse: string;
    let provider = 'lovable';

    // Get tenant API keys if tenant exists
    let apiKeys = null;
    if (webinar.tenant_id) {
      const { data: keys } = await supabase
        .from('tenant_api_keys')
        .select('*')
        .eq('tenant_id', webinar.tenant_id)
        .single();
      apiKeys = keys;
    }

    try {
      if (apiKeys?.preferred_ai_provider === 'anthropic' && apiKeys?.anthropic_key_encrypted) {
        const decryptedKey = await decryptKey(apiKeys.anthropic_key_encrypted, encryptionSecret);
        aiResponse = await callAnthropic(decryptedKey, systemPrompt, user_message, history);
        provider = 'anthropic';
        console.log('Response generated via Anthropic');
      } else if (apiKeys?.openai_key_encrypted) {
        const decryptedKey = await decryptKey(apiKeys.openai_key_encrypted, encryptionSecret);
        aiResponse = await callOpenAI(decryptedKey, systemPrompt, user_message, history);
        provider = 'openai';
        console.log('Response generated via OpenAI');
      } else {
        aiResponse = await callLovableAI(systemPrompt, user_message, history);
        provider = 'lovable';
        console.log('Response generated via Lovable AI');
      }
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      aiResponse = webinar.error_message || "I'm having trouble responding right now. Please try again in a moment.";
      provider = 'fallback';
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        response: aiResponse,
        provider
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
