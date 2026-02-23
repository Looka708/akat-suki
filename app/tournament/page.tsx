'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'

export default function TournamentLandingPage() {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    return (
        <main className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <div className="pt-32 pb-20 px-6 mx-auto max-w-6xl min-h-[80vh] flex flex-col items-center justify-center text-center">
                <div className="relative z-10">
                    <h1 className="text-5xl md:text-7xl font-rajdhani font-bold mb-6 uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-white to-red-500">
                        AKATSUKI
                        <br />
                        <span className="text-4xl md:text-6xl text-white">Dota 2 Tournament</span>
                    </h1>

                    <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto font-inter">
                        Assemble your squad. Compete with the best. Claim your glory. Register your team now and get automated Discord roles and voice channels for seamless communication.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            href="/tournament/register"
                            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-rajdhani font-bold tracking-wider uppercase transition-all rounded-lg text-lg w-full sm:w-auto hover:shadow-[0_0_30px_rgba(220,20,60,0.5)] border border-red-500/50"
                        >
                            Register New Team
                        </Link>

                        <Link
                            href="/tournament/dashboard"
                            className="px-8 py-4 bg-transparent hover:bg-zinc-900 border border-zinc-700 text-white font-rajdhani font-bold tracking-wider uppercase transition-all rounded-lg text-lg w-full sm:w-auto"
                        >
                            View Team Dashboard
                        </Link>
                    </div>
                </div>

                {/* Background image & overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000"
                        alt="Esports Database"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-transparent" />
                </div>
            </div>

            <Footer />
        </main>
    )
}
