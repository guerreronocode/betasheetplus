import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { patrimonyGroupLabels } from './patrimonyCategories';

interface PatrimonyItemsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupKey: string;
  items: any[];
  total: number;
}

const ITEMS_PER_PAGE = 10;

export const PatrimonyItemsModal: React.FC<PatrimonyItemsModalProps> = ({
  open,
  onOpenChange,
  groupKey,
  items,
  total,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Ordenar itens por valor (maior para menor)
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const valueA = a.current_value ?? a.remaining_amount ?? 0;
      const valueB = b.current_value ?? b.remaining_amount ?? 0;
      return valueB - valueA;
    });
  }, [items]);

  // Calcular paginação
  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = sortedItems.slice(startIndex, endIndex);

  // Reset página ao abrir/fechar
  React.useEffect(() => {
    if (open) {
      setCurrentPage(1);
    }
  }, [open]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const isAsset = groupKey.includes('ativo');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{patrimonyGroupLabels[groupKey]}</DialogTitle>
          <DialogDescription>
            {sortedItems.length} {sortedItems.length === 1 ? 'item' : 'itens'} • Total: {formatCurrency(total)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {currentItems.map((item) => (
            <Card
              key={item.id}
              className={`p-4 ${
                isAsset ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">
                    {item.name}
                  </h4>
                  
                  {item.category && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.category}
                    </p>
                  )}
                  
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  {(item.isDebt || item.isCreditCard || item.source === 'credit_card_debt') && (
                    <div className="text-xs text-blue-600 mt-2 font-medium">
                      Sincronizado automaticamente
                    </div>
                  )}
                  
                  {item.isLinked && item.source && (
                    <div className="text-xs text-primary mt-2">
                      {item.source === 'bank_account' && 'Conta bancária'}
                      {item.source === 'investment' && 'Investimento'}
                      {item.source === 'debt' && 'Dívida'}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className={`text-xl font-bold ${
                    isAsset ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {formatCurrency(item.current_value ?? item.remaining_amount ?? 0)}
                  </div>
                  
                  {item.liquidity && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.liquidity === 'daily' && 'Liquidez diária'}
                      {item.liquidity === 'monthly' && 'Liquidez mensal'}
                      {item.liquidity === 'annual' && 'Liquidez anual'}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Controles de paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
