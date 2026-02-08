# Olympics 2026 Medal Tracker

A terminal dashboard for tracking medals at the 2026 Winter Olympics in Milan-Cortina. Built with [Ink](https://github.com/vadimdemedes/ink) (React for the terminal), it scrapes live data from Wikipedia and displays medal tables, individual winners, and per-sport breakdowns — all from the comfort of your CLI.

## Features

- **Medal Table** — country rankings with gold, silver, and bronze counts
- **Medal Winners** — browse individual event winners across all sports
- **By Sport** — drill into events grouped by sport category
- **Auto-Refresh** — periodically scrapes for updated results on a configurable interval
- **Persistent Storage** — scraped data is cached locally in `data/store.json`

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

In **Settings** you can change the auto-refresh interval (in minutes). Press `Enter` to save or `Esc` to cancel.

## Development

```bash
# Type-check (no emit)
pnpm tsc:check

# Build to dist/
pnpm build

# Lint & format (auto-fix)
pnpm biome:check
```

## License

MIT
