import React, { useState, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Calendar, CreditCard, Repeat, PiggyBank } from 'lucide-react';
import { usePendingTransactions, PendingTransaction } from '@/hooks/usePendingTransactions';
import { formatDateForDisplay, formatCurrency } from '@/utils/formatters';

type SortField = 'date' | 'category' | 'account' | 'description' | 'value' | 'status';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 15;

// Default column widths
const DEFAULT_COLUMN_WIDTHS = {
  type: 60,
  date: 100,
  category: 180,
  account: 150,
  description: 250,
  value: 140,
  status: 100
};

interface PendingTransactionsTableProps {
  startDate?: Date;
  endDate?: Date;
}

const PendingTransactionsTable = ({ startDate, endDate }: PendingTransactionsTableProps) => {
  const { pendingTransactions, isLoading } = usePendingTransactions();
  
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
  const [resizing, setResizing] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Monitor container size changes
  React.useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    const resizeObserver = new ResizeObserver(updateContainerWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateContainerWidth);
    };
  }, []);

  // Automatically adjust column widths
  const calculateTableWidths = useMemo(() => {
    const minTotalWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0);
    
    if (minTotalWidth < containerWidth && containerWidth > 0) {
      const scale = containerWidth / minTotalWidth;
      return {
        type: Math.floor(columnWidths.type * scale),
        date: Math.floor(columnWidths.date * scale),
        category: Math.floor(columnWidths.category * scale),
        account: Math.floor(columnWidths.account * scale),
        description: Math.floor(columnWidths.description * scale),
        value: Math.floor(columnWidths.value * scale),
        status: Math.floor(columnWidths.status * scale)
      };
    }
    
    return columnWidths;
  }, [columnWidths, containerWidth]);

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

  const handleResize = (column: keyof typeof columnWidths, newWidth: number) => {
    const minWidths = {
      type: 60,
      date: 80,
      category: 100,
      account: 100,
      description: 100,
      value: 100,
      status: 80
    };
    
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
        style={{ width: `${calculateTableWidths[column]}px` }}
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'planned_income':
      case 'planned_expense':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'credit_bill':
        return <CreditCard className="w-4 h-4 text-red-500" />;
      default:
        return <PiggyBank className="w-4 h-4 text-gray-500" />;
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

  const totalWidth = Object.values(calculateTableWidths).reduce((a, b) => a + b, 0);

  return (
    <Card className="fnb-card flex flex-col h-[calc(100vh-200px)] rounded-xl overflow-hidden" ref={containerRef}>
      {/* Container com scroll horizontal */}
      <div className="flex-1 overflow-auto fnb-scrollbar-custom" ref={tableRef}>
        <table 
          className="w-full table-fixed border-collapse"
          style={{ 
            minWidth: `${totalWidth}px`
          }}
        >
          <colgroup>
            <col style={{ width: `${calculateTableWidths.type}px` }} />
            <col style={{ width: `${calculateTableWidths.date}px` }} />
            <col style={{ width: `${calculateTableWidths.category}px` }} />
            <col style={{ width: `${calculateTableWidths.account}px` }} />
            <col style={{ width: `${calculateTableWidths.description}px` }} />
            <col style={{ width: `${calculateTableWidths.value}px` }} />
            <col style={{ width: `${calculateTableWidths.status}px` }} />
          </colgroup>
          
          {/* Header */}
          <thead className="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-10">
            <tr className="h-10 border-b">
              <ResizableHeader field="date" column="type" align="center">
                <span className="text-sm font-medium">Tipo</span>
              </ResizableHeader>
              <ResizableHeader field="date" column="date">
                <span className="text-sm font-medium">Data</span>
              </ResizableHeader>
              <ResizableHeader field="category" column="category">
                <span className="text-sm font-medium">Categoria</span>
              </ResizableHeader>
              <ResizableHeader field="account" column="account">
                <span className="text-sm font-medium">Conta</span>
              </ResizableHeader>
              <ResizableHeader field="description" column="description">
                <span className="text-sm font-medium">Descrição</span>
              </ResizableHeader>
              <ResizableHeader field="value" column="value" align="right">
                <span className="text-sm font-medium">Valor</span>
              </ResizableHeader>
              <ResizableHeader field="status" column="status" align="center" resizable={false}>
                <span className="text-sm font-medium">Status</span>
              </ResizableHeader>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td 
                  colSpan={7} 
                  className="text-center py-6 text-muted-foreground"
                  style={{ width: `${totalWidth}px` }}
                >
                  <div>
                    <p className="text-sm">Nenhuma transação pendente encontrada</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="h-12 border-b hover:bg-gray-50/50">
                  <td 
                    className="px-3 py-2 border-r border-border/20"
                    style={{ width: `${calculateTableWidths.type}px` }}
                  >
                    <div className="flex justify-center">
                      {getTypeIcon(transaction.type)}
                    </div>
                  </td>
                  <td 
                    className="text-sm px-3 py-2 border-r border-border/20 overflow-hidden"
                    style={{ width: `${calculateTableWidths.date}px` }}
                  >
                    <div className="truncate">{formatDateForDisplay(transaction.date.toISOString().split('T')[0])}</div>
                  </td>
                  <td 
                    className="text-sm px-3 py-2 border-r border-border/20 overflow-hidden"
                    title={transaction.category}
                    style={{ width: `${calculateTableWidths.category}px` }}
                  >
                    <div className="truncate">
                      {transaction.category}
                      {transaction.subcategory && (
                        <div className="text-xs text-muted-foreground truncate">
                          {transaction.subcategory}
                        </div>
                      )}
                    </div>
                  </td>
                  <td 
                    className="text-sm px-3 py-2 border-r border-border/20 overflow-hidden"
                    title={transaction.account}
                    style={{ width: `${calculateTableWidths.account}px` }}
                  >
                    <div className="truncate">{transaction.account}</div>
                  </td>
                  <td 
                    className="font-medium text-sm px-3 py-2 border-r border-border/20 overflow-hidden"
                    title={transaction.description}
                    style={{ width: `${calculateTableWidths.description}px` }}
                  >
                    <div className="truncate">{transaction.description}</div>
                  </td>
                  <td 
                    className={`text-right font-semibold text-sm px-3 py-2 border-r border-border/20 overflow-hidden ${
                      transaction.value > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                    title={`${transaction.value > 0 ? '+' : ''}${formatCurrency(Math.abs(transaction.value))}`}
                    style={{ width: `${calculateTableWidths.value}px` }}
                  >
                    <div className="truncate">
                      {transaction.value > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.value))}
                    </div>
                  </td>
                  <td 
                    className="px-3 py-2 text-center"
                    style={{ width: `${calculateTableWidths.status}px` }}
                  >
                    {getStatusBadge(transaction.status)}
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
  );
};

export default PendingTransactionsTable;
