export type ThemeVariant = "dark" | "storm" | "light";

export interface Theme {
  foreground: string;
  brightText: string;
  muted: string;
  accent: string;
  info: string;
  success: string;
  warning: string;
  error: string;
  surface: string;
  surfaceDark: string;
}

const tokyoNightDark: Theme = {
  foreground: "#a9b1d6",
  brightText: "#c0caf5",
  muted: "#565f89",
  accent: "#7aa2f7",
  info: "#7dcfff",
  success: "#9ece6a",
  warning: "#e0af68",
  error: "#f7768e",
  surface: "#24283b",
  surfaceDark: "#16161e",
};

const themes: Record<ThemeVariant, Theme> = {
  dark: tokyoNightDark,
  storm: tokyoNightDark, // placeholder for future variant
  light: tokyoNightDark, // placeholder for future variant
};

let activeVariant: ThemeVariant = "dark";

export function setThemeVariant(variant: ThemeVariant): void {
  activeVariant = variant;
}

export function getTheme(): Theme {
  return themes[activeVariant];
}
