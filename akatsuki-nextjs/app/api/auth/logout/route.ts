import { NextRequest, NextResponse } from 'next/server'
import { clearSession } from '@/lib/session'

export async function POST(request: NextRequest) {
    try {
        await clearSession()

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { error: 'Logout failed' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        await clearSession()

        return NextResponse.redirect(new URL('/', request.url))

    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.redirect(
            new URL('/?auth=error&message=Logout+failed', request.url)
        )
    }
}
