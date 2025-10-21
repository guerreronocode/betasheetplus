import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import QuickFinancialCards from '@/components/QuickFinancialCards';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, CalendarIcon } from 'lucide-react';
import BudgetTableView from '@/components/budget/BudgetTableView';
import { PlannedIncomeFormModal } from '@/components/budget/PlannedIncomeFormModal';
import { PlannedExpenseFormModal } from '@/components/budget/PlannedExpenseFormModal';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Planejamento = () => {
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  
  // Date filter state - default to last 3 months to next 3 months
  const [startDate, setStartDate] = useState<Date>(subMonths(startOfMonth(new Date()), 3));
  const [endDate, setEndDate] = useState<Date>(addMonths(endOfMonth(new Date()), 3));

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-fnb-cream">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <h1 className="text-3xl font-title font-bold text-fnb-ink">Orçamento & Projeção</h1>
              <p className="text-fnb-ink/70 mt-2">Planeje e acompanhe receitas e despesas</p>
            </div>
            
            <div className="space-y-6">
              <QuickFinancialCards />
              
              {/* Filtro de data e botões de ação */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-2 items-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            {format(startDate, 'MMM/yy', { locale: ptBR })} - {format(endDate, 'MMM/yy', { locale: ptBR })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-4 space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Data Inicial</label>
                              <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => date && setStartDate(startOfMonth(date))}
                                locale={ptBR}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Data Final</label>
                              <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={(date) => date && setEndDate(endOfMonth(date))}
                                locale={ptBR}
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setShowIncomeModal(true)}
                        variant="default"
                        className="gap-2"
                      >
                        <TrendingUp className="h-4 w-4" />
                        Nova Receita
                      </Button>
                      <Button 
                        onClick={() => setShowExpenseModal(true)}
                        variant="default"
                        className="gap-2"
                      >
                        <TrendingDown className="h-4 w-4" />
                        Nova Despesa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabelas de receitas e despesas */}
              <Tabs defaultValue="expenses" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="expenses">Despesas</TabsTrigger>
                  <TabsTrigger value="income">Receitas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="expenses" className="mt-6">
                  <BudgetTableView 
                    type="expense" 
                    startDate={startDate} 
                    endDate={endDate} 
                  />
                </TabsContent>
                
                <TabsContent value="income" className="mt-6">
                  <BudgetTableView 
                    type="income" 
                    startDate={startDate} 
                    endDate={endDate} 
                  />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </SidebarInset>
      </div>

      <PlannedIncomeFormModal 
        open={showIncomeModal} 
        onOpenChange={setShowIncomeModal} 
      />
      
      <PlannedExpenseFormModal 
        open={showExpenseModal} 
        onOpenChange={setShowExpenseModal} 
      />
    </SidebarProvider>
  );
};

export default Planejamento;
