import { supabaseAdmin } from './supabase-admin'

export * from './db/brackets'
export * from './db/leaderboard'
export * from './db/swiss'

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
    challonge_url?: string | null
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

export async function updateTournamentChallongeUrl(id: string, challongeUrl: string | null) {
    const { data, error } = await supabaseAdmin
        .from('tournaments')
        .update({ challonge_url: challongeUrl })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating tournament challonge_url:', error)
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
            tournament_players (
                id, user_id, steam_id,
                users (username, avatar)
            )
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

export async function generateBracket(tournamentId: string, overrideSize?: number, format: string = 'single_elimination') {
    // 1. Get tournament info & teams
    const { data: tournament, error: tErr } = await supabaseAdmin.from('tournaments')
        .select('*').eq('id', tournamentId).single()
    if (tErr || !tournament) throw new Error('Tournament not found')

    const { data: teams, error: teamsErr } = await supabaseAdmin.from('tournament_teams')
        .select('*').eq('tournament_id', tournamentId)

    if (teamsErr) {
        throw new Error('Error fetching tournament teams.')
    }

    // Use overrideSize if provided, otherwise auto-detect
    let bracketSize: number
    if (overrideSize && [2, 4, 8, 16, 32].includes(overrideSize)) {
        if (teams && overrideSize < teams.length) {
            throw new Error(`Bracket size (${overrideSize}) cannot be smaller than the number of teams (${teams.length}).`)
        }
        bracketSize = overrideSize
    } else {
        bracketSize = 2
        const targetSize = Math.max(tournament.max_slots || 2, teams ? teams.length : 0)
        while (bracketSize < targetSize) {
            bracketSize *= 2
        }
    }

    // 2. Clear existing matches
    await supabaseAdmin.from('tournament_matches').delete().eq('tournament_id', tournamentId)

    // Branch to format specific generator
    if (format === 'double_elimination') {
        return generateDoubleEliminationN(tournamentId, teams, bracketSize)
    }

    if (format === 'round_robin') {
        return generateRoundRobin(tournamentId, teams)
    }

    if (format === 'swiss') {
        return generateSwissRound1(tournamentId, teams)
    }

    if (format === 'compass') {
        return generateCompassDraw(tournamentId, teams, bracketSize)
    }

    // 3. Generate layout (Single Elimination)
    const numRounds = Math.log2(bracketSize)
    const matchesToInsert: any[] = []

    // Pre-generate UUIDs so we can wire next_winner_match_id
    const matchIds: { [round: number]: string[] } = {}
    for (let r = 1; r <= numRounds; r++) {
        matchIds[r] = []
        const roundCount = bracketSize / Math.pow(2, r)
        for (let i = 0; i < roundCount; i++) {
            matchIds[r].push(crypto.randomUUID())
        }
    }

    // Shuffle teams for initial seeding
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5)

    let baseTime = new Date().getTime()

    // Round 1
    const round1Count = bracketSize / 2
    for (let i = 0; i < round1Count; i++) {
        const team1 = shuffledTeams[i * 2] || null
        const team2 = shuffledTeams[i * 2 + 1] || null

        const nextRoundIndex = Math.floor(i / 2)
        const nextMatchId = numRounds > 1 ? matchIds[2][nextRoundIndex] : null

        matchesToInsert.push({
            id: matchIds[1][i],
            tournament_id: tournamentId,
            round: 1,
            phase: 'brackets',
            team1_id: team1 ? team1.id : null,
            team2_id: team2 ? team2.id : null,
            created_at: new Date(baseTime + i * 1000).toISOString(),
            next_winner_match_id: nextMatchId,
            state: 'pending'
        })
    }

    // Subsequent rounds
    for (let r = 2; r <= numRounds; r++) {
        const roundCount = bracketSize / Math.pow(2, r)
        baseTime += 100000 // offset ensuring later rounds sort later if created_at matters globally
        for (let i = 0; i < roundCount; i++) {
            const nextRoundIndex = Math.floor(i / 2)
            const nextMatchId = r < numRounds ? matchIds[r + 1][nextRoundIndex] : null

            matchesToInsert.push({
                id: matchIds[r][i],
                tournament_id: tournamentId,
                round: r,
                phase: 'brackets',
                team1_id: null,
                team2_id: null,
                created_at: new Date(baseTime + i * 1000).toISOString(),
                next_winner_match_id: nextMatchId,
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
                // Auto advance the bye winner
                await updateMatchScore(m.id, t1Score, t2Score, winnerId!)
            }
        }
    }

    return { numRounds, matchesGenerated: matchesToInsert.length }
}

async function generateDoubleEliminationN(tournamentId: string, teams: any[], bracketSize: number) {
    const numUBRounds = Math.log2(bracketSize)
    const numLBRounds = numUBRounds * 2 - 2

    // Arrays to hold pre-generated UUIDs
    const ubMatches: { [round: number]: string[] } = {}
    const lbMatches: { [round: number]: string[] } = {}
    const gfMatchId = crypto.randomUUID()

    // Pre-generate UB match UUIDs
    for (let r = 1; r <= numUBRounds; r++) {
        ubMatches[r] = []
        const roundCount = bracketSize / Math.pow(2, r)
        for (let i = 0; i < roundCount; i++) ubMatches[r].push(crypto.randomUUID())
    }

    // Pre-generate LB match UUIDs
    for (let r = 1; r <= numLBRounds; r++) {
        lbMatches[r] = []
        // LB rounds alternate between cutting the field in half, and receiving drops from UB
        const roundCount = bracketSize / Math.pow(2, Math.floor((r + 3) / 2))
        for (let i = 0; i < roundCount; i++) lbMatches[r].push(crypto.randomUUID())
    }

    const matchesToInsert: any[] = []
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5)
    let baseTime = new Date().getTime()

    // 1. Fill UB Round 1 and create their matches
    const ubR1Count = bracketSize / 2
    for (let i = 0; i < ubR1Count; i++) {
        const team1 = shuffledTeams[i * 2] || null
        const team2 = shuffledTeams[i * 2 + 1] || null

        const nextUbIndex = Math.floor(i / 2)
        const nextUbMatchId = numUBRounds > 1 ? ubMatches[2][nextUbIndex] : gfMatchId

        // UB R1 losers drop to LB R1
        const lbDropIndex = Math.floor(i / 2) // Typically 2 losers drop to 1 LB match
        const nextLbMatchId = lbMatches[1] ? lbMatches[1][lbDropIndex] : null

        matchesToInsert.push({
            id: ubMatches[1][i],
            tournament_id: tournamentId,
            round: 1,
            phase: 'upper_bracket',
            match_format: 'bo1',
            team1_id: team1 ? team1.id : null,
            team2_id: team2 ? team2.id : null,
            created_at: new Date(baseTime + i * 1000).toISOString(),
            next_winner_match_id: nextUbMatchId,
            next_loser_match_id: nextLbMatchId,
            state: 'pending'
        })
    }

    // 2. Subsequent UB Rounds
    for (let r = 2; r <= numUBRounds; r++) {
        const roundCount = bracketSize / Math.pow(2, r)
        baseTime += 100000
        for (let i = 0; i < roundCount; i++) {
            const nextUbIndex = Math.floor(i / 2)
            const nextUbMatchId = r < numUBRounds ? ubMatches[r + 1][nextUbIndex] : gfMatchId

            // UB R2+ losers drop to corresponding LB rounds
            // E.g., UB R2 drops to LB R2 (or R3 depending on exact tracking). For standard:
            // UB Rn drops to LB 2(n-1)
            const correspondingLbRound = (r - 1) * 2
            // The mapping index for LB drops can get complex (cross-matching to avoid playing same team).
            // For now, straight mapping.
            const nextLbMatchId = lbMatches[correspondingLbRound] ? lbMatches[correspondingLbRound][i] : null

            matchesToInsert.push({
                id: ubMatches[r][i],
                tournament_id: tournamentId,
                round: r,
                phase: 'upper_bracket',
                match_format: r === numUBRounds ? 'bo3' : 'bo1',
                team1_id: null,
                team2_id: null,
                created_at: new Date(baseTime + i * 1000).toISOString(),
                next_winner_match_id: nextUbMatchId,
                next_loser_match_id: nextLbMatchId,
                state: 'pending'
            })
        }
    }

    // 3. Lower Bracket Rounds
    for (let r = 1; r <= numLBRounds; r++) {
        const roundCount = bracketSize / Math.pow(2, Math.floor((r + 3) / 2))
        baseTime += 100000
        for (let i = 0; i < roundCount; i++) {
            const nextLbIndex = r % 2 !== 0 ? i : Math.floor(i / 2)
            const nextLbMatchId = r < numLBRounds ? lbMatches[r + 1][nextLbIndex] : gfMatchId

            matchesToInsert.push({
                id: lbMatches[r][i],
                tournament_id: tournamentId,
                round: r,
                phase: 'lower_bracket',
                match_format: r >= numLBRounds - 1 ? 'bo3' : 'bo1',
                team1_id: null,
                team2_id: null,
                created_at: new Date(baseTime + i * 1000).toISOString(),
                next_winner_match_id: nextLbMatchId,
                next_loser_match_id: null, // LB losers are out
                state: 'pending'
            })
        }
    }

    // 4. Grand Finals
    matchesToInsert.push({
        id: gfMatchId,
        tournament_id: tournamentId,
        round: 1,
        phase: 'grand_finals',
        match_format: 'bo5',
        team1_id: null,
        team2_id: null,
        created_at: new Date(baseTime + 100000).toISOString(),
        next_winner_match_id: null,
        next_loser_match_id: null,
        state: 'pending'
    })

    const { error: insertErr } = await supabaseAdmin.from('tournament_matches').insert(matchesToInsert)
    if (insertErr) throw new Error('Failed to insert double elimination matches: ' + insertErr.message)

    // Handle byes in UB R1 (Auto advance)
    const { data: ubR1Matches } = await supabaseAdmin.from('tournament_matches')
        .select('id, team1_id, team2_id')
        .eq('tournament_id', tournamentId)
        .eq('phase', 'upper_bracket')
        .eq('round', 1)

    if (ubR1Matches) {
        for (const m of ubR1Matches) {
            const isBye = (m.team1_id && !m.team2_id) || (!m.team1_id && m.team2_id)
            if (isBye) {
                const winnerId = m.team1_id || m.team2_id
                await updateMatchScore(m.id, m.team1_id ? 1 : 0, m.team2_id ? 1 : 0, winnerId!)
            }
        }
    }

    return { matchesGenerated: matchesToInsert.length }
}

