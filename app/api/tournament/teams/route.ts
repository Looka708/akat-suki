import { NextResponse } from 'next/server'
import { getUserFromSession } from '@/lib/session'
import { createTeam, joinTeam } from '@/lib/tournament-db'
import { createTeamRoleAndChannels } from '@/lib/discord-bot'
import { assignTeamRoleToMember } from '@/lib/discord-tournament'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

const CreateTeamSchema = z.object({
    name: z.string().min(3, "Team name must be at least 3 characters long.").max(50, "Team name is too long."),
    steamId: z.string().optional(),
    dotaName: z.string().optional(),
    mmr: z.string().optional(),
    dotabuffUrl: z.string().nullable().optional(),
    role1: z.string().optional(),
    role2: z.string().optional(),
    role3: z.string().optional(),
    ping: z.string().optional(),
    captainNotes: z.string().optional(),
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

        const { name, steamId, dotaName, mmr, dotabuffUrl, role1, role2, role3, ping, captainNotes } = parsedBody.data

        // Create the team in DB (generates invite code)
        const team = await createTeam(name, user.id)

        // Add creator as player with profile data
        const discordId = user.id // The session stores discord ID in user.id
        await joinTeam(team.id, user.id, discordId, steamId, {
            mmr: mmr ? parseInt(mmr) : 0,
            dotabuff_url: dotabuffUrl || null,
            role_1: role1 || '',
            role_2: role2 || '',
            role_3: role3 || '',
            ping: ping || '',
            captain_notes: captainNotes || '',
            dota_name: dotaName || ''
        })

        // Asynchronously setup discord role and channel
        const guildId = process.env.DISCORD_GUILD_ID
        const categoryId = process.env.DISCORD_TOURNAMENT_CATEGORY_ID

        if (guildId) {
            ; (async () => {
                try {
                    // Create Role, Voice, and Text Channel
                    const setupResponse = await retry(async () => {
                        return await createTeamRoleAndChannels(guildId, team.name, categoryId)
                    }, 3, 2000)

                    // Update DB with the generated IDs
                    await retry(async () => {
                        await supabaseAdmin
                            .from('tournament_teams')
                            .update({
                                discord_role_id: setupResponse.roleId,
                                discord_voice_channel_id: setupResponse.voiceChannelId
                            })
                            .eq('id', team.id)
                    }, 3, 2000)

                    // Assign the newly created role to the captain
                    try {
                        await assignTeamRoleToMember(guildId, discordId, setupResponse.roleId)
                        console.log(`Assigned team role ${setupResponse.roleId} to captain ${discordId}`)
                    } catch (roleError) {
                        console.error(`Failed to assign team role to captain ${discordId}:`, roleError)
                    }

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
