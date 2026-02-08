import { Box, Text, useInput } from "ink";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { MedalWinner, WinnerDetail } from "../types.js";

interface EventListProps {
  sport: string;
  events: MedalWinner[];
  isActive: boolean;
  onBack: () => void;
}

const WinnerLine: React.FC<{ medal: string; detail: WinnerDetail }> = ({
  medal,
  detail,
}) => {
  if (!detail.name) {
    return (
      <Text color="gray">
        {"  "}
        {medal} TBD
      </Text>
    );
  }
  return (
    <Text>
      {"  "}
      {medal} <Text bold>{detail.name}</Text>
      {detail.country ? <Text color="gray"> ({detail.country})</Text> : null}
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
        <Text bold color="cyan">
          ◂ {sport}
        </Text>
        <Text color="yellow">No events available.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">
        ◂ {sport}
      </Text>
      <Box marginTop={1} flexDirection="column">
        {events.map((ev, i) => {
          const isSelected = i === cursor;
          const isExpanded = i === expanded;
          return (
            <Box
              key={`${ev.sport}-${ev.event}-${String(i)}`}
              flexDirection="column"
            >
              {isSelected ? (
                <Text color="cyan" bold>
                  ▸ {ev.event}
                </Text>
              ) : (
                <Text>
                  {"  "}
                  {ev.event}
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
        <Text color="gray">↑/↓ Navigate · Enter Expand · Esc Back</Text>
      </Box>
    </Box>
  );
};
