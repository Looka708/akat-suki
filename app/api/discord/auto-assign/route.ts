import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { autoAssignRoles } from '@/lib/discord-notifications'

const GUILD_ID = process.env.DISCORD_GUILD_ID

export async function POST(request: NextRequest) {
    try {
        // Verify admin access
        const adminUser = await getAdminUser()
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!GUILD_ID) {
            return NextResponse.json(
                { error: 'DISCORD_GUILD_ID not configured in .env.local' },
                { status: 500 }
            )
        }

        const body = await request.json()
        const { userId, roleIds } = body

        if (!userId || !roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
            return NextResponse.json(
                { error: 'Missing or invalid fields: userId, roleIds (array)' },
                { status: 400 }
            )
        }

        const result = await autoAssignRoles(
            GUILD_ID,
            userId,
            roleIds,
            `Auto-assigned roles by ${adminUser.username} via AKATSUKI admin panel`
        )

        return NextResponse.json({
            success: result.success,
            assignedRoles: result.assignedRoles,
            failedRoles: result.failedRoles,
            message: result.success
                ? 'All roles assigned successfully'
                : `${result.assignedRoles.length} roles assigned, ${result.failedRoles.length} failed`,
        })
    } catch (error: any) {
        console.error('Error auto-assigning Discord roles:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to auto-assign Discord roles' },
            { status: 500 }
        )
    }
}
