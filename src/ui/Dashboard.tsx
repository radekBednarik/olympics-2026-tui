import { Box, Text, useInput } from "ink";
import { Tab, Tabs } from "ink-tab";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AppStore,
  MedalDeltas,
  MedalTableEntry,
  MedalWinner,
} from "../types.js";
import { CategoryList } from "./CategoryList.js";
import { CountryMedalDetail } from "./CountryMedalDetail.js";
import { EventList } from "./EventList.js";
import { getTheme, MEDAL_COLORS } from "./theme.js";

interface DashboardProps {
  scrapes: AppStore["scrapes"];
  medalDeltas: Map<string, MedalDeltas>;
  onTabChange?: (tab: string) => void;
}

const MedalTableView: React.FC<{
  data: MedalTableEntry[];
  medalDeltas: Map<string, MedalDeltas>;
  medalWinners: MedalWinner[];
  isActive: boolean;
}> = ({ data, medalDeltas, medalWinners, isActive }) => {
  const theme = getTheme();
  const [cursor, setCursor] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    const id = setTimeout(() => {
      mountedRef.current = true;
    }, 50);
    return () => clearTimeout(id);
  }, []);

  useInput(
    (_input, key) => {
      if (selectedCountry !== null) return;
      if (key.upArrow) {
        setCursor((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setCursor((prev) => Math.min(data.length - 1, prev + 1));
      } else if (key.return) {
        if (!mountedRef.current) return;
        const entry = data[cursor];
        if (entry) {
          setSelectedCountry(entry.country);
        }
      }
    },
    { isActive }
  );

  if (data.length === 0) {
    return (
      <Text color={theme.warning}>No medal table data available yet.</Text>
    );
  }

  if (selectedCountry) {
    const matchingEntry = data.find((e) => e.country === selectedCountry);
    return (
      <CountryMedalDetail
        country={selectedCountry}
        medals={medalWinners}
        {...(matchingEntry ? { medalTableEntry: matchingEntry } : {})}
        isActive={isActive}
        onBack={() => setSelectedCountry(null)}
      />
    );
  }

  const rW = 6;
  const cW = 20;
  const mW = 12;
  const totalW = rW + cW + mW * 4;

  const formatMedalCell = (
    value: number,
    delta: MedalDeltas | undefined,
    field: keyof MedalDeltas,
    width: number
  ): string => {
    const d = delta?.[field];
    const text = d && d !== 0 ? `${value} (+${d})` : String(value);
    return text.padEnd(width);
  };

  return (
    <Box flexDirection="column">
      <Text bold>
        {"  "}
        {"Rank".padEnd(rW)}
        {"Country".padEnd(cW)}
        <Text color={MEDAL_COLORS.gold}>{"●"}</Text>
        {" Gold".padEnd(mW - 1)}
        <Text color={MEDAL_COLORS.silver}>{"●"}</Text>
        {" Silver".padEnd(mW - 1)}
        <Text color={MEDAL_COLORS.bronze}>{"●"}</Text>
        {" Bronze".padEnd(mW - 1)}
        {"Total".padEnd(mW)}
      </Text>
      <Text>{"─".repeat(totalW + 2)}</Text>
      {data.map((row, index) => {
        const delta = medalDeltas.get(row.country);
        const isSelected = index === cursor;
        const prefix = isSelected ? "▸ " : "  ";
        const line =
          row.rank.padEnd(rW) +
          row.country.padEnd(cW) +
          formatMedalCell(row.gold, delta, "gold", mW) +
          formatMedalCell(row.silver, delta, "silver", mW) +
          formatMedalCell(row.bronze, delta, "bronze", mW) +
          formatMedalCell(row.total, delta, "total", mW);

        const textProps: {
          backgroundColor?: string;
          color?: string;
        } = {};
        if (index % 2 === 1) {
          textProps.backgroundColor = theme.surfaceDark;
        }
        if (isSelected) {
          textProps.color = theme.accent;
        }

        return (
          <Text
            key={`${row.rank}-${row.country}`}
            bold={isSelected}
            {...textProps}
          >
            {prefix}
            {line}
          </Text>
        );
      })}
      <Box marginTop={1}>
        <Text color={theme.muted}>↑/↓ Navigate · Enter Details</Text>
      </Box>
    </Box>
  );
};

const hasWinnerData = (winner: MedalWinner): boolean =>
  winner.gold.name !== "" ||
  winner.silver.name !== "" ||
  winner.bronze.name !== "";

const SportEventsView: React.FC<{
  data: MedalWinner[];
  isActive: boolean;
}> = ({ data, isActive }) => {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const theme = getTheme();

  const grouped = useMemo(() => {
    const map = new Map<string, MedalWinner[]>();
    for (const w of data) {
      const existing = map.get(w.sport);
      if (existing) {
        existing.push(w);
      } else {
        map.set(w.sport, [w]);
      }
    }
    return map;
  }, [data]);

  const categories = useMemo(() => Array.from(grouped.keys()), [grouped]);

  const highlightedCategories = useMemo(() => {
    const highlighted = new Set<string>();
    for (const [sport, events] of grouped) {
      if (events.some(hasWinnerData)) {
        highlighted.add(sport);
      }
    }
    return highlighted;
  }, [grouped]);

  if (data.length === 0) {
    return (
      <Text color={theme.warning}>No medal winners data available yet.</Text>
    );
  }

  if (selectedSport) {
    const events = grouped.get(selectedSport) ?? [];
    return (
      <EventList
        sport={selectedSport}
        events={events}
        isActive={isActive}
        onBack={() => setSelectedSport(null)}
      />
    );
  }

  return (
    <CategoryList
      categories={categories}
      highlightedCategories={highlightedCategories}
      isActive={isActive}
      onSelect={setSelectedSport}
    />
  );
};

export const Dashboard: React.FC<DashboardProps> = ({
  scrapes,
  medalDeltas,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<string>("medalTable");
  const theme = getTheme();

  const handleTabChange = (name: string) => {
    setActiveTab(name);
    onTabChange?.(name);
  };

  const activeScrape =
    activeTab === "medalTable" ? scrapes.medalTable : scrapes.medalWinners;

  return (
    <Box flexDirection="column" padding={1} borderStyle="single" flexGrow={1}>
      <Tabs onChange={handleTabChange}>
        <Tab name="medalTable">Medal Table</Tab>
        <Tab name="bySport">By Sport</Tab>
      </Tabs>

      <Box marginTop={1} flexDirection="column">
        <Text bold>
          Status:{" "}
          <Text
            color={
              activeScrape.status === "DATA_AVAILABLE"
                ? theme.success
                : activeScrape.status === "ERROR"
                  ? theme.error
                  : theme.warning
            }
          >
            {activeScrape.status
              .toLowerCase()
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </Text>
        </Text>
        <Text color={theme.muted}>
          Last Updated:{" "}
          {activeScrape.timestamp
            ? new Date(activeScrape.timestamp).toLocaleString()
            : "Never"}
        </Text>

        <Box
          marginTop={1}
          borderStyle="round"
          borderColor={
            activeScrape.status === "DATA_AVAILABLE"
              ? theme.success
              : activeScrape.status === "ERROR"
                ? theme.error
                : theme.warning
          }
          padding={1}
        >
          {activeScrape.status === "ERROR" ? (
            <Text color={theme.error}>Error: {activeScrape.error}</Text>
          ) : activeTab === "medalTable" ? (
            <MedalTableView
              data={scrapes.medalTable.data}
              medalDeltas={medalDeltas}
              medalWinners={scrapes.medalWinners.data}
              isActive={activeTab === "medalTable"}
            />
          ) : (
            <SportEventsView
              data={scrapes.medalWinners.data}
              isActive={activeTab === "bySport"}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};
