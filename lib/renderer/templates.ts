import {
  Slot00Copy,
  Slot01Copy,
  Slot02Copy,
  Slot03Copy,
  Slot04Copy,
} from "@/types";
import { StyleConfig } from "@/types/style";

// ── style helpers ─────────────────────────────────────────────────────────────

const HEADLINE_PX: Record<StyleConfig["headlineSize"], number> = {
  small: 56, medium: 72, large: 88, xl: 108,
};

const CARD_RADIUS: Record<StyleConfig["cardBorderRadius"], string> = {
  none: "0px", small: "8px", medium: "20px", large: "40px",
};

function resolveFont(style: StyleConfig | undefined, fallback: string): string {
  if (!style) return fallback;
  return style.fontStyle === "serif" ? "Georgia,serif" : "Arial,sans-serif";
}

function resolveHeadlineSize(style: StyleConfig | undefined, fallbackPx: number): number {
  if (!style) return fallbackPx;
  return HEADLINE_PX[style.headlineSize] ?? fallbackPx;
}

function resolveOverlay(style: StyleConfig | undefined, fallbackOpacity: number): string {
  if (!style) return `rgba(0,0,0,${fallbackOpacity})`;
  if (!style.hasOverlay) return "transparent";
  const hex = style.overlayColor ?? "#000000";
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r},${g},${b},${style.overlayOpacity ?? fallbackOpacity})`;
}

function resolveTextColor(style: StyleConfig | undefined): string {
  return style?.textColor ?? "white";
}

function resolveAccent(style: StyleConfig | undefined, fallback: string): string {
  return style?.accentColor ?? fallback;
}

function resolveCardRadius(style: StyleConfig | undefined, fallback: string): string {
  if (!style) return fallback;
  return CARD_RADIUS[style.cardBorderRadius] ?? fallback;
}

/**
 * Returns CSS `background` + `border` for a card/box element.
 * lightCard=true  → quote cards (default solid white)
 * lightCard=false → bullet rows (default semi-transparent)
 */
function resolveCardStyles(
  style: StyleConfig | undefined,
  lightCard: boolean
): { background: string; border: string; textColorOverride?: string } {
  const opacity = style?.cardOpacity ?? (lightCard ? 0.92 : 0.12);
  const cardStyle = style?.cardStyle ?? (lightCard ? "solid" : "frosted");

  switch (cardStyle) {
    case "solid":
      return {
        background: `rgba(255,255,255,${opacity})`,
        border: "none",
        textColorOverride: "#1a1a1a",
      };
    case "frosted":
      return {
        background: `rgba(255,255,255,${opacity})`,
        border: `1px solid rgba(255,255,255,${Math.min(opacity + 0.2, 1)})`,
        textColorOverride: opacity > 0.5 ? "#1a1a1a" : undefined,
      };
    case "outline":
      return {
        background: "transparent",
        border: "2px solid rgba(255,255,255,0.7)",
      };
    case "dark":
      return {
        background: `rgba(0,0,0,${opacity})`,
        border: "1px solid rgba(255,255,255,0.15)",
      };
    case "minimal":
      return {
        background: "transparent",
        border: "none",
      };
    default:
      return {
        background: `rgba(255,255,255,${opacity})`,
        border: "none",
        textColorOverride: "#1a1a1a",
      };
  }
}

// ── bullet renderer ───────────────────────────────────────────────────────────

function renderBullet(
  text: string,
  style: StyleConfig | undefined,
  index: number
): string {
  const bulletStyle = style?.bulletStyle ?? "checkmark";
  const accentColor = resolveAccent(style, "#4ADE80");
  const textColor = resolveTextColor(style);
  const radius = resolveCardRadius(style, "60px");
  const { background, border } = resolveCardStyles(style, false);

  let icon: string;
  switch (bulletStyle) {
    case "dot":    icon = "●"; break;
    case "number": icon = `${index + 1}.`; break;
    case "icon":   icon = "★"; break;
    default:       icon = "✓";
  }

  if (bulletStyle === "pill") {
    return `
      <div style="
        background:${background};
        border:${border};
        border-radius:${radius};
        padding:22px 40px;
        margin-bottom:22px;
        font-family:Arial,sans-serif;
        font-size:28px;
        color:${textColor};
        font-weight:500;
      ">${text}</div>`;
  }

  return `
    <div style="
      display:flex;
      align-items:center;
      gap:24px;
      background:${background};
      border:${border};
      border-radius:${radius};
      padding:24px 40px;
      margin-bottom:24px;
    ">
      <span style="
        font-size:36px;
        color:${accentColor};
        flex-shrink:0;
        font-weight:bold;
        min-width:40px;
        text-align:center;
      ">${icon}</span>
      <span style="
        font-family:Arial,sans-serif;
        font-size:28px;
        color:${textColor};
        font-weight:400;
        line-height:1.3;
      ">${text}</span>
    </div>`;
}

