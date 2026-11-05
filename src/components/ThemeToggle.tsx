import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      title={isLight ? "Dark mode" : "Light mode"}
      className={`relative grid h-8 w-8 place-items-center rounded-full border border-border/70 bg-card/50 text-muted-foreground transition hover:text-foreground hover:bg-accent ${className}`}
    >
      <Sun
        className={`absolute h-4 w-4 transition-all duration-300 ${isLight ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ${isLight ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
      />
    </button>
  );
}
