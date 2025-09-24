
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EnhancedCreditCardList } from './EnhancedCreditCardList';
import { PurchaseStatusPanel } from './PurchaseStatusPanel';
import { CreditCardSelector } from './CreditCardSelector';
import { CreditCardFormModal } from './CreditCardFormModal';
import { Plus, CreditCard } from 'lucide-react';

export const CreditCardManager: React.FC = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">Cartões de Crédito</h1>
        </div>
        <Button
          onClick={() => setIsFormModalOpen(true)}
          size="sm"
          className="h-8 px-3"
        >
          <Plus className="w-4 h-4 mr-1" />
          Novo Cartão
        </Button>
      </div>

      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger value="cards" className="text-xs">Cartões</TabsTrigger>
          <TabsTrigger value="status" className="text-xs">Status das Compras</TabsTrigger>
          <TabsTrigger value="bills" className="text-xs">Faturas</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4 mt-4">
          <EnhancedCreditCardList />
        </TabsContent>

        <TabsContent value="status" className="space-y-4 mt-4">
          <PurchaseStatusPanel />
        </TabsContent>

        <TabsContent value="bills" className="space-y-4 mt-4">
          <CreditCardSelector />
        </TabsContent>
      </Tabs>

      <CreditCardFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
      />
    </div>
  );
};
