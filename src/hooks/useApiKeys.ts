import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ApiKeyStatus {
  openai_configured: boolean;
  openai_configured_at: string | null;
  anthropic_configured: boolean;
  anthropic_configured_at: string | null;
  whisper_configured: boolean;
  whisper_configured_at: string | null;
  preferred_provider: 'openai' | 'anthropic';
}

export function useApiKeys() {
  const queryClient = useQueryClient();
  const [isTestingKey, setIsTestingKey] = useState<string | null>(null);

  // Fetch current API key status
  const { data: status, isLoading, error } = useQuery({
    queryKey: ['api-keys-status'],
    queryFn: async (): Promise<ApiKeyStatus> => {
      const { data, error } = await supabase.functions.invoke('manage-api-key', {
        body: { action: 'get-status' }
      });

      if (error) throw error;
      
      return {
        openai_configured: data.openai_configured || false,
        openai_configured_at: data.openai_configured_at || null,
        anthropic_configured: data.anthropic_configured || false,
        anthropic_configured_at: data.anthropic_configured_at || null,
        whisper_configured: data.whisper_configured || false,
        whisper_configured_at: data.whisper_configured_at || null,
        preferred_provider: data.preferred_provider || 'openai',
      };
    },
  });

  // Save API key mutation
  const saveKeyMutation = useMutation({
    mutationFn: async ({ keyType, apiKey }: { keyType: 'openai' | 'anthropic' | 'whisper'; apiKey: string }) => {
      const { data, error } = await supabase.functions.invoke('manage-api-key', {
        body: { action: 'save-key', key_type: keyType, api_key: apiKey }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to save key');
      
      return data;
    },
    onSuccess: (_, variables) => {
      const keyNames = { openai: 'OpenAI', anthropic: 'Anthropic', whisper: 'Whisper' };
      toast.success(`${keyNames[variables.keyType]} API key saved successfully`);
      queryClient.invalidateQueries({ queryKey: ['api-keys-status'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save API key');
    },
  });

  // Remove API key mutation
  const removeKeyMutation = useMutation({
    mutationFn: async (keyType: 'openai' | 'anthropic' | 'whisper') => {
      const { data, error } = await supabase.functions.invoke('manage-api-key', {
        body: { action: 'remove-key', key_type: keyType }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to remove key');
      
      return data;
    },
    onSuccess: (_, keyType) => {
      const keyNames = { openai: 'OpenAI', anthropic: 'Anthropic', whisper: 'Whisper' };
      toast.success(`${keyNames[keyType]} API key removed`);
      queryClient.invalidateQueries({ queryKey: ['api-keys-status'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove API key');
    },
  });

  // Set preferred provider mutation
  const setProviderMutation = useMutation({
    mutationFn: async (provider: 'openai' | 'anthropic') => {
      const { data, error } = await supabase.functions.invoke('manage-api-key', {
        body: { action: 'set-provider', provider }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to set provider');
      
      return data;
    },
    onSuccess: (_, provider) => {
      const providerNames = { openai: 'OpenAI', anthropic: 'Anthropic' };
      toast.success(`${providerNames[provider]} set as preferred AI provider`);
      queryClient.invalidateQueries({ queryKey: ['api-keys-status'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set provider');
    },
  });

  // Test API key
  const testKey = async (keyType: 'openai' | 'anthropic') => {
    setIsTestingKey(keyType);
    try {
      const { data, error } = await supabase.functions.invoke('manage-api-key', {
        body: { action: 'test-key', key_type: keyType }
      });

      if (error) throw error;
      
      if (data.valid) {
        toast.success(`${keyType === 'openai' ? 'OpenAI' : 'Anthropic'} API key is working correctly`);
      } else {
        toast.error(data.error || 'API key validation failed');
      }
      
      return data.valid;
    } catch (err) {
      toast.error('Failed to test API key');
      return false;
    } finally {
      setIsTestingKey(null);
    }
  };

  return {
    status,
    isLoading,
    error,
    saveKey: saveKeyMutation.mutate,
    isSaving: saveKeyMutation.isPending,
    removeKey: removeKeyMutation.mutate,
    isRemoving: removeKeyMutation.isPending,
    setProvider: setProviderMutation.mutate,
    isSettingProvider: setProviderMutation.isPending,
    testKey,
    isTestingKey,
  };
}
