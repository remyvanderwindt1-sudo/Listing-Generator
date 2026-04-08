import { NextRequest, NextResponse } from "next/server";
import { tweakCopy } from "@/lib/claude/tweakCopy";
import { getSession, setSession } from "@/lib/store";
import { CopyResult, CozellaCopyResult, SlotCopy } from "@/types";

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

    const mode = session.templateMode ?? "amazon";
    const slotKey = `slot0${slotIndex}` as keyof CopyResult & keyof CozellaCopyResult;

    if (mode === "cozella" || mode === "rambux") {
      // Cozella: read from cozellaCopy
      const currentCopy = session.cozellaCopy?.[slotKey] as SlotCopy | undefined;
      if (!currentCopy) {
        return NextResponse.json(
          { error: `No Cozella copy found for slot ${slotIndex}.` },
          { status: 400 }
        );
      }

      const updatedSlotCopy = await tweakCopy(
        slotKey as keyof CopyResult,
        currentCopy,
        userRequest,
        session.language ?? "nl"
      );

      const updatedCozella: CozellaCopyResult = {
        ...(session.cozellaCopy!),
        [slotKey]: updatedSlotCopy,
      };
      setSession(sessionId, { ...session, cozellaCopy: updatedCozella });
      return NextResponse.json({ copy: updatedSlotCopy });
    }

    // Amazon mode
    const currentCopy = session.copy[slotKey as keyof CopyResult] as SlotCopy;
    if (!currentCopy) {
      return NextResponse.json(
        { error: `No copy found for slot ${slotIndex}.` },
        { status: 400 }
      );
    }

    const updatedSlotCopy = await tweakCopy(
      slotKey as keyof CopyResult,
      currentCopy,
      userRequest,
      session.language ?? "nl"
    );

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
