import { NextRequest, NextResponse } from 'next/server'
import { getUserFromSession } from '@/lib/session'
import { getAdminRole } from '@/lib/admin-auth'
import { createPost } from '@/lib/db'
import { hasPermission, PERMISSIONS } from '@/lib/admin-roles'

export async function POST(request: NextRequest) {
    try {
        const session = await getUserFromSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const role = await getAdminRole(session.id)
        if (!role || !hasPermission(role, PERMISSIONS.CREATE_CONTENT)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { title, content, excerpt, featured_image, status } = body

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
        }

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-')

        const post = await createPost({
            title,
            slug,
            content,
            excerpt,
            featured_image,
            status,
            author_id: session.id,
            published_at: status === 'published' ? new Date().toISOString() : undefined
        })

        return NextResponse.json({ success: true, post })

    } catch (error: any) {
        console.error('Create post error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create post' },
            { status: 500 }
        )
    }
}
