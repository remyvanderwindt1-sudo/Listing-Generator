import puppeteer from "puppeteer";

export async function renderTemplate(htmlString: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1500, height: 1500, deviceScaleFactor: 1 });
    await page.setContent(htmlString, { waitUntil: "networkidle0" });

    const screenshot = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: 1500, height: 1500 },
    });

    return Buffer.from(screenshot);
  } finally {
    await browser.close();
  }
}

/**
 * Renders a specific section element from a multi-slide HTML file.
 * Used for the Cozella template system where each slide is a
 * <section data-slot="NN"> element inside a single HTML document.
 */
export async function renderTemplateElement(
  htmlString: string,
  slotIndex: number
): Promise<Buffer> {
  const slotId = String(slotIndex).padStart(2, "0");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    // Wide viewport so the full document loads; each section is self-contained at 1500px
    await page.setViewport({ width: 1500, height: 1500, deviceScaleFactor: 1 });
    await page.setContent(htmlString, { waitUntil: "networkidle0" });

    const el = await page.$(`section[data-slot="${slotId}"]`);
    if (!el) {
      throw new Error(`Cozella slide element section[data-slot="${slotId}"] not found in HTML`);
    }

    const screenshot = await el.screenshot({ type: "png" });
    return Buffer.from(screenshot);
  } finally {
    await browser.close();
  }
}
