```
███╗   ██╗██╗   ██╗██╗   ██╗██████╗ ██╗
████╗  ██║██║   ██║██║   ██║██╔══██╗██║
██╔██╗ ██║██║   ██║██║   ██║██████╔╝██║
██║╚██╗██║╚██╗ ██╔╝╚██╗ ██╔╝██╔══██╗██║
██║ ╚████║ ╚████╔╝  ╚████╔╝ ██║  ██║██║
╚═╝  ╚═══╝  ╚═══╝    ╚═══╝  ╚═╝  ╚═╝╚═╝
```

<div align="center">

[![Live](https://img.shields.io/badge/Live-nvvri.co.uk-00C7B7?style=for-the-badge&logo=vercel&logoColor=white)](https://nvvri.co.uk)
[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript_strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/Postgres-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tests](https://img.shields.io/badge/E2E-Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev)

</div>

---

## `$ cat problem.txt`

Finding a nursery in the UK is broken. Parents stitch together five different sites, ring nurseries one at a time, and still cannot easily compare Ofsted ratings, fees, and availability in one place.

nvvri is a working proof of concept for what that experience should look like, built end-to-end to understand the problem space.

---

## `$ cat stack.txt`

```json
{
  "framework"  : "Next.js 15 (App Router, Turbopack, RSC)",
  "language"   : "TypeScript, strict mode, zero any",
  "ui"         : "React 19, inline styles only, no Tailwind, no CSS frameworks",
  "database"   : "Neon (PostgreSQL) + Prisma v5",
  "ai"         : "OpenRouter, multi-model fallback chain",
  "email"      : "Resend, verified domain nvvri.co.uk",
  "maps"       : "Leaflet + OpenStreetMap",
  "tests"      : "Playwright E2E, runs in CI",
  "deployment" : "Vercel",
  "domain"     : "nvvri.co.uk"
}
```

The no-Tailwind constraint was intentional. Inline styles force you to think about every value. No utility class to hide behind.

---

## `$ ls -la features/`

| Feature | Description |
|---|---|
| AI natural language search | Free-text queries parsed into structured filters by an LLM |
| Multi-model fallback chain | Llama 3.3 -> Mistral 7B -> Gemma 3 -> openrouter/auto -> local parser |
| Local parser fallback | Regex parser. Search works even if every AI model is down |
| Postcode resolution | Full postcodes, district prefixes, and inward codes all resolve |
| Per-nursery SEO pages | Server-rendered, JSON-LD `Preschool` schema, dynamic sitemap |
| AI answer card | Zero-click summary at the top of results |
| Map view | Leaflet + OSM, custom markers, popup with enquire CTA |
| Real enquiry backend | Resend sends two emails (parent confirmation + admin notification) |
| Mobile responsive | Bottom-sheet modal, single-column grid, adaptive nav |
| Two-step enquiry flow | Field validation, inline errors, ESC-to-close |
| E2E tests | Playwright covers list and map enquiry flows, runs in CI |

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

The AI route sends the query to OpenRouter with a strict JSON schema. If the AI call fails or times out, the local parser (`src/lib/aiSearch.ts`) handles intent resolution client-side, no API key required, instant, offline-capable.

| What it resolves | How |
|---|---|
| Area by name | Word-boundary regex against known areas |
| Area by postcode | Full postcode, district prefix, inward code |
| Area by partial name | "mornings" -> Morningside, "stock" -> Stockbridge |
| Age group | Weeks, months, years, baby/toddler/preschool keywords |
| Price ceiling | Ranges, "around £X", "under £X", "cheap" |
| Ofsted rating | Outstanding, Good, Requires Improvement |
| Availability | Spaces available, waitlist |
| Specialist tags | Outdoor, bilingual, STEM, funded, yoga, and more |

The AI fallback chain tries four models in order before giving up:

```
meta-llama/llama-3.3-70b-instruct:free
  -> mistralai/mistral-7b-instruct:free
    -> google/gemma-3-12b-it:free
      -> openrouter/auto
        -> local parser (always works)
```

The user never sees a failure state.

---

## `$ cat seo.txt`

Directory sites live and die by search. nvvri is built so Google sees everything a parent does.

* Home page is a server component, nurseries fetched at request time, hydrated with full content in the initial HTML
* Each nursery has its own statically generated page at `/nursery/[slug]`
* Per-page metadata: titles, descriptions, Open Graph, Twitter cards
* JSON-LD structured data using the `Preschool` schema, with `aggregateRating`, `address`, `geo`, `openingHours`, and `priceRange`
* Dynamic `sitemap.xml` generated from the database
* `robots.txt` allows full crawl and points to the sitemap
* ISR with 60s revalidation keeps content fresh without rebuilds

---

## `$ tree src/`

```
src/
├── app/
│   ├── api/
│   │   ├── enquiry/route.ts     # Resend two-email flow
│   │   ├── nurseries/route.ts   # GET nurseries from DB
│   │   └── search/route.ts      # OpenRouter multi-model fallback
│   ├── nursery/[slug]/
│   │   ├── page.tsx             # Server-rendered nursery detail + JSON-LD
│   │   └── not-found.tsx        # 404 for unknown slugs
│   ├── layout.tsx               # Root metadata, OG, Twitter
│   ├── page.tsx                 # Server component, fetches and renders
│   ├── sitemap.ts               # Dynamic sitemap from DB
│   ├── robots.ts                # Crawl rules
│   ├── loading.tsx              # Root loading state
│   └── not-found.tsx            # Global 404
├── components/
│   ├── HomeClient.tsx           # Client interactivity, takes nurseries as prop
│   ├── NurseryCard.tsx          # Card with Ofsted badge logic
│   ├── NurseryMap.tsx           # Leaflet map, custom markers, popup
│   ├── EnquiryModal.tsx         # Two-step form, validation, ESC-close
│   ├── ThinkingIndicator.tsx    # AI loading animation
│   ├── AnswerCard.tsx           # Zero-click AI summary above results
│   └── NurseryActions.tsx       # Client island for the enquire CTA on detail pages
├── hooks/
│   └── useIsMobile.ts           # Responsive breakpoint hook
├── lib/
│   ├── prisma.ts                # Prisma singleton
│   ├── aiSearch.ts              # Local intent parser (no API)
│   ├── data.ts                  # Filter and sort helpers
│   ├── slug.ts                  # Stable slug generation
│   └── seo.ts                   # JSON-LD builder
└── types/
    └── index.ts                 # Shared types
```

---

## `$ cat env.txt`

Set these in `.env.local` for development and in Vercel for production:

```
DATABASE_URL          # Neon Postgres connection string
RESEND_API_KEY        # Resend API key
CONTACT_EMAIL         # Where admin enquiry notifications land
OPENROUTER_API_KEY    # OpenRouter key for AI search (free tier works)
NEXT_PUBLIC_SITE_URL  # Public origin, e.g. https://nvvri.co.uk
```

Without `OPENROUTER_API_KEY` the local parser handles every search. Without `RESEND_API_KEY` the enquiry flow returns 500. Other vars are required.

---

## `$ cat roadmap.log`

```
[done] ████████████████████  AI intent parser            Area, age, price, tags, Ofsted
[done] ████████████████████  Multi-model fallback        4 models + local parser safety net
[done] ████████████████████  PostgreSQL + Prisma         Neon, 6 nurseries seeded with lat/lng
[done] ████████████████████  Real enquiry backend        Resend, parent + admin emails
[done] ████████████████████  Mobile responsive UI        Bottom sheet, single column, adaptive nav
[done] ████████████████████  Map view                    Leaflet, custom markers, popup CTA
[done] ████████████████████  Playwright E2E              List and map flows, runs in CI
[done] ████████████████████  SEO foundation              SSR, sitemap, robots, JSON-LD
[done] ████████████████████  AI answer card              Zero-click summary above results
[next] ░░░░░░░░░░░░░░░░░░░░  Parent auth                 Shortlists and saved nurseries
[next] ░░░░░░░░░░░░░░░░░░░░  Compare nurseries           Side-by-side comparison
[next] ░░░░░░░░░░░░░░░░░░░░  Search analytics            Log queries, track model success rates
[next] ░░░░░░░░░░░░░░░░░░░░  Nursery admin portal        For nurseries to manage their listing
```

---

## `$ git clone && npm run dev`

```bash
git clone https://github.com/Lancelcode/nvvri.git
cd nvvri
npm install
cp .env.example .env.local   # fill in values
npx prisma migrate deploy    # apply schema
npx prisma db seed           # seed 6 nurseries
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## `$ npm test`

```bash
npx playwright install        # one-time browser install
npm run build                 # build the app
npm start &                   # serve on :3000
npx playwright test           # run E2E suite
```

CI runs the same flow on every push to `main`.

---

## `$ open --live`

Live at [nvvri.co.uk](https://nvvri.co.uk)
GitHub: [github.com/Lancelcode/nvvri](https://github.com/Lancelcode/nvvri)

---

<div align="center">
<sub>Built by <a href="https://github.com/Lancelcode">Djiby Sow Rebollo</a> in Edinburgh, Scotland</sub>
</div>
