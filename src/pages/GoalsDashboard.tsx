import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
          <div className="space-y-6 pb-4 min-w-0">
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

            {/* Tabela de metas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="w-4 h-4" />
                  Suas Metas Financeiras
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {goals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[180px] px-4">Meta</TableHead>
                            <TableHead className="text-right min-w-[100px]">Valor Total</TableHead>
                            <TableHead className="text-right min-w-[100px]">Arrecadado</TableHead>
                            <TableHead className="text-right min-w-[90px]">Restante</TableHead>
                            <TableHead className="min-w-[120px]">Progresso</TableHead>
                            <TableHead className="text-center min-w-[100px]">Data Final</TableHead>
                            <TableHead className="text-right min-w-[100px]">Meta Mensal</TableHead>
                            <TableHead className="text-right min-w-[90px]">Este Mês</TableHead>
                            <TableHead className="text-right min-w-[80px] pr-4">Falta</TableHead>
                          </TableRow>
                        </TableHeader>
                      <TableBody>
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
                            <TableRow key={goal.id}>
                              <TableCell className="font-medium px-4">
                                <div className="flex items-center gap-2">
                                  <Target className="w-3 h-3 text-primary" />
                                  <span className="text-sm">{goal.title}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                {formatCurrency(goal.target_amount)}
                              </TableCell>
                              <TableCell className="text-right text-sm text-green-600">
                                {formatCurrency(goal.current_amount || 0)}
                              </TableCell>
                              <TableCell className="text-right text-sm text-orange-600">
                                {formatCurrency(remaining)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress value={progress} className="h-2 flex-1" />
                                  <span className="text-xs text-muted-foreground w-10">
                                    {progress.toFixed(0)}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center text-sm">
                                {goal.deadline ? (
                                  new Date(goal.deadline).toLocaleDateString('pt-BR')
                                ) : (
                                  <span className="text-muted-foreground italic">Sem data final</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                {goal.deadline ? (
                                  formatCurrency(monthlyTarget)
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right text-sm text-green-600">
                                {goal.deadline ? (
                                  formatCurrency(monthlyCollected)
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right text-sm text-orange-600 pr-4">
                                {goal.deadline ? (
                                  formatCurrency(monthlyRemaining)
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                      </Table>
                    </div>
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