
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EnhancedCreditCardList } from './EnhancedCreditCardList';
import { PurchaseStatusPanel } from './PurchaseStatusPanel';
import { CreditCardSelector } from './CreditCardSelector';
import { CreditCardFormModal } from './CreditCardFormModal';
import { Plus, CreditCard, ShoppingCart } from 'lucide-react';

export const CreditCardManager: React.FC = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("cards");

  return (
    <div className="w-4/6 mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">Cartões de Crédito</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab("status")}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setIsFormModalOpen(true)}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
