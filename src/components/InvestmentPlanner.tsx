import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Shield, Calculator } from 'lucide-react';
import { useInvestmentPlanner } from '@/hooks/useInvestmentPlanner';
import InvestmentProfileForm from './investment-planner/InvestmentProfileForm';
import EmergencyReserveCalculator from './investment-planner/EmergencyReserveCalculator';
import InvestmentPlanForm from './investment-planner/InvestmentPlanForm';
import InvestmentPlanSummary from './investment-planner/InvestmentPlanSummary';

const InvestmentPlanner: React.FC = () => {
  const {
    currentStep,
    goToStep,
    profile,
    plan,
    calculations,
    isLoading,
    error,
    hasProfile,
    hasPlan,
    isEmergencyReserveComplete
  } = useInvestmentPlanner();

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando seu planejamento...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-red-200">
        <div className="text-red-500 mb-4">❌ Erro ao carregar planejamento</div>
        <p className="text-gray-600 text-sm">{error.message}</p>
      </Card>
    );
  }

  const getStepStatus = (step: string) => {
    if (step === 'profile') return hasProfile ? 'completed' : 'current';
    if (step === 'reserve') return hasPlan && isEmergencyReserveComplete ? 'completed' : hasProfile ? 'current' : 'pending';
    if (step === 'plan') return hasPlan ? 'completed' : hasProfile ? 'current' : 'pending';
    if (step === 'summary') return hasPlan ? 'current' : 'pending';
    return 'pending';
  };

  const getStepIcon = (step: string, status: string) => {
    const iconClass = `w-6 h-6 ${
      status === 'completed' ? 'text-green-600' : 
      status === 'current' ? 'text-blue-600' : 
      'text-gray-400'
    }`;

    switch (step) {
      case 'profile': return <Target className={iconClass} />;
      case 'reserve': return <Shield className={iconClass} />;
      case 'plan': return <TrendingUp className={iconClass} />;
      case 'summary': return <Calculator className={iconClass} />;
      default: return null;
    }
  };

  // Renderização simplificada por step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'profile':
        return <InvestmentProfileForm />;
      
      case 'reserve':
        if (profile && calculations) {
          return (
            <EmergencyReserveCalculator 
              profile={profile}
              calculations={calculations}
            />
          );
        }
        return <div>Carregando dados do perfil...</div>;
      
      case 'plan':
        if (profile && calculations) {
          return (
            <InvestmentPlanForm 
              profile={profile}
              calculations={calculations}
            />
          );
        }
        return <div>Carregando dados do perfil...</div>;
      
      case 'summary':
        if (profile && plan) {
          return (
            <InvestmentPlanSummary 
              profile={profile}
              plan={plan}
            />
          );
        }
        return <div>Carregando dados do plano...</div>;
      
      default:
        return <InvestmentProfileForm />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🚀 Planejador de Investimento Progressivo
        </h2>
        <p className="text-gray-600">
          Construa seu patrimônio de forma estruturada e inteligente
        </p>
      </div>

      {/* Progress Steps */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          {[
            { key: 'profile', label: 'Perfil', description: 'Diagnóstico financeiro' },
            { key: 'reserve', label: 'Reserva', description: 'Emergência calculada' },
            { key: 'plan', label: 'Plano', description: 'Alocação por prazo' },
            { key: 'summary', label: 'Acompanhamento', description: 'Metas ativas' },
          ].map((step, index) => {
            const status = getStepStatus(step.key);
            const isCurrentStep = currentStep === step.key;
            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div className={`p-3 rounded-full border-2 mb-2 cursor-pointer transition-all ${
                  isCurrentStep ? 'bg-blue-200 border-blue-500 ring-2 ring-blue-300' :
                  status === 'completed' ? 'bg-green-100 border-green-300 hover:bg-green-200' :
                  status === 'current' ? 'bg-blue-100 border-blue-300 hover:bg-blue-200' :
                  'bg-gray-100 border-gray-300'
                }`}
                onClick={() => {
                  // Permitir navegação para steps já acessíveis
                  if (step.key === 'profile' || 
                      (step.key === 'reserve' && hasProfile) ||
                      (step.key === 'plan' && hasProfile) ||
                      (step.key === 'summary' && hasPlan)) {
                    goToStep(step.key as any);
                  }
                }}
                >
                  {getStepIcon(step.key, status)}
                </div>
                <div className="text-center">
                  <div className={`font-semibold text-sm ${
                    isCurrentStep ? 'text-blue-800' :
                    status === 'completed' ? 'text-green-800' :
                    status === 'current' ? 'text-blue-800' :
                    'text-gray-500'
                  }`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Progress Bar */}
        <div className="relative">
          <Progress 
            value={
              currentStep === 'profile' ? 25 :
              currentStep === 'reserve' ? 50 :
              currentStep === 'plan' ? 75 : 100
            } 
            className="h-2"
          />
        </div>
      </Card>

      {/* Step Content */}
      <div>
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default InvestmentPlanner;
