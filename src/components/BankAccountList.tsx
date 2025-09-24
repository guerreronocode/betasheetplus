
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, CreditCard, Wallet, Vault, ChevronDown, ChevronUp } from "lucide-react";
import { useBankAccountVaults } from "@/hooks/useBankAccountVaults";
import VaultsManager from "./vaults/VaultsManager";

const getAccountTypeIcon = (type: string) => {
  const icons = {
    checking: CreditCard,
    savings: Wallet,
    investment: Building2,
    physical_wallet: Wallet,
  };
  const IconComponent = icons[type as keyof typeof icons] || CreditCard;
  return <IconComponent className="w-4 h-4" />;
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

interface BankAccountListProps {
  bankAccounts: any[];
}

const BankAccountList: React.FC<BankAccountListProps> = ({ bankAccounts }) => {
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const { getTotalReserved } = useBankAccountVaults();

  if (bankAccounts.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Building2 className="w-8 h-8 mx-auto mb-3 text-gray-400" />
        <p className="text-sm">Nenhuma conta encontrada</p>
        <p className="text-xs">Adicione suas contas bancárias!</p>
      </div>
    );
  }

  const toggleAccountExpansion = (accountId: string) => {
    setExpandedAccount(expandedAccount === accountId ? null : accountId);
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 pr-2">
        {bankAccounts.map((account, index) => {
          const totalReserved = getTotalReserved(account.id);
          const availableAmount = account.balance - totalReserved;
          const isExpanded = expandedAccount === account.id;

          return (
            <div key={account.id} className="animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-md text-white" style={{ backgroundColor: account.color }}>
                      {getAccountTypeIcon(account.account_type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{account.name}</h4>
                      {account.account_type !== "physical_wallet" && (
                        <p className="text-xs text-gray-600">{account.bank_name}</p>
                      )}
                      <p className="text-xs text-gray-500">{getAccountTypeName(account.account_type)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-0.5">
                        <p className="text-xs text-gray-600">Saldo Total</p>
                        {totalReserved > 0 && (
                          <div className="flex items-center space-x-1">
                            <Vault className="w-2.5 h-2.5 text-green-600" />
                            <span className="text-xs text-green-600">{totalReserved.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                          </div>
                        )}
                      </div>
                      <p className={`font-semibold text-sm ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {account.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                      {totalReserved > 0 && (
                        <p className="text-xs text-gray-500">
                          Disponível: {availableAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAccountExpansion(account.id)}
                      className="h-7 px-2"
                    >
                      <Vault className="w-3 h-3 mr-1" />
                      <span className="text-xs">Cofres</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                    </Button>
                  </div>
                </div>
              </Card>
              
              {isExpanded && (
                <VaultsManager
                  bankAccountId={account.id}
                  bankAccountName={account.name}
                  bankAccountBalance={account.balance}
                />
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default BankAccountList;
