import { Box, Text } from "ink";
import { Tab, Tabs } from "ink-tab";
import type React from "react";
import { useState } from "react";
import type { AppStore } from "../types.js";

interface DashboardProps {
  scrapes: AppStore["scrapes"];
}

export const Dashboard: React.FC<DashboardProps> = ({ scrapes }) => {
  // Using local state to manage active tab name
  const [activeTab, setActiveTab] = useState<string>("medalTable");

  const handleTabChange = (name: string) => {
    setActiveTab(name);
  };

  const currentScrape = scrapes[activeTab as keyof typeof scrapes];

  return (
    <Box flexDirection="column" padding={1} borderStyle="single">
      <Tabs onChange={handleTabChange}>
        <Tab name="medalTable">Medal Table</Tab>
        <Tab name="medallists">Medallists</Tab>
        <Tab name="bySport">By Sport</Tab>
      </Tabs>

      <Box marginTop={1} flexDirection="column">
        <Text bold>Status: {currentScrape?.status}</Text>
        <Text color="gray">
          Last Updated:{" "}
          {currentScrape?.timestamp
            ? new Date(currentScrape.timestamp).toLocaleString()
            : "Never"}
        </Text>

        <Box
          marginTop={1}
          borderStyle="round"
          borderColor={
            currentScrape?.status === "DATA_AVAILABLE" ? "green" : "yellow"
          }
          padding={1}
        >
          {currentScrape?.status === "NO_DATA" ? (
            <Text color="yellow">
              Creating history takes time! Check back later for official
              results.
              {"\n"}
              --- Raw Content Preview ---
              {"\n"}
              {currentScrape.content.slice(0, 200)}...
            </Text>
          ) : currentScrape?.status === "ERROR" ? (
            <Text color="red">Error: {currentScrape.content}</Text>
          ) : (
            <Text>{currentScrape?.content || "No content loaded."}</Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};
