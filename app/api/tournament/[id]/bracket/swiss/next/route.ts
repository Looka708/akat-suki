import { NextResponse } from 'next/server'
import { generateNextSwissRound } from '@/lib/tournament-db'
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

        const result = await generateNextSwissRound(id)
        return NextResponse.json(result)

    } catch (error: any) {
        console.error('Failed to generate next swiss round:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate next swiss round' },
            { status: 500 }
        )
    }
}
