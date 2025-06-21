
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useBudgets, Budget } from '@/hooks/useBudgets';
import { useIntegratedCategories } from '@/hooks/useIntegratedCategories';
import CategorySelector from './shared/CategorySelector';

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: 'monthly' | 'yearly';
  existingBudget?: Budget;
}

interface CategoryBudget {
  category: string;
  planned_amount: number;
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  open,
  onOpenChange,
  period,
  existingBudget
}) => {
  const { createBudget, updateBudget, isCreating, isUpdating } = useBudgets();
  const { expenseCategories } = useIntegratedCategories();

  const [totalAmount, setTotalAmount] = useState<number | undefined>();
  const [useCategories, setUseCategories] = useState(false);
  const [categories, setCategories] = useState<CategoryBudget[]>([]);

  const getCurrentPeriodDate = () => {
    const now = new Date();
    if (period === 'monthly') {
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    } else {
      return new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    }
  };

  useEffect(() => {
    if (existingBudget) {
      setTotalAmount(existingBudget.total_amount || undefined);
      if (existingBudget.budget_categories && existingBudget.budget_categories.length > 0) {
        setUseCategories(true);
        setCategories(
          existingBudget.budget_categories.map(cat => ({
            category: cat.category,
            planned_amount: cat.planned_amount
          }))
        );
      } else {
        setUseCategories(false);
        setCategories([]);
      }
    } else {
      setTotalAmount(undefined);
      setUseCategories(false);
      setCategories([]);
    }
  }, [existingBudget, open]);

  const handleAddCategory = () => {
    setCategories([...categories, { category: '', planned_amount: 0 }]);
  };

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (index: number, field: keyof CategoryBudget, value: string | number) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const budgetData = {
      period_type: period,
      period_date: getCurrentPeriodDate(),
      total_amount: useCategories ? undefined : totalAmount,
      categories: useCategories ? categories.filter(cat => cat.category && cat.planned_amount > 0) : undefined
    };

    if (existingBudget) {
      updateBudget({
        id: existingBudget.id,
        updates: {
          total_amount: budgetData.total_amount
        },
        categories: budgetData.categories
      });
    } else {
      createBudget(budgetData);
    }

    onOpenChange(false);
  };

  const categoryOptions = expenseCategories.map(cat => ({
    value: cat.value,
    label: cat.label
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingBudget ? 'Editar' : 'Criar'} Orçamento {period === 'monthly' ? 'Mensal' : 'Anual'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useCategories"
                checked={useCategories}
                onChange={(e) => setUseCategories(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="useCategories">
                Dividir orçamento por categorias
              </Label>
            </div>

            {!useCategories ? (
              <div>
                <Label htmlFor="totalAmount">Valor Total do Orçamento</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={totalAmount || ''}
                  onChange={(e) => setTotalAmount(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 5000.00"
                  required
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Orçamento por Categoria</Label>
                  <Button
                    type="button"
                    onClick={handleAddCategory}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Categoria
                  </Button>
                </div>

                {categories.map((category, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <Label>Categoria</Label>
                        <CategorySelector
                          value={category.category}
                          options={categoryOptions}
                          onChange={(value) => handleCategoryChange(index, 'category', value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Valor Planejado</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={category.planned_amount || ''}
                          onChange={(e) => handleCategoryChange(index, 'planned_amount', Number(e.target.value))}
                          placeholder="Ex: 1500.00"
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleRemoveCategory(index)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {categories.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    Clique em "Adicionar Categoria" para começar
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || isUpdating}
            >
              {existingBudget ? 'Atualizar' : 'Criar'} Orçamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetForm;
