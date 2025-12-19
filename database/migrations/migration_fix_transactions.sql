-- Add payment_method column to transactions if it doesn't exist
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add created_by column to transactions if it doesn't exist
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS created_by TEXT;
