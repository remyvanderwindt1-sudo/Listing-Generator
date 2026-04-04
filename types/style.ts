export interface StyleConfig {
  // Overlay
  backgroundColor: string;
  overlayColor: string;
  hasOverlay: boolean;
  overlayOpacity: number;         // 0–1

  // Text
  textColor: string;
  accentColor: string;
  headlineSize: "small" | "medium" | "large" | "xl";
  fontStyle: "serif" | "sans-serif";

  // Cards & boxes (quote cards, bullet rows, pills)
  cardStyle: "solid" | "frosted" | "outline" | "dark" | "minimal";
  cardOpacity: number;            // 0–1, how opaque the card background is
  cardBorderRadius: "none" | "small" | "medium" | "large";

  // Bullets
  bulletStyle: "checkmark" | "dot" | "number" | "icon" | "pill";

  // Layout & mood
  layout: "centered" | "split-left" | "split-right" | "top-heavy" | "bottom-heavy";
  mood: string;
}
