import { NextResponse } from 'next/server'
import { getFreeAgents, upsertFreeAgent } from '@/lib/tournament-db'
import { getUserFromSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const agents = await getFreeAgents()
        return NextResponse.json({ agents })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const user = await getUserFromSession()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const agent = await upsertFreeAgent({
            ...body,
            user_id: user.id
        })
        return NextResponse.json({ agent })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
