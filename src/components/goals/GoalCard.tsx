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
          {/* Progresso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <div className="relative">
              <Progress value={progress} className="h-3" />
              <div 
                className="absolute top-0 left-0 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: goal.color }}
              />
            </div>
          </div>

          {/* Valores */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Valor atual:</span>
              <span className="font-medium">{formatCurrency(goal.current_amount || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Meta:</span>
              <span className="font-medium">{formatCurrency(goal.target_amount)}</span>
            </div>
            {!isCompleted && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Restante:</span>
                <span className="font-medium text-orange-600">{formatCurrency(remaining)}</span>
              </div>
            )}
          </div>

          {/* Prazo */}
          {goal.deadline && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Prazo: {format(new Date(goal.deadline), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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