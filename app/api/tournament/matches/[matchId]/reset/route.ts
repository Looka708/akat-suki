import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

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

        // 1. Get the current match info
        const { data: match, error: fetchErr } = await supabaseAdmin
            .from('tournament_matches')
            .select('id, tournament_id, round, winner_id')
            .eq('id', matchId)
            .single()

        if (fetchErr || !match) {
            return NextResponse.json({ error: 'Match not found' }, { status: 404 })
        }

        // 2. If match had a winner, clear them from the next round match
        if (match.winner_id) {
            const nextRound = match.round + 1

            // Find the position of this match within its round
            const { data: roundMatches } = await supabaseAdmin
                .from('tournament_matches')
                .select('id')
                .eq('tournament_id', match.tournament_id)
                .eq('round', match.round)
                .order('created_at', { ascending: true })

            if (roundMatches) {
                const currentIndex = roundMatches.findIndex(m => m.id === matchId)
                if (currentIndex !== -1) {
                    const nextMatchIndex = Math.floor(currentIndex / 2)
                    const isTeam1Slot = currentIndex % 2 === 0

                    const { data: nextRoundMatches } = await supabaseAdmin
                        .from('tournament_matches')
                        .select('id')
                        .eq('tournament_id', match.tournament_id)
                        .eq('round', nextRound)
                        .order('created_at', { ascending: true })

                    if (nextRoundMatches && nextRoundMatches[nextMatchIndex]) {
                        const clearField = isTeam1Slot ? { team1_id: null } : { team2_id: null }
                        await supabaseAdmin
                            .from('tournament_matches')
                            .update(clearField)
                            .eq('id', nextRoundMatches[nextMatchIndex].id)
                    }
                }
            }
        }

        // 3. Reset the match itself
        const { error: resetErr } = await supabaseAdmin
            .from('tournament_matches')
            .update({
                team1_score: 0,
                team2_score: 0,
                winner_id: null,
                state: 'pending'
            })
            .eq('id', matchId)

        if (resetErr) throw new Error(resetErr.message)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Failed to reset match:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to reset match' },
            { status: 500 }
        )
    }
}
