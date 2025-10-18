
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { Button } from "@/components/ui/button";
import { List, LayoutGrid, Plus, Minus } from "lucide-react";

interface Props {
  groups: Record<string, any[]>;
  totals: Record<string, number>;
  selectedGroup: string | null;
  onGroupSelect: (group: string) => void;
  netWorth: number;
  onAddAsset: () => void;
  onAddLiability: () => void;
}

const PatrimonyHeaderSection: React.FC<Props> = ({
  groups, totals, selectedGroup, onGroupSelect, netWorth, onAddAsset, onAddLiability
}) => {
  const [detailedView, setDetailedView] = useState(false);
  const quadrants = [
    {
      key: 'ativo_circulante',
      title: 'Ativo Circulante',
      total: totals.ativo_circulante || 0,
      items: groups.ativo_circulante?.length || 0,
      colorClass: 'bg-green-50 border-green-300 hover:bg-green-100'
    },
    {
      key: 'passivo_circulante',
      title: 'Passivo Circulante',
      total: totals.passivo_circulante || 0,
      items: groups.passivo_circulante?.length || 0,
      colorClass: 'bg-red-50 border-red-300 hover:bg-red-100'
    },
    {
      key: 'ativo_nao_circulante',
      title: 'Ativo Não Circulante',
      total: totals.ativo_nao_circulante || 0,
      items: groups.ativo_nao_circulante?.length || 0,
      colorClass: 'bg-green-50 border-green-300 hover:bg-green-100'
    },
    {
      key: 'passivo_nao_circulante',
      title: 'Passivo Não Circulante',
      total: totals.passivo_nao_circulante || 0,
      items: groups.passivo_nao_circulante?.length || 0,
      colorClass: 'bg-red-50 border-red-300 hover:bg-red-100'
    }
  ];

  const renderQuadrantContent = (quadrant: typeof quadrants[0]) => {
    if (!detailedView) {
      return (
        <div className="flex flex-col items-center justify-center space-y-1">
          <h3 className="text-xs font-semibold text-fnb-ink/70 uppercase tracking-wide text-center">
            {quadrant.title}
          </h3>
          <p className="text-2xl font-bold text-fnb-ink">
            {formatCurrency(quadrant.total)}
          </p>
          <p className="text-xs text-fnb-ink/60">
            {quadrant.items} {quadrant.items === 1 ? 'item' : 'itens'}
          </p>
        </div>
      );
    }

    const items = groups[quadrant.key] || [];
    // Ordenar por valor decrescente (maior para menor)
    const sortedItems = [...items].sort((a, b) => {
      const valueA = a.current_value ?? a.remaining_amount ?? 0;
      const valueB = b.current_value ?? b.remaining_amount ?? 0;
      return valueB - valueA;
    });
    const displayItems = sortedItems.slice(0, 5);
    const hasMore = sortedItems.length > 5;
    const othersTotal = hasMore 
      ? sortedItems.slice(5).reduce((sum, item) => sum + (item.current_value ?? item.remaining_amount ?? 0), 0)
      : 0;

    return (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-fnb-ink/70 uppercase tracking-wide">
          {quadrant.title}
        </h3>
        <div className="space-y-1 text-sm max-h-48 overflow-y-auto">
          {displayItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <span className="text-fnb-ink/80 truncate">{item.name}</span>
              <span className="font-medium text-fnb-ink ml-2">
                {formatCurrency(item.current_value ?? item.remaining_amount ?? 0)}
              </span>
            </div>
          ))}
          {hasMore && (
            <div className="flex justify-between items-center text-fnb-ink/60">
              <span>Outros ({items.length - 5})</span>
              <span className="font-medium ml-2">{formatCurrency(othersTotal)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-fnb-ink/20">
            <span className="font-semibold text-fnb-ink">Resumo:</span>
            <span className="font-bold text-fnb-ink">{formatCurrency(quadrant.total)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-fnb-ink">Meu Patrimônio</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onAddAsset}
            title="Adicionar ativo"
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onAddLiability}
            title="Adicionar passivo"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDetailedView(!detailedView)}
          >
            {detailedView ? (
              <>
                <LayoutGrid className="w-4 h-4 mr-2" />
                Visão Resumida
              </>
            ) : (
              <>
                <List className="w-4 h-4 mr-2" />
                Visão Detalhada
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Quadrantes 2x2 */}
      <div className="grid grid-cols-2 gap-4">
        {quadrants.map((quadrant) => (
          <Card
            key={quadrant.key}
            className={`p-4 cursor-pointer transition-all border-2 ${quadrant.colorClass} ${
              selectedGroup === quadrant.key ? 'ring-4 ring-fnb-accent ring-offset-2' : ''
            }`}
            onClick={() => onGroupSelect(selectedGroup === quadrant.key ? '' : quadrant.key)}
          >
            {renderQuadrantContent(quadrant)}
          </Card>
        ))}
      </div>

      {/* Patrimônio Líquido */}
      <Card className={`p-6 border-2 ${
        netWorth >= 0 ? 'bg-blue-50 border-blue-300' : 'bg-red-50 border-red-300'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-fnb-ink">
            Patrimônio Líquido
          </h3>
          <p className={`text-4xl font-bold ${
            netWorth >= 0 ? 'text-blue-700' : 'text-red-700'
          }`}>
            {formatCurrency(netWorth)}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default React.memo(PatrimonyHeaderSection);
