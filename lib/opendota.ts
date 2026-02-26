export async function fetchMatchDetails(matchId: string) {
    try {
        const response = await fetch(`https://api.opendota.com/api/matches/${matchId}`);

        if (!response.ok) {
            throw new Error(`OpenDota API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // We ensure it's a valid match object by checking for match_id
        if (!data || !data.match_id) {
            throw new Error('Invalid match data received from OpenDota');
        }

        return data;
    } catch (error) {
        console.error('Error fetching OpenDota match:', error);
        throw error;
    }
}
