import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  current_value: number;
  purchase_date: string;
  yield_type: 'fixed' | 'cdi' | 'selic' | 'ipca';
  yield_rate: number;
  last_yield_update: string;
  bank_account_id?: string;
  liquidity?: string;
  maturity_date?: string;
}

export const useInvestments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: investments = [], isLoading: investmentsLoading } = useQuery({
    queryKey: ['investments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        amount: item.amount,
        current_value: item.current_value || item.amount,
        purchase_date: item.purchase_date,
        yield_type: (item as any).yield_type || 'fixed',
        yield_rate: (item as any).yield_rate || 0,
        last_yield_update: (item as any).last_yield_update || item.purchase_date,
        bank_account_id: (item as any).bank_account_id,
        liquidity: (item as any).liquidity || "",
        maturity_date: (item as any).maturity_date || "",
      })) as Investment[];
    },
    enabled: !!user,
  });

  const addInvestmentMutation = useMutation({
    mutationFn: async (investment: Omit<Investment, 'id' | 'current_value' | 'last_yield_update'>) => {
      if (!user) throw new Error('User not authenticated');
      if (investment.bank_account_id) {
        // Investment transfers money from available balance to invested amount
        // This doesn't increase net worth, just moves money between categories
        const { data: currentAccount, error: fetchError } = await supabase
          .from('bank_accounts')
          .select('balance')
          .eq('id', investment.bank_account_id)
          .eq('user_id', user.id)
          .single();
        
        if (fetchError) throw fetchError;
        
        const newBalance = currentAccount.balance - investment.amount;
        const { error: balanceError } = await supabase
          .from('bank_accounts')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', investment.bank_account_id)
          .eq('user_id', user.id);
        
        if (balanceError) throw balanceError;
      }

      const { data, error } = await supabase
        .from('investments')
        .insert([{ 
          ...investment, 
          user_id: user.id,
          current_value: investment.amount,
          last_yield_update: new Date().toISOString().split('T')[0],
          liquidity: investment.liquidity ?? null,
          maturity_date: investment.maturity_date ?? null
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      queryClient.invalidateQueries({ queryKey: ['user_stats'] });
      toast({ title: 'Investimento adicionado com sucesso!' });
    },
  });

  const updateInvestmentMutation = useMutation({
    mutationFn: async ({ id, ...investmentData }: { id: string } & Partial<Investment>) => {
      if (!user) throw new Error('User not authenticated');

      // Garante liquidez e vencimento na atualização
      const { data, error } = await supabase
        .from('investments')
        .update({
          ...investmentData,
          liquidity: investmentData.liquidity ?? null,
          maturity_date: investmentData.maturity_date ?? null,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      queryClient.invalidateQueries({ queryKey: ['user_stats'] });
      toast({ title: 'Investimento atualizado com sucesso!' });
    },
  });

  const deleteInvestmentMutation = useMutation({
    mutationFn: async (investmentId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // Get the investment details first
      const { data: investment, error: getError } = await supabase
        .from('investments')
        .select('*')
        .eq('id', investmentId)
        .eq('user_id', user.id)
        .single();
      
      if (getError) throw getError;
      
      // If the investment has a bank account, return the current value to the account
      if (investment.bank_account_id) {
        const { data: currentAccount, error: fetchError } = await supabase
          .from('bank_accounts')
          .select('balance')
          .eq('id', investment.bank_account_id)
          .eq('user_id', user.id)
          .single();
        
        if (fetchError) throw fetchError;
        
        const newBalance = currentAccount.balance + (investment.current_value || investment.amount);
        const { error: balanceError } = await supabase
          .from('bank_accounts')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', investment.bank_account_id)
          .eq('user_id', user.id);
        
        if (balanceError) throw balanceError;
      }

      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', investmentId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      queryClient.invalidateQueries({ queryKey: ['user_stats'] });
      toast({ title: 'Investimento excluído com sucesso!' });
    },
  });

  // Aporte em investimento
  const addInvestmentAportMutation = useMutation({
    mutationFn: async ({ investmentId, amount, currentValue, bankAccountId }: {
      investmentId: string;
      amount: number;
      currentValue: number;
      bankAccountId?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Buscar investimento atual
      const { data: investment, error: getError } = await supabase
        .from('investments')
        .select('amount')
        .eq('id', investmentId)
        .eq('user_id', user.id)
        .single();

      if (getError) throw getError;

      // Atualizar investimento
      const { error: investmentError } = await supabase
        .from('investments')
        .update({
          amount: investment.amount + amount, 
          current_value: currentValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', investmentId)
        .eq('user_id', user.id);

      if (investmentError) throw investmentError;

      // Se especificou conta bancária, debitar o valor
      if (bankAccountId) {
        const { data: currentAccount, error: fetchError } = await supabase
          .from('bank_accounts')
          .select('balance')
          .eq('id', bankAccountId)
          .eq('user_id', user.id)
          .single();
        
        if (fetchError) throw fetchError;
        
        const newBalance = currentAccount.balance - amount;
        const { error: accountError } = await supabase
          .from('bank_accounts')
          .update({
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', bankAccountId)
          .eq('user_id', user.id);

        if (accountError) throw accountError;
      }

      return { investmentId, amount, currentValue };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      queryClient.invalidateQueries({ queryKey: ['user_stats'] });
      toast({ title: 'Aporte realizado com sucesso!' });
    },
    onError: (error) => {
      console.error('Erro ao realizar aporte:', error);
      toast({ title: 'Erro ao realizar aporte', variant: 'destructive' });
    }
  });

  // Atualizar valor do investimento
  const updateInvestmentValueMutation = useMutation({
    mutationFn: async ({ investmentId, currentValue }: {
      investmentId: string;
      currentValue: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('investments')
        .update({
          current_value: currentValue,
          last_yield_update: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', investmentId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { investmentId, currentValue };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['user_stats'] });
      toast({ title: 'Valor do investimento atualizado!' });
    },
    onError: (error) => {
      console.error('Erro ao atualizar investimento:', error);
      toast({ title: 'Erro ao atualizar valor do investimento', variant: 'destructive' });
    }
  });

  const addInvestmentAport = (investmentId: string, amount: number, currentValue: number, bankAccountId?: string) => {
    addInvestmentAportMutation.mutate({ investmentId, amount, currentValue, bankAccountId });
  };

  const updateInvestmentValue = (investmentId: string, currentValue: number) => {
    updateInvestmentValueMutation.mutate({ investmentId, currentValue });
  };

  return {
    investments,
    investmentsLoading,
    addInvestment: addInvestmentMutation.mutate,
    updateInvestment: updateInvestmentMutation.mutate,
    deleteInvestment: deleteInvestmentMutation.mutate,
    addInvestmentAport,
    updateInvestmentValue,
    isAddingInvestment: addInvestmentMutation.isPending,
  };
};
