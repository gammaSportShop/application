import plugin from 'tailwindcss/plugin'

export default {
	content: [
		'./index.html',
		'./src/**/*.{ts,tsx}'
	],
	safelist: [
		// Brand color squares
		'bg-red-500','bg-blue-500','bg-orange-500','bg-yellow-400','bg-green-500','bg-purple-500',
		// Color swatches
		'bg-black','bg-white','border','border-gray-300','bg-pink-500','bg-gray-500',
		// Category chip classes from meta
		'bg-green-500/20','text-green-400','border-green-500/40',
		'bg-blue-600/20','text-blue-400','border-blue-600/40',
		'bg-purple-500/20','text-purple-400','border-purple-500/40',
		'bg-pink-500/20','text-pink-400','border-pink-500/40',
		'bg-yellow-500/20','text-yellow-400','border-yellow-500/40',
		'bg-primary/20','text-primary','border-primary/40',
		// Tag classes from meta
		'bg-red-600/20','border-red-600/40','text-red-400','border-red-500/40',
		'bg-orange-500/20','text-orange-400','border-orange-500/40',
		'bg-purple-500/20','text-purple-400','border-purple-500/40',
		'bg-blue-500/20','text-blue-400','border-blue-500/40',
		'bg-green-500/20','text-green-400','border-green-500/40',
		'bg-pink-500/20','text-pink-400','border-pink-500/40'
	],
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem'
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1440px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Roboto Mono', 'Inter', 'system-ui', 'sans-serif']
			},
			colors: {
				primary: 'rgb(var(--c-primary) / <alpha-value>)',
				bg: {
					DEFAULT: 'rgb(var(--c-bg) / <alpha-value>)',
					alt: 'rgb(var(--c-bg-alt) / <alpha-value>)',
					inner: 'rgb(var(--c-bg-inner) / <alpha-value>)'
				},
				border: {
					DEFAULT: 'rgb(var(--c-border) / <alpha-value>)',
					light: 'rgb(var(--c-border-light) / <alpha-value>)',
					accent: 'rgb(var(--c-border-accent) / <alpha-value>)'
				},
				text: {
					DEFAULT: 'rgb(var(--c-text) / <alpha-value>)',
					alt: 'rgb(var(--c-text-alt) / <alpha-value>)',
					muted: 'rgb(var(--c-text-muted) / <alpha-value>)'
				},
				negative: 'rgb(var(--c-negative) / <alpha-value>)',
				positive: 'rgb(var(--c-positive) / <alpha-value>)'
			}
		}
	},
	plugins: [
		plugin(function ({ addBase, addComponents, addUtilities, theme }) {
			addBase({
				':root': {
                    '--c-primary': '0 148 230',
					'--c-bg': '10 10 10',
					'--c-bg-alt': '26 26 26',
					'--c-bg-inner': '30 30 30',
					'--c-border': '44 44 44',
					'--c-border-light': '75 85 99',
                    '--c-border-accent': '0 148 230',
					'--c-text': '230 237 243',
					'--c-text-alt': '125 181 144',
					'--c-text-muted': '156 163 175',
					'--c-negative': '237 15 78',
					'--c-positive': '50 232 117',
					'--radius-sm': '6px',
					'--radius-md': '8px',
					'--radius-lg': '12px',
					'--radius-xl': '16px',
					'--text-xs': '0.75rem',
					'--text-sm': '0.875rem',
					'--text-base': '1rem',
					'--text-lg': '1.125rem',
					'--text-xl': '1.25rem',
					'--text-2xl': '1.5rem',
					'--text-3xl': '1.875rem',
					'--text-4xl': '2.25rem',
					'--space-xs': '0.25rem',
					'--space-sm': '0.5rem',
					'--space-md': '1rem',
					'--space-lg': '1.5rem',
					'--space-xl': '2rem',
				}
			})
		})
	]
}
