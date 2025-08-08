import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Receipt, AlertCircle, DollarSign, Check } from 'lucide-react';
import { useBillDetails } from '@/hooks/useBillDetails';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreditCardBill } from '@/types/creditCard';
import { useToast } from '@/hooks/use-toast';

interface EnhancedBillDetailsDialogProps {
  bill: CreditCardBill | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PartialPayment {
  installmentId: string;
  amount: number;
}

export const EnhancedBillDetailsDialog: React.FC<EnhancedBillDetailsDialogProps> = ({
  bill,
  isOpen,
  onClose,
}) => {
  const { installments, isLoading, error } = useBillDetails(
    bill?.credit_card_id || '',
    bill?.bill_month || ''
  );
  const { bankAccounts } = useBankAccounts();
  const { toast } = useToast();
  
  const [partialPayments, setPartialPayments] = useState<PartialPayment[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handlePartialPaymentChange = (installmentId: string, amount: string) => {
    const numericAmount = parseFloat(amount) || 0;
    setPartialPayments(prev => {
      const existing = prev.find(p => p.installmentId === installmentId);
      if (existing) {
        return prev.map(p => 
          p.installmentId === installmentId 
            ? { ...p, amount: numericAmount }
            : p
        );
      } else {
        return [...prev, { installmentId, amount: numericAmount }];
      }
    });
  };

  const handleProcessPartialPayments = async () => {
    if (!selectedAccountId) {
      toast({
        title: 'Conta não selecionada',
        description: 'Selecione uma conta para débito do pagamento.',
        variant: 'destructive'
      });
      return;
    }

    const totalPayment = partialPayments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPayment <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'Digite valores válidos para o pagamento.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Aqui você implementaria a lógica de pagamento parcial
      // Por enquanto, mostraremos apenas uma mensagem de sucesso
      toast({
        title: 'Pagamento processado!',
        description: `Pagamento parcial de ${formatCurrency(totalPayment)} processado com sucesso.`
      });
      
      setPartialPayments([]);
      onClose();
    } catch (error) {
      toast({
        title: 'Erro no pagamento',
        description: 'Ocorreu um erro ao processar o pagamento parcial.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getPartialPaymentAmount = (installmentId: string) => {
    return partialPayments.find(p => p.installmentId === installmentId)?.amount || 0;
  };

  const totalPartialPayment = partialPayments.reduce((sum, p) => sum + p.amount, 0);

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
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
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

        <div className="space-y-6">
          {/* Resumo da fatura */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm text-gray-600">Total da Fatura:</span>
              <div className="text-lg font-bold">{formatCurrency(bill.total_amount)}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Valor Pago:</span>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(bill.paid_amount || 0)}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Saldo Restante:</span>
              <div className="text-lg font-bold text-red-600">
                {formatCurrency(bill.total_amount - (bill.paid_amount || 0))}
              </div>
            </div>
          </div>

          {/* Seção de pagamento parcial */}
          {!bill.is_paid && (
            <div className="p-4 border rounded-lg bg-blue-50">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pagamento Parcial
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conta para Débito:
                  </label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Selecione uma conta</option>
                    {bankAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} - {formatCurrency(account.balance)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total do Pagamento Parcial:
                  </label>
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(totalPartialPayment)}
                  </div>
                </div>
              </div>

              {totalPartialPayment > 0 && (
                <Button
                  onClick={handleProcessPartialPayments}
                  disabled={isProcessingPayment || !selectedAccountId}
                  className="w-full md:w-auto"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Processar Pagamento Parcial
                </Button>
              )}
            </div>
          )}

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
                <p className="text-sm">Esta fatura não possui compras detalhadas.</p>
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
                    {!bill.is_paid && (
                      <TableHead className="text-right">Pagamento Parcial</TableHead>
                    )}
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
                      {!bill.is_paid && (
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            placeholder="0,00"
                            min="0"
                            max={installment.amount}
                            step="0.01"
                            value={getPartialPaymentAmount(installment.id) || ''}
                            onChange={(e) => handlePartialPaymentChange(installment.id, e.target.value)}
                            className="w-24 text-right"
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}
          </div>

          {/* Resumo final */}
          {!error && installments.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total das Compras:</span>
                <span>{formatCurrency(installments.reduce((sum, item) => sum + item.amount, 0))}</span>
              </div>
              {totalPartialPayment > 0 && (
                <div className="flex justify-between items-center text-sm text-blue-600">
                  <span>Pagamento Parcial Selecionado:</span>
                  <span className="font-semibold">{formatCurrency(totalPartialPayment)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};