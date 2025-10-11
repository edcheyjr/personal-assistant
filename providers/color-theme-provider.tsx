import { generateThemeCSS } from "@/lib/theme";
import React from "react";

// Modern, appealing default color - A vibrant purple/indigo
const DEFAULT_THEME_COLOR = "#8b5cf6"; // Vibrant purple, modern and professional

interface ThemeContextType {
  themeColor: string;
  themeColorCss: {
    "--theme-primary": string;
    "--theme-primary-foreground": string;
    "--theme-primary-hover": string;
    "--theme-primary-light": string;
    "--theme-primary-alpha": string;
  };
  setThemeColor: (color: string) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined
);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialThemeColor?: string; // Kept for compatibility but not used
}

export function ColorThemeProvider({ children }: ThemeProviderProps) {
  // Use fixed modern color - no more user selection
  const themeColor = DEFAULT_THEME_COLOR;

  // No-op function for compatibility (does nothing since color is fixed)
  const setThemeColor = () => {
    // Color is fixed, cannot be changed
  };

  const value = {
    themeColor,
    setThemeColor,
    themeColorCss: generateThemeCSS(themeColor),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeColor() {
  const context = React.useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useThemeColor must be used within a ColorThemeProvider");
  }

  return context;
}