async function generateRoundRobin(tournamentId: string, teams: any[]) {
    if (!teams || teams.length < 2) {
        throw new Error('At least 2 teams are required for a Round Robin format.')
    }

    // 1. Clear existing brackets/groups
    await supabaseAdmin.from('tournament_matches').delete().eq('tournament_id', tournamentId)
    await supabaseAdmin.from('tournament_teams').update({ group_id: null }).eq('tournament_id', tournamentId)

    // 2. Setup a global single group
    const { data: group, error: groupErr } = await supabaseAdmin.from('tournament_groups').insert({
        tournament_id: tournamentId,
        name: 'Global Round Robin'
    }).select().single()

    if (groupErr || !group) throw new Error('Failed to create Round Robin group: ' + groupErr?.message)

    // Assign all teams to the single global group
    for (const team of teams) {
        await supabaseAdmin.from('tournament_teams')
            .update({ group_id: group.id })
            .eq('id', team.id)
    }

    const matchesToInsert: any[] = []
    let baseTime = new Date().getTime()

    // 3. Generate Round Robin Pairings (Circle Method)
    const n = teams.length
    // If odd number of teams, add a dummy 'bye' team
    const teamsList = n % 2 !== 0 ? [...teams, { id: null, dummy: true }] : [...teams]
    const totalRounds = teamsList.length - 1
    const matchesPerRound = teamsList.length / 2

    for (let round = 1; round <= totalRounds; round++) {
        for (let match = 0; match < matchesPerRound; match++) {
            const home = teamsList[match]
            const away = teamsList[teamsList.length - 1 - match]

            // If neither is the dummy team, schedule the match
            if (home.id !== null && away.id !== null) {
                matchesToInsert.push({
                    tournament_id: tournamentId,
                    group_id: group.id,
                    round: round,
                    phase: 'round_robin', // Explicit phase identifier
                    match_format: 'bo1',
                    team1_id: home.id,
                    team2_id: away.id,
                    created_at: new Date(baseTime).toISOString(),
                    state: 'pending'
                })
                baseTime += 1000 // stagger creations slightly
            }
        }

        // Rotate the array for the next round (keep first element fixed)
        const last = teamsList.pop()!
        teamsList.splice(1, 0, last)

        baseTime += 100000 // distinct chronological gaps between rounds
    }

    const { error: insertErr } = await supabaseAdmin.from('tournament_matches').insert(matchesToInsert)
    if (insertErr) throw new Error('Failed to insert round robin matches: ' + insertErr.message)

    return { numRounds: totalRounds, matchesGenerated: matchesToInsert.length }
}

