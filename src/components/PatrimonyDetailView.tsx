import React, { useState } from "react";
import { patrimonyGroupLabels } from "./patrimonyCategories";
import { formatCurrency } from "@/utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  groups: Record<string, any[]>;
  totals: Record<string, number>;
  netWorth: number;
}

const PatrimonyDetailView: React.FC<Props> = ({ groups, totals, netWorth }) => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-600 font-medium">Patrimônio Líquido</div>
        <div className="text-2xl font-bold text-blue-700">
          {formatCurrency(netWorth)}
        </div>
      </div>

      {/* Grupos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.keys(patrimonyGroupLabels).map(groupKey => (
          <button
            key={groupKey}
            className={`rounded shadow p-3 w-full hover:bg-gray-100 text-sm flex flex-col items-center border 
              ${groupKey.includes('ativo') ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'}
              ${selectedGroup === groupKey ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedGroup(selectedGroup === groupKey ? null : groupKey)}
          >
            <span className="font-semibold">{patrimonyGroupLabels[groupKey]}</span>
            <span className="text-lg font-bold">
              {formatCurrency(totals[groupKey] || 0)}
            </span>
            <span className="text-xs mt-1 text-gray-500">{groups[groupKey]?.length || 0} itens</span>
          </button>
        ))}
      </div>

      {/* Lista de itens do grupo selecionado */}
      {selectedGroup && groups[selectedGroup] && (
        <Card>
          <CardHeader>
            <CardTitle>{patrimonyGroupLabels[selectedGroup]}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {groups[selectedGroup].map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    {item.category && (
                      <div className="text-sm text-gray-500">{item.category}</div>
                    )}
                    {(item.isDebt || item.isCreditCard || item.source === 'credit_card_debt') && (
                      <div className="text-xs text-blue-500">Sincronizado automaticamente</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {formatCurrency(item.current_value || item.remaining_amount || 0)}
                    </div>
                    {item.liquidity && (
                      <div className="text-xs text-gray-500">{item.liquidity}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatrimonyDetailView;