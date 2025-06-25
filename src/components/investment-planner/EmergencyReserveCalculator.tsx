import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Shield, Calculator, Target, TrendingUp, ArrowLeft } from 'lucide-react';
import { InvestmentProfile, useInvestmentPlanner } from '@/hooks/useInvestmentPlanner';
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
  const { plan, savePlan, isSavingPlan, setCurrentStep } = useInvestmentPlanner();
  
  const [currentReserve, setCurrentReserve] = useState(
    plan?.emergency_reserve_current || 0
  );

  // Estado para o multiplicador de meses escolhido pelo usuário
  const [selectedMonths, setSelectedMonths] = useState(
    plan?.emergency_reserve_target ? Math.round(plan.emergency_reserve_target / profile.monthly_expenses) : calculations.emergencyReserveMultiplier
  );

  // Calcular limites baseados no tipo de emprego
  const getReserveMonthsLimits = () => {
    if (profile.employment_type === 'freelancer' || profile.employment_type === 'entrepreneur') {
      return { min: 18, max: 24, default: 18 };
    } else if (profile.employment_type === 'civil_servant') {
      return { min: 6, max: 12, default: 6 };
    } else { // CLT
      return { min: 6, max: 12, default: 6 };
    }
  };

  const monthsLimits = getReserveMonthsLimits();
  const customReserveTarget = profile.monthly_expenses * selectedMonths;
  
  const reserveProgress = currentReserve > 0 
    ? (currentReserve / customReserveTarget) * 100 
    : 0;

  const isReserveComplete = currentReserve >= customReserveTarget;
  const monthsToComplete = isReserveComplete 
    ? 0 
    : Math.ceil((customReserveTarget - currentReserve) / Math.max(calculations.monthlyInvestmentCapacity, 1));

  const handleContinue = () => {
    console.log('Continue button clicked - saving plan data');
    
    if (!profile.id) {
      console.error('Profile ID is missing');
      return;
    }

    const planData = {
      profile_id: profile.id,
      emergency_reserve_target: customReserveTarget,
      emergency_reserve_current: currentReserve,
      short_term_allocation: calculations.shortTermAllocation,
      medium_term_allocation: calculations.mediumTermAllocation,
      long_term_allocation: calculations.longTermAllocation,
      monthly_investment_capacity: calculations.monthlyInvestmentCapacity,
      is_emergency_reserve_complete: isReserveComplete,
    };

    console.log('Submitting plan data:', planData);
    savePlan(planData);
  };

  const handleBackToProfile = () => {
    console.log('Back to profile button clicked');
    setCurrentStep('profile');
  };

  const getEmploymentTypeInfo = () => {
    const types = {
      clt: {
        title: '👥 CLT - Estabilidade Moderada',
        description: 'Renda mais previsível, mas sujeita a demissões',
        recommendation: 'Continue priorizando a reserva junto com investimentos básicos'
      },
      civil_servant: {
        title: '🏛️ Concursado - Alta Estabilidade',
        description: 'Renda muito previsível e estável',
        recommendation: 'Pode equilibrar melhor entre reserva e investimentos'
      },
      freelancer: {
        title: '💻 Freelancer - Renda Variável',
        description: 'Renda imprevisível, necessita maior proteção',
        recommendation: 'Priorize fortemente a reserva antes de investir'
      },
      entrepreneur: {
        title: '🚀 Empreendedor - Alta Volatilidade',
        description: 'Renda muito variável, custos imprevistos',
        recommendation: 'Reserva robusta é essencial para sustentar o negócio'
      }
    };
    return types[profile.employment_type] || types.clt;
  };

  const employmentInfo = getEmploymentTypeInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          🛡️ Calculadora de Reserva de Emergência
        </h3>
        <p className="text-gray-600">
          Sua base de segurança financeira personalizada
        </p>
      </div>

      {/* Cálculo da Reserva */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Cálculo Personalizado</h4>
            <p className="text-sm text-gray-600">
              Baseado no seu perfil profissional e gastos mensais
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Gastos Mensais</div>
            <div className="text-xl font-bold text-blue-800">
              {formatCurrency(profile.monthly_expenses)}
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-purple-600 mb-1">Meses Escolhidos</div>
            <div className="text-xl font-bold text-purple-800">
              {selectedMonths} meses
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 mb-1">Meta da Reserva</div>
            <div className="text-xl font-bold text-green-800">
              {formatCurrency(customReserveTarget)}
            </div>
          </div>
        </div>
      </Card>

      {/* Escolha do Período da Reserva */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Período da Reserva</h4>
            <p className="text-sm text-gray-600">
              Quantos meses de despesas você quer guardar?
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Meses de Reserva: {selectedMonths}</Label>
            <div className="mt-2">
              <Slider
                value={[selectedMonths]}
                onValueChange={(value) => setSelectedMonths(value[0])}
                min={monthsLimits.min}
                max={monthsLimits.max}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{monthsLimits.min} meses (mínimo)</span>
              <span>{monthsLimits.max} meses (máximo)</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Meta ajustada:</strong> {formatCurrency(customReserveTarget)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {selectedMonths} meses × {formatCurrency(profile.monthly_expenses)} = {formatCurrency(customReserveTarget)}
            </p>
          </div>
        </div>
      </Card>

      {/* Status Atual */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Shield className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Sua Reserva Atual</h4>
            <p className="text-sm text-gray-600">
              Quanto você já tem guardado para emergências?
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="current_reserve">Valor Atual da Reserva</Label>
            <Input
              id="current_reserve"
              type="number"
              step="0.01"
              value={currentReserve}
              onChange={(e) => setCurrentReserve(Number(e.target.value))}
              placeholder="0,00"
              className="mt-1"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Progresso da Reserva
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {Math.min(100, reserveProgress).toFixed(1)}%
              </span>
            </div>
            
            <Progress value={Math.min(100, reserveProgress)} className="h-3" />
            
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>{formatCurrency(currentReserve)}</span>
              <span>{formatCurrency(customReserveTarget)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Próximos Passos */}
      <Card className="p-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-800">Situação Profissional</h4>
            <p className="text-sm text-blue-600">{employmentInfo.title}</p>
          </div>
        </div>

        <p className="text-sm text-blue-700 mb-4">{employmentInfo.description}</p>
        <p className="text-sm font-medium text-blue-800">{employmentInfo.recommendation}</p>

        {!isReserveComplete && (
          <div className="mt-4 p-4 bg-white bg-opacity-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">
                Faltam: {formatCurrency(Math.max(0, customReserveTarget - currentReserve))}
              </span>
              <Badge variant="outline" className="bg-white">
                {monthsToComplete} meses
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Investindo {formatCurrency(calculations.monthlyInvestmentCapacity)} por mês
            </p>
          </div>
        )}
      </Card>

      {/* Ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={handleBackToProfile}
          className="flex items-center gap-2"
          disabled={isSavingPlan}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Perfil
        </Button>
        
        <Button
          onClick={handleContinue}
          className="bg-orange-600 hover:bg-orange-700"
          disabled={isSavingPlan}
        >
          {isSavingPlan ? 'Salvando...' : 'Continuar para Alocação →'}
        </Button>
      </div>
    </div>
  );
};

export default EmergencyReserveCalculator;
