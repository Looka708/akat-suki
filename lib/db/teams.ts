import { supabaseAdmin } from '../supabase-admin'
import { TournamentTeam, TournamentPlayer } from './types'

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
    if (!name || name.trim() === '') {
        throw new Error('Team name is required')
    }

    const { data: existingCaptain } = await supabaseAdmin
        .from('tournament_teams')
        .select('id')
        .eq('captain_id', captainId)
        .single()

    if (existingCaptain) {
        throw new Error('You are already the captain of another team.')
    }

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
            tournament_id: null
        })
        .select()
        .single()

    if (error) throw error
    return data as TournamentTeam
}

export async function getTeamByInviteCode(inviteCode: string) {
    const { data, error } = await supabaseAdmin
        .from('tournament_teams')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as TournamentTeam | null
}

export async function getTeamById(teamId: string) {
    const { data, error } = await supabaseAdmin
        .from('tournament_teams')
        .select('*')
        .eq('id', teamId)
        .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as TournamentTeam | null
}

export async function joinTeam(
    teamId: string,
    userId: string,
    discordId: string | null,
    steamId?: string | null,
    profileData?: {
        mmr?: number
        dotabuff_url?: string | null
        role_1?: string
        role_2?: string
        role_3?: string
        ping?: string
        captain_notes?: string
        dota_name?: string
    }
) {
    const { data: existing } = await supabaseAdmin
        .from('tournament_players')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single()

    if (existing) return existing

    const { data: isCaptainData } = await supabaseAdmin
        .from('tournament_teams')
        .select('id')
        .eq('captain_id', userId)
        .single()

    if (isCaptainData && isCaptainData.id !== teamId) {
        throw new Error('You are a team captain and cannot join another team.')
    }

    const { data, error } = await supabaseAdmin
        .from('tournament_players')
        .insert({
            team_id: teamId,
            user_id: userId,
            discord_id: discordId,
            steam_id: steamId || null,
            mmr: profileData?.mmr || 0,
            dotabuff_url: profileData?.dotabuff_url || null,
            role_1: profileData?.role_1 || '',
            role_2: profileData?.role_2 || '',
            role_3: profileData?.role_3 || '',
            ping: profileData?.ping || '',
            captain_notes: profileData?.captain_notes || '',
            dota_name: profileData?.dota_name || ''
        })
        .select()
        .single()

    if (error) throw error
    return data as TournamentPlayer
}

export async function removePlayer(teamId: string, userIdToRemove: string, requesterUserId: string) {
    const { data: team, error: teamErr } = await supabaseAdmin
        .from('tournament_teams')
        .select('captain_id')
        .eq('id', teamId)
        .single()

    if (teamErr || !team) throw new Error('Team not found')
    if (team.captain_id !== requesterUserId) throw new Error('Only the team captain can remove players')
    if (team.captain_id === userIdToRemove) throw new Error('Captain cannot be removed')

    const { error } = await supabaseAdmin
        .from('tournament_players')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userIdToRemove)

    if (error) throw error
}

export async function deleteTeam(teamId: string, captainId: string) {
    const { data: team, error: teamErr } = await supabaseAdmin
        .from('tournament_teams')
        .select('captain_id')
        .eq('id', teamId)
        .single()

    if (teamErr || !team) throw new Error('Team not found')
    if (team.captain_id !== captainId) throw new Error('Only the captain can delete the team')

    const { error } = await supabaseAdmin
        .from('tournament_teams')
        .delete()
        .eq('id', teamId)

    if (error) throw error
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

    if (error) throw error
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

    if (error) throw error
}

export async function applyToTournament(teamId: string, tournamentId: string) {
    const { data: tournament, error: tErr } = await supabaseAdmin
        .from('tournaments')
        .select('max_slots')
        .eq('id', tournamentId)
        .single()

    if (tErr || !tournament) throw new Error('Tournament not found.')

    const { count, error: countErr } = await supabaseAdmin
        .from('tournament_teams')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', tournamentId)

    if (countErr) throw new Error('Error checking tournament capacity.')
    if (count !== null && count >= tournament.max_slots) throw new Error('Tournament has reached maximum capacity.')

    const { data, error } = await supabaseAdmin
        .from('tournament_teams')
        .update({ tournament_id: tournamentId, payment_status: 'pending' })
        .eq('id', teamId)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function getTournamentTeams(tournamentId: string) {
    const { data, error } = await supabaseAdmin
        .from('tournament_teams')
        .select(`
            *,
            tournament_players (count)
        `)
        .eq('tournament_id', tournamentId)

    if (error) throw error
    return data
}
