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
                blue: {
                    bright: '#3a86ff'
                }
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                rajdhani: ['Rajdhani', 'sans-serif'],
                archivo: ['Archivo Black', 'sans-serif'],
            },
        },
    },
    plugins: [],

}
