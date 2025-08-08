import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, AlertCircle, CheckCircle, Eye, Receipt } from 'lucide-react';
import { useCreditCardBills } from '@/hooks/useCreditCardBills';
import { useCreditCards } from '@/hooks/useCreditCards';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BillPaymentDialog } from './BillPaymentDialog';
import { EnhancedBillDetailsDialog } from './EnhancedBillDetailsDialog';
import { CreditCardBill, BillPaymentFormData } from '@/types/creditCard';

interface CreditCardBillsModalProps {
  creditCardId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CreditCardBillsModal: React.FC<CreditCardBillsModalProps> = ({
  creditCardId,
  isOpen,
  onClose,
}) => {
  const { bills, isLoading, payBill, isPaying } = useCreditCardBills();
  const { creditCards } = useCreditCards();
  
  const [selectedBill, setSelectedBill] = useState<CreditCardBill | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedBillForDetails, setSelectedBillForDetails] = useState<CreditCardBill | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const creditCard = creditCards.find(card => card.id === creditCardId);
  const cardBills = bills.filter(bill => bill.credit_card_id === creditCardId);

  const handlePayBill = (bill: CreditCardBill) => {
    setSelectedBill(bill);
    setIsPaymentDialogOpen(true);
  };

  const handleViewDetails = (bill: CreditCardBill) => {
    setSelectedBillForDetails(bill);
    setIsDetailsDialogOpen(true);
  };

  const handlePayBillSubmit = (billId: string, paymentData: BillPaymentFormData) => {
    payBill({ billId, paymentData });
  };

  const getStatusBadge = (bill: CreditCardBill) => {
    const isOverdue = !bill.is_paid && new Date(bill.due_date) < new Date();
    
    if (bill.is_paid) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Paga
        </Badge>
      );
    }
    
    if (isOverdue) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Em atraso
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-blue-600 border-blue-600">
        <Calendar className="w-3 h-3 mr-1" />
        Em aberto
      </Badge>
    );
  };

  if (!creditCardId) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Faturas - {creditCard?.name || 'Cartão'}
            </DialogTitle>
            <DialogDescription>
              Visualize e gerencie as faturas deste cartão de crédito
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <Card>
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : cardBills.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma fatura encontrada
                  </h3>
                  <p className="text-gray-500">
                    Este cartão ainda não possui faturas registradas.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {cardBills.map((bill) => (
                  <Card key={bill.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">
                              Fatura {format(new Date(bill.bill_month), 'MMM/yyyy', { locale: ptBR })}
                            </h3>
                            {getStatusBadge(bill)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Fechamento:</span>{' '}
                              {format(new Date(bill.closing_date), 'dd/MM/yyyy')}
                            </div>
                            <div>
                              <span className="font-medium">Vencimento:</span>{' '}
                              {format(new Date(bill.due_date), 'dd/MM/yyyy')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatCurrency(bill.total_amount)}
                          </div>
                          {bill.paid_amount > 0 && (
                            <div className="text-xs text-green-600">
                              Pago: {formatCurrency(bill.paid_amount)}
                            </div>
                          )}
                          <div className="flex gap-1 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(bill)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Detalhes
                            </Button>
                            {!bill.is_paid && (
                              <Button
                                size="sm"
                                onClick={() => handlePayBill(bill)}
                                disabled={isPaying}
                              >
                                Pagar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BillPaymentDialog
        bill={selectedBill}
        isOpen={isPaymentDialogOpen}
        onClose={() => {
          setIsPaymentDialogOpen(false);
          setSelectedBill(null);
        }}
        onPayBill={handlePayBillSubmit}
        isPaying={isPaying}
      />

      <EnhancedBillDetailsDialog
        bill={selectedBillForDetails}
        isOpen={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setSelectedBillForDetails(null);
        }}
      />
    </>
  );
};