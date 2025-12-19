-- ULTIMATE LOGIN REPAIR
-- Manual User Insertion avoiding the broken API endpoints.

BEGIN;

-- 1. Clean Permissions
GRANT USAGE ON SCHEMA public, auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public, auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public, auth TO postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public, auth TO postgres, service_role;

-- 2. Drop broken triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP FUNCTION IF EXISTS public.create_profile_for_user();

-- 3. Cleanup Old Admin
DELETE FROM public.users WHERE email = 'admin@oliveiras.com';
DELETE FROM auth.users WHERE email = 'admin@oliveiras.com';

-- 4. Create Role if missing
DO $$
DECLARE
    role_id_target text;
BEGIN
    SELECT id INTO role_id_target FROM public.roles WHERE name = 'Administrador Master' LIMIT 1;
    
    IF role_id_target IS NULL THEN
        INSERT INTO public.roles (name, permissions, description)
        VALUES ('Administrador Master', '["all"]', 'Acesso Total')
        RETURNING id INTO role_id_target;
    END IF;
END $$;

-- 5. Insert User Manually (Bypass API)
DO $$
DECLARE
    new_id uuid := gen_random_uuid();
    role_id_target text;
BEGIN
    SELECT id INTO role_id_target FROM public.roles WHERE name = 'Administrador Master' LIMIT 1;

    -- Create in Auth
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    ) VALUES (
        new_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'admin@oliveiras.com',
        crypt('admin123', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        now(),
        now()
    );

    -- Create in Public (Sync)
    INSERT INTO public.users (id, name, email, role_id, active, avatar)
    VALUES (
        new_id::text,
        'Admin Master',
        'admin@oliveiras.com',
        role_id_target,
        true,
        'https://ui-avatars.com/api/?name=Admin+Master'
    );
END $$;

COMMIT;
