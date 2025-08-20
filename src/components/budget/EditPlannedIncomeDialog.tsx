import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import HierarchicalCategorySelector from '@/components/shared/HierarchicalCategorySelector';
import { usePlannedIncome, PlannedIncome, PlannedIncomeInput } from '@/hooks/usePlannedIncome';

interface EditPlannedIncomeDialogProps {
  income: PlannedIncome;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditPlannedIncomeFormData {
  month: string;
  category: string;
  planned_amount: string | number;
  description?: string;
  is_recurring?: boolean;
  recurring_start_month?: string;
  recurring_end_month?: string;
}

export const EditPlannedIncomeDialog: React.FC<EditPlannedIncomeDialogProps> = ({ 
  income, 
  open, 
  onOpenChange 
}) => {
  const { updatePlannedIncome, isUpdating } = usePlannedIncome();

  // Inicializar form data baseado no income
  const initializeFormData = (): EditPlannedIncomeFormData => {
    if (!income) return {
      month: new Date().toISOString().slice(0, 10),
      category: '',
      planned_amount: '',
      description: '',
      is_recurring: false,
      recurring_start_month: new Date().toISOString().slice(0, 10),
      recurring_end_month: 'no_end',
    };

    const currentDate = new Date().toISOString().slice(0, 10);
    return {
      month: income.month || currentDate,
      category: income.category || '',
      planned_amount: income.planned_amount?.toString() || '',
      description: income.description || '',
      is_recurring: income.is_recurring || false,
      recurring_start_month: income.recurring_start_month || currentDate,
      recurring_end_month: income.recurring_end_month || 'no_end',
    };
  };

  const [formData, setFormData] = useState<EditPlannedIncomeFormData>(() => initializeFormData());

  useEffect(() => {
    if (income && open) {
      const currentDate = new Date().toISOString().slice(0, 10);
      const newFormData: EditPlannedIncomeFormData = {
        month: income.month || currentDate,
        category: income.category || '',
        planned_amount: income.planned_amount?.toString() || '',
        description: income.description || '',
        is_recurring: income.is_recurring || false,
        recurring_start_month: income.recurring_start_month || currentDate,
        recurring_end_month: income.recurring_end_month || 'no_end',
      };
      
      setFormData(newFormData);
    }
  }, [income, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = typeof formData.planned_amount === 'string' 
      ? parseFloat(formData.planned_amount) 
      : formData.planned_amount;
    
    if (!formData.category || !formData.planned_amount || amount <= 0) {
      return;
    }
    
    const dataToUpdate = formData.is_recurring 
      ? { ...formData, planned_amount: amount, month: formData.recurring_start_month || formData.month, recurring_end_month: formData.recurring_end_month === 'no_end' ? undefined : formData.recurring_end_month }
      : { ...formData, planned_amount: amount, recurring_start_month: undefined, recurring_end_month: undefined };
    
    updatePlannedIncome({ id: income.id, updates: dataToUpdate });
    onOpenChange(false);
  };

  const handleInputChange = (field: keyof EditPlannedIncomeFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const monthOptions = Array.from({ length: 24 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i - 6); // Mostrar 6 meses atrás até 18 à frente
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return {
      value: firstDay.toISOString().slice(0, 10),
      label: firstDay.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Receita</DialogTitle>
          <DialogDescription>
            Modifique os dados da receita selecionada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <HierarchicalCategorySelector
              value={formData.category}
              onChange={(value) => handleInputChange('category', value)}
              placeholder="Selecione a categoria"
              categoryType="income"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="planned_amount">Valor</Label>
            <Input
              id="planned_amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.planned_amount}
              onChange={(e) => handleInputChange('planned_amount', e.target.value)}
              placeholder="0,00"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_recurring}
              onCheckedChange={(checked) => handleInputChange('is_recurring', checked)}
            />
            <Label htmlFor="is_recurring">Receita recorrente (fixa)</Label>
          </div>

          {!formData.is_recurring && (
            <div className="space-y-2">
              <Label htmlFor="month">Mês específico</Label>
              <Select 
                value={formData.month} 
                onValueChange={(value) => handleInputChange('month', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.is_recurring && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recurring_start_month">Início</Label>
                <Select 
                  value={formData.recurring_start_month} 
                  onValueChange={(value) => handleInputChange('recurring_start_month', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mês de início" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurring_end_month">Fim (opcional)</Label>
                <Select 
                  value={formData.recurring_end_month} 
                  onValueChange={(value) => handleInputChange('recurring_end_month', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sem fim" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_end">Sem fim</SelectItem>
                    {monthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Ex: Salário empresa X, freelance..."
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
            <Button 
              type="submit" 
              disabled={isUpdating || !formData.category || !formData.planned_amount || (typeof formData.planned_amount === 'string' ? parseFloat(formData.planned_amount) : formData.planned_amount) <= 0}
            >
              {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};