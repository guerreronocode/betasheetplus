import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCreditCardPurchases } from '@/hooks/useCreditCardPurchases';
import { useCreditCards } from '@/hooks/useCreditCards';
import { formatCurrency } from '@/utils/formatters';

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
          <ScrollArea className="h-48">
            <div className="space-y-2 pr-2">
              {chartData.map((item, index) => {
                const percentage = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-card-foreground font-medium truncate">{item.name}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="font-semibold text-card-foreground">
                        {formatCurrency(item.value)}
                      </span>
                      <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};