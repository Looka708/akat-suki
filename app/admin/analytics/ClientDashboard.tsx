'use client'

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'

const COLORS = ['#dc143c', '#5865F2', '#10B981', '#F59E0B', '#6366f1']

export default function ClientDashboard({
    metrics,
    userGrowth,
    appStatus,
    tournamentFill
}: {
    metrics: { totalUsers: number, activeTournaments: number, totalTeams: number, totalApps: number }
    userGrowth: any[]
    appStatus: any[]
    tournamentFill: any[]
}) {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-rajdhani font-bold text-white tracking-wide">
                        Platform Analytics
                    </h1>
                    <p className="text-gray-400 mt-1">
                        High-level insights into your community metrics
                    </p>
                </div>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
                    <p className="text-3xl font-rajdhani font-bold text-white">{metrics.totalUsers}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Active Tournaments</p>
                    <p className="text-3xl font-rajdhani font-bold text-white">{metrics.activeTournaments}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Teams</p>
                    <p className="text-3xl font-rajdhani font-bold text-[#dc143c]">{metrics.totalTeams}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Applications</p>
                    <p className="text-3xl font-rajdhani font-bold text-white">{metrics.totalApps}</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* User Registration Growth */}
                <div className="bg-white/[0.02] border border-white/10 p-6 rounded-sm flex flex-col items-center">
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest self-start mb-6">User Registration Growth</h2>
                    {userGrowth.length > 0 ? (
                        <div className="w-full h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={userGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                                    <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                                        itemStyle={{ color: '#dc143c' }}
                                    />
                                    <Line type="monotone" dataKey="users" stroke="#dc143c" strokeWidth={2} dot={{ r: 4, fill: '#dc143c' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-gray-500 m-auto">No registration data available.</p>
                    )}
                </div>

                {/* Applications by Status */}
                <div className="bg-white/[0.02] border border-white/10 p-6 rounded-sm flex flex-col items-center">
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest self-start mb-6">Applications by Status</h2>
                    {appStatus.length > 0 ? (
                        <div className="w-full h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={appStatus}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        innerRadius={60}
                                        fill="#8884d8"
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {appStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-gray-500 m-auto">No applications submitted yet.</p>
                    )}
                </div>

                {/* Tournament Fill Rates */}
                <div className="bg-white/[0.02] border border-white/10 p-6 rounded-sm flex flex-col items-center lg:col-span-2">
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest self-start mb-6">Tournament Fill Rates</h2>
                    {tournamentFill.length > 0 ? (
                        <div className="w-full h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={tournamentFill}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                                    <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                        contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="teams" name="Registered Teams" fill="#dc143c" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="max_slots" name="Total Capacity" fill="#333" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-gray-500 m-auto">No tournaments found.</p>
                    )}
                </div>

            </div>
        </div>
    )
}
