import { NextRequest, NextResponse } from 'next/server'
import { getPlayerSummaries, getMatchHistory } from '@/lib/dota-api'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const steamId = params.id

    try {
        const players = await getPlayerSummaries([steamId])
        if (!players || players.length === 0) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 })
        }

        const player = players[0]
        // Steam Community IDs are 64-bit. Some Dota APIs use 32-bit account IDs.
        // Convert to 32-bit if needed: (BigInt(steamId) - 76561197960265728n).toString()
        const accountId32 = (BigInt(steamId) - 76561197960265728n).toString()

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
