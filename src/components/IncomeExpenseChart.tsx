import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFinancialData } from '@/hooks/useFinancialData';
import { formatCurrency } from '@/utils/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface IncomeExpenseChartProps {
  selectedMonth: number;
  selectedYear: number;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  selectedMonth,
  selectedYear,
}) => {
  const { income, expenses, isLoading } = useFinancialData();

  const chartData = useMemo(() => {
    if (!income || !expenses) return [];

    // Filter data for selected month and year
    const filteredIncome = income.filter(item => {
      const date = new Date(item.date);
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
    });

    const filteredExpenses = expenses.filter(item => {
      const date = new Date(item.date);
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
    });

    // Group by day
    const dailyData = new Map<number, { income: number; expenses: number }>();
    
    // Get days in month
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    
    // Initialize all days
    for (let day = 1; day <= daysInMonth; day++) {
      dailyData.set(day, { income: 0, expenses: 0 });
    }

    // Add income data
    filteredIncome.forEach(item => {
      const day = new Date(item.date).getDate();
      const current = dailyData.get(day) || { income: 0, expenses: 0 };
      dailyData.set(day, { ...current, income: current.income + item.amount });
    });

    // Add expense data
    filteredExpenses.forEach(item => {
      const day = new Date(item.date).getDate();
      const current = dailyData.get(day) || { income: 0, expenses: 0 };
      dailyData.set(day, { ...current, expenses: current.expenses + item.amount });
    });

    // Convert to array format for chart
    return Array.from(dailyData.entries())
      .map(([day, data]) => ({
        day: day.toString().padStart(2, '0'),
        receitas: data.income,
        despesas: data.expenses,
        saldo: data.income - data.expenses,
      }))
      .slice(0, daysInMonth);
  }, [income, expenses, selectedMonth, selectedYear]);

  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, day) => ({
        income: acc.income + day.receitas,
        expenses: acc.expenses + day.despesas,
        balance: acc.balance + day.saldo,
      }),
      { income: 0, expenses: 0, balance: 0 }
    );
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="fnb-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-fnb-accent" />
            Receitas vs Despesas
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

  return (
    <Card className="fnb-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-fnb-accent" />
            Receitas vs Despesas - {monthNames[selectedMonth - 1]} {selectedYear}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-fnb-ink/70">Receitas: {formatCurrency(totals.income)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-fnb-ink/70">Despesas: {formatCurrency(totals.expenses)}</span>
            </div>
            <div className="flex items-center gap-2">
              {totals.balance >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`font-medium ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Saldo: {formatCurrency(totals.balance)}
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--fnb-accent) / 0.1)" />
              <XAxis 
                dataKey="day" 
                tick={{ fill: 'hsl(var(--fnb-ink) / 0.7)', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--fnb-accent) / 0.2)' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--fnb-ink) / 0.7)', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--fnb-accent) / 0.2)' }}
                tickFormatter={(value) => formatCurrency(value).replace('R$', '').trim()}
              />
              <Tooltip 
                formatter={(value, name) => [formatCurrency(value as number), name === 'receitas' ? 'Receitas' : 'Despesas']}
                labelFormatter={(label) => `Dia ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--fnb-cream))',
                  border: '1px solid hsl(var(--fnb-accent) / 0.2)',
                  borderRadius: '8px',
                  color: 'hsl(var(--fnb-ink))'
                }}
              />
              <Legend />
              <Bar dataKey="receitas" fill="#22c55e" name="Receitas" />
              <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};