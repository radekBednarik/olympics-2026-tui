import fs from "node:fs";
import path from "node:path";
import { type AppStore, INITIAL_STORE } from "../types.js";

const DATA_DIR = path.resolve(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

export const loadStore = (): AppStore => {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      saveStore(INITIAL_STORE);
      return INITIAL_STORE;
    }
    const data = fs.readFileSync(STORE_FILE, "utf-8");
    return JSON.parse(data) as AppStore;
  } catch (error) {
    console.error("Failed to load store, resetting to default", error);
    return INITIAL_STORE;
  }
};

export const saveStore = (store: AppStore): void => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save store", error);
  }
};
