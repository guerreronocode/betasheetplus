import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CreditCard, Trash2, Edit, Receipt, TrendingUp, FileText, BarChart3, TrendingDown } from 'lucide-react';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useCreditCardBillsByCard } from '@/hooks/useCreditCardBillsByCard';
import { formatCurrency } from '@/utils/formatters';
import { EditCreditCardDialog } from './EditCreditCardDialog';
import { CreditLimitProjectionCard } from './CreditLimitProjectionCard';
import { CreditCardBillsView } from './CreditCardBillsView';
import { CreditCard as CreditCardType } from '@/types/creditCard';

export const EnhancedCreditCardList: React.FC = () => {
  const { creditCards, isLoading, deleteCreditCard, creditCardBalances, isLoadingBalances } = useCreditCards();
  const [selectedCard, setSelectedCard] = useState<CreditCardType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [cardViewType, setCardViewType] = useState<{[key: string]: 'bills' | 'projection'}>({});

  const handleEditCard = (card: CreditCardType) => {
    setSelectedCard(card);
    setIsEditDialogOpen(true);
  };

  const toggleCardExpansion = (cardId: string, viewType: 'bills' | 'projection') => {
    const newExpanded = new Set(expandedCards);
    const newViewType = { ...cardViewType };
    
    if (newExpanded.has(cardId) && cardViewType[cardId] === viewType) {
      newExpanded.delete(cardId);
      delete newViewType[cardId];
    } else {
      newExpanded.add(cardId);
      newViewType[cardId] = viewType;
    }
    
    setExpandedCards(newExpanded);
    setCardViewType(newViewType);
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

  // Calcular totais gerais
  const totalLimit = creditCardBalances.reduce((sum, card) => sum + card.credit_limit, 0);
  const totalCommitted = creditCardBalances.reduce((sum, card) => sum + card.total_committed, 0);
  const totalAvailable = creditCardBalances.reduce((sum, card) => sum + card.available_limit, 0);
  const usagePercentage = totalLimit > 0 ? (totalCommitted / totalLimit) * 100 : 0;

  return (
    <>
      {/* Resumo Geral */}
      {!isLoadingBalances && creditCardBalances.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Resumo dos Limites
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Limite Disponível</p>
                <p className="text-base font-bold text-green-600">
                  {formatCurrency(totalAvailable)}
                </p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Valor Comprometido</p>
                <p className="text-base font-bold text-orange-600">
                  {formatCurrency(totalCommitted)}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-muted-foreground">Limite Total</p>
                <p className="text-base font-bold text-blue-600">
                  {formatCurrency(totalLimit)}
                </p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Uso geral dos limites</span>
                <span>{usagePercentage.toFixed(1)}%</span>
              </div>
              <Progress value={usagePercentage} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Cartões */}
      <div className="grid gap-3">
        {creditCards.map((card) => {
          const isExpanded = expandedCards.has(card.id);
          const cardBalance = creditCardBalances.find(b => b.card_id === card.id);
          const cardUsagePercentage = cardBalance && cardBalance.credit_limit > 0 
            ? (cardBalance.total_committed / cardBalance.credit_limit) * 100 
            : 0;
          const isHighUsage = cardUsagePercentage > 80;

          return (
            <Card key={card.id} className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">{card.name}</h3>
                  <Badge variant="secondary" className="text-xs py-0 px-2">Ativo</Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCard(card)}
                    className="h-7 w-7 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCreditCard(card.id)}
                    className="h-7 w-7 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                <div>
                  <p className="text-muted-foreground">Limite</p>
                  <p className="font-semibold text-sm">{formatCurrency(card.credit_limit)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fechamento</p>
                  <p className="font-semibold text-sm">Dia {card.closing_day}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Vencimento</p>
                  <p className="font-semibold text-sm">Dia {card.due_day}</p>
                </div>
              </div>

              {/* Status atual do limite */}
              {cardBalance && (
                <div className="mb-3 p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Status do Limite</span>
                    <div className="flex items-center gap-1">
                      {isHighUsage ? (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      )}
                      <span className={`text-xs font-medium ${isHighUsage ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(cardBalance.available_limit)} disponível
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Uso: {cardUsagePercentage.toFixed(1)}%</span>
                    <span>Comprometido: {formatCurrency(cardBalance.total_committed)}</span>
                  </div>
                  <Progress 
                    value={cardUsagePercentage} 
                    className={`h-1.5 ${isHighUsage ? 'text-red-500' : 'text-green-500'}`} 
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {card.include_in_patrimony && (
                    <Badge variant="outline" className="text-green-600 border-green-600 text-xs py-0 px-2">
                      Incluso no patrimônio
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={() => toggleCardExpansion(card.id, 'bills')}
                  >
                    <Receipt className="h-3 w-3 mr-1" />
                    <span className="text-xs">Ver faturas</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={() => toggleCardExpansion(card.id, 'projection')}
                  >
                    <BarChart3 className="h-3 w-3 mr-1" />
                    <span className="text-xs">Projeção</span>
                  </Button>
                </div>
              </div>
              
              <Collapsible open={isExpanded}>
                <CollapsibleContent className="mt-3">
                  <div className="border-t pt-3">
                    {cardViewType[card.id] === 'bills' && (
                      <CreditCardBillsView creditCardId={card.id} />
                    )}
                    {cardViewType[card.id] === 'projection' && (
                      <CreditLimitProjectionCard creditCardId={card.id} />
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
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