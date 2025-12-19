-- Add features column to rooms table if it doesn't exist
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';

-- Optional: Seed some features for existing rooms (Update logic as needed)
UPDATE public.rooms 
SET features = ARRAY['Café da Manhã', 'Wi-Fi', 'Ar Condicionado', 'TV Smart', 'Frigobar']
WHERE features IS NULL OR features = '{}';
