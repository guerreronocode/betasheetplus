import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { User, Target, Save } from 'lucide-react';
import { useInvestmentPlanner } from '@/hooks/useInvestmentPlanner';
import { formatCurrency } from '@/utils/formatters';
import RiskProfileQuiz from './RiskProfileQuiz';

const InvestmentProfileForm: React.FC = () => {
  const { profile, saveProfile, isSavingProfile } = useInvestmentPlanner();

  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [mainObjective, setMainObjective] = useState(profile?.main_objective || '');
  const [riskProfile, setRiskProfile] = useState(profile?.risk_profile || '');
  const [organizationLevel, setOrganizationLevel] = useState(profile?.organization_level || '');
  const [employmentType, setEmploymentType] = useState(profile?.employment_type || '');
  const [monthlyIncome, setMonthlyIncome] = useState(profile?.monthly_income?.toString() || '');
  const [monthlyExpenses, setMonthlyExpenses] = useState(profile?.monthly_expenses?.toString() || '');
  const [shortTermGoals, setShortTermGoals] = useState(profile?.short_term_goals || []);
  const [mediumTermGoals, setMediumTermGoals] = useState(profile?.medium_term_goals || []);
  const [longTermGoals, setLongTermGoals] = useState(profile?.long_term_goals || []);
  const [showRiskQuiz, setShowRiskQuiz] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🖱️ BOTÃO SUBMIT CLICADO');
    console.log('🔥 FORM SUBMIT INICIADO');

    const profileData = {
      age: Number(age),
      main_objective: mainObjective,
      risk_profile: riskProfile as 'conservative' | 'moderate' | 'aggressive',
      organization_level: organizationLevel as 'no_reserve' | 'building_reserve' | 'reserve_completed',
      employment_type: employmentType as 'clt' | 'civil_servant' | 'freelancer' | 'entrepreneur',
      monthly_income: Number(monthlyIncome),
      monthly_expenses: Number(monthlyExpenses),
      short_term_goals: shortTermGoals,
      medium_term_goals: mediumTermGoals,
      long_term_goals: longTermGoals,
    };

    console.log('📤 Dados do profile preparados:', profileData);
    console.log('💾 Salvando perfil...');
    saveProfile(profileData);
  };

  const handleRiskQuizResult = (result: 'conservative' | 'moderate' | 'aggressive') => {
    setRiskProfile(result);
    setShowRiskQuiz(false);
  };

  const investmentCapacity = Math.max(0, Number(monthlyIncome) - Number(monthlyExpenses));

  return (
    <div className="space-y-6">
      {/* Instrução para o usuário */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2 text-blue-800">
          <Target className="w-5 h-5" />
          <div>
            <p className="text-sm font-medium">📋 Preencha seu perfil financeiro</p>
            <p className="text-xs text-blue-600 mt-1">
              Após salvar, clique em "Reserva" no painel superior para continuar
            </p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            👤 Perfil de Investimento
          </h3>
          <p className="text-gray-600">
            Vamos conhecer sua situação financeira atual
          </p>
        </div>

        {/* Idade */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label htmlFor="age">Qual sua idade?</Label>
            <Input
              id="age"
              type="number"
              placeholder="Ex: 30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Objetivo Principal */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label htmlFor="main_objective">Qual seu objetivo principal?</Label>
            <Input
              id="main_objective"
              type="text"
              placeholder="Ex: Aposentadoria, comprar um imóvel, etc."
              value={mainObjective}
              onChange={(e) => setMainObjective(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Nível de Organização */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label>Como você está hoje com sua reserva?</Label>
            <Select value={organizationLevel} onValueChange={setOrganizationLevel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_reserve">Não tenho reserva</SelectItem>
                <SelectItem value="building_reserve">Estou construindo minha reserva</SelectItem>
                <SelectItem value="reserve_completed">Já tenho reserva completa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Perfil de Risco */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label>Qual seu perfil de risco?</Label>
            <Select value={riskProfile} onValueChange={setRiskProfile}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservador</SelectItem>
                <SelectItem value="moderate">Moderado</SelectItem>
                <SelectItem value="aggressive">Agressivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRiskQuiz(true)}
              className="flex items-center gap-2"
            >
              <User className="h-3 w-3" />
              Não sabe seu perfil? Faça o quiz
            </Button>
          </div>
        </Card>

        {/* Tipo de Emprego */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label>Qual seu tipo de emprego?</Label>
            <Select value={employmentType} onValueChange={setEmploymentType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clt">CLT</SelectItem>
                <SelectItem value="civil_servant">Concursado</SelectItem>
                <SelectItem value="freelancer">Freelancer</SelectItem>
                <SelectItem value="entrepreneur">Empreendedor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Renda Mensal */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label htmlFor="monthly_income">Qual sua renda mensal?</Label>
            <Input
              id="monthly_income"
              type="number"
              placeholder="Ex: 5000"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Despesas Mensais */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label htmlFor="monthly_expenses">Quais suas despesas mensais?</Label>
            <Input
              id="monthly_expenses"
              type="number"
              placeholder="Ex: 3000"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(e.target.value)}
              required
            />
            {monthlyIncome && monthlyExpenses && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Sobra mensal:</strong>{' '}
                  {formatCurrency(investmentCapacity)}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Objetivos de Curto Prazo */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label>Quais seus objetivos de curto prazo (até 2 anos)?</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={shortTermGoals.includes('viagem')}
                  onCheckedChange={(checked) =>
                    setShortTermGoals(
                      checked
                        ? [...shortTermGoals, 'viagem']
                        : shortTermGoals.filter((goal) => goal !== 'viagem')
                    )
                  }
                />
                <span>Viagem</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={shortTermGoals.includes('eletronicos')}
                  onCheckedChange={(checked) =>
                    setShortTermGoals(
                      checked
                        ? [...shortTermGoals, 'eletronicos']
                        : shortTermGoals.filter((goal) => goal !== 'eletronicos')
                    )
                  }
                />
                <span>Eletrônicos</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={shortTermGoals.includes('cursos')}
                  onCheckedChange={(checked) =>
                    setShortTermGoals(
                      checked
                        ? [...shortTermGoals, 'cursos']
                        : shortTermGoals.filter((goal) => goal !== 'cursos')
                    )
                  }
                />
                <span>Cursos</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Objetivos de Médio Prazo */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label>Quais seus objetivos de médio prazo (2 a 5 anos)?</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={mediumTermGoals.includes('carro')}
                  onCheckedChange={(checked) =>
                    setMediumTermGoals(
                      checked
                        ? [...mediumTermGoals, 'carro']
                        : mediumTermGoals.filter((goal) => goal !== 'carro')
                    )
                  }
                />
                <span>Carro</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={mediumTermGoals.includes('entrada_imovel')}
                  onCheckedChange={(checked) =>
                    setMediumTermGoals(
                      checked
                        ? [...mediumTermGoals, 'entrada_imovel']
                        : mediumTermGoals.filter((goal) => goal !== 'entrada_imovel')
                    )
                  }
                />
                <span>Entrada Imóvel</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={mediumTermGoals.includes('casamento')}
                  onCheckedChange={(checked) =>
                    setMediumTermGoals(
                      checked
                        ? [...mediumTermGoals, 'casamento']
                        : mediumTermGoals.filter((goal) => goal !== 'casamento')
                    )
                  }
                />
                <span>Casamento</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Objetivos de Longo Prazo */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label>Quais seus objetivos de longo prazo (acima de 5 anos)?</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={longTermGoals.includes('aposentadoria')}
                  onCheckedChange={(checked) =>
                    setLongTermGoals(
                      checked
                        ? [...longTermGoals, 'aposentadoria']
                        : longTermGoals.filter((goal) => goal !== 'aposentadoria')
                    )
                  }
                />
                <span>Aposentadoria</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={longTermGoals.includes('independencia_financeira')}
                  onCheckedChange={(checked) =>
                    setLongTermGoals(
                      checked
                        ? [...longTermGoals, 'independencia_financeira']
                        : longTermGoals.filter((goal) => goal !== 'independencia_financeira')
                    )
                  }
                />
                <span>Independência Financeira</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={longTermGoals.includes('educacao_filhos')}
                  onCheckedChange={(checked) =>
                    setLongTermGoals(
                      checked
                        ? [...longTermGoals, 'educacao_filhos']
                        : longTermGoals.filter((goal) => goal !== 'educacao_filhos')
                    )
                  }
                />
                <span>Educação dos Filhos</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Botão de Salvar */}
        <div className="flex justify-center">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-8"
            disabled={isSavingProfile}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSavingProfile ? 'Salvando Perfil...' : 'Salvar Perfil'}
          </Button>
        </div>
      </form>

      {/* Risk Profile Quiz Modal */}
      {showRiskQuiz && (
        <RiskProfileQuiz
          onClose={() => setShowRiskQuiz(false)}
          onResult={handleRiskQuizResult}
        />
      )}
    </div>
  );
};

export default InvestmentProfileForm;
