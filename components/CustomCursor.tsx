"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        // Hide native cursor
        document.body.style.cursor = 'none';

        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if we are hovering over an interactive element
            if (
                target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'button' ||
                target.closest('a') ||
                target.closest('button') ||
                target.classList.contains('cursor-pointer') ||
                target.getAttribute('role') === 'button'
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, []);

    return (
        <div
            className="fixed top-0 left-0 pointer-events-none z-[99999]"
            style={{
                transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
            }}
        >
            <img
                src="/sharingan_cursor.png"
                alt=""
                className={`w-7 h-7 select-none drop-shadow-[0_0_8px_rgba(220,20,60,0.8)] animate-[spin_2s_linear_infinite] transition-transform duration-150 ease-out ${isHovering ? 'scale-125' : 'scale-100'
                    }`}
            />
        </div>
    );
}
