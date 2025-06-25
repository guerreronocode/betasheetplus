import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User, Target, TrendingUp, Shield, Briefcase } from 'lucide-react';
import { InvestmentProfile, useInvestmentPlanner } from '@/hooks/useInvestmentPlanner';
import { formatCurrency } from '@/utils/formatters';

interface ProfileFormData {
  age: number;
  main_objective: string;
  risk_profile: 'conservative' | 'moderate' | 'aggressive';
  organization_level: 'no_reserve' | 'building_reserve' | 'reserve_completed';
  employment_type: 'clt' | 'civil_servant' | 'freelancer' | 'entrepreneur';
  monthly_income: number;
  monthly_expenses: number;
  short_term_goals: string;
  medium_term_goals: string;
  long_term_goals: string;
}

const InvestmentProfileForm: React.FC = () => {
  const { profile, saveProfileAndNavigate, isSavingProfile } = useInvestmentPlanner();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      age: profile?.age || 25,
      main_objective: profile?.main_objective || '',
      risk_profile: profile?.risk_profile || 'moderate',
      organization_level: profile?.organization_level || 'no_reserve',
      employment_type: profile?.employment_type || 'clt',
      monthly_income: profile?.monthly_income || 0,
      monthly_expenses: profile?.monthly_expenses || 0,
      short_term_goals: profile?.short_term_goals?.join(', ') || '',
      medium_term_goals: profile?.medium_term_goals?.join(', ') || '',
      long_term_goals: profile?.long_term_goals?.join(', ') || ''
    }
  });

  const watchedValues = watch();
  const monthlyBalance = watchedValues.monthly_income - watchedValues.monthly_expenses;

  const onSubmit = (data: ProfileFormData) => {
    const profileData = {
      ...data,
      short_term_goals: data.short_term_goals.split(',').map(s => s.trim()).filter(Boolean),
      medium_term_goals: data.medium_term_goals.split(',').map(s => s.trim()).filter(Boolean),
      long_term_goals: data.long_term_goals.split(',').map(s => s.trim()).filter(Boolean)
    };

    console.log('Form submitted, calling saveProfileAndNavigate');
    saveProfileAndNavigate(profileData);
  };

  const getRiskProfileInfo = (type: string) => {
    const profiles = {
      conservative: {
        label: 'Conservador',
        icon: '🛡️',
        description: 'Priorizo segurança e estabilidade',
        color: 'blue'
      },
      moderate: {
        label: 'Moderado',
        icon: '⚖️',
        description: 'Equilibro entre segurança e crescimento',
        color: 'orange'
      },
      aggressive: {
        label: 'Agressivo',
        icon: '🚀',
        description: 'Busco maior crescimento, aceito mais riscos',
        color: 'red'
      }
    };
    return profiles[type as keyof typeof profiles];
  };

  const getEmploymentTypeInfo = (type: string) => {
    const types = {
      clt: {
        label: 'CLT',
        icon: '👥',
        description: 'Carteira assinada',
        reserveMonths: '6-12 meses'
      },
      civil_servant: {
        label: 'Concursado',
        icon: '🏛️',
        description: 'Servidor público',
        reserveMonths: '6 meses'
      },
      freelancer: {
        label: 'Freelancer',
        icon: '💻',
        description: 'Trabalho autônomo',
        reserveMonths: '18 meses'
      },
      entrepreneur: {
        label: 'Empreendedor',
        icon: '🚀',
        description: 'Negócio próprio',
        reserveMonths: '18 meses'
      }
    };
    return types[type as keyof typeof types];
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          👤 Perfil Financeiro
        </h3>
        <p className="text-gray-600">
          Vamos conhecer sua situação atual para criar um plano personalizado
        </p>
      </div>

      {/* Informações Básicas */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Informações Básicas</h4>
            <p className="text-sm text-gray-600">Conte-nos sobre você</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="age">Idade *</Label>
            <Input
              id="age"
              type="number"
              {...register('age', { required: 'Idade é obrigatória', min: 18, max: 100 })}
              className="mt-1"
            />
            {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="main_objective">Objetivo Principal *</Label>
            <Textarea
              id="main_objective"
              {...register('main_objective', { required: 'Objetivo é obrigatório' })}
              placeholder="Ex: Construir reserva de emergência e investir para aposentadoria"
              className="mt-1"
              rows={3}
            />
            {errors.main_objective && <p className="text-red-500 text-sm mt-1">{errors.main_objective.message}</p>}
          </div>
        </div>
      </Card>

      {/* Situação Profissional */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Briefcase className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Situação Profissional</h4>
            <p className="text-sm text-gray-600">Seu tipo de trabalho impacta a reserva de emergência</p>
          </div>
        </div>

        <RadioGroup
          value={watchedValues.employment_type}
          onValueChange={(value) => setValue('employment_type', value as any)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {['clt', 'civil_servant', 'freelancer', 'entrepreneur'].map((type) => {
            const info = getEmploymentTypeInfo(type);
            return (
              <div key={type} className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <RadioGroupItem value={type} id={type} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={type} className="cursor-pointer">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <span>{info.icon}</span>
                      {info.label}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      Reserva: {info.reserveMonths}
                    </Badge>
                  </Label>
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </Card>

      {/* Situação Financeira */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Situação Financeira</h4>
            <p className="text-sm text-gray-600">Suas receitas e despesas mensais</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="monthly_income">Renda Mensal Líquida *</Label>
            <Input
              id="monthly_income"
              type="number"
              step="0.01"
              {...register('monthly_income', { required: 'Renda é obrigatória', min: 0 })}
              className="mt-1"
              placeholder="0,00"
            />
            {errors.monthly_income && <p className="text-red-500 text-sm mt-1">{errors.monthly_income.message}</p>}
          </div>

          <div>
            <Label htmlFor="monthly_expenses">Gastos Mensais *</Label>
            <Input
              id="monthly_expenses"
              type="number"
              step="0.01"
              {...register('monthly_expenses', { required: 'Gastos são obrigatórios', min: 0 })}
              className="mt-1"
              placeholder="0,00"
            />
            {errors.monthly_expenses && <p className="text-red-500 text-sm mt-1">{errors.monthly_expenses.message}</p>}
          </div>
        </div>

        {/* Saldo Mensal */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">Sobra Mensal:</span>
            <span className={`text-xl font-bold ${monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(monthlyBalance)}
            </span>
          </div>
          {monthlyBalance < 0 && (
            <p className="text-red-600 text-sm mt-2">
              ⚠️ Suas despesas estão maiores que a renda. Revise seu orçamento antes de investir.
            </p>
          )}
        </div>
      </Card>

      {/* Perfil de Risco */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Perfil de Risco</h4>
            <p className="text-sm text-gray-600">Como você se relaciona com investimentos?</p>
          </div>
        </div>

        <RadioGroup
          value={watchedValues.risk_profile}
          onValueChange={(value) => setValue('risk_profile', value as any)}
          className="space-y-4"
        >
          {['conservative', 'moderate', 'aggressive'].map((type) => {
            const info = getRiskProfileInfo(type);
            return (
              <div key={type} className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <RadioGroupItem value={type} id={type} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={type} className="cursor-pointer">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <span>{info.icon}</span>
                      {info.label}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                  </Label>
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </Card>

      {/* Reserva de Emergência */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Shield className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Reserva de Emergência</h4>
            <p className="text-sm text-gray-600">Qual é sua situação atual?</p>
          </div>
        </div>

        <RadioGroup
          value={watchedValues.organization_level}
          onValueChange={(value) => setValue('organization_level', value as any)}
          className="space-y-4"
        >
          <div className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
            <RadioGroupItem value="no_reserve" id="no_reserve" className="mt-1" />
            <Label htmlFor="no_reserve" className="cursor-pointer flex-1">
              <div className="font-semibold text-gray-900">🚨 Não tenho reserva</div>
              <p className="text-sm text-gray-600 mt-1">Preciso começar do zero</p>
            </Label>
          </div>

          <div className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
            <RadioGroupItem value="building_reserve" id="building_reserve" className="mt-1" />
            <Label htmlFor="building_reserve" className="cursor-pointer flex-1">
              <div className="font-semibold text-gray-900">🏗️ Construindo reserva</div>
              <p className="text-sm text-gray-600 mt-1">Já comecei mas ainda não completei</p>
            </Label>
          </div>

          <div className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
            <RadioGroupItem value="reserve_completed" id="reserve_completed" className="mt-1" />
            <Label htmlFor="reserve_completed" className="cursor-pointer flex-1">
              <div className="font-semibold text-gray-900">✅ Reserva completa</div>
              <p className="text-sm text-gray-600 mt-1">Tenho a reserva adequada para meu perfil</p>
            </Label>
          </div>
        </RadioGroup>
      </Card>

      {/* Objetivos por Prazo */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Objetivos por Prazo</h4>
            <p className="text-sm text-gray-600">Quais são seus sonhos e metas?</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="short_term_goals">Curto Prazo (&lt; 2 anos)</Label>
            <Input
              id="short_term_goals"
              {...register('short_term_goals')}
              placeholder="Ex: Viagem, curso, emergência médica"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Separe múltiplos objetivos por vírgula</p>
          </div>

          <div>
            <Label htmlFor="medium_term_goals">Médio Prazo (2-5 anos)</Label>
            <Input
              id="medium_term_goals"
              {...register('medium_term_goals')}
              placeholder="Ex: Carro, casa, casamento, pós-graduação"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Separe múltiplos objetivos por vírgula</p>
          </div>

          <div>
            <Label htmlFor="long_term_goals">Longo Prazo (&gt; 5 anos)</Label>
            <Input
              id="long_term_goals"
              {...register('long_term_goals')}
              placeholder="Ex: Aposentadoria, casa própria, faculdade dos filhos"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Separe múltiplos objetivos por vírgula</p>
          </div>
        </div>
      </Card>

      {/* Submit */}
      <Card className="p-6">
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isSavingProfile || monthlyBalance < 0}
        >
          {isSavingProfile ? 'Salvando e Navegando...' : 'Continuar para Próxima Etapa →'}
        </Button>
        
        {monthlyBalance < 0 && (
          <p className="text-red-600 text-sm text-center mt-2">
            Ajuste suas finanças antes de prosseguir com o planejamento
          </p>
        )}
      </Card>
    </form>
  );
};

export default InvestmentProfileForm;
