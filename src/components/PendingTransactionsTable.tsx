import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Calendar, CreditCard, Edit, DollarSign } from 'lucide-react';
import { usePendingTransactions, PendingTransaction } from '@/hooks/usePendingTransactions';
import { useCreditCardBills } from '@/hooks/useCreditCardBills';
import { formatDateForDisplay, formatCurrency } from '@/utils/formatters';
import { EffectTransactionDialog } from './EffectTransactionDialog';
import { BillPaymentDialog } from './creditCard/BillPaymentDialog';
import { BillPaymentFormData } from '@/types/creditCard';

type SortField = 'date' | 'category' | 'account' | 'description' | 'value' | 'status';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 15;

interface PendingTransactionsTableProps {
  startDate?: Date;
  endDate?: Date;
}

const PendingTransactionsTable = ({ startDate, endDate }: PendingTransactionsTableProps) => {
  const { pendingTransactions, isLoading } = usePendingTransactions();
  const { payBill, isPaying } = useCreditCardBills();
  
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estados para diálogos
  const [selectedTransaction, setSelectedTransaction] = useState<PendingTransaction | null>(null);
  const [isEffectDialogOpen, setIsEffectDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isPayBillDialogOpen, setIsPayBillDialogOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    console.log('🔍 [PendingTransactionsTable] filteredTransactions useMemo called');
    console.log('🔍 [PendingTransactionsTable] pendingTransactions:', pendingTransactions?.length || 0);
    console.log('🔍 [PendingTransactionsTable] startDate:', startDate);
    console.log('🔍 [PendingTransactionsTable] endDate:', endDate);
    
    if (!pendingTransactions || !Array.isArray(pendingTransactions) || pendingTransactions.length === 0) {
      console.log('❌ [PendingTransactionsTable] No pending transactions available');
      return [];
    }
    
    // Normalizar datas de filtro
    const filterStartDate = startDate ? new Date(startDate) : new Date();
    filterStartDate.setHours(0, 0, 0, 0);
    
    const filterEndDate = endDate ? new Date(endDate) : (() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 6);
      return date;
    })();
    filterEndDate.setHours(23, 59, 59, 999);
    
    console.log('📅 [PendingTransactionsTable] Filter dates:', {
      filterStart: filterStartDate.toISOString().split('T')[0],
      filterEnd: filterEndDate.toISOString().split('T')[0]
    });
    
    const filtered = pendingTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      transactionDate.setHours(0, 0, 0, 0);
      
      // CORREÇÃO CRÍTICA: Apenas verificar se está dentro do range de filtro
      // Não adicionar filtro adicional de "futuro" pois o range já controla isso
      const inRange = transactionDate >= filterStartDate && transactionDate <= filterEndDate;
      
      if (!inRange) {
        console.log('🚫 [PendingTransactionsTable] Filtered out (fora do range):', {
          description: transaction.description,
          date: transactionDate.toISOString().split('T')[0],
          filterStart: filterStartDate.toISOString().split('T')[0],
          filterEnd: filterEndDate.toISOString().split('T')[0]
        });
      } else {
        console.log('✅ [PendingTransactionsTable] Incluindo transação:', {
          description: transaction.description,
          date: transactionDate.toISOString().split('T')[0],
          type: transaction.type
        });
      }
      
      return inRange;
    });
    
    console.log('✅ [PendingTransactionsTable] Total filtered transactions:', filtered.length);
    return filtered;
  }, [pendingTransactions, startDate, endDate]);

  const sortedTransactions = useMemo(() => {
    if (!filteredTransactions.length) return [];

    return [...filteredTransactions].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'value') {
        aValue = Math.abs(aValue);
        bValue = Math.abs(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTransactions, sortField, sortOrder]);

  // Reset para primeira página quando os filtros ou ordenação mudarem
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredTransactions, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleEffectTransaction = (transaction: PendingTransaction) => {
    setSelectedTransaction(transaction);
    setIsEffectDialogOpen(true);
  };

  const handlePayBill = (transaction: PendingTransaction) => {
    setSelectedBill(transaction.original);
    setIsPayBillDialogOpen(true);
  };

  const handlePayBillSubmit = (billId: string, paymentData: BillPaymentFormData) => {
    payBill({ billId, paymentData });
  };

  const SortableHeader = ({ 
    field, 
    children, 
    align = 'left',
    className = ''
  }: { 
    field: SortField; 
    children: React.ReactNode; 
    align?: 'left' | 'right' | 'center';
    className?: string;
  }) => {
    return (
      <th 
        className={`cursor-pointer hover:bg-muted/50 text-sm h-10 px-3 border-r border-border/50 ${
          align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
        } ${className}`}
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1">
          {children}
          {sortField === field && (
            sortOrder === 'asc' ? 
              <ChevronUp className="w-4 h-4" /> : 
              <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </th>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'planned_income':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'planned_expense':
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case 'credit_bill':
        return <CreditCard className="w-4 h-4 text-red-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      overdue: 'destructive',
      upcoming: 'default'
    } as const;

    const labels = {
      pending: 'Pendente',
      overdue: 'Vencida',
      upcoming: 'Próxima'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (isLoading && (!pendingTransactions || pendingTransactions.length === 0)) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="fnb-card flex flex-col h-[calc(100vh-200px)] rounded-xl overflow-hidden">
        {/* Container com scroll horizontal */}
        <div className="flex-1 overflow-auto fnb-scrollbar-custom">
          <table className="w-full border-collapse">
            {/* Header */}
            <thead className="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-10">
              <tr className="h-10 border-b">
                <SortableHeader field="date" align="center" className="w-16">
                  <span className="text-sm font-medium">Tipo</span>
                </SortableHeader>
                <SortableHeader field="date" className="min-w-[100px]">
                  <span className="text-sm font-medium">Data</span>
                </SortableHeader>
                <SortableHeader field="category" className="min-w-[150px]">
                  <span className="text-sm font-medium">Categoria</span>
                </SortableHeader>
                <SortableHeader field="account" className="min-w-[120px]">
                  <span className="text-sm font-medium">Conta</span>
                </SortableHeader>
                <SortableHeader field="description" className="min-w-[200px]">
                  <span className="text-sm font-medium">Descrição</span>
                </SortableHeader>
                <SortableHeader field="value" align="right" className="min-w-[120px]">
                  <span className="text-sm font-medium">Valor</span>
                </SortableHeader>
                <SortableHeader field="status" align="center" className="min-w-[100px]">
                  <span className="text-sm font-medium">Status</span>
                </SortableHeader>
                <th className="text-sm font-medium h-10 px-3 border-r border-border/50 text-center w-20">
                  Ações
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-muted-foreground">
                    <div>
                      <p className="text-sm">Nenhuma transação pendente encontrada</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="h-12 border-b hover:bg-gray-50/50">
                    <td className="px-3 py-2 border-r border-border/20 w-16">
                      <div className="flex justify-center">
                        {getTypeIcon(transaction.type)}
                      </div>
                    </td>
                    <td className="text-sm px-3 py-2 border-r border-border/20 min-w-[100px]">
                      {formatDateForDisplay(transaction.date.toISOString().split('T')[0])}
                    </td>
                    <td className="text-sm px-3 py-2 border-r border-border/20 min-w-[150px]" title={transaction.category}>
                      <div className="truncate">
                        {transaction.category}
                        {transaction.subcategory && (
                          <div className="text-xs text-muted-foreground truncate">
                            {transaction.subcategory}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-sm px-3 py-2 border-r border-border/20 min-w-[120px]" title={transaction.account}>
                      <div className="truncate">{transaction.account}</div>
                    </td>
                    <td className="font-medium text-sm px-3 py-2 border-r border-border/20 min-w-[200px]" title={transaction.description}>
                      <div className="truncate">{transaction.description}</div>
                    </td>
                    <td className={`text-right font-semibold text-sm px-3 py-2 border-r border-border/20 min-w-[120px] ${
                      transaction.value > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.value > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.value))}
                    </td>
                    <td className="px-3 py-2 text-center border-r border-border/20 min-w-[100px]">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-3 py-2 text-center w-20">
                      {transaction.type === 'credit_bill' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePayBill(transaction)}
                          title="Pagar fatura"
                        >
                          <DollarSign className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEffectTransaction(transaction)}
                          title="Efetivar transação"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-3 py-2 border-t text-xs bg-white/95">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            {sortedTransactions.length > 0 ? (
              <>Mostrando {startIndex + 1} a {Math.min(endIndex, sortedTransactions.length)} de {sortedTransactions.length}</>
            ) : (
              <>0 transações</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || sortedTransactions.length === 0}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.max(1, Math.min(5, totalPages)) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                  disabled={sortedTransactions.length === 0}
                  className="h-7 w-7 p-0 text-xs"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || sortedTransactions.length === 0}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>

      {/* Diálogos */}
      <EffectTransactionDialog
        transaction={selectedTransaction}
        isOpen={isEffectDialogOpen}
        onClose={() => {
          setIsEffectDialogOpen(false);
          setSelectedTransaction(null);
        }}
      />

      <BillPaymentDialog
        bill={selectedBill}
        isOpen={isPayBillDialogOpen}
        onClose={() => {
          setIsPayBillDialogOpen(false);
          setSelectedBill(null);
        }}
        onPayBill={handlePayBillSubmit}
        isPaying={isPaying}
      />
    </>
  );
};

export default PendingTransactionsTable;
