import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Target, TrendingUp, CheckCircle, DollarSign, Wallet, CalendarDays, ChevronUp, ChevronDown } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';
import { formatCurrency } from '@/utils/formatters';
import { Layout } from '@/components/Layout';

const GoalsDashboard = () => {
  const { goals, isLoading } = useGoals();
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedGoals = useMemo(() => {
    if (!sortField) return goals;

    return [...goals].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'target_amount':
          aValue = a.target_amount;
          bValue = b.target_amount;
          break;
        case 'current_amount':
          aValue = a.current_amount || 0;
          bValue = b.current_amount || 0;
          break;
        case 'remaining':
          aValue = a.target_amount - (a.current_amount || 0);
          bValue = b.target_amount - (b.current_amount || 0);
          break;
        case 'progress':
          aValue = ((a.current_amount || 0) / a.target_amount) * 100;
          bValue = ((b.current_amount || 0) / b.target_amount) * 100;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [goals, sortField, sortDirection]);

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead 
      className={`cursor-pointer hover:bg-muted/50 select-none ${
        field === 'name' ? 'w-[180px]' :
        field === 'target_amount' ? 'text-right w-[90px]' :
        field === 'current_amount' ? 'text-right w-[90px]' :
        field === 'remaining' ? 'text-right w-[80px]' :
        field === 'progress' ? 'w-[140px]' :
        ''
      } text-xs`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="w-3 h-3" /> : 
            <ChevronDown className="w-3 h-3" />
        )}
      </div>
    </TableHead>
  );

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
          <div className="space-y-4 pb-4">
            {/* Título e descrição próximos */}
            <div className="pt-3 pb-1">
              <h1 className="text-xl font-bold text-foreground">Dashboard de Metas</h1>
              <p className="text-xs text-muted-foreground mt-1">Acompanhe o progresso dos seus objetivos financeiros</p>
            </div>
            
            {/* Estatísticas com parallax - fica sticky no topo */}
            <div className="sticky top-0 z-10 bg-fnb-cream pb-3">
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

            {/* Tabela de metas com fundo branco */}
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-3 border-b">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Target className="w-3 h-3" />
                  Suas Metas Financeiras
                </h2>
              </div>
              
              {sortedGoals.length > 0 ? (
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <SortableHeader field="name">Meta</SortableHeader>
                        <SortableHeader field="target_amount">Valor Total</SortableHeader>
                        <SortableHeader field="current_amount">Arrecadado</SortableHeader>
                        <SortableHeader field="remaining">Restante</SortableHeader>
                        <SortableHeader field="progress">Progresso</SortableHeader>
                        <TableHead className="text-center w-[100px] text-xs">Data Final</TableHead>
                        <TableHead className="text-right w-[80px] text-xs">Meta Mensal</TableHead>
                        <TableHead className="text-right w-[80px] text-xs">Este Mês</TableHead>
                        <TableHead className="text-right w-[70px] text-xs">Falta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedGoals.map((goal) => {
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
                            <TableCell className="py-2">
                              <div className="flex items-center gap-1">
                                <Target className="w-2.5 h-2.5 text-primary flex-shrink-0" />
                                <span className="text-xs font-medium truncate">{goal.title}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-xs py-2">
                              {formatCurrency(goal.target_amount)}
                            </TableCell>
                            <TableCell className="text-right text-xs text-green-600 py-2">
                              {formatCurrency(goal.current_amount || 0)}
                            </TableCell>
                            <TableCell className="text-right text-xs text-orange-600 py-2">
                              {formatCurrency(remaining)}
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <Progress value={progress} className="h-1.5 flex-1" />
                                <span className="text-xs text-muted-foreground w-8 text-right">
                                  {progress.toFixed(0)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-xs py-2">
                              {goal.deadline ? (
                                new Date(goal.deadline).toLocaleDateString('pt-BR', { 
                                  day: '2-digit', 
                                  month: '2-digit',
                                  year: '2-digit'
                                })
                              ) : (
                                <span className="text-muted-foreground italic">Sem data</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-xs py-2">
                              {goal.deadline ? (
                                formatCurrency(monthlyTarget)
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-xs text-green-600 py-2">
                              {goal.deadline ? (
                                formatCurrency(monthlyCollected)
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-xs text-orange-600 py-2">
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
              ) : (
                <div className="text-center py-8">
                  <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-sm font-medium mb-1">Nenhuma meta encontrada</h3>
                  <p className="text-xs text-muted-foreground">
                    Crie sua primeira meta financeira para começar a acompanhar seus objetivos!
                  </p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </Layout>
  );
};

export default GoalsDashboard;