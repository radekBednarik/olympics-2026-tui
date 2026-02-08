import fs from "node:fs";
import path from "node:path";
import { type AppStore, INITIAL_STORE } from "../types.js";

const STORE_FILENAME = "store.json";

function storeFilePath(dataDir: string): string {
  return path.join(dataDir, STORE_FILENAME);
}

export const loadStore = (dataDir: string): AppStore => {
  try {
    const filePath = storeFilePath(dataDir);
    if (!fs.existsSync(filePath)) {
      saveStore(INITIAL_STORE, dataDir);
      return INITIAL_STORE;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(data) as AppStore;
    // Graceful fallback for stores without a theme field
    if (!parsed.config.theme) {
      parsed.config.theme = INITIAL_STORE.config.theme;
    }
    return parsed;
  } catch (error) {
    console.error("Failed to load store, resetting to default", error);
    return INITIAL_STORE;
  }
};

export const saveStore = (store: AppStore, dataDir: string): void => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(
      storeFilePath(dataDir),
      JSON.stringify(store, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Failed to save store", error);
  }
};

export interface ValidateResult {
  isValid: boolean;
  error?: string;
}

export function validateDataDir(dirPath: string): ValidateResult {
  try {
    const resolved = path.resolve(dirPath);
    if (fs.existsSync(resolved)) {
      const stat = fs.statSync(resolved);
      if (!stat.isDirectory()) {
        return { isValid: false, error: "Path exists but is not a directory" };
      }
      // Check writability by attempting a temp file
      const testFile = path.join(resolved, `.write-test-${Date.now()}`);
      try {
        fs.writeFileSync(testFile, "", "utf-8");
        fs.unlinkSync(testFile);
      } catch {
        return { isValid: false, error: "Directory is not writable" };
      }
      return { isValid: true };
    }
    // Directory doesn't exist — check if parent is writable
    const parentDir = path.dirname(resolved);
    if (!fs.existsSync(parentDir)) {
      return { isValid: false, error: "Parent directory does not exist" };
    }
    const parentStat = fs.statSync(parentDir);
    if (!parentStat.isDirectory()) {
      return { isValid: false, error: "Parent path is not a directory" };
    }
    // Try creating and removing the directory
    try {
      fs.mkdirSync(resolved, { recursive: true });
    } catch {
      return {
        isValid: false,
        error: "Cannot create directory (permission denied)",
      };
    }
    return { isValid: true };
  } catch {
    return { isValid: false, error: "Invalid path" };
  }
}

export function migrateData(
  fromDir: string,
  toDir: string
): { success: boolean; error?: string } {
  try {
    const sourceFile = storeFilePath(fromDir);
    if (!fs.existsSync(sourceFile)) {
      // Nothing to migrate
      return { success: true };
    }
    if (!fs.existsSync(toDir)) {
      fs.mkdirSync(toDir, { recursive: true });
    }
    const destFile = storeFilePath(toDir);
    fs.copyFileSync(sourceFile, destFile);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Migration failed: ${(error as Error).message}`,
    };
  }
}
