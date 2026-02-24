import { NextResponse } from 'next/server'
import { getFreeAgentByUser } from '@/lib/tournament-db'
import { getUserFromSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const user = await getUserFromSession()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const agent = await getFreeAgentByUser(user.id)
        return NextResponse.json({ agent })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
