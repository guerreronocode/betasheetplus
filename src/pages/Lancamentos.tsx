import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, ArrowRightLeft, Upload, CalendarIcon, Clock, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import TransactionsTable from '@/components/TransactionsTable';
import AddTransactionModal from '@/components/modals/AddTransactionModal';
import TransferModal from '@/components/modals/TransferModal';
import BankStatementModal from '@/components/modals/BankStatementModal';
import { PurchaseForm } from '@/components/creditCard/PurchaseForm';

const Lancamentos = () => {
  console.log('Lancamentos page rendering...');
  
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

  console.log('Lancamentos - About to render...');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-fnb-ink mb-1">Lançamentos</h1>
          <p className="text-fnb-ink/70 text-sm">Gerencie suas transações financeiras</p>
        </div>

        <div className="space-y-4">
          {/* Header with buttons */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
            <div className="flex justify-between items-center py-3 px-1">
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    console.log('Add transaction button clicked');
                    setAddTransactionOpen(true);
                  }}
                  size="sm"
                  className="h-8 px-3"
                  title="Adicionar Transação"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Transação
                </Button>
                
                <Button 
                  onClick={() => {
                    console.log('Credit card purchase button clicked');
                    setCreditCardPurchaseOpen(true);
                  }}
                  size="sm"
                  variant="outline"
                  className="h-8 px-3"
                  title="Compra no Cartão"
                >
                  <CreditCard className="w-3 h-3 mr-1" />
                  Cartão
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setTransferOpen(true)}
                  size="sm"
                  className="h-8 px-3"
                  title="Transferência"
                >
                  <ArrowRightLeft className="w-3 h-3 mr-1" />
                  Transferir
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setBankStatementOpen(true)}
                  size="sm"
                  className="h-8 px-3"
                  title="Extrato Bancário"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  Extrato
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/lancamentos/pendencias')}
                  size="sm"
                  className="h-8 px-3"
                  title="Pendências"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Pendências
                </Button>
              </div>

              {/* Date Filter */}
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-3">
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    Filtrar
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
          </div>
          
          {/* Transactions Table - Full width */}
          <div className="flex-1">
            <TransactionsTable />
          </div>
          
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
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader className="pb-1">
                <DialogTitle className="text-base">Compra no Cartão</DialogTitle>
              </DialogHeader>
              <div className="[&_label]:text-xs [&_input]:h-7 [&_button]:h-7 [&_.space-y-4]:space-y-2 [&_.space-y-3]:space-y-2">
                <PurchaseForm onClose={() => setCreditCardPurchaseOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Lancamentos;