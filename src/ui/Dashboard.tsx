import { Box, Text } from "ink";
import { Tab, Tabs } from "ink-tab";
import type React from "react";
import { useMemo, useState } from "react";
import type { AppStore, MedalTableEntry, MedalWinner } from "../types.js";
import { CategoryList } from "./CategoryList.js";
import { EventList } from "./EventList.js";

interface DashboardProps {
  scrapes: AppStore["scrapes"];
}

const MedalTableView: React.FC<{
  data: MedalTableEntry[];
}> = ({ data }) => {
  if (data.length === 0) {
    return <Text color="yellow">No medal table data available yet.</Text>;
  }
  const rW = 6;
  const cW = 20;
  const mW = 7;
  return (
    <Box flexDirection="column">
      <Box>
        <Text bold>
          {"Rank".padEnd(rW)}
          {"Country".padEnd(cW)}
          {"🥇".padEnd(mW)}
          {"🥈".padEnd(mW)}
          {"🥉".padEnd(mW)}
          {"Total".padEnd(mW)}
        </Text>
      </Box>
      <Text>{"─".repeat(rW + cW + mW * 4)}</Text>
      {data.map((row) => (
        <Box key={`${row.rank}-${row.country}`}>
          <Text>
            {row.rank.padEnd(rW)}
            {row.country.padEnd(cW)}
            {String(row.gold).padEnd(mW)}
            {String(row.silver).padEnd(mW)}
            {String(row.bronze).padEnd(mW)}
            {String(row.total).padEnd(mW)}
          </Text>
        </Box>
      ))}
    </Box>
  );
};

const SportEventsView: React.FC<{
  data: MedalWinner[];
  isActive: boolean;
}> = ({ data, isActive }) => {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

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

  if (data.length === 0) {
    return <Text color="yellow">No medal winners data available yet.</Text>;
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
      isActive={isActive}
      onSelect={setSelectedSport}
    />
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ scrapes }) => {
  const [activeTab, setActiveTab] = useState<string>("medalTable");

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
        <Text color="gray">
          Last Updated:{" "}
          {activeScrape.timestamp
            ? new Date(activeScrape.timestamp).toLocaleString()
            : "Never"}
        </Text>

        <Box
          marginTop={1}
          borderStyle="round"
          borderColor={
            activeScrape.status === "DATA_AVAILABLE" ? "green" : "yellow"
          }
          padding={1}
        >
          {activeScrape.status === "ERROR" ? (
            <Text color="red">Error: {activeScrape.error}</Text>
          ) : activeTab === "medalTable" ? (
            <MedalTableView data={scrapes.medalTable.data} />
          ) : (
            <SportEventsView
              data={scrapes.medalWinners.data}
              isActive={activeTab === "medalWinners" || activeTab === "bySport"}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};
