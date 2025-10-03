import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { usePendingTransactionActions } from '@/hooks/usePendingTransactionActions';
import { PendingTransaction } from '@/hooks/usePendingTransactions';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';

interface EffectTransactionDialogProps {
  transaction: PendingTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EffectTransactionDialog: React.FC<EffectTransactionDialogProps> = ({
  transaction,
  isOpen,
  onClose
}) => {
  const { bankAccounts } = useBankAccounts();
  const { effectPlannedIncome, effectPlannedExpense, isEffecting } = usePendingTransactionActions();
  
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>('');
  const [effectiveDate, setEffectiveDate] = React.useState<string>(format(new Date(), 'yyyy-MM-dd'));

  React.useEffect(() => {
    if (isOpen && transaction) {
      setEffectiveDate(format(new Date(), 'yyyy-MM-dd'));
      if (bankAccounts && bankAccounts.length > 0) {
        setSelectedAccountId(bankAccounts[0].id);
      }
    }
  }, [isOpen, transaction, bankAccounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction || !selectedAccountId) return;

    const transactionId = transaction.id.replace('income-', '').replace('expense-', '');

    if (transaction.type === 'planned_income') {
      effectPlannedIncome({
        plannedIncomeId: transactionId,
        bankAccountId: selectedAccountId,
        effectiveDate
      });
    } else if (transaction.type === 'planned_expense') {
      effectPlannedExpense({
        plannedExpenseId: transactionId,
        bankAccountId: selectedAccountId,
        effectiveDate
      });
    }

    onClose();
  };

  if (!transaction) return null;

  const isIncome = transaction.type === 'planned_income';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Efetivar {isIncome ? 'Receita' : 'Despesa'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações da transação */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Descrição:</span>
              <span className="text-sm font-medium">{transaction.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Categoria:</span>
              <span className="text-sm font-medium">{transaction.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Valor:</span>
              <span className={`text-sm font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.value))}
              </span>
            </div>
          </div>

          {/* Data de efetivação */}
          <div className="space-y-2">
            <Label htmlFor="effectiveDate">Data de efetivação</Label>
            <Input
              id="effectiveDate"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>

          {/* Conta bancária */}
          <div className="space-y-2">
            <Label htmlFor="bankAccount">Conta bancária</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger id="bankAccount">
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts?.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - {account.bank_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isEffecting || !selectedAccountId}>
              {isEffecting ? 'Efetivando...' : 'Efetivar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
