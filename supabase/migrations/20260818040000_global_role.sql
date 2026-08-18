-- Add global_role to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS global_role text DEFAULT 'Member';
