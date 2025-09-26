
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BankAccount {
  id: string;
  name: string;
  bank_name: string;
  account_type: string;
  balance: number;
  color: string;
  is_active: boolean;
}

export const useBankAccounts = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bankAccounts = [], isLoading: bankAccountsLoading } = useQuery({
    queryKey: ['bank_accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BankAccount[];
    },
    enabled: !!user && !authLoading,
  });

  const addBankAccountMutation = useMutation({
    mutationFn: async (account: Omit<BankAccount, 'id' | 'is_active'>) => {
      console.log("addBankAccountMutation called with:", account);
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([{ ...account, user_id: user.id }])
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      console.log("Account created successfully:", data);
      return data;
    },
    onSuccess: () => {
      console.log("Mutation successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      toast({ title: 'Conta bancária adicionada com sucesso!' });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({ 
        title: 'Erro ao adicionar conta', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    bankAccounts,
    bankAccountsLoading: bankAccountsLoading || authLoading,
    addBankAccount: addBankAccountMutation.mutate,
    isAddingBankAccount: addBankAccountMutation.isPending,
  };
};
