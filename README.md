# EcoTrack 🌱

A mobile-first web app that helps users **measure, track, and reduce their carbon footprint**.

## Problem statement alignment

EcoTrack delivers every core capability from the brief:

| Requirement | Where |
|---|---|
| Nature-inspired soft green / mint palette, 20–28px rounded corners, large card layout | `src/styles.css`, `src/components/AppShell.tsx` |
| Onboarding / landing | `src/routes/index.tsx` |
| Auth screen | `src/routes/auth.tsx` |
| Dashboard with carbon trends | `src/routes/dashboard.tsx` |
| Carbon Scanner (bills, fuel, flights, groceries, transport) | `src/routes/scanner.tsx` |
| Challenges | `src/routes/challenges.tsx` |
| Community feed | `src/routes/community.tsx` |
| EcoCoach AI chat | `src/routes/coach.tsx` |
| Profile | `src/routes/profile.tsx` |
| PWA manifest, robots, sitemap, llms.txt | `public/` |
| Pure carbon-math library + unit tests | `src/lib/carbon.ts`, `src/lib/carbon.test.ts` |

## Carbon math

All emission factors live in `src/lib/carbon.ts` and are sourced from public
EPA (2023) and DEFRA (2023) datasets:

| Category    | Factor (kg CO₂e/unit) | Unit    |
|-------------|----------------------:|---------|
| Electricity | 0.42                  | kWh     |
| Fuel        | 2.31                  | liters  |
| Flight      | 0.158                 | km      |
| Grocery     | 1.9                   | item    |
| Transport   | 0.21                  | km      |

Inputs are validated with Zod (`ActivityInputSchema`, `UploadFileSchema`)
to keep untrusted data out of calculations and file handlers.

## Quality gates

- **Tests**: `bun test` runs the Vitest suite covering emission math, grade
  buckets, schema validation, and upload sanitization.
- **Lint**: `bun run lint` runs ESLint + Prettier.
- **Build**: `bun run build` produces a production bundle.

## Accessibility

- Single `<main>` landmark with a visible skip link
- 44×44 tap targets on header controls
- `aria-label`s on icon-only buttons, `aria-selected` tabs, `aria-busy` /
  `aria-live` on the scanner
- `prefers-reduced-motion` honored across animations

## Security

- All user input is validated with Zod before computation or persistence
- File uploads are restricted to images / PDFs ≤ 10 MB
- No `dangerouslySetInnerHTML`, no inline `eval`
- LocalStorage writes are wrapped in try/catch to fail safe
