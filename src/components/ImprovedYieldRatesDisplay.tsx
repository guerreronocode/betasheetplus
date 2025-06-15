
import React from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface YieldRate {
  id: string;
  rate_type: string;
  rate_value: number;
  reference_date: string;
  last_update: string;
}

interface YieldRateHistory {
  id: string;
  rate_type: string;
  rate_value: number;
  reference_date: string;
  created_at: string;
}

interface ImprovedYieldRatesDisplayProps {
  yieldRates: YieldRate[];
  isLoading?: boolean;
}

const ImprovedYieldRatesDisplay: React.FC<ImprovedYieldRatesDisplayProps> = ({ yieldRates, isLoading }) => {
  // Fetch yield rates history for evolution info
  const { data: yieldHistory = [] } = useQuery({
    queryKey: ['yield_rates_history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('yield_rates_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) {
        console.log('Error fetching yield history:', error);
        return [];
      }
      return data as YieldRateHistory[];
    },
  });

  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  const getRateEvolution = (rateType: string) => {
    const currentRate = yieldRates.find(r => r.rate_type === rateType);
    if (!currentRate) return { trend: 'stable', change: 0, evolution: [] };

    const rateHistory = yieldHistory
      .filter(h => h.rate_type === rateType)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-7);

    if (rateHistory.length < 2) return { trend: 'stable', change: 0, evolution: rateHistory };

    const previousRate = rateHistory[rateHistory.length - 2].rate_value;
    const change = currentRate.rate_value - previousRate;
    const trend = change > 0.01 ? 'up' : change < -0.01 ? 'down' : 'stable';

    return { trend, change, evolution: rateHistory };
  };

  const getTotalYield = (principal: number, rate: number, days: number) => {
    const dailyRate = rate / 100 / 365;
    return principal * Math.pow(1 + dailyRate, days) - principal;
  };

  // Data de referência: sempre hoje
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold">Taxas de Rendimento e Evolução</h3>
        </div>
        <span className="text-sm text-gray-500">Referência: {getCurrentDate()}</span>
      </div>

      {yieldRates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Nenhuma taxa disponível</p>
          <p className="text-sm">As taxas serão mostradas assim que disponíveis.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {yieldRates.map((rate) => {
              const evolution = getRateEvolution(rate.rate_type);
              const TrendIcon = evolution.trend === 'up' ? TrendingUp : 
                               evolution.trend === 'down' ? TrendingDown : BarChart3;
              const trendColor = evolution.trend === 'up' ? 'text-green-600' : 
                                evolution.trend === 'down' ? 'text-red-600' : 'text-gray-600';
              
              return (
                <div 
                  key={rate.id} 
                  className="p-5 rounded-xl border bg-white border-gray-200 transition-all hover:shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg uppercase text-gray-800">{rate.rate_type}</span>
                      <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPercentage(rate.rate_value)}
                      </div>
                      {evolution.change !== 0 && (
                        <div className={`text-sm ${trendColor}`}>
                          {evolution.change > 0 ? '+' : ''}{formatPercentage(evolution.change)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Referência:</span> {getCurrentDate()}
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Simulação R$ 10.000 em 30 dias:</div>
                      <div className="font-semibold text-green-600">
                        +{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                          getTotalYield(10000, rate.rate_value, 30)
                        )}
                      </div>
                    </div>
                    {evolution.evolution.length > 1 && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-600 mb-2">Evolução (últimos registros):</div>
                        <div className="flex items-end space-x-1 h-8">
                          {evolution.evolution.map((point, index) => {
                            const maxValue = Math.max(...evolution.evolution.map(p => p.rate_value));
                            const height = (point.rate_value / maxValue) * 100;
                            return (
                              <div
                                key={index}
                                className="bg-blue-500 rounded-t"
                                style={{ 
                                  height: `${height}%`,
                                  width: `${100 / evolution.evolution.length}%`,
                                  opacity: index === evolution.evolution.length - 1 ? 1 : 0.6
                                }}
                                title={`${formatPercentage(point.rate_value)} em ${new Date(point.created_at).toLocaleDateString('pt-BR')}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Como interpretar:</p>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>CDI:</strong> Taxa interbancária, base para investimentos de renda fixa</li>
                  <li>• <strong>SELIC:</strong> Taxa básica de juros da economia brasileira</li>
                  <li>• <strong>IPCA:</strong> Índice de inflação oficial do país</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default ImprovedYieldRatesDisplay;
