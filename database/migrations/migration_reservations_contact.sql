-- Add guest_contact column to reservations table
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS guest_contact TEXT;

-- Add email column to reservations table (optional but good for redundancy)
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS guest_email TEXT;
