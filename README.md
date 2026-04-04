# Amazon Infographic Generator

Generate 5 ready-to-use Amazon listing infographic images (1500×1500px PNG) from product reviews and lifestyle photos.

## How it works

1. Paste 10–30 Amazon reviews + product info
2. Upload 1–5 lifestyle photos (your own — JPEG/PNG)
3. Claude analyzes reviews for conversion drivers, blockers, and customer voice
4. Claude writes punchy copy for 5 infographic slots
5. Download each slot as a 1500×1500px PNG via Puppeteer rendering

## Infographic slots

| Slot | Type | Content |
|------|------|---------|
| 00 | Hero / Attraction | Bold headline + subline |
| 01 | Top Benefits | Headline + 3 bullet points |
| 02 | Problem / Solution | Headline + subline + 2 feature pills |
| 03 | Social Proof | Headline + 2 review quotes + star rating |
| 04 | Lifestyle / CTA | Headline + subline + CTA button |

## Setup

```bash
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** `puppeteer` bundles its own Chromium — no extra install needed.

## Environment variables

```
ANTHROPIC_API_KEY=your_key_here
```

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Anthropic SDK (`claude-sonnet-4-5`)
- Puppeteer (HTML → PNG)
- Sharp (photo resizing to 1500×1500)
