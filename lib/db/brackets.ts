import { supabaseAdmin } from '../supabase-admin'
import { updateMatchScore } from './matches'
import { getTournamentLeaderboard } from './leaderboard'

export async function generateBracket(tournamentId: string, overrideSize?: number) {
    const { data: tournament, error: tErr } = await supabaseAdmin.from('tournaments')
        .select('*').eq('id', tournamentId).single()
    if (tErr || !tournament) throw new Error('Tournament not found')

    const { data: teams, error: teamsErr } = await supabaseAdmin.from('tournament_teams')
        .select('*').eq('tournament_id', tournamentId)

    if (teamsErr) throw new Error('Error fetching tournament teams.')

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

    await supabaseAdmin.from('tournament_matches').delete().eq('tournament_id', tournamentId)

    const numRounds = Math.log2(bracketSize)
    const matchesToInsert: any[] = []
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
            state: 'pending',
            phase: 'brackets'
        })
    }

    // Subsequent rounds
    for (let r = 2; r <= numRounds; r++) {
        const roundCount = bracketSize / Math.pow(2, r)
        baseTime += 100000
        for (let i = 0; i < roundCount; i++) {
            matchesToInsert.push({
                tournament_id: tournamentId,
                round: r,
                team1_id: null,
                team2_id: null,
                created_at: new Date(baseTime + i * 1000).toISOString(),
                state: 'pending',
                phase: 'brackets'
            })
        }
    }

    const { error: insertErr } = await supabaseAdmin.from('tournament_matches').insert(matchesToInsert)
    if (insertErr) throw new Error('Failed to insert matches: ' + insertErr.message)

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

    const { data: tournament, error: tErr } = await supabaseAdmin.from('tournaments')
        .select('*').eq('id', tournamentId).single()
    if (tErr || !tournament) throw new Error('Tournament not found')

    const { data: teams, error: teamsErr } = await supabaseAdmin.from('tournament_teams')
        .select('*').eq('tournament_id', tournamentId)

    if (teamsErr || !teams || teams.length < groupsCount) {
        throw new Error('Not enough teams to generate groups.')
    }

    await supabaseAdmin.from('tournament_matches').delete().eq('tournament_id', tournamentId).eq('phase', 'group_stage')
    await supabaseAdmin.from('tournament_teams').update({ group_id: null }).eq('tournament_id', tournamentId)

    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5)
    const groups: { [key: string]: any[] } = {}
    const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, groupsCount)

    groupNames.forEach(name => groups[name] = [])
    shuffledTeams.forEach((team, index) => {
        const groupName = groupNames[index % groupsCount]
        groups[groupName].push(team)
    })

    for (const [groupName, groupTeams] of Object.entries(groups)) {
        for (const team of groupTeams) {
            await supabaseAdmin.from('tournament_teams').update({ group_id: groupName }).eq('id', team.id)
        }
    }

    const matchesToInsert: any[] = []
    let baseTime = new Date().getTime()

    for (const [groupName, groupTeams] of Object.entries(groups)) {
        const n = groupTeams.length
        const isOdd = n % 2 !== 0
        const teamsList = isOdd ? [...groupTeams, null] : [...groupTeams]
        const totalRounds = teamsList.length - 1
        const halfSize = teamsList.length / 2

        for (let round = 0; round < totalRounds; round++) {
            for (let i = 0; i < halfSize; i++) {
                const team1 = teamsList[i]
                const team2 = teamsList[teamsList.length - 1 - i]

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
                    baseTime += 1000
                }
            }
            teamsList.splice(1, 0, teamsList.pop() as any)
        }
    }

    if (matchesToInsert.length > 0) {
        const { error: insertErr } = await supabaseAdmin.from('tournament_matches').insert(matchesToInsert)
        if (insertErr) throw new Error('Failed to insert group matches: ' + insertErr.message)
    }

    await supabaseAdmin.from('tournaments').update({ active_phase: 'group_stage' }).eq('id', tournamentId)
    return { groupsCreated: groupsCount, matchesGenerated: matchesToInsert.length }
}

