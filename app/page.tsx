import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Mission from '@/components/Mission'
import dynamic from 'next/dynamic'

const Tournaments = dynamic(() => import('@/components/Tournaments'), {
    loading: () => (
        <div className="py-32 min-h-[800px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#dc143c] border-t-transparent rounded-full animate-spin"></div>
        </div>
    )
})
const PlayerRoster = dynamic(() => import('@/components/PlayerRoster'), {
    loading: () => <div className="py-32 h-[600px] w-full bg-transparent"></div>
})
const JoinTeam = dynamic(() => import('@/components/JoinTeam'), {
    loading: () => <div className="py-32 h-[500px] w-full bg-transparent"></div>
})
const Newsletter = dynamic(() => import('@/components/Newsletter'), {
    loading: () => <div className="py-32 h-[400px] w-full bg-transparent"></div>
})
const Contact = dynamic(() => import('@/components/Contact'), {
    loading: () => <div className="py-32 h-[600px] w-full bg-transparent"></div>
})
const Footer = dynamic(() => import('@/components/Footer'), {
    loading: () => <div className="py-12 h-[300px] w-full bg-[#050505]"></div>
})

export default function Home() {
    return (
        <main id="main-content">
            <Navbar />
            <Hero />
            <Tournaments />
            <Mission />
            <PlayerRoster />
            <JoinTeam />
            <Newsletter />
            <Contact />
            <Footer />
        </main>
    )
}
