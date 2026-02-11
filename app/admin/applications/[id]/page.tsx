import { requirePermission } from '@/lib/admin-auth'
import { PERMISSIONS } from '@/lib/admin-roles'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ApplicationActions } from '@/components/admin/ApplicationActions'
import { formatDate, formatDateTime } from '@/lib/date-utils'


interface ApplicationDetailsProps {
    params: Promise<{
        id: string
    }>
}

export default async function ApplicationDetails({ params }: ApplicationDetailsProps) {
    await requirePermission(PERMISSIONS.VIEW_APPLICATIONS)
    const { id } = await params


    // Fetch application details
    const { data: app, error } = await supabaseAdmin
        .from('applications')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !app) {
        notFound()
    }

    const statusConfig = {
        pending: { label: 'Pending', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
        approved: { label: 'Approved', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
        rejected: { label: 'Rejected', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
        waitlisted: { label: 'Waitlisted', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/applications"
                        className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-rajdhani font-bold text-white tracking-wide uppercase">
                            Application Details
                        </h1>
                        <p className="text-gray-400 text-sm font-mono uppercase tracking-widest mt-1">
                            Ref: {app.id.substring(0, 8)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest border ${statusConfig[app.status as keyof typeof statusConfig]?.className || ''}`}>
                        {statusConfig[app.status as keyof typeof statusConfig]?.label || app.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Applicant Profile */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-sm p-8">
                        <h2 className="text-xl font-rajdhani font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-[#dc143c]"></span>
                            Applicant Profile
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Full Name</label>
                                <p className="text-white text-lg font-rajdhani">{app.full_name}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Email Address</label>
                                <p className="text-white text-lg font-rajdhani">{app.email}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Discord</label>
                                <p className="text-blue-400 text-lg font-rajdhani">{app.discord_username}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Position Applied</label>
                                <p className="text-[#dc143c] text-lg font-rajdhani font-bold">{app.position}</p>
                            </div>
                        </div>
                    </div>

                    {/* Application Content */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-sm p-8">
                        <h2 className="text-xl font-rajdhani font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-[#dc143c]"></span>
                            Experience & Background
                        </h2>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Previous Experience</label>
                                <div className="p-4 bg-white/5 border border-white/5 rounded-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {app.experience}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Why join AKATSUKI?</label>
                                <div className="p-4 bg-white/5 border border-white/5 rounded-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {app.why_join}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Availability</label>
                                <div className="p-4 bg-white/5 border border-white/5 rounded-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                                    {app.availability}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <ApplicationActions
                        applicationId={app.id}
                        currentStatus={app.status}
                    />

                    <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Metadata</h3>
                        <div className="space-y-2 text-[10px] uppercase tracking-widest">
                            {app.reviewed_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Reviewed At</span>
                                    <span className="text-gray-300">{formatDate(app.reviewed_at)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Submitted</span>
                                <span className="text-gray-300">{formatDateTime(app.submitted_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Discord ID</span>
                                <span className="text-gray-300 font-mono tracking-normal">{app.discord_id}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
