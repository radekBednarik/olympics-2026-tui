import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import type React from "react";
import { useState } from "react";
import type { ThemeVariant } from "../types.js";
import { getTheme, setThemeVariant, THEME_VARIANTS } from "./theme.js";

type ActiveField = "interval" | "theme" | "dataDir";
const FIELD_ORDER: ActiveField[] = ["interval", "theme", "dataDir"];

interface SettingsProps {
  interval: number;
  theme: ThemeVariant;
  dataDir: string;
  dataDirError: string | undefined;
  onSave: (
    newInterval: number,
    newTheme: ThemeVariant,
    newDataDir: string
  ) => void;
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  interval,
  theme,
  dataDir,
  dataDirError,
  onSave,
  onBack,
}) => {
  const [value, setValue] = useState(interval.toString());
  const [selectedTheme, setSelectedTheme] = useState<ThemeVariant>(theme);
  const [dataDirValue, setDataDirValue] = useState(dataDir);
  const [activeField, setActiveField] = useState<ActiveField>("interval");
  const currentTheme = getTheme();

  const cycleField = (): void => {
    setActiveField((prev) => {
      const idx = FIELD_ORDER.indexOf(prev);
      const next = FIELD_ORDER[(idx + 1) % FIELD_ORDER.length];
      return next ?? "interval";
    });
  };

  const cycleTheme = (direction: number): void => {
    const currentIndex = THEME_VARIANTS.indexOf(selectedTheme);
    const nextIndex =
      (currentIndex + direction + THEME_VARIANTS.length) %
      THEME_VARIANTS.length;
    const next = THEME_VARIANTS[nextIndex];
    if (next) {
      setSelectedTheme(next);
      setThemeVariant(next);
    }
  };

  useInput((_input, key) => {
    if (key.tab) {
      cycleField();
    }
    if (activeField === "theme") {
      if (key.leftArrow) {
        cycleTheme(-1);
      } else if (key.rightArrow) {
        cycleTheme(1);
      }
    }
  });

  const handleSubmit = () => {
    const num = Number.parseInt(value, 10);
    if (!Number.isNaN(num) && num > 0) {
      onSave(num, selectedTheme, dataDirValue);
    } else {
      onBack();
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Settings</Text>

      <Box marginTop={1}>
        <Text
          {...(activeField === "interval"
            ? { color: currentTheme.accent }
            : {})}
          bold={activeField === "interval"}
        >
          {activeField === "interval" ? "▸ " : "  "}Scrape Interval (minutes):{" "}
        </Text>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          focus={activeField === "interval"}
        />
      </Box>

      <Box marginTop={1}>
        <Text
          {...(activeField === "theme" ? { color: currentTheme.accent } : {})}
          bold={activeField === "theme"}
        >
          {activeField === "theme" ? "▸ " : "  "}Theme:{" "}
        </Text>
        {THEME_VARIANTS.map((v) => (
          <Text key={v}>
            {v === selectedTheme ? (
              <Text color={currentTheme.accent} bold>
                {" "}
                [{v}]{" "}
              </Text>
            ) : (
              <Text color={currentTheme.muted}> {v} </Text>
            )}
          </Text>
        ))}
      </Box>

      <Box marginTop={1}>
        <Text
          {...(activeField === "dataDir" ? { color: currentTheme.accent } : {})}
          bold={activeField === "dataDir"}
        >
          {activeField === "dataDir" ? "▸ " : "  "}Data Directory:{" "}
        </Text>
        <TextInput
          value={dataDirValue}
          onChange={setDataDirValue}
          onSubmit={handleSubmit}
          focus={activeField === "dataDir"}
        />
      </Box>

      {dataDirError ? (
        <Box marginTop={1}>
          <Text color={currentTheme.error}>⚠ {dataDirError}</Text>
        </Box>
      ) : (
        <Box marginTop={1}>
          <Text color={currentTheme.muted}>
            Leave empty to use default location
          </Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text color={currentTheme.muted}>
          Tab: switch field · ←/→: cycle theme · Enter: save · Esc: cancel
        </Text>
      </Box>
    </Box>
  );
};
