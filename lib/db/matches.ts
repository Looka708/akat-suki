import { supabaseAdmin } from '../supabase-admin'
import { TournamentMatch } from './types'

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

export async function updateMatchScore(matchId: string, t1Score: number, t2Score: number, winnerId: string) {
    // 1. Update current match
    const { data: match, error } = await supabaseAdmin
        .from('tournament_matches')
        .update({
            team1_score: t1Score,
            team2_score: t2Score,
            winner_id: winnerId,
            state: 'completed'
        })
        .eq('id', matchId)
        .select()
        .single()

    if (error) throw error

    // 2. Handle advancement (UB/Brackets)
    if (match.next_winner_match_id) {
        // Explicitly pointed to next match (TI-style or custom)
        const { data: nextMatch } = await supabaseAdmin
            .from('tournament_matches')
            .select('team1_id, team2_id')
            .eq('id', match.next_winner_match_id)
            .single()

        if (nextMatch) {
            const field = !nextMatch.team1_id ? 'team1_id' : 'team2_id'
            await supabaseAdmin.from('tournament_matches')
                .update({ [field]: winnerId })
                .eq('id', match.next_winner_match_id)
        }
    } else if (match.phase === 'brackets' || (match.phase === 'upper_bracket' && !match.next_winner_match_id)) {
        // Standard single elimination auto-detect
        const nextRound = match.round + 1
        const { data: matchesInRound } = await supabaseAdmin
            .from('tournament_matches')
            .select('id, created_at')
            .eq('tournament_id', match.tournament_id)
            .eq('round', match.round)
            .order('created_at', { ascending: true })

        if (matchesInRound) {
            const matchIndex = matchesInRound.findIndex(m => m.id === match.id)
            const nextMatchIndex = Math.floor(matchIndex / 2)
            const isTeam1 = matchIndex % 2 === 0

            const { data: nextRoundMatches } = await supabaseAdmin
                .from('tournament_matches')
                .select('id')
                .eq('tournament_id', match.tournament_id)
                .eq('round', nextRound)
                .order('created_at', { ascending: true })

            if (nextRoundMatches && nextRoundMatches[nextMatchIndex]) {
                const nextMatchId = nextRoundMatches[nextMatchIndex].id
                await supabaseAdmin.from('tournament_matches')
                    .update({ [isTeam1 ? 'team1_id' : 'team2_id']: winnerId })
                    .eq('id', nextMatchId)
            }
        }
    }

    // 3. Handle Loser advancement (TI-style Double Elim)
    if (match.next_loser_match_id) {
        const loserId = winnerId === match.team1_id ? match.team2_id : match.team1_id
        if (loserId) {
            const { data: nextLoserMatch } = await supabaseAdmin
                .from('tournament_matches')
                .select('team1_id, team2_id')
                .eq('id', match.next_loser_match_id)
                .single()

            if (nextLoserMatch) {
                const field = !nextLoserMatch.team1_id ? 'team1_id' : 'team2_id'
                await supabaseAdmin.from('tournament_matches')
                    .update({ [field]: loserId })
                    .eq('id', match.next_loser_match_id)
            }
        }
    }

    return match as TournamentMatch
}

export async function resetMatch(matchId: string) {
    const { data: match, error } = await supabaseAdmin
        .from('tournament_matches')
        .update({
            team1_score: 0,
            team2_score: 0,
            winner_id: null,
            state: 'pending'
        })
        .eq('id', matchId)
        .select()
        .single()

    if (error) throw error

    // Note: Recursive reset of downstream matches is ideal but complex. 
    // For now we just reset the current one.
    return match
}
