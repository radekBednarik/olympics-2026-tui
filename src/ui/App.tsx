import { Box, Text, useApp, useInput, useStdout } from "ink";
import Spinner from "ink-spinner";
import { useCallback, useEffect, useRef, useState } from "react";
import { scrapeMedalTable, scrapeMedalWinners } from "../services/scraper.js";
import { loadStore, saveStore } from "../services/store.js";
import { type AppStore, INITIAL_STORE } from "../types.js";
import { Dashboard } from "./Dashboard.js";
import { Settings } from "./Settings.js";

const useTerminalHeight = (): number => {
  const { stdout } = useStdout();
  const [rows, setRows] = useState(stdout.rows ?? 24);

  useEffect(() => {
    const onResize = () => {
      setRows(stdout.rows ?? 24);
    };
    stdout.on("resize", onResize);
    return () => {
      stdout.off("resize", onResize);
    };
  }, [stdout]);

  return rows;
};

export const App = () => {
  const { exit } = useApp();
  const rows = useTerminalHeight();
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
      const [medalTable, medalWinners] = await Promise.all([
        scrapeMedalTable(),
        scrapeMedalWinners(),
      ]);

      setStore((prevStore) => ({
        ...prevStore,
        scrapes: {
          medalTable,
          medalWinners,
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
    <Box flexDirection="column" height={rows}>
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
