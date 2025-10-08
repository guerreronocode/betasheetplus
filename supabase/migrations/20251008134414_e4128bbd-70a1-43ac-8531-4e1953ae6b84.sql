-- Corrigir valores zerados de applied_value na tabela investment_monthly_values
-- Isso aconteceu porque alguns registros foram criados incorretamente

-- Para cada investment_monthly_values com applied_value = 0, 
-- tentar inferir o valor correto baseado no mês anterior ou valor inicial do investimento

DO $$
DECLARE
  rec RECORD;
  prev_applied NUMERIC;
  initial_amount NUMERIC;
BEGIN
  -- Processar cada registro com applied_value zerado
  FOR rec IN 
    SELECT imv.id, imv.user_id, imv.investment_id, imv.month_date, imv.total_value
    FROM investment_monthly_values imv
    WHERE imv.applied_value = 0 AND imv.total_value > 0
    ORDER BY imv.investment_id, imv.month_date
  LOOP
    -- Buscar o valor inicial do investimento
    SELECT amount INTO initial_amount
    FROM investments
    WHERE id = rec.investment_id;
    
    -- Buscar o applied_value do mês anterior
    SELECT applied_value INTO prev_applied
    FROM investment_monthly_values
    WHERE investment_id = rec.investment_id
      AND month_date < rec.month_date
      AND applied_value > 0
    ORDER BY month_date DESC
    LIMIT 1;
    
    -- Se encontrou valor anterior, usar ele; senão usar valor inicial
    IF prev_applied IS NOT NULL THEN
      UPDATE investment_monthly_values
      SET applied_value = prev_applied,
          yield_value = total_value - prev_applied,
          updated_at = now()
      WHERE id = rec.id;
      
      RAISE NOTICE 'Updated record % with previous applied value: %', rec.id, prev_applied;
    ELSIF initial_amount IS NOT NULL THEN
      UPDATE investment_monthly_values
      SET applied_value = initial_amount,
          yield_value = total_value - initial_amount,
          updated_at = now()
      WHERE id = rec.id;
      
      RAISE NOTICE 'Updated record % with initial amount: %', rec.id, initial_amount;
    END IF;
  END LOOP;
END $$;

-- Adicionar constraint para evitar applied_value negativo
ALTER TABLE investment_monthly_values
ADD CONSTRAINT check_applied_value_non_negative
CHECK (applied_value >= 0);

-- Adicionar índice composto para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_investment_monthly_values_inv_month 
ON investment_monthly_values(investment_id, month_date DESC);