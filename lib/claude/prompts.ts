// ── Content guidelines injected into every copy-generation prompt ────────────
const BOL_GUIDELINES = `
CONTENT RULES (bol.com — mandatory):
- NEVER use: sales slogans (op=op, goedkoop, gratis, aanbieding, actie, deal), price references, delivery promises, holiday promotions (Moederdag, Black Friday etc.)
- NEVER use vague sustainability words: duurzaam, milieuvriendelijk, eco, bewust, verantwoord — only concrete claims like "gemaakt van 70% gerecycled materiaal"
- NEVER mention stars, review counts, website links, or social media
- NEVER use promotional words: SALE, NIEUW, TOP RATED, geweldig, fantastisch, uniek, perfect, beste
- NEVER use CTAs like "Bestel nu" / "Koop nu" / "Niet missen"
- DO write objective, factual product info: materials, dimensions, weight, colors
- DO write concrete usage tips derived from review insights
- DO proactively address common objections from reviews
- Keep all text concise — headlines max 6 words, bullets/steps max 8 words each`;

// ── Amazon template prompts ──────────────────────────────────────────────────

export const ANALYZE_REVIEWS_SYSTEM = (language: string) =>
  `You are a product listing conversion expert.
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
  `You are a product listing copywriter for bol.com.
Write factual, conversion-focused copy for product listing images.
Write ALL copy in ${language === "nl" ? "Dutch (Nederlands)" : "English"}.
Respond with valid JSON ONLY. No markdown. No code blocks. No backticks. Start directly with { and end with }
${BOL_GUIDELINES}`;

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

// ── RAMBUX® template prompts ────────────────────────────────────────────────

export const GENERATE_COPY_SYSTEM_RAMBUX = (language: string) =>
  `You are a product listing copywriter for bol.com. You write copy for RAMBUX®, a bold outdoor and adventure gear brand. Tone: direct, energetic, confident — no fluff.
Write ALL copy in ${language === "nl" ? "Dutch (Nederlands)" : "English"}.
Respond with valid JSON ONLY. No markdown. No code blocks. No backticks. Start directly with { and end with }
${BOL_GUIDELINES}`;

export const GENERATE_COPY_USER_RAMBUX = (
  productName: string,
  category: string,
  drivers: string[],
  blockers: string[],
  voiceOfCustomer: string[]
) => `Product: ${productName} (Category: ${category})
Conversion drivers: ${drivers.join(", ")}
Customer blockers: ${blockers.join(", ")}
Voice of customer: ${voiceOfCustomer.join(", ")}

Generate copy for all 6 RAMBUX® infographic slides. Use bold, action-oriented language fitting an outdoor adventure brand.

Return this exact JSON (all strings, no nulls):
{
  "brandName": "RAMBUX®",
  "accentColor": "#F5B800",
  "textColor": "#111111",
  "slot00": {
    "headline": "max 5 words, bold product name or claim",
    "subline": "max 8 words, key use case or material",
    "bullet_0": "max 6 words, concrete feature — uppercase style",
    "bullet_1": "max 6 words, concrete feature",
    "bullet_2": "max 6 words, concrete feature",
    "bullet_3": "max 6 words, concrete feature"
  },
  "slot01": {
    "headline": "max 5 words, bold benefit headline",
    "subline": "max 8 words, product positioning",
    "bullet_0": "max 6 words, specific benefit — short and punchy",
    "bullet_1": "max 6 words, specific benefit",
    "bullet_2": "max 6 words, specific benefit",
    "bullet_3": "max 6 words, specific benefit"
  },
  "slot02": {
    "headline": "max 5 words, specs headline",
    "subline": "max 8 words, secondary spec context",
    "spec_label_0": "1-2 words, e.g. Materiaal",
    "spec_val_0": "concrete value, e.g. Aluminium",
    "spec_label_1": "1-2 words",
    "spec_val_1": "concrete value",
    "spec_label_2": "1-2 words",
    "spec_val_2": "concrete value",
    "spec_label_3": "1-2 words",
    "spec_val_3": "concrete value",
    "spec_label_4": "1-2 words",
    "spec_val_4": "concrete value",
    "spec_label_5": "1-2 words",
    "spec_val_5": "concrete value"
  },
  "slot03": {
    "headline": "max 5 words, activity/use headline",
    "subline": "max 8 words, outdoor context",
    "style_tag_0": "outdoor activity, 1-2 words, e.g. Wandelen",
    "style_tag_1": "outdoor activity, 1-2 words, e.g. Kamperen",
    "style_tag_2": "outdoor activity, 1-2 words",
    "style_tag_3": "outdoor activity, 1-2 words"
  },
  "slot04": {
    "headline": "max 5 words, usage/instruction headline",
    "step_0": "action verb + object, max 6 words",
    "step_0_sub": "brief clarification, max 8 words",
    "step_1": "action verb + object, max 6 words",
    "step_1_sub": "brief clarification, max 8 words",
    "step_2": "action verb + object, max 6 words",
    "step_2_sub": "brief clarification, max 8 words",
    "step_3": "action verb + object, max 6 words",
    "step_3_sub": "brief clarification, max 8 words"
  },
  "slot05": {
    "headline": "max 5 words, color/variant headline",
    "subline": "max 8 words, collection context",
    "variant_0": "color or variant name, 1-2 words",
    "variant_0_color": "#hex CSS color matching the variant",
    "variant_1": "color or variant name, 1-2 words",
    "variant_1_color": "#hex CSS color",
    "variant_2": "color or variant name, 1-2 words",
    "variant_2_color": "#hex CSS color",
    "variant_note": "factual note about materials or availability, max 6 words"
  }
}`;

// ── Cozella template prompts ─────────────────────────────────────────────────

export const GENERATE_COPY_SYSTEM_COZELLA = (language: string) =>
  `You are a product listing copywriter for bol.com. You write copy for premium lifestyle product infographics.