// ── base HTML wrapper ─────────────────────────────────────────────────────────

function baseHtml(
  body: string,
  photoUrl: string,
  style: StyleConfig | undefined,
  fallbackOverlayOpacity: number
): string {
  const overlayBg = resolveOverlay(style, fallbackOverlayOpacity);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1500px; height: 1500px; overflow: hidden; }
  .root {
    position: relative;
    width: 1500px;
    height: 1500px;
    background-image: url('${photoUrl}');
    background-size: cover;
    background-position: center;
    font-family: Arial, sans-serif;
  }
  .overlay {
    position: absolute;
    inset: 0;
    background: ${overlayBg};
  }
  .content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
  }
</style>
</head>
<body>
<div class="root">
  <div class="overlay"></div>
  <div class="content">
    ${body}
  </div>
</div>
</body>
</html>`;
}

// ── Slot 00 — Hero ────────────────────────────────────────────────────────────

export function slot00Template(photoUrl: string, copy: Slot00Copy, style?: StyleConfig): string {
  const headlinePx = resolveHeadlineSize(style, 88);
  const textColor = resolveTextColor(style);
  const headlineFont = resolveFont(style, "Georgia,serif");

  const body = `
    <div style="position:absolute;top:60px;left:60px;">
      <div style="
        background:rgba(255,255,255,0.15);
        border:2px solid rgba(255,255,255,0.6);
        border-radius:50px;
        padding:12px 28px;
        color:${textColor};
        font-family:Arial,sans-serif;
        font-size:22px;
        font-weight:600;
        letter-spacing:0.04em;
        display:inline-block;
      ">★ Top Rated</div>
    </div>

    <div style="
      flex:1;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      padding:120px 100px;
      text-align:center;
    ">
      <h1 style="
        font-family:${headlineFont};
        font-size:${headlinePx}px;
        font-weight:bold;
        color:${textColor};
        line-height:1.05;
        text-shadow:0 4px 24px rgba(0,0,0,0.5);
        margin-bottom:40px;
        letter-spacing:-0.01em;
      ">${copy.headline}</h1>
      <p style="
        font-family:Arial,sans-serif;
        font-size:32px;
        font-weight:300;
        color:rgba(255,255,255,0.92);
        line-height:1.4;
        text-shadow:0 2px 12px rgba(0,0,0,0.4);
        max-width:1100px;
      ">${copy.subline}</p>
    </div>

    <div style="position:absolute;bottom:60px;right:70px;text-align:right;">
      <div style="
        font-size:52px;
        color:${resolveAccent(style, "#FFD700")};
        text-shadow:0 2px 8px rgba(0,0,0,0.4);
        letter-spacing:4px;
      ">★★★★★</div>
      <div style="
        color:rgba(255,255,255,0.8);
        font-family:Arial,sans-serif;
        font-size:20px;
        margin-top:6px;
      ">5.0 Rating</div>
    </div>
  `;
  return baseHtml(body, photoUrl, style, 0.5);
}

// ── Slot 01 — Benefits ────────────────────────────────────────────────────────

export function slot01Template(photoUrl: string, copy: Slot01Copy, style?: StyleConfig): string {
  const headlinePx = resolveHeadlineSize(style, 68);
  const textColor = resolveTextColor(style);
  const headlineFont = resolveFont(style, "Georgia,serif");
  const bullets = copy.bullets.map((b, i) => renderBullet(b, style, i)).join("");

  const body = `
    <div style="padding:90px 90px 0;">
      <h1 style="
        font-family:${headlineFont};
        font-size:${headlinePx}px;
        font-weight:bold;
        color:${textColor};
        line-height:1.05;
        text-shadow:0 4px 24px rgba(0,0,0,0.5);
        margin-bottom:64px;
        max-width:1100px;
      ">${copy.headline}</h1>
      ${bullets}
    </div>

    <div style="
      position:absolute;bottom:0;left:0;right:0;
      padding:40px 90px;
      border-top:2px solid rgba(255,255,255,0.3);
      display:flex;align-items:center;gap:20px;
    ">
      <div style="width:8px;height:8px;background:${textColor};border-radius:50%;"></div>
      <span style="
        font-family:Arial,sans-serif;font-size:22px;
        color:rgba(255,255,255,0.7);
        letter-spacing:0.12em;text-transform:uppercase;
      ">Premium Quality</span>
    </div>
  `;
  return baseHtml(body, photoUrl, style, 0.5);
}

// ── Slot 02 — Problem/Solution ────────────────────────────────────────────────

export function slot02Template(photoUrl: string, copy: Slot02Copy, style?: StyleConfig): string {
  const headlinePx = resolveHeadlineSize(style, 76);
  const textColor = resolveTextColor(style);
  const headlineFont = resolveFont(style, "Georgia,serif");
  const { background: pillBg, border: pillBorder, textColorOverride: pillText } =
    resolveCardStyles(style, true);
  const pillRadius = resolveCardRadius(style, "60px");

  const pills = copy.bullets
    .map(
      (b) => `
      <div style="
        background:${pillBg};
        border:${pillBorder};
        border-radius:${pillRadius};
        padding:22px 48px;
        font-family:Arial,sans-serif;
        font-size:26px;
        color:${pillText ?? textColor};
        font-weight:600;
        white-space:nowrap;
      ">${b}</div>`
    )
    .join("");

  const body = `
    <div style="
      flex:1;display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      padding:80px 100px;text-align:center;
    ">
      <div style="
        font-family:Arial,sans-serif;font-size:20px;font-weight:700;
        color:rgba(255,255,255,0.75);letter-spacing:0.22em;text-transform:uppercase;
        margin-bottom:36px;
        background:rgba(255,255,255,0.12);
        border:1px solid rgba(255,255,255,0.3);
        padding:12px 32px;border-radius:40px;
      ">DE OPLOSSING</div>

      <h1 style="
        font-family:${headlineFont};font-size:${headlinePx}px;font-weight:bold;
        color:${textColor};line-height:1.05;
        text-shadow:0 4px 24px rgba(0,0,0,0.5);
        margin-bottom:36px;max-width:1200px;
      ">${copy.headline}</h1>

      <p style="
        font-family:Arial,sans-serif;font-size:28px;
        color:rgba(255,255,255,0.88);line-height:1.45;
        text-shadow:0 2px 12px rgba(0,0,0,0.4);
        margin-bottom:80px;max-width:1000px;
      ">${copy.subline}</p>

      <div style="display:flex;gap:28px;flex-wrap:wrap;justify-content:center;">
        ${pills}
      </div>
    </div>
  `;
  return baseHtml(body, photoUrl, style, 0.5);
}

