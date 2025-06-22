
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Target, TrendingUp, Clock } from 'lucide-react';
import { DebtData } from '@/services/debtService';
import { formatCurrency } from '@/utils/formatters';

interface DebtPayoffTrackerProps {
  debts: DebtData[];
  selectedStrategy: 'snowball' | 'avalanche';
  onBackToSimulator: () => void;
  onMarkAsPaid: (debtId: string) => void;
}

const DebtPayoffTracker: React.FC<DebtPayoffTrackerProps> = ({
  debts,
  selectedStrategy,
  onBackToSimulator,
  onMarkAsPaid
}) => {
  // Calcular progresso geral
  const activeDebts = debts.filter(debt => debt.status === 'active');
  const paidDebts = debts.filter(debt => debt.status === 'paid');
  const totalDebts = debts.length;
  const progressPercentage = totalDebts > 0 ? (paidDebts.length / totalDebts) * 100 : 0;

  // Ordenar dívidas de acordo com a estratégia
  const sortedDebts = [...activeDebts].sort((a, b) => {
    if (selectedStrategy === 'snowball') {
      return a.remaining_balance - b.remaining_balance;
    } else {
      // Avalanche - por taxa de juros
      const rateA = a.total_interest_percentage;
      const rateB = b.total_interest_percentage;
      return rateB - rateA;
    }
  });

  const nextDebt = sortedDebts[0];
  const totalRemaining = activeDebts.reduce((sum, debt) => sum + debt.remaining_balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Acompanhamento de Quitação
            </h3>
            <p className="text-sm text-gray-600">
              Estratégia: {selectedStrategy === 'snowball' ? 'Bola de Neve' : 'Avalanche'}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={onBackToSimulator}>
          Voltar ao Simulador
        </Button>
      </div>

      {/* Progresso Geral */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">Progresso Geral</h4>
          <Badge variant="outline" className="px-3 py-1">
            {paidDebts.length}/{totalDebts} Dívidas Quitadas
          </Badge>
        </div>
        
        <Progress value={progressPercentage} className="h-3 mb-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{paidDebts.length}</div>
            <div className="text-gray-600">Dívidas Quitadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{activeDebts.length}</div>
            <div className="text-gray-600">Dívidas Restantes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalRemaining)}
            </div>
            <div className="text-gray-600">Valor Restante</div>
          </div>
        </div>
      </Card>

      {/* Próxima Dívida a Atacar */}
      {nextDebt && (
        <Card className="p-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-blue-600" />
            <h4 className="text-lg font-semibold text-blue-900">
              🎯 Próxima Dívida: Foco Total!
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-gray-900 mb-2">
                {nextDebt.creditor} - {nextDebt.description}
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Saldo atual:</span>
                  <span className="font-semibold">{formatCurrency(nextDebt.remaining_balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Parcela mensal:</span>
                  <span>{formatCurrency(nextDebt.installment_value)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Parcelas restantes:</span>
                  <span>{nextDebt.total_installments - nextDebt.paid_installments}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-600 mb-1">Progresso desta dívida</div>
                <Progress 
                  value={(nextDebt.paid_installments / nextDebt.total_installments) * 100} 
                  className="h-2 mb-2" 
                />
                <div className="text-xs text-gray-500">
                  {nextDebt.paid_installments}/{nextDebt.total_installments} parcelas pagas
                </div>
              </div>
              
              <Button 
                onClick={() => onMarkAsPaid(nextDebt.id!)}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar como Quitada
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de Todas as Dívidas */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Cronograma de Quitação
        </h4>
        
        <div className="space-y-3">
          {/* Dívidas quitadas primeiro */}
          {paidDebts.map((debt, index) => (
            <div key={debt.id} className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {debt.creditor} - {debt.description}
                </div>
                <div className="text-sm text-gray-600">
                  Valor original: {formatCurrency(debt.total_debt_amount)}
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                ✅ Quitada
              </Badge>
            </div>
          ))}
          
          {/* Dívidas ativas ordenadas por estratégia */}
          {sortedDebts.map((debt, index) => (
            <div key={debt.id} className={`flex items-center gap-4 p-3 rounded-lg border-l-4 ${
              index === 0 
                ? 'bg-blue-50 border-blue-400' 
                : 'bg-gray-50 border-gray-300'
            }`}>
              <div className="relative">
                {index === 0 ? (
                  <Target className="w-5 h-5 text-blue-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
                <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {debt.creditor} - {debt.description}
                </div>
                <div className="text-sm text-gray-600">
                  Saldo: {formatCurrency(debt.remaining_balance)} | 
                  Parcela: {formatCurrency(debt.installment_value)} | 
                  Restam: {debt.total_installments - debt.paid_installments} parcelas
                </div>
              </div>
              
              <div className="text-right">
                {index === 0 && (
                  <Badge className="bg-blue-100 text-blue-800 mb-1">
                    🎯 Foco atual
                  </Badge>
                )}
                <div className="text-xs text-gray-500">
                  {selectedStrategy === 'snowball' ? 'Menor saldo' : 'Maior juros'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Motivação e Dicas */}
      <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-yellow-600" />
          <h4 className="font-semibold text-yellow-800">💪 Mantenha o Foco!</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-semibold text-yellow-800 mb-2">Dicas para o Sucesso:</h5>
            <ul className="space-y-1 text-yellow-700">
              <li>• Concentre pagamentos extras na dívida prioritária</li>
              <li>• Evite contrair novas dívidas durante o processo</li>
              <li>• Celebre cada dívida quitada como uma vitória</li>
              <li>• Mantenha o orçamento atualizado</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold text-yellow-800 mb-2">Próximos Marcos:</h5>
            <div className="space-y-1 text-yellow-700">
              {activeDebts.length > 0 && (
                <div>🎯 Quitar {nextDebt?.creditor}</div>
              )}
              {activeDebts.length > 1 && (
                <div>🏃‍♂️ Reduzir para {activeDebts.length - 1} dívidas</div>
              )}
              {activeDebts.length <= 3 && (
                <div>🏆 Menos de 3 dívidas restantes!</div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DebtPayoffTracker;
