
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import InvestmentProjectionChart from './InvestmentProjectionChart';
import { InvestmentCalculatorService, InvestmentProjection } from '@/services/investmentCalculatorService';

interface InvestmentCalculatorProps {
  onClose?: () => void;
}

const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    investmentType: '',
    yieldType: '',
    initialAmount: '',
    monthlyAmount: '',
    annualRate: '',
    timeInMonths: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const projection = useMemo(() => {
    if (!formData.initialAmount || !formData.annualRate || !formData.timeInMonths) {
      return null;
    }

    return InvestmentCalculatorService.calculateProjection({
      investmentType: formData.investmentType,
      yieldType: formData.yieldType as 'fixed' | 'selic' | 'cdi' | 'ipca',
      initialAmount: parseFloat(formData.initialAmount),
      monthlyAmount: parseFloat(formData.monthlyAmount || '0'),
      annualRate: parseFloat(formData.annualRate),
      timeInMonths: parseInt(formData.timeInMonths),
    });
  }, [formData]);

  const isFormValid = formData.initialAmount && formData.annualRate && formData.timeInMonths;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Calculadora de Investimentos
              </h3>
              <p className="text-sm text-gray-600">
                Simule seus investimentos e veja projeções futuras
              </p>
            </div>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Voltar
            </Button>
          )}
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="investmentType">Tipo de Investimento</Label>
              <Select 
                value={formData.investmentType} 
                onValueChange={(value) => handleInputChange('investmentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cdb">CDB/LC</SelectItem>
                  <SelectItem value="lci_lca">LCI/LCA</SelectItem>
                  <SelectItem value="tesouro">Tesouro Direto</SelectItem>
                  <SelectItem value="debentures">Debêntures</SelectItem>
                  <SelectItem value="cri_cra">CRI/CRA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="yieldType">Tipo de Rentabilidade</Label>
              <Select 
                value={formData.yieldType} 
                onValueChange={(value) => handleInputChange('yieldType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Pré-fixado</SelectItem>
                  <SelectItem value="selic">Pós-fixado (SELIC)</SelectItem>
                  <SelectItem value="cdi">Pós-fixado (CDI)</SelectItem>
                  <SelectItem value="ipca">IPCA+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="initialAmount">Investimento Inicial (R$)</Label>
              <Input
                id="initialAmount"
                type="number"
                step="0.01"
                value={formData.initialAmount}
                onChange={(e) => handleInputChange('initialAmount', e.target.value)}
                placeholder="1000.00"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="monthlyAmount">Aporte Mensal (R$)</Label>
              <Input
                id="monthlyAmount"
                type="number"
                step="0.01"
                value={formData.monthlyAmount}
                onChange={(e) => handleInputChange('monthlyAmount', e.target.value)}
                placeholder="500.00"
              />
            </div>

            <div>
              <Label htmlFor="annualRate">Rentabilidade Anual (%)</Label>
              <Input
                id="annualRate"
                type="number"
                step="0.01"
                value={formData.annualRate}
                onChange={(e) => handleInputChange('annualRate', e.target.value)}
                placeholder="12.50"
              />
            </div>

            <div>
              <Label htmlFor="timeInMonths">Prazo (meses)</Label>
              <Input
                id="timeInMonths"
                type="number"
                value={formData.timeInMonths}
                onChange={(e) => handleInputChange('timeInMonths', e.target.value)}
                placeholder="24"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {isFormValid && projection && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm text-gray-600">Valor Final</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(projection.finalAmount)}
              </div>
            </Card>

            <Card className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-600">Total Investido</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(projection.totalInvested)}
              </div>
            </Card>

            <Card className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-sm text-gray-600">Rendimento</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(projection.totalYield)}
              </div>
            </Card>
          </div>

          {/* Chart */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Evolução do Investimento</h4>
            <InvestmentProjectionChart data={projection.monthlyData} />
          </Card>

          {/* Detailed Analysis */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Análise Detalhada</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Investimento inicial:</span>
                  <span className="font-semibold">{formatCurrency(projection.initialAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aportes mensais:</span>
                  <span className="font-semibold">{formatCurrency(projection.monthlyAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prazo:</span>
                  <span className="font-semibold">{projection.timeInMonths} meses</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa anual:</span>
                  <span className="font-semibold">{projection.annualRate}%</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de aportes:</span>
                  <span className="font-semibold">{formatCurrency(projection.totalInvested)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rendimento total:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(projection.totalYield)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rentabilidade:</span>
                  <span className="font-semibold text-blue-600">{projection.yieldPercentage.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor final:</span>
                  <span className="font-semibold text-purple-600">{formatCurrency(projection.finalAmount)}</span>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default InvestmentCalculator;
