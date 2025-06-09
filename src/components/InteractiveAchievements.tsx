
import React from 'react';
import { Trophy, Star, Target, Coins, Calendar, Shield, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStats } from '@/hooks/useUserStats';
import { useFinancialData } from '@/hooks/useFinancialData';

const achievementDefinitions = [
  {
    id: 'first_income',
    title: 'Primeiro Passo',
    description: 'Cadastrou sua primeira receita',
    icon: Star,
    points: 10,
    condition: (data: any) => data.income.length > 0
  },
  {
    id: 'saver_beginner',
    title: 'Poupador Iniciante',
    description: 'Poupou R$ 500 em um mês',
    icon: Coins,
    points: 25,
    condition: (data: any) => {
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      const monthlyIncome = data.income
        .filter((i: any) => {
          const date = new Date(i.date);
          return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        })
        .reduce((sum: number, i: any) => sum + i.amount, 0);
      const monthlyExpenses = data.expenses
        .filter((e: any) => {
          const date = new Date(e.date);
          return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
        })
        .reduce((sum: number, e: any) => sum + e.amount, 0);
      return (monthlyIncome - monthlyExpenses) >= 500;
    }
  },
  {
    id: 'goal_achieved',
    title: 'Meta Alcançada',
    description: 'Completou sua primeira meta',
    icon: Target,
    points: 50,
    condition: (data: any) => data.goals.some((g: any) => g.completed)
  },
  {
    id: 'investor',
    title: 'Investidor',
    description: 'Fez seu primeiro investimento',
    icon: Shield,
    points: 40,
    condition: (data: any) => data.investments.length > 0
  },
  {
    id: 'disciplined',
    title: 'Disciplinado',
    description: 'Use o app por 7 dias seguidos',
    icon: Calendar,
    points: 100,
    condition: (data: any) => data.userStats?.current_streak >= 7
  },
  {
    id: 'big_saver',
    title: 'Grande Poupador',
    description: 'Poupou R$ 2.000 no total',
    icon: Coins,
    points: 75,
    condition: (data: any) => {
      const totalIncome = data.income.reduce((sum: number, i: any) => sum + i.amount, 0);
      const totalExpenses = data.expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
      return (totalIncome - totalExpenses) >= 2000;
    }
  }
];

const InteractiveAchievements = () => {
  const { achievements, awardAchievement, isAwarding } = useUserStats();
  const financialData = useFinancialData();
  
  const checkAndAwardAchievements = () => {
    achievementDefinitions.forEach(achievement => {
      const alreadyUnlocked = achievements.some(a => a.achievement_id === achievement.id);
      
      if (!alreadyUnlocked && achievement.condition(financialData)) {
        awardAchievement({
          achievement_id: achievement.id,
          points: achievement.points
        });
      }
    });
  };

  React.useEffect(() => {
    if (!financialData.isLoading) {
      checkAndAwardAchievements();
    }
  }, [financialData.income, financialData.expenses, financialData.investments, financialData.goals]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Conquistas Interativas</h3>
            <p className="text-sm text-gray-600">Suas vitórias e progressos em tempo real</p>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {achievements.length} de {achievementDefinitions.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievementDefinitions.map((achievementDef, index) => {
          const userAchievement = achievements.find(a => a.achievement_id === achievementDef.id);
          const isUnlocked = !!userAchievement;
          const isEligible = !isUnlocked && achievementDef.condition(financialData);
          
          return (
            <div
              key={achievementDef.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 animate-scale-in ${
                isUnlocked
                  ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-300'
                  : isEligible
                  ? 'border-green-200 bg-green-50 hover:border-green-300'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  isUnlocked 
                    ? 'bg-yellow-200 text-yellow-700' 
                    : isEligible
                    ? 'bg-green-200 text-green-700'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {isUnlocked ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <achievementDef.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    isUnlocked ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {achievementDef.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">+{achievementDef.points} pts</span>
                    {isUnlocked && userAchievement && (
                      <span className="text-xs text-yellow-600">
                        {formatDate(userAchievement.unlocked_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <p className={`text-sm mb-3 ${
                isUnlocked ? 'text-gray-700' : 'text-gray-500'
              }`}>
                {achievementDef.description}
              </p>

              {isEligible && (
                <Button
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => awardAchievement({
                    achievement_id: achievementDef.id,
                    points: achievementDef.points
                  })}
                  disabled={isAwarding}
                >
                  {isAwarding ? 'Desbloqueando...' : 'Desbloquear Conquista!'}
                </Button>
              )}

              {isUnlocked && (
                <div className="text-center">
                  <span className="text-xs text-yellow-600 font-medium">✨ Conquista Desbloqueada!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default InteractiveAchievements;
