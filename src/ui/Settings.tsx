import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import type React from "react";
import { useState } from "react";
import type { ThemeVariant } from "../types.js";
import { getTheme, setThemeVariant, THEME_VARIANTS } from "./theme.js";

interface SettingsProps {
  interval: number;
  theme: ThemeVariant;
  onSave: (newInterval: number, newTheme: ThemeVariant) => void;
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  interval,
  theme,
  onSave,
  onBack,
}) => {
  const [value, setValue] = useState(interval.toString());
  const [selectedTheme, setSelectedTheme] = useState<ThemeVariant>(theme);
  const [activeField, setActiveField] = useState<"interval" | "theme">(
    "interval"
  );
  const currentTheme = getTheme();

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
      setActiveField((prev) => (prev === "interval" ? "theme" : "interval"));
    }
    if (activeField === "theme") {
      if (key.leftArrow) {
        cycleTheme(-1);
      } else if (key.rightArrow) {
        cycleTheme(1);
      }
    }
  });

  const handleSubmit = (val: string) => {
    const num = Number.parseInt(val, 10);
    if (!Number.isNaN(num) && num > 0) {
      onSave(num, selectedTheme);
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
        <Text color={currentTheme.muted}>
          Tab: switch field · ←/→: cycle theme · Enter: save · Esc: cancel
        </Text>
      </Box>
    </Box>
  );
};
