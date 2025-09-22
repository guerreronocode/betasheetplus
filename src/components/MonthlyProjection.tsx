import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialData } from '@/hooks/useFinancialData';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { Calculator, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const MonthlyProjection: React.FC = () => {
  const { income, expenses, isLoading } = useFinancialData();

  const currentMonthData = useMemo(() => {
    if (!income || !expenses) return { 
      income: 0, 
      expenses: 0, 
      balance: 0,
      percentage: 0, 
      projectedBalance: 0,
      projectedIncome: 0,
      projectedExpenses: 0
    };

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentDay = currentDate.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Filter current month data
    const monthlyIncome = income
      .filter(item => {
        const date = new Date(item.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, item) => sum + item.amount, 0);

    const monthlyExpenses = expenses
      .filter(item => {
        const date = new Date(item.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, item) => sum + item.amount, 0);

    const currentBalance = monthlyIncome - monthlyExpenses;

    // Calculate percentage of income spent
    const percentage = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;

    // Calculate projected balance for end of month
    // This is a simple projection based on current data
    const dailyIncomeAverage = monthlyIncome / currentDay;
    const dailyExpenseAverage = monthlyExpenses / currentDay;
    
    const projectedMonthlyIncome = dailyIncomeAverage * daysInMonth;
    const projectedMonthlyExpenses = dailyExpenseAverage * daysInMonth;
    const projectedBalance = projectedMonthlyIncome - projectedMonthlyExpenses;

    return {
      income: monthlyIncome,
      expenses: monthlyExpenses,
      balance: currentBalance,
      percentage,
      projectedBalance,
      projectedIncome: projectedMonthlyIncome,
      projectedExpenses: projectedMonthlyExpenses,
    };
  }, [income, expenses]);

  const getPercentageColor = (percentage: number) => {
    if (percentage <= 50) return 'text-green-600';
    if (percentage <= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPercentageProgressColor = (percentage: number) => {
    if (percentage <= 50) return 'bg-green-500';
    if (percentage <= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <Card className="fnb-card w-full min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-fnb-accent" />
            Projeção Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentDate = new Date();
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long' });

  return (
    <Card className="fnb-card w-full min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-fnb-accent" />
          Projeção Mensal - {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-fnb-ink/70">Entradas: {formatCurrency(currentMonthData.income)}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <span className="text-fnb-ink/70">Saídas: {formatCurrency(currentMonthData.expenses)}</span>
          </div>
          <div className="flex items-center gap-2">
            {currentMonthData.balance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={`font-medium ${currentMonthData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Saldo: {formatCurrency(currentMonthData.balance)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-2 min-h-80">
        {/* Percentage of Income Spent */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-fnb-ink/70">% da Renda Gasta</span>
            <span className={`text-lg font-bold ${getPercentageColor(currentMonthData.percentage)}`}>
              {formatPercentage(currentMonthData.percentage)}
            </span>
          </div>
          <Progress 
            value={Math.min(currentMonthData.percentage, 100)} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-fnb-ink/50 mt-1">
            <span>Receitas: {formatCurrency(currentMonthData.income)}</span>
            <span>Despesas: {formatCurrency(currentMonthData.expenses)}</span>
          </div>
        </div>

        {/* Projected Balance */}
        <div className="pt-4 border-t border-fnb-accent/10">
          <div className="flex items-center gap-2 mb-3">
            {currentMonthData.projectedBalance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm font-medium text-fnb-ink/70">
              Projeção de Saldo Final
            </span>
          </div>
          
          <div className={`text-2xl font-bold mb-2 ${
            currentMonthData.projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(currentMonthData.projectedBalance)}
          </div>

          <div className="space-y-1 text-xs text-fnb-ink/50">
            <div className="flex justify-between">
              <span>Receita projetada:</span>
              <span>{formatCurrency(currentMonthData.projectedIncome || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Despesa projetada:</span>
              <span>{formatCurrency(currentMonthData.projectedExpenses || 0)}</span>
            </div>
          </div>

          {currentMonthData.percentage > 100 && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-red-50 border border-red-200 rounded">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-xs text-red-700">
                Atenção: Você já gastou mais do que sua renda mensal!
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};