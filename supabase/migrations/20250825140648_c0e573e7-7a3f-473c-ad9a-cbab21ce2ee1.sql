-- Habilitar RLS na view e criar políticas de segurança
ALTER VIEW financial_evolution_data SET (security_barrier = true);

-- Criar política RLS para a view
CREATE POLICY "Users can view their own financial evolution data" 
ON financial_evolution_data 
FOR SELECT 
USING (auth.uid() = user_id);

-- Habilitar RLS na view
ALTER VIEW financial_evolution_data ENABLE ROW LEVEL SECURITY;