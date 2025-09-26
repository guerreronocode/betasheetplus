import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Layout } from '@/components/Layout';
import { Plus, ArrowRightLeft, Upload, CalendarIcon, Clock, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import TransactionsTable from '@/components/TransactionsTable';
import CategoryRanking from '@/components/CategoryRanking';
import AddTransactionModal from '@/components/modals/AddTransactionModal';
import TransferModal from '@/components/modals/TransferModal';
import BankStatementModal from '@/components/modals/BankStatementModal';
import { PurchaseForm } from '@/components/creditCard/PurchaseForm';

const Lancamentos = () => {
  const navigate = useNavigate();
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [bankStatementOpen, setBankStatementOpen] = useState(false);
  const [creditCardPurchaseOpen, setCreditCardPurchaseOpen] = useState(false);
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-fnb-ink mb-1">Lançamentos</h1>
          <p className="text-fnb-ink/70 text-sm">Gerencie suas transações financeiras</p>
        </div>

        <div className="space-y-3">
          {/* Header with parallax effect */}
          <div 
            className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm"
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform',
            }}
          >
            <div className="flex justify-between items-center py-3 px-1">
              <div className="flex gap-1">
                <Button 
                  onClick={() => setAddTransactionOpen(true)}
                  size="sm"
                  className="h-7 w-7 p-0"
                  title="Adicionar Transação"
                >
                  <Plus className="w-3 h-3" />
                </Button>
                
                <Button 
                  onClick={() => setCreditCardPurchaseOpen(true)}
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0"
                  title="Compra no Cartão"
                >
                  <CreditCard className="w-3 h-3" />
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setTransferOpen(true)}
                  size="sm"
                  className="h-7 w-7 p-0"
                  title="Transferência"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setBankStatementOpen(true)}
                  size="sm"
                  className="h-7 w-7 p-0"
                  title="Extrato Bancário"
                >
                  <Upload className="w-3 h-3" />
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/lancamentos/pendencias')}
                  size="sm"
                  className="h-7 w-7 p-0"
                  title="Pendências"
                >
                  <Clock className="w-3 h-3" />
                </Button>
              </div>

              {/* Date Filter */}
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    Filtrar
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
          
          {/* Credit Card Purchase Modal */}
          <Dialog open={creditCardPurchaseOpen} onOpenChange={setCreditCardPurchaseOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Compra no Cartão</DialogTitle>
              </DialogHeader>
              <PurchaseForm onClose={() => setCreditCardPurchaseOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
};

export default Lancamentos;