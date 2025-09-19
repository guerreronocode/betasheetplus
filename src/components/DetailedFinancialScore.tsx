
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
    <div className="space-y-4">
      {/* Header com Score Geral */}
      <Card className="p-4 text-center bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Score de Saúde Financeira</h2>
            <p className="text-xs text-gray-600">Análise dos 5 pilares financeiros</p>
          </div>
        </div>
        
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {scoreDetails.score}/100
        </div>
        
        <Badge className={`text-xs px-3 py-1 ${
          scoreDetails.score >= 81 ? 'bg-green-100 text-green-800' :
          scoreDetails.score >= 61 ? 'bg-blue-100 text-blue-800' :
          scoreDetails.score >= 41 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          Saúde {
            scoreDetails.score >= 81 ? 'Excelente' :
            scoreDetails.score >= 61 ? 'Boa' :
            scoreDetails.score >= 41 ? 'Instável' : 'Crítica'
          }
        </Badge>
      </Card>

      {/* Detalhamento por Critério */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {criteriaConfig.map((config) => {
          const score = scoreDetails.criteria[config.key];
          const Icon = config.icon;
          
          return (
            <Card key={config.key} className={`p-3 ${getCriteriaColor(score)}`}>
              <div className="flex flex-col items-center text-center mb-2">
                <div className={`p-2 rounded-lg bg-white bg-opacity-50 mb-2`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-semibold text-gray-900 mb-1">{config.title}</h3>
                <div className="text-lg font-bold">{Math.round(score)}</div>
                <div className="text-xs opacity-75">pts</div>
              </div>
              
              <div className="w-full bg-white bg-opacity-30 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-1000 ${getCriteriaProgressColor(score)}`}
                  style={{ width: `${Math.min(100, score)}%` }}
                ></div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recomendações Compactas */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          📋 Principais Recomendações
        </h3>
        
        <div className="space-y-2">
          {scoreDetails.recommendations.slice(0, 3).map((recommendation, index) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                {index + 1}
              </div>
              <p className="text-xs text-blue-800 flex-1">{recommendation}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DetailedFinancialScore;
