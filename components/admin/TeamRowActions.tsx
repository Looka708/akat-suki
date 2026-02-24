'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TeamRowActions({ teamId, currentStatus }: { teamId: string, currentStatus: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const updateStatus = async (status: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/teams/${teamId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_status: status })
            })
            if (res.ok) {
                router.refresh()
            } else {
                alert('Failed to update status')
            }
        } catch (e: any) {
            alert(e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleKick = async () => {
        if (!confirm('Are you sure you want to remove this team from the tournament?')) return
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/teams/${teamId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tournamentId: null })
            })
            if (res.ok) {
                router.refresh()
            } else {
                alert('Failed to kick team')
            }
        } catch (e: any) {
            alert(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-end gap-3 text-sm font-medium uppercase tracking-wider">
            {currentStatus === 'pending' && (
                <>
                    <button 
                        disabled={loading}
                        onClick={() => updateStatus('paid')} 
                        className="text-green-500 hover:text-green-400 transition-colors disabled:opacity-50"
                    >
                        Approve
                    </button>
                    <button 
                        disabled={loading}
                        onClick={() => updateStatus('rejected')} 
                        className="text-yellow-500 hover:text-yellow-400 transition-colors disabled:opacity-50"
                    >
                        Reject
                    </button>
                </>
            )}
            
            <button 
                disabled={loading}
                onClick={handleKick} 
                className="text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
            >
                Kick
            </button>
        </div>
    )
}
