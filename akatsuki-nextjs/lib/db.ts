import { supabaseAdmin } from './supabase-admin'
import { type Application } from './supabase'


// Create or update user in database
export async function upsertUser(userData: {
    id: string
    username: string
    discriminator: string
    avatar: string | null
    email: string | null
}) {
    const { data, error } = await supabaseAdmin
        .from('users')
        .upsert({
            id: userData.id,
            username: userData.username,
            discriminator: userData.discriminator,
            avatar: userData.avatar,
            email: userData.email,
            last_active: new Date().toISOString(),
        }, {
            onConflict: 'id',
        })
        .select()
        .single()

    if (error) {
        console.error('Error upserting user:', error)
        throw error
    }

    return data
}

// Create application
export async function createApplication(applicationData: {
    discord_id: string
    discord_username: string
    discord_discriminator: string
    discord_avatar: string | null
    email: string
    full_name: string
    position: string
    experience: string
    why_join: string
    availability: string
}) {
    const { data, error } = await supabaseAdmin
        .from('applications')
        .insert(applicationData)
        .select()
        .single()

    if (error) {
        console.error('Error creating application:', error)
        throw error
    }

    return data
}

// Get all applications with pagination and filtering
export async function getApplications(options: {
    page?: number
    limit?: number
    status?: string
    search?: string
} = {}) {
    const { page = 1, limit = 10, status, search } = options
    const offset = (page - 1) * limit

    let query = supabaseAdmin
        .from('applications')
        .select('*', { count: 'exact' })
        .order('submitted_at', { ascending: false })

    if (status && status !== 'all') {
        query = query.eq('status', status)
    }

    if (search) {
        query = query.or(`discord_username.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching applications:', error)
        throw error
    }

    return {
        applications: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
    }
}

// Get single application by ID
export async function getApplicationById(id: string) {
    const { data, error } = await supabaseAdmin
        .from('applications')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching application:', error)
        throw error
    }

    return data
}

// Update application status
export async function updateApplicationStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected' | 'waitlisted',
    reviewedBy: string,
    reviewNotes?: string
) {
    const { data, error } = await supabaseAdmin
        .from('applications')
        .update({
            status,
            reviewed_at: new Date().toISOString(),
            reviewed_by: reviewedBy,
            review_notes: reviewNotes || null,
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating application:', error)
        throw error
    }

    return data
}

// Get application statistics
export async function getApplicationStats() {
    const { data: apps, error } = await supabaseAdmin
        .from('applications')
        .select('status')

    if (error) {
        console.error('Error fetching stats:', error)
        throw error
    }

    const stats = {
        total: apps?.length || 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        waitlisted: 0,
    }

    apps?.forEach(app => {
        if (app.status === 'pending') stats.pending++
        else if (app.status === 'approved') stats.approved++
        else if (app.status === 'rejected') stats.rejected++
        else if (app.status === 'waitlisted') stats.waitlisted++
    })

    return stats
}


// Log activity
export async function logActivity(activityData: {
    user_id: string
    action: string
    entity_type: string
    entity_id: string
    details?: Record<string, unknown>
    ip_address?: string
    user_agent?: string
}) {
    const { data, error } = await supabaseAdmin
        .from('activity_logs')
        .insert(activityData)
        .select()
        .single()

    if (error) {
        console.error('Error logging activity:', error)
        // Don't throw - logging failures shouldn't break the app
        return null
    }

    return data
}

// Add note to entity
export async function addNote(noteData: {
    user_id: string
    entity_type: string
    entity_id: string
    content: string
}) {
    const { data, error } = await supabaseAdmin
        .from('notes')
        .insert(noteData)
        .select()
        .single()

    if (error) {
        console.error('Error adding note:', error)
        throw error
    }

    return data
}

// Get notes for entity
export async function getNotes(entityType: string, entityId: string) {
    const { data, error } = await supabaseAdmin
        .from('notes')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching notes:', error)
        throw error
    }

    return data || []
}

// Create blog post
export async function createPost(postData: {
    title: string
    slug: string
    content: string
    excerpt?: string
    featured_image?: string
    author_id: string
    status?: 'draft' | 'published' | 'scheduled'
    published_at?: string
}) {
    const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .insert({
            ...postData,
            status: postData.status || 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating post:', error)
        throw error
    }

    return data
}
