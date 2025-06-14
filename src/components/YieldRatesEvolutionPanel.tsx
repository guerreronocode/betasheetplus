
import React, { useState } from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMarketData } from '@/hooks/useMarketData';

const YieldRatesEvolutionPanel = () => {
  const { yieldRates } = useMarketData();
  const [selectedRate, setSelectedRate] = useState<any>(null);
  const [showChart, setShowChart] = useState(false);

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getRateIcon = (rateType: string) => {
    const icons = {
      selic: '🏛️',
      cdi: '💰',
      ipca: '📊'
    };
    return icons[rateType as keyof typeof icons] || '📈';
  };

  const getRateDescription = (rateType: string) => {
    const descriptions = {
      selic: 'Taxa básica de juros da economia brasileira',
      cdi: 'Certificado de Depósito Interbancário',
      ipca: 'Índice Nacional de Preços ao Consumidor Amplo (acumulado 12 meses)'
    };
    return descriptions[rateType as keyof typeof descriptions] || 'Taxa de rendimento';
  };

  // Generate mock historical data for chart (in a real app, this would come from the database)
  const generateHistoricalData = (currentRate: number, rateType: string) => {
    const data = [];
    const months = 12;
    
    for (let i = months; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Generate mock variation around current rate
      const variation = (Math.random() - 0.5) * 2; // ±1% variation
      const rate = Math.max(0, currentRate + variation);
      
      data.push({
        date: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        rate: rate,
        formattedRate: formatPercentage(rate)
      });
    }
    
    return data;
  };

  const handleViewChart = (rate: any) => {
    setSelectedRate(rate);
    setShowChart(true);
  };

  // Get current date for display
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Indicadores BACEN</h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {yieldRates.map((rate) => (
            <div
              key={rate.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getRateIcon(rate.rate_type)}</span>
                  <span className="font-medium text-sm uppercase">{rate.rate_type}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewChart(rate)}
                  className="p-1 h-8 w-8"
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="mb-2">
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(rate.rate_value)} a.a
                </p>
              </div>
              
              <p className="text-xs text-gray-500">
                {getRateDescription(rate.rate_type)}
              </p>
            </div>
          ))}
        </div>

        {/* Current Date Display */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Última atualização:</strong> {getCurrentDate()}
          </p>
        </div>

        {yieldRates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Carregando indicadores BACEN...</p>
          </div>
        )}
      </Card>

      {/* Chart Dialog */}
      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-xl">{selectedRate && getRateIcon(selectedRate.rate_type)}</span>
              <span>Evolução da {selectedRate?.rate_type.toUpperCase()}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedRate && (
            <div className="mt-4">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Taxa Atual</p>
                    <p className="text-2xl font-bold">{formatPercentage(selectedRate.rate_value)} a.a</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Última Atualização</p>
                    <p className="font-medium">{getCurrentDate()}</p>
                  </div>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generateHistoricalData(selectedRate.rate_value, selectedRate.rate_type)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis 
                      domain={['dataMin - 0.5', 'dataMax + 0.5']}
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value.toFixed(2)}%`, selectedRate.rate_type.toUpperCase()]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <p className="text-sm text-gray-600 mt-4">
                {getRateDescription(selectedRate.rate_type)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default YieldRatesEvolutionPanel;
