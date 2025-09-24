
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EnhancedCreditCardList } from './EnhancedCreditCardList';
import { CreditCardFormModal } from './CreditCardFormModal';
import { Plus, CreditCard, ShoppingCart } from 'lucide-react';

export const CreditCardManager: React.FC = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">Cartões de Crédito</h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsFormModalOpen(true)}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => window.location.href = "/purchase-status"}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4 mt-4">
        <EnhancedCreditCardList />
      </div>

      <CreditCardFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
      />
    </div>
  );
};
