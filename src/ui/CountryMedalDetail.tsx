import { Box, Text, useInput, useStdout } from "ink";
import type React from "react";
import { useEffect, useMemo, useRef } from "react";
import type { MedalWinner } from "../types.js";
import { getTheme } from "./theme.js";
import { useScrollableList } from "./use-scrollable-list.js";

interface CountryMedalDetailProps {
  country: string;
  medals: MedalWinner[];
  isActive: boolean;
  onBack: () => void;
}

const GENDER_LABEL: Record<string, string> = {
  men: " \u2642",
  women: " \u2640",
  mixed: " \u26A5",
};

const genderSuffix = (gender: string | undefined): string =>
  (gender && GENDER_LABEL[gender]) ?? "";

const MEDAL_COLORS = {
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
} as const;

const MEDAL_LABELS = {
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
} as const;

type MedalType = keyof typeof MEDAL_COLORS;

interface MedalRow {
  sport: string;
  event: string;
  gender: string;
  medalType: MedalType;
  athlete: string;
}

/** Lines consumed by fixed UI chrome (borders, header, column header, separator, footer, etc.). */
const CHROME_OVERHEAD = 10;

/** Padding added to each column beyond the longest value. */
const COL_PAD = 2;

function buildMedalRows(medals: MedalWinner[], country: string): MedalRow[] {
  const rows: MedalRow[] = [];
  const medalTypes: MedalType[] = ["gold", "silver", "bronze"];

  for (const winner of medals) {
    for (const medalType of medalTypes) {
      const detail = winner[medalType];
      if (detail.country === country) {
        rows.push({
          sport: winner.sport,
          event: winner.event,
          gender: winner.gender,
          medalType,
          athlete: detail.name || "TBD",
        });
      }
    }
  }

  rows.sort((a, b) => {
    const sportCmp = a.sport.localeCompare(b.sport);
    if (sportCmp !== 0) return sportCmp;
    const eventCmp = a.event.localeCompare(b.event);
    if (eventCmp !== 0) return eventCmp;
    const medalOrder: MedalType[] = ["gold", "silver", "bronze"];
    return medalOrder.indexOf(a.medalType) - medalOrder.indexOf(b.medalType);
  });

  return rows;
}

export const CountryMedalDetail: React.FC<CountryMedalDetailProps> = ({
  country,
  medals,
  isActive,
  onBack,
}) => {
  const theme = getTheme();
  const { stdout } = useStdout();
  const mountedRef = useRef(false);

  useEffect(() => {
    const id = setTimeout(() => {
      mountedRef.current = true;
    }, 50);
    return () => clearTimeout(id);
  }, []);

  const rows = useMemo(
    () => buildMedalRows(medals, country),
    [medals, country]
  );

  const colWidths = useMemo(() => {
    let maxSport = "Sport".length;
    let maxEvent = "Event".length;
    let maxMedal = "Medal".length;
    let maxAthlete = "Athlete".length;

    for (const row of rows) {
      maxSport = Math.max(maxSport, row.sport.length);
      const eventStr = `${row.event}${genderSuffix(row.gender)}`;
      maxEvent = Math.max(maxEvent, eventStr.length);
      // "● " (2 chars) + label
      const medalStr = `● ${MEDAL_LABELS[row.medalType]}`;
      maxMedal = Math.max(maxMedal, medalStr.length);
      maxAthlete = Math.max(maxAthlete, row.athlete.length);
    }

    return {
      sport: maxSport + COL_PAD,
      event: maxEvent + COL_PAD,
      medal: maxMedal + COL_PAD,
      athlete: maxAthlete + COL_PAD,
    };
  }, [rows]);

  const totalW =
    colWidths.sport + colWidths.event + colWidths.medal + colWidths.athlete;

  const terminalRows = stdout.rows ?? 24;
  const viewportHeight = Math.max(1, terminalRows - CHROME_OVERHEAD);

  const { visibleRange, hasMoreAbove, hasMoreBelow, positionLabel } =
    useScrollableList({
      itemCount: rows.length,
      viewportHeight,
      isActive: isActive && mountedRef.current,
      interactive: false,
    });

  useInput(
    (_input, key) => {
      if (!mountedRef.current) return;
      if (key.escape || key.backspace || key.delete) {
        onBack();
      }
    },
    { isActive }
  );

  if (rows.length === 0) {
    return (
      <Box flexDirection="column">
        <Box borderStyle="single" borderColor={theme.accent} paddingX={1}>
          <Text>
            <Text color={theme.muted}>Medal Table</Text>{" "}
            <Text color={theme.muted}>{">"}</Text>{" "}
            <Text bold color={theme.accent}>
              {country}
            </Text>
          </Text>
        </Box>
        <Box marginTop={1} marginLeft={2}>
          <Text color={theme.warning}>
            No individual medal winner details available for {country} yet.
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text color={theme.muted}>Esc Back</Text>
        </Box>
      </Box>
    );
  }

  const visibleRows = rows.slice(visibleRange.start, visibleRange.end);

  return (
    <Box flexDirection="column">
      <Box borderStyle="single" borderColor={theme.accent} paddingX={1}>
        <Text>
          <Text color={theme.muted}>Medal Table</Text>{" "}
          <Text color={theme.muted}>{">"}</Text>{" "}
          <Text bold color={theme.accent}>
            {country}
          </Text>
          <Text color={theme.muted}>
            {" "}
            ({rows.length} medal{rows.length !== 1 ? "s" : ""})
          </Text>
        </Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text bold>
          {"Sport".padEnd(colWidths.sport)}
          {"Event".padEnd(colWidths.event)}
          {"Medal".padEnd(colWidths.medal)}
          {"Athlete".padEnd(colWidths.athlete)}
        </Text>
        <Text>{"─".repeat(totalW)}</Text>

        {hasMoreAbove && (
          <Box justifyContent="flex-end">
            <Text color={theme.muted}>▲ more above</Text>
          </Box>
        )}

        {visibleRows.map((row, i) => {
          const absoluteIndex = visibleRange.start + i;
          const sportText = row.sport.padEnd(colWidths.sport);
          const eventText = `${row.event}${genderSuffix(row.gender)}`.padEnd(
            colWidths.event
          );
          const medalLabel = MEDAL_LABELS[row.medalType].padEnd(
            colWidths.medal - 2
          );
          const athleteText = row.athlete.padEnd(colWidths.athlete);

          const textProps: { backgroundColor?: string } = {};
          if (absoluteIndex % 2 === 1) {
            textProps.backgroundColor = theme.surfaceDark;
          }

          return (
            <Text
              key={`${row.sport}-${row.event}-${row.medalType}-${String(absoluteIndex)}`}
              {...textProps}
            >
              {sportText}
              {eventText}
              <Text color={MEDAL_COLORS[row.medalType]}>
                {"● "}
                {medalLabel}
              </Text>
              {athleteText}
            </Text>
          );
        })}

        {hasMoreBelow && (
          <Box justifyContent="flex-end">
            <Text color={theme.muted}>▼ more below</Text>
          </Box>
        )}
      </Box>

      {(() => {
        const isScrollable = hasMoreAbove || hasMoreBelow;
        return (
          <Box marginTop={1} justifyContent="space-between">
            <Text color={theme.muted}>
              {isScrollable ? "PgUp/PgDn Scroll · " : ""}Esc Back
            </Text>
            {isScrollable && <Text color={theme.muted}>{positionLabel}</Text>}
          </Box>
        );
      })()}
    </Box>
  );
};
