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
                // Paleta de marca (regra 60-30-10: neutros na base, branco no texto, cores só em ~10%).
                // primary  = AÇÃO: botões, play, item ativo, foco. Texto branco sobre primary-600.
                // secondary = DESTAQUE/INFO: rótulos, ícones, métricas, hover de cards informativos.
                //             Nunca texto branco sobre laranja (contraste baixo); use texto preto.
                primary: {
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                },
                secondary: {
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
