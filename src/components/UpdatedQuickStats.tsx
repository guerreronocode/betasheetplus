
import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useFinancialData } from '@/hooks/useFinancialData';

const UpdatedQuickStats = () => {
  const { income, expenses, investments, isLoading } = useFinancialData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Calculate monthly income
  const monthlyIncome = income
    .filter(item => {
      const date = new Date(item.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, item) => sum + item.amount, 0);

  // Calculate monthly expenses
  const monthlyExpenses = expenses
    .filter(item => {
      const date = new Date(item.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, item) => sum + item.amount, 0);

  // Calculate total savings (total income - total expenses)
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalSavings = totalIncome - totalExpenses;

  // Calculate total investment value
  const totalInvestments = investments.reduce((sum, inv) => sum + (inv.current_value || inv.amount), 0);

  // Calculate net worth (savings + investments)
  const netWorth = totalSavings + totalInvestments;

  const stats = [
    {
      title: 'Receitas do Mês',
      value: monthlyIncome,
      change: '+12%',
      positive: true,
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Gastos do Mês',
      value: monthlyExpenses,
      change: '-5%',
      positive: true,
      icon: TrendingDown,
      color: 'blue'
    },
    {
      title: 'Patrimônio Líquido',
      value: netWorth,
      change: '+8%',
      positive: true,
      icon: Wallet,
      color: 'purple'
    },
    {
      title: 'Total Poupado',
      value: totalSavings,
      change: '+15%',
      positive: totalSavings >= 0,
      icon: PiggyBank,
      color: 'yellow'
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-100 text-green-600 border-green-200',
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200 animate-slide-up border-l-4" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <span className={`text-sm font-medium px-2 py-1 rounded ${
              stat.positive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {stat.change}
            </span>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stat.value)}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default UpdatedQuickStats;
