import { requirePermission } from '@/lib/admin-auth'
import { PERMISSIONS } from '@/lib/admin-roles'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { ApplicationsList } from '@/components/admin/ApplicationsList'

export default async function ApplicationsPage() {
    await requirePermission(PERMISSIONS.VIEW_APPLICATIONS)

    // Fetch real applications from Supabase
    const { data: applications, error: fetchError } = await supabaseAdmin
        .from('applications')
        .select('*')
        .order('submitted_at', { ascending: false })

    if (fetchError) {
        console.error('Error fetching applications:', fetchError)
    }

    const stats = {
        total: applications?.length || 0,
        pending: applications?.filter(a => a.status === 'pending').length || 0,
        approved: applications?.filter(a => a.status === 'approved').length || 0,
        rejected: applications?.filter(a => a.status === 'rejected').length || 0,
    }

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/[0.02] border border-white/10 rounded-sm p-5 flex flex-col items-center justify-center space-y-2 group hover:border-white/20 transition-all">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] group-hover:text-white">Total Records</p>
                    <p className="text-3xl font-rajdhani font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-sm p-5 flex flex-col items-center justify-center space-y-2 group hover:bg-yellow-500/10 transition-all">
                    <p className="text-yellow-500/60 text-[10px] font-bold uppercase tracking-[0.2em] group-hover:text-yellow-500">Waitlist/Pending</p>
                    <p className="text-3xl font-rajdhani font-bold text-yellow-500">{stats.pending}</p>
                </div>
                <div className="bg-green-500/5 border border-green-500/20 rounded-sm p-5 flex flex-col items-center justify-center space-y-2 group hover:bg-green-500/10 transition-all">
                    <p className="text-green-500/60 text-[10px] font-bold uppercase tracking-[0.2em] group-hover:text-green-500">Authorized</p>
                    <p className="text-3xl font-rajdhani font-bold text-green-500">{stats.approved}</p>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-sm p-5 flex flex-col items-center justify-center space-y-2 group hover:bg-red-500/10 transition-all">
                    <p className="text-red-500/60 text-[10px] font-bold uppercase tracking-[0.2em] group-hover:text-red-500">Terminated</p>
                    <p className="text-3xl font-rajdhani font-bold text-red-500">{stats.rejected}</p>
                </div>
            </div>

            {/* Functional List */}
            <ApplicationsList initialApplications={applications || []} />
        </div>
    )
}
