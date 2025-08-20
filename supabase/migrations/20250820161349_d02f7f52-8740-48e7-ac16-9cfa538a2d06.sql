-- Remove the current_amount column from goals table since it will be calculated
ALTER TABLE goals DROP COLUMN IF EXISTS current_amount;

-- Create a table to link goals with bank account vaults and investments
CREATE TABLE goal_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  link_type TEXT NOT NULL CHECK (link_type IN ('vault', 'investment')),
  vault_id UUID REFERENCES bank_account_vaults(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure only one of vault_id or investment_id is set based on link_type
  CONSTRAINT check_vault_or_investment CHECK (
    (link_type = 'vault' AND vault_id IS NOT NULL AND investment_id IS NULL) OR
    (link_type = 'investment' AND investment_id IS NOT NULL AND vault_id IS NULL)
  )
);

-- Enable RLS on goal_links
ALTER TABLE goal_links ENABLE ROW LEVEL SECURITY;

-- Create policies for goal_links
CREATE POLICY "Users can manage their own goal links" ON goal_links
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_goal_links_updated_at
  BEFORE UPDATE ON goal_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Remove the linked_investment_id column from goals since we'll use the new table
ALTER TABLE goals DROP COLUMN IF EXISTS linked_investment_id;