import { Box, Text } from "ink";
import { Tab, Tabs } from "ink-tab";
import type React from "react";
import { useState } from "react";
import type { AppStore, MedalTableEntry, MedalWinner } from "../types.js";

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

const MedalWinnersView: React.FC<{
  data: MedalWinner[];
}> = ({ data }) => {
  if (data.length === 0) {
    return <Text color="yellow">No medal winners data available yet.</Text>;
  }
  const eW = 32;
  const wW = 26;
  return (
    <Box flexDirection="column">
      <Box>
        <Text bold>
          {"Event".padEnd(eW)}
          {"Gold".padEnd(wW)}
          {"Silver".padEnd(wW)}
          {"Bronze".padEnd(wW)}
        </Text>
      </Box>
      <Text>{"─".repeat(eW + wW * 3)}</Text>
      {data.map((row) => (
        <Box key={`${row.sport}-${row.event}`}>
          <Text>
            {row.event.slice(0, eW - 2).padEnd(eW)}
            {row.gold.slice(0, wW - 2).padEnd(wW)}
            {row.silver.slice(0, wW - 2).padEnd(wW)}
            {row.bronze.slice(0, wW - 2).padEnd(wW)}
          </Text>
        </Box>
      ))}
    </Box>
  );
};

const BySportView: React.FC<{
  data: MedalWinner[];
}> = ({ data }) => {
  if (data.length === 0) {
    return <Text color="yellow">No medal winners data available yet.</Text>;
  }
  const grouped = new Map<string, MedalWinner[]>();
  for (const w of data) {
    const existing = grouped.get(w.sport);
    if (existing) {
      existing.push(w);
    } else {
      grouped.set(w.sport, [w]);
    }
  }

  const eW = 30;
  const wW = 24;
  return (
    <Box flexDirection="column">
      {Array.from(grouped.entries()).map(([sport, winners]) => (
        <Box key={sport} flexDirection="column" marginBottom={1}>
          <Text bold color="cyan">
            ▸ {sport}
          </Text>
          {winners.map((row) => (
            <Box key={`${sport}-${row.event}`} marginLeft={2}>
              <Text>
                {row.event.slice(0, eW - 2).padEnd(eW)}
                <Text color="yellow">
                  {row.gold.slice(0, wW - 2).padEnd(wW)}
                </Text>
                <Text color="white">
                  {row.silver.slice(0, wW - 2).padEnd(wW)}
                </Text>
                <Text color="red">
                  {row.bronze.slice(0, wW - 2).padEnd(wW)}
                </Text>
              </Text>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
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
    <Box flexDirection="column" padding={1} borderStyle="single">
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
          ) : activeTab === "medalWinners" ? (
            <MedalWinnersView data={scrapes.medalWinners.data} />
          ) : (
            <BySportView data={scrapes.medalWinners.data} />
          )}
        </Box>
      </Box>
    </Box>
  );
};
