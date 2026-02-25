import { supabaseAdmin } from './supabase-admin'

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

export async function deleteTournament(id: string) {
    // 1. Delete any matches generated for this tournament
    const { error: matchesError } = await supabaseAdmin
        .from('tournament_matches')
        .delete()
        .eq('tournament_id', id)

    if (matchesError) {
        console.error('Error deleting tournament matches:', matchesError)
        throw matchesError
    }

    // 2. Unlink teams from this tournament so they are not deleted but are no longer in the tournament
    const { error: teamsError } = await supabaseAdmin
        .from('tournament_teams')
        .update({ tournament_id: null })
        .eq('tournament_id', id)

    if (teamsError) {
        console.error('Error unlinking tournament teams:', teamsError)
        throw teamsError
    }

    // 3. Delete the tournament
    const { error } = await supabaseAdmin
        .from('tournaments')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting tournament:', error)
        throw error
    }
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

    // Check if user is already a captain
    const { data: existingCaptain } = await supabaseAdmin
        .from('tournament_teams')
        .select('id')
        .eq('captain_id', captainId)
        .single()

    if (existingCaptain) {
        throw new Error('You are already the captain of another team.')
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

    // Check if the user is a captain of ANY team
    const { data: isCaptainData } = await supabaseAdmin
        .from('tournament_teams')
        .select('id')
        .eq('captain_id', userId)
        .single()

    // If they are a captain, they can only join the team they created
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

    if (error) {
        console.error('Error joining tournament team:', error)
        throw error
    }

    return data as TournamentPlayer
}

export async function removePlayer(teamId: string, userIdToRemove: string, requesterUserId: string) {
    // Verify requester is captain
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

    if (error) {
        console.error('Error removing player:', error)
        throw error
    }
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

    if (error) {
        throw error
    }
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

export async function applyToTournament(teamId: string, tournamentId: string) {
    const { data: tournament, error: tErr } = await supabaseAdmin
        .from('tournaments')
        .select('max_slots')
        .eq('id', tournamentId)
        .single()

    if (tErr || !tournament) {
        throw new Error('Tournament not found.')
    }

    const { count, error: countErr } = await supabaseAdmin
        .from('tournament_teams')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', tournamentId)

    if (countErr) {
        throw new Error('Error checking tournament capacity.')
    }

    if (count !== null && count >= tournament.max_slots) {
        throw new Error('Tournament has reached maximum capacity.')
    }

    const { data, error } = await supabaseAdmin
        .from('tournament_teams')
        .update({ tournament_id: tournamentId, payment_status: 'pending' })
        .eq('id', teamId)
        .select()
        .single()

    if (error) {
        console.error('Error applying to tournament:', error)
        throw error
    }

    return data
}

export async function generateBracket(tournamentId: string) {
    // 1. Get tournament info & teams
    const { data: tournament, error: tErr } = await supabaseAdmin.from('tournaments')
        .select('*').eq('id', tournamentId).single()
    if (tErr || !tournament) throw new Error('Tournament not found')

    const { data: teams, error: teamsErr } = await supabaseAdmin.from('tournament_teams')
        .select('*').eq('tournament_id', tournamentId)

    if (teamsErr) {
        throw new Error('Error fetching tournament teams.')
    }

    // Find nearest power of 2 for bracket size based on max_slots allowing empty generations
    let bracketSize = 2;
    const targetSize = Math.max(tournament.max_slots || 2, teams ? teams.length : 0);
    while (bracketSize < targetSize) {
        bracketSize *= 2;
    }

    // 2. Clear existing matches
    await supabaseAdmin.from('tournament_matches').delete().eq('tournament_id', tournamentId)

    // 3. Generate layout
    const numRounds = Math.log2(bracketSize)
    const matchesToInsert: any[] = []

    // Shuffle teams for initial seeding
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5)

    let baseTime = new Date().getTime()

    // Round 1
    const round1Count = bracketSize / 2
    for (let i = 0; i < round1Count; i++) {
        const team1 = shuffledTeams[i * 2] || null
        const team2 = shuffledTeams[i * 2 + 1] || null

        matchesToInsert.push({
            tournament_id: tournamentId,
            round: 1,
            team1_id: team1 ? team1.id : null,
            team2_id: team2 ? team2.id : null,
            created_at: new Date(baseTime + i * 1000).toISOString(),
            state: 'pending'
        })
    }

    // Subsequent rounds
    for (let r = 2; r <= numRounds; r++) {
        const roundCount = bracketSize / Math.pow(2, r)
        baseTime += 100000 // offset ensuring later rounds sort later if created_at matters globally
        for (let i = 0; i < roundCount; i++) {
            matchesToInsert.push({
                tournament_id: tournamentId,
                round: r,
                team1_id: null,
                team2_id: null,
                created_at: new Date(baseTime + i * 1000).toISOString(),
                state: 'pending'
            })
        }
    }

    const { error: insertErr } = await supabaseAdmin.from('tournament_matches').insert(matchesToInsert)
    if (insertErr) throw new Error('Failed to insert matches: ' + insertErr.message)

    // 4. Auto-advance bye matches (round 1 matches where one team is null)
    const { data: round1Matches } = await supabaseAdmin.from('tournament_matches')
        .select('id, team1_id, team2_id')
        .eq('tournament_id', tournamentId)
        .eq('round', 1)
        .order('created_at', { ascending: true })

    if (round1Matches) {
        for (const m of round1Matches) {
            const isBye = (m.team1_id && !m.team2_id) || (!m.team1_id && m.team2_id)
            if (isBye) {
                const winnerId = m.team1_id || m.team2_id
                const t1Score = m.team1_id ? 1 : 0
                const t2Score = m.team2_id ? 1 : 0
                await updateMatchScore(m.id, t1Score, t2Score, winnerId!)
            }
        }
    }

    return { numRounds, matchesGenerated: matchesToInsert.length }
}

