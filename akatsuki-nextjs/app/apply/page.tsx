'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { sendApplicationSubmittedNotification } from '@/lib/discord-notifications'
import { useAuth } from '@/components/AuthProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function ApplyPage() {
    const { user } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        discord: '',
        position: '',
        experience: '',
        why: '',
        availability: '',
    })

    // Pre-fill form data from authenticated user
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || user.username,
                email: prev.email || user.email || '',
                discord: prev.discord || user.username + (user.discriminator !== '0' ? `#${user.discriminator}` : ''),
            }))
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch('/api/applications/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: formData.name,
                    email: formData.email,
                    discord_username: formData.discord,
                    position: formData.position,
                    experience: formData.experience,
                    why_join: formData.why,
                    availability: formData.availability,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit application')
            }

            setIsSubmitted(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (err: any) {
            console.error('Submission error:', err)
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    if (isSubmitted) {
        return (
            <ProtectedRoute>
                <main className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
                    <div className="max-w-md w-full text-center space-y-8 py-20">
                        <div className="w-20 h-20 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl font-rajdhani font-bold text-white uppercase tracking-wider">Application Received</h1>
                            <p className="text-gray-400">
                                Thank you for your interest in joining <span className="text-[#dc143c]">AKATSUKI</span>.
                                Our team will review your application and get back to you via email or Discord soon.
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="inline-block px-10 py-4 bg-[#dc143c] text-white font-rajdhani font-bold tracking-widest hover:bg-white hover:text-black transition-all duration-300 rounded-[2px] uppercase"
                        >
                            Back to Home
                        </Link>
                    </div>
                </main>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[#050505] pt-20">
                {/* Back Button */}
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Home</span>
                    </Link>
                </div>

                {/* Application Form */}
                <div className="max-w-4xl mx-auto px-6 pb-32">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#dc143c]"></div>
                            <span className="text-[#dc143c] tracking-[0.3em] text-xs font-semibold uppercase">
                                Join AKATSUKI
                            </span>
                            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#dc143c]"></div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-rajdhani font-bold tracking-tight mb-4 text-white uppercase">
                            APPLICATION FORM
                        </h1>
                        <p className="text-gray-400 text-sm max-w-2xl mx-auto">
                            Fill out the form below to apply for a position with AKATSUKI. We review all applications carefully and will get back to you within 7 business days.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-sm text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Information */}
                        <div className="bg-white/[0.02] border border-white/10 rounded-sm p-8">
                            <h2 className="text-2xl font-rajdhani font-bold text-white mb-6">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#dc143c] transition-colors placeholder-gray-600 text-sm disabled:opacity-50"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#dc143c] transition-colors placeholder-gray-600 text-sm disabled:opacity-50"
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                                        Discord Username *
                                    </label>
                                    <input
                                        type="text"
                                        name="discord"
                                        required
                                        value={formData.discord}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#dc143c] transition-colors placeholder-gray-600 text-sm disabled:opacity-50"
                                        placeholder="username#0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                                        Position Applying For *
                                    </label>
                                    <select
                                        name="position"
                                        required
                                        value={formData.position}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#dc143c] transition-colors text-sm appearance-none cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="" className="bg-black">Select a position</option>
                                        <option value="Staff" className="bg-black">Staff</option>
                                        <option value="Moderator" className="bg-black">Moderator</option>
                                        <option value="Content Creator" className="bg-black">Content Creator</option>
                                        <option value="Analyst" className="bg-black">Analyst</option>
                                        <option value="Player" className="bg-black">Player</option>
                                        <option value="Other" className="bg-black">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Experience & Qualifications */}
                        <div className="bg-white/[0.02] border border-white/10 rounded-sm p-8">
                            <h2 className="text-2xl font-rajdhani font-bold text-white mb-6">Experience & Qualifications</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                                        Relevant Experience *
                                    </label>
                                    <textarea
                                        name="experience"
                                        required
                                        value={formData.experience}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        rows={4}
                                        className="w-full bg-transparent border border-white/20 rounded-sm p-4 text-white focus:outline-none focus:border-[#dc143c] transition-colors placeholder-gray-600 text-sm resize-none disabled:opacity-50"
                                        placeholder="Tell us about your relevant experience, skills, and qualifications..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                                        Why do you want to join AKATSUKI? *
                                    </label>
                                    <textarea
                                        name="why"
                                        required
                                        value={formData.why}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        rows={4}
                                        className="w-full bg-transparent border border-white/20 rounded-sm p-4 text-white focus:outline-none focus:border-[#dc143c] transition-colors placeholder-gray-600 text-sm resize-none disabled:opacity-50"
                                        placeholder="What motivates you to join our team?"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">
                                        Availability *
                                    </label>
                                    <input
                                        type="text"
                                        name="availability"
                                        required
                                        value={formData.availability}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-[#dc143c] transition-colors placeholder-gray-600 text-sm disabled:opacity-50"
                                        placeholder="e.g., 20 hours/week, weekends, flexible"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/"
                                className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/20 text-white font-rajdhani font-bold tracking-wider hover:bg-white/10 transition-all duration-300 rounded-[2px] uppercase text-center"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-10 py-4 bg-[#dc143c] text-white font-rajdhani font-bold tracking-wider hover:bg-white hover:text-black transition-all duration-300 rounded-[2px] uppercase disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    'Submit Application'
                                )}
                            </button>
                        </div>

                        <p className="text-center text-xs text-gray-500 mt-8">
                            By submitting this application, you agree to our terms and conditions. All information provided will be kept confidential.
                        </p>
                    </form>
                </div>
            </main>
        </ProtectedRoute>
    )
}


