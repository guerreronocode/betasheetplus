import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useAccountReset = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const resetAccountMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('🔄 Iniciando reset completo da conta para usuário:', user.id);
      
      // Deletar budget_categories primeiro (via budgets)
      console.log('🗑️ Limpando budget_categories via budgets');
      const { data: budgetIds } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', user.id);
      
      if (budgetIds && budgetIds.length > 0) {
        for (const budget of budgetIds) {
          await supabase
            .from('budget_categories')
            .delete()
            .eq('budget_id', budget.id);
        }
      }

      // Deletar investment_plans primeiro (via investment_profiles)
      console.log('🗑️ Limpando investment_plans via investment_profiles');
      const { data: profileIds } = await supabase
        .from('investment_profiles')
        .select('id')
        .eq('user_id', user.id);
      
      if (profileIds && profileIds.length > 0) {
        for (const profile of profileIds) {
          await supabase
            .from('investment_plans')
            .delete()
            .eq('profile_id', profile.id);
        }
      }

      // Lista de tabelas para limpar na ordem correta (considerando foreign keys)
      const tablesToClear = [
        'budgets',
        'credit_card_installments', 
        'credit_card_bills',
        'credit_card_purchases',
        'credit_cards',
        'investment_profiles',
        'monthly_objectives',
        'user_achievements',
        'recurring_transactions',
        'planned_income', // Adicionado para deletar receitas planejadas
        'income',
        'expenses',
        'goals', // Deve vir antes de investments devido à foreign key linked_investment_id
        'investments',
        'debts',
        'assets',
        'liabilities',
        'bank_accounts',
        'user_stats'
      ];

      // Deletar dados de cada tabela
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
      
      // Limpar todo o cache do React Query e recarregar a página
      queryClient.clear();
      setTimeout(() => {
        window.location.reload();
      }, 1500); // Pequeno delay para mostrar o toast
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