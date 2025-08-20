import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';
import HierarchicalCategorySelector from '@/components/shared/HierarchicalCategorySelector';
import CategoryManager from '../CategoryManager';
import { usePlannedIncome, PlannedIncomeInput } from '@/hooks/usePlannedIncome';

interface PlannedIncomeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PlannedIncomeFormData {
  month: string;
  category: string;
  planned_amount: string | number;
  description?: string;
  is_recurring?: boolean;
  recurring_start_month?: string;
  recurring_end_month?: string;
}

export const PlannedIncomeForm: React.FC<PlannedIncomeFormProps> = ({ open, onOpenChange }) => {
  const { createPlannedIncome, isCreating } = usePlannedIncome();
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  

  const [formData, setFormData] = useState<PlannedIncomeFormData>({
    month: new Date().toISOString().slice(0, 10), // Data atual
    category: '',
    planned_amount: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = typeof formData.planned_amount === 'string' 
      ? parseFloat(formData.planned_amount) 
      : formData.planned_amount;
    
    if (!formData.category || !formData.planned_amount || amount <= 0) {
      return;
    }
    
    createPlannedIncome({
      ...formData,
      planned_amount: amount
    });
    
    // Reset form
    setFormData({
      month: new Date().toISOString().slice(0, 10),
      category: '',
      planned_amount: '',
      description: '',
    });
    
    onOpenChange(false);
  };

  const handleInputChange = (field: keyof PlannedIncomeFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gerar opções de meses (próximos 12 meses)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    return {
      value: firstDay.toISOString().slice(0, 10),
      label: firstDay.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Receita Prevista</DialogTitle>
          <DialogDescription>
            Cadastre suas receitas previstas para gerar projeções mais precisas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="month">Mês</Label>
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

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <div className="flex gap-2">
            <div className="flex-1">
              <HierarchicalCategorySelector
                value={formData.category}
                onChange={(value) => handleInputChange('category', value)}
                placeholder="Selecione a categoria"
                categoryType="income"
                required
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCategoryManager(true)}
              className="flex-shrink-0"
              title="Configurar categorias"
            >
              <Settings className="h-4 w-4" />
            </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="planned_amount">Valor Previsto</Label>
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

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Ex: Salário, freelance, etc."
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
              disabled={isCreating || !formData.category || !formData.planned_amount || (typeof formData.planned_amount === 'string' ? parseFloat(formData.planned_amount) : formData.planned_amount) <= 0}
            >
              {isCreating ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>

        {/* Dialog para gerenciar categorias */}
        <Dialog open={showCategoryManager} onOpenChange={setShowCategoryManager}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <CategoryManager categoryType="income" />
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};