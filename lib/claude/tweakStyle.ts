import Anthropic from "@anthropic-ai/sdk";
import { StyleConfig } from "@/types/style";

const client = new Anthropic();

const SYSTEM = `You are a visual design expert for e-commerce product listing images.
The user describes how they want a slide to look. You return a StyleConfig JSON object.
If a current style is provided, apply the requested change and keep everything else identical.
Respond with valid JSON ONLY. No markdown. No backticks. Start directly with {.`;

function buildPrompt(userRequest: string, current: StyleConfig | null): string {
  const currentStr = current
    ? `Current style:\n${JSON.stringify(current, null, 2)}\n\n`
    : "";
  return `${currentStr}User request: "${userRequest}"

Return a complete StyleConfig object. Field reference:
- cardStyle: how text boxes / quote cards look
  "solid"   = opaque white card (default)
  "frosted" = semi-transparent white card
  "outline" = transparent with white border — shows photo through
  "dark"    = dark semi-transparent card
  "minimal" = no background, floating text only
- cardOpacity: 0–1, transparency of the card background (0=invisible, 1=fully opaque). Use low values (0.1–0.3) to let the photo show through.
- cardBorderRadius: "none" | "small" | "medium" | "large"
- overlayOpacity: 0–1, darkness of the full-slide overlay
- headlineSize: "small" | "medium" | "large" | "xl"
- bulletStyle: "checkmark" | "dot" | "number" | "icon" | "pill"
- fontStyle: "serif" | "sans-serif"

{
  "backgroundColor": "hex or 'photo'",
  "textColor": "hex",
  "accentColor": "hex",
  "overlayColor": "hex",
  "hasOverlay": true,
  "overlayOpacity": 0.4,
  "cardStyle": "solid | frosted | outline | dark | minimal",
  "cardOpacity": 0.85,
  "cardBorderRadius": "none | small | medium | large",
  "headlineSize": "small | medium | large | xl",
  "bulletStyle": "checkmark | dot | number | icon | pill",
  "fontStyle": "serif | sans-serif",
  "layout": "centered | split-left | split-right | top-heavy | bottom-heavy",
  "mood": "string"
}`;
}

function parseClaudeJSON(text: string) {
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function tweakStyle(
  userRequest: string,
  current: StyleConfig | null
): Promise<StyleConfig> {
  async function call(): Promise<string> {
    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{ role: "user", content: buildPrompt(userRequest, current) }],
    });
    const block = message.content[0];
    if (block.type !== "text") throw new Error("Unexpected response type");
    return block.text;
  }

  let raw: string;
  try {
    raw = await call();
    return parseClaudeJSON(raw) as StyleConfig;
  } catch {
    raw = await call();
    try {
      return parseClaudeJSON(raw) as StyleConfig;
    } catch {
      throw new Error(`Claude returned invalid JSON after retry: ${raw.slice(0, 200)}`);
    }
  }
}
