'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'

interface DotaProfile {
    player: {
        steamid: string
        personaname: string
        avatarfull: string
        profileurl: string
        rank_tier: number | null
        leaderboard_rank: number | null
    }
    matches: any[]
}

const rankTierLabels: Record<number, string> = {
    11: 'Herald I', 12: 'Herald II', 13: 'Herald III', 14: 'Herald IV', 15: 'Herald V',
    21: 'Guardian I', 22: 'Guardian II', 23: 'Guardian III', 24: 'Guardian IV', 25: 'Guardian V',
    31: 'Crusader I', 32: 'Crusader II', 33: 'Crusader III', 34: 'Crusader IV', 35: 'Crusader V',
    41: 'Archon I', 42: 'Archon II', 43: 'Archon III', 44: 'Archon IV', 45: 'Archon V',
    51: 'Legend I', 52: 'Legend II', 53: 'Legend III', 54: 'Legend IV', 55: 'Legend V',
    61: 'Ancient I', 62: 'Ancient II', 63: 'Ancient III', 64: 'Ancient IV', 65: 'Ancient V',
    71: 'Divine I', 72: 'Divine II', 73: 'Divine III', 74: 'Divine IV', 75: 'Divine V',
    80: 'Immortal',
}

export default function ConnectSteamPage() {
    const { isAuthenticated, isLoading: authLoading, login, user } = useAuth()
    const router = useRouter()

    const [steamId, setSteamId] = useState('')
    const [currentSteamId, setCurrentSteamId] = useState<string | null>(null)
    const [hasTeam, setHasTeam] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [unlinking, setUnlinking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [dotaProfile, setDotaProfile] = useState<DotaProfile | null>(null)
    const [verifiedId, setVerifiedId] = useState<string | null>(null)

    // Load current link status
    useEffect(() => {
        const fetchStatus = async () => {
            if (!isAuthenticated) {
                setLoading(false)
                return
            }

            try {
                const res = await fetch('/api/tournament/link-steam')
                if (res.ok) {
                    const data = await res.json()
                    setCurrentSteamId(data.steamId)
                    setHasTeam(data.hasTeam)

                    if (data.steamId) {
                        setSteamId(data.steamId)
                        // Auto-fetch profile for already linked account
                        fetchDotaProfile(data.steamId)
                    }
                }
            } catch { }
            setLoading(false)
        }

        if (!authLoading) fetchStatus()
    }, [isAuthenticated, authLoading])

    const fetchDotaProfile = async (id: string) => {
        try {
            const res = await fetch(`/api/dota/player/${id}`)
            if (res.ok) {
                const data = await res.json()
                setDotaProfile(data)
            } else {
                setDotaProfile(null)
            }
        } catch {
            setDotaProfile(null)
        }
    }

    const handleVerify = async () => {
        if (!steamId.trim()) {
            setError('Please enter your Steam ID or Dota 2 Friend Code')
            return
        }

        if (!/^\d+$/.test(steamId.trim())) {
            setError('Steam ID must be numeric. Enter your SteamID64 or Dota 2 Friend Code.')
            return
        }

        setVerifying(true)
        setError(null)
        setSuccess(null)
        setDotaProfile(null)
        setVerifiedId(null)

        try {
            const res = await fetch(`/api/dota/player/${steamId.trim()}`)
            if (!res.ok) {
                throw new Error('Could not find a Dota 2 profile for this ID. Make sure you entered a valid SteamID64 or Friend Code.')
            }
            const data = await res.json()

            if (!data.player || !data.player.personaname) {
                throw new Error('This account does not have a public Dota 2 profile. Make sure your Steam profile is set to public.')
            }

            setDotaProfile(data)
            setVerifiedId(steamId.trim())
            setSuccess('Profile found! Verify the details below, then save to link your account.')
        } catch (e: any) {
            setError(e.message)
        } finally {
            setVerifying(false)
        }
    }

    const handleSave = async () => {
        if (!verifiedId) {
            setError('Please verify your Steam ID first')
            return
        }

        setSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const res = await fetch('/api/tournament/link-steam', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ steamId: verifiedId })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to link Steam account')

            setCurrentSteamId(verifiedId)
            setSuccess('Steam account linked successfully! Your Dota 2 profile is now connected.')
        } catch (e: any) {
            setError(e.message)
        } finally {
            setSaving(false)
        }
    }

    const handleUnlink = async () => {
        if (!confirm('Are you sure you want to unlink your Steam account?')) return

        setUnlinking(true)
        setError(null)
        setSuccess(null)

        try {
            const res = await fetch('/api/tournament/link-steam', { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to unlink')

            setCurrentSteamId(null)
            setDotaProfile(null)
            setVerifiedId(null)
            setSteamId('')
            setSuccess('Steam account unlinked successfully.')
        } catch (e: any) {
            setError(e.message)
        } finally {
            setUnlinking(false)
        }
    }

    if (authLoading || loading) {
        return (
            <main className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="pt-32 pb-20 flex items-center justify-center min-h-[80vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-2 border-[#dc143c] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-zinc-500 uppercase tracking-[0.3em] font-mono">Loading</p>
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    const rankLabel = dotaProfile?.player?.rank_tier
        ? rankTierLabels[dotaProfile.player.rank_tier] || `Rank ${dotaProfile.player.rank_tier}`
        : null

    const recentMatches = dotaProfile?.matches || []
    const wins = recentMatches.filter((m: any) => {
        const isRadiant = m.player_slot < 128
        return (isRadiant && m.radiant_win) || (!isRadiant && !m.radiant_win)
    }).length
    const winRate = recentMatches.length > 0 ? Math.round((wins / recentMatches.length) * 100) : 0

    return (
        <main className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <div className="pt-32 pb-20 px-6 mx-auto max-w-3xl min-h-[80vh]">
                {/* Header */}
                <div className="text-center mb-12 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                        <span className="text-[140px] font-rajdhani font-black text-white uppercase">STEAM</span>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <span className="w-10 h-[1px] bg-[#dc143c]"></span>
                            <span className="text-[#dc143c] text-xs font-bold tracking-[0.5em] uppercase">Account Link</span>
                            <span className="w-10 h-[1px] bg-[#dc143c]"></span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-rajdhani font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-3">
                            Connect Steam
                        </h1>
                        <p className="text-zinc-500 font-mono text-sm max-w-lg mx-auto">
                            Link your Steam account to enable Dota 2 profile stats, automated match scoring, and tournament verification.
                        </p>
                    </div>
                </div>

                {/* Not Authenticated */}
                {!isAuthenticated && (
                    <div className="bg-zinc-900/50 border border-zinc-800 p-8 md:p-12 rounded-sm backdrop-blur-sm text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#dc143c] to-transparent"></div>
                        <div className="w-16 h-16 mx-auto mb-6 bg-[#dc143c]/10 border border-[#dc143c]/20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-[#dc143c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-rajdhani font-bold text-white uppercase tracking-wide mb-3">Authentication Required</h2>
                        <p className="text-zinc-500 font-mono text-sm mb-8 max-w-sm mx-auto">Sign in with Discord to connect your Steam account.</p>
                        <button
                            onClick={() => login('/tournament/connect-steam')}
                            className="px-8 py-4 bg-[#dc143c] hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-sm"
                        >
                            Login with Discord
                        </button>
                    </div>
                )}

                {/* No Team */}
                {isAuthenticated && !hasTeam && (
                    <div className="bg-zinc-900/50 border border-zinc-800 p-8 md:p-12 rounded-sm backdrop-blur-sm text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                        <div className="w-16 h-16 mx-auto mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-rajdhani font-bold text-white uppercase tracking-wide mb-3">Team Required</h2>
                        <p className="text-zinc-500 font-mono text-sm mb-8 max-w-sm mx-auto">
                            You need to join or create a tournament team before linking your Steam account.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/tournament/register"
                                className="px-8 py-4 bg-[#dc143c] hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-sm"
                            >
                                Create a Team
                            </Link>
                            <Link
                                href="/tournament/dashboard"
                                className="px-8 py-4 border border-white/20 text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-sm"
                            >
                                Team Dashboard
                            </Link>
                        </div>
                    </div>
                )}

                {/* Main Connect Steam UI */}
                {isAuthenticated && hasTeam && (
                    <div className="space-y-6">
                        {/* Current Status Card */}
                        <div className={`border rounded-sm p-6 relative overflow-hidden backdrop-blur-sm ${currentSteamId
                            ? 'border-green-500/20 bg-green-500/[0.03]'
                            : 'border-zinc-800 bg-zinc-900/50'
                            }`}>
                            <div className={`absolute top-0 left-0 w-full h-0.5 ${currentSteamId
                                ? 'bg-gradient-to-r from-transparent via-green-500 to-transparent'
                                : 'bg-gradient-to-r from-transparent via-zinc-700 to-transparent'
                                }`}></div>

                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${currentSteamId
                                    ? 'bg-green-500/10 border border-green-500/30'
                                    : 'bg-zinc-800 border border-zinc-700'
                                    }`}>
                                    {currentSteamId ? (
                                        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-rajdhani font-bold text-white uppercase tracking-wide">
                                        {currentSteamId ? 'Steam Connected' : 'Steam Not Connected'}
                                    </h3>
                                    <p className="text-[11px] text-zinc-500 font-mono uppercase tracking-widest">
                                        {currentSteamId ? `ID: ${currentSteamId}` : 'No Steam ID linked to your account'}
                                    </p>
                                </div>
                                {currentSteamId && (
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Active</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Connected Profile Preview */}
                        {currentSteamId && dotaProfile && (
                            <div className="border border-white/10 bg-zinc-900/40 rounded-sm overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start gap-5">
                                        {dotaProfile.player.avatarfull && (
                                            <img
                                                src={dotaProfile.player.avatarfull}
                                                alt={dotaProfile.player.personaname}
                                                className="w-20 h-20 rounded-sm border-2 border-white/10 shrink-0"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-rajdhani font-bold text-white">{dotaProfile.player.personaname}</h3>
                                            <div className="flex flex-wrap gap-3 mt-2">
                                                {rankLabel && (
                                                    <span className="text-[10px] font-bold text-[#dc143c] bg-[#dc143c]/10 border border-[#dc143c]/20 px-2 py-1 rounded-sm uppercase tracking-widest">
                                                        {rankLabel}
                                                    </span>
                                                )}
                                                {dotaProfile.player.leaderboard_rank && (
                                                    <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-sm uppercase tracking-widest">
                                                        #{dotaProfile.player.leaderboard_rank} Leaderboard
                                                    </span>
                                                )}
                                            </div>
                                            {recentMatches.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-white/5">
                                                    <div className="flex items-center gap-6">
                                                        <div>
                                                            <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Win Rate</p>
                                                            <p className={`text-xl font-rajdhani font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                                                {winRate}%
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">Recent</p>
                                                            <div className="flex gap-1 mt-1">
                                                                {recentMatches.slice(0, 10).map((m: any, i: number) => {
                                                                    const isRadiant = m.player_slot < 128
                                                                    const won = (isRadiant && m.radiant_win) || (!isRadiant && !m.radiant_win)
                                                                    return (
                                                                        <div
                                                                            key={i}
                                                                            className={`w-5 h-5 rounded-sm flex items-center justify-center text-[8px] font-bold ${won ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                                                }`}
                                                                        >
                                                                            {won ? 'W' : 'L'}
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex border-t border-white/5">
                                    <a
                                        href={`https://www.opendota.com/players/${currentSteamId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-3 text-center text-[10px] font-bold text-sky-400 hover:bg-sky-400/5 transition-colors uppercase tracking-widest"
                                    >
                                        OpenDota Profile →
                                    </a>
                                    <div className="w-[1px] bg-white/5"></div>
                                    <a
                                        href={dotaProfile.player.profileurl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-3 text-center text-[10px] font-bold text-zinc-400 hover:bg-white/5 transition-colors uppercase tracking-widest"
                                    >
                                        Steam Profile →
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Link / Update Form */}
                        <div className="border border-zinc-800 bg-zinc-900/50 rounded-sm p-6 relative overflow-hidden backdrop-blur-sm">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#dc143c] to-transparent"></div>

                            <h3 className="text-lg font-rajdhani font-bold text-white uppercase tracking-wide mb-1">
                                {currentSteamId ? 'Update Steam ID' : 'Link Your Steam Account'}
                            </h3>
                            <p className="text-[11px] text-zinc-500 font-mono mb-6">
                                Enter your SteamID64 or Dota 2 Friend Code. We'll verify it before saving.
                            </p>

                            {/* How to find your Steam ID */}
                            <div className="mb-6 bg-black/40 border border-white/5 rounded-sm p-4">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-3">How to find your Steam ID</h4>
                                <div className="space-y-2 text-[11px] text-zinc-500 font-mono">
                                    <p>• <span className="text-zinc-300">In Dota 2:</span> Settings → Social → "Friend Code" at the top</p>
                                    <p>• <span className="text-zinc-300">Steam Profile URL:</span> The number in steamcommunity.com/profiles/<span className="text-[#dc143c]">76561198...</span></p>
                                    <p>• <span className="text-zinc-300">Third-party:</span> Use <a href="https://steamid.io" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">steamid.io</a> to look up any format</p>
                                </div>
                            </div>

                            {/* Input */}
                            <div className="flex gap-3 mb-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={steamId}
                                        onChange={(e) => {
                                            setSteamId(e.target.value)
                                            setVerifiedId(null)
                                            setDotaProfile(null)
                                            setError(null)
                                            setSuccess(null)
                                        }}
                                        placeholder="e.g. 76561198031234567 or 321580662"
                                        className="w-full px-4 py-3.5 bg-black border border-zinc-800 rounded-sm focus:outline-none focus:border-[#dc143c] transition-colors text-white font-mono text-sm placeholder:text-zinc-700"
                                        disabled={verifying || saving}
                                    />
                                    {verifiedId && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleVerify}
                                    disabled={verifying || !steamId.trim()}
                                    className="px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 text-white text-xs font-bold uppercase tracking-[0.15em] transition-colors rounded-sm border border-zinc-700 shrink-0"
                                >
                                    {verifying ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        'Verify'
                                    )}
                                </button>
                            </div>

                            {/* Verification Preview */}
                            {verifiedId && dotaProfile && !currentSteamId && (
                                <div className="mb-4 border border-green-500/20 bg-green-500/[0.03] rounded-sm p-4">
                                    <div className="flex items-center gap-4">
                                        {dotaProfile.player.avatarfull && (
                                            <img src={dotaProfile.player.avatarfull} alt="" className="w-12 h-12 rounded-sm border border-white/10" />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-rajdhani font-bold text-white text-lg">{dotaProfile.player.personaname}</p>
                                            <div className="flex items-center gap-2">
                                                {rankLabel && <span className="text-[9px] text-[#dc143c] font-bold uppercase">{rankLabel}</span>}
                                                {dotaProfile.player.leaderboard_rank && (
                                                    <span className="text-[9px] text-yellow-500 font-mono">#{dotaProfile.player.leaderboard_rank}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Verified ✓</div>
                                    </div>
                                </div>
                            )}

                            {/* Already linked, showing update preview */}
                            {verifiedId && dotaProfile && currentSteamId && verifiedId !== currentSteamId && (
                                <div className="mb-4 border border-yellow-500/20 bg-yellow-500/[0.03] rounded-sm p-4">
                                    <div className="flex items-center gap-4">
                                        {dotaProfile.player.avatarfull && (
                                            <img src={dotaProfile.player.avatarfull} alt="" className="w-12 h-12 rounded-sm border border-white/10" />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-rajdhani font-bold text-white text-lg">{dotaProfile.player.personaname}</p>
                                            <p className="text-[9px] text-yellow-400 font-mono uppercase">New account — will replace current link</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm text-sm font-mono">
                                    {error}
                                </div>
                            )}

                            {/* Success */}
                            {success && (
                                <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-sm text-sm font-mono">
                                    {success}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={!verifiedId || saving || (verifiedId === currentSteamId)}
                                    className="flex-1 py-4 bg-[#dc143c] hover:bg-white hover:text-black disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-sm"
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
                                    ) : currentSteamId ? (
                                        verifiedId === currentSteamId ? 'Already Linked' : 'Update Steam ID'
                                    ) : (
                                        'Link Steam Account'
                                    )}
                                </button>

                                {currentSteamId && (
                                    <button
                                        onClick={handleUnlink}
                                        disabled={unlinking}
                                        className="px-6 py-4 bg-transparent border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-sm"
                                    >
                                        {unlinking ? 'Unlinking...' : 'Unlink'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-center gap-4 pt-4">
                            <Link
                                href="/tournament/dashboard"
                                className="px-6 py-3 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors uppercase tracking-widest text-[10px] font-bold rounded-sm"
                            >
                                Team Dashboard
                            </Link>
                            <Link
                                href="/#tournaments"
                                className="px-6 py-3 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors uppercase tracking-widest text-[10px] font-bold rounded-sm"
                            >
                                Back to Arena
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    )
}
