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
      <div className="bg-fnb-cream h-screen overflow-hidden">      
        {/* ScrollArea que engloba tudo */}
        <ScrollArea className="h-screen px-4">
          <div className="space-y-6 pb-4">
            {/* Título que desaparece no scroll */}
            <div className="pt-4 pb-2">
              <h1 className="text-xl font-bold text-foreground">Dashboard de Metas</h1>
            </div>
            
            {/* Descrição simples */}
            <p className="text-xs text-muted-foreground mb-4">Acompanhe o progresso dos seus objetivos financeiros</p>
            
            {/* Estatísticas com parallax - fica sticky no topo */}
            <div className="sticky top-0 z-10 bg-fnb-cream pb-4">
              <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg transform-gpu transition-transform duration-300 hover:scale-[1.02]">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total de Metas</p>
                    <p className="text-xs font-semibold">{totalGoals}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Concluídas</p>
                    <p className="text-xs font-semibold">{completedGoals}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Progresso</p>
                    <p className="text-xs font-semibold">{totalProgress.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-3 h-3 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Valor Total</p>
                    <p className="text-xs font-semibold">{formatCurrency(totalTargetValue)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Wallet className="w-3 h-3 text-purple-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Arrecadado</p>
                    <p className="text-xs font-semibold">{formatCurrency(totalCurrentValue)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays className="w-3 h-3 text-red-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Restante</p>
                    <p className="text-xs font-semibold">{formatCurrency(Math.max(0, totalRemaining))}</p>
                  </div>
                </div>
                </div>
              </div>
            </div>

            {/* Lista de metas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="w-3 h-3" />
                  Suas Metas Financeiras
                </CardTitle>
              </CardHeader>
              <CardContent>
                {goals.length > 0 ? (
                  <div className="space-y-4">
                    {goals.map((goal) => {
                      const progress = Math.min(((goal.current_amount || 0) / goal.target_amount) * 100, 100);
                      const remaining = Math.max(goal.target_amount - (goal.current_amount || 0), 0);

                      // Cálculos mensais
                      const calculateMonthlyValues = () => {
                        if (!goal.deadline) {
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

                      return (
                        <div key={goal.id} className="p-3 border rounded-lg space-y-3">
                          {/* Nome da Meta */}
                          <div className="flex items-center gap-2">
                            <Target className="w-3 h-3 text-primary" />
                            <h3 className="font-medium text-sm">{goal.title}</h3>
                          </div>

                          {/* Valores Principais */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Valor Total</p>
                              <p className="font-medium text-sm">{formatCurrency(goal.target_amount)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Valor Arrecadado</p>
                              <p className="font-medium text-sm text-green-600">{formatCurrency(goal.current_amount || 0)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Valor Restante</p>
                              <p className="font-medium text-sm text-orange-600">{formatCurrency(remaining)}</p>
                            </div>
                          </div>

                          {/* Barra de Progresso Simples */}
                          <div className="w-full">
                            <Progress value={progress} className="h-1.5" />
                          </div>

                          {/* Valores Mensais */}
                          {goal.deadline && (
                            <div className="grid grid-cols-3 gap-3 pt-2 border-t">
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Meta mensal</p>
                                <p className="text-xs font-medium">{formatCurrency(monthlyTarget)}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Arrecadado este mês</p>
                                <p className="text-xs font-medium text-green-600">{formatCurrency(monthlyCollected)}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Restante este mês</p>
                                <p className="text-xs font-medium text-orange-600">{formatCurrency(monthlyRemaining)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
        </ScrollArea>
      </div>
    </Layout>
  );
};

export default GoalsDashboard;