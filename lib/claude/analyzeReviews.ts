import Anthropic from "@anthropic-ai/sdk";
import { InsightsResult, Language, ProductCategory } from "@/types";
import { ANALYZE_REVIEWS_SYSTEM, ANALYZE_REVIEWS_USER } from "./prompts";

const client = new Anthropic();

async function callClaude(
  productName: string,
  category: ProductCategory,
  reviews: string,
  language: Language
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: ANALYZE_REVIEWS_SYSTEM(language),
    messages: [
      {
        role: "user",
        content: ANALYZE_REVIEWS_USER(productName, category, reviews),
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");
  return block.text;
}

function parseClaudeJSON(text: string) {
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function analyzeReviews(
  productName: string,
  category: ProductCategory,
  reviews: string,
  language: Language = "en"
): Promise<InsightsResult> {
  let raw: string;

  try {
    raw = await callClaude(productName, category, reviews, language);
    return parseClaudeJSON(raw) as InsightsResult;
  } catch {
    // Retry once on parse failure
    raw = await callClaude(productName, category, reviews, language);
    try {
      return parseClaudeJSON(raw) as InsightsResult;
    } catch {
      throw new Error(
        `Claude returned invalid JSON after retry: ${raw.slice(0, 200)}`
      );
    }
  }
}
