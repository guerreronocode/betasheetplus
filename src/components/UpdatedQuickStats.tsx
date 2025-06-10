
import React, { useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useGamification } from '@/hooks/useGamification';
import UserLevelDisplay from './UserLevelDisplay';

const UpdatedQuickStats = () => {
  const { 
    totalIncome, 
    totalExpenses, 
    netWorth, 
    availableBalance,
    currentInvestmentValue,
    isLoading 
  } = useFinancialData();
  
  const { trackActivity } = useGamification();

  // Track daily access when component mounts
  useEffect(() => {
    trackActivity('daily_access');
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const monthlyBalance = totalIncome - totalExpenses;
  const isPositive = monthlyBalance >= 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Level Display */}
      <UserLevelDisplay />
      
      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Patrimônio Líquido</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(netWorth)}</p>
              <p className="text-xs text-gray-500">
                Disponível: {formatCurrency(availableBalance)} | 
                Investido: {formatCurrency(currentInvestmentValue)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Receitas do Mês</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Despesas do Mês</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
              <Target className={`w-6 h-6 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo do Mês</p>
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(monthlyBalance)}
              </p>
              <p className="text-xs text-gray-500">
                {isPositive ? 'Superávit' : 'Déficit'} mensal
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UpdatedQuickStats;
