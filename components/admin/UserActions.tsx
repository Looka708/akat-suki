'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserActionsProps {
    userId: string
    currentRole: string
}

export function UserActions({ userId, currentRole }: UserActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to remove this user entirely from the system? This action cannot be undone.')) {
            return
        }

        setIsDeleting(true)
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                router.refresh()
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to delete user')
            }
        } catch (err) {
            console.error(err)
            alert('An error occurred')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleRoleChange = async (newRole: string) => {
        setIsUpdating(true)
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            })
            if (res.ok) {
                router.refresh()
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to update role')
            }
        } catch (err) {
            console.error(err)
            alert('An error occurred')
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="flex items-center gap-3">
            <select
                value={currentRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={isUpdating}
                className="bg-black border border-white/10 rounded-sm px-2 py-1 text-[10px] uppercase font-bold text-gray-400 focus:outline-none focus:border-[#dc143c] transition-colors"
            >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
            </select>

            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="Remove User"
            >
                {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                )}
            </button>
        </div>
    )
}
