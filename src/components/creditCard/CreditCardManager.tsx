
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EnhancedCreditCardList } from './EnhancedCreditCardList';
import { CreditCardFormModal } from './CreditCardFormModal';
import { PurchaseStatusPanel } from './PurchaseStatusPanel';
import { Plus, CreditCard, ShoppingBag } from 'lucide-react';

export const CreditCardManager: React.FC = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const isCardsView = location.pathname === '/credit-cards/cards';
  const isPurchaseStatusView = location.pathname === '/credit-cards/purchase-status';

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
            onClick={() => navigate('/credit-cards/purchase-status')}
            variant={isPurchaseStatusView ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <ShoppingBag className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => navigate('/credit-cards/cards')}
          variant={isCardsView ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          Cartões
        </Button>
        <Button
          onClick={() => navigate('/credit-cards/purchase-status')}
          variant={isPurchaseStatusView ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Status das Compras
        </Button>
      </div>

      <div className="mt-4">
        {isCardsView && <EnhancedCreditCardList />}
        {isPurchaseStatusView && <PurchaseStatusPanel />}
      </div>

      <CreditCardFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
      />
    </div>
  );
};
