/**
 * AI Search API Route
 *
 * This route is ready to accept a natural language query and return
 * structured nursery filters via a real LLM call.
 *
 * Currently unused — the app uses a client-side intent parser (src/lib/aiSearch.ts)
 * to avoid exposing API keys in a public repo.
 *
 * To enable real AI search:
 * 1. Add ANTHROPIC_API_KEY (or GEMINI_API_KEY) to .env.local
 * 2. Replace the client-side parseQuery() call in page.tsx with a fetch to this route
 * 3. Uncomment the implementation below
 */

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Real AI search not enabled in this demo. See route.ts for instructions." },
    { status: 501 }
  );
}

/*
// Full implementation — uncomment and add API key to activate

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 512,
      system: `You are a search parser for a nursery finder. Return ONLY valid JSON, no markdown.
Schema: { area: string|null, minAge: number|null, maxAge: number|null,
          ofsted: "Outstanding"|"Good"|"Requires Improvement"|null,
          maxPrice: number|null, availFilter: "available"|"waitlist"|"any",
          tags: string[], explanation: string }`,
      messages: [{ role: "user", content: query }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "{}";

  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }
}
*/
