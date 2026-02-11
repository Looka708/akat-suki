'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null)
    const outlineRef = useRef<HTMLDivElement>(null)
    const [isHovering, setIsHovering] = useState(false)
    const [isClicked, setIsClicked] = useState(false)

    useEffect(() => {
        const dot = dotRef.current
        const outline = outlineRef.current
        if (!dot || !outline) return

        let mouseX = 0
        let mouseY = 0
        let outlineX = 0
        let outlineY = 0

        const moveMouse = (e: MouseEvent) => {
            mouseX = e.clientX
            mouseY = e.clientY

            // Immediate update for dot with centering
            dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`

            // Ensure visible when moving
            dot.style.opacity = '1'
            outline.style.opacity = '1'
        }

        const animate = () => {
            // Easing for outline (delayed follow effect)
            const easing = 0.15
            outlineX += (mouseX - outlineX) * easing
            outlineY += (mouseY - outlineY) * easing

            if (outline) {
                // Centering for outline
                outline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`
            }

            requestAnimationFrame(animate)
        }

        const handleMouseLeave = () => {
            dot.style.opacity = '0'
            outline.style.opacity = '0'
        }

        const handleMouseEnter = () => {
            dot.style.opacity = '1'
            outline.style.opacity = '1'
        }

        // Handle hover state using event delegation
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const isInteractive = target.closest('a, button, input, select, .tilt-card, [role="button"]')
            if (isInteractive) {
                setIsHovering(true)
            }
        }

        const handleMouseOut = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const isInteractive = target.closest('a, button, input, select, .tilt-card, [role="button"]')
            if (isInteractive) {
                setIsHovering(false)
            }
        }

        const handleMouseDown = () => setIsClicked(true)
        const handleMouseUp = () => setIsClicked(false)

        window.addEventListener('mousemove', moveMouse)
        window.addEventListener('mouseover', handleMouseOver)
        window.addEventListener('mouseout', handleMouseOut)
        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp)
        window.addEventListener('mouseleave', handleMouseLeave)
        window.addEventListener('mouseenter', handleMouseEnter)

        const animationId = requestAnimationFrame(animate)

        return () => {
            window.removeEventListener('mousemove', moveMouse)
            window.removeEventListener('mouseover', handleMouseOver)
            window.removeEventListener('mouseout', handleMouseOut)
            window.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('mouseleave', handleMouseLeave)
            window.removeEventListener('mouseenter', handleMouseEnter)
            cancelAnimationFrame(animationId)
        }
    }, [])

    return (
        <>
            <div
                ref={dotRef}
                className={`cursor-dot hidden md:block ${isClicked ? 'scale-75' : ''}`}
                style={{
                    backgroundColor: isHovering ? '#dc143c' : 'white',
                    transition: 'background-color 0.2s, transform 0.1s',
                }}
            />
            <div
                ref={outlineRef}
                className="cursor-outline hidden md:block"
                style={{
                    width: isHovering ? '48px' : '32px',
                    height: isHovering ? '48px' : '32px',
                    borderColor: isHovering ? '#dc143c' : isClicked ? 'white' : 'rgba(255,255,255,0.2)',
                    backgroundColor: isClicked ? 'rgba(220, 20, 60, 0.1)' : 'transparent',
                    transition: 'width 0.2s, height 0.2s, border-color 0.2s, background-color 0.2s',
                }}
            />
        </>
    )
}

