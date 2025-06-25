
-- Add the missing employment_type column to investment_profiles table
ALTER TABLE public.investment_profiles 
ADD COLUMN employment_type text NOT NULL DEFAULT 'clt';

-- Add a check constraint to ensure only valid employment types
ALTER TABLE public.investment_profiles 
ADD CONSTRAINT investment_profiles_employment_type_check 
CHECK (employment_type IN ('clt', 'civil_servant', 'freelancer', 'entrepreneur'));
