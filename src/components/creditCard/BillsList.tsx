
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { useCreditCardBills } from '@/hooks/useCreditCardBills';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BillPaymentDialog } from './BillPaymentDialog';
import { CreditCardBill } from '@/types/creditCard';

export const BillsList: React.FC = () => {
  const { bills, upcomingBills, overdueBills, isLoading, payBill, isPaying } = useCreditCardBills();
  const [selectedBill, setSelectedBill] = useState<CreditCardBill | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handlePayBill = (bill: CreditCardBill) => {
    setSelectedBill(bill);
    setIsPaymentDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
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

  if (bills.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma fatura encontrada
          </h3>
          <p className="text-gray-500">
            Registre compras nos seus cartões para ver as faturas aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

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

  return (
    <>
      <div className="space-y-4">
        {/* Resumo rápido */}
        {(upcomingBills.length > 0 || overdueBills.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {upcomingBills.length > 0 && (
              <Card className="border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-600">Próximas Faturas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(upcomingBills.reduce((sum, bill) => sum + bill.total_amount, 0))}
                  </div>
                  <p className="text-xs text-gray-500">{upcomingBills.length} faturas</p>
                </CardContent>
              </Card>
            )}
            
            {overdueBills.length > 0 && (
              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-red-600">Em Atraso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(overdueBills.reduce((sum, bill) => sum + bill.total_amount, 0))}
                  </div>
                  <p className="text-xs text-gray-500">{overdueBills.length} faturas</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Lista de faturas */}
        <div className="space-y-3">
          {bills.map((bill) => (
            <Card key={bill.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">
                        {bill.credit_cards?.name || 'Cartão'}
                      </h3>
                      {getStatusBadge(bill)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Fatura:</span>{' '}
                        {format(new Date(bill.bill_month), 'MMM/yyyy', { locale: ptBR })}
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
                    <div className="text-xs text-gray-500 mb-2">
                      Fechamento: {format(new Date(bill.closing_date), 'dd/MM')}
                    </div>
                    {!bill.is_paid && (
                      <Button
                        size="sm"
                        onClick={() => handlePayBill(bill)}
                        disabled={isPaying}
                      >
                        Marcar como Paga
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BillPaymentDialog
        bill={selectedBill}
        isOpen={isPaymentDialogOpen}
        onClose={() => {
          setIsPaymentDialogOpen(false);
          setSelectedBill(null);
        }}
        onPayBill={payBill}
        isPaying={isPaying}
      />
    </>
  );
};
