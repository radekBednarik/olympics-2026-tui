import os from "node:os";
import path from "node:path";

const APP_NAME = "olympics-2026";

export function getConfigDir(): string {
  const platform = process.platform;
  if (platform === "win32") {
    const appData = process.env.APPDATA;
    if (appData) {
      return path.join(appData, APP_NAME);
    }
    return path.join(os.homedir(), "AppData", "Roaming", APP_NAME);
  }
  if (platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", APP_NAME);
  }
  // Linux / other Unix
  const xdgConfig = process.env.XDG_CONFIG_HOME;
  if (xdgConfig) {
    return path.join(xdgConfig, APP_NAME);
  }
  return path.join(os.homedir(), ".config", APP_NAME);
}

export function getDefaultDataDir(): string {
  const platform = process.platform;
  if (platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      return path.join(localAppData, APP_NAME);
    }
    return path.join(os.homedir(), "AppData", "Local", APP_NAME);
  }
  if (platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", APP_NAME);
  }
  // Linux / other Unix
  const xdgData = process.env.XDG_DATA_HOME;
  if (xdgData) {
    return path.join(xdgData, APP_NAME);
  }
  return path.join(os.homedir(), ".local", "share", APP_NAME);
}

export function getLegacyDataDir(): string {
  return path.resolve(process.cwd(), "data");
}
