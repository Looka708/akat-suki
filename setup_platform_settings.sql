-- Create the platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Note: In Supabase, if your referenced table is public.users instead of auth.users, change the REFERENCES above.
-- Since previous tables used public.users(id), we can update it just in case:
-- ALTER TABLE public.platform_settings DROP CONSTRAINT IF EXISTS platform_settings_updated_by_fkey;
-- ALTER TABLE public.platform_settings ADD CONSTRAINT platform_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users or public (depending on scope of settings)
-- Usually platform settings need to be read by the app without auth to check "maintenance mode"
-- So we allow anyone to read public settings
CREATE POLICY "Enable read access for all users on platform_settings" ON public.platform_settings
    FOR SELECT USING (true);

-- Allow write access only to service role (from admin API)
CREATE POLICY "Enable write access for service role only" ON public.platform_settings
    FOR ALL USING (auth.role() = 'service_role');

-- Insert some default records safely
INSERT INTO public.platform_settings (key, value, description)
VALUES 
    ('general', '{"app_title": "AKATSUKI ESports", "maintenance_mode": false, "contact_email": "hello@akatsuki.gg"}', 'General global application settings'),
    ('integrations', '{"discord_enabled": true}', 'Integration features toggle toggles and basic configs'),
    ('tournament_defaults', '{"global_registration_open": true, "default_currency": "USD"}', 'Default values applied when running tournaments')
ON CONFLICT (key) DO NOTHING;
