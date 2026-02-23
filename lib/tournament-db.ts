import { supabaseAdmin } from './supabase-admin'

export interface Tournament {
    id: string
    name: string
    game: string
    start_date: string
    max_slots: number
    entry_fee: number
    prize_pool: number
    status: string
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
    payment_status: string
    created_at: string
}

export interface TournamentPlayer {
    id: string
    team_id: string
    user_id: string
    discord_id: string | null
    joined_at: string
}

// Generate a random 6-character alphanumeric code
function generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

// ========================
// TOURNAMENTS
// ========================

export async function createTournament(tournamentData: Partial<Tournament>) {
    const { data, error } = await supabaseAdmin
        .from('tournaments')
        .insert({
            ...tournamentData,
            status: 'upcoming'
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating tournament:', error)
        throw error
    }
    return data as Tournament
}

export async function getTournaments() {
    const { data, error } = await supabaseAdmin
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true })

    if (error) {
        console.error('Error fetching tournaments:', error)
        throw error
    }
    return data as Tournament[]
}

export async function getTournamentById(id: string) {
    const { data, error } = await supabaseAdmin
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching tournament:', error)
        throw error
    }
    return data as Tournament | null
}

export async function updateTournamentStatus(id: string, status: string) {
    const { data, error } = await supabaseAdmin
        .from('tournaments')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating tournament status:', error)
        throw error
    }
    return data as Tournament
}

export async function getTournamentTeams(tournamentId: string) {
    const { data, error } = await supabaseAdmin
        .from('tournament_teams')
        .select(`
            *,
            tournament_players (count)
        `)
        .eq('tournament_id', tournamentId)

    if (error) {
        console.error('Error fetching tournament teams:', error)
        throw error
    }
    return data
}

// ========================
// TEAMS
// ========================

export async function createTeam(name: string, captainId: string) {
    // Basic validation
    if (!name || name.trim() === '') {
        throw new Error('Team name is required')
    }

    // Generate unique code, checking against existing
    let invite_code = generateInviteCode()
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 5) {
        const { data } = await supabaseAdmin
            .from('tournament_teams')
            .select('id')
            .eq('invite_code', invite_code)
            .single()

        if (!data) {
            isUnique = true
            break
        }
        invite_code = generateInviteCode()
        attempts++
    }

    if (!isUnique) throw new Error('Failed to generate unique invite code')

    const { data, error } = await supabaseAdmin
        .from('tournament_teams')
        .insert({
            name: name.trim(),
            captain_id: captainId,
            invite_code,
            tournament_id: null // We'll update this when they select a tournament
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating tournament team:', error)
        throw error
    }

    return data as TournamentTeam
}

export async function getTeamByInviteCode(inviteCode: string) {
    const { data, error } = await supabaseAdmin
        .from('tournament_teams')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single()

    if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error to handle it smoothly
        console.error('Error fetching team by invite code:', error)
        throw error
    }

    return data as TournamentTeam | null
}

export async function getTeamById(teamId: string) {
    const { data, error } = await supabaseAdmin
        .from('tournament_teams')
        .select('*')
        .eq('id', teamId)
        .single()

    if (error && error.code !== 'PGRST116') {
        throw error
    }

    return data as TournamentTeam | null
}

export async function joinTeam(teamId: string, userId: string, discordId: string | null) {
    // Check if already in the team
    const { data: existing } = await supabaseAdmin
        .from('tournament_players')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single()

    if (existing) {
        return existing
    }

    const { data, error } = await supabaseAdmin
        .from('tournament_players')
        .insert({
            team_id: teamId,
            user_id: userId,
            discord_id: discordId
        })
        .select()
        .single()

    if (error) {
        console.error('Error joining tournament team:', error)
        throw error
    }

    return data as TournamentPlayer
}

export async function getTeamMembers(teamId: string) {
    const { data, error } = await supabaseAdmin
        .from('tournament_players')
        .select(`
            *,
            users (
                username,
                avatar,
                discriminator
            )
        `)
        .eq('team_id', teamId)

    if (error) {
        console.error('Error fetching team members:', error)
        throw error
    }

    return data
}

export async function updateTeamDiscordInfo(teamId: string, roleId: string, channelId: string) {
    const { error } = await supabaseAdmin
        .from('tournament_teams')
        .update({
            discord_role_id: roleId,
            discord_voice_channel_id: channelId
        })
        .eq('id', teamId)

    if (error) {
        console.error('Error updating team discord info:', error)
        throw error
    }
}
