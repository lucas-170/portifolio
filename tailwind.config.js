/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./public/**/*.html', './public/js/**/*.js'],
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: '#09090b',
                    card: '#121215',
                    border: '#27272a',
                    muted: '#a1a1aa',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
