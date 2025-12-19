-- NUCLEAR RESET OF PERMISSIONS & ADMIN USER
-- Run this to resolve "Database error querying schema"

BEGIN;

-- 1. Reset Schema Permissions (Broadest possible grants for repair)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Clean Slate: Remove Admin User completely to rebuild
DELETE FROM public.users WHERE email = 'admin@oliveiras.com';
DELETE FROM auth.users WHERE email = 'admin@oliveiras.com';

-- 3. Ensure Roles Exist
INSERT INTO public.roles (name, permissions, description)
VALUES ('Administrador Master', '["all"]', 'Acesso Total')
ON CONFLICT (name) DO NOTHING;

-- 4. Re-Create Admin User (The "Clean" Way)
DO $$
DECLARE
    new_id uuid := gen_random_uuid();
    role_id_target text;
BEGIN
    SELECT id INTO role_id_target FROM public.roles WHERE name = 'Administrador Master' LIMIT 1;

    -- Create in AUTH schema
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

    -- Create in PUBLIC schema
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
