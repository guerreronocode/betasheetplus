import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, CheckCircle, DollarSign, Wallet, CalendarDays } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';
import { formatCurrency } from '@/utils/formatters';
import { Layout } from '@/components/Layout';

const GoalsDashboard = () => {
  const { goals, isLoading } = useGoals();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Estatísticas das metas
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.completed || (g.current_amount || 0) >= g.target_amount).length;
  const totalTargetValue = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentValue = goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
  const totalProgress = totalTargetValue > 0 ? (totalCurrentValue / totalTargetValue) * 100 : 0;
  const totalRemaining = totalTargetValue - totalCurrentValue;

  return (
    <Layout>
      <div className="bg-fnb-cream">      
        <main className="w-full px-4 py-4">
          <div className="space-y-6">
        {/* Header com estatísticas principais */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Dashboard de Metas</h1>
          <p className="text-sm text-muted-foreground mb-4">Acompanhe o progresso dos seus objetivos financeiros</p>
        </div>

        {/* Estatísticas em texto com ícones */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total de Metas</p>
              <p className="text-sm font-semibold">{totalGoals}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Concluídas</p>
              <p className="text-sm font-semibold">{completedGoals}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Progresso</p>
              <p className="text-sm font-semibold">{totalProgress.toFixed(1)}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Valor Total</p>
              <p className="text-sm font-semibold">{formatCurrency(totalTargetValue)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground">Arrecadado</p>
              <p className="text-sm font-semibold">{formatCurrency(totalCurrentValue)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">Restante</p>
              <p className="text-sm font-semibold">{formatCurrency(Math.max(0, totalRemaining))}</p>
            </div>
          </div>
        </div>

        {/* Lista de metas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-4 h-4" />
              Suas Metas Financeiras
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length > 0 ? (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {goals.map((goal) => {
                    const progress = Math.min(((goal.current_amount || 0) / goal.target_amount) * 100, 100);
                    const remaining = Math.max(goal.target_amount - (goal.current_amount || 0), 0);
                    const remainingProgress = 100 - progress;

                    return (
                      <div key={goal.id} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {/* Título da meta */}
                          <div className="w-48 flex-shrink-0">
                            <h3 className="font-medium text-base">{goal.title}</h3>
                          </div>
                          
                          {/* Barra de progresso */}
                          <div className="flex-1">
                            <div className="flex rounded-lg overflow-hidden h-8 border">
                              {/* Parte verde - Valor alcançado */}
                              <div 
                                className="bg-green-500 flex items-center justify-center text-xs font-medium text-white px-2"
                                style={{ width: `${progress}%` }}
                              >
                                {progress > 0 && (
                                  <span className="truncate">
                                    {formatCurrency(goal.current_amount || 0)} ({progress.toFixed(0)}%)
                                  </span>
                                )}
                              </div>
                              
                              {/* Parte vermelha - Valor restante */}
                              <div 
                                className="bg-red-500 flex items-center justify-center text-xs font-medium text-white px-2"
                                style={{ width: `${remainingProgress}%` }}
                              >
                                {remainingProgress > 0 && (
                                  <span className="truncate">
                                    {formatCurrency(remaining)} ({remainingProgress.toFixed(0)}%)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Valor total da meta */}
                          <div className="w-32 flex-shrink-0 text-right">
                            <span className="font-semibold text-base">
                              {formatCurrency(goal.target_amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-medium mb-1">Nenhuma meta encontrada</h3>
                <p className="text-sm text-muted-foreground">
                  Crie sua primeira meta financeira para começar a acompanhar seus objetivos!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default GoalsDashboard;