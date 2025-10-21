-- Criar bucket para imagens de metas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('goal-images', 'goal-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para goal-images
CREATE POLICY "Usuários podem fazer upload de suas próprias imagens de metas"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'goal-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem atualizar suas próprias imagens de metas"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'goal-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem deletar suas próprias imagens de metas"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'goal-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Imagens de metas são públicas para visualização"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'goal-images');