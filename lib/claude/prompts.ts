export const ANALYZE_REVIEWS_SYSTEM = (language: string) =>
  `You are an Amazon listing conversion expert.
Analyze customer reviews and extract conversion insights.
Write ALL output values in ${language === "nl" ? "Dutch (Nederlands)" : "English"}.
Respond with valid JSON ONLY. No markdown. No code blocks. No backticks. Start directly with { and end with }`;

export const ANALYZE_REVIEWS_USER = (
  productName: string,
  category: string,
  reviews: string
) => `Product: ${productName} (${category})

Reviews:
${reviews}

Return this exact JSON structure:
{
  "drivers": ["string", "string", "string", "string", "string"],
  "blockers": ["string", "string", "string", "string", "string"],
  "voiceOfCustomer": ["string", "string", "string", "string", "string"]
}`;

export const GENERATE_COPY_SYSTEM = (language: string) =>
  `You are an expert Amazon listing copywriter.
Write short, punchy, conversion-focused copy for product listing images.
Write ALL copy in ${language === "nl" ? "Dutch (Nederlands)" : "English"}.
Respond with valid JSON ONLY. No markdown. No code blocks. No backticks. Start directly with { and end with }
Keep all text concise — headlines max 8 words, bullets max 10 words each.`;

export const GENERATE_COPY_USER = (
  productName: string,
  category: string,
  drivers: string[],
  blockers: string[],
  voiceOfCustomer: string[]
) => `Product: ${productName} (Category: ${category})
Conversion drivers: ${drivers.join(", ")}
Customer blockers: ${blockers.join(", ")}
Voice of customer: ${voiceOfCustomer.join(", ")}

Generate copy for all 5 infographic slots. Return this exact JSON:
{
  "slot00": {
    "headline": "string",
    "subline": "string"
  },
  "slot01": {
    "headline": "string",
    "bullets": ["string", "string", "string"]
  },
  "slot02": {
    "headline": "string",
    "subline": "string",
    "bullets": ["string", "string"]
  },
  "slot03": {
    "headline": "string",
    "quotes": ["string", "string"],
    "rating": "4.8"
  },
  "slot04": {
    "headline": "string",
    "subline": "string",
    "cta": "string"
  }
}`;
