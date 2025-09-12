
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
    <div className="card-hero animate-scale-in relative overflow-hidden" style={{ position: 'relative' }}>
      {/* Formas orgânicas decorativas */}
      <div className="organic-shape absolute top-4 right-8 w-20 h-20 opacity-20 animate-float"></div>
      <div className="organic-shape absolute bottom-6 left-12 w-16 h-16 opacity-15 animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl shadow-lg" style={{ 
            background: 'linear-gradient(135deg, var(--support-info-100), rgba(74,144,226,.1))',
            border: '1px solid var(--support-info-200)'
          }}>
            <Shield className="w-8 h-8" style={{ color: 'var(--support-info)' }} />
          </div>
          <div>
            <h3 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
              🎯 Score de Saúde Financeira
            </h3>
            <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
              {getLevelDescription(scoreDetails.level)}
            </p>
          </div>
        </div>
        
        <div className="px-4 py-2 rounded-full shadow-sm" style={{
          background: scoreDetails.score >= 81 ? 'linear-gradient(135deg, var(--support-success-100), var(--support-success-200))' :
          scoreDetails.score >= 61 ? 'linear-gradient(135deg, var(--support-info-100), var(--support-info-200))' :
          scoreDetails.score >= 41 ? 'linear-gradient(135deg, var(--support-warning-100), var(--support-warning-200))' :
          'linear-gradient(135deg, var(--support-danger-100), var(--support-danger-200))',
          color: scoreDetails.score >= 81 ? 'var(--support-success)' :
          scoreDetails.score >= 61 ? 'var(--support-info)' :
          scoreDetails.score >= 41 ? 'var(--support-warning)' :
          'var(--support-danger)',
          border: '1px solid ' + (scoreDetails.score >= 81 ? 'var(--support-success-200)' :
          scoreDetails.score >= 61 ? 'var(--support-info-200)' :
          scoreDetails.score >= 41 ? 'var(--support-warning-200)' :
          'var(--support-danger-200)'),
          fontWeight: 'bold',
          fontSize: '0.9rem'
        }}>
          {getScoreLabel(scoreDetails.score)}
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="text-5xl font-black mb-4 fn-number relative" style={{ 
          color: 'var(--text)', 
          fontFamily: 'var(--font-display)',
          textShadow: '0 2px 4px rgba(42,74,71,.1)'
        }}>
          {scoreDetails.score}
          <span className="text-2xl opacity-60">/100</span>
        </div>
        
        <div className="w-full rounded-full h-6 mb-6 overflow-hidden" style={{ 
          background: 'rgba(42,74,71,.08)',
          boxShadow: 'inset 0 2px 4px rgba(42,74,71,.1)' 
        }}>
          <div 
            className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
            style={{ 
              width: `${scoreDetails.score}%`, 
              background: `linear-gradient(90deg, 
                ${scoreDetails.score >= 81 ? 'var(--support-success)' :
                scoreDetails.score >= 61 ? 'var(--support-info)' :
                scoreDetails.score >= 41 ? 'var(--support-warning)' :
                'var(--support-danger)'}, 
                var(--brand-primary))`,
              boxShadow: '0 2px 6px rgba(42,74,71,.2)'
            }}
          >
            {/* Brilho na barra */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
          </div>
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
