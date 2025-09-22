import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreditCardPurchases } from '@/hooks/useCreditCardPurchases';
import { useCreditCards } from '@/hooks/useCreditCards';
import { formatCurrency } from '@/utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ExpensesByCreditCardProps {
  selectedMonth: number;
  selectedYear: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

export const ExpensesByCreditCard = ({ selectedMonth, selectedYear }: ExpensesByCreditCardProps) => {
  const { purchases } = useCreditCardPurchases();
  const { creditCards } = useCreditCards();

  // Filter purchases by selected period and group by credit card
  const filteredPurchases = purchases.filter(purchase => {
    const date = new Date(purchase.purchase_date);
    return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
  });

  const expensesByCreditCard = filteredPurchases.reduce((acc, purchase) => {
    const card = creditCards.find(card => card.id === purchase.credit_card_id);
    const cardName = card?.name || 'Cartão Desconhecido';
    
    if (!acc[cardName]) {
      acc[cardName] = 0;
    }
    acc[cardName] += purchase.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCreditCard)
    .map(([card, amount]) => ({
      name: card,
      value: amount,
    }))
    .sort((a, b) => b.value - a.value);

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalExpenses > 0 ? (data.value / totalExpenses) * 100 : 0;
      return (
        <div className="bg-card border rounded-lg p-2 shadow-md">
          <p className="text-card-foreground font-medium">{data.payload.name}</p>
          <p className="text-primary font-semibold">{formatCurrency(data.value)}</p>
          <p className="text-muted-foreground text-sm">{percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full min-w-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-card-foreground">
          Gastos por Cartão
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 min-w-0">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <p>Nenhum gasto no cartão neste período</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-48 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {chartData.map((item, index) => {
                const percentage = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-card-foreground truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
                      <span className="font-medium text-card-foreground">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};