import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChatSession, PendingReply, QuickReply, LiveChatMessage } from '@/types/liveChat';
import { useEffect } from 'react';

// Fetch all active chat sessions
export function useChatSessions(webinarId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['chat-sessions', webinarId],
    queryFn: async () => {
      let sessionsQuery = supabase
        .from('chat_sessions')
        .select(`
          *,
          webinars:webinar_id (webinar_name)
        `)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (webinarId) {
        sessionsQuery = sessionsQuery.eq('webinar_id', webinarId);
      }

      const { data: sessions, error } = await sessionsQuery;
      if (error) throw error;

      // Get pending counts for each session
      const sessionIds = sessions?.map(s => s.id) || [];
      const { data: pendingCounts } = await supabase
        .from('pending_replies')
        .select('session_id')
        .in('session_id', sessionIds)
        .eq('is_answered', false);

      // Get last message for each session
      const { data: lastMessages } = await supabase
        .from('chat_messages')
        .select('session_id, user_message')
        .in('session_id', sessionIds)
        .order('sent_at', { ascending: false });

      // Create lookup maps
      const pendingMap = new Map<string, number>();
      pendingCounts?.forEach(p => {
        const count = pendingMap.get(p.session_id || '') || 0;
        pendingMap.set(p.session_id || '', count + 1);
      });

      const lastMessageMap = new Map<string, string>();
      lastMessages?.forEach(m => {
        if (!lastMessageMap.has(m.session_id || '')) {
          lastMessageMap.set(m.session_id || '', m.user_message);
        }
      });

      return sessions?.map(s => ({
        ...s,
        mode: s.mode as 'ai' | 'human',
        webinar_name: (s.webinars as any)?.webinar_name || 'Unknown Webinar',
        pending_count: pendingMap.get(s.id) || 0,
        last_message: lastMessageMap.get(s.id) || '',
      })) as ChatSession[];
    },
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('chat-sessions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_sessions' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pending_replies' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

// Fetch messages for a specific session
export function useSessionMessages(sessionId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['session-messages', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      return data as LiveChatMessage[];
    },
    enabled: !!sessionId,
    refetchInterval: 2000,
  });

  // Subscribe to realtime message updates
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session-messages-${sessionId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['session-messages', sessionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);

  return query;
}

// Take over a chat session (switch to human mode)
export function useTakeOverSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({
          mode: 'human',
          taken_over_at: new Date().toISOString(),
          taken_over_by: 'Admin',
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
}

// Return a session to AI mode
export function useReturnToAI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .update({
          mode: 'ai',
          returned_to_ai_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
}

// Send a human reply
export function useSendHumanReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      message,
      pendingMessageId 
    }: { 
      sessionId: string; 
      message: string;
      pendingMessageId?: string;
    }) => {
      const nowIso = new Date().toISOString();

      // Get session info
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('webinar_id, user_name, user_email')
        .eq('id', sessionId)
        .single();

      if (!session) throw new Error('Session not found');

      if (pendingMessageId) {
        // Update the pending message with the human response
        await supabase
          .from('chat_messages')
          .update({
            ai_response: message,
            response_type: 'human',
            is_pending: false,
            responded_at: nowIso,
          })
          .eq('id', pendingMessageId);

        // Mark pending reply as answered
        await supabase
          .from('pending_replies')
          .update({
            is_answered: true,
            answered_at: nowIso,
            human_response: message,
          })
          .eq('chat_message_id', pendingMessageId);
      } else {
        // No pending message - insert a new outbound human message
        await supabase.from('chat_messages').insert({
          webinar_id: session.webinar_id!,
          session_id: sessionId,
          user_name: session.user_name || 'Anonymous',
          user_email: session.user_email,
          user_message: '',
          ai_response: message,
          response_type: 'human',
          is_pending: false,
          responded_at: nowIso,
          session_date: nowIso.split('T')[0],
        });
      }

      // Update session last_message_at
      await supabase
        .from('chat_sessions')
        .update({ last_message_at: nowIso })
        .eq('id', sessionId);

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session-messages', variables.sessionId] });
    },
  });
}

// Fetch quick replies
export function useQuickReplies() {
  return useQuery({
    queryKey: ['quick-replies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quick_replies')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as QuickReply[];
    },
  });
}

// Get pending replies count
export function usePendingCount() {
  return useQuery({
    queryKey: ['pending-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('pending_replies')
        .select('*', { count: 'exact', head: true })
        .eq('is_answered', false);

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 3000,
  });
}
