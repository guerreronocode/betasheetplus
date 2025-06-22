
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { User, Target, Shield, TrendingUp, AlertCircle } from 'lucide-react';
import { useInvestmentPlanner, InvestmentProfile } from '@/hooks/useInvestmentPlanner';
import RiskProfileQuiz from './RiskProfileQuiz';

const InvestmentProfileForm: React.FC = () => {
  const { profile, saveProfile, isSavingProfile } = useInvestmentPlanner();
  
  const [formData, setFormData] = useState<Omit<InvestmentProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    age: profile?.age || 25,
    main_objective: profile?.main_objective || '',
    risk_profile: profile?.risk_profile || 'moderate',
    organization_level: profile?.organization_level || 'no_reserve',
    monthly_income: profile?.monthly_income || 0,
    monthly_expenses: profile?.monthly_expenses || 0,
    short_term_goals: profile?.short_term_goals || [],
    medium_term_goals: profile?.medium_term_goals || [],
    long_term_goals: profile?.long_term_goals || [],
  });

  const [showRiskQuiz, setShowRiskQuiz] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [currentGoalType, setCurrentGoalType] = useState<'short' | 'medium' | 'long'>('short');

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addGoal = () => {
    if (!goalInput.trim()) return;

    const goalField = `${currentGoalType}_term_goals` as keyof typeof formData;
    const currentGoals = formData[goalField] as string[];
    
    if (!currentGoals.includes(goalInput.trim())) {
      handleInputChange(goalField, [...currentGoals, goalInput.trim()]);
    }
    
    setGoalInput('');
  };

  const removeGoal = (goalType: 'short' | 'medium' | 'long', goal: string) => {
    const goalField = `${goalType}_term_goals` as keyof typeof formData;
    const currentGoals = formData[goalField] as string[];
    handleInputChange(goalField, currentGoals.filter(g => g !== goal));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile(formData);
  };

  const investmentCapacity = formData.monthly_income - formData.monthly_expenses;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Informações Básicas
            </h3>
            <p className="text-sm text-gray-600">
              Conte-nos um pouco sobre você
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="age">Idade</Label>
            <Input
              id="age"
              type="number"
              min="18"
              max="100"
              value={formData.age}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
              required
            />
          </div>

          <div>
            <Label htmlFor="main_objective">Objetivo Principal</Label>
            <Input
              id="main_objective"
              placeholder="Ex: liberdade financeira, aposentadoria, comprar imóvel..."
              value={formData.main_objective}
              onChange={(e) => handleInputChange('main_objective', e.target.value)}
              required
            />
          </div>
        </div>
      </Card>

      {/* Perfil de Segurança */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Perfil de Investimento
            </h3>
            <p className="text-sm text-gray-600">
              Não sabe seu perfil? Faça nosso quiz rápido!
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRiskQuiz(true)}
              className="text-purple-600 border-purple-300 hover:bg-purple-50"
            >
              🧭 Descobrir Meu Perfil
            </Button>
            <span className="text-sm text-gray-500">
              ou selecione diretamente:
            </span>
          </div>

          <RadioGroup
            value={formData.risk_profile}
            onValueChange={(value: 'conservative' | 'moderate' | 'aggressive') => 
              handleInputChange('risk_profile', value)
            }
          >
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="conservative" id="conservative" />
              <Label htmlFor="conservative" className="cursor-pointer flex-1">
                <div className="font-medium">🛡️ Conservador</div>
                <div className="text-sm text-gray-600">
                  Prioriza segurança, aceita retornos menores
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="moderate" id="moderate" />
              <Label htmlFor="moderate" className="cursor-pointer flex-1">
                <div className="font-medium">⚖️ Moderado</div>
                <div className="text-sm text-gray-600">
                  Equilibra segurança e rentabilidade
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="aggressive" id="aggressive" />
              <Label htmlFor="aggressive" className="cursor-pointer flex-1">
                <div className="font-medium">🚀 Agressivo</div>
                <div className="text-sm text-gray-600">
                  Busca maiores retornos, aceita mais riscos
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </Card>

      {/* Situação Financeira Atual */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Situação Financeira
            </h3>
            <p className="text-sm text-gray-600">
              Valores aproximados são suficientes
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Organização Financeira */}
          <div>
            <Label className="text-base font-medium">Nível de Organização Atual</Label>
            <RadioGroup
              value={formData.organization_level}
              onValueChange={(value: 'no_reserve' | 'building_reserve' | 'reserve_completed') => 
                handleInputChange('organization_level', value)
              }
              className="mt-3"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="no_reserve" id="no_reserve" />
                <Label htmlFor="no_reserve" className="cursor-pointer flex-1">
                  <div className="font-medium">🆘 Nenhuma reserva</div>
                  <div className="text-sm text-gray-600">
                    Ainda não tenho reserva de emergência
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="building_reserve" id="building_reserve" />
                <Label htmlFor="building_reserve" className="cursor-pointer flex-1">
                  <div className="font-medium">🏗️ Reserva em construção</div>
                  <div className="text-sm text-gray-600">
                    Já estou formando minha reserva de emergência
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="reserve_completed" id="reserve_completed" />
                <Label htmlFor="reserve_completed" className="cursor-pointer flex-1">
                  <div className="font-medium">✅ Reserva concluída</div>
                  <div className="text-sm text-gray-600">
                    Minha reserva de emergência está completa
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Renda e Gastos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="monthly_income">Renda Mensal (R$)</Label>
              <Input
                id="monthly_income"
                type="number"
                min="0"
                step="100"
                placeholder="5.000"
                value={formData.monthly_income || ''}
                onChange={(e) => handleInputChange('monthly_income', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <Label htmlFor="monthly_expenses">Gastos Mensais (R$)</Label>
              <Input
                id="monthly_expenses"
                type="number"
                min="0"
                step="100"
                placeholder="3.500"
                value={formData.monthly_expenses || ''}
                onChange={(e) => handleInputChange('monthly_expenses', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Capacidade de Investimento */}
          {formData.monthly_income > 0 && formData.monthly_expenses > 0 && (
            <div className={`p-4 rounded-lg border ${
              investmentCapacity > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {investmentCapacity > 0 ? (
                  <>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Capacidade de investimento: R$ {investmentCapacity.toLocaleString('pt-BR')}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">
                      Gastos excedem a renda em R$ {Math.abs(investmentCapacity).toLocaleString('pt-BR')}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Objetivos por Prazo */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Target className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Objetivos por Prazo
            </h3>
            <p className="text-sm text-gray-600">
              Organize seus sonhos por período (opcional)
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Input para adicionar objetivos */}
          <div className="flex gap-2">
            <select
              value={currentGoalType}
              onChange={(e) => setCurrentGoalType(e.target.value as 'short' | 'medium' | 'long')}
              className="px-3 py-2 border rounded-md"
            >
              <option value="short">Curto (< 2 anos)</option>
              <option value="medium">Médio (2-5 anos)</option>
              <option value="long">Longo (> 5 anos)</option>
            </select>
            <Input
              placeholder="Ex: viagem, carro, aposentadoria..."
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyPress={(e) => e.key ===  'Enter' && (e.preventDefault(), addGoal())}
              className="flex-1"
            />
            <Button type="button" onClick={addGoal} variant="outline">
              Adicionar
            </Button>
          </div>

          {/* Lista de objetivos */}
          <div className="space-y-4">
            {['short', 'medium', 'long'].map(type => {
              const goals = formData[`${type}_term_goals` as keyof typeof formData] as string[];
              const typeLabel = type === 'short' ? 'Curto Prazo' : type === 'medium' ? 'Médio Prazo' : 'Longo Prazo';
              const typeColor = type === 'short' ? 'blue' : type === 'medium' ? 'orange' : 'green';
              
              return goals.length > 0 && (
                <div key={type}>
                  <Label className="text-sm font-medium text-gray-700">
                    {typeLabel} ({goals.length})
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {goals.map((goal, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className={`cursor-pointer hover:bg-${typeColor}-100 border-${typeColor}-300`}
                        onClick={() => removeGoal(type as 'short' | 'medium' | 'long', goal)}
                      >
                        {goal} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Submit */}
      <Card className="p-6">
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isSavingProfile || investmentCapacity <= 0}
        >
          {isSavingProfile ? 'Salvando...' : 'Continuar para Reserva de Emergência →'}
        </Button>
      </Card>

      {/* Risk Profile Quiz Modal */}
      {showRiskQuiz && (
        <RiskProfileQuiz
          onClose={() => setShowRiskQuiz(false)}
          onResult={(profile) => {
            handleInputChange('risk_profile', profile);
            setShowRiskQuiz(false);
          }}
        />
      )}
    </form>
  );
};

export default InvestmentProfileForm;
