import { NextRequest, NextResponse } from "next/server";
import { analyzeReviews } from "@/lib/claude/analyzeReviews";
import { getSession, setSession } from "@/lib/store";
import { Language, ProductCategory, SessionData } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, productName, category, reviews, language = "en" } = body as {
      sessionId: string;
      productName: string;
      category: ProductCategory;
      reviews: string;
      language: Language;
    };

    if (!sessionId || !productName || !category || !reviews) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, productName, category, reviews" },
        { status: 400 }
      );
    }

    const insights = await analyzeReviews(productName, category, reviews, language);

    // Create or update session with insights
    const existing = getSession(sessionId);
    const sessionData: SessionData = {
      productName,
      category,
      language,
      insights,
      copy: existing?.copy ?? ({} as SessionData["copy"]),
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
