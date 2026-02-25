'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null)
    const outlineRef = useRef<HTMLDivElement>(null)
    const posRef = useRef({ mouseX: 0, mouseY: 0, outlineX: 0, outlineY: 0 })
    const rafRef = useRef<number>(0)
    const isVisibleRef = useRef(false)

    useEffect(() => {
        // Only show custom cursor on desktop with pointer device
        if (typeof window === 'undefined') return
        const hasPointer = window.matchMedia('(pointer: fine)').matches
        if (!hasPointer) return

        const dot = dotRef.current
        const outline = outlineRef.current
        if (!dot || !outline) return

        const pos = posRef.current

        const moveMouse = (e: MouseEvent) => {
            pos.mouseX = e.clientX
            pos.mouseY = e.clientY
            dot.style.transform = `translate3d(${pos.mouseX}px, ${pos.mouseY}px, 0) translate(-50%, -50%)`

            if (!isVisibleRef.current) {
                isVisibleRef.current = true
                dot.style.opacity = '1'
                outline.style.opacity = '1'
            }
        }

        // Use a single throttled rAF loop
        let lastFrame = 0
        const animate = (timestamp: number) => {
            // Throttle to ~30fps
            if (timestamp - lastFrame > 33) {
                lastFrame = timestamp
                pos.outlineX += (pos.mouseX - pos.outlineX) * 0.15
                pos.outlineY += (pos.mouseY - pos.outlineY) * 0.15
                outline.style.transform = `translate3d(${pos.outlineX}px, ${pos.outlineY}px, 0) translate(-50%, -50%)`
            }
            rafRef.current = requestAnimationFrame(animate)
        }

        const handleLeave = () => {
            isVisibleRef.current = false
            dot.style.opacity = '0'
            outline.style.opacity = '0'
        }

        window.addEventListener('mousemove', moveMouse, { passive: true })
        document.addEventListener('mouseleave', handleLeave)
        rafRef.current = requestAnimationFrame(animate)

        return () => {
            window.removeEventListener('mousemove', moveMouse)
            document.removeEventListener('mouseleave', handleLeave)
            cancelAnimationFrame(rafRef.current)
        }
    }, [])

    return (
        <>
            <div
                ref={dotRef}
                className="cursor-dot hidden md:block"
                style={{ opacity: 0, transition: 'opacity 0.15s' }}
            />
            <div
                ref={outlineRef}
                className="cursor-outline hidden md:block"
                style={{ opacity: 0, transition: 'opacity 0.15s' }}
            />
        </>
    )
}
