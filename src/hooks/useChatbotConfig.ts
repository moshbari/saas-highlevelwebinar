import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ChatbotConfig {
  id: string;
  webinar_id: string;
  bot_name: string;
  bot_avatar: string;
  system_prompt: string;
  webinar_description: string;
  webinar_transcript: string;
  additional_context: string;
  response_style: string;
  max_response_length: number;
  redirect_off_topic: boolean;
  off_topic_message: string;
  handle_price_questions: boolean;
  price_redirect_message: string;
  encourage_engagement: boolean;
  engagement_prompts: string[];
  created_at: string;
  updated_at: string;
}

export interface ChatbotFaq {
  id: string;
  webinar_id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const defaultChatbotConfig: Omit<ChatbotConfig, 'id' | 'webinar_id' | 'created_at' | 'updated_at'> = {
  bot_name: 'AI Assistant',
  bot_avatar: 'AI',
  system_prompt: '',
  webinar_description: '',
  webinar_transcript: '',
  additional_context: '',
  response_style: 'professional',
  max_response_length: 500,
  redirect_off_topic: true,
  off_topic_message: "Let's stay focused on the webinar content. Feel free to ask me anything about what we're covering today!",
  handle_price_questions: true,
  price_redirect_message: "Great question about pricing! Keep watching - we'll cover all the details and a special offer coming up soon.",
  encourage_engagement: true,
  engagement_prompts: [],
};

export function useChatbotConfig(webinarId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['chatbot-config', webinarId],
    queryFn: async () => {
      if (!webinarId) return null;
      
      const { data, error } = await supabase
        .from('webinar_chatbot_config')
        .select('*')
        .eq('webinar_id', webinarId)
        .maybeSingle();
      
      if (error) throw error;
      
      // Parse engagement_prompts from JSON
      if (data) {
        return {
          ...data,
          engagement_prompts: Array.isArray(data.engagement_prompts) 
            ? data.engagement_prompts as string[]
            : [],
        } as ChatbotConfig;
      }
      
      return null;
    },
    enabled: !!webinarId,
  });

  const { data: faqs, isLoading: faqsLoading } = useQuery({
    queryKey: ['chatbot-faqs', webinarId],
    queryFn: async () => {
      if (!webinarId) return [];
      
      const { data, error } = await supabase
        .from('webinar_chatbot_faqs')
        .select('*')
        .eq('webinar_id', webinarId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as ChatbotFaq[];
    },
    enabled: !!webinarId,
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (configData: Partial<ChatbotConfig>) => {
      if (!webinarId) throw new Error('Webinar ID required');
      
      const payload = {
        webinar_id: webinarId,
        ...configData,
        engagement_prompts: configData.engagement_prompts || [],
      };
      
      // Remove id, created_at, updated_at from payload
      delete (payload as any).id;
      delete (payload as any).created_at;
      delete (payload as any).updated_at;
      
      if (config?.id) {
        // Update existing
        const { data, error } = await supabase
          .from('webinar_chatbot_config')
          .update(payload)
          .eq('id', config.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('webinar_chatbot_config')
          .insert(payload)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-config', webinarId] });
      toast({ title: 'Chatbot config saved' });
    },
    onError: (error) => {
      toast({ title: 'Error saving config', description: error.message, variant: 'destructive' });
    },
  });

  const addFaqMutation = useMutation({
    mutationFn: async (faq: { question: string; answer: string; category?: string }) => {
      if (!webinarId) throw new Error('Webinar ID required');
      
      const maxOrder = faqs?.reduce((max, f) => Math.max(max, f.sort_order), -1) ?? -1;
      
      const { data, error } = await supabase
        .from('webinar_chatbot_faqs')
        .insert({
          webinar_id: webinarId,
          question: faq.question,
          answer: faq.answer,
          category: faq.category || 'general',
          sort_order: maxOrder + 1,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-faqs', webinarId] });
      toast({ title: 'FAQ added' });
    },
    onError: (error) => {
      toast({ title: 'Error adding FAQ', description: error.message, variant: 'destructive' });
    },
  });

  const updateFaqMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ChatbotFaq> & { id: string }) => {
      const { data, error } = await supabase
        .from('webinar_chatbot_faqs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-faqs', webinarId] });
    },
    onError: (error) => {
      toast({ title: 'Error updating FAQ', description: error.message, variant: 'destructive' });
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (faqId: string) => {
      const { error } = await supabase
        .from('webinar_chatbot_faqs')
        .delete()
        .eq('id', faqId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-faqs', webinarId] });
      toast({ title: 'FAQ deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting FAQ', description: error.message, variant: 'destructive' });
    },
  });

  return {
    config: config || defaultChatbotConfig as any,
    faqs: faqs || [],
    isLoading: configLoading || faqsLoading,
    saveConfig: saveConfigMutation.mutate,
    isSaving: saveConfigMutation.isPending,
    addFaq: addFaqMutation.mutate,
    updateFaq: updateFaqMutation.mutate,
    deleteFaq: deleteFaqMutation.mutate,
    hasConfig: !!config,
  };
}
