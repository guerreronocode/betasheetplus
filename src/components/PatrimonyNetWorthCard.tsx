
import React from "react";
import { formatCurrency } from "@/utils/formatters";

interface PatrimonyNetWorthCardProps {
  netWorth: number;
}

const PatrimonyNetWorthCard: React.FC<PatrimonyNetWorthCardProps> = React.memo(({ netWorth }) => (
  <div className="mb-6">
    <span className="text-blue-700 font-semibold">Patrimônio Líquido: </span>
    <span className="text-2xl font-bold">
      {formatCurrency(netWorth)}
    </span>
  </div>
));

export default PatrimonyNetWorthCard;
