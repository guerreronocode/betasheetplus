
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calculator, CheckCircle, XCircle } from "lucide-react";
import { DebtData, DebtCalculationService, EarlyPayoffSimulation } from "@/services/debtService";
import { formatCurrency } from "@/utils/formatters";

interface EarlyPayoffSimulatorProps {
  debt: DebtData;
  onBack: () => void;
  onMarkAsPaid: () => void;
  isMarkingAsPaid?: boolean;
}

const EarlyPayoffSimulator: React.FC<EarlyPayoffSimulatorProps> = ({
  debt,
  onBack,
  onMarkAsPaid,
  isMarkingAsPaid = false,
}) => {
  const simulation: EarlyPayoffSimulation = DebtCalculationService.simulateEarlyPayoff(debt);

  const getRecommendationColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getRecommendationText = (score: number) => {
    if (score >= 80) return "Altamente recomendado";
    if (score >= 60) return "Recomendado com ressalvas";
    return "Não recomendado";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Simulação de Quitação Antecipada</h2>
        </div>
      </div>

      {/* Informações da Dívida */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Dados da Dívida</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Credor:</span>
            <div className="font-semibold">{debt.creditor}</div>
          </div>
          <div>
            <span className="text-gray-500">Descrição:</span>
            <div className="font-semibold">{debt.description}</div>
          </div>
          <div>
            <span className="text-gray-500">Parcelas:</span>
            <div className="font-semibold">
              {debt.paid_installments}/{debt.total_installments}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Valor da Parcela:</span>
            <div className="font-semibold">{formatCurrency(debt.installment_value)}</div>
          </div>
        </div>
      </Card>

      {/* Simulação */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Análise de Quitação</h3>
          <Badge className={getRecommendationColor(simulation.recommendationScore)}>
            {simulation.isRecommended ? (
              <CheckCircle className="w-3 h-3 mr-1" />
            ) : (
              <XCircle className="w-3 h-3 mr-1" />
            )}
            {getRecommendationText(simulation.recommendationScore)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Valor para Quitar */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Valor para Quitar Hoje</div>
            <div className="text-2xl font-bold text-blue-800">
              {formatCurrency(simulation.currentPayoffAmount)}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Valor presente das parcelas restantes
            </div>
          </div>

          {/* Juros Economizados */}
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 mb-1">Juros que Deixará de Pagar</div>
            <div className="text-2xl font-bold text-green-800">
              {formatCurrency(simulation.remainingInterest)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              Economia em juros futuros
            </div>
          </div>

          {/* Economia Total */}
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-purple-600 mb-1">Economia Total</div>
            <div className="text-2xl font-bold text-purple-800">
              {formatCurrency(simulation.totalSavings)}
            </div>
            <div className="text-xs text-purple-600 mt-1">
              Benefício financeiro total
            </div>
          </div>
        </div>

        {/* Detalhes */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Detalhes da Análise</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Meses restantes:</span>
              <span className="ml-2 font-semibold">{simulation.monthsRemaining}</span>
            </div>
            <div>
              <span className="text-gray-600">Score de recomendação:</span>
              <span className="ml-2 font-semibold">{simulation.recommendationScore}/100</span>
            </div>
            <div>
              <span className="text-gray-600">Saldo atual sem quitação:</span>
              <span className="ml-2 font-semibold">{formatCurrency(debt.remaining_balance)}</span>
            </div>
            <div>
              <span className="text-gray-600">Taxa de juros total:</span>
              <span className="ml-2 font-semibold">{debt.total_interest_percentage.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Recomendação */}
        <div className="mt-4 p-4 border-l-4 border-blue-500 bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-2">Recomendação</h4>
          <p className="text-sm text-blue-800">
            {simulation.isRecommended 
              ? `Com uma economia de ${formatCurrency(simulation.totalSavings)} e score de ${simulation.recommendationScore}/100, recomendamos a quitação antecipada desta dívida.`
              : `Com score de ${simulation.recommendationScore}/100, analise cuidadosamente se a quitação antecipada é a melhor opção considerando outras oportunidades de investimento.`
            }
          </p>
        </div>

        {/* Ações */}
        <div className="mt-6 flex gap-3">
          <Button 
            onClick={onMarkAsPaid}
            disabled={isMarkingAsPaid}
            className="bg-green-600 hover:bg-green-700"
          >
            {isMarkingAsPaid ? "Processando..." : "Registrar Quitação Total"}
          </Button>
          <Button variant="outline" onClick={onBack}>
            Cancelar
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EarlyPayoffSimulator;
