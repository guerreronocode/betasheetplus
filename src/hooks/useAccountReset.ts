import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAccountReset = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const resetAccountMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('🔄 Iniciando reset completo da conta para usuário:', user.id);
      
      // Lista de tabelas para limpar na ordem correta (considerando foreign keys)
      const tablesToClear = [
        'budget_categories',
        'budgets',
        'credit_card_installments', 
        'credit_card_bills',
        'credit_card_purchases',
        'credit_cards',
        'investment_plans',
        'investment_profiles',
        'monthly_objectives',
        'user_achievements',
        'recurring_transactions',
        'income',
        'expenses',
        'investments',
        'goals',
        'debts',
        'assets',
        'liabilities',
        'bank_accounts',
        'user_stats'
      ];

      // Deletar dados de cada tabela - usando type assertions para contornar limitações do TypeScript
      for (const table of tablesToClear) {
        console.log(`🗑️ Limpando tabela: ${table}`);
        const { error } = await supabase
          .from(table as any)
          .delete()
          .eq('user_id', user.id);
          
        if (error) {
          console.error(`Erro ao limpar tabela ${table}:`, error);
          throw new Error(`Falha ao limpar dados da tabela ${table}: ${error.message}`);
        }
      }

      // Resetar estatísticas do usuário
      console.log('📊 Recriando estatísticas básicas do usuário');
      const { error: statsError } = await supabase
        .from('user_stats')
        .insert({
          user_id: user.id,
          level: 1,
          total_points: 0,
          current_streak: 0,
          longest_streak: 0,
          consecutive_days_accessed: 0,
          total_transactions: 0,
          positive_balance_days: 0,
          goals_completed: 0
        });

      if (statsError) {
        console.error('Erro ao recriar estatísticas:', statsError);
        throw new Error(`Falha ao recriar estatísticas: ${statsError.message}`);
      }

      console.log('✅ Reset da conta concluído com sucesso!');
    },
    onSuccess: () => {
      toast({
        title: 'Conta zerada com sucesso!',
        description: 'Todos os seus dados financeiros foram removidos. Sua conta está pronta para um novo começo.',
      });
    },
    onError: (error) => {
      console.error('Erro no reset da conta:', error);
      toast({
        title: 'Erro ao zerar conta',
        description: 'Ocorreu um erro durante o processo. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  return {
    resetAccount: resetAccountMutation.mutate,
    isResetting: resetAccountMutation.isPending,
  };
};