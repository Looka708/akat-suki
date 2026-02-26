import Navbar from '@/components/Navbar'
import Mission from '@/components/Mission'
import dynamic from 'next/dynamic'

const OperationalExcellence = dynamic(() => import('@/components/OperationalExcellence'))
const Footer = dynamic(() => import('@/components/Footer'))

export default function OrganizationPage() {
    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="pt-20"> {/* Add padding for the fixed navbar */}
                <Mission />
                <OperationalExcellence />
            </div>
            <Footer />
        </main>
    )
}
