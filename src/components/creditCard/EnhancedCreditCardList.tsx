import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CreditCard, Trash2, Edit, ChevronDown, ChevronUp, TrendingDown, TrendingUp, Info } from 'lucide-react';
import { useCreditCards } from '@/hooks/useCreditCards';
import { formatCurrency } from '@/utils/formatters';
import { EditCreditCardDialog } from './EditCreditCardDialog';
import { CreditCard as CreditCardType } from '@/types/creditCard';

export const EnhancedCreditCardList: React.FC = () => {
  const { creditCards, isLoading, deleteCreditCard, creditCardBalances, isLoadingBalances } = useCreditCards();
  const [selectedCard, setSelectedCard] = useState<CreditCardType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const handleEditCard = (card: CreditCardType) => {
    setSelectedCard(card);
    setIsEditDialogOpen(true);
  };

  const toggleCardExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Resumo dos Limites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Limite Disponível</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(totalAvailable)}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Valor Comprometido</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatCurrency(totalCommitted)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Limite Total</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(totalLimit)}
                </p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Uso geral dos limites</span>
                <span>{usagePercentage.toFixed(1)}%</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Cartões */}
      <div className="grid gap-4">
        {creditCards.map((card) => {
          const isExpanded = expandedCards.has(card.id);
          const cardBalance = creditCardBalances.find(b => b.card_id === card.id);
          const cardUsagePercentage = cardBalance && cardBalance.credit_limit > 0 
            ? (cardBalance.total_committed / cardBalance.credit_limit) * 100 
            : 0;
          const isHighUsage = cardUsagePercentage > 80;

          return (
            <Card key={card.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{card.name}</CardTitle>
                  <div className="flex gap-2 items-center">
                    <Badge variant="secondary">Ativo</Badge>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
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

                {/* Status atual do limite */}
                {cardBalance && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Status do Limite</span>
                      <div className="flex items-center gap-1">
                        {isHighUsage ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        )}
                        <span className={`text-sm font-medium ${isHighUsage ? 'text-red-600' : 'text-green-600'}`}>
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
                      className={`h-2 ${isHighUsage ? 'text-red-500' : 'text-green-500'}`} 
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {card.include_in_patrimony && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Incluso no patrimônio
                      </Badge>
                    )}
                  </div>
                  
                  <Collapsible open={isExpanded} onOpenChange={() => toggleCardExpansion(card.id)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <span className="text-sm mr-2">Ver detalhes</span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-4">
                      <div className="border-t pt-4 space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                              <p className="font-medium mb-1">Integração com Patrimônio</p>
                              <p className="text-xs">
                                {card.include_in_patrimony 
                                  ? "As dívidas das compras neste cartão são automaticamente incluídas como passivos no seu patrimônio."
                                  : "Este cartão não afeta o cálculo do seu patrimônio líquido."
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {cardBalance && (
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-2 border rounded">
                              <p className="text-muted-foreground">Limite Total</p>
                              <p className="font-semibold">{formatCurrency(cardBalance.credit_limit)}</p>
                            </div>
                            <div className="p-2 border rounded">
                              <p className="text-muted-foreground">Comprometido</p>
                              <p className="font-semibold text-orange-600">{formatCurrency(cardBalance.total_committed)}</p>
                            </div>
                            <div className="p-2 border rounded">
                              <p className="text-muted-foreground">Disponível</p>
                              <p className="font-semibold text-green-600">{formatCurrency(cardBalance.available_limit)}</p>
                            </div>
                            <div className="p-2 border rounded">
                              <p className="text-muted-foreground">Uso do Limite</p>
                              <p className="font-semibold">{cardUsagePercentage.toFixed(1)}%</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </CardContent>
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