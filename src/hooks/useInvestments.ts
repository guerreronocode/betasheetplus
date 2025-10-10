import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useBankAccountVaults } from '@/hooks/useBankAccountVaults';

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

export const useInvestments = (startDate?: Date, endDate?: Date) => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getTotalReserved } = useBankAccountVaults();

  const { data: investments = [], isLoading: investmentsLoading } = useQuery({
    queryKey: ['investments', user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id);

      // Apply date filters if provided
      if (startDate && endDate) {
        query = query
          .gte('purchase_date', startDate.toISOString().split('T')[0])
          .lte('purchase_date', endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query.order('purchase_date', { ascending: false });
      
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
    enabled: !!user && !authLoading,
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

      // Criar valor mensal inicial
      const purchaseDate = new Date(investment.purchase_date);
      const monthDate = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), 1);
      
      const { error: monthlyValueError } = await supabase
        .from('investment_monthly_values')
        .insert({
          user_id: user.id,
          investment_id: data.id,
          month_date: monthDate.toISOString().split('T')[0],
          total_value: investment.amount,
          applied_value: investment.amount,
          yield_value: 0,
        });

      if (monthlyValueError) {
        console.error('Erro ao criar valor mensal inicial:', monthlyValueError);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment_monthly_values'] });
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
    mutationFn: async ({ investmentId, amount, currentValue, bankAccountId, month }: {
      investmentId: string;
      amount: number;
      currentValue: number;
      bankAccountId: string;
      month: Date;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Verificar saldo disponível da conta (considerando cofres)
      const { data: currentAccount, error: fetchError } = await supabase
        .from('bank_accounts')
        .select('balance')
        .eq('id', bankAccountId)
        .eq('user_id', user.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const reservedAmount = getTotalReserved(bankAccountId);
      const availableBalance = currentAccount.balance - reservedAmount;
      
      if (availableBalance < amount) {
        throw new Error(
          `Saldo insuficiente. Disponível: R$ ${availableBalance.toFixed(2)}. ` +
          `Para liberar fundos, reduza ou exclua cofres desta conta.`
        );
      }

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

      // Debitar o valor da conta bancária
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

      // Criar/atualizar valor mensal para o mês fornecido
      const monthDate = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthDateStr = monthDate.toISOString().split('T')[0];

      // Buscar valor mensal existente
      const { data: existingMonthlyValue } = await supabase
        .from('investment_monthly_values')
        .select('*')
        .eq('investment_id', investmentId)
        .eq('month_date', monthDateStr)
        .maybeSingle();

      if (existingMonthlyValue) {
        // Atualizar valor mensal existente
        const newAppliedValue = existingMonthlyValue.applied_value + amount;
        const newYieldValue = currentValue - newAppliedValue;

        await supabase
          .from('investment_monthly_values')
          .update({
            applied_value: newAppliedValue,
            total_value: currentValue,
            yield_value: newYieldValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingMonthlyValue.id);
      } else {
        // Criar novo registro mensal - usar o total aplicado atualizado
        const totalApplied = investment.amount + amount;
        const newYieldValue = currentValue - totalApplied;
        
        await supabase
          .from('investment_monthly_values')
          .insert({
            user_id: user.id,
            investment_id: investmentId,
            month_date: monthDateStr,
            applied_value: totalApplied,
            total_value: currentValue,
            yield_value: newYieldValue,
          });
      }

      return { investmentId, amount, currentValue };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment_monthly_values'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      queryClient.invalidateQueries({ queryKey: ['user_stats'] });
      toast({ title: 'Aporte realizado com sucesso!' });
    },
    onError: (error) => {
      console.error('Erro ao realizar aporte:', error);
      toast({ 
        title: 'Erro ao realizar aporte', 
        description: error.message,
        variant: 'destructive' 
      });
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

  const addInvestmentAport = (investmentId: string, amount: number, currentValue: number, bankAccountId: string, month: Date) => {
    addInvestmentAportMutation.mutate({ investmentId, amount, currentValue, bankAccountId, month });
  };

  const updateInvestmentValue = (investmentId: string, currentValue: number) => {
    updateInvestmentValueMutation.mutate({ investmentId, currentValue });
  };

  return {
    investments,
    investmentsLoading: investmentsLoading || authLoading,
    addInvestment: addInvestmentMutation.mutate,
    updateInvestment: updateInvestmentMutation.mutate,
    deleteInvestment: deleteInvestmentMutation.mutate,
    addInvestmentAport,
    updateInvestmentValue,
    isAddingInvestment: addInvestmentMutation.isPending,
  };
};
