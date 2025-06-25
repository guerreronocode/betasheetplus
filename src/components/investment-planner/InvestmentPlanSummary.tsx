import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  TrendingUp, 
  Shield, 
  Calendar,
  Target
} from 'lucide-react';
import { InvestmentProfile, InvestmentPlan } from '@/hooks/useInvestmentPlanner';
import { formatCurrency } from '@/utils/formatters';

interface InvestmentPlanSummaryProps {
  profile: InvestmentProfile;
  plan: InvestmentPlan;
}

const InvestmentPlanSummary: React.FC<InvestmentPlanSummaryProps> = ({
  profile,
  plan
}) => {
  const reserveProgress = plan.emergency_reserve_current > 0 
    ? (plan.emergency_reserve_current / plan.emergency_reserve_target) * 100 
    : 0;

  const monthlyAmount = plan.monthly_investment_capacity;
  const shortTermAmount = (monthlyAmount * plan.short_term_allocation) / 100;
  const mediumTermAmount = (monthlyAmount * plan.medium_term_allocation) / 100;
  const longTermAmount = (monthlyAmount * plan.long_term_allocation) / 100;

  return (
    <div className="space-y-6">
      {/* Instrução para o usuário */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle className="w-5 h-5" />
          <div>
            <p className="text-sm font-medium">🎯 Seu plano está pronto!</p>
            <p className="text-xs text-green-600 mt-1">
              Use os painéis superiores para navegar e editar qualquer etapa
            </p>
          </div>
        </div>
      </Card>

      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          🎯 Seu Plano de Investimento
        </h3>
        <p className="text-gray-600">
          Acompanhe seu progresso e mantenha-se no caminho certo
        </p>
      </div>

      {/* Status da Reserva de Emergência */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Shield className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">Reserva de Emergência</h4>
            <p className="text-sm text-gray-600">Sua base de segurança financeira</p>
          </div>
          <Badge variant={plan.is_emergency_reserve_complete ? "default" : "secondary"}>
            {plan.is_emergency_reserve_complete ? "✅ Completa" : "🏗️ Em construção"}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Progresso</span>
            <span className="text-sm font-semibold text-gray-900">
              {Math.min(100, reserveProgress).toFixed(1)}%
            </span>
          </div>
          
          <Progress value={Math.min(100, reserveProgress)} className="h-3" />
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Atual: {formatCurrency(plan.emergency_reserve_current)}</span>
            <span className="text-gray-600">Meta: {formatCurrency(plan.emergency_reserve_target)}</span>
          </div>

          {!plan.is_emergency_reserve_complete && (
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-700">
                <strong>Faltam:</strong> {formatCurrency(plan.emergency_reserve_target - plan.emergency_reserve_current)}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Continue priorizando a reserva antes de investir agressivamente
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Alocação de Investimentos */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Alocação Mensal</h4>
            <p className="text-sm text-gray-600">Distribuição dos seus {formatCurrency(monthlyAmount)}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Curto Prazo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Curto Prazo (&lt; 2 anos)</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{plan.short_term_allocation}%</div>
                <div className="text-xs text-gray-600">{formatCurrency(shortTermAmount)}</div>
              </div>
            </div>
            <Progress value={plan.short_term_allocation} className="h-2" />
            {profile.short_term_goals && profile.short_term_goals.length > 0 && (
              <p className="text-xs text-gray-600">
                Objetivos: {profile.short_term_goals.join(', ')}
              </p>
            )}
          </div>

          {/* Médio Prazo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Médio Prazo (2-5 anos)</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{plan.medium_term_allocation}%</div>
                <div className="text-xs text-gray-600">{formatCurrency(mediumTermAmount)}</div>
              </div>
            </div>
            <Progress value={plan.medium_term_allocation} className="h-2" />
            {profile.medium_term_goals && profile.medium_term_goals.length > 0 && (
              <p className="text-xs text-gray-600">
                Objetivos: {profile.medium_term_goals.join(', ')}
              </p>
            )}
          </div>

          {/* Longo Prazo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Longo Prazo (&gt; 5 anos)</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{plan.long_term_allocation}%</div>
                <div className="text-xs text-gray-600">{formatCurrency(longTermAmount)}</div>
              </div>
            </div>
            <Progress value={plan.long_term_allocation} className="h-2" />
            {profile.long_term_goals && profile.long_term_goals.length > 0 && (
              <p className="text-xs text-gray-600">
                Objetivos: {profile.long_term_goals.join(', ')}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Próximos Passos */}
      <Card className="p-6 border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-green-800">Próximos Passos</h4>
            <p className="text-sm text-green-600">Para colocar seu plano em ação</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-green-700">
          <div className="flex items-start gap-2">
            <span className="text-green-500">1️⃣</span>
            <span>Configure transferências automáticas para cada objetivo</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500">2️⃣</span>
            <span>Escolha produtos de investimento adequados para cada prazo</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500">3️⃣</span>
            <span>Revise mensalmente e ajuste conforme necessário</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500">4️⃣</span>
            <span>Mantenha disciplina e foco nos objetivos de longo prazo</span>
          </div>
        </div>
      </Card>

      {/* Perfil Resumido */}
      <Card className="p-6 bg-gray-50">
        <h4 className="font-semibold text-gray-800 mb-4">📋 Resumo do Perfil</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Idade:</span>
            <span className="ml-2 text-gray-600">{profile.age} anos</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Perfil de Risco:</span>
            <span className="ml-2 text-gray-600 capitalize">{profile.risk_profile}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Situação Profissional:</span>
            <span className="ml-2 text-gray-600 capitalize">{profile.employment_type}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Sobra Mensal:</span>
            <span className="ml-2 text-gray-600">{formatCurrency(plan.monthly_investment_capacity)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvestmentPlanSummary;
