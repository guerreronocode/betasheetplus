-- Criar tabela para armazenar informações dos uploads de extrato
CREATE TABLE public.bank_statement_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  upload_name TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_transactions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.bank_statement_uploads ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their own uploads"
  ON public.bank_statement_uploads
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own uploads"
  ON public.bank_statement_uploads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads"
  ON public.bank_statement_uploads
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads"
  ON public.bank_statement_uploads
  FOR DELETE
  USING (auth.uid() = user_id);

-- Adicionar coluna para referenciar upload nas tabelas de income e expenses
ALTER TABLE public.income 
ADD COLUMN upload_id UUID REFERENCES public.bank_statement_uploads(id) ON DELETE CASCADE;

ALTER TABLE public.expenses 
ADD COLUMN upload_id UUID REFERENCES public.bank_statement_uploads(id) ON DELETE CASCADE;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_bank_statement_uploads_updated_at
BEFORE UPDATE ON public.bank_statement_uploads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();