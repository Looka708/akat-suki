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
    steam_id: string | null
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

export async function deleteTournament(id: string) {
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

export async function joinTeam(teamId: string, userId: string, discordId: string | null, steamId?: string | null) {
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
            discord_id: discordId,
            steam_id: steamId || null
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

    if (teamsErr || !teams || teams.length < 2) {
        throw new Error('Not enough teams to generate a bracket (min 2).')
    }

    // Find nearest power of 2 for bracket size (2, 4, 8, 16...)
    let bracketSize = 2;
    while (bracketSize < teams.length) {
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

    return { numRounds, matchesGenerated: matchesToInsert.length }
}

export async function getTournamentMatches(tournamentId: string) {
    const { data: matches, error } = await supabaseAdmin.from('tournament_matches')
        .select(`
            id, tournament_id, team1_id, team2_id, winner_id, team1_score, team2_score, round, state, created_at, scheduled_time,
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
        .select('id, name, logo_url')
        .eq('tournament_id', tournamentId)

    if (teamsErr) throw new Error('Failed to fetch teams: ' + teamsErr.message)

    // get all completed matches
    const { data: matches, error: matchesErr } = await supabaseAdmin
        .from('tournament_matches')
        .select('team1_id, team2_id, winner_id')
        .eq('tournament_id', tournamentId)
        .eq('state', 'completed')

    if (matchesErr) throw new Error('Failed to fetch matches: ' + matchesErr.message)

    const leaderboard = (teams || []).map(team => {
        let wins = 0
        let losses = 0

            ; (matches || []).forEach(m => {
                if (m.team1_id === team.id || m.team2_id === team.id) {
                    if (m.winner_id === team.id) {
                        wins++
                    } else if (m.winner_id) {
                        losses++
                    }
                }
            })

        return {
            ...team,
            wins,
            losses,
            matchesPlayed: wins + losses,
            points: wins * 3
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

    return updatedMatch
}
