'use server'

import { deleteTournament } from '@/lib/tournament-db'
import { revalidatePath } from 'next/cache'

export async function deleteTournamentAction(id: string) {
    try {
        await deleteTournament(id)
        revalidatePath('/admin/tournaments')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete tournament:', error)
        return { success: false, error: 'Failed to delete tournament' }
    }
}
