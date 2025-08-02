
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useBudgets, Budget, BudgetComparison as BudgetComparisonType } from '@/hooks/useBudgets';

interface BudgetComparisonProps {
  budget: Budget;
  period: 'monthly' | 'yearly';
}

const BudgetComparison: React.FC<BudgetComparisonProps> = ({ budget, period }) => {
  const { getBudgetComparison } = useBudgets();
  const [comparisons, setComparisons] = useState<BudgetComparisonType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getPeriodDates = () => {
    const now = new Date();
    if (period === 'monthly') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      };
    } else {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear() + 1, 0, 1);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      };
    }
  };

  const loadComparisons = async () => {
    setIsLoading(true);
    const { start, end } = getPeriodDates();
    const results = await getBudgetComparison(budget, start, end);
    setComparisons(results);
    setIsLoading(false);
  };

  useEffect(() => {
    // Delay para garantir que os dados foram atualizados no banco
    const timeout = setTimeout(() => {
      loadComparisons();
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [budget, budget?.total_amount, budget?.budget_categories?.length]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage <= 75) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (percentage <= 100) {
      return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage <= 75) return 'text-green-600';
    if (percentage <= 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 75) return 'bg-green-500';
    if (percentage <= 100) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const totalPlanned = comparisons.reduce((sum, comp) => sum + comp.planned, 0);
  const totalActual = comparisons.reduce((sum, comp) => sum + comp.actual, 0);
  const totalPercentage = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Resumo Geral */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-md font-medium text-gray-900">
            Resumo {period === 'monthly' ? 'do Mês' : 'do Ano'}
          </h5>
          <Button
            onClick={loadComparisons}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Planejado</p>
            <p className="text-lg font-semibold text-blue-600">
              {formatCurrency(totalPlanned)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Realizado</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(totalActual)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Diferença</p>
            <p className={`text-lg font-semibold ${totalActual <= totalPlanned ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalPlanned - totalActual)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Progresso</span>
            <span className={`text-sm font-medium ${getStatusColor(totalPercentage)}`}>
              {totalPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={Math.min(totalPercentage, 100)} 
            className="h-2"
          />
        </div>
      </Card>

      {/* Detalhes por Categoria */}
      {comparisons.length > 1 && (
        <div className="space-y-3">
          <h6 className="text-sm font-medium text-gray-900">Por Categoria</h6>
          {comparisons.map((comparison) => (
            <Card key={comparison.category} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(comparison.percentage)}
                  <span className="font-medium text-gray-900">
                    {comparison.category}
                  </span>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(comparison.percentage)}`}>
                  {comparison.percentage.toFixed(1)}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                <div>
                  <p className="text-gray-600">Planejado</p>
                  <p className="font-medium">{formatCurrency(comparison.planned)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Realizado</p>
                  <p className="font-medium">{formatCurrency(comparison.actual)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Diferença</p>
                  <p className={`font-medium ${comparison.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(comparison.difference)}
                  </p>
                </div>
              </div>

              <Progress 
                value={Math.min(comparison.percentage, 100)} 
                className="h-2"
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BudgetComparison;
