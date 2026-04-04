# Amazon Infographic Generator

## What this project does
Local Next.js app that generates Amazon listing infographics.
User pastes reviews + uploads lifestyle photos → Claude generates copy → 
Puppeteer renders HTML templates → downloadable 1500x1500px PNG.

## Tech stack
- Next.js 14 (app router) + TypeScript
- Tailwind CSS
- Anthropic SDK (claude-sonnet-4-5)
- Puppeteer + Sharp

## Key architectural decisions
- No database — in-memory Map in /lib/store.ts
- No image AI — user uploads own photos (made with Gemini)
- Photos stored temporarily in /public/uploads/{sessionId}/
- All infographics are HTML templates → Puppeteer screenshot → PNG

## Code style
- Always use TypeScript, never plain JS
- Always handle Claude JSON parse errors with one retry
- Keep all Anthropic prompts in /lib/claude/prompts.ts
- Never put business logic in API routes — only call lib functions

## Environment
ANTHROPIC_API_KEY in .env.local

## Current status
[ ] Update this section as features get built

## Commands
npm run dev       ← start local server
npm run build     ← production build