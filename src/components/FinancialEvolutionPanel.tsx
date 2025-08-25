
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { useFinancialEvolution } from '@/hooks/useFinancialEvolution';

const FinancialEvolutionPanel = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('12');
  const { data: evolutionData, isLoading } = useFinancialEvolution(Number(selectedPeriod));

  const periodOptions = [
    { value: '6', label: 'Últimos 6 meses' },
    { value: '12', label: 'Último ano' },
    { value: '24', label: 'Últimos 2 anos' },
    { value: '36', label: 'Últimos 3 anos' }
  ];

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const currentData = evolutionData?.[evolutionData.length - 1];
  const previousData = evolutionData?.[evolutionData.length - 2];

  console.log('Evolution Data:', evolutionData);
  console.log('Current Data:', currentData);
  console.log('Previous Data:', previousData);

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const netWorthChange = currentData && previousData 
    ? calculateChange(currentData.netWorth, previousData.netWorth)
    : 0;

  const debtChange = currentData && previousData 
    ? calculateChange(currentData.totalDebt, previousData.totalDebt)
    : 0;

  const reservesChange = currentData && previousData 
    ? calculateChange(currentData.liquidReserves, previousData.liquidReserves)
    : 0;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Evolução Financeira</h3>
              <p className="text-sm text-gray-600">
                Acompanhe o histórico da sua situação financeira
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards de indicadores principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Patrimônio Líquido</p>
                <p className="text-2xl font-bold text-green-600">
                  {currentData ? (currentData.netWorth || 0).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }) : 'R$ 0,00'}
                </p>
                <p className="text-xs text-gray-400">Debug: {JSON.stringify(currentData)}</p>
              </div>
              <div className={`flex items-center space-x-1 ${netWorthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netWorthChange >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(netWorthChange).toFixed(1)}%
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Dívidas</p>
                <p className="text-2xl font-bold text-red-600">
                  {currentData ? (currentData.totalDebt || 0).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }) : 'R$ 0,00'}
                </p>
                <p className="text-xs text-gray-400">Debug: totalDebt = {currentData?.totalDebt}</p>
              </div>
              <div className={`flex items-center space-x-1 ${debtChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {debtChange <= 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(debtChange).toFixed(1)}%
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reservas Líquidas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentData ? (currentData.liquidReserves || 0).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }) : 'R$ 0,00'}
                </p>
                <p className="text-xs text-gray-400">Debug: liquidReserves = {currentData?.liquidReserves}</p>
              </div>
              <div className={`flex items-center space-x-1 ${reservesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reservesChange >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(reservesChange).toFixed(1)}%
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráfico de evolução */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
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
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(value),
                  ''
                ]}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="netWorth" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Patrimônio Líquido"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="totalDebt" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Total de Dívidas"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="liquidReserves" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Reservas Líquidas"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {evolutionData && evolutionData.length === 0 && (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Dados insuficientes
            </h4>
            <p className="text-gray-600">
              Continue registrando suas transações e patrimônio para ver a evolução financeira
            </p>
          </div>
        )}
      </Card>

      {/* Informações adicionais */}
      <Card className="p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">
          Como interpretar os dados
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-green-50 rounded-lg">
            <h5 className="font-medium text-green-800 mb-2">📈 Patrimônio Líquido</h5>
            <p className="text-green-700">
              Representa a diferença entre todos os seus ativos e passivos. 
              Uma tendência crescente indica melhora na saúde financeira.
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <h5 className="font-medium text-red-800 mb-2">📉 Total de Dívidas</h5>
            <p className="text-red-700">
              Inclui todas as suas dívidas: cartões de crédito, financiamentos e outros passivos. 
              Uma tendência decrescente é positiva.
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">💰 Reservas Líquidas</h5>
            <p className="text-blue-700">
              Dinheiro disponível imediatamente: contas bancárias e investimentos com liquidez diária. 
              Importante para emergências.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FinancialEvolutionPanel;
