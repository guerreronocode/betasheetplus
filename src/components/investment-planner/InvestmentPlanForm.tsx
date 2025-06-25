import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, TrendingUp, Calendar, Target } from 'lucide-react';
import { InvestmentProfile, useInvestmentPlanner } from '@/hooks/useInvestmentPlanner';
import { formatCurrency } from '@/utils/formatters';

interface InvestmentPlanFormProps {
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

const InvestmentPlanForm: React.FC<InvestmentPlanFormProps> = ({
  profile,
  calculations
}) => {
  const { plan, saveAndGoToSummary, isSavingPlan, goToStep } = useInvestmentPlanner();

  const [shortTermAllocation, setShortTermAllocation] = useState(
    plan?.short_term_allocation || calculations.shortTermAllocation
  );
  const [mediumTermAllocation, setMediumTermAllocation] = useState(
    plan?.medium_term_allocation || calculations.mediumTermAllocation
  );
  const [longTermAllocation, setLongTermAllocation] = useState(
    plan?.long_term_allocation || calculations.longTermAllocation
  );

  // Garantir que as alocações somem 100%
  const totalAllocation = shortTermAllocation + mediumTermAllocation + longTermAllocation;
  
  const handleShortTermChange = (value: number[]) => {
    const newShort = value[0];
    const remaining = 100 - newShort;
    const mediumRatio = mediumTermAllocation / (mediumTermAllocation + longTermAllocation) || 0.5;
    
    setShortTermAllocation(newShort);
    setMediumTermAllocation(Math.round(remaining * mediumRatio));
    setLongTermAllocation(Math.round(remaining * (1 - mediumRatio)));
  };

  const handleMediumTermChange = (value: number[]) => {
    const newMedium = value[0];
    const remaining = 100 - newMedium;
    const shortRatio = shortTermAllocation / (shortTermAllocation + longTermAllocation) || 0.2;
    
    setMediumTermAllocation(newMedium);
    setShortTermAllocation(Math.round(remaining * shortRatio));
    setLongTermAllocation(Math.round(remaining * (1 - shortRatio)));
  };

  const handleLongTermChange = (value: number[]) => {
    const newLong = value[0];
    const remaining = 100 - newLong;
    const shortRatio = shortTermAllocation / (shortTermAllocation + mediumTermAllocation) || 0.3;
    
    setLongTermAllocation(newLong);
    setShortTermAllocation(Math.round(remaining * shortRatio));
    setMediumTermAllocation(Math.round(remaining * (1 - shortRatio)));
  };

  const handleFinalizePlanning = async () => {
    console.log('📝 Finalizando planejamento');
    
    if (!profile.id) {
      console.error('Profile ID is missing');
      return;
    }

    const planData = {
      profile_id: profile.id,
      emergency_reserve_target: plan?.emergency_reserve_target || calculations.emergencyReserveTarget,
      emergency_reserve_current: plan?.emergency_reserve_current || 0,
      short_term_allocation: shortTermAllocation,
      medium_term_allocation: mediumTermAllocation,
      long_term_allocation: longTermAllocation,
      monthly_investment_capacity: calculations.monthlyInvestmentCapacity,
      is_emergency_reserve_complete: plan?.is_emergency_reserve_complete || false,
    };

    try {
      await saveAndGoToSummary(planData);
    } catch (error) {
      console.error('❌ Erro ao finalizar planejamento:', error);
    }
  };

  const handleBackToReserve = () => {
    console.log('🔙 Voltando à reserva');
    goToStep('reserve');
  };

  const monthlyAmount = calculations.monthlyInvestmentCapacity;
  const shortTermAmount = (monthlyAmount * shortTermAllocation) / 100;
  const mediumTermAmount = (monthlyAmount * mediumTermAllocation) / 100;
  const longTermAmount = (monthlyAmount * longTermAllocation) / 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          📊 Plano de Alocação de Investimentos
        </h3>
        <p className="text-gray-600">
          Distribua seus investimentos por horizonte temporal
        </p>
      </div>

      {/* Capacidade de Investimento */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Capacidade Mensal</h4>
            <p className="text-sm text-gray-600">Valor disponível para investir</p>
          </div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-sm text-green-600 mb-1">Valor Mensal para Investir</div>
          <div className="text-2xl font-bold text-green-800">
            {formatCurrency(monthlyAmount)}
          </div>
          <p className="text-xs text-green-600 mt-1">
            Renda - Gastos = {formatCurrency(profile.monthly_income)} - {formatCurrency(profile.monthly_expenses)}
          </p>
        </div>
      </Card>

      {/* Alocação por Prazo */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Alocação por Prazo</h4>
            <p className="text-sm text-gray-600">Distribua conforme seus objetivos</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Curto Prazo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <Label className="text-sm font-medium">Curto Prazo (&lt; 2 anos)</Label>
              </div>
              <span className="text-sm font-semibold">{shortTermAllocation}%</span>
            </div>
            
            <Slider
              value={[shortTermAllocation]}
              onValueChange={handleShortTermChange}
              max={80}
              step={5}
              className="w-full"
            />
            
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>Liquidez alta, menor risco</span>
              <span className="font-semibold">{formatCurrency(shortTermAmount)}/mês</span>
            </div>
            
            <Progress value={shortTermAllocation} className="h-2" />
          </div>

          {/* Médio Prazo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <Label className="text-sm font-medium">Médio Prazo (2-5 anos)</Label>
              </div>
              <span className="text-sm font-semibold">{mediumTermAllocation}%</span>
            </div>
            
            <Slider
              value={[mediumTermAllocation]}
              onValueChange={handleMediumTermChange}
              max={60}
              step={5}
              className="w-full"
            />
            
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>Equilibrio risco/retorno</span>
              <span className="font-semibold">{formatCurrency(mediumTermAmount)}/mês</span>
            </div>
            
            <Progress value={mediumTermAllocation} className="h-2" />
          </div>

          {/* Longo Prazo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                <Label className="text-sm font-medium">Longo Prazo (&gt; 5 anos)</Label>
              </div>
              <span className="text-sm font-semibold">{longTermAllocation}%</span>
            </div>
            
            <Slider
              value={[longTermAllocation]}
              onValueChange={handleLongTermChange}
              max={90}
              step={5}
              className="w-full"
            />
            
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>Maior potencial de crescimento</span>
              <span className="font-semibold">{formatCurrency(longTermAmount)}/mês</span>
            </div>
            
            <Progress value={longTermAllocation} className="h-2" />
          </div>
        </div>

        {/* Verificação Total */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-800">Total Alocado:</span>
            <span className={`text-lg font-bold ${totalAllocation === 100 ? 'text-green-600' : 'text-red-600'}`}>
              {totalAllocation}%
            </span>
          </div>
          {totalAllocation !== 100 && (
            <p className="text-red-600 text-sm mt-2">
              ⚠️ A soma deve ser 100%. Ajuste as alocações.
            </p>
          )}
        </div>
      </Card>

      {/* Sugestões por Objetivos */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <h4 className="font-semibold text-purple-800 mb-4">📝 Seus Objetivos</h4>
        
        <div className="space-y-4 text-sm">
          {profile.short_term_goals && profile.short_term_goals.length > 0 && (
            <div>
              <span className="font-semibold text-blue-700">Curto Prazo:</span>
              <p className="text-blue-600 ml-2">{profile.short_term_goals.join(', ')}</p>
            </div>
          )}
          
          {profile.medium_term_goals && profile.medium_term_goals.length > 0 && (
            <div>
              <span className="font-semibold text-orange-700">Médio Prazo:</span>
              <p className="text-orange-600 ml-2">{profile.medium_term_goals.join(', ')}</p>
            </div>
          )}
          
          {profile.long_term_goals && profile.long_term_goals.length > 0 && (
            <div>
              <span className="font-semibold text-purple-700">Longo Prazo:</span>
              <p className="text-purple-600 ml-2">{profile.long_term_goals.join(', ')}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Botões Simplificados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={handleBackToReserve}
          className="flex items-center gap-2"
          disabled={isSavingPlan}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à Reserva
        </Button>
        
        <Button
          onClick={handleFinalizePlanning}
          className="bg-purple-600 hover:bg-purple-700"
          disabled={isSavingPlan || totalAllocation !== 100}
        >
          {isSavingPlan ? 'Salvando e Indo para Resumo...' : 'Finalizar Planejamento →'}
        </Button>
      </div>
    </div>
  );
};

export default InvestmentPlanForm;
