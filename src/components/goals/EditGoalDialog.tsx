import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import CurrencyInput from '@/components/shared/CurrencyInput';
import { Goal, useGoals, UpdateGoalData } from '@/hooks/useGoals';
import { Save } from 'lucide-react';


interface EditGoalDialogProps {
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditGoalDialog = ({ goal, open, onOpenChange }: EditGoalDialogProps) => {
  const { updateGoal, isUpdatingGoal } = useGoals();
  const [formData, setFormData] = useState<UpdateGoalData>({
    id: goal.id,
    title: goal.title,
    target_amount: goal.target_amount,
    current_amount: goal.current_amount,
    deadline: goal.deadline || '',
    color: goal.color,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        id: goal.id,
        title: goal.title,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount,
        deadline: goal.deadline || '',
        color: goal.color,
      });
    }
  }, [goal, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.target_amount) {
      return;
    }

    updateGoal({
      ...formData,
      deadline: formData.deadline || undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-target">Valor da Meta</Label>
              <CurrencyInput
                value={formData.target_amount || 0}
                onChange={(e) => setFormData({ ...formData, target_amount: parseFloat(e.target.value) || 0 })}
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-current">Valor Atual</Label>
              <CurrencyInput
                value={formData.current_amount || 0}
                onChange={(e) => setFormData({ ...formData, current_amount: parseFloat(e.target.value) || 0 })}
                placeholder="0,00"
              />
            </div>
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
              disabled={isUpdatingGoal || !formData.title || !formData.target_amount}
            >
              <Save className="w-4 h-4 mr-2" />
              {isUpdatingGoal ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};