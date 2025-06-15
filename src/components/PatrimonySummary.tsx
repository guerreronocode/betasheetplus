
import React from "react";
import { patrimonyGroupLabels } from "./patrimonyCategories";

interface PatrimonySummaryProps {
  groups: Record<string, any[]>;
  totals: Record<string, number>;
  selectedGroup: string | null;
  onGroupSelect: (group: string | null) => void;
}

const PatrimonySummary: React.FC<PatrimonySummaryProps> = ({
  groups, totals, selectedGroup, onGroupSelect,
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
    {Object.keys(patrimonyGroupLabels).map(groupKey => (
      <button
        key={groupKey}
        className={`rounded shadow p-3 w-full hover:bg-gray-100 text-sm flex flex-col items-center border 
          ${groupKey.includes('ativo') ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'}
          ${selectedGroup === groupKey ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => onGroupSelect(selectedGroup === groupKey ? null : groupKey)}
      >
        <span className="font-semibold">{patrimonyGroupLabels[groupKey]}</span>
        <span className="text-lg font-bold">
          {totals[groupKey]?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
        <span className="text-xs mt-1 text-gray-500">{groups[groupKey]?.length || 0} itens</span>
      </button>
    ))}
  </div>
);

export default PatrimonySummary;
