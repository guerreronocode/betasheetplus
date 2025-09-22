import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
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
      acc[cardName] = {
        amount: 0,
        card: card
      };
    }
    acc[cardName].amount += purchase.amount;
    return acc;
  }, {} as Record<string, { amount: number; card: any }>);

  const chartData = Object.entries(expensesByCreditCard)
    .map(([cardName, data]) => ({
      name: cardName,
      value: data.amount,
      card: data.card,
      creditLimit: data.card?.credit_limit || 0,
      usagePercentage: data.card?.credit_limit ? (data.amount / data.card.credit_limit) * 100 : 0
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
            <div className="space-y-3">
              {chartData.map((item, index) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-card-foreground text-sm truncate">{item.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(item.value)} / {formatCurrency(item.creditLimit)}
                    </div>
                  </div>
                  {item.creditLimit > 0 && (
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={Math.min(item.usagePercentage, 100)} 
                        className="flex-1 h-2"
                      />
                      <span className={`text-xs font-medium min-w-[40px] ${
                        item.usagePercentage > 80 ? 'text-red-600' : item.usagePercentage > 60 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {item.usagePercentage.toFixed(0)}%
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {item.creditLimit > 0 ? (
                      <span className={item.usagePercentage > 80 ? 'text-red-600' : 'text-green-600'}>
                        Disponível: {formatCurrency(item.creditLimit - item.value)}
                      </span>
                    ) : (
                      <span>Limite não definido</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};