import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface IncomeExpenseChartProps {
  selectedMonth: number;
  selectedYear: number;
}

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ 
  selectedMonth, 
  selectedYear 
}) => {
  const { income, expenses, isLoading } = useFinancialData();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Filtrar dados pelo período selecionado
  const filteredIncome = income.filter(item => {
    const date = new Date(item.date);
    return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
  });

  const filteredExpenses = expenses.filter(item => {
    const date = new Date(item.date);
    return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
  });

  // Agrupar dados por dia
  const dailyData: { [key: string]: { income: number; expense: number } } = {};

  filteredIncome.forEach(item => {
    const day = new Date(item.date).getDate().toString();
    if (!dailyData[day]) dailyData[day] = { income: 0, expense: 0 };
    dailyData[day].income += item.amount;
  });

  filteredExpenses.forEach(item => {
    const day = new Date(item.date).getDate().toString();
    if (!dailyData[day]) dailyData[day] = { income: 0, expense: 0 };
    dailyData[day].expense += item.amount;
  });

  // Converter para array e ordenar
  const chartData = Object.entries(dailyData)
    .map(([day, data]) => ({
      day: parseInt(day),
      receitas: data.income,
      despesas: data.expense
    }))
    .sort((a, b) => a.day - b.day);

  // Calcular totais
  const totalIncome = filteredIncome.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpense;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border border-border rounded-lg shadow-md">
          <p className="font-medium text-fnb-ink">{`Dia ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-fnb-ink">Receitas e Despesas</CardTitle>
        
        {/* Resumo dos totais */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Receitas</span>
            </div>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-red-600">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">Despesas</span>
            </div>
            <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpense)}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-fnb-ink">
              <span className="text-sm font-medium">Saldo</span>
            </div>
            <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('pt-BR', { 
                      notation: 'compact',
                      style: 'currency',
                      currency: 'BRL'
                    }).format(value)
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receitas" 
                  stroke="#16a34a" 
                  strokeWidth={2}
                  name="Receitas"
                />
                <Line 
                  type="monotone" 
                  dataKey="despesas" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  name="Despesas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <p>Nenhuma transação encontrada para o período selecionado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseChart;