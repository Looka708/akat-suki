import { supabaseAdmin } from './supabase-admin'

export interface TournamentTeam {
    id: string
    name: string
    captain_id: string
    invite_code: string
    discord_role_id: string | null
    discord_voice_channel_id: string | null
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
            invite_code
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
