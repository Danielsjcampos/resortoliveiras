-- PREPARE FOR FRONTEND CREATION
-- Deletes the admin user so you can recreate it via the "Restaurar" button in the interface.

BEGIN;

-- 1. Ensure Role Exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = 'Administrador Master') THEN
        INSERT INTO public.roles (name, permissions, description)
        VALUES ('Administrador Master', '["all"]', 'Acesso Total');
    END IF;
END $$;

-- 2. Delete Admin User (So we can sign up again properly via API)
DELETE FROM public.users WHERE email = 'admin@oliveiras.com';
DELETE FROM auth.users WHERE email = 'admin@oliveiras.com';

COMMIT;
