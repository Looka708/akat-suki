/**
 * Challonge API Client Wrapper
 */

const CHALLONGE_API_KEY = process.env.CHALLONGE_API_KEY;
const CHALLONGE_API_URL = 'https://api.challonge.com/v1';

export type BracketType = 'single elimination' | 'double elimination' | 'round robin' | 'swiss' | 'free for all';

interface CreateChallongeTournamentResponse {
    tournament: {
        id: number;
        url: string;
        full_challonge_url: string;
        [key: string]: any;
    };
}

export async function createChallongeTournament(name: string, tournamentType: BracketType) {
    if (!CHALLONGE_API_KEY) throw new Error('Challonge API key is not configured.');

    // Challonge requires unique URL parameters. We generate a random suffix.
    const urlSuffix = Math.random().toString(36).substring(2, 8);
    // Sanitize name for url part
    const sanitizedName = name.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const url = `${sanitizedName}_${urlSuffix}`.substring(0, 60);

    const params = new URLSearchParams({
        api_key: CHALLONGE_API_KEY,
        'tournament[name]': name,
        'tournament[tournament_type]': tournamentType,
        'tournament[url]': url,
    });

    const res = await fetch(`${CHALLONGE_API_URL}/tournaments.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
    });

    if (!res.ok) {
        const text = await res.text();
        console.error('Challonge create tournament error:', text);
        throw new Error(`Failed to create Challonge tournament: ${text}`);
    }

    return (await res.json()) as CreateChallongeTournamentResponse;
}

export async function bulkAddChallongeParticipants(challongeUrlId: string, teamNames: string[]) {
    if (!CHALLONGE_API_KEY) throw new Error('Challonge API key is not configured.');
    if (!teamNames || teamNames.length === 0) return;

    const params = new URLSearchParams();
    params.append('api_key', CHALLONGE_API_KEY);

    teamNames.forEach((name, idx) => {
        params.append(`participants[][name]`, name);
    });

    const res = await fetch(`${CHALLONGE_API_URL}/tournaments/${challongeUrlId}/participants/bulk_add.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
    });

    if (!res.ok) {
        const text = await res.text();
        console.error('Challonge bulk add participants error:', text);
        throw new Error(`Failed to add Challonge participants: ${text}`);
    }

    return await res.json();
}

export async function startChallongeTournament(challongeUrlId: string) {
    if (!CHALLONGE_API_KEY) throw new Error('Challonge API key is not configured.');

    const params = new URLSearchParams({
        api_key: CHALLONGE_API_KEY,
    });

    const res = await fetch(`${CHALLONGE_API_URL}/tournaments/${challongeUrlId}/start.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
    });

    if (!res.ok) {
        const text = await res.text();
        // Challonge errors out if it's already started, etc.
        console.error('Challonge start tournament error:', text);
        // We might not throw here if it's already started, but let's throw for now.
        throw new Error(`Failed to start Challonge tournament: ${text}`);
    }

    return await res.json();
}
