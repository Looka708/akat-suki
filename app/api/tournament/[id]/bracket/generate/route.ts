import { NextResponse } from 'next/server'
import { generateBracket } from '@/lib/tournament-db'
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

        // Accept optional bracketSize from request body
        let bracketSize: number | undefined
        try {
            const body = await request.json()
            if (body.bracketSize && [2, 4, 8, 16, 32].includes(body.bracketSize)) {
                bracketSize = body.bracketSize
            }
        } catch {
            // No body sent, that's fine — generateBracket will auto-detect size
        }

        const result = await generateBracket(id, bracketSize)
        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Failed to generate bracket:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate bracket' },
            { status: 500 }
        )
    }
}
