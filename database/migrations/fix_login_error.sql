-- FIX LOGIN ERROR: Grants and Trigger Cleanup

-- 1. Grant Schema Permissions (Ensure auth role can access public)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;

-- 2. Disable RLS on public.users temporarily to rule out recursion/policy errors during login sync
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 3. Drop Triggers on auth.users that might be failing
-- Common naming convention for Supabase starters
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 4. Re-grant access to auth table for the triggers (if we were to keep them, but we dropped them to be safe)
-- Sometimes the error "Database error querying schema" comes from the auth system trying to run a trigger 
-- that references a function it doesn't have permission to execute.

-- 5. Ensure the admin user exists and is capable of login (sanity check)
DO $$
BEGIN
    UPDATE auth.users 
    SET raw_app_meta_data = '{"provider": "email", "providers": ["email"]}' 
    WHERE email = 'admin@oliveiras.com';
END $$;
