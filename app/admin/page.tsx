import { StatsCard } from '@/components/admin/StatsCard'
import { getAdminUser } from '@/lib/admin-auth'
import { getApplicationStats, getApplications } from '@/lib/db'
import { supabaseAdmin } from '@/lib/supabase-admin'


export default async function AdminDashboard() {
    const adminUser = await getAdminUser()
    const appStats = await getApplicationStats()
    const { applications: recentApps } = await getApplications({ limit: 5 })

    // Get total users count from Supabase
    const { count: totalUsers } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })

    const stats = {
        totalApplications: appStats.total,
        pendingReview: appStats.pending,
        approved: appStats.approved,
        rejected: appStats.rejected,
        totalUsers: totalUsers || 0,
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-rajdhani font-bold text-white tracking-wide">
                    Dashboard
                </h1>
                <p className="text-gray-400 mt-1">
                    Welcome back, {adminUser?.username}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Applications"
                    value={stats.totalApplications}
                    change={0}
                    changeLabel="vs last month"
                    trend="up"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                />

                <StatsCard
                    title="Pending Review"
                    value={stats.pendingReview}
                    change={0}
                    changeLabel="vs yesterday"
                    trend="down"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />

                <StatsCard
                    title="Approved"
                    value={stats.approved}
                    change={0}
                    changeLabel="vs last month"
                    trend="up"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />

                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers}
                    change={0}
                    changeLabel="vs last month"
                    trend="up"
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    }
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Applications */}
                <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-rajdhani font-bold text-white">
                            Recent Applications
                        </h2>
                        <a
                            href="/admin/applications"
                            className="text-[#dc143c] hover:text-[#ff1744] text-sm font-medium transition-colors"
                        >
                            View All →
                        </a>
                    </div>
                    <div className="space-y-4">
                        {recentApps.length > 0 ? (
                            recentApps.map((app) => (
                                <div
                                    key={app.id}
                                    className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-sm hover:bg-white/[0.05] transition-colors"
                                >
                                    <div className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">
                                            {app.discord_username[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">
                                            {app.discord_username}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                            Applied for {app.position}
                                        </p>
                                    </div>
                                    <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium capitalize">
                                        {app.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-8">No recent applications</p>
                        )}
                    </div>
                </div>


                {/* Quick Actions */}
                <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                    <h2 className="text-xl font-rajdhani font-bold text-white mb-6">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <a
                            href="/admin/applications"
                            className="p-4 bg-[#dc143c]/10 border border-[#dc143c]/30 rounded-sm hover:bg-[#dc143c]/20 transition-colors group"
                        >
                            <svg className="w-8 h-8 text-[#dc143c] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-white font-medium text-sm">Review Applications</p>
                        </a>

                        <a
                            href="/admin/users"
                            className="p-4 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-colors group"
                        >
                            <svg className="w-8 h-8 text-gray-400 group-hover:text-white mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <p className="text-white font-medium text-sm">Manage Users</p>
                        </a>

                        <a
                            href="/admin/content"
                            className="p-4 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-colors group"
                        >
                            <svg className="w-8 h-8 text-gray-400 group-hover:text-white mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <p className="text-white font-medium text-sm">Create Content</p>
                        </a>

                        <a
                            href="/admin/analytics"
                            className="p-4 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-colors group"
                        >
                            <svg className="w-8 h-8 text-gray-400 group-hover:text-white mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-white font-medium text-sm">View Analytics</p>
                        </a>

                        <a
                            href="/admin/roles"
                            className="p-4 bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-sm hover:bg-[#5865F2]/20 transition-colors group"
                        >
                            <svg className="w-8 h-8 text-[#5865F2] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <p className="text-white font-medium text-sm">Discord Roles</p>
                        </a>

                        <a
                            href="/admin/tournaments"
                            className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-sm hover:bg-orange-500/20 transition-colors group"
                        >
                            <svg className="w-8 h-8 text-orange-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            <p className="text-white font-medium text-sm">Tournaments</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
