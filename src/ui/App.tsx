import { Box, Text, useApp, useInput } from "ink";
import Spinner from "ink-spinner";
import { useCallback, useEffect, useRef, useState } from "react";
import { scrapeUrl } from "../services/scraper.js";
import { loadStore, saveStore } from "../services/store.js";
import { type AppStore, INITIAL_STORE, MEDAL_URLS } from "../types.js";
import { Dashboard } from "./Dashboard.js";
import { Settings } from "./Settings.js";

export const App = () => {
  const { exit } = useApp();
  const [store, setStore] = useState<AppStore>(INITIAL_STORE);
  const [view, setView] = useState<"dashboard" | "settings">("dashboard");
  const [isScraping, setIsScraping] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Initializing...");

  // Use ref to track scraping state in callback without dependency
  const isScrapingRef = useRef(isScraping);
  useEffect(() => {
    isScrapingRef.current = isScraping;
  }, [isScraping]);

  // Load initial data
  useEffect(() => {
    const data = loadStore();
    setStore(data);
    setStatusMsg("Ready.");
  }, []);

  // Save on change
  useEffect(() => {
    if (store !== INITIAL_STORE) {
      saveStore(store);
    }
  }, [store]);

  // Scrape Logic
  const performScrape = useCallback(async () => {
    if (isScrapingRef.current) return;
    setIsScraping(true);
    setStatusMsg("Scraping data...");

    try {
      const [medalTable, medallists, bySport] = await Promise.all([
        scrapeUrl(MEDAL_URLS.medalTable),
        scrapeUrl(MEDAL_URLS.medallists),
        scrapeUrl(MEDAL_URLS.bySport),
      ]);

      setStore((prevStore) => ({
        ...prevStore,
        scrapes: {
          medalTable,
          medallists,
          bySport,
        },
      }));

      setStatusMsg(`Last scrape: ${new Date().toLocaleTimeString()}`);
    } catch (e) {
      setStatusMsg("Error during scrape.");
      console.error(e);
    } finally {
      setIsScraping(false);
    }
  }, []); // Stable callback

  // Interval Timer
  useEffect(() => {
    const ms = store.config.intervalMinutes * 60 * 1000;
    const timer = setInterval(() => {
      performScrape();
    }, ms);
    return () => clearInterval(timer);
  }, [store.config.intervalMinutes, performScrape]);

  // Key Bindings
  useInput((input, key) => {
    if (view === "dashboard") {
      if (input === "q") {
        exit();
      }
      if (input === "r") {
        performScrape();
      }
      if (input === "s") {
        setView("settings");
      }
    } else if (view === "settings") {
      if (key.escape) {
        setView("dashboard");
      }
    }
  });

  const handleSettingsSave = (newInterval: number) => {
    setStore((prev) => ({
      ...prev,
      config: { ...prev.config, intervalMinutes: newInterval },
    }));
    setView("dashboard");
  };

  return (
    <Box flexDirection="column" minHeight={20}>
      <Box
        borderStyle="double"
        borderColor="cyan"
        flexDirection="column"
        alignItems="center"
      >
        <Text bold>Olympics 2026 Medal Tracker</Text>
        <Box>
          {isScraping ? (
            <Text color="green">
              <Spinner type="dots" /> Scraping...{" "}
            </Text>
          ) : (
            <Text>{statusMsg}</Text>
          )}
        </Box>
      </Box>

      {view === "dashboard" ? (
        <Dashboard scrapes={store.scrapes} />
      ) : (
        <Settings
          interval={store.config.intervalMinutes}
          onSave={handleSettingsSave}
          onBack={() => setView("dashboard")}
        />
      )}

      <Box marginTop={1} borderStyle="single" borderColor="gray">
        <Text>Controls: [Q] Quit | [R] Refresh Now | [S] Settings</Text>
      </Box>
    </Box>
  );
};
