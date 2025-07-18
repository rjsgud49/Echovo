// ✅ tailwind.config.js (수정 최종본)
module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            boxShadow: {
                'inner-sm': 'inset 0 1px 3px rgba(0, 0, 0, 0.08)',
                'inner-md': 'inset 0 2px 6px rgba(0, 0, 0, 0.12)',
                'inner-lg': 'inset 0 4px 12px rgba(0, 0, 0, 0.15)',
                'glow': '0 0 8px rgba(59, 130, 246, 0.5)', // 파란빛 glow 효과
            },
            colors: {
                primary: '#2563eb',
                secondary: '#64748b',
                'gray-170': '#f8f9fa',
                'overlay-dark': 'rgba(0,0,0,0.4)',
            },
            fontFamily: {
                sans: ['"Noto Sans KR"', 'ui-sans-serif', 'system-ui'],
                display: ['"Nanum Gothic"', 'sans-serif'],
            },
            borderRadius: {
                xl: '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },

        },
    },
    plugins: [
        require('tailwind-scrollbar'),
    ],
};
