export interface InsightsResult {
  drivers: string[];
  blockers: string[];
  voiceOfCustomer: string[];
}

// ── Amazon template copy types ───────────────────────────────────────────────

export interface Slot00Copy {
  headline: string;
  subline: string;
}

export interface Slot01Copy {
  headline: string;
  bullets: [string, string, string];
}

export interface Slot02Copy {
  headline: string;
  subline: string;
  bullets: [string, string];
}

export interface Slot03Copy {
  headline: string;
  quotes: [string, string];
  rating: string;
}

export interface Slot04Copy {
  headline: string;
  subline: string;
  cta: string;
}

export interface CopyResult {
  slot00: Slot00Copy;
  slot01: Slot01Copy;
  slot02: Slot02Copy;
  slot03: Slot03Copy;
  slot04: Slot04Copy;
}

export type SlotCopy =
  | Slot00Copy
  | Slot01Copy
  | Slot02Copy
  | Slot03Copy
  | Slot04Copy;

// ── Cozella template copy types ──────────────────────────────────────────────

export interface CozellaCopySlot00 {
  headline: string;
  subline: string;
  bullet_0: string;
  bullet_1: string;
  bullet_2: string;
  bullet_3: string;
}

export interface CozellaCopySlot01 {
  headline: string;
  bullet_0: string;
  bullet_1: string;
  bullet_2: string;
  bullet_3: string;
}

export interface CozellaCopySlot02 {
  headline: string;
  spec_label_0: string; spec_val_0: string;
  spec_label_1: string; spec_val_1: string;
  spec_label_2: string; spec_val_2: string;
  spec_label_3: string; spec_val_3: string;
  spec_label_4: string; spec_val_4: string;
  spec_label_5: string; spec_val_5: string;
}

export interface CozellaCopySlot03 {
  headline: string;
  subline: string;
  style_tag_0: string;
  style_tag_1: string;
  style_tag_2: string;
  style_tag_3: string;
}

export interface CozellaCopySlot04 {
  headline: string;
  step_0: string; step_0_sub: string;
  step_1: string; step_1_sub: string;
  step_2: string; step_2_sub: string;
  step_3: string; step_3_sub: string;
}

export interface CozellaCopySlot05 {
  headline: string;
  variant_0: string; variant_0_color: string;
  variant_1: string; variant_1_color: string;
  variant_2: string; variant_2_color: string;
  variant_note: string;
}

export interface CozellaCopyResult {
  brandName: string;
  accentColor: string;
  textColor: string;
  slot00: CozellaCopySlot00;
  slot01: CozellaCopySlot01;
  slot02: CozellaCopySlot02;
  slot03: CozellaCopySlot03;
  slot04: CozellaCopySlot04;
  slot05: CozellaCopySlot05;
}

export type CozellaSlotCopy =
  | CozellaCopySlot00
  | CozellaCopySlot01
  | CozellaCopySlot02
  | CozellaCopySlot03
  | CozellaCopySlot04
  | CozellaCopySlot05;

// ── Cozella V2 template copy types ──────────────────────────────────────────

export interface CozellaV2Slot00 {
  eyebrow: string; headline: string; headline_em: string; tagline: string;
  materiaal: string; afmeting: string; kleur: string;
}

export interface CozellaV2Slot01 {
  section_subtitle: string;
  feature_1_title: string; feature_1_description: string;
  feature_2_title: string; feature_2_description: string;
  feature_3_title: string; feature_3_description: string;
}

export interface CozellaV2Slot02 {
  usp_label: string; s3_headline: string; detail_beschrijving: string;
  spec_1_title: string; spec_1_body: string;
  spec_2_title: string; spec_2_body: string;
  spec_3_title: string; spec_3_body: string;
  spec_4_title: string; spec_4_body: string;
}

export interface CozellaV2Slot03 {
  without_1: string; without_2: string; without_3: string; without_4: string;
  with_1: string; with_2: string; with_3: string; with_4: string;
}

export interface CozellaV2Slot04 {
  quote_text: string; quote_attribution: string;
}

export interface CozellaV2Slot05 {
  s6_eyebrow: string; s6_headline: string; s6_headline_em: string;
  cta_sub: string; cta_button_text: string;
}

export interface CozellaV2CopyResult {
  brandName: string;
  slot00: CozellaV2Slot00;
  slot01: CozellaV2Slot01;
  slot02: CozellaV2Slot02;
  slot03: CozellaV2Slot03;
  slot04: CozellaV2Slot04;
  slot05: CozellaV2Slot05;
}

// ── Cozella V3 template copy type (flat — all 8 layouts share one data object) ─

export interface CozellaV3Data {
  eyebrow: string;
  title_line1: string;
  title_accent: string;
  title_line3: string;
  tagline: string;
  materiaal: string;
  afmeting: string;
  kleur: string;
  section2_title_line1: string;
  section2_title_accent: string;
  section2_subtitle_line1: string;
  section2_subtitle_line2: string;
  feature_1_title: string;
  feature_1_description: string;
  feature_2_title: string;
  feature_2_description: string;
  feature_3_title: string;
  feature_3_description: string;
  usp_label: string;
  detail_title_line1: string;
  detail_title_line2: string;
  detail_beschrijving: string;
  spec_1_title: string;
  spec_1_body: string;
  spec_2_title: string;
  spec_2_body: string;
  spec_3_title: string;
  spec_3_body: string;
  spec_4_title: string;
  spec_4_body: string;
  s4_eyebrow: string;
  compare_title_line1: string;
  compare_title_accent: string;
  without_1: string;
  without_2: string;
  without_3: string;
  without_4: string;
  with_1: string;
  with_2: string;
  with_3: string;
  with_4: string;
  quote_text: string;
  quote_attribution: string;
  s6_eyebrow: string;
  cta_title_line1: string;
  cta_title_accent: string;
  pack_item_1: string;
  pack_item_2: string;
  pack_item_3: string;
  l7_eyebrow: string;
  l7_title_line1: string;
  l7_title_accent: string;
  l7_intro: string;
  l7_bullets: string[];
  l7_badge: string;
  l8_title_line1: string;
  l8_title_accent: string;
  faq_1_q: string;
  faq_1_a: string;
  faq_2_q: string;
  faq_2_a: string;
  faq_3_q: string;
  faq_3_a: string;
  faq_4_q: string;
  faq_4_a: string;
}

// ── Shared ───────────────────────────────────────────────────────────────────

export type TemplateMode = "amazon" | "cozella" | "rambux" | "cozella2" | "cozella3";

export type Language = "nl" | "en" | "de";

export type { StyleConfig } from "./style";

export type ProductCategory =
  | "Electronics"
  | "Health"
  | "Kitchen"
  | "Beauty"
  | "Sports"
  | "Home"
  | "Pet"
  | "Baby"
  | "Other";

export interface SessionData {
  productName: string;
  category: ProductCategory;
  language: Language;
  templateMode: TemplateMode;
  insights: InsightsResult;
  copy: CopyResult;
  cozellaCopy?: CozellaCopyResult;
  cozellaV2Copy?: CozellaV2CopyResult;
  cozellaV3Data?: CozellaV3Data;
  photoPaths: string[];
  slotPhotoMap: Record<number, string>;
  styleOverride?: import("./style").StyleConfig;
  createdAt: number;
}
