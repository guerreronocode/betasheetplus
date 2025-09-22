import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useFinancialData } from '@/hooks/useFinancialData';
import { formatCurrency } from '@/utils/formatters';
import { PieChart as PieChartIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface CategoryDashboardProps {
  selectedMonth: number;
  selectedYear: number;
}

export const CategoryDashboard: React.FC<CategoryDashboardProps> = ({
  selectedMonth,
  selectedYear,
}) => {
  const { income, expenses, isLoading } = useFinancialData();

  const categoryData = useMemo(() => {
    if (!income || !expenses) return { incomeByCategory: [], expensesByCategory: [] };

    // Filter data for selected month and year
    const filteredIncome = income.filter(item => {
      const date = new Date(item.date);
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
    });

    const filteredExpenses = expenses.filter(item => {
      const date = new Date(item.date);
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
    });

    // Group by category
    const incomeByCategory = filteredIncome.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);

    const expensesByCategory = filteredExpenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to chart format
    const incomeChartData = Object.entries(incomeByCategory).map(([category, amount], index) => ({
      name: category,
      value: amount,
      color: `hsl(${120 + index * 30}, 70%, 50%)`, // Green tones for income
    }));

    const expensesChartData = Object.entries(expensesByCategory).map(([category, amount], index) => ({
      name: category,
      value: amount,
      color: `hsl(${index * 30}, 70%, 50%)`, // Various colors for expenses
    }));

    return { 
      incomeByCategory: incomeChartData, 
      expensesByCategory: expensesChartData 
    };
  }, [income, expenses, selectedMonth, selectedYear]);

  if (isLoading) {
    return (
      <Card className="fnb-card w-full min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PieChartIcon className="h-5 w-5 text-fnb-accent" />
            Dashboard por Categoria
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

  const totalIncome = categoryData.incomeByCategory.reduce((sum, item) => sum + item.value, 0);
  const totalExpenses = categoryData.expensesByCategory.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="fnb-card w-full min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PieChartIcon className="h-5 w-5 text-fnb-accent" />
          Dashboard por Categoria - {monthNames[selectedMonth - 1]} {selectedYear}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-fnb-ink/70">Total Receitas: {formatCurrency(totalIncome)}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <span className="text-fnb-ink/70">Total Despesas: {formatCurrency(totalExpenses)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Receitas por Categoria */}
          <div className="flex flex-col">
            <h4 className="text-sm font-medium text-fnb-ink/70 mb-2 text-center">Receitas por Categoria</h4>
            {categoryData.incomeByCategory.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.incomeByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.incomeByCategory.map((entry, index) => (
                        <Cell key={`income-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-fnb-ink/50">
                Nenhuma receita encontrada
              </div>
            )}
          </div>

          {/* Despesas por Categoria */}
          <div className="flex flex-col">
            <h4 className="text-sm font-medium text-fnb-ink/70 mb-2 text-center">Despesas por Categoria</h4>
            {categoryData.expensesByCategory.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.expensesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.expensesByCategory.map((entry, index) => (
                        <Cell key={`expense-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-fnb-ink/50">
                Nenhuma despesa encontrada
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};