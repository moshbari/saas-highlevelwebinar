import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clip } from '@/types/clip';
import { getClips, getClip, getClipsByIds, saveClip, updateClip, deleteClip } from '@/lib/clipStorage';

export function useClips(includeArchived = false) {
  return useQuery({
    queryKey: ['clips', includeArchived],
    queryFn: () => getClips(includeArchived),
  });
}

export function useClip(id: string | undefined) {
  return useQuery({
    queryKey: ['clip', id],
    queryFn: () => getClip(id!),
    enabled: !!id,
  });
}

export function useClipsByIds(ids: string[]) {
  return useQuery({
    queryKey: ['clips', 'byIds', ids],
    queryFn: () => getClipsByIds(ids),
    enabled: ids.length > 0,
  });
}

export function useSaveClip() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (clip: Omit<Clip, 'id' | 'createdAt' | 'updatedAt'>) => saveClip(clip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clips'] });
    },
  });
}

export function useUpdateClip() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, clip }: { id: string; clip: Partial<Clip> }) => updateClip(id, clip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clips'] });
    },
  });
}

export function useDeleteClip() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteClip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clips'] });
    },
  });
}
