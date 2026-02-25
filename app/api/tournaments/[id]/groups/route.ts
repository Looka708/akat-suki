import { NextResponse } from 'next/server'
import { getTournamentLeaderboard, getTournamentMatches } from '@/lib/tournament-db'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Get group standings
        const leaderboard = await getTournamentLeaderboard(id)

        // Get group matches
        const allMatches = await getTournamentMatches(id)
        const groupMatches = allMatches.filter(m => m.phase === 'group_stage')

        // Group teams by group_id
        const groups: Record<string, typeof leaderboard> = {}
        const groupNames = Array.from(new Set(leaderboard.map(t => t.group_id).filter(Boolean))) as string[]
        groupNames.sort()

        groupNames.forEach(name => {
            groups[name] = leaderboard.filter(t => t.group_id === name)
        })

        return NextResponse.json({ groups, matches: groupMatches, groupNames })
    } catch (error: any) {
        console.error('Fetch tournament groups error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch tournament groups' },
            { status: 500 }
        )
    }
}
