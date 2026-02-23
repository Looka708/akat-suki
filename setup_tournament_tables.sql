-- Create tournaments table
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    game TEXT NOT NULL DEFAULT 'Dota 2',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_slots INTEGER NOT NULL DEFAULT 16,
    entry_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    prize_pool NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming, registration_open, live, completed
    top_twitch_channel TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournament_teams table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.tournament_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    captain_id TEXT NOT NULL REFERENCES public.users(id),
    name TEXT NOT NULL UNIQUE,
    invite_code TEXT NOT NULL UNIQUE,
    discord_role_id TEXT,
    discord_voice_channel_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns safely if they don't exist
ALTER TABLE public.tournament_teams 
    ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS logo_url TEXT,
    ADD COLUMN IF NOT EXISTS region TEXT,
    ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Create tournament_players table
CREATE TABLE IF NOT EXISTS public.tournament_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.tournament_teams(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(id),
    discord_id TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Create tournament_matches table
CREATE TABLE IF NOT EXISTS public.tournament_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    team1_id UUID REFERENCES public.tournament_teams(id) ON DELETE SET NULL,
    team2_id UUID REFERENCES public.tournament_teams(id) ON DELETE SET NULL,
    winner_id UUID REFERENCES public.tournament_teams(id) ON DELETE SET NULL,
    team1_score INTEGER DEFAULT 0,
    team2_score INTEGER DEFAULT 0,
    scheduled_time TIMESTAMP WITH TIME ZONE,
    round INTEGER NOT NULL DEFAULT 1,
    state TEXT NOT NULL DEFAULT 'pending', -- pending, live, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Allow public read tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Allow public read tournament_matches" ON public.tournament_matches;
DROP POLICY IF EXISTS "Allow authenticated read tournament_teams" ON public.tournament_teams;
DROP POLICY IF EXISTS "Allow authenticated read tournament_players" ON public.tournament_players;
DROP POLICY IF EXISTS "Allow service_role full access tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Allow service_role full access tournament_teams" ON public.tournament_teams;
DROP POLICY IF EXISTS "Allow service_role full access tournament_players" ON public.tournament_players;
DROP POLICY IF EXISTS "Allow service_role full access tournament_matches" ON public.tournament_matches;

-- Recreate policies
-- Allow public read access to tournaments and matches
CREATE POLICY "Allow public read tournaments" ON public.tournaments
    FOR SELECT USING (true);

CREATE POLICY "Allow public read tournament_matches" ON public.tournament_matches
    FOR SELECT USING (true);
    
-- Allow authenticated read access to teams and players
CREATE POLICY "Allow authenticated read tournament_teams" ON public.tournament_teams
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read tournament_players" ON public.tournament_players
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role full access
CREATE POLICY "Allow service_role full access tournaments" ON public.tournaments
    FOR ALL USING (true);

CREATE POLICY "Allow service_role full access tournament_teams" ON public.tournament_teams
    FOR ALL USING (true);

CREATE POLICY "Allow service_role full access tournament_players" ON public.tournament_players
    FOR ALL USING (true);

CREATE POLICY "Allow service_role full access tournament_matches" ON public.tournament_matches
    FOR ALL USING (true);
