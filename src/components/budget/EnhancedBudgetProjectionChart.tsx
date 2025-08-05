import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Checkbox } from '@/components/ui/checkbox';
import { usePlannedIncome } from '@/hooks/usePlannedIncome';
import { usePlannedExpenses } from '@/hooks/usePlannedExpenses';

interface ChartVisibilityState {
  saldoMensal: boolean;
  saldoAcumulado: boolean;
  receitaPrevista: boolean;
  despesaPrevista: boolean;
}

const DEFAULT_VISIBILITY: ChartVisibilityState = {
  saldoMensal: true,
  saldoAcumulado: true,
  receitaPrevista: false,
  despesaPrevista: false,
};

export const EnhancedBudgetProjectionChart: React.FC = () => {
  const { plannedIncome } = usePlannedIncome();
  const { plannedExpenses } = usePlannedExpenses();

  // Carregar estado salvo do localStorage ou usar padrão
  const [visibility, setVisibility] = useState<ChartVisibilityState>(() => {
    const saved = localStorage.getItem('budget-chart-visibility');
    return saved ? JSON.parse(saved) : DEFAULT_VISIBILITY;
  });

  // Salvar estado no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('budget-chart-visibility', JSON.stringify(visibility));
  }, [visibility]);

  const projectionData = useMemo(() => {
    const currentDate = new Date();
    const data = [];
    let cumulativeBalance = 0;

    // Gerar dados para os próximos 12 meses
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      // Gerar monthKey no formato YYYY-MM usando ano e mês diretamente
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

      // Calcular receita prevista para este mês (incluindo recorrentes)
      const specificIncome = plannedIncome
        .filter(income => !income.is_recurring && income.month === monthKey)
        .reduce((sum, income) => sum + income.planned_amount, 0);
      
      const recurringIncome = plannedIncome
        .filter(income => {
          if (!income.is_recurring) return false;
          // Usar formato direto para evitar problemas de timezone
          const startDate = income.recurring_start_month || income.month;
          const [startYear, startMonth] = startDate.split('-').map(n => parseInt(n));
          const endDate = income.recurring_end_month;
          const [endYear, endMonth] = endDate ? endDate.split('-').map(n => parseInt(n)) : [null, null];
          
          const currentYear = date.getFullYear();
          const currentMonth = date.getMonth() + 1; // getMonth() retorna 0-11, precisamos 1-12
          
          const isAfterStart = currentYear > startYear || (currentYear === startYear && currentMonth >= startMonth);
          const isBeforeEnd = !endDate || currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth);
          
          return isAfterStart && isBeforeEnd;
        })
        .reduce((sum, income) => sum + income.planned_amount, 0);
      
      const monthlyPlannedIncome = specificIncome + recurringIncome;

      // Calcular despesas previstas para este mês (incluindo recorrentes)
      const specificExpenses = plannedExpenses
        .filter(expense => !expense.is_recurring && expense.month === monthKey)
        .reduce((sum, expense) => sum + expense.planned_amount, 0);
      
      const recurringExpenses = plannedExpenses
        .filter(expense => {
          if (!expense.is_recurring) return false;
          // Usar formato direto para evitar problemas de timezone
          const startDate = expense.recurring_start_month || expense.month;
          const [startYear, startMonth] = startDate.split('-').map(n => parseInt(n));
          const endDate = expense.recurring_end_month;
          const [endYear, endMonth] = endDate ? endDate.split('-').map(n => parseInt(n)) : [null, null];
          
          const currentYear = date.getFullYear();
          const currentMonth = date.getMonth() + 1; // getMonth() retorna 0-11, precisamos 1-12
          
          const isAfterStart = currentYear > startYear || (currentYear === startYear && currentMonth >= startMonth);
          const isBeforeEnd = !endDate || currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth);
          
          return isAfterStart && isBeforeEnd;
        })
        .reduce((sum, expense) => sum + expense.planned_amount, 0);
      
      const monthlyPlannedExpenses = specificExpenses + recurringExpenses;

      // Calcular saldo líquido do mês
      const monthlyNetBalance = monthlyPlannedIncome - monthlyPlannedExpenses;
      cumulativeBalance += monthlyNetBalance;

      data.push({
        month: monthLabel,
        receitaPrevista: monthlyPlannedIncome,
        despesaPrevista: monthlyPlannedExpenses,
        saldoMensal: monthlyNetBalance,
        saldoAcumulado: cumulativeBalance,
      });
    }

    return data;
  }, [plannedIncome, plannedExpenses]);

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

  const handleVisibilityChange = (key: keyof ChartVisibilityState, checked: boolean) => {
    setVisibility(prev => ({ ...prev, [key]: checked }));
  };

  const hasData = projectionData.some(item => item.receitaPrevista > 0 || item.despesaPrevista > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projeção Financeira Anual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Configure suas receitas e despesas previstas para visualizar a projeção.
            </p>
            <p className="text-sm text-muted-foreground">
              Use a aba "Gestão" para adicionar suas projeções financeiras.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projeção Financeira Anual</CardTitle>
        
        {/* Controles de visibilidade */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="saldoMensal"
              checked={visibility.saldoMensal}
              onCheckedChange={(checked) => handleVisibilityChange('saldoMensal', checked as boolean)}
            />
            <label htmlFor="saldoMensal" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Saldo Mensal
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="saldoAcumulado"
              checked={visibility.saldoAcumulado}
              onCheckedChange={(checked) => handleVisibilityChange('saldoAcumulado', checked as boolean)}
            />
            <label htmlFor="saldoAcumulado" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Saldo Acumulado
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="receitaPrevista"
              checked={visibility.receitaPrevista}
              onCheckedChange={(checked) => handleVisibilityChange('receitaPrevista', checked as boolean)}
            />
            <label htmlFor="receitaPrevista" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Receita Prevista
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="despesaPrevista"
              checked={visibility.despesaPrevista}
              onCheckedChange={(checked) => handleVisibilityChange('despesaPrevista', checked as boolean)}
            />
            <label htmlFor="despesaPrevista" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Despesa Prevista
            </label>
          </div>
        </div>
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
              
              {visibility.receitaPrevista && (
                <Line
                  type="monotone"
                  dataKey="receitaPrevista"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Receita Prevista"
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 5 }}
                  strokeDasharray="0"
                />
              )}
              
              {visibility.despesaPrevista && (
                <Line
                  type="monotone"
                  dataKey="despesaPrevista"
                  stroke="#ef4444"
                  strokeWidth={3}
                  name="Despesa Prevista"
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 5 }}
                  strokeDasharray="5 5"
                />
              )}
              
              {visibility.saldoMensal && (
                <Line
                  type="monotone"
                  dataKey="saldoMensal"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Saldo Mensal"
                  dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                  strokeDasharray="3 3"
                />
              )}
              
              {visibility.saldoAcumulado && (
                <Line
                  type="monotone"
                  dataKey="saldoAcumulado"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  name="Saldo Acumulado"
                  dot={{ fill: "#3b82f6", strokeWidth: 3, r: 6 }}
                  strokeDasharray="0"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Resumo dos dados */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Receita Total Prevista</p>
            <p className="text-lg font-bold" style={{ color: '#10b981' }}>
              {formatCurrency(projectionData.reduce((sum, item) => sum + item.receitaPrevista, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Despesa Total Prevista</p>
            <p className="text-lg font-bold" style={{ color: '#ef4444' }}>
              {formatCurrency(projectionData.reduce((sum, item) => sum + item.despesaPrevista, 0))}
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