import { NextRequest, NextResponse } from "next/server";
import { generateCopy, generateCozellaCopy, generateRambuxCopy } from "@/lib/claude/generateCopy";
import { getSession, setSession } from "@/lib/store";
import { CopyResult, CozellaCopyResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, slotIndex, temperature = 0.7 } = body as {
      sessionId: string;
      slotIndex?: number;
      temperature?: number;
    };

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing required field: sessionId" },
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

    if (!session.insights) {
      return NextResponse.json(
        { error: "No insights found. Run /api/analyze first." },
        { status: 400 }
      );
    }

    const lang = session.language ?? "nl";
    const mode = session.templateMode ?? "amazon";

    // ── Cozella / RAMBUX mode ────────────────────────────────────────────────
    if (mode === "cozella" || mode === "rambux") {
      const allCopy = await (mode === "rambux" ? generateRambuxCopy : generateCozellaCopy)(
        session.productName,
        session.category,
        session.insights,
        lang,
        temperature
      );

      if (slotIndex !== undefined) {
        const slotKey = `slot0${slotIndex}` as keyof CozellaCopyResult;
        const updatedCozella: CozellaCopyResult = {
          ...(session.cozellaCopy ?? allCopy),
          [slotKey]: allCopy[slotKey],
        };
        setSession(sessionId, { ...session, cozellaCopy: updatedCozella });
        return NextResponse.json({ copy: allCopy[slotKey], slotIndex });
      }

      setSession(sessionId, { ...session, cozellaCopy: allCopy });
      return NextResponse.json({ copy: allCopy });
    }

    // ── Amazon mode ───────────────────────────────────────────────────────────
    const allCopy = await generateCopy(
      session.productName,
      session.category,
      session.insights,
      lang,
      temperature
    );

    if (slotIndex !== undefined) {
      const slotKey = `slot0${slotIndex}` as keyof CopyResult;
      const updatedCopy: CopyResult = { ...session.copy, [slotKey]: allCopy[slotKey] };
      setSession(sessionId, { ...session, copy: updatedCopy });
      return NextResponse.json({ copy: allCopy[slotKey], slotIndex });
    }

    setSession(sessionId, { ...session, copy: allCopy });
    return NextResponse.json({ copy: allCopy });
  } catch (error) {
    console.error("Generate copy error:", error);
    const message =
      error instanceof Error ? error.message : "Copy generation failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
