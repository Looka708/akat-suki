import { NextResponse } from 'next/server'
import { getUserFromSession } from '@/lib/session'
import { createTeam, joinTeam } from '@/lib/tournament-db'
import { createTeamRole, createTeamVoiceChannel } from '@/lib/discord-tournament'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

const CreateTeamSchema = z.object({
    name: z.string().min(3, "Team name must be at least 3 characters long.").max(50, "Team name is too long."),
    steamId: z.string().optional()
})

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function retry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
    try {
        return await fn()
    } catch (error) {
        if (retries <= 1) throw error
        await wait(delayMs)
        return retry(fn, retries - 1, delayMs * 2)
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUserFromSession()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 })
        }

        const body = await request.json()
        const parsedBody = CreateTeamSchema.safeParse(body)

        if (!parsedBody.success) {
            return NextResponse.json({ error: parsedBody.error.issues[0].message }, { status: 400 })
        }

        const { name, steamId } = parsedBody.data

        // Create the team in DB (generates invite code)
        const team = await createTeam(name, user.id)

        // Add creator as player
        const discordId = user.id // The session stores discord ID in user.id
        await joinTeam(team.id, user.id, discordId, steamId)

        // Asynchronously setup discord role and channel
        const guildId = process.env.DISCORD_GUILD_ID
        const categoryId = process.env.DISCORD_GAMERS_CATEGORY_ID

        if (guildId) {
            // Using a background execution pattern without blocking the response
            // We use an IIFE (Immediately Invoked Function Expression) here that we don't await
            // so we can return the response to the user while finishing Discord tasks.
            ; (async () => {
                try {
                    // 1. Create Role with Retry
                    const roleResponse = await retry(async () => {
                        return await createTeamRole(guildId, team.name)
                    }, 3, 2000)

                    // 2. Create Channel with Retry
                    const channelResponse = await retry(async () => {
                        return await createTeamVoiceChannel(
                            guildId,
                            team.name,
                            categoryId,
                            roleResponse.id
                        )
                    }, 3, 2000)

                    // 3. Update DB
                    await retry(async () => {
                        await supabaseAdmin
                            .from('tournament_teams')
                            .update({
                                discord_role_id: roleResponse.id,
                                discord_voice_channel_id: channelResponse.id
                            })
                            .eq('id', team.id)
                    }, 3, 2000)

                } catch (discordError) {
                    console.error('Error creating discord entities for team after retries:', discordError)
                }
            })()
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
