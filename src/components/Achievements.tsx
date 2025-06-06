
import React from 'react';
import { Trophy, Star, Target, Coins, Calendar, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Achievements = () => {
  const achievements = [
    {
      id: 1,
      title: 'Primeiro Passo',
      description: 'Cadastrou sua primeira receita',
      icon: Star,
      unlocked: true,
      points: 10,
      date: '2024-05-01'
    },
    {
      id: 2,
      title: 'Poupador Iniciante',
      description: 'Poupou R$ 500 em um mês',
      icon: Coins,
      unlocked: true,
      points: 25,
      date: '2024-05-15'
    },
    {
      id: 3,
      title: 'Meta Alcançada',
      description: 'Completou sua primeira meta',
      icon: Target,
      unlocked: true,
      points: 50,
      date: '2024-05-20'
    },
    {
      id: 4,
      title: 'Disciplinado',
      description: 'Use o app por 30 dias seguidos',
      icon: Calendar,
      unlocked: false,
      points: 100,
      progress: 23
    },
    {
      id: 5,
      title: 'Saúde Financeira',
      description: 'Alcance score de 800 pontos',
      icon: Shield,
      unlocked: false,
      points: 150,
      progress: 750
    },
    {
      id: 6,
      title: 'Milionário',
      description: 'Patrimônio de R$ 1.000.000',
      icon: Trophy,
      unlocked: false,
      points: 500,
      progress: 24750
    }
  ];

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
            <h3 className="text-lg font-semibold text-gray-900">Conquistas</h3>
            <p className="text-sm text-gray-600">Suas vitórias e progressos</p>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {achievements.filter(a => a.unlocked).length} de {achievements.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement, index) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border-2 transition-all duration-200 animate-scale-in ${
              achievement.unlocked
                ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-300'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-lg ${
                achievement.unlocked 
                  ? 'bg-yellow-200 text-yellow-700' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                <achievement.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className={`font-medium ${
                  achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {achievement.title}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">+{achievement.points} pts</span>
                  {achievement.unlocked && achievement.date && (
                    <span className="text-xs text-yellow-600">
                      {formatDate(achievement.date)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <p className={`text-sm mb-3 ${
              achievement.unlocked ? 'text-gray-700' : 'text-gray-500'
            }`}>
              {achievement.description}
            </p>

            {!achievement.unlocked && achievement.progress !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: achievement.id === 4 
                      ? `${(achievement.progress / 30) * 100}%`
                      : achievement.id === 5
                      ? `${(achievement.progress / 800) * 100}%`
                      : `${(achievement.progress / 1000000) * 100}%`
                  }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Achievements;
