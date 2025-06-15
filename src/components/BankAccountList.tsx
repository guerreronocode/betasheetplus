
import React from "react";
import { Card } from "@/components/ui/card";
import { Building2, CreditCard, Wallet } from "lucide-react";

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

interface BankAccountListProps {
  bankAccounts: any[];
}

const BankAccountList: React.FC<BankAccountListProps> = ({ bankAccounts }) => {
  if (bankAccounts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>Nenhuma conta encontrada</p>
        <p className="text-sm">Adicione suas contas bancárias!</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {bankAccounts.map((account, index) => (
        <div key={account.id} className="animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg text-white" style={{ backgroundColor: account.color }}>
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
                  {account.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default BankAccountList;
