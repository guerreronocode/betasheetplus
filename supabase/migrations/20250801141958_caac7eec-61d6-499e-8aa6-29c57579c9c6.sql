-- Allow recurring income to be "forever" by making end month nullable
ALTER TABLE public.planned_income 
ALTER COLUMN recurring_end_month DROP NOT NULL;