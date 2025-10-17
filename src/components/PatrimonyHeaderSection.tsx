
import React from "react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";

interface Props {
  groups: Record<string, any[]>;
  totals: Record<string, number>;
  selectedGroup: string | null;
  onGroupSelect: (group: string) => void;
  netWorth: number;
}

const PatrimonyHeaderSection: React.FC<Props> = ({
  groups, totals, selectedGroup, onGroupSelect, netWorth
}) => {
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-fnb-ink">Meu Patrimônio</h2>
      
      {/* Quadrantes 2x2 */}
      <div className="grid grid-cols-2 gap-4">
        {quadrants.map((quadrant) => (
          <Card
            key={quadrant.key}
            className={`p-6 cursor-pointer transition-all border-2 ${quadrant.colorClass} ${
              selectedGroup === quadrant.key ? 'ring-4 ring-fnb-accent ring-offset-2' : ''
            }`}
            onClick={() => onGroupSelect(selectedGroup === quadrant.key ? '' : quadrant.key)}
          >
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-fnb-ink/70 uppercase tracking-wide">
                {quadrant.title}
              </h3>
              <p className="text-3xl font-bold text-fnb-ink">
                {formatCurrency(quadrant.total)}
              </p>
              <p className="text-xs text-fnb-ink/60">
                {quadrant.items} {quadrant.items === 1 ? 'item' : 'itens'}
              </p>
            </div>
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
