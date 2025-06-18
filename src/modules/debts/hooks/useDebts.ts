
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { DebtDataService, DebtData, DebtFormData } from '@/services/debtService';

export const useDebts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: debts = [], isLoading } = useQuery({
    queryKey: ['debts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return await DebtDataService.getUserDebts(user.id);
    },
    enabled: !!user,
  });

  const addDebtMutation = useMutation({
    mutationFn: async (formData: DebtFormData) => {
      if (!user) throw new Error('Usuário não autenticado');
      const debtData = DebtDataService.formToDebtData(formData, user.id);
      return await DebtDataService.createDebt(debtData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast({ title: 'Dívida cadastrada com sucesso!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao cadastrar dívida', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const updateDebtMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: DebtFormData }) => {
      if (!user) throw new Error('Usuário não autenticado');
      const debtData = DebtDataService.formToDebtData(formData, user.id);
      return await DebtDataService.updateDebt(id, debtData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast({ title: 'Dívida atualizada com sucesso!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao atualizar dívida', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const deleteDebtMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      return await DebtDataService.deleteDebt(id, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast({ title: 'Dívida removida com sucesso!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Erro ao remover dívida', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const totalDebts = debts.reduce((sum, debt) => sum + debt.remaining_balance, 0);
  const totalInterest = debts.reduce((sum, debt) => sum + debt.total_interest_amount, 0);

  return {
    debts,
    isLoading,
    totalDebts,
    totalInterest,
    addDebt: addDebtMutation.mutate,
    updateDebt: updateDebtMutation.mutate,
    deleteDebt: deleteDebtMutation.mutate,
    isAddingDebt: addDebtMutation.isPending,
    isUpdatingDebt: updateDebtMutation.isPending,
    isDeletingDebt: deleteDebtMutation.isPending,
  };
};
