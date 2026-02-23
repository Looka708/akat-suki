const STEAM_API_BASE = 'https://api.steampowered.com'
const DOTA2_API_BASE = 'https://api.steampowered.com/IDOTA2Match_570'

export async function getPlayerSummaries(steamIds: string[]) {
    const apiKey = process.env.STEAM_API_KEY
    if (!apiKey) throw new Error('STEAM_API_KEY is not configured')

    const response = await fetch(
        `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamIds.join(',')}`
    )
    const data = await response.json()
    return data.response.players
}

export async function getMatchHistory(accountId: string) {
    const apiKey = process.env.STEAM_API_KEY
    if (!apiKey) throw new Error('STEAM_API_KEY is not configured')

    const response = await fetch(
        `${DOTA2_API_BASE}/GetMatchHistory/v1/?key=${apiKey}&account_id=${accountId}`
    )
    const data = await response.json()
    return data.result
}

export async function getMatchDetails(matchId: string) {
    const apiKey = process.env.STEAM_API_KEY
    if (!apiKey) throw new Error('STEAM_API_KEY is not configured')

    const response = await fetch(
        `${DOTA2_API_BASE}/GetMatchDetails/v1/?key=${apiKey}&match_id=${matchId}`
    )
    const data = await response.json()
    return data.result
}
