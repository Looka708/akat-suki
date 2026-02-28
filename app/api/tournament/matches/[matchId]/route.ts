import { NextResponse } from 'next/server'
import { updateMatchScore } from '@/lib/tournament-db'
import { getAdminUser } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

const MatchUpdateSchema = z.object({
    team1Score: z.number().int().min(0).optional(),
    team2Score: z.number().int().min(0).optional(),
    winnerId: z.string().optional().nullable(),
    state: z.enum(['pending', 'live', 'completed']).optional(),
    scheduledTime: z.string().optional().nullable(),
    seriesFormat: z.enum(['bo1', 'bo3', 'bo5']).optional().nullable(),
    opendotaMatchId: z.string().optional().nullable(),
    streamUrl: z.string().url().optional().nullable().or(z.literal('')),
})

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ matchId: string }> }
) {
    const { matchId } = await params
    try {
        const adminUser = await getAdminUser()
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 })
        }

        const rawBody = await request.json()
        const parsed = MatchUpdateSchema.safeParse(rawBody)
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
        }

        const { team1Score, team2Score, winnerId, state, scheduledTime, seriesFormat, opendotaMatchId, streamUrl } = parsed.data

        if (state && team1Score === undefined && team2Score === undefined) {
            // Just updating state, schedule, format, or links
            const { error: updateErr } = await supabaseAdmin.from('tournament_matches')
                .update({
                    state,
                    scheduled_time: scheduledTime,
                    series_format: seriesFormat === undefined ? undefined : seriesFormat,
                    opendota_match_id: opendotaMatchId,
                    stream_url: streamUrl === '' ? null : streamUrl,
                })
                .eq('id', matchId)

            if (updateErr) throw new Error(updateErr.message)

            // Auto-notify players when a match time is scheduled
            if (scheduledTime) {
                try {
                    const { data: matchData } = await supabaseAdmin
                        .from('tournament_matches')
                        .select('team1_id, team2_id, tournament_id, round, team1:team1_id(name), team2:team2_id(name)')
                        .eq('id', matchId)
                        .single()

                    if (matchData && (matchData.team1_id || matchData.team2_id)) {
                        const teamIds = [matchData.team1_id, matchData.team2_id].filter(Boolean) as string[]
                        const { data: players } = await supabaseAdmin
                            .from('tournament_players')
                            .select('user_id')
                            .in('team_id', teamIds)

                        if (players && players.length > 0) {
                            const team1Name = (matchData.team1 as any)?.name || 'TBD'
                            const team2Name = (matchData.team2 as any)?.name || 'TBD'
                            const formattedTime = new Date(scheduledTime).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })

                            const notifications = players.map(p => ({
                                user_id: p.user_id,
                                type: 'match_scheduled',
                                title: 'Match Scheduled',
                                message: `${team1Name} vs ${team2Name} — Round ${matchData.round} starts at ${formattedTime}`,
                                link: `/tournament/${matchData.tournament_id}/brackets`
                            }))

                            await supabaseAdmin.from('notifications').insert(notifications)
                        }
                    }
                } catch (notifErr) {
                    console.error('Non-critical: failed to send match notifications:', notifErr)
                }
            }

            return NextResponse.json({ success: true })
        }

        if (typeof team1Score !== 'number' || typeof team2Score !== 'number') {
            return NextResponse.json({ error: 'Invalid scores provided.' }, { status: 400 })
        }

        const updatedMatch = await updateMatchScore(matchId, team1Score, team2Score, winnerId || null)

        // Send match result notifications to all players on both teams
        try {
            const { data: matchData } = await supabaseAdmin
                .from('tournament_matches')
                .select('team1_id, team2_id, tournament_id, round, team1:team1_id(name), team2:team2_id(name), winner:winner_id(name)')
                .eq('id', matchId)
                .single()

            if (matchData) {
                const teamIds = [matchData.team1_id, matchData.team2_id].filter(Boolean) as string[]
                const { data: players } = await supabaseAdmin
                    .from('tournament_players')
                    .select('user_id')
                    .in('team_id', teamIds)

                if (players && players.length > 0) {
                    const team1Name = (matchData.team1 as any)?.name || 'TBD'
                    const team2Name = (matchData.team2 as any)?.name || 'TBD'
                    const winnerName = (matchData.winner as any)?.name || 'Unknown'

                    const notifications = players.map(p => ({
                        user_id: p.user_id,
                        type: 'match_result',
                        title: 'Match Result',
                        message: `${team1Name} ${team1Score} - ${team2Score} ${team2Name} • Winner: ${winnerName}`,
                        link: `/tournament/${matchData.tournament_id}/brackets`
                    }))

                    await supabaseAdmin.from('notifications').insert(notifications)
                }
            }
        } catch (notifErr) {
            console.error('Non-critical: failed to send match result notifications:', notifErr)
        }

        return NextResponse.json({ success: true, match: updatedMatch })
    } catch (error: any) {
        console.error('Failed to update match score:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update match score' },
            { status: 500 }
        )
    }
}
