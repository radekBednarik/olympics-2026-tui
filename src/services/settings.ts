import fs from "node:fs";
import path from "node:path";
import { getConfigDir, getDefaultDataDir } from "./paths.js";

const SETTINGS_FILE = "settings.json";

export interface Settings {
  dataDir: string;
}

const DEFAULT_SETTINGS: Settings = {
  dataDir: "",
};

function getSettingsPath(): string {
  return path.join(getConfigDir(), SETTINGS_FILE);
}

export function loadSettings(): Settings {
  try {
    const filePath = getSettingsPath();
    if (!fs.existsSync(filePath)) {
      return DEFAULT_SETTINGS;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(data) as Partial<Settings>;
    return {
      dataDir:
        typeof parsed.dataDir === "string"
          ? parsed.dataDir
          : DEFAULT_SETTINGS.dataDir,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    const configDir = getConfigDir();
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(
      getSettingsPath(),
      JSON.stringify(settings, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Failed to save settings", error);
  }
}

export function settingsExist(): boolean {
  return fs.existsSync(getSettingsPath());
}

export function getActiveDataDir(settings?: Settings): string {
  const s = settings ?? loadSettings();
  if (s.dataDir && s.dataDir.trim() !== "") {
    return path.resolve(s.dataDir);
  }
  return getDefaultDataDir();
}
