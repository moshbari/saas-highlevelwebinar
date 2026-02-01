import { supabase } from '@/integrations/supabase/client';
import { Clip } from '@/types/clip';

// Helper to get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

// Convert database row to Clip
const rowToClip = (row: any): Clip => ({
  id: row.id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  userId: row.user_id,
  name: row.name,
  url: row.url,
  durationSeconds: row.duration_seconds,
  durationAutoDetected: row.duration_auto_detected ?? true,
  thumbnailUrl: row.thumbnail_url,
  fileSizeMb: row.file_size_mb,
  notes: row.notes,
  tags: row.tags ?? [],
  isArchived: row.is_archived ?? false,
});

// Convert Clip to database row
const clipToRow = (clip: Omit<Clip, 'id' | 'createdAt' | 'updatedAt'>) => ({
  user_id: clip.userId,
  name: clip.name,
  url: clip.url,
  duration_seconds: clip.durationSeconds,
  duration_auto_detected: clip.durationAutoDetected,
  thumbnail_url: clip.thumbnailUrl,
  file_size_mb: clip.fileSizeMb,
  notes: clip.notes,
  tags: clip.tags,
  is_archived: clip.isArchived,
});

export const getClips = async (includeArchived = false): Promise<Clip[]> => {
  let query = supabase
    .from('clips')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (!includeArchived) {
    query = query.eq('is_archived', false);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching clips:', error);
    return [];
  }
  
  return data.map(rowToClip);
};

export const getClip = async (id: string): Promise<Clip | null> => {
  const { data, error } = await supabase
    .from('clips')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching clip:', error);
    return null;
  }
  
  return data ? rowToClip(data) : null;
};

export const getClipsByIds = async (ids: string[]): Promise<Clip[]> => {
  if (ids.length === 0) return [];
  
  const { data, error } = await supabase
    .from('clips')
    .select('*')
    .in('id', ids);
  
  if (error) {
    console.error('Error fetching clips by ids:', error);
    return [];
  }
  
  return data.map(rowToClip);
};

export const saveClip = async (clip: Omit<Clip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Clip | null> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    console.error('User not authenticated');
    return null;
  }

  const { data, error } = await supabase
    .from('clips')
    .insert({ ...clipToRow(clip), user_id: userId })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving clip:', error);
    return null;
  }
  
  return rowToClip(data);
};

export const updateClip = async (id: string, clip: Partial<Clip>): Promise<Clip | null> => {
  const updateData: any = {};
  
  if (clip.name !== undefined) updateData.name = clip.name;
  if (clip.url !== undefined) updateData.url = clip.url;
  if (clip.durationSeconds !== undefined) updateData.duration_seconds = clip.durationSeconds;
  if (clip.durationAutoDetected !== undefined) updateData.duration_auto_detected = clip.durationAutoDetected;
  if (clip.thumbnailUrl !== undefined) updateData.thumbnail_url = clip.thumbnailUrl;
  if (clip.fileSizeMb !== undefined) updateData.file_size_mb = clip.fileSizeMb;
  if (clip.notes !== undefined) updateData.notes = clip.notes;
  if (clip.tags !== undefined) updateData.tags = clip.tags;
  if (clip.isArchived !== undefined) updateData.is_archived = clip.isArchived;
  
  const { data, error } = await supabase
    .from('clips')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating clip:', error);
    return null;
  }
  
  return rowToClip(data);
};

export const deleteClip = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('clips')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting clip:', error);
    throw error;
  }

  return true;
};

// Utility function to detect video duration
export const detectVideoDuration = (url: string): Promise<{ success: boolean; duration: number; error?: string }> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    const cleanup = () => {
      video.remove();
    };
    
    video.onloadedmetadata = () => {
      const durationSeconds = Math.round(video.duration);
      cleanup();
      resolve({
        success: true,
        duration: durationSeconds,
      });
    };
    
    video.onerror = () => {
      cleanup();
      resolve({
        success: false,
        duration: 0,
        error: 'Could not load video metadata',
      });
    };
    
    // Timeout after 15 seconds
    const timeout = setTimeout(() => {
      cleanup();
      resolve({
        success: false,
        duration: 0,
        error: 'Timeout detecting duration',
      });
    }, 15000);
    
    video.onloadedmetadata = () => {
      clearTimeout(timeout);
      const durationSeconds = Math.round(video.duration);
      cleanup();
      resolve({
        success: true,
        duration: durationSeconds,
      });
    };
    
    video.src = url;
  });
};

// Format seconds to human readable duration
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
