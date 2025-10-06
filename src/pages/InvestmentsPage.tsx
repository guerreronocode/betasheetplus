import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import InvestmentTableView from '@/components/Investment/InvestmentTableView';
import InvestmentOverviewChart from '@/components/Investment/InvestmentOverviewChart';
import InvestmentCreateDialog from '@/components/Investment/InvestmentCreateDialog';
import InvestmentWithdrawDialog from '@/components/Investment/InvestmentWithdrawDialog';
import { useInvestments } from '@/hooks/useInvestments';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Plus, TrendingDown, History } from 'lucide-react';
import { cn } from '@/lib/utils';

const InvestmentsPage = () => {
  const { investments, investmentsLoading } = useInvestments();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [selectedInvestments, setSelectedInvestments] = useState<string[]>([]);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  
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
        {/* Date Filter with parallax - full width outside sidebar */}
        <div 
          className="sticky top-0 z-10 bg-fnb-cream/95 backdrop-blur-sm border-b border-border py-4 transition-all duration-300"
          style={parallaxStyle}
        >
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
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
              <PopoverContent className="w-auto p-0" align="start">
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
                
                {/* Action buttons */}
                <div className="flex gap-2 justify-end">
                  <InvestmentCreateDialog />
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsWithdrawDialogOpen(true)}
                    title="Resgate de investimento"
                  >
                    <TrendingDown className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={selectedInvestments.length === 0}
                    title="Visualizar log de ações"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </div>

                <InvestmentTableView 
                  investments={investments}
                  startDate={appliedStartDate}
                  endDate={appliedEndDate}
                  selectedInvestments={selectedInvestments}
                  onSelectionChange={setSelectedInvestments}
                />

                <InvestmentWithdrawDialog
                  isOpen={isWithdrawDialogOpen}
                  onClose={() => setIsWithdrawDialogOpen(false)}
                  investments={investments}
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
