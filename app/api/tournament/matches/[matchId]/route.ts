import { NextResponse } from 'next/server'
import { updateMatchScore } from '@/lib/tournament-db'
import { getAdminUser } from '@/lib/admin-auth'

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

        const body = await request.json()
        const { team1Score, team2Score, winnerId } = body

        if (typeof team1Score !== 'number' || typeof team2Score !== 'number') {
            return NextResponse.json({ error: 'Invalid scores provided.' }, { status: 400 })
        }

        const updatedMatch = await updateMatchScore(matchId, team1Score, team2Score, winnerId || null)

        return NextResponse.json({ success: true, match: updatedMatch })
    } catch (error: any) {
        console.error('Failed to update match score:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update match score' },
            { status: 500 }
        )
    }
}
