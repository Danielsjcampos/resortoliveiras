-- FINAL REPAIR: REBUILD USERS TABLE & ADMIN
-- Use this if the "users" table is missing or corrupted.

BEGIN;

-- 1. Ensure Roles Table Exists
CREATE TABLE IF NOT EXISTS public.roles (
    id text PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    permissions jsonb DEFAULT '[]',
    description text
);

-- 2. Ensure Users Table Exists (If it was deleted, this restores the structure)
CREATE TABLE IF NOT EXISTS public.users (
    id text PRIMARY KEY, -- Linked to auth.users.id
    name text,
    email text UNIQUE,
    role_id text REFERENCES public.roles(id),
    active boolean DEFAULT true,
    avatar text,
    created_at timestamptz DEFAULT now()
);

-- 3. ENABLE RLS (Row Level Security) - Best Practice
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Open for now to fix access issues)
DROP POLICY IF EXISTS "Public Access" ON public.users;
CREATE POLICY "Public Access" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Access Roles" ON public.roles;
CREATE POLICY "Public Access Roles" ON public.roles FOR ALL USING (true) WITH CHECK (true);

-- 5. Wipe Old Data specific to Admin to avoid conflicts
DELETE FROM public.users WHERE email = 'admin@oliveiras.com';
DELETE FROM auth.users WHERE email = 'admin@oliveiras.com';

-- 6. Insert Admin Role (Handled in DO block to avoid constraint errors)

-- 7. Create Admin User
DO $$
DECLARE
    new_id uuid := gen_random_uuid();
    role_id_target text;
BEGIN
    -- Ensure Role Exists Manually (Fix for missing Unique Constraint)
    SELECT id INTO role_id_target FROM public.roles WHERE name = 'Administrador Master' LIMIT 1;
    
    IF role_id_target IS NULL THEN
        INSERT INTO public.roles (name, permissions, description)
        VALUES ('Administrador Master', '["all"]', 'Acesso Total')
        RETURNING id INTO role_id_target;
    END IF;

    -- Auth User
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

    -- Public User
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
