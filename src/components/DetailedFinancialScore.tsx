
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
    <div className="space-y-6">
      {/* Header com Score Geral */}
      <Card className="p-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Score de Saúde Financeira</h2>
            <p className="text-gray-600">Análise detalhada dos 5 pilares financeiros</p>
          </div>
        </div>
        
        <div className="text-5xl font-bold text-blue-600 mb-2">
          {scoreDetails.score}/100
        </div>
        
        <Badge className={`text-sm px-4 py-1 ${
          scoreDetails.score >= 81 ? 'bg-green-100 text-green-800' :
          scoreDetails.score >= 61 ? 'bg-blue-100 text-blue-800' :
          scoreDetails.score >= 41 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          Saúde Financeira {
            scoreDetails.score >= 81 ? 'Excelente' :
            scoreDetails.score >= 61 ? 'Boa' :
            scoreDetails.score >= 41 ? 'Instável' : 'Crítica'
          }
        </Badge>
      </Card>

      {/* Detalhamento por Critério */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {criteriaConfig.map((config) => {
          const score = scoreDetails.criteria[config.key];
          const Icon = config.icon;
          
          return (
            <Card key={config.key} className={`p-6 ${getCriteriaColor(score)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white bg-opacity-50`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{config.title}</h3>
                    <p className="text-sm opacity-75">{config.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold">{Math.round(score)}</div>
                  <div className="text-sm opacity-75">pts</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{Math.round(score)}%</span>
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

      {/* Recomendações Completas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Plano de Ação Personalizado
        </h3>
        
        <div className="space-y-3">
          {scoreDetails.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                {index + 1}
              </div>
              <p className="text-blue-800 flex-1">{recommendation}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DetailedFinancialScore;
