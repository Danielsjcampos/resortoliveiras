-- FIX PRODUCT PERMISSIONS (RLS)
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS on products (safe to run even if already enabled)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts (clean slate for products)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Public read access" ON public.products;

-- 3. Create permissive policies for the Catalog
-- Allow EVERYONE (including guests/anon) to VIEW products
CREATE POLICY "Enable read access for all users" ON public.products
FOR SELECT USING (true);

-- Allow AUTHENTICATED users (Admins, Staff) to MANAGE products (Insert, Update, Delete)
CREATE POLICY "Enable all modifications for authenticated users" ON public.products
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
