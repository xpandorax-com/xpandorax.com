import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/{**,.client,.server}/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      // Touch-friendly sizing
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
        "touch": "44px", // Minimum touch target size
      },
      minHeight: {
        "touch": "44px",
        "screen-safe": "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
        "screen-dvh": "100dvh", // Dynamic viewport height
        "screen-svh": "100svh", // Small viewport height
        "screen-lvh": "100lvh", // Large viewport height
      },
      minWidth: {
        "touch": "44px",
      },
      height: {
        "screen-dvh": "100dvh", // Dynamic viewport height (accounts for mobile browser UI)
        "screen-svh": "100svh", // Small viewport height (address bar visible)
        "screen-lvh": "100lvh", // Large viewport height (address bar hidden)
        "screen-safe": "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
      },
      maxHeight: {
        "screen-dvh": "100dvh",
        "screen-svh": "100svh",
        "screen-lvh": "100lvh",
        "screen-safe": "calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
      },
      width: {
        "screen-dvw": "100dvw", // Dynamic viewport width
      },
      maxWidth: {
        "screen-dvw": "100dvw",
        "cuts-video": "500px", // Max width for vertical video on desktop
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        // Auto-scaling font sizes using clamp
        "auto-xs": ["clamp(0.625rem, 1.5vw, 0.75rem)", { lineHeight: "1.4" }],
        "auto-sm": ["clamp(0.75rem, 2vw, 0.875rem)", { lineHeight: "1.4" }],
        "auto-base": ["clamp(0.875rem, 2.5vw, 1rem)", { lineHeight: "1.5" }],
        "auto-lg": ["clamp(1rem, 3vw, 1.25rem)", { lineHeight: "1.5" }],
        "auto-xl": ["clamp(1.125rem, 3.5vw, 1.5rem)", { lineHeight: "1.4" }],
      },
      aspectRatio: {
        "vertical": "9 / 16", // TikTok/Reels style
        "cinema": "21 / 9", // Cinematic widescreen
        "portrait": "3 / 4", // Portrait photos
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
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
