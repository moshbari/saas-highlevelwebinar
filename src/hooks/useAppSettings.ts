import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAppSettings() {
  const queryClient = useQueryClient();

  const { data: trialDays = 14, isLoading } = useQuery({
    queryKey: ['app-settings', 'trial_days'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'trial_days')
        .single();

      if (error) throw error;
      return (data?.setting_value as { days: number })?.days || 14;
    },
  });

  const updateTrialDaysMutation = useMutation({
    mutationFn: async (days: number) => {
      const { error } = await supabase
        .from('app_settings')
        .update({ setting_value: { days } })
        .eq('setting_key', 'trial_days');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      toast.success('Trial days updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update trial days: ${error.message}`);
    },
  });

  return {
    trialDays,
    isLoading,
    updateTrialDays: updateTrialDaysMutation.mutate,
    isUpdating: updateTrialDaysMutation.isPending,
  };
}
