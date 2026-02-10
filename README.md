# Olympics 2026 Medal Tracker

A terminal dashboard for tracking medals at the 2026 Winter Olympics in Milan-Cortina. Built with [Ink](https://github.com/vadimdemedes/ink) (React for the terminal), it scrapes live data from Wikipedia and displays medal tables, individual winners, and per-sport breakdowns — all from the comfort of your CLI.

## Features

- **Medal Table** — country rankings with gold, silver, and bronze counts
- **Medal Winners** — browse individual event winners across all sports
- **By Sport** — drill into events grouped by sport category
- **Auto-Refresh** — periodically scrapes for updated results on a configurable interval
- **Persistent Storage** — scraped data is cached in an OS-standard user data directory with a configurable path

## Prerequisites

- [Node.js](https://nodejs.org/) **≥ 20**
- [pnpm](https://pnpm.io/) **≥ 10**
- Chromium browser for Playwright (installed in the steps below)

## Installation

```bash
git clone <repo-url> && cd olympics-2026
pnpm install
pnpm exec playwright install chromium
```

## Usage

```bash
pnpm build
pnpm start
```

### Keybindings

| Key         | Action           |
| ----------- | ---------------- |
| `Q`         | Quit             |
| `R`         | Refresh data now |
| `S`         | Open settings    |
| `Esc`       | Go back          |
| `↑` / `↓`   | Navigate lists   |
| `<-` / `->` | Switch tabs      |

In **Settings** you can change the auto-refresh interval (in minutes), select a theme, and set a custom data directory. Three Tokyo Night variants are available: **dark** (default), **storm**, and **light** — use `←`/`→` to cycle through them. Use `Tab` to switch between fields. Press `Enter` to save or `Esc` to cancel.

## Data Storage

The application stores two separate files:

- **`settings.json`** — persists the custom data directory path (stored in the OS config directory, never moves)
- **`store.json`** — cached scrape data and display preferences (stored in the data directory)

### Default Locations

| OS      | Settings (`settings.json`)                     | Data (`store.json`)                            |
| ------- | ---------------------------------------------- | ---------------------------------------------- |
| Linux   | `~/.config/olympics-2026/`                     | `~/.local/share/olympics-2026/`                |
| macOS   | `~/Library/Application Support/olympics-2026/` | `~/Library/Application Support/olympics-2026/` |
| Windows | `%APPDATA%\olympics-2026\`                     | `%LOCALAPPDATA%\olympics-2026\`                |

On Linux, `XDG_CONFIG_HOME` and `XDG_DATA_HOME` are respected when set.

### Custom Data Directory

You can change where `store.json` lives via the **Data Directory** field in Settings. When you change the path:

1. The new path is validated (must be writable; parent directory must exist)
2. Existing data is automatically migrated to the new location
3. The new path is persisted in `settings.json`

Leave the field empty to reset to the default location. If an invalid path is provided, an error is shown and the previous path is kept.

### Legacy Migration

On first run, if a `data/store.json` file exists in the working directory (from a previous version), it is automatically copied to the new default data directory.

## Development

```bash
# Type-check (no emit)
pnpm tsc:check

# Build to dist/
pnpm build

# Lint & format (auto-fix)
pnpm biome:check
```

## Built With

This application was created using [OpenCode](https://opencode.ai) and [Claude Opus 4.6](https://www.anthropic.com/claude) by Anthropic.

## License

MIT
