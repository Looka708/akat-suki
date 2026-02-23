const OPENDOTA_API_BASE = 'https://api.opendota.com/api'

/**
 * Converts a SteamID64 to a 32-bit Account ID used by Dota 2 APIs.
 */
export function toAccountId32(steamId64: string): string {
    return (BigInt(steamId64) - 76561197960265728n).toString()
}

/**
 * Fetches player profile data from OpenDota.
 */
export async function getPlayerSummaries(steamIds: string[]) {
    // OpenDota doesn't support batch player requests in a simple way for profiles.
    // We'll fetch the first one for now as our API route is designed for single player.
    const accountId = toAccountId32(steamIds[0])
    const response = await fetch(`${OPENDOTA_API_BASE}/players/${accountId}`)
    const data = await response.json()

    // Map OpenDota response to match the expected structure of our existing player UI
    if (data.profile) {
        return [{
            steamid: steamIds[0],
            personaname: data.profile.personaname,
            avatarfull: data.profile.avatarfull,
            profileurl: data.profile.profileurl,
            rank_tier: data.rank_tier,
            leaderboard_rank: data.leaderboard_rank
        }]
    }
    return []
}

/**
 * Fetches recent match history from OpenDota.
 */
export async function getMatchHistory(accountId: string) {
    // OpenDota endpoint: /players/{account_id}/matches
    const response = await fetch(`${OPENDOTA_API_BASE}/players/${accountId}/matches?limit=10`)
    const matches = await response.json()

    return {
        matches: matches.map((m: any) => ({
            match_id: m.match_id,
            player_slot: m.player_slot,
            radiant_win: m.radiant_win,
            duration: m.duration,
            game_mode: m.game_mode,
            hero_id: m.hero_id,
            start_time: m.start_time,
            kills: m.kills,
            deaths: m.deaths,
            assists: m.assists
        }))
    }
}

/**
 * Fetches detailed match data from OpenDota.
 */
export async function getMatchDetails(matchId: string) {
    const response = await fetch(`${OPENDOTA_API_BASE}/matches/${matchId}`)
    const data = await response.json()
    return data
}
