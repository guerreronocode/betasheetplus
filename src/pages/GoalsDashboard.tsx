import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Target, TrendingUp, CheckCircle, DollarSign, Wallet, CalendarDays, ChevronUp, ChevronDown } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';
import { formatCurrency } from '@/utils/formatters';
import { Layout } from '@/components/Layout';

type SortField = 'title' | 'target_amount' | 'current_amount' | 'remaining' | 'progress';
type SortDirection = 'asc' | 'desc';

const GoalsDashboard = () => {
  const { goals, isLoading } = useGoals();
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedGoals = useMemo(() => {
    if (!goals.length) return [];
    
    return [...goals].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;
      
      switch (sortField) {
        case 'title':
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
          aValue = Math.max(a.target_amount - (a.current_amount || 0), 0);
          bValue = Math.max(b.target_amount - (b.current_amount || 0), 0);
          break;
        case 'progress':
          aValue = Math.min(((a.current_amount || 0) / a.target_amount) * 100, 100);
          bValue = Math.min(((b.current_amount || 0) / b.target_amount) * 100, 100);
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }
      
      return sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });
  }, [goals, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

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
        <ScrollArea className="h-screen">
          <div className="container mx-auto px-4 max-w-7xl space-y-6 pb-4">
            {/* Título que desaparece no scroll */}
            <div className="pt-4 pb-2">
              <h1 className="text-xl font-bold text-foreground">Dashboard de Metas</h1>
            </div>
            
            {/* Descrição simples */}
            <p className="text-xs text-muted-foreground mb-4">Acompanhe o progresso dos seus objetivos financeiros</p>
            
            {/* Estatísticas - removido parallax */}
            <div className="pb-4">
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
              <CardContent className="p-0">
                {sortedGoals.length > 0 ? (
                  <div className="w-full overflow-hidden">
                    <div className="overflow-x-auto smooth-scroll" style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'hsl(var(--primary) / 0.3) hsl(var(--muted))'
                    }}>
                      <style dangerouslySetInnerHTML={{
                        __html: `
                          .smooth-scroll::-webkit-scrollbar {
                            height: 6px;
                          }
                          .smooth-scroll::-webkit-scrollbar-track {
                            background: hsl(var(--muted));
                            border-radius: 3px;
                          }
                          .smooth-scroll::-webkit-scrollbar-thumb {
                            background: hsl(var(--primary) / 0.3);
                            border-radius: 3px;
                            transition: background 0.2s ease;
                          }
                          .smooth-scroll::-webkit-scrollbar-thumb:hover {
                            background: hsl(var(--primary) / 0.5);
                          }
                        `
                      }} />
                      <Table className="w-full min-w-[900px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="sticky left-0 bg-background z-10 border-r cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('title')}
                          >
                            <div className="flex items-center gap-1">
                              Meta
                              {getSortIcon('title')}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('target_amount')}
                          >
                            <div className="flex items-center gap-1">
                              Valor Total
                              {getSortIcon('target_amount')}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('current_amount')}
                          >
                            <div className="flex items-center gap-1">
                              Arrecadado
                              {getSortIcon('current_amount')}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('remaining')}
                          >
                            <div className="flex items-center gap-1">
                              Restante
                              {getSortIcon('remaining')}
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSort('progress')}
                          >
                            <div className="flex items-center gap-1">
                              Progresso
                              {getSortIcon('progress')}
                            </div>
                          </TableHead>
                          <TableHead>Meta Mensal</TableHead>
                          <TableHead>Mensal Atual</TableHead>
                          <TableHead>Mensal Restante</TableHead>
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
                              <TableCell className="sticky left-0 bg-background z-10 border-r">
                                <div className="flex items-center gap-2">
                                  <Target className="w-3 h-3 text-primary flex-shrink-0" />
                                  <span className="font-medium text-sm">{goal.title}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-sm">{formatCurrency(goal.target_amount)}</span>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-sm text-green-600">{formatCurrency(goal.current_amount || 0)}</span>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-sm text-orange-600">{formatCurrency(remaining)}</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress value={progress} className="h-2 w-16" />
                                  <span className="text-xs font-medium">{progress.toFixed(1)}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {goal.deadline ? (
                                  <span className="text-sm font-medium">{formatCurrency(monthlyTarget)}</span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {goal.deadline ? (
                                  <span className="text-sm font-medium text-green-600">{formatCurrency(monthlyCollected)}</span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {goal.deadline ? (
                                  <span className="text-sm font-medium text-orange-600">{formatCurrency(monthlyRemaining)}</span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">-</span>
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
                  <div className="text-center py-8 px-4">
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