import { NextRequest, NextResponse } from "next/server";
import { analyzeReviews } from "@/lib/claude/analyzeReviews";
import { getSession, setSession } from "@/lib/store";
import { Language, ProductCategory, SessionData, TemplateMode } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      productName,
      category,
      reviews,
      language = "nl",
      templateMode = "amazon",
    } = body as {
      sessionId: string;
      productName: string;
      category: ProductCategory;
      reviews: string;
      language: Language;
      templateMode: TemplateMode;
    };

    if (!sessionId || !productName || !category || !reviews) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, productName, category, reviews" },
        { status: 400 }
      );
    }

    const insights = await analyzeReviews(productName, category, reviews, language);

    const existing = getSession(sessionId);
    const sessionData: SessionData = {
      productName,
      category,
      language,
      templateMode,
      insights,
      copy: existing?.copy ?? ({} as SessionData["copy"]),
      cozellaCopy: existing?.cozellaCopy,
      photoPaths: existing?.photoPaths ?? [],
      slotPhotoMap: existing?.slotPhotoMap ?? {},
      createdAt: existing?.createdAt ?? Date.now(),
    };
    setSession(sessionId, sessionData);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Analyze error:", error);
    const message =
      error instanceof Error ? error.message : "Analysis failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
