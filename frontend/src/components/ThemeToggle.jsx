import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "@/lib/theme";

/**
 * The icon shows the theme you would switch *to*, which is what the label says
 * too — so the button never has to be read twice to know what it does.
 */
export const ThemeToggle = ({ className = "", testId = "theme-toggle" }) => {
  const { setTheme } = useTheme();
  const mode = useThemeMode();
  // Until mounted the stored preference is not readable, so hold the icon back
  // rather than flash the wrong one for a frame.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const next = mode === "dark" ? "light" : "dark";
  const Icon = next === "light" ? Sun : Moon;

  return (
    <button
      type="button"
      data-testid={testId}
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`inline-flex items-center justify-center rounded-sm border border-bone/20 p-2.5 text-bone/80 transition-colors duration-200 hover:border-gold/60 hover:text-gold ${className}`}
    >
      <Icon aria-hidden="true" className="h-[15px] w-[15px]" style={{ opacity: mounted ? 1 : 0 }} />
    </button>
  );
};
