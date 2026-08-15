import { useState } from "react";
import { useTheme } from "next-themes";

export const THEME_STORAGE_KEY = "bo-theme";

const readModeFromDom = () => {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
};

/**
 * The resolved theme as a plain "light" | "dark", never undefined.
 *
 * next-themes only knows the theme after it has mounted, which is one render
 * too late for anything that builds a scene on first paint. The boot script in
 * index.html has already put the class on <html> by then, so reading it back is
 * correct from the very first render and saves the 3D components a full
 * teardown-and-rebuild on load.
 */
export const useThemeMode = () => {
  const { resolvedTheme } = useTheme();
  const [domMode] = useState(readModeFromDom);
  return resolvedTheme === "light" || resolvedTheme === "dark" ? resolvedTheme : domMode;
};
