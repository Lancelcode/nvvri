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

</div>

---

## `$ cat problem.txt`

Finding a nursery in the UK is surprisingly broken. Parents search across five different sites, call nurseries individually, and still cannot easily compare Ofsted ratings, fees, and availability in one place.

nvvri is a proof of concept for what that experience should look like. Built to understand the problem space

---

## `$ cat about.txt`

```json
{
  "framework"  : "Next.js 15 (App Router, Turbopack)",
  "language"   : "TypeScript — strict mode, zero any",
  "ui"         : "React 19 — client-side state and interactivity",
  "styling"    : "Inline styles only — no Tailwind, no CSS frameworks",
  "ai"         : "OpenRouter — multi-model fallback chain (Llama, Mistral, Gemma)",
  "deployment" : "Vercel"
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
| Postcode resolution | Full postcodes, district prefixes, and inward codes all resolve to the correct area |
| Manual filters | Price slider, age group, and availability for users who prefer structured search |
| Sort | By rating, price (low/high), or spaces available |
| Nursery cards | Ofsted badge with colour coding, fees, hours, age range, tags |
| Two-step enquiry flow | Field validation, inline error states, ESC-to-close |
| Thinking animation | Cycling messages that simulate AI processing latency |

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
│   ├── api/search/route.ts     # OpenRouter multi-model fallback route
│   └── page.tsx                # Main view — AI search + filters + results
├── components/
│   ├── NurseryCard.tsx         # Card with Ofsted badge logic
│   ├── EnquiryModal.tsx        # Two-step form with validation and ESC-to-close
│   └── ThinkingIndicator.tsx   # AI loading animation
├── lib/
│   ├── aiSearch.ts             # Natural language intent parser (local, no API)
│   └── data.ts                 # Nursery data, filter, and sort logic
└── types/
    └── index.ts                # Shared types across the app
```

---

## `$ cat roadmap.log`

```
[done] ████████████████████  AI intent parser       — area, age, price, tags, Ofsted
[done] ████████████████████  Multi-model fallback   — 4 models + local parser safety net
[done] ████████████████████  Nursery cards          — Ofsted badge, fees, hours, tags
[done] ████████████████████  Enquiry flow           — two-step form, validation, ESC-close
[done] ████████████████████  Thinking animation     — simulates real LLM latency
[next] ░░░░░░░░░░░░░░░░░░░░  PostgreSQL + Prisma    — replace mock data with real nurseries
[next] ░░░░░░░░░░░░░░░░░░░░  Real enquiry backend   — email delivery via Resend or Postmark
[next] ░░░░░░░░░░░░░░░░░░░░  Mobile responsive UI   — optimise for parent on the go
[next] ░░░░░░░░░░░░░░░░░░░░  Map view               — nursery locations on an interactive map
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

To enable AI search, add your OpenRouter key to `.env.local`:

```
OPENROUTER_API_KEY=your_key_here
```

Get a free key (no credit card) at [openrouter.ai](https://openrouter.ai). Without a key, the local parser handles all search, the app works fully offline.

---

## `$ open --live`

Live at [nvvri.vercel.app](https://nvvri.vercel.app)

---

<div align="center">
<sub>Built by <a href="https://github.com/Lancelcode">Djiby Sow Rebollo</a> · Edinburgh, Scotland</sub>
</div>
