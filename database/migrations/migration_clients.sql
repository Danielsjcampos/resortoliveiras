
-- Create Clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    cpf text,
    birth_date date,
    notes text,
    dependents jsonb DEFAULT '[]', -- Array of {name, age, relationship}
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policy (Public Access for now per existing pattern)
DROP POLICY IF EXISTS "Public Full Access Clients" ON public.clients;
CREATE POLICY "Public Full Access Clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

-- Update Reservations table to link to Clients
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS client_id text REFERENCES public.clients(id);
-- Also ensure guests column exists in reservations if not already (user asked for guest count breakdown)
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS guests_details jsonb DEFAULT '{}'; 
-- guests_details could store breakdown like { adults: 2, children: 1, ages: [5] }

-- Add current_guest_name to rooms for quick display
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS current_guest_name text;

