import { NextRequest, NextResponse } from "next/server";
import { tweakCopy } from "@/lib/claude/tweakCopy";
import { getSession, setSession } from "@/lib/store";
import { CopyResult, Language, SlotCopy } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, slotIndex, userRequest } = body as {
      sessionId: string;
      slotIndex: number;
      userRequest: string;
    };

    if (!sessionId || slotIndex === undefined || !userRequest?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, slotIndex, userRequest" },
        { status: 400 }
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    const slotKey = `slot0${slotIndex}` as keyof CopyResult;
    const currentCopy = session.copy[slotKey] as SlotCopy;
    if (!currentCopy) {
      return NextResponse.json(
        { error: `No copy found for slot ${slotIndex}.` },
        { status: 400 }
      );
    }

    const updatedSlotCopy = await tweakCopy(
      slotKey,
      currentCopy,
      userRequest,
      session.language ?? "nl"
    );

    // Persist updated copy back to session
    const updatedCopy: CopyResult = {
      ...session.copy,
      [slotKey]: updatedSlotCopy,
    };
    setSession(sessionId, { ...session, copy: updatedCopy });

    return NextResponse.json({ copy: updatedSlotCopy });
  } catch (error) {
    console.error("Tweak error:", error);
    const message = error instanceof Error ? error.message : "Tweak failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
