import { NextResponse } from 'next/server'
import { getUserFromSession } from '@/lib/session'
import { createTeam, joinTeam } from '@/lib/tournament-db'
import { createTeamRole, createTeamVoiceChannel } from '@/lib/discord-tournament'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
    try {
        const user = await getUserFromSession()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 })
        }

        const body = await request.json()
        const { name, steamId } = body

        if (!name || name.trim().length < 3) {
            return NextResponse.json({ error: 'Team name must be at least 3 characters long.' }, { status: 400 })
        }

        // Create the team in DB (generates invite code)
        const team = await createTeam(name, user.id)

        // Add creator as player
        const discordId = user.id // The session stores discord ID in user.id
        await joinTeam(team.id, user.id, discordId, steamId)

        // Asynchronously setup discord role and channel
        const guildId = process.env.DISCORD_GUILD_ID
        const categoryId = process.env.DISCORD_GAMERS_CATEGORY_ID

        if (guildId) {
            try {
                // 1. Create Role
                const roleResponse: any = await createTeamRole(guildId, team.name)
                // 2. Create Channel
                const channelResponse: any = await createTeamVoiceChannel(
                    guildId,
                    team.name,
                    categoryId,
                    roleResponse.id
                )

                // 3. Update DB
                await supabaseAdmin
                    .from('tournament_teams')
                    .update({
                        discord_role_id: roleResponse.id,
                        discord_voice_channel_id: channelResponse.id
                    })
                    .eq('id', team.id)

            } catch (discordError) {
                console.error('Error creating discord entities for team:', discordError)
                // We do not fail the request if Discord fails, as team is created.
            }
        }

        return NextResponse.json({ team })
    } catch (error: any) {
        console.error('Create team error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create team' },
            { status: 500 }
        )
    }
}
