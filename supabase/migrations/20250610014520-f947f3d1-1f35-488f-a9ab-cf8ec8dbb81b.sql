
-- Adicionar campos necessários para yield tracking nos investimentos
ALTER TABLE public.investments 
ADD COLUMN IF NOT EXISTS yield_type TEXT DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS yield_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_yield_update DATE DEFAULT CURRENT_DATE;

-- Criar tabela para contas bancárias
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'checking',
  balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para dados de mercado em tempo real
CREATE TABLE IF NOT EXISTS public.market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  current_price DECIMAL(15,4),
  change_percent DECIMAL(5,2),
  market_cap DECIMAL(20,2),
  volume DECIMAL(20,2),
  last_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_source TEXT DEFAULT 'brapi'
);

-- Criar tabela para taxas de juros do mercado
CREATE TABLE IF NOT EXISTS public.interest_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rate_type TEXT NOT NULL UNIQUE,
  rate_value DECIMAL(8,4) NOT NULL,
  reference_date DATE NOT NULL,
  last_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para definições de conquistas
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  icon TEXT NOT NULL,
  criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campos extras para user_stats
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS consecutive_days_accessed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_transactions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS positive_balance_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS goals_completed INTEGER DEFAULT 0;

-- Adicionar campo para vincular transações a contas bancárias
ALTER TABLE public.income 
ADD COLUMN IF NOT EXISTS bank_account_id UUID REFERENCES public.bank_accounts(id);

ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS bank_account_id UUID REFERENCES public.bank_accounts(id);

ALTER TABLE public.investments 
ADD COLUMN IF NOT EXISTS bank_account_id UUID REFERENCES public.bank_accounts(id);

-- Habilitar RLS para novas tabelas
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interest_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para bank_accounts
CREATE POLICY "Users can view their own bank accounts" 
  ON public.bank_accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bank accounts" 
  ON public.bank_accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts" 
  ON public.bank_accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank accounts" 
  ON public.bank_accounts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para market_data (dados públicos)
CREATE POLICY "Anyone can view market data" 
  ON public.market_data 
  FOR SELECT 
  USING (true);

-- Políticas RLS para interest_rates (dados públicos)
CREATE POLICY "Anyone can view interest rates" 
  ON public.interest_rates 
  FOR SELECT 
  USING (true);

-- Políticas RLS para achievement_definitions (dados públicos)
CREATE POLICY "Anyone can view achievement definitions" 
  ON public.achievement_definitions 
  FOR SELECT 
  USING (true);

-- Inserir dados iniciais para taxas de juros
INSERT INTO public.interest_rates (rate_type, rate_value, reference_date) VALUES
('CDI', 10.65, CURRENT_DATE),
('SELIC', 10.75, CURRENT_DATE),
('IPCA', 4.50, CURRENT_DATE)
ON CONFLICT (rate_type) DO UPDATE SET
  rate_value = EXCLUDED.rate_value,
  reference_date = EXCLUDED.reference_date,
  last_update = now();

-- Inserir conquistas iniciais (50+ conquistas)
INSERT INTO public.achievement_definitions (id, title, description, category, points, icon, criteria) VALUES
-- Primeiros passos
('first_income', 'Primeira Receita', 'Registrou sua primeira receita', 'primeiros_passos', 10, '💰', '{"type": "first_transaction", "transaction_type": "income"}'),
('first_expense', 'Primeira Despesa', 'Registrou sua primeira despesa', 'primeiros_passos', 10, '💸', '{"type": "first_transaction", "transaction_type": "expense"}'),
('first_investment', 'Primeiro Investimento', 'Fez seu primeiro investimento', 'primeiros_passos', 15, '📈', '{"type": "first_transaction", "transaction_type": "investment"}'),
('first_goal', 'Primeira Meta', 'Criou sua primeira meta financeira', 'primeiros_passos', 10, '🎯', '{"type": "first_goal"}'),
('profile_complete', 'Perfil Completo', 'Completou seu perfil', 'primeiros_passos', 5, '👤', '{"type": "profile_complete"}'),

-- Metas e objetivos
('goal_10_percent', 'Meta 10%', 'Alcançou 10% de uma meta', 'metas', 15, '🎯', '{"type": "goal_progress", "percentage": 10}'),
('goal_25_percent', 'Meta 25%', 'Alcançou 25% de uma meta', 'metas', 20, '🎯', '{"type": "goal_progress", "percentage": 25}'),
('goal_50_percent', 'Meta 50%', 'Alcançou 50% de uma meta', 'metas', 30, '🎯', '{"type": "goal_progress", "percentage": 50}'),
('goal_75_percent', 'Meta 75%', 'Alcançou 75% de uma meta', 'metas', 40, '🎯', '{"type": "goal_progress", "percentage": 75}'),
('goal_completed', 'Meta Concluída', 'Completou sua primeira meta', 'metas', 50, '🏆', '{"type": "goal_completed"}'),
('three_goals', 'Três Metas', 'Criou 3 metas diferentes', 'metas', 25, '🎯', '{"type": "goal_count", "count": 3}'),
('five_goals', 'Cinco Metas', 'Criou 5 metas diferentes', 'metas', 35, '🎯', '{"type": "goal_count", "count": 5}'),

