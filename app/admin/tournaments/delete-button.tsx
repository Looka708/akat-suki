'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTournamentAction } from './actions'

export default function DeleteTournamentButton({ id, name }: { id: string, name: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete tournament "${name}"? This action cannot be undone.`)) {
            return
        }

        setIsDeleting(true)
        const result = await deleteTournamentAction(id)

        if (result.success) {
            router.refresh()
        } else {
            alert(result.error || 'Failed to delete tournament')
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-400 transition-colors text-sm font-medium ml-4 disabled:opacity-50"
        >
            {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
    )
}
