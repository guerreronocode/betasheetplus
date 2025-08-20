import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CurrencyInput from '@/components/shared/CurrencyInput';
import { Checkbox } from '@/components/ui/checkbox';
import { useGoals, Goal, UpdateGoalData } from '@/hooks/useGoals';
import { useGoalLinks } from '@/hooks/useGoalLinks';
import { useBankAccountVaults } from '@/hooks/useBankAccountVaults';
import { useInvestments } from '@/hooks/useInvestments';
import { Save, Loader2 } from 'lucide-react';

interface EditGoalDialogProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditGoalDialog: React.FC<EditGoalDialogProps> = ({ goal, open, onOpenChange }) => {
  const { updateGoal, isUpdatingGoal } = useGoals();
  const { goalLinks } = useGoalLinks(goal?.id);
  const { vaults } = useBankAccountVaults();
  const { investments } = useInvestments();
  
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    target_amount: goal?.target_amount || 0,
    deadline: goal?.deadline || '',
    color: goal?.color || 'blue',
    linkedVaults: [] as string[],
    linkedInvestments: [] as string[],
  });

  // Atualizar formData quando goal mudar ou goalLinks carregarem
  useEffect(() => {
    if (goal && open) {
      const linkedVaults = goalLinks
        .filter(link => link.link_type === 'vault' && link.vault_id)
        .map(link => link.vault_id!);
        
      const linkedInvestments = goalLinks
        .filter(link => link.link_type === 'investment' && link.investment_id)
        .map(link => link.investment_id!);
        
      setFormData({
        title: goal.title,
        target_amount: goal.target_amount,
        deadline: goal.deadline || '',
        color: goal.color,
        linkedVaults,
        linkedInvestments,
      });
    }
  }, [goal, open, goalLinks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goal || !formData.title || formData.target_amount <= 0) {
      return;
    }

    // Verificar se pelo menos um cofre ou investimento foi selecionado
    if ((!formData.linkedVaults || formData.linkedVaults.length === 0) && 
        (!formData.linkedInvestments || formData.linkedInvestments.length === 0)) {
      alert('Selecione pelo menos um cofre ou investimento para vincular à meta.');
      return;
    }

    updateGoal({
      id: goal.id,
      ...formData,
    });
    
    onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Meta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-title">Título da Meta</Label>
              <Input
                id="edit-title"
                placeholder="Ex: Casa própria, Viagem"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-color">Cor</Label>
              <Input
                id="edit-color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-target">Valor da Meta</Label>
            <CurrencyInput
              value={formData.target_amount || 0}
              onChange={(e) => setFormData({ ...formData, target_amount: parseFloat(e.target.value) || 0 })}
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-deadline">Prazo (opcional)</Label>
            <Input
              id="edit-deadline"
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

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={
                isUpdatingGoal || 
                !formData.title || 
                formData.target_amount <= 0 ||
                ((!formData.linkedVaults || formData.linkedVaults.length === 0) && 
                 (!formData.linkedInvestments || formData.linkedInvestments.length === 0))
              }
            >
              {isUpdatingGoal ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGoalDialog;