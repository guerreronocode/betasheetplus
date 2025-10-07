import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface InvestmentSettings {
  id: string;
  user_id: string;
  financial_independence_goal: number;
  average_monthly_income: number;
  created_at: string;
  updated_at: string;
}

export const useInvestmentSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['investment-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_investment_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return data as InvestmentSettings | null;
    },
    enabled: !!user,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { financial_independence_goal?: number; average_monthly_income?: number }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('user_investment_settings')
        .upsert({
          user_id: user.id,
          financial_independence_goal: data.financial_independence_goal ?? settings?.financial_independence_goal ?? 0,
          average_monthly_income: data.average_monthly_income ?? settings?.average_monthly_income ?? 0,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment-settings'] });
      toast({ title: 'Configurações atualizadas com sucesso!' });
    },
    onError: (error) => {
      console.error('Erro ao atualizar configurações:', error);
      toast({ 
        title: 'Erro ao atualizar configurações', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  };
};
