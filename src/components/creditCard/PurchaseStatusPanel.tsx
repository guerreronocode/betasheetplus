
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ShoppingBag, Edit, Calendar } from 'lucide-react';
import { usePurchaseStatus } from '@/hooks/usePurchaseStatus';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EditPurchaseDialog } from './EditPurchaseDialog';
import { CreditCardPurchase } from '@/types/creditCard';

export const PurchaseStatusPanel: React.FC = () => {
  const { purchases, isLoading } = usePurchaseStatus();
  const [selectedPurchase, setSelectedPurchase] = useState<CreditCardPurchase | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditPurchase = (purchase: any) => {
    // Converter PurchaseStatus para CreditCardPurchase para edição
    const purchaseForEdit: CreditCardPurchase = {
      id: purchase.id,
      user_id: '', // será preenchido pelo backend
      credit_card_id: '', // será necessário buscar
      description: purchase.description,
      amount: purchase.total_amount,
      purchase_date: purchase.purchase_date,
      installments: purchase.installments,
      category: purchase.category || '',
      created_at: '',
      updated_at: '',
    };
    setSelectedPurchase(purchaseForEdit);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
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

  if (purchases.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma compra encontrada
          </h3>
          <p className="text-gray-500">
            Registre compras nos seus cartões para acompanhar o status aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Status das Compras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {purchases.map((purchase) => {
              const progressPercentage = (purchase.paid_installments / purchase.installments) * 100;
              const isCompleted = purchase.paid_installments >= purchase.installments;
              
              return (
                <div key={purchase.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{purchase.description}</h4>
                        {isCompleted && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Quitada
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {purchase.credit_card_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(purchase.purchase_date), 'dd/MM/yyyy', { locale: ptBR })}
                        {purchase.category && (
                          <>
                            <span>•</span>
                            <span>{purchase.category}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatCurrency(purchase.total_amount)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPurchase(purchase)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Parcelas pagas:</span>
                      <span>{purchase.paid_installments} de {purchase.installments}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Restante:</span>
                      <span className="font-medium">
                        {formatCurrency(purchase.remaining_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <EditPurchaseDialog
        purchase={selectedPurchase}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedPurchase(null);
        }}
      />
    </>
  );
};
