import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { usePatrimony } from '@/hooks/usePatrimony';
import { useFinancialData } from '@/hooks/useFinancialData';
import { usePatrimonyGroupsFull } from "@/hooks/usePatrimonyGroupsFull";
import { formatCurrency } from "@/utils/formatters";
import PatrimonyDetailView from "./PatrimonyDetailView";

const PatrimonySummaryOverview = () => {
  const [showDetails, setShowDetails] = useState(false);
  const { assets, liabilities, debts, isLoading } = usePatrimony();
  const { bankAccounts, investments } = useFinancialData();

  const { groups, totals } = usePatrimonyGroupsFull({
    assets,
    liabilities,
    investments,
    bankAccounts,
    debts,
  });

  const totalAtivos = totals.ativo_circulante + totals.ativo_nao_circulante;
  const totalPassivos = totals.passivo_circulante + totals.passivo_nao_circulante;
  const patrimonioLiquido = totalAtivos - totalPassivos;

  if (isLoading) return <div>Carregando...</div>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resumo do Patrimônio</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Detalhes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">Total Ativos</div>
              <div className="text-lg font-bold text-green-700">
                {formatCurrency(totalAtivos)}
              </div>
              <div className="text-xs text-green-500">
                {(groups.ativo_circulante?.length || 0) + (groups.ativo_nao_circulante?.length || 0)} itens
              </div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-sm text-red-600 font-medium">Total Passivos</div>
              <div className="text-lg font-bold text-red-700">
                {formatCurrency(totalPassivos)}
              </div>
              <div className="text-xs text-red-500">
                {(groups.passivo_circulante?.length || 0) + (groups.passivo_nao_circulante?.length || 0)} itens
              </div>
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Patrimônio Líquido</div>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(patrimonioLiquido)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhamento do Patrimônio</DialogTitle>
          </DialogHeader>
          <PatrimonyDetailView
            groups={groups}
            totals={totals}
            netWorth={patrimonioLiquido}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PatrimonySummaryOverview;