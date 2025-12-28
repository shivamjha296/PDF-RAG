/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#3b82f6',
                'primary-hover': '#2563eb',
                'bg-dark': '#0f172a',
                'sidebar-dark': '#1e293b',
            }
        },
    },
    plugins: [],
}