export async function generateGroupStage(tournamentId: string, options: { groupsCount: number; boFormat?: string }) {
    const { groupsCount, boFormat = 'bo2' } = options

    // 1. Get tournament info & teams
    const { data: tournament, error: tErr } = await supabaseAdmin.from('tournaments')
        .select('*').eq('id', tournamentId).single()
    if (tErr || !tournament) throw new Error('Tournament not found')

    const { data: teams, error: teamsErr } = await supabaseAdmin.from('tournament_teams')
        .select('*').eq('tournament_id', tournamentId)

    if (teamsErr || !teams || teams.length < groupsCount) {
        throw new Error('Not enough teams to generate groups.')
    }

    // 2. Clear existing group matches & reset team groups
    await supabaseAdmin.from('tournament_matches').delete().eq('tournament_id', tournamentId).eq('phase', 'group_stage')
    await supabaseAdmin.from('tournament_teams').update({ group_id: null }).eq('tournament_id', tournamentId)

    // 3. Shuffle teams and assign to groups
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5)
    const groups: { [key: string]: any[] } = {}
    const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, groupsCount)

    groupNames.forEach(name => groups[name] = [])

    shuffledTeams.forEach((team, index) => {
        const groupName = groupNames[index % groupsCount]
        groups[groupName].push(team)
    })

    // 4. Update teams with their new group_id
    for (const [groupName, groupTeams] of Object.entries(groups)) {
        for (const team of groupTeams) {
            await supabaseAdmin.from('tournament_teams').update({ group_id: groupName }).eq('id', team.id)
        }
    }

    // 5. Generate Round-Robin matches for each group
    const matchesToInsert: any[] = []
    let baseTime = new Date().getTime()

    for (const [groupName, groupTeams] of Object.entries(groups)) {
        const n = groupTeams.length
        // If odd number of teams, add a dummy team for "byes"
        const isOdd = n % 2 !== 0
        const teamsList = isOdd ? [...groupTeams, null] : [...groupTeams]
        const totalRounds = teamsList.length - 1
        const halfSize = teamsList.length / 2

        for (let round = 0; round < totalRounds; round++) {
            for (let i = 0; i < halfSize; i++) {
                const team1 = teamsList[i]
                const team2 = teamsList[teamsList.length - 1 - i]

                // Skip if it's a bye match (one team is null)
                if (team1 !== null && team2 !== null) {
                    matchesToInsert.push({
                        tournament_id: tournamentId,
                        round: round + 1,
                        team1_id: team1.id,
                        team2_id: team2.id,
                        phase: 'group_stage',
                        group_id: groupName,
                        match_format: boFormat,
                        created_at: new Date(baseTime).toISOString(),
                        state: 'pending'
                    })
                    baseTime += 1000 // increment time for sorting
                }
            }
            // Rotate array for next round: keep first element, rotate the rest clockwise
            teamsList.splice(1, 0, teamsList.pop() as any)
        }
    }

    if (matchesToInsert.length > 0) {
        const { error: insertErr } = await supabaseAdmin.from('tournament_matches').insert(matchesToInsert)
        if (insertErr) throw new Error('Failed to insert group matches: ' + insertErr.message)
    }

    // Update tournament phase
    await supabaseAdmin.from('tournaments').update({ active_phase: 'group_stage' }).eq('id', tournamentId)

    return { groupsCreated: groupsCount, matchesGenerated: matchesToInsert.length }
}

export async function generateDoubleEliminationBracket(tournamentId: string) {
    // This specifically builds the 16-team TI-style bracket requested by the user
    // 1. Get current leaderboard
    const leaderboard = await getTournamentLeaderboard(tournamentId)

    // 2. Separate into groups A, B, C, D
    const groupA = leaderboard.filter(t => t.group_id === 'A').slice(0, 4)
    const groupB = leaderboard.filter(t => t.group_id === 'B').slice(0, 4)
    const groupC = leaderboard.filter(t => t.group_id === 'C').slice(0, 4)
    const groupD = leaderboard.filter(t => t.group_id === 'D').slice(0, 4)

    if (groupA.length < 4 || groupB.length < 4 || groupC.length < 4 || groupD.length < 4) {
        throw new Error('Double Elimination generation requires at least 4 teams in each of groups A, B, C, and D.')
    }

    // Assign seeded variables
    const A1 = groupA[0].id, A2 = groupA[1].id, A3 = groupA[2].id, A4 = groupA[3].id
    const B1 = groupB[0].id, B2 = groupB[1].id, B3 = groupB[2].id, B4 = groupB[3].id
    const C1 = groupC[0].id, C2 = groupC[1].id, C3 = groupC[2].id, C4 = groupC[3].id
    const D1 = groupD[0].id, D2 = groupD[1].id, D3 = groupD[2].id, D4 = groupD[3].id

    // 3. Pre-generate UUIDs to map the exact route tree
    const uuid = () => crypto.randomUUID()

    // UB
    const U1 = uuid(), U2 = uuid(), U3 = uuid(), U4 = uuid()
    const U5 = uuid(), U6 = uuid(), U7 = uuid(), U8 = uuid()
    const U9 = uuid(), U10 = uuid()
    const U11 = uuid() // UB Finals

    // LB
    const L1 = uuid(), L2 = uuid(), L3 = uuid(), L4 = uuid()
    const L5 = uuid(), L6 = uuid(), L7 = uuid(), L8 = uuid()
    const L9 = uuid(), L10 = uuid()
    const L11 = uuid(), L12 = uuid()
    const L13 = uuid() // LB Semi
    const L14 = uuid() // LB Finals

    // GF
    const GF = uuid()

    const matches = [
        // UPPER BRACKET ROUND 1 (Bo1) -- 2nd vs 3rd
        { id: U1, tournament_id: tournamentId, phase: 'upper_bracket', round: 1, team1_id: A2, team2_id: B3, match_format: 'bo1', next_winner_match_id: U5, next_loser_match_id: L1, state: 'pending' },
        { id: U2, tournament_id: tournamentId, phase: 'upper_bracket', round: 1, team1_id: C2, team2_id: D3, match_format: 'bo1', next_winner_match_id: U6, next_loser_match_id: L2, state: 'pending' },
        { id: U3, tournament_id: tournamentId, phase: 'upper_bracket', round: 1, team1_id: B2, team2_id: A3, match_format: 'bo1', next_winner_match_id: U7, next_loser_match_id: L3, state: 'pending' },
        { id: U4, tournament_id: tournamentId, phase: 'upper_bracket', round: 1, team1_id: D2, team2_id: C3, match_format: 'bo1', next_winner_match_id: U8, next_loser_match_id: L4, state: 'pending' },

        // UPPER BRACKET ROUND 2 (Bo3) -- 1st vs UB R1 Winners
        { id: U5, tournament_id: tournamentId, phase: 'upper_bracket', round: 2, team1_id: A1, team2_id: null, match_format: 'bo3', next_winner_match_id: U9, next_loser_match_id: L5, state: 'pending' },
        { id: U6, tournament_id: tournamentId, phase: 'upper_bracket', round: 2, team1_id: C1, team2_id: null, match_format: 'bo3', next_winner_match_id: U9, next_loser_match_id: L6, state: 'pending' },
        { id: U7, tournament_id: tournamentId, phase: 'upper_bracket', round: 2, team1_id: B1, team2_id: null, match_format: 'bo3', next_winner_match_id: U10, next_loser_match_id: L7, state: 'pending' },
        { id: U8, tournament_id: tournamentId, phase: 'upper_bracket', round: 2, team1_id: D1, team2_id: null, match_format: 'bo3', next_winner_match_id: U10, next_loser_match_id: L8, state: 'pending' },

        // UPPER BRACKET ROUND 3 (Bo3)
        { id: U9, tournament_id: tournamentId, phase: 'upper_bracket', round: 3, team1_id: null, team2_id: null, match_format: 'bo3', next_winner_match_id: U11, next_loser_match_id: L11, state: 'pending' },
        { id: U10, tournament_id: tournamentId, phase: 'upper_bracket', round: 3, team1_id: null, team2_id: null, match_format: 'bo3', next_winner_match_id: U11, next_loser_match_id: L12, state: 'pending' },

        // UB FINALS (Bo3)
        { id: U11, tournament_id: tournamentId, phase: 'upper_bracket', round: 4, team1_id: null, team2_id: null, match_format: 'bo3', next_winner_match_id: GF, next_loser_match_id: L14, state: 'pending' },

        // LOWER BRACKET ROUND 1 (Bo1) -- 4th vs UB R1 Losers
        { id: L1, tournament_id: tournamentId, phase: 'lower_bracket', round: 1, team1_id: A4, team2_id: null, match_format: 'bo1', next_winner_match_id: L5, next_loser_match_id: null, state: 'pending' },
        { id: L2, tournament_id: tournamentId, phase: 'lower_bracket', round: 1, team1_id: C4, team2_id: null, match_format: 'bo1', next_winner_match_id: L6, next_loser_match_id: null, state: 'pending' },
        { id: L3, tournament_id: tournamentId, phase: 'lower_bracket', round: 1, team1_id: B4, team2_id: null, match_format: 'bo1', next_winner_match_id: L7, next_loser_match_id: null, state: 'pending' },
        { id: L4, tournament_id: tournamentId, phase: 'lower_bracket', round: 1, team1_id: D4, team2_id: null, match_format: 'bo1', next_winner_match_id: L8, next_loser_match_id: null, state: 'pending' },

        // LOWER BRACKET ROUND 2 (Bo1) -- LB R1 Winners vs UB R2 Losers
        { id: L5, tournament_id: tournamentId, phase: 'lower_bracket', round: 2, team1_id: null, team2_id: null, match_format: 'bo1', next_winner_match_id: L9, next_loser_match_id: null, state: 'pending' },
        { id: L6, tournament_id: tournamentId, phase: 'lower_bracket', round: 2, team1_id: null, team2_id: null, match_format: 'bo1', next_winner_match_id: L9, next_loser_match_id: null, state: 'pending' },
        { id: L7, tournament_id: tournamentId, phase: 'lower_bracket', round: 2, team1_id: null, team2_id: null, match_format: 'bo1', next_winner_match_id: L10, next_loser_match_id: null, state: 'pending' },
        { id: L8, tournament_id: tournamentId, phase: 'lower_bracket', round: 2, team1_id: null, team2_id: null, match_format: 'bo1', next_winner_match_id: L10, next_loser_match_id: null, state: 'pending' },

        // LOWER BRACKET ROUND 3 (Bo1) -- LB R2 Winners face each other
        { id: L9, tournament_id: tournamentId, phase: 'lower_bracket', round: 3, team1_id: null, team2_id: null, match_format: 'bo1', next_winner_match_id: L11, next_loser_match_id: null, state: 'pending' },
        { id: L10, tournament_id: tournamentId, phase: 'lower_bracket', round: 3, team1_id: null, team2_id: null, match_format: 'bo1', next_winner_match_id: L12, next_loser_match_id: null, state: 'pending' },

        // LOWER BRACKET ROUND 4 (Bo3) -- LB R3 Winners vs UB R3 Losers
        { id: L11, tournament_id: tournamentId, phase: 'lower_bracket', round: 4, team1_id: null, team2_id: null, match_format: 'bo3', next_winner_match_id: L13, next_loser_match_id: null, state: 'pending' },
        { id: L12, tournament_id: tournamentId, phase: 'lower_bracket', round: 4, team1_id: null, team2_id: null, match_format: 'bo3', next_winner_match_id: L13, next_loser_match_id: null, state: 'pending' },

        // LB SEMI FINALS (Bo3)
        { id: L13, tournament_id: tournamentId, phase: 'lower_bracket', round: 5, team1_id: null, team2_id: null, match_format: 'bo3', next_winner_match_id: L14, next_loser_match_id: null, state: 'pending' },

        // LB FINALS (Bo3) -- LB Semi Winner vs UB Finals Loser
        { id: L14, tournament_id: tournamentId, phase: 'lower_bracket', round: 6, team1_id: null, team2_id: null, match_format: 'bo3', next_winner_match_id: GF, next_loser_match_id: null, state: 'pending' },

        // GRAND FINALS (Bo5)
        { id: GF, tournament_id: tournamentId, phase: 'grand_finals', round: 1, team1_id: null, team2_id: null, match_format: 'bo5', next_winner_match_id: null, next_loser_match_id: null, state: 'pending' }
    ]

    // Delete existing playoffs/bracket matches
    await supabaseAdmin.from('tournament_matches').delete()
        .eq('tournament_id', tournamentId)
        .in('phase', ['upper_bracket', 'lower_bracket', 'grand_finals', 'brackets'])

    // Bulk insert our mapped matches
    const { error } = await supabaseAdmin.from('tournament_matches').insert(matches)
    if (error) throw new Error('Failed to insert double elimination brackets: ' + error.message)

    // Set tournament phase
    await supabaseAdmin.from('tournaments').update({ active_phase: 'playoffs' }).eq('id', tournamentId)

    return { success: true, matchesGenerated: matches.length }
}

