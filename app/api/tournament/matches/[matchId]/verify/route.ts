import { NextResponse } from 'next/server'
import { updateMatchScore } from '@/lib/tournament-db'
import { getAdminUser } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifyMatchOutcome, toAccountId32 } from '@/lib/dota-api'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ matchId: string }> }
) {
    const { matchId } = await params
    try {
        const adminUser = await getAdminUser()
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 })
        }

        const body = await request.json()
        const { dotaMatchId } = body

        if (!dotaMatchId) {
            return NextResponse.json({ error: 'Missing Dota Match ID.' }, { status: 400 })
        }

        // Fetch the match from db
        const { data: dbMatch, error: matchError } = await supabaseAdmin
            .from('tournament_matches')
            .select('team1_id, team2_id')
            .eq('id', matchId)
            .single()

        if (matchError || !dbMatch) {
            return NextResponse.json({ error: 'Tournament match not found.' }, { status: 404 })
        }

        if (!dbMatch.team1_id || !dbMatch.team2_id) {
            return NextResponse.json({ error: 'Match must have two teams to verify.' }, { status: 400 })
        }

        // Fetch team 1 steam IDs
        const { data: team1Players } = await supabaseAdmin
            .from('tournament_players')
            .select('steam_id')
            .eq('team_id', dbMatch.team1_id)
            .not('steam_id', 'is', null)

        const team1SteamIds = (team1Players?.map(p => p.steam_id) || []).filter(Boolean) as string[]

        // Fetch team 2 steam IDs
        const { data: team2Players } = await supabaseAdmin
            .from('tournament_players')
            .select('steam_id')
            .eq('team_id', dbMatch.team2_id)
            .not('steam_id', 'is', null)

        const team2SteamIds = (team2Players?.map(p => p.steam_id) || []).filter(Boolean) as string[]

        if (team1SteamIds.length === 0 && team2SteamIds.length === 0) {
            return NextResponse.json({ error: 'No players have linked their Steam IDs. Cannot verify automatically.' }, { status: 400 })
        }

        let winnerId: string | null = null
        let team1Score = 0
        let team2Score = 0
        let matchDataToSave: any = null

        try {
            if (team1SteamIds.length > 0) {
                const { teamWon, matchData } = await verifyMatchOutcome(dotaMatchId, team1SteamIds)
                matchDataToSave = matchData
                if (teamWon) {
                    winnerId = dbMatch.team1_id
                    team1Score = 1
                } else {
                    winnerId = dbMatch.team2_id
                    team2Score = 1
                }
            } else if (team2SteamIds.length > 0) {
                const { teamWon, matchData } = await verifyMatchOutcome(dotaMatchId, team2SteamIds)
                matchDataToSave = matchData
                if (teamWon) {
                    winnerId = dbMatch.team2_id
                    team2Score = 1
                } else {
                    winnerId = dbMatch.team1_id
                    team1Score = 1
                }
            }
        } catch (verifyError: any) {
            return NextResponse.json({ error: verifyError.message || 'Error verifying match' }, { status: 400 })
        }

        if (!winnerId) {
            return NextResponse.json({ error: 'Could not determine winner from OpenDota.' }, { status: 400 })
        }

        // Save OpenDota stats before finishing
        if (matchDataToSave) {
            await supabaseAdmin.from('tournament_matches').update({
                opendota_match_id: dotaMatchId,
                match_stats: matchDataToSave
            }).eq('id', matchId)

            if (matchDataToSave.players) {
                const { data: allMatchPlayers } = await supabaseAdmin
                    .from('tournament_players')
                    .select('id, steam_id, player_stats')
                    .in('team_id', [dbMatch.team1_id, dbMatch.team2_id])
                    .not('steam_id', 'is', null)

                if (allMatchPlayers && allMatchPlayers.length > 0) {
                    for (const p of allMatchPlayers) {
                        const accIdStr = toAccountId32(p.steam_id)
                        const dotaP = matchDataToSave.players.find((dp: any) => dp.account_id && dp.account_id.toString() === accIdStr)

                        if (dotaP) {
                            const currentStats = p.player_stats || {}
                            const newStats = {
                                matches_played: (currentStats.matches_played || 0) + 1,
                                kills: (currentStats.kills || 0) + (dotaP.kills || 0),
                                deaths: (currentStats.deaths || 0) + (dotaP.deaths || 0),
                                assists: (currentStats.assists || 0) + (dotaP.assists || 0),
                                hero_damage: (currentStats.hero_damage || 0) + (dotaP.hero_damage || 0),
                                gpm_sum: (currentStats.gpm_sum || 0) + (dotaP.gold_per_min || 0),
                                xpm_sum: (currentStats.xpm_sum || 0) + (dotaP.xp_per_min || 0),
                                net_worth_sum: (currentStats.net_worth_sum || 0) + (dotaP.net_worth || 0)
                            }

                            await supabaseAdmin
                                .from('tournament_players')
                                .update({ player_stats: newStats })
                                .eq('id', p.id)
                        }
                    }
                }
            }
        }

        const updatedMatch = await updateMatchScore(matchId, team1Score, team2Score, winnerId)

        // Notify players of the result
        try {
            const { data: matchInfo } = await supabaseAdmin
                .from('tournament_matches')
                .select('tournament_id, round, team1:team1_id(name), team2:team2_id(name), winner:winner_id(name)')
                .eq('id', matchId)
                .single()

            if (matchInfo) {
                const allTeamIds = [dbMatch.team1_id, dbMatch.team2_id].filter(Boolean) as string[]
                const { data: players } = await supabaseAdmin
                    .from('tournament_players')
                    .select('user_id')
                    .in('team_id', allTeamIds)

                if (players && players.length > 0) {
                    const t1 = (matchInfo.team1 as any)?.name || 'Team 1'
                    const t2 = (matchInfo.team2 as any)?.name || 'Team 2'
                    const winner = (matchInfo.winner as any)?.name || 'Unknown'

                    const notifications = players.map(p => ({
                        user_id: p.user_id,
                        type: 'match_result',
                        title: 'Match Result Verified',
                        message: `${t1} vs ${t2} — ${winner} wins (${team1Score}-${team2Score}). Verified via OpenDota.`,
                        link: `/tournament/matches/${matchId}`
                    }))

                    await supabaseAdmin.from('notifications').insert(notifications)
                }
            }
        } catch (notifErr) {
            console.error('Non-critical: failed to send result notifications:', notifErr)
        }

        return NextResponse.json({ success: true, match: updatedMatch, winnerId })
    } catch (error: any) {
        console.error('Failed to verify match:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to verify match' },
            { status: 500 }
        )
    }
}
