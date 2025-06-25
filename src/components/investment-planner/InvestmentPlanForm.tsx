
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, PieChart, Calculator, ArrowLeft } from 'lucide-react';
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
  const { plan, savePlan, isSavingPlan, setCurrentStep } = useInvestmentPlanner();
  
  const [allocations, setAllocations] = useState({
    short_term: calculations.shortTermAllocation,
    medium_term: calculations.mediumTermAllocation,
    long_term: calculations.longTermAllocation,
  });

  const [monthlyValues, setMonthlyValues] = useState({
    short_term: (calculations.monthlyInvestmentCapacity * allocations.short_term) / 100,
    medium_term: (calculations.monthlyInvestmentCapacity * allocations.medium_term) / 100,
    long_term: (calculations.monthlyInvestmentCapacity * allocations.long_term) / 100,
  });

  const handleAllocationChange = (type: 'short_term' | 'medium_term' | 'long_term', value: number) => {
    const newAllocations = { ...allocations, [type]: value };
    
    // Garantir que a soma seja 100%
    const total = Object.values(newAllocations).reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      // Ajustar proporcionalmente os outros valores
      const others = Object.keys(newAllocations).filter(key => key !== type) as Array<keyof typeof newAllocations>;
      const remainingPercentage = 100 - value;
      const currentOthersTotal = others.reduce((sum, key) => sum + newAllocations[key], 0);
      
      if (currentOthersTotal > 0) {
        others.forEach(key => {
          newAllocations[key] = (newAllocations[key] / currentOthersTotal) * remainingPercentage;
        });
      }
    }
    
    setAllocations(newAllocations);
    
    // Recalcular valores mensais
    const newMonthlyValues = {
      short_term: (calculations.monthlyInvestmentCapacity * newAllocations.short_term) / 100,
      medium_term: (calculations.monthlyInvestmentCapacity * newAllocations.medium_term) / 100,
      long_term: (calculations.monthlyInvestmentCapacity * newAllocations.long_term) / 100,
    };
    setMonthlyValues(newMonthlyValues);
  };

  const handleSubmit = () => {
    if (!profile.id) {
      console.error('Profile ID is missing');
      return;
    }

    const planData = {
      profile_id: profile.id,
      emergency_reserve_target: calculations.emergencyReserveTarget,
      emergency_reserve_current: plan?.emergency_reserve_current || 0,
      short_term_allocation: allocations.short_term,
      medium_term_allocation: allocations.medium_term,
      long_term_allocation: allocations.long_term,
      monthly_investment_capacity: calculations.monthlyInvestmentCapacity,
      is_emergency_reserve_complete: plan?.is_emergency_reserve_complete || false,
    };

    console.log('Submitting plan data:', planData);
    savePlan(planData);
  };

  const getRecommendationForTerm = (term: 'short' | 'medium' | 'long') => {
    const termGoals = profile[`${term}_term_goals`];
    if (!termGoals || termGoals.length === 0) return null;

    return {
      goals: termGoals,
      suggestions: term === 'short' 
        ? ['Liquidez diária', 'Baixo risco', 'Proteção contra inflação']
        : term === 'medium'
        ? ['Renda fixa', 'Proteção IPCA', 'Prazo determinado']
        : ['Renda variável', 'Fundos de índice', 'Crescimento a longo prazo']
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          📊 Plano de Investimento por Prazo
        </h3>
        <p className="text-gray-600">
          Distribua seus investimentos de acordo com seus objetivos
        </p>
      </div>

      {/* Resumo Disponível */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Capacidade Mensal</h4>
            <p className="text-sm text-gray-600">
              Valor disponível para investimentos
            </p>
          </div>
        </div>

        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(calculations.monthlyInvestmentCapacity)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            por mês para investir
          </div>
        </div>
      </Card>

      {/* Alocação por Prazo */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <PieChart className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Distribuição Estratégica</h4>
            <p className="text-sm text-gray-600">
              Ajuste os percentuais conforme seus objetivos
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Curto Prazo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-blue-800">📅 Curto Prazo (&lt; 2 anos)</h5>
                <p className="text-sm text-blue-600">Liquidez e oportunidades</p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                {allocations.short_term.toFixed(1)}%
              </Badge>
            </div>
            
            <Slider
              value={[allocations.short_term]}
              onValueChange={([value]) => handleAllocationChange('short_term', value)}
              max={100}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {formatCurrency(monthlyValues.short_term)}/mês
              </span>
              {getRecommendationForTerm('short') && (
                <div className="flex flex-wrap gap-1">
                  {getRecommendationForTerm('short')!.suggestions.slice(0, 2).map((suggestion, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {getRecommendationForTerm('short')?.goals && (
              <div className="text-sm text-gray-600">
                <strong>Seus objetivos:</strong> {getRecommendationForTerm('short')!.goals.join(', ')}
              </div>
            )}
          </div>

          {/* Médio Prazo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-orange-800">🏗️ Médio Prazo (2-5 anos)</h5>
                <p className="text-sm text-orange-600">Projetos e aquisições</p>
              </div>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                {allocations.medium_term.toFixed(1)}%
              </Badge>
            </div>
            
            <Slider
              value={[allocations.medium_term]}
              onValueChange={([value]) => handleAllocationChange('medium_term', value)}
              max={100}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {formatCurrency(monthlyValues.medium_term)}/mês
              </span>
              {getRecommendationForTerm('medium') && (
                <div className="flex flex-wrap gap-1">
                  {getRecommendationForTerm('medium')!.suggestions.slice(0, 2).map((suggestion, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {getRecommendationForTerm('medium')?.goals && (
              <div className="text-sm text-gray-600">
                <strong>Seus objetivos:</strong> {getRecommendationForTerm('medium')!.goals.join(', ')}
              </div>
            )}
          </div>

          {/* Longo Prazo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-green-800">🚀 Longo Prazo (&gt; 5 anos)</h5>
                <p className="text-sm text-green-600">Aposentadoria e liberdade financeira</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                {allocations.long_term.toFixed(1)}%
              </Badge>
            </div>
            
            <Slider
              value={[allocations.long_term]}
              onValueChange={([value]) => handleAllocationChange('long_term', value)}
              max={100}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {formatCurrency(monthlyValues.long_term)}/mês
              </span>
              {getRecommendationForTerm('long') && (
                <div className="flex flex-wrap gap-1">
                  {getRecommendationForTerm('long')!.suggestions.slice(0, 2).map((suggestion, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {getRecommendationForTerm('long')?.goals && (
              <div className="text-sm text-gray-600">
                <strong>Seus objetivos:</strong> {getRecommendationForTerm('long')!.goals.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Resumo Total */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">Total Alocado:</span>
            <span className="font-bold text-gray-900">
              {(allocations.short_term + allocations.medium_term + allocations.long_term).toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>

      {/* Recomendações por Perfil */}
      <Card className="p-6 border-purple-200 bg-purple-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-purple-800">
              Recomendação para Perfil {profile.risk_profile === 'conservative' ? 'Conservador' : 
                                       profile.risk_profile === 'moderate' ? 'Moderado' : 'Agressivo'}
            </h4>
            <p className="text-sm text-purple-600">
              Sugestões baseadas no seu perfil de risco
            </p>
          </div>
        </div>

        <div className="text-sm text-purple-700">
          {profile.risk_profile === 'conservative' && (
            <p>
              <strong>Foco na segurança:</strong> Priorize investimentos de baixo risco que protejam 
              contra a inflação e mantenha maior alocação no curto e médio prazo para ter flexibilidade.
            </p>
          )}
          {profile.risk_profile === 'moderate' && (
            <p>
              <strong>Equilibrio ideal:</strong> Combine investimentos de baixo risco para estabilidade 
              e alguns de maior potencial para crescimento, especialmente no longo prazo.
            </p>
          )}
          {profile.risk_profile === 'aggressive' && (
            <p>
              <strong>Foco no crescimento:</strong> Maximize a alocação no longo prazo com investimentos 
              de maior potencial de retorno, mantendo o essencial para emergências.
            </p>
          )}
        </div>
      </Card>

      {/* Ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => {
            console.log('Navigating back to reserve');
            setCurrentStep('reserve');
          }}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à Reserva
        </Button>
        
        <Button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700"
          disabled={isSavingPlan}
        >
          {isSavingPlan ? 'Salvando...' : 'Finalizar Planejamento →'}
        </Button>
      </div>
    </div>
  );
};

export default InvestmentPlanForm;
