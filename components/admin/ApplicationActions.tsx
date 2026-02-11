'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ApplicationActionsProps {
    applicationId: string
    currentStatus: string
}

export function ApplicationActions({ applicationId, currentStatus }: ApplicationActionsProps) {
    const [isUpdating, setIsUpdating] = useState(false)
    const [notes, setNotes] = useState('')
    const router = useRouter()

    const handleUpdateStatus = async (newStatus: string) => {
        setIsUpdating(true)
        try {
            const response = await fetch('/api/applications/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: applicationId,
                    status: newStatus,
                    review_notes: notes
                })
            })

            if (!response.ok) throw new Error('Failed to update status')

            router.refresh()
        } catch (error) {
            console.error('Update error:', error)
            alert('Failed to update application status')
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Actions</h3>
                <div className="space-y-3">
                    <button
                        onClick={() => handleUpdateStatus('approved')}
                        disabled={isUpdating || currentStatus === 'approved'}
                        className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors"
                    >
                        {isUpdating ? 'Executing...' : 'Approve Application'}
                    </button>
                    <button
                        onClick={() => handleUpdateStatus('rejected')}
                        disabled={isUpdating || currentStatus === 'rejected'}
                        className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors"
                    >
                        {isUpdating ? 'Executing...' : 'Reject Application'}
                    </button>
                    <button
                        onClick={() => handleUpdateStatus('waitlisted')}
                        disabled={isUpdating || currentStatus === 'waitlisted'}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-colors border border-white/10"
                    >
                        Waitlist
                    </button>
                </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Internal Notes</h3>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-32 bg-black border border-white/10 rounded-sm p-3 text-sm text-gray-300 focus:border-[#dc143c] focus:outline-none placeholder-gray-600"
                    placeholder="Add a review note..."
                ></textarea>
                <div className="mt-2 text-[10px] text-gray-500 uppercase tracking-widest">
                    Notes will be saved upon status change
                </div>
            </div>
        </div>
    )
}
