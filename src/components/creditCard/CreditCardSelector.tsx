import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Eye } from 'lucide-react';
import { useCreditCards } from '@/hooks/useCreditCards';
import { formatCurrency } from '@/utils/formatters';
import { CreditCardBillsModal } from './CreditCardBillsModal';

export const CreditCardSelector: React.FC = () => {
  const { creditCards, isLoading } = useCreditCards();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewBills = (cardId: string) => {
    setSelectedCardId(cardId);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (creditCards.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum cartão encontrado
          </h3>
          <p className="text-gray-500">
            Cadastre seus cartões de crédito para gerenciar as faturas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Selecione um Cartão para Ver as Faturas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {creditCards.map((card) => (
            <Card key={card.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  {card.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Limite:</span>
                    <span className="font-medium">{formatCurrency(card.credit_limit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fechamento:</span>
                    <span className="font-medium">Dia {card.closing_day}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vencimento:</span>
                    <span className="font-medium">Dia {card.due_day}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleViewBills(card.id)}
                  className="w-full mt-4"
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Faturas
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <CreditCardBillsModal
        creditCardId={selectedCardId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCardId(null);
        }}
      />
    </>
  );
};