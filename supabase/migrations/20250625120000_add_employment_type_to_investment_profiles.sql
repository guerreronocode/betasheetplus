
-- Add employment_type column to investment_profiles table
ALTER TABLE public.investment_profiles 
ADD COLUMN employment_type text NOT NULL DEFAULT 'clt';

-- Add check constraint to ensure valid employment types
ALTER TABLE public.investment_profiles 
ADD CONSTRAINT employment_type_check 
CHECK (employment_type IN ('clt', 'civil_servant', 'freelancer', 'entrepreneur'));

-- Update RLS policies if needed (they should already be in place)
