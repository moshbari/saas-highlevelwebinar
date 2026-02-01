import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';

export const useWebinarNotes = (webinarId: string) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef('');

  // Fetch existing notes
  useEffect(() => {
    const fetchNotes = async () => {
      if (!webinarId || !user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('webinar_notes')
          .select('content')
          .eq('webinar_id', webinarId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        const noteContent = data?.content || '';
        setContent(noteContent);
        setInitialContent(noteContent);
        lastSavedContentRef.current = noteContent;
        setSaveStatus(noteContent ? 'saved' : 'idle');
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notes',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [webinarId, user?.id]);

  // Debounced save function
  const saveNotes = useCallback(async (newContent: string) => {
    if (!webinarId || !user?.id) return;
    if (newContent === lastSavedContentRef.current) {
      setSaveStatus('saved');
      return;
    }

    setSaveStatus('saving');

    try {
      const { error } = await supabase
        .from('webinar_notes')
        .upsert(
          {
            webinar_id: webinarId,
            user_id: user.id,
            content: newContent,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'webinar_id,user_id',
          }
        );

      if (error) throw error;

      lastSavedContentRef.current = newContent;
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving notes:', error);
      setSaveStatus('error');
      toast({
        title: 'Save failed',
        description: 'Failed to save notes. Click to retry.',
        variant: 'destructive',
      });
    }
  }, [webinarId, user?.id]);

  // Auto-save with debounce
  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save (500ms)
    saveTimeoutRef.current = setTimeout(() => {
      saveNotes(newContent);
    }, 500);
  }, [saveNotes]);

  // Retry save
  const retrySave = useCallback(() => {
    saveNotes(content);
  }, [content, saveNotes]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Check if notes have content (for indicator)
  const hasNotes = content.trim().length > 0;

  return {
    content,
    updateContent,
    saveStatus,
    isLoading,
    hasNotes,
    retrySave,
  };
};

// Hook to check if webinars have notes (for indicator dots)
export const useWebinarNotesIndicators = (webinarIds: string[]) => {
  const { user } = useAuth();
  const [notesMap, setNotesMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchNotesIndicators = async () => {
      if (!user?.id || webinarIds.length === 0) return;

      try {
        const { data, error } = await supabase
          .from('webinar_notes')
          .select('webinar_id')
          .eq('user_id', user.id)
          .in('webinar_id', webinarIds)
          .neq('content', '');

        if (error) throw error;

        const map: Record<string, boolean> = {};
        data?.forEach(note => {
          map[note.webinar_id] = true;
        });
        setNotesMap(map);
      } catch (error) {
        console.error('Error fetching notes indicators:', error);
      }
    };

    fetchNotesIndicators();
  }, [webinarIds, user?.id]);

  return notesMap;
};
