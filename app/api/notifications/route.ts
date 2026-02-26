import { NextResponse } from 'next/server'
import { getUserFromSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const user = await getUserFromSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Look up the internal user id from discord id
        const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('discord_id', user.id)
            .single()

        if (!dbUser) {
            return NextResponse.json({ notifications: [], unreadCount: 0 })
        }

        const { data: notifications, error } = await supabaseAdmin
            .from('notifications')
            .select('*')
            .eq('user_id', dbUser.id)
            .order('created_at', { ascending: false })
            .limit(20)

        if (error) throw error

        const unreadCount = (notifications || []).filter(n => !n.read).length

        return NextResponse.json({ notifications: notifications || [], unreadCount })
    } catch (error: any) {
        console.error('Notifications fetch error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUserFromSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('discord_id', user.id)
            .single()

        if (!dbUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const body = await request.json()
        const { action, notificationId } = body

        if (action === 'mark_read' && notificationId) {
            await supabaseAdmin
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId)
                .eq('user_id', dbUser.id)
        } else if (action === 'mark_all_read') {
            await supabaseAdmin
                .from('notifications')
                .update({ read: true })
                .eq('user_id', dbUser.id)
                .eq('read', false)
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Notifications update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
