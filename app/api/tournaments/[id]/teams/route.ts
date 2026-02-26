import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { data: teams, error } = await supabaseAdmin
            .from('tournament_teams')
            .select(`
                *,
                tournament_players (
                    *,
                    users (
                        username,
                        avatar
                    )
                )
            `)
            .eq('tournament_id', id)

        if (error) {
            throw error
        }

        return NextResponse.json({ teams }, {
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15'
            }
        })
    } catch (error: any) {
        console.error('Fetch tournament teams error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch tournament teams' },
            { status: 500 }
        )
    }
}
