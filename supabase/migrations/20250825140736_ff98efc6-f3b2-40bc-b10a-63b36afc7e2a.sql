-- Recriar a view de forma mais segura
DROP VIEW IF EXISTS financial_evolution_data;

CREATE VIEW financial_evolution_data 
WITH (security_barrier = false) AS
WITH monthly_data AS (
  -- Ativos (apenas do usuário logado)
  SELECT 
    user_id,
    DATE_TRUNC('month', created_at) as month_date,
    created_at,
    'asset' as type,
    current_value as value,
    category
  FROM assets
  WHERE current_value > 0 AND user_id = auth.uid()
  
  UNION ALL
  
  -- Investimentos (apenas do usuário logado)
  SELECT 
    user_id,
    DATE_TRUNC('month', created_at) as month_date,
    created_at,
    'investment' as type,
    COALESCE(current_value, amount) as value,
    CASE 
      WHEN liquidity IN ('daily', 'diaria') THEN 'liquid_investment'
      ELSE 'investment'
    END as category
  FROM investments
  WHERE COALESCE(current_value, amount) > 0 AND user_id = auth.uid()
  
  UNION ALL
  
  -- Contas bancárias (apenas do usuário logado)
  SELECT 
    user_id,
    DATE_TRUNC('month', created_at) as month_date,
    created_at,
    'bank_account' as type,
    balance as value,
    'liquid_reserve' as category
  FROM bank_accounts
  WHERE is_active = true AND balance > 0 AND user_id = auth.uid()
  
  UNION ALL
  
  -- Passivos (apenas do usuário logado)
  SELECT 
    user_id,
    DATE_TRUNC('month', created_at) as month_date,
    created_at,
    'liability' as type,
    -remaining_amount as value,
    category
  FROM liabilities
  WHERE remaining_amount > 0 AND user_id = auth.uid()
  
  UNION ALL
  
  -- Dívidas (apenas do usuário logado)
  SELECT 
    user_id,
    DATE_TRUNC('month', created_at) as month_date,
    created_at,
    'debt' as type,
    -remaining_balance as value,
    COALESCE(category, 'debt') as category
  FROM debts
  WHERE remaining_balance > 0 AND user_id = auth.uid()
  
  UNION ALL
  
  -- Parcelas de cartão futuras (apenas do usuário logado)
  SELECT 
    cci.user_id,
    DATE_TRUNC('month', cci.bill_month) as month_date,
    cci.created_at,
    'credit_card_debt' as type,
    -cci.amount as value,
    'cartao_credito' as category
  FROM credit_card_installments cci
  JOIN credit_cards cc ON cci.credit_card_id = cc.id
  WHERE cci.is_paid = false 
    AND cc.is_active = true
    AND cc.add_to_net_worth = true
    AND cci.user_id = auth.uid()
)
SELECT 
  user_id,
  month_date,
  created_at,
  type,
  value,
  category,
  -- Totais por mês
  SUM(CASE WHEN value > 0 THEN value ELSE 0 END) OVER (
    PARTITION BY user_id, month_date
  ) as total_assets,
  
  SUM(CASE WHEN value < 0 THEN ABS(value) ELSE 0 END) OVER (
    PARTITION BY user_id, month_date  
  ) as total_liabilities,
  
  SUM(CASE WHEN category = 'liquid_reserve' OR category = 'liquid_investment' THEN value ELSE 0 END) OVER (
    PARTITION BY user_id, month_date
  ) as liquid_reserves,
  
  SUM(value) OVER (
    PARTITION BY user_id, month_date
  ) as net_worth
FROM monthly_data
WHERE user_id = auth.uid();

-- Garantir que a view seja acessível para usuários autenticados
GRANT SELECT ON financial_evolution_data TO authenticated;