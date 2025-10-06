import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import InvestmentTableView from '@/components/Investment/InvestmentTableView';
import InvestmentOverviewChart from '@/components/Investment/InvestmentOverviewChart';
import InvestmentWithdrawDialog from '@/components/Investment/InvestmentWithdrawDialog';
import { useInvestments } from '@/hooks/useInvestments';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Plus, TrendingDown, History } from 'lucide-react';
import { cn } from '@/lib/utils';

const InvestmentsPage = () => {
  const { investments, investmentsLoading } = useInvestments();
  const { addInvestment, isAddingInvestment, yieldRates, bankAccounts } = useFinancialData();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [selectedInvestments, setSelectedInvestments] = useState<string[]>([]);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [form, setForm] = useState<{
    name: string;
    type: string;
    amount: string;
    yield_type: 'fixed' | 'cdi' | 'selic' | 'ipca' | 'cdi_plus' | 'selic_plus' | 'ipca_plus';
    yield_rate: string;
    yield_extra: string;
    yield_percent_index: string;
    purchase_date: string;
    bank_account_id: string;
    already_owned: boolean;
  }>({
    name: '',
    type: '',
    amount: '',
    yield_type: 'fixed',
    yield_rate: '',
    yield_extra: '',
    yield_percent_index: '',
    purchase_date: new Date().toISOString().split('T')[0],
    bank_account_id: 'none',
    already_owned: false
  });
  
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsCreateDialogOpen(true)}
                    title="Cadastrar investimento"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  
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

      {/* Create Investment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Adicionar Investimento</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!form.name || !form.type || !form.amount) return;

            let yield_rate_final: number = 0;
            type SimpleYield = 'fixed' | 'cdi' | 'selic' | 'ipca';

            if (["cdi", "selic", "ipca"].includes(form.yield_type)) {
              const base = yieldRates.find(rate => rate.rate_type === form.yield_type)?.rate_value || 0;
              const percent = parseFloat(form.yield_percent_index || "100") / 100;
              yield_rate_final = base * percent;
            } else if (["cdi_plus", "selic_plus", "ipca_plus"].includes(form.yield_type)) {
              const baseType = form.yield_type.replace("_plus", "") as SimpleYield;
              const base = yieldRates.find(rate => rate.rate_type === baseType)?.rate_value || 0;
              const extra = parseFloat(form.yield_extra || "0");
              yield_rate_final = base + extra;
            } else if (form.yield_type === "fixed") {
              yield_rate_final = parseFloat(form.yield_rate || "0");
            }

            const submittedYieldType: SimpleYield =
              form.yield_type.endsWith('_plus')
                ? (form.yield_type.replace('_plus', '') as SimpleYield)
                : (form.yield_type as SimpleYield);

            addInvestment({
              name: form.name,
              type: form.type,
              amount: parseFloat(form.amount),
              purchase_date: form.purchase_date,
              yield_type: submittedYieldType,
              yield_rate: yield_rate_final,
              bank_account_id: form.already_owned ? undefined : (form.bank_account_id === 'none' ? undefined : form.bank_account_id)
            });

            setForm({
              name: '',
              type: '',
              amount: '',
              yield_type: 'fixed',
              yield_rate: '',
              yield_extra: '',
              yield_percent_index: '',
              purchase_date: new Date().toISOString().split('T')[0],
              bank_account_id: 'none',
              already_owned: false
            });
            setIsCreateDialogOpen(false);
          }} className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-sm">Nome do Investimento</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: PETR4, Tesouro Direto"
                className="h-9"
                required
              />
            </div>
            <div>
              <Label htmlFor="type" className="text-sm">Tipo</Label>
              <Select value={form.type} onValueChange={(value) => setForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {['Ações', 'Títulos', 'Criptomoedas', 'Poupança', 'CDB', 'Fundos', 'Imóveis', 'ETFs', 'Debêntures', 'BDRs', 'Tesouro Direto', 'LCI', 'LCA', 'Previdência Privada', 'COE', 'FIIs', 'Commodities', 'Cashback', 'Crowdfunding', 'Offshore', 'Outros'].map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount" className="text-sm">Valor Investido</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                className="h-9"
                required
              />
            </div>
            <div>
              <Label htmlFor="yield_type" className="text-sm">Tipo de Rendimento</Label>
              <Select value={form.yield_type} onValueChange={(value: any) => {
                let extra = {};
                if (!value.endsWith("_plus")) {
                  extra = { yield_extra: "" };
                }
                if (!(value === "cdi" || value === "selic" || value === "ipca")) {
                  extra = { ...extra, yield_percent_index: "" };
                }
                setForm(prev => ({ ...prev, yield_type: value, ...extra }));
              }}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: 'fixed', label: 'Taxa Fixa' },
                    { value: 'cdi', label: 'CDI' },
                    { value: 'cdi_plus', label: 'CDI + X%' },
                    { value: 'selic', label: 'SELIC' },
                    { value: 'selic_plus', label: 'SELIC + X%' },
                    { value: 'ipca', label: 'IPCA' },
                    { value: 'ipca_plus', label: 'IPCA + X%' }
                  ].map(yt => (
                    <SelectItem key={yt.value} value={yt.value}>{yt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.yield_type && form.yield_type.endsWith("_plus") && (
                <div className="mt-2">
                  <Label htmlFor="yield_extra" className="text-sm">Adicional (%)</Label>
                  <Input
                    id="yield_extra"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.yield_extra || ""}
                    placeholder="0.00"
                    className="h-9"
                    onChange={e => setForm(prev => ({ ...prev, yield_extra: e.target.value }))}
                    required
                  />
                </div>
              )}
              {["cdi", "selic", "ipca"].includes(form.yield_type) && (
                <div className="mt-2">
                  <Label htmlFor="yield_percent_index" className="text-sm">Percentual do índice (%)</Label>
                  <Input
                    id="yield_percent_index"
                    type="number"
                    step="0.01"
                    min="0"
                    max="200"
                    value={form.yield_percent_index || ""}
                    placeholder="Ex: 99 para 99%"
                    className="h-9"
                    onChange={e => setForm(prev => ({ ...prev, yield_percent_index: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Deixe vazio para 100%</p>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="yield_rate" className="text-sm">Taxa de Rendimento (%)</Label>
              <Input
                id="yield_rate"
                type="number"
                step="0.01"
                min="0"
                value={form.yield_rate}
                onChange={(e) => setForm(prev => ({ ...prev, yield_rate: e.target.value }))}
                placeholder="Ex: 12.5"
                className="h-9"
                required={form.yield_type === "fixed"}
                disabled={form.yield_type !== "fixed"}
              />
            </div>
            <div>
              <Label htmlFor="purchase_date" className="text-sm">Data da Compra</Label>
              <Input
                id="purchase_date"
                type="date"
                value={form.purchase_date}
                onChange={(e) => setForm(prev => ({ ...prev, purchase_date: e.target.value }))}
                className="h-9"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Origem do Investimento</Label>
              <div className="space-y-1.5">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="radio"
                    checked={!form.already_owned}
                    onChange={() => setForm(prev => ({ ...prev, already_owned: false }))}
                  />
                  <span>Retirar de conta bancária</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="radio"
                    checked={form.already_owned}
                    onChange={() => setForm(prev => ({ ...prev, already_owned: true }))}
                  />
                  <span>Já possuía</span>
                </label>
              </div>
            </div>

            {!form.already_owned && (
              <div>
                <Label htmlFor="bank_account" className="text-sm">Conta Bancária</Label>
                <Select
                  value={form.bank_account_id}
                  onValueChange={(value) => setForm(prev => ({ ...prev, bank_account_id: value }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não debitar</SelectItem>
                    {bankAccounts.map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - {account.bank_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Button type="submit" className="w-full h-9" disabled={isAddingInvestment}>
              {isAddingInvestment ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default InvestmentsPage;
