
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCardForm } from './CreditCardForm';
import { EnhancedCreditCardList } from './EnhancedCreditCardList';
import { PurchaseStatusPanel } from './PurchaseStatusPanel';
import { CreditCardSelector } from './CreditCardSelector';

export const CreditCardManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Cartões de Crédito</h1>
      </div>

      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cards">Cartões</TabsTrigger>
          <TabsTrigger value="status">Status das Compras</TabsTrigger>
          <TabsTrigger value="bills">Faturas</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <CreditCardForm />
            </div>
            <div className="lg:col-span-2">
              <EnhancedCreditCardList />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <PurchaseStatusPanel />
        </TabsContent>

        <TabsContent value="bills" className="space-y-6">
          <CreditCardSelector />
        </TabsContent>
      </Tabs>
    </div>
  );
};
