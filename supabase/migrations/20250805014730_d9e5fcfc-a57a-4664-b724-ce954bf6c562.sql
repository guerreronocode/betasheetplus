-- Create table for planned expenses (similar to planned_income)
CREATE TABLE public.planned_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month DATE NOT NULL,
  planned_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_start_month DATE,
  recurring_end_month DATE,
  description TEXT,
  category TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.planned_expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for planned_expenses
CREATE POLICY "Users can manage their own planned expenses" 
ON public.planned_expenses 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_planned_expenses_updated_at
BEFORE UPDATE ON public.planned_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();