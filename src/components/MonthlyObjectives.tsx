
import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

const MonthlyObjectives = () => {
  const objectives = [
    {
      id: 1,
      title: 'Registrar todas as despesas',
      description: 'Anote pelo menos 90% dos seus gastos',
      completed: true,
      points: 30,
      progress: 100
    },
    {
      id: 2,
      title: 'Economizar 20% da renda',
      description: 'Poupor pelo menos R$ 1.090',
      completed: false,
      points: 50,
      progress: 75
    },
    {
      id: 3,
      title: 'Não usar cartão de crédito',
      description: 'Evitar compras no cartão este mês',
      completed: false,
      points: 40,
      progress: 60
    },
    {
      id: 4,
      title: 'Ler artigo sobre investimentos',
      description: 'Expandir conhecimento financeiro',
      completed: true,
      points: 20,
      progress: 100
    },
    {
      id: 5,
      title: 'Revisar todas as assinaturas',
      description: 'Cancelar serviços não utilizados',
      completed: false,
      points: 35,
      progress: 0
    }
  ];

  const completedObjectives = objectives.filter(obj => obj.completed).length;
  const totalPoints = objectives.filter(obj => obj.completed).reduce((sum, obj) => sum + obj.points, 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mini Objetivos do Mês</h3>
            <p className="text-sm text-gray-600">
              {completedObjectives} de {objectives.length} completos • {totalPoints} pontos ganhos
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {objectives.map((objective, index) => (
          <div
            key={objective.id}
            className={`p-4 rounded-lg border transition-all duration-200 animate-slide-up ${
              objective.completed
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                {objective.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-medium ${
                    objective.completed ? 'text-green-900 line-through' : 'text-gray-900'
                  }`}>
                    {objective.title}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    objective.completed 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    +{objective.points} pts
                  </span>
                </div>
                
                <p className={`text-sm mb-3 ${
                  objective.completed ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {objective.description}
                </p>

                {!objective.completed && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${objective.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MonthlyObjectives;