export async function getTournamentMatches(tournamentId: string) {
    const { data: matches, error } = await supabaseAdmin.from('tournament_matches')
        .select(`
            id, tournament_id, team1_id, team2_id, winner_id, team1_score, team2_score, round, state, phase, group_id, match_format, created_at, scheduled_time,
            team1:team1_id(name, logo_url),
            team2:team2_id(name, logo_url),
            winner:winner_id(name)
        `)
        .eq('tournament_id', tournamentId)
        .order('round', { ascending: true })
        .order('created_at', { ascending: true })

    if (error) throw error
    return matches
}

export async function getTournamentLeaderboard(tournamentId: string) {
    // get all teams in tournament
    const { data: teams, error: teamsErr } = await supabaseAdmin
        .from('tournament_teams')
        .select('id, name, logo_url, group_id')
        .eq('tournament_id', tournamentId)

    if (teamsErr) throw new Error('Failed to fetch teams: ' + teamsErr.message)

    // get all completed matches from group stage
    const { data: matches, error: matchesErr } = await supabaseAdmin
        .from('tournament_matches')
        .select('team1_id, team2_id, winner_id, team1_score, team2_score, match_format, phase')
        .eq('tournament_id', tournamentId)
        .eq('state', 'completed')
        .eq('phase', 'group_stage')

    if (matchesErr) throw new Error('Failed to fetch matches: ' + matchesErr.message)

    const leaderboard = (teams || []).map(team => {
        let wins = 0
        let draws = 0
        let losses = 0
        let points = 0

            ; (matches || []).forEach(m => {
                if (m.team1_id === team.id || m.team2_id === team.id) {
                    const isTeam1 = m.team1_id === team.id
                    const myScore = isTeam1 ? m.team1_score : m.team2_score
                    const oppScore = isTeam1 ? m.team2_score : m.team1_score

                    if (m.match_format === 'bo2') {
                        if (myScore === 2) { wins++; points += 3; }
                        else if (myScore === 1 && oppScore === 1) { draws++; points += 1; }
                        else if (oppScore === 2) { losses++; }
                    } else {
                        // Standard bo1/bo3/bo5 point mapping
                        if (m.winner_id === team.id) {
                            wins++; points += 3;
                        } else if (m.winner_id) {
                            losses++;
                        }
                    }
                }
            })

        return {
            ...team,
            wins,
            draws,
            losses,
            matchesPlayed: wins + draws + losses,
            points
        }
    })

    leaderboard.sort((a, b) => b.points - a.points || b.wins - a.wins || a.losses - b.losses)

    return leaderboard
}