async function generateSwissRound1(tournamentId: string, teams: any[]) {
    if (!teams || teams.length < 2) {
        throw new Error('At least 2 teams are required for a Swiss format.')
    }

    // 1. Clear existing brackets/groups
    await supabaseAdmin.from('tournament_matches').delete().eq('tournament_id', tournamentId)
    await supabaseAdmin.from('tournament_teams').update({ group_id: null }).eq('tournament_id', tournamentId)

    // 2. Determine Swiss Rounds (typically log2(teams) rounded up, but can be manual)
    const totalRounds = Math.ceil(Math.log2(teams.length))

    // We only generate Round 1 initially. Subsequent rounds are generated on demand.
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5)

    // If odd, one team gets a bye
    const hasBye = shuffledTeams.length % 2 !== 0
    if (hasBye) {
        shuffledTeams.push({ id: null, dummy: true })
    }

    const matchesToInsert: any[] = []
    let baseTime = new Date().getTime()

    for (let i = 0; i < shuffledTeams.length; i += 2) {
        const team1 = shuffledTeams[i]
        const team2 = shuffledTeams[i + 1]

        // Byes are auto-wins, denoted by null ID
        matchesToInsert.push({
            tournament_id: tournamentId,
            round: 1,
            phase: 'swiss',
            match_format: 'bo1',
            team1_id: team1.id,
            team2_id: team2.id,
            created_at: new Date(baseTime + i * 1000).toISOString(),
            state: 'pending'
        })
    }

    const { error: insertErr } = await supabaseAdmin.from('tournament_matches').insert(matchesToInsert)
    if (insertErr) throw new Error('Failed to insert swiss matches: ' + insertErr.message)

    // Auto-advance byes
    const { data: round1Matches } = await supabaseAdmin.from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('phase', 'swiss')
        .eq('round', 1)

    if (round1Matches) {
        for (const m of round1Matches) {
            const isBye = (m.team1_id && !m.team2_id) || (!m.team1_id && m.team2_id)
            if (isBye) {
                const winnerId = m.team1_id || m.team2_id
                await updateMatchScore(m.id, m.team1_id ? 1 : 0, m.team2_id ? 1 : 0, winnerId!)
            }
        }
    }

    return { numRounds: totalRounds, matchesGenerated: matchesToInsert.length }
}

