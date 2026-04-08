import { readFile } from "fs/promises";
import path from "path";
import { CozellaCopyResult } from "@/types";

let templateCache: string | null = null;

async function getRawTemplate(): Promise<string> {
  if (!templateCache) {
    const filePath = path.join(process.cwd(), "rambux-templates.html");
    templateCache = await readFile(filePath, "utf-8");
  }
  return templateCache;
}

/**
 * Builds the full RAMBUX® HTML with all placeholders replaced for a given slot.
 * brandName, accentColor and textColor are hardcoded to RAMBUX® brand values.
 */
export async function buildRambuxHtml(
  slotIndex: number,
  rambuxCopy: CozellaCopyResult,
  photoUrl: string
): Promise<string> {
  const rawHtml = await getRawTemplate();

  const slotKey = `slot0${slotIndex}` as keyof CozellaCopyResult;
  const slotCopy = rambuxCopy[slotKey] as unknown as Record<string, string>;

  const map: Record<string, string> = {
    photoUrl,
    brandName: "RAMBUX®",
    accentColor: "#F5B800",
    textColor: "#111111",
    ...(slotCopy ?? {}),
  };

  let html = rawHtml;
  for (const [key, value] of Object.entries(map)) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(new RegExp(`\\{\\{${escaped}\\}\\}`, "g"), value ?? "");
  }

  return html;
}
