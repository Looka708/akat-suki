'use client'

import { useAuth } from './AuthProvider'
import { getDiscordAvatarUrl, formatUsername } from '@/lib/discord-auth'

interface UserAvatarProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showUsername?: boolean
    className?: string
}

export function UserAvatar({
    size = 'md',
    showUsername = false,
    className = '',
}: UserAvatarProps) {
    const { user, isAuthenticated } = useAuth()

    if (!isAuthenticated || !user) {
        return null
    }

    const discordUser = {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar,
    }

    const sizeMap = {
        sm: 32,
        md: 64,
        lg: 128,
        xl: 256,
    }

    const avatarUrl = getDiscordAvatarUrl(user.id, user.avatar)
    const username = formatUsername(user.username, user.discriminator)


    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24',
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {user.avatar ? (
                <img
                    src={avatarUrl}
                    alt={username}
                    className={`${sizeClasses[size]} rounded-full border-2 border-[#5865F2] object-cover`}
                />
            ) : (
                <div className={`${sizeClasses[size]} bg-[#5865F2] rounded-full flex items-center justify-center border-2 border-[#5865F2]`}>
                    <span className="text-white text-sm font-bold">
                        {user.username?.[0]?.toUpperCase()}
                    </span>
                </div>
            )}
            {showUsername && (

                <div>
                    <p className="text-white font-rajdhani font-semibold text-sm">
                        {username}
                    </p>
                    <p className="text-gray-400 text-xs">Discord Verified</p>
                </div>
            )}
        </div>
    )
}
