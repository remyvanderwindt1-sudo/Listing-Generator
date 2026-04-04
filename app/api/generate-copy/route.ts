import { NextRequest, NextResponse } from "next/server";
import { generateCopy } from "@/lib/claude/generateCopy";
import { getSession, setSession } from "@/lib/store";
import { CopyResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, slotIndex, temperature = 0.7 } = body as {
      sessionId: string;
      slotIndex?: number;       // if provided, regenerate only this slot
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

    const allCopy = await generateCopy(
      session.productName,
      session.category,
      session.insights,
      session.language ?? "nl",
      temperature
    );

    if (slotIndex !== undefined) {
      // Per-slot regenerate: update only the requested slot, return only that slot
      const slotKey = `slot0${slotIndex}` as keyof CopyResult;
      const updatedCopy: CopyResult = { ...session.copy, [slotKey]: allCopy[slotKey] };
      setSession(sessionId, { ...session, copy: updatedCopy });
      return NextResponse.json({ copy: allCopy[slotKey], slotIndex });
    }

    // Full regenerate (all slots)
    setSession(sessionId, { ...session, copy: allCopy });
    return NextResponse.json({ copy: allCopy });
  } catch (error) {
    console.error("Generate copy error:", error);
    const message =
      error instanceof Error ? error.message : "Copy generation failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
