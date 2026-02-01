import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AES-256-GCM encryption using Web Crypto API
async function getEncryptionKey(): Promise<CryptoKey> {
  const secret = Deno.env.get('API_ENCRYPTION_SECRET');
  if (!secret) {
    throw new Error('API_ENCRYPTION_SECRET not configured');
  }
  
  // Derive a 256-bit key from the secret
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret.padEnd(32, '0').slice(0, 32)),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('tenant-api-keys-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encrypt(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );
  
  // Combine IV + ciphertext and encode as base64
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

async function decrypt(encryptedData: string): Promise<string> {
  const key = await getEncryptionKey();
  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  
  return new TextDecoder().decode(plaintext);
}

// Validate OpenAI API key by making a test request
async function validateOpenAIKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (response.ok) {
      return { valid: true };
    }
    
    const error = await response.json();
    return { valid: false, error: error.error?.message || 'Invalid API key' };
  } catch (e) {
    return { valid: false, error: 'Failed to validate key' };
  }
}

// Validate Anthropic API key by making a test request
async function validateAnthropicKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }]
      })
    });
    
    // 200 = valid, 401 = invalid key, other errors might be rate limits etc
    if (response.ok || response.status === 429) {
      return { valid: true };
    }
    
    if (response.status === 401) {
      return { valid: false, error: 'Invalid API key' };
    }
    
    const error = await response.json();
    return { valid: false, error: error.error?.message || 'Validation failed' };
  } catch (e) {
    return { valid: false, error: 'Failed to validate key' };
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create authenticated client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { action, tenantId, keyType, apiKey, provider } = body;

    console.log(`[manage-api-key] Action: ${action}, KeyType: ${keyType}, TenantId: ${tenantId}`);

    // Verify user has access to tenant
    const { data: membership, error: membershipError } = await supabase
      .from('tenant_memberships')
      .select('role')
      .eq('tenant_id', tenantId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return new Response(
        JSON.stringify({ error: 'Access denied to tenant' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['owner', 'admin'].includes(membership.role)) {
      return new Response(
        JSON.stringify({ error: 'Only owners and admins can manage API keys' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'get-status': {
        // Get status of all configured keys
        const { data: keys } = await supabase
          .from('tenant_api_keys')
          .select('whisper_key_configured_at, openai_key_configured_at, anthropic_key_configured_at, preferred_ai_provider')
          .eq('tenant_id', tenantId)
          .single();

        return new Response(
          JSON.stringify({
            whisper: { configured: !!keys?.whisper_key_configured_at, configuredAt: keys?.whisper_key_configured_at },
            openai: { configured: !!keys?.openai_key_configured_at, configuredAt: keys?.openai_key_configured_at },
            anthropic: { configured: !!keys?.anthropic_key_configured_at, configuredAt: keys?.anthropic_key_configured_at },
            preferredProvider: keys?.preferred_ai_provider || 'openai'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'save-key': {
        if (!apiKey || !keyType) {
          return new Response(
            JSON.stringify({ error: 'Missing apiKey or keyType' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate the key first
        let validation: { valid: boolean; error?: string };
        if (keyType === 'whisper' || keyType === 'openai') {
          validation = await validateOpenAIKey(apiKey);
        } else if (keyType === 'anthropic') {
          validation = await validateAnthropicKey(apiKey);
        } else {
          return new Response(
            JSON.stringify({ error: 'Invalid keyType' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!validation.valid) {
          return new Response(
            JSON.stringify({ error: validation.error || 'Invalid API key' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Encrypt the key
        const encryptedKey = await encrypt(apiKey);

        // Map keyType to column names
        const columnMap: Record<string, { keyCol: string; dateCol: string }> = {
          whisper: { keyCol: 'whisper_key_encrypted', dateCol: 'whisper_key_configured_at' },
          openai: { keyCol: 'openai_key_encrypted', dateCol: 'openai_key_configured_at' },
          anthropic: { keyCol: 'anthropic_key_encrypted', dateCol: 'anthropic_key_configured_at' }
        };

        const { keyCol, dateCol } = columnMap[keyType];

        // Upsert the key
        const { error: upsertError } = await supabase
          .from('tenant_api_keys')
          .upsert({
            tenant_id: tenantId,
            [keyCol]: encryptedKey,
            [dateCol]: new Date().toISOString()
          }, { onConflict: 'tenant_id' });

        if (upsertError) {
          console.error('[manage-api-key] Upsert error:', upsertError);
          return new Response(
            JSON.stringify({ error: 'Failed to save key' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[manage-api-key] Key saved successfully for ${keyType}`);
        return new Response(
          JSON.stringify({ success: true, message: `${keyType} key saved successfully` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'remove-key': {
        if (!keyType) {
          return new Response(
            JSON.stringify({ error: 'Missing keyType' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const columnMap: Record<string, { keyCol: string; dateCol: string }> = {
          whisper: { keyCol: 'whisper_key_encrypted', dateCol: 'whisper_key_configured_at' },
          openai: { keyCol: 'openai_key_encrypted', dateCol: 'openai_key_configured_at' },
          anthropic: { keyCol: 'anthropic_key_encrypted', dateCol: 'anthropic_key_configured_at' }
        };

        const { keyCol, dateCol } = columnMap[keyType];

        const { error: updateError } = await supabase
          .from('tenant_api_keys')
          .update({
            [keyCol]: null,
            [dateCol]: null
          })
          .eq('tenant_id', tenantId);

        if (updateError) {
          console.error('[manage-api-key] Remove error:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to remove key' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[manage-api-key] Key removed successfully for ${keyType}`);
        return new Response(
          JSON.stringify({ success: true, message: `${keyType} key removed successfully` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'set-provider': {
        if (!provider || !['openai', 'anthropic'].includes(provider)) {
          return new Response(
            JSON.stringify({ error: 'Invalid provider' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: updateError } = await supabase
          .from('tenant_api_keys')
          .upsert({
            tenant_id: tenantId,
            preferred_ai_provider: provider
          }, { onConflict: 'tenant_id' });

        if (updateError) {
          console.error('[manage-api-key] Set provider error:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to set provider' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[manage-api-key] Provider set to ${provider}`);
        return new Response(
          JSON.stringify({ success: true, message: `Preferred provider set to ${provider}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'test-key': {
        if (!keyType) {
          return new Response(
            JSON.stringify({ error: 'Missing keyType' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get the encrypted key
        const { data: keys, error: fetchError } = await supabase
          .from('tenant_api_keys')
          .select('whisper_key_encrypted, openai_key_encrypted, anthropic_key_encrypted')
          .eq('tenant_id', tenantId)
          .single();

        if (fetchError || !keys) {
          return new Response(
            JSON.stringify({ error: 'No keys configured' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const keyMap: Record<string, string | null> = {
          whisper: keys.whisper_key_encrypted,
          openai: keys.openai_key_encrypted,
          anthropic: keys.anthropic_key_encrypted
        };

        const encryptedKey = keyMap[keyType];
        if (!encryptedKey) {
          return new Response(
            JSON.stringify({ error: `No ${keyType} key configured` }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Decrypt and validate
        const decryptedKey = await decrypt(encryptedKey);
        
        let validation: { valid: boolean; error?: string };
        if (keyType === 'whisper' || keyType === 'openai') {
          validation = await validateOpenAIKey(decryptedKey);
        } else {
          validation = await validateAnthropicKey(decryptedKey);
        }

        return new Response(
          JSON.stringify({ valid: validation.valid, error: validation.error }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('[manage-api-key] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
