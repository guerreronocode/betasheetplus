import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { getInvestmentTypeLabel } from '@/utils/investmentHelpers';
import { Investment } from '@/hooks/useInvestments';
import { format, startOfMonth, eachMonthOfInterval, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Plus, History } from 'lucide-react';
import InvestmentAportHistoryDialog from './InvestmentAportHistoryDialog';
import EditMonthValueDialog from './EditMonthValueDialog';
import InvestmentNewAportDialog from './InvestmentNewAportDialog';
import { useInvestmentMonthlyValues } from '@/hooks/useInvestmentMonthlyValues';

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
  const { monthlyValues, getMonthlyValue } = useInvestmentMonthlyValues(undefined, startDate, endDate);
  const [hoveredCell, setHoveredCell] = useState<{ invIdx: number; monthIdx: number; type: 'applied' | 'total' } | null>(null);
  const [historyDialog, setHistoryDialog] = useState<{ open: boolean; investmentId: string } | null>(null);
  const [editDialog, setEditDialog] = useState<{ 
    open: boolean; 
    investmentId: string; 
    investmentName: string;
    month: Date; 
    currentTotal: number;
    currentApplied: number;
  } | null>(null);
  const [aportDialog, setAportDialog] = useState<{
    open: boolean;
    investmentId: string;
    investmentName: string;
    month: Date;
  } | null>(null);

  // Gerar meses do período filtrado
  const months = useMemo(() => {
    return eachMonthOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  // Calcular dados por investimento e mês
  const investmentData = useMemo(() => {
    console.log('🔄 Recalculating investment data. Monthly values count:', monthlyValues.length);
    
    return investments.map(investment => {
      const purchaseDate = parseISO(investment.purchase_date);
      
      const monthlyData = months.map((month, idx) => {
        // Se o investimento ainda não foi feito neste mês, retorna zero
                        if (month < startOfMonth(purchaseDate)) {
                          return { applied: 0, total: 0, isBeforePurchase: true };
                        }
        
        // Buscar valor mensal registrado no banco
        const monthlyValue = getMonthlyValue(investment.id, month);
        
                        if (monthlyValue) {
                          return {
                            applied: monthlyValue.applied_value,
                            total: monthlyValue.total_value,
                            isBeforePurchase: false
                          };
                        }
        
                        // No mês da compra (fallback se não houver registro), usar valor inicial
                        if (isSameMonth(month, purchaseDate)) {
                          return { 
                            applied: investment.amount, 
                            total: investment.amount,
                            isBeforePurchase: false
                          };
                        }
                        
                        // Para meses após a compra sem registro, propagar apenas o valor total
                        // Valor aplicado deve ser 0 (nenhum aporte neste mês)
                        if (idx > 0) {
                          const previousMonthValue = getMonthlyValue(investment.id, months[idx - 1]);
                          if (previousMonthValue) {
                            return {
                              applied: 0, // Sem aporte neste mês
                              total: previousMonthValue.total_value, // Mantém valor total do mês anterior
                              isBeforePurchase: false
                            };
                          }
                          
                          // Buscar último valor conhecido antes deste mês
                          const previousValues = monthlyValues
                            .filter(mv => mv.investment_id === investment.id && new Date(mv.month_date) < month)
                            .sort((a, b) => new Date(b.month_date).getTime() - new Date(a.month_date).getTime());
                          
                          if (previousValues.length > 0) {
                            return {
                              applied: 0, // Sem aporte neste mês
                              total: previousValues[0].total_value, // Mantém valor total do último mês conhecido
                              isBeforePurchase: false
                            };
                          }
                        }
                        
                        // Sem dados mensais registrados - usar valor inicial como fallback
                        return { 
                          applied: investment.amount, 
                          total: investment.amount,
                          isBeforePurchase: false
                        };
      });

      return {
        investment,
        monthlyData
      };
    });
  }, [investments, months, getMonthlyValue, monthlyValues]);



  const handleSaveMonthValue = (investmentId: string, month: Date, newTotal: number) => {
    // A lógica de atualização será implementada via mutation
    // Por ora, vamos apenas fechar o dialog (a mutation será chamada dentro do EditMonthValueDialog)
  };

  const handleNewAport = (investmentId: string, investmentName: string, month: Date) => {
    // Abrir modal de novo aporte
    setAportDialog({
      open: true,
      investmentId,
      investmentName,
      month
    });
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
                  <th className="px-2 py-1 text-left font-semibold border-b w-28">Vencimento</th>
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
                        {investment.maturity_date ? format(parseISO(investment.maturity_date), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
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
          <div className="flex-1 overflow-x-auto" ref={(el) => {
            if (el && months.length > 0) {
              // Scroll to the end on mount
              el.scrollLeft = el.scrollWidth;
            }
          }}>
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
                {investmentData.map(({ investment, monthlyData }, invIdx) => {
                  const purchaseDate = parseISO(investment.purchase_date);
                  
                  return (
                    <React.Fragment key={invIdx}>
                      <tr className="border-b-0">
                        {monthlyData.map((data, monthIdx) => {
                          const isBeforePurchase = data.isBeforePurchase;
                          
                          return (
                            <td 
                              key={`applied-${monthIdx}`} 
                              className={`px-2 py-1 text-center text-xs relative ${
                                isBeforePurchase 
                                  ? 'bg-muted/30' 
                                  : 'bg-blue-50/30 group cursor-pointer'
                              }`}
                              onMouseEnter={isBeforePurchase ? undefined : () => setHoveredCell({ invIdx, monthIdx, type: 'applied' })}
                              onMouseLeave={isBeforePurchase ? undefined : () => setHoveredCell(null)}
                            >
                              {isBeforePurchase ? '' : (data.applied > 0 ? formatCurrency(data.applied) : '-')}
                              {!isBeforePurchase && hoveredCell?.invIdx === invIdx && hoveredCell?.monthIdx === monthIdx && hoveredCell?.type === 'applied' && (
                                <div className="absolute inset-0 bg-blue-100/80 flex items-center justify-center gap-1 z-10">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setHistoryDialog({ open: true, investmentId: investment.id })}
                                  >
                                    <History className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleNewAport(investment.id, investment.name, months[monthIdx])}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                      <tr className={invIdx < investmentData.length - 1 ? "border-b" : ""}>
                        {monthlyData.map((data, monthIdx) => {
                          const isBeforePurchase = data.isBeforePurchase;
                          
                          return (
                            <td 
                              key={`total-${monthIdx}`} 
                              className={`px-2 py-1 text-center text-xs font-semibold relative ${
                                isBeforePurchase 
                                  ? 'bg-muted/30' 
                                  : 'bg-green-50/30 group cursor-pointer'
                              }`}
                              onMouseEnter={isBeforePurchase ? undefined : () => setHoveredCell({ invIdx, monthIdx, type: 'total' })}
                              onMouseLeave={isBeforePurchase ? undefined : () => setHoveredCell(null)}
                            >
                              {isBeforePurchase ? '' : (data.total > 0 ? formatCurrency(data.total) : '-')}
                              {!isBeforePurchase && hoveredCell?.invIdx === invIdx && hoveredCell?.monthIdx === monthIdx && hoveredCell?.type === 'total' && (
                                <div className="absolute inset-0 bg-green-100/80 flex items-center justify-center z-10">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setEditDialog({ 
                                      open: true, 
                                      investmentId: investment.id, 
                                      investmentName: investment.name,
                                      month: months[monthIdx],
                                      currentTotal: data.total,
                                      currentApplied: data.applied
                                    })}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {historyDialog && (
        <InvestmentAportHistoryDialog
          open={historyDialog.open}
          onOpenChange={(open) => setHistoryDialog(open ? historyDialog : null)}
          investmentId={historyDialog.investmentId}
        />
      )}

      {editDialog && (
        <EditMonthValueDialog
          open={editDialog.open}
          onOpenChange={(open) => setEditDialog(open ? editDialog : null)}
          investmentId={editDialog.investmentId}
          investmentName={editDialog.investmentName}
          month={editDialog.month}
          currentTotal={editDialog.currentTotal}
          currentApplied={editDialog.currentApplied}
          onSave={handleSaveMonthValue}
        />
      )}

      {aportDialog && (
        <InvestmentNewAportDialog
          open={aportDialog.open}
          onOpenChange={(open) => setAportDialog(open ? aportDialog : null)}
          investmentId={aportDialog.investmentId}
          investmentName={aportDialog.investmentName}
          month={aportDialog.month}
        />
      )}
    </div>
  );
};

export default InvestmentTableView;
