-- Migration to add missing columns to products table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_room_service BOOLEAN DEFAULT TRUE;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS needs_preparation BOOLEAN DEFAULT FALSE;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS preparation_time INTEGER DEFAULT 0;

-- Optional: Update existing records if needed (defaults handle this, but explicit update can be good)
-- UPDATE public.products SET is_room_service = TRUE WHERE is_room_service IS NULL;
