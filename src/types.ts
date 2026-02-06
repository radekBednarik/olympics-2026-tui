export type ScrapeStatus = "PENDING" | "NO_DATA" | "DATA_AVAILABLE" | "ERROR";

export interface ScrapeResult {
  url: string;
  timestamp: string; // ISO date
  status: ScrapeStatus;
  content: string; // Text summary or JSON string of table data
  title?: string;
}

export interface AppStore {
  config: {
    intervalMinutes: number;
  };
  scrapes: {
    medalTable: ScrapeResult;
    medallists: ScrapeResult;
    bySport: ScrapeResult;
  };
}

export const MEDAL_URLS = {
  medalTable: "https://www.olympics.com/en/milano-cortina-2026/medals",
  medallists:
    "https://www.olympics.com/en/milano-cortina-2026/medals/medallists",
  bySport:
    "https://www.olympics.com/en/milano-cortina-2026/medals/medals-by-sport",
};

export const INITIAL_STORE: AppStore = {
  config: {
    intervalMinutes: 30,
  },
  scrapes: {
    medalTable: {
      url: MEDAL_URLS.medalTable,
      timestamp: "",
      status: "PENDING",
      content: "",
    },
    medallists: {
      url: MEDAL_URLS.medallists,
      timestamp: "",
      status: "PENDING",
      content: "",
    },
    bySport: {
      url: MEDAL_URLS.bySport,
      timestamp: "",
      status: "PENDING",
      content: "",
    },
  },
};
