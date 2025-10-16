import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Investment } from '@/hooks/useInvestments';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface InvestmentWithdrawDialogProps {
  isOpen: boolean;
  onClose: () => void;
  investments: Investment[];
  preSelectedInvestmentId?: string;
}

const InvestmentWithdrawDialog: React.FC<InvestmentWithdrawDialogProps> = ({
  isOpen,
  onClose,
  investments,
  preSelectedInvestmentId
}) => {
  const { bankAccounts } = useFinancialData();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [bankAccountId, setBankAccountId] = useState<string>('');
  const [withdrawMonth, setWithdrawMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [hasTransactionCost, setHasTransactionCost] = useState(false);
  const [transactionCost, setTransactionCost] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Set pre-selected investment when dialog opens
  React.useEffect(() => {
    if (isOpen && preSelectedInvestmentId) {
      setSelectedInvestmentId(preSelectedInvestmentId);
    }
  }, [isOpen, preSelectedInvestmentId]);

  const selectedInvestment = investments.find(inv => inv.id === selectedInvestmentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedInvestment) return;

    const withdrawAmountNum = parseFloat(withdrawAmount);
    const transactionCostNum = hasTransactionCost ? parseFloat(transactionCost || '0') : 0;
    const netAmount = withdrawAmountNum - transactionCostNum;

    if (withdrawAmountNum > selectedInvestment.current_value) {
      toast({
        title: 'Erro',
        description: 'Valor de resgate não pode ser maior que o valor atual do investimento',
        variant: 'destructive'
      });
      return;
    }

    if (netAmount <= 0) {
      toast({
        title: 'Erro',
        description: 'Valor líquido do resgate deve ser maior que zero',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const newCurrentValue = selectedInvestment.current_value - withdrawAmountNum;
      const proportionalAmount = (selectedInvestment.amount * newCurrentValue) / selectedInvestment.current_value;

      // Parse withdraw month to get month_date
      const [year, month] = withdrawMonth.split('-');
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthDateStr = monthDate.toISOString().split('T')[0];

      // Update investment
      const { error: investmentError } = await supabase
        .from('investments')
        .update({
          current_value: newCurrentValue,
          amount: proportionalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedInvestmentId)
        .eq('user_id', user.id);

      if (investmentError) throw investmentError;

      // Add to bank account if selected
      if (bankAccountId) {
        const { data: currentAccount, error: fetchError } = await supabase
          .from('bank_accounts')
          .select('balance')
          .eq('id', bankAccountId)
          .eq('user_id', user.id)
          .single();

        if (fetchError) throw fetchError;

        const { error: balanceError } = await supabase
          .from('bank_accounts')
          .update({
            balance: currentAccount.balance + netAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', bankAccountId)
          .eq('user_id', user.id);

        if (balanceError) throw balanceError;
      }

      // Update monthly value for the withdrawal month
      const { data: existingMonthlyValue } = await supabase
        .from('investment_monthly_values')
        .select('*')
        .eq('investment_id', selectedInvestmentId)
        .eq('month_date', monthDateStr)
        .maybeSingle();

      if (existingMonthlyValue) {
        const newTotalValue = existingMonthlyValue.total_value - withdrawAmountNum;
        const newYieldValue = newTotalValue - existingMonthlyValue.applied_value;

        await supabase
          .from('investment_monthly_values')
          .update({
            total_value: newTotalValue,
            yield_value: newYieldValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingMonthlyValue.id);
      }
      // Não criar registro mensal se não existe - resgate não cria novo mês

      // Create withdrawal log
      await supabase
        .from('investment_logs')
        .insert({
          user_id: user.id,
          investment_id: selectedInvestmentId,
          operation_type: 'withdraw',
          amount: withdrawAmountNum,
          previous_value: selectedInvestment.current_value,
          new_value: newCurrentValue,
          month_date: monthDateStr,
          bank_account_id: bankAccountId || null,
          notes: hasTransactionCost ? `Custo de transação: R$ ${transactionCostNum.toFixed(2)}` : null
        });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment_monthly_values'] });
      queryClient.invalidateQueries({ queryKey: ['investment-logs'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      queryClient.invalidateQueries({ queryKey: ['user_stats'] });

      toast({
        title: 'Resgate realizado com sucesso!',
        description: hasTransactionCost 
          ? `Valor bruto: R$ ${withdrawAmountNum.toFixed(2)} | Custo: R$ ${transactionCostNum.toFixed(2)} | Líquido: R$ ${netAmount.toFixed(2)}`
          : `Valor resgatado: R$ ${netAmount.toFixed(2)}`
      });

      // Reset form
      setSelectedInvestmentId('');
      setWithdrawAmount('');
      setBankAccountId('');
      const today = new Date();
      setWithdrawMonth(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
      setHasTransactionCost(false);
      setTransactionCost('');
      onClose();
    } catch (error) {
      console.error('Erro ao realizar resgate:', error);
      toast({
        title: 'Erro ao realizar resgate',
        description: 'Tente novamente mais tarde',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate min month based on selected investment purchase date
  const minMonth = selectedInvestment 
    ? (() => {
        const purchaseDate = new Date(selectedInvestment.purchase_date);
        return `${purchaseDate.getFullYear()}-${String(purchaseDate.getMonth() + 1).padStart(2, '0')}`;
      })()
    : '';

  // Max month is current month
  const today = new Date();
  const maxMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resgate de Investimento</DialogTitle>
        </DialogHeader>

        {selectedInvestment && (
          <Card className="p-4 mb-4 bg-muted/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Nome</p>
                <p className="font-semibold">{selectedInvestment.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Tipo</p>
                <p className="font-semibold">{selectedInvestment.type}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Valor Investido</p>
                <p className="font-semibold">R$ {selectedInvestment.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Valor Atual</p>
                <p className="font-semibold text-green-600">R$ {selectedInvestment.current_value.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="investment">Investimento</Label>
            <Select value={selectedInvestmentId} onValueChange={setSelectedInvestmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o investimento" />
              </SelectTrigger>
              <SelectContent>
                {investments.map(inv => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.name} - R$ {inv.current_value.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bank_account">Conta de Destino</Label>
            <Select value={bankAccountId} onValueChange={setBankAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - {account.bank_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="withdraw_amount">Valor a Resgatar</Label>
            <Input
              id="withdraw_amount"
              type="number"
              step="0.01"
              min="0"
              max={selectedInvestment?.current_value || undefined}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              required
            />
            {selectedInvestment && (
              <p className="text-xs text-muted-foreground mt-1">
                Máximo disponível: R$ {selectedInvestment.current_value.toFixed(2)}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_cost"
              checked={hasTransactionCost}
              onCheckedChange={(checked) => {
                setHasTransactionCost(checked === true);
                if (!checked) setTransactionCost('');
              }}
            />
            <Label htmlFor="has_cost" className="cursor-pointer">
              Custo de Transação
            </Label>
          </div>

          {hasTransactionCost && (
            <div>
              <Label htmlFor="transaction_cost">Valor do Custo</Label>
              <Input
                id="transaction_cost"
                type="number"
                step="0.01"
                min="0"
                value={transactionCost}
                onChange={(e) => setTransactionCost(e.target.value)}
                placeholder="0.00"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Esse valor será deduzido do resgate (impostos, taxas, etc.)
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="withdraw_month">Mês/Ano do Resgate</Label>
            <Input
              id="withdraw_month"
              type="month"
              min={minMonth}
              max={maxMonth}
              value={withdrawMonth}
              onChange={(e) => setWithdrawMonth(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Selecione o mês em que o resgate será contabilizado
            </p>
          </div>

          {withdrawAmount && hasTransactionCost && transactionCost && (
            <Card className="p-3 bg-muted/30">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Valor bruto:</span>
                  <span className="font-semibold">R$ {parseFloat(withdrawAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Custo:</span>
                  <span className="font-semibold">- R$ {parseFloat(transactionCost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Valor líquido:</span>
                  <span className="font-bold text-green-600">
                    R$ {(parseFloat(withdrawAmount) - parseFloat(transactionCost)).toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isLoading || !selectedInvestmentId || !withdrawAmount || !bankAccountId}
            >
              {isLoading ? 'Processando...' : 'Confirmar Resgate'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentWithdrawDialog;