// ── Slot 03 — Social Proof ────────────────────────────────────────────────────

export function slot03Template(photoUrl: string, copy: Slot03Copy, style?: StyleConfig): string {
  const headlinePx = resolveHeadlineSize(style, 62);
  const textColor = resolveTextColor(style);
  const headlineFont = resolveFont(style, "Georgia,serif");
  const stars = (n: number) => Array(n).fill("★").join("");
  const fullStars = Math.floor(parseFloat(copy.rating));

  const { background: cardBg, border: cardBorder, textColorOverride } =
    resolveCardStyles(style, true);
  const cardRadius = resolveCardRadius(style, "20px");
  const quoteTextColor = textColorOverride ?? textColor;
  const starColor = resolveAccent(style, "#F59E0B");

  const quoteCards = copy.quotes
    .map(
      (q) => `
      <div style="
        background:${cardBg};
        border:${cardBorder};
        border-radius:${cardRadius};
        padding:36px 44px;
        flex:0 1 auto;
      ">
        <div style="
          font-size:28px;color:${starColor};
          letter-spacing:3px;margin-bottom:16px;
        ">${stars(5)}</div>
        <p style="
          font-family:Arial,sans-serif;font-size:24px;
          font-style:italic;color:${quoteTextColor};line-height:1.55;
        ">"${q}"</p>
      </div>`
    )
    .join("");

  const body = `
    <div style="flex:1;display:flex;flex-direction:column;padding:80px 90px;">
      <h1 style="
        font-family:${headlineFont};font-size:${headlinePx}px;font-weight:bold;
        color:${textColor};text-shadow:0 4px 24px rgba(0,0,0,0.5);
        margin-bottom:60px;text-align:center;line-height:1.1;
      ">${copy.headline}</h1>

      <div style="display:flex;gap:36px;align-items:flex-start;">
        ${quoteCards}
      </div>

      <div style="
        text-align:center;margin-top:48px;padding-top:36px;
        border-top:1px solid rgba(255,255,255,0.25);
      ">
        <div style="
          font-size:44px;color:${resolveAccent(style, "#FFD700")};
          letter-spacing:6px;margin-bottom:10px;
        ">${stars(fullStars)}</div>
        <div style="
          font-family:Arial,sans-serif;font-size:22px;
          color:rgba(255,255,255,0.75);
          letter-spacing:0.08em;text-transform:uppercase;
        ">Geverifieerde bol.com klanten — ${copy.rating} sterren</div>
      </div>
    </div>
  `;
  return baseHtml(body, photoUrl, style, 0.5);
}

