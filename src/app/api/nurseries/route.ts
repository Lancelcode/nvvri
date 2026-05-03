import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const nurseries = await prisma.nursery.findMany({
      orderBy: { rating: "desc" },
    });
    return NextResponse.json(nurseries);
  } catch (error) {
    console.error("DB error:", error);
    return NextResponse.json({ error: "Failed to fetch nurseries" }, { status: 500 });
  }
}