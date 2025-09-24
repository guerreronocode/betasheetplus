import React, { useState } from 'react';
import { Building2, Plus, CreditCard, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinancialData } from '@/hooks/useFinancialData';
import BankAccountForm from "./BankAccountForm";
import BankAccountList from "./BankAccountList";

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
    console.log("handleSubmit called", { newAccount });
    if (!newAccount.name) {
      console.log("Missing required fields");
      return;
    }

    const accountData = {
      name: newAccount.name,
      bank_name: newAccount.account_type === 'physical_wallet' ? 'Carteira Física' : newAccount.bank_name,
      account_type: newAccount.account_type,
      balance: newAccount.balance ? parseFloat(newAccount.balance) : 0,
      color: newAccount.color
    };

    console.log("Calling addBankAccount with:", accountData);
    addBankAccount(accountData);

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
      physical_wallet: Wallet,
    };
    const IconComponent = icons[type as keyof typeof icons] || CreditCard;
    return <IconComponent className="w-5 h-5" />;
  };

  const getAccountTypeName = (type: string) => {
    const names = {
      checking: 'Conta Corrente',
      savings: 'Conta Poupança',
      investment: 'Conta Investimento',
      physical_wallet: 'Carteira Física',
    };
    return names[type as keyof typeof names] || 'Conta Corrente';
  };

  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-100 rounded-md">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Contas Bancárias</h3>
            <p className="text-xs text-gray-600">Gerencie suas contas e saldos</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setIsAddingNew(!isAddingNew)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {isAddingNew && (
        <div className="mb-4">
          <BankAccountForm
            form={newAccount}
            onChange={setNewAccount}
            onSubmit={handleSubmit}
            isSaving={isAddingBankAccount}
            onCancel={() => setIsAddingNew(false)}
          />
        </div>
      )}

      <div className="flex-1 min-h-0">
        <BankAccountList bankAccounts={bankAccounts} />
      </div>
    </Card>
  );
};

export default BankAccountManager;
