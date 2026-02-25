'use client'

import { useState, useEffect } from 'react'

export default function MiniTwitchPlayer() {
    const [isMinimized, setIsMinimized] = useState(false)
    const [isClosed, setIsClosed] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || isClosed) return null

    // Using localhost and the production domain for the parent param as required by Twitch Embeds
    const channel = "esl_dota2"

    return (
        <div className={`fixed bottom-6 right-6 z-[90] transition-all duration-300 ${isMinimized ? 'w-48' : 'w-[320px] md:w-[384px]'} shadow-[0_0_30px_rgba(220,20,60,0.15)] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 cursor-pointer select-none hover:bg-zinc-900 transition-colors" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-[#dc143c] animate-[pulse_2s_ease-in-out_infinite]" style={{ boxShadow: '0 0 10px rgba(220,20,60,0.8)' }}></div>
                    <span className="text-xs font-rajdhani font-bold text-white uppercase tracking-widest">Live Stream</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="text-zinc-500 hover:text-white transition-colors p-1"
                        aria-label={isMinimized ? "Expand" : "Minimize"}
                    >
                        {isMinimized ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        )}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsClosed(true); }}
                        className="text-zinc-500 hover:text-[#dc143c] transition-colors p-1"
                        aria-label="Close"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>

            {/* Player */}
            <div className={`transition-all duration-300 ease-in-out bg-black overflow-hidden ${isMinimized ? 'h-0 opacity-0' : 'h-[180px] md:h-[216px] opacity-100 border-t border-zinc-800'}`}>
                {/* Embed Twitch Player */}
                <iframe
                    src={`https://player.twitch.tv/?channel=${channel}&parent=localhost&parent=akat-suki.site&muted=true`}
                    className="w-full h-full border-none"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    )
}
