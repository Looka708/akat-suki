import Navbar from '@/components/Navbar'
import dynamic from 'next/dynamic'

const JoinTeam = dynamic(() => import('@/components/JoinTeam'))
const Footer = dynamic(() => import('@/components/Footer'))

export default function JoinUsPage() {
 return (
 <main className="min-h-screen bg-transparent text-white">
 <Navbar />
 <div className="pt-20">
 <JoinTeam />
 </div>
 <Footer />
 </main>
 )
}
