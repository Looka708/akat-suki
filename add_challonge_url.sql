-- Add challonge_url to tournaments table
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS challonge_url TEXT;
