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
