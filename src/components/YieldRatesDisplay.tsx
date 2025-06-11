
import React from 'react';
import { TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface YieldRate {
  id: string;
  rate_type: string;
  rate_value: number;
  reference_date: string;
  last_update: string;
}

interface YieldRatesDisplayProps {
  yieldRates: YieldRate[];
  isLoading?: boolean;
}

const YieldRatesDisplay: React.FC<YieldRatesDisplayProps> = ({ yieldRates, isLoading }) => {
  const { toast } = useToast();

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const handleRefreshRates = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-yield-rates');
      if (error) throw error;
      
      toast({
        title: 'Taxas atualizadas com sucesso!',
        description: 'As taxas de rendimento foram atualizadas com os dados mais recentes.'
      });
    } catch (error) {
      console.error('Error refreshing rates:', error);
      toast({
        title: 'Erro ao atualizar taxas',
        description: 'Não foi possível atualizar as taxas no momento.',
        variant: 'destructive'
      });
    }
  };

  const getLastUpdateTime = () => {
    if (yieldRates.length === 0) return 'Nunca';
    
    const lastUpdate = yieldRates.reduce((latest, rate) => {
      const rateTime = new Date(rate.last_update).getTime();
      return rateTime > latest ? rateTime : latest;
    }, 0);
    
    return new Date(lastUpdate).toLocaleString('pt-BR');
  };

  const isDataStale = () => {
    if (yieldRates.length === 0) return true;
    
    const lastUpdate = Math.max(...yieldRates.map(rate => new Date(rate.last_update).getTime()));
    const hoursOld = (Date.now() - lastUpdate) / (1000 * 60 * 60);
    
    return hoursOld > 24; // Consider stale if older than 24 hours
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">Taxas de Rendimento Atuais</h3>
          {isDataStale() && (
            <AlertCircle className="w-4 h-4 text-amber-500" title="Dados podem estar desatualizados" />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            Última atualização: {getLastUpdateTime()}
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefreshRates}
            className="text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Atualizar
          </Button>
        </div>
      </div>

      {yieldRates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Nenhuma taxa de rendimento disponível</p>
          <p className="text-sm">Clique em "Atualizar" para buscar as taxas atuais</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {yieldRates.map((rate) => (
            <div 
              key={rate.id} 
              className={`flex justify-between items-center p-4 rounded-lg transition-colors ${
                isDataStale() ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'
              }`}
            >
              <div>
                <span className="font-medium uppercase text-sm">{rate.rate_type}</span>
                <p className="text-xs text-gray-500 mt-1">
                  Ref: {new Date(rate.reference_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <span className="text-lg font-semibold text-green-600">
                {formatPercentage(rate.rate_value)}
              </span>
            </div>
          ))}
        </div>
      )}

      {isDataStale() && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              Os dados podem estar desatualizados. Clique em "Atualizar" para buscar as taxas mais recentes.
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default YieldRatesDisplay;
