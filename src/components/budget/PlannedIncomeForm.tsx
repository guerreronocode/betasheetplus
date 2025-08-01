import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlannedIncome, PlannedIncomeInput } from '@/hooks/usePlannedIncome';

interface PlannedIncomeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlannedIncomeForm: React.FC<PlannedIncomeFormProps> = ({ open, onOpenChange }) => {
  const { createPlannedIncome, isCreating } = usePlannedIncome();
  
  // Categorias de receita padrão
  const incomeCategories = [
    { value: 'salario', label: 'Salário' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'bonus', label: 'Bônus' },
    { value: 'investimentos', label: 'Investimentos' },
    { value: 'aluguel', label: 'Aluguel Recebido' },
    { value: 'pensao', label: 'Pensão' },
    { value: 'vendas', label: 'Vendas' },
    { value: 'dividendos', label: 'Dividendos' },
    { value: 'outros', label: 'Outros' },
  ];

  const [formData, setFormData] = useState<PlannedIncomeInput>({
    month: new Date().toISOString().slice(0, 7) + '-01', // Primeiro dia do mês atual
    category: '',
    planned_amount: 0,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createPlannedIncome(formData);
    
    // Reset form
    setFormData({
      month: new Date().toISOString().slice(0, 7) + '-01',
      category: '',
      planned_amount: 0,
      description: '',
    });
    
    onOpenChange(false);
  };

  const handleInputChange = (field: keyof PlannedIncomeInput, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gerar opções de meses (próximos 12 meses)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
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
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {incomeCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="planned_amount">Valor Previsto</Label>
            <Input
              id="planned_amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.planned_amount}
              onChange={(e) => handleInputChange('planned_amount', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              required
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
              disabled={isCreating || !formData.category || formData.planned_amount <= 0}
            >
              {isCreating ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};