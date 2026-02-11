import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black py-16">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                {/* Left */}
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-[#dc143c] rounded-[1px]"></div>
                    <span className="font-rajdhani font-bold tracking-widest text-sm text-white">
                        AKATSUKI INC.
                    </span>
                </div>

                {/* Center */}
                <div className="flex gap-10 text-xs font-medium text-gray-500">
                    <Link href="#" className="hover:text-white transition-colors uppercase tracking-wider">
                        Twitter
                    </Link>
                    <Link href="#" className="hover:text-white transition-colors uppercase tracking-wider">
                        Instagram
                    </Link>
                    <Link href="#" className="hover:text-white transition-colors uppercase tracking-wider">
                        LinkedIn
                    </Link>
                    <Link href="#" className="hover:text-white transition-colors uppercase tracking-wider">
                        Discord
                    </Link>
                </div>

                {/* Right */}
                <div className="text-[10px] text-gray-700 font-mono tracking-widest uppercase">
                    © 2024. ALL RIGHTS RESERVED.
                </div>
            </div>
        </footer>
    )
}
