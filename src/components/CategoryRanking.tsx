
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingDown, PieChart } from 'lucide-react';
import { useCategoryRanking } from '@/hooks/useCategoryRanking';

const CategoryRanking = () => {
  const { categoryRanking, isLoading, error } = useCategoryRanking();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(1) + '%';
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>Erro ao carregar ranking de categorias</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <PieChart className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ranking de Gastos por Categoria</h3>
            <p className="text-sm text-gray-600">Onde você mais gasta seu dinheiro</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {categoryRanking.length} categorias
        </div>
      </div>

      <div className="space-y-3">
        {categoryRanking.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingDown className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum gasto registrado ainda</p>
            <p className="text-sm">Adicione transações ou compras no cartão para ver o ranking!</p>
          </div>
        ) : (
          categoryRanking.map((item, index) => (
            <div
              key={item.category}
              className="flex items-center justify-between p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold rounded-full">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.category}</p>
                  <p className="text-sm text-gray-600">
                    {item.transactionCount} {item.transactionCount === 1 ? 'transação' : 'transações'}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(item.totalAmount)}
                </p>
                <p className="text-sm font-medium text-purple-600">
                  {formatPercentage(item.percentage)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {categoryRanking.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 text-blue-800">
            <PieChart className="w-4 h-4" />
            <span className="text-sm font-medium">Total de Gastos:</span>
          </div>
          <p className="text-lg font-bold text-blue-900 mt-1">
            {formatCurrency(categoryRanking.reduce((sum, item) => sum + item.totalAmount, 0))}
          </p>
        </div>
      )}
    </Card>
  );
};

export default CategoryRanking;
