import { NextRequest, NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/store";
import { renderTemplate, renderTemplateElement } from "@/lib/renderer/puppeteer";
import {
  slot00Template,
  slot01Template,
  slot02Template,
  slot03Template,
  slot04Template,
} from "@/lib/renderer/templates";
import { buildCozellaHtml } from "@/lib/renderer/cozellaTemplate";
import { buildRambuxHtml } from "@/lib/renderer/rambuxTemplate";
import { StyleConfig } from "@/types/style";
import { CozellaCopyResult } from "@/types";
import path from "path";
import { readFile } from "fs/promises";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      slotIndex,
      copy: overrideCopy,
      styleOverride: overrideStyle,
      overlayOpacity,
    } = body as {
      sessionId: string;
      slotIndex: number;
      copy?: Record<string, unknown>;
      styleOverride?: StyleConfig;
      overlayOpacity?: number;
    };

    if (sessionId === undefined || slotIndex === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, slotIndex" },
        { status: 400 }
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found. Please start over." },
        { status: 404 }
      );
    }

    // Resolve photo
    const photoWebPath =
      session.slotPhotoMap[slotIndex] ??
      session.photoPaths[slotIndex % Math.max(session.photoPaths.length, 1)] ??
      session.photoPaths[0];

    if (!photoWebPath) {
      return NextResponse.json({ error: "No photo found for this slot." }, { status: 400 });
    }

    const absolutePath = path.join(process.cwd(), "public", photoWebPath);
    const imageBuffer = await readFile(absolutePath);
    const dataUrl = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

    if (session.slotPhotoMap[slotIndex] === undefined) {
      setSession(sessionId, {
        ...session,
        slotPhotoMap: { ...session.slotPhotoMap, [slotIndex]: photoWebPath },
      });
    }

    const mode = session.templateMode ?? "amazon";

    // ── Cozella / RAMBUX rendering path ──────────────────────────────────────
    if (mode === "cozella" || mode === "rambux") {
      if (!session.cozellaCopy) {
        return NextResponse.json(
          { error: `No ${mode} copy found for this session.` },
          { status: 400 }
        );
      }

      const slotKey = `slot0${slotIndex}` as keyof CozellaCopyResult;
      const templateCopy: CozellaCopyResult = {
        ...session.cozellaCopy,
        ...(overrideCopy ? { [slotKey]: overrideCopy } : {}),
      };

      const html = mode === "rambux"
        ? await buildRambuxHtml(slotIndex, templateCopy, dataUrl, overlayOpacity ?? 0.6)
        : await buildCozellaHtml(slotIndex, templateCopy, dataUrl, overlayOpacity ?? 0.75);
      const pngBuffer = await renderTemplateElement(html, slotIndex);

      return new NextResponse(new Uint8Array(pngBuffer), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="infographic-${mode}-slot-0${slotIndex}.png"`,
          "Content-Length": pngBuffer.length.toString(),
        },
      });
    }

    // ── Amazon rendering path ─────────────────────────────────────────────────
    const slotCopy =
      overrideCopy ??
      (session.copy as unknown as Record<string, unknown>)[`slot0${slotIndex}`];
    if (!slotCopy) {
      return NextResponse.json(
        { error: `No copy found for slot ${slotIndex}.` },
        { status: 400 }
      );
    }

    const style: StyleConfig | undefined = overrideStyle ?? session.styleOverride;

    let html: string;
    switch (slotIndex) {
      case 0:
        html = slot00Template(dataUrl, slotCopy as Parameters<typeof slot00Template>[1], style);
        break;
      case 1:
        html = slot01Template(dataUrl, slotCopy as Parameters<typeof slot01Template>[1], style);
        break;
      case 2:
        html = slot02Template(dataUrl, slotCopy as Parameters<typeof slot02Template>[1], style);
        break;
      case 3:
        html = slot03Template(dataUrl, slotCopy as Parameters<typeof slot03Template>[1], style);
        break;
      case 4:
        html = slot04Template(dataUrl, slotCopy as Parameters<typeof slot04Template>[1], style);
        break;
      default:
        return NextResponse.json({ error: "Invalid slot index (0–4)." }, { status: 400 });
    }

    const pngBuffer = await renderTemplate(html);

    return new NextResponse(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="infographic-slot-0${slotIndex}.png"`,
        "Content-Length": pngBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Render error:", error);
    return NextResponse.json(
      { error: "Render failed. Please try again." },
      { status: 500 }
    );
  }
}
