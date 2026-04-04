import { NextRequest, NextResponse } from "next/server";
import { analyzeStyle } from "@/lib/claude/analyzeStyle";
import { getSession, setSession } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sessionId = formData.get("sessionId") as string;
    const file = formData.get("image") as File | null;

    if (!sessionId || !file) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, image" },
        { status: 400 }
      );
    }

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG and PNG images are supported." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mediaType = file.type === "image/png" ? "image/png" : "image/jpeg";

    const styleConfig = await analyzeStyle(base64, mediaType);

    // Persist to session as global style override
    const session = getSession(sessionId);
    if (session) {
      setSession(sessionId, { ...session, styleOverride: styleConfig });
    }

    return NextResponse.json({ styleConfig });
  } catch (error) {
    console.error("Analyze style error:", error);
    const message = error instanceof Error ? error.message : "Style analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
