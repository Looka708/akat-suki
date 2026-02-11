import { NextRequest, NextResponse } from 'next/server'
import { getUserFromSession } from '@/lib/session'
import { getAdminRole } from '@/lib/admin-auth'
import { updateApplicationStatus } from '@/lib/db'
import { hasPermission, PERMISSIONS } from '@/lib/admin-roles'
import { sendApplicationApprovedNotification, sendApplicationRejectedNotification } from '@/lib/discord-notifications'


export async function POST(request: NextRequest) {
    try {
        const session = await getUserFromSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const role = await getAdminRole(session.id)
        if (!role || !hasPermission(role, PERMISSIONS.REVIEW_APPLICATIONS)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { id, status, review_notes } = body

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const updatedApplication = await updateApplicationStatus(
            id,
            status,
            session.id,
            review_notes
        )

        // 3. Send relevant notification
        try {
            if (status === 'approved') {
                await sendApplicationApprovedNotification({
                    applicantName: updatedApplication.full_name,
                    applicantDiscord: updatedApplication.discord_username,
                    position: updatedApplication.position
                })
            } else if (status === 'rejected') {
                await sendApplicationRejectedNotification({
                    applicantName: updatedApplication.full_name,
                    position: updatedApplication.position
                })
            }
        } catch (notifyError) {
            console.error('Notification error (non-fatal):', notifyError)
        }

        return NextResponse.json({ success: true, application: updatedApplication })


    } catch (error: any) {
        console.error('Update application status error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update status' },
            { status: 500 }
        )
    }
}
