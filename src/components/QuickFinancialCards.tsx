import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Calculator } from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';

const QuickFinancialCards = () => {
  const { monthlyIncome, monthlyExpenses, isLoading } = useFinancialData();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const spentPercentage = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;
  const projectedBalance = monthlyIncome - monthlyExpenses;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${spentPercentage > 100 ? 'bg-red-100' : spentPercentage > 80 ? 'bg-yellow-100' : 'bg-green-100'}`}>
              <TrendingUp className={`w-5 h-5 ${spentPercentage > 100 ? 'text-red-600' : spentPercentage > 80 ? 'text-yellow-600' : 'text-green-600'}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">% da Renda Gasta</p>
              <p className={`text-xl font-bold ${spentPercentage > 100 ? 'text-red-600' : spentPercentage > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                {spentPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${projectedBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Calculator className={`w-5 h-5 ${projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Projeção do Saldo</p>
              <p className={`text-xl font-bold ${projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(projectedBalance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickFinancialCards;