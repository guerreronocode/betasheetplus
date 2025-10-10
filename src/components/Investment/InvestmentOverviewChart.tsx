import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { Investment } from '@/hooks/useInvestments';
import { useInvestmentSettings } from '@/hooks/useInvestmentSettings';
import { useInvestmentMonthlyValues } from '@/hooks/useInvestmentMonthlyValues';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfMonth, eachMonthOfInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface InvestmentOverviewChartProps {
  investments: Investment[];
  startDate: Date;
  endDate: Date;
}

const InvestmentOverviewChart: React.FC<InvestmentOverviewChartProps> = ({ 
  investments, 
  startDate,
  endDate 
}) => {
  const { toast } = useToast();
  const { settings, updateSettings, isLoading: settingsLoading } = useInvestmentSettings();
  const { monthlyValues } = useInvestmentMonthlyValues(undefined, startDate, endDate);
  const [goalInput, setGoalInput] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (settings) {
      setGoalInput(settings.financial_independence_goal.toString());
    }
  }, [settings]);

  // Gerar meses do período filtrado
  const months = useMemo(() => {
    return eachMonthOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  // Calcular dados para o gráfico baseados nos valores mensais
  const chartData = useMemo(() => {
    // Manter valores acumulados por investimento entre meses
    const investmentAccumulatedValues = new Map<string, { applied: number; total: number; yield: number }>();

    return months.map((month, monthIdx) => {
      const monthStr = format(startOfMonth(month), 'yyyy-MM-dd');
      
      // Somar valores do mês de todos os investimentos
      let totalApplied = 0;
      let totalValue = 0;
      let totalYield = 0;

      investments.forEach(investment => {
        const purchaseDate = parseISO(investment.purchase_date);
        
        // Se o investimento ainda não foi criado neste mês, ignora
        if (month < startOfMonth(purchaseDate)) {
          return;
        }

        const monthlyValue = monthlyValues.find(
          mv => mv.investment_id === investment.id && mv.month_date === monthStr
        );

        if (monthlyValue) {
          // Tem registro no banco - usar valores registrados
          totalApplied += monthlyValue.applied_value;
          totalValue += monthlyValue.total_value;
          totalYield += monthlyValue.yield_value;
          
          // Atualizar valores acumulados para este investimento
          investmentAccumulatedValues.set(investment.id, {
            applied: monthlyValue.applied_value,
            total: monthlyValue.total_value,
            yield: monthlyValue.yield_value
          });
        } else {
          // Não tem registro - usar valores acumulados do mês anterior
          const accumulated = investmentAccumulatedValues.get(investment.id);
          
          if (accumulated) {
            // Propagar valores do mês anterior (sem novo aporte)
            totalApplied += 0; // Sem novo aporte neste mês
            totalValue += accumulated.total; // Mantém valor total anterior
            totalYield += accumulated.yield; // Mantém rendimento acumulado
          } else {
            // Primeiro mês do investimento sem registro - usar valor inicial
            totalApplied += 0;
            totalValue += investment.amount;
            totalYield += 0;
            
            investmentAccumulatedValues.set(investment.id, {
              applied: 0,
              total: investment.amount,
              yield: 0
            });
          }
        }
      });

      // Calcular grau de independência financeira baseado no rendimento do mês
      const independenceDegree = (settings?.financial_independence_goal ?? 0) > 0 
        ? (totalYield / (settings?.financial_independence_goal ?? 1)) * 100
        : 0;

      return {
        month: format(month, 'MMM/yy', { locale: ptBR }),
        totalApplied,
        totalValue,
        totalYield,
        independenceDegree,
      };
    });
  }, [investments, months, monthlyValues, settings]);

  // Calcular totais considerando TODO o período filtrado
  const currentTotals = useMemo(() => {
    if (chartData.length === 0) {
      return {
        totalApplied: 0,
        totalValue: 0,
        totalYield: 0,
        returnPercentage: 0,
        independenceDegree: 0,
      };
    }

    const lastMonthData = chartData[chartData.length - 1];
    
    // Total Aplicado: Soma de TODOS os aportes durante TODO o período filtrado
    const totalAppliedAllPeriod = chartData.reduce((sum, month) => sum + month.totalApplied, 0);
    
    // Saldo: Valor total do último mês (valor acumulado atual)
    const totalValue = lastMonthData.totalValue;
    
    // Rendimento: Saldo - Aplicado (pode ser negativo)
    const totalYield = totalValue - totalAppliedAllPeriod;
    
    // Percentual de retorno: rendimento / total aplicado
    const returnPercentage = totalAppliedAllPeriod > 0 
      ? (totalYield / totalAppliedAllPeriod) * 100 
      : 0;

    // Grau de independência: baseado no rendimento do último mês
    const independenceDegree = lastMonthData.independenceDegree;

    return {
      totalApplied: totalAppliedAllPeriod,
      totalValue,
      totalYield,
      returnPercentage,
      independenceDegree,
    };
  }, [chartData]);

  const handleSaveGoal = () => {
    const goalValue = parseFloat(goalInput.replace(/[^\d,]/g, '').replace(',', '.'));
    
    if (!isNaN(goalValue) && goalValue > 0) {
      updateSettings({
        financial_independence_goal: goalValue,
      });
      setIsDialogOpen(false);
    } else {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido para a meta de independência financeira.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Gráfico */}
        <div className="flex-1 min-w-0">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  fontSize: 12,
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend 
                wrapperStyle={{ fontSize: 11 }}
                iconSize={12}
              />
              <Line 
                type="monotone" 
                dataKey="totalValue" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Saldo"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="totalYield" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                name="Rendimento"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="independenceDegree" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
                name="% Independência"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cards de detalhamento */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:w-52 lg:flex lg:flex-col gap-2" style={{ maxHeight: '280px' }}>
          <Card className="p-2 bg-muted/50">
            <p className="text-[10px] text-muted-foreground mb-0.5">Aplicado</p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(currentTotals.totalApplied)}
            </p>
          </Card>

          <Card className="p-2 bg-muted/50">
            <p className="text-[10px] text-muted-foreground mb-0.5">Rendimento</p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(currentTotals.totalYield)}
            </p>
            <p className={`text-[10px] font-medium ${currentTotals.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentTotals.returnPercentage >= 0 ? '+' : ''}{currentTotals.returnPercentage.toFixed(2)}%
            </p>
          </Card>

          <Card className="p-2 bg-muted/50">
            <p className="text-[10px] text-muted-foreground mb-0.5">Saldo</p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(currentTotals.totalValue)}
            </p>
          </Card>

          <Card className="p-2 bg-muted/50 group relative">
            <p className="text-[10px] text-muted-foreground mb-0.5">Grau de Independência Financeira</p>
            <p className="text-sm font-semibold text-foreground">
              {(settings?.financial_independence_goal ?? 0) > 0 
                ? `${currentTotals.independenceDegree.toFixed(1)}%`
                : 'Não configurado'
              }
            </p>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Configurar Grau de Independência Financeira</DialogTitle>
                  <DialogDescription>
                    Defina o valor mensal necessário para sua independência financeira. O sistema calculará automaticamente quantos % os seus investimentos estão gerando em relação a essa meta.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal">Meta mensal de independência (R$)</Label>
                    <Input
                      id="goal"
                      type="text"
                      placeholder="Ex: 10000"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                    />
                    <p className="text-xs text-muted-foreground">
                      Valor mensal que você precisa gerar através dos rendimentos dos investimentos para ser financeiramente independente
                    </p>
                  </div>
                  <Button onClick={handleSaveGoal} className="w-full" disabled={settingsLoading}>
                    Salvar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        </div>
      </div>
    </Card>
  );
};

export default InvestmentOverviewChart;
