import Anthropic from "@anthropic-ai/sdk";
import {
  CopyResult,
  CozellaCopyResult,
  InsightsResult,
  Language,
  ProductCategory,
  TemplateMode,
} from "@/types";
import {
  GENERATE_COPY_SYSTEM,
  GENERATE_COPY_USER,
  GENERATE_COPY_SYSTEM_COZELLA,
  GENERATE_COPY_USER_COZELLA,
} from "./prompts";

const client = new Anthropic();

function parseClaudeJSON(text: string) {
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
}

async function callClaude(
  system: string,
  userMessage: string,
  temperature: number
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    temperature,
    system,
    messages: [{ role: "user", content: userMessage }],
  });
  const block = message.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");
  return block.text;
}

export async function generateCopy(
  productName: string,
  category: ProductCategory,
  insights: InsightsResult,
  language: Language = "nl",
  temperature = 0.7
): Promise<CopyResult> {
  const system = GENERATE_COPY_SYSTEM(language);
  const userMsg = GENERATE_COPY_USER(
    productName,
    category,
    insights.drivers,
    insights.blockers,
    insights.voiceOfCustomer
  );

  let raw: string;
  try {
    raw = await callClaude(system, userMsg, temperature);
    return parseClaudeJSON(raw) as CopyResult;
  } catch {
    raw = await callClaude(system, userMsg, temperature);
    try {
      return parseClaudeJSON(raw) as CopyResult;
    } catch {
      throw new Error(`Claude returned invalid JSON after retry: ${raw.slice(0, 200)}`);
    }
  }
}

export async function generateCozellaCopy(
  productName: string,
  category: ProductCategory,
  insights: InsightsResult,
  language: Language = "nl",
  temperature = 0.7
): Promise<CozellaCopyResult> {
  const system = GENERATE_COPY_SYSTEM_COZELLA(language);
  const userMsg = GENERATE_COPY_USER_COZELLA(
    productName,
    category,
    insights.drivers,
    insights.blockers,
    insights.voiceOfCustomer
  );

  let raw: string;
  try {
    raw = await callClaude(system, userMsg, temperature);
    return parseClaudeJSON(raw) as CozellaCopyResult;
  } catch {
    raw = await callClaude(system, userMsg, temperature);
    try {
      return parseClaudeJSON(raw) as CozellaCopyResult;
    } catch {
      throw new Error(`Claude returned invalid JSON after retry: ${raw.slice(0, 200)}`);
    }
  }
}

// Convenience: dispatch based on templateMode
export async function generateCopyForMode(
  productName: string,
  category: ProductCategory,
  insights: InsightsResult,
  language: Language,
  templateMode: TemplateMode,
  temperature = 0.7
): Promise<CopyResult | CozellaCopyResult> {
  if (templateMode === "cozella") {
    return generateCozellaCopy(productName, category, insights, language, temperature);
  }
  return generateCopy(productName, category, insights, language, temperature);
}
