'use client'

import { useEffect, useRef } from 'react'

export default function BackgroundEffects() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        // Particle class for red lines
        class Particle {
            x: number
            y: number
            speed: number
            length: number
            opacity: number
            width: number

            constructor() {
                this.x = Math.random() * canvas!.width
                this.y = canvas!.height + Math.random() * 100
                this.speed = 1 + Math.random() * 3
                this.length = 20 + Math.random() * 80
                this.opacity = 0.3 + Math.random() * 0.7
                this.width = 1 + Math.random() * 2
            }

            update() {
                this.y -= this.speed

                // Reset when particle goes off screen (Top)
                if (this.y + this.length < 0) {
                    this.y = canvas!.height + Math.random() * 100
                    this.x = Math.random() * canvas!.width
                    this.speed = 1 + Math.random() * 3
                    this.length = 20 + Math.random() * 80
                    this.opacity = 0.3 + Math.random() * 0.7
                }

                // Reset when particle goes off screen (Bottom)
                if (this.y > canvas!.height + 200) {
                    this.y = -this.length - Math.random() * 100
                    this.x = Math.random() * canvas!.width
                }
            }


            draw() {
                if (!ctx || !canvas) return

                const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y - this.length)
                gradient.addColorStop(0, `rgba(220, 20, 60, 0)`)
                gradient.addColorStop(0.5, `rgba(220, 20, 60, ${this.opacity})`)
                gradient.addColorStop(1, `rgba(255, 50, 100, ${this.opacity * 0.5})`)

                ctx.strokeStyle = gradient
                ctx.lineWidth = this.width
                ctx.beginPath()
                ctx.moveTo(this.x, this.y)
                ctx.lineTo(this.x, this.y - this.length)
                ctx.stroke()
            }
        }

        // Create particles
        const particles: Particle[] = []
        const particleCount = 30

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle())
        }

        // Scroll tracking
        let lastScrollY = window.scrollY
        let scrollVelocity = 0
        let targetScrollVelocity = 0

        const handleScroll = () => {
            const currentScrollY = window.scrollY
            targetScrollVelocity = currentScrollY - lastScrollY
            lastScrollY = currentScrollY
        }
        window.addEventListener('scroll', handleScroll, { passive: true })

        // Animation loop
        let animationFrameId: number

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Smooth scroll velocity
            scrollVelocity += (targetScrollVelocity - scrollVelocity) * 0.1
            targetScrollVelocity *= 0.9 // Friction for the target

            particles.forEach((particle) => {
                // Apply scroll velocity to particle movement
                // When scrolling down (positive velocity), lines move UP faster
                particle.y -= scrollVelocity * 0.5
                particle.update()
                particle.draw()
            })

            animationFrameId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            window.removeEventListener('scroll', handleScroll)
            cancelAnimationFrame(animationFrameId)
        }

    }, [])

    return (
        <>
            {/* Red Gradient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Radial gradients */}
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#dc143c] rounded-full blur-[150px] opacity-10 animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#dc143c] rounded-full blur-[120px] opacity-15 animate-pulse-slower"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-[#dc143c]/5 to-transparent rounded-full blur-[100px]"></div>

                {/* Vertical gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60"></div>

                {/* Diagonal gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#dc143c]/5 via-transparent to-transparent"></div>
            </div>

            {/* Animated Red Lines Canvas */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 pointer-events-none z-[1]"
                style={{ mixBlendMode: 'screen' }}
            />

            {/* Grain Overlay */}
            <div className="grain"></div>
        </>
    )
}
