ALTER TABLE tournament_matches 
ADD COLUMN opendota_match_id BIGINT UNIQUE,
ADD COLUMN match_stats JSONB DEFAULT '{}'::jsonb;

ALTER TABLE tournament_players
ADD COLUMN player_stats JSONB DEFAULT '{}'::jsonb;
