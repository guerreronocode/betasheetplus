-- Add bank_account_id column to recurring_transactions table if it doesn't exist
-- and make it nullable initially to not break existing data
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recurring_transactions' 
        AND column_name = 'bank_account_id'
    ) THEN
        ALTER TABLE public.recurring_transactions 
        ADD COLUMN bank_account_id UUID REFERENCES public.bank_accounts(id);
    END IF;
END $$;