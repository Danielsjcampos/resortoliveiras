-- HARD RESET AUTH & USERS
-- Deletes all users and restores the Admin. FIXES 'Database error querying schema'.

BEGIN;

-- 1. Grant Necessary Permissions (Fixes schema access error)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Remove problematic Triggers that cause 500 Errors on login/insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP FUNCTION IF EXISTS public.create_profile_for_user();

-- 3. WIPE EXISTING DATA (Order matters due to constraints)
-- Clear tables that reference users first
DELETE FROM public.time_logs;
-- Add other dependent tables here if needed, or simply let the user delete fail if more exist.
-- Assuming time_logs is the blocker based on the error.

DELETE FROM public.users;
DELETE FROM auth.users;

-- 4. Ensure Admin Role Exists
-- 4. Ensure Admin Role Exists (Moved to DO block to avoid constraint errors)

-- 5. Create NEW Admin User
DO $$
DECLARE
    new_id uuid := gen_random_uuid();
    role_id_target text;
BEGIN
    -- Ensure Role Exists Manually
    SELECT id INTO role_id_target FROM public.roles WHERE name = 'Administrador Master' LIMIT 1;
    
    IF role_id_target IS NULL THEN
        INSERT INTO public.roles (name, permissions, description)
        VALUES ('Administrador Master', '["all"]', 'Acesso Total')
        RETURNING id INTO role_id_target;
    END IF;

    -- Insert into auth.users
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

    -- Insert into public.users
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
