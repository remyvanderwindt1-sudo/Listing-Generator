import Anthropic from "@anthropic-ai/sdk";
import { StyleConfig } from "@/types/style";

const client = new Anthropic();

const STYLE_SYSTEM = `You are a visual design analyst specializing in e-commerce listing images.
Analyze this product listing image and extract the visual style.
Respond with valid JSON ONLY. No markdown. No backticks.
Be specific with hex color codes where possible.`;

const STYLE_USER = `Analyze the visual style of this listing image and return:
{
  "backgroundColor": "hex color or 'photo'",
  "textColor": "hex color",
  "accentColor": "hex color",
  "overlayColor": "hex color",
  "layout": "centered | split-left | split-right | top-heavy | bottom-heavy",
  "hasOverlay": true or false,
  "overlayOpacity": number between 0 and 1,
  "cardStyle": "solid | frosted | outline | dark | minimal",
  "cardOpacity": number between 0 and 1,
  "cardBorderRadius": "none | small | medium | large",
  "headlineSize": "small | medium | large | xl",
  "bulletStyle": "checkmark | dot | number | icon | pill",
  "fontStyle": "serif | sans-serif",
  "mood": "string describing the overall mood e.g. clean, bold, minimal, luxury, playful"
}`;

function parseClaudeJSON(text: string) {
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function analyzeStyle(imageBase64: string, mediaType: "image/jpeg" | "image/png"): Promise<StyleConfig> {
  async function call(): Promise<string> {
    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: STYLE_SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: imageBase64,
              },
            },
            { type: "text", text: STYLE_USER },
          ],
        },
      ],
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
