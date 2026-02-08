import { Box, Text } from "ink";
import { Tab, Tabs } from "ink-tab";
import type React from "react";
import { useMemo, useState } from "react";
import type {
  AppStore,
  MedalDeltas,
  MedalTableEntry,
  MedalWinner,
} from "../types.js";
import { CategoryList } from "./CategoryList.js";
import { EventList } from "./EventList.js";
import { MedalWinnersView } from "./MedalWinnersView.js";
import { getTheme } from "./theme.js";

interface DashboardProps {
  scrapes: AppStore["scrapes"];
  medalDeltas: Map<string, MedalDeltas>;
}

const MedalTableView: React.FC<{
  data: MedalTableEntry[];
  medalDeltas: Map<string, MedalDeltas>;
}> = ({ data, medalDeltas }) => {
  const theme = getTheme();

  if (data.length === 0) {
    return (
      <Text color={theme.warning}>No medal table data available yet.</Text>
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
        {"Rank".padEnd(rW)}
        {"Country".padEnd(cW)}
        {"🥇".padEnd(mW - 1)}
        {"🥈".padEnd(mW - 1)}
        {"🥉".padEnd(mW - 1)}
        {"Total".padEnd(mW)}
      </Text>
      <Text>{"─".repeat(totalW)}</Text>
      {data.map((row, index) => {
        const delta = medalDeltas.get(row.country);
        const stripeBg =
          index % 2 === 1
            ? { backgroundColor: theme.surfaceDark as string }
            : {};
        const line =
          row.rank.padEnd(rW) +
          row.country.padEnd(cW) +
          formatMedalCell(row.gold, delta, "gold", mW) +
          formatMedalCell(row.silver, delta, "silver", mW) +
          formatMedalCell(row.bronze, delta, "bronze", mW) +
          formatMedalCell(row.total, delta, "total", mW);
        return (
          <Text key={`${row.rank}-${row.country}`} {...stripeBg}>
            {line}
          </Text>
        );
      })}
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
}) => {
  const [activeTab, setActiveTab] = useState<string>("medalTable");
  const theme = getTheme();

  const handleTabChange = (name: string) => {
    setActiveTab(name);
  };

  const activeScrape =
    activeTab === "medalTable" ? scrapes.medalTable : scrapes.medalWinners;

  return (
    <Box flexDirection="column" padding={1} borderStyle="single" flexGrow={1}>
      <Tabs onChange={handleTabChange}>
        <Tab name="medalTable">Medal Table</Tab>
        <Tab name="medalWinners">Medal Winners</Tab>
        <Tab name="bySport">By Sport</Tab>
      </Tabs>

      <Box marginTop={1} flexDirection="column">
        <Text bold>Status: {activeScrape.status}</Text>
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
            />
          ) : activeTab === "medalWinners" ? (
            <MedalWinnersView
              data={scrapes.medalWinners.data}
              isActive={activeTab === "medalWinners"}
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
