# nvvri devlog

A running log of what I built, what I learned, and what broke along the way.
No polish. Just honest notes from the process.

---

## How to read this

Each entry has:
- **What I did** -- the actual change
- **Why** -- the reason behind the decision
- **What I learned** -- the thing I will carry forward
- **What broke / what was hard** -- honest account of where I struggled

---

## Entries

---

### [2026-05-19] -- Project reset: documenting everything from here

**What I did**

Set up this devlog. Going back to basics -- not just shipping features, but understanding every decision I make.

**Why**

Two reasons. First, I want to actually learn, not just copy and paste until something works. Second, a well-documented project tells a story. Anyone reading the code should be able to understand not just what I built but why I built it that way.

**What I learned**

Explaining something forces you to understand it. If I cannot write a clear sentence about why I made a decision, I probably do not understand it well enough yet.

**Current state of the project**

Stack:
- Next.js 15, App Router, Turbopack
- React 19
- TypeScript strict mode, zero `any`
- Neon (PostgreSQL) + Prisma v5
- OpenRouter for AI search
- Resend for transactional email
- Leaflet + OpenStreetMap for the map view
- Playwright for E2E tests, runs in CI
- Deployed on Vercel at nvvri.co.uk

What is already built:
- AI natural language search with multi-model fallback chain (Llama 3.3 -> Mistral 7B -> Gemma 3 -> openrouter/auto -> local parser)
- Local parser fallback -- search works even if every AI model is down
- PostgreSQL database with Prisma, 6 nurseries seeded with real coordinates
- Real enquiry backend via Resend, sends two emails (parent confirmation + admin notification)
- Mobile responsive UI with bottom-sheet modal
- Map view with Leaflet, custom markers, enquire CTA in popup
- Playwright E2E tests covering list and map enquiry flows
- SEO foundation: SSR, sitemap.xml, robots.txt, JSON-LD Preschool schema
- AI answer card -- zero-click summary at the top of results
- Per-nursery detail pages with server rendering and static generation

What is next:
- Parent auth (shortlists and saved nurseries)
- Compare nurseries side by side
- Search analytics (log queries, track model success rates)
- Nursery admin portal

---

<!-- 
TEMPLATE -- copy this block for every new entry

### [YYYY-MM-DD] -- Short title

**What I did**


**Why**


**What I learned**


**What broke / what was hard**


-->
