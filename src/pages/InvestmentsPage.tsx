import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import InvestmentTableView from '@/components/Investment/InvestmentTableView';
import InvestmentOverviewChart from '@/components/Investment/InvestmentOverviewChart';
import InvestmentWithdrawDialog from '@/components/Investment/InvestmentWithdrawDialog';
import InvestmentAportHistoryDialog from '@/components/Investment/InvestmentAportHistoryDialog';
import InvestmentVaultsDialog from '@/components/Investment/InvestmentVaultsDialog';
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
import { CalendarIcon, Plus, TrendingDown, History, Vault } from 'lucide-react';
import { cn } from '@/lib/utils';

const InvestmentsPage = () => {
  const { investments, investmentsLoading } = useInvestments();
  const { addInvestment, isAddingInvestment, yieldRates, bankAccounts } = useFinancialData();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [selectedInvestments, setSelectedInvestments] = useState<string[]>([]);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLogsDialogOpen, setIsLogsDialogOpen] = useState(false);
  const [isVaultsDialogOpen, setIsVaultsDialogOpen] = useState(false);
  
  const [form, setForm] = useState<{
    name: string;
    type: string;
    amount: string;
    yield_type: 'fixed' | 'cdi' | 'selic' | 'ipca' | 'cdi_plus' | 'selic_plus' | 'ipca_plus';
    yield_rate: string;
    yield_extra: string;
    yield_percent_index: string;
    purchase_date: string;
    maturity_date: string;
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
    maturity_date: '',
    bank_account_id: 'none',
    already_owned: false
  });
  
  // Calculate first purchase date
  const firstPurchaseDate = React.useMemo(() => {
    if (investments.length === 0) return new Date();
    const sorted = investments
      .map(inv => new Date(inv.purchase_date))
      .sort((a, b) => a.getTime() - b.getTime());
    return sorted[0] || new Date();
  }, [investments]);

  // Date filter states - default from first investment to today
  const [appliedStartDate, setAppliedStartDate] = useState<Date>(new Date());
  const [appliedEndDate, setAppliedEndDate] = useState<Date>(new Date());
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(new Date());
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(new Date());

  // Set default filter when investments load
  React.useEffect(() => {
    if (investments.length > 0) {
      setAppliedStartDate(firstPurchaseDate);
      setAppliedEndDate(new Date());
    }
  }, [investments.length, firstPurchaseDate]);
  const [preSelectedInvestmentId, setPreSelectedInvestmentId] = useState<string | undefined>();


  return (
    <Layout>
      <div className="min-h-screen bg-fnb-cream">
        {/* Date Filter - sticky at top */}
        <div className="sticky top-0 z-10 bg-fnb-cream backdrop-blur-sm border-b border-border py-4"
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
                          if (investments.length > 0) {
                            const firstPurchaseDate = investments
                              .map(inv => new Date(inv.purchase_date))
                              .sort((a, b) => a.getTime() - b.getTime())[0];
                            setTempStartDate(firstPurchaseDate);
                          } else {
                            setTempStartDate(today);
                          }
                          setTempEndDate(today);
                        }}
                      >
                        Máximo
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          const today = new Date();
                          const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, 1);
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
                          const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
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
                          const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);
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
                          const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), 1);
                          setTempStartDate(oneYearAgo);
                          setTempEndDate(today);
                        }}
                      >
                        1 ano
                      </Button>
                    </div>
                  </div>
                  
                  {/* Month/Year Pickers */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="start-month" className="text-xs font-medium mb-2 block">Mês inicial</Label>
                      <Input
                        id="start-month"
                        type="month"
                        value={tempStartDate ? `${tempStartDate.getFullYear()}-${String(tempStartDate.getMonth() + 1).padStart(2, '0')}` : ''}
                        onChange={(e) => {
                          const [year, month] = e.target.value.split('-');
                          setTempStartDate(new Date(parseInt(year), parseInt(month) - 1, 1));
                        }}
                        max={tempEndDate ? `${tempEndDate.getFullYear()}-${String(tempEndDate.getMonth() + 1).padStart(2, '0')}` : undefined}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-month" className="text-xs font-medium mb-2 block">Mês final</Label>
                      <Input
                        id="end-month"
                        type="month"
                        value={tempEndDate ? `${tempEndDate.getFullYear()}-${String(tempEndDate.getMonth() + 1).padStart(2, '0')}` : ''}
                        onChange={(e) => {
                          const [year, month] = e.target.value.split('-');
                          setTempEndDate(new Date(parseInt(year), parseInt(month) - 1, 1));
                        }}
                        min={tempStartDate ? `${tempStartDate.getFullYear()}-${String(tempStartDate.getMonth() + 1).padStart(2, '0')}` : undefined}
                        className="h-9"
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
                    onClick={() => setIsLogsDialogOpen(true)}
                    title="Visualizar histórico de operações"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsVaultsDialogOpen(true)}
                    title="Gerenciar cofres de investimentos"
                  >
                    <Vault className="h-4 w-4" />
                  </Button>
                </div>

                <InvestmentTableView 
                  investments={investments}
                  startDate={appliedStartDate}
                  endDate={appliedEndDate}
                  selectedInvestments={selectedInvestments}
                  onSelectionChange={setSelectedInvestments}
                  onOpenWithdrawDialog={(investmentId) => {
                    setPreSelectedInvestmentId(investmentId);
                    setIsWithdrawDialogOpen(true);
                  }}
                  onOpenVaultsDialog={(investmentId) => {
                    setPreSelectedInvestmentId(investmentId);
                    setIsVaultsDialogOpen(true);
                  }}
                />

                <InvestmentWithdrawDialog
                  isOpen={isWithdrawDialogOpen}
                  onClose={() => {
                    setIsWithdrawDialogOpen(false);
                    setPreSelectedInvestmentId(undefined);
                  }}
                  investments={investments}
                  preSelectedInvestmentId={preSelectedInvestmentId}
                />

                <InvestmentAportHistoryDialog
                  open={isLogsDialogOpen}
                  onOpenChange={setIsLogsDialogOpen}
                />

                <InvestmentVaultsDialog
                  open={isVaultsDialogOpen}
                  onOpenChange={(open) => {
                    setIsVaultsDialogOpen(open);
                    if (!open) setPreSelectedInvestmentId(undefined);
                  }}
                  investmentId={preSelectedInvestmentId}
                />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Create Investment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
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
              maturity_date: form.maturity_date || undefined,
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
              maturity_date: '',
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
            
            <div>
              <Label htmlFor="maturity_date" className="text-sm">Data de Vencimento (Opcional)</Label>
              <Input
                id="maturity_date"
                type="date"
                value={form.maturity_date}
                onChange={(e) => setForm(prev => ({ ...prev, maturity_date: e.target.value }))}
                min={form.purchase_date}
                className="h-9"
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
