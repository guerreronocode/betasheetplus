-- Criar tabela para cofres das contas bancárias
CREATE TABLE public.bank_account_vaults (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bank_account_id UUID NOT NULL,
  name TEXT NOT NULL,
  reserved_amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#10B981',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.bank_account_vaults ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their own vaults" 
ON public.bank_account_vaults 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vaults" 
ON public.bank_account_vaults 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vaults" 
ON public.bank_account_vaults 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vaults" 
ON public.bank_account_vaults 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_bank_account_vaults_updated_at
BEFORE UPDATE ON public.bank_account_vaults
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();