'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'

export default function RegisterTournamentPage() {
    const { isAuthenticated, login } = useAuth()
    const router = useRouter()

    const [teamName, setTeamName] = useState('')
    const [steamId, setSteamId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successTeam, setSuccessTeam] = useState<any | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isAuthenticated) {
            login()
            return
        }

        if (teamName.length < 3) {
            setError('Team name must be at least 3 characters long')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/tournament/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: teamName, steamId }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create team')
            }

            setSuccessTeam(data.team)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <div className="pt-32 pb-20 px-6 mx-auto max-w-4xl min-h-[80vh] flex flex-col items-center justify-center">
                <div className="w-full relative">
                    {/* Background effects */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-red-600/10 blur-[100px] -z-10 rounded-full" />

                    {!successTeam ? (
                        <div className="bg-zinc-900/50 border border-zinc-800 p-8 md:p-12 rounded-xl backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900" />

                            <h1 className="text-4xl md:text-5xl font-rajdhani font-bold mb-4 uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                Register Your Team
                            </h1>
                            <p className="text-zinc-400 mb-8 font-inter">
                                Create a team for the Dota 2 Tournament. You'll get an invite link to send to your teammates.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="teamName" className="block text-sm font-medium text-zinc-300 mb-2 font-inter uppercase tracking-wider">
                                        Team Name
                                    </label>
                                    <input
                                        type="text"
                                        id="teamName"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-red-500 transition-colors font-inter flex-1"
                                        placeholder="Enter your team name"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="steamId" className="block text-sm font-medium text-zinc-300 mb-2 font-inter uppercase tracking-wider">
                                        Steam ID 64 (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="steamId"
                                        value={steamId}
                                        onChange={(e) => setSteamId(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:border-red-500 transition-colors font-inter flex-1"
                                        placeholder="e.g. 76561198031234567"
                                        disabled={loading}
                                    />
                                    <p className="mt-2 text-[10px] text-zinc-500 font-mono">
                                        Used to integrate your Dota 2 match history and stats.
                                    </p>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-inter">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-8 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-rajdhani font-bold tracking-wider uppercase transition-colors rounded-lg flex items-center justify-center group"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : !isAuthenticated ? (
                                        <span>Login to Create</span>
                                    ) : (
                                        <span>Create Team & Get Invite Link</span>
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-zinc-900/50 border border-zinc-800 p-8 md:p-12 rounded-xl backdrop-blur-sm text-center">
                            <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h2 className="text-3xl font-rajdhani font-bold mb-4 text-white">Team Created Successfully!</h2>
                            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                                Your team <strong>{successTeam.name}</strong> has been created. A Discord role and voice channel are being set up.
                            </p>

                            <div className="bg-black/50 border border-zinc-800 p-6 rounded-lg mb-8">
                                <p className="text-sm font-inter text-zinc-500 mb-2 uppercase tracking-wide">Your Invite Link</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`${window.location.origin}/tournament/invite/${successTeam.invite_code}`}
                                        className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-lg font-mono text-sm"
                                    />
                                    <button
                                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/tournament/invite/${successTeam.invite_code}`)}
                                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-rajdhani uppercase tracking-wider font-bold rounded-lg transition-colors whitespace-nowrap"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/tournament/dashboard')}
                                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-rajdhani font-bold tracking-wider uppercase transition-colors rounded-lg"
                            >
                                Go to Team Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    )
}
