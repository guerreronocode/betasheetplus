
import React from "react";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface Props {
  ativosCirculantes: number;
  ativosNaoCirculantes: number;
  passivosCirculantes: number;
  passivosNaoCirculantes: number;
  totalAtivos: number;
  totalPassivos: number;
  patrimonioLiquido: number;
  totalBankBalance: number;
  currentInvestmentValue: number;
  formatCurrency: (v: number) => string;
}

const PatrimonyBalanceHeader: React.FC<Props> = ({
  ativosCirculantes,
  ativosNaoCirculantes,
  passivosCirculantes,
  passivosNaoCirculantes,
  totalAtivos,
  totalPassivos,
  patrimonioLiquido,
  totalBankBalance,
  currentInvestmentValue,
  formatCurrency,
}) => (
  <Card className="p-6 mb-6">
    <div className="flex items-center space-x-3 mb-6">
      <BarChart3 className="w-6 h-6 text-blue-600" />
      <h3 className="text-xl font-bold">Balanço Patrimonial</h3>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-green-600 border-b border-green-200 pb-2">ATIVOS</h4>
        <div className="space-y-3">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-green-800">Circulante</span>
              <span className="font-bold text-green-600">{formatCurrency(ativosCirculantes)}</span>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <div className="flex justify-between">
                <span>Contas bancárias:</span>
                <span>{formatCurrency(totalBankBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span>Outros ativos circulantes:</span>
                <span>{formatCurrency(ativosCirculantes - totalBankBalance)}</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-green-800">Não Circulante</span>
              <span className="font-bold text-green-600">{formatCurrency(ativosNaoCirculantes)}</span>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <div className="flex justify-between">
                <span>Investimentos:</span>
                <span>{formatCurrency(currentInvestmentValue)}</span>
              </div>
              <div className="flex justify-between">
                <span>Outros ativos não circulantes:</span>
                <span>{formatCurrency(ativosNaoCirculantes - currentInvestmentValue)}</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-green-100 rounded-lg border-2 border-green-300">
            <div className="flex justify-between items-center">
              <span className="font-bold text-green-900">TOTAL ATIVOS</span>
              <span className="font-bold text-xl text-green-600">{formatCurrency(totalAtivos)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-red-600 border-b border-red-200 pb-2">PASSIVOS</h4>
        <div className="space-y-3">
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-red-800">Circulante</span>
              <span className="font-bold text-red-600">{formatCurrency(passivosCirculantes)}</span>
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-red-800">Não Circulante</span>
              <span className="font-bold text-red-600">{formatCurrency(passivosNaoCirculantes)}</span>
            </div>
          </div>
          <div className="p-4 bg-red-100 rounded-lg border-2 border-red-300">
            <div className="flex justify-between items-center">
              <span className="font-bold text-red-900">TOTAL PASSIVOS</span>
              <span className="font-bold text-xl text-red-600">{formatCurrency(totalPassivos)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2">PATRIMÔNIO LÍQUIDO</h4>
        <div className="space-y-3">
          <div className="p-6 bg-blue-100 rounded-lg border-2 border-blue-300">
            <div className="text-center">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-blue-900">PATRIMÔNIO LÍQUIDO</span>
                <span className={`font-bold text-2xl ${patrimonioLiquido >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(patrimonioLiquido)}
                </span>
              </div>
              <div className="text-sm text-blue-700 space-y-2">
                <div className="flex justify-between">
                  <span>Total de Ativos:</span>
                  <span className="font-medium">{formatCurrency(totalAtivos)}</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Total de Passivos:</span>
                  <span className="font-medium">({formatCurrency(totalPassivos)})</span>
                </div>
                <hr className="border-blue-300" />
                <div className="flex justify-between font-bold">
                  <span>Patrimônio Líquido:</span>
                  <span className={patrimonioLiquido >= 0 ? 'text-blue-600' : 'text-red-600'}>
                    {formatCurrency(patrimonioLiquido)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Card>
);

export default PatrimonyBalanceHeader;
