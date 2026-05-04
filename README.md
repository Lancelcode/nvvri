```
███╗   ██╗██╗   ██╗██╗   ██╗██████╗ ██╗
████╗  ██║██║   ██║██║   ██║██╔══██╗██║
██╔██╗ ██║██║   ██║██║   ██║██████╔╝██║
██║╚██╗██║╚██╗ ██╔╝╚██╗ ██╔╝██╔══██╗██║
██║ ╚████║ ╚████╔╝  ╚████╔╝ ██║  ██║██║
╚═╝  ╚═══╝  ╚═══╝    ╚═══╝  ╚═╝  ╚═╝╚═╝
```

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-nvvri.vercel.app-00C7B7?style=for-the-badge&logo=vercel&logoColor=white)](https://nvvri.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Playwright](https://img.shields.io/badge/Playwright-E2E_Tested-45BA4B?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev)

</div>

---

## `$ cat problem.txt`

Finding a nursery in the UK is surprisingly broken. Parents search across five different sites, call nurseries individually, and still cannot easily compare Ofsted ratings, fees, and availability in one place.

nvvri is a proof of concept for what that experience should look like — built to understand the problem space from the ground up.

---

## `$ cat about.txt`

```json
{
  "framework"  : "Next.js 15 (App Router, Turbopack)",
  "language"   : "TypeScript — strict mode, zero any",
  "ui"         : "React 19 — client-side state and interactivity",
  "styling"    : "Inline styles only — no Tailwind, no CSS frameworks",
  "database"   : "PostgreSQL via Neon — Prisma ORM, schema migrations",
  "email"      : "Resend — verified domain, two-way confirmation emails",
  "ai"         : "OpenRouter — multi-model fallback chain (Llama, Mistral, Gemma)",
  "maps"       : "Leaflet + OpenStreetMap — no API key required",
  "testing"    : "Playwright — end-to-end enquiry flow, list and map views",
  "deployment" : "Vercel — preview deployments per branch, CI on push"
}
```

The no-Tailwind constraint was intentional. Inline styles force you to think about every value. No utility class to hide behind.

---

## `$ ls -la features/`

| Feature | Description |
|---|---|
| AI natural language search | Intent parser resolves area, age, Ofsted, price, tags, and availability from free text |
| Multi-model fallback chain | Tries Llama 3.3 → Mistral 7B → Gemma 3 → auto-router before falling back to local parser |
| Local parser fallback | Client-side regex parser — search always works, even if every AI model is down |
| PostgreSQL database | Real nursery data via Neon serverless Postgres — Prisma schema, migrations, seed |
| Interactive map view | Leaflet map with custom markers, popup cards, and enquire from pin |
| Two-way email enquiry | Resend on verified domain — confirmation to parent, notification to admin |
| Mobile responsive UI | Adaptive layouts, bottom-sheet modal on mobile, single-column card grid |
| Two-step enquiry flow | Field validation, inline error states, ESC-to-close, real email delivery |
| Manual filters | Price slider, age group, availability, sort by rating/price/spaces |
| E2E test suite | Playwright tests for full enquiry flow — list view and map view |

---

## `$ cat search.txt`

The most interesting part is not the UI. It is the search bar.

Instead of dropdowns, parents type what they actually mean:

```
"Outstanding nursery in Leith for a baby under 1 with outdoor space"
"Affordable toddler nursery in Stockbridge with spaces available"
"EH10 4HR"
"6 month old, around £55 a day"
```

The AI route sends the query to OpenRouter with a strict JSON schema. If the AI call fails or times out, the local parser (`src/lib/aiSearch.ts`) handles intent resolution client-side — no API key required, instant, offline-capable.

| What it resolves | How |
|---|---|
| Area by name | Word-boundary regex against known areas |
| Area by postcode | Full postcode, district prefix, inward code — all handled |
| Area by partial name | "mornings" → Morningside, "stock" → Stockbridge |
| Age group | Weeks, months, years, baby/toddler/preschool keywords |
| Price ceiling | Ranges, "around £X", "under £X", "cheap" — with semantics |
| Ofsted rating | Outstanding, Good, Requires Improvement |
| Availability | Spaces available, waitlist |
| Specialist tags | Outdoor, bilingual, STEM, funded places, yoga, and more |

The AI fallback chain tries four models in order before giving up:

```
meta-llama/llama-3.3-70b-instruct:free
  → mistralai/mistral-7b-instruct:free
    → google/gemma-3-12b-it:free
      → openrouter/auto
        → local parser (always works)
```

The user never sees a failure state.

---

## `$ tree src/`

```
src/
├── app/
│   ├── api/
│   │   ├── enquiry/route.ts    # Resend — two emails per enquiry (parent + admin)
│   │   ├── nurseries/route.ts  # GET nurseries from Neon via Prisma
│   │   └── search/route.ts     # OpenRouter multi-model fallback route
│   └── page.tsx                # Main view — AI search, filters, list/map toggle
├── components/
│   ├── EnquiryModal.tsx        # Two-step form, validation, ESC-to-close, real send
│   ├── NurseryCard.tsx         # Card with Ofsted badge and colour logic
│   ├── NurseryMap.tsx          # Leaflet map, custom markers, popup enquiry
│   └── ThinkingIndicator.tsx   # AI loading animation
├── hooks/
│   └── useIsMobile.ts          # Responsive breakpoint hook
├── lib/
│   ├── aiSearch.ts             # Natural language intent parser (local, no API)
│   ├── data.ts                 # Filter and sort logic
│   └── prisma.ts               # Prisma client singleton
└── types/
    └── index.ts                # Shared types across the app
prisma/
├── schema.prisma               # Nursery model with lat/lng for map view
├── migrations/                 # Version-controlled schema history
└── seed.ts                     # 6 Edinburgh nurseries with coordinates
tests/
└── enquiry.spec.ts             # Playwright E2E — list and map enquiry flows
```

---

## `$ cat roadmap.log`

```
[done] ████████████████████  AI intent parser       — area, age, price, tags, Ofsted
[done] ████████████████████  Multi-model fallback   — 4 models + local parser safety net
[done] ████████████████████  PostgreSQL + Prisma    — Neon database, migrations, seed
[done] ████████████████████  Real enquiry backend   — Resend, verified domain, two emails
[done] ████████████████████  Mobile responsive UI   — bottom sheet modal, adaptive layouts
[done] ████████████████████  Map view               — Leaflet, custom markers, popup enquiry
[done] ████████████████████  E2E tests              — Playwright, list and map flows, CI
[next] ░░░░░░░░░░░░░░░░░░░░  Parent auth            — saved shortlists and comparison
```

---

## `$ git clone && npm run dev`

```bash
git clone https://github.com/Lancelcode/nvvri.git
cd nvvri
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create `.env.local` with your keys:

```
OPENROUTER_API_KEY=your_key_here
DATABASE_URL=your_neon_connection_string
RESEND_API_KEY=your_resend_key
CONTACT_EMAIL=your_email@example.com
```

Get a free OpenRouter key (no credit card) at [openrouter.ai](https://openrouter.ai). Without it, the local parser handles all search — the app works fully offline.

Run the database seed:

```bash
npx prisma migrate dev
npx prisma db seed
```

Run E2E tests (requires dev server running):

```bash
npx playwright test tests/enquiry.spec.ts --headed
```

---

## `$ open --live`

Live at [nvvri.vercel.app](https://nvvri.vercel.app)

---

<div align="center">
<sub>Built by <a href="https://github.com/Lancelcode">Djiby Sow Rebollo</a> · Edinburgh, Scotland</sub>
</div>
