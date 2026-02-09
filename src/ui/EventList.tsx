import { Box, Text, useInput } from "ink";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { MedalWinner, WinnerDetail } from "../types.js";
import { getTheme } from "./theme.js";

interface EventListProps {
  sport: string;
  events: MedalWinner[];
  isActive: boolean;
  onBack: () => void;
}

const GENDER_LABEL: Record<string, string> = {
  men: " ♂",
  women: " ♀",
  mixed: " ⚥",
};

const genderSuffix = (gender: string | undefined): string =>
  (gender && GENDER_LABEL[gender]) ?? "";

const hasWinnerData = (winner: MedalWinner): boolean =>
  winner.gold.name !== "" ||
  winner.silver.name !== "" ||
  winner.bronze.name !== "";

const WinnerLine: React.FC<{ medal: string; detail: WinnerDetail }> = ({
  medal,
  detail,
}) => {
  const theme = getTheme();

  if (!detail.name) {
    return (
      <Text color={theme.muted}>
        {"  "}
        {medal} TBD
      </Text>
    );
  }
  return (
    <Text>
      {"  "}
      {medal} <Text bold>{detail.name}</Text>
      {detail.country ? (
        <Text color={theme.muted}> ({detail.country})</Text>
      ) : null}
    </Text>
  );
};

export const EventList: React.FC<EventListProps> = ({
  sport,
  events,
  isActive,
  onBack,
}) => {
  const [cursor, setCursor] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const mountedRef = useRef(false);
  const theme = getTheme();

  useEffect(() => {
    // Skip the first tick to avoid processing the Enter keypress that mounted this component
    const id = setTimeout(() => {
      mountedRef.current = true;
    }, 50);
    return () => clearTimeout(id);
  }, []);

  useInput(
    (_input, key) => {
      if (key.upArrow) {
        setCursor((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setCursor((prev) => Math.min(events.length - 1, prev + 1));
      } else if (key.return) {
        if (!mountedRef.current) return;
        setExpanded((prev) => (prev === cursor ? null : cursor));
      } else if (key.escape || key.backspace || key.delete) {
        if (!mountedRef.current) return;
        onBack();
      }
    },
    { isActive }
  );

  if (events.length === 0) {
    return (
      <Box flexDirection="column">
        <Box borderStyle="single" borderColor={theme.accent} paddingX={1}>
          <Text>
            <Text color={theme.muted}>By Sport</Text>{" "}
            <Text color={theme.muted}>›</Text>{" "}
            <Text bold color={theme.accent}>
              {sport}
            </Text>
          </Text>
        </Box>
        <Text color={theme.warning}>No events available.</Text>
      </Box>
    );
  }

  const decidedCount = events.filter(hasWinnerData).length;

  return (
    <Box flexDirection="column">
      <Box borderStyle="single" borderColor={theme.accent} paddingX={1}>
        <Text>
          <Text color={theme.muted}>By Sport</Text>{" "}
          <Text color={theme.muted}>›</Text>{" "}
          <Text bold color={theme.accent}>
            {sport}
          </Text>
          <Text color={theme.muted}>
            {" "}
            ({decidedCount}/{events.length} decided)
          </Text>
        </Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        {events.map((ev, i) => {
          const isSelected = i === cursor;
          const isExpanded = i === expanded;
          const hasData = hasWinnerData(ev);
          return (
            <Box
              key={`${ev.sport}-${ev.event}-${String(i)}`}
              flexDirection="column"
            >
              {isSelected ? (
                <Text color={theme.accent} bold>
                  ▸ {hasData ? "🏅 " : ""}
                  {ev.event}
                  {genderSuffix(ev.gender)}
                </Text>
              ) : hasData ? (
                <Text>
                  {"  "}🏅 {ev.event}
                  {genderSuffix(ev.gender)}
                </Text>
              ) : (
                <Text color={theme.muted}>
                  {"  "}
                  {ev.event}
                  {genderSuffix(ev.gender)}
                </Text>
              )}
              {isExpanded ? (
                <Box flexDirection="column" marginLeft={2} marginBottom={1}>
                  <WinnerLine medal="🥇" detail={ev.gold} />
                  <WinnerLine medal="🥈" detail={ev.silver} />
                  <WinnerLine medal="🥉" detail={ev.bronze} />
                </Box>
              ) : null}
            </Box>
          );
        })}
      </Box>
      <Box marginTop={1}>
        <Text color={theme.muted}>
          ↑/↓ Navigate · Enter Expand · Esc Back · 🏅 has results
        </Text>
      </Box>
    </Box>
  );
};
