import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Mission from '@/components/Mission'
import dynamic from 'next/dynamic'

const Tournaments = dynamic(() => import('@/components/Tournaments'))
const PlayerRoster = dynamic(() => import('@/components/PlayerRoster'))
const JoinTeam = dynamic(() => import('@/components/JoinTeam'))
const Newsletter = dynamic(() => import('@/components/Newsletter'))
const Contact = dynamic(() => import('@/components/Contact'))
const Footer = dynamic(() => import('@/components/Footer'))

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
