-- DEFINITIVE FIX FOR "DATABASE ERROR QUERYING SCHEMA"
-- 1. Run this in Supabase SQL Editor.
-- 2. Try to login with admin@oliveiras.com / admin123

BEGIN;

-- 1. FIX SEARCH PATH (Often the cause of 'schema' errors)
ALTER ROLE anon SET search_path = public, extensions;
ALTER ROLE authenticated SET search_path = public, extensions;
ALTER ROLE service_role SET search_path = public, extensions;
ALTER ROLE postgres SET search_path = public, extensions;

-- 2. GRANT PERMISSIONS
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 3. DROP ALL TRIGGERS ON AUTH.USERS (To remove broken logic)
DO $$ 
DECLARE 
    _sql text;
BEGIN
    SELECT string_agg(format('DROP TRIGGER IF EXISTS %I ON auth.users;', trigger_name), E'\n')
    INTO _sql
    FROM information_schema.triggers
    WHERE event_object_schema = 'auth' AND event_object_table = 'users';

    IF _sql IS NOT NULL THEN
        EXECUTE _sql;
    END IF;
END $$;

-- 4. MANUALLY FIX ADMIN USER
DELETE FROM public.users WHERE email = 'admin@oliveiras.com';
DELETE FROM auth.users WHERE email = 'admin@oliveiras.com';

-- Insert into auth
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Fixed ID for consistency
    'admin@oliveiras.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    'authenticated',
    'authenticated',
    now(),
    now()
);

-- Ensure Role (Manual check to avoid constraint error)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'Administrador Master') THEN
        INSERT INTO public.roles (name, permissions, description)
        VALUES ('Administrador Master', '["all"]', 'Acesso Total');
    END IF;
END $$;

-- Insert into public
INSERT INTO public.users (id, name, email, role_id, active, avatar)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Admin Master',
    'admin@oliveiras.com',
    (SELECT id FROM public.roles WHERE name = 'Administrador Master' LIMIT 1),
    true,
    'https://ui-avatars.com/api/?name=Admin+Master'
);

COMMIT;
