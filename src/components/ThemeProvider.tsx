import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";
const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('rankora-theme')||'dark';document.documentElement.classList.toggle('light',t==='light');}catch(e){}})();`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const stored = (localStorage.getItem("rankora-theme") as Theme | null) ?? "dark";
    setThemeState(stored);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem("rankora-theme", t);
    } catch {
      /* ignore */
    }
    const root = document.documentElement;
    root.classList.toggle("light", t === "light");
    root.style.colorScheme = t;
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
