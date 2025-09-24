import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, DollarSign } from 'lucide-react';
import { useCreditCardBillsByCard } from '@/hooks/useCreditCardBillsByCard';
import { formatCurrency } from '@/utils/formatters';
import { CreditCardBill } from '@/types/creditCard';

interface CreditCardBillsViewProps {
  creditCardId: string;
}

const getStatusBadge = (bill: CreditCardBill) => {
  if (bill.is_paid) {
    return <Badge variant="default" className="bg-green-600 text-white text-xs">Paga</Badge>;
  }
  
  const dueDate = new Date(bill.due_date);
  const today = new Date();
  
  if (dueDate < today) {
    return <Badge variant="destructive" className="text-xs">Vencida</Badge>;
  }
  
  return <Badge variant="secondary" className="text-xs">Em aberto</Badge>;
};

export const CreditCardBillsView: React.FC<CreditCardBillsViewProps> = ({ 
  creditCardId 
}) => {
  const { bills, isLoading } = useCreditCardBillsByCard(creditCardId);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground">
            Carregando faturas...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bills.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            Faturas do Cartão
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="text-center text-sm text-muted-foreground">
            Nenhuma fatura encontrada
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" />
          Faturas do Cartão ({bills.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {bills.map((bill) => {
            const billMonth = new Date(bill.bill_month).toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric'
            });
            
            const dueDate = new Date(bill.due_date).toLocaleDateString('pt-BR');
            
            return (
              <div key={bill.id} className="p-3 border rounded-lg bg-background">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium capitalize">{billMonth}</h4>
                    {getStatusBadge(bill)}
                  </div>
                  <div className="text-sm font-semibold">
                    {formatCurrency(bill.total_amount)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Venc: {dueDate}</span>
                    </div>
                    {bill.is_paid && bill.paid_date && (
                      <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="h-3 w-3" />
                        <span>Pago em {new Date(bill.paid_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};