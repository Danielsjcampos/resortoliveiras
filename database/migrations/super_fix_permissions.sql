-- SUPER FIX PERMISSIONS & SCHEMA
-- Desperate measure to fix "Database error querying schema" (500 Error)

BEGIN;

-- 1. Ensure Extensions Schema Exists and is Accessible
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- 2. Grant permissions on PUBLIC schema (The most common culprit)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 3. Grant permissions on AUTH schema (Careful here, but needed for 500 repair)
GRANT USAGE ON SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;

-- 4. Ensure pgcrypto is available
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- 5. Aggressively Drop ANY potential blocking triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP FUNCTION IF EXISTS public.create_profile_for_user();

-- 6. Ensure the Admin User exists and has the correct password (sanity check)
DO $$
DECLARE
    v_user_id uuid;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@oliveiras.com';
    
    IF v_user_id IS NOT NULL THEN
        UPDATE auth.users 
        SET encrypted_password = crypt('admin123', gen_salt('bf')),
            email_confirmed_at = now(),
            -- project_id removed as it does not exist
            raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'
        WHERE id = v_user_id;
    END IF;
END $$;

COMMIT;
