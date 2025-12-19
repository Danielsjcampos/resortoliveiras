
-- Garantir que a tabela rooms exista e tenha as colunas necessárias
CREATE TABLE IF NOT EXISTS public.rooms (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    type text NOT NULL,
    capacity integer NOT NULL,
    price numeric NOT NULL,
    status text NOT NULL DEFAULT 'Disponível',
    bed_config jsonb DEFAULT NULL,
    description text,
    images text[] DEFAULT '{}',
    features text[] DEFAULT '{}'
);

-- Atualizar status de texto se houver inconsistência (Manutenção sem acento vs com acento)
UPDATE public.rooms SET status = 'Manutenção' WHERE status = 'Manutencao';

-- Garantir que as colunas existam mesmo se a tabela já existia
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}';

-- Forçar RLS (Row Level Security) para permitir updates
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados façam tudo (simplificado)
DROP POLICY IF EXISTS "Public Full Access Rooms" ON public.rooms;
CREATE POLICY "Public Full Access Rooms" ON public.rooms FOR ALL USING (true) WITH CHECK (true);
