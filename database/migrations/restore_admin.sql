-- Enable pgcrypto for password hashing if not enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    new_user_id uuid := gen_random_uuid();
    v_role_id text;
BEGIN
    -- 1. Ensure Role Exists (Check by name manually to avoid ON CONFLICT error if no unique constraint)
    SELECT id INTO v_role_id FROM public.roles WHERE name = 'Administrador Master' LIMIT 1;
    
    IF v_role_id IS NULL THEN
        INSERT INTO public.roles (name, permissions, description)
        VALUES ('Administrador Master', '["all"]', 'Acesso total ao sistema')
        RETURNING id INTO v_role_id;
    END IF;

    -- 2. Create Admin User in auth.users (if not exists)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@oliveiras.com') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_user_id,
            'authenticated',
            'authenticated',
            'admin@oliveiras.com',
            crypt('admin123', gen_salt('bf')), -- Password: admin123
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        );
    ELSE
        SELECT id INTO new_user_id FROM auth.users WHERE email = 'admin@oliveiras.com';
        
        -- FORCE PASSWORD UPDATE
        UPDATE auth.users
        SET encrypted_password = crypt('admin123', gen_salt('bf')),
            email_confirmed_at = now(),
            updated_at = now()
        WHERE id = new_user_id;
    END IF;

    -- 3. Create/Update Admin User in public.users
    -- Check if user exists in public.users
    IF EXISTS (SELECT 1 FROM public.users WHERE id = new_user_id::text) THEN
        UPDATE public.users 
        SET role_id = v_role_id, active = true
        WHERE id = new_user_id::text;
    ELSE
        INSERT INTO public.users (id, name, email, role_id, active, avatar)
        VALUES (
            new_user_id::text, 
            'Admin Master', 
            'admin@oliveiras.com', 
            v_role_id, 
            true, 
            'https://ui-avatars.com/api/?name=Admin+Master&background=random'
        );
    END IF;
        
END $$;
