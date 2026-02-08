import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import type React from "react";
import { useState } from "react";
import { getTheme } from "./theme.js";

interface SettingsProps {
  interval: number;
  onSave: (newInterval: number) => void;
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  interval,
  onSave,
  onBack,
}) => {
  const [value, setValue] = useState(interval.toString());
  const theme = getTheme();

  const handleSubmit = (val: string) => {
    const num = parseInt(val, 10);
    if (!Number.isNaN(num) && num > 0) {
      onSave(num);
    } else {
      // If invalid, just go back or maybe show error?
      // For simplicity, just go back without saving if invalid
      onBack();
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Settings</Text>
      <Box marginTop={1}>
        <Text>Set Scrape Interval (minutes): </Text>
        <TextInput value={value} onChange={setValue} onSubmit={handleSubmit} />
      </Box>
      <Box marginTop={1}>
        <Text color={theme.muted}>Press Enter to save. Esc to cancel.</Text>
      </Box>
    </Box>
  );
};
