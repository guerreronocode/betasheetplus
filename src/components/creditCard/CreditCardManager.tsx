
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EnhancedCreditCardList } from './EnhancedCreditCardList';
import { CreditCardFormModal } from './CreditCardFormModal';
import { PurchaseStatusPanel } from './PurchaseStatusPanel';
import { Plus, CreditCard, ShoppingBag, ArrowLeft } from 'lucide-react';

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
          {isPurchaseStatusView && (
            <Button
              onClick={() => navigate('/credit-cards/cards')}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <CreditCard className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">
            {isPurchaseStatusView ? 'Status das Compras' : 'Cartões de Crédito'}
          </h1>
        </div>
        <div className="flex gap-2">
          {isCardsView && (
            <Button
              onClick={() => setIsFormModalOpen(true)}
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
          {isCardsView && (
            <Button
              onClick={() => navigate('/credit-cards/purchase-status')}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ShoppingBag className="w-4 h-4" />
            </Button>
          )}
        </div>
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
