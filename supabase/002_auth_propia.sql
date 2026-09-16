-- Delta auth propia para craft3d_db (correr DESPUÉS del restore).
-- profiles suma email/password_hash/role; los emails se recuperan de
-- auth.users (el dump incluye ese esquema) y los hashes se resetean
-- (scripts/set-password o UPDATE con crypt()).

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';

-- Backfill de emails desde auth.users del dump restaurado
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- El primer admin se marca a mano:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'tu@email.com';
