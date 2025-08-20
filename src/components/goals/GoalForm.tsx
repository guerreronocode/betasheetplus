import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import CurrencyInput from '@/components/shared/CurrencyInput';
import { useGoals, CreateGoalData } from '@/hooks/useGoals';
import { Target, Plus } from 'lucide-react';


export const GoalForm = () => {
  const { createGoal, isCreatingGoal } = useGoals();
  const [formData, setFormData] = useState<CreateGoalData>({
    title: '',
    target_amount: 0,
    current_amount: 0,
    deadline: '',
    color: '#3B82F6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.target_amount) {
      return;
    }

    createGoal({
      ...formData,
      deadline: formData.deadline || undefined,
    });

    // Reset form
    setFormData({
      title: '',
      target_amount: 0,
      current_amount: 0,
      deadline: '',
      color: '#3B82F6',
    });
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_amount">Valor da Meta</Label>
              <CurrencyInput
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: parseFloat(e.target.value) || 0 })}
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <Label htmlFor="current_amount">Valor Atual (opcional)</Label>
              <CurrencyInput
                value={formData.current_amount || 0}
                onChange={(e) => setFormData({ ...formData, current_amount: parseFloat(e.target.value) || 0 })}
                placeholder="0,00"
              />
            </div>
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

          <Button
            type="submit"
            disabled={isCreatingGoal || !formData.title || !formData.target_amount}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreatingGoal ? 'Criando...' : 'Criar Meta'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};