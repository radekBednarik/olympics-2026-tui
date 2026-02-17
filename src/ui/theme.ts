import type { ThemeVariant } from "../types.js";

export interface Theme {
  background: string;
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
  background: "#1a1b26",
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

const tokyoNightStorm: Theme = {
  background: "#24283b",
  foreground: "#c0caf5",
  brightText: "#d5d6db",
  muted: "#6272a4",
  accent: "#bb9af7",
  info: "#89ddff",
  success: "#73daca",
  warning: "#ff9e64",
  error: "#f7768e",
  surface: "#1f2335",
  surfaceDark: "#1a1b2e",
};

const themes: Record<ThemeVariant, Theme> = {
  dark: tokyoNightDark,
  storm: tokyoNightStorm,
};

export const MEDAL_COLORS = {
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
} as const;

export const THEME_VARIANTS: ThemeVariant[] = ["dark", "storm"];

let activeVariant: ThemeVariant = "dark";

export function setThemeVariant(variant: ThemeVariant): void {
  activeVariant = variant;
}

export function getTheme(): Theme {
  return themes[activeVariant];
}

/**
 * Set the terminal's default background color using OSC 11.
 * Supported by most modern terminals (xterm, iTerm2, Alacritty, WezTerm,
 * Windows Terminal, kitty, etc.).
 */
export function setTerminalBackground(hexColor: string): void {
  process.stdout.write(`\x1b]11;${hexColor}\x07`);
}

/**
 * Reset the terminal's default background to its configured default
 * using OSC 111.
 */
export function resetTerminalBackground(): void {
  process.stdout.write("\x1b]111\x07");
}
