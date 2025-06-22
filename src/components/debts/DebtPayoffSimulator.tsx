import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingDown, Target, Calculator, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { DebtData } from '@/services/debtService';
import { DebtPayoffCalculatorService } from '@/services/debtPayoffService';
import { formatCurrency } from '@/utils/formatters';

interface DebtPayoffSimulatorProps {
  debts: DebtData[];
  onBackToManager: () => void;
  onStartTracker: (strategy: 'snowball' | 'avalanche') => void;
}

const DebtPayoffSimulator: React.FC<DebtPayoffSimulatorProps> = ({
  debts,
  onBackToManager,
  onStartTracker
}) => {
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [selectedStrategy, setSelectedStrategy] = useState<'snowball' | 'avalanche'>('snowball');

  // Filtrar apenas dívidas ativas
  const activeDebts = useMemo(() => 
    debts.filter(debt => debt.status === 'active' && debt.remaining_balance > 0), 
    [debts]
  );

  // Calcular estratégias
  const strategies = useMemo(() => {
    if (activeDebts.length === 0) return null;
    return DebtPayoffCalculatorService.compareStrategies(activeDebts, extraPayment);
  }, [activeDebts, extraPayment]);

  if (activeDebts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Parabéns! Você não tem dívidas ativas
        </h3>
        <p className="text-gray-600 mb-4">
          Continue mantendo suas finanças organizadas e sem dívidas.
        </p>
        <Button onClick={onBackToManager}>
          Voltar ao Gerenciador
        </Button>
      </Card>
    );
  }

  if (!strategies) {
    return (
      <Card className="p-6">
        <div className="text-center">Carregando simulações...</div>
      </Card>
    );
  }

  const currentStrategy = strategies[selectedStrategy];
  const recommendation = strategies.recommendation;

  // Dados para o gráfico de evolução
  const chartData = currentStrategy.monthlyTimeline.slice(0, 24).map(month => ({
    month: `Mês ${month.month}`,
    totalRemaining: month.totalRemaining,
    monthlyPayment: month.monthlyPayment,
    interestPaid: month.interestPaid
  }));

  const getStrategyColor = (strategy: 'snowball' | 'avalanche') => {
    return strategy === 'snowball' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const getRecommendationIcon = () => {
    if (recommendation.recommendedStrategy === selectedStrategy) {
      return <Award className="w-4 h-4 text-yellow-500" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calculator className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Simulador de Quitação de Dívidas
            </h3>
            <p className="text-sm text-gray-600">
              Compare as estratégias Bola de Neve e Avalanche
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={onBackToManager}>
          Voltar ao Gerenciador
        </Button>
      </div>

      {/* Recomendação Inteligente */}
      <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-800 mb-1">
              Recomendação Inteligente
            </h4>
            <p className="text-sm text-yellow-700 mb-2">
              {recommendation.reason}
            </p>
            <div className="flex items-center gap-2">
              <Badge className={getStrategyColor(recommendation.recommendedStrategy)}>
                {recommendation.recommendedStrategy === 'snowball' ? 'Bola de Neve' : 'Avalanche'}
              </Badge>
              <span className="text-xs text-yellow-600">
                Confiança: {recommendation.confidenceScore}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Configurações */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="extra-payment">Pagamento Extra Mensal (Opcional)</Label>
            <Input
              id="extra-payment"
              type="number"
              min="0"
              step="50"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Number(e.target.value) || 0)}
              placeholder="0,00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Valor adicional que você pode pagar todo mês
            </p>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <strong>Total de dívidas ativas:</strong> {activeDebts.length}<br />
              <strong>Valor total:</strong> {formatCurrency(
                activeDebts.reduce((sum, debt) => sum + debt.remaining_balance, 0)
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Comparação de Estratégias */}
      <Tabs value={selectedStrategy} onValueChange={(value) => setSelectedStrategy(value as 'snowball' | 'avalanche')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="snowball" className="flex items-center gap-2">
            Bola de Neve
            {recommendation.recommendedStrategy === 'snowball' && getRecommendationIcon()}
          </TabsTrigger>
          <TabsTrigger value="avalanche" className="flex items-center gap-2">
            Avalanche
            {recommendation.recommendedStrategy === 'avalanche' && getRecommendationIcon()}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="snowball" className="space-y-4">
          <StrategyDetails 
            strategy={strategies.snowball}
            title="Estratégia Bola de Neve"
            description="Ataca primeiro as menores dívidas para gerar momentum psicológico"
            color="blue"
            onStartTracker={onStartTracker}
            strategyType="snowball"
          />
        </TabsContent>

        <TabsContent value="avalanche" className="space-y-4">
          <StrategyDetails 
            strategy={strategies.avalanche}
            title="Estratégia Avalanche"
            description="Prioriza as dívidas com maiores taxas de juros para máxima economia"
            color="purple"
            onStartTracker={onStartTracker}
            strategyType="avalanche"
          />
        </TabsContent>
      </Tabs>

      {/* Gráfico de Evolução */}
      <Card className="p-6">
        <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-green-600" />
          Evolução das Dívidas - {selectedStrategy === 'snowball' ? 'Bola de Neve' : 'Avalanche'}
        </h4>
        
        <div className="h-80 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value) => 
                  new Intl.NumberFormat('pt-BR', {
                    notation: 'compact',
                    style: 'currency',
                    currency: 'BRL'
                  }).format(value)
                }
              />
              <Tooltip 
                formatter={(value: any) => [
                  formatCurrency(value),
                  ''
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalRemaining" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Saldo Devedor Total"
              />
              <Line 
                type="monotone" 
                dataKey="monthlyPayment" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Pagamento Mensal"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-sm text-gray-600">
          <p>* Gráfico mostra os primeiros 24 meses da estratégia</p>
        </div>
      </Card>

      {/* Comparação Lado a Lado */}
      <Card className="p-6">
        <h4 className="text-md font-semibold mb-4">Comparação das Estratégias</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg bg-blue-50">
            <h5 className="font-semibold text-blue-800 mb-3">🏔️ Bola de Neve</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tempo total:</span>
                <span className="font-semibold">{strategies.snowball.totalMonthsToPayoff} meses</span>
              </div>
              <div className="flex justify-between">
                <span>Economia em juros:</span>
                <span className="font-semibold">{formatCurrency(strategies.snowball.totalInterestSaved)}</span>
              </div>
              <div className="text-xs text-blue-600 mt-2">
                ✅ Vitórias rápidas motivam<br />
                ✅ Fácil de seguir<br />
                ⚠️ Pode pagar mais juros
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-purple-50">
            <h5 className="font-semibold text-purple-800 mb-3">⚡ Avalanche</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tempo total:</span>
                <span className="font-semibold">{strategies.avalanche.totalMonthsToPayoff} meses</span>
              </div>
              <div className="flex justify-between">
                <span>Economia em juros:</span>
                <span className="font-semibold">{formatCurrency(strategies.avalanche.totalInterestSaved)}</span>
              </div>
              <div className="text-xs text-purple-600 mt-2">
                ✅ Máxima economia financeira<br />
                ✅ Estratégia matematicamente ótima<br />
                ⚠️ Requer mais disciplina
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Componente auxiliar para mostrar detalhes da estratégia
const StrategyDetails: React.FC<{
  strategy: any;
  title: string;
  description: string;
  color: 'blue' | 'purple';
  onStartTracker: (strategy: 'snowball' | 'avalanche') => void;
  strategyType: 'snowball' | 'avalanche';
}> = ({ strategy, title, description, color, onStartTracker, strategyType }) => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold mb-2">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <Button 
            onClick={() => onStartTracker(strategyType)}
            className={`${color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            <Target className="w-4 h-4 mr-2" />
            Iniciar Acompanhamento
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Prazo total:</span>
            <div className="font-semibold">{strategy.totalMonthsToPayoff} meses</div>
          </div>
          <div>
            <span className="text-gray-500">Economia de juros:</span>
            <div className="font-semibold text-green-600">
              {formatCurrency(strategy.totalInterestSaved)}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Valor total:</span>
            <div className="font-semibold">
              {formatCurrency(strategy.totalAmount)}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Primeira dívida:</span>
            <div className="font-semibold text-xs">
              {strategy.debtOrder[0]?.debtName.substring(0, 20)}...
            </div>
          </div>
        </div>
      </Card>

      {/* Ordem de Pagamento */}
      <Card className="p-4">
        <h5 className="font-semibold mb-3">📋 Ordem de Pagamento</h5>
        <div className="space-y-2">
          {strategy.debtOrder.slice(0, 5).map((debt: any, index: number) => (
            <div key={debt.debtId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full ${color === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'} flex items-center justify-center text-xs font-semibold`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-sm">{debt.debtName}</div>
                  <div className="text-xs text-gray-500">
                    Taxa: {debt.interestRate.toFixed(1)}% a.m.
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(debt.currentBalance)}</div>
                <div className="text-xs text-gray-500">
                  {formatCurrency(debt.monthlyPayment)}/mês
                </div>
              </div>
            </div>
          ))}
          {strategy.debtOrder.length > 5 && (
            <div className="text-center text-sm text-gray-500 py-2">
              ... e mais {strategy.debtOrder.length - 5} dívidas
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DebtPayoffSimulator;
