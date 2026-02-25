import { NextRequest, NextResponse } from 'next/server'
import { getPlayerSummaries, getMatchHistory, toAccountId32 } from '@/lib/dota-api'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: steamId } = await params

    try {
        const players = await getPlayerSummaries([steamId])
        if (!players || players.length === 0) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 })
        }

        const player = players[0]
        // Use the centralized helper to handle both 64-bit SteamIDs and 32-bit friend codes
        const accountId32 = toAccountId32(steamId)

        const history = await getMatchHistory(accountId32)

        return NextResponse.json({
            player,
            matches: history?.matches || []
        })
    } catch (error: any) {
        console.error('Dota API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
