import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter, Rajdhani } from 'next/font/google'
import CustomCursor from '@/components/CustomCursor'
import BackgroundEffects from '@/components/BackgroundEffects'
import { AuthProvider } from '@/components/AuthProvider'

const inter = Inter({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600'],
    display: 'swap',
    variable: '--font-inter',
})

const rajdhani = Rajdhani({
    subsets: ['latin'],
    weight: ['500', '600', '700'],
    display: 'swap',
    variable: '--font-rajdhani',
})

export const viewport: Viewport = {
    themeColor: '#dc143c',
    width: 'device-width',
    initialScale: 1,
}

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
    icons: {
        icon: '/favicon.svg',
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://akat-suki.site',
        siteName: 'AKATSUKI Esports',
        title: 'AKATSUKI | Elite Professional Esports Organization',
        description: 'Elite professional esports organization cultivating global talent and dominating high-performance competitive gaming.',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=630',
                width: 1200,
                height: 630,
                alt: 'AKATSUKI Esports Professional Gaming',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AKATSUKI | Elite Professional Esports Organization',
        description: 'Elite professional esports organization cultivating global talent and dominating high-performance competitive gaming.',
        images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=630'],
        creator: '@AkatsukiEsports',
    },
}



export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${inter.variable} ${rajdhani.variable}`}>
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
