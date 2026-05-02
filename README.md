# nvvri

A nursery discovery platform built to understand the problem of connecting parents with childcare, the same problem the best nursery-tech companies are solving right now.

Finding a nursery in the UK is surprisingly broken. Parents search across five different sites, call nurseries individually, and still can't easily compare Ofsted ratings, fees, and availability in one place. nvvri is a proof of concept for what that experience should look like.

**Live demo:** [nvvri.vercel.app](https://nvvrii.vercel.app)

---

## AI-powered natural language search

The most interesting feature isn't the filters, it's the search bar at the top.

Instead of dropdowns, parents can type what they actually mean:

> *"Outstanding nursery in Leith for a baby under 1 with outdoor space"*
> *"Affordable toddler nursery in Stockbridge with spaces available"*
> *"EH10 4HR"*

The parser resolves intent, area (by name or postcode), age group, Ofsted rating, price range, availability, and specialist tags — and filters results in real time with a thinking animation that mirrors what a real LLM call would feel like.

The architecture is deliberate: the client-side parser (`src/lib/aiSearch.ts`) handles intent resolution without exposing API keys in a public repo. The API route (`src/app/api/search/route.ts`) is already written for a real Claude or Gemini call, swapping in a key is a one-line change.

---

## Stack

- **Next.js 15** App Router, Turbopack dev server
- **TypeScript** strict mode throughout, no `any`
- **React 19** client-side state and interactivity
- **No Tailwind** inline styles only, intentional constraint

---

## Features

- **AI natural language search** intent parser resolves area, age, Ofsted, price, tags, and availability from free text
- **Postcode support** full postcodes (`EH10 4HR`) resolve to the correct area via nursery data, not a hardcoded map
- **Manual filters** price slider, age group, and availability as fallback
- **Sort** by rating, price (low/high), or spaces available
- **Nursery cards** Ofsted badge (Outstanding / Good / Requires Improvement with correct colour coding), fees, hours, age range, tags
- **Two-step enquiry flow** with field validation, inline error states, and ESC-to-close
- **Thinking animation** cycling messages that simulate AI processing latency

---

## Project structure

```
src/
├── app/
│   ├── api/search/route.ts   # Real LLM route (ready, not active in demo)
│   └── page.tsx              # Main view
├── components/
│   ├── NurseryCard.tsx       # Card with Ofsted badge logic
│   ├── EnquiryModal.tsx      # Two-step form with validation
│   └── ThinkingIndicator.tsx # AI loading animation
├── lib/
│   ├── aiSearch.ts           # Natural language intent parser
│   └── data.ts               # Nursery data, filter, and sort logic
└── types/
    └── index.ts              # Shared types
```

---

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Lancelcode/nvvri)

---

## What's next

- PostgreSQL + Prisma to replace mock data
- Real AI search via `/api/search` route (Claude or Gemini)
- Map view with nursery locations
- Parent auth and saved shortlists

---

Built by [Djiby Sow Rebollo](https://github.com/Lancelcode)
