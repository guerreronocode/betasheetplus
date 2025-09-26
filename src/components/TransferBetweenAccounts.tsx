
import React, { useState } from 'react';
import { ArrowRightLeft, DollarSign, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const TransferBetweenAccounts = () => {
  const { bankAccounts } = useFinancialData();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isTransferring, setIsTransferring] = useState(false);
  
  const [transferForm, setTransferForm] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount) return;
    
    const amount = parseFloat(transferForm.amount);
    if (amount <= 0) {
      toast({ title: 'Valor deve ser maior que zero', variant: 'destructive' });
      return;
    }

    if (transferForm.fromAccountId === transferForm.toAccountId) {
      toast({ title: 'Contas de origem e destino devem ser diferentes', variant: 'destructive' });
      return;
    }

    setIsTransferring(true);
    
    try {
      // Verificar saldo da conta de origem
      const { data: fromAccount, error: fromError } = await supabase
        .from('bank_accounts')
        .select('balance, name')
        .eq('id', transferForm.fromAccountId)
        .eq('user_id', user?.id)
        .single();

      if (fromError) throw fromError;

      // Get total reserved amount in vaults for the source account
      const { data: vaults, error: vaultsError } = await supabase
        .from('bank_account_vaults')
        .select('reserved_amount')
        .eq('bank_account_id', transferForm.fromAccountId)
        .eq('user_id', user?.id);

      if (vaultsError) throw vaultsError;

      const totalReserved = vaults?.reduce((sum, vault) => sum + vault.reserved_amount, 0) || 0;
      const availableBalance = fromAccount.balance - totalReserved;

      if (availableBalance < amount) {
        toast({ 
          title: 'Saldo insuficiente', 
          description: `A conta ${fromAccount.name} não possui saldo disponível suficiente. ` +
            `Saldo disponível: R$ ${availableBalance.toFixed(2)} ` +
            `(Saldo total: R$ ${fromAccount.balance.toFixed(2)}, ` +
            `Reservado em cofres: R$ ${totalReserved.toFixed(2)}). ` +
            `Para realizar esta transferência, retire primeiro o valor necessário dos cofres.`,
          variant: 'destructive' 
        });
        return;
      }

      // Atualizar saldo da conta de origem (debitar)
      const { error: debitError } = await supabase
        .from('bank_accounts')
        .update({ 
          balance: fromAccount.balance - amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', transferForm.fromAccountId)
        .eq('user_id', user?.id);

      if (debitError) throw debitError;

      // Buscar saldo da conta de destino
      const { data: toAccount, error: toError } = await supabase
        .from('bank_accounts')
        .select('balance')
        .eq('id', transferForm.toAccountId)
        .eq('user_id', user?.id)
        .single();

      if (toError) throw toError;

      // Atualizar saldo da conta de destino (creditar)
      const { error: creditError } = await supabase
        .from('bank_accounts')
        .update({ 
          balance: toAccount.balance + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', transferForm.toAccountId)
        .eq('user_id', user?.id);

      if (creditError) throw creditError;

      // Registrar a transferência como despesa na conta de origem
      const { error: expenseError } = await supabase
        .from('expenses')
        .insert([{
          user_id: user?.id,
          description: transferForm.description || 'Transferência entre contas',
          amount: amount,
          category: 'Transferência',
          date: transferForm.date,
          bank_account_id: transferForm.fromAccountId
        }]);

      if (expenseError) throw expenseError;

      // Registrar a transferência como receita na conta de destino
      const { error: incomeError } = await supabase
        .from('income')
        .insert([{
          user_id: user?.id,
          description: transferForm.description || 'Transferência entre contas',
          amount: amount,
          category: 'Transferência',
          date: transferForm.date,
          bank_account_id: transferForm.toAccountId
        }]);

      if (incomeError) throw incomeError;

      toast({ title: 'Transferência realizada com sucesso!' });
      
      setTransferForm({
        fromAccountId: '',
        toAccountId: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });

      // Recarregar dados
      window.location.reload();
      
    } catch (error) {
      console.error('Erro na transferência:', error);
      toast({ 
        title: 'Erro na transferência', 
        description: 'Não foi possível realizar a transferência.',
        variant: 'destructive' 
      });
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ArrowRightLeft className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Transferência entre Contas</h3>
          <p className="text-sm text-gray-600">Transfira dinheiro entre suas contas</p>
        </div>
      </div>

      <form onSubmit={handleTransfer} className="space-y-3">
        <div>
          <Label htmlFor="from-account" className="text-xs">Conta de Origem</Label>
          <Select
            value={transferForm.fromAccountId}
            onValueChange={(value) => setTransferForm(prev => ({ ...prev, fromAccountId: value }))}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Selecione a conta de origem" />
            </SelectTrigger>
            <SelectContent>
              {bankAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: account.color }}
                    />
                    <span>{account.name} - {account.bank_name}</span>
                    <span className="text-sm text-gray-500">
                      (Saldo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.balance)})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="to-account" className="text-xs">Conta de Destino</Label>
          <Select
            value={transferForm.toAccountId}
            onValueChange={(value) => setTransferForm(prev => ({ ...prev, toAccountId: value }))}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Selecione a conta de destino" />
            </SelectTrigger>
            <SelectContent>
              {bankAccounts.filter(account => account.id !== transferForm.fromAccountId).map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: account.color }}
                    />
                    <span>{account.name} - {account.bank_name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="transfer-amount" className="text-xs">Valor da Transferência</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
            <Input
              id="transfer-amount"
              type="number"
              step="0.01"
              min="0"
              value={transferForm.amount}
              onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              className="pl-10 h-8"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="transfer-description" className="text-xs">Descrição (Opcional)</Label>
          <Input
            id="transfer-description"
            value={transferForm.description}
            onChange={(e) => setTransferForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Ex: Depósito na corretora"
            className="h-8"
          />
        </div>

        <div>
          <Label htmlFor="transfer-date" className="text-xs">Data</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
            <Input
              id="transfer-date"
              type="date"
              value={transferForm.date}
              onChange={(e) => setTransferForm(prev => ({ ...prev, date: e.target.value }))}
              className="pl-10 h-8"
              required
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 h-8" 
          disabled={isTransferring || bankAccounts.length < 2}
        >
          {isTransferring ? 'Transferindo...' : 'Realizar Transferência'}
        </Button>

        {bankAccounts.length < 2 && (
          <p className="text-sm text-gray-500 text-center">
            Você precisa ter pelo menos 2 contas cadastradas para fazer transferências.
          </p>
        )}
      </form>
    </Card>
  );
};

export default TransferBetweenAccounts;
