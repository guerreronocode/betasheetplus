import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useCreditCardProjections } from '@/hooks/useCreditCardProjections';
import { formatCurrency } from '@/utils/formatters';

interface CreditLimitProjectionCardProps {
  creditCardId: string;
}

export const CreditLimitProjectionCard: React.FC<CreditLimitProjectionCardProps> = ({ 
  creditCardId 
}) => {
  const { projections, isLoading } = useCreditCardProjections(creditCardId);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground">
            Carregando projeções...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (projections.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground">
            Nenhuma projeção disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = projections.map(projection => ({
    month: new Date(projection.month).toLocaleDateString('pt-BR', { 
      month: 'short', 
      year: '2-digit' 
    }),
    disponivel: Number(projection.projected_available_limit)
  }));

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4" />
          Projeção de Limite (12 meses)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10 }}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Disponível']}
                labelFormatter={(label) => `Mês: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="disponivel" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};