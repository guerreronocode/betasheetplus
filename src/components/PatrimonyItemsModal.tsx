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

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentItems.map((item) => {
              const showCategory = item.category && !item.source;
              const sourceLabel = 
                item.source === 'bank_account' ? 'Conta bancária' :
                item.source === 'investment' ? 'Investimento' :
                item.source === 'debt' ? 'Dívida' :
                item.source === 'credit_card_debt' ? 'Cartão de crédito' :
                null;
              
              return (
                <Card
                  key={item.id}
                  className={`p-3 ${
                    isAsset ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {item.name}
                      </h4>
                      
                      {showCategory && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.category}
                        </p>
                      )}
                      
                      {sourceLabel && (
                        <div className="text-xs text-primary mt-0.5 flex items-center gap-1">
                          <span>{sourceLabel}</span>
                          {(item.isDebt || item.isCreditCard || item.source === 'credit_card_debt') && (
                            <span className="text-blue-600">(Auto)</span>
                          )}
                        </div>
                      )}
                      
                      {item.liquidity && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.liquidity === 'daily' && 'Liq. diária'}
                          {item.liquidity === 'monthly' && 'Liq. mensal'}
                          {item.liquidity === 'annual' && 'Liq. anual'}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-base font-bold ${
                        isAsset ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {formatCurrency(item.current_value ?? item.remaining_amount ?? 0, { compact: true })}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
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
