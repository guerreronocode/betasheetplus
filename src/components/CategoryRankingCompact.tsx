
import React from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, TrendingUp } from 'lucide-react';
import { useCategoryRanking } from '@/hooks/useCategoryRanking';

const CategoryRankingCompact = () => {
  const { categoryRanking, isLoading } = useCategoryRanking();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact'
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const topCategories = categoryRanking.slice(0, 5);

  return (
    <Card className="p-4">
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-1.5 bg-purple-100 rounded">
          <PieChart className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">Top Categorias</h4>
          <p className="text-xs text-gray-600">Maiores gastos</p>
        </div>
      </div>

      <div className="space-y-2">
        {topCategories.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Sem dados ainda</p>
          </div>
        ) : (
          topCategories.map((item, index) => (
            <div
              key={item.category}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-purple-600 w-4">
                  {index + 1}º
                </span>
                <span className="text-sm font-medium text-gray-900 truncate">
                  {item.category}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(item.totalAmount)}
                </p>
                <p className="text-xs text-purple-600">
                  {item.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {topCategories.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Total gasto:</span>
            <span className="font-medium">
              {formatCurrency(categoryRanking.reduce((sum, item) => sum + item.totalAmount, 0))}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CategoryRankingCompact;
