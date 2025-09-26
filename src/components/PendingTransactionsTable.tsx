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
  date: 120,
  category: 200,
  account: 150,
  description: 250,
  value: 140,
  status: 100
};

const PendingTransactionsTable = () => {
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
    return () => resizeObserver.disconnect();
  }, []);

  // Automatically adjust column widths
  React.useEffect(() => {
    if (containerWidth === 0) return;

    const totalDefaultWidth = Object.values(DEFAULT_COLUMN_WIDTHS).reduce((sum, width) => sum + width, 0);
    
    if (totalDefaultWidth < containerWidth) {
      // Scale proportionally to fill container
      const scale = containerWidth / totalDefaultWidth;
      const scaledWidths = Object.entries(DEFAULT_COLUMN_WIDTHS).reduce((acc, [key, width]) => {
        acc[key as keyof typeof DEFAULT_COLUMN_WIDTHS] = Math.floor(width * scale);
        return acc;
      }, {} as typeof DEFAULT_COLUMN_WIDTHS);
      
      setColumnWidths(scaledWidths);
    } else {
      setColumnWidths(DEFAULT_COLUMN_WIDTHS);
    }
  }, [containerWidth]);

  const sortedTransactions = useMemo(() => {
    if (!pendingTransactions.length) return [];

    return [...pendingTransactions].sort((a, b) => {
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
  }, [pendingTransactions, sortField, sortOrder]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedTransactions.slice(startIndex, endIndex);
  }, [sortedTransactions, currentPage]);

  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleResize = (column: string, delta: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [column]: Math.max(50, prev[column as keyof typeof prev] + delta)
    }));
  };

  const handleMouseDown = (e: React.MouseEvent, column: string) => {
    e.preventDefault();
    setResizing(column);
    
    const startX = e.clientX;
    const startWidth = columnWidths[column as keyof typeof columnWidths];

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + delta);
      
      setColumnWidths(prev => ({
        ...prev,
        [column]: newWidth
      }));
    };

    const handleMouseUp = () => {
      setResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recurring':
        return <Repeat className="w-4 h-4 text-blue-500" />;
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

  if (isLoading) {
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

  const totalTableWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);

  return (
    <Card className="w-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Transações Pendentes</h3>
            <p className="text-sm text-muted-foreground">
              {sortedTransactions.length} transações pendentes
            </p>
          </div>
        </div>

        <div ref={containerRef} className="overflow-x-auto">
          <div ref={tableRef} style={{ minWidth: `${totalTableWidth}px` }}>
            <Table style={{ tableLayout: 'fixed', width: `${totalTableWidth}px` }}>
              <colgroup>
                <col style={{ width: `${columnWidths.type}px` }} />
                <col style={{ width: `${columnWidths.date}px` }} />
                <col style={{ width: `${columnWidths.category}px` }} />
                <col style={{ width: `${columnWidths.account}px` }} />
                <col style={{ width: `${columnWidths.description}px` }} />
                <col style={{ width: `${columnWidths.value}px` }} />
                <col style={{ width: `${columnWidths.status}px` }} />
              </colgroup>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: `${columnWidths.type}px` }}>
                    <div className="flex items-center justify-between">
                      Tipo
                    </div>
                  </TableHead>
                  <TableHead style={{ width: `${columnWidths.date}px` }}>
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium"
                        onClick={() => handleSort('date')}
                      >
                        Data
                        {sortField === 'date' && (
                          sortOrder === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
                        )}
                      </Button>
                      <div
                        className="w-1 h-4 cursor-col-resize hover:bg-border"
                        onMouseDown={(e) => handleMouseDown(e, 'date')}
                      />
                    </div>
                  </TableHead>
                  <TableHead style={{ width: `${columnWidths.category}px` }}>
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium"
                        onClick={() => handleSort('category')}
                      >
                        Categoria
                        {sortField === 'category' && (
                          sortOrder === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
                        )}
                      </Button>
                      <div
                        className="w-1 h-4 cursor-col-resize hover:bg-border"
                        onMouseDown={(e) => handleMouseDown(e, 'category')}
                      />
                    </div>
                  </TableHead>
                  <TableHead style={{ width: `${columnWidths.account}px` }}>
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium"
                        onClick={() => handleSort('account')}
                      >
                        Conta
                        {sortField === 'account' && (
                          sortOrder === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
                        )}
                      </Button>
                      <div
                        className="w-1 h-4 cursor-col-resize hover:bg-border"
                        onMouseDown={(e) => handleMouseDown(e, 'account')}
                      />
                    </div>
                  </TableHead>
                  <TableHead style={{ width: `${columnWidths.description}px` }}>
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium"
                        onClick={() => handleSort('description')}
                      >
                        Descrição
                        {sortField === 'description' && (
                          sortOrder === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
                        )}
                      </Button>
                      <div
                        className="w-1 h-4 cursor-col-resize hover:bg-border"
                        onMouseDown={(e) => handleMouseDown(e, 'description')}
                      />
                    </div>
                  </TableHead>
                  <TableHead style={{ width: `${columnWidths.value}px` }}>
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium"
                        onClick={() => handleSort('value')}
                      >
                        Valor
                        {sortField === 'value' && (
                          sortOrder === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
                        )}
                      </Button>
                      <div
                        className="w-1 h-4 cursor-col-resize hover:bg-border"
                        onMouseDown={(e) => handleMouseDown(e, 'value')}
                      />
                    </div>
                  </TableHead>
                  <TableHead style={{ width: `${columnWidths.status}px` }}>
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {sortField === 'status' && (
                          sortOrder === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma transação pendente encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell style={{ width: `${columnWidths.type}px` }}>
                        <div className="flex items-center justify-center">
                          {getTypeIcon(transaction.type)}
                        </div>
                      </TableCell>
                      <TableCell style={{ width: `${columnWidths.date}px` }}>
                        {formatDateForDisplay(transaction.date.toISOString().split('T')[0])}
                      </TableCell>
                      <TableCell style={{ width: `${columnWidths.category}px` }}>
                        <div className="truncate" title={transaction.category}>
                          {transaction.category}
                          {transaction.subcategory && (
                            <div className="text-xs text-muted-foreground truncate">
                              {transaction.subcategory}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell style={{ width: `${columnWidths.account}px` }}>
                        <div className="truncate" title={transaction.account}>
                          {transaction.account}
                        </div>
                      </TableCell>
                      <TableCell style={{ width: `${columnWidths.description}px` }}>
                        <div className="truncate" title={transaction.description}>
                          {transaction.description}
                        </div>
                      </TableCell>
                      <TableCell style={{ width: `${columnWidths.value}px` }}>
                        <span className={`font-medium ${
                          transaction.value >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCurrency(transaction.value)}
                        </span>
                      </TableCell>
                      <TableCell style={{ width: `${columnWidths.status}px` }}>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages} ({sortedTransactions.length} registros)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PendingTransactionsTable;