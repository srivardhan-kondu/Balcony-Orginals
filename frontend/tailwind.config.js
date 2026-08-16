/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      /* Height breakpoints. Every measurement in this design was keyed to width,
         so a phone turned on its side — a 390px-tall viewport asked to hold a
         full-screen hero — had nowhere to put the overflow but under the crop.
         These merge with Tailwind's own width breakpoints rather than replacing
         them: `short:` and `shorter:` sit alongside `md:` and `lg:`. */
      screens: {
        short: { raw: "(max-height: 700px)" },
        shorter: { raw: "(max-height: 560px)" },
        /* Below Tailwind's `sm`, for the narrowest phones — the projection
           hero's nav and telemetry each shed a segment here. A named screen
           rather than an arbitrary `min-[420px]:` variant: those do not compile
           in this craco/postcss setup, silently, and the class just vanishes. */
        xs: "420px",
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        serif: ['Marcellus', 'serif'],
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
        telugu: ['"Noto Serif Telugu"', 'serif'],
      },
      colors: {
        // Theme-driven; values live in index.css. `<alpha-value>` is what keeps
        // the opacity modifiers (`text-bone/40`, `bg-ink/85`) working.
        ink: 'rgb(var(--bo-ink) / <alpha-value>)',
        ink2: 'rgb(var(--bo-ink2) / <alpha-value>)',
        ink3: 'rgb(var(--bo-ink3) / <alpha-value>)',
        bone: 'rgb(var(--bo-bone) / <alpha-value>)',
        sand: 'rgb(var(--bo-sand) / <alpha-value>)',
        gold: 'rgb(var(--bo-gold) / <alpha-value>)',
        'gold-hi': 'rgb(var(--bo-gold-hi) / <alpha-value>)',
        terra: 'rgb(var(--bo-terra) / <alpha-value>)',
        mute: 'rgb(var(--bo-mute) / <alpha-value>)',
        dim: 'rgb(var(--bo-dim) / <alpha-value>)',
        line: 'rgb(var(--bo-line) / <alpha-value>)',
        scrim: 'rgb(var(--bo-scrim) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
        },
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        chart: {
          '1': 'hsl(var(--chart-1) / <alpha-value>)',
          '2': 'hsl(var(--chart-2) / <alpha-value>)',
          '3': 'hsl(var(--chart-3) / <alpha-value>)',
          '4': 'hsl(var(--chart-4) / <alpha-value>)',
          '5': 'hsl(var(--chart-5) / <alpha-value>)'
        }
      },
      boxShadow: {
        lift: '0 40px 90px rgb(var(--bo-shadow) / var(--bo-shadow-strength))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
