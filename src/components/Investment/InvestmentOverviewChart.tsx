import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { Investment } from '@/hooks/useInvestments';
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
  selectedYear: string;
}

const InvestmentOverviewChart: React.FC<InvestmentOverviewChartProps> = ({ 
  investments, 
  selectedYear 
}) => {
  const { toast } = useToast();
  const [financialIndependenceGoal, setFinancialIndependenceGoal] = useState<number>(0);
  const [goalInput, setGoalInput] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Gerar meses do ano selecionado
  const months = useMemo(() => {
    const year = parseInt(selectedYear);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    return eachMonthOfInterval({ start: startDate, end: endDate });
  }, [selectedYear]);

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

      // Calcular grau de independência financeira (quantos meses de despesas cobertas)
      const independenceDegree = financialIndependenceGoal > 0 
        ? (totalCurrent / financialIndependenceGoal) 
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
  }, [investments, months, financialIndependenceGoal]);

  // Calcular totais atuais
  const currentTotals = useMemo(() => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCurrent = investments.reduce((sum, inv) => sum + (inv.current_value || inv.amount), 0);
    const returnValue = totalCurrent - totalInvested;
    const returnPercentage = totalInvested > 0 ? (returnValue / totalInvested) * 100 : 0;
    const independenceDegree = financialIndependenceGoal > 0 
      ? (totalCurrent / financialIndependenceGoal) 
      : 0;

    return {
      totalInvested,
      totalCurrent,
      returnValue,
      returnPercentage,
      independenceDegree,
    };
  }, [investments, financialIndependenceGoal]);

  const handleSaveGoal = () => {
    const value = parseFloat(goalInput.replace(/[^\d,]/g, '').replace(',', '.'));
    if (!isNaN(value) && value > 0) {
      setFinancialIndependenceGoal(value);
      setIsDialogOpen(false);
      toast({
        title: "Meta atualizada",
        description: "Valor de independência financeira configurado com sucesso.",
      });
    } else {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex gap-4">
        {/* Gráfico */}
        <div className="flex-1">
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
                name="Meses de Cobertura"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cards de detalhamento */}
        <div className="w-64 space-y-2">
          <Card className="p-3 bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Total Investido</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(currentTotals.totalInvested)}
            </p>
          </Card>

          <Card className="p-3 bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Valor Total Atual</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(currentTotals.totalCurrent)}
            </p>
          </Card>

          <Card className="p-3 bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Rendimento</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(currentTotals.returnValue)}
            </p>
            <p className={`text-xs font-medium ${currentTotals.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentTotals.returnPercentage >= 0 ? '+' : ''}{currentTotals.returnPercentage.toFixed(2)}%
            </p>
          </Card>

          <Card className="p-3 bg-muted/50 group relative">
            <p className="text-xs text-muted-foreground mb-1">Independência Financeira</p>
            <p className="text-lg font-semibold text-foreground">
              {financialIndependenceGoal > 0 
                ? `${currentTotals.independenceDegree.toFixed(1)} meses`
                : 'Não configurado'
              }
            </p>
            {financialIndependenceGoal > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Meta: {formatCurrency(financialIndependenceGoal)}/mês
              </p>
            )}
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Configurar Meta de Independência</DialogTitle>
                  <DialogDescription>
                    Defina o valor mensal necessário para sua independência financeira
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal">Valor mensal necessário (R$)</Label>
                    <Input
                      id="goal"
                      type="text"
                      placeholder="Ex: 5000"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                    />
                  </div>
                  <Button onClick={handleSaveGoal} className="w-full">
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
