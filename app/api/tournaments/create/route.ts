import { NextResponse } from 'next/server'
import { getUserFromSession } from '@/lib/session'
import { createTournament } from '@/lib/tournament-db'

export async function POST(request: Request) {
    try {
        const user = await getUserFromSession()

        // Very basic admin check. Ideally, you should verify via session.user.isAdmin
        // Make sure you update the session flow to encode the user's roles
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const body = await request.json()
        const { name, game, startDate, slots, entryFee, prizePool } = body

        if (!name || !startDate) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
        }

        const newTournament = await createTournament({
            name,
            game: game || 'Dota 2',
            start_date: startDate,
            max_slots: Number(slots) || 16,
            entry_fee: Number(entryFee) || 0,
            prize_pool: Number(prizePool) || 0,
            status: 'upcoming'
        })

        return NextResponse.json({ tournament: newTournament })
    } catch (error: any) {
        console.error('Create tournament error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create tournament' },
            { status: 500 }
        )
    }
}
