import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFinancialData } from '@/hooks/useFinancialData';
import { usePlannedExpenses } from '@/hooks/usePlannedExpenses';
import { formatCurrency } from '@/utils/formatters';
import { Target, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface BudgetVsRealizedProps {
  selectedMonth: number;
  selectedYear: number;
}

export const BudgetVsRealized: React.FC<BudgetVsRealizedProps> = ({
  selectedMonth,
  selectedYear,
}) => {
  const { expenses, isLoading: financialLoading } = useFinancialData();
  const { plannedExpenses: plannedExpensesData, isLoading: plannedExpensesLoading } = usePlannedExpenses();

  const budgetData = useMemo(() => {
    if (!expenses || !plannedExpensesData) {
      return {
        plannedExpenses: 0,
        realizedExpenses: 0,
        categoryData: []
      };
    }

    // Group realized expenses by category
    const realizedByCategory = expenses
      .filter(item => {
        const date = new Date(item.date);
        return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
      })
      .reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
      }, {} as Record<string, number>);

    // Group planned expenses by category
    const plannedByCategory = plannedExpensesData
      .filter(item => {
        const itemDate = new Date(item.month);
        return itemDate.getMonth() + 1 === selectedMonth && itemDate.getFullYear() === selectedYear;
      })
      .reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.planned_amount;
        return acc;
      }, {} as Record<string, number>);

    // Get all categories (planned or realized)
    const allCategories = new Set([
      ...Object.keys(plannedByCategory),
      ...Object.keys(realizedByCategory)
    ]);

    // Create category data
    const categoryData = Array.from(allCategories).map(category => {
      const planned = plannedByCategory[category] || 0;
      const realized = realizedByCategory[category] || 0;
      const percentage = planned > 0 ? (realized / planned) * 100 : 0;
      
      return {
        category,
        planned,
        realized,
        percentage,
        remaining: planned - realized,
        overBudget: realized > planned
      };
    }).sort((a, b) => b.planned - a.planned);

    const totalPlanned = Object.values(plannedByCategory).reduce((sum, val) => sum + val, 0);
    const totalRealized = Object.values(realizedByCategory).reduce((sum, val) => sum + val, 0);

    return {
      plannedExpenses: totalPlanned,
      realizedExpenses: totalRealized,
      categoryData
    };
  }, [expenses, plannedExpensesData, selectedMonth, selectedYear]);

  const isLoading = financialLoading || plannedExpensesLoading;

  if (isLoading) {
    return (
    <Card className="fnb-card w-full min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-fnb-accent" />
            Orçado vs Realizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-fnb-ink/50">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const budgetRemaining = budgetData.plannedExpenses - budgetData.realizedExpenses;
  const overBudget = budgetData.realizedExpenses > budgetData.plannedExpenses;

  return (
    <Card className="fnb-card w-full min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-fnb-accent" />
          Orçado vs Realizado - {monthNames[selectedMonth - 1]} {selectedYear}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-fnb-ink/70">Orçamento: {formatCurrency(budgetData.plannedExpenses)}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <span className="text-fnb-ink/70">Gasto Real: {formatCurrency(budgetData.realizedExpenses)}</span>
          </div>
          <div className="flex items-center gap-2">
            {!overBudget ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <span className={`font-medium ${!overBudget ? 'text-green-600' : 'text-red-600'}`}>
              {!overBudget ? `Restante: ${formatCurrency(budgetRemaining)}` : `Excesso: ${formatCurrency(Math.abs(budgetRemaining))}`}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {budgetData.categoryData.length === 0 ? (
              <div className="text-center text-fnb-ink/50 py-8">
                Nenhum dado de orçamento ou despesas encontrado para este período.
              </div>
            ) : (
              budgetData.categoryData.map((item) => (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-fnb-ink text-sm">{item.category}</span>
                    <div className="text-xs text-fnb-ink/70">
                      {formatCurrency(item.realized)} / {formatCurrency(item.planned)}
                    </div>
                  </div>
                   <div className="flex items-center gap-2">
                     <Progress 
                       value={Math.min(item.percentage, 100)} 
                       className="flex-1 h-2"
                     />
                     <span className={`text-xs font-medium min-w-[40px] ${
                       item.overBudget ? 'text-red-600' : 'text-green-600'
                     }`}>
                       {item.percentage.toFixed(0)}%
                     </span>
                   </div>
                  <div className="text-xs text-fnb-ink/60">
                    {item.overBudget ? (
                      <span className="text-red-600">
                        Excesso: {formatCurrency(Math.abs(item.remaining))}
                      </span>
                    ) : (
                      <span className="text-green-600">
                        Restante: {formatCurrency(item.remaining)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};