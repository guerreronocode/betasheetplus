import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import InvestmentTableView from '@/components/Investment/InvestmentTableView';
import InvestmentOverviewChart from '@/components/Investment/InvestmentOverviewChart';
import { useInvestments } from '@/hooks/useInvestments';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const InvestmentsPage = () => {
  const { investments, investmentsLoading } = useInvestments();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  // Date filter states
  const [appliedStartDate, setAppliedStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 12);
    return date;
  });
  const [appliedEndDate, setAppliedEndDate] = useState<Date>(new Date());
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 12);
    return date;
  });
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(new Date());

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxStyle = {
    transform: `translateY(${scrollY * 0.5}px)`,
    opacity: Math.max(0.3, 1 - scrollY / 300),
  };

  return (
    <Layout>
      <div className="min-h-screen bg-fnb-cream">
        {/* Header with parallax effect */}
        <div 
          className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-lg transition-all duration-300"
          style={parallaxStyle}
        >
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              <div>
                <h1 className="text-xl font-bold text-fnb-ink">Investimentos</h1>
                <p className="text-fnb-ink/70 text-xs">Gerencie seus investimentos</p>
              </div>

              {/* Date Filter */}
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
                            const oneMonthAgo = new Date(today);
                            oneMonthAgo.setMonth(today.getMonth() - 1);
                            setTempStartDate(oneMonthAgo);
                            setTempEndDate(today);
                          }}
                        >
                          1 mês
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            const today = new Date();
                            const threeMonthsAgo = new Date(today);
                            threeMonthsAgo.setMonth(today.getMonth() - 3);
                            setTempStartDate(threeMonthsAgo);
                            setTempEndDate(today);
                          }}
                        >
                          3 meses
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
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
                          className="h-7 text-xs"
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
                            const today = new Date();
                            today.setHours(23, 59, 59, 999);
                            // Desabilitar datas posteriores à data final selecionada ou posteriores a hoje
                            if (tempEndDate) {
                              return date > tempEndDate || date > today;
                            }
                            return date > today;
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
                            const today = new Date();
                            today.setHours(23, 59, 59, 999);
                            // Desabilitar datas anteriores à data inicial selecionada ou posteriores a hoje
                            if (tempStartDate) {
                              return date < tempStartDate || date > today;
                            }
                            return date > today;
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
        </div>

        <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {investmentsLoading ? (
              <Card className="p-8 text-center">
                <p className="text-fnb-ink/70">Carregando investimentos...</p>
              </Card>
            ) : (
              <>
                <InvestmentOverviewChart 
                  investments={investments}
                  startDate={appliedStartDate}
                  endDate={appliedEndDate}
                />
                <InvestmentTableView 
                  investments={investments}
                  startDate={appliedStartDate}
                  endDate={appliedEndDate}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default InvestmentsPage;
