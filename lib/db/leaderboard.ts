import { supabaseAdmin } from '../supabase-admin'

export async function getTournamentLeaderboard(tournamentId: string) {
    const { data: teams, error: teamsErr } = await supabaseAdmin
        .from('tournament_teams')
        .select('id, name, logo_url, group_id')
        .eq('tournament_id', tournamentId)

    if (teamsErr) throw new Error('Failed to fetch teams: ' + teamsErr.message)

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

        const teamMatches = (matches || []).filter(m => m.team1_id === team.id || m.team2_id === team.id)

        teamMatches.forEach(m => {
            if (m.winner_id === team.id) {
                wins++
                points += 3
            } else if (m.winner_id === 'draw' || (m.match_format === 'bo2' && m.team1_score === 1 && m.team2_score === 1)) {
                draws++
                points += 1
            } else if (m.winner_id && m.winner_id !== team.id) {
                losses++
            }
        })

        return {
            id: team.id,
            name: team.name,
            logo_url: team.logo_url,
            group_id: team.group_id,
            wins,
            draws,
            losses,
            points,
            played: teamMatches.length
        }
    })

    return leaderboard.sort((a, b) => b.points - a.points || (b.wins - a.wins))
}
