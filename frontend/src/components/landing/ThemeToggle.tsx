import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider"

export const ThemeToggle = () => {
 const { theme, setTheme } = useTheme()

  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const handleToggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleTheme}
      className="relative overflow-hidden rounded-full border border-border"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4 text-neon-cyan " /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};
