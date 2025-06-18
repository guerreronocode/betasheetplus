
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCreditCardBills } from '@/hooks/useCreditCardBills';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const BillsList: React.FC = () => {
  const { bills, upcomingBills, overdueBills, isLoading } = useCreditCardBills();

  if (isLoading) {
    return <div>Carregando faturas...</div>;
  }

  if (bills.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Nenhuma fatura encontrada ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Faturas em atraso */}
      {overdueBills.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-destructive mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Faturas em Atraso ({overdueBills.length})
          </h4>
          <div className="grid gap-3">
            {overdueBills.map((bill) => (
              <Card key={bill.id} className="border-destructive">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold">{bill.credit_cards?.name}</h5>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {format(new Date(bill.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive">{formatCurrency(bill.total_amount)}</p>
                      <Badge variant="destructive">Em atraso</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Próximas faturas */}
      {upcomingBills.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximas Faturas ({upcomingBills.length})
          </h4>
          <div className="grid gap-3">
            {upcomingBills.map((bill) => (
              <Card key={bill.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold">{bill.credit_cards?.name}</h5>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {format(new Date(bill.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(bill.total_amount)}</p>
                      <Badge variant="secondary">A vencer</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Todas as faturas */}
      <div>
        <h4 className="text-lg font-semibold mb-3">Todas as Faturas</h4>
        <div className="grid gap-3">
          {bills.map((bill) => (
            <Card key={bill.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold">{bill.credit_cards?.name}</h5>
                    <p className="text-sm text-muted-foreground">
                      Referência: {format(new Date(bill.bill_month), 'MM/yyyy', { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vencimento: {format(new Date(bill.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(bill.total_amount)}</p>
                    {bill.is_paid ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Paga
                      </Badge>
                    ) : new Date(bill.due_date) < new Date() ? (
                      <Badge variant="destructive">Em atraso</Badge>
                    ) : (
                      <Badge variant="secondary">A vencer</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
