
import React from 'react';
import { Trophy, Star, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/hooks/useGamification';

const UserLevelDisplay = () => {
  const { userStats, achievements, isLoading } = useGamification();

  if (isLoading || !userStats) {
    return (
      <Card className="p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </Card>
    );
  }

  const currentLevel = userStats.level || 1;
  const totalPoints = userStats.total_points || 0;
  const pointsForCurrentLevel = (currentLevel - 1) * 100;
  const pointsForNextLevel = currentLevel * 100;
  const progressInCurrentLevel = totalPoints - pointsForCurrentLevel;
  const progressPercentage = (progressInCurrentLevel / 100) * 100;

  const recentAchievements = achievements
    .sort((a, b) => new Date(b.unlocked_at || 0).getTime() - new Date(a.unlocked_at || 0).getTime())
    .slice(0, 3);

  return (
    <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
      // Navigate to achievements page or show detailed stats
      console.log('Navigate to user profile/achievements');
    }}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{currentLevel}</span>
          </div>
          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
            <Star className="w-4 h-4 text-yellow-800" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold">Nível {currentLevel}</h3>
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-sm text-gray-600">{totalPoints} pontos totais</p>
          
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Progresso para o nível {currentLevel + 1}</span>
              <span className="text-xs text-gray-500">{progressInCurrentLevel}/100</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      {recentAchievements.length > 0 && (
        <div className="border-t pt-4">
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Conquistas Recentes</span>
          </div>
          
          <div className="space-y-2">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <span className="text-lg">{achievement.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{achievement.title}</p>
                  <p className="text-xs text-gray-600">+{achievement.points_earned} pontos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-blue-600">{userStats.current_streak || 0}</p>
            <p className="text-xs text-gray-600">Sequência Atual</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">{userStats.goals_completed || 0}</p>
            <p className="text-xs text-gray-600">Metas Completas</p>
          </div>
          <div>
            <p className="text-lg font-bold text-purple-600">{achievements.length}</p>
            <p className="text-xs text-gray-600">Conquistas</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserLevelDisplay;
