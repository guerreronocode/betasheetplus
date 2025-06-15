
import React from "react";
import { Card } from "@/components/ui/card";
import PatrimonySummary from "./PatrimonySummary";
import PatrimonyNetWorthCard from "./PatrimonyNetWorthCard";

interface Props {
  groups: Record<string, any[]>;
  totals: Record<string, number>;
  selectedGroup: string | null;
  onGroupSelect: (group: string) => void;
  netWorth: number;
}

const PatrimonyHeaderSection: React.FC<Props> = ({
  groups, totals, selectedGroup, onGroupSelect, netWorth
}) => (
  <Card className="p-4">
    <h2 className="text-lg font-bold mb-3">Meu Patrimônio</h2>
    <PatrimonySummary
      groups={groups}
      totals={totals}
      selectedGroup={selectedGroup}
      onGroupSelect={onGroupSelect}
    />
    <PatrimonyNetWorthCard netWorth={netWorth} />
  </Card>
);

export default React.memo(PatrimonyHeaderSection);
