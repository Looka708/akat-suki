import { NextResponse } from 'next/server'
import { getUserFromSession } from '@/lib/session'
import { joinTeam, getTeamByInviteCode } from '@/lib/tournament-db'
import { assignTeamRoleToMember } from '@/lib/discord-tournament'

export async function POST(request: Request) {
    try {
        const user = await getUserFromSession()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 })
        }

        const body = await request.json()
        const { inviteCode } = body

        if (!inviteCode) {
            return NextResponse.json({ error: 'Invite code is required.' }, { status: 400 })
        }

        const team = await getTeamByInviteCode(inviteCode)

        if (!team) {
            return NextResponse.json({ error: 'Invalid or expired invite code.' }, { status: 404 })
        }

        // Add user as teammate
        const discordId = user.id // user.id here is the discord ID

        const player = await joinTeam(team.id, user.id, discordId)

        // Try Assigning Team Role in Discord if roles were successfully created
        const guildId = process.env.DISCORD_GUILD_ID
        if (guildId && team.discord_role_id && discordId) {
            try {
                await assignTeamRoleToMember(guildId, discordId, team.discord_role_id)
            } catch (roleError) {
                console.error(`Failed assigning team role to ${discordId} for team ${team.id}:`, roleError)
            }
        }

        return NextResponse.json({ team, player })
    } catch (error: any) {
        console.error('Join team error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to join team' },
            { status: 500 }
        )
    }
}
