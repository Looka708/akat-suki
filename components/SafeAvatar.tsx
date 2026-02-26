'use client'

import Image from 'next/image'
import { useState } from 'react'

interface SafeAvatarProps {
    src: string | null | undefined
    alt: string
    size?: number
    className?: string
    fallbackName?: string
    rounded?: 'full' | 'sm' | 'none'
    quality?: number
}

export default function SafeAvatar({
    src,
    alt,
    size = 32,
    className = '',
    fallbackName = 'TBD',
    rounded = 'full',
    quality = 75
}: SafeAvatarProps) {
    const [error, setError] = useState(false)

    // Check if the URL is valid or is a raw hash
    const isValidUrl = (url: string) => {
        try {
            const parsed = new URL(url)
            return parsed.protocol === 'http:' || parsed.protocol === 'https:'
        } catch {
            return false
        }
    }

    const resolvedSrc = src && isValidUrl(src) ? src : null

    const roundClass = rounded === 'full' ? 'rounded-full' : rounded === 'sm' ? 'rounded-sm' : ''

    if (!resolvedSrc || error) {
        // Fallback to initials
        const initial = fallbackName.charAt(0).toUpperCase() || '?'
        return (
            <div
                className={`flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-500 font-rajdhani font-bold flex-shrink-0 ${roundClass} ${className}`}
                style={{ width: size, height: size }}
            >
                <span style={{ fontSize: `${Math.max(10, size * 0.4)}px` }}>{initial}</span>
            </div>
        )
    }

    return (
        <div className={`relative flex-shrink-0 overflow-hidden ${roundClass} ${className}`} style={{ width: size, height: size }}>
            <Image
                src={resolvedSrc}
                alt={alt}
                fill
                className="object-cover"
                sizes={`${size}px`}
                quality={quality}
                onError={() => setError(true)}
                unoptimized={resolvedSrc.includes('twitch.tv') || resolvedSrc.includes('discordapp.com')}
            />
        </div>
    )
}
