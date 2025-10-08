import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { startOfMonth, format } from 'date-fns';

export interface InvestmentMonthlyValue {
  id: string;
  user_id: string;
  investment_id: string;
  month_date: string;
  total_value: number;
  applied_value: number;
  yield_value: number;
  created_at: string;
  updated_at: string;
}

export const useInvestmentMonthlyValues = (investmentId?: string, startDate?: Date, endDate?: Date) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: monthlyValues = [], isLoading } = useQuery({
    queryKey: ['investment_monthly_values', user?.id, investmentId, startDate, endDate],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('investment_monthly_values')
        .select('*')
        .eq('user_id', user.id);

      if (investmentId) {
        query = query.eq('investment_id', investmentId);
      }

      if (startDate && endDate) {
        query = query
          .gte('month_date', format(startOfMonth(startDate), 'yyyy-MM-dd'))
          .lte('month_date', format(startOfMonth(endDate), 'yyyy-MM-dd'));
      }

      const { data, error } = await query.order('month_date', { ascending: true });
      
      if (error) throw error;
      
      return data as InvestmentMonthlyValue[];
    },
    enabled: !!user,
  });

  const upsertMonthlyValueMutation = useMutation({
    mutationFn: async ({ 
      investmentId, 
      monthDate, 
      totalValue, 
      appliedValue 
    }: {
      investmentId: string;
      monthDate: Date;
      totalValue: number;
      appliedValue: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const monthDateStr = format(startOfMonth(monthDate), 'yyyy-MM-dd');
      const yieldValue = totalValue - appliedValue;

      const { data, error } = await supabase
        .from('investment_monthly_values')
        .upsert({
          user_id: user.id,
          investment_id: investmentId,
          month_date: monthDateStr,
          total_value: totalValue,
          applied_value: appliedValue,
          yield_value: yieldValue,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'investment_id,month_date'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment_monthly_values'] });
      toast({ title: 'Valor mensal atualizado com sucesso!' });
    },
    onError: (error) => {
      console.error('Erro ao atualizar valor mensal:', error);
      toast({ 
        title: 'Erro ao atualizar valor mensal', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const createInitialMonthlyValueMutation = useMutation({
    mutationFn: async ({
      investmentId,
      purchaseDate,
      initialAmount
    }: {
      investmentId: string;
      purchaseDate: Date;
      initialAmount: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const monthDateStr = format(startOfMonth(purchaseDate), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('investment_monthly_values')
        .insert({
          user_id: user.id,
          investment_id: investmentId,
          month_date: monthDateStr,
          total_value: initialAmount,
          applied_value: initialAmount,
          yield_value: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment_monthly_values'] });
    },
  });

  const getMonthlyValue = (investmentId: string, monthDate: Date) => {
    const monthDateStr = format(startOfMonth(monthDate), 'yyyy-MM-dd');
    return monthlyValues.find(
      mv => mv.investment_id === investmentId && mv.month_date === monthDateStr
    );
  };

  return {
    monthlyValues,
    isLoading,
    upsertMonthlyValue: upsertMonthlyValueMutation.mutate,
    createInitialMonthlyValue: createInitialMonthlyValueMutation.mutate,
    getMonthlyValue,
  };
};
