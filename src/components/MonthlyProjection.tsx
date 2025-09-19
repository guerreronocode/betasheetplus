import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFinancialData } from '@/hooks/useFinancialData';
import { formatCurrency } from '@/utils/formatters';
import { Calendar, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

export const MonthlyProjection: React.FC = () => {
  const { income, expenses, isLoading } = useFinancialData();

  const monthlyProjection = useMemo(() => {
    if (!income || !expenses) return { 
      currentIncome: 0, 
      currentExpenses: 0, 
      currentBalance: 0,
      projectedIncome: 0, 
      projectedExpenses: 0, 
      percentage: 0, 
      projectedBalance: 0 
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

    // Calculate daily average and project for the rest of the month
    const dailyIncomeAverage = monthlyIncome / currentDay;
    const dailyExpenseAverage = monthlyExpenses / currentDay;
    
    const projectedIncome = dailyIncomeAverage * daysInMonth;
    const projectedExpenses = dailyExpenseAverage * daysInMonth;
    
    const percentage = projectedIncome > 0 ? (projectedExpenses / projectedIncome) * 100 : 0;
    const projectedBalance = projectedIncome - projectedExpenses;
    const currentBalance = monthlyIncome - monthlyExpenses;

    return { 
      currentIncome: monthlyIncome,
      currentExpenses: monthlyExpenses,
      currentBalance: currentBalance,
      projectedIncome: projectedIncome, 
      projectedExpenses: projectedExpenses, 
      percentage, 
      projectedBalance 
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
      <Card className="fnb-card h-[500px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-fnb-accent" />
            Projeção Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fnb-card h-[500px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-fnb-accent" />
          Projeção Mensal
        </CardTitle>
        <div className="flex items-center gap-4 text-sm mt-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-fnb-ink/70">Entradas: {formatCurrency(monthlyProjection.currentIncome)}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <span className="text-fnb-ink/70">Saídas: {formatCurrency(monthlyProjection.currentExpenses)}</span>
          </div>
          <div className="flex items-center gap-2">
            {monthlyProjection.currentBalance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={`font-medium ${monthlyProjection.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Saldo: {formatCurrency(monthlyProjection.currentBalance)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-fnb-ink/80">Gasto do orçamento</span>
            <span className="text-sm font-medium text-fnb-ink">
              {monthlyProjection.percentage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={monthlyProjection.percentage} 
            className={`h-2 ${getPercentageProgressColor(monthlyProjection.percentage)}`} 
          />
          <p className={`text-xs mt-1 ${getPercentageColor(monthlyProjection.percentage)}`}>
            {monthlyProjection.percentage > 100 
              ? 'Orçamento excedido!' 
              : monthlyProjection.percentage > 80 
              ? 'Atenção ao orçamento' 
              : 'Orçamento controlado'
            }
          </p>
        </div>

        <div className="flex items-center justify-between p-4 bg-fnb-cream/50 rounded-lg border border-fnb-accent/10">
          <div className="flex items-center gap-2">
            {monthlyProjection.projectedBalance >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium text-fnb-ink">Saldo Projetado</span>
          </div>
          <span className={`text-xl font-bold ${monthlyProjection.projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(monthlyProjection.projectedBalance)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-fnb-ink/70">Receita projetada</p>
            <p className="font-semibold text-fnb-ink">{formatCurrency(monthlyProjection.projectedIncome)}</p>
          </div>
          <div>
            <p className="text-fnb-ink/70">Gasto projetado</p>
            <p className="font-semibold text-fnb-ink">{formatCurrency(monthlyProjection.projectedExpenses)}</p>
          </div>
        </div>

        {monthlyProjection.projectedBalance < 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Atenção! As despesas projetadas excedem a receita esperada em{' '}
              <strong>{formatCurrency(Math.abs(monthlyProjection.projectedBalance))}</strong>.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};