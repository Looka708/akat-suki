import { NextResponse } from 'next/server'
import { getTournaments } from '@/lib/tournament-db'

export async function GET() {
    try {
        const tournaments = await getTournaments()
        return NextResponse.json({ tournaments })
    } catch (error: any) {
        console.error('Fetch tournaments error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch tournaments' },
            { status: 500 }
        )
    }
}
