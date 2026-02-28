'use client'

import { useState, useRef, useEffect } from 'react'
import anime from 'animejs'
import toast from 'react-hot-toast'

export default function Newsletter() {
    const sectionRef = useRef<HTMLElement>(null)
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        anime({
                            targets: '.newsletter-content',
                            translateY: [40, 0],
                            opacity: [0, 1],
                            duration: 1000,
                            easing: 'easeOutQuad',
                        })
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.2 }
        )

        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            setErrorMessage('Email is required')
            return
        }

        if (!validateEmail(email)) {
            setErrorMessage('Please enter a valid email address')
            return
        }

        setIsSubmitting(true)
        setStatus('idle')
        setErrorMessage('')

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to subscribe')
            }

            toast.success('Successfully subscribed! Check your inbox for confirmation.')
            setStatus('success')
            setEmail('')

            // Reset success message after 5 seconds
            setTimeout(() => setStatus('idle'), 5000)
        } catch (error: any) {
            console.error('Subscription error:', error)
            toast.error(error.message || 'Failed to subscribe. Please try again.')
            setStatus('error')
            setErrorMessage(error.message || 'Failed to subscribe. Please try again.')

            // Reset error message after 5 seconds
            setTimeout(() => {
                setStatus('idle')
                setErrorMessage('')
            }, 5000)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="py-20 relative bg-[#050505] border-y border-white/5">
            <div className="max-w-4xl mx-auto px-6">
                <div className="relative glass-panel rounded-xl p-8 md:p-12 overflow-hidden border-t border-[#dc143c]/30">
                    {/* Background Effect */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#dc143c]/10 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#dc143c]/10 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#dc143c]/10 border border-[#dc143c]/30 rounded-full mb-4 ">
                                <svg className="w-4 h-4 text-[#dc143c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-[#dc143c] text-[10px] font-bold tracking-widest uppercase ">
                                    Stay Updated
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-white uppercase">
                                JOIN THE NEWSLETTER
                            </h2>
                            <p className="text-gray-400 text-sm max-w-xl mx-auto font-rajdhani tracking-wide">
                                Get exclusive updates on tournaments, player announcements, and behind-the-scenes content delivered straight to your inbox.
                            </p>
                        </div>

                        {/* Newsletter Form */}
                        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <label htmlFor="newsletter-email" className="sr-only">
                                        Email Address
                                    </label>
                                    <input
                                        id="newsletter-email"
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value)
                                            setErrorMessage('')
                                        }}
                                        disabled={isSubmitting}
                                        className={`w-full px-5 py-3 bg-[#0a0e1a]/50 border text-white placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm disabled:opacity-50 rounded-lg font-mono ${errorMessage
                                            ? 'border-red-500 focus:border-red-500 '
                                            : 'border-[#dc143c]/30 focus:border-[#dc143c] focus:'
                                            }`}
                                        aria-invalid={!!errorMessage}
                                        aria-describedby={errorMessage ? 'newsletter-error' : undefined}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-[#dc143c]/20 border border-[#dc143c]/50 text-[#dc143c] font-bold tracking-[0.2em] hover:bg-[#dc143c] hover:text-[#0a0e1a] hover: transition-all duration-300 uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap rounded-lg"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        'Subscribe'
                                    )}
                                </button>
                            </div>

                            {/* Error Message */}
                            {errorMessage && (
                                <p id="newsletter-error" className="text-red-400 text-xs mt-3 font-mono text-center" role="alert">
                                    {errorMessage}
                                </p>
                            )}

                            {/* Status Messages */}
                            {status === 'success' && (
                                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg " role="alert">
                                    <p className="text-green-400 text-sm text-center font-mono flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Successfully subscribed! Check your inbox for confirmation.</span>
                                    </p>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg " role="alert">
                                    <p className="text-red-400 text-sm text-center font-mono flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span>{errorMessage || 'Something went wrong. Please try again.'}</span>
                                    </p>
                                </div>
                            )}

                            {/* Privacy Notice */}
                            <p className="text-[10px] text-gray-500 text-center mt-5 font-mono uppercase tracking-widest">
                                By subscribing, you agree to our{' '}
                                <a href="#" className="text-white hover:text-[#dc143c] underline decoration-white/30 hover:decoration-[#dc143c] transition-colors">
                                    Privacy Policy
                                </a>
                                . Unsubscribe anytime.
                            </p>
                        </form>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10">
                            <div className="text-center group">
                                <div className="text-3xl font-black text-white mb-2 group-hover:text-[#dc143c] transition-colors tabular-nums">5,000+</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Subscribers</div>
                            </div>
                            <div className="text-center group">
                                <div className="text-3xl font-black text-white mb-2 group-hover:text-[#dc143c] transition-colors">Weekly</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Updates</div>
                            </div>
                            <div className="text-center group">
                                <div className="text-3xl font-black text-[#dc143c] mb-2 ">Archive</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-mono">Access</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
