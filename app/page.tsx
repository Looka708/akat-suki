import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Mission from '@/components/Mission'
import Tournaments from '@/components/Tournaments'
import OperationalExcellence from '@/components/OperationalExcellence'
import PlayerRoster from '@/components/PlayerRoster'
import JoinTeam from '@/components/JoinTeam'
import Newsletter from '@/components/Newsletter'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
    return (
        <main id="main-content">
            <Navbar />
            <Hero />
            <Mission />
            <Tournaments />
            <OperationalExcellence />
            <PlayerRoster />
            <JoinTeam />
            <Newsletter />
            <Contact />
            <Footer />
        </main>
    )
}
