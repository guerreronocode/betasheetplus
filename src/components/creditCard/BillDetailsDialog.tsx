
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Receipt, AlertCircle } from 'lucide-react';
import { useBillDetails } from '@/hooks/useBillDetails';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditCardBill } from '@/types/creditCard';

interface BillDetailsDialogProps {
  bill: CreditCardBill | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BillDetailsDialog: React.FC<BillDetailsDialogProps> = ({
  bill,
  isOpen,
  onClose,
}) => {
  const { installments, isLoading, error } = useBillDetails(
    bill?.credit_card_id || '',
    bill?.bill_month || ''
  );

  if (!bill) return null;

  const formatBillMonth = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMMM/yyyy', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Detalhes da Fatura - {bill.credit_cards?.name}
          </DialogTitle>
          <DialogDescription>
            Fatura de {formatBillMonth(bill.bill_month)} • 
            Vencimento: {formatDate(bill.due_date)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo da fatura */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm text-gray-600">Total da Fatura:</span>
              <div className="text-lg font-bold">{formatCurrency(bill.total_amount)}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Status:</span>
              <div>
                {bill.is_paid ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Paga
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    Em aberto
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Tratamento de erro */}
          {error && (
            <div className="flex items-center gap-2 p-4 text-red-600 bg-red-50 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>Erro ao carregar detalhes da fatura. Tente novamente.</span>
            </div>
          )}

          {/* Tabela de compras */}
          <div>
            <h3 className="text-lg font-medium mb-3">Compras desta Fatura</h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Carregando detalhes...</span>
              </div>
            ) : !error && installments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <Receipt className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">Nenhuma compra encontrada</p>
                <p className="text-sm">Esta fatura não possui compras detalhadas ou os dados foram removidos.</p>
              </div>
            ) : !error ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data da Compra</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Parcela</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installments.map((installment) => (
                    <TableRow key={installment.id}>
                      <TableCell className="font-medium">
                        {installment.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {formatDate(installment.purchase_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {installment.category && (
                          <Badge variant="secondary" className="text-xs">
                            {installment.category}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {installment.installment_number}/{installment.total_installments}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(installment.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </div>

          {/* Resumo final */}
          {!error && installments.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total das Compras:</span>
                <span>{formatCurrency(installments.reduce((sum, item) => sum + item.amount, 0))}</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
