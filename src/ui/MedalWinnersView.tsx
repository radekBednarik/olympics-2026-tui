import { Box, Text, useInput } from "ink";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { MedalWinner, WinnerDetail } from "../types.js";
import { getTheme, MEDAL_COLORS } from "./theme.js";

interface MedalWinnersViewProps {
  data: MedalWinner[];
  isActive: boolean;
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
  event: MedalWinner;
  isActive: boolean;
  onBack: () => void;
}> = ({ event, isActive, onBack }) => {
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
          <Text color={theme.muted}>Medal Winners</Text>{" "}
          <Text color={theme.muted}>{">"}</Text>{" "}
          <Text bold color={theme.accent}>
            {event.sport} — {event.event}
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

export const MedalWinnersView: React.FC<MedalWinnersViewProps> = ({
  data,
  isActive,
}) => {
  const decided = data.filter(hasWinnerData);
  const [cursor, setCursor] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const mountedRef = useRef(false);
  const theme = getTheme();

  useEffect(() => {
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
        setCursor((prev) => Math.min(decided.length - 1, prev + 1));
      } else if (key.return) {
        if (!mountedRef.current) return;
        setSelectedIndex(cursor);
      }
    },
    { isActive }
  );

  if (decided.length === 0) {
    return <Text color={theme.warning}>No medal winners announced yet.</Text>;
  }

  const selectedEvent =
    selectedIndex !== null ? decided[selectedIndex] : undefined;

  if (selectedEvent) {
    return (
      <EventDetail
        event={selectedEvent}
        isActive={isActive}
        onBack={() => setSelectedIndex(null)}
      />
    );
  }

  return (
    <Box flexDirection="column">
      <Text color={theme.success} bold>
        {decided.length} of {data.length} events decided
      </Text>
      <Box marginTop={1} flexDirection="column">
        {decided.map((ev, i) => {
          const isSelected = i === cursor;
          return (
            <Box key={`${ev.sport}-${ev.event}-${String(i)}`}>
              {isSelected ? (
                <Text color={theme.accent} bold>
                  ▸ {ev.sport} — {ev.event}
                  {genderSuffix(ev.gender)}
                </Text>
              ) : (
                <Text>
                  {"  "}
                  {ev.sport} — {ev.event}
                  {genderSuffix(ev.gender)}
                </Text>
              )}
            </Box>
          );
        })}
      </Box>
      <Box marginTop={1}>
        <Text color={theme.muted}>↑/↓ Navigate · Enter Select</Text>
      </Box>
    </Box>
  );
};
