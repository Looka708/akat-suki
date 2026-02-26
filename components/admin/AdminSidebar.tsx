'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { getDiscordAvatarUrl } from '@/lib/discord-auth'
import { useState } from 'react'

const navigation = [

    {
        name: 'Dashboard',
        href: '/admin',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        name: 'Applications',
        href: '/admin/applications',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        name: 'Tournaments',
        href: '/admin/tournaments',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    },
    {
        name: 'Teams',
        href: '/admin/teams',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        name: 'Bracket Manager',
        href: '/admin/bracket-manager',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16M20 6v6m0 0l-3-3m3 3l3-3" />
            </svg>
        ),
    },
    {
        name: 'Player Pool',
        href: '/admin/player-pool',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        ),
    },
    {
        name: 'Users',
        href: '/admin/users',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
    },

    {
        name: 'Content',
        href: '/admin/content',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        ),
    },
    {
        name: 'Analytics',
        href: '/admin/analytics',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    {
        name: 'Settings',
        href: '/admin/settings',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                    <div className="w-6 h-6 bg-[#dc143c] flex items-center justify-center rounded-[2px]">
                        <span className="text-white font-bold text-[10px]">A</span>
                    </div>
                    <span className="font-rajdhani font-semibold text-lg tracking-wide text-white">
                        ADMIN PANEL
                    </span>
                </Link>
                {/* Mobile close */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="md:hidden text-zinc-400 hover:text-white"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 ${isActive
                                ? 'bg-[#dc143c]/10 text-[#dc143c] border-l-2 border-[#dc143c] pl-[14px]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 flex-shrink-0">
                        {user?.avatar ? (
                            <img
                                src={getDiscordAvatarUrl(user.id, user.avatar)}
                                alt={user.username}
                                className="w-full h-full rounded-full border border-white/10 object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-[#5865F2] rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                    {user?.username?.[0]?.toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                            {user?.username}
                        </p>
                        <p className="text-gray-500 text-xs">
                            Administrator
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-sm text-sm font-medium transition-colors"
                >
                    Logout
                </button>
            </div>
        </>
    )

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 bg-black border border-white/10 rounded-sm flex items-center justify-center text-white hover:bg-white/5 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Desktop sidebar */}
            <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-black border-r border-white/10 z-40 flex-col">
                {sidebarContent}
            </aside>

            {/* Mobile overlay + sidebar */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="fixed left-0 top-0 h-full w-72 bg-black border-r border-white/10 z-50 flex flex-col md:hidden animate-slideIn">
                        {sidebarContent}
                    </aside>
                </>
            )}
        </>
    )
}
