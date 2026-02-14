# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A terminal-based dashboard for tracking 2026 Winter Olympics medals. Built with Ink (React for the terminal), scrapes Wikipedia using Playwright, and provides an interactive CLI with theming and persistent storage.

## Tech Stack

- **UI**: Ink v5 (React for terminal rendering)
- **Language**: TypeScript with strict mode, ESM modules
- **Runtime**: Node.js ≥ 20
- **Package Manager**: pnpm ≥ 10 (enforced via packageManager field)
- **Scraping**: Playwright (Chromium)
- **Linting**: Biome (not ESLint/Prettier)

## Commands

```bash
# Build TypeScript to dist/
pnpm build

# Run the app
pnpm start

# Type-check without emitting
pnpm tsc:check

# Lint and format (auto-fix)
pnpm biome:check
```

## Architecture

### Two-Layer State Management

The app maintains two separate JSON files with distinct purposes:

1. **`settings.json`** — Lives in OS config directory (platform-specific, see paths.ts)
   - Stores only the custom `dataDir` path
   - Never moves location; always in the same config directory
   - Managed by services/settings.ts

2. **`store.json`** — Lives in data directory (configurable via settings)
   - Contains scraped data (medalTable, medalWinners)
   - Contains app config (intervalMinutes, theme)
   - Can be moved by user via Settings UI
   - Managed by services/store.ts

This split allows users to change where data is stored without losing the reference to that location.

### Path Resolution (services/paths.ts)

Cross-platform path resolution for config and data directories:
- Linux: XDG_CONFIG_HOME, XDG_DATA_HOME
- macOS: ~/Library/Application Support
- Windows: APPDATA, LOCALAPPDATA

The `getActiveDataDir()` function in settings.ts resolves the actual data directory based on the stored preference.

### UI Structure (src/ui/)

- **App.tsx** — Root component; manages global state, scraping lifecycle, settings persistence
- **Dashboard.tsx** — Three-tab view (Medal Table, Medal Winners, By Sport)
- **Settings.tsx** — Modal for configuring interval, theme, and data directory
- Theme system (theme.ts) includes three Tokyo Night variants; uses ANSI escape codes to set terminal background

### Scraping (services/scraper.ts)

- Two separate scrapers: `scrapeMedalTable()` and `scrapeMedalWinners()`
- Both launch Chromium via Playwright and parse Wikipedia tables
- Return `ScrapeResult<T>` with timestamp, status, data, and optional error
- Medal table scraper handles rowspan cells (shared ranks)
- Medal winners scraper walks the DOM for h2 (sports) → h3 (gender) → table (events) structure

### Medal Deltas

App.tsx computes medal deltas by comparing previous scrape data with new data (stored in `previousMedalDataRef`). Used to highlight changes in the Medal Table view. Deltas are not persisted; recomputed on each scrape.

### Legacy Migration

On first run, if no settings.json exists but ./data/store.json does (from a previous version), the app automatically migrates store.json to the new default data directory.

## Key Files

- **src/types.ts** — All shared types, including MEDAL_URLS constants and INITIAL_STORE
- **src/services/store.ts** — Load/save/validate data directory, migration logic
- **src/services/settings.ts** — Load/save settings.json from config directory
- **src/services/scraper.ts** — Playwright-based Wikipedia scrapers
- **src/ui/App.tsx** — Main component with scraping lifecycle, auto-refresh timer, and key bindings

## TypeScript Configuration

- `module: "nodenext"` with `.js` extensions in imports (ESM)
- Strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`
- Outputs to `dist/` with source maps and declaration files
