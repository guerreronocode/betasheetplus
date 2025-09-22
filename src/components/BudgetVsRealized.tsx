import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useFinancialData } from '@/hooks/useFinancialData';
import { usePlannedIncome } from '@/hooks/usePlannedIncome';
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
  const { income, expenses, isLoading: financialLoading } = useFinancialData();
  const { plannedIncome: plannedIncomeData, isLoading: plannedIncomeLoading } = usePlannedIncome();
  const { plannedExpenses: plannedExpensesData, isLoading: plannedExpensesLoading } = usePlannedExpenses();

  const budgetData = useMemo(() => {
    if (!expenses || !plannedExpensesData) {
      return {
        plannedExpenses: 0,
        realizedExpenses: 0,
        chartData: []
      };
    }

    // Calculate realized expenses
    const realizedExpenses = expenses
      .filter(item => {
        const date = new Date(item.date);
        return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
      })
      .reduce((sum, item) => sum + item.amount, 0);

    // Calculate planned expenses (budget limit)
    const plannedExpenses = plannedExpensesData
      .filter(item => {
        const itemDate = new Date(item.month);
        return itemDate.getMonth() + 1 === selectedMonth && itemDate.getFullYear() === selectedYear;
      })
      .reduce((sum, item) => sum + item.planned_amount, 0);

    const chartData = [
      {
        category: 'Despesas',
        orcado: plannedExpenses,
        realizado: realizedExpenses,
        diferenca: realizedExpenses - plannedExpenses,
      },
    ];

    return {
      plannedExpenses,
      realizedExpenses,
      chartData
    };
  }, [expenses, plannedExpensesData, selectedMonth, selectedYear]);

  const isLoading = financialLoading || plannedExpensesLoading;

  if (isLoading) {
    return (
      <Card className="fnb-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-fnb-accent" />
            Orçado vs Realizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
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

  const expenseVariance = budgetData.realizedExpenses - budgetData.plannedExpenses;
  const budgetRemaining = budgetData.plannedExpenses - budgetData.realizedExpenses;
  const overBudget = budgetData.realizedExpenses > budgetData.plannedExpenses;

  return (
    <Card className="fnb-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-fnb-accent" />
          Orçado vs Realizado - {monthNames[selectedMonth - 1]} {selectedYear}
        </CardTitle>
        <div className="flex items-center gap-4 text-sm mt-4">
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
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={budgetData.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--fnb-accent) / 0.1)" />
              <XAxis 
                dataKey="category" 
                tick={{ fill: 'hsl(var(--fnb-ink) / 0.7)', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--fnb-accent) / 0.2)' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--fnb-ink) / 0.7)', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--fnb-accent) / 0.2)' }}
                tickFormatter={(value) => formatCurrency(value).replace('R$', '').trim()}
              />
              <Tooltip 
                formatter={(value, name) => [
                  formatCurrency(value as number), 
                  name === 'orcado' ? 'Orçamento' : name === 'realizado' ? 'Gasto Real' : 'Limite Orçado'
                ]}
                labelFormatter={(label) => `${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--fnb-cream))',
                  border: '1px solid hsl(var(--fnb-accent) / 0.2)',
                  borderRadius: '8px',
                  color: 'hsl(var(--fnb-ink))'
                }}
              />
              <Legend />
              <Bar dataKey="realizado" fill="#ef4444" name="Gasto Real" />
              <Line 
                type="monotone" 
                dataKey="orcado" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                name="Limite Orçado"
              />
              <ReferenceLine y={0} stroke="hsl(var(--fnb-ink) / 0.3)" strokeDasharray="2 2" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};