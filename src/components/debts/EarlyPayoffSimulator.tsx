
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DebtData } from "@/services/debtService";
import { EarlyPayoffCalculatorService } from "@/services/earlyPayoffService";
import EarlyPayoffCalculator from "./EarlyPayoffCalculator";

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
  const calculation = EarlyPayoffCalculatorService.calculateEarlyPayoff(debt);

  const debtInfo = {
    creditor: debt.creditor,
    description: debt.description,
    installmentValue: debt.installment_value,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Dívidas
        </Button>
        <div className="flex gap-3">
          {calculation.isRecommended && (
            <Button 
              onClick={onMarkAsPaid}
              disabled={isMarkingAsPaid}
              className="bg-green-600 hover:bg-green-700"
            >
              {isMarkingAsPaid ? "Processando..." : "Registrar Quitação Total"}
            </Button>
          )}
        </div>
      </div>

      {/* Calculadora de quitação */}
      <EarlyPayoffCalculator 
        calculation={calculation}
        debtInfo={debtInfo}
      />

      {/* Ações adicionais */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">Próximos passos</h4>
            <p className="text-sm text-gray-600">
              {calculation.isRecommended 
                ? "Se decidir quitar, clique em 'Registrar Quitação Total' para atualizar seus registros."
                : "Considere manter a dívida atual e explorar outras oportunidades de investimento."
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              Voltar sem alterar
            </Button>
            {!calculation.isRecommended && (
              <Button 
                onClick={onMarkAsPaid}
                disabled={isMarkingAsPaid}
                variant="secondary"
              >
                {isMarkingAsPaid ? "Processando..." : "Quitar mesmo assim"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EarlyPayoffSimulator;
