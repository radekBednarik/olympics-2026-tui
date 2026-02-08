import { Text } from "ink";
import { useEffect, useState } from "react";
import { getTheme } from "./theme.js";

interface CountdownTimerProps {
  lastScrapeTimestamp: string;
  intervalMinutes: number;
}

const formatRemaining = (totalSeconds: number): string => {
  if (totalSeconds <= 0) return "now";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
};

export const CountdownTimer = ({
  lastScrapeTimestamp,
  intervalMinutes,
}: CountdownTimerProps): React.ReactElement => {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const ms = intervalMinutes * 60 * 1000;

    const update = (): void => {
      const lastTime = new Date(lastScrapeTimestamp).getTime();
      if (Number.isNaN(lastTime) || lastScrapeTimestamp === "") {
        setRemaining("—");
        return;
      }
      const diff = lastTime + ms - Date.now();
      setRemaining(formatRemaining(Math.max(0, Math.floor(diff / 1000))));
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lastScrapeTimestamp, intervalMinutes]);

  const theme = getTheme();

  return <Text color={theme.muted}> | Next in: {remaining}</Text>;
};
