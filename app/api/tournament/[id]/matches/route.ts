import { NextResponse } from 'next/server'
import { getTournamentMatches } from '@/lib/tournament-db'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const matches = await getTournamentMatches(id)
        return NextResponse.json({ matches })
    } catch (error: any) {
        console.error('Failed to get tournament matches:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to get tournament matches' },
            { status: 500 }
        )
    }
}
