import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CalendarIcon, AlertTriangle, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import PendingTransactionsTable from '@/components/PendingTransactionsTable';
import { usePendingTransactions } from '@/hooks/usePendingTransactions';
import { formatCurrency, formatDateForDisplay } from '@/utils/formatters';

const LancamentosPendencias = () => {
  const navigate = useNavigate();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Date filter states - padrão é hoje e daqui a 6 meses
  const [appliedStartDate, setAppliedStartDate] = useState<Date>(new Date());
  const [appliedEndDate, setAppliedEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date;
  });
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(new Date());
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date;
  });

  const { pendingTransactions } = usePendingTransactions();

  // Calculate statistics based on filtered data
  const statistics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filterStartDate = appliedStartDate ? new Date(appliedStartDate) : new Date();
    filterStartDate.setHours(0, 0, 0, 0);
    
    const filterEndDate = appliedEndDate ? new Date(appliedEndDate) : (() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 6);
      return date;
    })();
    filterEndDate.setHours(23, 59, 59, 999);

    const filteredTransactions = pendingTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      transactionDate.setHours(0, 0, 0, 0);
      return transactionDate >= filterStartDate && transactionDate <= filterEndDate;
    });

    const totalValue = filteredTransactions.reduce((sum, t) => sum + t.value, 0);
    
    const overdueTransactions = filteredTransactions.filter(t => {
      const tDate = new Date(t.date);
      tDate.setHours(0, 0, 0, 0);
      return tDate < today;
    });

    const earliestOverdue = overdueTransactions.length > 0
      ? overdueTransactions.reduce((earliest, t) => {
          return t.date < earliest ? t.date : earliest;
        }, overdueTransactions[0].date)
      : null;

    return {
      totalValue,
      overdueCount: overdueTransactions.length,
      earliestOverdueDate: earliestOverdue
    };
  }, [pendingTransactions, appliedStartDate, appliedEndDate]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 flex flex-col h-[calc(100vh-2rem)]">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => navigate('/lancamentos')}
              title="Voltar para Lançamentos"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-fnb-ink">Pendências</h1>
          </div>
          <p className="text-fnb-ink/70 text-sm">Receitas e despesas programadas, faturas de cartão e transações recorrentes</p>
        </div>

        {/* Header with notifications and date filter */}
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border shadow-lg rounded-lg mb-4">
          <div className="flex justify-between items-center py-3 px-4">
            {/* Left side: Statistics */}
            <div className="flex items-center gap-3">
              {/* Total Value Badge */}
              <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 text-sm font-medium">
                <DollarSign className="w-4 h-4" />
                <span>Total: {formatCurrency(Math.abs(statistics.totalValue))}</span>
                <span className={statistics.totalValue >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {statistics.totalValue >= 0 ? '(+)' : '(-)'}
                </span>
              </Badge>

              {/* Overdue Badge */}
              {statistics.overdueCount > 0 && (
                <Badge variant="destructive" className="h-8 px-3 flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {statistics.overdueCount} vencida{statistics.overdueCount > 1 ? 's' : ''} desde {' '}
                    {statistics.earliestOverdueDate && formatDateForDisplay(statistics.earliestOverdueDate.toISOString().split('T')[0])}
                  </span>
                </Badge>
              )}
            </div>

            {/* Right side: Date Filter */}
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 shadow-md hover:shadow-lg transition-shadow bg-background border border-border"
              >
                <CalendarIcon className="mr-1 h-3 w-3" />
                Data
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 space-y-3">
                {/* Quick Filters */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Filtros Rápidos</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        const today = new Date();
                        const oneMonthForward = new Date(today);
                        oneMonthForward.setMonth(today.getMonth() + 1);
                        setTempStartDate(today);
                        setTempEndDate(oneMonthForward);
                      }}
                    >
                      Próximo mês
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        const today = new Date();
                        const threeMonthsForward = new Date(today);
                        threeMonthsForward.setMonth(today.getMonth() + 3);
                        setTempStartDate(today);
                        setTempEndDate(threeMonthsForward);
                      }}
                    >
                      Próximos 3 meses
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        const today = new Date();
                        const sixMonthsForward = new Date(today);
                        sixMonthsForward.setMonth(today.getMonth() + 6);
                        setTempStartDate(today);
                        setTempEndDate(sixMonthsForward);
                      }}
                    >
                      Próximos 6 meses
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        const today = new Date();
                        const oneYearForward = new Date(today);
                        oneYearForward.setFullYear(today.getFullYear() + 1);
                        setTempStartDate(today);
                        setTempEndDate(oneYearForward);
                      }}
                    >
                      Próximo ano
                    </Button>
                  </div>
                </div>
                
                {/* Custom Calendars */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="start-date" className="text-xs font-medium mb-2 block">Data inicial</Label>
                    <Calendar
                      mode="single"
                      selected={tempStartDate}
                      onSelect={setTempStartDate}
                      defaultMonth={tempStartDate}
                      disabled={(date) => {
                        // Desabilitar datas posteriores à data final selecionada
                        if (tempEndDate) {
                          return date > tempEndDate;
                        }
                        return false;
                      }}
                      className={cn("pointer-events-auto text-xs")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="text-xs font-medium mb-2 block">Data final</Label>
                    <Calendar
                      mode="single"
                      selected={tempEndDate}
                      onSelect={setTempEndDate}
                      defaultMonth={tempEndDate}
                      disabled={(date) => {
                        // Desabilitar datas anteriores à data inicial selecionada
                        if (tempStartDate) {
                          return date < tempStartDate;
                        }
                        return false;
                      }}
                      className={cn("pointer-events-auto text-xs")}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    if (tempStartDate && tempEndDate) {
                      setAppliedStartDate(tempStartDate);
                      setAppliedEndDate(tempEndDate);
                      setIsDatePickerOpen(false);
                    }
                  }} 
                  className="w-full h-8"
                  size="sm"
                  disabled={!tempStartDate || !tempEndDate}
                >
                  Filtrar
                </Button>
              </div>
            </PopoverContent>
            </Popover>
            </div>
          </div>
        
        {/* Pending Transactions Table - Full height */}
        <div className="flex-1 min-h-0">
          <PendingTransactionsTable 
            startDate={appliedStartDate}
            endDate={appliedEndDate}
          />
        </div>
      </div>
    </Layout>
  );
};

export default LancamentosPendencias;