
import React, { useMemo } from 'react';
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useMarketData } from '@/hooks/useMarketData';

const AssetPricesPanel = () => {
  const { assetPrices } = useMarketData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Remove duplicates and get unique assets by symbol, then sort by market value (price)
  const uniqueAssets = useMemo(() => {
    const seen = new Set();
    return assetPrices
      .filter(asset => {
        if (seen.has(asset.symbol)) {
          return false;
        }
        seen.add(asset.symbol);
        return true;
      })
      .filter(asset => asset.market_type === 'stock');
  }, [assetPrices]);

  // Get top 5 assets by price (market value proxy)
  const topAssets = useMemo(() => {
    return uniqueAssets
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);
  }, [uniqueAssets]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold">Preços de Ativos</h3>
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Assets List */}
      <div className="space-y-3">
        {topAssets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Carregando dados de ativos...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-3">
              Top 5 ativos com maior valor de mercado:
            </p>
            {topAssets.map((asset) => (
              <div
                key={`${asset.symbol}-${asset.id}`}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-lg">{asset.symbol}</span>
                  <span className="text-sm text-gray-600">{asset.exchange}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(asset.price)}</p>
                  <div className="flex items-center space-x-1">
                    {asset.change_percent >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm ${asset.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {asset.change_percent >= 0 ? '+' : ''}{asset.change_percent.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{asset.source}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </Card>
  );
};

export default AssetPricesPanel;
