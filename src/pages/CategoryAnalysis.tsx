
import React from 'react';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import CategoryRanking from '@/components/CategoryRanking';
import { BarChart3, TrendingDown, PieChart } from 'lucide-react';
import { useCategoryRanking } from '@/hooks/useCategoryRanking';

const CategoryAnalysis = () => {
  const { categoryRanking, isLoading } = useCategoryRanking();

  const totalSpent = categoryRanking.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalTransactions = categoryRanking.reduce((sum, item) => sum + item.transactionCount, 0);
  const averagePerCategory = categoryRanking.length > 0 ? totalSpent / categoryRanking.length : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Análise de Gastos por Categoria</h1>
          <p className="text-gray-600">Entenda como você está gastando seu dinheiro</p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Gasto</p>
                <p className="text-xl font-bold text-gray-900">
                  {isLoading ? '---' : formatCurrency(totalSpent)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PieChart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Categorias Ativas</p>
                <p className="text-xl font-bold text-gray-900">
                  {isLoading ? '---' : categoryRanking.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Transações</p>
                <p className="text-xl font-bold text-gray-900">
                  {isLoading ? '---' : totalTransactions}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Média por Categoria</p>
                <p className="text-xl font-bold text-gray-900">
                  {isLoading ? '---' : formatCurrency(averagePerCategory)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Ranking completo */}
        <CategoryRanking />
      </main>
    </div>
  );
};

export default CategoryAnalysis;
