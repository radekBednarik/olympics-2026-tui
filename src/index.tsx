import { render } from "ink";
import { App } from "./ui/App.js";
import { enableSyncOutput } from "./ui/sync-output.js";

const enterAltScreen = "\x1b[?1049h";
const exitAltScreen = "\x1b[?1049l";
const hideCursor = "\x1b[?25l";
const showCursor = "\x1b[?25h";

const restoreTerminal = (): void => {
  process.stdout.write(exitAltScreen + showCursor);
};

// Enter alternate screen buffer and hide cursor
process.stdout.write(enterAltScreen + hideCursor);

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
