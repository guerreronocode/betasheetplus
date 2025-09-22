import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExpenses } from '@/hooks/useExpenses';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { formatCurrency } from '@/utils/formatters';

interface ExpensesByAccountProps {
  selectedMonth: number;
  selectedYear: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

export const ExpensesByAccount = ({ selectedMonth, selectedYear }: ExpensesByAccountProps) => {
  const { expenses } = useExpenses();
  const { bankAccounts } = useBankAccounts();

  // Filter expenses by selected period and group by bank account
  const filteredExpenses = expenses.filter(expense => {
    const date = new Date(expense.date);
    return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
  });

  const expensesByAccount = filteredExpenses.reduce((acc, expense) => {
    if (!expense.bank_account_id) return acc;
    
    const account = bankAccounts.find(acc => acc.id === expense.bank_account_id);
    const accountName = account?.name || 'Conta Desconhecida';
    
    if (!acc[accountName]) {
      acc[accountName] = 0;
    }
    acc[accountName] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByAccount)
    .map(([account, amount]) => ({
      name: account,
      value: amount,
    }))
    .sort((a, b) => b.value - a.value);

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="h-full min-w-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-card-foreground">
          Gastos por Conta
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 min-w-0">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <p>Nenhum gasto registrado neste período</p>
          </div>
        ) : (
          <ScrollArea className="h-48">
            <div className="space-y-3">
              {chartData.map((item, index) => {
                const percentage = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
                return (
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
                        {formatCurrency(item.value)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}% do total gasto
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