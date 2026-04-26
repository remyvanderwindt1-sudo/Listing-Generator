import Anthropic from "@anthropic-ai/sdk";
import {
  CopyResult,
  CozellaCopyResult,
  CozellaV2CopyResult,
  CozellaV3Data,
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
  GENERATE_COPY_SYSTEM_COZELLA2,
  GENERATE_COPY_USER_COZELLA2,
  GENERATE_COPY_SYSTEM_COZELLA3,
  GENERATE_COPY_USER_COZELLA3,
  GENERATE_COPY_SYSTEM_RAMBUX,
  GENERATE_COPY_USER_RAMBUX,
  TRANSLATE_COPY_SYSTEM,
  TRANSLATE_COPY_USER,
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

export async function generateRambuxCopy(
  productName: string,
  category: ProductCategory,
  insights: InsightsResult,
  language: Language = "nl",
  temperature = 0.7
): Promise<CozellaCopyResult> {
  const system = GENERATE_COPY_SYSTEM_RAMBUX(language);
  const userMsg = GENERATE_COPY_USER_RAMBUX(
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

export async function generateCozellaV2Copy(
  productName: string,
  category: ProductCategory,
  insights: InsightsResult,
  language: Language = "nl",
  temperature = 0.7
): Promise<CozellaV2CopyResult> {
  const system = GENERATE_COPY_SYSTEM_COZELLA2(language);
  const userMsg = GENERATE_COPY_USER_COZELLA2(
    productName,
    category,
    insights.drivers,
    insights.blockers,
    insights.voiceOfCustomer
  );

  let raw: string;
  try {
    raw = await callClaude(system, userMsg, temperature);
    return parseClaudeJSON(raw) as CozellaV2CopyResult;
  } catch {
    raw = await callClaude(system, userMsg, temperature);
    try {
      return parseClaudeJSON(raw) as CozellaV2CopyResult;
    } catch {
      throw new Error(`Claude returned invalid JSON after retry: ${raw.slice(0, 200)}`);
    }
  }
}

export async function generateCozella3Copy(
  productName: string,
  category: ProductCategory,
  insights: InsightsResult,
  language: Language = "nl",
  temperature = 0.7
): Promise<CozellaV3Data> {
  const system = GENERATE_COPY_SYSTEM_COZELLA3(language);
  const userMsg = GENERATE_COPY_USER_COZELLA3(
    productName,
    category,
    insights.drivers,
    insights.blockers,
    insights.voiceOfCustomer
  );

  let raw: string;
  try {
    raw = await callClaude(system, userMsg, temperature);
    return parseClaudeJSON(raw) as CozellaV3Data;
  } catch {
    raw = await callClaude(system, userMsg, temperature);
    try {
      return parseClaudeJSON(raw) as CozellaV3Data;
    } catch {
      throw new Error(`Claude returned invalid JSON after retry: ${raw.slice(0, 200)}`);
    }
  }
}

/**
 * Translate existing copy to a new language.
 * Preserves all manually tweaked values — only changes language, not content.
 */
export async function translateCopy<T>(currentCopy: T, targetLanguage: Language): Promise<T> {
  const system = TRANSLATE_COPY_SYSTEM(targetLanguage);
  const userMsg = TRANSLATE_COPY_USER(currentCopy);

  let raw: string;
  try {
    raw = await callClaude(system, userMsg, 0.2);
    return parseClaudeJSON(raw) as T;
  } catch {
    raw = await callClaude(system, userMsg, 0.2);
    try {
      return parseClaudeJSON(raw) as T;
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
