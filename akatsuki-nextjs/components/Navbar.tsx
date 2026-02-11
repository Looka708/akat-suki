'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import anime from 'animejs'
import { useAuth } from './AuthProvider'
import { DiscordLoginButton } from './DiscordLoginButton'
import { UserAvatar } from './UserAvatar'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { user, isAuthenticated, logout } = useAuth()

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        // Handle escape key to close menu
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && mobileMenuOpen) {
                setMobileMenuOpen(false)
            }
        }

        // Prevent body scroll when menu is open
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden'
            window.addEventListener('keydown', handleEscape)
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            window.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [mobileMenuOpen])

    useEffect(() => {
        // Animate menu items when menu opens
        if (mobileMenuOpen) {
            anime({
                targets: '.mobile-menu-item',
                translateX: [-50, 0],
                opacity: [0, 1],
                duration: 600,
                delay: anime.stagger(100),
                easing: 'easeOutQuad',
            })
        }
    }, [mobileMenuOpen])

    const navLinks = [
        { href: '#mission', label: 'ORGANIZATION' },
        { href: '#tournaments', label: 'TOURNAMENTS' },
        { href: '#roster', label: 'ROSTER' },
        { href: '#join-team', label: 'JOIN US' },
        { href: '#contact', label: 'CONTACT' },
    ]

    const handleLinkClick = () => {
        setMobileMenuOpen(false)
    }

    return (
        <>
            {/* Skip Navigation Link for Accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-[#dc143c] focus:text-white focus:font-bold focus:rounded-sm focus:shadow-lg"
            >
                Skip to main content
            </a>

            <nav
                className={`fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl transition-all duration-300 ${scrolled ? 'bg-black/80' : 'bg-black/50'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-6 h-6 bg-[#dc143c] flex items-center justify-center rounded-[2px]">
                            <span className="text-white font-bold text-[10px]">A</span>
                        </div>
                        <span className="font-rajdhani font-semibold text-lg tracking-wide text-white uppercase">
                            AKATSUKI
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.slice(0, 4).map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-xs font-medium text-gray-400 hover:text-white transition-colors tracking-widest"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                {user?.isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#dc143c]/10 border border-[#dc143c]/30 text-[#dc143c] text-[10px] font-bold rounded-[2px] hover:bg-[#dc143c]/20 transition-colors tracking-widest"
                                    >
                                        ADMIN PANEL
                                    </Link>
                                )}
                                <div className="group relative">
                                    <UserAvatar size="sm" className="cursor-pointer" />
                                    {/* Dropdown menu */}
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-black border border-white/10 rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-2xl overflow-hidden">
                                        <div className="px-4 py-3 border-b border-white/10">
                                            <p className="text-white text-xs font-bold truncate">{user?.username}</p>
                                            <p className="text-gray-500 text-[10px] truncate">{user?.email}</p>
                                        </div>
                                        {user?.isAdmin && (
                                            <Link href="/admin" className="block px-4 py-2.5 text-[10px] text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-bold tracking-widest">
                                                ADMIN DASHBOARD
                                            </Link>
                                        )}
                                        <Link href="/apply" className="block px-4 py-2.5 text-[10px] text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-bold tracking-widest">
                                            MY APPLICATIONS
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="w-full text-left px-4 py-2.5 text-[10px] text-red-500 hover:text-red-400 hover:bg-red-500/5 transition-colors font-bold tracking-widest border-t border-white/5"
                                        >
                                            LOGOUT
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <DiscordLoginButton size="sm" variant="outline" className="hidden md:inline-flex" />
                        )}

                        <Link
                            href="#contact"
                            className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-white text-black text-xs font-bold rounded-[2px] hover:bg-gray-200 transition-colors tracking-widest"
                        >
                            <span>CONTACT</span>
                        </Link>


                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden w-10 h-10 flex items-center justify-center text-white hover:text-[#dc143c] transition-colors"
                            aria-label="Toggle mobile menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            <div className="relative w-6 h-5 flex flex-col justify-between">
                                <span
                                    className={`block h-0.5 w-full bg-current transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                                        }`}
                                ></span>
                                <span
                                    className={`block h-0.5 w-full bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''
                                        }`}
                                ></span>
                                <span
                                    className={`block h-0.5 w-full bg-current transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                                        }`}
                                ></span>
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setMobileMenuOpen(false)}
            >
                <div
                    className={`absolute inset-0 flex flex-col items-center justify-center transition-transform duration-500 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Mobile Menu Content */}
                    <div className="w-full max-w-md px-8 space-y-8">
                        {/* Navigation Links */}
                        <nav className="space-y-6">
                            {navLinks.map((link, idx) => (
                                <div key={link.href} className="mobile-menu-item opacity-0">
                                    <Link
                                        href={link.href}
                                        onClick={handleLinkClick}
                                        className="block text-3xl font-rajdhani font-bold text-white hover:text-[#dc143c] transition-colors py-2"
                                    >
                                        {link.label}
                                    </Link>
                                    <div className="h-[1px] w-full bg-white/10 mt-2"></div>
                                </div>
                            ))}
                        </nav>

                        {/* Social Links */}
                        <div className="mobile-menu-item opacity-0 pt-8">
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Follow Us</p>
                            <div className="flex gap-6">
                                {['Twitter', 'Instagram', 'Discord', 'YouTube'].map((social) => (
                                    <a
                                        key={social}
                                        href="#"
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {social}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="mobile-menu-item opacity-0">
                            <Link
                                href="/apply"
                                onClick={handleLinkClick}
                                className="block w-full py-4 bg-[#dc143c] text-white text-center font-rajdhani font-bold tracking-wider hover:bg-white hover:text-black transition-all duration-300 rounded-[2px] uppercase"
                            >
                                Join Our Team
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
