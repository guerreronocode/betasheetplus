
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePurchaseStatus } from '@/hooks/usePurchaseStatus';
import { useCreditCards } from '@/hooks/useCreditCards';
import { formatCurrency } from '@/utils/formatters';
import { ShoppingCart, CreditCard } from 'lucide-react';

export const PurchaseStatusPanel: React.FC = () => {
  const [selectedCardId, setSelectedCardId] = useState<string>('all');
  const { creditCards } = useCreditCards();
  const { purchases, isLoading } = usePurchaseStatus(selectedCardId === 'all' ? undefined : selectedCardId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (purchase: any) => {
    const isCompleted = purchase.paid_installments === purchase.installments;
    
    if (isCompleted) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-600">
          Quitada
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-blue-600 border-blue-600">
        {purchase.paid_installments}/{purchase.installments} pagas
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Status das Compras
          </CardTitle>
          <Select value={selectedCardId} onValueChange={setSelectedCardId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por cartão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cartões</SelectItem>
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
        {purchases.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma compra encontrada
            </h3>
            <p className="text-gray-500">
              Registre compras nos seus cartões para ver o status aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{purchase.description}</h3>
                  {getStatusBadge(purchase)}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Cartão:</span><br />
                    {purchase.credit_card_name}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span><br />
                    {formatCurrency(purchase.total_amount)}
                  </div>
                  <div>
                    <span className="font-medium">Quitado:</span><br />
                    {formatCurrency(purchase.total_amount - purchase.remaining_amount)}
                  </div>
                  <div>
                    <span className="font-medium">Restante:</span><br />
                    <span className={purchase.remaining_amount > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                      {formatCurrency(purchase.remaining_amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
