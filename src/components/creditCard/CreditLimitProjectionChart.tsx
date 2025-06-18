
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCreditCardProjections } from '@/hooks/useCreditCardProjections';
import { useCreditCards } from '@/hooks/useCreditCards';
import { formatCurrency } from '@/utils/formatters';
import { TrendingUp } from 'lucide-react';

export const CreditLimitProjectionChart: React.FC = () => {
  const [selectedCardId, setSelectedCardId] = React.useState<string>('');
  const { creditCards } = useCreditCards();
  const { projections, isLoading } = useCreditCardProjections(selectedCardId);

  const chartData = projections.map(projection => ({
    month: new Date(projection.month).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    limite: Number(projection.projected_available_limit)
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Projeção de Limite Disponível
          </CardTitle>
          <Select value={selectedCardId} onValueChange={setSelectedCardId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione um cartão" />
            </SelectTrigger>
            <SelectContent>
              {creditCards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {!selectedCardId ? (
          <div className="text-center py-8">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecione um cartão
            </h3>
            <p className="text-gray-500">
              Escolha um cartão para ver a projeção do limite disponível.
            </p>
          </div>
        ) : isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse">Carregando projeção...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma projeção disponível para este cartão.</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Limite Disponível']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="limite" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
