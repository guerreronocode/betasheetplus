
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMonthlyObjectives } from '@/hooks/useMonthlyObjectives';
import { useCategoryRanking } from '@/hooks/useCategoryRanking';

interface CreateObjectiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateObjectiveDialog = ({ open, onOpenChange }: CreateObjectiveDialogProps) => {
  const { createObjective, isCreating } = useMonthlyObjectives();
  const { categoryRanking } = useCategoryRanking();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objective_type: 'custom' as 'custom' | 'suggested',
    calculation_type: 'value' as 'value' | 'percentage',
    target_value: '',
    target_percentage: '',
    category: '',
    related_data: {}
  });

  const [selectedTemplate, setSelectedTemplate] = useState('');

  const objectiveTemplates = [
    {
      id: 'save_amount',
      title: 'Economizar valor específico',
      description: 'Meta de economia mensal',
      calculation_type: 'value',
      related_data: { type: 'save_amount' }
    },
    {
      id: 'invest_percentage',
      title: 'Investir % da renda',
      description: 'Percentual da renda para investimentos',
      calculation_type: 'percentage',
      related_data: { type: 'invest_percentage' }
    },
    {
      id: 'reduce_category',
      title: 'Reduzir gastos em categoria',
      description: 'Diminuir gastos em categoria específica comparado ao mês anterior',
      calculation_type: 'percentage',
      related_data: { type: 'reduce_category_spending' }
    }
  ];

  const handleTemplateSelect = (templateId: string) => {
    const template = objectiveTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setFormData(prev => ({
        ...prev,
        title: template.title,
        description: template.description,
        calculation_type: template.calculation_type as 'value' | 'percentage',
        related_data: template.related_data
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const objectiveData = {
      title: formData.title,
      description: formData.description || undefined,
      objective_type: formData.objective_type,
      calculation_type: formData.calculation_type,
      target_value: formData.calculation_type === 'value' ? parseFloat(formData.target_value) : undefined,
      target_percentage: formData.calculation_type === 'percentage' ? parseFloat(formData.target_percentage) : undefined,
      category: formData.category || undefined,
      related_data: {
        ...formData.related_data,
        ...(selectedTemplate === 'reduce_category' && formData.category ? { category: formData.category } : {})
      },
      month: new Date().toISOString().split('T')[0].slice(0, 7) + '-01',
      is_active: true
    };

    createObjective(objectiveData);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      objective_type: 'custom',
      calculation_type: 'value',
      target_value: '',
      target_percentage: '',
      category: '',
      related_data: {}
    });
    setSelectedTemplate('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Objetivo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Modelo de Objetivo</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um modelo ou crie personalizado" />
              </SelectTrigger>
              <SelectContent>
                {objectiveTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Economizar R$ 500 este mês"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detalhes sobre o objetivo..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Cálculo</Label>
              <Select
                value={formData.calculation_type}
                onValueChange={(value: 'value' | 'percentage') => 
                  setFormData(prev => ({ ...prev, calculation_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="value">Valor (R$)</SelectItem>
                  <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {formData.calculation_type === 'value' ? (
                <>
                  <Label htmlFor="target_value">Meta (R$) *</Label>
                  <Input
                    id="target_value"
                    type="number"
                    step="0.01"
                    value={formData.target_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
                    placeholder="500.00"
                    required
                  />
                </>
              ) : (
                <>
                  <Label htmlFor="target_percentage">Meta (%) *</Label>
                  <Input
                    id="target_percentage"
                    type="number"
                    step="0.1"
                    value={formData.target_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_percentage: e.target.value }))}
                    placeholder="20.0"
                    required
                  />
                </>
              )}
            </div>
          </div>

          {selectedTemplate === 'reduce_category' && (
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoryRanking.slice(0, 10).map(category => (
                    <SelectItem key={category.category} value={category.category}>
                      {category.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
              disabled={isCreating}
            >
              {isCreating ? 'Criando...' : 'Criar Objetivo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateObjectiveDialog;
