'use client'

import { useEffect, useRef, useCallback } from 'react'

export default function BackgroundEffects() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number>(0)
    const isVisibleRef = useRef(true)

    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d', { alpha: true })
        if (!ctx) return

        const resizeCanvas = () => {
            const dpr = Math.min(window.devicePixelRatio, 1.5) // Cap DPR for performance
            canvas.width = window.innerWidth * dpr
            canvas.height = window.innerHeight * dpr
            canvas.style.width = `${window.innerWidth}px`
            canvas.style.height = `${window.innerHeight}px`
            ctx.scale(dpr, dpr)
        }
        resizeCanvas()

        let resizeTimer: ReturnType<typeof setTimeout>
        const debouncedResize = () => {
            clearTimeout(resizeTimer)
            resizeTimer = setTimeout(resizeCanvas, 200)
        }
        window.addEventListener('resize', debouncedResize, { passive: true })

        // Fewer particles for better performance
        const PARTICLE_COUNT = 12
        const particles: { x: number; y: number; speed: number; length: number; opacity: number; width: number }[] = []
        const w = window.innerWidth
        const h = window.innerHeight

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * w,
                y: h + Math.random() * 100,
                speed: 0.5 + Math.random() * 1.5,
                length: 30 + Math.random() * 60,
                opacity: 0.15 + Math.random() * 0.4,
                width: 1 + Math.random(),
            })
        }

        let lastTime = 0
        const TARGET_FPS = 30 // Cap at 30fps instead of 60
        const FRAME_TIME = 1000 / TARGET_FPS

        const animate = (timestamp: number) => {
            if (!isVisibleRef.current) {
                animationRef.current = requestAnimationFrame(animate)
                return
            }

            const delta = timestamp - lastTime
            if (delta < FRAME_TIME) {
                animationRef.current = requestAnimationFrame(animate)
                return
            }
            lastTime = timestamp

            const cw = window.innerWidth
            const ch = window.innerHeight
            ctx.clearRect(0, 0, cw, ch)

            for (const p of particles) {
                p.y -= p.speed
                if (p.y + p.length < 0) {
                    p.y = ch + Math.random() * 50
                    p.x = Math.random() * cw
                }

                ctx.strokeStyle = `rgba(220, 20, 60, ${p.opacity})`
                ctx.lineWidth = p.width
                ctx.beginPath()
                ctx.moveTo(p.x, p.y)
                ctx.lineTo(p.x, p.y - p.length)
                ctx.stroke()
            }

            animationRef.current = requestAnimationFrame(animate)
        }

        animationRef.current = requestAnimationFrame(animate)

        // Pause when tab is not visible
        const handleVisibility = () => {
            isVisibleRef.current = !document.hidden
        }
        document.addEventListener('visibilitychange', handleVisibility)

        return () => {
            window.removeEventListener('resize', debouncedResize)
            document.removeEventListener('visibilitychange', handleVisibility)
            cancelAnimationFrame(animationRef.current)
            clearTimeout(resizeTimer)
        }
    }, [])

    useEffect(() => {
        const cleanup = initCanvas()
        return cleanup
    }, [initCanvas])

    return (
        <>
            {/* Static gradients — no blur, just opacity for cheaper GPU rendering */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-[#dc143c]/[0.03] via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#dc143c]/[0.02] via-transparent to-transparent"></div>
            </div>

            {/* Canvas for animated lines */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 pointer-events-none z-[1]"
                style={{ mixBlendMode: 'screen' }}
            />
        </>
    )
}
