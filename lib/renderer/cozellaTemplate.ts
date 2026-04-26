import { readFile } from "fs/promises";
import path from "path";
import { CozellaCopyResult } from "@/types";

// Cache the raw template in memory after first read
let templateCache: string | null = null;

async function getRawTemplate(): Promise<string> {
  if (!templateCache) {
    const filePath = path.join(process.cwd(), "cozella-templates.html");
    templateCache = await readFile(filePath, "utf-8");
  }
  return templateCache;
}

/**
 * Builds the full Cozella HTML with all placeholders replaced for a given slot.
 * Even though the entire multi-slide document is returned, only the target
 * section[data-slot="NN"] will be screenshotted by renderTemplateElement().
 */
export async function buildCozellaHtml(
  slotIndex: number,
  cozellaCopy: CozellaCopyResult,
  photoUrl: string,
  overlayOpacity: number = 0.75
): Promise<string> {
  const rawHtml = await getRawTemplate();

  // Build the flat placeholder → value map for the target slot
  const slotKey = `slot0${slotIndex}` as keyof CozellaCopyResult;
  const slotCopy = cozellaCopy[slotKey] as unknown as Record<string, string>;

  const map: Record<string, string> = {
    photoUrl,
    brandName: cozellaCopy.brandName,
    accentColor: cozellaCopy.accentColor,
    textColor: cozellaCopy.textColor,
    overlayOpacity: overlayOpacity.toString(),
    // Spread all fields from the target slot's copy
    ...(slotCopy ?? {}),
  };

  let html = rawHtml;
  for (const [key, value] of Object.entries(map)) {
    // Escape special regex characters in the placeholder key
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(new RegExp(`\\{\\{${escaped}\\}\\}`, "g"), value ?? "");
  }

  return html;
}
