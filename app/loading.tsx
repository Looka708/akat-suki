export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black min-h-screen">
            {/* Glowing background effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vh] h-[40vh] bg-red-600/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Custom Akatsuki-themed spinner */}
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-t-[3px] border-r-[3px] border-transparent border-t-[#dc143c] border-r-[#dc143c] animate-[spin_1.5s_cubic-bezier(0.68,-0.55,0.265,1.55)_infinite]"></div>
                    <div className="absolute inset-3 rounded-full border-b-[3px] border-l-[3px] border-transparent border-b-red-800 border-l-red-800 animate-[spin_2s_cubic-bezier(0.68,-0.55,0.265,1.55)_infinite_reverse]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[#dc143c] font-black text-2xl drop-shadow-[0_0_15px_rgba(220,20,60,0.8)] opacity-90 animate-pulse">
                            暁
                        </span>
                    </div>
                </div>

                {/* Loading text */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[#dc143c] font-bold text-xs uppercase tracking-[0.5em] font-rajdhani animate-pulse">
                        Synchronizing
                    </span>
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-red-600/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-red-600/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-red-600/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                </div>
            </div>
        </div>
    )
}
