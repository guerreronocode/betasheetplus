import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';
import { formatCurrency } from '@/utils/formatters';

export const GoalsSummary = () => {
  const { goals, isLoading } = useGoals();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Resumo das Metas
          </CardTitle>
        </CardHeader>
        <CardContent className="animate-pulse">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estatísticas das metas
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.completed || (g.current_amount || 0) >= g.target_amount).length;
  const totalTargetValue = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentValue = goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
  const totalProgress = totalTargetValue > 0 ? (totalCurrentValue / totalTargetValue) * 100 : 0;

  // Próximas metas a serem alcançadas
  const activeGoals = goals
    .filter(g => !g.completed && (g.current_amount || 0) < g.target_amount)
    .sort((a, b) => {
      const progressA = (a.current_amount || 0) / a.target_amount;
      const progressB = (b.current_amount || 0) / b.target_amount;
      return progressB - progressA;
    })
    .slice(0, 3);

  if (totalGoals === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Resumo das Metas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma meta cadastrada. Vá para a aba "Metas" para criar sua primeira meta!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Resumo das Metas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{totalGoals}</p>
            </div>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{completedGoals}</p>
            </div>
            <p className="text-xs text-muted-foreground">Concluídas</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <p className="text-2xl font-bold text-orange-600">{totalProgress.toFixed(0)}%</p>
            </div>
            <p className="text-xs text-muted-foreground">Progresso</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-purple-600" />
              <p className="text-lg font-bold text-purple-600">{formatCurrency(totalTargetValue)}</p>
            </div>
            <p className="text-xs text-muted-foreground">Valor Total</p>
          </div>
        </div>

        {/* Progresso Geral */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Progresso Geral</p>
            <Badge variant={totalProgress >= 50 ? "default" : "secondary"}>
              {formatCurrency(totalCurrentValue)} / {formatCurrency(totalTargetValue)}
            </Badge>
          </div>
          <Progress value={Math.min(totalProgress, 100)} className="h-2" />
        </div>

        {/* Próximas Metas */}
        {activeGoals.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Metas em Progresso</h4>
            <div className="space-y-3">
              {activeGoals.map((goal) => {
                const progress = ((goal.current_amount || 0) / goal.target_amount) * 100;
                return (
                  <div key={goal.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium truncate">{goal.title}</p>
                      <Badge variant="outline" style={{ borderColor: goal.color, color: goal.color }}>
                        {progress.toFixed(0)}%
                      </Badge>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-1.5" />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(goal.current_amount || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(goal.target_amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};