import { NextResponse } from 'next/server'
import { generateBracket, updateTournamentChallongeUrl, getTournamentTeams, getTournamentById } from '@/lib/tournament-db'
import { getAdminUser } from '@/lib/admin-auth'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const adminUser = await getAdminUser()
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 })
        }

        let body: any = {}
        try {
            body = await request.json()
        } catch { }
        const bracketSize = body.bracketSize && [2, 4, 8, 16, 32].includes(body.bracketSize) ? body.bracketSize : undefined
        const format = body.format || 'single_elimination'

        // Clear custom URLs just in case
        await updateTournamentChallongeUrl(id, null)
        const result = await generateBracket(id, bracketSize, format)
        return NextResponse.json(result)

    } catch (error: any) {
        console.error('Failed to generate bracket:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate bracket' },
            { status: 500 }
        )
    }
}
