import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CurrencyInput from '@/components/shared/CurrencyInput';
import { useGoals, CreateGoalData } from '@/hooks/useGoals';
import { Target, Plus } from 'lucide-react';

const GOAL_COLORS = [
  { value: 'blue', label: '🔵 Azul', class: 'bg-blue-500' },
  { value: 'green', label: '🟢 Verde', class: 'bg-green-500' },
  { value: 'purple', label: '🟣 Roxo', class: 'bg-purple-500' },
  { value: 'orange', label: '🟠 Laranja', class: 'bg-orange-500' },
  { value: 'red', label: '🔴 Vermelho', class: 'bg-red-500' },
  { value: 'yellow', label: '🟡 Amarelo', class: 'bg-yellow-500' },
  { value: 'pink', label: '🩷 Rosa', class: 'bg-pink-500' },
  { value: 'teal', label: '🩵 Azul claro', class: 'bg-teal-500' },
];

export const GoalForm = () => {
  const { createGoal, isCreatingGoal } = useGoals();
  const [formData, setFormData] = useState<CreateGoalData>({
    title: '',
    target_amount: 0,
    current_amount: 0,
    deadline: '',
    color: 'blue',
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
      color: 'blue',
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
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${color.class}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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