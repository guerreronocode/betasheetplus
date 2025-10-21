import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { format, startOfMonth, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePlannedIncome } from '@/hooks/usePlannedIncome';
import { usePlannedExpenses } from '@/hooks/usePlannedExpenses';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncome } from '@/hooks/useIncome';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BudgetTableViewProps {
  type: 'income' | 'expense';
  startDate: Date;
  endDate: Date;
}

const BudgetTableView: React.FC<BudgetTableViewProps> = ({ 
  type,
  startDate,
  endDate,
}) => {
  const { plannedIncome } = usePlannedIncome();
  const { plannedExpenses } = usePlannedExpenses();
  const { expenses } = useExpenses();
  const { income } = useIncome();
  
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [detailsCategory, setDetailsCategory] = useState<string | null>(null);

  // Gerar meses do período filtrado
  const months = useMemo(() => {
    return eachMonthOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  // Obter categorias únicas
  const categories = useMemo(() => {
    const planned = type === 'income' ? plannedIncome : plannedExpenses;
    const uniqueCategories = new Set(planned.map(item => item.category));
    return Array.from(uniqueCategories).sort();
  }, [type, plannedIncome, plannedExpenses]);

  // Calcular valores planejados por categoria e mês
  const getPlannedValue = (category: string, month: Date) => {
    const planned = type === 'income' ? plannedIncome : plannedExpenses;
    const monthStr = format(month, 'yyyy-MM');
    
    return planned
      .filter(item => {
        // Filtrar por categoria primeiro
        if (item.category !== category) return false;
        
        // Extrair apenas ano-mês do campo item.month (formato: "2025-10-01" -> "2025-10")
        const itemMonth = item.month.substring(0, 7);
        
        // Para itens recorrentes
        if (item.is_recurring) {
          const startMonth = (item.recurring_start_month || item.month).substring(0, 7);
          const endMonth = item.recurring_end_month?.substring(0, 7);
          
          if (endMonth) {
            return monthStr >= startMonth && monthStr <= endMonth;
          }
          return monthStr >= startMonth;
        }
        
        // Para itens específicos
        return itemMonth === monthStr;
      })
      .reduce((sum, item) => sum + item.planned_amount, 0);
  };

  // Calcular valores realizados por categoria e mês
  const getRealizedValue = (category: string, month: Date) => {
    const transactions = type === 'income' ? income : expenses;
    const monthStart = startOfMonth(month);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transaction.category === category &&
          transactionDate >= monthStart &&
          transactionDate <= monthEnd
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  if (categories.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        Nenhuma {type === 'income' ? 'receita' : 'despesa'} planejada. 
        Adicione valores planejados para visualizar a tabela.
      </Card>
    );
  }

  // Get planned items for a specific category
  const getCategoryPlannedItems = (category: string) => {
    const planned = type === 'income' ? plannedIncome : plannedExpenses;
    return planned.filter(item => item.category === category);
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="flex overflow-x-auto">
          {/* Tabela fixa da esquerda */}
          <div className="flex-shrink-0 border-r border-border">
            <table className="text-xs">
              <thead>
                <tr className="bg-fnb-accent/5">
                  <th className="px-2 py-1 text-left font-semibold border-b w-40">Categoria</th>
                  <th className="px-2 py-1 text-center font-semibold border-b w-24">Métrica</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, catIdx) => (
                  <React.Fragment key={category}>
                    <tr className="border-b-0">
                      <td 
                        rowSpan={2} 
                        className="px-2 py-1 font-medium border-b align-middle relative group"
                        onMouseEnter={() => setHoveredCategory(category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{category}</span>
                          {hoveredCategory === category && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => setDetailsCategory(category)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-1 text-center text-xs bg-blue-50/50 font-medium">
                        Planejado
                      </td>
                    </tr>
                    <tr className={catIdx < categories.length - 1 ? "border-b" : ""}>
                      <td className="px-2 py-1 text-center text-xs bg-green-50/50 font-medium">
                        Realizado
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tabela com scroll horizontal (meses) */}
          <div className="flex-1 overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr className="bg-fnb-accent/5">
                  {months.map((month, idx) => (
                    <th key={idx} className="px-2 py-1 text-center font-semibold border-b min-w-[80px]">
                      {format(month, 'MMM/yy', { locale: ptBR })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((category, catIdx) => (
                  <React.Fragment key={category}>
                    <tr className="border-b-0">
                      {months.map((month, monthIdx) => {
                        const plannedValue = getPlannedValue(category, month);
                        return (
                          <td 
                            key={`planned-${monthIdx}`} 
                            className="px-2 py-1 text-center text-xs bg-blue-50/30"
                          >
                            {plannedValue > 0 ? formatCurrency(plannedValue) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className={catIdx < categories.length - 1 ? "border-b" : ""}>
                      {months.map((month, monthIdx) => {
                        const realizedValue = getRealizedValue(category, month);
                        const plannedValue = getPlannedValue(category, month);
                        const isOverBudget = type === 'expense' && realizedValue > plannedValue && plannedValue > 0;
                        const isUnderBudget = type === 'income' && realizedValue < plannedValue && plannedValue > 0;
                        
                        return (
                          <td 
                            key={`realized-${monthIdx}`} 
                            className={`px-2 py-1 text-center text-xs font-semibold ${
                              isOverBudget || isUnderBudget 
                                ? 'bg-red-50/50 text-red-700' 
                                : 'bg-green-50/30'
                            }`}
                          >
                            {realizedValue > 0 ? formatCurrency(realizedValue) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Dialog de detalhes */}
      <Dialog open={!!detailsCategory} onOpenChange={() => setDetailsCategory(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalhes de {type === 'income' ? 'Receitas' : 'Despesas'} Planejadas - {detailsCategory}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {detailsCategory && getCategoryPlannedItems(detailsCategory).map((item, idx) => (
              <div key={idx} className="p-4 border rounded-lg bg-card">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="ml-2 font-semibold">{formatCurrency(item.planned_amount)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mês:</span>
                    <span className="ml-2 font-medium">
                      {format(new Date(item.month), 'MMM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                  {item.is_recurring && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Tipo:</span>
                        <span className="ml-2 font-medium">Recorrente</span>
                      </div>
                      {item.recurring_end_month && (
                        <div>
                          <span className="text-muted-foreground">Até:</span>
                          <span className="ml-2 font-medium">
                            {format(new Date(item.recurring_end_month), 'MMM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {item.description && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Descrição:</span>
                      <p className="mt-1 text-sm">{item.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetTableView;
