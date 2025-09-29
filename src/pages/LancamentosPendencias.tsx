import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import PendingTransactionsTable from '@/components/PendingTransactionsTable';

const LancamentosPendencias = () => {
  const navigate = useNavigate();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Date filter states - padrão é hoje e daqui a 2 meses
  const [appliedStartDate, setAppliedStartDate] = useState<Date>(new Date());
  const [appliedEndDate, setAppliedEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 2);
    return date;
  });
  const [tempStartDate, setTempStartDate] = useState<Date>(new Date());
  const [tempEndDate, setTempEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 2);
    return date;
  });

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

        {/* Date Filter Button - Isolated */}
        <div className="mb-4 flex justify-end">
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
                      className={cn("pointer-events-auto text-xs")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date" className="text-xs font-medium mb-2 block">Data final</Label>
                    <Calendar
                      mode="single"
                      selected={tempEndDate}
                      onSelect={setTempEndDate}
                      className={cn("pointer-events-auto text-xs")}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    setAppliedStartDate(tempStartDate);
                    setAppliedEndDate(tempEndDate);
                    setIsDatePickerOpen(false);
                  }} 
                  className="w-full h-8"
                  size="sm"
                >
                  Filtrar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
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