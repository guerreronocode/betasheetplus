import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/Layout';
import { Plus, ArrowRightLeft, Upload, CalendarIcon, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import TransactionsTable from '@/components/TransactionsTable';
import CategoryRanking from '@/components/CategoryRanking';
import AddTransactionModal from '@/components/modals/AddTransactionModal';
import TransferModal from '@/components/modals/TransferModal';
import BankStatementModal from '@/components/modals/BankStatementModal';

const Lancamentos = () => {
  const navigate = useNavigate();
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [bankStatementOpen, setBankStatementOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Date filter states
  const [appliedStartDate, setAppliedStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date;
  });
  const [appliedEndDate, setAppliedEndDate] = useState<Date>(new Date());
  const [tempStartDate, setTempStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date;
  });
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date());

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fnb-ink mb-2">Lançamentos</h1>
          <p className="text-fnb-ink/70">Gerencie suas transações financeiras</p>
        </div>

        <div className="space-y-6">
          {/* Header with action buttons */}
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <Button 
                onClick={() => setAddTransactionOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Transação
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setTransferOpen(true)}
                className="flex items-center gap-2"
              >
                <ArrowRightLeft className="w-4 h-4" />
                Transferência
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setBankStatementOpen(true)}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Extrato Bancário
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/lancamentos/pendencias')}
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Pendências
              </Button>
            </div>

            {/* Date Filter */}
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="shadow-sm text-xs">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  Filtrar Data
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-4 space-y-4">
                  {/* Quick Filters */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Filtros Rápidos</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
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
                    </div>
                  </div>
                  
                  {/* Custom Calendars */}
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
          
          {/* Transactions Table */}
          <TransactionsTable />
          
          {/* Category Ranking */}
          <CategoryRanking />
          
          {/* Modals */}
          <AddTransactionModal 
            open={addTransactionOpen} 
            onOpenChange={setAddTransactionOpen} 
          />
          
          <TransferModal 
            open={transferOpen} 
            onOpenChange={setTransferOpen} 
          />
          
          <BankStatementModal 
            open={bankStatementOpen} 
            onOpenChange={setBankStatementOpen} 
          />
        </div>
      </div>
    </Layout>
  );
};

export default Lancamentos;