import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWebinars, getWebinar, saveWebinar, updateWebinar, deleteWebinar } from '@/lib/webinarStorage';
import { WebinarConfig } from '@/types/webinar';

export const useWebinars = () => {
  return useQuery({
    queryKey: ['webinars'],
    queryFn: getWebinars,
  });
};

export const useWebinar = (id: string | undefined) => {
  return useQuery({
    queryKey: ['webinar', id],
    queryFn: () => id ? getWebinar(id) : null,
    enabled: !!id,
  });
};

export const useSaveWebinar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (config: Omit<WebinarConfig, 'id' | 'createdAt' | 'updatedAt'>) => saveWebinar(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webinars'] });
    },
  });
};

export const useUpdateWebinar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, config }: { id: string; config: Partial<WebinarConfig> }) => updateWebinar(id, config),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['webinars'] });
      queryClient.invalidateQueries({ queryKey: ['webinar', variables.id] });
    },
  });
};

export const useDeleteWebinar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteWebinar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webinars'] });
    },
  });
};
