import { supabaseAdmin } from '../supabase-admin'
import { Tournament } from './types'

export async function createTournament(tournamentData: Partial<Tournament>) {
    const { data, error } = await supabaseAdmin
        .from('tournaments')
        .insert({
            ...tournamentData,
            status: 'upcoming'
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating tournament:', error)
        throw error
    }
    return data as Tournament
}

export async function getTournaments() {
    const { data, error } = await supabaseAdmin
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true })

    if (error) {
        console.error('Error fetching tournaments:', error)
        throw error
    }
    return data as Tournament[]
}

export async function getTournamentById(id: string) {
    const { data, error } = await supabaseAdmin
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching tournament:', error)
        throw error
    }
    return data as Tournament | null
}

export async function updateTournamentStatus(id: string, status: string) {
    const { data, error } = await supabaseAdmin
        .from('tournaments')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating tournament status:', error)
        throw error
    }
    return data as Tournament
}

export async function deleteTournament(id: string) {
    // 1. Delete any matches generated for this tournament
    const { error: matchesError } = await supabaseAdmin
        .from('tournament_matches')
        .delete()
        .eq('tournament_id', id)

    if (matchesError) {
        console.error('Error deleting tournament matches:', matchesError)
        throw matchesError
    }

    // 2. Unlink teams from this tournament so they are not deleted but are no longer in the tournament
    const { error: teamsError } = await supabaseAdmin
        .from('tournament_teams')
        .update({ tournament_id: null })
        .eq('tournament_id', id)

    if (teamsError) {
        console.error('Error unlinking tournament teams:', teamsError)
        throw teamsError
    }

    // 3. Delete the tournament
    const { error } = await supabaseAdmin
        .from('tournaments')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting tournament:', error)
        throw error
    }
}
