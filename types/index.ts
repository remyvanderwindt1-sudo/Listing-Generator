export interface InsightsResult {
  drivers: string[];
  blockers: string[];
  voiceOfCustomer: string[];
}

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

export type Language = "nl" | "en";

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
  insights: InsightsResult;
  copy: CopyResult;
  photoPaths: string[];
  slotPhotoMap: Record<number, string>;
  styleOverride?: import("./style").StyleConfig;
  createdAt: number;
}
