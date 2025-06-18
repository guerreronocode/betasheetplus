
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, TrendingDown, TrendingUp } from 'lucide-react';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useCreditCardProjections } from '@/hooks/useCreditCardProjections';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const CreditLimitPanel: React.FC = () => {
  const { creditCardBalances, isLoadingBalances, creditCards } = useCreditCards();
  const [selectedProjectionCard, setSelectedProjectionCard] = useState<string>('');
  const { projections, isLoading: isLoadingProjections } = useCreditCardProjections(selectedProjectionCard);

  React.useEffect(() => {
    if (creditCards.length > 0 && !selectedProjectionCard) {
      setSelectedProjectionCard(creditCards[0].id);
    }
  }, [creditCards, selectedProjectionCard]);

  if (isLoadingBalances) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (creditCardBalances.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum cartão ativo
          </h3>
          <p className="text-gray-500">
            Cadastre um cartão de crédito para acompanhar o limite disponível.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalLimit = creditCardBalances.reduce((sum, card) => sum + card.credit_limit, 0);
  const totalCommitted = creditCardBalances.reduce((sum, card) => sum + card.total_committed, 0);
  const totalAvailable = creditCardBalances.reduce((sum, card) => sum + card.available_limit, 0);
  const usagePercentage = totalLimit > 0 ? (totalCommitted / totalLimit) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Resumo Atual dos Limites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Limite de Crédito Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resumo Geral */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Disponível</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalAvailable)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Comprometido</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalCommitted)}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Uso do limite</span>
                <span>{usagePercentage.toFixed(1)}%</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>
          </div>

          {/* Detalhes por Cartão */}
          <div className="space-y-3">
            {creditCardBalances.map((card) => {
              const cardUsagePercentage = card.credit_limit > 0 ? (card.total_committed / card.credit_limit) * 100 : 0;
              const isHighUsage = cardUsagePercentage > 80;
              
              return (
                <div key={card.card_id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{card.card_name}</h4>
                    <div className="flex items-center gap-1 text-sm">
                      {isHighUsage ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                      <span className={isHighUsage ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(card.available_limit)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2">
                    <div>
                      <span>Limite:</span>
                      <p className="font-medium text-foreground">
                        {formatCurrency(card.credit_limit)}
                      </p>
                    </div>
                    <div>
                      <span>Comprometido:</span>
                      <p className="font-medium text-foreground">
                        {formatCurrency(card.total_committed)}
                      </p>
                    </div>
                    <div>
                      <span>Uso:</span>
                      <p className="font-medium text-foreground">
                        {cardUsagePercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <Progress 
                    value={cardUsagePercentage} 
                    className={`h-1 ${isHighUsage ? 'text-red-500' : 'text-green-500'}`} 
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Projeção de Limite */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Projeção de Limite - Próximos Meses</CardTitle>
            <Select value={selectedProjectionCard} onValueChange={setSelectedProjectionCard}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione um cartão" />
              </SelectTrigger>
              <SelectContent>
                {creditCards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingProjections ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : projections.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {projections.slice(0, 6).map((projection, index) => {
                const monthDate = new Date(projection.month);
                const availableLimit = Number(projection.projected_available_limit);
                const selectedCard = creditCardBalances.find(c => c.card_id === selectedProjectionCard);
                const usagePercent = selectedCard ? ((selectedCard.credit_limit - availableLimit) / selectedCard.credit_limit) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {format(monthDate, 'MMMM yyyy', { locale: ptBR })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Uso projetado: {usagePercent.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {formatCurrency(availableLimit)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        disponível
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Nenhuma projeção disponível para este cartão.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
