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
      model: "claude-opus-4-5",
      max_tokens: 512,
      system: `You are a search parser for a nursery finder app in Edinburgh. 
Extract search intent from natural language queries and return ONLY valid JSON, no markdown, no explanation.

Available areas: Morningside, Leith, Bruntsfield, Newington, Stockbridge, Corstorphine
Available ofsted ratings: "Outstanding", "Good", "Requires Improvement"
Available tags: "Outdoor Learning", "Nursery School", "Bilingual", "STEM Focus", "Arts & Crafts", "Garden", "Flexible Hours", "Funded Places", "Nature Play", "Yoga", "Large Setting"

Return this exact JSON shape:
{
  "area": string | null,
  "maxAge": number | null,
  "minAge": number | null,
  "ofsted": "Outstanding" | "Good" | "Requires Improvement" | null,
  "maxPrice": number | null,
  "availFilter": "available" | "waitlist" | "any",
  "tags": string[],
  "explanation": string
}

Age rules: babies = under 1 year (minAge < 1), toddlers = 1-2 years, preschool = 3+ years.
The "explanation" field should be a short human-readable summary like "Outstanding nurseries in Leith with spaces for babies".
If nothing matches a field, use null or "any".`,
      messages: [{ role: "user", content: query }],
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "AI search failed" }, { status: 500 });
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "{}";

  try {
    const filters = JSON.parse(text);
    return NextResponse.json(filters);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }
}