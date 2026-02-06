import { chromium } from "playwright";
import type { ScrapeResult } from "../types.js";

export const scrapeUrl = async (url: string): Promise<ScrapeResult> => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const title = await page.title();

    // Heuristics for data detection
    // 1. Look for tables
    const tableCount = await page.locator("table").count();

    // 2. Look for lists that are NOT navigation
    // We assume the main nav is usually <nav> or specific classes, but here we just look at raw counts
    const listItems = await page.locator("main li").count();

    // 3. Get main text
    const mainElement = page.locator("main");
    const mainText =
      (await mainElement.count()) > 0
        ? await mainElement.innerText()
        : await page.innerText("body");

    let status: ScrapeResult["status"] = "NO_DATA";
    let content =
      "No detailed data available yet. The page seems to contain only placeholders.";

    // Refine logic:
    // If there is a table, we almost certainly have data.
    // If there is a significant amount of text in main, we might have data.
    // The current empty page has very little text in main (just headers and nav links).

    if (tableCount > 0) {
      status = "DATA_AVAILABLE";
      // Attempt to extract table data as text
      content = mainText;
    } else if (mainText.length > 300 && listItems > 10) {
      // Arbitrary thresholds: empty page usually has < 200 chars of text and < 5 list items in main
      status = "DATA_AVAILABLE";
      content = mainText;
    }

    return {
      url,
      timestamp: new Date().toISOString(),
      status,
      content,
      title,
    };
  } catch (error) {
    return {
      url,
      timestamp: new Date().toISOString(),
      status: "ERROR",
      content: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await browser.close();
  }
};
