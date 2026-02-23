import { requirePermission } from '@/lib/admin-auth'
import { PERMISSIONS } from '@/lib/admin-roles'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { UserActions } from '@/components/admin/UserActions'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    await requirePermission(PERMISSIONS.VIEW_USERS)

    // Fetch users from Supabase
    const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching users:', error)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-rajdhani font-bold text-white tracking-wide uppercase">
                        User Management
                    </h1>
                    <p className="text-gray-400 mt-1 uppercase tracking-widest text-[10px] font-mono">
                        Manage roles and access for organizational members
                    </p>
                </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">User</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Discord ID</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Role</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Last Active</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {users?.map((user) => (
                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center font-bold text-white">
                                            {user.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-medium">{user.username}</p>
                                            <p className="text-gray-500 text-xs">{user.email || 'No email'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs font-mono text-gray-400">
                                    {user.id}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border ${user.role === 'admin' ? 'bg-red-500/10 text-[#dc143c] border-[#dc143c]/20' : 'bg-white/5 text-gray-400 border-white/10'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                                        <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                                    {user.last_active ? new Date(user.last_active).toLocaleString() : 'Never'}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500 font-mono text-right">
                                    <div className="flex justify-end">
                                        <UserActions userId={user.id} currentRole={user.role} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
