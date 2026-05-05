import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AIFilters } from "@/types";

const SYSTEM_PROMPT = `You are a search parser for a nursery finder app in Edinburgh.
Extract search intent from natural language and return ONLY valid JSON, no markdown, no explanation, no backticks.

Available areas: Morningside, Leith, Bruntsfield, Newington, Stockbridge, Corstorphine
Available ofsted values: "Outstanding", "Good", "Requires Improvement"
Available tags: "Outdoor Learning", "Nursery School", "Bilingual", "STEM Focus", "Arts & Crafts", "Garden", "Flexible Hours", "Funded Places", "Nature Play", "Yoga", "Large Setting"

Age rules:
- baby/infant/newborn/under 1 = minAge: 0, maxAge: 0.9
- toddler/1-2 years = minAge: 1, maxAge: 2.9
- preschool/3-5 years = minAge: 3, maxAge: 5
- X months old: convert to years (e.g. 6 months = 0.5)

Postcode rules: EH10 4BX -> Morningside, EH10 4HR -> Bruntsfield, EH6 8DB -> Leith, EH9 1QH -> Newington, EH3 5NE -> Stockbridge, EH12 7AA -> Corstorphine

Return exactly this JSON shape:
{
  "area": string | null,
  "minAge": number | null,
  "maxAge": number | null,
  "ofsted": "Outstanding" | "Good" | "Requires Improvement" | null,
  "maxPrice": number | null,
  "availFilter": "available" | "waitlist" | "any",
  "tags": string[],
  "nameSearch": string | null,
  "explanation": string
}

The "explanation" field: short human-readable summary e.g. "Outstanding nurseries in Leith for babies with outdoor learning".
The "nameSearch" field: any free-text keywords that don't map to structured filters.
If nothing matches a field use null or empty array or "any".`;

const MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "google/gemma-3-12b-it:free",
  "openrouter/auto",
];

const REQUEST_TIMEOUT_MS = 10_000;

// Best-effort logger. Never throws, never blocks the user response if it fails.
// If the SearchLog table does not exist yet (migration not run) we silently
// drop the log rather than 500 the user-facing search.
async function logSearch(entry: {
  query: string;
  model: string | null;
  success: boolean;
  latencyMs: number;
  errorDetail: string | null;
  userAgent: string | null;
}): Promise<void> {
  try {
    await prisma.searchLog.create({ data: entry });
  } catch (err) {
    console.warn("SearchLog write failed:", err);
  }
}

export async function POST(req: NextRequest) {
  const started = Date.now();
  const userAgent = req.headers.get("user-agent");

  let query: string;
  try {
    const body = await req.json();
    query = body?.query;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 501 });
  }

  let lastError = "";

  for (const model of MODELS) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer":
              process.env.NEXT_PUBLIC_SITE_URL ?? "https://nvvri.co.uk",
            "X-Title": "nvvri",
          },
          body: JSON.stringify({
            model,
            max_tokens: 512,
            temperature: 0,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: query },
            ],
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        lastError = JSON.stringify(err);
        console.warn(`Model ${model} failed:`, lastError);
        continue;
      }

      const data = await response.json();
      const text: string = data.choices?.[0]?.message?.content ?? "";
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found in response");
      const filters: AIFilters = JSON.parse(match[0]);

      if (!filters || typeof filters !== "object" || !("explanation" in filters)) {
        throw new Error("Response missing required fields");
      }

      // Log success before returning. Sub-10ms on a warm Neon connection.
      await logSearch({
        query,
        model,
        success: true,
        latencyMs: Date.now() - started,
        errorDetail: null,
        userAgent,
      });

      return NextResponse.json(filters, {
        headers: { "X-AI-Model": model },
      });
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.warn(`Model ${model} threw:`, lastError);
      continue;
    }
  }

  // All models failed. Client will fall back to the local parser.
  await logSearch({
    query,
    model: null,
    success: false,
    latencyMs: Date.now() - started,
    errorDetail: lastError.slice(0, 500),
    userAgent,
  });

  return NextResponse.json(
    { error: "All models failed", detail: lastError },
    { status: 502 }
  );
}
