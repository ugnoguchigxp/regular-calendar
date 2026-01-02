import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: "class",
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"メイリオ"', "Helvetica", "sans-serif"],
			},
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
					dark: "#003366",
					text: "#BBBBBB",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
					text: "#222222",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
					contrast: "#FFFFFF",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				warning: {
					DEFAULT: "hsl(var(--warning))",
					foreground: "hsl(var(--warning-foreground))",
				},
				success: {
					DEFAULT: "hsl(var(--success))",
					foreground: "hsl(var(--success-foreground))",
				},
				danger: {
					DEFAULT: "#EF5555",
					text: "#000000",
				},
				neutral: {
					DEFAULT: "#9CA3AF",
					text: "#4B5563",
				},
				info: {
					DEFAULT: "#FFFFFF",
					text: "#000000",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
				chart: {
					1: "hsl(var(--chart-1))",
					2: "hsl(var(--chart-2))",
					3: "hsl(var(--chart-3))",
					4: "hsl(var(--chart-4))",
					5: "hsl(var(--chart-5))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "max(0px, calc(var(--radius) - 2px))",
				sm: "max(0px, calc(var(--radius) - 4px))",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"progress-stripes": {
					"0%": { backgroundPosition: "1rem 0" },
					"100%": { backgroundPosition: "0 0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"progress-stripes": "progress-stripes 1s linear infinite",
			},
			height: {
				ui: "var(--ui-component-height)",
			},
			width: {
				ui: "var(--ui-component-height)",
			},
			minHeight: {
				"ui-touch": "var(--ui-touch-target-min)",
			},
			minWidth: {
				"ui-touch": "var(--ui-touch-target-min)",
			},
			padding: {
				ui: "var(--ui-component-padding-x)",
				"ui-x": "var(--ui-component-padding-x)",
				"ui-y": "var(--ui-component-padding-y)",
				"ui-button": "var(--ui-button-padding-x)",
				"ui-button-x": "var(--ui-button-padding-x)",
				"ui-button-y": "var(--ui-button-padding-y)",
				"ui-cell": "var(--ui-table-cell-padding)",
			},
			gap: {
				ui: "var(--ui-gap-base)",
			},
			fontSize: {
				xs: "0.75rem",
				sm: "0.875rem",
				base: "1rem",
				lg: "1.125rem",
				xl: "1.25rem",
				"2xl": "1.5rem",
				"3xl": "1.875rem",
				"4xl": "2.25rem",
				"5xl": "3rem",
				"6xl": "3.75rem",
				"7xl": "4.5rem",
				"8xl": "6rem",
				"9xl": "8rem",
				ui: ["var(--ui-font-size-base)", { lineHeight: "1.5" }],
			},
		},
	},
	plugins: [tailwindcssAnimate],
};
