import { Box, Text, useApp, useInput, useStdout } from "ink";
import Spinner from "ink-spinner";
import { useCallback, useEffect, useRef, useState } from "react";
import { scrapeMedalTable, scrapeMedalWinners } from "../services/scraper.js";
import { loadStore, saveStore } from "../services/store.js";
import {
  type AppStore,
  INITIAL_STORE,
  type MedalDeltas,
  type MedalTableEntry,
  type ThemeVariant,
} from "../types.js";
import { CountdownTimer } from "./CountdownTimer.js";
import { Dashboard } from "./Dashboard.js";
import { Settings } from "./Settings.js";
import { getTheme, setThemeVariant } from "./theme.js";

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
  const [medalDeltas, setMedalDeltas] = useState<Map<string, MedalDeltas>>(
    new Map()
  );
  const previousMedalDataRef = useRef<MedalTableEntry[]>([]);

  // Use ref to track scraping state in callback without dependency
  const isScrapingRef = useRef(isScraping);
  useEffect(() => {
    isScrapingRef.current = isScraping;
  }, [isScraping]);

  // Load initial data
  useEffect(() => {
    const data = loadStore();
    setThemeVariant(data.config.theme);
    setStore(data);
    previousMedalDataRef.current = data.scrapes.medalTable.data;
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

      // Compute medal deltas (skip on first scrape)
      const prevData = previousMedalDataRef.current;
      if (prevData.length > 0) {
        const oldByCountry = new Map<string, MedalTableEntry>();
        for (const entry of prevData) {
          oldByCountry.set(entry.country, entry);
        }
        const deltas = new Map<string, MedalDeltas>();
        for (const entry of medalTable.data) {
          const old = oldByCountry.get(entry.country);
          const d: MedalDeltas = {
            gold: entry.gold - (old?.gold ?? 0),
            silver: entry.silver - (old?.silver ?? 0),
            bronze: entry.bronze - (old?.bronze ?? 0),
            total: entry.total - (old?.total ?? 0),
          };
          if (
            d.gold !== 0 ||
            d.silver !== 0 ||
            d.bronze !== 0 ||
            d.total !== 0
          ) {
            deltas.set(entry.country, d);
          }
        }
        setMedalDeltas(deltas);
      } else {
        setMedalDeltas(new Map());
      }
      previousMedalDataRef.current = medalTable.data;

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

  // Auto-scrape on startup when no data is available
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs only on mount
  useEffect(() => {
    if (
      store.scrapes.medalTable.status === "PENDING" &&
      store.scrapes.medalWinners.status === "PENDING"
    ) {
      performScrape();
    }
  }, []);

  // Interval Timer — on interval change, check if we're already overdue
  useEffect(() => {
    const ms = store.config.intervalMinutes * 60 * 1000;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const startInterval = (): void => {
      intervalId = setInterval(() => {
        performScrape();
      }, ms);
    };

    const lastTableTime = new Date(
      store.scrapes.medalTable.timestamp
    ).getTime();
    const lastWinnersTime = new Date(
      store.scrapes.medalWinners.timestamp
    ).getTime();
    const lastScrape = Math.max(
      Number.isNaN(lastTableTime) ? 0 : lastTableTime,
      Number.isNaN(lastWinnersTime) ? 0 : lastWinnersTime
    );
    const elapsed = lastScrape > 0 ? Date.now() - lastScrape : ms;

    if (elapsed >= ms) {
      performScrape();
      startInterval();
    } else {
      timeoutId = setTimeout(() => {
        performScrape();
        startInterval();
      }, ms - elapsed);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [store.config.intervalMinutes, store.scrapes, performScrape]);

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

  const handleSettingsSave = (newInterval: number, newTheme: ThemeVariant) => {
    setThemeVariant(newTheme);
    setStore((prev) => ({
      ...prev,
      config: { ...prev.config, intervalMinutes: newInterval, theme: newTheme },
    }));
    setView("dashboard");
  };

  const handleSettingsBack = () => {
    setThemeVariant(store.config.theme);
    setView("dashboard");
  };

  const theme = getTheme();

  return (
    <Box flexDirection="column" height={rows}>
      <Box
        borderStyle="double"
        borderColor={theme.accent}
        flexDirection="column"
        alignItems="center"
      >
        <Text bold>Olympics 2026 Medal Tracker</Text>
        <Box>
          {isScraping ? (
            <Text color={theme.success}>
              <Spinner type="dots" /> Scraping...{" "}
            </Text>
          ) : (
            <Text>{statusMsg}</Text>
          )}
          <CountdownTimer
            lastScrapeTimestamp={
              store.scrapes.medalTable.timestamp >
              store.scrapes.medalWinners.timestamp
                ? store.scrapes.medalTable.timestamp
                : store.scrapes.medalWinners.timestamp
            }
            intervalMinutes={store.config.intervalMinutes}
          />
        </Box>
      </Box>

      {view === "dashboard" ? (
        <Dashboard scrapes={store.scrapes} medalDeltas={medalDeltas} />
      ) : (
        <Settings
          interval={store.config.intervalMinutes}
          theme={store.config.theme}
          onSave={handleSettingsSave}
          onBack={handleSettingsBack}
        />
      )}

      <Box marginTop={1} borderStyle="single" borderColor={theme.muted}>
        <Text>Controls: [Q] Quit | [R] Refresh Now | [S] Settings</Text>
      </Box>
    </Box>
  );
};
