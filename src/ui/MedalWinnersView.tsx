import { Box, Text, useInput } from "ink";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { MedalWinner, WinnerDetail } from "../types.js";

interface MedalWinnersViewProps {
  data: MedalWinner[];
  isActive: boolean;
}

const hasWinnerData = (winner: MedalWinner): boolean =>
  winner.gold.name !== "" ||
  winner.silver.name !== "" ||
  winner.bronze.name !== "";

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

export const MedalWinnersView: React.FC<MedalWinnersViewProps> = ({
  data,
  isActive,
}) => {
  const decided = data.filter(hasWinnerData);
  const [cursor, setCursor] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
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
        setCursor((prev) => Math.min(decided.length - 1, prev + 1));
      } else if (key.return) {
        if (!mountedRef.current) return;
        setExpanded((prev) => (prev === cursor ? null : cursor));
      }
    },
    { isActive }
  );

  if (decided.length === 0) {
    return <Text color="yellow">No medal winners announced yet.</Text>;
  }

  return (
    <Box flexDirection="column">
      <Text color="green" bold>
        {decided.length} of {data.length} events decided
      </Text>
      <Box marginTop={1} flexDirection="column">
        {decided.map((ev, i) => {
          const isSelected = i === cursor;
          const isExpanded = i === expanded;
          return (
            <Box
              key={`${ev.sport}-${ev.event}-${String(i)}`}
              flexDirection="column"
            >
              {isSelected ? (
                <Text color="cyan" bold>
                  ▸ {ev.sport} — {ev.event}
                </Text>
              ) : (
                <Text>
                  {"  "}
                  {ev.sport} — {ev.event}
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
        <Text color="gray">↑/↓ Navigate · Enter Expand</Text>
      </Box>
    </Box>
  );
};