-- Investimentos
('invest_100', 'Investidor Iniciante', 'Investiu R$ 100', 'investimentos', 15, '💎', '{"type": "investment_total", "amount": 100}'),
('invest_500', 'Investidor Dedicado', 'Investiu R$ 500', 'investimentos', 25, '💎', '{"type": "investment_total", "amount": 500}'),
('invest_1000', 'Investidor Sério', 'Investiu R$ 1.000', 'investimentos', 40, '💎', '{"type": "investment_total", "amount": 1000}'),
('invest_5000', 'Grande Investidor', 'Investiu R$ 5.000', 'investimentos', 60, '💎', '{"type": "investment_total", "amount": 5000}'),
('invest_10000', 'Investidor Elite', 'Investiu R$ 10.000', 'investimentos', 100, '💎', '{"type": "investment_total", "amount": 10000}'),
('diversified_portfolio', 'Portfolio Diversificado', 'Possui 5 tipos de investimento diferentes', 'investimentos', 50, '📊', '{"type": "investment_diversity", "count": 5}'),
('stock_investor', 'Investidor em Ações', 'Comprou sua primeira ação', 'investimentos', 30, '📈', '{"type": "investment_type", "investment_type": "stocks"}'),

-- Frequência e disciplina
('daily_access_7', 'Semana Completa', 'Acessou o app por 7 dias seguidos', 'disciplina', 30, '📅', '{"type": "consecutive_days", "days": 7}'),
('daily_access_15', 'Quinzena Completa', 'Acessou o app por 15 dias seguidos', 'disciplina', 50, '📅', '{"type": "consecutive_days", "days": 15}'),
('daily_access_30', 'Mês Completo', 'Acessou o app por 30 dias seguidos', 'disciplina', 100, '📅', '{"type": "consecutive_days", "days": 30}'),
('transaction_streak_7', 'Organizador Semanal', 'Registrou transações por 7 dias seguidos', 'disciplina', 25, '📝', '{"type": "transaction_streak", "days": 7}'),
('transaction_streak_30', 'Organizador Mensal', 'Registrou transações por 30 dias seguidos', 'disciplina', 75, '📝', '{"type": "transaction_streak", "days": 30}'),

-- Controle financeiro
('positive_balance_7', 'Saldo Positivo Semanal', 'Manteve saldo positivo por 7 dias', 'controle', 20, '🟢', '{"type": "positive_balance_days", "days": 7}'),
('positive_balance_30', 'Saldo Positivo Mensal', 'Manteve saldo positivo por 30 dias', 'controle', 60, '🟢', '{"type": "positive_balance_days", "days": 30}'),
('balanced_budget', 'Orçamento Equilibrado', 'Receitas >= Despesas no mês', 'controle', 30, '⚖️', '{"type": "balanced_budget"}'),
('expense_control', 'Controlador de Gastos', 'Reduziu despesas em 10% no mês', 'controle', 40, '📉', '{"type": "expense_reduction", "percentage": 10}'),
('savings_rate_10', 'Poupador 10%', 'Poupou 10% da renda mensal', 'controle', 25, '🐷', '{"type": "savings_rate", "percentage": 10}'),
('savings_rate_20', 'Poupador 20%', 'Poupou 20% da renda mensal', 'controle', 50, '🐷', '{"type": "savings_rate", "percentage": 20}'),

-- Volume de transações
('transactions_10', 'Organizador Ativo', 'Registrou 10 transações', 'transacoes', 15, '📊', '{"type": "transaction_count", "count": 10}'),
('transactions_50', 'Organizador Dedicado', 'Registrou 50 transações', 'transacoes', 35, '📊', '{"type": "transaction_count", "count": 50}'),
('transactions_100', 'Organizador Expert', 'Registrou 100 transações', 'transacoes', 60, '📊', '{"type": "transaction_count", "count": 100}'),
('transactions_500', 'Organizador Master', 'Registrou 500 transações', 'transacoes', 100, '📊', '{"type": "transaction_count", "count": 500}'),

