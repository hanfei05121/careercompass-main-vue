import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ["Sora", "Outfit", "sans-serif"],
        headline: ["Sora", "Outfit", "sans-serif"],
        code: ['"JetBrains Mono"', "monospace"],
        /** 标题衬线字：对齐参考站点的 Fraunces */
        display: ["Fraunces", '"Instrument Serif"', "ui-serif", "Georgia", "serif"],
      },
      transitionTimingFunction: {
        /** 参考站点统一使用的缓动曲线 */
        silk: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-scale": {
          "0%": {
            opacity: "0",
            transform: "translateY(-50%) scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(-50%) scale(1)",
          },
        },
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(16px)",
            filter: "blur(4px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
            filter: "blur(0)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        /** 启动遮罩里的旋转图标 */
        "boot-spin": {
          to: { transform: "rotate(360deg)" },
        },
        /** 元素弹入（缩放回弹），参考站点的 pop 动画 */
        pop: {
          "0%": { transform: "scale(0.26)" },
          "25%": { transform: "scale(1.1)" },
          "65%": { transform: "scale(0.98)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-scale": "fade-scale 0.2s ease-out",
        "fade-up": "fade-up 0.7s cubic-bezier(.22,1,.36,1) both",
        "fade-in": "fade-in 0.6s ease-out both",
        "spin-slow": "spin-slow 2.4s linear infinite",
        "boot-spin": "boot-spin 1s linear infinite",
        pop: "pop 1s forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
