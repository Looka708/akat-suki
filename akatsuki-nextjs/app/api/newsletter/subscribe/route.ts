import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        const apiKey = process.env.LOOPS_API_KEY

        if (!apiKey || apiKey === 'your_loops_api_key_here') {
            console.error('LOOPS_API_KEY is not configured')
            return NextResponse.json(
                { error: 'Newsletter service is not configured' },
                { status: 500 }
            )
        }

        const response = await fetch('https://pool.loops.so/api/v1/contacts/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                source: 'Website Newsletter',
                userGroup: 'Newsletter',
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Loops API error:', data)
            return NextResponse.json(
                { error: data.message || 'Failed to subscribe' },
                { status: response.status }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Newsletter subscription error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
