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
                      const remainingProgress = 100 - progress;

                      // Cálculo para progresso mensal (assumindo distribuição linear)
                      const deadline = goal.deadline ? new Date(goal.deadline) : null;
                      const currentDate = new Date();
                      const startDate = new Date(goal.created_at);
                      
                      let monthlyTarget = goal.target_amount;
                      let expectedByNow = goal.current_amount || 0;
                      
                      if (deadline) {
                        const totalMonths = Math.max(1, Math.ceil((deadline.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
                        monthlyTarget = goal.target_amount / totalMonths;
                        const monthsElapsed = Math.max(1, Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
                        expectedByNow = Math.min(monthlyTarget * monthsElapsed, goal.target_amount);
                      }
                      
                      const monthlyProgress = expectedByNow > 0 ? Math.min(((goal.current_amount || 0) / expectedByNow) * 100, 100) : 0;
                      const monthlyRemaining = Math.max(expectedByNow - (goal.current_amount || 0), 0);
                      const monthlyRemainingProgress = 100 - monthlyProgress;

                      return (
                        <div key={goal.id} className="p-3 border rounded-lg space-y-2">
                          {/* Primeira linha - Meta total */}
                          <div className="flex items-center gap-4">
                            {/* Título da meta */}
                            <div className="w-48 flex-shrink-0">
                              <h3 className="font-medium text-sm">{goal.title}</h3>
                            </div>
                            
                            {/* Barra de progresso total */}
                            <div className="flex-1">
                              <div className="flex rounded-lg overflow-hidden h-6 border">
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
                              <span className="font-semibold text-sm">
                                {formatCurrency(goal.target_amount)}
                              </span>
                            </div>
                          </div>

                          {/* Segunda linha - Progresso mensal */}
                          <div className="flex items-center gap-4">
                            {/* Título do progresso mensal */}
                            <div className="w-48 flex-shrink-0">
                              <p className="text-xs text-muted-foreground">Valor a arrecadar este mês</p>
                            </div>
                            
                            {/* Barra de progresso mensal */}
                            <div className="flex-1">
                              <div className="flex rounded-lg overflow-hidden h-5 border">
                                {/* Parte verde - Valor arrecadado no período */}
                                <div 
                                  className="bg-green-400 flex items-center justify-center text-xs font-medium text-white px-2"
                                  style={{ width: `${monthlyProgress}%` }}
                                >
                                  {monthlyProgress > 0 && (
                                    <span className="truncate">
                                      {formatCurrency(Math.min(goal.current_amount || 0, expectedByNow))} ({monthlyProgress.toFixed(0)}%)
                                    </span>
                                  )}
                                </div>
                                
                                {/* Parte vermelha - Valor restante no período */}
                                <div 
                                  className="bg-red-400 flex items-center justify-center text-xs font-medium text-white px-2"
                                  style={{ width: `${monthlyRemainingProgress}%` }}
                                >
                                  {monthlyRemainingProgress > 0 && (
                                    <span className="truncate">
                                      {formatCurrency(monthlyRemaining)} ({monthlyRemainingProgress.toFixed(0)}%)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Valor total esperado no período */}
                            <div className="w-32 flex-shrink-0 text-right">
                              <span className="font-medium text-xs">
                                {formatCurrency(expectedByNow)}
                              </span>
                            </div>
                          </div>
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