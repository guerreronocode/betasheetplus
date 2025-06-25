
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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

  const reserveProgress = currentReserve > 0 
    ? (currentReserve / calculations.emergencyReserveTarget) * 100 
    : 0;

  const isReserveComplete = currentReserve >= calculations.emergencyReserveTarget;
  const monthsToComplete = isReserveComplete 
    ? 0 
    : Math.ceil((calculations.emergencyReserveTarget - currentReserve) / Math.max(calculations.monthlyInvestmentCapacity, 1));

  const handleSubmit = () => {
    if (!profile.id) {
      console.error('Profile ID is missing');
      return;
    }

    const planData = {
      profile_id: profile.id,
      emergency_reserve_target: calculations.emergencyReserveTarget,
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
            <div className="text-sm text-purple-600 mb-1">Multiplicador</div>
            <div className="text-xl font-bold text-purple-800">
              {calculations.emergencyReserveMultiplier}x meses
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 mb-1">Meta da Reserva</div>
            <div className="text-xl font-bold text-green-800">
              {formatCurrency(calculations.emergencyReserveTarget)}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-semibold text-gray-800 mb-2">
            {employmentInfo.title}
          </h5>
          <p className="text-sm text-gray-700 mb-2">
            {employmentInfo.description}
          </p>
          <div className="text-sm text-gray-600">
            <strong>Recomendação:</strong> {employmentInfo.recommendation}
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
              <span>{formatCurrency(calculations.emergencyReserveTarget)}</span>
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
            <h4 className="font-semibold text-blue-800">Próximos Passos</h4>
            <p className="text-sm text-blue-600">
              Como estruturar sua reserva de emergência
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-blue-700">
          <div className="flex items-start gap-2">
            <span className="text-blue-500">1️⃣</span>
            <span>Escolha um investimento que renda acima do IPCA e tenha liquidez diária</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">2️⃣</span>
            <span>Configure transferências automáticas mensais para a reserva</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">3️⃣</span>
            <span>Use a reserva apenas para emergências REAIS (não para oportunidades)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">4️⃣</span>
            <span>Quando a reserva estiver completa, redirecione o valor para investimentos</span>
          </div>
        </div>

        {!isReserveComplete && (
          <div className="mt-4 p-4 bg-white bg-opacity-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">
                Faltam: {formatCurrency(Math.max(0, calculations.emergencyReserveTarget - currentReserve))}
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
          onClick={() => {
            console.log('Navigating back to profile');
            setCurrentStep('profile');
          }}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Perfil
        </Button>
        
        <Button
          onClick={handleSubmit}
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
