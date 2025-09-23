import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Check, Calendar, Target, TrendingUp } from 'lucide-react';
import { Goal, useGoals } from '@/hooks/useGoals';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import EditGoalDialog from './EditGoalDialog';

interface GoalCardProps {
  goal: Goal;
}


export const GoalCard = ({ goal }: GoalCardProps) => {
  const { deleteGoal, updateGoal, isDeletingGoal } = useGoals();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const progress = Math.min(((goal.current_amount || 0) / goal.target_amount) * 100, 100);
  const remaining = Math.max(goal.target_amount - (goal.current_amount || 0), 0);
  const isCompleted = goal.completed || (goal.current_amount || 0) >= goal.target_amount;

  // Cálculos mensais
  const calculateMonthlyValues = () => {
    if (!goal.deadline || isCompleted) {
      return {
        monthlyTarget: 0,
        monthlyCollected: 0,
        monthlyRemaining: 0
      };
    }

    const today = new Date();
    const deadline = new Date(goal.deadline);
    const monthsRemaining = Math.max(1, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    
    const monthlyTarget = remaining / monthsRemaining;
    const monthlyCollected = 0; // Placeholder - seria calculado com base em transações do mês atual
    const monthlyRemaining = monthlyTarget - monthlyCollected;

    return {
      monthlyTarget,
      monthlyCollected,
      monthlyRemaining
    };
  };

  const { monthlyTarget, monthlyCollected, monthlyRemaining } = calculateMonthlyValues();

  const handleToggleComplete = () => {
    updateGoal({
      id: goal.id,
      completed: !goal.completed,
    });
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja remover esta meta?')) {
      deleteGoal(goal.id);
    }
  };

  return (
    <>
      <Card className={`relative transition-all duration-200 hover:shadow-lg border-l-4 ${isCompleted ? 'ring-2 ring-green-400' : ''}`} style={{ borderLeftColor: goal.color }}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5" />
              {goal.title}
              {isCompleted && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Check className="w-3 h-3 mr-1" />
                  Concluída
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleComplete}
                className="h-8 w-8 p-0"
                disabled={(goal.current_amount || 0) < goal.target_amount}
              >
                <Check className={`w-4 h-4 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeletingGoal}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Valores Principais */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="font-semibold">{formatCurrency(goal.target_amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Arrecadado</p>
              <p className="font-semibold text-green-600">{formatCurrency(goal.current_amount || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Restante</p>
              <p className="font-semibold text-orange-600">{formatCurrency(remaining)}</p>
            </div>
          </div>

          {/* Barra de Progresso Simples */}
          <div className="w-full">
            <Progress value={progress} className="h-2" />
          </div>

          {/* Valores Mensais */}
          {goal.deadline && !isCompleted && (
            <div className="grid grid-cols-3 gap-4 text-center pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Meta mensal</p>
                <p className="text-sm font-medium">{formatCurrency(monthlyTarget)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Arrecadado este mês</p>
                <p className="text-sm font-medium text-green-600">{formatCurrency(monthlyCollected)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Restante este mês</p>
                <p className="text-sm font-medium text-orange-600">{formatCurrency(monthlyRemaining)}</p>
              </div>
            </div>
          )}

          {/* Prazo */}
          {goal.deadline && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <Calendar className="w-3 h-3" />
              <span>
                Prazo: {format(new Date(goal.deadline), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <EditGoalDialog
        goal={goal}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
};