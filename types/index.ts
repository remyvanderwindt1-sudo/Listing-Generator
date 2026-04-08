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

// ── Shared ───────────────────────────────────────────────────────────────────

export type TemplateMode = "amazon" | "cozella" | "rambux";

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
  photoPaths: string[];
  slotPhotoMap: Record<number, string>;
  styleOverride?: import("./style").StyleConfig;
  createdAt: number;
}
