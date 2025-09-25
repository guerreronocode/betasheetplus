
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, TrendingDown, TrendingUp, Info } from 'lucide-react';
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-4 w-4" />
          Controle de Limite de Crédito
        </CardTitle>
        
        {/* Aviso informativo integrado */}
        <div className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
          <Info className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-green-800">
            <span className="font-medium">Integração Automática:</span> Apenas dívidas das compras são registradas no patrimônio, não o limite de crédito.
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Resumo Geral Compacto */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Disponível</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(totalAvailable)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Comprometido</p>
            <p className="text-lg font-bold text-orange-600">
              {formatCurrency(totalCommitted)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Uso Total</p>
            <p className="text-lg font-bold">
              {usagePercentage.toFixed(1)}%
            </p>
          </div>
        </div>

        <Progress value={usagePercentage} className="h-1.5" />

        {/* Detalhes por Cartão - Mais Compacto */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Detalhes por Cartão</h4>
          {creditCardBalances.map((card) => {
            const cardUsagePercentage = card.credit_limit > 0 ? (card.total_committed / card.credit_limit) * 100 : 0;
            const isHighUsage = cardUsagePercentage > 80;
            
            return (
              <div key={card.card_id} className="p-2 border rounded bg-card/50">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-sm font-medium">{card.card_name}</h5>
                  <div className="flex items-center gap-1">
                    {isHighUsage ? (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    ) : (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    )}
                    <span className={`text-xs font-medium ${isHighUsage ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(card.available_limit)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs mb-1">
                  <div>
                    <span className="text-muted-foreground">Limite:</span>
                    <p className="font-medium">{formatCurrency(card.credit_limit)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Usado:</span>
                    <p className="font-medium text-orange-600">{formatCurrency(card.total_committed)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">%:</span>
                    <p className="font-medium">{cardUsagePercentage.toFixed(1)}%</p>
                  </div>
                </div>
                
                <Progress value={cardUsagePercentage} className="h-1" />
              </div>
            );
          })}
        </div>

        {/* Projeção de Limite */}
        <div className="space-y-2 border-t pt-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">Projeção - Próximos Meses</h4>
            <Select value={selectedProjectionCard} onValueChange={setSelectedProjectionCard}>
              <SelectTrigger className="w-36 h-7 text-xs">
                <SelectValue placeholder="Cartão" />
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
          
          {isLoadingProjections ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : projections.length > 0 ? (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {projections.slice(0, 6).map((projection, index) => {
                const monthDate = new Date(projection.month);
                const availableLimit = Number(projection.projected_available_limit);
                const selectedCard = creditCardBalances.find(c => c.card_id === selectedProjectionCard);
                const usagePercent = selectedCard ? ((selectedCard.credit_limit - availableLimit) / selectedCard.credit_limit) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between p-2 border rounded text-xs">
                    <div>
                      <p className="font-medium text-xs">
                        {format(monthDate, 'MMM/yy', { locale: ptBR })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {usagePercent.toFixed(0)}% uso
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600 text-xs">
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
            <div className="text-center py-4 text-muted-foreground">
              <CreditCard className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-xs">Nenhuma projeção disponível</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
