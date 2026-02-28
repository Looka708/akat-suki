-- Add stream_url to tournament_matches table
ALTER TABLE public.tournament_matches ADD COLUMN IF NOT EXISTS stream_url TEXT;
