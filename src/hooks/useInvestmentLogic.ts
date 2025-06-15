
import { useMemo } from "react";
import { calculateReturn } from "@/utils/investmentHelpers";

export function useInvestmentSummary(investments: Array<{ amount: number; current_value: number }>) {
  return useMemo(() => {
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalCurrent = investments.reduce((sum, inv) => sum + (inv.current_value || inv.amount || 0), 0);
    const { value, percentage } = calculateReturn(totalInvested, totalCurrent);

    return {
      totalInvested,
      totalCurrent,
      returnValue: value,
      returnPercentage: percentage,
    };
  }, [investments]);
}
