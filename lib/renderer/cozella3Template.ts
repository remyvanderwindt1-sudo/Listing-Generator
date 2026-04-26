import { readFile } from "fs/promises";
import path from "path";
import { CozellaV3Data } from "@/types";

let templateCache: string | null = null;

async function getRawTemplate(): Promise<string> {
  if (!templateCache) {
    const filePath = path.join(process.cwd(), "Cozella-Template-3.html");
    templateCache = await readFile(filePath, "utf-8");
  }
  return templateCache;
}

export async function buildCozella3Html(
  slotIndex: number,
  data: CozellaV3Data,
  photoUrl: string
): Promise<string> {
  const rawHtml = await getRawTemplate();

  const injectedData = {
    ...data,
    layout: `l${slotIndex + 1}`,
    product_image: photoUrl,
    product_image_label: "Productfoto",
  };

  let html = rawHtml.replace('<body class="preview">', "<body>");
  html = html.replace(
    "<!-- ======== DATA ======== -->",
    `<script>window.COZ_DATA = ${JSON.stringify(injectedData)};</script>\n<!-- ======== DATA ======== -->`
  );
  return html;
}
