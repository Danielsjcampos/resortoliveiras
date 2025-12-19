-- COMPREHENSIVE FIX FOR "Database error querying schema"
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Grant Permissions to Public Schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, service_role;

-- 2. Drop potential problematic triggers on auth.users
-- These often fail if the referenced function has errors or permission issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP FUNCTION IF EXISTS public.create_profile_for_user();

-- 3. Disable RLS on public.users to ensure it's not blocking the login fetch
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 4. Ensure Admin User Exists and Password is Valid
DO $$
DECLARE
    v_user_id uuid;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@oliveiras.com';
    
    IF v_user_id IS NOT NULL THEN
        -- Force update password to 'admin123'
        UPDATE auth.users 
        SET encrypted_password = crypt('admin123', gen_salt('bf')),
            email_confirmed_at = now(),
            raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'
        WHERE id = v_user_id;
    END IF;
END $$;

COMMIT;
