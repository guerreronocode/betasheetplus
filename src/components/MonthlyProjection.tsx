import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Skeleton } from '@/components/ui/skeleton';
import { Calculator, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const MonthlyProjection: React.FC = () => {
  const { income, expenses, isLoading } = useFinancialData();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const currentDay = currentDate.getDate();

  // Filtrar transações do mês atual
  const currentMonthIncome = income.filter(item => {
    const date = new Date(item.date);
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
  });

  const currentMonthExpenses = expenses.filter(item => {
    const date = new Date(item.date);
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
  });

  // Calcular totais do mês atual
  const totalMonthIncome = currentMonthIncome.reduce((sum, item) => sum + item.amount, 0);
  const totalMonthExpense = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);

  // Calcular médias diárias baseadas nos dados até agora
  const averageDailyIncome = currentDay > 0 ? totalMonthIncome / currentDay : 0;
  const averageDailyExpense = currentDay > 0 ? totalMonthExpense / currentDay : 0;

  // Projeção para o final do mês
  const remainingDays = daysInMonth - currentDay;
  const projectedMonthIncome = totalMonthIncome + (averageDailyIncome * remainingDays);
  const projectedMonthExpense = totalMonthExpense + (averageDailyExpense * remainingDays);
  const projectedBalance = projectedMonthIncome - projectedMonthExpense;

  // Calcular % de renda gasta
  const spentPercentage = totalMonthIncome > 0 ? (totalMonthExpense / totalMonthIncome) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-fnb-ink flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Projeção Mensal
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Percentual de Renda Gasta */}
        <div className="bg-muted rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-fnb-ink">% da Renda Gasta</span>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Gastos: {formatCurrency(totalMonthExpense)}</span>
              <span>Renda: {formatCurrency(totalMonthIncome)}</span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  spentPercentage > 100 
                    ? 'bg-red-500' 
                    : spentPercentage > 80 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
            </div>
            
            <div className="text-center">
              <span className={`text-lg font-bold ${
                spentPercentage > 100 
                  ? 'text-red-600' 
                  : spentPercentage > 80 
                  ? 'text-yellow-600' 
                  : 'text-green-600'
              }`}>
                {spentPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Projeção de Saldo */}
        <div className="bg-muted rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-fnb-ink">Projeção Fim do Mês</span>
            {projectedBalance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Receitas Projetadas:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(projectedMonthIncome)}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Despesas Projetadas:</span>
              <span className="font-medium text-red-600">
                {formatCurrency(projectedMonthExpense)}
              </span>
            </div>
            
            <div className="border-t border-border pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-fnb-ink">Saldo Projetado:</span>
                <span className={`font-bold text-lg ${
                  projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(projectedBalance)}
                </span>
              </div>
            </div>
            
            {remainingDays > 0 && (
              <div className="text-xs text-muted-foreground text-center mt-2">
                Baseado na média dos últimos {currentDay} dias
                <br />
                ({remainingDays} dias restantes no mês)
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyProjection;