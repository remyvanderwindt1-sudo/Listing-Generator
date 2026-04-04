import { NextRequest, NextResponse } from "next/server";
import { tweakStyle } from "@/lib/claude/tweakStyle";
import { getSession, setSession } from "@/lib/store";
import { StyleConfig } from "@/types/style";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userRequest, currentStyle = null, applyToAll = false } = body as {
      sessionId: string;
      userRequest: string;
      currentStyle?: StyleConfig | null;
      applyToAll?: boolean;
    };

    if (!sessionId || !userRequest?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, userRequest" },
        { status: 400 }
      );
    }

    const styleConfig = await tweakStyle(userRequest, currentStyle);

    // When applying to all, persist as session global style override
    if (applyToAll) {
      const session = getSession(sessionId);
      if (session) {
        setSession(sessionId, { ...session, styleOverride: styleConfig });
      }
    }

    return NextResponse.json({ styleConfig });
  } catch (error) {
    console.error("Tweak style error:", error);
    const message = error instanceof Error ? error.message : "Stijl aanpassen mislukt.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
