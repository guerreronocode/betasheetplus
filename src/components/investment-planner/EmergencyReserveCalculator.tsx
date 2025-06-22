
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Shield, Calculator, TrendingUp, AlertTriangle } from 'lucide-react';
import { InvestmentProfile } from '@/hooks/useInvestmentPlanner';
import { useInvestmentPlanner } from '@/hooks/useInvestmentPlanner';
import { formatCurrency } from '@/utils/formatters';

interface EmergencyReserveCalculatorProps {
  profile: InvestmentProfile;
  calculations: {
    monthlyInvestmentCapacity: number;
    emergencyReserveTarget: number;
    emergencyReserveMultiplier: number;
    shortTermAllocation: number;
    mediumTermAllocation: number;
    longTermAllocation: number;
  };
}

const EmergencyReserveCalculator: React.FC<EmergencyReserveCalculatorProps> = ({
  profile,
  calculations
}) => {
  const { plan, savePlan, isSavingPlan } = useInvestmentPlanner();
  
  const [currentReserve, setCurrentReserve] = useState(
    plan?.emergency_reserve_current || 0
  );

  const reserveProgress = (currentReserve / calculations.emergencyReserveTarget) * 100;
  const isReserveComplete = reserveProgress >= 100;
  const remainingAmount = Math.max(0, calculations.emergencyReserveTarget - currentReserve);
  const monthsToComplete = remainingAmount > 0 && calculations.monthlyInvestmentCapacity > 0
    ? Math.ceil(remainingAmount / calculations.monthlyInvestmentCapacity)
    : 0;

  const getReserveRecommendation = () => {
    switch (profile.organization_level) {
      case 'no_reserve':
        return {
          title: '🚨 Prioridade Alta: Formar Reserva',
          description: 'Sua reserva de emergência deve ser a prioridade número 1 antes de qualquer investimento.',
          color: 'red',
          allocation: 100
        };
      case 'building_reserve':
        return {
          title: '🏗️ Continue Construindo',
          description: 'Mantenha o foco em completar sua reserva antes de diversificar.',
          color: 'orange',
          allocation: 80
        };
      case 'reserve_completed':
        return {
          title: '✅ Reserva Completa!',
          description: 'Parabéns! Agora você pode focar em investimentos de crescimento.',
          color: 'green',
          allocation: 10
        };
    }
  };

  const recommendation = getReserveRecommendation();

  const handleSavePlan = () => {
    const planData = {
      profile_id: profile.id!,
      emergency_reserve_target: calculations.emergencyReserveTarget,
      emergency_reserve_current: currentReserve,
      short_term_allocation: calculations.shortTermAllocation,
      medium_term_allocation: calculations.mediumTermAllocation,
      long_term_allocation: calculations.longTermAllocation,
      monthly_investment_capacity: calculations.monthlyInvestmentCapacity,
      is_emergency_reserve_complete: isReserveComplete,
    };

    savePlan(planData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          🛡️ Calculadora de Reserva de Emergência
        </h3>
        <p className="text-gray-600">
          Sua segurança financeira começa aqui
        </p>
      </div>

      {/* Cálculo Automático */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Cálculo Personalizado</h4>
            <p className="text-sm text-gray-600">
              Baseado no seu perfil e situação atual
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Gastos Mensais</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(profile.monthly_expenses)}
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">
              Multiplicador ({calculations.emergencyReserveMultiplier}x)
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {calculations.emergencyReserveMultiplier} meses
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 mb-1">Reserva Ideal</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(calculations.emergencyReserveTarget)}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">
              Por que {calculations.emergencyReserveMultiplier} meses?
            </span>
          </div>
          <p className="text-sm text-blue-700">
            {profile.organization_level === 'no_reserve' && 
              'Para CLT ou trabalho menos estável, recomendamos 12 meses de segurança.'
            }
            {profile.organization_level === 'building_reserve' && 
              'Baseado no seu perfil, 6-12 meses proporcionam boa segurança.'
            }
            {profile.organization_level === 'reserve_completed' && 
              'Para concursados ou renda estável, 6 meses são suficientes.'
            }
          </p>
        </div>
      </Card>

      {/* Status Atual */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Situação Atual</h4>
            <p className="text-sm text-gray-600">
              Onde você está no seu caminho
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="current_reserve">Valor atual da sua reserva (R$)</Label>
            <Input
              id="current_reserve"
              type="number"
              min="0"
              step="100"
              placeholder="0"
              value={currentReserve || ''}
              onChange={(e) => setCurrentReserve(parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Inclua poupança, CDB de liquidez diária, conta corrente reservada
            </p>
          </div>

          {/* Progress Visual */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progresso da Reserva
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {Math.min(100, reserveProgress).toFixed(1)}%
              </span>
            </div>
            <Progress value={Math.min(100, reserveProgress)} className="h-3" />
            <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
              <span>{formatCurrency(currentReserve)}</span>
              <span>{formatCurrency(calculations.emergencyReserveTarget)}</span>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${
              isReserveComplete 
                ? 'bg-green-50 border-green-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {isReserveComplete ? (
                  <Shield className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                )}
                <span className={`font-semibold ${
                  isReserveComplete ? 'text-green-800' : 'text-orange-800'
                }`}>
                  {isReserveComplete ? '✅ Reserva Completa!' : '⏳ Falta pouco!'}
                </span>
              </div>
              <p className={`text-sm ${
                isReserveComplete ? 'text-green-700' : 'text-orange-700'
              }`}>
                {isReserveComplete 
                  ? 'Sua segurança financeira está garantida'
                  : `Ainda precisa de ${formatCurrency(remainingAmount)}`
                }
              </p>
            </div>

            {!isReserveComplete && monthsToComplete > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">
                    Tempo para completar
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  Investindo {formatCurrency(calculations.monthlyInvestmentCapacity)}/mês, 
                  você completa em <strong>{monthsToComplete} meses</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Recomendação de Alocação */}
      <Card className={`p-6 border-2 ${
        recommendation.color === 'red' ? 'border-red-200 bg-red-50' :
        recommendation.color === 'orange' ? 'border-orange-200 bg-orange-50' :
        'border-green-200 bg-green-50'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${
            recommendation.color === 'red' ? 'bg-red-100' :
            recommendation.color === 'orange' ? 'bg-orange-100' :
            'bg-green-100'
          }`}>
            <Shield className={`w-6 h-6 ${
              recommendation.color === 'red' ? 'text-red-600' :
              recommendation.color === 'orange' ? 'text-orange-600' :
              'text-green-600'
            }`} />
          </div>
          <div>
            <h4 className={`font-semibold ${
              recommendation.color === 'red' ? 'text-red-800' :
              recommendation.color === 'orange' ? 'text-orange-800' :
              'text-green-800'
            }`}>
              {recommendation.title}
            </h4>
            <p className={`text-sm ${
              recommendation.color === 'red' ? 'text-red-700' :
              recommendation.color === 'orange' ? 'text-orange-700' :
              'text-green-700'
            }`}>
              {recommendation.description}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">
              Sugestão de alocação mensal para reserva
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {recommendation.allocation}%
            </div>
            <div className="text-lg text-gray-700">
              {formatCurrency(calculations.monthlyInvestmentCapacity * (recommendation.allocation / 100))}
              <span className="text-sm text-gray-500"> por mês</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Botão Continuar */}
      <Card className="p-6">
        <Button
          onClick={handleSavePlan}
          className={`w-full ${
            isReserveComplete 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={isSavingPlan}
        >
          {isSavingPlan ? 'Salvando...' : 
           isReserveComplete ? 'Continuar para Planejamento de Investimentos →' : 
           'Salvar e Continuar →'}
        </Button>
        
        {!isReserveComplete && (
          <p className="text-center text-sm text-gray-500 mt-2">
            💡 Você pode continuar mesmo com a reserva incompleta
          </p>
        )}
      </Card>
    </div>
  );
};

export default EmergencyReserveCalculator;
