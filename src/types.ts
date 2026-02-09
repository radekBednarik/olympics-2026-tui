export type ThemeVariant = "dark" | "storm" | "light";

export type ScrapeStatus = "PENDING" | "NO_DATA" | "DATA_AVAILABLE" | "ERROR";

export interface MedalTableEntry {
  rank: string;
  country: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

export interface MedalDeltas {
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

export interface WinnerDetail {
  name: string;
  country: string;
}

export type EventGender = "men" | "women" | "mixed" | "";

export interface MedalWinner {
  sport: string;
  event: string;
  gender: EventGender;
  gold: WinnerDetail;
  silver: WinnerDetail;
  bronze: WinnerDetail;
}

export interface ScrapeResult<T = unknown> {
  url: string;
  timestamp: string;
  status: ScrapeStatus;
  data: T[];
  error?: string;
}

export interface AppStore {
  config: {
    intervalMinutes: number;
    theme: ThemeVariant;
  };
  scrapes: {
    medalTable: ScrapeResult<MedalTableEntry>;
    medalWinners: ScrapeResult<MedalWinner>;
  };
}

export const MEDAL_URLS = {
  medalTable: "https://en.wikipedia.org/wiki/2026_Winter_Olympics_medal_table",
  medalWinners:
    "https://en.wikipedia.org/wiki/List_of_2026_Winter_Olympics_medal_winners",
};

export const INITIAL_STORE: AppStore = {
  config: {
    intervalMinutes: 30,
    theme: "dark",
  },
  scrapes: {
    medalTable: {
      url: MEDAL_URLS.medalTable,
      timestamp: "",
      status: "PENDING",
      data: [],
    },
    medalWinners: {
      url: MEDAL_URLS.medalWinners,
      timestamp: "",
      status: "PENDING",
      data: [],
    },
  },
};
