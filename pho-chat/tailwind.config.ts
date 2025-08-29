// Tailwind CSS v4 note: Theme tokens are primarily configured in CSS via @theme inline in src/app/globals.css.
// This config file is optional in v4. We add minimal settings and comments for clarity.
import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  // v4 auto-detects content; you can still add globs for tooling support
  content: ["./src/**/*.{ts,tsx,js,jsx}", "./src/app/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
    },
  },
  plugins: [],
} satisfies Config;

