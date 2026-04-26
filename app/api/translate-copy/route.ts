import { NextRequest, NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/store";
import { translateCopy } from "@/lib/claude/generateCopy";
import { CopyResult, CozellaCopyResult, Language } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, targetLanguage } = await request.json() as {
      sessionId: string;
      targetLanguage: Language;
    };

    if (!sessionId || !targetLanguage) {
      return NextResponse.json(
        { error: "sessionId en targetLanguage zijn vereist" },
        { status: 400 }
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Sessie niet gevonden" }, { status: 404 });
    }

    const mode = session.templateMode ?? "amazon";

    if (mode === "cozella" || mode === "rambux") {
      if (!session.cozellaCopy) {
        return NextResponse.json({ error: "Geen copy gevonden" }, { status: 400 });
      }
      const translated = await translateCopy<CozellaCopyResult>(
        session.cozellaCopy,
        targetLanguage
      );
      setSession(sessionId, {
        ...session,
        language: targetLanguage,
        cozellaCopy: translated,
      });
      return NextResponse.json({ copy: translated });
    }

    // Amazon mode
    const translated = await translateCopy<CopyResult>(session.copy, targetLanguage);
    setSession(sessionId, {
      ...session,
      language: targetLanguage,
      copy: translated,
    });
    return NextResponse.json({ copy: translated });
  } catch (error) {
    console.error("Translate error:", error);
    const message = error instanceof Error ? error.message : "Vertalen mislukt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
