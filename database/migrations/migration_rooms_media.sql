
-- ALTERAR TABELA ROOMS PARA SUPORTAR MÍDIA E DESCRIÇÃO
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}';

-- Limpar cache de schema se necessário (Supabase faz autom.)