export async function generateDoubleEliminationBracket(tournamentId: string) {
    const leaderboard = await getTournamentLeaderboard(tournamentId)

    const groupA = leaderboard.filter(t => t.group_id === 'A').slice(0, 4)
    const groupB = leaderboard.filter(t => t.group_id === 'B').slice(0, 4)
    const groupC = leaderboard.filter(t => t.group_id === 'C').slice(0, 4)
    const groupD = leaderboard.filter(t => t.group_id === 'D').slice(0, 4)

    if (groupA.length < 4 || groupB.length < 4 || groupC.length < 4 || groupD.length < 4) {
        throw new Error('Double Elimination generation requires at least 4 teams in each of groups A, B, C, and D.')
    }

    const A1 = groupA[0].id, A2 = groupA[1].id, A3 = groupA[2].id, A4 = groupA[3].id
    const B1 = groupB[0].id, B2 = groupB[1].id, B3 = groupB[2].id, B4 = groupB[3].id
    const C1 = groupC[0].id, C2 = groupC[1].id, C3 = groupC[2].id, C4 = groupC[3].id
    const D1 = groupD[0].id, D2 = groupD[1].id, D3 = groupD[2].id, D4 = groupD[3].id

    const uuid = () => crypto.randomUUID()

    const U1 = uuid(), U2 = uuid(), U3 = uuid(), U4 = uuid()
    const U5 = uuid(), U6 = uuid(), U7 = uuid(), U8 = uuid()
    const U9 = uuid(), U10 = uuid()
    const U11 = uuid()

    const L1 = uuid(), L2 = uuid(), L3 = uuid(), L4 = uuid()
    const L5 = uuid(), L6 = uuid(), L7 = uuid(), L8 = uuid()
    const L9 = uuid(), L10 = uuid()
    const L11 = uuid(), L12 = uuid()
    const L13 = uuid()
    const L14 = uuid()

    const GF = uuid()

    const matches = [
        { id: U1, tournament_id: tournamentId, phase: 'upper_bracket', round: 1, team1_id: A2, team2_id: B3, match_format: 'bo1', next_winner_match_id: U5, next_loser_match_id: L1, state: 'pending' },
        { id: U2, tournament_id: tournamentId, phase: 'upper_bracket', round: 1, team1_id: C2, team2_id: D3, match_format: 'bo1', next_winner_match_id: U6, next_loser_match_id: L2, state: 'pending' },
        { id: U3, tournament_id: tournamentId, phase: 'upper_bracket', round: 1, team1_id: B2, team2_id: A3, match_format: 'bo1', next_winner_match_id: U7, next_loser_match_id: L3, state: 'pending' },
        { id: U4, tournament_id: tournamentId, phase: 'upper_bracket', round: 1, team1_id: D2, team2_id: C3, match_format: 'bo1', next_winner_match_id: U8, next_loser_match_id: L4, state: 'pending' },

        { id: U5, tournament_id: tournamentId, phase: 'upper_bracket', round: 2, team1_id: A1, team2_id: null, match_format: 'bo3', next_winner_match_id: U9, next_loser_match_id: L5, state: 'pending' },
        { id: U6, tournament_id: tournamentId, phase: 'upper_bracket', round: 2, team1_id: C1, team2_id: null, match_format: 'bo3', next_winner_match_id: U9, next_loser_match_id: L6, state: 'pending' },
        { id: U7, tournament_id: tournamentId, phase: 'upper_bracket', round: 2, team1_id: B1, team2_id: null, match_format: 'bo3', next_winner_match_id: U10, next_loser_match_id: L7, state: 'pending' },
        { id: U8, tournament_id: tournamentId, phase: 'upper_bracket', round: 2, team1_id: D1, team2_id: null, match_format: 'bo3', next_winner_match_id: U10, next_loser_match_id: L8, state: 'pending' },

        { id: U9, tournament_id: tournamentId, phase: 'upper_bracket', round: 3, team1_id: null, team2_id: null, match_format: 'bo3', next_winner_match_id: U11, next_loser_match_id: L11, state: 'pending' },
        { id: U10, tournament_id: tournamentId, phase: 'upper_bracket', round: 3, team1_id: null, team2_id: null, match_format: 'bo3', next_winner_match_id: U11, next_loser_match_id: L12, state: 'pending' },

        { id: U11, tournament_id: tournamentId, phase: 'upper_bracket', round: 4, team1_id: null, team2_id: null, match_format: 'bo3', next_winner_match_id: GF, next_loser_match_id: L14, state: 'pending' },

        { id: L1, tournament_id: tournamentId, phase: 'lower_bracket', round: 1, team1_id: A4, team2_id: null, match_format: 'bo1', next_winner_match_id: L5, next_loser_match_id: null, state: 'pending' },
        { id: L2, tournament_id: tournamentId, phase: 'lower_bracket', round: 1, team1_id: C4, team2_id: null, match_format: 'bo1', next_winner_match_id: L6, next_loser_match_id: null, state: 'pending' },
        { id: L3, tournament_id: tournamentId, phase: 'lower_bracket', round: 1, team1_id: B4, team2_id: null, match_format: 'bo1', next_winner_match_id: L7, next_loser_match_id: null, state: 'pending' },
        { id: L4, tournament_id: tournamentId, phase: 'lower_bracket', round: 1, team1_id: D4, team2_id: null, match_format: 'bo1', next_winner_match_id: L8, next_loser_match_id: null, state: 'pending' },

        { id: L5, tournament_id: tournamentId, phase: 'lower_bracket', round: 2, team1_id: null, team2_id: null, match_format: 'bo1', next_winner_match_id: L9, next_loser_match_id: null, state: 'pending' },
        { id: L6, tournament_id: tournamentId, phase: 'lower_bracket', round: 2, team1_id: null, team2_id: null, match_format: 'bo1', next_winner_match_id: L9, next_loser_match_id: null, state: 'pending' },
        { id: L7, tournament_id: tournamentId, phase: 'lower_bracket', round: 2, team1_id: null, team2_id: null, match_format: 'bo1', next_winner_match_id: L10, next_loser_match_id: null, state: 'pending' },
        { id: L8, tournament_id: tournamentId, phase: 'lower_bracket', round: 2, team1_id: null, team2_id: null, match_format: 'bo1', next_winner_match_id: L10, next_loser_match_id: null, state: 'pending' },

        { id: L9, tournament_id: tournamentId, phase: 'lower_bracket', round: 3, team1_id: null, team2_id: null, match_format: 'bo1', next_winner_match_id: L11, next_loser_match_id: null, state: 'pending' },
        { id: L10, tournament_id: tournamentId, phase: 'lower_bracket', round: 3, team1_id: null, team2_id: null, match_format: 'bo1', next_winner_match_id: L12, next_loser_match_id: null, state: 'pending' },

        { id: L11, tournament_id: tournamentId, phase: 'lower_bracket', round: 4, team1_id: null, team2_id: null, match_format: 'bo3', next_winner_match_id: L13, next_loser_match_id: null, state: 'pending' },
        { id: L12, tournament_id: tournamentId, phase: 'lower_bracket', round: 4, team1_id: null, team2_id: null, match_format: 'bo3', next_winner_match_id: L13, next_loser_match_id: null, state: 'pending' },

        { id: L13, tournament_id: tournamentId, phase: 'lower_bracket', round: 5, team1_id: null, team2_id: null, match_format: 'bo3', next_winner_match_id: L14, next_loser_match_id: null, state: 'pending' },
        { id: L14, tournament_id: tournamentId, phase: 'lower_bracket', round: 6, team1_id: null, team2_id: null, match_format: 'bo3', next_winner_match_id: GF, next_loser_match_id: null, state: 'pending' },

        { id: GF, tournament_id: tournamentId, phase: 'grand_finals', round: 1, team1_id: null, team2_id: null, match_format: 'bo5', next_winner_match_id: null, next_loser_match_id: null, state: 'pending' }
    ]

    await supabaseAdmin.from('tournament_matches').delete()
        .eq('tournament_id', tournamentId)
        .in('phase', ['upper_bracket', 'lower_bracket', 'grand_finals', 'brackets'])

    const { error } = await supabaseAdmin.from('tournament_matches').insert(matches)
    if (error) throw new Error('Failed to insert double elimination brackets: ' + error.message)

    await supabaseAdmin.from('tournaments').update({ active_phase: 'playoffs' }).eq('id', tournamentId)
    return { success: true, matchesGenerated: matches.length }
}
