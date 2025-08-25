
import React from "react";
import InvestmentCard from "./InvestmentCard";

interface InvestmentListProps {
  investments: any[];
  onEdit: (inv: any) => void;
  onDelete: (id: string) => void;
  onAport: (inv: any) => void;
  onUpdate: (inv: any) => void;
}

const InvestmentList: React.FC<InvestmentListProps> = ({
  investments,
  onEdit,
  onDelete,
  onAport,
  onUpdate,
}) => {
  if (investments.length === 0)
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M13 16h-1v-4h-1m2 0h.01M12 20c4.418 0 8-4.03 8-9s-3.582-9-8-9-8 4.03-8 9 3.582 9 8 9z" />
        </svg>
        <p>Nenhum investimento encontrado</p>
        <p className="text-sm">Adicione seus primeiros investimentos!</p>
      </div>
    );
  return (
    <div className="space-y-4">
      {investments.map((investment, idx) => (
        <InvestmentCard
          key={investment.id}
          investment={investment}
          onEdit={onEdit}
          onDelete={onDelete}
          onAport={onAport}
          onUpdate={onUpdate}
          index={idx}
        />
      ))}
    </div>
  );
};

export default InvestmentList;
