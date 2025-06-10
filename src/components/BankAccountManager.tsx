
import React, { useState } from 'react';
import { Building2, Plus, CreditCard, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinancialData } from '@/hooks/useFinancialData';

const BankAccountManager = () => {
  const { bankAccounts, addBankAccount, isAddingBankAccount } = useFinancialData();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    bank_name: '',
    account_type: 'checking',
    balance: '',
    color: '#3B82F6'
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name || !newAccount.bank_name || !newAccount.balance) return;

    addBankAccount({
      name: newAccount.name,
      bank_name: newAccount.bank_name,
      account_type: newAccount.account_type,
      balance: parseFloat(newAccount.balance),
      color: newAccount.color
    });

    setNewAccount({
      name: '',
      bank_name: '',
      account_type: 'checking',
      balance: '',
      color: '#3B82F6'
    });
    setIsAddingNew(false);
  };

  const getAccountTypeIcon = (type: string) => {
    const icons = {
      checking: CreditCard,
      savings: Wallet,
      investment: Building2,
    };
    const IconComponent = icons[type as keyof typeof icons] || CreditCard;
    return <IconComponent className="w-5 h-5" />;
  };

  const getAccountTypeName = (type: string) => {
    const names = {
      checking: 'Conta Corrente',
      savings: 'Conta Poupança',
      investment: 'Conta Investimento',
    };
    return names[type as keyof typeof names] || 'Conta Corrente';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Contas Bancárias</h3>
            <p className="text-sm text-gray-600">Gerencie suas contas e saldos</p>
          </div>
        </div>
        <Button onClick={() => setIsAddingNew(!isAddingNew)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {isAddingNew && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome da Conta</Label>
              <Input
                id="name"
                type="text"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                placeholder="Ex: Conta Principal"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="bank_name">Banco</Label>
              <Select value={newAccount.bank_name} onValueChange={(value) => setNewAccount({ ...newAccount, bank_name: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Itaú">Itaú</SelectItem>
                  <SelectItem value="Bradesco">Bradesco</SelectItem>
                  <SelectItem value="Banco do Brasil">Banco do Brasil</SelectItem>
                  <SelectItem value="Santander">Santander</SelectItem>
                  <SelectItem value="Caixa">Caixa Econômica</SelectItem>
                  <SelectItem value="Nubank">Nubank</SelectItem>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="XP">XP Investimentos</SelectItem>
                  <SelectItem value="BTG">BTG Pactual</SelectItem>
                  <SelectItem value="C6 Bank">C6 Bank</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="account_type">Tipo de Conta</Label>
              <Select value={newAccount.account_type} onValueChange={(value) => setNewAccount({ ...newAccount, account_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Conta Corrente</SelectItem>
                  <SelectItem value="savings">Conta Poupança</SelectItem>
                  <SelectItem value="investment">Conta Investimento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="balance">Saldo Atual</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                min="0"
                value={newAccount.balance}
                onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <Label htmlFor="color">Cor</Label>
              <Input
                id="color"
                type="color"
                value={newAccount.color}
                onChange={(e) => setNewAccount({ ...newAccount, color: e.target.value })}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={isAddingBankAccount}>
              {isAddingBankAccount ? 'Adicionando...' : 'Adicionar Conta'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsAddingNew(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {bankAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhuma conta encontrada</p>
            <p className="text-sm">Adicione suas contas bancárias!</p>
          </div>
        ) : (
          bankAccounts.map((account, index) => (
            <div key={account.id} className="animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-2 rounded-lg text-white"
                      style={{ backgroundColor: account.color }}
                    >
                      {getAccountTypeIcon(account.account_type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{account.name}</h4>
                      <p className="text-sm text-gray-600">{account.bank_name}</p>
                      <p className="text-xs text-gray-500">{getAccountTypeName(account.account_type)}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Saldo</p>
                    <p className={`font-semibold text-lg ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default BankAccountManager;
