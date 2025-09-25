
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedCreditCardList } from './EnhancedCreditCardList';
import { CreditCardFormModal } from './CreditCardFormModal';
import { PurchaseStatusPanel } from './PurchaseStatusPanel';
import { Plus, CreditCard, ShoppingBag } from 'lucide-react';

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
          className="h-8 w-8 p-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Tabs defaultValue="cartoes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cartoes" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Cartões
          </TabsTrigger>
          <TabsTrigger value="compras" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Status das Compras
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="cartoes" className="mt-4">
          <EnhancedCreditCardList />
        </TabsContent>
        
        <TabsContent value="compras" className="mt-4">
          <PurchaseStatusPanel />
        </TabsContent>
      </Tabs>

      <CreditCardFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
      />
    </div>
  );
};
