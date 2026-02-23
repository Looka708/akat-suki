import { NextResponse } from 'next/server'
import { generateBracket } from '@/lib/tournament-db'
import { getAdminUser } from '@/lib/admin-auth'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const adminUser = await getAdminUser()
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 })
        }

        const result = await generateBracket(params.id)
        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Failed to generate bracket:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate bracket' },
            { status: 500 }
        )
    }
}
