
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Calculator, TrendingUp } from 'lucide-react';
import { InvestmentCalculatorService } from '@/services/investmentCalculatorService';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import InvestmentProjectionChart from './InvestmentProjectionChart';

interface InvestmentCalculatorProps {
  onClose: () => void;
}

const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({ onClose }) => {
  const [investmentType, setInvestmentType] = useState('');
  const [rateType, setRateType] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [annualRate, setAnnualRate] = useState('');
  const [periodMonths, setPeriodMonths] = useState('');
  const [results, setResults] = useState<any>(null);

  const investmentTypes = [
    { value: 'cdb', label: 'CDB/LC' },
    { value: 'tesouro', label: 'Títulos Públicos' },
    { value: 'debentures', label: 'Debêntures' },
    { value: 'lci_lca', label: 'LCI/LCA' },
    { value: 'tesouro_direto', label: 'Tesouro Direto' }
  ];

  const rateTypes = [
    { value: 'pre', label: 'Pré-fixado' },
    { value: 'pos', label: 'Pós-fixado (CDI)' },
    { value: 'ipca', label: 'IPCA+' }
  ];

  const handleCalculate = () => {
    if (!initialAmount || !annualRate || !periodMonths) {
      alert('Preencha pelo menos o valor inicial, taxa e prazo');
      return;
    }

    const calculation = InvestmentCalculatorService.calculateInvestment({
      initialAmount: parseFloat(initialAmount) || 0,
      monthlyAmount: parseFloat(monthlyAmount) || 0,
      annualRate: parseFloat(annualRate),
      periodMonths: parseInt(periodMonths)
    });

    setResults(calculation);
  };

  const handleClear = () => {
    setInvestmentType('');
    setRateType('');
    setInitialAmount('');
    setMonthlyAmount('');
    setAnnualRate('');
    setPeriodMonths('');
    setResults(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Calculadora de Investimentos
            </h2>
            <p className="text-sm text-gray-600">
              Simule o crescimento dos seus investimentos
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Parâmetros da Simulação
          </h3>
          
          <div className="space-y-4">
            {/* Tipo de Investimento */}
            <div>
              <Label htmlFor="investment-type">Tipo de Investimento</Label>
              <Select value={investmentType} onValueChange={setInvestmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {investmentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Taxa */}
            <div>
              <Label htmlFor="rate-type">Tipo de Rentabilidade</Label>
              <Select value={rateType} onValueChange={setRateType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pré ou pós-fixado?" />
                </SelectTrigger>
                <SelectContent>
                  {rateTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Valores */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="initial-amount">Investimento Inicial (R$)</Label>
                <Input
                  id="initial-amount"
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label htmlFor="monthly-amount">Aporte Mensal (R$)</Label>
                <Input
                  id="monthly-amount"
                  type="number"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="annual-rate">Rentabilidade (% ao ano)</Label>
                <Input
                  id="annual-rate"
                  type="number"
                  step="0.01"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label htmlFor="period">Prazo (meses)</Label>
                <Input
                  id="period"
                  type="number"
                  value={periodMonths}
                  onChange={(e) => setPeriodMonths(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleCalculate} className="flex-1">
                Calcular Projeção
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Limpar
              </Button>
            </div>
          </div>
        </Card>

        {/* Resultados */}
        {results && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Resultados da Simulação</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 mb-1">Total Investido</div>
                  <div className="text-xl font-bold text-blue-800">
                    {formatCurrency(results.totalInvested)}
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 mb-1">Valor Final</div>
                  <div className="text-xl font-bold text-green-800">
                    {formatCurrency(results.finalAmount)}
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600 mb-1">Rendimento Total</div>
                  <div className="text-xl font-bold text-purple-800">
                    {formatCurrency(results.totalReturn)}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Prazo:</span>
                  <span className="font-semibold">{periodMonths} meses</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxa anual:</span>
                  <span className="font-semibold">{formatPercentage(parseFloat(annualRate))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rentabilidade total:</span>
                  <span className="font-semibold text-green-600">
                    {formatPercentage(results.returnPercentage)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Gráfico */}
      {results && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Evolução do Investimento</h3>
          <InvestmentProjectionChart data={results.monthlyData} />
        </Card>
      )}
    </div>
  );
};

export default InvestmentCalculator;