export async function generateNextSwissRound(tournamentId: string) {
    // 1. Fetch all matches in Swiss phase
    const { data: matches } = await supabaseAdmin.from('tournament_matches')
        .select('*, team1:tournament_teams!tournament_matches_team1_id_fkey(*), team2:tournament_teams!tournament_matches_team2_id_fkey(*)')
        .eq('tournament_id', tournamentId)
        .eq('phase', 'swiss')

    if (!matches || matches.length === 0) throw new Error('No Swiss rounds initialized.')

    // Validate current round is fully complete
    const currentRound = Math.max(...matches.map(m => m.round))
    const currentRoundMatches = matches.filter(m => m.round === currentRound)
    const incomplete = currentRoundMatches.some(m => m.state !== 'completed')

    if (incomplete) throw new Error('Not all matches in the current round are completed.')

    // 2. Calculate standings (pts/wins)
    const standings: Record<string, { id: string, points: number, diff: number, played: string[] }> = {}

    // Initialize teams list based on unique IDs appearing in match history
    matches.forEach(m => {
        if (m.team1_id && !standings[m.team1_id]) standings[m.team1_id] = { id: m.team1_id, points: 0, diff: 0, played: [] }
        if (m.team2_id && !standings[m.team2_id]) standings[m.team2_id] = { id: m.team2_id, points: 0, diff: 0, played: [] }
    })

    // Tally points and diffs
    matches.forEach(m => {
        if (m.team1_id && m.team2_id) {
            standings[m.team1_id].played.push(m.team2_id)
            standings[m.team2_id].played.push(m.team1_id)
        }

        if (m.winner_id) {
            standings[m.winner_id].points += 3
        }

        if (m.team1_id) standings[m.team1_id].diff += (m.team1_score || 0) - (m.team2_score || 0)
        if (m.team2_id) standings[m.team2_id].diff += (m.team2_score || 0) - (m.team1_score || 0)
    })

    // Sort by points, then diff
    const rankedTeams = Object.values(standings).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        return b.diff - a.diff
    })

    // 3. Dynamic Pairing (Greedy approach for simplified Swiss)
    const nextRound = currentRound + 1
    const unassigned = [...rankedTeams]
    const pairings: Array<[string, string | null]> = []

    // If odd number of real teams, bottom-most gets bye
    if (unassigned.length % 2 !== 0) {
        const bottom = unassigned.pop()!
        pairings.push([bottom.id, null])
    }

    while (unassigned.length > 0) {
        const current = unassigned.shift()!

        // Find highest ranked opponent they haven't played
        let opIndex = unassigned.findIndex(t => !current.played.includes(t.id))

        // Fallback: If everyone played everyone (rare in 1st half of swiss), just play highest unassigned
        if (opIndex === -1) opIndex = 0

        const opponent = unassigned.splice(opIndex, 1)[0]
        pairings.push([current.id, opponent.id])
    }

    // 4. Create Matches
    const matchesToInsert: any[] = []
    let baseTime = new Date().getTime()

    pairings.forEach((pair, idx) => {
        matchesToInsert.push({
            tournament_id: tournamentId,
            round: nextRound,
            phase: 'swiss',
            match_format: 'bo1',
            team1_id: pair[0],
            team2_id: pair[1],
            created_at: new Date(baseTime + idx * 1000).toISOString(),
            state: 'pending'
        })
    })

    const { error: insertErr } = await supabaseAdmin.from('tournament_matches').insert(matchesToInsert)
    if (insertErr) throw new Error('Failed to insert next Swiss round matches: ' + insertErr.message)

    // Auto-advance byes
    const { data: newMatches } = await supabaseAdmin.from('tournament_matches')
        .select('id, team1_id, team2_id')
        .eq('tournament_id', tournamentId)
        .eq('phase', 'swiss')
        .eq('round', nextRound)

    if (newMatches) {
        for (const m of newMatches) {
            const isBye = (m.team1_id && !m.team2_id) || (!m.team1_id && m.team2_id)
            if (isBye) {
                const winnerId = m.team1_id || m.team2_id
                await updateMatchScore(m.id, m.team1_id ? 1 : 0, m.team2_id ? 1 : 0, winnerId!)
            }
        }
    }

    return { numRounds: nextRound, matchesGenerated: matchesToInsert.length }
}

