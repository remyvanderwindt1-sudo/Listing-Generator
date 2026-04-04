import Anthropic from "@anthropic-ai/sdk";
import { Language, SlotCopy } from "@/types";

const client = new Anthropic();

const TWEAK_SYSTEM = `You are an Amazon/bol.com listing copywriter.
You receive the current copy for one infographic slide and a user request to change something specific.
Apply ONLY the requested change, keep everything else identical.
Respond with valid JSON ONLY. No markdown. No backticks.
Return the complete slot object with the applied change.`;

function parseClaudeJSON(text: string) {
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function tweakCopy(
  slotId: string,
  currentCopy: SlotCopy,
  userRequest: string,
  language: Language
): Promise<SlotCopy> {
  const userPrompt = `Current copy for ${slotId}:
${JSON.stringify(currentCopy, null, 2)}

User request: ${userRequest}
Language: ${language === "nl" ? "Dutch (Nederlands)" : "English"}

Return the updated copy as JSON in the exact same structure.`;

  async function call(): Promise<string> {
    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: TWEAK_SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });
    const block = message.content[0];
    if (block.type !== "text") throw new Error("Unexpected response type");
    return block.text;
  }

  let raw: string;
  try {
    raw = await call();
    return parseClaudeJSON(raw) as SlotCopy;
  } catch {
    raw = await call();
    try {
      return parseClaudeJSON(raw) as SlotCopy;
    } catch {
      throw new Error(`Claude returned invalid JSON after retry: ${raw.slice(0, 200)}`);
    }
  }
}
