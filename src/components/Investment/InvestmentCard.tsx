import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/formatters";

interface InvestmentCardProps {
  investment: any;
  onEdit: (inv: any) => void;
  onDelete: (id: string) => void;
  index?: number;
}

const getInvestmentTypeIcon = (type: string) => {
  const icons = {
    stocks: "📈",
    crypto: "₿",
    bonds: "🏛️",
    "real-estate": "🏠",
    funds: "📊",
    savings: "🏦",
  };
  return icons[type as keyof typeof icons] || "💰";
};

const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investment,
  onEdit,
  onDelete,
  index = 0,
}) => {
  const returnValue = investment.current_value - investment.amount;
  const returnPercentage = ((investment.current_value - investment.amount) / investment.amount) * 100;

  return (
    <div className="animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getInvestmentTypeIcon(investment.type)}</span>
            <div>
              <h4 className="font-medium">{investment.name}</h4>
              <p className="text-sm text-gray-600 capitalize">{investment.type}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-sm text-gray-600">Valor Atual</p>
              <p className="font-semibold">{formatCurrency(investment.current_value)}</p>
              <p className={`text-sm ${returnValue >= 0 ? "text-green-600" : "text-red-600"}`}>
                {returnValue >= 0 ? "+" : ""}
                {formatCurrency(returnValue)} ({formatPercentage(returnPercentage)})
              </p>
            </div>
            <div className="flex flex-col space-y-1">
              <Button size="sm" variant="outline" onClick={() => onEdit(investment)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(investment.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Investido</p>
              <p className="font-medium">{formatCurrency(investment.amount)}</p>
            </div>
            <div>
              <p className="text-gray-600">Data</p>
              <p className="font-medium">{new Date(investment.purchase_date).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvestmentCard;
