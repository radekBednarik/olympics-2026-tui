import { chromium } from "playwright";
import type { MedalTableEntry, MedalWinner, ScrapeResult } from "../types.js";
import { MEDAL_URLS } from "../types.js";

export const scrapeMedalTable = async (): Promise<
  ScrapeResult<MedalTableEntry>
> => {
  const url = MEDAL_URLS.medalTable;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const rows = await page.$$eval("table.wikitable.sortable tbody tr", (trs) =>
      trs
        .filter((tr) => !tr.classList.contains("sortbottom"))
        .map((tr) => {
          const cells = Array.from(tr.querySelectorAll("th, td"));
          return cells.map((c) => c.textContent?.trim() ?? "");
        })
        .filter((cells) => cells.length >= 5)
    );

    // The table has: Rank | NOC (th) | Gold | Silver | Bronze | Total
    // Some rows share a rank via rowspan, so rank cell may be missing
    let lastRank = "";
    const data: MedalTableEntry[] = [];
    for (const cells of rows) {
      // Skip the header row (contains "Rank", "NOC", etc.)
      if (cells[0] === "Rank") continue;

      let rank: string;
      let countryIdx: number;
      // If first cell is numeric or empty (rowspan), determine layout
      if (cells.length === 6) {
        rank = cells[0] ?? "";
        lastRank = rank;
        countryIdx = 1;
      } else {
        // rowspan: rank cell is absent
        rank = lastRank;
        countryIdx = 0;
      }

      const country = (cells[countryIdx] ?? "").replace(/\*$/, "").trim();
      if (!country) continue;

      data.push({
        rank,
        country,
        gold: Number.parseInt(cells[countryIdx + 1] ?? "0", 10),
        silver: Number.parseInt(cells[countryIdx + 2] ?? "0", 10),
        bronze: Number.parseInt(cells[countryIdx + 3] ?? "0", 10),
        total: Number.parseInt(cells[countryIdx + 4] ?? "0", 10),
      });
    }

    return {
      url,
      timestamp: new Date().toISOString(),
      status: data.length > 0 ? "DATA_AVAILABLE" : "NO_DATA",
      data,
    };
  } catch (error) {
    return {
      url,
      timestamp: new Date().toISOString(),
      status: "ERROR",
      data: [],
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await browser.close();
  }
};

export const scrapeMedalWinners = async (): Promise<
  ScrapeResult<MedalWinner>
> => {
  const url = MEDAL_URLS.medalWinners;
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Extract sport sections: each sport is an h2 with a wikitable below it
    const data = await page.evaluate(() => {
      const parseWinner = (text: string): { name: string; country: string } => {
        if (!text) return { name: "", country: "" };
        const parts = text.split("\u00A0");
        if (parts.length >= 2) {
          const country = parts[parts.length - 1] ?? "";
          const name = parts.slice(0, -1).join(" ");
          return { name: name.trim(), country: country.trim() };
        }
        return { name: text.trim(), country: "" };
      };

      const results: {
        sport: string;
        event: string;
        gold: { name: string; country: string };
        silver: { name: string; country: string };
        bronze: { name: string; country: string };
      }[] = [];
      const content = document.querySelector(
        "#mw-content-text .mw-parser-output"
      );
      if (!content) return results;

      let currentSport = "";
      for (const el of Array.from(content.children)) {
        // Detect sport headings (h2 elements with an id)
        if (el.tagName === "DIV" && el.querySelector("h2")) {
          const heading = el.querySelector("h2");
          const span = heading?.querySelector(".mw-headline") ?? heading;
          currentSport = span?.textContent?.trim() ?? "";
          // Skip non-sport sections
          if (
            ["See also", "References", "Notes", "Changes in medals"].includes(
              currentSport
            )
          ) {
            currentSport = "";
          }
          continue;
        }

        // Process tables under a sport heading
        if (
          currentSport &&
          el.tagName === "TABLE" &&
          el.classList.contains("wikitable")
        ) {
          const rows = el.querySelectorAll("tbody tr");
          for (const row of Array.from(rows)) {
            const cells = Array.from(row.querySelectorAll("th, td"));
            const texts = cells.map((c) => c.textContent?.trim() ?? "");
            if (texts.length < 4) continue;
            if (texts[0] === "Event" || texts[0] === "Games") continue;

            const eventName = (texts[0] ?? "").replace(/details$/i, "").trim();

            results.push({
              sport: currentSport,
              event: eventName,
              gold: parseWinner(texts[1] ?? ""),
              silver: parseWinner(texts[2] ?? ""),
              bronze: parseWinner(texts[3] ?? ""),
            });
          }
        }
      }
      return results;
    });

    return {
      url,
      timestamp: new Date().toISOString(),
      status: data.length > 0 ? "DATA_AVAILABLE" : "NO_DATA",
      data,
    };
  } catch (error) {
    return {
      url,
      timestamp: new Date().toISOString(),
      status: "ERROR",
      data: [],
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await browser.close();
  }
};