// ── Slot 04 — Lifestyle/CTA ───────────────────────────────────────────────────

export function slot04Template(photoUrl: string, copy: Slot04Copy, style?: StyleConfig): string {
  const headlinePx = resolveHeadlineSize(style, 84);
  const textColor = resolveTextColor(style);
  const headlineFont = resolveFont(style, "Georgia,serif");
  const { background: ctaBg, textColorOverride: ctaText } = resolveCardStyles(style, true);
  const ctaRadius = resolveCardRadius(style, "80px");

  const body = `
    <div style="
      flex:1;display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      padding:120px 120px 60px;text-align:center;
    ">
      <h1 style="
        font-family:${headlineFont};font-size:${headlinePx}px;font-weight:bold;
        color:${textColor};line-height:1.05;
        text-shadow:0 4px 28px rgba(0,0,0,0.5);
        margin-bottom:36px;max-width:1200px;letter-spacing:-0.01em;
      ">${copy.headline}</h1>

      <p style="
        font-family:Arial,sans-serif;font-size:30px;font-weight:300;
        color:rgba(255,255,255,0.9);line-height:1.5;
        text-shadow:0 2px 12px rgba(0,0,0,0.4);
        margin-bottom:80px;max-width:1000px;
      ">${copy.subline}</p>

      <div style="
        background:${ctaBg};
        color:${ctaText ?? "#1a1a1a"};
        font-family:Arial,sans-serif;font-size:32px;font-weight:700;
        padding:32px 90px;border-radius:${ctaRadius};
        letter-spacing:0.02em;box-shadow:0 8px 32px rgba(0,0,0,0.3);
      ">${copy.cta}</div>
    </div>
  `;
  return baseHtml(body, photoUrl, style, 0.4);
}
