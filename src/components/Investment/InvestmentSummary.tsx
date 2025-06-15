
import React from "react";
import { TrendingUp, DollarSign, Percent } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";

interface InvestmentSummaryProps {
  totalInvested: number;
  currentInvestmentValue: number;
  investmentReturn: number;
}

const InvestmentSummary: React.FC<InvestmentSummaryProps> = ({
  totalInvested,
  currentInvestmentValue,
  investmentReturn,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <DollarSign className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Investido</p>
          <p className="text-lg font-semibold">{formatCurrency(totalInvested)}</p>
        </div>
      </div>
    </Card>
    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Valor Atual</p>
          <p className="text-lg font-semibold">{formatCurrency(currentInvestmentValue)}</p>
        </div>
      </div>
    </Card>
    <Card className="p-4">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${investmentReturn >= 0 ? "bg-green-100" : "bg-red-100"}`}>
          <Percent className={`w-5 h-5 ${investmentReturn >= 0 ? "text-green-600" : "text-red-600"}`} />
        </div>
        <div>
          <p className="text-sm text-gray-600">Rendimento</p>
          <p className={`text-lg font-semibold ${investmentReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(investmentReturn)}
          </p>
        </div>
      </div>
    </Card>
  </div>
);

export default InvestmentSummary;
