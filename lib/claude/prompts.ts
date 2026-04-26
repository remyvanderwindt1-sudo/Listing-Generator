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
Write ALL output values in ${language === "nl" ? "Dutch (Nederlands)" : language === "de" ? "German (Deutsch)" : "English"}.
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
Write ALL copy in ${language === "nl" ? "Dutch (Nederlands)" : language === "de" ? "German (Deutsch)" : "English"}.
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
Write ALL copy in ${language === "nl" ? "Dutch (Nederlands)" : language === "de" ? "German (Deutsch)" : "English"}.
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

// ── Translation prompts ───────────────────────────────────────────────────────

export const TRANSLATE_COPY_SYSTEM = (targetLanguage: string) => {
  const langName =
    targetLanguage === "nl"
      ? "Dutch (Nederlands)"
      : targetLanguage === "de"
      ? "German (Deutsch)"
      : "English";
  return `You are a professional product copy translator.
Translate all text string values in the provided JSON to ${langName}.
Rules:
- Preserve the EXACT JSON structure and all keys
- Only translate string values — never change hex colors, numbers, or boolean values
- Keep the same length and tone as the original (concise, factual)
- Do NOT add promotional language not present in the original
- Respond with valid JSON ONLY. No markdown. No code blocks. Start directly with { and end with }`;
};

export const TRANSLATE_COPY_USER = (copy: unknown) =>
  `Translate all text values in this JSON to the target language specified in the system prompt. Return the complete JSON with translated values:\n\n${JSON.stringify(copy, null, 2)}`;

// ── Cozella V2 template prompts ──────────────────────────────────────────────

export const GENERATE_COPY_SYSTEM_COZELLA2 = (language: string) =>
  `You are a product listing copywriter for bol.com. You write copy for premium lifestyle product infographics with a warm, editorial tone.
Write ALL copy in ${language === "nl" ? "Dutch (Nederlands)" : language === "de" ? "German (Deutsch)" : "English"}.
Respond with valid JSON ONLY. No markdown. No code blocks. No backticks. Start directly with { and end with }
${BOL_GUIDELINES}`;

export const GENERATE_COPY_USER_COZELLA2 = (
  productName: string,
  category: string,
  drivers: string[],
  blockers: string[],
  voiceOfCustomer: string[]
) => `Product: ${productName} (Category: ${category})
Conversion drivers: ${drivers.join(", ")}
Customer blockers: ${blockers.join(", ")}
Voice of customer: ${voiceOfCustomer.join(", ")}

Generate copy for all 6 Cozella V2 infographic slides. Use the product name as brandName. Tone: warm, editorial, premium lifestyle — objective and factual.

Return this exact JSON (all strings, no nulls):
{
  "brandName": "short brand or product name, max 2 words",
  "slot00": {
    "eyebrow": "max 6 words, product category · material · use case",
    "headline": "max 3 words, product title (first line)",
    "headline_em": "max 2 words, italic emphasis word (second line)",
    "tagline": "max 12 words, factual product description, uppercase style",
    "materiaal": "material value, 1-3 words",
    "afmeting": "dimensions e.g. 30 × 20 cm or size indication",
    "kleur": "color name, 1-2 words"
  },
  "slot01": {
    "section_subtitle": "max 8 words, references brandName without brand promise",
    "feature_1_title": "max 4 words, concrete feature name",
    "feature_1_description": "max 20 words, factual benefit with material or usage detail",
    "feature_2_title": "max 4 words",
    "feature_2_description": "max 20 words",
    "feature_3_title": "max 4 words",
    "feature_3_description": "max 20 words"
  },
  "slot02": {
    "usp_label": "max 4 words, key differentiator — uppercase pill text",
    "s3_headline": "max 4 words, italic detail headline e.g. 'Elk detail telt'",
    "detail_beschrijving": "max 25 words, factual product craftsmanship or material description",
    "spec_1_title": "max 4 words, spec label",
    "spec_1_body": "max 15 words, concrete spec value",
    "spec_2_title": "max 4 words",
    "spec_2_body": "max 15 words",
    "spec_3_title": "max 4 words",
    "spec_3_body": "max 15 words",
    "spec_4_title": "max 4 words",
    "spec_4_body": "max 15 words"
  },
  "slot03": {
    "without_1": "max 8 words, problem without product (no slogans)",
    "without_2": "max 8 words",
    "without_3": "max 8 words",
    "without_4": "max 8 words",
    "with_1": "max 8 words, concrete solution with product",
    "with_2": "max 8 words",
    "with_3": "max 8 words",
    "with_4": "max 8 words"
  },
  "slot04": {
    "quote_text": "max 25 words, factual product statement in editorial tone — NOT a customer quote, NO stars or reviews",
    "quote_attribution": "2-4 words, factual product characteristic e.g. 'Handgemaakt kenmerk' or 'Materiaalkwaliteit'"
  },
  "slot05": {
    "s6_eyebrow": "max 4 words, neutral collection intro e.g. 'Ontdek de collectie'",
    "s6_headline": "max 2 words, first line of closing headline",
    "s6_headline_em": "max 2 words, italic second line — NO CTAs like 'Bestel' or 'Koop'",
    "cta_sub": "max 8 words, product + material description (no price, no delivery)",
    "cta_button_text": "max 3 words, factual e.g. 'Meer informatie' or 'Bekijk details'"
  }
}`;

// ── Cozella V3 template prompts ──────────────────────────────────────────────

