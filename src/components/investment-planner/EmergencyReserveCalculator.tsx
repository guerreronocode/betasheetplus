
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shield, Calculator, Target, TrendingUp } from 'lucide-react';
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
    : Math.ceil((calculations.emergencyReserveTarget - currentReserve) / calculations.monthlyInvestmentCapacity);

  const handleSubmit = () => {
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

  const getReserveRecommendation = () => {
    if (profile.organization_level === 'no_reserve') {
      return {
        title: '🚨 Prioridade Máxima',
        description: 'Construa sua reserva antes de qualquer investimento',
        color: 'red',
        advice: 'Dedique 80% da sua sobra mensal para a reserva de emergência'
      };
    } else if (profile.organization_level === 'building_reserve') {
      return {
        title: '🏗️ Continue Construindo',
        description: 'Você está no caminho certo, continue!',
        color: 'orange',
        advice: 'Mantenha 60% da sobra para a reserva e 40% para investimentos'
      };
    } else {
      return {
        title: '✅ Reserva Completa',
        description: 'Parabéns! Agora foque nos investimentos',
        color: 'green',
        advice: 'Destine apenas 20% para manutenção da reserva'
      };
    }
  };

  const recommendation = getReserveRecommendation();

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
              Baseado no seu perfil e gastos mensais
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
            💡 Por que {calculations.emergencyReserveMultiplier} meses?
          </h5>
          <div className="text-sm text-gray-700">
            {profile.organization_level === 'no_reserve' && profile.risk_profile === 'aggressive' ? (
              <p>Como você ainda não tem reserva e tem perfil empreendedor, recomendamos 18 meses para maior segurança em cenários de renda variável.</p>
            ) : profile.organization_level === 'no_reserve' ? (
              <p>Para quem está começando, 12 meses oferece segurança adequada para imprevistos e mudanças no emprego.</p>
            ) : (
              <p>6 meses é o padrão para quem tem estabilidade no emprego e já possui alguma organização financeira.</p>
            )}
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

      {/* Recomendação Estratégica */}
      <Card className={`p-6 border-2 border-${recommendation.color}-200 bg-${recommendation.color}-50`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 bg-${recommendation.color}-100 rounded-lg`}>
            <Target className={`w-6 h-6 text-${recommendation.color}-600`} />
          </div>
          <div>
            <h4 className={`font-semibold text-${recommendation.color}-800`}>
              {recommendation.title}
            </h4>
            <p className={`text-sm text-${recommendation.color}-600`}>
              {recommendation.description}
            </p>
          </div>
        </div>

        <div className={`p-4 bg-${recommendation.color}-100 rounded-lg`}>
          <div className={`font-semibold text-${recommendation.color}-800 mb-2`}>
            📋 Nossa Recomendação:
          </div>
          <p className={`text-${recommendation.color}-700`}>
            {recommendation.advice}
          </p>
        </div>

        {!isReserveComplete && (
          <div className="mt-4 p-4 bg-white bg-opacity-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">
                Faltam: {formatCurrency(calculations.emergencyReserveTarget - currentReserve)}
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

      {/* Próximos Passos */}
      <Card className="p-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-800">Próximos Passos</h4>
            <p className="text-sm text-blue-600">
              Como estruturar seus investimentos
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-blue-700">
          <div className="flex items-start gap-2">
            <span className="text-blue-500">1️⃣</span>
            <span>Configure uma conta poupança ou CDB de liquidez diária para a reserva</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">2️⃣</span>
            <span>Transfira automaticamente todo mês para a reserva</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">3️⃣</span>
            <span>Só use a reserva para emergências REAIS (não para oportunidades)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">4️⃣</span>
            <span>Quando a reserva estiver completa, redirecione o valor para investimentos</span>
          </div>
        </div>
      </Card>

      {/* Ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('profile')}
          className="flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
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
