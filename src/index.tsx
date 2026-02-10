import { render } from "ink";
import { App } from "./ui/App.js";
import { enableSyncOutput } from "./ui/sync-output.js";
import {
  getTheme,
  resetTerminalBackground,
  setTerminalBackground,
} from "./ui/theme.js";

const enterAltScreen = "\x1b[?1049h";
const exitAltScreen = "\x1b[?1049l";
const hideCursor = "\x1b[?25l";
const showCursor = "\x1b[?25h";

const restoreTerminal = (): void => {
  resetTerminalBackground();
  process.stdout.write(exitAltScreen + showCursor);
};

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
