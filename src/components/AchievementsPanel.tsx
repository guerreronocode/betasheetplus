
import React from 'react';
import { Trophy, Star, Lock, Calendar, Target, TrendingUp, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useUserStats } from '@/hooks/useUserStats';
import { useFinancialData } from '@/hooks/useFinancialData';

const AchievementsPanel = () => {
  const { 
    achievementDefinitions, 
    achievementsByCategory, 
    unlockedAchievementIds, 
    userStats 
  } = useUserStats();
  
  const { totalIncome, totalExpenses, investments, goals } = useFinancialData();

  const getCategoryIcon = (category: string) => {
    const icons = {
      financial: DollarSign,
      engagement: Calendar,
      goals: Target,
      investments: TrendingUp,
    };
    return icons[category as keyof typeof icons] || Star;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      financial: 'bg-green-100 text-green-700',
      engagement: 'bg-blue-100 text-blue-700',
      goals: 'bg-purple-100 text-purple-700',
      investments: 'bg-orange-100 text-orange-700',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getAchievementProgress = (achievement: any) => {
    if (!userStats) return 0;
    
    const criteria = achievement.criteria;
    const type = criteria.type;
    
    switch (type) {
      case 'income_count':
        return Math.min((totalIncome > 0 ? 1 : 0) / criteria.value * 100, 100);
      case 'expense_count':
        return Math.min((totalExpenses > 0 ? 1 : 0) / criteria.value * 100, 100);
      case 'investment_count':
        return Math.min(investments.length / criteria.value * 100, 100);
      case 'goal_count':
        return Math.min(goals.length / criteria.value * 100, 100);
      case 'level':
        return Math.min(userStats.level / criteria.value * 100, 100);
      case 'transaction_count':
        return Math.min(userStats.total_transactions / criteria.value * 100, 100);
      case 'consecutive_days':
        return Math.min(userStats.consecutive_days_accessed / criteria.value * 100, 100);
      case 'goals_completed':
        return Math.min(userStats.goals_completed / criteria.value * 100, 100);
      case 'positive_balance_days':
        return Math.min(userStats.positive_balance_days / criteria.value * 100, 100);
      default:
        return 0;
    }
  };

  const isAchievementUnlocked = (achievementId: string) => {
    return unlockedAchievementIds.has(achievementId);
  };

  const getProgressText = (achievement: any) => {
    if (!userStats) return '';
    
    const criteria = achievement.criteria;
    const type = criteria.type;
    
    switch (type) {
      case 'income_count':
        return `${totalIncome > 0 ? 1 : 0}/${criteria.value}`;
      case 'expense_count':
        return `${totalExpenses > 0 ? 1 : 0}/${criteria.value}`;
      case 'investment_count':
        return `${investments.length}/${criteria.value}`;
      case 'goal_count':
        return `${goals.length}/${criteria.value}`;
      case 'level':
        return `${userStats.level}/${criteria.value}`;
      case 'transaction_count':
        return `${userStats.total_transactions}/${criteria.value}`;
      case 'consecutive_days':
        return `${userStats.consecutive_days_accessed}/${criteria.value}`;
      case 'goals_completed':
        return `${userStats.goals_completed}/${criteria.value}`;
      case 'positive_balance_days':
        return `${userStats.positive_balance_days}/${criteria.value}`;
      default:
        return '';
    }
  };

  const unlockedCount = achievementDefinitions.filter(a => unlockedAchievementIds.has(a.id)).length;
  const totalPoints = achievementDefinitions
    .filter(a => unlockedAchievementIds.has(a.id))
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="space-y-6">
      {/* Achievement Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Conquistas</p>
              <p className="text-lg font-semibold">{unlockedCount}/{achievementDefinitions.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pontos Totais</p>
              <p className="text-lg font-semibold">{totalPoints.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Progresso</p>
              <p className="text-lg font-semibold">
                {Math.round((unlockedCount / achievementDefinitions.length) * 100)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Achievements by Category */}
      {Object.entries(achievementsByCategory).map(([category, achievements]) => {
        const CategoryIcon = getCategoryIcon(category);
        const categoryColor = getCategoryColor(category);
        const categoryUnlocked = achievements.filter(a => unlockedAchievementIds.has(a.id)).length;
        
        return (
          <Card key={category} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${categoryColor.replace('text-', 'bg-').replace('-700', '-100')}`}>
                  <CategoryIcon className={`w-6 h-6 ${categoryColor}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold capitalize">
                    {category === 'financial' && 'Financeiras'}
                    {category === 'engagement' && 'Engajamento'}
                    {category === 'goals' && 'Metas'}
                    {category === 'investments' && 'Investimentos'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {categoryUnlocked}/{achievements.length} conquistas
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={categoryColor}>
                {Math.round((categoryUnlocked / achievements.length) * 100)}%
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => {
                const isUnlocked = isAchievementUnlocked(achievement.id);
                const progress = getAchievementProgress(achievement);
                const progressText = getProgressText(achievement);
                
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isUnlocked 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        isUnlocked 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isUnlocked ? (
                          <Star className="w-5 h-5 fill-current" />
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-medium ${
                            isUnlocked ? 'text-green-800' : 'text-gray-600'
                          }`}>
                            {achievement.title}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            +{achievement.points} pts
                          </Badge>
                        </div>
                        
                        <p className={`text-sm mb-2 ${
                          isUnlocked ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                        
                        {!isUnlocked && progressText && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Progresso</span>
                              <span>{progressText}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                        
                        {isUnlocked && (
                          <div className="flex items-center text-xs text-green-600">
                            <Trophy className="w-3 h-3 mr-1" />
                            Conquistado!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default AchievementsPanel;
