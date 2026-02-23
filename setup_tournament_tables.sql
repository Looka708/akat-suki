-- Create tournament_teams table
CREATE TABLE IF NOT EXISTS public.tournament_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    captain_id TEXT NOT NULL REFERENCES public.users(id),
    invite_code TEXT NOT NULL UNIQUE,
    discord_role_id TEXT,
    discord_voice_channel_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournament_players table
CREATE TABLE IF NOT EXISTS public.tournament_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.tournament_teams(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(id),
    discord_id TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Enable RLS
ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_players ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow authenticated read tournament_teams" ON public.tournament_teams
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read tournament_players" ON public.tournament_players
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role full access
CREATE POLICY "Allow service_role full access tournament_teams" ON public.tournament_teams
    FOR ALL USING (true);

CREATE POLICY "Allow service_role full access tournament_players" ON public.tournament_players
    FOR ALL USING (true);
