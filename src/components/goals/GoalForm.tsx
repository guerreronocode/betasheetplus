import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CurrencyInput from '@/components/shared/CurrencyInput';
import { Checkbox } from '@/components/ui/checkbox';
import { useGoals, CreateGoalData } from '@/hooks/useGoals';
import { useBankAccountVaults } from '@/hooks/useBankAccountVaults';
import { useInvestments } from '@/hooks/useInvestments';
import { Target, Plus, Loader2 } from 'lucide-react';

const GoalForm: React.FC = () => {
  const { createGoal, isCreatingGoal } = useGoals();
  const { vaults } = useBankAccountVaults();
  const { investments } = useInvestments();
  
  const [formData, setFormData] = useState<CreateGoalData>({
    title: '',
    target_amount: 0,
    deadline: '',
    color: 'blue',
    linkedVaults: [],
    linkedInvestments: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || formData.target_amount <= 0) {
      return;
    }

    // Verificar se pelo menos um cofre ou investimento foi selecionado
    if ((!formData.linkedVaults || formData.linkedVaults.length === 0) && 
        (!formData.linkedInvestments || formData.linkedInvestments.length === 0)) {
      alert('Selecione pelo menos um cofre ou investimento para vincular à meta.');
      return;
    }

    createGoal(formData);
    
    // Reset form
    setFormData({
      title: '',
      target_amount: 0,
      deadline: '',
      color: 'blue',
      linkedVaults: [],
      linkedInvestments: [],
    });
  };

  const handleVaultToggle = (vaultId: string) => {
    setFormData(prev => ({
      ...prev,
      linkedVaults: prev.linkedVaults?.includes(vaultId)
        ? prev.linkedVaults.filter(id => id !== vaultId)
        : [...(prev.linkedVaults || []), vaultId]
    }));
  };

  const handleInvestmentToggle = (investmentId: string) => {
    setFormData(prev => ({
      ...prev,
      linkedInvestments: prev.linkedInvestments?.includes(investmentId)
        ? prev.linkedInvestments.filter(id => id !== investmentId)
        : [...(prev.linkedInvestments || []), investmentId]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Nova Meta Financeira
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título da Meta</Label>
              <Input
                id="title"
                placeholder="Ex: Casa própria, Viagem, Reserva de emergência"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="color">Cor</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="target_amount">Valor da Meta</Label>
            <CurrencyInput
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: parseFloat(e.target.value) || 0 })}
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="deadline">Prazo (opcional)</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Cofres Vinculados</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {vaults.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum cofre disponível</p>
              ) : (
                vaults.map((vault) => (
                  <div key={vault.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`vault-${vault.id}`}
                      checked={formData.linkedVaults?.includes(vault.id) || false}
                      onCheckedChange={() => handleVaultToggle(vault.id)}
                    />
                    <Label htmlFor={`vault-${vault.id}`} className="text-sm">
                      {vault.name} - {vault.reserved_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Investimentos Vinculados</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {investments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum investimento disponível</p>
              ) : (
                investments.map((investment) => (
                  <div key={investment.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`investment-${investment.id}`}
                      checked={formData.linkedInvestments?.includes(investment.id) || false}
                      onCheckedChange={() => handleInvestmentToggle(investment.id)}
                    />
                    <Label htmlFor={`investment-${investment.id}`} className="text-sm">
                      {investment.name} - {investment.current_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={
              isCreatingGoal || 
              !formData.title || 
              formData.target_amount <= 0 ||
              ((!formData.linkedVaults || formData.linkedVaults.length === 0) && 
               (!formData.linkedInvestments || formData.linkedInvestments.length === 0))
            }
          >
            {isCreatingGoal ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando Meta...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Criar Meta
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GoalForm;