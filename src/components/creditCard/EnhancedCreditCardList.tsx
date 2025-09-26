import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CreditCard, Trash2, Edit, Receipt, TrendingUp, FileText, BarChart3, TrendingDown, ChevronDown, ChevronRight } from 'lucide-react';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useCreditCardBillsByCard } from '@/hooks/useCreditCardBillsByCard';
import { formatCurrency } from '@/utils/formatters';
import { EditCreditCardDialog } from './EditCreditCardDialog';
import { DeleteCreditCardDialog } from './DeleteCreditCardDialog';
import { CreditLimitProjectionCard } from './CreditLimitProjectionCard';
import { CreditCardBillsView } from './CreditCardBillsView';
import { CreditCard as CreditCardType } from '@/types/creditCard';

export const EnhancedCreditCardList: React.FC = () => {
  const { creditCards, isLoading, deleteCreditCard, creditCardBalances, isLoadingBalances } = useCreditCards();
  const [selectedCard, setSelectedCard] = useState<CreditCardType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CreditCardType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [cardViewType, setCardViewType] = useState<{[key: string]: 'bills' | 'projection'}>({});

  // Não inicializar nenhum cartão como aberto por padrão
  useEffect(() => {
    // Removido: não queremos cartões abertos por padrão
  }, []);

  const handleEditCard = (card: CreditCardType) => {
    setSelectedCard(card);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCard = (card: CreditCardType) => {
    setCardToDelete(card);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteCreditCard(cardToDelete.id);
      setIsDeleteDialogOpen(false);
      setCardToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleCardExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
      // Remove viewType quando fecha o card
      const newViewType = { ...cardViewType };
      delete newViewType[cardId];
      setCardViewType(newViewType);
    } else {
      newExpanded.add(cardId);
    }
    
    setExpandedCards(newExpanded);
  };

  const setViewType = (cardId: string, viewType: 'bills' | 'projection') => {
    setCardViewType(prev => {
      const current = prev[cardId];
      // Se clicou no mesmo tipo que já está ativo, remove (fecha)
      if (current === viewType) {
        const newViewType = { ...prev };
        delete newViewType[cardId];
        return newViewType;
      }
      // Senão, define o novo tipo
      return { ...prev, [cardId]: viewType };
    });
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
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Resumo Geral */}
        {!isLoadingBalances && creditCardBalances.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">Resumo dos Limites</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Limite Disponível</p>
                <p className="text-base font-bold text-green-600">
                  {formatCurrency(totalAvailable)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Valor Comprometido</p>
                <p className="text-base font-bold text-orange-600">
                  {formatCurrency(totalCommitted)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Limite Total</p>
                <p className="text-base font-bold text-blue-600">
                  {formatCurrency(totalLimit)}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Uso geral dos limites</span>
                <span>{usagePercentage.toFixed(1)}%</span>
              </div>
              <Progress value={usagePercentage} className="h-1.5" />
            </div>
          </div>
        )}

        {/* Lista de Cartões */}
        {creditCards.length === 0 ? (
          <div className="text-center py-6">
            <CreditCard className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhum cartão de crédito cadastrado ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">Meus Cartões</h3>
            
            {creditCards.map((card, index) => {
              const isExpanded = expandedCards.has(card.id);
              const cardBalance = creditCardBalances.find(b => b.card_id === card.id);
              const cardUsagePercentage = cardBalance && cardBalance.credit_limit > 0 
                ? (cardBalance.total_committed / cardBalance.credit_limit) * 100 
                : 0;
              const isHighUsage = cardUsagePercentage > 80;

              return (
                <Collapsible key={card.id} open={isExpanded}>
                  <div className="border rounded-md overflow-hidden bg-background">
                    {/* Linha de Resumo do Cartão */}
                    <div className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCardExpansion(card.id)}
                            className="h-6 w-6 p-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{card.name}</h4>
                            {cardBalance && (
                              <div className="flex items-center gap-2 flex-1 max-w-40">
                                <Progress 
                                  value={cardUsagePercentage} 
                                  className="h-3 flex-1" 
                                />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {cardUsagePercentage.toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>Limite: {formatCurrency(card.credit_limit)}</span>
                            <span>Fech: {card.closing_day}</span>
                            <span>Venc: {card.due_day}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCard(card)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCard(card)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo Expandido */}
                    <CollapsibleContent>
                      <div className="border-t bg-muted/20 p-3">
                        {/* Status detalhado do limite */}
                        {cardBalance && (
                          <div className="bg-background rounded-md p-3 mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-sm">Status Detalhado do Limite</h5>
                              <div className="flex items-center gap-1">
                                {isHighUsage ? (
                                  <TrendingDown className="h-3 w-3 text-red-500" />
                                ) : (
                                  <TrendingUp className="h-3 w-3 text-green-500" />
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
                              className="h-1.5" 
                            />
                          </div>
                        )}

                        {/* Opções de visualização */}
                        <div className="flex gap-2 mb-3">
                          <Button 
                            variant={cardViewType[card.id] === 'bills' ? "default" : "outline"}
                            size="sm" 
                            onClick={() => setViewType(card.id, 'bills')}
                            className="flex items-center gap-1 text-xs h-7"
                          >
                            <Receipt className="h-3 w-3" />
                            Ver Faturas
                          </Button>
                          <Button 
                            variant={cardViewType[card.id] === 'projection' ? "default" : "outline"}
                            size="sm" 
                            onClick={() => setViewType(card.id, 'projection')}
                            className="flex items-center gap-1 text-xs h-7"
                          >
                            <BarChart3 className="h-3 w-3" />
                            Projeção de Limite
                          </Button>
                        </div>

                        {/* Conteúdo específico - só mostra se tiver um viewType selecionado */}
                        {cardViewType[card.id] && (
                          <div className="bg-background rounded-md p-2">
                            {cardViewType[card.id] === 'bills' && (
                              <CreditCardBillsView creditCardId={card.id} />
                            )}
                            {cardViewType[card.id] === 'projection' && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-3">
                                  Este gráfico mostra como será a projeção do seu limite disponível para os próximos 12 meses
                                </p>
                                <CreditLimitProjectionCard creditCardId={card.id} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        )}
      </CardContent>

      <EditCreditCardDialog
        card={selectedCard}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedCard(null);
        }}
      />

      <DeleteCreditCardDialog
        card={cardToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCardToDelete(null);
        }}
        onConfirm={confirmDeleteCard}
        isDeleting={isDeleting}
      />
    </Card>
  );
};