export const GENERATE_COPY_SYSTEM_COZELLA3 = (language: string) =>
  `You are a product listing copywriter for bol.com. You write editorial, premium copy for an 8-layout infographic template in a warm terracotta & gold aesthetic.
Write ALL copy in ${language === "nl" ? "Dutch (Nederlands)" : language === "de" ? "German (Deutsch)" : "English"}.
Respond with valid JSON ONLY. No markdown. No code blocks. No backticks. Start directly with { and end with }
${BOL_GUIDELINES}`;

export const GENERATE_COPY_USER_COZELLA3 = (
  productName: string,
  category: string,
  drivers: string[],
  blockers: string[],
  voiceOfCustomer: string[]
) => `Product: ${productName} (Category: ${category})
Conversion drivers: ${drivers.join(", ")}
Customer blockers: ${blockers.join(", ")}
Voice of customer: ${voiceOfCustomer.join(", ")}

Generate copy for all 8 Cozella 3 editorial infographic layouts. Tone: warm, factual, premium lifestyle. No CTAs, no prices, no slogans.

Return this exact JSON (all strings, no nulls — except l7_bullets which is a string array):
{
  "eyebrow": "max 6 words, product category · material · key use",
  "title_line1": "max 2 words, product name line 1",
  "title_accent": "max 2 words, italic accent word (e.g. type or adjective)",
  "title_line3": "dimension or size indicator, e.g. '28 cm'",
  "tagline": "max 15 words, factual product description",
  "materiaal": "1-2 words, primary material",
  "afmeting": "dimensions, e.g. 'Ø 28 cm' or '30 × 20 cm'",
  "kleur": "1-2 words, color name",
  "section2_title_line1": "max 3 words, process/feature intro line 1",
  "section2_title_accent": "max 3 words, italic accent phrase",
  "section2_subtitle_line1": "max 4 words, subtitle line 1",
  "section2_subtitle_line2": "max 4 words, subtitle line 2",
  "feature_1_title": "max 4 words, concrete feature name",
  "feature_1_description": "max 20 words, factual feature detail",
  "feature_2_title": "max 4 words",
  "feature_2_description": "max 20 words",
  "feature_3_title": "max 4 words",
  "feature_3_description": "max 20 words",
  "usp_label": "max 4 words, key differentiator — uppercase pill text",
  "detail_title_line1": "max 3 words, specs intro line 1",
  "detail_title_line2": "max 3 words, specs intro line 2",
  "detail_beschrijving": "max 20 words, factual craftsmanship or material description",
  "spec_1_title": "1-2 words, spec label e.g. Hoogte",
  "spec_1_body": "concrete value e.g. 28 cm",
  "spec_2_title": "1-2 words",
  "spec_2_body": "concrete value",
  "spec_3_title": "1-2 words",
  "spec_3_body": "concrete value",
  "spec_4_title": "1-2 words",
  "spec_4_body": "concrete value",
  "s4_eyebrow": "max 4 words, usage/care section label",
  "compare_title_line1": "max 2 words, comparison title line 1",
  "compare_title_accent": "max 3 words, italic comparison title line 2",
  "without_1": "max 8 words, what NOT to do (factual care instruction)",
  "without_2": "max 8 words",
  "without_3": "max 8 words",
  "without_4": "max 8 words",
  "with_1": "max 8 words, what TO do (factual care instruction)",
  "with_2": "max 8 words",
  "with_3": "max 8 words",
  "with_4": "max 8 words",
  "quote_text": "max 25 words, factual editorial product statement — NOT a customer review, NO stars",
  "quote_attribution": "2-4 words, factual product characteristic e.g. 'Over het maakproces'",
  "s6_eyebrow": "max 4 words, packaging section label e.g. 'In de verpakking'",
  "cta_title_line1": "max 3 words, packaging contents intro line 1",
  "cta_title_accent": "max 2 words, italic accent e.g. 'erin?'",
  "pack_item_1": "what's included item 1, max 8 words",
  "pack_item_2": "what's included item 2, max 8 words",
  "pack_item_3": "what's included item 3, max 8 words",
  "l7_eyebrow": "max 4 words, materials section label",
  "l7_title_line1": "max 3 words, materials headline line 1",
  "l7_title_accent": "max 3 words, italic accent",
  "l7_intro": "max 20 words, factual material composition description",
  "l7_bullets": ["material item 1, max 6 words", "material item 2, max 6 words", "material item 3, max 6 words"],
  "l7_badge": "1-2 words, corner badge label e.g. 'Materialen'",
  "l8_title_line1": "max 3 words, FAQ headline line 1",
  "l8_title_accent": "max 2 words, italic accent",
  "faq_1_q": "max 10 words, common question about product",
  "faq_1_a": "max 25 words, factual answer",
  "faq_2_q": "max 10 words, common question",
  "faq_2_a": "max 25 words, factual answer",
  "faq_3_q": "max 10 words, common question",
  "faq_3_a": "max 25 words, factual answer",
  "faq_4_q": "max 10 words, common question",
  "faq_4_a": "max 25 words, factual answer"
}`;

// ── Cozella template prompts ─────────────────────────────────────────────────

export const GENERATE_COPY_SYSTEM_COZELLA = (language: string) =>
  `You are a product listing copywriter for bol.com. You write copy for premium lifestyle product infographics.
Write ALL copy in ${language === "nl" ? "Dutch (Nederlands)" : language === "de" ? "German (Deutsch)" : "English"}.
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