export async function updateMatchScore(matchId: string, team1Score: number, team2Score: number, winnerId: string | null) {
    const { data: updatedMatch, error: updateErr } = await supabaseAdmin.from('tournament_matches')
        .update({
            team1_score: team1Score,
            team2_score: team2Score,
            winner_id: winnerId,
            state: 'completed'
        })
        .eq('id', matchId)
        .select()
        .single()

    if (updateErr) throw new Error('Failed to update match score: ' + updateErr.message)

    // Resolve next match propagation if winner is determined
    if (winnerId) {
        // Explicit topologies via pointers
        if (updatedMatch.next_winner_match_id) {
            const { data: nextWinMatch } = await supabaseAdmin.from('tournament_matches')
                .select('id, team1_id, team2_id').eq('id', updatedMatch.next_winner_match_id).single()
            if (nextWinMatch) {
                const field = !nextWinMatch.team1_id ? { team1_id: winnerId } : { team2_id: winnerId }
                await supabaseAdmin.from('tournament_matches').update(field).eq('id', nextWinMatch.id)
            }
        }

        let loserId = null;
        if (updatedMatch.team1_id === winnerId) loserId = updatedMatch.team2_id;
        if (updatedMatch.team2_id === winnerId) loserId = updatedMatch.team1_id;

        if (loserId && updatedMatch.next_loser_match_id) {
            const { data: nextLoseMatch } = await supabaseAdmin.from('tournament_matches')
                .select('id, team1_id, team2_id').eq('id', updatedMatch.next_loser_match_id).single()
            if (nextLoseMatch) {
                const field = !nextLoseMatch.team1_id ? { team1_id: loserId } : { team2_id: loserId }
                await supabaseAdmin.from('tournament_matches').update(field).eq('id', nextLoseMatch.id)
            }
        }

        // Fallback generic single-elim propagation if no pointers provided
        if (!updatedMatch.next_winner_match_id && !updatedMatch.next_loser_match_id && updatedMatch.phase !== 'group_stage') {
            const tournamentId = updatedMatch.tournament_id
            const round = updatedMatch.round

            const { data: roundMatches } = await supabaseAdmin.from('tournament_matches')
                .select('id')
                .eq('tournament_id', tournamentId)
                .eq('round', round)
                .order('created_at', { ascending: true })

            if (roundMatches) {
                const currentIndex = roundMatches.findIndex(m => m.id === matchId)
                if (currentIndex !== -1) {
                    const nextRound = round + 1
                    const nextMatchIndex = Math.floor(currentIndex / 2)
                    const isTeam1 = currentIndex % 2 === 0

                    const { data: nextRoundMatches } = await supabaseAdmin.from('tournament_matches')
                        .select('id')
                        .eq('tournament_id', tournamentId)
                        .eq('round', nextRound)
                        .order('created_at', { ascending: true })

                    if (nextRoundMatches && nextRoundMatches[nextMatchIndex]) {
                        const nextMatchId = nextRoundMatches[nextMatchIndex].id
                        const updateField = isTeam1 ? { team1_id: winnerId } : { team2_id: winnerId }

                        await supabaseAdmin.from('tournament_matches')
                            .update(updateField)
                            .eq('id', nextMatchId)
                    }
                }
            }
        }
    }

    return updatedMatch
}

// ========================
// FREE AGENTS (LFG)
// ========================

export interface FreeAgent {
    id: string
    user_id: string
    game: string
    rank_tier: number | null
    roles: string[]
    description: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export async function getFreeAgents() {
    const { data, error } = await supabaseAdmin
        .from('free_agents')
        .select(`
            *,
            users (username, avatar, discriminator)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function getFreeAgentByUser(userId: string) {
    const { data, error } = await supabaseAdmin
        .from('free_agents')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as FreeAgent | null
}

export async function upsertFreeAgent(agentData: Partial<FreeAgent> & { user_id: string }) {
    const existing = await getFreeAgentByUser(agentData.user_id)

    if (existing) {
        const { data, error } = await supabaseAdmin
            .from('free_agents')
            .update({ ...agentData, updated_at: new Date().toISOString() })
            .eq('user_id', agentData.user_id)
            .select()
            .single()
        if (error) throw error
        return data as FreeAgent
    } else {
        const { data, error } = await supabaseAdmin
            .from('free_agents')
            .insert({ ...agentData })
            .select()
            .single()
        if (error) throw error
        return data as FreeAgent
    }
}
