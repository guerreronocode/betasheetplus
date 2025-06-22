
-- Create investment_profiles table
CREATE TABLE public.investment_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  age integer NOT NULL,
  main_objective text NOT NULL,
  risk_profile text NOT NULL CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive')),
  organization_level text NOT NULL CHECK (organization_level IN ('no_reserve', 'building_reserve', 'reserve_completed')),
  monthly_income numeric NOT NULL DEFAULT 0,
  monthly_expenses numeric NOT NULL DEFAULT 0,
  short_term_goals text[] DEFAULT '{}',
  medium_term_goals text[] DEFAULT '{}',
  long_term_goals text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create investment_plans table
CREATE TABLE public.investment_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.investment_profiles(id) ON DELETE CASCADE,
  emergency_reserve_target numeric NOT NULL DEFAULT 0,
  emergency_reserve_current numeric NOT NULL DEFAULT 0,
  short_term_allocation numeric NOT NULL DEFAULT 0,
  medium_term_allocation numeric NOT NULL DEFAULT 0,
  long_term_allocation numeric NOT NULL DEFAULT 0,
  monthly_investment_capacity numeric NOT NULL DEFAULT 0,
  is_emergency_reserve_complete boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.investment_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for investment_profiles
CREATE POLICY "Users can view their own investment profiles"
  ON public.investment_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investment profiles"
  ON public.investment_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investment profiles"
  ON public.investment_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investment profiles"
  ON public.investment_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for investment_plans
CREATE POLICY "Users can view their own investment plans"
  ON public.investment_plans FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.investment_profiles 
    WHERE id = profile_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own investment plans"
  ON public.investment_plans FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.investment_profiles 
    WHERE id = profile_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own investment plans"
  ON public.investment_plans FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.investment_profiles 
    WHERE id = profile_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own investment plans"
  ON public.investment_plans FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.investment_profiles 
    WHERE id = profile_id AND user_id = auth.uid()
  ));

-- Create updated_at triggers
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.investment_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.investment_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
