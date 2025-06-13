
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface YieldRate {
  id: string;
  rate_type: string;
  rate_value: number;
  reference_date: string;
  periodicity?: string;
  last_update: string;
}

export interface AssetPrice {
  id: string;
  symbol: string;
  market_type: string;
  price: number;
  change_percent: number;
  base_currency?: string;
  quote_currency: string;
  source: string;
  exchange?: string;
  update_date: string;
  last_update: string;
}

export const useMarketData = () => {
  // Enhanced yield rates query with better cache management
  const { data: yieldRates = [], isLoading: yieldRatesLoading } = useQuery({
    queryKey: ['yield_rates'],
    queryFn: async () => {
      console.log('Fetching yield rates data...')
      const { data, error } = await supabase.functions.invoke('get-yield-rates');
      if (error) {
        console.log('Error fetching yield rates:', error);
        return [];
      }
      console.log('Yield rates data received:', data?.length || 0, 'rates')
      return (data || []) as YieldRate[];
    },
    staleTime: 1000 * 60 * 60 * 6, // 6 hours cache
    gcTime: 1000 * 60 * 60 * 24, // 24 hours in cache
  });

  // Enhanced asset prices query with better cache management
  const { data: assetPrices = [], isLoading: assetPricesLoading } = useQuery({
    queryKey: ['asset_prices'],
    queryFn: async () => {
      console.log('Fetching asset prices data...')
      const { data, error } = await supabase.functions.invoke('get-asset-prices');
      if (error) {
        console.log('Error fetching asset prices:', error);
        return [];
      }
      console.log('Asset prices data received:', data?.length || 0, 'assets')
      return (data || []) as AssetPrice[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache for asset prices
    gcTime: 1000 * 60 * 60 * 4, // 4 hours in cache
  });

  // Helper functions to analyze the enhanced data
  const getStockCount = () => assetPrices.filter(asset => asset.market_type === 'stock').length;
  const getCurrencyCount = () => assetPrices.filter(asset => asset.market_type === 'currency').length;
  
  const getYieldRateByType = (type: string) => yieldRates.find(rate => rate.rate_type === type);
  
  const getAssetsByMarketType = (marketType: string) => 
    assetPrices.filter(asset => asset.market_type === marketType);

  return {
    yieldRates,
    assetPrices,
    isLoading: yieldRatesLoading || assetPricesLoading,
    
    // Enhanced analytics
    stockCount: getStockCount(),
    currencyCount: getCurrencyCount(),
    
    // Helper functions
    getYieldRateByType,
    getAssetsByMarketType,
    
    // Market segments
    stocks: getAssetsByMarketType('stock'),
    currencies: getAssetsByMarketType('currency'),
  };
};
