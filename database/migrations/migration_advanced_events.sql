-- Add new columns to event_requests
ALTER TABLE public.event_requests 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS organizer_name TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS catering_options TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_cost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_terms TEXT,
ADD COLUMN IF NOT EXISTS is_public_ticket BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ticket_price DECIMAL(10,2) DEFAULT 0;

-- Create event_participants table
CREATE TABLE IF NOT EXISTS public.event_participants (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES public.event_requests(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    cpf TEXT,
    status TEXT DEFAULT 'Pendente', -- Pendente, Confirmado, Cancelado, Presente
    ticket_purchased BOOLEAN DEFAULT FALSE,
    purchase_date TIMESTAMP WITH TIME ZONE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for participants
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users" ON public.event_participants
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable insert for anon users (public sales)" ON public.event_participants
FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Enable read for anon users (public sales confirmation)" ON public.event_participants
FOR SELECT TO anon USING (true);
