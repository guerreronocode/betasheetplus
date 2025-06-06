
import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { Card } from '@/components/ui/card';

const QuickStats = () => {
  const stats = [
    {
      title: 'Receitas do Mês',
      value: 'R$ 5.450,00',
      change: '+12%',
      positive: true,
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Gastos do Mês',
      value: 'R$ 3.280,00',
      change: '-5%',
      positive: true,
      icon: TrendingDown,
      color: 'blue'
    },
    {
      title: 'Patrimônio Líquido',
      value: 'R$ 24.750,00',
      change: '+8%',
      positive: true,
      icon: Wallet,
      color: 'purple'
    },
    {
      title: 'Total Poupado',
      value: 'R$ 2.170,00',
      change: '+15%',
      positive: true,
      icon: PiggyBank,
      color: 'yellow'
    }
  ];

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
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default QuickStats;
