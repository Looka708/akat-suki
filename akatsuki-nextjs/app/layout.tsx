import './globals.css'
import type { Metadata } from 'next'
import CustomCursor from '@/components/CustomCursor'
import BackgroundEffects from '@/components/BackgroundEffects'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata: Metadata = {
    title: {
        default: 'AKATSUKI | Elite Professional Esports Organization',
        template: '%s | AKATSUKI'
    },
    description: 'AKATSUKI is a premier professional esports organization dedicated to excellence in competitive gaming. We cultivate elite talent, dominate global tournaments, and foster a community of high-performance athletes across multiple titles.',
    keywords: ['AKATSUKI', 'Esports', 'Pro Gaming', 'Competitive Gaming', 'Tournament', 'Gaming Organization', 'Elite Athletes'],
    authors: [{ name: 'AKATSUKI Esports' }],
    creator: 'AKATSUKI Esports',
    publisher: 'AKATSUKI Esports',
    themeColor: '#dc143c',
    icons: {
        icon: '/favicon.svg',
    },
}



export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <BackgroundEffects />
                    <CustomCursor />
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
