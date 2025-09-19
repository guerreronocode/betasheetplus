import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useFinancialEvolution } from '@/hooks/useFinancialEvolution';

const FinancialEvolutionPanel = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('12');
  const { data: evolutionData, isLoading } = useFinancialEvolution(Number(selectedPeriod));

  const periodOptions = [
    { value: '6', label: '6 meses' },
    { value: '12', label: '1 ano' },
    { value: '24', label: '2 anos' },
    { value: '36', label: '3 anos' }
  ];

  if (isLoading) {
    return (
      <Card className="p-4 h-full">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const currentData = evolutionData?.[evolutionData.length - 1];
  const previousData = evolutionData?.[evolutionData.length - 2];

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
    <Card className="p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Evolução Financeira</h3>
            <p className="text-xs text-gray-600">Últimos {selectedPeriod} meses</p>
          </div>
        </div>
        
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map(option => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cards de indicadores principais */}
      <div className="grid grid-cols-1 gap-2 mb-4">
        <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
          <div>
            <p className="text-xs text-green-600 font-medium">Patrimônio Líquido</p>
            <p className="text-sm font-bold text-green-700">
              {currentData ? (currentData.netWorth || 0).toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }) : 'R$ 0,00'}
            </p>
          </div>
          <div className={`flex items-center space-x-1 ${netWorthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netWorthChange >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="text-xs font-medium">
              {Math.abs(netWorthChange).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
          <div>
            <p className="text-xs text-red-600 font-medium">Total de Dívidas</p>
            <p className="text-sm font-bold text-red-700">
              {currentData ? (currentData.totalDebt || 0).toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }) : 'R$ 0,00'}
            </p>
          </div>
          <div className={`flex items-center space-x-1 ${debtChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {debtChange <= 0 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <TrendingUp className="w-3 h-3" />
            )}
            <span className="text-xs font-medium">
              {Math.abs(debtChange).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
          <div>
            <p className="text-xs text-blue-600 font-medium">Reservas Líquidas</p>
            <p className="text-sm font-bold text-blue-700">
              {currentData ? (currentData.liquidReserves || 0).toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }) : 'R$ 0,00'}
            </p>
          </div>
          <div className={`flex items-center space-x-1 ${reservesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {reservesChange >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="text-xs font-medium">
              {Math.abs(reservesChange).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Gráfico de evolução */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={evolutionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={40}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
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
              labelFormatter={(label) => `${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="netWorth" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Patrimônio"
              dot={{ fill: '#10B981', strokeWidth: 1, r: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="totalDebt" 
              stroke="#EF4444" 
              strokeWidth={2}
              name="Dívidas"
              dot={{ fill: '#EF4444', strokeWidth: 1, r: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="liquidReserves" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Reservas"
              dot={{ fill: '#3B82F6', strokeWidth: 1, r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {evolutionData && evolutionData.length === 0 && (
        <div className="text-center py-8">
          <Wallet className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            Dados insuficientes
          </h4>
          <p className="text-xs text-gray-600">
            Continue registrando para ver a evolução
          </p>
        </div>
      )}
    </Card>
  );
};

export default FinancialEvolutionPanel;