-- Categorização
('categorized_expenses', 'Categorizador', 'Categorizou todas as despesas do mês', 'organizacao', 20, '🏷️', '{"type": "categorized_transactions"}'),
('multiple_accounts', 'Multi-Contas', 'Criou 3 contas bancárias diferentes', 'organizacao', 25, '🏦', '{"type": "bank_account_count", "count": 3}'),
('account_organizer', 'Organizador de Contas', 'Organizou todas as contas bancárias', 'organizacao', 30, '🏦', '{"type": "accounts_organized"}'),

-- Patrimônio líquido
('net_worth_1000', 'Patrimônio R$ 1K', 'Atingiu patrimônio líquido de R$ 1.000', 'patrimonio', 30, '💰', '{"type": "net_worth", "amount": 1000}'),
('net_worth_5000', 'Patrimônio R$ 5K', 'Atingiu patrimônio líquido de R$ 5.000', 'patrimonio', 50, '💰', '{"type": "net_worth", "amount": 5000}'),
('net_worth_10000', 'Patrimônio R$ 10K', 'Atingiu patrimônio líquido de R$ 10.000', 'patrimonio', 75, '💰', '{"type": "net_worth", "amount": 10000}'),
('net_worth_25000', 'Patrimônio R$ 25K', 'Atingiu patrimônio líquido de R$ 25.000', 'patrimonio', 100, '💰', '{"type": "net_worth", "amount": 25000}'),
('net_worth_50000', 'Patrimônio R$ 50K', 'Atingiu patrimônio líquido de R$ 50.000', 'patrimonio', 150, '💰', '{"type": "net_worth", "amount": 50000}'),

-- Milestones especiais
('first_month', 'Primeiro Mês', 'Completou um mês usando o app', 'milestones', 40, '🎉', '{"type": "app_usage_days", "days": 30}'),
('financial_planner', 'Planejador Financeiro', 'Criou meta para mais de 6 meses', 'milestones', 35, '📋', '{"type": "long_term_goal"}'),
('debt_free', 'Livre de Dívidas', 'Quitou todas as dívidas', 'milestones', 75, '🆓', '{"type": "debt_free"}'),
('emergency_fund', 'Reserva de Emergência', 'Criou reserva para 6 meses', 'milestones', 100, '🛡️', '{"type": "emergency_fund"}'),

-- Rendimentos
('first_yield', 'Primeiro Rendimento', 'Recebeu seu primeiro rendimento', 'rendimentos', 20, '📈', '{"type": "first_yield"}'),
('monthly_yield', 'Rendimento Mensal', 'Recebeu rendimentos por 3 meses seguidos', 'rendimentos', 40, '📈', '{"type": "monthly_yield", "months": 3}'),
('compound_interest', 'Juros Compostos', 'Reinvestiu rendimentos automaticamente', 'rendimentos', 50, '🔄', '{"type": "compound_interest"}'),

-- Educação financeira
('financial_score_700', 'Score 700+', 'Atingiu score financeiro de 700+', 'educacao', 30, '📊', '{"type": "financial_score", "score": 700}'),
('financial_score_800', 'Score 800+', 'Atingiu score financeiro de 800+', 'educacao', 50, '📊', '{"type": "financial_score", "score": 800}'),
('budget_master', 'Mestre do Orçamento', 'Manteve orçamento equilibrado por 3 meses', 'educacao', 75, '👑', '{"type": "budget_streak", "months": 3}'),

-- Conquistas especiais
('early_bird', 'Madrugador', 'Acessou o app antes das 6h', 'especiais', 10, '🌅', '{"type": "early_access"}'),
('night_owl', 'Coruja', 'Acessou o app depois das 23h', 'especiais', 10, '🦉', '{"type": "late_access"}'),
('weekend_warrior', 'Guerreiro do Fim de Semana', 'Registrou transação no fim de semana', 'especiais', 15, '⚔️', '{"type": "weekend_transaction"}'),
('perfect_month', 'Mês Perfeito', 'Atingiu todas as metas do mês', 'especiais', 100, '✨', '{"type": "perfect_month"}')

ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  points = EXCLUDED.points,
  icon = EXCLUDED.icon,
  criteria = EXCLUDED.criteria;

-- Função para atualizar saldos automaticamente
CREATE OR REPLACE FUNCTION update_investment_yields()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Atualizar rendimentos baseado na taxa e tempo
  UPDATE public.investments 
  SET current_value = amount * (1 + (yield_rate / 100) * EXTRACT(days FROM (CURRENT_DATE - purchase_date)) / 365),
      last_yield_update = CURRENT_DATE
  WHERE yield_type IN ('fixed', 'cdi', 'selic', 'ipca') 
    AND last_yield_update < CURRENT_DATE;
END;
$$;
