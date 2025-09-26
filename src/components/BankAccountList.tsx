
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
            <div key={account.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <Card className="p-3 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg text-white" style={{ backgroundColor: account.color }}>
                      {getAccountTypeIcon(account.account_type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">{account.name}</h4>
                      {account.account_type !== "physical_wallet" && (
                        <p className="text-xs text-gray-600">{account.bank_name}</p>
                      )}
                      <p className="text-xs text-gray-500">{getAccountTypeName(account.account_type)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-end space-x-1">
                          <span className="text-xs text-gray-600">Saldo total:</span>
                          <span className={`font-bold text-sm ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {account.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </span>
                        </div>
                        {totalReserved > 0 && (
                          <>
                            <div className="flex items-center justify-end space-x-1">
                              <span className="text-xs text-gray-600">Reservado:</span>
                              <span className="text-xs text-blue-600 font-medium">
                                {totalReserved.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </span>
                            </div>
                            <div className="flex items-center justify-end space-x-1">
                              <span className="text-xs text-gray-600">Disponível:</span>
                              <span className="text-xs text-green-600 font-medium">
                                {availableAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAccountExpansion(account.id)}
                      className="h-7 px-2"
                    >
                      <span className="text-xs mr-1">Cofres</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </Card>
              
              {isExpanded && (
                <div className="ml-4 mt-1.5 border-l border-gray-200 pl-3">
                  <VaultsManager
                    bankAccountId={account.id}
                    bankAccountName={account.name}
                    bankAccountBalance={account.balance}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default BankAccountList;
