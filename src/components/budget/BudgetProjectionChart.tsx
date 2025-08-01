import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useBudgets } from '@/hooks/useBudgets';
import { usePlannedIncome } from '@/hooks/usePlannedIncome';

export const BudgetProjectionChart: React.FC = () => {
  const { monthlyBudget, yearlyBudget } = useBudgets();
  const { plannedIncome } = usePlannedIncome();

  const projectionData = useMemo(() => {
    const currentDate = new Date();
    const data = [];
    let cumulativeBalance = 0;

    // Gerar dados para os próximos 12 meses
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthKey = date.toISOString().slice(0, 10);
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

      // Calcular receita prevista para este mês (incluindo recorrentes)
      const specificIncome = plannedIncome
        .filter(income => !income.is_recurring && income.month === monthKey)
        .reduce((sum, income) => sum + income.planned_amount, 0);
      
      const recurringIncome = plannedIncome
        .filter(income => {
          if (!income.is_recurring) return false;
          const startMonth = new Date(income.recurring_start_month || income.month);
          const endMonth = income.recurring_end_month ? new Date(income.recurring_end_month) : null;
          return date >= startMonth && (!endMonth || date <= endMonth);
        })
        .reduce((sum, income) => sum + income.planned_amount, 0);
      
      const monthlyPlannedIncome = specificIncome + recurringIncome;

      // Calcular orçamento mensal seguindo a nova regra:
      // 1. Se houver categorias no orçamento mensal, usar soma das categorias
      // 2. Caso contrário, usar valor fixo mensal ou proporcional do anual
      // 3. Nenhum valor = zero
      let monthlyBudgetAmount = 0;
      
      if (monthlyBudget?.budget_categories && monthlyBudget.budget_categories.length > 0) {
        // Prioridade: soma das categorias do orçamento mensal
        monthlyBudgetAmount = monthlyBudget.budget_categories.reduce(
          (sum, category) => sum + (category.planned_amount || 0), 
          0
        );
      } else if (monthlyBudget?.total_amount) {
        // Fallback: valor fixo mensal
        monthlyBudgetAmount = monthlyBudget.total_amount;
      } else if (yearlyBudget?.budget_categories && yearlyBudget.budget_categories.length > 0) {
        // Orçamento anual com categorias (dividido por 12)
        monthlyBudgetAmount = yearlyBudget.budget_categories.reduce(
          (sum, category) => sum + (category.planned_amount || 0), 
          0
        ) / 12;
      } else if (yearlyBudget?.total_amount) {
        // Fallback: valor fixo anual dividido por 12
        monthlyBudgetAmount = yearlyBudget.total_amount / 12;
      }

      // Calcular saldo líquido do mês
      const monthlyNetBalance = monthlyPlannedIncome - monthlyBudgetAmount;
      cumulativeBalance += monthlyNetBalance;

      data.push({
        month: monthLabel,
        receita: monthlyPlannedIncome,
        orcamento: monthlyBudgetAmount,
        saldoMensal: monthlyNetBalance,
        saldoAcumulado: cumulativeBalance,
      });
    }

    return data;
  }, [monthlyBudget, yearlyBudget, plannedIncome]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const hasData = projectionData.some(item => item.receita > 0 || item.orcamento > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projeção de Balanço Anual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Configure seu orçamento mensal e adicione receitas previstas para visualizar a projeção.
            </p>
            <p className="text-sm text-muted-foreground">
              Use as abas "Planejamento" para configurar orçamentos e o botão "Receita Prevista" acima.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projeção de Balanço Anual</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs fill-muted-foreground"
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Line
                type="monotone"
                dataKey="receita"
                stroke="#10b981"
                strokeWidth={3}
                name="Receita Prevista"
                dot={{ fill: "#10b981", strokeWidth: 2, r: 5 }}
                strokeDasharray="0"
              />
              
              <Line
                type="monotone"
                dataKey="orcamento"
                stroke="#ef4444"
                strokeWidth={3}
                name="Orçamento"
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 5 }}
                strokeDasharray="5 5"
              />
              
              <Line
                type="monotone"
                dataKey="saldoMensal"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Saldo Mensal"
                dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                strokeDasharray="3 3"
              />
              
              <Line
                type="monotone"
                dataKey="saldoAcumulado"
                stroke="#3b82f6"
                strokeWidth={4}
                name="Saldo Acumulado"
                dot={{ fill: "#3b82f6", strokeWidth: 3, r: 6 }}
                strokeDasharray="0"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Resumo dos dados */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Receita Total Prevista</p>
            <p className="text-lg font-bold" style={{ color: '#10b981' }}>
              {formatCurrency(projectionData.reduce((sum, item) => sum + item.receita, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Orçamento Total</p>
            <p className="text-lg font-bold" style={{ color: '#ef4444' }}>
              {formatCurrency(projectionData.reduce((sum, item) => sum + item.orcamento, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Saldo Final Projetado</p>
            <p className="text-lg font-bold" style={{ color: '#3b82f6' }}>
              {formatCurrency(projectionData[projectionData.length - 1]?.saldoAcumulado || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Média Mensal</p>
            <p className="text-lg font-bold" style={{ color: '#f59e0b' }}>
              {formatCurrency((projectionData[projectionData.length - 1]?.saldoAcumulado || 0) / 12)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};