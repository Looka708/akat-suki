'use client'

interface StatsCardProps {
    title: string
    value: number | string
    change?: number
    changeLabel?: string
    icon: React.ReactNode
    trend?: 'up' | 'down' | 'neutral'
}

export function StatsCard({
    title,
    value,
    change,
    changeLabel,
    icon,
    trend = 'neutral'
}: StatsCardProps) {
    const trendColors = {
        up: 'text-green-400',
        down: 'text-red-400',
        neutral: 'text-gray-400',
    }

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→',
    }

    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-sm p-6 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-gray-400 text-xs uppercase tracking-widest font-medium">
                        {title}
                    </p>
                    <p className="text-3xl font-rajdhani font-bold text-white mt-2">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    {change !== undefined && (
                        <div className="flex items-center gap-1 mt-2">
                            <span className={`${trendColors[trend]} font-medium`}>
                                {trendIcons[trend]}
                            </span>
                            <span className={`text-sm font-medium ${trendColors[trend]}`}>
                                {Math.abs(change)}%
                            </span>
                            {changeLabel && (
                                <span className="text-gray-500 text-sm">{changeLabel}</span>
                            )}
                        </div>
                    )}
                </div>
                <div className="w-12 h-12 bg-[#dc143c]/10 rounded-full flex items-center justify-center text-[#dc143c] flex-shrink-0 ml-4">
                    {icon}
                </div>
            </div>
        </div>
    )
}