Write ALL copy in ${language === "nl" ? "Dutch (Nederlands)" : "English"}.
Respond with valid JSON ONLY. No markdown. No code blocks. No backticks. Start directly with { and end with }
${BOL_GUIDELINES}`;

export const GENERATE_COPY_USER_COZELLA = (
  productName: string,
  category: string,
  drivers: string[],
  blockers: string[],
  voiceOfCustomer: string[]
) => `Product: ${productName} (Category: ${category})
Conversion drivers: ${drivers.join(", ")}
Customer blockers: ${blockers.join(", ")}
Voice of customer: ${voiceOfCustomer.join(", ")}

Generate copy for all 6 Cozella infographic slides. Use the product name as brandName. Choose accentColor and textColor as CSS hex values that suit the product category (e.g. warm neutrals for home/kitchen, clean blues for electronics).

Return this exact JSON (all strings, no nulls):
{
  "brandName": "short brand or product name, max 2 words",
  "accentColor": "#hex",
  "textColor": "#hex",
  "slot00": {
    "headline": "max 6 words, descriptive product title",
    "subline": "max 8 words, key use case or material",
    "bullet_0": "max 6 words, concrete feature",
    "bullet_1": "max 6 words, concrete feature",
    "bullet_2": "max 6 words, concrete feature",
    "bullet_3": "max 6 words, concrete feature"
  },
  "slot01": {
    "headline": "max 6 words, benefit headline",
    "bullet_0": "max 6 words, specific benefit",
    "bullet_1": "max 6 words, specific benefit",
    "bullet_2": "max 6 words, specific benefit",
    "bullet_3": "max 6 words, specific benefit"
  },
  "slot02": {
    "headline": "max 6 words, specs/dimensions headline",
    "spec_label_0": "1-2 words, e.g. Materiaal",
    "spec_val_0": "concrete value, e.g. Bamboe",
    "spec_label_1": "1-2 words",
    "spec_val_1": "concrete value",
    "spec_label_2": "1-2 words",
    "spec_val_2": "concrete value",
    "spec_label_3": "1-2 words",
    "spec_val_3": "concrete value",
    "spec_label_4": "1-2 words",
    "spec_val_4": "concrete value",
    "spec_label_5": "1-2 words",
    "spec_val_5": "concrete value"
  },
  "slot03": {
    "headline": "max 6 words, style/interior fit headline",
    "subline": "max 8 words, interior context",
    "style_tag_0": "interior style name, 1-2 words",
    "style_tag_1": "interior style name, 1-2 words",
    "style_tag_2": "interior style name, 1-2 words",
    "style_tag_3": "interior style name, 1-2 words"
  },
  "slot04": {
    "headline": "max 6 words, usage steps headline",
    "step_0": "action + object, max 6 words",
    "step_0_sub": "brief clarification, max 8 words",
    "step_1": "action + object, max 6 words",
    "step_1_sub": "brief clarification, max 8 words",
    "step_2": "action + object, max 6 words",
    "step_2_sub": "brief clarification, max 8 words",
    "step_3": "action + object, max 6 words",
    "step_3_sub": "brief clarification, max 8 words"
  },
  "slot05": {
    "headline": "max 6 words, color/variant headline",
    "variant_0": "color or material name, 1-2 words",
    "variant_0_color": "#hex CSS color matching the variant name",
    "variant_1": "color or material name, 1-2 words",
    "variant_1_color": "#hex CSS color",
    "variant_2": "color or material name, 1-2 words",
    "variant_2_color": "#hex CSS color",
    "variant_note": "factual note about craftsmanship or variation, max 6 words"
  }
}`;
