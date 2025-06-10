
import React, { useEffect } from 'react';
import { Trophy, Star, Target, Coins, Calendar, Shield, CheckCircle, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStats } from '@/hooks/useUserStats';
import { useFinancialData } from '@/hooks/useFinancialData';

const AdvancedAchievements = () => {
  const { 
    achievements, 
    achievementDefinitions, 
    achievementsByCategory,
    unlockedAchievementIds,
    awardAchievement, 
    isAwarding 
  } = useUserStats();
  
  const financialData = useFinancialData();

  const checkAchievementEligibility = (definition: any) => {
    const criteria = definition.criteria;
    
    switch (criteria.type) {
      case 'first_transaction':
        if (criteria.transaction_type === 'income') {
          return financialData.income.length > 0;
        }
        if (criteria.transaction_type === 'expense') {
          return financialData.expenses.length > 0;
        }
        if (criteria.transaction_type === 'investment') {
          return financialData.investments.length > 0;
        }
        return false;

      case 'first_goal':
        return financialData.goals.length > 0;

      case 'investment_total':
        return financialData.totalInvested >= criteria.amount;

      case 'net_worth':
        return financialData.netWorth >= criteria.amount;

      case 'goal_progress':
        return financialData.goals.some(goal => {
          const progress = (goal.current_amount / goal.target_amount) * 100;
          return progress >= criteria.percentage;
        });

      case 'goal_completed':
        return financialData.goals.some(goal => goal.completed);

      case 'goal_count':
        return financialData.goals.length >= criteria.count;

      case 'transaction_count':
        const totalTransactions = financialData.income.length + financialData.expenses.length;
        return totalTransactions >= criteria.count;

      case 'bank_account_count':
        return financialData.bankAccounts.length >= criteria.count;

      case 'investment_type':
        return financialData.investments.some(inv => inv.type === criteria.investment_type);

      case 'balanced_budget':
        const monthlyIncome = financialData.totalIncome;
        const monthlyExpenses = financialData.totalExpenses;
        return monthlyIncome >= monthlyExpenses;

      case 'savings_rate':
        const savingsRate = ((financialData.totalIncome - financialData.totalExpenses) / financialData.totalIncome) * 100;
        return savingsRate >= criteria.percentage;

      default:
        return false;
    }
  };

  const autoCheckAchievements = () => {
    achievementDefinitions.forEach(definition => {
      const isAlreadyUnlocked = unlockedAchievementIds.has(definition.id);
      const isEligible = checkAchievementEligibility(definition);
      
      if (!isAlreadyUnlocked && isEligible) {
        awardAchievement({
          achievement_id: definition.id,
          points: definition.points
        });
      }
    });
  };

  useEffect(() => {
    if (!financialData.isLoading && achievementDefinitions.length > 0) {
      autoCheckAchievements();
    }
  }, [
    financialData.income.length,
    financialData.expenses.length,
    financialData.investments.length,
    financialData.goals.length,
    financialData.bankAccounts.length,
    financialData.totalInvested,
    financialData.netWorth,
    achievementDefinitions.length
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      primeiros_passos: Star,
      metas: Target,
      investimentos: Shield,
      disciplina: Calendar,
      controle: CheckCircle,
      transacoes: Coins,
      organizacao: Trophy,
      patrimonio: Trophy,
      milestones: Trophy,
      rendimentos: Trophy,
      educacao: Trophy,
      especiais: Star,
    };
    return icons[category as keyof typeof icons] || Trophy;
  };

  const getCategoryName = (category: string) => {
    const names = {
      primeiros_passos: 'Primeiros Passos',
      metas: 'Metas e Objetivos',
      investimentos: 'Investimentos',
      disciplina: 'Disciplina',
      controle: 'Controle Financeiro',
      transacoes: 'Transações',
      organizacao: 'Organização',
      patrimonio: 'Patrimônio',
      milestones: 'Marcos Especiais',
      rendimentos: 'Rendimentos',
      educacao: 'Educação Financeira',
      especiais: 'Especiais',
    };
    return names[category as keyof typeof names] || category;
  };

  const calculateCategoryProgress = (category: string) => {
    const categoryAchievements = achievementsByCategory[category] || [];
    const unlockedCount = categoryAchievements.filter(a => unlockedAchievementIds.has(a.id)).length;
    return categoryAchievements.length > 0 ? (unlockedCount / categoryAchievements.length) * 100 : 0;
  };

  const totalPoints = achievements.reduce((sum, achievement) => sum + (achievement.points_earned || 0), 0);
  const totalPossiblePoints = achievementDefinitions.reduce((sum, def) => sum + def.points, 0);
  const overallProgress = totalPossiblePoints > 0 ? (totalPoints / totalPossiblePoints) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sistema de Conquistas</h3>
              <p className="text-sm text-gray-600">Acompanhe seu progresso financeiro</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{achievements.length}</p>
            <p className="text-sm text-gray-600">Conquistas Desbloqueadas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{totalPoints}</p>
            <p className="text-sm text-gray-600">Pontos Totais</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{overallProgress.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Progresso Geral</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso Geral</span>
            <span>{achievements.length} de {achievementDefinitions.length}</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </Card>

      {/* Achievements by Category */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="primeiros_passos">Início</TabsTrigger>
          <TabsTrigger value="metas">Metas</TabsTrigger>
          <TabsTrigger value="investimentos">Invest.</TabsTrigger>
          <TabsTrigger value="controle">Controle</TabsTrigger>
          <TabsTrigger value="especiais">Especiais</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(achievementsByCategory).map(([category, definitions]) => {
              const CategoryIcon = getCategoryIcon(category);
              const progress = calculateCategoryProgress(category);
              const unlockedCount = definitions.filter(d => unlockedAchievementIds.has(d.id)).length;
              
              return (
                <Card key={category} className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <CategoryIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{getCategoryName(category)}</h4>
                      <p className="text-sm text-gray-600">{unlockedCount} de {definitions.length}</p>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {Object.entries(achievementsByCategory).map(([category, definitions]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {definitions.map((definition, index) => {
                const isUnlocked = unlockedAchievementIds.has(definition.id);
                const isEligible = !isUnlocked && checkAchievementEligibility(definition);
                const userAchievement = achievements.find(a => a.achievement_id === definition.id);
                
                return (
                  <Card
                    key={definition.id}
                    className={`p-4 transition-all duration-200 animate-scale-in ${
                      isUnlocked
                        ? 'border-yellow-200 bg-yellow-50'
                        : isEligible
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg text-2xl ${
                        isUnlocked 
                          ? 'bg-yellow-100' 
                          : isEligible
                          ? 'bg-green-100'
                          : 'bg-gray-100'
                      }`}>
                        {isUnlocked ? '🏆' : isEligible ? definition.icon : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                          {definition.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            +{definition.points} pts
                          </Badge>
                          {isUnlocked && userAchievement && (
                            <span className="text-xs text-yellow-600">
                              {formatDate(userAchievement.unlocked_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-3 ${isUnlocked ? 'text-gray-700' : 'text-gray-500'}`}>
                      {definition.description}
                    </p>

                    {isEligible && (
                      <Button
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => awardAchievement({
                          achievement_id: definition.id,
                          points: definition.points
                        })}
                        disabled={isAwarding}
                      >
                        {isAwarding ? 'Desbloqueando...' : 'Desbloquear!'}
                      </Button>
                    )}

                    {isUnlocked && (
                      <div className="text-center">
                        <span className="text-xs text-yellow-600 font-medium">✨ Desbloqueada!</span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdvancedAchievements;
