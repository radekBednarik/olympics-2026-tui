import { Box, Text, useInput } from "ink";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { MedalWinner, WinnerDetail } from "../types.js";
import { getTheme, MEDAL_COLORS } from "./theme.js";

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

const formatWinner = (detail: WinnerDetail): string => {
  if (!detail.name) return "TBD";
  return detail.country ? `${detail.name} (${detail.country})` : detail.name;
};

const EventDetail: React.FC<{
  sport: string;
  event: MedalWinner;
  isActive: boolean;
  onBack: () => void;
}> = ({ sport, event, isActive, onBack }) => {
  const theme = getTheme();
  const mountedRef = useRef(false);

  useEffect(() => {
    const id = setTimeout(() => {
      mountedRef.current = true;
    }, 50);
    return () => clearTimeout(id);
  }, []);

  useInput(
    (_input, key) => {
      if (!mountedRef.current) return;
      if (key.escape || key.backspace || key.delete) {
        onBack();
      }
    },
    { isActive }
  );

  return (
    <Box flexDirection="column">
      <Box borderStyle="single" borderColor={theme.accent} paddingX={1}>
        <Text>
          <Text color={theme.muted}>By Sport</Text>{" "}
          <Text color={theme.muted}>{">"}</Text>{" "}
          <Text color={theme.muted}>{sport}</Text>{" "}
          <Text color={theme.muted}>{">"}</Text>{" "}
          <Text bold color={theme.accent}>
            {event.event}
            {genderSuffix(event.gender)}
          </Text>
        </Text>
      </Box>
      <Box marginTop={1} flexDirection="column" marginLeft={2}>
        <Text>
          {"  "}
          <Text bold color={MEDAL_COLORS.gold}>
            ● Gold:
          </Text>{" "}
          <Text bold>{formatWinner(event.gold)}</Text>
        </Text>
        <Text>
          {"  "}
          <Text bold color={MEDAL_COLORS.silver}>
            ● Silver:
          </Text>{" "}
          <Text>{formatWinner(event.silver)}</Text>
        </Text>
        <Text>
          {"  "}
          <Text bold color={MEDAL_COLORS.bronze}>
            ● Bronze:
          </Text>{" "}
          <Text>{formatWinner(event.bronze)}</Text>
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color={theme.muted}>Esc Back</Text>
      </Box>
    </Box>
  );
};

export const EventList: React.FC<EventListProps> = ({
  sport,
  events,
  isActive,
  onBack,
}) => {
  const [cursor, setCursor] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
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
      if (selectedIndex !== null) return;
      if (key.upArrow) {
        setCursor((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setCursor((prev) => Math.min(events.length - 1, prev + 1));
      } else if (key.return) {
        if (!mountedRef.current) return;
        setSelectedIndex(cursor);
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
            <Text color={theme.muted}>{">"}</Text>{" "}
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

  const selectedEvent =
    selectedIndex !== null ? events[selectedIndex] : undefined;

  if (selectedEvent) {
    return (
      <EventDetail
        sport={sport}
        event={selectedEvent}
        isActive={isActive}
        onBack={() => setSelectedIndex(null)}
      />
    );
  }

  return (
    <Box flexDirection="column">
      <Box borderStyle="single" borderColor={theme.accent} paddingX={1}>
        <Text>
          <Text color={theme.muted}>By Sport</Text>{" "}
          <Text color={theme.muted}>{">"}</Text>{" "}
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
          const hasData = hasWinnerData(ev);
          return (
            <Box key={`${ev.sport}-${ev.event}-${String(i)}`}>
              {isSelected ? (
                <Text color={theme.accent} bold>
                  ▸ {hasData ? "● " : "  "}
                  {ev.event}
                  {genderSuffix(ev.gender)}
                </Text>
              ) : hasData ? (
                <Text>
                  {"  "}
                  <Text color={theme.success}>● </Text>
                  {ev.event}
                  {genderSuffix(ev.gender)}
                </Text>
              ) : (
                <Text color={theme.muted}>
                  {"    "}
                  {ev.event}
                  {genderSuffix(ev.gender)}
                </Text>
              )}
            </Box>
          );
        })}
      </Box>
      <Box marginTop={1}>
        <Text color={theme.muted}>
          ↑/↓ Navigate · Enter Select · Esc Back ·{" "}
          <Text color={theme.success}>●</Text> has results
        </Text>
      </Box>
    </Box>
  );
};
