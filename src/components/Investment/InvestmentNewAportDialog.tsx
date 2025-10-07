import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { useInvestments } from '@/hooks/useInvestments';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface InvestmentNewAportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investmentId: string;
  investmentName: string;
  month: Date;
}

const InvestmentNewAportDialog: React.FC<InvestmentNewAportDialogProps> = ({
  open,
  onOpenChange,
  investmentId,
  investmentName,
  month,
}) => {
  const { toast } = useToast();
  const { addInvestmentAport, investments } = useInvestments();
  const { bankAccounts } = useBankAccounts();
  
  const [aportAmount, setAportAmount] = useState<string>('');
  const [newTotal, setNewTotal] = useState<string>('');
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>('');

  const investment = investments.find(inv => inv.id === investmentId);
  const currentAmount = investment?.amount || 0;
  const currentValue = investment?.current_value || 0;

  const handleSave = () => {
    const aport = parseFloat(aportAmount);
    const total = parseFloat(newTotal);

    if (isNaN(aport) || aport <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor do aporte deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(total) || total < currentValue + aport) {
      toast({
        title: "Valor total inválido",
        description: "O novo valor total deve ser maior ou igual ao valor atual + aporte.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBankAccount) {
      toast({
        title: "Conta bancária não selecionada",
        description: "Selecione uma conta bancária para realizar o aporte.",
        variant: "destructive",
      });
      return;
    }

    addInvestmentAport(investmentId, aport, total, selectedBankAccount);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Aporte</DialogTitle>
          <DialogDescription>
            {investmentName} - {month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Valor Aplicado Atual (informativo)</Label>
            <Input 
              type="text" 
              value={formatCurrency(currentAmount)} 
              disabled 
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label>Valor Total Atual (informativo)</Label>
            <Input 
              type="text" 
              value={formatCurrency(currentValue)} 
              disabled 
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aportAmount">Valor do Aporte</Label>
            <Input
              id="aportAmount"
              type="number"
              step="0.01"
              min="0"
              value={aportAmount}
              onChange={(e) => setAportAmount(e.target.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">
              Quanto você está adicionando ao investimento
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newTotal">Novo Valor Total</Label>
            <Input
              id="newTotal"
              type="number"
              step="0.01"
              min="0"
              value={newTotal}
              onChange={(e) => setNewTotal(e.target.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground">
              Valor total após o aporte (incluindo rendimentos)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankAccount">Conta Bancária</Label>
            <Select value={selectedBankAccount} onValueChange={setSelectedBankAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - {formatCurrency(account.balance)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 p-3 rounded-md space-y-1">
            <p className="text-xs font-medium">Rendimento calculado</p>
            <p className={`text-sm font-semibold ${(parseFloat(newTotal || '0') - currentValue - parseFloat(aportAmount || '0')) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(parseFloat(newTotal || '0') - currentValue - parseFloat(aportAmount || '0'))}
            </p>
            <p className="text-xs text-muted-foreground">
              Diferença entre novo total e (valor atual + aporte)
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentNewAportDialog;
