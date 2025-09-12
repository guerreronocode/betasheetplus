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
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg" style={{ background: 'var(--support-info-100)' }}>
            <Building2 className="w-6 h-6" style={{ color: 'var(--support-info-600)' }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-ink)' }}>Contas Bancárias</h3>
            <p className="text-sm" style={{ color: 'var(--brand-ink)', opacity: 0.7, fontFamily: 'var(--font-sans)' }}>Gerencie suas contas e saldos</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setIsAddingNew(!isAddingNew)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </button>
      </div>

      {isAddingNew && (
        <BankAccountForm
          form={newAccount}
          onChange={setNewAccount}
          onSubmit={handleSubmit}
          isSaving={isAddingBankAccount}
          onCancel={() => setIsAddingNew(false)}
        />
      )}

      <BankAccountList bankAccounts={bankAccounts} />
    </div>
  );
};

export default BankAccountManager;
