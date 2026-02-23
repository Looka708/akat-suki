'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewTournamentPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        game: 'Dota 2',
        startDate: '',
        slots: 16,
        entryFee: 0,
        prizePool: 0,
        currency: 'USD'
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch('/api/tournaments/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create tournament')
            }

            // Redirect back to tournaments list
            router.push('/admin/tournaments')
            router.refresh()
        } catch (err: any) {
            console.error('Creation error:', err)
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/tournaments"
                    className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-sm transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-3xl font-rajdhani font-bold text-white tracking-wide">
                        Create Tournament
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Configure a new competition
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-sm text-red-500 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/10 rounded-sm p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                            Tournament Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#dc143c] transition-colors placeholder-gray-600 text-sm"
                            placeholder="e.g., AKATSUKI Spring Major 2026"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                            Game *
                        </label>
                        <select
                            name="game"
                            value={formData.game}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#dc143c] transition-colors text-sm appearance-none cursor-pointer"
                        >
                            <option value="Dota 2" className="bg-[#050505]">Dota 2</option>
                            <option value="Valorant" className="bg-[#050505]">Valorant</option>
                            <option value="CS2" className="bg-[#050505]">CS2</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                            Start Date & Time *
                        </label>
                        <input
                            type="datetime-local"
                            name="startDate"
                            required
                            value={formData.startDate}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#dc143c] transition-colors text-sm"
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                            Max Slots *
                        </label>
                        <input
                            type="number"
                            name="slots"
                            required
                            min="2"
                            value={formData.slots}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#dc143c] transition-colors placeholder-gray-600 text-sm"
                            placeholder="e.g. 16"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                            Currency *
                        </label>
                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#dc143c] transition-colors text-sm appearance-none cursor-pointer"
                        >
                            <option value="USD" className="bg-[#050505]">USD - US Dollar</option>
                            <option value="PKR" className="bg-[#050505]">PKR - Pakistani Rupee</option>
                            <option value="EUR" className="bg-[#050505]">EUR - Euro</option>
                            <option value="GBP" className="bg-[#050505]">GBP - British Pound</option>
                            <option value="INR" className="bg-[#050505]">INR - Indian Rupee</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                            Entry Fee ({formData.currency}) *
                        </label>
                        <input
                            type="number"
                            name="entryFee"
                            min="0"
                            step="0.01"
                            required
                            value={formData.entryFee}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#dc143c] transition-colors placeholder-gray-600 text-sm"
                            placeholder="0.00 for free entry"
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                            Prize Pool ({formData.currency}) *
                        </label>
                        <input
                            type="number"
                            name="prizePool"
                            min="0"
                            step="0.01"
                            required
                            value={formData.prizePool}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#dc143c] transition-colors placeholder-gray-600 text-sm"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className="pt-6 flex justify-end border-t border-white/10">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-[#dc143c] text-white font-rajdhani font-bold tracking-wider hover:bg-white hover:text-black transition-all duration-300 rounded-[2px] uppercase disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Tournament'}
                    </button>
                </div>
            </form>
        </div>
    )
}
