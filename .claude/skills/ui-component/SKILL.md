---
name: ui-component
description: Port a screen or component from mockup files to the Next.js app
type: workflow
---

# UI Component Skill

## Goal
Translate a mockup (HTML/JSX/CSS) into a production Next.js component in `apps/web/`.

## Steps

1. **Read mockup** — locate source in `/mockup/` or as described by user
2. **Map to component tree** — identify which files in `apps/web/components/` to create/update
3. **Port styles** — convert inline or CSS-module styles to Tailwind; add tokens to `globals.css` if needed
4. **Wire API** — use typed client in `lib/api.ts` for data fetching; never raw fetch in components
5. **Check types** — ensure props match types from `packages/types/*.schema.json`
6. **Smoke test** — run `npm run dev`, navigate to the route, confirm render

## Conventions
- Server components by default; add `"use client"` only when needed
- Named exports for all components
- Co-locate component test next to component file (`ComponentName.test.tsx`)
