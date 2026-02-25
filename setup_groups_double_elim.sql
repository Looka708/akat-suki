-- File: setup_groups_double_elim.sql

-- Update tournament_teams table to support group assignments
ALTER TABLE tournament_teams ADD COLUMN IF NOT EXISTS group_id VARCHAR(50);

-- Update tournament_matches table to support phases and groups
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS phase VARCHAR(50) DEFAULT 'brackets';
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS group_id VARCHAR(50);
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS match_format VARCHAR(20) DEFAULT 'bo1';

ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS next_winner_match_id UUID REFERENCES tournament_matches(id);
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS next_loser_match_id UUID REFERENCES tournament_matches(id);

-- Update tournaments table to store active phase
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS active_phase VARCHAR(50) DEFAULT 'registration';

-- Comments for documentation
COMMENT ON COLUMN tournament_matches.phase IS 'e.g., group_stage, upper_bracket, lower_bracket, grand_finals';
COMMENT ON COLUMN tournament_matches.group_id IS 'e.g., A, B, C, D (for group stage matches)';
COMMENT ON COLUMN tournament_matches.match_format IS 'e.g., bo1, bo2, bo3, bo5';
COMMENT ON COLUMN tournament_matches.next_winner_match_id IS 'ID of the match the winner advances to';
COMMENT ON COLUMN tournament_matches.next_loser_match_id IS 'ID of the match the loser drops to (for double elim)';
COMMENT ON COLUMN tournaments.active_phase IS 'e.g., registration, group_stage, playoffs, completed';
