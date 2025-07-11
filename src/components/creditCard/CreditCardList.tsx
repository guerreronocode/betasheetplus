
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Trash2, Edit } from 'lucide-react';
import { useCreditCards } from '@/hooks/useCreditCards';
import { formatCurrency } from '@/utils/formatters';
import { EditCreditCardDialog } from './EditCreditCardDialog';
import { CreditCard as CreditCardType } from '@/types/creditCard';

export const CreditCardList: React.FC = () => {
  const { creditCards, isLoading, deleteCreditCard } = useCreditCards();
  const [selectedCard, setSelectedCard] = useState<CreditCardType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditCard = (card: CreditCardType) => {
    setSelectedCard(card);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return <div>Carregando cartões...</div>;
  }

  if (creditCards.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Nenhum cartão de crédito cadastrado ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {creditCards.map((card) => (
          <Card key={card.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{card.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    Ativo
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCard(card)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCreditCard(card.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Limite</p>
                  <p className="font-semibold">{formatCurrency(card.credit_limit)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fechamento</p>
                  <p className="font-semibold">Dia {card.closing_day}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vencimento</p>
                  <p className="font-semibold">Dia {card.due_day}</p>
                </div>
              </div>
              {card.include_in_patrimony && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Incluso no patrimônio
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <EditCreditCardDialog
        card={selectedCard}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedCard(null);
        }}
      />
    </>
  );
};
