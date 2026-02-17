import { render } from "ink";
import { getActiveDataDir, loadSettings } from "./services/settings.js";
import { loadStore } from "./services/store.js";
import { App } from "./ui/App.js";
import { enableSyncOutput } from "./ui/sync-output.js";
import {
  getTheme,
  resetTerminalBackground,
  setTerminalBackground,
  setThemeVariant,
} from "./ui/theme.js";

const enterAltScreen = "\x1b[?1049h";
const exitAltScreen = "\x1b[?1049l";
const hideCursor = "\x1b[?25l";
const showCursor = "\x1b[?25h";

const restoreTerminal = (): void => {
  resetTerminalBackground();
  process.stdout.write(exitAltScreen + showCursor);
};

// Load persisted theme before rendering to avoid a flash of the default theme
const settings = loadSettings();
const activeDir = getActiveDataDir(settings);
const initialStore = loadStore(activeDir);
setThemeVariant(initialStore.config.theme);

// Enter alternate screen buffer, hide cursor, and set themed background
process.stdout.write(enterAltScreen + hideCursor);
setTerminalBackground(getTheme().background);

// Wrap stdout writes in synchronized update markers to prevent
// flickering on terminals like Windows Terminal
enableSyncOutput();

const instance = render(<App />, {
  exitOnCtrlC: true,
  stderr: process.stdout,
  patchConsole: false,
});

const handleSignal = (): void => {
  instance.unmount();
};

process.on("SIGTERM", handleSignal);
process.on("SIGINT", handleSignal);

// Safety net: always restore terminal on process exit
process.on("exit", restoreTerminal);

instance.waitUntilExit().then(() => {
  process.exit(0);
});
