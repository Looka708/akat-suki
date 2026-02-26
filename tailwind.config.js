/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                crimson: '#dc143c',
                dark: '#050505',
                cyan: {
                    DEFAULT: '#00d4ff',
                    glow: 'rgba(0, 212, 255, 0.5)'
                },
                purple: {
                    DEFAULT: '#9d4edd',
                    glow: 'rgba(157, 78, 221, 0.8)'
                },
                blue: {
                    bright: '#3a86ff'
                }
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                rajdhani: ['Rajdhani', 'sans-serif'],
                archivo: ['Archivo Black', 'sans-serif'],
                orbitron: ['Orbitron', 'sans-serif'],
            },
        },
    },
    plugins: [],

}
