import { NextRequest, NextResponse } from "next/server";
import type { AIFilters } from "@/types";

const SYSTEM_PROMPT = `You are a search parser for a nursery finder app in Edinburgh.
Extract search intent from natural language and return ONLY valid JSON — no markdown, no explanation, no backticks.

Available areas: Morningside, Leith, Bruntsfield, Newington, Stockbridge, Corstorphine
Available ofsted values: "Outstanding", "Good", "Requires Improvement"
Available tags: "Outdoor Learning", "Nursery School", "Bilingual", "STEM Focus", "Arts & Crafts", "Garden", "Flexible Hours", "Funded Places", "Nature Play", "Yoga", "Large Setting"

Age rules:
- baby/infant/newborn/under 1 = minAge: 0, maxAge: 0.9
- toddler/1-2 years = minAge: 1, maxAge: 2.9
- preschool/3-5 years = minAge: 3, maxAge: 5
- X months old: convert to years (e.g. 6 months = 0.5)

Postcode rules: EH10 4BX → Morningside, EH10 4HR → Bruntsfield, EH6 8DB → Leith, EH9 1QH → Newington, EH3 5NE → Stockbridge, EH12 7AA → Corstorphine

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

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 501 });
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "openrouter/auto",
          max_tokens: 512,
          temperature: 0,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: query },
          ],
        }),
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ raw: "could not parse" }));
      console.error("OpenRouter error:", JSON.stringify(errorBody));
      return NextResponse.json(
        { error: "OpenRouter request failed", status: response.status, detail: errorBody },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";
    const cleaned = text.replace(/```(?:json)?/gi, "").trim();
    const filters: AIFilters = JSON.parse(cleaned);

    return NextResponse.json(filters);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("OpenRouter search error:", message);
    return NextResponse.json(
      { error: "AI search unavailable", detail: message },
      { status: 503 }
    );
  }
}