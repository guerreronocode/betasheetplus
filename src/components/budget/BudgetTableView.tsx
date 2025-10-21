import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { format, startOfMonth, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePlannedIncome } from '@/hooks/usePlannedIncome';
import { usePlannedExpenses } from '@/hooks/usePlannedExpenses';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncome } from '@/hooks/useIncome';

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

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="flex">
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
                        className="px-2 py-1 font-medium border-b align-middle"
                      >
                        {category}
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
    </div>
  );
};

export default BudgetTableView;
