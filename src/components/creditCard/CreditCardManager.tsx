
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCardForm } from './CreditCardForm';
import { CreditCardList } from './CreditCardList';
import { PurchaseForm } from './PurchaseForm';
import { BillsList } from './BillsList';
import { PurchaseStatusPanel } from './PurchaseStatusPanel';
import { CreditLimitPanel } from './CreditLimitPanel';
import { CreditCardSelector } from './CreditCardSelector';

export const CreditCardManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Cartões de Crédito</h1>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="limits">Limites</TabsTrigger>
          <TabsTrigger value="cards">Cartões</TabsTrigger>
          <TabsTrigger value="purchases">Compras</TabsTrigger>
          <TabsTrigger value="bills">Faturas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BillsList />
            <PurchaseStatusPanel />
          </div>
        </TabsContent>

        <TabsContent value="limits" className="space-y-6">
          <CreditLimitPanel />
        </TabsContent>

        <TabsContent value="cards" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CreditCardForm />
            <CreditCardList />
          </div>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PurchaseForm onClose={() => {}} />
            <PurchaseStatusPanel />
          </div>
        </TabsContent>

        <TabsContent value="bills" className="space-y-6">
          <CreditCardSelector />
        </TabsContent>
      </Tabs>
    </div>
  );
};
