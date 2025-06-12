
-- Criar tabela para armazenar preços de ativos (ações, ETFs, FIIs, moedas, cripto)
CREATE TABLE IF NOT EXISTS public.asset_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  market_type TEXT NOT NULL DEFAULT 'stock',
  price NUMERIC NOT NULL,
  change_percent NUMERIC DEFAULT 0,
  base_currency TEXT DEFAULT NULL,
  quote_currency TEXT DEFAULT 'BRL',
  source TEXT NOT NULL,
  exchange TEXT DEFAULT NULL,
  update_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(symbol, update_date)
);

-- Criar tabela para histórico de taxas de rendimento
CREATE TABLE IF NOT EXISTS public.yield_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rate_type TEXT NOT NULL,
  rate_value NUMERIC NOT NULL,
  reference_date DATE NOT NULL,
  periodicity TEXT DEFAULT 'daily',
  last_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(rate_type, reference_date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_asset_prices_symbol ON asset_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_asset_prices_last_update ON asset_prices(last_update);
CREATE INDEX IF NOT EXISTS idx_asset_prices_market_type ON asset_prices(market_type);
CREATE INDEX IF NOT EXISTS idx_asset_prices_update_date ON asset_prices(update_date);
CREATE INDEX IF NOT EXISTS idx_yield_rates_type ON yield_rates(rate_type);
CREATE INDEX IF NOT EXISTS idx_yield_rates_date ON yield_rates(reference_date);

-- Inserir algumas taxas iniciais se não existirem
INSERT INTO yield_rates (rate_type, rate_value, reference_date, periodicity) 
VALUES 
  ('cdi', 11.25, CURRENT_DATE, 'daily'),
  ('selic', 11.25, CURRENT_DATE, 'daily'),
  ('ipca', 4.50, CURRENT_DATE, 'daily')
ON CONFLICT (rate_type, reference_date) DO NOTHING;

-- Inserir alguns ativos de exemplo para teste
INSERT INTO asset_prices (symbol, market_type, price, change_percent, quote_currency, source, exchange, update_date)
VALUES 
  ('PETR4', 'stock', 35.50, 2.5, 'BRL', 'brapi', 'B3', CURRENT_DATE),
  ('ITUB4', 'stock', 32.80, -1.2, 'BRL', 'brapi', 'B3', CURRENT_DATE),
  ('USD-BRL', 'currency', 5.25, 0.8, 'BRL', 'awesomeapi', NULL, CURRENT_DATE),
  ('EUR-BRL', 'currency', 5.85, 1.1, 'BRL', 'awesomeapi', NULL, CURRENT_DATE);
