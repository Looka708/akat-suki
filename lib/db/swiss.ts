import { supabaseAdmin } from '../supabase-admin'
import { getTournamentLeaderboard } from './leaderboard'

/**
 * Generates the next round for a Swiss-system tournament.
 * Matches teams with similar scores who haven't played each other yet.
 */
export async function generateSwissRound(tournamentId: string) {
    // 1. Get current standings (using leaderboard which calculates points)
    const leaderboard = await getTournamentLeaderboard(tournamentId)

    // 2. Get all existing matches to detect rematches
    const { data: existingMatches } = await supabaseAdmin
        .from('tournament_matches')
        .select('team1_id, team2_id')
        .eq('tournament_id', tournamentId)

    const playedPairs = new Set<string>()
    existingMatches?.forEach(m => {
        if (m.team1_id && m.team2_id) {
            playedPairs.add(`${m.team1_id}-${m.team2_id}`)
            playedPairs.add(`${m.team2_id}-${m.team1_id}`)
        }
    })

    // 3. Determine current round
    const { data: latestMatch } = await supabaseAdmin
        .from('tournament_matches')
        .select('round')
        .eq('tournament_id', tournamentId)
        .order('round', { ascending: false })
        .limit(1)
        .single()

    const nextRound = (latestMatch?.round || 0) + 1

    // 4. Pair teams (Simple greedy matching from top to bottom)
    const unmatched = [...leaderboard]
    const pairings: { t1: string; t2: string | null }[] = []

    while (unmatched.length > 0) {
        const t1 = unmatched.shift()!
        let t2Index = -1

        // Look for the best available opponent (closest rank, no rematch)
        for (let i = 0; i < unmatched.length; i++) {
            const potentialT2 = unmatched[i]
            if (!playedPairs.has(`${t1.id}-${potentialT2.id}`)) {
                t2Index = i
                break
            }
        }

        if (t2Index !== -1) {
            const t2 = unmatched.splice(t2Index, 1)[0]
            pairings.push({ t1: t1.id, t2: t2.id })
        } else {
            // No valid opponent found (should only happen with odd numbers or late rounds)
            pairings.push({ t1: t1.id, t2: null }) // Bye
        }
    }

    // 5. Insert matches
    const matchesToInsert = pairings.map((p, i) => ({
        tournament_id: tournamentId,
        round: nextRound,
        team1_id: p.t1,
        team2_id: p.t2,
        state: 'pending',
        phase: 'swiss',
        match_format: 'bo1', // Default for swiss
        created_at: new Date(Date.now() + i * 1000).toISOString()
    }))

    const { error } = await supabaseAdmin.from('tournament_matches').insert(matchesToInsert)
    if (error) throw error

    return { round: nextRound, matches: matchesToInsert.length }
}
