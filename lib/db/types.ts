export interface Tournament {
    id: string
    name: string
    game: string
    start_date: string
    max_slots: number
    entry_fee: number
    prize_pool: number
    currency: string
    status: string
    active_phase: string
    top_twitch_channel: string | null
    created_at: string
}

export interface TournamentTeam {
    id: string
    tournament_id: string | null
    name: string
    captain_id: string
    invite_code: string
    discord_role_id: string | null
    discord_voice_channel_id: string | null
    logo_url: string | null
    region: string | null
    group_id: string | null
    payment_status: string
    created_at: string
}

export interface TournamentPlayer {
    id: string
    team_id: string
    user_id: string
    discord_id: string | null
    steam_id: string | null
    dota_name: string | null
    mmr: number
    dotabuff_url: string | null
    role_1: string
    role_2: string
    role_3: string
    ping: string
    captain_notes: string
    joined_at: string
}

export interface TournamentMatch {
    id: string
    tournament_id: string
    team1_id: string | null
    team2_id: string | null
    winner_id: string | null
    team1_score: number
    team2_score: number
    round: number
    phase: string
    group_id: string | null
    match_format: string
    state: string
    scheduled_time: string | null
    next_winner_match_id: string | null
    next_loser_match_id: string | null
    created_at: string
}
