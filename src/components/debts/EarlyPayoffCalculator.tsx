
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calculator, AlertCircle } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/formatters";

interface PayoffCalculationResult {
  currentPayoffAmount: number;
  totalFuturePayments: number;
  interestSavings: number;
  remainingInstallments: number;
  monthlyInterestRate: number;
  annualInterestRate: number;
  recommendationScore: number;
  isRecommended: boolean;
  totalDebtWithInterest: number;
  totalDebtWithoutInterest: number;
}

interface EarlyPayoffCalculatorProps {
  calculation: PayoffCalculationResult;
  debtInfo: {
    creditor: string;
    description: string;
    installmentValue: number;
  };
}

const EarlyPayoffCalculator: React.FC<EarlyPayoffCalculatorProps> = ({
  calculation,
  debtInfo
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getRecommendationText = (score: number) => {
    if (score >= 80) return "Recomendamos quitar";
    if (score >= 60) return "Considere quitar";
    return "Não vale a pena quitar agora";
  };

  const getRecommendationIcon = (score: number) => {
    if (score >= 60) return <TrendingUp className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header com recomendação principal */}
      <Card className={`p-6 border-2 ${calculation.isRecommended ? 'border-green-200' : 'border-red-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold">Simulação de Quitação</h3>
          </div>
          <Badge className={getScoreBadgeColor(calculation.recommendationScore)}>
            {getRecommendationIcon(calculation.recommendationScore)}
            {getRecommendationText(calculation.recommendationScore)} ({calculation.recommendationScore}/100)
          </Badge>
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
          {debtInfo.creditor} - {debtInfo.description}
        </div>
      </Card>

      {/* Valores principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Valor para quitar hoje</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(calculation.currentPayoffAmount)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Saldo devedor atual
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Total se pagar até o fim</div>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(calculation.totalFuturePayments)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {calculation.remainingInstallments} parcelas restantes
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Economia em juros</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(calculation.interestSavings)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Valor que deixará de pagar
          </div>
        </Card>
      </div>

      {/* Resumo detalhado */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Resumo da Análise
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Parcelas restantes:</span>
              <span className="font-semibold">{calculation.remainingInstallments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor da parcela:</span>
              <span className="font-semibold">{formatCurrency(debtInfo.installmentValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxa mensal:</span>
              <span className="font-semibold">{formatPercentage(calculation.monthlyInterestRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxa anual:</span>
              <span className="font-semibold">{formatPercentage(calculation.annualInterestRate)}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Dívida total (com juros):</span>
              <span className="font-semibold">{formatCurrency(calculation.totalDebtWithInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dívida total (sem juros):</span>
              <span className="font-semibold">{formatCurrency(calculation.totalDebtWithoutInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Score de recomendação:</span>
              <span className={`font-semibold ${getScoreColor(calculation.recommendationScore)}`}>
                {calculation.recommendationScore}/100
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Explicação da recomendação */}
      <Card className="p-4 bg-blue-50">
        <h5 className="font-semibold text-blue-900 mb-2">Por que essa recomendação?</h5>
        <p className="text-sm text-blue-800">
          {calculation.isRecommended 
            ? `Com uma economia de ${formatCurrency(calculation.interestSavings)} e taxa de juros de ${formatPercentage(calculation.annualInterestRate)} ao ano, a quitação antecipada é vantajosa financeiramente.`
            : `Com a taxa atual e o tempo restante, pode ser mais vantajoso manter a dívida e investir o dinheiro em outras oportunidades.`
          }
        </p>
        
        <div className="mt-3 text-xs text-blue-600">
          <strong>Nota:</strong> Esta análise considera apenas aspectos financeiros básicos. 
          No futuro, incluiremos sua reserva de emergência e impacto no fluxo de caixa.
        </div>
      </Card>
    </div>
  );
};

export default EarlyPayoffCalculator;
