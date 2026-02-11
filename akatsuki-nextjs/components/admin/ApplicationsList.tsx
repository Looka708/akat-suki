'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/date-utils'

interface Application {
    id: string
    discord_username: string
    full_name: string
    position: string
    status: string
    submitted_at: string
}

interface ApplicationsListProps {
    initialApplications: Application[]
}

export function ApplicationsList({ initialApplications }: ApplicationsListProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const statusConfig = {
        pending: { label: 'Pending', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
        approved: { label: 'Approved', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
        rejected: { label: 'Rejected', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
        waitlisted: { label: 'Waitlisted', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    }

    const filteredApplications = initialApplications.filter(app => {
        const matchesSearch =
            app.discord_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.position.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || app.status === statusFilter

        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            {/* Header with Filters */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-rajdhani font-bold text-white tracking-wide uppercase">
                        Applications
                    </h1>
                    <p className="text-gray-400 mt-1 uppercase tracking-widest text-[10px] font-mono">
                        Manage and review team applications
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-white text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-[#dc143c]"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="waitlisted">Waitlisted</option>
                    </select>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="SEARCH APPLICATIONS..."
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-white text-[10px] font-bold uppercase tracking-widest placeholder-gray-600 focus:outline-none focus:border-[#dc143c] w-64"
                    />
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Applicant</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Position</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Submitted</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredApplications.length > 0 ? (
                                filteredApplications.map((app) => (
                                    <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center font-bold text-white">
                                                    {app.discord_username[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{app.discord_username}</p>
                                                    <p className="text-gray-500 text-xs">{app.full_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-white text-sm font-rajdhani uppercase tracking-wider">{app.position}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-sm text-[10px] font-bold border uppercase tracking-widest ${statusConfig[app.status as keyof typeof statusConfig]?.className || ''}`}>
                                                {statusConfig[app.status as keyof typeof statusConfig]?.label || app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-400 text-xs font-mono">
                                                {formatDate(app.submitted_at)}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <a
                                                href={`/admin/applications/${app.id}`}
                                                className="text-[#dc143c] hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 group"
                                            >
                                                View Details
                                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 uppercase tracking-widest text-[10px] font-bold">
                                        No applications matching your search criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-white/10">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                        Showing {filteredApplications.length} of {initialApplications.length} total applications
                    </p>
                </div>
            </div>
        </div>
    )
}