async function generateCompassDraw(tournamentId: string, teams: any[], bracketSize: number) {
    if (bracketSize < 8) {
        throw new Error('Compass Draw requires at least an 8-team bracket.')
    }

    const matchesToInsert: any[] = []
    let baseTime = new Date().getTime()

    // 1. Clear existing
    await supabaseAdmin.from('tournament_matches').delete().eq('tournament_id', tournamentId)

    // Pre-generate UUID maps for directions
    // standard 8-team compass: East (winners), West (1st round losers), North (East R1 losers), South (West R1 losers)
    const directions = ['east', 'west', 'north', 'south']
    const matchIds: Record<string, { [round: number]: string[] }> = {}

    // Determine sizes (simplified to an 8-team subset map)
    directions.forEach(dir => {
        matchIds[dir] = {}
        const dirSize = dir === 'east' ? bracketSize : bracketSize / 2
        const numRounds = Math.log2(dirSize)
        for (let r = 1; r <= numRounds; r++) {
            matchIds[dir][r] = []
            const roundCount = dirSize / Math.pow(2, r)
            for (let i = 0; i < roundCount; i++) matchIds[dir][r].push(crypto.randomUUID())
        }
    })

    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5)

    // 2. East Bracket (Main Winners Bracket) Round 1
    const eastR1Count = bracketSize / 2
    for (let i = 0; i < eastR1Count; i++) {
        const team1 = shuffledTeams[i * 2] || null
        const team2 = shuffledTeams[i * 2 + 1] || null

        const nextWinnerId = matchIds['east'][2] ? matchIds['east'][2][Math.floor(i / 2)] : null
        const nextLoserId = matchIds['west'][1] ? matchIds['west'][1][Math.floor(i / 2)] : null

        matchesToInsert.push({
            id: matchIds['east'][1][i],
            tournament_id: tournamentId,
            round: 1,
            phase: 'compass_east',
            match_format: 'bo1',
            team1_id: team1 ? team1.id : null,
            team2_id: team2 ? team2.id : null,
            created_at: new Date(baseTime + i * 1000).toISOString(),
            next_winner_match_id: nextWinnerId,
            next_loser_match_id: nextLoserId,
            state: 'pending'
        })
    }

    // 3. East Bracket Subsequent Rounds (and their drops)
    const numEastRounds = Math.log2(bracketSize)
    for (let r = 2; r <= numEastRounds; r++) {
        const roundCount = bracketSize / Math.pow(2, r)
        baseTime += 100000
        for (let i = 0; i < roundCount; i++) {
            const nextWinnerId = r < numEastRounds ? matchIds['east'][r + 1][Math.floor(i / 2)] : null

            // East R2 losers drop to North R1
            const nextLoserId = r === 2 && matchIds['north'][1] ? matchIds['north'][1][Math.floor(i / 2)] : null

            matchesToInsert.push({
                id: matchIds['east'][r][i],
                tournament_id: tournamentId,
                round: r,
                phase: 'compass_east',
                match_format: 'bo1',
                team1_id: null,
                team2_id: null,
                created_at: new Date(baseTime + i * 1000).toISOString(),
                next_winner_match_id: nextWinnerId,
                next_loser_match_id: nextLoserId,
                state: 'pending'
            })
        }
    }

    // 4. West Bracket (Losers from East R1)
    const numWestRounds = Math.log2(bracketSize / 2)
    for (let r = 1; r <= numWestRounds; r++) {
        const roundCount = (bracketSize / 2) / Math.pow(2, r)
        baseTime += 100000
        for (let i = 0; i < roundCount; i++) {
            const nextWinnerId = r < numWestRounds ? matchIds['west'][r + 1][Math.floor(i / 2)] : null
            // West R1 losers drop to South R1
            const nextLoserId = r === 1 && matchIds['south'][1] ? matchIds['south'][1][Math.floor(i / 2)] : null

            matchesToInsert.push({
                id: matchIds['west'][r][i],
                tournament_id: tournamentId,
                round: r,
                phase: 'compass_west',
                match_format: 'bo1',
                team1_id: null,
                team2_id: null,
                created_at: new Date(baseTime + i * 1000).toISOString(),
                next_winner_match_id: nextWinnerId,
                next_loser_match_id: nextLoserId,
                state: 'pending'
            })
        }
    }

    // 5. North Bracket (Losers from East R2)
    const numNorthRounds = Math.log2(bracketSize / 4)
    if (numNorthRounds >= 1) {
        for (let r = 1; r <= numNorthRounds; r++) {
            const roundCount = (bracketSize / 4) / Math.pow(2, r)
            baseTime += 100000
            for (let i = 0; i < roundCount; i++) {
                const nextWinnerId = r < numNorthRounds ? matchIds['north'][r + 1][Math.floor(i / 2)] : null

                matchesToInsert.push({
                    id: matchIds['north'][r][i],
                    tournament_id: tournamentId,
                    round: r,
                    phase: 'compass_north',
                    match_format: 'bo1',
                    team1_id: null,
                    team2_id: null,
                    created_at: new Date(baseTime + i * 1000).toISOString(),
                    next_winner_match_id: nextWinnerId,
                    next_loser_match_id: null,
                    state: 'pending'
                })
            }
        }
    }

    // 6. South Bracket (Losers from West R1)
    const numSouthRounds = Math.log2(bracketSize / 4)
    if (numSouthRounds >= 1) {
        for (let r = 1; r <= numSouthRounds; r++) {
            const roundCount = (bracketSize / 4) / Math.pow(2, r)
            baseTime += 100000
            for (let i = 0; i < roundCount; i++) {
                const nextWinnerId = r < numSouthRounds ? matchIds['south'][r + 1][Math.floor(i / 2)] : null

                matchesToInsert.push({
                    id: matchIds['south'][r][i],
                    tournament_id: tournamentId,
                    round: r,
                    phase: 'compass_south',
                    match_format: 'bo1',
                    team1_id: null,
                    team2_id: null,
                    created_at: new Date(baseTime + i * 1000).toISOString(),
                    next_winner_match_id: nextWinnerId,
                    next_loser_match_id: null,
                    state: 'pending'
                })
            }
        }
    }

    const { error: insertErr } = await supabaseAdmin.from('tournament_matches').insert(matchesToInsert)
    if (insertErr) throw new Error('Failed to insert compass matches: ' + insertErr.message)

    return { matchesGenerated: matchesToInsert.length }
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
            id, tournament_id, team1_id, team2_id, winner_id, team1_score, team2_score, round, state, phase, group_id, match_format, created_at, scheduled_time, opendota_match_id,
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
