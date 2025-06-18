
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useCreditCardProjections } from '@/hooks/useCreditCardProjections';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const CreditLimitProjectionChart: React.FC = () => {
  const { creditCards } = useCreditCards();
  const [selectedCardId, setSelectedCardId] = React.useState<string>('');
  const { projections, isLoading } = useCreditCardProjections(selectedCardId);

  React.useEffect(() => {
    if (creditCards.length > 0 && !selectedCardId) {
      setSelectedCardId(creditCards[0].id);
    }
  }, [creditCards, selectedCardId]);

  if (creditCards.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Nenhum cartão de crédito cadastrado para projeção.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = projections.map(projection => ({
    month: format(new Date(projection.month), 'MMM/yy', { locale: ptBR }),
    fullDate: projection.month,
    availableLimit: Number(projection.projected_available_limit),
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Projeção de Limite Disponível</CardTitle>
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
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
              Carregando projeções...
            </div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Limite Disponível']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const fullDate = payload[0].payload.fullDate;
                      return format(new Date(fullDate), 'MMMM/yyyy', { locale: ptBR });
                    }
                    return label;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="availableLimit" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">
              Nenhuma projeção disponível para este cartão.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
