-- 1. Fix Transactions Table (for POS Direct Sales)
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- 2. Fix Rooms Table (for Public Reservations Amenities)
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';

-- 3. Seed some example features if empty
UPDATE public.rooms 
SET features = ARRAY['Café da Manhã', 'Wi-Fi', 'Ar Condicionado', 'TV Smart', 'Frigobar']
WHERE features IS NULL OR features = '{}';

-- 4. Enable RLS on new columns if needed (Optional but safe)
-- (Supabase usually handles column additions fine with existing policies)
