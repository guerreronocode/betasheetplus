import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { TrendingUp, DollarSign, Percent, ArrowUpDown, CalendarIcon } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useInvestments } from '@/hooks/useInvestments';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { getTodayForInput } from '@/utils/formatters';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const InvestmentDashboard = () => {
  const [appliedStartDate, setAppliedStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 12);
    return date;
  });
  const [appliedEndDate, setAppliedEndDate] = useState<Date>(new Date());
  const [tempStartDate, setTempStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 12);
    return date;
  });
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({
    key: 'returnValue',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { investments, investmentsLoading } = useInvestments(appliedStartDate, appliedEndDate);

  // Função para determinar a granularidade do gráfico baseada no período
  const getChartGranularity = (start: Date, end: Date) => {
    const diffInDays = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const diffInMonths = diffInDays / 30.44; // Média de dias por mês
    const diffInYears = diffInMonths / 12;

    if (diffInMonths <= 12) return 'monthly';
    if (diffInYears <= 3) return 'bimonthly';
    return 'quarterly';
  };

  // Função para gerar dados do gráfico baseado na granularidade
  const generateChartData = (start: Date, end: Date) => {
    const granularity = getChartGranularity(start, end);
    const data = [];
    const current = new Date(start);
    let totalInvested = 8000;
    let totalValue = 8200;

    while (current <= end) {
      let label = '';
      let increment = 0;

      switch (granularity) {
        case 'monthly':
          label = format(current, 'MMM/yy');
          current.setMonth(current.getMonth() + 1);
          increment = 1;
          break;
        case 'bimonthly':
          label = format(current, 'MMM/yy');
          current.setMonth(current.getMonth() + 2);
          increment = 2;
          break;
        case 'quarterly':
          label = `T${Math.floor(current.getMonth() / 3) + 1}/${current.getFullYear()}`;
          current.setMonth(current.getMonth() + 3);
          increment = 3;
          break;
      }

      totalInvested += 1500 * increment;
      totalValue += (1500 * increment) + Math.random() * 500;

      data.push({
        month: label,
        invested: totalInvested,
        value: totalValue,
        independence: Math.min((totalValue / 100000) * 100, 100)
      });

      if (data.length > 50) break; // Limite para evitar muitos pontos
    }

    return data;
  };

  // Dados para o gráfico temporal baseados no período selecionado
  const timelineData = generateChartData(appliedStartDate, appliedEndDate);

  // Cores para o gráfico de pizza
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  if (investmentsLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Cálculos dos investimentos
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalValue = investments.reduce((sum, inv) => sum + (inv.current_value || inv.amount || 0), 0);
  const totalReturn = totalValue - totalInvested;
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  // Dados para o gráfico de pizza (composição da carteira)
  const portfolioComposition = investments.reduce((acc, inv) => {
    const type = inv.type || 'Outros';
    if (!acc[type]) {
      acc[type] = 0;
    }
    acc[type] += inv.current_value || inv.amount || 0;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(portfolioComposition).map(([name, value]) => ({
    name,
    value,
    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
  }));

  // Dados para a tabela de ranking com paginação
  const investmentRanking = investments.map(inv => {
    const invested = inv.amount || 0;
    const current = inv.current_value || invested;
    const returnValue = current - invested;
    const returnPerc = invested > 0 ? (returnValue / invested) * 100 : 0;
    
    return {
      id: inv.id,
      name: inv.name || 'Investimento',
      balance: current,
      returnValue,
      returnPercentage: returnPerc
    };
  });

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  const sortedInvestments = [...investmentRanking].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof typeof a] as number;
    const bValue = b[sortConfig.key as keyof typeof b] as number;
    
    if (sortConfig.direction === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  // Paginação
  const totalPages = Math.ceil(sortedInvestments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvestments = sortedInvestments.slice(startIndex, endIndex);

  return (
    <Layout>
      <div className="bg-fnb-cream h-screen overflow-hidden">
        <ScrollArea className="h-screen px-6">
          <div className="space-y-4 pb-4">
            {/* Cabeçalho */}
            <div className="pt-2 pb-1 flex justify-between items-center">
              <h1 className="text-base font-bold text-foreground">Dashboard | Investimentos</h1>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="shadow-sm text-xs">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      Filtrar Data
                    </Button>
                  </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-4 space-y-4">
                    {/* Filtros Rápidos */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Filtros Rápidos</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const today = new Date();
                            const sixMonthsAgo = new Date(today);
                            sixMonthsAgo.setMonth(today.getMonth() - 6);
                            setTempStartDate(sixMonthsAgo);
                            setTempEndDate(today);
                          }}
                        >
                          6 meses
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const today = new Date();
                            const oneYearAgo = new Date(today);
                            oneYearAgo.setFullYear(today.getFullYear() - 1);
                            setTempStartDate(oneYearAgo);
                            setTempEndDate(today);
                          }}
                        >
                          1 ano
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const today = new Date();
                            const twoYearsAgo = new Date(today);
                            twoYearsAgo.setFullYear(today.getFullYear() - 2);
                            setTempStartDate(twoYearsAgo);
                            setTempEndDate(today);
                          }}
                        >
                          2 anos
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const today = new Date();
                            const threeYearsAgo = new Date(today);
                            threeYearsAgo.setFullYear(today.getFullYear() - 3);
                            setTempStartDate(threeYearsAgo);
                            setTempEndDate(today);
                          }}
                        >
                          3 anos
                        </Button>
                      </div>
                    </div>
                    
                    {/* Calendários Personalizados */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-date" className="text-xs font-medium mb-2 block">Data inicial</Label>
                        <Calendar
                          mode="single"
                          selected={tempStartDate}
                          onSelect={setTempStartDate}
                          className={cn("pointer-events-auto")}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date" className="text-xs font-medium mb-2 block">Data final</Label>
                        <Calendar
                          mode="single"
                          selected={tempEndDate}
                          onSelect={setTempEndDate}
                          className={cn("pointer-events-auto")}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={() => {
                        setAppliedStartDate(tempStartDate);
                        setAppliedEndDate(tempEndDate);
                        setIsDatePickerOpen(false);
                      }} 
                      className="w-full"
                    >
                      Filtrar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Painel Central - Gráfico + Indicadores */}
            <Card className="fnb-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Rendimentos</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                  {/* Gráfico */}
                  <div className="lg:col-span-3">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Line 
                          type="monotone" 
                          dataKey="invested" 
                          stroke="#8884d8" 
                          name="Investido"
                          strokeWidth={1.5}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#82ca9d" 
                          name="Valor Atual"
                          strokeWidth={1.5}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Indicadores */}
                  <div className="space-y-2">
                    <Card className="fnb-card">
                      <CardContent className="p-2 text-center">
                        <div className="flex items-center justify-center mb-1">
                          <DollarSign className="h-3 w-3 text-fnb-accent" />
                        </div>
                        <p className="text-xs text-muted-foreground">Investido</p>
                        <p className="text-xs font-bold">{formatCurrency(totalInvested)}</p>
                      </CardContent>
                    </Card>

                    <Card className="fnb-card">
                      <CardContent className="p-2 text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="h-3 w-3 text-fnb-accent" />
                        </div>
                        <p className="text-xs text-muted-foreground">Valor</p>
                        <p className="text-xs font-bold">{formatCurrency(totalValue)}</p>
                      </CardContent>
                    </Card>

                    <Card className="fnb-card">
                      <CardContent className="p-2 text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Percent className="h-3 w-3 text-fnb-accent" />
                        </div>
                        <p className="text-xs text-muted-foreground">Rendimento</p>
                        <p className="text-xs font-bold">{formatCurrency(totalReturn)}</p>
                        <p className={`text-xs ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(returnPercentage)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção Inferior - Gráfico de Pizza + Tabela */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Gráfico de Pizza - Composição da Carteira */}
              <Card className="fnb-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Composição da carteira</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tabela de Ranking */}
              <Card className="fnb-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Ranking de investimentos</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="text-xs">
                          <TableHead className="text-xs p-2">Produto</TableHead>
                          <TableHead className="text-xs p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSort('balance')}
                              className="h-auto p-0 font-medium text-left justify-start text-xs"
                            >
                              Saldo
                              <ArrowUpDown className="ml-1 h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead className="text-xs p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSort('returnValue')}
                              className="h-auto p-0 font-medium text-left justify-start text-xs"
                            >
                              Rendimento (R$)
                              <ArrowUpDown className="ml-1 h-3 w-3" />
                            </Button>
                          </TableHead>
                          <TableHead className="text-xs p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSort('returnPercentage')}
                              className="h-auto p-0 font-medium text-left justify-start text-xs"
                            >
                              Rendimento (%)
                              <ArrowUpDown className="ml-1 h-3 w-3" />
                            </Button>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedInvestments.map((investment) => (
                          <TableRow key={investment.id} className="text-xs">
                            <TableCell className="font-medium text-xs p-2">{investment.name}</TableCell>
                            <TableCell className="text-xs p-2">{formatCurrency(investment.balance)}</TableCell>
                            <TableCell className={`text-xs p-2 ${investment.returnValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(investment.returnValue)}
                            </TableCell>
                            <TableCell className={`text-xs p-2 ${investment.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPercentage(investment.returnPercentage)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                  </Table>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}

                  {/* Saldo Consolidado */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center font-semibold text-xs">
                      <span>Total</span>
                      <div className="flex gap-3">
                        <span>{formatCurrency(totalValue)}</span>
                        <span className={totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(totalReturn)}
                        </span>
                        <span className={returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatPercentage(returnPercentage)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </div>
    </Layout>
  );
};

export default InvestmentDashboard;