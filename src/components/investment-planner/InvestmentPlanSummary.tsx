
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, TrendingUp, Calendar, Shield, PieChart, Edit } from 'lucide-react';
import { InvestmentProfile, InvestmentPlan, useInvestmentPlanner } from '@/hooks/useInvestmentPlanner';
import { formatCurrency } from '@/utils/formatters';

interface InvestmentPlanSummaryProps {
  profile: InvestmentProfile;
  plan: InvestmentPlan;
}

const InvestmentPlanSummary: React.FC<InvestmentPlanSummaryProps> = ({
  profile,
  plan
}) => {
  const { setCurrentStep } = useInvestmentPlanner();

  const emergencyReserveProgress = plan.emergency_reserve_current > 0 
    ? (plan.emergency_reserve_current / plan.emergency_reserve_target) * 100 
    : 0;

  const allocationData = [
    {
      label: 'Curto Prazo',
      percentage: plan.short_term_allocation,
      value: (plan.monthly_investment_capacity * plan.short_term_allocation) / 100,
      color: 'blue',
      icon: '📅',
      goals: profile.short_term_goals || []
    },
    {
      label: 'Médio Prazo',
      percentage: plan.medium_term_allocation,
      value: (plan.monthly_investment_capacity * plan.medium_term_allocation) / 100,
      color: 'orange',
      icon: '🏗️',
      goals: profile.medium_term_goals || []
    },
    {
      label: 'Longo Prazo',
      percentage: plan.long_term_allocation,
      value: (plan.monthly_investment_capacity * plan.long_term_allocation) / 100,
      color: 'green',
      icon: '🚀',
      goals: profile.long_term_goals || []
    }
  ];

  const getProfileBadge = () => {
    const profiles = {
      conservative: { label: 'Conservador', icon: '🛡️', color: 'blue' },
      moderate: { label: 'Moderado', icon: '⚖️', color: 'orange' },
      aggressive: { label: 'Agressivo', icon: '🚀', color: 'red' }
    };
    return profiles[profile.risk_profile] || profiles.moderate;
  };

  const getEmploymentBadge = () => {
    const types = {
      clt: { label: 'CLT', icon: '👥' },
      civil_servant: { label: 'Concursado', icon: '🏛️' },
      freelancer: { label: 'Freelancer', icon: '💻' },
      entrepreneur: { label: 'Empreendedor', icon: '🚀' }
    };
    return types[profile.employment_type] || types.clt;
  };

  const profileInfo = getProfileBadge();
  const employmentInfo = getEmploymentBadge();

  return (
    <div className="space-y-6">
      {/* Header de Sucesso */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          🎉 Seu Plano Está Pronto!
        </h3>
        <p className="text-gray-600">
          Agora é hora de colocar em prática e acompanhar seu progresso
        </p>
      </div>

      {/* Resumo do Perfil */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Seu Perfil Financeiro</h4>
            <p className="text-sm text-gray-600">
              Resumo das suas características
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Idade</div>
            <div className="text-xl font-bold text-gray-900">{profile.age} anos</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 mb-1">Trabalho</div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              {employmentInfo.icon} {employmentInfo.label}
            </Badge>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-purple-600 mb-1">Perfil</div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
              {profileInfo.icon} {profileInfo.label}
            </Badge>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Renda Mensal</div>
            <div className="text-lg font-bold text-blue-800">
              {formatCurrency(profile.monthly_income)}
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 mb-1">Capacidade</div>
            <div className="text-lg font-bold text-green-800">
              {formatCurrency(plan.monthly_investment_capacity)}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="font-semibold text-gray-800 mb-2">🎯 Objetivo Principal:</div>
          <p className="text-gray-700">{profile.main_objective}</p>
        </div>
      </Card>

      {/* Status da Reserva de Emergência */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Shield className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Reserva de Emergência</h4>
            <p className="text-sm text-gray-600">
              Sua base de segurança financeira
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Progresso da Reserva
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {Math.min(100, emergencyReserveProgress).toFixed(1)}%
            </span>
          </div>
          
          <Progress value={Math.min(100, emergencyReserveProgress)} className="h-3" />
          
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>{formatCurrency(plan.emergency_reserve_current)}</span>
            <span>{formatCurrency(plan.emergency_reserve_target)}</span>
          </div>

          {plan.is_emergency_reserve_complete ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">✅ Reserva Completa!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Parabéns! Sua segurança financeira está garantida.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-800">
                  Faltam {formatCurrency(Math.max(0, plan.emergency_reserve_target - plan.emergency_reserve_current))}
                </span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                Continue priorizando a reserva junto com seus investimentos.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Plano de Alocação */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <PieChart className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Seu Plano de Investimento</h4>
            <p className="text-sm text-gray-600">
              Distribuição mensal recomendada
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {allocationData.map((allocation, index) => (
            <div key={index} className="p-4 border-2 border-gray-200 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{allocation.icon}</span>
                  <div>
                    <h5 className="font-semibold text-gray-800">
                      {allocation.label}
                    </h5>
                    <p className="text-sm text-gray-600">
                      {allocation.percentage.toFixed(1)}% • {formatCurrency(allocation.value)}/mês
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-white text-gray-700 border-gray-300">
                  {allocation.percentage.toFixed(1)}%
                </Badge>
              </div>

              {allocation.goals.length > 0 && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Seus objetivos:</strong>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allocation.goals.map((goal, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">Total Mensal:</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(plan.monthly_investment_capacity)}
            </span>
          </div>
        </div>
      </Card>

      {/* Próximos Passos */}
      <Card className="p-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-800">Próximos Passos</h4>
            <p className="text-sm text-blue-600">
              Como começar a investir hoje mesmo
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-blue-700">
          <div className="flex items-start gap-2">
            <span className="text-blue-500">1️⃣</span>
            <span>Abra conta em uma corretora de confiança</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">2️⃣</span>
            <span>Configure transferências automáticas mensais conforme seu plano</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">3️⃣</span>
            <span>Comece com investimentos adequados ao seu perfil e objetivos</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500">4️⃣</span>
            <span>Acompanhe seu progresso mensalmente e ajuste conforme necessário</span>
          </div>
        </div>
      </Card>

      {/* Ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => {
            console.log('Navigating to profile');
            setCurrentStep('profile');
          }}
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Ajustar Perfil
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {
            console.log('Navigating to plan');
            setCurrentStep('plan');
          }}
          className="flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Revisar Alocação
        </Button>
      </div>

      {/* Concluir */}
      <Card className="p-6 text-center">
        <div className="text-lg font-semibold text-gray-900 mb-2">
          🎯 Seu planejamento está ativo!
        </div>
        <p className="text-gray-600 mb-4">
          Continue acompanhando seu progresso na aba de objetivos e metas.
        </p>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          ✅ Plano Concluído
        </Badge>
      </Card>
    </div>
  );
};

export default InvestmentPlanSummary;
