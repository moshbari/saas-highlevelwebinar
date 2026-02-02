import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

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
  const { user, profile } = useAuth();
  const [isTestingKey, setIsTestingKey] = useState<string | null>(null);
  
  // Get tenant ID from profile
  const tenantId = profile?.default_tenant_id;

  // Fetch current API key status - only when user and tenantId are available
  const { data: status, isLoading, error } = useQuery({
    queryKey: ['api-keys-status', tenantId],
    queryFn: async (): Promise<ApiKeyStatus> => {
      if (!tenantId) {
        throw new Error('No tenant ID available');
      }
      
      const { data, error } = await supabase.functions.invoke('manage-api-key', {
        body: { action: 'get-status', tenantId }
      });

      if (error) throw error;
      
      return {
        openai_configured: data.openai?.configured || false,
        openai_configured_at: data.openai?.configuredAt || null,
        anthropic_configured: data.anthropic?.configured || false,
        anthropic_configured_at: data.anthropic?.configuredAt || null,
        whisper_configured: data.whisper?.configured || false,
        whisper_configured_at: data.whisper?.configuredAt || null,
        preferred_provider: data.preferredProvider || 'openai',
      };
    },
    enabled: !!user && !!tenantId, // Only run when authenticated with tenant
    retry: false, // Don't retry on failure to prevent loops
  });

  // Save API key mutation
  const saveKeyMutation = useMutation({
    mutationFn: async ({ keyType, apiKey }: { keyType: 'openai' | 'anthropic' | 'whisper'; apiKey: string }) => {
      if (!tenantId) throw new Error('No tenant ID available');
      
      const { data, error } = await supabase.functions.invoke('manage-api-key', {
        body: { action: 'save-key', tenantId, key_type: keyType, api_key: apiKey }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to save key');
      
      return data;
    },
    onSuccess: (_, variables) => {
      const keyNames = { openai: 'OpenAI', anthropic: 'Anthropic', whisper: 'Whisper' };
      toast.success(`${keyNames[variables.keyType]} API key saved successfully`);
      queryClient.invalidateQueries({ queryKey: ['api-keys-status', tenantId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save API key');
    },
  });

  // Remove API key mutation
  const removeKeyMutation = useMutation({
    mutationFn: async (keyType: 'openai' | 'anthropic' | 'whisper') => {
      if (!tenantId) throw new Error('No tenant ID available');
      
      const { data, error } = await supabase.functions.invoke('manage-api-key', {
        body: { action: 'remove-key', tenantId, key_type: keyType }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to remove key');
      
      return data;
    },
    onSuccess: (_, keyType) => {
      const keyNames = { openai: 'OpenAI', anthropic: 'Anthropic', whisper: 'Whisper' };
      toast.success(`${keyNames[keyType]} API key removed`);
      queryClient.invalidateQueries({ queryKey: ['api-keys-status', tenantId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove API key');
    },
  });

  // Set preferred provider mutation with optimistic update
  const setProviderMutation = useMutation({
    mutationFn: async (provider: 'openai' | 'anthropic') => {
      if (!tenantId) throw new Error('No tenant ID available');
      
      const { data, error } = await supabase.functions.invoke('manage-api-key', {
        body: { action: 'set-provider', tenantId, provider }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to set provider');
      
      return data;
    },
    // Optimistic update for instant feedback
    onMutate: async (provider) => {
      await queryClient.cancelQueries({ queryKey: ['api-keys-status', tenantId] });
      const previousStatus = queryClient.getQueryData<ApiKeyStatus>(['api-keys-status', tenantId]);
      
      queryClient.setQueryData<ApiKeyStatus>(['api-keys-status', tenantId], (old) => 
        old ? { ...old, preferred_provider: provider } : old
      );
      
      return { previousStatus };
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousStatus) {
        queryClient.setQueryData(['api-keys-status', tenantId], context.previousStatus);
      }
      toast.error(error.message || 'Failed to set provider');
    },
    onSuccess: (_, provider) => {
      const providerNames = { openai: 'OpenAI', anthropic: 'Anthropic' };
      toast.success(`${providerNames[provider]} set as preferred AI provider`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys-status', tenantId] });
    },
  });

  // Test API key
  const testKey = async (keyType: 'openai' | 'anthropic') => {
    if (!tenantId) {
      toast.error('No tenant available');
      return false;
    }
    
    setIsTestingKey(keyType);
    try {
      const { data, error } = await supabase.functions.invoke('manage-api-key', {
        body: { action: 'test-key', tenantId, key_type: keyType }
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
    tenantId, // Expose for debugging
  };
}
