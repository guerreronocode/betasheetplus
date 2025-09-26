import React, { useState, useMemo, useRef } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, ArrowUpCircle, ArrowDownCircle, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { formatDateForDisplay, formatCurrency } from '@/utils/formatters';
import EditTransactionModal from './EditTransactionModal';

type SortField = 'description' | 'category' | 'date' | 'amount' | 'type';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 15;

// Default column widths
const DEFAULT_COLUMN_WIDTHS = {
  type: 60,
  description: 250, 
  category: 180,
  date: 100,
  amount: 140,
  actions: 70
};

const TransactionsTable = () => {
  const { income, expenses, isLoading } = useFinancialData();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
  const [resizing, setResizing] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Debug logs
  console.log('TransactionsTable - Debug:', {
    income: income ? income.length : 'null/undefined',
    expenses: expenses ? expenses.length : 'null/undefined',
    isLoading,
  });

  if (isLoading) {
    console.log('TransactionsTable - Showing loading state');
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Combine and sort all transactions
  const allTransactions = useMemo(() => {
    // Garantir que income e expenses são arrays válidos
    const safeIncome = Array.isArray(income) ? income : [];
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    
    // Return empty array if loading
    if (isLoading) {
      return [];
    }
    
    const combined = [
      ...safeIncome.map(item => ({ ...item, type: 'income' as const })),
      ...safeExpenses.map(item => ({ ...item, type: 'expense' as const }))
    ];

    return combined.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Special handling for different field types
      if (sortField === 'date') {
        aValue = new Date(a.date || 0).getTime();
        bValue = new Date(b.date || 0).getTime();
      } else if (sortField === 'amount') {
        aValue = Number(a.amount || 0);
        bValue = Number(b.amount || 0);
      } else if (sortField === 'type') {
        aValue = a.type || '';
        bValue = b.type || '';
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [income, expenses, sortField, sortOrder, isLoading]);

  // Pagination logic
  const totalPages = Math.ceil(allTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = allTransactions.slice(startIndex, endIndex);

  // Reset page when transactions change
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleResize = (column: keyof typeof columnWidths, newWidth: number) => {
    // Tamanhos mínimos baseados no conteúdo dos títulos das colunas
    const minWidths = {
      type: 60,      // "Tipo"  
      description: 100, // "Descrição"
      category: 100,    // "Categoria"
      date: 80,         // "Data"
      amount: 100,      // "Valor"
      actions: 70       // "Ações"
    };
    
    // Aplica apenas o width mínimo, cada coluna é independente
    const finalWidth = Math.max(minWidths[column], newWidth);
    
    setColumnWidths(prev => ({
      ...prev,
      [column]: finalWidth
    }));
  };

  const ResizableHeader = ({ 
    field, 
    column, 
    children, 
    align = 'left',
    resizable = true
  }: { 
    field: SortField; 
    column: keyof typeof columnWidths;
    children: React.ReactNode; 
    align?: 'left' | 'right' | 'center';
    resizable?: boolean;
  }) => {
    const handleMouseDown = (e: React.MouseEvent) => {
      if (!resizable) return;
      e.preventDefault();
      e.stopPropagation();
      setResizing(column);
      
      const startX = e.clientX;
      const startWidth = columnWidths[column];
      
      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startX;
        const newWidth = startWidth + deltaX;
        handleResize(column, newWidth);
      };
      
      const handleMouseUp = () => {
        setResizing(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    return (
      <th 
        className={`relative cursor-pointer hover:bg-muted/50 text-sm h-10 px-3 border-r border-border/50 ${
          align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
        }`}
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1 pr-2">
          {children}
          {sortField === field && (
            sortOrder === 'asc' ? 
              <ChevronUp className="w-4 h-4" /> : 
              <ChevronDown className="w-4 h-4" />
          )}
        </div>
        {resizable && (
          <div
            className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-primary/10"
            onMouseDown={handleMouseDown}
          />
        )}
      </th>
    );
  };

  const handleEdit = (transaction: any) => {
    setSelectedTransaction(transaction);
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <Card className="fnb-card flex flex-col h-[calc(100vh-200px)] rounded-xl overflow-hidden">
      {/* Header fixo */}
      <div className="border-b bg-white/95 backdrop-blur-sm">
        <table className="w-full table-fixed" style={{ minWidth: Object.values(columnWidths).reduce((a, b) => a + b, 0) }}>
          <colgroup>
            <col style={{ width: columnWidths.type }} />
            <col style={{ width: columnWidths.description }} />
            <col style={{ width: columnWidths.category }} />
            <col style={{ width: columnWidths.date }} />
            <col style={{ width: columnWidths.amount }} />
            <col style={{ width: columnWidths.actions }} />
          </colgroup>
          <thead>
            <tr className="h-10 border-b">
              <ResizableHeader field="type" column="type" align="center">
                <span className="text-sm font-medium">Tipo</span>
              </ResizableHeader>
              <ResizableHeader field="description" column="description">
                <span className="text-sm font-medium">Descrição</span>
              </ResizableHeader>
              <ResizableHeader field="category" column="category">
                <span className="text-sm font-medium">Categoria</span>
              </ResizableHeader>
              <ResizableHeader field="date" column="date">
                <span className="text-sm font-medium">Data</span>
              </ResizableHeader>
              <ResizableHeader field="amount" column="amount" align="right">
                <span className="text-sm font-medium">Valor</span>
              </ResizableHeader>
              <th 
                className="text-center px-3 py-2 text-sm font-medium border-r border-border/50"
              >
                Ações
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Corpo da tabela com scroll customizado */}
      <div className="flex-1 overflow-auto fnb-scrollbar-custom" ref={tableRef}>
        <table className="w-full table-fixed" style={{ minWidth: Object.values(columnWidths).reduce((a, b) => a + b, 0) }}>
          <colgroup>
            <col style={{ width: columnWidths.type }} />
            <col style={{ width: columnWidths.description }} />
            <col style={{ width: columnWidths.category }} />
            <col style={{ width: columnWidths.date }} />
            <col style={{ width: columnWidths.amount }} />
            <col style={{ width: columnWidths.actions }} />
          </colgroup>
          <tbody>
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td 
                  colSpan={6} 
                  className="text-center py-6 text-fnb-ink/70"
                >
                  <div>
                    <p className="text-sm">Nenhuma transação encontrada</p>
                    <p className="text-xs">Adicione sua primeira receita ou despesa!</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((transaction) => (
                <tr key={`${transaction.type}-${transaction.id}`} className="h-12 border-b hover:bg-gray-50/50">
                  <td className="px-3 py-2 border-r border-border/20">
                    <div className="flex justify-center">
                      {transaction.type === 'income' ? (
                        <ArrowUpCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </td>
                  <td 
                    className="font-medium text-fnb-ink text-sm px-3 py-2 border-r border-border/20 overflow-hidden"
                    title={transaction.description}
                  >
                    <div className="truncate">{transaction.description}</div>
                  </td>
                  <td 
                    className="text-fnb-ink/70 text-sm px-3 py-2 border-r border-border/20 overflow-hidden"
                    title={transaction.category}
                  >
                    <div className="truncate">{transaction.category}</div>
                  </td>
                  <td className="text-fnb-ink/70 text-sm px-3 py-2 border-r border-border/20 overflow-hidden">
                    <div className="truncate">{formatDateForDisplay(transaction.date)}</div>
                  </td>
                  <td 
                    className={`text-right font-semibold text-sm px-3 py-2 border-r border-border/20 overflow-hidden ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                    title={`${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}`}
                  >
                    <div className="truncate">
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(transaction)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls - Always visible */}
      <div className="flex items-center justify-between px-3 py-2 border-t text-xs bg-white/95">
        <div className="flex items-center gap-2">
          <p className="text-fnb-ink/70">
            {allTransactions.length > 0 ? (
              <>Mostrando {startIndex + 1} a {Math.min(endIndex, allTransactions.length)} de {allTransactions.length}</>
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
            disabled={currentPage === 1 || allTransactions.length === 0}
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
                  disabled={allTransactions.length === 0}
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
            disabled={currentPage === totalPages || allTransactions.length === 0}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <EditTransactionModal
        open={editModalOpen}
        onOpenChange={handleCloseModal}
        transaction={selectedTransaction}
      />
    </Card>
  );
};

export default TransactionsTable;