
import React from "react";

interface PatrimonyNetWorthCardProps {
  netWorth: number;
}

const PatrimonyNetWorthCard: React.FC<PatrimonyNetWorthCardProps> = ({ netWorth }) => (
  <div className="mb-6">
    <span className="text-blue-700 font-semibold">Patrimônio Líquido: </span>
    <span className="text-2xl font-bold">
      {netWorth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
    </span>
  </div>
);

export default PatrimonyNetWorthCard;
