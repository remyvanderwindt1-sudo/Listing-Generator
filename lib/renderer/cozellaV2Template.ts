import { readFile } from "fs/promises";
import path from "path";
import { CozellaV2CopyResult } from "@/types";

let templateCache: string | null = null;

async function getRawTemplate(): Promise<string> {
  if (!templateCache) {
    const filePath = path.join(process.cwd(), "cozella-v2-templates.html");
    templateCache = await readFile(filePath, "utf-8");
  }
  return templateCache;
}

export async function buildCozellaV2Html(
  slotIndex: number,
  copy: CozellaV2CopyResult,
  photoUrl: string,
  overlayOpacity = 0.75
): Promise<string> {
  const rawHtml = await getRawTemplate();

  const slotKey = `slot0${slotIndex}` as keyof CozellaV2CopyResult;
  const slotCopy = copy[slotKey] as unknown as Record<string, string>;

  const map: Record<string, string> = {
    photoUrl,
    brandName: copy.brandName,
    overlayOpacity: overlayOpacity.toString(),
    ...(slotCopy ?? {}),
  };

  let html = rawHtml;
  for (const [key, value] of Object.entries(map)) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(new RegExp(`\\{\\{${escaped}\\}\\}`, "g"), value ?? "");
  }

  return html;
}
