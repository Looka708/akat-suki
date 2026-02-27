import Navbar from '@/components/Navbar'
import dynamic from 'next/dynamic'

const PlayerRoster = dynamic(() => import('@/components/PlayerRoster'))
const Footer = dynamic(() => import('@/components/Footer'))

export default function RosterPage() {
 return (
 <main className="min-h-screen bg-transparent text-white">
 <Navbar />
 <div className="pt-20">
 <PlayerRoster />
 </div>
 <Footer />
 </main>
 )
}
