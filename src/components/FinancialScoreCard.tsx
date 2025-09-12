
import React from 'react';
import { Shield, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFinancialScore } from '@/hooks/useFinancialScore';

const FinancialScoreCard = () => {
  const { scoreDetails, isLoading } = useFinancialScore();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!scoreDetails) {
    return (
      <Card className="p-6">
        <div className="text-center py-4">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Dados insuficientes para calcular o score</p>
        </div>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 81) return 'text-green-600';
    if (score >= 61) return 'text-blue-600';
    if (score >= 41) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 81) return 'Excelente';
    if (score >= 61) return 'Boa';
    if (score >= 41) return 'Instável';
    return 'Crítica';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 81) return 'bg-green-500';
    if (score >= 61) return 'bg-blue-500';
    if (score >= 41) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLevelDescription = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'Organização robusta, reserva construída, baixa dívida, patrimônio crescendo';
      case 'good':
        return 'Boa situação, mas com alguns pontos de melhoria';
      case 'unstable':
        return 'Riscos moderados, precisa ajustar vários pontos';
      case 'critical':
        return 'Alta vulnerabilidade, necessita ação imediata';
      default:
        return '';
    }
  };

  return (
    <div className="card" style={{ background: 'linear-gradient(135deg, var(--brand-ivory), rgba(232,241,87,.3))' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg" style={{ background: 'var(--support-info-100)' }}>
            <Shield className="w-6 h-6" style={{ color: 'var(--support-info-600)' }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-ink)' }}>Score de Saúde Financeira</h3>
            <p className="text-sm" style={{ color: 'var(--brand-ink)', opacity: 0.7, fontFamily: 'var(--font-sans)' }}>{getLevelDescription(scoreDetails.level)}</p>
          </div>
        </div>
        
        <Badge variant="outline" className={`${
          scoreDetails.score >= 81 ? 'bg-green-100 text-green-800 border-green-200' :
          scoreDetails.score >= 61 ? 'bg-blue-100 text-blue-800 border-blue-200' :
          scoreDetails.score >= 41 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
          'bg-red-100 text-red-800 border-red-200'
        }`}>
          {getScoreLabel(scoreDetails.score)}
        </Badge>
      </div>

      <div className="text-center mb-6">
        <div className="text-4xl font-bold mb-2 fn-number" style={{ color: 'var(--brand-ink)', fontFamily: 'var(--font-display)' }}>
          {scoreDetails.score}/100
        </div>
        
        <div className="w-full rounded-full h-4 mb-4" style={{ background: 'rgba(42,74,71,.1)' }}>
          <div 
            className="h-4 rounded-full transition-all duration-1000"
            style={{ width: `${scoreDetails.score}%`, background: 'linear-gradient(90deg, var(--brand-primary), rgba(232,241,87,.7))' }}
          ></div>
        </div>
      </div>

      {/* Pontos Fortes */}
      {scoreDetails.strengths.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-800">Pontos Fortes</span>
          </div>
          <div className="space-y-1">
            {scoreDetails.strengths.map((strength, index) => (
              <div key={index} className="text-sm text-green-700 pl-6">
                • {strength}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pontos de Atenção */}
      {scoreDetails.weaknesses.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-800">Pontos de Atenção</span>
          </div>
          <div className="space-y-1">
            {scoreDetails.weaknesses.slice(0, 2).map((weakness, index) => (
              <div key={index} className="text-sm text-orange-700 pl-6">
                • {weakness}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendações */}
      {scoreDetails.recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">Próximos Passos</span>
          </div>
          <div className="space-y-1">
            {scoreDetails.recommendations.slice(0, 2).map((rec, index) => (
              <div key={index} className="text-sm text-blue-700 pl-6">
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialScoreCard;
