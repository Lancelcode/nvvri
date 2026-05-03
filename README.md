```
███╗   ██╗██╗   ██╗██╗   ██╗██████╗ ██╗
████╗  ██║██║   ██║██║   ██║██╔══██╗██║
██╔██╗ ██║██║   ██║██║   ██║██████╔╝██║
██║╚██╗██║╚██╗ ██╔╝╚██╗ ██╔╝██╔══██╗██║
██║ ╚████║ ╚████╔╝  ╚████╔╝ ██║  ██║██║
╚═╝  ╚═══╝  ╚═══╝    ╚═══╝  ╚═╝  ╚═╝╚═╝
```

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-nvvri.vercel.app-00C7B7?style=for-the-badge&logo=vercel&logoColor=white)](https://nvvrii.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

</div>

---

## `$ cat problem.txt`

Finding a nursery in the UK is surprisingly broken. Parents search across five different sites, call nurseries individually, and still cannot easily compare Ofsted ratings, fees, and availability in one place.

nvvri is a proof of concept for what that experience should look like. Built to understand the problem space, not to collect stars.

---

## `$ cat about.txt`

```json
{
  "framework"  : "Next.js 15 (App Router, Turbopack)",
  "language"   : "TypeScript — strict mode, no any",
  "ui"         : "React 19 — client-side state and interactivity",
  "styling"    : "Inline styles only — no Tailwind, no CSS frameworks",
  "deployment" : "Vercel"
}
```

The no-Tailwind constraint was intentional. Inline styles force you to think about every value. No utility class to hide behind.

---

## `$ ls -la features/`

| Feature | Description |
|---|---|
| AI natural language search | Intent parser resolves area, age, Ofsted, price, tags, and availability from free text |
| Postcode support | Full postcodes (`EH10 4HR`) resolve to the correct area via nursery data, not a hardcoded map |
| Manual filters | Price slider, age group, and availability as fallback |
| Sort | By rating, price (low/high), or spaces available |
| Nursery cards | Ofsted badge with correct colour coding, fees, hours, age range, tags |
| Two-step enquiry flow | Field validation, inline error states, ESC-to-close |
| Thinking animation | Cycling messages that simulate AI processing latency |

---

## `$ cat parser.txt`

The most interesting part is not the UI. It is the search bar.

Instead of dropdowns, parents type what they actually mean:

```
"Outstanding nursery in Leith for a baby under 1 with outdoor space"
"Affordable toddler nursery in Stockbridge with spaces available"
"EH10 4HR"
```

| What it resolves | How |
|---|---|
| Area by name | Word-boundary regex against known areas |
| Area by postcode | Full postcode, district prefix, inward code |
| Age group | Months, years, baby/toddler/preschool keywords |
| Price ceiling | Ranges, "around £X", "under £X", "cheap" |
| Ofsted rating | Outstanding, Good, Requires Improvement |
| Availability | Spaces available, waitlist |
| Specialist tags | Outdoor, bilingual, STEM, funded places, yoga... |

The client-side parser (`src/lib/aiSearch.ts`) handles intent resolution without exposing API keys in a public repo. The API route (`src/app/api/search/route.ts`) is already written for a real Claude or Gemini call. Swapping in a key is a one-line change.

---

## `$ tree src/`

```
src/
├── app/
│   ├── api/search/route.ts     # Real LLM route (ready, not active in demo)
│   └── page.tsx                # Main view
├── components/
│   ├── NurseryCard.tsx         # Card with Ofsted badge logic
│   ├── EnquiryModal.tsx        # Two-step form with validation
│   └── ThinkingIndicator.tsx   # AI loading animation
├── lib/
│   ├── aiSearch.ts             # Natural language intent parser
│   └── data.ts                 # Nursery data, filter, and sort logic
└── types/
    └── index.ts                # Shared types
```

---

## `$ cat roadmap.log`

```
[done] ████████████████████  AI intent parser       — area, age, price, tags, Ofsted
[done] ████████████████████  Nursery cards          — Ofsted badge, fees, hours, tags
[done] ████████████████████  Enquiry flow           — two-step form, validation, ESC-close
[done] ████████████████████  Thinking animation     — simulates real LLM latency
[next] ░░░░░░░░░░░░░░░░░░░░  PostgreSQL + Prisma    — replace mock data
[next] ░░░░░░░░░░░░░░░░░░░░  Real AI search         — activate /api/search route
[next] ░░░░░░░░░░░░░░░░░░░░  Map view               — nursery locations
[next] ░░░░░░░░░░░░░░░░░░░░  Parent auth            — saved shortlists
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

---

## `$ deploy --one-click`

[![Deploy with Vercel](https://vercel.com/button)](https://nvvri.vercel.app/)

---

## `$ git log --oneline`

```
* Built to understand the problem, not just ship a product
* Parser handles partial postcodes, half-written area names, ambiguous phrasing
* No external search library — every regex is deliberate
* README written as if someone unfamiliar with the codebase will read it
```

---

<div align="center">
<sub>Built by <a href="https://github.com/Lancelcode">Djiby Sow Rebollo</a> · Edinburgh, Scotland</sub>
</div>

