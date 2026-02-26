'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link: string | null
    read: boolean
    created_at: string
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000) // poll every 30s
        return () => clearInterval(interval)
    }, [])

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            if (!res.ok) return
            const data = await res.json()
            setNotifications(data.notifications || [])
            setUnreadCount(data.unreadCount || 0)
        } catch { }
    }

    const markRead = async (id: string) => {
        await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark_read', notificationId: id })
        })
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const markAllRead = async () => {
        await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark_all_read' })
        })
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'just now'
        if (mins < 60) return `${mins}m ago`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours}h ago`
        return `${Math.floor(hours / 24)}d ago`
    }

    const typeIcon = (type: string) => {
        switch (type) {
            case 'match_scheduled': return '⏰'
            case 'match_result': return '⚔️'
            case 'team_update': return '👥'
            default: return '🔔'
        }
    }

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 text-zinc-400 hover:text-white transition-colors"
                aria-label="Notifications"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#dc143c] rounded-full flex items-center justify-center text-[9px] font-bold text-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-[420px] bg-black/95 backdrop-blur-xl border border-white/10 rounded-sm shadow-2xl shadow-black/60 z-[100] overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                        <h3 className="text-xs font-rajdhani font-bold text-white uppercase tracking-[0.2em]">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[9px] text-[#dc143c] hover:text-white uppercase tracking-widest font-bold transition-colors">
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="overflow-y-auto max-h-[360px] divide-y divide-white/5">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <span className="text-zinc-600 text-2xl block mb-2">🔕</span>
                                <p className="text-zinc-600 text-xs font-mono uppercase tracking-widest">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    onClick={() => { if (!n.read) markRead(n.id) }}
                                    className={`px-4 py-3 transition-colors cursor-pointer ${n.read ? 'bg-transparent hover:bg-white/[0.02]' : 'bg-[#dc143c]/[0.03] hover:bg-[#dc143c]/[0.06]'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-sm mt-0.5 shrink-0">{typeIcon(n.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-xs font-rajdhani font-bold truncate ${n.read ? 'text-zinc-400' : 'text-white'}`}>
                                                    {n.title}
                                                </p>
                                                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#dc143c] shrink-0"></span>}
                                            </div>
                                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5 line-clamp-2">{n.message}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] text-zinc-600 font-mono">{timeAgo(n.created_at)}</span>
                                                {n.link && (
                                                    <Link href={n.link} onClick={(e) => e.stopPropagation()} className="text-[9px] text-[#dc143c] hover:text-white font-bold uppercase tracking-widest transition-colors">
                                                        View →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
