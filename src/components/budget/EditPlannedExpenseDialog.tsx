import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import HierarchicalCategorySelector from '@/components/shared/HierarchicalCategorySelector';
import { usePlannedExpenses, PlannedExpense } from '@/hooks/usePlannedExpenses';

interface EditPlannedExpenseDialogProps {
  expense: PlannedExpense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPlannedExpenseDialog: React.FC<EditPlannedExpenseDialogProps> = ({
  expense,
  open,
  onOpenChange,
}) => {
  const { updatePlannedExpense, isUpdating } = usePlannedExpenses();
  
  // Inicializar form data baseado no expense
  const initializeFormData = () => {
    if (!expense) return {
      category: '',
      planned_amount: '',
      month: new Date().toISOString().slice(0, 10),
      description: '',
      is_recurring: false,
      recurring_start_month: new Date().toISOString().slice(0, 10),
      recurring_end_month: '',
    };

    const currentDate = new Date().toISOString().slice(0, 10);
    return {
      category: expense.category || '',
      planned_amount: expense.planned_amount?.toString() || '',
      month: expense.month?.slice(0, 10) || currentDate,
      description: expense.description || '',
      is_recurring: expense.is_recurring || false,
      recurring_start_month: expense.recurring_start_month?.slice(0, 10) || currentDate,
      recurring_end_month: expense.recurring_end_month?.slice(0, 10) || '',
    };
  };

  const [formData, setFormData] = useState(() => initializeFormData());

  // Atualizar form quando expense mudar
  useEffect(() => {
    console.log('🔄 EditPlannedExpenseDialog - useEffect chamado:', { expense: !!expense, open });
    
    if (expense && open) {
      console.log('📋 EditPlannedExpenseDialog - dados do expense:', {
        category: expense.category,
        planned_amount: expense.planned_amount,
        month: expense.month,
        description: expense.description,
        is_recurring: expense.is_recurring,
        recurring_start_month: expense.recurring_start_month,
        recurring_end_month: expense.recurring_end_month
      });

      const currentDate = new Date().toISOString().slice(0, 10);
      const newFormData = {
        category: expense.category || '',
        planned_amount: expense.planned_amount?.toString() || '',
        month: expense.month?.slice(0, 10) || currentDate,
        description: expense.description || '',
        is_recurring: expense.is_recurring || false,
        recurring_start_month: expense.recurring_start_month?.slice(0, 10) || currentDate,
        recurring_end_month: expense.recurring_end_month?.slice(0, 10) || '',
      };
      
      console.log('✅ EditPlannedExpenseDialog - definindo formData:', newFormData);
      setFormData(newFormData);
      
      // Forçar re-render após um pequeno delay para garantir que as categorias foram carregadas
      setTimeout(() => {
        console.log('🔄 EditPlannedExpenseDialog - re-verificando formData após delay:', {
          currentFormData: newFormData,
          categorySet: newFormData.category
        });
      }, 100);
    }
  }, [expense, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.planned_amount);
    
    if (!formData.category || !formData.planned_amount || amount <= 0) {
      return;
    }

    const expenseData = {
      id: expense.id,
      category: formData.category,
      planned_amount: amount,
      month: formData.is_recurring ? formData.recurring_start_month : formData.month,
      description: formData.description || undefined,
      is_recurring: formData.is_recurring,
      recurring_start_month: formData.is_recurring ? formData.recurring_start_month : undefined,
      recurring_end_month: formData.is_recurring && formData.recurring_end_month 
        ? formData.recurring_end_month 
        : undefined,
    };

    updatePlannedExpense(expenseData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Despesa Planejada</DialogTitle>
          <DialogDescription>
            Modifique os dados da despesa selecionada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <HierarchicalCategorySelector
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value })}
              placeholder="Selecione uma categoria"
              categoryType="expense"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="planned_amount">Valor</Label>
            <Input
              id="planned_amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.planned_amount}
              onChange={(e) => setFormData({ ...formData, planned_amount: e.target.value })}
              placeholder="0,00"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, is_recurring: checked })
              }
            />
            <Label htmlFor="is_recurring">Despesa recorrente</Label>
          </div>

          {formData.is_recurring ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recurring_start_month">Início</Label>
                <Input
                  id="recurring_start_month"
                  type="date"
                  value={formData.recurring_start_month}
                  onChange={(e) => setFormData({ ...formData, recurring_start_month: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurring_end_month">Fim (opcional)</Label>
                <Input
                  id="recurring_end_month"
                  type="date"
                  value={formData.recurring_end_month}
                  onChange={(e) => setFormData({ ...formData, recurring_end_month: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="month">Mês</Label>
              <Input
                id="month"
                type="date"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva a despesa..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating || !formData.category || !formData.planned_amount || parseFloat(formData.planned_amount) <= 0}>
              {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};