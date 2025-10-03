import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/formatters';
import { getInvestmentTypeLabel } from '@/utils/investmentHelpers';
import { Investment } from '@/hooks/useInvestments';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InvestmentTableViewProps {
  investments: Investment[];
}

const InvestmentTableView: React.FC<InvestmentTableViewProps> = ({ investments }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  // Gerar meses do ano selecionado
  const months = useMemo(() => {
    const year = parseInt(selectedYear);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    return eachMonthOfInterval({ start: startDate, end: endDate });
  }, [selectedYear]);

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

  // Gerar anos disponíveis (do mais antigo investimento até ano atual + 1)
  const availableYears = useMemo(() => {
    if (investments.length === 0) return [currentYear];
    
    const oldestYear = Math.min(
      ...investments.map(inv => new Date(inv.purchase_date).getFullYear())
    );
    
    const years = [];
    for (let year = oldestYear; year <= currentYear + 1; year++) {
      years.push(year);
    }
    return years;
  }, [investments, currentYear]);

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
      <Card className="p-8 text-center text-muted-foreground">
        Nenhum investimento encontrado. Adicione seus investimentos para visualizar a tabela.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-title text-fnb-ink">Tabela de Investimentos</h2>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px] bg-fnb-accent/5">Nome</TableHead>
                <TableHead className="min-w-[120px] bg-fnb-accent/5">Tipo</TableHead>
                <TableHead className="min-w-[120px] bg-fnb-accent/5">Rendimento</TableHead>
                {months.map((month, idx) => (
                  <TableHead key={idx} className="min-w-[100px] text-center bg-fnb-accent/5">
                    {format(month, 'MMM', { locale: ptBR })}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {investmentData.map(({ investment, monthlyData }, invIdx) => (
                <React.Fragment key={investment.id}>
                  {/* Linha principal com info do investimento */}
                  <TableRow className="border-b-0">
                    <TableCell rowSpan={2} className="font-medium border-r">
                      {investment.name}
                    </TableCell>
                    <TableCell rowSpan={2} className="border-r">
                      {getInvestmentTypeLabel(investment.type)}
                    </TableCell>
                    <TableCell rowSpan={2} className="border-r">
                      {getYieldTypeLabel(investment.yield_type)}
                      {investment.yield_rate > 0 && ` + ${investment.yield_rate}%`}
                    </TableCell>
                    {monthlyData.map((data, monthIdx) => (
                      <TableCell 
                        key={`applied-${monthIdx}`} 
                        className="text-center text-sm bg-blue-50"
                      >
                        {data.applied > 0 ? formatCurrency(data.applied) : '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                  {/* Segunda linha com totais */}
                  <TableRow className={invIdx < investmentData.length - 1 ? "border-b-2" : ""}>
                    {monthlyData.map((data, monthIdx) => (
                      <TableCell 
                        key={`total-${monthIdx}`} 
                        className="text-center text-sm font-semibold bg-green-50"
                      >
                        {data.total > 0 ? formatCurrency(data.total) : '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-4 bg-fnb-accent/5">
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
            <span>Aplicado no mês</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
            <span>Saldo total</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvestmentTableView;
