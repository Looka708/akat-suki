import { NextRequest, NextResponse } from 'next/server'
import { getUserFromSession } from '@/lib/session'
import { getAdminUser } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
    const session = await getUserFromSession()

    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch latest user data from DB to ensure avatar and other info is current
    const { data: dbUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', session.id)
        .single()

    const adminUser = await getAdminUser()

    // Use DB user data if available, fallback to session
    return NextResponse.json({
        id: session.id,
        username: dbUser?.username || session.username,
        discriminator: dbUser?.discriminator || session.discriminator,
        avatar: dbUser?.avatar || session.avatar,
        email: dbUser?.email || session.email,
        isAdmin: !!adminUser,
        role: adminUser?.role || null,
    })
}


