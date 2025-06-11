
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface YieldRate {
  id: string;
  rate_type: string;
  rate_value: number;
  reference_date: string;
  last_update: string;
}

export interface AssetPrice {
  id: string;
  symbol: string;
  price: number;
  currency: string;
  last_update: string;
  source: string;
}

export const useMarketData = () => {
  // Yield rates query - using edge function
  const { data: yieldRates = [] } = useQuery({
    queryKey: ['yield_rates'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-yield-rates');
      if (error) {
        console.log('Error fetching yield rates:', error);
        return [];
      }
      return (data || []) as YieldRate[];
    },
  });

  // Asset prices query - using edge function
  const { data: assetPrices = [] } = useQuery({
    queryKey: ['asset_prices'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-asset-prices');
      if (error) {
        console.log('Error fetching asset prices:', error);
        return [];
      }
      return (data || []) as AssetPrice[];
    },
  });

  return {
    yieldRates,
    assetPrices,
  };
};
