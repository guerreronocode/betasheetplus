-- Adicionar campo de imagem às metas
ALTER TABLE goals ADD COLUMN IF NOT EXISTS image_url TEXT;