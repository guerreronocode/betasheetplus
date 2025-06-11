
-- Adicionar coluna para vincular metas a investimentos
ALTER TABLE goals ADD COLUMN linked_investment_id uuid REFERENCES investments(id);

-- Criar tabela para ativos não financeiros
CREATE TABLE assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  category text NOT NULL, -- casa, carro, joias, etc
  current_value numeric NOT NULL DEFAULT 0,
  purchase_date date DEFAULT CURRENT_DATE,
  purchase_value numeric,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para passivos (dívidas, empréstimos, etc)
CREATE TABLE liabilities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  category text NOT NULL, -- emprestimo, financiamento, cartao_credito, etc
  total_amount numeric NOT NULL,
  remaining_amount numeric NOT NULL,
  interest_rate numeric DEFAULT 0,
  monthly_payment numeric,
  due_date date,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS para as novas tabelas
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para assets
CREATE POLICY "Users can view their own assets" ON assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own assets" ON assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assets" ON assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own assets" ON assets FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para liabilities
CREATE POLICY "Users can view their own liabilities" ON liabilities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own liabilities" ON liabilities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own liabilities" ON liabilities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own liabilities" ON liabilities FOR DELETE USING (auth.uid() = user_id);

-- Criar tabela para histórico de taxas de rendimento (para mostrar evolução)
CREATE TABLE yield_rates_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rate_type text NOT NULL,
  rate_value numeric NOT NULL,
  reference_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Inserir dados históricos das taxas atuais na tabela de histórico
INSERT INTO yield_rates_history (rate_type, rate_value, reference_date)
SELECT rate_type, rate_value, reference_date FROM interest_rates;
