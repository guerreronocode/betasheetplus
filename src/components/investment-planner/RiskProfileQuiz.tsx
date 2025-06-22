
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { X, HelpCircle } from 'lucide-react';

interface RiskProfileQuizProps {
  onClose: () => void;
  onResult: (profile: 'conservative' | 'moderate' | 'aggressive') => void;
}

const RiskProfileQuiz: React.FC<RiskProfileQuizProps> = ({ onClose, onResult }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const questions = [
    {
      question: "Se você investisse R$ 10.000 e perdesse R$ 2.000 no primeiro mês, o que faria?",
      options: [
        { text: "Retiraria tudo imediatamente", score: 1 },
        { text: "Ficaria preocupado, mas esperaria mais um mês", score: 2 },
        { text: "Manteria o investimento, perdas fazem parte", score: 3 },
        { text: "Investiria mais, aproveitando a baixa", score: 4 },
      ]
    },
    {
      question: "Qual seu conhecimento sobre investimentos?",
      options: [
        { text: "Muito básico, prefiro poupança", score: 1 },
        { text: "Conheço o básico: CDB, Tesouro Direto", score: 2 },
        { text: "Entendo bem: ações, fundos, FIIs", score: 3 },
        { text: "Avançado: derivativos, análises técnicas", score: 4 },
      ]
    },
    {
      question: "Qual prazo você pretende manter seus investimentos?",
      options: [
        { text: "Menos de 1 ano, posso precisar do dinheiro", score: 1 },
        { text: "1 a 3 anos, para projetos específicos", score: 2 },
        { text: "3 a 10 anos, para objetivos de médio prazo", score: 3 },
        { text: "Mais de 10 anos, pensando no futuro", score: 4 },
      ]
    },
    {
      question: "Como você se sente em relação à volatilidade (oscilações) dos investimentos?",
      options: [
        { text: "Detesto ver meu dinheiro oscilar", score: 1 },
        { text: "Aceito pequenas oscilações", score: 2 },
        { text: "Consigo lidar com oscilações moderadas", score: 3 },
        { text: "Oscilações não me incomodam", score: 4 },
      ]
    },
    {
      question: "Qual sua principal prioridade nos investimentos?",
      options: [
        { text: "Preservar o capital, não perder dinheiro", score: 1 },
        { text: "Ter uma rentabilidade ligeiramente acima da inflação", score: 2 },
        { text: "Buscar bons retornos, aceitando alguns riscos", score: 3 },
        { text: "Maximizar ganhos, mesmo com riscos altos", score: 4 },
      ]
    }
  ];

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calcular resultado
      const totalScore = newAnswers.reduce((sum, score) => sum + score, 0);
      const averageScore = totalScore / questions.length;

      let profile: 'conservative' | 'moderate' | 'aggressive';
      if (averageScore <= 2) {
        profile = 'conservative';
      } else if (averageScore <= 3) {
        profile = 'moderate';
      } else {
        profile = 'aggressive';
      }

      onResult(profile);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HelpCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Quiz de Perfil de Investidor
                </h3>
                <p className="text-sm text-gray-600">
                  Pergunta {currentQuestion + 1} de {questions.length}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Question */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold text-gray-900 mb-6">
              {questions[currentQuestion].question}
            </h4>

            <RadioGroup onValueChange={(value) => handleAnswer(parseInt(value))}>
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAnswer(option.score)}
                  >
                    <RadioGroupItem value={option.score.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
              Este quiz ajuda a identificar seu perfil de risco
            </span>
            <span>
              {Math.round(progress)}% concluído
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RiskProfileQuiz;
