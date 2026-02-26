import { NextResponse } from 'next/server'
import { getUserFromSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
    try {
        const user = await getUserFromSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('logo') as File
        const teamId = formData.get('teamId') as string

        if (!file || !teamId) {
            return NextResponse.json({ error: 'Missing logo file or team ID' }, { status: 400 })
        }

        // Verify the user is the captain
        const { data: team } = await supabaseAdmin
            .from('tournament_teams')
            .select('captain_id')
            .eq('id', teamId)
            .single()

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 })
        }

        const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('discord_id', user.id)
            .single()

        if (!dbUser || team.captain_id !== dbUser.id) {
            return NextResponse.json({ error: 'Only the team captain can upload a logo' }, { status: 403 })
        }

        // Validate file
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Use PNG, JPEG, WebP, or GIF.' }, { status: 400 })
        }
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'File is too large. Max 2MB.' }, { status: 400 })
        }

        // Upload to Supabase Storage
        const ext = file.name.split('.').pop() || 'png'
        const fileName = `team-logos/${teamId}.${ext}`

        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        const { error: uploadError } = await supabaseAdmin.storage
            .from('public-assets')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            throw new Error('Failed to upload logo')
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage.from('public-assets').getPublicUrl(fileName)
        const logoUrl = urlData.publicUrl

        // Update team in DB
        await supabaseAdmin
            .from('tournament_teams')
            .update({ logo_url: logoUrl })
            .eq('id', teamId)

        return NextResponse.json({ logoUrl })
    } catch (error: any) {
        console.error('Logo upload error:', error)
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
    }
}
