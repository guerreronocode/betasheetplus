
import React from 'react';
import { TrendingUp, Building, Coins } from 'lucide-react';
import { Card } from '@/components/ui/card';
import InvestmentCreateDialog from './Investment/InvestmentCreateDialog';
import { useFinancialData } from '@/hooks/useFinancialData';

// Funções utilitárias extraídas
function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function calculateReturn(initial: number, current: number) {
  const percentage = ((current - initial) / initial) * 100;
  return {
    value: current - initial,
    percentage
  };
}

const InvestmentManager = () => {
  const { investments } = useFinancialData();

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce(
    (sum, inv) => sum + (inv.current_value || inv.amount),
    0
  );
  const totalReturn = calculateReturn(totalInvested, totalCurrentValue);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Carteira de Investimentos</h3>
            <p className="text-sm text-gray-600">Gerencie seus investimentos</p>
          </div>
        </div>
        <InvestmentCreateDialog />
      </div>

      {/* Portfolio Summary */}
      {investments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Coins className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Investido</span>
            </div>
            <p className="text-xl font-bold text-blue-900">{formatCurrency(totalInvested)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Building className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Valor Atual</span>
            </div>
            <p className="text-xl font-bold text-green-900">
              {formatCurrency(totalCurrentValue)}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${totalReturn.value >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className={`w-5 h-5 ${totalReturn.value >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-sm font-medium ${totalReturn.value >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                Retorno
              </span>
            </div>
            <p className={`text-xl font-bold ${totalReturn.value >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {formatCurrency(totalReturn.value)} ({totalReturn.percentage.toFixed(2)}%)
            </p>
          </div>
        </div>
      )}

      {/* Investments List */}
      <div className="space-y-3">
        {investments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhum investimento encontrado</p>
            <p className="text-sm">Adicione seu primeiro investimento!</p>
          </div>
        ) : (
          investments.map((investment, index) => {
            const returnData = calculateReturn(investment.amount, investment.current_value || investment.amount);
            const typeLabel = investment.type;

            return (
              <div
                key={investment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{investment.name}</p>
                    <p className="text-sm text-gray-600">{typeLabel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(investment.current_value || investment.amount)}
                  </p>
                  <p className={`text-sm ${returnData.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {returnData.value >= 0 ? '+' : ''}{formatCurrency(returnData.value)} ({returnData.percentage.toFixed(2)}%)
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default InvestmentManager;
