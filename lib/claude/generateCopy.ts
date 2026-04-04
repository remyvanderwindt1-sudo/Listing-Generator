import Anthropic from "@anthropic-ai/sdk";
import { CopyResult, InsightsResult, Language, ProductCategory } from "@/types";
import { GENERATE_COPY_SYSTEM, GENERATE_COPY_USER } from "./prompts";

const client = new Anthropic();

async function callClaude(
  productName: string,
  category: ProductCategory,
  insights: InsightsResult,
  language: Language,
  temperature = 0.7
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    temperature,
    system: GENERATE_COPY_SYSTEM(language),
    messages: [
      {
        role: "user",
        content: GENERATE_COPY_USER(
          productName,
          category,
          insights.drivers,
          insights.blockers,
          insights.voiceOfCustomer
        ),
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

export async function generateCopy(
  productName: string,
  category: ProductCategory,
  insights: InsightsResult,
  language: Language = "en",
  temperature = 0.7
): Promise<CopyResult> {
  let raw: string;

  try {
    raw = await callClaude(productName, category, insights, language, temperature);
    return parseClaudeJSON(raw) as CopyResult;
  } catch {
    raw = await callClaude(productName, category, insights, language, temperature);
    try {
      return parseClaudeJSON(raw) as CopyResult;
    } catch {
      throw new Error(
        `Claude returned invalid JSON after retry: ${raw.slice(0, 200)}`
      );
    }
  }
}
