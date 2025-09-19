
import React from 'react';
import { Shield, Target, CreditCard, PiggyBank, TrendingUp, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFinancialScore } from '@/hooks/useFinancialScore';

const DetailedFinancialScore = () => {
  const { scoreDetails, isLoading } = useFinancialScore();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!scoreDetails) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Score Indisponível</h3>
          <p className="text-gray-600">
            Adicione suas transações, investimentos e dívidas para calcular seu score de saúde financeira.
          </p>
        </div>
      </Card>
    );
  }

  const criteriaConfig = [
    {
      key: 'debt' as keyof typeof scoreDetails.criteria,
      title: 'Endividamento',
      description: 'Controle de dívidas e comprometimento da renda',
      icon: CreditCard,
      color: 'red'
    },
    {
      key: 'emergency' as keyof typeof scoreDetails.criteria,
      title: 'Reserva de Emergência',
      description: 'Proteção para imprevistos financeiros',
      icon: Shield,
      color: 'green'
    },
    {
      key: 'spending' as keyof typeof scoreDetails.criteria,
      title: 'Organização dos Gastos',
      description: 'Equilíbrio entre receitas e despesas',
      icon: Target,
      color: 'blue'
    },
    {
      key: 'investment' as keyof typeof scoreDetails.criteria,
      title: 'Investimentos Ativos',
      description: 'Construção de patrimônio e aportes regulares',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      key: 'diversification' as keyof typeof scoreDetails.criteria,
      title: 'Diversificação',
      description: 'Distribuição de riscos nos investimentos',
      icon: BarChart3,
      color: 'orange'
    }
  ];

  const getCriteriaColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getCriteriaProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Score Geral - Parte Superior */}
        <div className="flex justify-center">
          <div className="flex flex-col justify-center items-center text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 min-w-64">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Score de Saúde Financeira</h2>
              </div>
            </div>
            
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {scoreDetails.score}/100
            </div>
            
            <Badge className={`text-sm px-3 py-1 ${
              scoreDetails.score >= 81 ? 'bg-green-100 text-green-800' :
              scoreDetails.score >= 61 ? 'bg-blue-100 text-blue-800' :
              scoreDetails.score >= 41 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {scoreDetails.score >= 81 ? 'Excelente' :
               scoreDetails.score >= 61 ? 'Boa' :
               scoreDetails.score >= 41 ? 'Instável' : 'Crítica'}
            </Badge>
          </div>
        </div>

        {/* Detalhamento por Critério - Parte Inferior */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {criteriaConfig.map((config) => {
            const score = scoreDetails.criteria[config.key];
            const Icon = config.icon;
            
            return (
              <Card key={config.key} className={`p-3 ${getCriteriaColor(score)}`}>
                <div className="flex flex-col items-center text-center h-full justify-between">
                  <div className="flex flex-col items-center mb-2">
                    <div className="p-1.5 rounded-lg bg-white bg-opacity-50 mb-1">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-semibold text-gray-900 leading-tight text-center">{config.title}</h3>
                    <div className="text-lg font-bold mt-1">{Math.round(score)}</div>
                  </div>
                  
                  <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${getCriteriaProgressColor(score)}`}
                      style={{ width: `${Math.min(100, score)}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default DetailedFinancialScore;
