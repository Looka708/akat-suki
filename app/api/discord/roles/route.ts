import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { getGuildRoles, addMemberRole, removeMemberRole, getGuildMember } from '@/lib/discord-notifications'

const GUILD_ID = process.env.DISCORD_GUILD_ID

export async function GET(request: NextRequest) {
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

        // Get user ID from query params
        const searchParams = request.nextUrl.searchParams
        const userId = searchParams.get('userId')

        if (userId) {
            // Get specific user's roles
            const member = await getGuildMember(GUILD_ID, userId)
            return NextResponse.json({
                userId: member.user.id,
                username: member.user.username,
                roles: member.roles,
            })
        } else {
            // Get all available roles in the guild
            const roles = await getGuildRoles(GUILD_ID)

            // Filter out managed roles (bot roles, booster role, etc.)
            const assignableRoles = roles
                .filter(role => !role.managed && role.name !== '@everyone')
                .sort((a, b) => b.position - a.position)

            return NextResponse.json({ roles: assignableRoles })
        }
    } catch (error: any) {
        console.error('Error fetching Discord roles:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch Discord roles' },
            { status: 500 }
        )
    }
}

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
        const { userId, roleId, action } = body

        if (!userId || !roleId || !action) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, roleId, action' },
                { status: 400 }
            )
        }

        if (action === 'add') {
            await addMemberRole(
                GUILD_ID,
                userId,
                roleId,
                `Role assigned by ${adminUser.username} via AKATSUKI admin panel`
            )
            return NextResponse.json({
                success: true,
                message: 'Role added successfully',
            })
        } else if (action === 'remove') {
            await removeMemberRole(
                GUILD_ID,
                userId,
                roleId,
                `Role removed by ${adminUser.username} via AKATSUKI admin panel`
            )
            return NextResponse.json({
                success: true,
                message: 'Role removed successfully',
            })
        } else {
            return NextResponse.json(
                { error: 'Invalid action. Use "add" or "remove"' },
                { status: 400 }
            )
        }
    } catch (error: any) {
        console.error('Error managing Discord role:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to manage Discord role' },
            { status: 500 }
        )
    }
}
