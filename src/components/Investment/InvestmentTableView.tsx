import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { getInvestmentTypeLabel } from '@/utils/investmentHelpers';
import { Investment } from '@/hooks/useInvestments';
import { format, startOfMonth, eachMonthOfInterval, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InvestmentTableViewProps {
  investments: Investment[];
  startDate: Date;
  endDate: Date;
  selectedInvestments?: string[];
  onSelectionChange?: (selected: string[]) => void;
}

const InvestmentTableView: React.FC<InvestmentTableViewProps> = ({ 
  investments,
  startDate,
  endDate,
  selectedInvestments = [],
  onSelectionChange
}) => {

  // Gerar meses do período filtrado
  const months = useMemo(() => {
    return eachMonthOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  // Calcular dados por investimento e mês
  const investmentData = useMemo(() => {
    return investments.map(investment => {
      const purchaseDate = parseISO(investment.purchase_date);
      
      const monthlyData = months.map(month => {
        // Se o investimento ainda não foi feito neste mês, retorna zero
        if (month < startOfMonth(purchaseDate)) {
          return { applied: 0, total: 0 };
        }
        
        // No mês da compra, o valor aplicado é o amount inicial
        if (isSameMonth(month, purchaseDate)) {
          return { 
            applied: investment.amount, 
            total: investment.amount 
          };
        }
        
        // Após o mês da compra, não há novos aportes (aplicado = 0), 
        // mas o total continua acumulando (usando current_value como proxy)
        // Para simplificar, vamos mostrar 0 em aplicado e current_value no último mês
        const isLastMonth = month.getTime() === months[months.length - 1].getTime();
        return { 
          applied: 0, 
          total: isLastMonth ? investment.current_value : investment.amount 
        };
      });

      return {
        investment,
        monthlyData
      };
    });
  }, [investments, months]);


  const getYieldTypeLabel = (yieldType: string) => {
    const labels: Record<string, string> = {
      fixed: 'Fixo',
      cdi: 'CDI',
      selic: 'SELIC',
      ipca: 'IPCA'
    };
    return labels[yieldType] || yieldType;
  };

  if (investments.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        Nenhum investimento encontrado. Adicione seus investimentos para visualizar a tabela.
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
                  <th className="px-2 py-1 text-left font-semibold border-b w-32">Nome</th>
                  <th className="px-2 py-1 text-left font-semibold border-b w-24">Tipo</th>
                  <th className="px-2 py-1 text-left font-semibold border-b w-24">Rendimento</th>
                  <th className="px-2 py-1 text-center font-semibold border-b w-20">Métrica</th>
                </tr>
              </thead>
              <tbody>
                {investmentData.map(({ investment }, invIdx) => (
                  <React.Fragment key={investment.id}>
                    <tr className="border-b-0">
                      <td rowSpan={2} className="px-2 py-1 font-medium border-b align-middle">
                        {investment.name}
                      </td>
                      <td rowSpan={2} className="px-2 py-1 border-b align-middle text-xs">
                        {getInvestmentTypeLabel(investment.type)}
                      </td>
                      <td rowSpan={2} className="px-2 py-1 border-b align-middle text-xs">
                        {getYieldTypeLabel(investment.yield_type)}
                        {investment.yield_rate > 0 && ` +${investment.yield_rate}%`}
                      </td>
                      <td className="px-2 py-1 text-center text-xs bg-blue-50/50 font-medium">
                        Aplicado
                      </td>
                    </tr>
                    <tr className={invIdx < investmentData.length - 1 ? "border-b" : ""}>
                      <td className="px-2 py-1 text-center text-xs bg-green-50/50 font-medium">
                        Total
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
                    <th key={idx} className="px-2 py-1 text-center font-semibold border-b min-w-[70px]">
                      {format(month, 'MMM/yy', { locale: ptBR })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {investmentData.map(({ monthlyData }, invIdx) => (
                  <React.Fragment key={invIdx}>
                    <tr className="border-b-0">
                      {monthlyData.map((data, monthIdx) => (
                        <td 
                          key={`applied-${monthIdx}`} 
                          className="px-2 py-1 text-center text-xs bg-blue-50/30"
                        >
                          {data.applied > 0 ? formatCurrency(data.applied) : '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className={invIdx < investmentData.length - 1 ? "border-b" : ""}>
                      {monthlyData.map((data, monthIdx) => (
                        <td 
                          key={`total-${monthIdx}`} 
                          className="px-2 py-1 text-center text-xs font-semibold bg-green-50/30"
                        >
                          {data.total > 0 ? formatCurrency(data.total) : '-'}
                        </td>
                      ))}
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

export default InvestmentTableView;
