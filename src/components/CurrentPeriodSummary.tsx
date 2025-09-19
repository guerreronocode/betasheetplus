import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useFinancialData } from '@/hooks/useFinancialData';
import { formatCurrency } from '@/utils/formatters';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const CurrentPeriodSummary: React.FC = () => {
  const { income, expenses, isLoading } = useFinancialData();

  const currentMonthData = useMemo(() => {
    if (!income || !expenses) return { income: 0, expenses: 0, balance: 0 };

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

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

    const balance = monthlyIncome - monthlyExpenses;

    return { income: monthlyIncome, expenses: monthlyExpenses, balance };
  }, [income, expenses]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="fnb-card">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Entradas */}
      <Card className="fnb-card">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-fnb-ink/70">Entradas</p>
              <p className="text-lg font-semibold text-fnb-ink">{formatCurrency(currentMonthData.income)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saídas */}
      <Card className="fnb-card">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-fnb-ink/70">Saídas</p>
              <p className="text-lg font-semibold text-fnb-ink">{formatCurrency(currentMonthData.expenses)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saldo Atual */}
      <Card className="fnb-card">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${currentMonthData.balance >= 0 ? "bg-blue-100" : "bg-red-100"}`}>
              <DollarSign className={`w-5 h-5 ${currentMonthData.balance >= 0 ? "text-blue-600" : "text-red-600"}`} />
            </div>
            <div>
              <p className="text-sm text-fnb-ink/70">Saldo Atual</p>
              <p className={`text-lg font-semibold ${currentMonthData.balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                {formatCurrency(currentMonthData.balance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};