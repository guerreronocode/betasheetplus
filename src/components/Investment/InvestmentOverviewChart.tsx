import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { Investment } from '@/hooks/useInvestments';
import { useInvestmentSettings } from '@/hooks/useInvestmentSettings';
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

  // Calcular dados para o gráfico
  const chartData = useMemo(() => {
    return months.map(month => {
      let totalInvested = 0;
      let totalCurrent = 0;

      investments.forEach(investment => {
        const purchaseDate = parseISO(investment.purchase_date);
        
        if (month >= startOfMonth(purchaseDate)) {
          totalInvested += investment.amount;
          totalCurrent += investment.current_value || investment.amount;
        }
      });

      const returnValue = totalCurrent - totalInvested;
      const returnPercentage = totalInvested > 0 ? (returnValue / totalInvested) * 100 : 0;

      // Calcular rendimento médio mensal baseado no retorno acumulado
      const monthsElapsed = investments.reduce((maxMonths, inv) => {
        const investmentMonths = Math.max(1, Math.ceil((new Date().getTime() - new Date(inv.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 30)));
        return Math.max(maxMonths, investmentMonths);
      }, 1);
      const averageMonthlyYield = returnValue / monthsElapsed;
      
      // Calcular grau de independência financeira
      const independenceDegree = (settings?.financial_independence_goal ?? 0) > 0 
        ? (averageMonthlyYield / (settings?.financial_independence_goal ?? 1)) * 100
        : 0;

      return {
        month: format(month, 'MMM/yy', { locale: ptBR }),
        totalInvested,
        totalCurrent,
        returnValue,
        returnPercentage,
        independenceDegree,
      };
    });
  }, [investments, months, settings]);

  // Calcular totais atuais
  const currentTotals = useMemo(() => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCurrent = investments.reduce((sum, inv) => sum + (inv.current_value || inv.amount), 0);
    const returnValue = totalCurrent - totalInvested;
    const returnPercentage = totalInvested > 0 ? (returnValue / totalInvested) * 100 : 0;
    
    // Calcular rendimento médio mensal dos investimentos
    const monthsElapsed = investments.reduce((maxMonths, inv) => {
      const investmentMonths = Math.max(1, Math.ceil((new Date().getTime() - new Date(inv.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 30)));
      return Math.max(maxMonths, investmentMonths);
    }, 1);
    const averageMonthlyYield = returnValue / monthsElapsed;
    
    // Calcular grau de independência financeira
    const independenceDegree = (settings?.financial_independence_goal ?? 0) > 0 
      ? (averageMonthlyYield / (settings?.financial_independence_goal ?? 1)) * 100
      : 0;

    return {
      totalInvested,
      totalCurrent,
      returnValue,
      returnPercentage,
      independenceDegree,
    };
  }, [investments, settings]);

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
                dataKey="totalCurrent" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Valor Total"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="totalInvested" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                name="Total Investido"
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
            <p className="text-[10px] text-muted-foreground mb-0.5">Investido</p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(currentTotals.totalInvested)}
            </p>
          </Card>

          <Card className="p-2 bg-muted/50">
            <p className="text-[10px] text-muted-foreground mb-0.5">Rendimento</p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(currentTotals.returnValue)}
            </p>
            <p className={`text-[10px] font-medium ${currentTotals.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentTotals.returnPercentage >= 0 ? '+' : ''}{currentTotals.returnPercentage.toFixed(2)}%
            </p>
          </Card>

          <Card className="p-2 bg-muted/50">
            <p className="text-[10px] text-muted-foreground mb-0.5">Valor Total</p>
            <p className="text-sm font-semibold text-foreground">
              {formatCurrency(currentTotals.totalCurrent)}
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
            {(settings?.financial_independence_goal ?? 0) > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Meta: {formatCurrency(settings?.financial_independence_goal ?? 0)}/mês | Rendimento: {formatCurrency(currentTotals.independenceDegree * (settings?.financial_independence_goal ?? 0) / 100)}/mês
              </p>
            )}
            
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
